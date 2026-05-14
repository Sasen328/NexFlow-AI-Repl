/**
 * /api/person-intel — Person Intelligence Engine (Doc 3 ProsEngine)
 *
 * POST /profile  — Full 16-agent parallel pipeline (Perplexity ×5, Gemini ×5, Claude, GPT ×2, LinkedIn, website, social)
 * POST /save     — Persist report to prosengine_research table + seed watchlist
 * GET  /saved    — List saved reports
 * GET  /saved/:id
 * PATCH /saved/:id
 * DELETE /saved/:id
 * POST /quick    — Fast Claude-only enrichment
 * GET  /watchlist
 */

import { Router, type Request, type Response } from "express";
import { db, prosengine_research, lead_lists, lead_list_items, contacts, companies } from "@workspace/db";
import { desc, eq, sql, or, ilike } from "drizzle-orm";
import { z } from "zod";
import { aiJson } from "../lib/ai.js";
import {
  fanOut,
  searchWeb,
  searchGrounded,
  synthesizeClaude,
  synthesizeGpt,
  synthesizeJson,
  synthesizeGeminiDirect,
} from "../lib/engines/_ai.js";
import { scraperFetch } from "../lib/enrichment/connectors/web-scraper.js";

const router = Router();

// ── POST /person-intel/profile — Full 16-agent parallel pipeline ─────────────
router.post("/profile", async (req: Request, res: Response): Promise<void> => {
  const {
    personName, title, company, linkedinUrl, country,
    knownFacts, intelligenceGoals = [], sellerContext,
  } = req.body as Record<string, any>;

  if (!personName?.trim()) {
    res.status(400).json({ error: "personName is required" });
    return;
  }

  const start = Date.now();
  const country_ = (country as string) || "Saudi Arabia";
  const ctx = knownFacts ? `Known facts: ${knownFacts}\n` : "";
  const goals = (intelligenceGoals as string[]).length
    ? `Goals: ${(intelligenceGoals as string[]).join(", ")}\n` : "";
  const coCtx = company ? ` at ${company}` : "";
  const titleCtx = title ? `, ${title}` : "";

  const tasks: Array<() => Promise<string>> = [
    // Perplexity ×5
    () => searchWeb(`"${personName}"${titleCtx}${coCtx} ${country_} professional background career`),
    () => searchWeb(`"${personName}" ${company || country_} executive education university`),
    () => searchWeb(`"${personName}" ${country_} phone email contact LinkedIn`),
    () => searchWeb(`"${personName}" board director investments companies ${country_}`),
    () => searchWeb(`"${personName}" news awards achievements 2023 2024 ${country_}`),
    // Gemini ×5
    () => searchGrounded(`${personName}${titleCtx}${coCtx} professional profile ${country_} biography career history`),
    () => searchGrounded(`${personName} ${company || ""} leadership management ${country_} board of directors`),
    () => searchGrounded(`${personName} ${country_} business interests investments wealth companies`),
    () => searchGrounded(`${personName} education qualifications professional certifications ${country_}`),
    () => searchGrounded(`${personName} social media LinkedIn Twitter public profile contact details`),
    // Claude
    () => synthesizeClaude({
      system: "You are a Saudi Arabia B2B intelligence expert. Provide factual, comprehensive person intelligence.",
      user: `Research ${personName}${titleCtx}${coCtx}, ${country_}.\n${ctx}${goals}Provide: current role, career history, education, business interests, board positions, wealth estimate, contact information, personal interests, buying influence, best approach for a B2B seller.`,
    }),
    // GPT ×2
    () => synthesizeGpt({
      system: "GCC executive intelligence analyst.",
      user: `Find all data about ${personName}${titleCtx}${coCtx}, ${country_}.\n${ctx}Focus on: professional background, decision-making authority, company roles, contact methods.`,
    }),
    () => synthesizeGpt({
      system: "B2B sales intelligence expert.",
      user: `What do we know about ${personName}${titleCtx}${coCtx} for a B2B sales approach in ${country_}? Buying triggers, personal interests, communication preferences, best time/channel to reach them.`,
    }),
    // Gemini direct for structured extraction
    () => synthesizeGeminiDirect({
      system: "You are an intelligence analyst. Extract all publicly available data.",
      user: `Person: ${personName}${titleCtx}${coCtx}, ${country_}.\n${ctx}List: current role, company, phone, email, LinkedIn URL, nationality, city, education, career history, board positions, known companies, recent news.`,
    }),
  ];

  // Add LinkedIn crawl if URL provided
  if (linkedinUrl) {
    tasks.push(() =>
      scraperFetch(linkedinUrl)
        .then((r) => `LinkedIn profile content:\n${(r.text ?? "").slice(0, 2000)}`)
        .catch(() => ""),
    );
  }

  const results = await fanOut(tasks, { timeoutMs: 75000 });

  const gathered = results
    .filter((r) => r.status === "fulfilled" && (r as PromiseFulfilledResult<string>).value?.trim())
    .map((r) => (r as PromiseFulfilledResult<string>).value)
    .join("\n\n---\n\n")
    .slice(0, 10000);

  const profile = await synthesizeJson<Record<string, unknown>>({
    system: "You are a Saudi B2B intelligence analyst. Extract ALL available data. Return ONLY valid JSON.",
    user: `Person: ${personName}
Country: ${country_}${title ? `\nTitle: ${title}` : ""}${company ? `\nCompany: ${company}` : ""}${linkedinUrl ? `\nLinkedIn: ${linkedinUrl}` : ""}

Research data:
${gathered}

Return JSON:
{
  "fullName": "full name",
  "fullNameAr": "الاسم الكامل بالعربية or null",
  "currentTitle": "current job title or null",
  "currentCompany": "current employer or null",
  "nationality": "nationality or null",
  "city": "city or null",
  "phone": "+966... or null",
  "email": "email or null",
  "linkedin": "LinkedIn URL or null",
  "twitter": "Twitter/X handle or null",
  "education": [{"degree":"","institution":"","year":""}],
  "careerHistory": [{"title":"","company":"","period":"","achievements":""}],
  "boardPositions": [{"company":"","role":""}],
  "businessInterests": ["area of interest"],
  "knownInvestments": ["company name"],
  "wealthEstimate": "SAR X-Y million or null",
  "decisionMakingAuthority": "High/Medium/Low",
  "buyingTriggers": ["trigger 1"],
  "communicationPreference": "WhatsApp/Email/LinkedIn/Phone",
  "bestApproach": "advice for B2B seller",
  "executiveSummary": "2-3 paragraph profile summary",
  "overallScore": 0_to_100
}`,
    fallback: { fullName: personName, currentTitle: title || "Executive", currentCompany: company || null, overallScore: 20 },
  });

  const sourcesUsed = results.filter(
    (r) => r.status === "fulfilled" && (r as PromiseFulfilledResult<string>).value?.trim(),
  ).length;

  res.json({ profile, sourcesUsed, durationMs: Date.now() - start });
});

