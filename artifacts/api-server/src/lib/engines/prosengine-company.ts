/**
 * ProsEngine — Company Intelligence.
 *
 * Original spec: 11 parallel agents (4 Gemini + 4 Perplexity + 1 stealth
 * crawl + 1 Claude knowledge + 1 GPT knowledge), with Claude+Gemini parallel
 * synthesis.
 *
 * Implementation:
 *   - Stealth crawl: Cheerio (or Playwright) on the provided/found website
 *     plus Crawl4AI sidecar fallback for JS-heavy pages.
 *   - All AI agents go through OpenRouter (Perplexity, Gemini, Claude, GPT).
 *   - Synthesis: Claude primary + GPT fallback, JSON-strict.
 */

import { fanOut, searchWeb, searchGrounded, synthesizeClaude, synthesizeGpt, synthesizeJson } from "./_ai.js";
import { scraperFetch, extractEmails } from "../enrichment/connectors/web-scraper.js";
import { aiFindDomain } from "../enrichment/connectors/openrouter-ai.js";
import { fetchJSON } from "../enrichment/connectors/_common.js";
import { logger } from "../logger.js";
import type { CompanyIntelInput, CompanyIntelReport } from "./types.js";

const EMPTY_REPORT: CompanyIntelReport = {
  profile: {
    nameEn: "", nameAr: "", legalForm: "", legalFormAr: "",
    crNumber: null, founded: null, city: null, address: null,
    website: null, phone: null, email: null, industry: null,
    mainActivity: "", mainActivityAr: "",
  },
  financials: {
    revenueEstimate: null, revenueRange: null, revenueRationale: "",
    employeeCount: null, paidUpCapital: null,
    profitabilityIndicator: "", growthSignals: [], recentFinancialNews: null,
  },
  ownership: {
    structure: null, shareholders: [],
    isPubliclyListed: false, stockExchange: null, ticker: null,
  },
  leadership: {
    ceo: { nameEn: "", nameAr: "", title: "" },
    boardChairman: { nameEn: "", nameAr: "" },
    executives: [], boardMembers: [],
  },
  operations: { activities: [], products: [], keyClients: [], subsidiaries: [], geographicPresence: [] },
  market: { marketPosition: "", marketShare: null, competitors: [], strengths: [], weaknesses: [], opportunities: [] },
  approach: { bestChannel: "", bestTiming: "", entryPoint: "", valueProp: "", openingAngle: "", potentialObjections: [], culturalNotes: "", sampleMessage: "" },
  news: [],
  intelligence: { confidenceScore: 0, dataQuality: "low", verifiedFacts: [], estimatedFacts: [], caveats: "Synthesis incomplete.", dataSources: [] },
  executiveSummary: "",
};

const SCRAPER_URL = process.env["ENRICHMENT_SCRAPER_URL"] ?? "http://localhost:8000/scraper";

async function tryCrawl4ai(url: string): Promise<{ ok: boolean; text: string; note: string }> {
  try {
    const r = await fetchJSON<{ ok: boolean; text?: string; error?: string }>(`${SCRAPER_URL}/extract`, {
      method: "POST",
      body: JSON.stringify({ url, mode: "crawl4ai", respect_robots: true }),
      headers: { "Content-Type": "application/json" },
    });
    const text = r.data?.text;
    if (!r.ok || !r.data?.ok || !text) return { ok: false, text: "", note: r.error ?? r.data?.error ?? "sidecar miss" };
    return { ok: true, text: text.slice(0, 6000), note: "crawl4ai sidecar" };
  } catch (e: any) {
    return { ok: false, text: "", note: e?.message ?? "sidecar offline" };
  }
}

