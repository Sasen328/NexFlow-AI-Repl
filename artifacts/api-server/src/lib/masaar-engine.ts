// ─── MASAAR ENGINE — 5-Agent KSA Commercial Registration Pipeline ──────────────
//
//  Agent 1 │ MC.gov.sa Stealth Crawler  — search CR by name, extract registration
//  Agent 2 │ Amaaly AOA OCR             — scrape articles of association, translate AR→EN
//  Agent 3 │ Deep Research Ensemble     — 9 parallel NEXUS researcher calls
//  Agent 4 │ Compliance Screener        — OFAC / UN / EU / CMA / SAMA / ZATCA
//  Agent 5 │ Bilingual Report           — Claude EN + GPT-4o AR, NEXUS synthesis fallback
//
// All agents degrade gracefully: if paid providers are absent, NEXUS fabric fills in.
// ─────────────────────────────────────────────────────────────────────────────────

import { EventEmitter } from "events";
import { db } from "@workspace/db";
import { masar_companies, masar_harvest_jobs } from "@workspace/db";
import { eq } from "drizzle-orm";
import { JobRegistry } from "./job-registry.js";
import { scrapePage } from "./power-scraper.js";
import { nexusRunRole } from "./nexus/index.js";
import { screenSanctions } from "./sanctions-screen.js";
import { synthesizeClaude, synthesizeGpt } from "../lib/engines/_ai.js";

// ─── Job Registry ────────────────────────────────────────────────────────────

const registry = new JobRegistry({ idPrefix: "masaar", maxEntries: 100, maxListeners: 20 });

export function createMasaarJob(): string { return registry.create().jobId; }
export function getMasaarEmitter(jobId: string): EventEmitter | undefined { return registry.get(jobId); }
export function cancelMasaarJob(jobId: string): boolean { return registry.cancel(jobId); }
export function getMasaarJobStatus(jobId: string) { return { exists: registry.get(jobId) !== undefined }; }

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MasaarBrief {
  companyName?: string;
  crNumber?: string;
  searchMode?: "cr" | "name" | "ceo";
  searchQuery: string;
  depth?: "fast" | "standard" | "deep";
  language?: "en" | "ar" | "bilingual";
}

export interface MasaarResult {
  companyId?: string | number;
  nameEn?: string;
  nameAr?: string;
  crNumber?: string;
  registrationDate?: string;
  legalForm?: string;
  capital?: string;
  ceo?: string;
  address?: string;
  city?: string;
  region?: string;
  activities?: string[];
  shareholders?: Array<{ name: string; share?: string }>;
  compliance?: { ofac: boolean; un: boolean; eu: boolean; cma: boolean; sama: boolean; zatca: boolean; clean: boolean };
  reportEn?: string;
  reportAr?: string;
  sources?: string[];
  confidenceScore?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function emit(emitter: EventEmitter | undefined, event: Record<string, unknown>) {
  emitter?.emit("data", JSON.stringify(event));
}

function tryParseJson<T>(text: string | null | undefined): T | null {
  if (!text) return null;
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]) as T;
  } catch { /* */ }
  return null;
}

// ─── Agent 1: MC.gov.sa CR Crawler ──────────────────────────────────────────

