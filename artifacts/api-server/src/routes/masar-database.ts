/**
 * /api/masar — Masar Agentic Company Database (Doc 2)
 *
 * 25-source Saudi company harvest system.
 * Each company gets 14-agent parallel enrichment (Perplexity ×7, Gemini ×4, Claude, GPT).
 * Push to CRM creates both company + contact records with dedup check.
 */

import { Router, type Request, type Response } from "express";
import { db, masar_companies, masar_harvest_jobs, masar_custom_sources, contacts, companies } from "@workspace/db";
import { desc, eq, and, or, ilike, sql } from "drizzle-orm";
import { fanOut, searchWeb, searchGrounded, synthesizeClaude, synthesizeGpt, synthesizeJson } from "../lib/engines/_ai.js";
import { scraperFetch } from "../lib/enrichment/connectors/web-scraper.js";
import { logger } from "../lib/logger.js";

const router = Router();

// ── Source Definitions ────────────────────────────────────────────────────────

const MASAR_SOURCES = [
  // General
  { id: "open-data",       name: "Saudi Open Data / CKAN",         category: "general",      url: "https://data.gov.sa/api/3/action/package_search?q=company&rows=50",                estimatedCompanies: 500  },
  { id: "blupages",        name: "BluPages Saudi Directory",        category: "general",      url: "https://www.blupages.com/search?country=saudi-arabia",                             estimatedCompanies: 12000 },
  { id: "gov-data",        name: "Saudi Gov Data CKAN",             category: "general",      url: "https://data.gov.sa",                                                              estimatedCompanies: 300  },
  // Government Registries
  { id: "muqawil",         name: "Muqawil Contractors",             category: "government",   url: "https://muqawil.org/ar/contractors",                                               estimatedCompanies: 5000 },
  { id: "etimad",          name: "Etimad Government Tenders",       category: "government",   url: "https://etimad.sa/Home/Index",                                                     estimatedCompanies: 3000 },
  { id: "modon",           name: "MODON Industrial Cities",         category: "government",   url: "https://www.modon.gov.sa/en/Pages/default.aspx",                                   estimatedCompanies: 2000 },
  { id: "rega",            name: "REGA Real Estate",                category: "government",   url: "https://www.rega.gov.sa/ar",                                                       estimatedCompanies: 1500 },
  // Professional Sectors
  { id: "lawyers",         name: "Saudi Law Firms",                 category: "professional", url: "https://www.najiz.moj.gov.sa",                                                     estimatedCompanies: 800  },
  { id: "auditors",        name: "Saudi Auditors & Accountants",    category: "professional", url: "https://socpa.org.sa/en/Offices",                                                  estimatedCompanies: 600  },
  { id: "healthcare",      name: "Saudi Healthcare Providers",      category: "professional", url: "https://www.moh.gov.sa/en/HealthcareProviders",                                    estimatedCompanies: 2500 },
  { id: "banks",           name: "Saudi Banks & Finance",           category: "professional", url: "https://www.sama.gov.sa/en-US/Banks/Pages/default.aspx",                          estimatedCompanies: 250  },
  { id: "logistics",       name: "Saudi Logistics Companies",       category: "professional", url: "https://www.splonline.com.sa",                                                     estimatedCompanies: 1200 },
  // Open Registries
  { id: "opencorp",        name: "OpenCorporates Saudi Arabia",     category: "registry",     url: "https://opencorporates.com/companies/sa",                                          estimatedCompanies: 8000 },
  { id: "gleif",           name: "GLEIF Legal Entity Registry",     category: "registry",     url: "https://api.gleif.org/api/v1/lei-records?filter[entity.legalAddress.country]=SA&page[size]=50", estimatedCompanies: 6000 },
  { id: "wikidata",        name: "Wikidata Saudi Companies",        category: "registry",     url: "https://query.wikidata.org/sparql?query=SELECT%20?item%20?itemLabel%20WHERE%20{%20?item%20wdt:P31%20wd:Q4830453%20.%20?item%20wdt:P17%20wd:Q851%20.%20SERVICE%20wikibase:label%20{%20bd:serviceParam%20wikibase:language%20\"en\".%20}%20}%20LIMIT%20500&format=json", estimatedCompanies: 500 },
  // Professional Directories / Chambers
  { id: "moores-rowland",  name: "Moores Rowland KSA",             category: "directory",    url: "https://www.mooresrowland.com/middle-east-africa/saudi-arabia",                    estimatedCompanies: 200  },
  { id: "arab-british",    name: "Arab British Chamber",           category: "directory",    url: "https://www.abcc.org.uk/members",                                                  estimatedCompanies: 400  },
  { id: "amcham",          name: "AmCham Saudi Arabia",            category: "directory",    url: "https://www.amchamsaudi.com/members",                                              estimatedCompanies: 300  },
  { id: "sbbc",            name: "Saudi British Business Council", category: "directory",    url: "https://www.sbbc.co.uk",                                                           estimatedCompanies: 250  },
  { id: "jcc",             name: "Japan-Saudi Chamber",            category: "directory",    url: "https://jccsa.org",                                                                estimatedCompanies: 150  },
  { id: "french-chamber",  name: "French Chamber KSA",             category: "directory",    url: "https://www.ccef-sa.fr/en",                                                        estimatedCompanies: 200  },
  { id: "german-arab",     name: "German Arab Chamber",            category: "directory",    url: "https://www.gacic.net",                                                            estimatedCompanies: 180  },
  { id: "gcc-chambers",    name: "GCC Chambers Network",           category: "directory",    url: "https://www.gccsg.org",                                                            estimatedCompanies: 1000 },
  { id: "icaew",           name: "ICAEW Saudi Members",            category: "directory",    url: "https://www.icaew.com/about-icaew/icaew-worldwide/middle-east",                    estimatedCompanies: 300  },
  { id: "amaaly",          name: "Amaaly AOA Documents",           category: "documents",    url: "https://emagazine.aamaly.sa",                                                      estimatedCompanies: 5000 },
];

