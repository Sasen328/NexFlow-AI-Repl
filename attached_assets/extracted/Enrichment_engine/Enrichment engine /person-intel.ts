import { Router, type Request, type Response } from "express";
import { db, prosengineResearchTable, leadListsTable, leadListItemsTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { crawl4ai } from "../crawl4ai-engine.js";
import { synthesizeWithGemini, isGeminiConfigured, deepResearchWithGemini } from "../gemini-search.js";
import { runWebSeeder } from "../lib/web-seeder.js";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || "dummy",
});

// ── Web search: Perplexity → Gemini Google Search fallback ───────────────────
async function perplexityPersonSearch(query: string, maxTokens = 2000): Promise<string> {
  const key = process.env.PERPLEXITY_API_KEY;

  // ── Primary: Perplexity ──────────────────────────────────────────────────
  if (key) {
    try {
      const resp = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            { role: "system", content: "You are a Saudi Arabia B2B intelligence researcher. Provide verified, factual information only. Use specific numbers, dates, and cite sources where possible. Never hallucinate." },
            { role: "user", content: query },
          ],
          max_tokens: maxTokens,
          temperature: 0.1,
          return_citations: true,
        }),
        signal: AbortSignal.timeout(25000),
      });
      if (resp.ok) {
        const data = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
        const result = data.choices?.[0]?.message?.content || "";
        if (result.length > 50) return result;
      }
    } catch { /* fall through to Gemini */ }
  }

  // ── Fallback: Gemini with Google Search grounding ─────────────────────────
  if (isGeminiConfigured()) {
    try {
      const geminiPromise = deepResearchWithGemini(
        query,
        "You are a Saudi Arabia B2B intelligence researcher. Search the web and provide accurate, current, specific information about this person. Include verified facts, dates, titles, company names, and URLs where available.",
        "gemini-2.5-flash"
      );
      const timeoutPromise = new Promise<null>(r => setTimeout(() => r(null), 35000));
      const result = await Promise.race([geminiPromise, timeoutPromise]);
      return result?.text || "";
    } catch { return ""; }
  }

  return "";
}

// ── Apollo person lookup ─────────────────────────────────────────────────────
async function apolloPersonLookup(name: string, company?: string, title?: string): Promise<string> {
  const key = process.env.APOLLO_API_KEY;
  if (!key) return "";
  try {
    const params: Record<string, unknown> = {
      q_person_name: name,
      per_page: 5,
    };
    if (company) params.q_organization_name = company;

    const resp = await fetch("https://api.apollo.io/v1/people/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": key },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(15000),
    });
    if (!resp.ok) return "";
    const data = await resp.json() as { people?: unknown[] };
    if (!data.people?.length) return "";
    const p = data.people[0] as Record<string, unknown>;
    return JSON.stringify({
      name: p.name,
      title: p.title,
      email: p.email,
      phone: (p.phone_numbers as Array<Record<string, unknown>>)?.[0]?.sanitized_number,
      linkedin: p.linkedin_url,
      city: p.city,
      country: p.country,
      seniority: p.seniority,
      departments: p.departments,
      employment_history: (p.employment_history as Array<Record<string, unknown>>)?.slice(0, 5),
    });
  } catch { return ""; }
}

// ── Explorium person lookup ──────────────────────────────────────────────────
async function exploriumPersonLookup(name: string, company?: string): Promise<string> {
  const key = process.env.EXPLORIUM_API_KEY;
  if (!key) return "";
  try {
    const resp = await fetch("https://app.explorium.ai/api/bundle/v1/people", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({ full_name: name, company_name: company || undefined, country: "Saudi Arabia" }),
      signal: AbortSignal.timeout(15000),
    });
    if (!resp.ok) return "";
    const data = await resp.json() as Record<string, unknown>;
    return JSON.stringify(data);
  } catch { return ""; }
}

// ── DeepResearch for person (o4-mini with fallback) ──────────────────────────
async function deepResearchPerson(name: string, company?: string, title?: string): Promise<string> {
  const query = `Comprehensive intelligence dossier on "${name}"${company ? ` at ${company}` : ""}${title ? `, ${title}` : ""} in Saudi Arabia.\n\nResearch:\n1. Career history and current role\n2. Education background\n3. Board memberships and other roles\n4. Wealth indicators and estimated net worth\n5. Compensation and financial interests\n6. Personal interests and public activities\n7. Public statements, publications, awards\n8. Recent business activities and news 2024-2025\n\nFocus on verified public information from Saudi business media, regulatory filings, LinkedIn, and official company sources.`;

  try {
    const resp = await openai.responses.create({
      model: "o4-mini-deep-research-2025-06-26",
      input: [
        {
          role: "developer",
          content: [{ type: "input_text", text: "You are a Saudi Arabia B2B intelligence analyst. Provide comprehensive, factual data with sources. Never hallucinate. Mark unverified information as estimated." }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: query }],
        },
      ],
      tools: [{ type: "web_search_preview" }],
    } as Parameters<typeof openai.responses.create>[0]);

    let text = "";
    const output = ((resp as unknown) as Record<string, unknown>).output as unknown[] || [];
    for (const item of output) {
      const i = item as Record<string, unknown>;
      if (i.type === "message" && Array.isArray(i.content)) {
        for (const block of i.content as Record<string, unknown>[]) {
          if (block.type === "output_text") text += (block.text as string) + "\n";
        }
      }
    }
    return text.trim();
  } catch (err) {
    console.warn("[PersonIntel] DeepResearch unavailable:", (err as Error).message?.slice(0, 60));
    return "";
  }
}