async function agent1McScraper(brief: MasaarBrief, emitter?: EventEmitter): Promise<Partial<MasaarResult>> {
  emit(emitter, { type: "agent_start", agent: 1, name: "MC.gov.sa Stealth Crawler" });

  const query = brief.crNumber || brief.searchQuery;
  const sources: string[] = [];
  let crData: Partial<MasaarResult> = {};

  try {
    const mcUrl = brief.crNumber
      ? `https://mc.gov.sa/en/companies/Pages/ResultDetails.aspx?NR=${brief.crNumber}`
      : `https://mc.gov.sa/en/companies/Pages/Results.aspx?SN=${encodeURIComponent(query)}`;

    const result = await scrapePage(mcUrl, { forceEngine: "playwright-stealth", timeoutMs: 30000 });

    if (!result.error && !result.blocked && result.text) {
      const extracted = await nexusRunRole("extractor", `
Extract company registration data from this Saudi MC.gov.sa page.
Return JSON: { nameEn, nameAr, crNumber, registrationDate, legalForm, capital, ceo, address, city, region, activities (array), shareholders (array of {name, share}) }. Set missing fields to null.
Page: ${result.text.slice(0, 6000)}
`, { maxTokens: 1500 });

      const parsed = tryParseJson<Partial<MasaarResult>>(extracted.text);
      if (parsed) { crData = parsed; sources.push("mc.gov.sa"); }
    }
  } catch { /* MC.gov.sa inaccessible */ }

  // Fallback: NEXUS researcher
  if (!crData.crNumber && !crData.nameEn) {
    const researched = await nexusRunRole("researcher",
      `Saudi company "${query}" commercial registration: CR number, registration date, legal form, capital, CEO, city. Return JSON: { nameEn, crNumber, registrationDate, legalForm, capital, ceo, city, region }.`,
      { maxTokens: 800 }
    ).then(r => r.text).catch(() => "");
    const parsed = tryParseJson<Partial<MasaarResult>>(researched);
    if (parsed) { crData = { ...crData, ...parsed }; sources.push("nexus-research"); }
  }

  if (!crData.nameEn) crData.nameEn = brief.companyName || brief.searchQuery;

  emit(emitter, { type: "agent_done", agent: 1, found: !!crData.crNumber, sources });
  return { ...crData, sources };
}

// ─── Agent 2: Amaaly AOA OCR + Translate ────────────────────────────────────

async function agent2AmaalyOcr(crData: Partial<MasaarResult>, emitter?: EventEmitter): Promise<Partial<MasaarResult>> {
  emit(emitter, { type: "agent_start", agent: 2, name: "Amaaly AOA OCR" });

  const companyName = crData.nameEn || crData.nameAr || "";
  if (!companyName) { emit(emitter, { type: "agent_done", agent: 2, skipped: true }); return {}; }

  let aoaData: Partial<MasaarResult> = {};

  try {
    const amaalyUrl = `https://emagazine.aamaly.sa/search?q=${encodeURIComponent(companyName)}`;
    const result = await scrapePage(amaalyUrl, { forceEngine: "playwright-stealth", timeoutMs: 25000 });

    if (!result.error && !result.blocked && result.text && result.text.length > 200) {
      const translated = await nexusRunRole("arabic", `
Arabic business publication page about "${companyName}". Extract and translate to English:
shareholders/ownership, board of directors, capital, business activities.
Return JSON: { nameAr, shareholders: [{name, share}], boardMembers: [string], capital, activities: [string] }
Page: ${result.text.slice(0, 5000)}
`, { maxTokens: 1500 });

      const parsed = tryParseJson<{ nameAr?: string; shareholders?: Array<{name: string; share?: string}>; activities?: string[]; capital?: string }>(translated.text);
      if (parsed) {
        aoaData = {
          nameAr:      parsed.nameAr || crData.nameAr,
          shareholders: parsed.shareholders || crData.shareholders,
          activities:  parsed.activities || crData.activities,
          capital:     parsed.capital || crData.capital,
        };
      }
    }
  } catch { /* Amaaly unavailable */ }

  emit(emitter, { type: "agent_done", agent: 2, enriched: Object.keys(aoaData).length > 0 });
  return aoaData;
}

// ─── Agent 3: Deep Research Ensemble (9 parallel NEXUS calls) ────────────────

async function agent3DeepResearch(crData: Partial<MasaarResult>, emitter?: EventEmitter): Promise<Partial<MasaarResult>> {
  emit(emitter, { type: "agent_start", agent: 3, name: "Deep Research Ensemble" });

  const name = crData.nameEn || crData.nameAr || "";
  const cr   = crData.crNumber ? ` (CR: ${crData.crNumber})` : "";

  const prompts = [
    `Saudi company "${name}"${cr}: CEO name, headquarters city, sector, website, phone. JSON: { ceo, city, sector, website, phone, email }`,
    `"${name}" Saudi Arabia employees, revenue, year founded. JSON: { employees, revenue, founded }`,
    `"${name}" KSA financial: capital, funding rounds, valuation, investors. JSON: { capital, fundingStage, investors }`,
    `Saudi company "${name}" ZATCA VAT, CMA listing, SAMA license. JSON: { vatRegistered, cmaListed, samaLicensed }`,
    `"${name}" Saudi Arabia 2024-2025 news. JSON: { recentNews: [{ headline, date }] }`,
    `"${name}" KSA market position, competitors, notable clients. JSON: { marketPosition, competitors, notableClients }`,
    `"${name}" Saudi social media: LinkedIn URL, Twitter/X handle. JSON: { linkedinUrl, twitterHandle }`,
    `"${name}" Saudi ownership: major shareholders, parent company, subsidiaries. JSON: { majorShareholders, parentCompany, subsidiaries }`,
    `"${name}" Saudi Arabia exports, Vision 2030 alignment, international offices. JSON: { exportMarkets, vision2030Alignment }`,
  ];

  const results = await Promise.all(
    prompts.map((p) => nexusRunRole("researcher", p, { maxTokens: 500 }).then(r => r.text).catch(() => ""))
  );

  const merged: Partial<MasaarResult> = {};
  for (const r of results) {
    const parsed = tryParseJson<Partial<MasaarResult>>(r);
    if (parsed) Object.assign(merged, parsed);
  }

  emit(emitter, { type: "agent_done", agent: 3, fields: Object.keys(merged).length });
  return merged;
}

