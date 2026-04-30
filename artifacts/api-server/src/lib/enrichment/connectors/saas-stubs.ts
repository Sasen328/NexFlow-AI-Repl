/**
 * SaaS connector stubs.
 *
 * The user's prospecting toolchain includes ~20 commercial SaaS tools.
 * Most have public REST APIs but require paid keys; a few have NO
 * public API (LinkedIn Sales Navigator, Adapt, LeadGibbon, Vibe) and
 * are scraping-only / browser-extension-only — we register those as
 * "manual" sources so they show up in the UI but never auto-run.
 *
 * Each stub:
 *   - returns "skipped" when no API key is set
 *   - returns "skipped" with a clear message when the source is
 *     marked manual (no public API exists)
 *   - hits the real endpoint when a key IS set, with a small parser
 *     mapping the common response shape to our Field set.
 *
 * The point: the user can plug in any of these tomorrow and the
 * waterfall will start using them — no code changes needed.
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { fetchJSON, pickNeeded, extractDomain, splitName } from "./_common.js";

// ───────────────── SaaS stub factory ─────────────────
interface StubSpec {
  source_key: string;
  /** Bearer / api_key / x-api-key header name; null = manual-only. */
  authHeader: string | null;
  /** Build the GET URL to hit when a key is present. */
  buildUrl?: (seed: { domain?: string; first?: string; last?: string }) => string | null;
  /** Map the API response to our Field set. */
  mapResponse?: (resp: Record<string, unknown>) => Partial<Record<Field, unknown>>;
  /** Kept manual (no public API) — always skip. */
  manualOnly?: boolean;
  /** Test endpoint (optional). */
  testUrl?: string;
}

/**
 * Build the auth header value for a given header name + raw key.
 * Vendors that use the standard `Authorization` header expect the
 * `Bearer ` prefix unless the user already pasted it themselves.
 * Custom headers (X-API-Key, apikey, X-KEY, etc.) take the raw key.
 */
function authHeaderValue(headerName: string, rawKey: string): string {
  if (headerName.toLowerCase() !== "authorization") return rawKey;
  if (/^(bearer|basic|token)\s/i.test(rawKey)) return rawKey;
  return `Bearer ${rawKey}`;
}

function makeStub(spec: StubSpec): Connector {
  return {
    source_key: spec.source_key,

    async test({ apiKey }) {
      if (spec.manualOnly) {
        return { ok: false, message: "Manual / browser-extension only — no public API exists" };
      }
      if (!apiKey) return { ok: false, message: "No API key set" };
      if (!spec.testUrl) return { ok: true, message: "Key accepted (no test endpoint configured)" };
      const headers = spec.authHeader
        ? { [spec.authHeader]: authHeaderValue(spec.authHeader, apiKey) }
        : {};
      const r = await fetchJSON(spec.testUrl, { headers });
      return r.ok
        ? { ok: true, message: `${spec.source_key} reachable` }
        : { ok: false, message: r.error ?? `HTTP ${r.status}` };
    },

    async enrich({ seed, apiKey, alreadyFilled }): Promise<EnrichResult> {
      if (spec.manualOnly) return { status: "skipped", fields: {} };
      if (!apiKey) return { status: "skipped", fields: {} };
      if (!spec.buildUrl || !spec.mapResponse) return { status: "skipped", fields: {} };
      const { first, last } = splitName(seed);
      const domain = extractDomain(seed);
      const url = spec.buildUrl({ domain: domain ?? undefined, first, last });
      if (!url) return { status: "miss", fields: {} };

      const headers = spec.authHeader
        ? { [spec.authHeader]: authHeaderValue(spec.authHeader, apiKey) }
        : {};
      const r = await fetchJSON<Record<string, unknown>>(url, { headers });
      if (!r.ok || !r.data) return { status: r.status === 404 ? "miss" : "error", fields: {}, error: r.error };
      const filtered = pickNeeded(spec.mapResponse(r.data), alreadyFilled);
      return {
        status: Object.keys(filtered).length ? "ok" : "miss",
        fields: filtered,
        cost_usd: 0.01, // ballpark — real value comes from per-call API metering
      };
    },
  };
}