// ── In-memory job tracker ─────────────────────────────────────────────────────
const activeJobs = new Map<string, { cancel: boolean }>();

// ── Helper: harvest companies from a source ───────────────────────────────────
async function fetchCompanyNamesFromSource(source: typeof MASAR_SOURCES[number], keyword?: string): Promise<string[]> {
  const names: string[] = [];

  // Try GLEIF JSON API directly
  if (source.id === "gleif") {
    try {
      const resp = await fetch(source.url, { signal: AbortSignal.timeout(10000) });
      if (resp.ok) {
        const data = await resp.json() as any;
        for (const record of data?.data || []) {
          const name = record?.attributes?.entity?.legalName?.name;
          if (name) names.push(name);
        }
        if (names.length > 0) return names;
      }
    } catch { /* fall through to AI */ }
  }

  // Try Wikidata SPARQL
  if (source.id === "wikidata") {
    try {
      const resp = await fetch(source.url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) });
      if (resp.ok) {
        const data = await resp.json() as any;
        for (const binding of data?.results?.bindings || []) {
          const name = binding?.itemLabel?.value;
          if (name && !name.startsWith("Q")) names.push(name);
        }
        if (names.length > 0) return names;
      }
    } catch { /* fall through to AI */ }
  }

  // Try ENRICHMENT_SCRAPER_URL sidecar for heavy scraping
  try {
    const scraperUrl = process.env.ENRICHMENT_SCRAPER_URL || "http://localhost:8000/scraper";
    const resp = await fetch(`${scraperUrl}/crawl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: source.url, extract: "company_names", keyword }),
      signal: AbortSignal.timeout(20000),
    });
    if (resp.ok) {
      const data = await resp.json() as any;
      if (Array.isArray(data?.companies) && data.companies.length > 0) return data.companies;
      if (Array.isArray(data?.names) && data.names.length > 0) return data.names;
    }
  } catch { /* fall through */ }

  // Fallback: Cheerio scraper
  try {
    const scrapeResult = await scraperFetch(source.url);
    const text = (scrapeResult.text ?? "").replace(/\s+/g, " ").slice(0, 4000);
    const extracted = await synthesizeJson<{ names: string[] }>({
      system: "Extract Saudi company names from this web page text. Return ONLY valid JSON.",
      user: `Source: ${source.name}\n${keyword ? `Keyword filter: ${keyword}\n` : ""}Text:\n${text}\n\nReturn JSON: { "names": ["Company Name 1", "Company Name 2", ...] } — up to 30 company names visible on this page.`,
      fallback: { names: [] },
    });
    return extracted.names || [];
  } catch { /* fall through */ }

  // Last resort: AI generation based on source knowledge
  try {
    const generated = await synthesizeJson<{ names: string[] }>({
      system: "You are a Saudi Arabian business intelligence expert.",
      user: `List 20 real Saudi Arabian companies that would be found on ${source.name} (${source.url}).${keyword ? ` Focus on companies related to: ${keyword}.` : ""}\n\nReturn JSON: { "names": ["Company Name 1", "Company Name 2", ...] }`,
      fallback: { names: [] },
    });
    return generated.names || [];
  } catch { return []; }
}

// ── Helper: 14-agent parallel enrichment for a single company ─────────────────
async function enrichCompanyRecord(
  nameEn: string,
  sourceId: string,
  depth: "basic" | "standard" | "deep" = "standard",
): Promise<Partial<typeof masar_companies.$inferInsert>> {
  const tasks: Array<() => Promise<string>> = [
    () => searchWeb(`"${nameEn}" Saudi Arabia company overview industry revenue employees founded`),
    () => searchWeb(`"${nameEn}" Saudi Arabia CR number commercial registration legal form`),
    () => searchWeb(`"${nameEn}" phone email address website contact Saudi Arabia`),
    () => searchWeb(`"${nameEn}" CEO shareholders board directors management Saudi Arabia`),
    () => searchGrounded(`${nameEn} company profile Saudi Arabia industry founding year paid-up capital`),
    () => searchGrounded(`${nameEn} shareholders ownership structure executives management Saudi Arabia`),
    () => searchGrounded(`${nameEn} revenue estimate employees market position Saudi Arabia`),
  ];

  if (depth !== "basic") {
    tasks.push(
      () => searchWeb(`"${nameEn}" Saudi Arabia financial annual report 2024 2023 revenue capital`),
      () => searchWeb(`"${nameEn}" news awards contracts government tenders Saudi Arabia`),
      () => searchGrounded(`${nameEn} office locations branches products services clients Saudi Arabia`),
      () => synthesizeClaude({
        system: "Saudi B2B intelligence analyst.",
        user: `Research "${nameEn}" Saudi Arabia. Provide: CR number, legal form, city, industry, paid-up capital, founding year, revenue estimate, phone, email, website, CEO, shareholders, key executives, description.`,
      }),
    );
  }

  if (depth === "deep") {
    tasks.push(
      () => synthesizeGpt({
        system: "GCC business intelligence expert.",
        user: `Find all public data about "${nameEn}" Saudi Arabia. Focus on: ownership structure, financial health, executive team, market position, B2B sales approach.`,
      }),
      () => searchWeb(`"${nameEn}" site:mc.gov.sa OR site:opencorporates.com OR site:gleif.org`),
      () => searchGrounded(`${nameEn} Saudi Arabia OFAC sanctions compliance legal status regulatory`),
    );
  }

  const results = await fanOut(tasks, { timeoutMs: depth === "deep" ? 55000 : 35000 });
  const gathered = results
    .filter((r) => r.status === "fulfilled" && (r as PromiseFulfilledResult<string>).value?.trim())
    .map((r) => (r as PromiseFulfilledResult<string>).value)
    .join("\n\n---\n\n")
    .slice(0, 8000);

  const profile = await synthesizeJson<Record<string, unknown>>({
    system: "Extract ALL available structured data for this Saudi company. Return ONLY valid JSON.",
    user: `Company: ${nameEn}\nSource: ${sourceId}\n\nResearch:\n${gathered}\n\nReturn JSON:\n{"nameAr":null,"crNumber":null,"legalForm":null,"city":null,"industry":null,"foundingYear":null,"paidUpCapital":null,"revenue":null,"employees":null,"phone":null,"email":null,"website":null,"address":null,"ownerName":null,"ownerNameAr":null,"ownerTitle":null,"shareholders":null,"board":null,"description":null,"enrichmentScore":0}`,
    fallback: { nameEn, industry: "Unknown", enrichmentScore: 10 },
  });

  const score = calculateScore(profile);
  return {
    nameEn,
    nameAr:           (profile.nameAr as string) || null,
    crNumber:         (profile.crNumber as string) || null,
    legalForm:        (profile.legalForm as string) || null,
    city:             (profile.city as string) || null,
    industry:         (profile.industry as string) || null,
    foundingYear:     typeof profile.foundingYear === "number" ? profile.foundingYear : null,
    paidUpCapital:    (profile.paidUpCapital as string) || null,
    revenue:          (profile.revenue as string) || null,
    employees:        typeof profile.employees === "number" ? profile.employees : null,
    phone:            (profile.phone as string) || null,
    email:            (profile.email as string) || null,
    website:          (profile.website as string) || null,
    address:          (profile.address as string) || null,
    ownerName:        (profile.ownerName as string) || null,
    ownerNameAr:      (profile.ownerNameAr as string) || null,
    ownerTitle:       (profile.ownerTitle as string) || null,
    shareholders:     profile.shareholders ? JSON.stringify(profile.shareholders) : null,
    board:            profile.board ? JSON.stringify(profile.board) : null,
    description:      (profile.description as string) || null,
    sourceId,
    enrichmentStatus: "enriched",
    enrichmentScore:  score,
    isValidated:      score > 40,
    rawData:          profile,
    updatedAt:        new Date(),
  };
}

function calculateScore(data: Record<string, unknown>): number {
  let s = 0;
  if (data.phone)        s += 15;
  if (data.email)        s += 15;
  if (data.website)      s += 10;
  if (data.address)      s += 10;
  if (data.ownerName)    s += 15;
  if (data.revenue)      s += 10;
  if (data.industry)     s +=  5;
  if (data.city)         s +=  5;
  if (data.crNumber)     s += 10;
  if (data.foundingYear) s +=  5;
  return Math.min(100, s);
}

// ── GET /masar/sources ────────────────────────────────────────────────────────
router.get("/sources", async (req: Request, res: Response): Promise<void> => {
  const custom = await db.select().from(masar_custom_sources).orderBy(masar_custom_sources.createdAt);
  const countRows = await db.execute(sql`SELECT source_id, COUNT(*)::int AS cnt FROM masar_companies GROUP BY source_id`);
  const countMap: Record<string, number> = {};
  for (const row of (countRows as any).rows ?? countRows) {
    const r = row as { source_id: string; cnt: number };
    if (r.source_id) countMap[r.source_id] = Number(r.cnt);
  }
  res.json([
    ...MASAR_SOURCES.map((s) => ({ ...s, isCustom: false, harvestedCount: countMap[s.id] || 0 })),
    ...custom.map((s) => ({ id: `custom-${s.id}`, name: s.name, nameAr: s.nameAr, category: s.category, url: s.url, description: s.description, estimatedCompanies: s.estimatedCompanies, isCustom: true, harvestedCount: countMap[`custom-${s.id}`] || 0 })),
  ]);
});

// ── POST /masar/custom-sources ────────────────────────────────────────────────
router.post("/custom-sources", async (req: Request, res: Response): Promise<void> => {
  const { name, url, category, description, estimatedCompanies } = req.body as Record<string, any>;
  if (!name || !url || !category) { res.status(400).json({ error: "name, url, and category are required" }); return; }
  const [inserted] = await db.insert(masar_custom_sources).values({ name: name.trim(), url: url.trim(), category: category.trim(), description: description?.trim() || null, estimatedCompanies: estimatedCompanies || 0 }).returning();
  const { id: dbId, ...rest } = inserted;
  res.json({ success: true, source: { id: `custom-${dbId}`, ...rest, isCustom: true } });
});

// ── DELETE /masar/custom-sources/:id ─────────────────────────────────────────
router.delete("/custom-sources/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  if (!isNaN(id)) await db.delete(masar_custom_sources).where(eq(masar_custom_sources.id, id));
  res.json({ success: true });
});

// ── POST /masar/harvest — start harvest ───────────────────────────────────────
router.post("/harvest", async (req: Request, res: Response): Promise<void> => {
  const { sourceIds, keyword, enrichmentDepth = "standard" } = req.body as { sourceIds?: string[]; keyword?: string; enrichmentDepth?: string };
  const jobId = `masar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const [job] = await db.insert(masar_harvest_jobs).values({
    jobId,
    sourceIds: sourceIds || [],
    status: "running",
    startedAt: new Date(),
  }).returning();

  res.json({ jobId, id: job.id, status: "running" });

  // Background: harvest all selected sources
  const ctrl = { cancel: false };
  activeJobs.set(jobId, ctrl);

  setImmediate(async () => {
    try {
      const customSources = await db.select().from(masar_custom_sources);
      const allSources = [
        ...MASAR_SOURCES,
        ...customSources.map((s) => ({ id: `custom-${s.id}`, name: s.name, category: s.category || "custom", url: s.url, estimatedCompanies: s.estimatedCompanies || 0 })),
      ];
      const toHarvest = sourceIds?.length
        ? allSources.filter((s) => sourceIds.includes(s.id))
        : allSources.slice(0, 5); // default: first 5 sources

      let totalHarvested = 0;

      for (const source of toHarvest) {
        if (ctrl.cancel) break;

        await db.update(masar_harvest_jobs).set({ status: `harvesting ${source.name}` }).where(eq(masar_harvest_jobs.jobId, jobId));

        const names = await fetchCompanyNamesFromSource(source, keyword);

        for (const nameEn of names.slice(0, 30)) {
          if (ctrl.cancel) break;
          if (!nameEn?.trim()) continue;

          // Dedup check
          const [existing] = await db.select({ id: masar_companies.id })
            .from(masar_companies).where(ilike(masar_companies.nameEn!, `%${nameEn.trim()}%`)).limit(1);

          if (existing) {
            await db.update(masar_companies).set({ isDuplicate: true }).where(eq(masar_companies.id, existing.id));
            continue;
          }

          try {
            const enriched = await enrichCompanyRecord(nameEn.trim(), source.id, enrichmentDepth as any);
            await db.insert(masar_companies).values({ ...enriched, nameEn: nameEn.trim(), sourceId: source.id });
            totalHarvested++;
            await db.update(masar_harvest_jobs).set({ companiesHarvested: totalHarvested }).where(eq(masar_harvest_jobs.jobId, jobId));
          } catch (err) {
            logger.warn({ err, nameEn }, "masar enrichment failed for company");
          }
          await new Promise((r) => setTimeout(r, 500));
        }
      }

      await db.update(masar_harvest_jobs).set({ status: "completed", completedAt: new Date(), companiesHarvested: totalHarvested }).where(eq(masar_harvest_jobs.jobId, jobId));
    } catch (err) {
      logger.error({ err }, "masar harvest job failed");
      await db.update(masar_harvest_jobs).set({ status: "failed", error: (err as Error).message }).where(eq(masar_harvest_jobs.jobId, jobId));
    } finally {
      activeJobs.delete(jobId);
    }
  });
});

