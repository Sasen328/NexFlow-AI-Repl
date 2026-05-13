/**
 * GCC-native & global paid source stubs — registered in the waterfall but
 * require API keys / subscriptions to activate.
 *
 * Priority assignments from ProspectSA Master Intelligence Sources PDF:
 *   23  Dhow           — GCC B2B contacts, Arabic names, WhatsApp IDs
 *   27  Decypha        — MENA financial data (all 6 GCC exchanges)
 *   29  Argaam         — Saudi financial news + Tadawul filings (Arabic)
 *   31  Wamda          — MENA startup ecosystem, founder backgrounds
 *   48  FullContact    — Person enrichment (phone → identity graph)
 *   52  D&B Direct+    — Company firmographics (regional registrar partnerships)
 *   55  Breeze Intel   — HubSpot Breeze Intelligence (company/contact)
 *   57  Bombora        — B2B intent data (topic-level surge scores)
 *   65  Clay           — Waterfall fallback / data orchestration layer
 *
 * Each stub returns "skipped" when the key is absent, "miss" when the API
 * returns no result, and "ok" with filled fields when data is found.
 * The `test()` method pings the cheapest possible endpoint to verify the key.
 */

import type { Connector, EnrichResult, Seed, SourceConfig, Field } from "../types.js";

// ── Shared helpers ─────────────────────────────────────────────────────────

const TIMEOUT_MS = 10_000;

async function apiFetch(
  url: string,
  opts: RequestInit & { timeoutMs?: number } = {}
): Promise<Response | null> {
  const { timeoutMs = TIMEOUT_MS, ...rest } = opts;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const r = await fetch(url, { ...rest, signal: ctrl.signal });
    clearTimeout(timer);
    return r;
  } catch {
    return null;
  }
}

function noKey(key: string | null, label: string): EnrichResult {
  return { status: "skipped", fields: {}, error: `${label} API key not configured` };
}

