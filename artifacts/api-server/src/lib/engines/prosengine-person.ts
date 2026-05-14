/**
 * ProsEngine — Person Intelligence (full 20-agent spec).
 *
 * Agent breakdown:
 *   Perplexity ×9  — career, company, education, wealth, boards, compensation,
 *                    personal, news, LinkedIn URL (via OpenRouter live-web search)
 *   Gemini ×4      — grounded: career history, social/LinkedIn, company news, full dossier
 *   Claude ×1      — training-data knowledge base
 *   GPT-4o ×1      — training-data cross-reference and gap fill
 *   LinkedIn crawl — via Crawl4AI sidecar (if URL provided or discovered)
 *   Website crawl  — Cheerio + Crawl4AI (if company website URL provided)
 *   Apollo         — person lookup (skip-if-no-key)
 *   Explorium      — person lookup (skip-if-no-key)
 *   DeepResearch   — o4-mini deep research (runs after parallel batch, if configured)
 *
 * Synthesis: DeepSeek (step 0) → Gemini JSON → Claude → GPT-4o waterfall.
 */

import { fanOut, searchWeb, searchGrounded, synthesizeClaude, synthesizeGpt, synthesizeJson } from "./_ai.js";
import { scraperFetch, extractEmails } from "../enrichment/connectors/web-scraper.js";
import { fetchJSON } from "../enrichment/connectors/_common.js";
import { logger } from "../logger.js";
import type { PersonIntelInput, PersonIntelReport } from "./types.js";

const EMPTY_PERSON: PersonIntelReport = {
  profile: {
    fullName: "", arabicName: "Not found", title: "", company: "",
    nationality: "", location: "", age: null, linkedin: "Not found",
  },
  career: [],
  education: [],
  company_analysis: {
    name: "", industry: "", founded: "", headquarters: "", employees: "",
    revenue_estimate: "", performance: "", market_position: "",
    key_clients: [], recent_developments: "", competitors: [], pain_points: [],
  },
  wealth_profile: {
    estimated_net_worth: "", income_estimate: "", wealth_sources: [],
    assets: "", investments: "", lifestyle_indicators: "",
  },
  personal_profile: {
    interests: [], personality_traits: [], communication_style: "",
    languages: [], board_memberships: [], publications: [],
    awards: [], social_presence: "",
  },
  approach_strategy: {
    best_channel: "", best_timing: "", opening_angle: "",
    value_proposition: "", potential_objections: [],
    conversation_starters: [], cultural_notes: "",
    recommended_approach: "", sample_message: "",
  },
  intelligence_notes: {
    confidence_level: "Low",
    data_sources: [], verified_facts: [], estimated_facts: [],
    caveats: "Synthesis incomplete — see individual agent outputs.",
  },
};

const SCRAPER_URL = process.env["ENRICHMENT_SCRAPER_URL"] ?? "http://localhost:8000/scraper";

async function crawl4aiText(url: string): Promise<string> {
  try {
    const r = await fetchJSON<{ ok: boolean; text?: string }>(`${SCRAPER_URL}/extract`, {
      method: "POST",
      body: JSON.stringify({ url, mode: "crawl4ai", respect_robots: true }),
      headers: { "Content-Type": "application/json" },
    });
    return r.data?.ok && r.data.text ? r.data.text.slice(0, 6000) : "";
  } catch { return ""; }
}