// ── POST /masar/harvest/:sourceId — single source ─────────────────────────────
router.post("/harvest/:sourceId", async (req: Request, res: Response): Promise<void> => {
  const { sourceId } = req.params;
  const { keyword, enrichmentDepth = "standard" } = req.body as Record<string, any>;
  req.body.sourceIds = [sourceId];
  req.body.keyword = keyword;
  req.body.enrichmentDepth = enrichmentDepth;
  return (router as any).handle({ ...req, url: "/harvest", method: "POST" }, res, () => {});
});

// ── GET /masar/jobs ───────────────────────────────────────────────────────────
router.get("/jobs", async (_req: Request, res: Response): Promise<void> => {
  const jobs = await db.select().from(masar_harvest_jobs).orderBy(desc(masar_harvest_jobs.createdAt)).limit(50);
  res.json(jobs);
});

// ── GET /masar/jobs/:jobId ────────────────────────────────────────────────────
router.get("/jobs/:jobId", async (req: Request, res: Response): Promise<void> => {
  const [job] = await db.select().from(masar_harvest_jobs).where(eq(masar_harvest_jobs.jobId, String(req.params.jobId))).limit(1);
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  res.json(job);
});

// ── DELETE /masar/jobs/:jobId — cancel job ────────────────────────────────────
router.delete("/jobs/:jobId", async (req: Request, res: Response): Promise<void> => {
  const jobId = String(req.params.jobId);
  const ctrl = activeJobs.get(jobId);
  if (ctrl) ctrl.cancel = true;
  await db.update(masar_harvest_jobs).set({ status: "cancelled" }).where(eq(masar_harvest_jobs.jobId, jobId));
  res.json({ success: true });
});

