/**
 * /api/builder — AI Database Builder (Doc 4)
 *
 * 15 built-in Saudi data sources + custom user-added sources.
 * AI harvests company names, then enriches each with parallel agents.
 * Push to main companies/contacts CRM tables with dedup check.
 */

import { Router, type Request, type Response } from "express";
import { db, builder_companies, builder_jobs, builder_custom_sources, contacts, companies } from "@workspace/db";
import { desc, eq, and, or, ilike, sql } from "drizzle-orm";
import { fanOut, searchWeb, searchGrounded, synthesizeClaude, synthesizeGpt, synthesizeJson } from "../lib/engines/_ai.js";
import { scraperFetch } from "../lib/enrichment/connectors/web-scraper.js";
import { logger } from "../lib/logger.js";

const router = Router();

// ── 15 Built-in Saudi Data Sources ───────────────────────────────────────────

const SAUDI_DATA_SOURCES = [
  { id: "wikidata",         name: "Wikidata Saudi Companies",         nameAr: "ويكيداتا - الشركات السعودية",     category: "registry",    url: "https://query.wikidata.org/sparql?query=SELECT%20?item%20?itemLabel%20WHERE%20{%20?item%20wdt:P31%20wd:Q4830453%20.%20?item%20wdt:P17%20wd:Q851%20.%20SERVICE%20wikibase:label%20{%20bd:serviceParam%20wikibase:language%20\"en\".%20}%20}%20LIMIT%20726&format=json", estimatedCompanies: 726  },
  { id: "saudi-open-data",  name: "Saudi Open Data Portal",           nameAr: "بوابة البيانات المفتوحة",         category: "government",  url: "https://data.gov.sa/api/3/action/package_search?q=company&rows=100", estimatedCompanies: 2000 },
  { id: "mc-gov",           name: "MC.gov.sa Company Registry",       nameAr: "وزارة التجارة",                   category: "government",  url: "https://mc.gov.sa/en/Pages/default.aspx",                            estimatedCompanies: 50000 },
  { id: "cma",              name: "CMA Listed Companies",             nameAr: "هيئة السوق المالية",              category: "financial",   url: "https://www.cma.org.sa/en/Market/Issuers/pages/default.aspx",         estimatedCompanies: 240  },
  { id: "tadawul",          name: "Tadawul Stock Market",             nameAr: "تداول - البورصة السعودية",        category: "financial",   url: "https://www.saudistockexchange.com/en/market-participants/companies", estimatedCompanies: 240  },
  { id: "yellow-pages",     name: "Saudi Yellow Pages",               nameAr: "الصفحات الصفراء السعودية",        category: "directory",   url: "https://www.yellowpages.com.sa",                                      estimatedCompanies: 15000 },
  { id: "daleel",           name: "Daleel Business Directory",        nameAr: "دليل الأعمال",                   category: "directory",   url: "https://www.daleelksa.com",                                            estimatedCompanies: 8000 },
  { id: "kompass",          name: "Kompass Saudi Arabia",             nameAr: "كومباس السعودية",                 category: "directory",   url: "https://sa.kompass.com/en/",                                           estimatedCompanies: 5000 },
  { id: "riyadh-chamber",   name: "Riyadh Chamber of Commerce",       nameAr: "غرفة الرياض",                    category: "chamber",     url: "https://www.chamber.org.sa/ar/Pages/Default.aspx",                    estimatedCompanies: 12000 },
  { id: "jeddah-chamber",   name: "Jeddah Chamber of Commerce",       nameAr: "غرفة جدة",                       category: "chamber",     url: "https://www.jcci.org.sa",                                              estimatedCompanies: 10000 },
  { id: "eastern-chamber",  name: "Eastern Province Chamber",         nameAr: "غرفة المنطقة الشرقية",           category: "chamber",     url: "https://www.chamber.org.sa",                                           estimatedCompanies: 8000 },
  { id: "madinah-chamber",  name: "Madinah Chamber of Commerce",      nameAr: "غرفة المدينة المنورة",            category: "chamber",     url: "https://www.madinahchamber.org.sa",                                   estimatedCompanies: 3000 },
  { id: "aseer-chamber",    name: "Aseer Chamber of Commerce",        nameAr: "غرفة عسير",                      category: "chamber",     url: "https://www.aseerchamber.org.sa",                                     estimatedCompanies: 2000 },
  { id: "blupages",         name: "BluPages Saudi Directory",         nameAr: "بلوبيجز السعودية",               category: "directory",   url: "https://www.blupages.com/search?country=saudi-arabia&page=1",         estimatedCompanies: 12000 },
  { id: "franchise",        name: "Saudi Franchise Association",      nameAr: "جمعية الامتياز التجاري",          category: "association", url: "https://www.franchise-sa.com/ar",                                     estimatedCompanies: 500  },
];