// ─── POST /person-intel/profile ───────────────────────────────────────────────
// Full intelligence pipeline: 8 parallel Perplexity threads + Apollo + Explorium +
// LinkedIn crawl + company website crawl + DeepResearch (o4-mini) →
// Claude/GPT-4o/Gemini synthesis with "Not found" discipline.
router.post("/person-intel/profile", async (req: Request, res: Response): Promise<void> => {
  const {
    name, company, title, linkedinUrl, websiteUrl: requestedWebsiteUrl, country = "Saudi Arabia",
    sellerContext, intelligenceGoals, knownFacts,
  } = req.body as {
    name: string; company?: string; title?: string; linkedinUrl?: string; websiteUrl?: string; country?: string;
    sellerContext?: { companyName?: string; product?: string; objective?: string; objectives?: string[] };
    intelligenceGoals?: string[];
    knownFacts?: string;
  };

  if (!name?.trim()) { res.status(400).json({ error: "Name is required" }); return; }

  const goalsList = intelligenceGoals && intelligenceGoals.length > 0
    ? intelligenceGoals.join(", ")
    : "full profile including wealth, career, education, company analysis, and approach strategy";

  const sellerObjective = sellerContext?.objectives?.length ? sellerContext.objectives.join(" + ") : (sellerContext?.objective || "book a meeting");
  const sellerSection = sellerContext?.companyName
    ? `\nSALES CONTEXT (personalize everything to this):\n- Seller company: ${sellerContext.companyName}\n- Product/service: ${sellerContext.product || "B2B services"}\n- Objective: ${sellerObjective}`
    : "";

  const knownSection = knownFacts?.trim()
    ? `\nKNOWN FACTS (use these as confirmed data, build on them):\n${knownFacts}`
    : "";

  // ── Full AgentOrchestra pipeline — all sources in parallel ─────────────────
  console.log(`[PersonIntel] Running full AgentOrchestra for: ${name} @ ${company || "N/A"}`);

  // ── PARALLEL RESEARCH ENGINE — all agents fire simultaneously ───────────────
  // 9 Perplexity threads + 4 Gemini Google Search agents + crawls + APIs + Claude + GPT-4o knowledge
  const [
    perplexityProfile,
    perplexityCompany,
    perplexityEducation,
    perplexityWealth,
    perplexityBoard,
    perplexityCompensation,
    perplexityInterests,
    perplexityNews,
    perplexityLinkedIn,
    linkedinText,
    companyWebsiteCrawl,
    apolloData,
    exploriumData,
    geminiCareerResult,
    geminiLinkedInResult,
    geminiCompanyNewsResult,
    geminiDeepResearchResult,
    claudeKnowledgeResult,
    gptKnowledgeResult,
  ] = await Promise.allSettled([

    // ── PERPLEXITY AGENTS (1-9) — web search threads ─────────────────────────
    perplexityPersonSearch(
      `Full professional background and career history of "${name}"${company ? ` at ${company}` : ""}${title ? `, ${title}` : ""} in Saudi Arabia. Include: ALL current and past roles with company names, dates, responsibilities, achievements, and key business decisions made.`,
      2500
    ),
    company ? perplexityPersonSearch(
      `Detailed company intelligence for ${company} in Saudi Arabia: founding year, founders, shareholders ownership structure, CEO and executive team full names with titles, revenue estimate, employee count, market position, key clients, recent contracts, competitors, Vision 2030 alignment, recent news 2024-2025.`,
      2500
    ) : Promise.resolve(""),
    perplexityPersonSearch(
      `Complete education and academic history of "${name}"${company ? ` executive at ${company}` : ""} Saudi Arabia: universities attended, degrees earned with field of study, graduation years, any scholarships, fellowships, or academic awards, international study abroad.`,
      1500
    ),
    perplexityPersonSearch(
      `Wealth profile and financial indicators for "${name}"${company ? ` at ${company}` : ""} Saudi Arabia: estimated net worth, company equity stake or shareholding percentage, known property and real estate, investments, board compensation, any public disclosures of financial interest.`,
      1500
    ),
    perplexityPersonSearch(
      `All board memberships, advisory roles, and governance positions of "${name}"${company ? ` from ${company}` : ""} Saudi Arabia: board director of which companies, committee memberships (audit, risk, compensation), government and regulatory advisory positions, non-profit or charity boards.`,
      1500
    ),
    perplexityPersonSearch(
      `Executive compensation benchmarks for ${title || "C-suite executive"} at ${company || "a Saudi company of this size"}: typical salary range, bonus structure, long-term incentives, equity/stock, LTIP, total compensation package. Include Saudi market benchmarks for this role level.`,
      1000
    ),
    perplexityPersonSearch(
      `Personal profile and public presence of "${name}"${company ? ` from ${company}` : ""} Saudi Arabia: hobbies, sports, philanthropic causes, public speeches, conference keynotes, media interviews, personality traits, known preferences, social media activity.`,
      1000
    ),
    perplexityPersonSearch(
      `Latest news, announcements, and public activities about "${name}"${company ? ` at ${company}` : ""} Saudi Arabia 2024-2025: business deals, partnerships, conference appearances, LinkedIn posts, awards, promotions, controversies, company news involving this person.`,
      1500
    ),
    perplexityPersonSearch(
      `LinkedIn profile URL for "${name}"${company ? ` who works at ${company}` : ""}${title ? ` as ${title}` : ""} Saudi Arabia. Return the full LinkedIn profile URL: linkedin.com/in/...`,
      500
    ),

    // ── CRAWL AGENTS ─────────────────────────────────────────────────────────
    linkedinUrl ? (async () => {
      try {
        const r = await crawl4ai(linkedinUrl);
        return r?.text?.slice(0, 5000) || "";
      } catch { return ""; }
    })() : Promise.resolve(""),
    (async () => {
      try {
        const siteUrl = requestedWebsiteUrl?.trim() || "";
        if (!siteUrl) return "";
        const result = await runWebSeeder(siteUrl, company || "", { maxPages: 8 });
        if (!result.success) return "";
        const parts: string[] = [];
        const agg = (result.aggregated || {}) as Record<string, unknown>;
        if (agg.company) parts.push(`Company overview: ${JSON.stringify(agg.company)}`);
        if (Array.isArray(agg.team) && (agg.team as unknown[]).length > 0)
          parts.push(`Team & leadership: ${JSON.stringify(agg.team)}`);
        if (Array.isArray(agg.services) && (agg.services as unknown[]).length > 0)
          parts.push(`Services/products: ${(agg.services as string[]).join(", ")}`);
        if (Array.isArray(agg.news) && (agg.news as unknown[]).length > 0)
          parts.push(`Recent news: ${JSON.stringify(agg.news)}`);
        if (Array.isArray(agg.projects) && (agg.projects as unknown[]).length > 0)
          parts.push(`Projects: ${JSON.stringify(agg.projects)}`);
        if (result.allEmails?.length) parts.push(`Emails found: ${result.allEmails.join(", ")}`);
        if (result.allPhones?.length) parts.push(`Phones found: ${result.allPhones.join(", ")}`);
        if (agg.intelligence) parts.push(`B2B signals: ${JSON.stringify(agg.intelligence)}`);
        return parts.length > 0
          ? `Company website multi-page intelligence (${result.pagesAnalyzed} pages crawled from ${siteUrl}):\n${parts.join("\n")}`
          : "";
      } catch { return ""; }
    })(),

    // ── EXTERNAL API AGENTS ───────────────────────────────────────────────────
    apolloPersonLookup(name, company, title),
    exploriumPersonLookup(name, company),

    // ── GEMINI AGENT A: Career & Professional History (always runs, gemini-2.5-flash) ──
    isGeminiConfigured()
      ? deepResearchWithGemini(
          `Research the career and professional history of "${name}"${company ? ` at ${company}` : ""}${title ? `, ${title}` : ""} in Saudi Arabia.\n\nFind:\n- All past and current job roles with exact company names, dates (month/year), and responsibilities\n- Education: universities, degrees, graduation years\n- Notable achievements, awards, promotions\n- Public statements, speeches, interviews\n- Shareholding or ownership stakes in any company\n- Board of directors positions (past and present)\n- Government or advisory roles`,
          "You are an elite Saudi Arabia B2B intelligence analyst. Use Google Search to find real, current information. Be specific with dates, names, and titles.",
          "gemini-2.5-flash"
        ).then(r => r?.text ?? null)
      : Promise.resolve(null),

    // ── GEMINI AGENT B: LinkedIn URL + Social Media Discovery (gemini-2.5-flash) ──
    isGeminiConfigured()
      ? deepResearchWithGemini(
          `Find the LinkedIn profile URL and all social media accounts for "${name}"${company ? ` who works at ${company}` : ""}${title ? ` as ${title}` : ""} in Saudi Arabia.\n\nSearch for:\n- LinkedIn profile URL (https://linkedin.com/in/...)\n- Twitter/X profile URL\n- Any public social media accounts\n- Profile photos or public images\n- Any personal website or blog\n\nAlso find their direct contact information if publicly available: email, phone, WhatsApp business.`,
          "You are a Saudi Arabia B2B intelligence researcher. Find real, verified social media profiles. Return full URLs.",
          "gemini-2.5-flash"
        ).then(r => r?.text ?? null)
      : Promise.resolve(null),

    // ── GEMINI AGENT C: Company Context & Recent News (gemini-2.5-flash) ──────
    isGeminiConfigured()
      ? deepResearchWithGemini(
          `Research the latest news and business activities involving "${name}"${company ? ` from ${company}` : ""} in Saudi Arabia (2023-2025).\n\nFind:\n- Recent business deals, contracts, tenders won\n- Partnerships or joint ventures announced\n- Conference appearances and keynote speeches\n- Press releases or media interviews\n- Any controversies or public incidents\n- Company performance and news about ${company || "their employer"}\n- Vision 2030 projects they are involved in\n- Any investment or funding activity`,
          "You are a Saudi Arabia B2B intelligence researcher. Use Google Search for current news and business activities. Include dates and sources.",
          "gemini-2.5-flash"
        ).then(r => r?.text ?? null)
      : Promise.resolve(null),

    // ── GEMINI AGENT D: Comprehensive Deep Dossier (gemini-2.5-flash) ─────────
    isGeminiConfigured()
      ? deepResearchWithGemini(
          `Comprehensive intelligence dossier on "${name}"${company ? ` at ${company}` : ""}${title ? `, ${title}` : ""} in Saudi Arabia.\n\nProvide everything you can find:\n- Full career history with all roles, dates, and companies\n- Education (universities, degrees, years)\n- Board memberships and advisory roles\n- LinkedIn profile URL: https://linkedin.com/in/...\n- Net worth estimate or equity stake in ${company || "company"}\n- Family background if publicly known\n- Personal interests, philanthropy, sports\n- Recent news or business activities 2024-2025\n- Public statements, conferences, awards\n- Relationships with government entities or Vision 2030`,
          "You are an elite Saudi Arabia B2B intelligence analyst. Research this person exhaustively using Google Search. Return all factual data found, clearly labeled by category.",
          "gemini-2.5-flash"
        ).then(r => r?.text ?? null)
      : Promise.resolve(null),

    // ── CLAUDE AGENT E: Training Knowledge Base (always runs) ────────────────
    Promise.race([
      (async () => {
        try {
          const msg = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 2000,
            system: "You are an elite Saudi Arabia B2B intelligence analyst. Extract ALL facts you know from your training data about the requested person. Be specific with dates, companies, titles, and LinkedIn URLs.",
            messages: [{
              role: "user",
              content: `From your training data, what do you know about "${name}"${company ? ` who works at ${company}` : ""}${title ? ` as ${title}` : ""} in Saudi Arabia?\n\nList ALL known facts:\n- Full name in English and Arabic\n- Current and all past job titles and companies (with dates)\n- Education: universities, degrees, graduation years\n- LinkedIn profile URL (https://linkedin.com/in/...)\n- Twitter/X or other social media\n- Board memberships and advisory roles\n- Ownership stakes or shareholding in any company\n- Estimated net worth or compensation\n- Notable achievements, awards, or public recognition\n- Conference appearances or keynote speeches\n- Published articles or media interviews\n- Personal interests, philanthropy, sports\n- Family background (if publicly known)\n- Relationships with Vision 2030 projects or government\n\nInclude everything you know — even partial facts. Label uncertain information clearly.`,
            }],
          });
          return msg.content[0]?.type === "text" ? msg.content[0].text : null;
        } catch { return null; }
      })(),
      new Promise<null>(r => setTimeout(() => r(null), 18000)),
    ]),

    // ── GPT-4o AGENT F: Training Knowledge Base (always runs) ────────────────
    Promise.race([
      (async () => {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are an elite Saudi Arabia B2B intelligence analyst. Extract ALL facts you know from your training data about the requested person. Be specific with dates, companies, titles, and LinkedIn URLs.",
              },
              {
                role: "user",
                content: `From your training data, what do you know about "${name}"${company ? ` who works at ${company}` : ""}${title ? ` as ${title}` : ""} in Saudi Arabia?\n\nList ALL known facts:\n- Full name in English and Arabic\n- Current and all past job titles and companies (with dates)\n- Education: universities, degrees, graduation years\n- LinkedIn profile URL (https://linkedin.com/in/...)\n- Board memberships and advisory roles\n- Ownership stakes in any company\n- Notable achievements, awards, or public recognition\n- Conference appearances or media interviews\n- Personal interests or philanthropy\n\nInclude everything you know. Label uncertain information clearly.`,
              },
            ],
            max_completion_tokens: 2000,
          });
          return completion.choices[0]?.message?.content ?? null;
        } catch { return null; }
      })(),
      new Promise<null>(r => setTimeout(() => r(null), 18000)),
    ]),
  ]);

  // ── DeepResearch (o4-mini) — run AFTER the parallel batch ─────────────────
  const deepResearchText = await Promise.race([
    deepResearchPerson(name, company, title),
    new Promise<string>(r => setTimeout(() => r(""), 10000)),
  ]);

  // ── Helper to safely extract settled value ───────────────────────────────
  const val = (r: PromiseSettledResult<string>) => (r.status === "fulfilled" ? r.value : "") as string;
  const gval = (r: PromiseSettledResult<string | null>) => (r.status === "fulfilled" && r.value ? r.value : "") as string;

  // Extract all Gemini results
  const geminiCareerText      = gval(geminiCareerResult);
  const geminiLinkedInText    = gval(geminiLinkedInResult);
  const geminiCompanyNewsText = gval(geminiCompanyNewsResult);
  const geminiDeepText        = gval(geminiDeepResearchResult);
  const claudeKnowledgeText   = gval(claudeKnowledgeResult);
  const gptKnowledgeText      = gval(gptKnowledgeResult);

  // Discover LinkedIn URL — check Perplexity, Gemini LinkedIn agent, Claude, and GPT-4o
  const linkedInDiscovery = val(perplexityLinkedIn) || geminiLinkedInText || claudeKnowledgeText || gptKnowledgeText;
  const discoveredLinkedInUrl = !linkedinUrl ? (linkedInDiscovery.match(/linkedin\.com\/in\/[^\s"',>)]+/)?.[0] || "") : "";
  const effectiveLinkedInUrl = linkedinUrl || (discoveredLinkedInUrl ? `https://${discoveredLinkedInUrl.replace(/^https?:\/\//, "")}` : "");

  const geminiHits = [geminiCareerText, geminiLinkedInText, geminiCompanyNewsText, geminiDeepText].filter(Boolean).length;
  const aiKnowledgeHits = [claudeKnowledgeText, gptKnowledgeText].filter(Boolean).length;
  console.log(`[PersonIntel] Sources — perplexity: ${[val(perplexityProfile),val(perplexityCompany),val(perplexityEducation),val(perplexityWealth),val(perplexityBoard)].filter(Boolean).length}/9, gemini: ${geminiHits}/4 agents, aiKnowledge: ${aiKnowledgeHits}/2 (claude+gpt4o), linkedIn: ${effectiveLinkedInUrl ? "found" : "not found"}`);

  const sources = [
    val(perplexityProfile)   ? "Perplexity: professional background" : "",
    val(perplexityCompany)   ? "Perplexity: company intel" : "",
    val(perplexityEducation) ? "Perplexity: education" : "",
    val(perplexityWealth)    ? "Perplexity: wealth & financial" : "",
    val(perplexityBoard)     ? "Perplexity: board memberships" : "",
    val(perplexityCompensation) ? "Perplexity: compensation" : "",
    val(perplexityInterests) ? "Perplexity: personal profile" : "",
    val(perplexityNews)      ? "Perplexity: recent news" : "",
    val(perplexityLinkedIn)  ? "Perplexity: LinkedIn discovery" : "",
    val(linkedinText)        ? "LinkedIn profile page crawl" : "",
    val(companyWebsiteCrawl) ? "Company website crawl (team/about pages)" : "",
    val(apolloData)          ? "Apollo.io" : "",
    val(exploriumData)       ? "Explorium" : "",
    geminiCareerText         ? "Gemini Agent A: Career & Professional History (Google Search)" : "",
    geminiLinkedInText       ? "Gemini Agent B: LinkedIn & Social Media Discovery (Google Search)" : "",
    geminiCompanyNewsText    ? "Gemini Agent C: Company Context & Recent News (Google Search)" : "",
    geminiDeepText           ? "Gemini Agent D: Comprehensive Deep Dossier (Google Search)" : "",
    claudeKnowledgeText      ? "Claude Agent E: Training Knowledge Base" : "",
    gptKnowledgeText         ? "GPT-4o Agent F: Training Knowledge Base" : "",
    deepResearchText         ? "DeepResearchAgent (o4-mini)" : "",
  ].filter(Boolean);

  const sections = [
    val(perplexityProfile)      ? `=== SOURCE 1: WEB SEARCH — Professional Background & Career ===\n${val(perplexityProfile)}` : "",
    val(perplexityCompany)      ? `=== SOURCE 2: WEB SEARCH — Company Intelligence ===\n${val(perplexityCompany)}` : "",
    val(perplexityEducation)    ? `=== SOURCE 3: WEB SEARCH — Education & Academic Background ===\n${val(perplexityEducation)}` : "",
    val(perplexityWealth)       ? `=== SOURCE 4: WEB SEARCH — Wealth & Financial Profile ===\n${val(perplexityWealth)}` : "",
    val(perplexityBoard)        ? `=== SOURCE 5: WEB SEARCH — Board Memberships & Advisory Roles ===\n${val(perplexityBoard)}` : "",
    val(perplexityCompensation) ? `=== SOURCE 6: WEB SEARCH — Compensation Benchmarks ===\n${val(perplexityCompensation)}` : "",
    val(perplexityInterests)    ? `=== SOURCE 7: WEB SEARCH — Personal Profile & Interests ===\n${val(perplexityInterests)}` : "",
    val(perplexityNews)         ? `=== SOURCE 8: WEB SEARCH — Recent News & Public Statements ===\n${val(perplexityNews)}` : "",
    val(perplexityLinkedIn)     ? `=== SOURCE 9: WEB SEARCH — LinkedIn URL Discovery ===\n${val(perplexityLinkedIn)}${effectiveLinkedInUrl ? `\nDISCOVERED URL: ${effectiveLinkedInUrl}` : ""}` : "",
    val(linkedinText)           ? `=== SOURCE 10: LINKEDIN PROFILE PAGE (crawled) ===\n${val(linkedinText)}` : "",
    val(companyWebsiteCrawl)    ? `=== SOURCE 11: COMPANY WEBSITE (Team / About / Leadership pages) ===\n${val(companyWebsiteCrawl)}` : "",
    val(apolloData)             ? `=== SOURCE 12: APOLLO.IO VERIFIED DATA ===\n${val(apolloData)}` : "",
    val(exploriumData)          ? `=== SOURCE 13: EXPLORIUM FIRMOGRAPHIC DATA ===\n${val(exploriumData)}` : "",
    geminiCareerText            ? `=== SOURCE 14: GEMINI AGENT A — Career & Professional History (Google Search) ===\n${geminiCareerText}` : "",
    geminiLinkedInText          ? `=== SOURCE 15: GEMINI AGENT B — LinkedIn & Social Media Discovery (Google Search) ===\n${geminiLinkedInText}` : "",
    geminiCompanyNewsText       ? `=== SOURCE 16: GEMINI AGENT C — Company Context & Recent News (Google Search) ===\n${geminiCompanyNewsText}` : "",
    geminiDeepText              ? `=== SOURCE 17: GEMINI AGENT D — Comprehensive Deep Dossier (Google Search) ===\n${geminiDeepText}` : "",
    claudeKnowledgeText         ? `=== SOURCE 18: CLAUDE AGENT E — Training Knowledge Base ===\n${claudeKnowledgeText}` : "",
    gptKnowledgeText            ? `=== SOURCE 19: GPT-4o AGENT F — Training Knowledge Base ===\n${gptKnowledgeText}` : "",
    deepResearchText            ? `=== SOURCE 20: DEEP RESEARCH AGENT (o4-mini) ===\n${deepResearchText}` : "",
  ].filter(Boolean);

  const aggregatedIntelligence = sections.join("\n\n").slice(0, 20000);
  const hasRealData = sections.length > 0;

  const synthesisPrompt = `You are an elite Saudi Arabia B2B intelligence analyst. Generate the most detailed, specific, and actionable intelligence dossier for this individual.

TARGET:
- Name: ${name}${company ? `\n- Company: ${company}` : ""}${title ? `\n- Title: ${title}` : ""}${effectiveLinkedInUrl ? `\n- LinkedIn: ${effectiveLinkedInUrl}` : ""}
- Country: ${country}
${sellerSection}
${knownSection}

REQUESTED INTELLIGENCE: ${goalsList}

${aggregatedIntelligence ? `AGGREGATED INTELLIGENCE FROM ${sections.length} RESEARCH SOURCES:\n${aggregatedIntelligence}` : "No live data available — use Saudi market knowledge and label all inferences clearly."}

SYNTHESIS RULES (MANDATORY — follow all):
1. CROSS-REFERENCE ALL SOURCES: A fact confirmed by TWO OR MORE sources (e.g., Source 1 and Source 14) is a verified fact. Always check Sources 14-20 (Gemini, Claude, GPT-4o agents) in addition to Perplexity.
2. LINKEDIN URL: Check Sources 9, 15 (Gemini LinkedIn), 17 (Gemini dossier), 18 (Claude), and 19 (GPT-4o) for a LinkedIn URL. If found in ANY source, use it in profile.linkedin.
3. CONFIRMED FACTS: In verified_facts, only include facts present in the research above. Cite the specific source number.
4. ESTIMATES: Label all inferences as "Estimated:" in text AND add to estimated_facts. Use source context to make estimates reasonable.
5. NOT FOUND: Only set "Not found" after checking ALL 20 sources. Never hallucinate.
6. SPECIFICITY: Use exact numbers, dates, role titles, company names from research. Never use generic phrases.
7. AI KNOWLEDGE SOURCES: Sources 18 (Claude) and 19 (GPT-4o) contain training-data knowledge — treat as supplementary intelligence. Cross-reference with live web search sources (1-17) for verification.
8. REJECT GENERIC: "Experienced executive" or "strong leader" without specific evidence from a source is unacceptable.
9. CAREER: Populate career array using ALL sources — Perplexity (Source 1), Gemini Career Agent (Source 14), Gemini Deep Dossier (Source 17), Claude (Source 18), GPT-4o (Source 19). Order from most recent to oldest.

Return a JSON object with EXACTLY this structure. Use "Not found" for missing fields — never null for text fields:

{
  "profile": {
    "fullName": "Full formal name",
    "arabicName": "Arabic name if found in research or Not found",
    "title": "Current primary title",
    "company": "Current primary company",
    "nationality": "Nationality if found or Not found",
    "location": "City, Country if found",
    "age": age as integer or null,
    "linkedin": "LinkedIn URL if known or Not found"
  },
  "career": [
    { "company": "Name", "title": "Role", "period": "YYYY – YYYY or Present", "description": "Specific achievements from research — not generic" }
  ],
  "education": [
    { "institution": "University name", "degree": "Degree and field", "year": "Year or period" }
  ],
  "company_analysis": {
    "name": "Company",
    "industry": "Industry",
    "founded": "Year or Not found",
    "headquarters": "City, Country or Not found",
    "employees": "Specific count from research or Not found",
    "revenue_estimate": "Revenue from research or Not found",
    "performance": "Specific performance data from research",
    "market_position": "Market positioning from research",
    "key_clients": ["Client 1 from research"],
    "recent_developments": "Recent news from research",
    "competitors": ["Competitor 1 from research"],
    "pain_points": ["Specific pain point inferred from company situation"]
  },
  "wealth_profile": {
    "estimated_net_worth": "From research or Estimated: [range] based on [reasoning]",
    "income_estimate": "From research or Estimated: [range] based on [role/company]",
    "wealth_sources": ["Source from research"],
    "assets": "From research or Not found",
    "investments": "From research or Not found",
    "lifestyle_indicators": "From research or Not found"
  },
  "personal_profile": {
    "interests": ["Interest from research or Not found"],
    "personality_traits": ["Trait inferred from public behavior"],
    "communication_style": "From public statements or Not found",
    "languages": ["Arabic", "English"],
    "board_memberships": ["Board from research or Not found"],
    "publications": ["Publication if found in research or Not found"],
    "awards": ["Award from research or Not found"],
    "social_presence": "From research or Not found"
  },
  "approach_strategy": {
    "best_channel": "Primary channel based on research",
    "best_timing": "Timing insight from research",
    "opening_angle": "Specific, personalized opening based on research data",
    "value_proposition": "Precisely tailored to their role and company situation",
    "potential_objections": ["Objection from company/industry context"],
    "conversation_starters": ["Topic grounded in research"],
    "cultural_notes": "Saudi business culture considerations specific to this person",
    "recommended_approach": "Full 3-4 paragraph tailored outreach strategy${sellerContext?.companyName ? `, selling ${sellerContext?.product || "your product"} from ${sellerContext?.companyName}` : ""}",
    "sample_message": "A ready-to-send, personalized first outreach message grounded in the research"
  },
  "intelligence_notes": {
    "confidence_level": "High / Medium / Low — based on data availability",
    "data_sources": ${JSON.stringify(sources.length > 0 ? sources : ["AI knowledge base"])},
    "verified_facts": ["Only facts confirmed in research sources above"],
    "estimated_facts": ["Fact 1 that is intelligent inference — label clearly"],
    "caveats": "Important accuracy caveats based on data quality"
  }
}

Return valid JSON only. No markdown. No explanatory text.`;

  try {
    // ── Synthesis: Gemini (1st) + Claude (2nd) + GPT-4o (3rd) in parallel ──
    const INTEL_SYSTEM = "You are an elite Saudi Arabia B2B intelligence analyst. Return valid JSON only. Be maximally specific and actionable. Ground all facts in the provided research data. Use 'Not found' for missing fields — never hallucinate. Distinguish clearly between confirmed public knowledge and intelligent inference.";

    const cappedSynthPrompt = synthesisPrompt;
    const synthTimeout = (p: Promise<string | null>) =>
      Promise.race([p, new Promise<null>(r => setTimeout(() => r(null), 30000))]);

    const [geminiResult, claudeResult, gptResult] = await Promise.allSettled([
      isGeminiConfigured()
        ? synthesizeWithGemini(cappedSynthPrompt, INTEL_SYSTEM, "gemini-2.5-flash")
        : Promise.resolve(null),
      synthTimeout((async () => {
        try {
          const msg = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 4000,
            system: INTEL_SYSTEM,
            messages: [{ role: "user", content: cappedSynthPrompt }],
          });
          return msg.content[0]?.type === "text" ? msg.content[0].text : null;
        } catch { return null; }
      })()),
      synthTimeout((async () => {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: INTEL_SYSTEM },
              { role: "user", content: cappedSynthPrompt },
            ],
            max_completion_tokens: 4000,
          });
          return completion.choices[0]?.message?.content ?? null;
        } catch { return null; }
      })()),
    ]);

    // Priority: Gemini first, then Claude, then GPT-4o
    const getVal = (r: PromiseSettledResult<string | null>) =>
      r.status === "fulfilled" && r.value ? r.value : null;
    const raw = getVal(geminiResult) ?? getVal(claudeResult) ?? getVal(gptResult) ?? "{}";

    let parsed: Record<string, unknown>;
    try {
      const s = raw.indexOf("{"); const e = raw.lastIndexOf("}");
      parsed = JSON.parse(s !== -1 ? raw.slice(s, e + 1) : raw);
    } catch {
      parsed = {
        profile: { fullName: name, company, title },
        intelligence_notes: {
          confidence_level: "Low",
          data_sources: sources.length > 0 ? sources : ["AI knowledge base"],
          verified_facts: [],
          estimated_facts: [],
          caveats: "Parsing error — please retry.",
        },
      };
    }

    // Inject discovered LinkedIn URL if AI didn't find it
    if (effectiveLinkedInUrl) {
      const prof = parsed.profile as Record<string, unknown> | undefined;
      if (prof && (!prof.linkedin || prof.linkedin === "Not found")) {
        prof.linkedin = effectiveLinkedInUrl;
      }
    }

    // Attach pipeline metadata for UI
    (parsed as Record<string, unknown>)._pipelineStats = {
      sourcesUsed: sources,
      hasRealData,
      researchThreads: sections.length,
      geminiAgents: geminiHits,
      discoveredLinkedIn: effectiveLinkedInUrl || null,
    };

    res.json(parsed);
  } catch (err) {
    console.error("[PersonIntel] profile error:", err);
    res.status(500).json({ error: "Failed to generate profile" });
  }
});

