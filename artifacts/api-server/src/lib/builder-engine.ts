// ─── AI DB BUILDER ENGINE — Multi-Source Saudi Company Harvester ───────────────
//
//  Phase 1 │ Source Harvest     — 15+ built-in + custom sources → company name list
//  Phase 2 │ Deduplication      — fuzzy name dedup
//  Phase 3 │ AI Enrichment      — 3 parallel NEXUS researcher calls per company
//  Phase 4 │ Auto-Clean         — null fill, normalize
//  Phase 5 │ Push to DB         — upsert builder_companies
//
// ─────────────────────────────────────────────────────────────────────────────────

import { EventEmitter } from "events";
import { db } from "@workspace/db";
import { builder_companies, builder_jobs, builder_custom_sources } from "@workspace/db";
import { eq } from "drizzle-orm";
import { JobRegistry } from "./job-registry.js";
import { nexusRunRole } from "./nexus/index.js";
import { freeWebSearch } from "./free-search.js";

// ─── Job Registry ────────────────────────────────────────────────────────────

const registry = new JobRegistry({ idPrefix: "builder", maxEntries: 100, maxListeners: 20 });

export function createBuilderJob(): string { return registry.create().jobId; }
export function getBuilderEmitter(jobId: string): EventEmitter | undefined { return registry.get(jobId); }
export function cancelBuilderJob(jobId: string): boolean { return registry.cancel(jobId); }
export function getBuilderJobStatus(jobId: string) { return { exists: registry.get(jobId) !== undefined }; }

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BuilderBrief {
  sourceIds?: string[];
  customQuery?: string;
  depth?: "fast" | "standard" | "deep";
  industry?: string;
  region?: string;
  maxCompanies?: number;
  enrichmentFields?: string[];
  pushToMainCrm?: boolean;
}

interface RawCompanyName { name: string; sourceId: string }

// ─── 15 Built-in Saudi Data Sources ─────────────────────────────────────────

export const BUILDER_SOURCES = [
  { id: "wikidata",        name: "Wikidata Saudi Companies",      url: "https://query.wikidata.org/sparql?query=SELECT%20?item%20?itemLabel%20WHERE%20{%20?item%20wdt:P31%20wd:Q4830453%20.%20?item%20wdt:P17%20wd:Q851%20.%20SERVICE%20wikibase:label%20{%20bd:serviceParam%20wikibase:language%20\"en\".%20}%20}%20LIMIT%20200&format=json", category: "registry" },
  { id: "saudi-open-data", name: "Saudi Open Data Portal",        url: "https://data.gov.sa/api/3/action/package_search?q=company&rows=100", category: "government" },
  { id: "mc-gov",          name: "MC.gov.sa Registry",            url: "https://mc.gov.sa/en/Pages/default.aspx", category: "government" },
  { id: "cma",             name: "CMA Listed Companies",          url: "https://www.cma.org.sa/en/Market/Issuers/pages/default.aspx", category: "financial" },
  { id: "tadawul",         name: "Tadawul Stock Market",          url: "https://www.saudistockexchange.com/en/market-participants/companies", category: "financial" },
  { id: "yellow-pages",    name: "Saudi Yellow Pages",            url: "https://www.yellowpages.com.sa", category: "directory" },
  { id: "kompass",         name: "Kompass Saudi Arabia",          url: "https://sa.kompass.com/en/", category: "directory" },
  { id: "riyadh-chamber",  name: "Riyadh Chamber of Commerce",   url: "https://www.chamber.org.sa/ar/Pages/Default.aspx", category: "chamber" },
  { id: "jeddah-chamber",  name: "Jeddah Chamber of Commerce",   url: "https://www.jcci.org.sa", category: "chamber" },
  { id: "eastern-chamber", name: "Eastern Province Chamber",      url: "https://www.chamber.org.sa", category: "chamber" },
  { id: "opencorp",        name: "OpenCorporates Saudi Arabia",   url: "https://opencorporates.com/companies/sa", category: "registry" },
  { id: "gleif",           name: "GLEIF Legal Entity Registry",   url: "https://api.gleif.org/api/v1/lei-records?filter[entity.legalAddress.country]=SA&page[size]=50", category: "registry" },
  { id: "muqawil",         name: "Muqawil Contractors",           url: "https://muqawil.org/ar/contractors", category: "government" },
  { id: "blupages",        name: "BluPages Saudi Directory",      url: "https://www.blupages.com/search?country=saudi-arabia", category: "directory" },
  { id: "franchise",       name: "Saudi Franchise Association",   url: "https://www.franchise-sa.com/ar", category: "association" },
];

// ─── Phase 1: Harvest names from a source ────────────────────────────────────