// ── Harvest a single source ───────────────────────────────────────────────────
async function harvestSource(
  source: { id: string; name: string; url: string; category: string },
  depth: string = "standard",
): Promise<string[]> {
  // Wikidata SPARQL
  if (source.id === "wikidata") {
    try {
      const resp = await fetch(source.url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12000) });
      if (resp.ok) {
        const data = await resp.json() as any;
        return (data?.results?.bindings || []).map((b: any) => b?.itemLabel?.value).filter((n: string) => n && !n.startsWith("Q")) as string[];
      }
    } catch { /* fall through */ }
  }

  // Saudi Open Data CKAN
  if (source.id === "saudi-open-data") {
    try {
      const resp = await fetch(source.url, { signal: AbortSignal.timeout(10000) });
      if (resp.ok) {
        const data = await resp.json() as any;
        const names: string[] = [];
        for (const pkg of data?.result?.results || []) {
          if (pkg?.organization?.title) names.push(pkg.organization.title);
          if (pkg?.title && !names.includes(pkg.title)) names.push(pkg.title);
        }
        if (names.length > 0) return names;
      }
    } catch { /* fall through */ }
  }

  // Try ENRICHMENT_SCRAPER_URL sidecar (Crawl4AI / BS4)
  try {
    const scraperBase = process.env.ENRICHMENT_SCRAPER_URL || "http://localhost:8000/scraper";
    const resp = await fetch(`${scraperBase}/harvest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: source.url, sourceType: source.category }),
      signal: AbortSignal.timeout(20000),
    });
    if (resp.ok) {
      const data = await resp.json() as any;
      if (Array.isArray(data?.names) && data.names.length > 0) return data.names;
    }
  } catch { /* fall through */ }

  // Cheerio scrape + AI extraction
  try {
    const html = await scraperFetch(source.url);
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 4000);
    const result = await synthesizeJson<{ names: string[] }>({
      system: "Extract Saudi company names from web page text. Return ONLY valid JSON.",
      user: `Source: ${source.name}\nURL: ${source.url}\nText:\n${text}\n\nReturn JSON: { "names": ["Name 1", ...] } — list up to 40 company names visible on this page.`,
      fallback: { names: [] },
    });
    if (result.names?.length > 0) return result.names;
  } catch { /* fall through */ }

  // AI knowledge fallback
  try {
    const result = await synthesizeJson<{ names: string[] }>({
      system: "Saudi Arabia business intelligence expert.",
      user: `List 25 real Saudi Arabian companies found on ${source.name} (${source.url}). Category: ${source.category}.\n\nReturn JSON: { "names": ["Company Name 1", ...] }`,
      fallback: { names: [] },
    });
    return result.names || [];
  } catch { return []; }
}

// ── Enrich a single company ───────────────────────────────────────────────────
async function enrichBuilderCompany(
  nameEn: string,
  sourceId: string,
  depth: string = "standard",
): Promise<Partial<typeof builder_companies.$inferInsert>> {
  const tasks: Array<() => Promise<string>> = [
    () => searchWeb(`"${nameEn}" Saudi Arabia company profile industry revenue employees`),
    () => searchWeb(`"${nameEn}" Saudi Arabia CR number phone email address website`),
    () => searchGrounded(`${nameEn} company Saudi Arabia founding year capital shareholders executives`),
    () => searchGrounded(`${nameEn} Saudi Arabia revenue estimate employees market position`),
  ];

  if (depth !== "basic") {
    tasks.push(
      () => searchWeb(`"${nameEn}" Saudi Arabia CEO owner management board`),
      () => synthesizeClaude({
        system: "Saudi B2B intelligence analyst.",
        user: `Research "${nameEn}" Saudi Arabia: CR number, legal form, city, industry, paid-up capital, founding year, revenue, employees, phone, email, website, CEO, shareholders, key products/services, description.`,
      }),
    );
  }

  if (depth === "deep") {
    tasks.push(
      () => synthesizeGpt({
        system: "GCC business expert.",
        user: `All public data for "${nameEn}" Saudi Arabia: ownership, financials, executives, market position, B2B approach.`,
      }),
      () => searchWeb(`"${nameEn}" site:mc.gov.sa OR site:gleif.org OR site:opencorporates.com`),
    );
  }

  const results = await fanOut(tasks, { timeoutMs: depth === "deep" ? 55000 : 35000 });
  const gathered = results
    .filter((r) => r.status === "fulfilled" && (r as PromiseFulfilledResult<string>).value?.trim())
    .map((r) => (r as PromiseFulfilledResult<string>).value)
    .join("\n---\n")
    .slice(0, 7000);

  const profile = await synthesizeJson<Record<string, unknown>>({
    system: "Extract structured Saudi company data. Return ONLY valid JSON.",
    user: `Company: ${nameEn}\nSource: ${sourceId}\n\nData:\n${gathered}\n\nReturn JSON:\n{"nameAr":null,"industry":null,"city":null,"website":null,"phone":null,"email":null,"address":null,"description":null,"employeeCount":null,"revenue":null,"ownerName":null,"ownerNameAr":null,"ownerTitle":null,"crNumber":null,"foundingYear":null,"keyExecutives":null,"shareholders":null,"enrichmentScore":0}`,
    fallback: { industry: "Unknown", enrichmentScore: 10 },
  });

  const score = calcScore(profile);
  return {
    nameEn,
    nameAr:           (profile.nameAr as string) || null,
    sourceId,
    industry:         (profile.industry as string) || null,
    city:             (profile.city as string) || null,
    website:          (profile.website as string) || null,
    phone:            (profile.phone as string) || null,
    email:            (profile.email as string) || null,
    address:          (profile.address as string) || null,
    description:      (profile.description as string) || null,
    employeeCount:    typeof profile.employeeCount === "number" ? profile.employeeCount : null,
    revenue:          (profile.revenue as string) || null,
    ownerName:        (profile.ownerName as string) || null,
    ownerNameAr:      (profile.ownerNameAr as string) || null,
    ownerTitle:       (profile.ownerTitle as string) || null,
    crNumber:         (profile.crNumber as string) || null,
    foundingYear:     typeof profile.foundingYear === "number" ? profile.foundingYear : null,
    keyExecutives:    profile.keyExecutives ? JSON.stringify(profile.keyExecutives) : null,
    shareholders:     profile.shareholders ? JSON.stringify(profile.shareholders) : null,
    enrichmentScore:  score,
    enrichmentStatus: "enriched",
    isValidated:      score > 40,
    updatedAt:        new Date(),
  };
}

function calcScore(d: Record<string, unknown>): number {
  let s = 0;
  if (d.phone) s += 15; if (d.email) s += 15; if (d.website) s += 10;
  if (d.address) s += 10; if (d.ownerName) s += 15; if (d.revenue) s += 10;
  if (d.industry) s += 5; if (d.city) s += 5; if (d.crNumber) s += 10; if (d.foundingYear) s += 5;
  return Math.min(100, s);
}

// ── GET /builder/sources ──────────────────────────────────────────────────────
router.get("/sources", async (req: Request, res: Response): Promise<void> => {
  const custom = await db.select().from(builder_custom_sources).orderBy(builder_custom_sources.createdAt);
  const countRows = await db.execute(sql`SELECT source_id, COUNT(*)::int AS cnt FROM builder_companies GROUP BY source_id`);
  const countMap: Record<string, number> = {};
  for (const row of (countRows as any).rows ?? countRows) {
    const r = row as { source_id: string; cnt: number };
    if (r.source_id) countMap[r.source_id] = Number(r.cnt);
  }
  res.json([
    ...SAUDI_DATA_SOURCES.map((s) => ({ ...s, isCustom: false, harvestedCount: countMap[s.id] || 0 })),
    ...custom.map((s) => ({ id: `custom-${s.id}`, name: s.name, nameAr: s.nameAr, category: s.category, url: s.url, description: s.description, estimatedCompanies: s.estimatedCompanies, isCustom: true, harvestedCount: countMap[`custom-${s.id}`] || 0 })),
  ]);
});

// ── POST /builder/sources — add custom source ─────────────────────────────────
router.post("/sources", async (req: Request, res: Response): Promise<void> => {
  const { name, url, category, description, estimatedCompanies } = req.body as Record<string, any>;
  if (!name || !url || !category) { res.status(400).json({ error: "name, url, and category are required" }); return; }
  const [inserted] = await db.insert(builder_custom_sources).values({ name: name.trim(), nameAr: name.trim(), url: url.trim(), category: category.trim(), description: description?.trim() || null, estimatedCompanies: estimatedCompanies || 0 }).returning();
  res.json({ success: true, source: { id: `custom-${inserted.id}`, ...inserted, isCustom: true } });
});

// ── DELETE /builder/sources/:id ───────────────────────────────────────────────
router.delete("/sources/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const numId = id.startsWith("custom-") ? parseInt(id.replace("custom-", ""), 10) : parseInt(id, 10);
  if (!isNaN(numId)) await db.delete(builder_custom_sources).where(eq(builder_custom_sources.id, numId));
  res.json({ success: true });
});

// ── POST /builder/sources/:id/harvest — single source harvest ─────────────────
router.post("/sources/:id/harvest", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { enrichmentDepth = "standard" } = req.body as Record<string, any>;
  const jobId = `builder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const [job] = await db.insert(builder_jobs).values({ jobId, sourceIds: [id], status: "harvesting", startedAt: new Date() }).returning();
  res.json({ jobId, id: job.id });

  setImmediate(async () => {
    try {
      const customSources = await db.select().from(builder_custom_sources);
      const allSources = [...SAUDI_DATA_SOURCES, ...customSources.map((s) => ({ id: `custom-${s.id}`, name: s.name, category: s.category, url: s.url }))];
      const source = allSources.find((s) => s.id === id);
      if (!source) throw new Error(`Unknown source: ${id}`);

      const names = await harvestSource(source, enrichmentDepth);
      let harvested = 0;

      for (const nameEn of names.slice(0, 50)) {
        if (!nameEn?.trim()) continue;
        const [existing] = await db.select({ id: builder_companies.id }).from(builder_companies).where(ilike(builder_companies.nameEn, `%${nameEn.trim()}%`)).limit(1);
        if (existing) { await db.update(builder_companies).set({ isDuplicate: true }).where(eq(builder_companies.id, existing.id)); continue; }
        const enriched = await enrichBuilderCompany(nameEn.trim(), id, enrichmentDepth);
        await db.insert(builder_companies).values({ ...enriched, nameEn: nameEn.trim(), sourceId: id });
        harvested++;
        await db.update(builder_jobs).set({ companiesHarvested: harvested }).where(eq(builder_jobs.jobId, jobId));
        await new Promise((r) => setTimeout(r, 500));
      }
      await db.update(builder_jobs).set({ status: "completed", completedAt: new Date(), companiesHarvested: harvested }).where(eq(builder_jobs.jobId, jobId));
    } catch (err) {
      logger.error({ err }, "builder single-source harvest failed");
      await db.update(builder_jobs).set({ status: "failed", error: (err as Error).message }).where(eq(builder_jobs.jobId, jobId));
    }
  });
});

