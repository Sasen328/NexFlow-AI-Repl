/**
 * Masaar — Saudi Commercial Registration intelligence pipeline.
 *
 * Original spec calls for a 7-agent stealth-browser pipeline against
 * mc.gov.sa, emagazine.aamaly.sa, and najiz.sa with AI-powered CAPTCHA
 * solving. We don't have direct Gemini/Anthropic/Perplexity API keys in
 * this environment — only OpenRouter — and the Saudi gov sites require
 * residential-IP stealth browsing that's brittle from a server.
 *
 * So this implementation:
 *   1. Tries the Node Cheerio/Playwright scraper against the public AOA
 *      registry (best-effort; emagazine often serves the search page).
 *   2. Runs 6 parallel AI research queries through OpenRouter:
 *        - Perplexity ×3 (live web search) — profile, ownership, leadership
 *        - Gemini grounded ×2              — recent news, financial signals
 *        - Claude (synthesis) ×1           — bilingual structured fields
 *   3. Asks Claude to cross-validate sources and surface conflicts.
 *   4. Asks Claude (primary) + GPT-4o (fallback) to compile bilingual
 *      EN+AR markdown reports.
 *
 * The result conforms to the MasaarReport shape from the original spec
 * so downstream UI/consumers don't need to special-case the simplified
 * pipeline.
 */

import { fanOut, searchWeb, searchGrounded, synthesizeJson, synthesizeClaude, synthesizeGpt } from "./_ai.js";
import { scraperFetch } from "../enrichment/connectors/web-scraper.js";
import { logger } from "../logger.js";
import type { MasaarInput, MasaarReport } from "./types.js";

const EMPTY_REPORT_DEFAULTS = {
  profile: {
    nameEn: null, nameAr: null, crNumber: null, legalForm: null,
    legalFormAr: null, headquarterCity: null, foundingYear: null,
    capitalAmount: null, estimatedRevenue: null, industry: null,
    summaryEn: "", summaryAr: "",
    contactDetails: {} as Record<string, string>,
    shareholders: [] as MasaarReport["parsed"]["shareholders"],
    managers: [] as MasaarReport["parsed"]["managers"],
  },
};

function isLikelyCr(s: string | undefined): s is string {
  return !!s && /^\d{10}$/.test(s.trim());
}