// ───────────────── Concrete connectors ─────────────────
//
// Each entry uses the source's documented public endpoint shape. Where
// the API doesn't have a stable test/health endpoint we omit testUrl.
// Where the source genuinely has no public API (LinkedIn Sales Nav,
// Adapt.io, LeadGibbon, Vibe, Explorium) we register manual-only.

export const zoominfoConnector = makeStub({
  source_key: "zoominfo",
  authHeader: "Authorization",
  buildUrl: ({ domain }) => domain ? `https://api.zoominfo.com/lookup/companybydomain?domain=${encodeURIComponent(domain)}` : null,
  mapResponse: (r) => ({
    company_name: r["companyName"] as string | undefined,
    company_industry: r["industry"] as string | undefined,
    company_size: r["employees"] as string | undefined,
    company_revenue: r["revenue"] as string | undefined,
  }),
});

export const cognismConnector = makeStub({
  source_key: "cognism",
  authHeader: "X-API-Key",
  buildUrl: ({ domain }) => domain ? `https://app.cognism.com/api/v1/company/by-domain?domain=${encodeURIComponent(domain)}` : null,
  mapResponse: (r) => ({
    company_name: r["name"] as string | undefined,
    company_industry: r["industry"] as string | undefined,
    company_size: r["employee_count"] as string | undefined,
    linkedin_url: r["linkedin_url"] as string | undefined,
  }),
});

export const seamlessConnector = makeStub({
  source_key: "seamless",
  authHeader: "Authorization",
  buildUrl: ({ first, last, domain }) => (first && last && domain)
    ? `https://api.seamless.ai/v1/contact/find?first_name=${encodeURIComponent(first)}&last_name=${encodeURIComponent(last)}&company_domain=${encodeURIComponent(domain)}`
    : null,
  mapResponse: (r) => ({
    email: r["email"] as string | undefined,
    phone: r["phone"] as string | undefined,
    title: r["title"] as string | undefined,
    linkedin_url: r["linkedin_url"] as string | undefined,
  }),
});

export const kasprConnector = makeStub({
  source_key: "kaspr",
  authHeader: "X-API-Key",
  buildUrl: ({ first, last, domain }) => (first && last && domain)
    ? `https://api.kaspr.io/profile/contact?first_name=${encodeURIComponent(first)}&last_name=${encodeURIComponent(last)}&domain=${encodeURIComponent(domain)}`
    : null,
  mapResponse: (r) => ({
    email: r["email"] as string | undefined,
    phone: r["phone"] as string | undefined,
    title: r["title"] as string | undefined,
  }),
});

export const datanyzeConnector = makeStub({
  source_key: "datanyze",
  authHeader: "Authorization",
  buildUrl: ({ domain }) => domain ? `https://api.datanyze.com/companies?domain=${encodeURIComponent(domain)}` : null,
  mapResponse: (r) => ({
    company_tech_stack: Array.isArray(r["technologies"]) ? r["technologies"] as string[] : undefined,
    company_size: r["employees"] as string | undefined,
  }),
});

export const signalhireConnector = makeStub({
  source_key: "signalhire",
  authHeader: "apikey",
  buildUrl: ({ first, last, domain }) => (first && last && domain)
    ? `https://www.signalhire.com/api/v1/candidate/search?fullName=${encodeURIComponent(`${first} ${last}`)}&companyDomain=${encodeURIComponent(domain)}`
    : null,
  mapResponse: (r) => {
    const items = Array.isArray(r["items"]) ? r["items"] as Array<Record<string, unknown>> : [];
    const c = items[0] ?? {};
    return {
      email: (c["emails"] as string[] | undefined)?.[0],
      phone: (c["phones"] as string[] | undefined)?.[0],
      linkedin_url: c["linkedinUrl"] as string | undefined,
      title: c["title"] as string | undefined,
    };
  },
});