// ─── Agent 4: Compliance Screener ────────────────────────────────────────────

async function agent4Compliance(crData: Partial<MasaarResult>, emitter?: EventEmitter): Promise<MasaarResult["compliance"]> {
  emit(emitter, { type: "agent_start", agent: 4, name: "Compliance Screener" });

  const name = crData.nameEn || crData.nameAr || "";
  const ceo  = crData.ceo || "";

  let ofac = false, un = false, eu = false;
  try {
    const screen = await screenSanctions(name, ceo ? [ceo] : []);
    ofac = screen.matched && (screen.source === "OFAC" || !screen.source);
    un   = screen.matched && screen.source === "UN";
    eu   = screen.matched && screen.source === "EU";
  } catch { /* */ }

  let cma = false, sama = false, zatca = false;
  try {
    const r = await nexusRunRole("researcher",
      `Saudi company "${name}": CMA capital market listing, SAMA financial license, ZATCA tax registered? JSON: { cmaListed: boolean, samaLicensed: boolean, zatcaRegistered: boolean }`,
      { maxTokens: 400 }
    );
    const parsed = tryParseJson<{ cmaListed?: boolean; samaLicensed?: boolean; zatcaRegistered?: boolean }>(r.text);
    cma = parsed?.cmaListed ?? false;
    sama = parsed?.samaLicensed ?? false;
    zatca = parsed?.zatcaRegistered ?? false;
  } catch { /* */ }

  const compliance = { ofac, un, eu, cma, sama, zatca, clean: !ofac && !un && !eu };
  emit(emitter, { type: "agent_done", agent: 4, clean: compliance.clean });
  return compliance;
}

// ─── Agent 5: Bilingual Report ───────────────────────────────────────────────

async function agent5BilingualReport(
  profile: Partial<MasaarResult>,
  compliance: MasaarResult["compliance"],
  brief: MasaarBrief,
  emitter?: EventEmitter,
): Promise<{ reportEn: string; reportAr: string }> {
  emit(emitter, { type: "agent_start", agent: 5, name: "Bilingual Report Generator" });

  const profileStr = JSON.stringify({ ...profile, compliance }, null, 2).slice(0, 4000);
  const lang = brief.language || "bilingual";

  // English report: Claude → GPT → NEXUS
  let reportEn = "";
  try {
    reportEn = await synthesizeClaude({
      system: "You are a senior B2B intelligence analyst. Write concise, professional executive profiles.",
      user: `Write a concise English executive company profile for "${profile.nameEn || profile.nameAr}" (400-600 words). Cover overview, leadership, financials, regulatory status, recent news, strategic outlook.\nProfile data: ${profileStr}`,
    });
  } catch {
    try {
      reportEn = await synthesizeGpt({
        system: "You are a senior B2B intelligence analyst. Write concise, professional executive profiles.",
        user: `Write a concise English executive company profile (400-600 words).\nProfile: ${profileStr}`,
      });
    } catch {
      reportEn = await nexusRunRole("writer",
        `Write a concise English executive profile for "${profile.nameEn}" (400-600 words). Profile: ${profileStr}`,
        { maxTokens: 900 }
      ).then(r => r.text).catch(() => "");
    }
  }

  // Arabic report: GPT → NEXUS
  let reportAr = "";
  if (lang !== "en") {
    try {
      reportAr = await synthesizeGpt({
        system: "أنت محلل استخباراتي تجاري. اكتب تقارير تنفيذية مهنية باللغة العربية.",
        user: `اكتب تقريراً تنفيذياً عن الشركة السعودية "${profile.nameAr || profile.nameEn}" (400-600 كلمة). غطّ نظرة عامة، القيادة، الماليات، الوضع التنظيمي، الأخبار، التوقعات الاستراتيجية.\nبيانات: ${profileStr}`,
      });
    } catch {
      reportAr = await nexusRunRole("arabic",
        `اكتب تقريراً تنفيذياً عن الشركة "${profile.nameAr || profile.nameEn}". البيانات: ${profileStr.slice(0, 2000)}`,
        { maxTokens: 800 }
      ).then(r => r.text).catch(() => "");
    }
  }

  emit(emitter, { type: "agent_done", agent: 5, enWords: reportEn.split(" ").length, arWords: reportAr.split(" ").length });
  return { reportEn, reportAr };
}