async function apolloPersonLookup(name: string, company?: string): Promise<string> {
  const key = process.env.APOLLO_API_KEY;
  if (!key) return "";
  try {
    const body: Record<string, unknown> = { q_person_name: name, per_page: 5 };
    if (company) body.q_organization_name = company;
    const resp = await fetch("https://api.apollo.io/v1/people/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    if (!resp.ok) return "";
    const data = await resp.json() as { people?: unknown[] };
    if (!data.people?.length) return "";
    const p = data.people[0] as Record<string, unknown>;
    return JSON.stringify({
      name: p.name, title: p.title, email: p.email,
      phone: (p.phone_numbers as Array<Record<string, unknown>>)?.[0]?.sanitized_number,
      linkedin: p.linkedin_url, city: p.city, country: p.country,
      seniority: p.seniority, departments: p.departments,
      employment_history: (p.employment_history as Array<Record<string, unknown>>)?.slice(0, 5),
    });
  } catch { return ""; }
}

async function exploriumPersonLookup(name: string, company?: string): Promise<string> {
  const key = process.env.EXPLORIUM_API_KEY;
  if (!key) return "";
  try {
    const resp = await fetch("https://app.explorium.ai/api/bundle/v1/people", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({ full_name: name, company_name: company, country: "Saudi Arabia" }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!resp.ok) return "";
    const data = await resp.json() as Record<string, unknown>;
    return JSON.stringify(data);
  } catch { return ""; }
}

async function deepResearchPerson(name: string, company?: string, title?: string): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY ?? process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!openaiKey) return "";
  const query = `Comprehensive intelligence dossier on "${name}"${company ? ` at ${company}` : ""}${title ? `, ${title}` : ""} in Saudi Arabia. Research: career history and current role, education background, board memberships, wealth indicators, compensation, personal interests, public statements, recent business activities 2024-2025. Verified public information from Saudi business media, regulatory filings, LinkedIn, and official sources.`;
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a Saudi Arabia B2B intelligence analyst. Provide comprehensive, factual data. Never hallucinate. Mark unverified information as estimated." },
          { role: "user", content: query },
        ],
        max_tokens: 2000,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!resp.ok) return "";
    const d = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
    return d.choices?.[0]?.message?.content ?? "";
  } catch { return ""; }
}