// ── POST /person-intel/push-crm — push person profile to CRM ─────────────────
router.post("/push-crm", async (req: Request, res: Response): Promise<void> => {
  const { profile } = req.body as { profile: Record<string, unknown> };
  if (!profile) { res.status(400).json({ error: "profile is required" }); return; }

  try {
    const fullName = String(profile.fullName || "").trim();
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "Unknown";
    const lastName = nameParts.slice(1).join(" ") || "Unknown";

    // Dedup check
    let existingId: string | null = null;
    if (profile.email) {
      const [existing] = await db.select({ id: contacts.id })
        .from(contacts).where(eq(contacts.email as any, profile.email as string)).limit(1);
      if (existing) existingId = String(existing.id);
    }

    if (existingId) {
      res.json({ success: true, contactId: existingId, existing: true });
      return;
    }

    // Create company if provided
    let companyId: string | null = null;
    if ((profile.currentCompany as string)?.trim()) {
      const [existing] = await db.select({ id: companies.id })
        .from(companies).where(ilike(companies.name, `%${profile.currentCompany}%`)).limit(1);
      if (existing) {
        companyId = String(existing.id);
      } else {
        const [comp] = await db.insert(companies).values({
          name: profile.currentCompany as string,
        } as any).returning({ id: companies.id });
        companyId = String(comp.id);
      }
    }

    const [contact] = await db.insert(contacts).values({
      firstName,
      lastName,
      email: (profile.email as string) || null,
      phone: (profile.phone as string) || null,
      title: (profile.currentTitle as string) || null,
      linkedinUrl: (profile.linkedin as string) || null,
      companyId: companyId as any,
      status: "new",
    } as any).returning({ id: contacts.id });

    res.json({ success: true, contactId: String(contact.id), companyId, existing: false });
  } catch (err: any) {
    req.log?.error({ err }, "person-intel push-crm failed");
    res.status(500).json({ error: "Failed to push to CRM" });
  }
});

