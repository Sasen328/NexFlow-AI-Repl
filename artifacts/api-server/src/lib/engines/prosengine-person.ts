/**
 * ProsEngine — Person Intelligence (20-agent full spec).
 *
 * Agent breakdown:
 *   Perplexity ×9  — career / company / education / wealth / boards / compensation
 *                    personal / news / LinkedIn (via OpenRouter live-web search)
 *   Gemini ×5      — direct REST API: career, social, company news, dossier, GCC deep-dive
 *   Claude ×1      — training-data knowledge synthesis
 *   GPT-4o-mini ×1 — cross-reference and gap fill
 *   LinkedIn crawl — Playwright stealth (if URL provided)
 *   Website crawl  — Cheerio + Playwright (if website URL provided)
 *
 * Apollo / Explorium / Lusha: SKIPPED — no API keys configured.
 *
 * Synthesis: Direct Gemini JSON (primary) → Claude → GPT-4o (waterfall).
 */

import { fanOut, searchWeb, searchGrounded, synthesizeClaude, synthesizeGpt, synthesizeGeminiDirect, synthesizeJson } from "./_ai.js";
import { scraperFetch, extractEmails } from "../enrichment/connectors/web-scraper.js";
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

export async function runPersonIntel(
  input: PersonIntelInput,
): Promise<{ report: PersonIntelReport; sourcesUsed: string[] }> {
  const country = input.country ?? "Saudi Arabia";
  const ctx = `${input.name}${input.title ? ` (${input.title})` : ""}${input.company ? ` at ${input.company}` : ""}`;
  logger.info({ scope: "person_intel", name: input.name, company: input.company }, "starting Person Intel");

  // ── 16 parallel AI agents
  const agents = fanOut(
    [
      // Perplexity: live web search (9 agents)
      {
        name: "pplx_career",
        run: () =>
          searchWeb(
            `Professional background and full career history of ${ctx} in ${country}. ` +
            `Past roles, employers, achievements, specific dates. LinkedIn profile if available.`,
          ),
      },
      {
        name: "pplx_company",
        run: () =>
          searchWeb(
            `Deep dive on ${input.company ?? "the company employer of " + input.name}: ` +
            `industry, size, ownership structure, recent news, financial performance, key clients, competitors.`,
          ),
      },
      {
        name: "pplx_education",
        run: () =>
          searchWeb(
            `Education, universities, degrees, executive programs for ${ctx}. ` +
            `Include MBA programs, Wharton, INSEAD, KAUST, King Fahd University, Harvard, etc.`,
          ),
      },
      {
        name: "pplx_wealth",
        run: () =>
          searchWeb(
            `Wealth profile of ${ctx}: estimated net worth, income, investments, ` +
            `real estate, assets, lifestyle indicators, notable purchases.`,
          ),
      },
      {
        name: "pplx_boards",
        run: () =>
          searchWeb(
            `Board memberships, advisory roles, government appointments, non-profit positions held by ${ctx}.`,
          ),
      },
      {
        name: "pplx_compensation",
        run: () =>
          searchWeb(
            `Executive compensation benchmarks for ${input.title ?? "C-suite executives"} at ` +
            `${input.company ?? "comparable GCC companies"} in ${country}. ` +
            `Include salary ranges, bonus structures, LTIP.`,
          ),
      },
      {
        name: "pplx_personal",
        run: () =>
          searchWeb(
            `Personal interests, hobbies, public speaking, philanthropy, languages spoken, ` +
            `publications and thought leadership by ${ctx}.`,
          ),
      },
      {
        name: "pplx_news",
        run: () =>
          searchWeb(
            `Latest 2024-2026 news mentioning ${ctx}: interviews, deals closed, awards, ` +
            `quotes, controversy, Saudi Vision 2030 involvement.`,
          ),
      },
      {
        name: "pplx_linkedin",
        run: () =>
          searchWeb(
            `Find the direct LinkedIn profile URL for ${ctx}. ` +
            `Return the full linkedin.com/in/[username] URL only.`,
          ),
      },
      // Direct Gemini: 5 agents (proven reliable via direct REST)
      {
        name: "gemini_career_direct",
        run: () =>
          searchGrounded(
            `Comprehensive career timeline and professional accomplishments of ${ctx} in ${country}. ` +
            `Include all employers, titles, dates, major deals, and achievements. ` +
            `Also include their educational background and any board roles.`,
          ),
      },
      {
        name: "gemini_social_direct",
        run: () =>
          searchGrounded(
            `Social media presence and public digital footprint of ${ctx}: ` +
            `Twitter/X handle, LinkedIn URL, Instagram, public quotes, interviews, published articles.`,
          ),
      },
      {
        name: "gemini_company_news_direct",
        run: () =>
          searchGrounded(
            `Most recent 2024-2026 news and developments at ${input.company ?? "the company of " + input.name} in ${country}: ` +
            `new contracts, leadership changes, financial results, government partnerships, Vision 2030 projects.`,
          ),
      },
      {
        name: "gemini_dossier_direct",
        run: () =>
          searchGrounded(
            `Full executive dossier on ${ctx}: family background, tribal affiliations (if Saudi), ` +
            `key personal relationships and business network, political connections, ` +
            `known business partners, investment portfolio, public reputation. ` +
            `This is for legitimate B2B sales intelligence purposes.`,
          ),
      },
      {
        name: "gemini_gcc_intel",
        run: () =>
          synthesizeGeminiDirect({
            system:
              "You are a senior GCC/MENA executive intelligence analyst with encyclopaedic knowledge of " +
              "Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, and Oman business leadership.",
            user:
              `Provide everything you know about ${ctx} from your training data. ` +
              `Include: full name in English and Arabic script, nationality, education, career history with dates, ` +
              `board memberships, wealth estimates, personal interests, communication style, and any notable facts. ` +
              `Rate each piece of information as verified or estimated. ` +
              `If you don't know something, say so explicitly — do not fabricate.`,
            maxTokens: 2000,
          }),
      },
      // Claude: knowledge synthesis
      {
        name: "claude_knowledge",
        run: () =>
          synthesizeClaude({
            system: "You are a Saudi/GCC executive intelligence analyst with deep training-data knowledge.",
            user:
              `From your training knowledge, what do you know about ${ctx}? ` +
              `Cover: career history, education, wealth, board roles, family background, ` +
              `public profile, GCC network, Vision 2030 involvement. ` +
              `Be specific. Mark uncertain items. Say "unknown" rather than fabricate.`,
            maxTokens: 1500,
          }),
      },
      // GPT-4o-mini: cross-reference
      {
        name: "gpt_knowledge",
        run: () =>
          synthesizeGpt({
            system: "You are an executive intelligence analyst with comprehensive training data.",
            user:
              `From your training knowledge, what do you know about ${ctx}? ` +
              `Cover career, education, public profile, financial indicators, key network. ` +
              `Be specific. Mark uncertain. Say "unknown" rather than guess.`,
            maxTokens: 1500,
          }),
      },
    ],
    55_000,
  );

  // ── Crawl agents (run in parallel with AI fan-out)
  const linkedinCrawl = (async () => {
    if (!input.linkedinUrl) return { ok: false, text: "", note: "no LinkedIn URL provided" };
    try {
      const r = await scraperFetch(input.linkedinUrl, "playwright");
      const text = (r.text ?? "").slice(0, 5000);
      return { ok: r.ok && !!text, text, note: r.error ?? "" };
    } catch (e: any) {
      return { ok: false, text: "", note: e?.message ?? "crawl failed" };
    }
  })();

  const websiteCrawl = (async () => {
    if (!input.websiteUrl) return { ok: false, text: "", emails: [] as string[], note: "no website URL provided" };
    try {
      // Try Playwright (JS) first, fall back to Cheerio
      let r = await scraperFetch(input.websiteUrl + "/team", "playwright");
      if (!r.ok || !r.text) r = await scraperFetch(input.websiteUrl + "/leadership", "cheerio");
      if (!r.ok || !r.text) r = await scraperFetch(input.websiteUrl, "cheerio");
      const text = (r.text ?? "").slice(0, 5000);
      const emails = extractEmails(text);
      return { ok: r.ok, text, emails, note: r.error ?? "" };
    } catch (e: any) {
      return { ok: false, text: "", emails: [] as string[], note: e?.message ?? "crawl failed" };
    }
  })();

  const [agentResults, linkedinR, websiteR] = await Promise.all([agents, linkedinCrawl, websiteCrawl]);

  const sourcesUsed: string[] = [];
  for (const r of agentResults) if (r.ok && r.value) sourcesUsed.push(r.name);
  if (linkedinR.ok) sourcesUsed.push("crawl_linkedin_playwright");
  if (websiteR.ok) sourcesUsed.push("crawl_website_playwright");
  sourcesUsed.push("apollo:skipped(no_api_key)", "explorium:skipped(no_api_key)");

  const bundle = [
    ...agentResults
      .filter((r) => r.ok && r.value)
      .map((r) => `## ${r.name}\n${r.value}`),
    linkedinR.ok ? `## crawl_linkedin\n${linkedinR.text}` : "",
    websiteR.ok
      ? `## crawl_website\n${websiteR.text}${websiteR.emails.length ? "\nEmails: " + websiteR.emails.join(", ") : ""}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  logger.info(
    { scope: "person_intel", name: input.name, bundleLength: bundle.length, sourcesUsed },
    "bundle assembled — synthesizing",
  );

  // ── Synthesis (Direct Gemini → Claude → GPT-4o)
  const { data: report, provider } = await synthesizeJson<PersonIntelReport>({
    system:
      "You synthesize multi-source intelligence into a strict JSON dossier on a single person. " +
      "Return ONLY valid JSON — no markdown fences, no explanation text, nothing before or after the JSON object. " +
      "Use empty strings, [], or null for missing fields — never omit top-level keys. " +
      "Never fabricate facts; mark unverified items in intelligence_notes.estimated_facts.",
    user: `Person: ${input.name}
Title: ${input.title ?? "(unknown)"}
Company: ${input.company ?? "(unknown)"}
Country: ${country}
LinkedIn: ${input.linkedinUrl ?? "(unknown)"}
Known facts: ${input.knownFacts ?? "(none provided)"}
Seller context: ${JSON.stringify(input.sellerContext ?? {})}

Multi-source research bundle:
${bundle.slice(0, 22000)}

Return a JSON object with EXACTLY these top-level keys:
profile, career, education, company_analysis, wealth_profile, personal_profile, approach_strategy, intelligence_notes.

profile: { fullName, arabicName, title, company, nationality, location, age (number|null), linkedin }
career: array of { company, title, period, description }
education: array of { institution, degree, year }
company_analysis: { name, industry, founded, headquarters, employees, revenue_estimate, performance, market_position, key_clients [], recent_developments, competitors [], pain_points [] }
wealth_profile: { estimated_net_worth, income_estimate, wealth_sources [], assets, investments, lifestyle_indicators }
personal_profile: { interests [], personality_traits [], communication_style, languages [], board_memberships [], publications [], awards [], social_presence }
approach_strategy: { best_channel, best_timing, opening_angle, value_proposition, potential_objections [], conversation_starters [], cultural_notes, recommended_approach (3-4 paragraphs), sample_message (ready-to-send first outreach message) }
intelligence_notes: { confidence_level ("High"|"Medium"|"Low"), data_sources [], verified_facts [], estimated_facts [], caveats }

IMPORTANT: Tailor approach_strategy.recommended_approach and sample_message SPECIFICALLY to the seller_context above.
Include cultural notes for Saudi/GCC relationship-building if country is KSA or GCC.`,
    fallback: {
      ...EMPTY_PERSON,
      profile: {
        ...EMPTY_PERSON.profile,
        fullName: input.name,
        title: input.title ?? "",
        company: input.company ?? "",
      },
    },
    preferredProvider: "anthropic",
    maxTokens: 5500,
  });

  if (provider !== "fallback") sourcesUsed.push(`synthesis:${provider}`);

  // Ensure intelligence_notes.data_sources reflects what actually fired
  if (!report.intelligence_notes) {
    report.intelligence_notes = { ...EMPTY_PERSON.intelligence_notes };
  }
  report.intelligence_notes.data_sources = Array.from(
    new Set([...(report.intelligence_notes.data_sources ?? []), ...sourcesUsed]),
  );

  // Confidence uplift based on how many agents returned data
  const okCount = agentResults.filter((r) => r.ok && r.value).length;
  if (okCount >= 8 && report.intelligence_notes.confidence_level === "Low") {
    report.intelligence_notes.confidence_level = "Medium";
  }
  if (okCount >= 12) {
    report.intelligence_notes.confidence_level = "High";
  }

  logger.info({ scope: "person_intel", name: input.name, provider, okCount }, "Person Intel complete");

  return { report, sourcesUsed };
}