async function harvestFromSource(source: typeof BUILDER_SOURCES[0], brief: BuilderBrief): Promise<RawCompanyName[]> {
  try {
    // Wikidata SPARQL
    if (source.id === "wikidata") {
      const resp = await fetch(source.url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15000) });
      if (resp.ok) {
        const data = await resp.json() as { results?: { bindings?: Array<{ itemLabel?: { value?: string } }> } };
        return (data?.results?.bindings || [])
          .map((b) => b?.itemLabel?.value)
          .filter((n): n is string => !!n && !n.startsWith("Q"))
          .map((name) => ({ name, sourceId: source.id }));
      }
    }

    // GLEIF API
    if (source.id === "gleif") {
      const resp = await fetch(source.url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15000) });
      if (resp.ok) {
        const data = await resp.json() as { data?: Array<{ attributes?: { entity?: { legalName?: { name?: string } } } }> };
        return (data?.data || [])
          .map((r) => r?.attributes?.entity?.legalName?.name)
          .filter((n): n is string => !!n)
          .map((name) => ({ name, sourceId: source.id }));
      }
    }

    // Saudi Open Data
    if (source.id === "saudi-open-data") {
      const resp = await fetch(source.url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15000) });
      if (resp.ok) {
        const data = await resp.json() as { result?: { results?: Array<{ organization?: { title?: string }; title?: string }> } };
        return (data?.result?.results || [])
          .map((r) => r?.organization?.title || r?.title)
          .filter((n): n is string => !!n)
          .map((name) => ({ name, sourceId: source.id }));
      }
    }

    // NEXUS research fallback for all other sources
    const industryFilter = brief.industry ? ` in "${brief.industry}" industry` : "";
    const regionFilter   = brief.region   ? ` in ${brief.region}`              : "";
    const result = await nexusRunRole("researcher",
      `List 20 Saudi company names from ${source.name} directory${industryFilter}${regionFilter}. Return JSON array of company name strings only, no other fields.`,
      { maxTokens: 800 }
    ).then(r => r.text).catch(() => "");

    const arr = tryParseArray(result);
    return (arr || []).map((name) => ({ name: String(name), sourceId: source.id }));
  } catch {
    return [];
  }
}

// ─── Phase 2: Deduplicate ────────────────────────────────────────────────────

