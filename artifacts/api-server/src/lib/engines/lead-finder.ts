/**
 * Lead Finder — discover real leads at a company by name.
 *
 * NEW feature (no original spec) — fills the user's primary need:
 * "give me a company name → fetch likely leads / employees".
 *
 * Approach:
 *   1. Resolve the company website (provided or AI-guessed).
 *   2. Crawl the site's About/Team/Leadership pages with Cheerio + Playwright.
 *   3. Run 6 parallel research agents through OpenRouter:
 *        - Perplexity ×3 — leadership team / department heads / org chart
 *        - Gemini ×2     — recent hires / LinkedIn discovery
 *        - Claude ×1     — knowledge synthesis from training data
 *   4. Optional Crawl4AI sidecar pass on the website.
 *   5. Claude synthesizes a deduplicated, ranked LeadFinderReport with
 *      actionable best-entry-point recommendations and a multi-touch sequence.
 *
 * Confidence is set by source:
 *   - Names with email + LinkedIn → high
 *   - Names from official site or AOA → high
 *   - Names from news/press         → medium
 *   - AI-only inferred              → low
 */

import { fanOut, searchWeb, searchGrounded, synthesizeClaude, synthesizeJson } from "./_ai.js";
import { scraperFetch, extractEmails } from "../enrichment/connectors/web-scraper.js";
import { aiFindDomain } from "../enrichment/connectors/openrouter-ai.js";
import { fetchJSON } from "../enrichment/connectors/_common.js";
import { logger } from "../logger.js";
import type { LeadFinderInput, LeadFinderReport, DiscoveredLead } from "./types.js";

const SCRAPER_URL = process.env["ENRICHMENT_SCRAPER_URL"] ?? "http://localhost:8000/scraper";

const COMMON_TEAM_PATHS = [
  "/about", "/about-us", "/team", "/our-team", "/leadership",
  "/people", "/management", "/executives", "/board",
  "/ar/about", "/ar/team", "/ar/leadership",
];

