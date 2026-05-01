/**
 * Lead Finder — discover real leads at a company by name.
 *
 * 10-agent parallel pipeline:
 *   Perplexity ×3  — leadership / org-chart / board (live web search)
 *   Gemini ×5      — direct REST: recent-hires, LinkedIn, dossier, GCC knowledge, Arabic names
 *   Claude ×1      — knowledge synthesis
 *   GPT-4o-mini ×1 — training-data cross-reference
 *
 * Web scrapers (all run in parallel with AI agents):
 *   Cheerio    — static HTML team/leadership pages
 *   Playwright — JS-rendered pages (auto-fallback to Cheerio if browser unavailable)
 *   Crawl4AI   — Python sidecar deep-extraction (via shared proxy: localhost:80/scraper)
 *
 * Synthesis: Direct Gemini JSON → Claude → GPT-4o-mini (waterfall).
 */

import { fanOut, searchWeb, searchGrounded, synthesizeClaude, synthesizeGeminiDirect, synthesizeJson } from "./_ai.js";
import { scraperFetch, extractEmails } from "../enrichment/connectors/web-scraper.js";
import { aiFindDomain } from "../enrichment/connectors/openrouter-ai.js";
import { aiGeminiChat } from "../ai.js";
import { fetchJSON } from "../enrichment/connectors/_common.js";
import { logger } from "../logger.js";
import type { LeadFinderInput, LeadFinderReport, DiscoveredLead } from "./types.js";

// The Python enrichment sidecar listens on port 8000 in dev (PORT env var fallback).
// In production / custom deploys set ENRICHMENT_SCRAPER_URL to the internal service address.
const SCRAPER_URL = process.env["ENRICHMENT_SCRAPER_URL"] ?? "http://localhost:8000/scraper";

const COMMON_TEAM_PATHS = [
  "/about", "/about-us", "/team", "/our-team", "/leadership",
  "/people", "/management", "/executives", "/board",
  "/en/about", "/en/team", "/en/leadership",
  "/ar/about", "/ar/team", "/ar/leadership",
  "/who-we-are", "/company", "/corporate",
];

async function crawlTeamPages(websiteUrl: string): Promise<{ texts: string[]; emails: string[]; tried: string[] }> {
  const texts: string[] = [];
  const emails = new Set<string>();
  const tried: string[] = [];
  const base = websiteUrl.replace(/\/$/, "");

  // Try homepage + top team paths in parallel (cheerio = fast static)
  const candidates = [base, ...COMMON_TEAM_PATHS.map((p) => base + p)].slice(0, 10);

  await Promise.all(candidates.map(async (url) => {
    tried.push(url);
    try {
      const r = await scraperFetch(url, "cheerio");
      if (r.ok && r.text && r.text.length > 300) {
        texts.push(`### cheerio ${url}\n${r.text.slice(0, 3000)}`);
        for (const e of extractEmails(r.text)) emails.add(e);
      }
    } catch { /* ignore */ }
  }));

  // Try Playwright (JS-rendered) on the /team and /leadership pages
  for (const path of ["/team", "/our-team", "/leadership", "/about-us"]) {
    try {
      const url = base + path;
      const r = await scraperFetch(url, "playwright");
      if (r.ok && r.text && r.text.length > 300 && !texts.some(t => t.includes(url))) {
        texts.push(`### playwright ${url}\n${r.text.slice(0, 4000)}`);
        for (const e of extractEmails(r.text)) emails.add(e);
      }
    } catch { /* ignore */ }
  }

  // Try Crawl4AI sidecar on leadership page (deep JS extraction via Python)
  for (const path of ["/leadership", "/team", "/about-us", "/"]) {
    try {
      const sc = await fetchJSON<{ ok: boolean; text?: string }>(
        `${SCRAPER_URL}/extract`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: base + path, mode: "crawl4ai", respect_robots: true, timeout_seconds: 10 }),
        },
        15_000,
      );
      if (sc.ok && sc.data?.ok && sc.data.text) {
        texts.push(`### crawl4ai ${base}${path}\n${sc.data.text.slice(0, 4000)}`);
        for (const e of extractEmails(sc.data.text)) emails.add(e);
        break; // one successful crawl4ai pass is enough
      }
    } catch { /* ignore — sidecar optional */ }
  }

  // Also try BeautifulSoup (bs4) via sidecar for homepage structured data
  try {
    const sc = await fetchJSON<{ ok: boolean; structured?: { emails?: string[]; company_name?: string }; text?: string }>(
      `${SCRAPER_URL}/extract`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: base, mode: "bs4", respect_robots: true, timeout_seconds: 8 }),
      },
      12_000,
    );
    if (sc.ok && sc.data?.ok) {
      if (sc.data.structured?.emails?.length) {
        for (const e of sc.data.structured.emails) emails.add(e);
      }
      if (sc.data.text && !texts.some(t => t.includes("bs4 " + base))) {
        texts.push(`### bs4 ${base}\n${sc.data.text.slice(0, 2000)}`);
      }
    }
  } catch { /* ignore */ }

  return { texts, emails: Array.from(emails), tried };
}

