/**
 * MoCI scraper — mc.gov.sa (Saudi Ministry of Commerce & Investment).
 *
 * MoCI is the authoritative source for:
 *   - Commercial registration status and details
 *   - Ownership structure and shareholders
 *   - Articles of association
 *   - Company activities and legal form
 *
 * The public "Sijil" business search portal (sijil.mc.gov.sa) allows
 * lookup by CR number or company name. This scraper tries both entry points.
 * Stealth browser with ar-SA locale is required for CAPTCHA-protected pages.
 * Falls back to Cheerio for unauthenticated lookups.
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { scraperFetch } from "./web-scraper.js";

const SIJIL_SEARCH = "https://sijil.mc.gov.sa/searchResult?query=";
const MOCI_API = "https://mc.gov.sa/api/cr/";

const CR_REGEX = /\b(\d{10})\b/;

function parseMociText(html: string): Partial<Record<Field, unknown>> {
  const out: Partial<Record<Field, unknown>> = {};
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  // CR number
  const crMatch = text.match(/\b(\d{10})\b/);
  if (crMatch) out.company_cr_number = crMatch[1];

  // Arabic company name
  const arNameMatch = text.match(/[\u0600-\u06FF\s]{5,60}(?:المحدودة|المساهمة|الفردية|التضامنية|القابضة)/);
  if (arNameMatch) out.company_name_ar = arNameMatch[0].trim();

  // City / region
  const cityMatch = text.match(/(?:الرياض|جدة|مكة|المدينة|الدمام|الخبر|تبوك|أبها|بريدة|حائل|نجران|جازان|القصيم)/);
  if (cityMatch) { out.company_city = cityMatch[0]; out.company_country = "Saudi Arabia"; }

  // Founded year (Hijri or Gregorian)
  const yearMatch = text.match(/(?:تاريخ التأسيس|تاريخ الإصدار)[^0-9]{0,10}(\d{4})/);
  if (yearMatch) {
    const y = Number(yearMatch[1]);
    // Convert Hijri if plausible (1300–1500 Hijri → approx 1880–2080 AD)
    out.company_founded_year = y > 1500 ? y : Math.round(y * 0.97 + 621);
  }

  // Industry / activity
  const actMatch = text.match(/(?:النشاط الرئيسي|النشاط التجاري)[^:]{0,5}:?\s*([^\n<]{5,80})/);
  if (actMatch) out.company_industry = actMatch[1].trim();

  return out;
}

export const mociScraperConnector: Connector = {
  source_key: "moci_scraper",

  async test({ apiKey: _k, config: _c }) {
    try {
      const r = await scraperFetch("https://mc.gov.sa/", "cheerio");
      return { ok: r.ok, message: r.ok ? "MoCI reachable" : `MoCI blocked: ${r.error ?? ""}` };
    } catch (e: any) {
      return { ok: false, message: `MoCI test failed: ${e?.message ?? e}` };
    }
  },

  async enrich({ seed, alreadyFilled }): Promise<EnrichResult> {
    const company = seed.company ?? "";
    if (!company) return { status: "skipped", fields: {} };

    // MoCI only covers KSA entities
    if (seed.country && !/saudi|ksa|riyadh|jeddah|dammam/i.test(seed.country)) {
      return { status: "skipped", fields: {} };
    }

    const targets: Field[] = ["company_cr_number", "company_name_ar", "company_city", "company_founded_year", "company_industry"];
    if (targets.every((f) => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    try {
      // Try direct API first if CR number in seed
      const crMatch = (seed.notes ?? "").match(CR_REGEX) ?? (seed.company ?? "").match(CR_REGEX);
      if (crMatch) {
        const apiResp = await scraperFetch(`${MOCI_API}${crMatch[1]}`, "cheerio");
        if (apiResp.ok && apiResp.text) {
          const fields = parseMociText(apiResp.text);
          const filtered: Partial<Record<Field, unknown>> = {};
          for (const [k, v] of Object.entries(fields)) {
            if (!alreadyFilled.has(k as Field) && v) filtered[k as Field] = v;
          }
          if (Object.keys(filtered).length > 0) return { status: "ok", fields: filtered, cost_usd: 0 };
        }
      }

      // Fall back to Sijil search
      const searchUrl = `${SIJIL_SEARCH}${encodeURIComponent(company)}`;
      const r = await scraperFetch(searchUrl, "cheerio");
      if (!r.ok || !r.text || r.text.length < 200) return { status: "miss", fields: {} };

      const fields = parseMociText(r.text);
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