// ─── POST /person-intel/save ──────────────────────────────────────────────────
router.post("/person-intel/save", async (req: Request, res: Response): Promise<void> => {
  const { personName, company, title, linkedinUrl, sellerContext, intelligenceGoals, knownFacts, report, tags, notes } = req.body as {
    personName: string; company?: string; title?: string; linkedinUrl?: string;
    sellerContext?: object; intelligenceGoals?: string[]; knownFacts?: string;
    report: object; tags?: string; notes?: string;
  };
  if (!personName || !report) { res.status(400).json({ error: "personName and report required" }); return; }
  try {
    const [row] = await db.insert(prosengineResearchTable).values({
      personName,
      company: company ?? null,
      title: title ?? null,
      linkedinUrl: linkedinUrl ?? null,
      sellerContext: sellerContext ? JSON.stringify(sellerContext) : null,
      intelligenceGoals: intelligenceGoals ? JSON.stringify(intelligenceGoals) : null,
      knownFacts: knownFacts ?? null,
      report: JSON.stringify(report),
      tags: tags ?? null,
      notes: notes ?? null,
    }).returning();
    res.json(row);

    // ── Auto-seed into ProsEngine Watchlist (AI Hunt standing list) ────────────
    setImmediate(async () => {
      try {
        const WATCHLIST_NAME = "ProsEngine Watchlist";
        // Find or create the standing watchlist
        let [watchlist] = await db.select().from(leadListsTable)
          .where(eq(leadListsTable.name, WATCHLIST_NAME))
          .limit(1);
        if (!watchlist) {
          [watchlist] = await db.insert(leadListsTable).values({
            name: WATCHLIST_NAME,
            criteria: JSON.stringify({ sources: ["prosengine"], personTypes: [], industries: [], cities: [], revenueRange: "any", employeeMin: 0, employeeMax: 99999, compensationRange: "any", requiredPersonFields: [], requiredCompanyFields: [], maxLeads: 9999 }),
            status: "done",
            totalFound: 0,
            sourcesSearched: JSON.stringify(["prosengine"]),
          }).returning();
        }

        // Extract any available data from report for enriching the item
        let linkedin = linkedinUrl ?? null;
        let biography: string | null = null;
        try {
          const rpt = typeof report === "string" ? JSON.parse(report) : report as Record<string, unknown>;
          const prof = (rpt as Record<string, unknown>).profile as Record<string, unknown> | undefined;
          if (prof?.linkedin && typeof prof.linkedin === "string" && prof.linkedin !== "Not found") linkedin = prof.linkedin;
          biography = (rpt as Record<string, unknown>).executive_summary as string ?? null;
        } catch { /* non-fatal */ }

        await db.insert(leadListItemsTable).values({
          listId: watchlist.id,
          personName,
          personTitle: title ?? null,
          biography,
          linkedin,
          companyName: company ?? null,
          source: "prosengine",
          sourceId: `pe_${row.id}`,
          matchScore: 80,
          aiScore: 80,
          aiReasoning: "Manually added from ProsEngine Research — high-priority watchlist lead",
        });

        // Update total count
        const [cnt] = await db.select({ c: sql<number>`count(*)::int` }).from(leadListItemsTable).where(eq(leadListItemsTable.listId, watchlist.id));
        await db.update(leadListsTable).set({ totalFound: cnt?.c ?? 0, updatedAt: new Date() }).where(eq(leadListsTable.id, watchlist.id));
        console.log(`[PersonIntel] Auto-seeded ${personName} into "${WATCHLIST_NAME}" list`);
      } catch (seedErr) {
        console.warn("[PersonIntel] Watchlist seed error:", (seedErr as Error).message);
      }
    });
  } catch (err) {
    console.error("[PersonIntel] save error:", err);
    res.status(500).json({ error: "Failed to save research" });
  }
});