/** Best-effort AOA URL discovery via the public emagazine search page. */
async function tryAoaSearch(name: string | undefined): Promise<{ ok: boolean; aoaUrls: string[]; note: string }> {
  if (!name || name.length < 3) return { ok: false, aoaUrls: [], note: "no name to search" };
  try {
    const url = `https://emagazine.aamaly.sa/search?q=${encodeURIComponent(name)}`;
    const r = await scraperFetch(url, "cheerio");
    if (!r.ok || !r.html) return { ok: false, aoaUrls: [], note: r.error ?? "fetch failed" };
    // Very tolerant — just pull anchor hrefs that look like article/PDF links
    const aoaUrls = Array.from(
      new Set(
        (r.html.match(/href="([^"]*(?:\.pdf|\/article\/[^"]*))"/gi) ?? [])
          .map((m) => m.replace(/^href="/, "").replace(/"$/, ""))
          .map((href) => href.startsWith("http") ? href : `https://emagazine.aamaly.sa${href}`)
          .slice(0, 5),
      ),
    );
    return { ok: aoaUrls.length > 0, aoaUrls, note: aoaUrls.length ? `${aoaUrls.length} candidate AOA links` : "no AOA links found" };
  } catch (e: any) {
    return { ok: false, aoaUrls: [], note: e?.message ?? "scraper threw" };
  }
}

export async function runMasaarPipeline(input: MasaarInput): Promise<MasaarReport> {
  const cr = isLikelyCr(input.crNumber) ? input.crNumber!.trim() : null;
  const seedName = input.nameEn ?? input.nameAr ?? null;
  const sources: MasaarReport["sources"] = {};

  logger.info({ scope: "masaar", cr, seedName }, "starting Masaar pipeline");

  // ── Stage 1: kick off scraper (AOA) + fan-out web research in parallel
  const queryLabel = cr
    ? `Saudi CR ${cr}`
    : seedName ?? "[no input]";

  const research = fanOut([
    {
      name: "perplexity_profile",
      run: () =>
        searchWeb(
          `Saudi company ${queryLabel}: official commercial registration number, legal form, headquarters city, founding year, paid-up capital (SAR), main activity, website, phone, address. Cite official Saudi sources (mc.gov.sa, Wathiq, Tadawul, Aamaly emagazine) when possible.`,
        ),
    },
    {
      name: "perplexity_ownership",
      run: () =>
        searchWeb(
          `Saudi company ${queryLabel}: shareholders and ownership structure with names (English + Arabic) and ownership percentages from Articles of Association on emagazine.aamaly.sa or mc.gov.sa.`,
        ),
    },
    {
      name: "perplexity_leadership",
      run: () =>
        searchWeb(
          `Saudi company ${queryLabel}: current CEO, board chairman, CFO, GM, executive team and board members (English + Arabic names if available).`,
        ),
    },
    {
      name: "gemini_news",
      run: () =>
        searchGrounded(
          `Latest 2025-2026 news, contracts, financial results, funding, M&A, lawsuits, regulatory actions involving Saudi company ${queryLabel}.`,
        ),
    },
    {
      name: "gemini_financials",
      run: () =>
        searchGrounded(
          `Saudi company ${queryLabel}: estimated annual revenue (SAR), employee count, EBITDA, growth rate, key clients. Use Tadawul filings if listed.`,
        ),
    },
  ]);

  const aoaPromise = tryAoaSearch(seedName ?? undefined);

  const [results, aoaResult] = await Promise.all([research, aoaPromise]);
  sources.emagazine = { ok: aoaResult.ok, aoaUrls: aoaResult.aoaUrls, note: aoaResult.note };
  sources.mcGovSa = { ok: false, note: "stealth browser to mc.gov.sa not enabled in this environment — using AI research instead" };
  sources.najiz = { ok: false, note: "najiz.sa lookup not available — included in research synthesis" };
  sources.perplexity = { ok: results.some((r) => r.name.startsWith("perplexity_") && r.ok), note: "live web search" };
  sources.gemini = { ok: results.some((r) => r.name.startsWith("gemini_") && r.ok), note: "Google grounded search" };

  const researchBundle = results
    .filter((r) => r.ok && r.value)
    .map((r) => `## ${r.name}\n${r.value}`)
    .join("\n\n");

  // ── Stage 2: structured field extraction
  const parsed = await synthesizeJson<MasaarReport["parsed"]>({
    system:
      "You parse multi-source Saudi commercial registry research into a strict JSON record. Always return JSON. Use null for missing scalar fields, [] for missing arrays. Preserve Arabic exactly as written. Never invent CR numbers or capital amounts.",
    user: `Input:
- crNumber: ${cr ?? "(unknown)"}
- nameEn: ${input.nameEn ?? "(unknown)"}
- nameAr: ${input.nameAr ?? "(unknown)"}

Multi-source research:
${researchBundle || "(no research returned)"}

Return JSON with fields: nameEn, nameAr, crNumber, legalForm, legalFormAr, headquarterCity, foundingYear, capitalAmount, estimatedRevenue, industry, summaryEn (1-2 sentences), summaryAr (1-2 sentences in Arabic), contactDetails (object: website, phone, email, address), shareholders (array of {nameEn, nameAr, ownershipPct, nationality, type}), managers (array of {nameEn, nameAr, title, appointmentTerm, powers}).`,
    fallback: { ...EMPTY_REPORT_DEFAULTS.profile, crNumber: cr } as MasaarReport["parsed"],
    preferredProvider: "anthropic",
    maxTokens: 3500,
  });

  // ── Stage 3: cross-validation pass (Claude)
  const conflictsRaw = await synthesizeClaude({
    system: "You compare facts across multiple Saudi corporate sources and flag conflicts. Return ONLY a JSON array.",
    user: `Compare the parsed structured fields below against the raw research bundle. Flag any field where two sources disagree (e.g. different capital amounts, different shareholder percentages). Return [] if nothing conflicts.

Parsed: ${JSON.stringify(parsed)}

Research:
${researchBundle.slice(0, 6000)}

Output: JSON array of {field, source1, value1, source2, value2, severity ("high"|"medium"|"low")}`,
    maxTokens: 1500,
  });

  let conflicts: MasaarReport["conflicts"] = [];
  try {
    // Tolerate ```json fences, plain text, or raw arrays — pull the first [...]
    const cleaned = conflictsRaw.replace(/```(?:json)?/gi, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
    const parsedArr = JSON.parse(slice);
    if (Array.isArray(parsedArr)) conflicts = parsedArr.slice(0, 20);
  } catch { /* ignore — not a hard failure */ }

  // ── Stage 4: bilingual report (Claude primary, GPT fallback)
  const reportEn = await synthesizeClaude({
    system: "You are a senior Saudi B2B intelligence analyst. Write a polished English markdown report.",
    user: `Compile a comprehensive English markdown report on the Saudi company below. Sections: Overview, Legal & Registration, Ownership Structure, Leadership, Financials & Capital, Operations & Industry, Recent News, Risk Factors, Recommended Approach. Be specific. Cite source agents inline like "(Perplexity)" or "(Gemini Search)" where used. If a field is unknown, say so plainly.

Parsed: ${JSON.stringify(parsed, null, 2)}

Research bundle:
${researchBundle}

Conflicts found: ${JSON.stringify(conflicts)}`,
    maxTokens: 3000,
  });

  let reportEnFinal = reportEn;
  if (!reportEnFinal || reportEnFinal.length < 200) {
    reportEnFinal = await synthesizeGpt({
      system: "You are a senior Saudi B2B intelligence analyst writing in markdown.",
      user: `Compile English intelligence report on: ${queryLabel}\n\nData:\n${JSON.stringify(parsed)}\n\nResearch:\n${researchBundle.slice(0, 4000)}`,
      maxTokens: 2200,
    });
  }

  const reportAr = await synthesizeClaude({
    system: "أنت محلل استخبارات أعمال سعودي. اكتب تقريراً مفصلاً بصيغة ماركداون بالعربية.",
    user: `قم بتجميع تقرير استخباراتي شامل بالعربية عن الشركة السعودية أدناه. أقسام: نظرة عامة، التسجيل القانوني، هيكل الملكية، القيادة، البيانات المالية، العمليات والصناعة، الأخبار الأخيرة، عوامل المخاطر، نهج التواصل المقترح. كن محدداً.

البيانات المنظمة: ${JSON.stringify(parsed, null, 2)}

البحث:
${researchBundle.slice(0, 6000)}`,
    maxTokens: 3000,
  });

  return {
    crNumber: cr,
    fetchedAt: new Date().toISOString(),
    sources,
    parsed: parsed,
    conflicts,
    reportEn: reportEnFinal || "(English report could not be generated — AI synthesis failed for all providers.)",
    reportAr: reportAr || "(لم يتم إنشاء التقرير العربي — فشلت عملية التركيب للذكاء الاصطناعي لجميع المزودين.)",
  };
}
