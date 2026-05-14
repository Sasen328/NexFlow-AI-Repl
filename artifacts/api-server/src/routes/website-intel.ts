/**
 * /api/prospecting  — Website Intelligence + Directory Scan (Doc 3 §6)
 * /api/prosengine   — Single company research by URL
 *
 * Directory Scan Mode (5-step): URL → scan → configure → extract → results
 * Single Company Mode: URL → research → full company profile
 */

import { Router, type Request, type Response } from "express";
import { db, prospecting_jobs, prospecting_results, export_history, contacts, companies } from "@workspace/db";
import { desc, eq, or, ilike, sql } from "drizzle-orm";
import { fanOut, searchWeb, searchGrounded, synthesizeClaude, synthesizeJson, synthesizeGeminiDirect } from "../lib/engines/_ai.js";
import { scraperFetch } from "../lib/enrichment/connectors/web-scraper.js";
import { logger } from "../lib/logger.js";

const router = Router();

// ── Helper: scan site structure ────────────────────────────────────────────────
async function scanWebsite(url: string): Promise<{ text: string; pagesScanned: number }> {
  // Try ENRICHMENT_SCRAPER_URL sidecar first (Playwright/Crawl4AI)
  try {
    const scraperBase = process.env.ENRICHMENT_SCRAPER_URL || "http://localhost:8000/scraper";
    const resp = await fetch(`${scraperBase}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, maxPages: 3 }),
      signal: AbortSignal.timeout(15000),
    });
    if (resp.ok) {
      const data = await resp.json() as any;
      return { text: data.text || "", pagesScanned: data.pagesScanned || 1 };
    }
  } catch { /* fall through */ }

  // Cheerio fallback
  try {
    const r = await scraperFetch(url);
    return { text: (r.text ?? "").replace(/\s+/g, " ").slice(0, 6000), pagesScanned: 1 };
  } catch { return { text: "", pagesScanned: 0 }; }
}

// ── Helper: crawl a page and extract companies ────────────────────────────────
async function crawlPageWithAI(
  url: string,
  fields: string[],
  answers: Record<string, string | string[]>,
  pageNum: number = 1,
): Promise<{ companies: any[]; isLastPage: boolean }> {
  let pageText = "";

  // Try sidecar
  try {
    const scraperBase = process.env.ENRICHMENT_SCRAPER_URL || "http://localhost:8000/scraper";
    const resp = await fetch(`${scraperBase}/extract-page`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, page: pageNum, fields }),
      signal: AbortSignal.timeout(20000),
    });
    if (resp.ok) {
      const data = await resp.json() as any;
      if (Array.isArray(data?.companies)) return { companies: data.companies, isLastPage: data.isLastPage ?? false };
      pageText = data.text || "";
    }
  } catch { /* fall through */ }

  // Cheerio fallback
  if (!pageText) {
    try { pageText = ((await scraperFetch(url)).text ?? "").replace(/\s+/g, " ").slice(0, 5000); } catch { }
  }

  if (!pageText) return { companies: [], isLastPage: true };

  const result = await synthesizeJson<{ companies: any[]; isLastPage: boolean }>({
    system: "Extract company data from web page text. Return ONLY valid JSON.",
    user: `URL: ${url}\nPage: ${pageNum}\nFields to extract: ${fields.join(", ")}\nUser preferences: ${JSON.stringify(answers)}\n\nPage text:\n${pageText}\n\nReturn JSON:\n{"companies":[{"name":"","phone":"","email":"","website":"","city":"","industry":"","address":"","description":"","sourceUrl":"${url}"}],"isLastPage":false}`,
    fallback: { companies: [], isLastPage: true },
  });
  return result;
}

// ── Helper: enrich a single company (for extraction step) ─────────────────────
async function enrichSingleCompany(company: any, depth: string, language: string): Promise<Record<string, unknown> | null> {
  if (!company?.name && !company?.nameEn) return null;
  const name = company.nameEn || company.name;
  const tasks: Array<() => Promise<string>> = [
    () => searchWeb(`"${name}" company phone email address website Saudi Arabia`),
    () => searchGrounded(`${name} company profile industry city founded Saudi Arabia`),
  ];
  if (depth === "deep") {
    tasks.push(() => synthesizeClaude({ system: "Saudi B2B intelligence analyst.", user: `Research "${name}": phone, email, website, city, industry, founded, revenue, employees, owner, CR number, description.` }));
  }
  const results = await fanOut(tasks, { timeoutMs: 25000 });
  const gathered = results.filter((r) => r.status === "fulfilled" && (r as any).value).map((r) => (r as any).value).join("\n---\n");
  return synthesizeJson({
    system: "Extract company data. Return ONLY valid JSON.",
    user: `Company: ${name}\n\nData:\n${gathered}\n\nReturn JSON: {"phone":null,"email":null,"website":null,"city":null,"industry":null,"address":null,"revenue":null,"employees":null,"ownerName":null,"description":null}`,
    fallback: null,
  }).catch(() => null);
}

// ── POST /prospecting/scan — initiate site scan ───────────────────────────────
router.post("/prospecting/scan", async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body as { url?: string };
  if (!url) { res.status(400).json({ error: "url is required" }); return; }

  const [job] = await db.insert(prospecting_jobs).values({ targetUrl: url, status: "scanning" }).returning();
  res.json(job);

  setImmediate(async () => {
    try {
      const scanData = await scanWebsite(url);

      // Use Gemini + GPT to analyze site structure
      const analysisPrompt = `Analyze this website: ${url}
Page content sample: ${scanData.text.slice(0, 3000)}

Return JSON:
{
  "dataType": "company-directory / product-catalog / news-site / etc",
  "siteDescription": "what kind of data this site contains",
  "sampleCompanies": ["up to 5 company names visible"],
  "suggestedFields": ["name","phone","email","address","industry","city","website","crNumber","description"],
  "categories": [],
  "cities": [],
  "industries": [],
  "paginationType": "page-numbers / load-more / infinite-scroll",
  "websiteType": "saudi-chamber / yellow-pages / trade-directory / etc",
  "contentLanguage": "arabic / english / bilingual",
  "totalPages": null,
  "suggestedQuestions": [
    {"question": "Filter by city?", "options": ["Yes - specific city", "No - all cities"]},
    {"question": "Most important fields?", "options": ["Contact info", "Financial data", "Company profile", "All available"]}
  ]
}`;

      const analysisRes = await synthesizeGeminiDirect({ system: "Website intelligence analyst.", user: analysisPrompt })
        .catch(() => "") ||
        await synthesizeJson<Record<string, unknown>>({ system: "Website analyst.", user: analysisPrompt, fallback: {} })
          .then(JSON.stringify).catch(() => "");

      let scanSummary: Record<string, unknown> | null = null;
      if (analysisRes) {
        const match = String(analysisRes).match(/\{[\s\S]*\}/);
        if (match) { try { scanSummary = JSON.parse(match[0]); } catch { } }
      }

      await db.update(prospecting_jobs).set({
        status: "scanned",
        scanSummary,
        scanResult: { progressMessage: "Site analyzed — ready to configure extraction" },
        pagesScanned: scanData.pagesScanned,
        updatedAt: new Date(),
      }).where(eq(prospecting_jobs.id, job.id));
    } catch (err) {
      await db.update(prospecting_jobs).set({ status: "failed", error: (err as Error).message, updatedAt: new Date() }).where(eq(prospecting_jobs.id, job.id));
    }
  });
});

// ── POST /prospecting/:jobId/extract — start extraction ───────────────────────
router.post("/prospecting/:jobId/extract", async (req: Request, res: Response): Promise<void> => {
  const jobId = parseInt(String(req.params.jobId));
  const { settings } = req.body as { settings: { maxPages: number; enrichmentDepth: string; extractionLanguage: string; extractionFields: string[]; userAnswers: Record<string, string | string[]> } };

  const [job] = await db.select().from(prospecting_jobs).where(eq(prospecting_jobs.id, jobId)).limit(1);
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }

  const updated = await db.update(prospecting_jobs).set({ status: "extracting", settings, updatedAt: new Date() }).where(eq(prospecting_jobs.id, jobId)).returning();
  res.json(updated[0]);

  setImmediate(async () => {
    try {
      const targetUrl = job.targetUrl;
      let allCompanies: any[] = [];
      let pagesScanned = 0;

      for (let page = 1; page <= (settings.maxPages || 50); page++) {
        const pageUrl = buildPageUrl(targetUrl, page);
        const pageData = await crawlPageWithAI(pageUrl, settings.extractionFields || ["name", "phone", "email", "city", "website"], settings.userAnswers || {}, page);
        if (!pageData || pageData.companies.length === 0) break;

        allCompanies.push(...pageData.companies);
        pagesScanned++;

        await db.update(prospecting_jobs).set({ totalCompaniesFound: allCompanies.length, pagesScanned, updatedAt: new Date(), scanResult: { progressMessage: `Page ${page}: ${pageData.companies.length} companies found` } }).where(eq(prospecting_jobs.id, jobId));
        if (pageData.isLastPage) break;
        await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
      }

      // Save raw results
      for (const company of allCompanies) {
        await db.insert(prospecting_results).values({ jobId, companyData: company, enrichmentStatus: "pending", sourceUrl: company.sourceUrl || targetUrl });
      }

      // Enrich if depth > none
      if (settings.enrichmentDepth !== "none") {
        await db.update(prospecting_jobs).set({ status: "enriching", updatedAt: new Date() }).where(eq(prospecting_jobs.id, jobId));
        let enriched = 0;
        const resultRows = await db.select().from(prospecting_results).where(eq(prospecting_results.jobId, jobId));
        for (const row of resultRows) {
          const company = row.companyData as any;
          const enrichedData = await enrichSingleCompany(company, settings.enrichmentDepth, settings.extractionLanguage).catch(() => null);
          if (enrichedData) {
            await db.update(prospecting_results).set({ companyData: { ...company, ...enrichedData }, enrichmentStatus: "enriched" }).where(eq(prospecting_results.id, row.id));
            enriched++;
            await db.update(prospecting_jobs).set({ totalEnriched: enriched, updatedAt: new Date() }).where(eq(prospecting_jobs.id, jobId));
          }
        }
      }

      await db.update(prospecting_jobs).set({ status: "completed", totalCompaniesFound: allCompanies.length, completedAt: new Date(), updatedAt: new Date() }).where(eq(prospecting_jobs.id, jobId));
    } catch (err) {
      await db.update(prospecting_jobs).set({ status: "failed", error: (err as Error).message, updatedAt: new Date() }).where(eq(prospecting_jobs.id, jobId));
    }
  });
});

function buildPageUrl(baseUrl: string, page: number): string {
  if (page === 1) return baseUrl;
  const url = new URL(baseUrl);
  if (url.searchParams.has("page")) { url.searchParams.set("page", String(page)); return url.toString(); }
  if (url.searchParams.has("p"))    { url.searchParams.set("p", String(page));    return url.toString(); }
  url.searchParams.set("page", String(page));
  return url.toString();
}

// ── GET /prospecting ──────────────────────────────────────────────────────────
router.get("/prospecting", async (_req: Request, res: Response): Promise<void> => {
  const jobs = await db.select().from(prospecting_jobs).orderBy(desc(prospecting_jobs.createdAt)).limit(50);
  res.json(jobs);
});

// ── GET /prospecting/:jobId ───────────────────────────────────────────────────
router.get("/prospecting/:jobId", async (req: Request, res: Response): Promise<void> => {
  const [job] = await db.select().from(prospecting_jobs).where(eq(prospecting_jobs.id, parseInt(String(req.params.jobId)))).limit(1);
  if (!job) { res.status(404).json({ error: "Not found" }); return; }
  res.json(job);
});

// ── GET /prospecting/:jobId/results ───────────────────────────────────────────
router.get("/prospecting/:jobId/results", async (req: Request, res: Response): Promise<void> => {
  const results = await db.select().from(prospecting_results).where(eq(prospecting_results.jobId, parseInt(String(req.params.jobId)))).orderBy(prospecting_results.id).limit(500);
  res.json(results);
});

// ── DELETE /prospecting/:jobId ────────────────────────────────────────────────
router.delete("/prospecting/:jobId", async (req: Request, res: Response): Promise<void> => {
  await db.delete(prospecting_jobs).where(eq(prospecting_jobs.id, parseInt(String(req.params.jobId))));
  res.json({ success: true });
});

// ── POST /prospecting/:jobId/push-crm — push all results to CRM ───────────────
router.post("/prospecting/:jobId/push-crm", async (req: Request, res: Response): Promise<void> => {
  const jobId = parseInt(String(req.params.jobId ?? ""));
  const results = await db.select().from(prospecting_results).where(eq(prospecting_results.jobId, jobId));
  let pushed = 0;
  for (const row of results) {
    if (row.pushedToCrm) continue;
    const company = row.companyData as any;
    if (!company?.name && !company?.nameEn) continue;
    try {
      const name = company.nameEn || company.name;
      const [existing] = await db.select({ id: companies.id }).from(companies).where(ilike(companies.name, `%${name}%`)).limit(1);
      let companyId: string;
      if (existing) {
        companyId = String(existing.id);
      } else {
        const [comp] = await db.insert(companies).values({ name, website: company.website || null, phone: company.phone || null, email: company.email || null, city: company.city || null, industry: company.industry || null, description: company.description || null } as any).returning({ id: companies.id });
        companyId = String(comp.id);
      }
      await db.update(prospecting_results).set({ pushedToCrm: true, crmCompanyId: companyId }).where(eq(prospecting_results.id, row.id));
      pushed++;
    } catch { /* non-fatal */ }
  }
  res.json({ success: true, pushed });
});

// ── POST /prospecting/:jobId/export ───────────────────────────────────────────
router.post("/prospecting/:jobId/export", async (req: Request, res: Response): Promise<void> => {
  const { format = "csv" } = req.body as { format?: string };
  const jobId = parseInt(String(req.params.jobId));
  const results = await db.select().from(prospecting_results).where(eq(prospecting_results.jobId, jobId));
  const companies_ = results.map((r) => r.companyData as Record<string, unknown>).filter(Boolean);
  const filename = `prospecting-${jobId}-${Date.now()}.${format}`;

  if (format === "csv") {
    const keys = [...new Set(companies_.flatMap((c) => Object.keys(c)))];
    const csv = [keys.join(","), ...companies_.map((c) => keys.map((k) => `"${String((c as any)[k] || "").replace(/"/g, '""')}"`).join(","))].join("\n");
    await db.insert(export_history).values({ jobId, format, filename, recordCount: companies_.length, fileSize: csv.length });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
    return;
  }

  if (format === "json") {
    const json = JSON.stringify(companies_, null, 2);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(json);
    return;
  }

  if (format === "xlsx") {
    // Return as JSON (client can convert); xlsx not bundled on server
    const json = JSON.stringify(companies_, null, 2);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename.replace(".xlsx", ".json")}"`);
    res.send(json);
    return;
  }

  res.status(400).json({ error: "Unsupported format" });
});