// ── POST /builder/harvest — harvest all sources ───────────────────────────────
router.post("/harvest", async (req: Request, res: Response): Promise<void> => {
  const { sourceIds, enrichmentDepth = "standard" } = req.body as Record<string, any>;
  const jobId = `builder_all_${Date.now()}`;
  const toHarvestIds: string[] = sourceIds?.length ? sourceIds : SAUDI_DATA_SOURCES.slice(0, 5).map((s) => s.id);
  const [job] = await db.insert(builder_jobs).values({ jobId, sourceIds: toHarvestIds, status: "harvesting", sourcesTotal: toHarvestIds.length, startedAt: new Date() }).returning();
  res.json({ jobId, id: job.id });

  setImmediate(async () => {
    try {
      const customSources = await db.select().from(builder_custom_sources);
      const allSources = [...SAUDI_DATA_SOURCES, ...customSources.map((s) => ({ id: `custom-${s.id}`, name: s.name, category: s.category, url: s.url }))];
      let totalHarvested = 0;
      for (const sid of toHarvestIds) {
        const source = allSources.find((s) => s.id === sid);
        if (!source) continue;
        const names = await harvestSource(source, enrichmentDepth);
        for (const nameEn of names.slice(0, 30)) {
          if (!nameEn?.trim()) continue;
          const [existing] = await db.select({ id: builder_companies.id }).from(builder_companies).where(ilike(builder_companies.nameEn, `%${nameEn.trim()}%`)).limit(1);
          if (existing) continue;
          const enriched = await enrichBuilderCompany(nameEn.trim(), sid, enrichmentDepth);
          await db.insert(builder_companies).values({ ...enriched, nameEn: nameEn.trim(), sourceId: sid });
          totalHarvested++;
          await db.update(builder_jobs).set({ companiesHarvested: totalHarvested }).where(eq(builder_jobs.jobId, jobId));
          await new Promise((r) => setTimeout(r, 500));
        }
      }
      await db.update(builder_jobs).set({ status: "completed", completedAt: new Date() }).where(eq(builder_jobs.jobId, jobId));
    } catch (err) {
      logger.error({ err }, "builder harvest-all failed");
      await db.update(builder_jobs).set({ status: "failed", error: (err as Error).message }).where(eq(builder_jobs.jobId, jobId));
    }
  });
});

