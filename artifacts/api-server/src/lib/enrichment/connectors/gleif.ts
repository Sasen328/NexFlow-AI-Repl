/**
 * GLEIF — Global Legal Entity Identifier Foundation. FREE, no key.
 *
 * Authoritative for any company with international banking operations,
 * including every major GCC corporate (Aramco, Emirates NBD, ADNOC, STC,
 * Qatar National Bank, etc.). Returns LEI code + legal name + jurisdiction +
 * registered address.
 *
 * Docs: https://www.gleif.org/en/lei-data/gleif-api
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { fetchJSON, pickNeeded } from "./_common.js";

interface GleifEntity {
  attributes?: {
    lei?: string;
    entity?: {
      legalName?: { name?: string };
      legalAddress?: { city?: string; country?: string };
      headquartersAddress?: { city?: string; country?: string };
      jurisdiction?: string;
      legalForm?: { id?: string };
      status?: string;
    };
    registration?: { initialRegistrationDate?: string };
  };
}

interface GleifList { data?: GleifEntity[] }

export const gleifConnector: Connector = {
  source_key: "gleif",

  async test() {
    const r = await fetchJSON<GleifList>(
      "https://api.gleif.org/api/v1/lei-records?filter[entity.legalName]=Saudi%20Aramco&page[size]=1",
      { headers: { Accept: "application/vnd.api+json" } },
    );
    if (r.ok && r.data?.data?.length) return { ok: true, message: "GLEIF reachable (Aramco found)" };
    return { ok: false, message: r.error ?? `HTTP ${r.status}` };
  },

  async enrich({ seed, alreadyFilled }): Promise<EnrichResult> {
    if (!seed.company) return { status: "miss", fields: {} };
    const candidates: Field[] = ["company_name", "company_country", "company_isin"];
    if (candidates.every(f => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    const q = encodeURIComponent(seed.company);
    const r = await fetchJSON<GleifList>(
      `https://api.gleif.org/api/v1/lei-records?filter[entity.legalName]=${q}&page[size]=1`,
      { headers: { Accept: "application/vnd.api+json" } },
    );
    if (!r.ok || !r.data?.data?.length) return { status: "miss", fields: {} };
    const e = r.data.data[0]?.attributes;
    if (!e) return { status: "miss", fields: {} };

    const out: Partial<Record<Field, unknown>> = {};
    if (e.entity?.legalName?.name) out.company_name = e.entity.legalName.name;
    const country = e.entity?.headquartersAddress?.country ?? e.entity?.legalAddress?.country;
    if (country) out.company_country = country;
    if (e.lei) out.company_isin = e.lei; // LEI is a global corporate identifier
    if (e.registration?.initialRegistrationDate) {
      const yr = parseInt(e.registration.initialRegistrationDate.slice(0, 4), 10);
      if (yr) out.company_founded_year = yr;
    }

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0,
    };
  },
};
