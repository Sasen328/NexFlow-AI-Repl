/**
 * OpenCorporates — open-data corporate registry, 200M+ companies worldwide.
 * FREE for low-volume use without a key (rate-limited).
 *
 * Coverage includes most GCC jurisdictions (UAE Federal, DIFC, ADGM, KSA,
 * Qatar, Bahrain, Kuwait, Oman) plus all the offshore vehicles GCC
 * conglomerates use (Cayman, BVI, etc.).
 *
 * Docs: https://api.opencorporates.com/documentation/API-Reference
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { fetchJSON, pickNeeded } from "./_common.js";

interface OcCompany {
  name?: string;
  company_number?: string;
  jurisdiction_code?: string;
  incorporation_date?: string;
  company_type?: string;
  current_status?: string;
  registered_address_in_full?: string;
  industry_codes?: Array<{ industry_code?: { code?: string; description?: string } }>;
}

interface OcSearch {
  results?: { companies?: Array<{ company?: OcCompany }> };
}

export const opencorporatesConnector: Connector = {
  source_key: "opencorporates",

  async test() {
    const r = await fetchJSON<OcSearch>(
      "https://api.opencorporates.com/v0.4/companies/search?q=Saudi+Aramco&per_page=1",
    );
    if (r.ok && r.data?.results?.companies?.length) {
      return { ok: true, message: "OpenCorporates reachable (free tier)" };
    }
    if (r.status === 429) return { ok: false, message: "Rate-limited — paid plan recommended" };
    return { ok: false, message: r.error ?? `HTTP ${r.status}` };
  },

  async enrich({ seed, apiKey, alreadyFilled }): Promise<EnrichResult> {
    if (!seed.company) return { status: "miss", fields: {} };
    const candidates: Field[] = ["company_name", "company_country", "company_cr_number", "company_founded_year", "company_industry"];
    if (candidates.every(f => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    const q = encodeURIComponent(seed.company);
    const apiKeyParam = apiKey ? `&api_token=${encodeURIComponent(apiKey)}` : "";
    const r = await fetchJSON<OcSearch>(
      `https://api.opencorporates.com/v0.4/companies/search?q=${q}&per_page=1${apiKeyParam}`,
    );
    if (!r.ok || !r.data?.results?.companies?.length) return { status: "miss", fields: {} };
    const c = r.data.results.companies[0]?.company;
    if (!c) return { status: "miss", fields: {} };

    const out: Partial<Record<Field, unknown>> = {};
    if (c.name) out.company_name = c.name;
    if (c.company_number) out.company_cr_number = c.company_number;
    if (c.jurisdiction_code) out.company_country = c.jurisdiction_code.toUpperCase();
    if (c.incorporation_date) {
      const yr = parseInt(c.incorporation_date.slice(0, 4), 10);
      if (yr) out.company_founded_year = yr;
    }
    if (c.industry_codes?.[0]?.industry_code?.description) {
      out.company_industry = c.industry_codes[0].industry_code.description;
    }

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0,
    };
  },
};
