/**
 * ProsEngine — Company Intelligence (upgraded 11-agent spec).
 *
 * Agent breakdown:
 *   Perplexity ×4  — profile/contact, financials, ownership, leadership (via OpenRouter)
 *   Gemini ×4      — direct grounded: profile, ownership, leadership, competitive
 *   Claude ×1      — training-data knowledge synthesis
 *   GPT-4o ×1      — cross-reference and gap fill
 *   Website crawl  — Cheerio + Crawl4AI sidecar for JS-heavy pages
 *   Apollo         — firmographic data (skip-if-no-key)
 *   Explorium      — additional company data (skip-if-no-key)
 *
 * Synthesis: DeepSeek (step 0, if key set) → Gemini JSON → Claude → GPT-4o-mini waterfall.
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
    return { ok: true, text: text.slice(0, 8000), note: "crawl4ai sidecar" };
  } catch (e: any) {
    return { ok: false, text: "", note: e?.message ?? "sidecar offline" };
  }
}

async function apolloCompanyLookup(companyName: string): Promise<string> {
  const key = process.env.APOLLO_API_KEY;
  if (!key) return "";
  try {
    const resp = await fetch("https://api.apollo.io/v1/organizations/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": key },
      body: JSON.stringify({ q_organization_name: companyName, per_page: 3 }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!resp.ok) return "";
    const data = await resp.json() as { organizations?: unknown[] };
    if (!data.organizations?.length) return "";
    const org = data.organizations[0] as Record<string, unknown>;
    return JSON.stringify({
      name: org.name,
      domain: org.primary_domain,
      industry: org.industry,
      founded_year: org.founded_year,
      employee_count: org.num_employees,
      revenue: org.annual_revenue,
      city: org.city,
      country: org.country,
      description: org.short_description,
      linkedin: org.linkedin_url,
    });
  } catch { return ""; }
}

async function exploriumCompanyLookup(companyName: string, domain?: string): Promise<string> {
  const key = process.env.EXPLORIUM_API_KEY;
  if (!key) return "";
  try {
    const body: Record<string, string> = { company_name: companyName, country: "Saudi Arabia" };
    if (domain) body.domain = domain;
    const resp = await fetch("https://app.explorium.ai/api/bundle/v1/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    if (!resp.ok) return "";
    const data = await resp.json() as Record<string, unknown>;
    return JSON.stringify(data);
  } catch { return ""; }
}

export async function runCompanyIntel(input: CompanyIntelInput): Promise<{ report: CompanyIntelReport; sourcesUsed: string[] }> {
  const crRef = input.crNumber ? ` (CR: ${input.crNumber})` : "";
  const cityRef = input.city ? `, ${input.city}` : "";
  const ctx = `${input.companyName}${crRef}${cityRef}`;
  logger.info({ scope: "company_intel", company: input.companyName }, "starting Company Intel (upgraded 11-agent)");

  // ── Resolve website URL
  let websiteUrl = input.website ?? null;
  if (!websiteUrl) {
    const guessed = await aiFindDomain({ company: input.companyName });
    if (guessed) websiteUrl = guessed.startsWith("http") ? guessed : `https://${guessed}`;
  }

  // ── Website crawl (Cheerio + Crawl4AI fallback)
  const crawlPromise = (async () => {
    if (!websiteUrl) return { ok: false, text: "", emails: [] as string[], phone: "", note: "no website" };
    const r = await scraperFetch(websiteUrl, "cheerio");
    let text = (r.text ?? "").slice(0, 8000);
    let emails = extractEmails(text);
    if (!r.ok || text.length < 400) {
      const sc = await tryCrawl4ai(websiteUrl);
      if (sc.ok) { text = sc.text; emails = extractEmails(text); }
    }
    const phoneMatch = text.match(/\+?\d[\d\s().-]{7,}\d/);
    return { ok: text.length > 200, text, emails, phone: phoneMatch?.[0] ?? "", note: r.error ?? "" };
  })();

  // ── Apollo + Explorium (parallel, skip-if-no-key)
  const apolloPromise = apolloCompanyLookup(input.companyName);
  const exploriumPromise = exploriumCompanyLookup(input.companyName, websiteUrl?.replace(/^https?:\/\//, "").split("/")[0]);

  // ── 10 AI agents in parallel
  const agents = fanOut([
    {
      name: "gemini_profile",
      run: () => searchGrounded(
        `Full company profile for "${ctx}" Saudi Arabia: official website, phone number, email address, street address, CR number, paid-up capital (SAR), employee count, revenue estimate, founding year, legal form, industry sector, main business activities. Include Arabic company name if known.`
      ),
    },
    {
      name: "gemini_ownership",
      run: () => searchGrounded(
        `Ownership and shareholders of "${ctx}" Saudi Arabia: list ALL shareholders with English and Arabic full names and exact ownership percentages. Search mc.gov.sa, emagazine.aamaly.sa, Saudi company registry, and news sources. Include any parent company or holding group.`
      ),
    },
    {
      name: "gemini_leadership",
      run: () => searchGrounded(
        `Leadership team of "${ctx}" Saudi Arabia: CEO / Managing Director, Board Chairman, CFO, COO, and all board members — full names in English AND Arabic, exact titles, appointment years. Search LinkedIn, Saudi business directories, news.`
      ),
    },
    {
      name: "gemini_competitive",
      run: () => searchGrounded(
        `Competitive intelligence on "${ctx}" Saudi Arabia: market position, market share estimate, key clients, notable projects, main competitors with names, recent news 2024-2025, Vision 2030 alignment, growth signals.`
      ),
    },
    {
      name: "pplx_profile",
      run: () => searchWeb(
        `"${input.companyName}" Saudi Arabia${cityRef} company profile: address, phone, email, website, year founded, CR number, main activities, description.`,
        2000
      ),
    },
    {
      name: "pplx_financials",
      run: () => searchWeb(
        `"${input.companyName}" Saudi Arabia financial intelligence: annual revenue SAR, profit, paid-up capital رأس المال, employee count, headcount growth, recent funding or investment rounds 2022 2023 2024 2025.`,
        1500
      ),
    },
    {
      name: "pplx_ownership",
      run: () => searchWeb(
        `"${input.companyName}" Saudi Arabia shareholders مساهمون ownership percentage عقد التأسيس النظام الأساسي board composition — names in Arabic and English with exact percentages.`,
        1500
      ),
    },
    {
      name: "pplx_leadership",
      run: () => searchWeb(
        `"${input.companyName}" Saudi Arabia CEO مدير عام managing director chairman رئيس مجلس الإدارة board members executives — full names Arabic and English, titles, 2024 2025.`,
        1500
      ),
    },
    {
      name: "claude_knowledge",
      run: () => synthesizeClaude({
        system: "You are an elite GCC corporate intelligence analyst. Extract ALL facts you know from training data about this company. Be specific: ownership percentages, executive names (EN+AR), revenue figures, founding year, main activities. Say 'unknown' rather than fabricate.",
        user: `From your training data, what do you know about "${ctx}"? Cover: ownership structure with shareholder names and percentages, CEO and executive team (English + Arabic names), revenue and financials, market position, key clients, competitors, products/services, founding story, and recent developments.`,
        maxTokens: 2500,
      }),
    },
    {
      name: "gpt_knowledge",
      run: () => synthesizeGpt({
        system: "You are a Saudi Arabia corporate intelligence analyst. Provide specific, verified facts from your training data. Never hallucinate names or numbers — say 'unknown' instead.",
        user: `What do you know about "${ctx}"? Provide: ownership (shareholders with %), CEO and board members (EN+AR names), revenue estimates, employee count, key clients, main competitors, products, headquarters, industry sector.`,
        maxTokens: 2000,
      }),
    },
  ], 22_000);

  const [agentResults, crawlR, apolloText, exploriumText] = await Promise.all([agents, crawlPromise, apolloPromise, exploriumPromise]);

  const sourcesUsed = agentResults.filter((r) => r.ok).map((r) => r.name);
  if (crawlR.ok) sourcesUsed.push("crawl_website");
  if (apolloText) sourcesUsed.push("apollo");
  if (exploriumText) sourcesUsed.push("explorium");

  const bundle = [
    crawlR.ok
      ? `## crawl_website (${websiteUrl})\n${crawlR.text}${crawlR.emails.length ? "\nEmails: " + crawlR.emails.join(", ") : ""}${crawlR.phone ? "\nPhone candidate: " + crawlR.phone : ""}`
      : "",
    apolloText ? `## apollo_firmographic\n${apolloText}` : "",
    exploriumText ? `## explorium_firmographic\n${exploriumText}` : "",
    ...agentResults.filter((r) => r.ok && r.value).map((r) => `## ${r.name}\n${r.value}`),
  ].filter(Boolean).join("\n\n");

  const { data: report, provider } = await synthesizeJson<CompanyIntelReport>({
    system: "You synthesize multi-source corporate intelligence into a strict JSON dossier. Return valid JSON matching the schema exactly. Use null/'' for missing scalars, [] for missing arrays — never omit keys. Mark estimates clearly in intelligence.estimatedFacts. Never fabricate ownership percentages or executive names.",
    user: `Company: ${input.companyName}
Website: ${websiteUrl ?? "(unknown)"}
CR: ${input.crNumber ?? "(unknown)"}
City: ${input.city ?? "(unknown)"}
Known facts: ${input.knownFacts ?? "(none)"}
Seller context: ${JSON.stringify(input.sellerContext ?? {})}

Multi-source research (${sourcesUsed.length} sources):
${bundle.slice(0, 14000)}

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
    fallback: {
      ...EMPTY_REPORT,
      profile: { ...EMPTY_REPORT.profile, nameEn: input.companyName, website: websiteUrl, crNumber: input.crNumber ?? null, city: input.city ?? null },
    },
    preferredProvider: "gemini",
    maxTokens: 3500,
  });

  if (provider !== "fallback") sourcesUsed.push(`synthesis:${provider}`);
  report.intelligence.dataSources = Array.from(new Set([...(report.intelligence.dataSources ?? []), ...sourcesUsed]));

  return { report, sourcesUsed };
}
