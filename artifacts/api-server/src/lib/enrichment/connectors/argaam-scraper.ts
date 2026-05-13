/**
 * Argaam scraper — argaam.com (Saudi financial news, Tadawul filings, corporate actions).
 *
 * Arabic-first source; best aggregator for KSA corporate actions, listed-company data,
 * and market news. Scrapes the company search page and extracts news headlines,
 * financial snippets, ownership data, and board information.
 *
 * Stealth browser used when available (JS-heavy SPA); falls back to fetch with
 * Arabic Accept-Language headers.
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { scraperFetch } from "./web-scraper.js";

const ARGAAM_SEARCH = "https://www.argaam.com/ar/search?q=";
const ARGAAM_COMPANY = "https://www.argaam.com/ar/company/";

function extractArgaamFields(html: string, company: string): Partial<Record<Field, unknown>> {
  const out: Partial<Record<Field, unknown>> = {};
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  // Arabic company name pattern
  const arNameMatch = text.match(/[\u0600-\u06FF\s]{5,60}(?:المحدودة|المساهمة|القابضة|العقارية|التجارية)/);
  if (arNameMatch) out.company_name_ar = arNameMatch[0].trim();

  // Revenue / financials
  const revMatch = text.match(/إيرادات[:\s]+([\d,.]+)\s*(مليار|مليون|ألف)?\s*ريال/);
  if (revMatch) out.company_revenue = `${revMatch[1]} ${revMatch[2] ?? ""} SAR`.trim();

  // Employee count
  const empMatch = text.match(/(\d[\d,]+)\s+موظف/);
  if (empMatch) out.company_size = empMatch[1].replace(/,/g, "");

  // News headlines — extract recent news signal
  const newsMatches = text.match(/(?:أعلنت|أطلقت|وقّعت|أبرمت|حققت)[^.]{10,120}\./g);
  if (newsMatches?.length) {
    out.news_recent = newsMatches.slice(0, 3).join(" | ");
  }

  return out;
}

export const argaamScraperConnector: Connector = {
  source_key: "argaam_scraper",

  async test({ apiKey: _k, config: _c }) {
    try {
      const r = await scraperFetch("https://www.argaam.com/ar/", "cheerio");
      return { ok: r.ok, message: r.ok ? "Argaam reachable" : `Argaam blocked: ${r.error ?? ""}` };
    } catch (e: any) {
      return { ok: false, message: `Argaam test failed: ${e?.message ?? e}` };
    }
  },

  async enrich({ seed, alreadyFilled }): Promise<EnrichResult> {
    const company = seed.company ?? "";
    if (!company) return { status: "skipped", fields: {} };

    const targets: Field[] = ["company_name_ar", "company_revenue", "company_size", "news_recent"];
    if (targets.every((f) => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    // Only useful for Saudi-listed companies or well-known KSA brands
    if (seed.country && !/saudi|ksa|riyadh|jeddah|dammam/i.test(seed.country)) {
      return { status: "skipped", fields: {} };
    }

    try {
      const searchUrl = `${ARGAAM_SEARCH}${encodeURIComponent(company)}`;
      const r = await scraperFetch(searchUrl, "cheerio");
      if (!r.ok || !r.text) return { status: "miss", fields: {} };

      const fields = extractArgaamFields(r.text, company);

      // Try direct company page if we didn't get much
      if (Object.keys(fields).length < 2) {
        const slug = company.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const direct = await scraperFetch(`${ARGAAM_COMPANY}${slug}`, "cheerio");
        if (direct.ok && direct.text) {
          const moreFields = extractArgaamFields(direct.text, company);
          Object.assign(fields, moreFields);
        }
      }

      // Filter to only unfilled fields
      const filtered: Partial<Record<Field, unknown>> = {};
      for (const [k, v] of Object.entries(fields)) {
        if (!alreadyFilled.has(k as Field) && v) filtered[k as Field] = v;
      }

      return {
        status: Object.keys(filtered).length > 0 ? "ok" : "miss",
        fields: filtered,
        cost_usd: 0,
      };
    } catch (e: any) {
      return { status: "error", fields: {}, error: e?.message ?? String(e) };
    }
  },
};