// ── GET /prospecting/exports/history ─────────────────────────────────────────
router.get("/prospecting/exports/history", async (_req: Request, res: Response): Promise<void> => {
  const history = await db.select().from(export_history).orderBy(desc(export_history.createdAt)).limit(50);
  res.json(history);
});

// ── POST /prosengine/research-url — single company by website ─────────────────
router.post("/prosengine/research-url", async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body as { url?: string };
  if (!url) { res.status(400).json({ error: "url is required" }); return; }

  // Crawl the website
  let siteText = "";
  try {
    const r = await scraperFetch(url);
    siteText = (r.text ?? "").replace(/\s+/g, " ").slice(0, 5000);
  } catch { /* non-fatal */ }

  // Parallel research with Gemini + Claude
  const tasks: Array<() => Promise<string>> = [
    () => synthesizeGeminiDirect({
      system: "You are a Saudi company intelligence analyst.",
      user: `Research the company at ${url}: name, industry, city, phone, email, founding year, CR number, paid-up capital, employees, revenue, CEO, shareholders, main products/services. Use Saudi registries if possible.`,
    }),
    () => synthesizeClaude({
      system: "Saudi B2B intelligence analyst.",
      user: `Analyze this Saudi company website:\nURL: ${url}\n\nWebsite content:\n${siteText.slice(0, 4000)}\n\nExtract ALL available: nameEn, nameAr, industry, city, phone, email, address, crNumber, legalForm, paidUpCapital, founded, employees, revenue, ceo, shareholders, management, products, clients, description, aiInsights.`,
    }),
    () => searchGrounded(`Company at ${url} Saudi Arabia: name, industry, phone, email, CR number, executives, revenue`),
    () => searchWeb(`site:${new URL(url).hostname} company profile Saudi Arabia OR company registration`),
  ];

  const results = await fanOut(tasks, { timeoutMs: 40000 });
  let profile: Record<string, unknown> = {};
  for (const r of results) {
    if (r.status !== "fulfilled" || !r.value) continue;
    const text = String(r.value);
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        profile = { ...profile, ...Object.fromEntries(Object.entries(parsed).filter(([, v]) => v != null && v !== "" && v !== "null")) };
      } catch { /* ignore */ }
    }
  }

  if (!profile.nameEn && !profile.name) {
    // Do a final synthesis pass
    const gathered = results.filter((r) => r.status === "fulfilled" && (r as any).value).map((r: any) => r.value).join("\n---\n");
    profile = await synthesizeJson({
      system: "Extract company data from research. Return ONLY valid JSON.",
      user: `URL: ${url}\n\nResearch:\n${gathered}\n\nReturn JSON:\n{"nameEn":null,"nameAr":null,"industry":null,"city":null,"phone":null,"email":null,"website":"${url}","crNumber":null,"founded":null,"employees":null,"revenue":null,"ceo":null,"description":null,"aiInsights":null}`,
      fallback: { website: url },
    });
  }

  res.json({ profile, url });
});

export default router;