// ── GET /builder/jobs/:jobId ──────────────────────────────────────────────────
router.get("/jobs/:jobId", async (req: Request, res: Response): Promise<void> => {
  const [job] = await db.select().from(builder_jobs).where(eq(builder_jobs.jobId, req.params.jobId)).limit(1);
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  res.json(job);
});

// ── GET /builder/results ──────────────────────────────────────────────────────
router.get("/results", async (req: Request, res: Response): Promise<void> => {
  const page   = Math.max(1, parseInt(String(req.query.page || "1")));
  const limit  = Math.min(100, Math.max(10, parseInt(String(req.query.limit || "25"))));
  const offset = (page - 1) * limit;
  const search = String(req.query.search || "").trim();
  const srcId  = String(req.query.sourceId || "").trim();
  const status = String(req.query.enrichmentStatus || "").trim();

  const conditions: any[] = [eq(builder_companies.isDuplicate, false)];
  if (search) conditions.push(or(ilike(builder_companies.nameEn, `%${search}%`), ilike(builder_companies.nameAr!, `%${search}%`), ilike(builder_companies.industry!, `%${search}%`), ilike(builder_companies.city!, `%${search}%`))!);
  if (srcId)  conditions.push(eq(builder_companies.sourceId, srcId));
  if (status) conditions.push(eq(builder_companies.enrichmentStatus, status));

  const where = and(...conditions);
  const [rows, countResult] = await Promise.all([
    db.select().from(builder_companies).where(where).orderBy(desc(builder_companies.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`COUNT(*)::int` }).from(builder_companies).where(where),
  ]);
  res.json({ companies: rows, total: Number(countResult[0]?.count || 0), page, limit });
});