// ── POST /person-intel/save ───────────────────────────────────────────────────
router.post("/save", async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    personName: z.string().min(1),
    company: z.string().optional(),
    title: z.string().optional(),
    linkedinUrl: z.string().optional(),
    sellerContext: z.unknown().optional(),
    intelligenceGoals: z.array(z.string()).optional(),
    knownFacts: z.string().optional(),
    report: z.record(z.unknown()),
    tags: z.string().optional(),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() }); return; }

  const { personName, company, title, linkedinUrl, sellerContext, intelligenceGoals, knownFacts, report, tags, notes } = parsed.data;

  try {
    const [row] = await db.insert(prosengine_research).values({
      personName,
      company: company ?? null,
      title: title ?? null,
      linkedinUrl: linkedinUrl ?? null,
      sellerContext: sellerContext ? JSON.stringify(sellerContext) : null,
      intelligenceGoals: intelligenceGoals ? JSON.stringify(intelligenceGoals) : null,
      knownFacts: knownFacts ?? null,
      report,
      tags: tags ?? null,
      notes: notes ?? null,
    }).returning();

    res.json(row);

    // Auto-seed into ProsEngine Watchlist (background)
    setImmediate(async () => {
      try {
        const WATCHLIST_NAME = "ProsEngine Watchlist";
        let [watchlist] = await db.select().from(lead_lists).where(eq(lead_lists.name, WATCHLIST_NAME)).limit(1);
        if (!watchlist) {
          [watchlist] = await db.insert(lead_lists).values({
            name: WATCHLIST_NAME,
            criteria: JSON.stringify({ sources: ["prosengine"] }),
            status: "done",
            totalFound: 0,
            sourcesSearched: JSON.stringify(["prosengine"]),
          }).returning();
        }

        let linkedin = linkedinUrl ?? null;
        let biography: string | null = null;
        try {
          const rpt = report as Record<string, unknown>;
          const prof = rpt.profile as Record<string, unknown> | undefined;
          if (prof?.linkedin && typeof prof.linkedin === "string") linkedin = prof.linkedin;
          biography = (rpt.executive_summary as string) ?? (rpt.executiveSummary as string) ?? null;
        } catch { /* non-fatal */ }

        await db.insert(lead_list_items).values({
          listId: watchlist.id,
          personName,
          personTitle: title ?? null,
          biography,
          linkedin,
          companyName: company ?? null,
          source: "prosengine",
          sourceId: `pe_${row.id}`,
          matchScore: 80,
          aiScore: 80,
          aiReasoning: "Manually added from ProsEngine Research — high-priority watchlist lead",
        });

        const [cnt] = await db.select({ c: sql<number>`count(*)::int` })
          .from(lead_list_items).where(eq(lead_list_items.listId, watchlist.id));
        await db.update(lead_lists).set({ totalFound: cnt?.c ?? 0, updatedAt: new Date() })
          .where(eq(lead_lists.id, watchlist.id));
      } catch (seedErr) {
        req.log?.warn({ err: seedErr }, "ProsEngine watchlist seed failed (non-fatal)");
      }
    });
  } catch (err: any) {
    req.log?.error({ err }, "person-intel save failed");
    res.status(500).json({ error: "Failed to save report" });
  }
});

// ── GET /person-intel/saved ───────────────────────────────────────────────────
router.get("/saved", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(prosengine_research).orderBy(desc(prosengine_research.createdAt));
    res.json(rows);
  } catch { res.status(500).json({ error: "Failed to load saved research" }); }
});

// ── GET /person-intel/saved/:id ───────────────────────────────────────────────
router.get("/saved/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params["id"] ?? ""));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [row] = await db.select().from(prosengine_research).where(eq(prosengine_research.id, id)).limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch { res.status(500).json({ error: "Failed to fetch report" }); }
});

// ── PATCH /person-intel/saved/:id ────────────────────────────────────────────
router.patch("/saved/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params["id"] ?? ""));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const schema = z.object({ tags: z.string().nullable().optional(), notes: z.string().nullable().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  try {
    const [row] = await db.update(prosengine_research).set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(prosengine_research.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch { res.status(500).json({ error: "Failed to update report" }); }
});

// ── DELETE /person-intel/saved/:id ───────────────────────────────────────────
router.delete("/saved/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params["id"] ?? ""));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(prosengine_research).where(eq(prosengine_research.id, id));
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Failed to delete report" }); }
});

// ── POST /person-intel/quick — fast Claude-only enrichment ───────────────────
router.post("/quick", async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({ name: z.string().min(1), company: z.string().optional(), title: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "name is required" }); return; }
  const { name, company, title } = parsed.data;

  try {
    const profile = await aiJson<Record<string, unknown>>({
      provider: "anthropic",
      system: "You are a Saudi Arabia B2B intelligence researcher. Return ONLY a JSON object, no prose.",
      user: `Quick enrichment for:\nPerson: ${name}\n${company ? `Company: ${company}\n` : ""}${title ? `Title: ${title}\n` : ""}Country: Saudi Arabia\n\nReturn JSON (null for unknown):\n{"email":null,"phone":null,"linkedin":null,"nationality":null,"bio":"1-2 sentence bio","industry":"sector","city":null,"seniority":"C-Level|VP|Director|Manager|Staff","companySize":null,"revenue":null}`,
      fallback: { bio: `${title ?? "Executive"} at ${company ?? "Saudi company"}`, industry: "Not found", seniority: "Unknown" },
    });
    res.json({ ok: true, profile });
  } catch (err: any) {
    req.log?.error({ err }, "person-intel quick failed");
    res.status(500).json({ error: "Quick enrichment failed" });
  }
});

// ── GET /person-intel/watchlist ───────────────────────────────────────────────
router.get("/watchlist", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [watchlist] = await db.select({ id: lead_lists.id }).from(lead_lists)
      .where(eq(lead_lists.name, "ProsEngine Watchlist")).limit(1);
    if (!watchlist) { res.json([]); return; }
    const items = await db.select().from(lead_list_items)
      .where(eq(lead_list_items.listId, watchlist.id)).orderBy(desc(lead_list_items.createdAt));
    res.json(items);
  } catch { res.status(500).json({ error: "Failed to load watchlist" }); }
});

export default router;
