/**
 * MODON scraper — modon.gov.sa (Saudi Authority for Industrial Cities & Technology Zones).
 *
 * MODON manages 35+ industrial cities across Saudi Arabia and publishes
 * a public directory of industrial licensees. Useful for:
 *   - Manufacturing and industrial companies (exact city, CR, activities)
 *   - Industrial license numbers
 *   - Production capacity and workforce data
 *   - Company size signals for industrial sector
 *
 * The public search portal is at modon.gov.sa/ar/IndustrialCities/Pages/Search.aspx
 * Fetched with Cheerio; stealth not strictly required (public directory).
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { scraperFetch } from "./web-scraper.js";

const MODON_SEARCH = "https://www.modon.gov.sa/ar/IndustrialCities/Pages/IndustrialLicensees.aspx?q=";

function parseModonText(text: string): Partial<Record<Field, unknown>> {
  const out: Partial<Record<Field, unknown>> = {};
  const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  // Arabic name
  const arNameMatch = clean.match(/[\u0600-\u06FF\s]{5,60}(?:للصناعات|الصناعية|التصنيع|المصنع)/);
  if (arNameMatch) out.company_name_ar = arNameMatch[0].trim();

  // City — MODON cities
  const cityMatch = clean.match(/(?:جدة|الرياض|الدمام|ينبع|جازان|رابغ|الجبيل|الحائل|تبوك|سدير|الرويضة|بريدة)/);
  if (cityMatch) { out.company_city = cityMatch[0]; out.company_country = "Saudi Arabia"; }

  // Employee count in industrial license data
  const empMatch = clean.match(/(?:عدد العمالة|العمال)\D{0,10}(\d[\d,]+)/);
  if (empMatch) out.company_size = empMatch[1].replace(/,/g, "");

  // Industry activity
  const actMatch = clean.match(/(?:النشاط|الصناعة)[^:]{0,5}:?\s*([^\n<]{5,80})/);
  if (actMatch) out.company_industry = actMatch[1].trim();

  // Industrial license = strong "physical presence" signal
  const licMatch = clean.match(/(?:رقم الترخيص|رقم الرخصة)\D{0,10}([\d-]+)/);
  if (licMatch) {
    out.intent_signals = `MODON industrial licensee — license #${licMatch[1]}`;
  }

  return out;
}

export const modonScraperConnector: Connector = {
  source_key: "modon_scraper",

  async test({ apiKey: _k, config: _c }) {
    try {
      const r = await scraperFetch("https://www.modon.gov.sa/", "cheerio");
      return { ok: r.ok, message: r.ok ? "MODON reachable" : `MODON blocked: ${r.error ?? ""}` };
    } catch (e: any) {
      return { ok: false, message: `MODON test failed: ${e?.message ?? e}` };
    }
  },

  async enrich({ seed, alreadyFilled }): Promise<EnrichResult> {
    const company = seed.company ?? "";
    if (!company) return { status: "skipped", fields: {} };

    // MODON is KSA-only and industrial-sector relevant
    if (seed.country && !/saudi|ksa|riyadh|jeddah|dammam|yanbu|jubail|jazan/i.test(seed.country ?? "")) {
      return { status: "skipped", fields: {} };
    }

    const targets: Field[] = ["company_name_ar", "company_city", "company_size", "company_industry", "intent_signals"];
    if (targets.every((f) => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    try {
      const url = `${MODON_SEARCH}${encodeURIComponent(company)}`;
      const r = await scraperFetch(url, "cheerio");

      if (!r.ok || !r.text || r.text.length < 200) return { status: "miss", fields: {} };

      const fields = parseModonText(r.text);
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