// ─── GET /person-intel/saved ──────────────────────────────────────────────────
router.get("/person-intel/saved", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(prosengineResearchTable).orderBy(desc(prosengineResearchTable.createdAt));
    res.json(rows);
  } catch (err) {
    console.error("[PersonIntel] list error:", err);
    res.status(500).json({ error: "Failed to load saved research" });
  }
});

// ─── POST /person-intel/quick — Fast Claude-only enrichment (for lead saving) ─
router.post("/person-intel/quick", async (req: Request, res: Response): Promise<void> => {
  const { name, company, title } = req.body as { name: string; company?: string; title?: string };
  if (!name?.trim()) { res.status(400).json({ error: "Name is required" }); return; }

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `You are a Saudi B2B intelligence researcher. Generate a quick enrichment profile for this person based on your training knowledge.

Person: ${name}
${company ? `Company: ${company}` : ""}
${title ? `Title: ${title}` : ""}
Country: Saudi Arabia

Return ONLY a JSON object with these fields (use null for unknown):
{
  "email": "best-guess email pattern or null",
  "phone": "best-guess phone or null",
  "linkedin": "LinkedIn URL or null",
  "nationality": "nationality or null",
  "bio": "1-2 sentence professional bio based on role",
  "industry": "industry sector",
  "city": "likely city in Saudi Arabia or null",
  "seniority": "C-Level|VP|Director|Manager|Staff",
  "companySize": "estimated company size if known",
  "revenue": "estimated company revenue range if known"
}`,
      }],
    });

    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const profile = jsonMatch ? JSON.parse(jsonMatch[0]) as Record<string, unknown> : {};
    res.json({ ok: true, profile });
  } catch (err) {
    console.error("[PersonIntel/quick] error:", err);
    res.status(500).json({ error: "Quick enrichment failed" });
  }
});

// ─── DELETE /person-intel/saved/:id ──────────────────────────────────────────
router.delete("/person-intel/saved/:id", async (req: Request, res: Response): Promise<void> => {
  const rawId = req.params["id"];
  const id = parseInt(typeof rawId === "string" ? rawId : rawId[0]);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(prosengineResearchTable).where(eq(prosengineResearchTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    console.error("[PersonIntel] delete error:", err);
    res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
