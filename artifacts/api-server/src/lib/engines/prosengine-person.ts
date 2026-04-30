/**
 * ProsEngine — Person Intelligence.
 *
 * Original spec: 20 parallel agents (9 Perplexity + 4 Gemini + 2 Claude/GPT
 * + 2 Apollo/Explorium + 2 LinkedIn/website crawl + 1 deep-research).
 *
 * This implementation maps to what we have:
 *   - Apollo / Explorium agents are SKIPPED gracefully (no API keys here).
 *   - All Perplexity, Gemini, Claude, GPT calls go through OpenRouter.
 *   - LinkedIn URL crawl uses the Node stealth scraper.
 *   - Company website crawl uses the Python Crawl4AI sidecar when reachable.
 *
 * The synthesis pass produces the full PersonIntelReport shape from the spec.
 */

import { fanOut, searchWeb, searchGrounded, synthesizeClaude, synthesizeGpt, synthesizeJson } from "./_ai.js";
import { scraperFetch, extractEmails } from "../enrichment/connectors/web-scraper.js";
import { logger } from "../logger.js";
import type { PersonIntelInput, PersonIntelReport } from "./types.js";

const EMPTY_PERSON: PersonIntelReport = {
  profile: { fullName: "", arabicName: "Not found", title: "", company: "", nationality: "", location: "", age: null, linkedin: "Not found" },
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

export async function runPersonIntel(input: PersonIntelInput): Promise<{ report: PersonIntelReport; sourcesUsed: string[] }> {
  const country = input.country ?? "Saudi Arabia";
  const ctx = `${input.name}${input.title ? ` (${input.title})` : ""}${input.company ? ` at ${input.company}` : ""}`;
  logger.info({ scope: "person_intel", name: input.name, company: input.company }, "starting Person Intel");

  // ── 15 parallel agents (skipping Apollo/Explorium — no keys)
  const agents = fanOut([
    { name: "pplx_career",        run: () => searchWeb(`Professional background and career history of ${ctx} in ${country}. Past roles, employers, achievements, dates.`) },
    { name: "pplx_company",       run: () => searchWeb(`Deep dive on ${input.company ?? "the company employer of " + input.name}: industry, size, ownership, recent news, financial performance.`) },
    { name: "pplx_education",     run: () => searchWeb(`Education, academic credentials, universities, degrees, executive education for ${ctx}.`) },
    { name: "pplx_wealth",        run: () => searchWeb(`Wealth profile and financial indicators of ${ctx}: estimated net worth, income, investments, assets, lifestyle indicators.`) },
    { name: "pplx_boards",        run: () => searchWeb(`Board memberships, advisory roles, non-profit work, government appointments held by ${ctx}.`) },
    { name: "pplx_compensation",  run: () => searchWeb(`Executive compensation benchmarks for ${input.title ?? "senior executives"} at ${input.company ?? "comparable companies"} in ${country}.`) },
    { name: "pplx_personal",      run: () => searchWeb(`Personal interests, hobbies, public speaking, languages spoken, publications by ${ctx}.`) },
    { name: "pplx_news",          run: () => searchWeb(`Latest 2025-2026 news mentioning ${ctx}: interviews, deals, awards, controversies.`) },
    { name: "pplx_linkedin",      run: () => searchWeb(`LinkedIn profile URL for ${ctx}. Return the linkedin.com/in/ URL if it exists.`) },
    { name: "gemini_career",      run: () => searchGrounded(`Career timeline and professional accomplishments of ${ctx}.`) },
    { name: "gemini_social",      run: () => searchGrounded(`Social media presence and digital footprint of ${ctx}: Twitter/X, LinkedIn, Instagram.`) },
    { name: "gemini_company_news",run: () => searchGrounded(`Most recent news 2025-2026 about ${input.company ?? "the employer of " + input.name}.`) },
    { name: "gemini_dossier",     run: () => searchGrounded(`Comprehensive deep dossier on ${ctx}: full bio, family background, key relationships, business interests.`) },
    { name: "claude_knowledge",   run: () => synthesizeClaude({
      system: "You are a Saudi/GCC executive intelligence analyst.",
      user: `From your training knowledge, what do you know about ${ctx}? Cover career, education, wealth, board roles, family, public profile. Be specific. Say "unknown" rather than fabricating.`,
      maxTokens: 1500,
    }) },
    { name: "gpt_knowledge",      run: () => synthesizeGpt({
      system: "You are an executive intelligence analyst.",
      user: `From your training knowledge, what do you know about ${ctx}? Cover career, education, public profile, financial indicators, network. Be specific. Say "unknown" rather than guess.`,
      maxTokens: 1500,
    }) },
  ], 50_000);

  // ── 2 crawl agents (run alongside the AI fan-out)
  const linkedinCrawl = (async () => {
    if (!input.linkedinUrl) return { ok: false, text: "", note: "no LinkedIn URL provided" };
    try {
      const r = await scraperFetch(input.linkedinUrl, "playwright");
      const text = (r.text ?? "").slice(0, 4000);
      return { ok: r.ok && !!text, text, note: r.error ?? "" };
    } catch (e: any) { return { ok: false, text: "", note: e?.message ?? "crawl failed" }; }
  })();

  const websiteCrawl = (async () => {
    if (!input.websiteUrl) return { ok: false, text: "", emails: [] as string[], note: "no website URL provided" };
    try {
      const r = await scraperFetch(input.websiteUrl, "cheerio");
      const text = (r.text ?? "").slice(0, 4000);
      const emails = extractEmails(text);
      return { ok: r.ok, text, emails, note: r.error ?? "" };
    } catch (e: any) { return { ok: false, text: "", emails: [] as string[], note: e?.message ?? "crawl failed" }; }
  })();

  const [agentResults, linkedinR, websiteR] = await Promise.all([agents, linkedinCrawl, websiteCrawl]);

  const sourcesUsed: string[] = [];
  for (const r of agentResults) if (r.ok) sourcesUsed.push(r.name);
  if (linkedinR.ok) sourcesUsed.push("crawl_linkedin");
  if (websiteR.ok) sourcesUsed.push("crawl_website");
  sourcesUsed.push("apollo:skipped(no_api_key)", "explorium:skipped(no_api_key)");

  const bundle = [
    ...agentResults.filter((r) => r.ok && r.value).map((r) => `## ${r.name}\n${r.value}`),
    linkedinR.ok ? `## crawl_linkedin\n${linkedinR.text}` : "",
    websiteR.ok ? `## crawl_website\n${websiteR.text}\n${websiteR.emails.length ? "Emails: " + websiteR.emails.join(", ") : ""}` : "",
  ].filter(Boolean).join("\n\n");

  // ── Synthesis (try Claude first, then GPT, then Gemini)
  const { data: report, provider } = await synthesizeJson<PersonIntelReport>({
    system:
      "You synthesize multi-source intelligence into a strict JSON dossier on a single person. Always return valid JSON matching the requested schema exactly. Use empty strings, [], or null for missing fields — never omit keys. Never fabricate facts; mark unverified items in intelligence_notes.estimated_facts.",
    user: `Person: ${input.name}
Title: ${input.title ?? "(unknown)"}
Company: ${input.company ?? "(unknown)"}
Country: ${country}
LinkedIn: ${input.linkedinUrl ?? "(unknown)"}
Known facts: ${input.knownFacts ?? "(none provided)"}
Seller context: ${JSON.stringify(input.sellerContext ?? {})}

Multi-source research:
${bundle.slice(0, 18000)}

Return a JSON object with EXACTLY these top-level keys: profile, career, education, company_analysis, wealth_profile, personal_profile, approach_strategy, intelligence_notes.

profile: { fullName, arabicName, title, company, nationality, location, age (number|null), linkedin }
career: array of { company, title, period, description }
education: array of { institution, degree, year }
company_analysis: { name, industry, founded, headquarters, employees, revenue_estimate, performance, market_position, key_clients [], recent_developments, competitors [], pain_points [] }
wealth_profile: { estimated_net_worth, income_estimate, wealth_sources [], assets, investments, lifestyle_indicators }
personal_profile: { interests [], personality_traits [], communication_style, languages [], board_memberships [], publications [], awards [], social_presence }
approach_strategy: { best_channel, best_timing, opening_angle, value_proposition, potential_objections [], conversation_starters [], cultural_notes, recommended_approach (3-4 paragraphs), sample_message (ready-to-send first outreach) }
intelligence_notes: { confidence_level ("High"|"Medium"|"Low"), data_sources [], verified_facts [], estimated_facts [], caveats }

Tailor approach_strategy.recommended_approach and sample_message specifically to the seller_context.`,
    fallback: { ...EMPTY_PERSON, profile: { ...EMPTY_PERSON.profile, fullName: input.name, title: input.title ?? "", company: input.company ?? "" } },
    preferredProvider: "anthropic",
    maxTokens: 4500,
  });

  if (provider !== "fallback") sourcesUsed.push(`synthesis:${provider}`);

  // Make sure intelligence_notes.data_sources reflects what actually fired
  if (!report.intelligence_notes) {
    report.intelligence_notes = { ...EMPTY_PERSON.intelligence_notes };
  }
  report.intelligence_notes.data_sources = Array.from(
    new Set([...(report.intelligence_notes.data_sources ?? []), ...sourcesUsed]),
  );

  return { report, sourcesUsed };
}
