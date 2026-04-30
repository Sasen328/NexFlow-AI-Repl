/**
 * RocketReach connector — LinkedIn-derived contact lookup.
 * Docs: https://rocketreach.co/api
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { fetchJSON, pickNeeded, extractDomain } from "./_common.js";

interface RRPersonResponse {
  emails?: Array<{ email?: string; smtp_valid?: string; type?: string }>;
  phones?: Array<{ number?: string; is_premium?: boolean }>;
  current_title?: string;
  current_employer?: string;
  current_employer_domain?: string;
  linkedin_url?: string;
  first_name?: string;
  last_name?: string;
}

export const rocketreachConnector: Connector = {
  source_key: "rocketreach",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "No API key set" };
    const r = await fetchJSON("https://api.rocketreach.co/v2/api/account/", {
      headers: { "Api-Key": apiKey },
    });
    if (!r.ok) return { ok: false, message: r.error ?? "RocketReach rejected key" };
    return { ok: true, message: "Connected to RocketReach" };
  },

  async enrich({ seed, apiKey, alreadyFilled }): Promise<EnrichResult> {
    if (!apiKey) return { status: "skipped", fields: {} };

    const params: Record<string, string> = {};
    if (seed.linkedin_url) params["linkedin_url"] = seed.linkedin_url;
    else if (seed.email) params["email"] = seed.email;
    else if (seed.full_name) {
      params["name"] = seed.full_name;
      const dom = extractDomain(seed);
      if (dom) params["current_employer_domain"] = dom;
      else if (seed.company) params["current_employer"] = seed.company;
    } else {
      return { status: "skipped", fields: {} };
    }

    const url = `https://api.rocketreach.co/v2/api/lookupProfile?${new URLSearchParams(params).toString()}`;
    const r = await fetchJSON<RRPersonResponse>(url, { headers: { "Api-Key": apiKey } });
    if (!r.ok) {
      if (r.status === 404) return { status: "miss", fields: {} };
      return { status: "error", fields: {}, error: r.error };
    }
    const d = r.data;
    if (!d) return { status: "miss", fields: {}, cost_usd: 0 };

    const out: Partial<Record<Field, unknown>> = {};
    if (d.first_name) out.first_name = d.first_name;
    if (d.last_name) out.last_name = d.last_name;
    if (d.current_title) out.title = d.current_title;
    if (d.current_employer) out.company_name = d.current_employer;
    if (d.current_employer_domain) out.company_domain = d.current_employer_domain;
    if (d.linkedin_url) out.linkedin_url = d.linkedin_url;
    const validEmail = d.emails?.find(e => e.smtp_valid === "valid")?.email ?? d.emails?.[0]?.email;
    if (validEmail) {
      out.email = validEmail;
      out.email_verified = d.emails?.[0]?.smtp_valid === "valid";
    }
    if (d.phones?.[0]?.number) out.phone = d.phones[0].number;

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length > 0 ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0.05,
    };
  },
};