// ── GET /builder/results/:id ──────────────────────────────────────────────────
router.get("/results/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(builder_companies).where(eq(builder_companies.id, id)).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

// ── POST /builder/results/:id/enrich ─────────────────────────────────────────
router.post("/results/:id/enrich", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const [company] = await db.select().from(builder_companies).where(eq(builder_companies.id, id)).limit(1);
  if (!company) { res.status(404).json({ error: "Not found" }); return; }
  const enriched = await enrichBuilderCompany(company.nameEn || "Unknown", company.sourceId || "manual", "deep");
  const [updated] = await db.update(builder_companies).set(enriched).where(eq(builder_companies.id, id)).returning();
  res.json({ success: true, company: updated });
});

// ── POST /builder/results/:id/save-enrichment ─────────────────────────────────
router.post("/results/:id/save-enrichment", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const { keyExecutives, shareholders, description, marketPositioning } = req.body as Record<string, any>;
  await db.update(builder_companies).set({ keyExecutives: keyExecutives || undefined, shareholders: shareholders || undefined, description: description || undefined, marketPositioning: marketPositioning || undefined, enrichmentStatus: "enriched" }).where(eq(builder_companies.id, id));
  res.json({ success: true });
});

// ── DELETE /builder/results/:id ───────────────────────────────────────────────
router.delete("/results/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(builder_companies).where(eq(builder_companies.id, id));
  res.json({ success: true });
});

