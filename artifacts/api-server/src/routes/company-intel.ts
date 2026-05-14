/**
 * /api/company-intel — Company Intelligence Engine (Doc 3 ProsEngine)
 *
 * POST /profile  — Full 10-agent parallel pipeline (Perplexity ×4, Gemini ×4, Claude, GPT)
 * POST /save     — Persist report to company_intel_research table
 * GET  /saved    — List saved reports
 * GET  /saved/:id
 * PATCH /saved/:id
 * DELETE /saved/:id
 */

import { Router, type Request, type Response } from "express";
import { db, company_intel_research, contacts, companies } from "@workspace/db";
import { desc, eq, or, ilike } from "drizzle-orm";
import { z } from "zod";
import {
  fanOut,
  searchWeb,
  searchGrounded,
  synthesizeClaude,
  synthesizeGpt,
  synthesizeJson,
} from "../lib/engines/_ai.js";
import { scraperFetch } from "../lib/enrichment/connectors/web-scraper.js";

const router = Router();

// ── POST /company-intel/profile — Full AI pipeline ────────────────────────────
router.post("/profile", async (req: Request, res: Response): Promise<void> => {
  const {
    companyName, crNumber, city, country, industry, website,
    knownFacts, intelligenceGoals = [], sellerContext,
  } = req.body as Record<string, any>;

  if (!companyName?.trim()) {
    res.status(400).json({ error: "companyName is required" });
    return;
  }

  const start = Date.now();
  const country_ = (country as string) || "Saudi Arabia";
  const ctx = knownFacts ? `Known facts: ${knownFacts}\n` : "";
  const goals = (intelligenceGoals as string[]).length
    ? `Intelligence goals: ${(intelligenceGoals as string[]).join(", ")}\n` : "";
  const crCtx = crNumber ? ` (CR: ${crNumber})` : "";
  const cityCtx = city ? ` in ${city}` : "";

  // Build tasks — run all 10 agents in parallel
  const tasks: Array<() => Promise<string>> = [
    () => searchWeb(`"${companyName}" company ${city || country_} overview industry revenue employees founding year`),
    () => searchWeb(`"${companyName}"${crCtx} Saudi Arabia CEO shareholders legal registration`),
    () => searchWeb(`"${companyName}" financial data revenue 2024 2023 annual report paid-up capital`),
    () => searchWeb(`"${companyName}" key executives management board directors contacts phone email`),
    () => searchGrounded(`${companyName} company profile ${country_}${cityCtx} industry sector founding year CR number legal form`),
    () => searchGrounded(`${companyName} shareholders ownership key executives management ${country_}`),
    () => searchGrounded(`${companyName} revenue employees market position products services clients ${country_}`),
    () => searchGrounded(`${companyName} phone email address website contacts ${country_}`),
    () => synthesizeClaude({
      system: "You are an expert Saudi Arabia B2B intelligence analyst. Provide factual, sourced intelligence.",
      user: `Research ${companyName}${crCtx}${cityCtx}, ${country_}.\n${ctx}${goals}Provide: founding year, legal form, industry, paid-up capital, shareholders, executives, revenue, employees, contacts (phone, email, website, address), description, strategic insights.`,
    }),
    () => synthesizeGpt({
      system: "You are a GCC B2B intelligence expert.",
      user: `Find all available data about ${companyName}${website ? ` (website: ${website})` : ""}${cityCtx}, ${country_}.\n${ctx}${goals}Return structured analysis with all available fields: founding, capital, shareholders, executives, revenue, contacts, clients, products.`,
    }),
  ];

  // Add website crawl if URL provided
  if (website) {
    tasks.push(() =>
      scraperFetch(website)
        .then((html) => `Website content from ${website}:\n${html.slice(0, 3000)}`)
        .catch(() => ""),
    );
  }

  // Try enrichment scraper sidecar for CR lookup
  if (crNumber) {
    tasks.push(async () => {
      try {
        const scraperUrl = process.env.ENRICHMENT_SCRAPER_URL || "http://localhost:8000/scraper";
        const resp = await fetch(`${scraperUrl}/cr-lookup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ crNumber }),
          signal: AbortSignal.timeout(15000),
        });
        if (resp.ok) {
          const data = await resp.json() as Record<string, unknown>;
          return `CR Lookup result: ${JSON.stringify(data)}`;
        }
      } catch { /* non-fatal */ }
      return "";
    });
  }

  const results = await fanOut(tasks, { timeoutMs: 65000 });

  const gathered = results
    .filter((r) => r.status === "fulfilled" && r.value?.trim())
    .map((r) => (r as PromiseFulfilledResult<string>).value)
    .join("\n\n---\n\n")
    .slice(0, 9000);

  const profile = await synthesizeJson<Record<string, unknown>>({
    system: "You are a Saudi B2B intelligence analyst. Extract ALL available structured data. Return ONLY a valid JSON object, no prose.",
    user: `Company: ${companyName}
Country: ${country_}${city ? `\nCity: ${city}` : ""}${crNumber ? `\nCR Number: ${crNumber}` : ""}${industry ? `\nIndustry: ${industry}` : ""}${website ? `\nWebsite: ${website}` : ""}

Research data:
${gathered}

Return JSON:
{
  "nameEn": "company name in English",
  "nameAr": "اسم الشركة بالعربية or null",
  "crNumber": "10-digit CR or null",
  "legalForm": "LLC/JSC/Partnership/etc or null",
  "city": "city or null",
  "industry": "industry sector",
  "foundingYear": year_or_null,
  "paidUpCapital": "SAR X million or null",
  "revenue": "SAR X-Y million derived from capital if not explicit or null",
  "employees": number_or_null,
  "phone": "+966... or null",
  "email": "email or null",
  "website": "https://... or null",
  "address": "full address or null",
  "ceo": "CEO name in English or null",
  "ceoAr": "اسم المدير التنفيذي or null",
  "shareholders": [{"name":"","nameAr":"","pct":"","nationality":""}],
  "board": [{"name":"","role":""}],
  "management": [{"name":"","title":""}],
  "products": ["main product or service"],
  "clients": ["known client if any"],
  "description": "2-3 sentence company description",
  "aiInsights": "strategic insights for a B2B seller approaching this company",
  "complianceFlags": [],
  "overallScore": 0_to_100_based_on_data_completeness
}`,
    fallback: { nameEn: companyName, industry: industry || "Unknown", overallScore: 20 },
  });

  const sourcesUsed = results.filter(
    (r) => r.status === "fulfilled" && (r as PromiseFulfilledResult<string>).value?.trim(),
  ).length;

  res.json({ profile, sourcesUsed, durationMs: Date.now() - start });
});

// ── POST /company-intel/push-crm — push profile directly to CRM ────────────────
router.post("/push-crm", async (req: Request, res: Response): Promise<void> => {
  const { profile } = req.body as { profile: Record<string, unknown> };
  if (!profile) { res.status(400).json({ error: "profile is required" }); return; }

  try {
    // Dedup check: look for existing company by name or CR
    let existingCompanyId: string | null = null;
    if ((profile.nameEn as string)?.trim() || (profile.crNumber as string)?.trim()) {
      const conditions = [];
      if (profile.nameEn) conditions.push(ilike(companies.name, `%${profile.nameEn}%`));
      if (profile.crNumber) conditions.push(eq(companies.crNumber as any, profile.crNumber as string));
      if (conditions.length) {
        const [existing] = await db.select({ id: companies.id })
          .from(companies).where(or(...conditions)).limit(1);
        if (existing) existingCompanyId = String(existing.id);
      }
    }

    let companyId = existingCompanyId;
    if (!companyId) {
      const [comp] = await db.insert(companies).values({
        name: (profile.nameEn as string) || "Unknown Company",
        nameAr: (profile.nameAr as string) || null,
        crNumber: (profile.crNumber as string) || null,
        website: (profile.website as string) || null,
        phone: (profile.phone as string) || null,
        email: (profile.email as string) || null,
        city: (profile.city as string) || null,
        industry: (profile.industry as string) || null,
        description: (profile.description as string) || null,
      } as any).returning({ id: companies.id });
      companyId = String(comp.id);
    }

    // Add primary contact if CEO found
    let contactId: string | null = null;
    if ((profile.ceo as string)?.trim()) {
      const [nameParts] = [(profile.ceo as string).trim().split(" ")];
      const firstName = nameParts[0] || "Executive";
      const lastName = (profile.ceo as string).trim().split(" ").slice(1).join(" ") || "Unknown";
      const [contact] = await db.insert(contacts).values({
        firstName,
        lastName,
        email: (profile.email as string) || null,
        phone: (profile.phone as string) || null,
        title: "CEO",
        companyId: companyId as any,
        status: "new",
      } as any).returning({ id: contacts.id });
      contactId = String(contact.id);
    }

    res.json({ success: true, companyId, contactId, existing: !!existingCompanyId });
  } catch (err: any) {
    req.log?.error({ err }, "company-intel push-crm failed");
    res.status(500).json({ error: "Failed to push to CRM" });
  }
});

// ── POST /company-intel/save ──────────────────────────────────────────────────
router.post("/save", async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    companyName: z.string().min(1),
    crNumber: z.string().optional(),
    city: z.string().optional(),
    website: z.string().optional(),
    sellerContext: z.unknown().optional(),
    intelligenceGoals: z.array(z.string()).optional(),
    knownFacts: z.string().optional(),
    report: z.record(z.unknown()),
    tags: z.string().optional(),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() }); return; }

  const { companyName, crNumber, city, website, sellerContext, intelligenceGoals, knownFacts, report, tags, notes } = parsed.data;

  try {
    const [row] = await db.insert(company_intel_research).values({
      companyName,
      crNumber: crNumber ?? null,
      city: city ?? null,
      website: website ?? null,
      sellerContext: sellerContext ? JSON.stringify(sellerContext) : null,
      intelligenceGoals: intelligenceGoals ? JSON.stringify(intelligenceGoals) : null,
      knownFacts: knownFacts ?? null,
      report,
      tags: tags ?? null,
      notes: notes ?? null,
    }).returning();
    res.json(row);
  } catch (err: any) {
    req.log?.error({ err }, "company-intel save failed");
    res.status(500).json({ error: "Failed to save report" });
  }
});

// ── GET /company-intel/saved ──────────────────────────────────────────────────
router.get("/saved", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(company_intel_research).orderBy(desc(company_intel_research.createdAt));
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load saved reports" });
  }
});

// ── GET /company-intel/saved/:id ──────────────────────────────────────────────
router.get("/saved/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params["id"] ?? ""));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [row] = await db.select().from(company_intel_research).where(eq(company_intel_research.id, id)).limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// ── PATCH /company-intel/saved/:id ───────────────────────────────────────────
router.patch("/saved/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params["id"] ?? ""));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const schema = z.object({ tags: z.string().nullable().optional(), notes: z.string().nullable().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  try {
    const [row] = await db.update(company_intel_research).set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(company_intel_research.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update report" });
  }
});

// ── DELETE /company-intel/saved/:id ──────────────────────────────────────────
router.delete("/saved/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params["id"] ?? ""));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(company_intel_research).where(eq(company_intel_research.id, id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete report" });
  }
});

export default router;