function deduplicate(names: RawCompanyName[]): RawCompanyName[] {
  const seen = new Set<string>();
  return names.filter((n) => {
    const key = n.name.toLowerCase()
      .replace(/\b(co|llc|ltd|corp|inc|company|corporation|group|holding|holdings)\b/g, "")
      .replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Phase 3: Enrich per company ─────────────────────────────────────────────

async function enrichCompany(name: string, _brief: BuilderBrief): Promise<Record<string, unknown>> {
  const [r1, r2, r3] = await Promise.all([
    nexusRunRole("researcher", `Saudi company "${name}": CEO, city, sector, website, phone, email. JSON: { ceo, city, sector, website, phone, email }`, { maxTokens: 400 }).then(r => r.text).catch(() => ""),
    nexusRunRole("researcher", `"${name}" Saudi Arabia: employees count, revenue range, year founded, legal form, CR number. JSON: { employees, revenue, founded, legalForm, crNumber }`, { maxTokens: 300 }).then(r => r.text).catch(() => ""),
    nexusRunRole("researcher", `"${name}" Saudi: products/services, main clients, competitors. JSON: { products, mainClients, competitors }`, { maxTokens: 300 }).then(r => r.text).catch(() => ""),
  ]);

  const merged: Record<string, unknown> = { nameEn: name };
  for (const r of [r1, r2, r3]) {
    const parsed = tryParseJson(r);
    if (parsed) Object.assign(merged, parsed);
  }
  return merged;
}

// ─── Phase 4: Auto-clean ─────────────────────────────────────────────────────

function autoClean(row: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === "" || v === "N/A" || v === "Unknown" || v === "null") clean[k] = null;
    else clean[k] = v;
  }
  if (typeof clean.phone === "string") {
    clean.phone = clean.phone.replace(/\s/g, "").replace(/^00966/, "+966").replace(/^0/, "+966");
  }
  if (typeof clean.website === "string" && clean.website && !(clean.website as string).startsWith("http")) {
    clean.website = `https://${clean.website}`;
  }
  return clean;
}

// ─── Main Pipeline ────────────────────────────────────────────────────────────

export async function runBuilderPipeline(jobId: string, brief: BuilderBrief): Promise<void> {
  const emitter = getBuilderEmitter(jobId);
  if (!emitter) return;

  let jobDbId: number | undefined;
  try {
    const [row] = await db.insert(builder_jobs).values({
      jobId: jobId,
      type: "builder_harvest",
      status: "running",
      sourceIds: brief.sourceIds?.length ? brief.sourceIds : ["all"],
      companiesHarvested: 0,
      startedAt: new Date(),
    }).returning({ id: builder_jobs.id });
    jobDbId = row?.id;
  } catch { /* DB unavailable */ }

  const heartbeat = setInterval(() => emitter.emit("data", JSON.stringify({ type: "heartbeat" })), 20000);

  try {
    emit(emitter, { type: "pipeline_start", jobId });

    const sourceIds    = brief.sourceIds?.length ? brief.sourceIds : BUILDER_SOURCES.map((s) => s.id);
    const activeSources = BUILDER_SOURCES.filter((s) => sourceIds.includes(s.id));

    let customSources: Array<typeof BUILDER_SOURCES[0]> = [];
    try {
      const rows = await db.select().from(builder_custom_sources);
      customSources = rows.map((r) => ({ id: String(r.id), name: r.name || "Custom", url: r.url || "", category: "custom" }));
    } catch { /* */ }

    const allSources = [...activeSources, ...customSources];
    emit(emitter, { type: "phase_start", phase: 1, name: "Source Harvest", sources: allSources.length });

    // Phase 1: Harvest in batches of 4
    const rawNames: RawCompanyName[] = [];
    for (let i = 0; i < allSources.length; i += 4) {
      const batch = allSources.slice(i, i + 4);
      const batchResults = await Promise.all(batch.map((s) => harvestFromSource(s, brief)));
      for (const r of batchResults) rawNames.push(...r);
      emit(emitter, { type: "harvest_progress", harvested: rawNames.length });
    }
    emit(emitter, { type: "phase_done", phase: 1, rawCount: rawNames.length });

    // Phase 2: Dedup
    emit(emitter, { type: "phase_start", phase: 2, name: "Deduplication" });
    const uniqueNames = deduplicate(rawNames);
    const maxCompanies = brief.maxCompanies || 200;
    const toEnrich = uniqueNames.slice(0, maxCompanies);
    emit(emitter, { type: "phase_done", phase: 2, uniqueCount: uniqueNames.length, enriching: toEnrich.length });

    // Phase 3: Enrich in batches
    emit(emitter, { type: "phase_start", phase: 3, name: "AI Enrichment" });
    const enriched: Record<string, unknown>[] = [];
    const batchSize = brief.depth === "fast" ? 10 : 5;
    for (let i = 0; i < toEnrich.length; i += batchSize) {
      const batch = toEnrich.slice(i, i + batchSize);
      const results = await Promise.all(batch.map((c) => enrichCompany(c.name, brief)));
      enriched.push(...results);
      emit(emitter, { type: "enrich_progress", enriched: enriched.length, total: toEnrich.length });
    }
    emit(emitter, { type: "phase_done", phase: 3, enrichedCount: enriched.length });

    // Phase 4: Clean
    const cleaned = enriched.map(autoClean);

    // Phase 5: Upsert
    emit(emitter, { type: "phase_start", phase: 5, name: "Push to Database" });
    let saved = 0;
    for (const company of cleaned) {
      try {
        await db.insert(builder_companies).values({
          nameEn:           String(company.nameEn || company.name || ""),
          nameAr:           (company.nameAr as string) || null,
          city:             (company.city as string) || null,
          industry:         (company.sector as string) || null,
          phone:            (company.phone as string) || null,
          email:            (company.email as string) || null,
          website:          (company.website as string) || null,
          sourceId:         "builder-engine",
          enrichmentStatus: "enriched",
          rawData:          company,
          createdAt:        new Date(),
          updatedAt:        new Date(),
        }).onConflictDoNothing();
        saved++;
      } catch { /* dedup */ }
    }

    if (jobDbId) {
      await db.update(builder_jobs).set({ status: "completed", companiesHarvested: saved, completedAt: new Date() })
        .where(eq(builder_jobs.id, jobDbId)).catch(() => {});
    }

    emit(emitter, { type: "pipeline_complete", jobId, harvested: rawNames.length, unique: uniqueNames.length, enriched: enriched.length, saved });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (jobDbId) await db.update(builder_jobs).set({ status: "failed" }).where(eq(builder_jobs.id, jobDbId)).catch(() => {});
    emit(emitter, { type: "error", jobId, message: msg });
  } finally {
    clearInterval(heartbeat);
    emitter.emit("done");
  }
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function emit(emitter: EventEmitter | undefined, event: Record<string, unknown>) {
  emitter?.emit("data", JSON.stringify(event));
}

function tryParseJson(text: string | null | undefined): Record<string, unknown> | null {
  if (!text) return null;
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) as Record<string, unknown>; } catch { /* */ }
  return null;
}

function tryParseArray(text: string | null | undefined): unknown[] | null {
  if (!text) return null;
  try { const m = text.match(/\[[\s\S]*\]/); if (m) return JSON.parse(m[0]) as unknown[]; } catch { /* */ }
  return null;
}
