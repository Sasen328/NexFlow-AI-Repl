/**
 * People Data Labs connector — 3B-record graph.
 * Docs: https://docs.peopledatalabs.com/docs/quickstart
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { fetchJSON, pickNeeded, extractDomain } from "./_common.js";

interface PDLPersonResponse {
  status?: number;
  data?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    job_title?: string;
    job_title_levels?: string[];
    work_email?: string;
    mobile_phone?: string;
    linkedin_url?: string;
    job_company_name?: string;
    job_company_website?: string;
    job_company_industry?: string;
    job_company_size?: string;
    job_company_inferred_revenue?: string;
    skills?: string[];
  };
}

export const pdlConnector: Connector = {
  source_key: "pdl",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "No API key set" };
    const r = await fetchJSON(
      "https://api.peopledatalabs.com/v5/person/enrich?email=invalid@invalid.invalid",
      { headers: { "X-Api-Key": apiKey } },
      4_000,
    );
    if (r.status === 401 || r.status === 403) return { ok: false, message: "Invalid API key" };
    return { ok: true, message: "Connected to PDL" };
  },

  async enrich({ seed, apiKey, alreadyFilled }): Promise<EnrichResult> {
    if (!apiKey) return { status: "skipped", fields: {} };

    const params = new URLSearchParams();
    if (seed.email) params.set("email", seed.email);
    if (seed.linkedin_url) params.set("profile", seed.linkedin_url);
    if (seed.phone) params.set("phone", seed.phone);
    if (seed.full_name) params.set("name", seed.full_name);
    const dom = extractDomain(seed);
    if (dom) params.set("company", dom);
    else if (seed.company) params.set("company", seed.company);

    if (params.toString().length === 0) return { status: "skipped", fields: {} };

    const r = await fetchJSON<PDLPersonResponse>(
      `https://api.peopledatalabs.com/v5/person/enrich?${params.toString()}&min_likelihood=4`,
      { headers: { "X-Api-Key": apiKey } },
    );
    if (!r.ok) return { status: "error", fields: {}, error: r.error };

    if (r.data?.status === 404) return { status: "miss", fields: {}, cost_usd: 0 };
    const d = r.data?.data;
    if (!d) return { status: "miss", fields: {}, cost_usd: 0 };

    const out: Partial<Record<Field, unknown>> = {};
    if (d.first_name) out.first_name = d.first_name;
    if (d.last_name) out.last_name = d.last_name;
    if (d.full_name) out.full_name = d.full_name;
    if (d.job_title) out.title = d.job_title;
    if (d.job_title_levels?.[0]) out.seniority = d.job_title_levels[0];
    if (d.work_email) out.email = d.work_email;
    if (d.mobile_phone) out.phone = d.mobile_phone;
    if (d.linkedin_url) out.linkedin_url = d.linkedin_url;
    if (d.job_company_name) out.company_name = d.job_company_name;
    if (d.job_company_website) out.company_domain = d.job_company_website;
    if (d.job_company_industry) out.company_industry = d.job_company_industry;
    if (d.job_company_size) out.company_size = d.job_company_size;
    if (d.job_company_inferred_revenue) out.company_revenue = d.job_company_inferred_revenue;
    if (d.skills?.length) out.company_tech_stack = d.skills.slice(0, 8).join(", ");

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length > 0 ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0.10,
    };
  },
};
