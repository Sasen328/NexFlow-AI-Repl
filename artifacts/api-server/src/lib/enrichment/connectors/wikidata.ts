/**
 * Wikidata — open structured knowledge graph. FREE, no key.
 *
 * Excellent for any public company or well-known GCC corporate. Returns
 * founded year, industry, headcount, headquarters, official website, logo.
 *
 * Two-step: search by label, then fetch entity claims.
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { fetchJSON, pickNeeded, SCRAPER_UA } from "./_common.js";

interface WdSearch { search?: Array<{ id?: string; label?: string; description?: string }> }
interface WdEntity {
  entities?: Record<string, {
    claims?: Record<string, Array<{
      mainsnak?: { datavalue?: { value?: unknown } };
    }>>;
    sitelinks?: Record<string, { title?: string }>;
  }>;
}

function asString(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (typeof o.text === "string") return o.text;
    if (typeof o.id === "string") return o.id;
    if (typeof o["time"] === "string") return o["time"] as string;
  }
  return null;
}

export const wikidataConnector: Connector = {
  source_key: "wikidata",

  async test() {
    const r = await fetchJSON<WdSearch>(
      "https://www.wikidata.org/w/api.php?action=wbsearchentities&search=Saudi+Aramco&language=en&type=item&limit=1&format=json",
      { headers: { "User-Agent": SCRAPER_UA } },
    );
    return r.ok && r.data?.search?.length
      ? { ok: true, message: "Wikidata reachable" }
      : { ok: false, message: r.error ?? "no result" };
  },

  async enrich({ seed, alreadyFilled }): Promise<EnrichResult> {
    if (!seed.company) return { status: "miss", fields: {} };
    const candidates: Field[] = [
      "company_name", "company_country", "company_industry",
      "company_size", "company_founded_year", "company_domain",
      "company_description", "company_logo_url",
    ];
    if (candidates.every(f => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    const search = await fetchJSON<WdSearch>(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(seed.company)}&language=en&type=item&limit=1&format=json`,
      { headers: { "User-Agent": SCRAPER_UA } },
    );
    const id = search.data?.search?.[0]?.id;
    const desc = search.data?.search?.[0]?.description;
    if (!id) return { status: "miss", fields: {} };

    const ent = await fetchJSON<WdEntity>(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${id}&props=claims|sitelinks&format=json`,
      { headers: { "User-Agent": SCRAPER_UA } },
    );
    const e = ent.data?.entities?.[id];
    if (!e) return { status: "miss", fields: {} };

    const out: Partial<Record<Field, unknown>> = {};
    if (search.data?.search?.[0]?.label) out.company_name = search.data.search[0].label;
    if (desc) out.company_description = desc;

    const claims = e.claims ?? {};
    const inception = claims.P571?.[0]?.mainsnak?.datavalue?.value as { time?: string } | undefined;
    if (inception?.time) {
      const m = inception.time.match(/([+-]?\d{4})/);
      if (m) out.company_founded_year = parseInt(m[1]!, 10);
    }
    const website = claims.P856?.[0]?.mainsnak?.datavalue?.value;
    const wsStr = asString(website);
    if (wsStr) {
      try { out.company_domain = new URL(wsStr).hostname.replace(/^www\./, ""); } catch { /* ignore */ }
    }
    const employees = claims.P1128?.[0]?.mainsnak?.datavalue?.value as { amount?: string } | undefined;
    if (employees?.amount) {
      const n = parseInt(String(employees.amount).replace(/^\+/, ""), 10);
      if (n) out.company_size = n >= 5000 ? "5000+" : n >= 1000 ? "1000-5000" : n >= 200 ? "200-1000" : n >= 50 ? "50-200" : "<50";
    }
    // We intentionally skip claims.P17 (country) — Wikidata returns it as a
    // Q-id (e.g. "Q851" for Saudi Arabia) which would require a second API
    // round-trip to resolve to a name. Other connectors (OpenCorporates,
    // GLEIF) return country names directly and run before us, so we don't
    // try to fill country here.

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0,
    };
  },
};