export async function runCompanyIntel(input: CompanyIntelInput): Promise<{ report: CompanyIntelReport; sourcesUsed: string[] }> {
  const ctx = `${input.companyName}${input.city ? " (" + input.city + ")" : ""}${input.crNumber ? " CR " + input.crNumber : ""}`;
  logger.info({ scope: "company_intel", company: input.companyName }, "starting Company Intel");

  // ── Resolve a website URL up-front
  let websiteUrl = input.website ?? null;
  if (!websiteUrl) {
    const guessed = await aiFindDomain({ company: input.companyName });
    if (guessed) websiteUrl = guessed.startsWith("http") ? guessed : `https://${guessed}`;
  }

  const crawlPromise = (async () => {
    if (!websiteUrl) return { ok: false, text: "", emails: [] as string[], phone: "", note: "no website" };
    const r = await scraperFetch(websiteUrl, "cheerio");
    let text = (r.text ?? "").slice(0, 6000);
    let emails = extractEmails(text);
    if (!r.ok || text.length < 400) {
      // try crawl4ai sidecar
      const sc = await tryCrawl4ai(websiteUrl);
      if (sc.ok) { text = sc.text; emails = extractEmails(text); }
    }
    const phoneMatch = text.match(/\+?\d[\d\s().-]{7,}\d/);
    return { ok: text.length > 200, text, emails, phone: phoneMatch?.[0] ?? "", note: r.error ?? "" };
  })();

  const agents = fanOut([
    { name: "gemini_profile",     run: () => searchGrounded(`Full company profile for ${ctx}: official website, contact info, CR number, capital, employees, founded, industry, headquarters.`) },
    { name: "gemini_ownership",   run: () => searchGrounded(`Ownership and shareholders of ${ctx}: list shareholders with English+Arabic names and ownership percentages. Use mc.gov.sa, emagazine.aamaly.sa, news sources.`) },
    { name: "gemini_leadership",  run: () => searchGrounded(`Leadership and executive team of ${ctx}: CEO, board chairman, CFO, board members (English + Arabic names).`) },
    { name: "gemini_competitors", run: () => searchGrounded(`Competitive intelligence on ${ctx}: market share, key clients, main competitors, recent news 2025-2026.`) },
    { name: "pplx_profile",       run: () => searchWeb(`General profile and contact for ${ctx}: address, phone, email, website, year founded.`) },
    { name: "pplx_financials",    run: () => searchWeb(`Financial intelligence on ${ctx}: estimated annual revenue (SAR), profit, paid-up capital, employee count.`) },
    { name: "pplx_ownership",     run: () => searchWeb(`Ownership structure and AOA data for ${ctx}: shareholders, ownership percentages, articles of association.`) },
    { name: "pplx_leadership",    run: () => searchWeb(`Leadership team of ${ctx}: CEO, executives, board members with names and titles.`) },
    { name: "claude_knowledge",   run: () => synthesizeClaude({
      system: "You are a GCC corporate intelligence analyst.",
      user: `From your training knowledge, what do you know about ${ctx}? Cover ownership, leadership, financials, market position. Say "unknown" rather than fabricate.`,
      maxTokens: 2000,
    }) },
    { name: "gpt_knowledge",      run: () => synthesizeGpt({
      system: "You are a corporate intelligence analyst.",
      user: `From your training knowledge, what do you know about ${ctx}? Cover ownership, leadership, financials, market position. Say "unknown" rather than guess.`,
      maxTokens: 1500,
    }) },
  ], 50_000);

  const [agentResults, crawlR] = await Promise.all([agents, crawlPromise]);

  const sourcesUsed = agentResults.filter((r) => r.ok).map((r) => r.name);
  if (crawlR.ok) sourcesUsed.push("crawl_website");

  const bundle = [
    crawlR.ok ? `## crawl_website (${websiteUrl})\n${crawlR.text}\n${crawlR.emails.length ? "Emails: " + crawlR.emails.join(", ") : ""}\n${crawlR.phone ? "Phone candidate: " + crawlR.phone : ""}` : "",
    ...agentResults.filter((r) => r.ok && r.value).map((r) => `## ${r.name}\n${r.value}`),
  ].filter(Boolean).join("\n\n");

  const { data: report, provider } = await synthesizeJson<CompanyIntelReport>({
    system: "You synthesize multi-source corporate intelligence into a strict JSON dossier on a single company. Always return valid JSON matching the requested schema exactly. Use null/'' for missing scalars and [] for missing arrays — never omit keys. Never fabricate financial figures; mark estimates clearly in intelligence.estimatedFacts.",
    user: `Company: ${input.companyName}
Website: ${websiteUrl ?? "(unknown)"}
CR: ${input.crNumber ?? "(unknown)"}
City: ${input.city ?? "(unknown)"}
Known facts: ${input.knownFacts ?? "(none)"}
Seller context: ${JSON.stringify(input.sellerContext ?? {})}

Multi-source research:
${bundle.slice(0, 22000)}

Return JSON with EXACTLY these top-level keys: profile, financials, ownership, leadership, operations, market, approach, news, intelligence, executiveSummary.

profile: { nameEn, nameAr, legalForm, legalFormAr, crNumber, founded, city, address, website, phone, email, industry, mainActivity, mainActivityAr }
financials: { revenueEstimate, revenueRange, revenueRationale, employeeCount, paidUpCapital, profitabilityIndicator, growthSignals[], recentFinancialNews }
ownership: { structure, shareholders[{nameEn, nameAr, ownershipPct, nationality, type}], isPubliclyListed, stockExchange, ticker }
leadership: { ceo:{nameEn,nameAr,title}, boardChairman:{nameEn,nameAr}, executives[], boardMembers[] }
operations: { activities[], products[], keyClients[], subsidiaries[], geographicPresence[] }
market: { marketPosition, marketShare, competitors[], strengths[], weaknesses[], opportunities[] }
approach: { bestChannel, bestTiming, entryPoint, valueProp, openingAngle, potentialObjections[], culturalNotes, sampleMessage }
news[]: { title, date, summary, source }
intelligence: { confidenceScore (0-100), dataQuality ("high"|"medium"|"low"), verifiedFacts[], estimatedFacts[], caveats, dataSources[] }
executiveSummary: 2-3 paragraph English summary

Tailor approach.sampleMessage to the seller_context.`,
    fallback: { ...EMPTY_REPORT, profile: { ...EMPTY_REPORT.profile, nameEn: input.companyName, website: websiteUrl, crNumber: input.crNumber ?? null, city: input.city ?? null } },
    preferredProvider: "anthropic",
    maxTokens: 5000,
  });

  if (provider !== "fallback") sourcesUsed.push(`synthesis:${provider}`);
  report.intelligence.dataSources = Array.from(new Set([...(report.intelligence.dataSources ?? []), ...sourcesUsed]));

  return { report, sourcesUsed };
}