export async function findLeadsByCompany(input: LeadFinderInput): Promise<{ report: LeadFinderReport; sourcesUsed: string[] }> {
  const company = input.companyName.trim();
  const country = input.country ?? "Saudi Arabia";
  const count = Math.max(1, Math.min(25, input.count ?? 10));
  const wantedRoles = input.rolesWanted?.length
    ? input.rolesWanted.join(", ")
    : "CEO, CFO, CTO, COO, Chief Sales Officer, VP Sales, VP Marketing, VP Engineering, Head of Procurement, Head of HR, board members";

  logger.info({ scope: "lead_finder", company, count }, "starting Lead Finder");

  // ── Resolve website
  let websiteUrl = input.website ?? null;
  if (!websiteUrl) {
    try {
      // Try Gemini direct first (reliable), then Perplexity
      const geminiDomain = await aiGeminiChat({
        system: "Return ONLY the official website hostname of the company — no protocol, no path, no quotes. Example: stc.com.sa. If unknown return UNKNOWN.",
        messages: [{ role: "user", text: `Official website hostname for "${company}" in ${country}?` }],
        maxTokens: 60,
      });
      const cleaned = geminiDomain?.trim().split(/\s+/)[0]?.toLowerCase()
        .replace(/^https?:\/\//, "").replace(/\/.*/, "");
      if (cleaned && cleaned !== "unknown" && /\./.test(cleaned)) {
        websiteUrl = `https://${cleaned}`;
      }
    } catch {}
    if (!websiteUrl) {
      const guessed = await aiFindDomain({ company, country });
      if (guessed) websiteUrl = guessed.startsWith("http") ? guessed : `https://${guessed}`;
    }
  }
  logger.info({ scope: "lead_finder", company, websiteUrl }, "resolved website");

  const crawlPromise = websiteUrl
    ? crawlTeamPages(websiteUrl)
    : Promise.resolve({ texts: [] as string[], emails: [] as string[], tried: [] as string[] });

  // ── 10 parallel AI research agents
  const agents = fanOut([
    // Perplexity: live web search (best for real-time org charts)
    {
      name: "pplx_leadership",
      run: () => searchWeb(
        `Current senior leadership team at ${company}${input.city ? " in " + input.city : ""}, ${country}. ` +
        `List ${wantedRoles}. For each: full name (English + Arabic if available), exact title, LinkedIn URL if known, email if public.`
      ),
    },
    {
      name: "pplx_org_chart",
      run: () => searchWeb(
        `Organizational chart and department heads at ${company} in ${country}: VPs, Directors, Heads of department. Include function and reporting structure.`
      ),
    },
    {
      name: "pplx_board",
      run: () => searchWeb(
        `Board of directors, chairman, and independent directors of ${company} in ${country}. Include major shareholder representatives.`
      ),
    },
    // Direct Gemini: proven reliable in this environment
    {
      name: "gemini_leadership_direct",
      run: () => searchGrounded(
        `Who are the current C-suite executives, VP-level and Director-level leaders at ${company} in ${country}? ` +
        `List their full names (in English and Arabic where possible), titles, LinkedIn profiles if known, and any known contact information. ` +
        `Focus on: ${wantedRoles}.`
      ),
    },
    {
      name: "gemini_recent_hires",
      run: () => searchGrounded(
        `Recent executive hires, promotions, and appointments at ${company} in 2024-2026. ` +
        `Include names, new titles, and sources (LinkedIn, press releases).`
      ),
    },
    {
      name: "gemini_arabic_intel",
      run: () => searchGrounded(
        `Arabic-language intelligence on ${company} leadership in ${country}. ` +
        `List executive names in Arabic script and their roles. Source from Arabic business news, Tadawul announcements, or Saudi Gazette.`
      ),
    },
    {
      name: "gemini_linkedin_discovery",
      run: () => searchGrounded(
        `Find LinkedIn profiles of senior employees at ${company}. ` +
        `List full names and direct linkedin.com/in/ URLs. Include C-suite, VPs, and Directors.`
      ),
    },
    {
      name: "gemini_company_dossier",
      run: () => searchGrounded(
        `Comprehensive profile of ${company} in ${country}: ownership structure, subsidiaries, key business units, ` +
        `major clients, recent contracts, government relationships, and key contacts.`
      ),
    },
    // Claude: training-data knowledge
    {
      name: "claude_knowledge",
      run: () => synthesizeClaude({
        system: "You are a B2B sales intelligence analyst with deep GCC and Saudi Arabia market knowledge.",
        user: `From your training data, list every named senior employee you know of at ${company} in ${country}. ` +
          `For each: full name (English + Arabic), title, when they joined if known. ` +
          `Also list any known board members and major shareholders. ` +
          `Say "I don't have specific named employees" rather than fabricate. Be specific.`,
        maxTokens: 1500,
      }),
    },
    // Gemini: direct synthesis of company intel
    {
      name: "gemini_synthesis",
      run: () => synthesizeGeminiDirect({
        system: "You are an expert GCC/MENA B2B intelligence analyst with comprehensive knowledge of major corporations in Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, and Oman.",
        user: `List all named senior executives, C-suite, VPs, Directors, and board members you know of at ${company} in ${country}. ` +
          `For each person include: full name in English, full name in Arabic if known, exact title, department, approximate tenure, LinkedIn URL if known. ` +
          `Include confidence level (high/medium/low) per person. Do not fabricate — if uncertain, mark as "estimated".`,
        maxTokens: 2000,
      }),
    },
  ], 50_000);

  const [agentResults, crawlR] = await Promise.all([agents, crawlPromise]);

  const sourcesUsed = agentResults.filter((r) => r.ok && r.value).map((r) => r.name);
  if (crawlR.texts.length > 0) sourcesUsed.push(`crawl_website(${crawlR.tried.length}_paths)`);

  const bundle = [
    crawlR.texts.length
      ? `## website_crawl (cheerio + playwright + crawl4ai + bs4)\n${crawlR.texts.join("\n\n")}\nDiscovered emails: ${crawlR.emails.join(", ") || "(none)"}`
      : "",
    ...agentResults.filter((r) => r.ok && r.value).map((r) => `## ${r.name}\n${r.value}`),
  ].filter(Boolean).join("\n\n");

  logger.info({ scope: "lead_finder", company, bundleLength: bundle.length, sourcesUsed }, "bundle assembled — synthesizing");

  // ── Synthesis: Direct Gemini → Claude → GPT (waterfall)
  const fallback: LeadFinderReport = {
    company: { name: company, website: websiteUrl, city: input.city ?? null },
    leads: [],
    byDepartment: {},
    bySeniority: {},
    totalFound: 0,
    sourcesQueried: sourcesUsed,
    recommendations: {
      bestEntryPoints: [],
      decisionMakers: [],
      blockers: [],
      suggestedSequence: "",
    },
    generatedAt: new Date().toISOString(),
  };

  const { data, provider } = await synthesizeJson<LeadFinderReport>({
    system:
      "You consolidate multi-source intelligence into a deduplicated, ranked list of real named leads at a single company. " +
      "Return ONLY valid JSON — no markdown, no explanation. " +
      "Never fabricate names — only include people explicitly mentioned in the research bundle. " +
      "If two sources mention the same person, merge them and pick the most authoritative title. " +
      "Confidence rules: name+email+LinkedIn=high, name from official website=high, name from news/press=medium, name from AI training data=low.",
    user: `Company: ${company}
Website: ${websiteUrl ?? "(unknown)"}
Country: ${country}
City: ${input.city ?? "(unknown)"}
Roles wanted: ${wantedRoles}
Target lead count: ${count}

Multi-source research bundle:
${bundle.slice(0, 28000)}

Discovered emails (attach to matching persons, infer pattern for others): ${crawlR.emails.join(", ") || "(none)"}

Return JSON with EXACTLY these keys:
{
  "company": { "name": "...", "website": "...", "city": "..." },
  "leads": [
    {
      "fullName": "...",
      "arabicName": "... (optional)",
      "title": "...",
      "department": "Sales|Engineering|Finance|Operations|HR|Legal|Marketing|Board|Other",
      "seniority": "C-suite|VP|Director|Manager|Individual",
      "linkedinUrl": "... (optional)",
      "email": "... (optional)",
      "phone": "... (optional)",
      "source": "which agent surfaced this person",
      "confidence": "high|medium|low",
      "notes": "... (optional 1-line context)"
    }
  ],
  "byDepartment": { "<dept>": <count> },
  "bySeniority": { "<level>": <count> },
  "totalFound": <integer>,
  "sourcesQueried": ["..."],
  "recommendations": {
    "bestEntryPoints": ["<2-4 names + why they are the best entry point>"],
    "decisionMakers": ["<names of actual budget owners / decision makers>"],
    "blockers": ["<gatekeepers, EAs, or blockers to be aware of>"],
    "suggestedSequence": "<3-5 step multi-touch outreach sequence specific to this company>"
  },
  "generatedAt": "<ISO timestamp>"
}

Rank leads: decision makers first, then influencers, then ICs. Aim for ${count} leads. Include only real named people from the research bundle — do not invent.`,
    fallback,
    preferredProvider: "anthropic",
    maxTokens: 6000,
  });

  if (provider !== "fallback") sourcesUsed.push(`synthesis:${provider}`);

  // Recompute aggregates if synthesizer omitted them
  if (!data.byDepartment || Object.keys(data.byDepartment).length === 0) {
    const byDept: Record<string, number> = {};
    const bySen: Record<string, number> = {};
    for (const l of data.leads ?? []) {
      const d = (l as DiscoveredLead).department ?? "Other";
      byDept[d] = (byDept[d] ?? 0) + 1;
      const s = (l as DiscoveredLead).seniority ?? "Individual";
      bySen[s] = (bySen[s] ?? 0) + 1;
    }
    data.byDepartment = byDept;
    data.bySeniority = bySen;
  }
  data.totalFound = (data.leads ?? []).length;
  data.sourcesQueried = Array.from(new Set([...(data.sourcesQueried ?? []), ...sourcesUsed]));
  data.generatedAt = data.generatedAt || new Date().toISOString();
  data.company = data.company || { name: company, website: websiteUrl, city: input.city ?? null };

  logger.info({ scope: "lead_finder", company, totalFound: data.totalFound, provider }, "Lead Finder complete");

  return { report: data, sourcesUsed };
}