export async function runPersonIntel(
  input: PersonIntelInput,
): Promise<{ report: PersonIntelReport; sourcesUsed: string[] }> {
  const country = input.country ?? "Saudi Arabia";
  const name = input.name;
  const company = input.company;
  const title = input.title;
  const ctx = `${name}${title ? ` (${title})` : ""}${company ? ` at ${company}` : ""}`;
  logger.info({ scope: "person_intel", name, company }, "starting Person Intel (upgraded 20-agent)");

  const sellerCtx = input.sellerContext;
  const sellerObjective = sellerCtx?.objectives?.length ? sellerCtx.objectives.join(" + ") : "book a meeting";
  const sellerSection = sellerCtx?.companyName
    ? `\nSALES CONTEXT:\n- Seller company: ${sellerCtx.companyName}\n- Product/service: ${sellerCtx.product ?? "B2B services"}\n- Objective: ${sellerObjective}`
    : "";

  // ── 16 parallel AI agents (9 Perplexity + 4 Gemini + 2 AI knowledge + Apollo + Explorium + crawls)
  const agents = fanOut(
    [
      // ── PERPLEXITY AGENTS (1-9): live web search threads
      {
        name: "pplx_career",
        run: () => searchWeb(
          `Full professional background and career history of "${name}"${company ? ` at ${company}` : ""}${title ? `, ${title}` : ""} in ${country}. ALL current and past roles with company names, dates, responsibilities, achievements, key business decisions. LinkedIn profile URL if available.`,
          2500
        ),
      },
      {
        name: "pplx_company",
        run: () => searchWeb(
          `Detailed company intelligence for ${company ?? `employer of ${name}`} in ${country}: founding year, founders, shareholders ownership structure, CEO and executive team full names with titles, revenue estimate, employee count, market position, key clients, recent contracts, competitors, Vision 2030 alignment, recent news 2024-2025.`,
          2500
        ),
      },
      {
        name: "pplx_education",
        run: () => searchWeb(
          `Complete education and academic history of "${name}"${company ? ` executive at ${company}` : ""} ${country}: universities attended, degrees earned with field of study, graduation years, scholarships, fellowships, academic awards, international study abroad.`,
          1500
        ),
      },
      {
        name: "pplx_wealth",
        run: () => searchWeb(
          `Wealth profile and financial indicators for "${name}"${company ? ` at ${company}` : ""} ${country}: estimated net worth, company equity stake or shareholding percentage, known property, real estate, investments, board compensation, any public disclosures of financial interest.`,
          1500
        ),
      },
      {
        name: "pplx_board",
        run: () => searchWeb(
          `All board memberships, advisory roles, and governance positions of "${name}"${company ? ` from ${company}` : ""} ${country}: board director of which companies, committee memberships (audit, risk, compensation), government and regulatory advisory positions, non-profit or charity boards.`,
          1500
        ),
      },
      {
        name: "pplx_compensation",
        run: () => searchWeb(
          `Executive compensation benchmarks for ${title ?? "C-suite executive"} at ${company ?? "a Saudi company of this size"}: typical salary range, bonus structure, long-term incentives, equity/stock, LTIP, total compensation package. Include Saudi market benchmarks for this role level.`,
          1000
        ),
      },
      {
        name: "pplx_personal",
        run: () => searchWeb(
          `Personal profile and public presence of "${name}"${company ? ` from ${company}` : ""} ${country}: hobbies, sports, philanthropic causes, public speeches, conference keynotes, media interviews, personality traits, known preferences, social media activity.`,
          1000
        ),
      },
      {
        name: "pplx_news",
        run: () => searchWeb(
          `Latest news, announcements, and public activities about "${name}"${company ? ` at ${company}` : ""} ${country} 2024-2025: business deals, partnerships, conference appearances, LinkedIn posts, awards, promotions, controversies, company news involving this person.`,
          1500
        ),
      },
      {
        name: "pplx_linkedin",
        run: () => searchWeb(
          `LinkedIn profile URL for "${name}"${company ? ` who works at ${company}` : ""}${title ? ` as ${title}` : ""} ${country}. Return the full LinkedIn profile URL: linkedin.com/in/...`,
          500
        ),
      },

      // ── GEMINI GROUNDED AGENTS (A-D): Google Search grounding
      {
        name: "gemini_career",
        run: () => searchGrounded(
          `Research the career and professional history of "${name}"${company ? ` at ${company}` : ""}${title ? `, ${title}` : ""} in ${country}.\n\nFind:\n- All past and current job roles with exact company names, dates (month/year), and responsibilities\n- Education: universities, degrees, graduation years\n- Notable achievements, awards, promotions\n- Shareholding or ownership stakes in any company\n- Board of directors positions (past and present)\n- Government or advisory roles`
        ),
      },
      {
        name: "gemini_social",
        run: () => searchGrounded(
          `Find the LinkedIn profile URL and all social media accounts for "${name}"${company ? ` who works at ${company}` : ""}${title ? ` as ${title}` : ""} in ${country}.\n\nSearch for:\n- LinkedIn profile URL (https://linkedin.com/in/...)\n- Twitter/X profile URL\n- Any public social media accounts\n- Profile photos or public images\n- Direct contact information if publicly available: email, phone.`
        ),
      },
      {
        name: "gemini_news",
        run: () => searchGrounded(
          `Research the latest news and business activities involving "${name}"${company ? ` from ${company}` : ""} in ${country} (2023-2025).\n\nFind:\n- Recent business deals, contracts, tenders won\n- Partnerships or joint ventures announced\n- Conference appearances and keynote speeches\n- Press releases or media interviews\n- Any controversies or public incidents\n- Vision 2030 projects they are involved in\n- Any investment or funding activity`
        ),
      },
      {
        name: "gemini_dossier",
        run: () => searchGrounded(
          `Comprehensive intelligence dossier on "${name}"${company ? ` at ${company}` : ""}${title ? `, ${title}` : ""} in ${country}.\n\nProvide everything you can find:\n- Full career history with all roles, dates, and companies\n- Education (universities, degrees, years)\n- Board memberships and advisory roles\n- LinkedIn profile URL\n- Net worth estimate or equity stake\n- Personal interests, philanthropy, sports\n- Recent news or business activities 2024-2025\n- Public statements, conferences, awards\n- Relationships with government entities or Vision 2030`
        ),
      },

      // ── AI KNOWLEDGE AGENTS (E-F): training-data synthesis
      {
        name: "claude_knowledge",
        run: () => synthesizeClaude({
          system: "You are an elite Saudi Arabia B2B intelligence analyst. Extract ALL facts you know from training data about the requested person. Be specific with dates, companies, titles, and LinkedIn URLs.",
          user: `From your training data, what do you know about "${name}"${company ? ` who works at ${company}` : ""}${title ? ` as ${title}` : ""} in ${country}?\n\nList ALL known facts:\n- Full name in English and Arabic\n- Current and all past job titles and companies (with dates)\n- Education: universities, degrees, graduation years\n- LinkedIn profile URL (https://linkedin.com/in/...)\n- Board memberships and advisory roles\n- Ownership stakes or shareholding in any company\n- Estimated net worth or compensation\n- Notable achievements, awards, or public recognition\n- Conference appearances or keynote speeches\n- Personal interests, philanthropy, sports\n\nInclude everything you know. Label uncertain information clearly.`,
          maxTokens: 2000,
        }),
      },
      {
        name: "gpt_knowledge",
        run: () => synthesizeGpt({
          system: "You are an elite Saudi Arabia B2B intelligence analyst. Extract ALL facts you know from training data about the requested person. Be specific with dates, companies, titles, and LinkedIn URLs.",
          user: `From your training data, what do you know about "${name}"${company ? ` who works at ${company}` : ""}${title ? ` as ${title}` : ""} in ${country}?\n\nList ALL known facts:\n- Full name in English and Arabic\n- Current and all past job titles and companies (with dates)\n- Education: universities, degrees, graduation years\n- LinkedIn profile URL (https://linkedin.com/in/...)\n- Board memberships and advisory roles\n- Ownership stakes in any company\n- Notable achievements, awards, or public recognition\n- Conference appearances or media interviews\n- Personal interests or philanthropy\n\nInclude everything you know. Label uncertain information clearly.`,
          maxTokens: 2000,
        }),
      },
    ],
    28_000,
  );

  // ── CRAWL AGENTS (parallel with AI agents)
  const linkedinCrawlPromise = (async () => {
    if (!input.linkedinUrl) return "";
    return crawl4aiText(input.linkedinUrl).catch(() => "");
  })();

  const websiteCrawlPromise = (async () => {
    const siteUrl = input.websiteUrl?.trim() ?? "";
    if (!siteUrl) return "";
    try {
      const r = await scraperFetch(siteUrl, "cheerio");
      let text = (r.text ?? "").slice(0, 5000);
      if (!r.ok || text.length < 400) {
        const sc = await crawl4aiText(siteUrl);
        if (sc) text = sc;
      }
      const emails = extractEmails(text);
      return text ? `Company website content (${siteUrl}):\n${text}${emails.length ? "\nEmails: " + emails.join(", ") : ""}` : "";
    } catch { return ""; }
  })();

  // ── APOLLO + EXPLORIUM (parallel with agents)
  const apolloPromise = apolloPersonLookup(name, company);
  const exploriumPromise = exploriumPersonLookup(name, company);

  const [agentResults, linkedinText, websiteText, apolloData, exploriumData] = await Promise.all([
    agents, linkedinCrawlPromise, websiteCrawlPromise, apolloPromise, exploriumPromise,
  ]);

  // ── DeepResearch (o4-mini / GPT-4o) — sequential, after parallel batch
  const deepResearchText = await Promise.race([
    deepResearchPerson(name, company, title),
    new Promise<string>((r) => setTimeout(() => r(""), 25_000)),
  ]);

  const val = (r: { ok: boolean; value?: string }) => (r.ok && r.value ? r.value : "");

  // Discover LinkedIn URL from all sources
  const agentMap = Object.fromEntries(agentResults.map((r) => [r.name, val(r)]));
  const linkedInDiscovery = agentMap.pplx_linkedin || agentMap.gemini_social || agentMap.claude_knowledge || agentMap.gpt_knowledge;
  const discoveredLinkedInUrl = !input.linkedinUrl
    ? (linkedInDiscovery.match(/linkedin\.com\/in\/[^\s"',>)]+/)?.[0] ?? "")
    : "";
  const effectiveLinkedInUrl = input.linkedinUrl || (discoveredLinkedInUrl ? `https://${discoveredLinkedInUrl.replace(/^https?:\/\//, "")}` : "");

  const sourcesUsed = [
    agentMap.pplx_career           ? "Perplexity: professional background" : "",
    agentMap.pplx_company          ? "Perplexity: company intel" : "",
    agentMap.pplx_education        ? "Perplexity: education" : "",
    agentMap.pplx_wealth           ? "Perplexity: wealth & financial" : "",
    agentMap.pplx_board            ? "Perplexity: board memberships" : "",
    agentMap.pplx_compensation     ? "Perplexity: compensation benchmarks" : "",
    agentMap.pplx_personal         ? "Perplexity: personal profile" : "",
    agentMap.pplx_news             ? "Perplexity: recent news" : "",
    agentMap.pplx_linkedin         ? "Perplexity: LinkedIn URL discovery" : "",
    linkedinText                   ? "LinkedIn profile page (crawled)" : "",
    websiteText                    ? "Company website (crawled)" : "",
    apolloData                     ? "Apollo.io" : "",
    exploriumData                  ? "Explorium" : "",
    agentMap.gemini_career         ? "Gemini: Career & Professional History (Google Search)" : "",
    agentMap.gemini_social         ? "Gemini: LinkedIn & Social Media (Google Search)" : "",
    agentMap.gemini_news           ? "Gemini: Company Context & News (Google Search)" : "",
    agentMap.gemini_dossier        ? "Gemini: Comprehensive Dossier (Google Search)" : "",
    agentMap.claude_knowledge      ? "Claude: Training Knowledge Base" : "",
    agentMap.gpt_knowledge         ? "GPT-4o: Training Knowledge Base" : "",
    deepResearchText               ? "DeepResearch Agent" : "",
  ].filter(Boolean);

  logger.info({ scope: "person_intel", name, sourcesHit: sourcesUsed.length }, "parallel research complete");

  const sections = [
    agentMap.pplx_career        ? `=== SOURCE 1: WEB SEARCH — Professional Background ===\n${agentMap.pplx_career}` : "",
    agentMap.pplx_company       ? `=== SOURCE 2: WEB SEARCH — Company Intelligence ===\n${agentMap.pplx_company}` : "",
    agentMap.pplx_education     ? `=== SOURCE 3: WEB SEARCH — Education ===\n${agentMap.pplx_education}` : "",
    agentMap.pplx_wealth        ? `=== SOURCE 4: WEB SEARCH — Wealth & Financial ===\n${agentMap.pplx_wealth}` : "",
    agentMap.pplx_board         ? `=== SOURCE 5: WEB SEARCH — Board Memberships ===\n${agentMap.pplx_board}` : "",
    agentMap.pplx_compensation  ? `=== SOURCE 6: WEB SEARCH — Compensation ===\n${agentMap.pplx_compensation}` : "",
    agentMap.pplx_personal      ? `=== SOURCE 7: WEB SEARCH — Personal Profile ===\n${agentMap.pplx_personal}` : "",
    agentMap.pplx_news          ? `=== SOURCE 8: WEB SEARCH — Recent News ===\n${agentMap.pplx_news}` : "",
    agentMap.pplx_linkedin      ? `=== SOURCE 9: WEB SEARCH — LinkedIn Discovery ===\n${agentMap.pplx_linkedin}${effectiveLinkedInUrl ? `\nDISCOVERED URL: ${effectiveLinkedInUrl}` : ""}` : "",
    linkedinText                ? `=== SOURCE 10: LINKEDIN PROFILE (crawled) ===\n${linkedinText}` : "",
    websiteText                 ? `=== SOURCE 11: COMPANY WEBSITE (crawled) ===\n${websiteText}` : "",
    apolloData                  ? `=== SOURCE 12: APOLLO.IO VERIFIED DATA ===\n${apolloData}` : "",
    exploriumData               ? `=== SOURCE 13: EXPLORIUM FIRMOGRAPHIC ===\n${exploriumData}` : "",
    agentMap.gemini_career      ? `=== SOURCE 14: GEMINI AGENT A — Career History (Google Search) ===\n${agentMap.gemini_career}` : "",
    agentMap.gemini_social      ? `=== SOURCE 15: GEMINI AGENT B — LinkedIn & Social (Google Search) ===\n${agentMap.gemini_social}` : "",
    agentMap.gemini_news        ? `=== SOURCE 16: GEMINI AGENT C — Company Context & News (Google Search) ===\n${agentMap.gemini_news}` : "",
    agentMap.gemini_dossier     ? `=== SOURCE 17: GEMINI AGENT D — Comprehensive Dossier (Google Search) ===\n${agentMap.gemini_dossier}` : "",
    agentMap.claude_knowledge   ? `=== SOURCE 18: CLAUDE — Training Knowledge Base ===\n${agentMap.claude_knowledge}` : "",
    agentMap.gpt_knowledge      ? `=== SOURCE 19: GPT-4o — Training Knowledge Base ===\n${agentMap.gpt_knowledge}` : "",
    deepResearchText            ? `=== SOURCE 20: DEEP RESEARCH AGENT ===\n${deepResearchText}` : "",
  ].filter(Boolean);

  const aggregatedIntelligence = sections.join("\n\n").slice(0, 22000);

  const synthesisPrompt = `You are an elite Saudi Arabia B2B intelligence analyst. Generate the most detailed, specific, and actionable intelligence dossier for this individual.

TARGET:
- Name: ${name}${company ? `\n- Company: ${company}` : ""}${title ? `\n- Title: ${title}` : ""}${effectiveLinkedInUrl ? `\n- LinkedIn: ${effectiveLinkedInUrl}` : ""}
- Country: ${country}
${sellerSection}

${aggregatedIntelligence ? `AGGREGATED INTELLIGENCE FROM ${sections.length} RESEARCH SOURCES:\n${aggregatedIntelligence}` : "No live data available — use Saudi market knowledge and label all inferences clearly."}

SYNTHESIS RULES (MANDATORY):
1. CROSS-REFERENCE ALL SOURCES: A fact confirmed by 2+ sources is verified. Check all 20 sources.
2. LINKEDIN URL: Check Sources 9, 15, 17, 18, 19 for a LinkedIn URL. If found in ANY source, use it.
3. CONFIRMED FACTS: Only facts present in the research above. Cite specific source numbers.
4. ESTIMATES: Label all inferences as "Estimated:" in text AND add to estimated_facts.
5. NOT FOUND: Only set "Not found" after checking ALL sources. Never hallucinate.
6. SPECIFICITY: Use exact numbers, dates, role titles, company names from research.
7. CAREER: Populate career array from ALL sources — Sources 1, 14, 17, 18, 19. Order: most recent first.
8. REJECT GENERIC: "Experienced executive" without specific evidence is unacceptable.

Return valid JSON only. No markdown. No explanatory text. Use "Not found" for missing text fields — never null for text fields:

{
  "profile": {
    "fullName": "Full formal name",
    "arabicName": "Arabic name or Not found",
    "title": "Current primary title",
    "company": "Current primary company",
    "nationality": "Nationality or Not found",
    "location": "City, Country or Not found",
    "age": null,
    "linkedin": "LinkedIn URL or Not found"
  },
  "career": [
    { "company": "Name", "title": "Role", "period": "YYYY – YYYY or Present", "description": "Specific achievements from research" }
  ],
  "education": [
    { "institution": "University name", "degree": "Degree and field", "year": "Year or period" }
  ],
  "company_analysis": {
    "name": "Company", "industry": "Industry", "founded": "Year or Not found",
    "headquarters": "City, Country or Not found", "employees": "Count or Not found",
    "revenue_estimate": "Revenue or Not found", "performance": "Data from research",
    "market_position": "Position from research", "key_clients": [],
    "recent_developments": "News from research", "competitors": [], "pain_points": []
  },
  "wealth_profile": {
    "estimated_net_worth": "From research or Estimated: [range] based on [reasoning]",
    "income_estimate": "From research or Estimated: [range]",
    "wealth_sources": [], "assets": "Not found", "investments": "Not found",
    "lifestyle_indicators": "Not found"
  },
  "personal_profile": {
    "interests": [], "personality_traits": [], "communication_style": "Not found",
    "languages": ["Arabic", "English"], "board_memberships": [],
    "publications": [], "awards": [], "social_presence": "Not found"
  },
  "approach_strategy": {
    "best_channel": "Primary channel based on research",
    "best_timing": "Timing insight from research",
    "opening_angle": "Specific, personalized opening based on research data",
    "value_proposition": "Precisely tailored to their role and company situation",
    "potential_objections": [],
    "conversation_starters": [],
    "cultural_notes": "Saudi business culture considerations specific to this person",
    "recommended_approach": "Full 3-4 paragraph tailored outreach strategy${sellerCtx?.companyName ? `, selling ${sellerCtx?.product ?? "your product"} from ${sellerCtx?.companyName}` : ""}",
    "sample_message": "A ready-to-send, personalized first outreach message grounded in the research"
  },
  "intelligence_notes": {
    "confidence_level": "High / Medium / Low — based on data availability",
    "data_sources": ${JSON.stringify(sourcesUsed.length > 0 ? sourcesUsed : ["AI knowledge base"])},
    "verified_facts": [],
    "estimated_facts": [],
    "caveats": "Important accuracy caveats based on data quality"
  }
}`;

  const report = await synthesizeJson<PersonIntelReport>({
    system: "You are an elite Saudi Arabia B2B intelligence analyst. Return valid JSON only. Be maximally specific and actionable. Ground all facts in the provided research data. Use 'Not found' for missing fields — never hallucinate. Distinguish clearly between confirmed public knowledge and intelligent inference.",
    user: synthesisPrompt,
    fallback: {
      ...EMPTY_PERSON,
      profile: { ...EMPTY_PERSON.profile, fullName: name, company: company ?? "", title: title ?? "", linkedin: effectiveLinkedInUrl || "Not found" },
      intelligence_notes: { ...EMPTY_PERSON.intelligence_notes, data_sources: sourcesUsed },
    },
    preferredProvider: "gemini",
    maxTokens: 4000,
  });

  // Inject discovered LinkedIn URL if synthesis missed it
  if (effectiveLinkedInUrl) {
    const prof = report.profile as Record<string, unknown>;
    if (!prof.linkedin || prof.linkedin === "Not found") prof.linkedin = effectiveLinkedInUrl;
  }

  if (!report.intelligence_notes) {
    report.intelligence_notes = { ...EMPTY_PERSON.intelligence_notes };
  }
  if (!Array.isArray(report.intelligence_notes.data_sources)) {
    report.intelligence_notes.data_sources = [];
  }
  report.intelligence_notes.data_sources = Array.from(new Set([...report.intelligence_notes.data_sources, ...sourcesUsed]));

  return { report, sourcesUsed };
}