// ── GET /masar/companies ──────────────────────────────────────────────────────
router.get("/companies", async (req: Request, res: Response): Promise<void> => {
  const page     = Math.max(1, parseInt(String(req.query.page || "1")));
  const limit    = Math.min(100, Math.max(10, parseInt(String(req.query.limit || "25"))));
  const offset   = (page - 1) * limit;
  const search   = String(req.query.search || "").trim();
  const sourceId = String(req.query.sourceId || "").trim();
  const status   = String(req.query.status || "").trim();

  const conditions: any[] = [];
  if (search) conditions.push(or(
    ilike(masar_companies.nameEn!, `%${search}%`),
    ilike(masar_companies.nameAr!, `%${search}%`),
    ilike(masar_companies.industry!, `%${search}%`),
    ilike(masar_companies.city!, `%${search}%`),
  ));
  if (sourceId) conditions.push(eq(masar_companies.sourceId!, sourceId));
  if (status)   conditions.push(eq(masar_companies.enrichmentStatus!, status));

  const where = conditions.length ? and(...conditions) : undefined;
  const [rows, countResult] = await Promise.all([
    db.select().from(masar_companies).where(where).orderBy(desc(masar_companies.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`COUNT(*)::int` }).from(masar_companies).where(where),
  ]);
  res.json({ companies: rows, total: Number(countResult[0]?.count || 0), page, limit });
});

