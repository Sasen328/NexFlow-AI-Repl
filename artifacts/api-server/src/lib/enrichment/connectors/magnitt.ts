/**
 * MAGNiTT connector — GCC + MENA startup intelligence.
 * MAGNiTT's API requires a sales-issued bearer token; the public surface
 * exposes /companies/search + /companies/{id}/funding-rounds.
 * Docs: https://magnitt.com/contact (no public docs portal)
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { fetchJSON, pickNeeded, extractDomain } from "./_common.js";

interface MagnittSearch {
  data?: Array<{
    id?: number;
    name?: string;
    domain?: string;
    description?: string;
    industries?: string[];
    country?: string;
    founded_year?: number;
    employees_count?: number;
    total_funding_usd?: number;
    last_round?: { date?: string; amount_usd?: number; round_type?: string };
  }>;
}

const BASE = "https://api.magnitt.com/v1";

export const magnittConnector: Connector = {
  source_key: "magnitt",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "No bearer token set" };
    const r = await fetchJSON(`${BASE}/companies/search?q=careem&limit=1`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!r.ok) return { ok: false, message: r.error ?? "MAGNiTT rejected token" };
    return { ok: true, message: "Connected to MAGNiTT" };
  },

  async enrich({ seed, apiKey, alreadyFilled }): Promise<EnrichResult> {
    if (!apiKey) return { status: "skipped", fields: {} };
    const query = seed.company || extractDomain(seed);
    if (!query) return { status: "skipped", fields: {} };

    const r = await fetchJSON<MagnittSearch>(
      `${BASE}/companies/search?q=${encodeURIComponent(query)}&limit=1`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
    if (!r.ok) return { status: "error", fields: {}, error: r.error };

    const d = r.data?.data?.[0];
    if (!d) return { status: "miss", fields: {}, cost_usd: 0 };

    const out: Partial<Record<Field, unknown>> = {};
    if (d.name) out.company_name = d.name;
    if (d.domain) out.company_domain = d.domain;
    if (d.description) out.company_description = d.description;
    if (d.industries?.length) out.company_industry = d.industries.join(", ");
    if (d.country) out.company_country = d.country;
    if (d.founded_year) out.company_founded_year = d.founded_year;
    if (d.employees_count) out.company_size = String(d.employees_count);
    if (d.total_funding_usd) {
      const round = d.last_round
        ? ` (last: ${d.last_round.round_type ?? "n/a"} · $${(d.last_round.amount_usd ?? 0).toLocaleString()} on ${d.last_round.date ?? "n/a"})`
        : "";
      out.company_funding = `$${d.total_funding_usd.toLocaleString()} total${round}`;
    }

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length > 0 ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0,
    };
  },
};