// ── POST /builder/push-to-database — push to main CRM ───────────────────────
router.post("/push-to-database", async (req: Request, res: Response): Promise<void> => {
  const { ids } = req.body as { ids?: number[] };
  const query = ids?.length
    ? db.select().from(builder_companies).where(and(eq(builder_companies.isDuplicate, false), sql`id = ANY(${ids})`))
    : db.select().from(builder_companies).where(eq(builder_companies.isDuplicate, false)).limit(200);

  const rows = await query;
  let pushed = 0;
  for (const row of rows) {
    if (row.crmCompanyId) continue;
    // Dedup check
    const conditions: any[] = [];
    if (row.nameEn) conditions.push(ilike(companies.name, `%${row.nameEn}%`));
    if (row.crNumber) conditions.push(eq(companies.crNumber as any, row.crNumber));
    const [existing] = conditions.length ? await db.select({ id: companies.id }).from(companies).where(or(...conditions)).limit(1) : [];
    let companyId: string;
    if (existing) {
      companyId = String(existing.id);
    } else {
      const [comp] = await db.insert(companies).values({ name: row.nameEn || "Unknown", nameAr: row.nameAr || null, crNumber: row.crNumber || null, website: row.website || null, phone: row.phone || null, email: row.email || null, city: row.city || null, industry: row.industry || null, description: row.description || null } as any).returning({ id: companies.id });
      companyId = String(comp.id);
    }
    await db.update(builder_companies).set({ crmCompanyId: companyId }).where(eq(builder_companies.id, row.id));
    pushed++;
  }
  res.json({ success: true, pushed });
});

// ── POST /builder/results/:id/push-crm — single company push ─────────────────
router.post("/results/:id/push-crm", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const [row] = await db.select().from(builder_companies).where(eq(builder_companies.id, id)).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }

  const conditions: any[] = [];
  if (row.nameEn) conditions.push(ilike(companies.name, `%${row.nameEn}%`));
  if (row.crNumber) conditions.push(eq(companies.crNumber as any, row.crNumber));
  const [existing] = conditions.length ? await db.select({ id: companies.id }).from(companies).where(or(...conditions)).limit(1) : [];

  let companyId: string;
  if (existing) {
    companyId = String(existing.id);
  } else {
    const [comp] = await db.insert(companies).values({ name: row.nameEn || "Unknown", nameAr: row.nameAr || null, crNumber: row.crNumber || null, website: row.website || null, phone: row.phone || null, email: row.email || null, city: row.city || null, industry: row.industry || null, description: row.description || null } as any).returning({ id: companies.id });
    companyId = String(comp.id);
  }

  let contactId: string | null = null;
  if (row.ownerName?.trim()) {
    const nameParts = row.ownerName.trim().split(" ");
    const [cont] = await db.insert(contacts).values({ firstName: nameParts[0] || "Executive", lastName: nameParts.slice(1).join(" ") || "Unknown", email: row.email || null, phone: row.phone || null, title: row.ownerTitle || "Owner", companyId: companyId as any, status: "new" } as any).returning({ id: contacts.id });
    contactId = String(cont.id);
  }

  await db.update(builder_companies).set({ crmCompanyId: companyId, crmContactId: contactId || undefined }).where(eq(builder_companies.id, id));
  res.json({ success: true, companyId, contactId, existing: !!existing });
});

// ── GET /builder/stats ────────────────────────────────────────────────────────
router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  const [total, enriched, pending, pushed] = await Promise.all([
    db.select({ c: sql<number>`COUNT(*)::int` }).from(builder_companies).where(eq(builder_companies.isDuplicate, false)),
    db.select({ c: sql<number>`COUNT(*)::int` }).from(builder_companies).where(and(eq(builder_companies.enrichmentStatus, "enriched"), eq(builder_companies.isDuplicate, false))),
    db.select({ c: sql<number>`COUNT(*)::int` }).from(builder_companies).where(and(eq(builder_companies.enrichmentStatus, "pending"), eq(builder_companies.isDuplicate, false))),
    db.select({ c: sql<number>`COUNT(*)::int` }).from(builder_companies).where(sql`crm_company_id IS NOT NULL`),
  ]);
  res.json({ total: total[0]?.c || 0, enriched: enriched[0]?.c || 0, pending: pending[0]?.c || 0, pushedToCrm: pushed[0]?.c || 0 });
});

export default router;