// ─────────────────────────────────────────────────────────────────────────
// Priority 23: Dhow  (dhow.io — GCC B2B contacts, Arabic names, WhatsApp)
// "The Middle East's Apollo" — subscription (SAR pricing)
// ─────────────────────────────────────────────────────────────────────────
export const dhowConnector: Connector = {
  source_key: "dhow",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "DHOW_API_KEY not set" };
    // Dhow uses Bearer auth; ping /account or /me endpoint
    const r = await apiFetch("https://api.dhow.io/v1/account", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!r) return { ok: false, message: "Dhow API unreachable" };
    if (r.status === 401) return { ok: false, message: "Dhow API key invalid (401)" };
    return { ok: r.ok, message: r.ok ? "Dhow API key valid" : `HTTP ${r.status}` };
  },

  async enrich({ seed, apiKey, alreadyFilled }) {
    if (!apiKey) return noKey(apiKey, "Dhow");
    const targets: Field[] = ["email", "phone", "name_ar", "company_name_ar", "linkedin_url", "title"];
    if (targets.every(f => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    const params = new URLSearchParams();
    if (seed.full_name) params.set("name", seed.full_name);
    if (seed.company) params.set("company", seed.company);
    if (seed.email) params.set("email", seed.email);

    const r = await apiFetch(`https://api.dhow.io/v1/people/search?${params}`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    });
    if (!r) return { status: "error", fields: {}, error: "Dhow API unreachable" };
    if (!r.ok) return { status: "miss", fields: {} };

    try {
      const json: any = await r.json();
      const person = json.data?.[0] ?? json.person ?? json;
      if (!person || !person.email) return { status: "miss", fields: {} };

      const out: Partial<Record<Field, unknown>> = {};
      if (person.email && !alreadyFilled.has("email")) out.email = person.email;
      if (person.phone && !alreadyFilled.has("phone")) out.phone = person.phone;
      if (person.name_ar && !alreadyFilled.has("name_ar")) out.name_ar = person.name_ar;
      if (person.company_name_ar && !alreadyFilled.has("company_name_ar")) out.company_name_ar = person.company_name_ar;
      if (person.linkedin_url && !alreadyFilled.has("linkedin_url")) out.linkedin_url = person.linkedin_url;
      if (person.title && !alreadyFilled.has("title")) out.title = person.title;
      if (person.whatsapp_id) out.phone = person.whatsapp_id; // WhatsApp number preferred over generic phone

      return { status: Object.keys(out).length ? "ok" : "miss", fields: out, cost_usd: 0.05 };
    } catch {
      return { status: "miss", fields: {} };
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Priority 27: Decypha  (decypha.com — all 6 GCC exchanges)
// MENA financial data: revenue, EBITDA, board, ownership, analyst reports
// ─────────────────────────────────────────────────────────────────────────
export const decyphaConnector: Connector = {
  source_key: "decypha",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "DECYPHA_API_KEY not set" };
    const r = await apiFetch("https://api.decypha.com/v1/company/search?q=aramco&limit=1", {
      headers: { "X-Api-Key": apiKey, Accept: "application/json" },
    });
    if (!r) return { ok: false, message: "Decypha API unreachable" };
    if (r.status === 401 || r.status === 403) return { ok: false, message: "Decypha key invalid" };
    return { ok: r.ok, message: r.ok ? "Decypha key valid" : `HTTP ${r.status}` };
  },

  async enrich({ seed, apiKey, alreadyFilled }) {
    if (!apiKey) return noKey(apiKey, "Decypha");
    const targets: Field[] = [
      "company_revenue", "company_isin", "company_size",
      "company_description", "company_industry", "company_founded_year",
    ];
    if (targets.every(f => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    const query = seed.company ?? seed.domain ?? "";
    if (!query) return { status: "miss", fields: {} };

    const r = await apiFetch(
      `https://api.decypha.com/v1/company/search?q=${encodeURIComponent(query)}&limit=1`,
      { headers: { "X-Api-Key": apiKey, Accept: "application/json" } },
    );
    if (!r || !r.ok) return { status: "miss", fields: {} };

    try {
      const json: any = await r.json();
      const co = json.data?.[0] ?? json.companies?.[0] ?? json;
      if (!co || !co.name) return { status: "miss", fields: {} };

      const out: Partial<Record<Field, unknown>> = {};
      if (co.revenue && !alreadyFilled.has("company_revenue")) out.company_revenue = String(co.revenue);
      if (co.isin && !alreadyFilled.has("company_isin")) out.company_isin = co.isin;
      if (co.employees && !alreadyFilled.has("company_size")) out.company_size = String(co.employees);
      if (co.description && !alreadyFilled.has("company_description")) out.company_description = co.description;
      if (co.sector && !alreadyFilled.has("company_industry")) out.company_industry = co.sector;
      if (co.founded && !alreadyFilled.has("company_founded_year")) out.company_founded_year = co.founded;

      return { status: Object.keys(out).length ? "ok" : "miss", fields: out, cost_usd: 0.05 };
    } catch {
      return { status: "miss", fields: {} };
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Priority 29: Argaam  (argaam.com — Saudi financial news + Tadawul filings)
// Arabic-first; best aggregator for KSA corporate actions
// ─────────────────────────────────────────────────────────────────────────
export const argaamConnector: Connector = {
  source_key: "argaam",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "ARGAAM_API_KEY not set" };
    const r = await apiFetch("https://api.argaam.com/v1/company/search?q=aramco&limit=1", {
      headers: { "Authorization": `Bearer ${apiKey}`, Accept: "application/json" },
    });
    if (!r) return { ok: false, message: "Argaam API unreachable" };
    if (r.status === 401 || r.status === 403) return { ok: false, message: "Argaam key invalid" };
    return { ok: r.ok, message: r.ok ? "Argaam key valid" : `HTTP ${r.status}` };
  },

  async enrich({ seed, apiKey, alreadyFilled }) {
    if (!apiKey) return noKey(apiKey, "Argaam");
    const targets: Field[] = [
      "news_recent", "company_isin", "company_name_ar",
      "company_revenue", "company_industry",
    ];
    if (targets.every(f => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    const query = seed.company ?? "";
    if (!query) return { status: "miss", fields: {} };

    const r = await apiFetch(
      `https://api.argaam.com/v1/company/search?q=${encodeURIComponent(query)}&limit=1`,
      { headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" } },
    );
    if (!r || !r.ok) return { status: "miss", fields: {} };

    try {
      const json: any = await r.json();
      const co = json.data?.[0] ?? json.results?.[0] ?? json;
      if (!co || (!co.nameEn && !co.nameAr)) return { status: "miss", fields: {} };

      const out: Partial<Record<Field, unknown>> = {};
      if (co.nameAr && !alreadyFilled.has("company_name_ar")) out.company_name_ar = co.nameAr;
      if (co.isin && !alreadyFilled.has("company_isin")) out.company_isin = co.isin;
      if (co.sector && !alreadyFilled.has("company_industry")) out.company_industry = co.sector;
      if (co.lastNews && !alreadyFilled.has("news_recent")) out.news_recent = co.lastNews;
      if (co.revenue && !alreadyFilled.has("company_revenue")) out.company_revenue = String(co.revenue);

      return { status: Object.keys(out).length ? "ok" : "miss", fields: out, cost_usd: 0.02 };
    } catch {
      return { status: "miss", fields: {} };
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Priority 31: Wamda  (wamda.com — MENA startup ecosystem)
// Deals, investor profiles, founder backgrounds — complements MAGNiTT
// ─────────────────────────────────────────────────────────────────────────
export const wamdaConnector: Connector = {
  source_key: "wamda",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "WAMDA_API_KEY not set" };
    const r = await apiFetch("https://api.wamda.com/v1/companies?limit=1", {
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
    });
    if (!r) return { ok: false, message: "Wamda API unreachable" };
    if (r.status === 401 || r.status === 403) return { ok: false, message: "Wamda key invalid" };
    return { ok: r.ok, message: r.ok ? "Wamda key valid" : `HTTP ${r.status}` };
  },

  async enrich({ seed, apiKey, alreadyFilled }) {
    if (!apiKey) return noKey(apiKey, "Wamda");
    const targets: Field[] = ["company_funding", "company_description", "company_industry", "news_recent"];
    if (targets.every(f => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    const query = seed.company ?? "";
    if (!query) return { status: "miss", fields: {} };

    const r = await apiFetch(
      `https://api.wamda.com/v1/companies?q=${encodeURIComponent(query)}&limit=1`,
      { headers: { "X-API-Key": apiKey, Accept: "application/json" } },
    );
    if (!r || !r.ok) return { status: "miss", fields: {} };

    try {
      const json: any = await r.json();
      const co = json.data?.[0] ?? json.companies?.[0] ?? json;
      if (!co || !co.name) return { status: "miss", fields: {} };

      const out: Partial<Record<Field, unknown>> = {};
      if (co.totalFunding && !alreadyFilled.has("company_funding"))
        out.company_funding = co.totalFunding;
      if (co.description && !alreadyFilled.has("company_description"))
        out.company_description = co.description;
      if (co.industry && !alreadyFilled.has("company_industry"))
        out.company_industry = co.industry;
      if (co.lastRound && !alreadyFilled.has("news_recent"))
        out.news_recent = `Latest round: ${co.lastRound}`;

      return { status: Object.keys(out).length ? "ok" : "miss", fields: out, cost_usd: 0.02 };
    } catch {
      return { status: "miss", fields: {} };
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Priority 48: FullContact  (docs.fullcontact.com — person identity graph)
// Strong phone → person resolution; $0.05–0.15/lookup
// ─────────────────────────────────────────────────────────────────────────
export const fullcontactConnector: Connector = {
  source_key: "fullcontact",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "FULLCONTACT_API_KEY not set" };
    // FullContact uses POST /person.enrich; a minimal body returns credit usage
    const r = await apiFetch("https://api.fullcontact.com/v3/person.enrich", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "test@example.com" }),
    });
    if (!r) return { ok: false, message: "FullContact API unreachable" };
    if (r.status === 401 || r.status === 403) return { ok: false, message: "FullContact key invalid" };
    // 404 means key is valid but person not found — that's fine for a test
    return { ok: r.ok || r.status === 404, message: r.ok || r.status === 404 ? "FullContact key valid" : `HTTP ${r.status}` };
  },

  async enrich({ seed, apiKey, alreadyFilled }) {
    if (!apiKey) return noKey(apiKey, "FullContact");
    const targets: Field[] = [
      "full_name", "email", "phone", "linkedin_url",
      "title", "seniority", "company_name", "company_domain",
    ];
    if (targets.every(f => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    // Build query — FullContact resolves identity from any identifier
    const body: Record<string, string> = {};
    if (seed.email) body.email = seed.email;
    else if (seed.phone) body.phone = seed.phone;
    else if (seed.linkedin_url) body.linkedinUrl = seed.linkedin_url;
    else return { status: "miss", fields: {} };

    const r = await apiFetch("https://api.fullcontact.com/v3/person.enrich", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!r || !r.ok) return { status: "miss", fields: {} };

    try {
      const json: any = await r.json();
      const out: Partial<Record<Field, unknown>> = {};

      const fullName = json.fullName ?? `${json.name?.given ?? ""} ${json.name?.family ?? ""}`.trim();
      if (fullName && !alreadyFilled.has("full_name")) out.full_name = fullName;

      const emails: string[] = json.emails?.map((e: any) => e.address).filter(Boolean) ?? [];
      if (emails[0] && !alreadyFilled.has("email")) out.email = emails[0];

      const phones: string[] = json.phones?.map((p: any) => p.number).filter(Boolean) ?? [];
      if (phones[0] && !alreadyFilled.has("phone")) {
        out.phone = phones[0];
        out.phone_confidence = json.phones?.[0]?.type === "verified" ? 0.9 : 0.6;
      }

      const linkedin = json.profiles?.find((p: any) => p.service === "linkedin")?.username;
      if (linkedin && !alreadyFilled.has("linkedin_url"))
        out.linkedin_url = `https://linkedin.com/in/${linkedin}`;

      const employment = json.employment?.[0];
      if (employment?.title && !alreadyFilled.has("title")) out.title = employment.title;
      if (employment?.name && !alreadyFilled.has("company_name")) out.company_name = employment.name;
      if (employment?.domain && !alreadyFilled.has("company_domain")) out.company_domain = employment.domain;

      return { status: Object.keys(out).length ? "ok" : "miss", fields: out, cost_usd: 0.10 };
    } catch {
      return { status: "miss", fields: {} };
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Priority 52: Dun & Bradstreet Direct+  (directplus.dnb.com)
// Company firmographics; strong GCC regional registrar partnerships
// Enterprise pricing — key must be supplied as "DUNS_API_KEY"
// ─────────────────────────────────────────────────────────────────────────
export const dnbConnector: Connector = {
  source_key: "dnb",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "DUNS_API_KEY not set" };
    // D&B Direct+ uses OAuth2 token flow — try /authentication/v2/token
    const r = await apiFetch("https://plus.dnb.com/v1/authentication/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grant_type: "client_credentials" }),
    });
    if (!r) return { ok: false, message: "D&B API unreachable" };
    if (r.status === 401) return { ok: false, message: "D&B credentials invalid" };
    return { ok: r.ok, message: r.ok ? "D&B credentials valid" : `HTTP ${r.status}` };
  },

  async enrich({ seed, apiKey, alreadyFilled }) {
    if (!apiKey) return noKey(apiKey, "D&B");
    const targets: Field[] = [
      "company_name", "company_size", "company_revenue", "company_industry",
      "company_country", "company_city", "company_cr_number", "company_founded_year",
    ];
    if (targets.every(f => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    if (!seed.company && !seed.domain) return { status: "miss", fields: {} };

    // Step 1: get OAuth token
    const tokenResp = await apiFetch("https://plus.dnb.com/v1/authentication/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grant_type: "client_credentials" }),
    });
    if (!tokenResp || !tokenResp.ok) return { status: "error", fields: {}, error: "D&B auth failed" };
    const { access_token } = await tokenResp.json() as any;

    // Step 2: search company
    const params = new URLSearchParams();
    if (seed.company) params.set("name", seed.company);
    if (seed.country) params.set("countryISOAlpha2Code", seed.country.slice(0, 2).toUpperCase());

    const r = await apiFetch(
      `https://plus.dnb.com/v1/search/companies?${params}&pageSize=1`,
      { headers: { Authorization: `Bearer ${access_token}`, Accept: "application/json" } },
    );
    if (!r || !r.ok) return { status: "miss", fields: {} };

    try {
      const json: any = await r.json();
      const co = json.searchCandidates?.[0]?.organization;
      if (!co) return { status: "miss", fields: {} };

      const out: Partial<Record<Field, unknown>> = {};
      if (co.primaryName && !alreadyFilled.has("company_name")) out.company_name = co.primaryName;
      if (co.numberOfEmployees?.[0]?.value && !alreadyFilled.has("company_size"))
        out.company_size = String(co.numberOfEmployees[0].value);
      if (co.annualRevenue?.value && !alreadyFilled.has("company_revenue"))
        out.company_revenue = String(co.annualRevenue.value);
      if (co.primaryIndustryCode?.usSicV4Description && !alreadyFilled.has("company_industry"))
        out.company_industry = co.primaryIndustryCode.usSicV4Description;
      if (co.primaryAddress?.addressCountry?.name && !alreadyFilled.has("company_country"))
        out.company_country = co.primaryAddress.addressCountry.name;
      if (co.primaryAddress?.addressLocality?.name && !alreadyFilled.has("company_city"))
        out.company_city = co.primaryAddress.addressLocality.name;
      if (co.registrationNumbers?.[0]?.registrationNumber && !alreadyFilled.has("company_cr_number"))
        out.company_cr_number = co.registrationNumbers[0].registrationNumber;
      if (co.startDate && !alreadyFilled.has("company_founded_year"))
        out.company_founded_year = parseInt(co.startDate.slice(0, 4));

      return { status: Object.keys(out).length ? "ok" : "miss", fields: out, cost_usd: 0.20 };
    } catch {
      return { status: "miss", fields: {} };
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Priority 55: Breeze Intelligence  (HubSpot Breeze — formerly Clearbit)
// Company + contact enrichment via HubSpot's Data Enrichment API
// $0.005/lookup; requires HubSpot private app access token
// ─────────────────────────────────────────────────────────────────────────
export const breezeConnector: Connector = {
  source_key: "breeze_intelligence",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "BREEZE_API_KEY not set" };
    const r = await apiFetch(
      "https://api.hubapi.com/data-enrichment/v1/company/enrich?domain=hubspot.com",
      { headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" } },
    );
    if (!r) return { ok: false, message: "Breeze API unreachable" };
    if (r.status === 401 || r.status === 403) return { ok: false, message: "Breeze token invalid" };
    return { ok: r.ok || r.status === 402, message: r.ok ? "Breeze key valid" : `HTTP ${r.status}` };
  },

  async enrich({ seed, apiKey, alreadyFilled }) {
    if (!apiKey) return noKey(apiKey, "Breeze");
    const targets: Field[] = [
      "company_name", "company_description", "company_industry",
      "company_size", "company_revenue", "company_founded_year",
      "company_logo_url", "company_tech_stack", "company_city",
    ];
    if (targets.every(f => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    const domain = seed.domain ?? "";
    if (!domain) return { status: "miss", fields: {} };

    const r = await apiFetch(
      `https://api.hubapi.com/data-enrichment/v1/company/enrich?domain=${encodeURIComponent(domain)}`,
      { headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" } },
    );
    if (!r || !r.ok) return { status: "miss", fields: {} };

    try {
      const json: any = await r.json();
      const out: Partial<Record<Field, unknown>> = {};

      if (json.name && !alreadyFilled.has("company_name")) out.company_name = json.name;
      if (json.description && !alreadyFilled.has("company_description")) out.company_description = json.description;
      if (json.category && !alreadyFilled.has("company_industry")) out.company_industry = json.category;
      if (json.employees && !alreadyFilled.has("company_size")) out.company_size = String(json.employees);
      if (json.estimatedAnnualRevenue && !alreadyFilled.has("company_revenue"))
        out.company_revenue = String(json.estimatedAnnualRevenue);
      if (json.foundedYear && !alreadyFilled.has("company_founded_year"))
        out.company_founded_year = json.foundedYear;
      if (json.logo && !alreadyFilled.has("company_logo_url")) out.company_logo_url = json.logo;
      if (json.tech && Array.isArray(json.tech) && !alreadyFilled.has("company_tech_stack"))
        out.company_tech_stack = json.tech;
      if (json.city && !alreadyFilled.has("company_city")) out.company_city = json.city;

      return { status: Object.keys(out).length ? "ok" : "miss", fields: out, cost_usd: 0.005 };
    } catch {
      return { status: "miss", fields: {} };
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Priority 57: Bombora Intent  (bombora.com — B2B intent surge scores)
// Topic-level buying intent; enterprise pricing
// ─────────────────────────────────────────────────────────────────────────
export const bomboraConnector: Connector = {
  source_key: "bombora",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "BOMBORA_API_KEY not set" };
    const r = await apiFetch("https://api.bombora.com/v1/company/intent?domain=example.com&limit=1", {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    });
    if (!r) return { ok: false, message: "Bombora API unreachable" };
    if (r.status === 401 || r.status === 403) return { ok: false, message: "Bombora key invalid" };
    return { ok: r.ok, message: r.ok ? "Bombora key valid" : `HTTP ${r.status}` };
  },

  async enrich({ seed, apiKey, alreadyFilled }) {
    if (!apiKey) return noKey(apiKey, "Bombora");
    if (alreadyFilled.has("intent_signals")) return { status: "skipped", fields: {} };

    const domain = seed.domain ?? "";
    if (!domain) return { status: "miss", fields: {} };

    const r = await apiFetch(
      `https://api.bombora.com/v1/company/intent?domain=${encodeURIComponent(domain)}`,
      { headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" } },
    );
    if (!r || !r.ok) return { status: "miss", fields: {} };

    try {
      const json: any = await r.json();
      const topics: any[] = json.topics ?? json.intent_topics ?? [];
      const surging = topics.filter((t: any) => t.score >= 60).map((t: any) => t.topic ?? t.name);
      if (!surging.length) return { status: "miss", fields: {} };

      return {
        status: "ok",
        fields: {
          intent_signals: `Bombora intent surge: ${surging.slice(0, 5).join(", ")}`,
        },
        cost_usd: 0.10,
      };
    } catch {
      return { status: "miss", fields: {} };
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Priority 65: Clay  (clay.com — waterfall fallback / data orchestration)
// Used as final fallback when all other sources miss; credit-based pricing
// ─────────────────────────────────────────────────────────────────────────
export const clayConnector: Connector = {
  source_key: "clay",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "CLAY_API_KEY not set" };
    const r = await apiFetch("https://api.clay.com/v1/sources?limit=1", {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
    });
    if (!r) return { ok: false, message: "Clay API unreachable" };
    if (r.status === 401 || r.status === 403) return { ok: false, message: "Clay key invalid" };
    return { ok: r.ok, message: r.ok ? "Clay key valid" : `HTTP ${r.status}` };
  },

  async enrich({ seed, apiKey, alreadyFilled }) {
    if (!apiKey) return noKey(apiKey, "Clay");
    // Clay is the fallback — only run if we still have empty contact fields
    const missingContact: Field[] = ["email", "phone", "linkedin_url", "title"];
    const anyMissing = missingContact.some(f => !alreadyFilled.has(f));
    if (!anyMissing) return { status: "skipped", fields: {} };

    const body = {
      ...(seed.full_name ? { full_name: seed.full_name } : {}),
      ...(seed.email ? { email: seed.email } : {}),
      ...(seed.company ? { company: seed.company } : {}),
      ...(seed.domain ? { domain: seed.domain } : {}),
    };
    if (!Object.keys(body).length) return { status: "miss", fields: {} };

    const r = await apiFetch("https://api.clay.com/v1/people/enrich", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!r || !r.ok) return { status: "miss", fields: {} };

    try {
      const json: any = await r.json();
      const out: Partial<Record<Field, unknown>> = {};
      if (json.email && !alreadyFilled.has("email")) out.email = json.email;
      if (json.phone && !alreadyFilled.has("phone")) out.phone = json.phone;
      if (json.linkedin_url && !alreadyFilled.has("linkedin_url")) out.linkedin_url = json.linkedin_url;
      if (json.title && !alreadyFilled.has("title")) out.title = json.title;
      if (json.company && !alreadyFilled.has("company_name")) out.company_name = json.company;

      return { status: Object.keys(out).length ? "ok" : "miss", fields: out, cost_usd: 0.05 };
    } catch {
      return { status: "miss", fields: {} };
    }
  },
};
