/**
 * Crunchbase Basic API connector — funding + firmographics.
 * Docs: https://data.crunchbase.com/docs
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { fetchJSON, pickNeeded, extractDomain } from "./_common.js";

interface CrunchbaseAutocomplete { entities?: Array<{ identifier?: { uuid?: string; permalink?: string } }> }
interface CrunchbaseEntity {
  properties?: {
    name?: string;
    short_description?: string;
    website_url?: string;
    founded_on?: { value?: string };
    num_employees_enum?: string;
    last_funding_total?: { value_usd?: number };
    last_funding_at?: string;
    categories?: Array<{ value?: string }>;
    image_url?: string;
  };
}

export const crunchbaseConnector: Connector = {
  source_key: "crunchbase",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "No API key set" };
    const r = await fetchJSON(
      `https://api.crunchbase.com/api/v4/autocompletes?query=apple&user_key=${encodeURIComponent(apiKey)}`,
    );
    if (!r.ok) return { ok: false, message: r.error ?? "Crunchbase rejected key" };
    return { ok: true, message: "Connected to Crunchbase" };
  },

  async enrich({ seed, apiKey, alreadyFilled }): Promise<EnrichResult> {
    if (!apiKey) return { status: "skipped", fields: {} };
    const query = seed.company || extractDomain(seed);
    if (!query) return { status: "skipped", fields: {} };

    // Step 1: autocomplete to find the entity
    const ac = await fetchJSON<CrunchbaseAutocomplete>(
      `https://api.crunchbase.com/api/v4/autocompletes?query=${encodeURIComponent(query)}&collection_ids=organizations&limit=1&user_key=${encodeURIComponent(apiKey)}`,
    );
    if (!ac.ok) return { status: "error", fields: {}, error: ac.error };

    const entity = ac.data?.entities?.[0]?.identifier;
    if (!entity?.uuid) return { status: "miss", fields: {}, cost_usd: 0 };

    // Step 2: fetch the entity
    const fields = "name,short_description,website_url,founded_on,num_employees_enum,last_funding_total,last_funding_at,categories,image_url";
    const ent = await fetchJSON<CrunchbaseEntity>(
      `https://api.crunchbase.com/api/v4/entities/organizations/${entity.uuid}?field_ids=${fields}&user_key=${encodeURIComponent(apiKey)}`,
    );
    if (!ent.ok) return { status: "error", fields: {}, error: ent.error };

    const p = ent.data?.properties;
    if (!p) return { status: "miss", fields: {}, cost_usd: 0 };

    const out: Partial<Record<Field, unknown>> = {};
    if (p.name) out.company_name = p.name;
    if (p.short_description) out.company_description = p.short_description;
    if (p.website_url) out.company_domain = p.website_url.replace(/^https?:\/\//, "").split("/")[0];
    if (p.founded_on?.value) out.company_founded_year = Number(p.founded_on.value.slice(0, 4));
    if (p.num_employees_enum) out.company_size = p.num_employees_enum.replace(/^c_/, "");
    if (p.last_funding_total?.value_usd) {
      out.company_funding = `$${p.last_funding_total.value_usd.toLocaleString()} (last: ${p.last_funding_at ?? "n/a"})`;
    }
    if (p.categories?.length) out.company_industry = p.categories.map(c => c.value).filter(Boolean).join(", ");
    if (p.image_url) out.company_logo_url = p.image_url;

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length > 0 ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0,
    };
  },
};
