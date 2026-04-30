/**
 * Lusha connector — direct dials + work emails.
 * Docs: https://docs.lusha.com/
 */

import type { Connector, EnrichResult, TestResult, Field } from "../types.js";
import { fetchJSON, pickNeeded, extractDomain } from "./_common.js";

interface LushaPersonResponse {
  data?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    jobTitle?: string;
    seniority?: string;
    emailAddresses?: Array<{ email?: string; emailType?: string }>;
    phoneNumbers?: Array<{ number?: string }>;
    linkedinUrl?: string;
    company?: { name?: string; domain?: string };
  };
}

export const lushaConnector: Connector = {
  source_key: "lusha",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "No API key set" };
    // Lusha doesn't expose a /me — do a no-op person lookup for ping
    const r = await fetchJSON(
      "https://api.lusha.com/v2/person?email=invalid@invalid.invalid",
      { headers: { api_key: apiKey } },
      4_000,
    );
    if (r.status === 401 || r.status === 403) return { ok: false, message: "Invalid API key" };
    return { ok: true, message: "Connected to Lusha" };
  },

  async enrich({ seed, apiKey, alreadyFilled }): Promise<EnrichResult> {
    if (!apiKey) return { status: "skipped", fields: {} };
    const params = new URLSearchParams();
    if (seed.email) params.set("email", seed.email);
    else if (seed.linkedin_url) params.set("linkedinUrl", seed.linkedin_url);
    else if (seed.full_name && (seed.company || seed.domain)) {
      params.set("fullName", seed.full_name);
      const dom = extractDomain(seed);
      if (dom) params.set("companyDomain", dom);
      else if (seed.company) params.set("companyName", seed.company);
    } else {
      return { status: "skipped", fields: {} };
    }

    const r = await fetchJSON<LushaPersonResponse>(
      `https://api.lusha.com/v2/person?${params.toString()}`,
      { headers: { api_key: apiKey } },
    );
    if (!r.ok) {
      if (r.status === 404) return { status: "miss", fields: {}, cost_usd: 0 };
      return { status: "error", fields: {}, error: r.error };
    }

    const d = r.data?.data;
    if (!d) return { status: "miss", fields: {}, cost_usd: 0 };

    const out: Partial<Record<Field, unknown>> = {};
    if (d.firstName) out.first_name = d.firstName;
    if (d.lastName) out.last_name = d.lastName;
    if (d.fullName) out.full_name = d.fullName;
    if (d.jobTitle) out.title = d.jobTitle;
    if (d.seniority) out.seniority = d.seniority;
    if (d.linkedinUrl) out.linkedin_url = d.linkedinUrl;
    if (d.emailAddresses?.[0]?.email) out.email = d.emailAddresses[0].email;
    if (d.phoneNumbers?.[0]?.number) out.phone = d.phoneNumbers[0].number;
    if (d.company?.name) out.company_name = d.company.name;
    if (d.company?.domain) out.company_domain = d.company.domain;

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length > 0 ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0.08,
    };
  },
};