// ─── Main Pipeline ────────────────────────────────────────────────────────────

export async function runMasaarPipeline(jobId: string, brief: MasaarBrief): Promise<void> {
  const emitter = getMasaarEmitter(jobId);
  if (!emitter) return;

  let jobDbId: number | undefined;
  try {
    const [row] = await db.insert(masar_harvest_jobs).values({
      jobId: jobId,
      status: "running",
      sourceIds: ["masaar-engine"],
      companiesHarvested: 0,
      companiesTotal: 0,
      startedAt: new Date(),
    }).returning({ id: masar_harvest_jobs.id });
    jobDbId = row?.id;
  } catch { /* DB unavailable */ }

  const heartbeat = setInterval(() => emitter.emit("data", JSON.stringify({ type: "heartbeat" })), 15000);

  try {
    emit(emitter, { type: "pipeline_start", jobId });

    // Agent 1
    const crData = await agent1McScraper(brief, emitter);

    // Agent 2 (parallel-safe with Agent 3 setup)
    const [aoaData] = await Promise.all([agent2AmaalyOcr(crData, emitter)]);
    const mergedCr: Partial<MasaarResult> = { ...crData, ...aoaData };

    // Agent 3
    const researchData = await agent3DeepResearch(mergedCr, emitter);
    const fullProfile: Partial<MasaarResult> = { ...mergedCr, ...researchData };

    // Agent 4 + 5 in parallel
    const [compliance, reports] = await Promise.all([
      agent4Compliance(fullProfile, emitter),
      agent5BilingualReport(fullProfile, undefined, brief, emitter),
    ]);

    const finalResult: MasaarResult = {
      ...fullProfile,
      compliance,
      reportEn: reports.reportEn,
      reportAr: reports.reportAr,
      confidenceScore: Math.min(100, Object.values(fullProfile).filter((v) => v != null && v !== "").length * 5),
    };

    // Upsert into masar_companies
    try {
      const [saved] = await db.insert(masar_companies).values({
        nameEn:           finalResult.nameEn || brief.searchQuery,
        nameAr:           finalResult.nameAr || null,
        crNumber:         finalResult.crNumber || null,
        city:             finalResult.city || null,
        industry:         finalResult.activities?.[0] || null,
        address:          finalResult.address || null,
        sourceId:         "masaar-engine",
        enrichmentStatus: "enriched",
        rawData:          finalResult as Record<string, unknown>,
        createdAt:        new Date(),
        updatedAt:        new Date(),
      }).onConflictDoNothing().returning({ id: masar_companies.id });

      if (jobDbId) {
        await db.update(masar_harvest_jobs).set({ status: "completed", companiesHarvested: 1, companiesTotal: 1, completedAt: new Date() })
          .where(eq(masar_harvest_jobs.id, jobDbId));
      }
      emit(emitter, { type: "pipeline_complete", jobId, companyId: saved?.id, result: finalResult });
    } catch (dbErr) {
      emit(emitter, { type: "pipeline_complete", jobId, result: finalResult, dbError: String(dbErr) });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (jobDbId) {
      await db.update(masar_harvest_jobs).set({ status: "failed" }).where(eq(masar_harvest_jobs.id, jobDbId)).catch(() => {});
    }
    emit(emitter, { type: "error", jobId, message: msg });
  } finally {
    clearInterval(heartbeat);
    emitter.emit("done");
  }
}