// ── GET /masar/companies/:id ──────────────────────────────────────────────────
router.get("/companies/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const [row] = await db.select().from(masar_companies).where(eq(masar_companies.id, id)).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

// ── POST /masar/companies/:id/enrich — re-enrich a single company ─────────────
router.post("/companies/:id/enrich", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const [company] = await db.select().from(masar_companies).where(eq(masar_companies.id, id)).limit(1);
  if (!company) { res.status(404).json({ error: "Not found" }); return; }
  const enriched = await enrichCompanyRecord(company.nameEn || "Unknown", company.sourceId || "manual", "deep");
  const [updated] = await db.update(masar_companies).set(enriched).where(eq(masar_companies.id, id)).returning();
  res.json({ success: true, company: updated });
});

// ── POST /masar/companies/:id/push-crm ───────────────────────────────────────
router.post("/companies/:id/push-crm", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  const [row] = await db.select().from(masar_companies).where(eq(masar_companies.id, id)).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }

  try {
    // Dedup: check for existing company
    let companyId: string | null = null;
    const conditions = [];
    if (row.nameEn) conditions.push(ilike(companies.name, `%${row.nameEn}%`));
    if (row.crNumber) conditions.push(eq((companies as any).crNumber, row.crNumber));
    if (conditions.length) {
      const [existing] = await db.select({ id: companies.id }).from(companies).where(or(...conditions)).limit(1);
      if (existing) companyId = String(existing.id);
    }
    if (!companyId) {
      const [comp] = await db.insert(companies).values({
        name:        row.nameEn || "Unknown",
        nameAr:      row.nameAr || null,
        crNumber:    row.crNumber || null,
        website:     row.website || null,
        phone:       row.phone || null,
        email:       row.email || null,
        city:        row.city || null,
        industry:    row.industry || null,
        description: row.description || null,
      } as any).returning({ id: companies.id });
      companyId = String(comp.id);
    }

    // Add contact if owner found
    let contactId: string | null = null;
    if (row.ownerName?.trim()) {
      const nameParts = row.ownerName.trim().split(" ");
      const [cont] = await db.insert(contacts).values({
        firstName:  nameParts[0] || "Executive",
        lastName:   nameParts.slice(1).join(" ") || "Unknown",
        email:      row.email || null,
        phone:      row.phone || null,
        title:      row.ownerTitle || "Owner",
        companyId:  companyId as any,
        status:     "new",
      } as any).returning({ id: contacts.id });
      contactId = String(cont.id);
    }

    await db.update(masar_companies).set({ crmCompanyId: companyId, crmContactId: contactId || undefined }).where(eq(masar_companies.id, id));
    res.json({ success: true, companyId, contactId });
  } catch (err: any) {
    req.log?.error({ err }, "masar push-crm failed");
    res.status(500).json({ error: "Failed to push to CRM" });
  }
});

