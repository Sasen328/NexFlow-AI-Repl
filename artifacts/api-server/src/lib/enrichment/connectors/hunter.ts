/**
 * Hunter.io connector — email finder + verifier.
 * Docs: https://hunter.io/api-documentation
 */

import type { Connector, EnrichResult, TestResult, Field } from "../types.js";
import { fetchJSON, pickNeeded, extractDomain, splitName } from "./_common.js";

interface HunterAccountResponse { data?: { email?: string; plan_name?: string } }
interface HunterEmailFinderResponse {
  data?: {
    email?: string;
    score?: number;
    first_name?: string;
    last_name?: string;
    position?: string;
    twitter?: string;
    linkedin_url?: string;
    phone_number?: string;
    company?: string;
    verification?: { status?: string };
  };
}
interface HunterDomainSearchResponse {
  data?: {
    domain?: string;
    organization?: string;
    twitter?: string;
    linkedin?: string;
    industry?: string;
    country?: string;
  };
}

export const hunterConnector: Connector = {
  source_key: "hunter",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "No API key set" };
    const r = await fetchJSON<HunterAccountResponse>(
      `https://api.hunter.io/v2/account?api_key=${encodeURIComponent(apiKey)}`,
    );
    if (!r.ok) return { ok: false, message: r.error ?? "Hunter rejected key" };
    return { ok: true, message: `Connected · ${r.data?.data?.plan_name ?? "free"} plan` };
  },

  async enrich({ seed, apiKey, alreadyFilled }): Promise<EnrichResult> {
    if (!apiKey) return { status: "skipped", fields: {} };
    const domain = extractDomain(seed);
    const { first, last } = splitName(seed);

    // Strategy: if we have name + domain → email-finder. Else if we have
    // domain alone → domain-search to fill org metadata.
    const out: Partial<Record<Field, unknown>> = {};

    if (first && last && domain) {
      const r = await fetchJSON<HunterEmailFinderResponse>(
        `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(domain)}&first_name=${encodeURIComponent(first)}&last_name=${encodeURIComponent(last)}&api_key=${encodeURIComponent(apiKey)}`,
      );
      if (!r.ok) return { status: "error", fields: {}, error: r.error };
      const d = r.data?.data;
      if (d?.email) {
        out.email = d.email;
        out.email_verified = d.verification?.status === "valid";
        if (d.first_name) out.first_name = d.first_name;
        if (d.last_name) out.last_name = d.last_name;
        if (d.position) out.title = d.position;
        if (d.linkedin_url) out.linkedin_url = d.linkedin_url;
        if (d.twitter) out.twitter_handle = d.twitter;
        if (d.phone_number) out.phone = d.phone_number;
        if (d.company) out.company_name = d.company;
      }
    } else if (domain) {
      const r = await fetchJSON<HunterDomainSearchResponse>(
        `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&limit=1&api_key=${encodeURIComponent(apiKey)}`,
      );
      if (!r.ok) return { status: "error", fields: {}, error: r.error };
      const d = r.data?.data;
      if (d?.organization) out.company_name = d.organization;
      if (d?.industry) out.company_industry = d.industry;
      if (d?.country) out.company_country = d.country;
      if (d?.twitter) out.twitter_handle = d.twitter;
      if (d?.linkedin) out.linkedin_url = d.linkedin;
      if (d?.domain) out.company_domain = d.domain;
    }

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length > 0 ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0.005, // approx — Hunter charges per request
    };
  },
};