async function crawlTeamPages(websiteUrl: string): Promise<{ texts: string[]; emails: string[]; tried: string[] }> {
  const texts: string[] = [];
  const emails = new Set<string>();
  const tried: string[] = [];
  const base = websiteUrl.replace(/\/$/, "");
  // Always try the homepage first
  const candidates = [base, ...COMMON_TEAM_PATHS.map((p) => base + p)];

  await Promise.all(candidates.slice(0, 8).map(async (url) => {
    tried.push(url);
    try {
      const r = await scraperFetch(url, "cheerio");
      if (r.ok && r.text && r.text.length > 200) {
        texts.push(`### ${url}\n${r.text.slice(0, 3000)}`);
        for (const e of extractEmails(r.text)) emails.add(e);
      }
    } catch { /* ignore */ }
  }));

  // Try Crawl4AI on the leadership page if we got nothing useful
  if (texts.length < 2) {
    try {
      const sc = await fetchJSON<{ ok: boolean; text?: string }>(`${SCRAPER_URL}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: base + "/leadership", mode: "crawl4ai", respect_robots: true }),
      }).catch(() => ({ ok: false, status: 0, data: null }) as { ok: boolean; status: number; data: { ok: boolean; text?: string } | null });
      if (sc.ok && sc.data?.ok && sc.data.text) {
        texts.push(`### crawl4ai ${base}/leadership\n${sc.data.text.slice(0, 4000)}`);
        for (const e of extractEmails(sc.data.text)) emails.add(e);
      }
    } catch { /* ignore */ }
  }

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
    const guessed = await aiFindDomain({ company });
    if (guessed) websiteUrl = guessed.startsWith("http") ? guessed : `https://${guessed}`;
  }

  const crawlPromise = websiteUrl
    ? crawlTeamPages(websiteUrl)
    : Promise.resolve({ texts: [] as string[], emails: [] as string[], tried: [] as string[] });

  // ── 6 research agents
  const agents = fanOut([
    { name: "pplx_leadership",   run: () => searchWeb(`Current senior leadership team at ${company}${input.city ? " in " + input.city : ""}, ${country}. List ${wantedRoles}. For each person give: full name (English + Arabic if available), exact title, LinkedIn URL if known, email if public.`) },
    { name: "pplx_org_chart",    run: () => searchWeb(`Department heads and middle management at ${company}: VPs, Directors, Heads of department. Include their function and reporting line if known.`) },
    { name: "pplx_board",        run: () => searchWeb(`Board of directors and chairman of ${company}. Include independent directors and major shareholder representatives.`) },
    { name: "gemini_recent_hires", run: () => searchGrounded(`Recent hires and appointments at ${company} in 2025-2026. Press releases, LinkedIn announcements.`) },
    { name: "gemini_linkedin",   run: () => searchGrounded(`Find LinkedIn profiles of senior employees at ${company}. List names and direct LinkedIn URLs.`) },
    { name: "claude_knowledge",  run: () => synthesizeClaude({
      system: "You are a B2B sales intelligence analyst with deep GCC market knowledge.",
      user: `From your training data, list every named senior employee you know of at ${company} (${country}). For each: full name, title, when they joined if known. Mark any uncertain entries. Say "I don't have specific named employees" rather than fabricate.`,
      maxTokens: 1500,
    }) },
  ], 45_000);

  const [agentResults, crawlR] = await Promise.all([agents, crawlPromise]);

  const sourcesUsed = agentResults.filter((r) => r.ok).map((r) => r.name);
  if (crawlR.texts.length > 0) sourcesUsed.push("crawl_website_team_pages");

  const bundle = [
    crawlR.texts.length ? `## website_team_pages\n${crawlR.texts.join("\n\n")}\nDiscovered emails: ${crawlR.emails.join(", ") || "(none)"}` : "",
    ...agentResults.filter((r) => r.ok && r.value).map((r) => `## ${r.name}\n${r.value}`),
  ].filter(Boolean).join("\n\n");

  // ── Synthesis: dedupe + rank + recommend
  const fallback: LeadFinderReport = {
    company: { name: company, website: websiteUrl, city: input.city ?? null },
    leads: [],
    byDepartment: {},
    bySeniority: {},
    totalFound: 0,
    sourcesQueried: sourcesUsed,
    recommendations: { bestEntryPoints: [], decisionMakers: [], blockers: [], suggestedSequence: "" },
    generatedAt: new Date().toISOString(),
  };

  const { data, provider } = await synthesizeJson<LeadFinderReport>({
    system: "You consolidate multi-source research into a deduplicated, ranked list of real named leads at a single company. Always return valid JSON. Never fabricate names — only include people explicitly mentioned across the research bundle. If two sources mention the same person, merge them and pick the most authoritative title. Confidence rules: name+email+LinkedIn=high, name from official website=high, name from news=medium, name only from AI training data=low.",
    user: `Company: ${company}
Website: ${websiteUrl ?? "(unknown)"}
Country: ${country}
City: ${input.city ?? "(unknown)"}
Roles wanted: ${wantedRoles}
Target lead count: ${count}

Multi-source research bundle:
${bundle.slice(0, 24000)}

Discovered emails (use to attach to matching person, infer pattern for others): ${crawlR.emails.join(", ") || "(none)"}

Return JSON with EXACTLY these keys:
{
  "company": { "name", "website", "city" },
  "leads": [
    {
      "fullName", "arabicName" (optional), "title", "department" (e.g. Sales/Engineering/Finance),
      "seniority" ("C-suite"|"VP"|"Director"|"Manager"|"Individual"),
      "linkedinUrl" (optional), "email" (optional), "phone" (optional),
      "source" (which agent surfaced this, e.g. "crawl_website" or "pplx_leadership"),
      "confidence" ("high"|"medium"|"low"),
      "notes" (optional 1-line context)
    }
  ],
  "byDepartment": { "<dept>": <count> },
  "bySeniority": { "<level>": <count> },
  "totalFound": <integer>,
  "sourcesQueried": [<list of agent names that returned data>],
  "recommendations": {
    "bestEntryPoints": [<2-4 lead names + why>],
    "decisionMakers": [<actual budget owners>],
    "blockers": [<gatekeepers / EAs to navigate>],
    "suggestedSequence": "<3-5 step multi-touch outreach plan, specific to this company>"
  },
  "generatedAt": "<ISO timestamp>"
}

Rank leads by usefulness for B2B outreach (decision makers first, then influencers, then individual contributors). Aim for ${count} leads but never invent — if research only yields fewer real names, return fewer.`,
    fallback,
    preferredProvider: "anthropic",
    maxTokens: 5500,
  });

  if (provider !== "fallback") sourcesUsed.push(`synthesis:${provider}`);

  // Defensive: if synthesizer ignored fields, recompute aggregates
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

  return { report: data, sourcesUsed };
}
