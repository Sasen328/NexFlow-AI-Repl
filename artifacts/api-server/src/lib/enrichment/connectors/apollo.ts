/**
 * Apollo.io connector — best Western coverage of GCC enterprise.
 * Docs: https://apolloio.github.io/apollo-api-docs/
 */

import type { Connector, EnrichResult, TestResult, Field } from "../types.js";
import { fetchJSON, pickNeeded, extractDomain } from "./_common.js";

interface ApolloPersonMatchResponse {
  person?: {
    first_name?: string;
    last_name?: string;
    name?: string;
    title?: string;
    seniority?: string;
    email?: string;
    phone_numbers?: Array<{ raw_number?: string }>;
    linkedin_url?: string;
    organization?: {
      name?: string;
      website_url?: string;
      industry?: string;
      estimated_num_employees?: number;
      latest_funding_round_date?: string;
      latest_funding_amount?: number;
      technology_names?: string[];
    };
  };
}

export const apolloConnector: Connector = {
  source_key: "apollo",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "No API key set" };
    // Apollo's "Get Authenticated User" endpoint
    const r = await fetchJSON<{ user?: { email?: string } }>(
      `https://api.apollo.io/v1/auth/health?api_key=${encodeURIComponent(apiKey)}`,
      { method: "GET" },
    );
    if (!r.ok) return { ok: false, message: r.error ?? "Apollo rejected key" };
    return { ok: true, message: "Connected to Apollo" };
  },

  async enrich({ seed, apiKey, alreadyFilled }): Promise<EnrichResult> {
    if (!apiKey) return { status: "skipped", fields: {} };
    const domain = extractDomain(seed);

    const body: Record<string, unknown> = { api_key: apiKey, reveal_personal_emails: true };
    if (seed.full_name) body["name"] = seed.full_name;
    if (seed.email) body["email"] = seed.email;
    if (seed.linkedin_url) body["linkedin_url"] = seed.linkedin_url;
    if (domain) body["domain"] = domain;
    if (seed.company) body["organization_name"] = seed.company;

    const r = await fetchJSON<ApolloPersonMatchResponse>(
      "https://api.apollo.io/v1/people/match",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      10_000,
    );
    if (!r.ok) return { status: "error", fields: {}, error: r.error };

    const p = r.data?.person;
    if (!p) return { status: "miss", fields: {}, cost_usd: 0.04 };

    const out: Partial<Record<Field, unknown>> = {};
    if (p.first_name) out.first_name = p.first_name;
    if (p.last_name) out.last_name = p.last_name;
    if (p.name) out.full_name = p.name;
    if (p.title) out.title = p.title;
    if (p.seniority) out.seniority = p.seniority;
    if (p.email) out.email = p.email;
    if (p.phone_numbers?.[0]?.raw_number) out.phone = p.phone_numbers[0].raw_number;
    if (p.linkedin_url) out.linkedin_url = p.linkedin_url;
    const o = p.organization;
    if (o?.name) out.company_name = o.name;
    if (o?.website_url) out.company_domain = o.website_url.replace(/^https?:\/\//, "").split("/")[0];
    if (o?.industry) out.company_industry = o.industry;
    if (o?.estimated_num_employees) out.company_size = String(o.estimated_num_employees);
    if (o?.latest_funding_amount) out.company_funding = `$${o.latest_funding_amount.toLocaleString()} (${o.latest_funding_round_date ?? "n/a"})`;
    if (o?.technology_names?.length) out.company_tech_stack = o.technology_names.join(", ");

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length > 0 ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0.04,
    };
  },
};