// ── DELETE /masar/companies/:id ───────────────────────────────────────────────
router.delete("/companies/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id));
  await db.delete(masar_companies).where(eq(masar_companies.id, id));
  res.json({ success: true });
});

// ── POST /masar/companies/bulk-push-crm ───────────────────────────────────────
router.post("/companies/bulk-push-crm", async (req: Request, res: Response): Promise<void> => {
  const { ids } = req.body as { ids: number[] };
  if (!Array.isArray(ids) || ids.length === 0) { res.status(400).json({ error: "ids array is required" }); return; }
  let pushed = 0;
  const errors: string[] = [];
  for (const id of ids.slice(0, 100)) {
    try {
      const [row] = await db.select().from(masar_companies).where(eq(masar_companies.id, id)).limit(1);
      if (!row || row.crmCompanyId) continue;
      const [comp] = await db.insert(companies).values({ name: row.nameEn || "Unknown", nameAr: row.nameAr || null, crNumber: row.crNumber || null, website: row.website || null, phone: row.phone || null, email: row.email || null, city: row.city || null, industry: row.industry || null } as any).returning({ id: companies.id });
      await db.update(masar_companies).set({ crmCompanyId: String(comp.id) }).where(eq(masar_companies.id, id));
      pushed++;
    } catch (e) { errors.push(String(id)); }
  }
  res.json({ success: true, pushed, errors });
});

// ── GET /masar/stats ──────────────────────────────────────────────────────────
router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  const [total, enriched, pending, pushed] = await Promise.all([
    db.select({ c: sql<number>`COUNT(*)::int` }).from(masar_companies),
    db.select({ c: sql<number>`COUNT(*)::int` }).from(masar_companies).where(eq(masar_companies.enrichmentStatus, "enriched")),
    db.select({ c: sql<number>`COUNT(*)::int` }).from(masar_companies).where(eq(masar_companies.enrichmentStatus, "pending")),
    db.select({ c: sql<number>`COUNT(*)::int` }).from(masar_companies).where(sql`crm_company_id IS NOT NULL`),
  ]);
  res.json({ total: total[0]?.c || 0, enriched: enriched[0]?.c || 0, pending: pending[0]?.c || 0, pushedToCrm: pushed[0]?.c || 0 });
});

export default router;