export const proxycurlConnector = makeStub({
  source_key: "proxycurl",
  authHeader: "Authorization",
  buildUrl: ({ first, last, domain }) => (first && last && domain)
    ? `https://nubela.co/proxycurl/api/linkedin/profile/resolve?first_name=${encodeURIComponent(first)}&last_name=${encodeURIComponent(last)}&company_domain=${encodeURIComponent(domain)}`
    : null,
  mapResponse: (r) => ({
    linkedin_url: r["url"] as string | undefined,
    title: r["headline"] as string | undefined,
    company_name: r["company"] as string | undefined,
    company_country: r["country"] as string | undefined,
  }),
});

export const lead411Connector = makeStub({
  source_key: "lead411",
  authHeader: "Authorization",
  buildUrl: ({ domain }) => domain ? `https://api.lead411.com/v1/companies?domain=${encodeURIComponent(domain)}` : null,
  mapResponse: (r) => ({
    company_name: r["name"] as string | undefined,
    company_industry: r["industry"] as string | undefined,
    company_size: r["employees"] as string | undefined,
    company_revenue: r["revenue"] as string | undefined,
  }),
});

export const prospeoConnector = makeStub({
  source_key: "prospeo",
  authHeader: "X-KEY",
  buildUrl: ({ first, last, domain }) => (first && last && domain)
    ? `https://api.prospeo.io/email-finder?first_name=${encodeURIComponent(first)}&last_name=${encodeURIComponent(last)}&company=${encodeURIComponent(domain)}`
    : null,
  mapResponse: (r) => {
    const data = (r["response"] ?? r) as Record<string, unknown>;
    return {
      email: data["email"] as string | undefined,
      email_verified: typeof data["verified"] === "boolean" ? (data["verified"] as boolean) : undefined,
    };
  },
});

export const clearbitDeprecatedConnector = makeStub({
  source_key: "clearbit",
  authHeader: "Authorization",
  buildUrl: ({ domain }) => domain ? `https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(domain)}` : null,
  mapResponse: (r) => ({
    company_name: r["name"] as string | undefined,
    company_industry: (r["category"] as Record<string, unknown> | undefined)?.["industry"] as string | undefined,
    company_size: r["metrics"] && (r["metrics"] as Record<string, unknown>)["employees"]
      ? String((r["metrics"] as Record<string, unknown>)["employees"])
      : undefined,
    company_logo_url: r["logo"] as string | undefined,
  }),
});

export const salesintelConnector = makeStub({
  source_key: "salesintel",
  authHeader: "X-API-KEY",
  buildUrl: ({ domain }) => domain ? `https://api.salesintel.io/v2/companies/search?domain=${encodeURIComponent(domain)}` : null,
  mapResponse: (r) => ({
    company_name: r["companyName"] as string | undefined,
    company_size: r["employees"] as string | undefined,
    company_revenue: r["revenue"] as string | undefined,
  }),
});

export const swordfishConnector = makeStub({
  source_key: "swordfish",
  authHeader: "api_key",
  buildUrl: ({ first, last, domain }) => (first && last && domain)
    ? `https://api.swordfish.ai/v1/find?firstName=${encodeURIComponent(first)}&lastName=${encodeURIComponent(last)}&domain=${encodeURIComponent(domain)}`
    : null,
  mapResponse: (r) => ({
    email: r["work_email"] as string | undefined,
    phone: (r["mobile_phones"] as string[] | undefined)?.[0],
  }),
});

export const adaptConnector = makeStub({
  source_key: "adapt",
  authHeader: null,
  manualOnly: true,
});

export const leadgibbonConnector = makeStub({
  source_key: "leadgibbon",
  authHeader: null,
  manualOnly: true,
});

export const linkedinSalesNavConnector = makeStub({
  source_key: "linkedin_sales_nav",
  authHeader: null,
  manualOnly: true,
});

export const explorumConnector = makeStub({
  source_key: "explorum",
  authHeader: null,
  manualOnly: true,
});

export const vibeConnector = makeStub({
  source_key: "vibe_prospecting",
  authHeader: null,
  manualOnly: true,
});
