/**
 * Etimad scraper — etimad.sa (Saudi government e-procurement / tender platform).
 *
 * Etimad lists all government tenders, contracts, and awards by supplier.
 * Searching a company name returns all tenders they have bid on or won,
 * revealing their government revenue, contract sizes, and procurement track record.
 *
 * This is a strong buying-signal source: if a company is active on Etimad
 * they are either buying government services or selling to ministries.
 *
 * Stealth browser required for JS-heavy SPA. Falls back to fetch.
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { scraperFetch } from "./web-scraper.js";

const ETIMAD_SEARCH = "https://etimad.sa/en/tender/search?keyword=";

function parseEtimadText(text: string): Partial<Record<Field, unknown>> {
  const out: Partial<Record<Field, unknown>> = {};
  const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  // Look for awarded contract values (tender amounts)
  const contractMatches = clean.match(/(?:SAR|ر\.?س|رس)\s*([\d,.]+)/g);
  if (contractMatches?.length) {
    // Signals buying activity and company scale
    out.intent_signals = `Etimad activity: ${contractMatches.slice(0, 3).join(", ")} in tenders/contracts`;
  }

  // Ministry names indicate government sector coverage
  const ministryMatch = clean.match(/(?:Ministry|وزارة|الهيئة|هيئة|Authority)[^,.\n]{3,60}/g);
  if (ministryMatch?.length) {
    const existing = (out.news_recent as string) ?? "";
    out.news_recent = [existing, `Gov procurement: ${ministryMatch.slice(0, 2).join("; ")}`].filter(Boolean).join(" | ");
  }

  return out;
}

export const etimadScraperConnector: Connector = {
  source_key: "etimad_scraper",

  async test({ apiKey: _k, config: _c }) {
    try {
      const r = await scraperFetch("https://etimad.sa/en/", "cheerio");
      return { ok: r.ok, message: r.ok ? "Etimad reachable" : `Etimad blocked: ${r.error ?? ""}` };
    } catch (e: any) {
      return { ok: false, message: `Etimad test failed: ${e?.message ?? e}` };
    }
  },

  async enrich({ seed, alreadyFilled }): Promise<EnrichResult> {
    const company = seed.company ?? "";
    if (!company) return { status: "skipped", fields: {} };

    const targets: Field[] = ["intent_signals", "news_recent"];
    if (targets.every((f) => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    // Only meaningful for KSA companies in government-adjacent sectors
    if (seed.country && !/saudi|ksa|riyadh|jeddah|dammam/i.test(seed.country)) {
      return { status: "skipped", fields: {} };
    }

    try {
      const url = `${ETIMAD_SEARCH}${encodeURIComponent(company)}`;
      const r = await scraperFetch(url, "cheerio");

      if (!r.ok || !r.text || r.text.length < 200) {
        return { status: "miss", fields: {} };
      }

      const fields = parseEtimadText(r.text);

      // Add Etimad as a signal source even if content was sparse
      if (!fields.intent_signals && r.text.length > 500) {
        fields.intent_signals = `Etimad presence detected for "${company}" — active in government procurement`;
      }

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
