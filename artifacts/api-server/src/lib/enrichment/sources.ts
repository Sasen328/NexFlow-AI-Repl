/**
 * Source registry.
 *
 * Every source the orchestrator knows about lives here:
 * its display metadata, its priority default, and a `connector`
 * reference. The DB table `enrichment_sources` is auto-seeded from this
 * registry on cold-start (see seedSources()).
 *
 * To add a new source:
 *   1. Add a connector file in connectors/<key>.ts
 *   2. Append a row to REGISTRY below
 *   3. Restart the api-server workflow (autoSeed inserts it)
 */

import type { Connector } from "./types.js";
import { db, enrichment_sources } from "@workspace/db";
import { eq } from "drizzle-orm";

import { hunterConnector } from "./connectors/hunter.js";
import { apolloConnector } from "./connectors/apollo.js";
import { lushaConnector } from "./connectors/lusha.js";
import { crunchbaseConnector } from "./connectors/crunchbase.js";
import { rocketreachConnector } from "./connectors/rocketreach.js";
import { pdlConnector } from "./connectors/pdl.js";
import { magnittConnector } from "./connectors/magnitt.js";
import { wathiqConnector } from "./connectors/wathiq.js";
import { tadawulConnector } from "./connectors/tadawul.js";
import { webScraperConnector } from "./connectors/web-scraper.js";
import { pythonScraperConnector } from "./connectors/python-scraper.js";

export interface RegistryEntry {
  source_key: string;
  name: string;
  kind: "api" | "scraper" | "gov_registry" | "exchange" | "ai_scraper";
  default_priority: number;
  default_enabled: boolean;
  connector: Connector;
  meta: {
    category: "western_api" | "gcc_native" | "scraper" | "ai_sidecar";
    blurb: string;
    fields: string[];
    gcc_coverage: "high" | "medium" | "low" | "n/a";
    pricing: string;
    docs_url?: string;
    needs_key: boolean;
    key_label?: string;
    region_badge?: string;
    rate_hint?: string;
  };
}

/** All known sources, in default-priority order. Lower priority = runs first. */
export const REGISTRY: RegistryEntry[] = [
  // ── 1. Public-web stealth scraper (no key needed, runs first to enrich
  //       the seed cheaply before paid APIs.)
  {
    source_key: "web_scraper",
    name: "Public Web Scraper",
    kind: "scraper",
    default_priority: 10,
    default_enabled: true,
    connector: webScraperConnector,
    meta: {
      category: "scraper",
      blurb: "Cheerio + Playwright + stealth — pulls company About/Contact/Careers pages, RSS, public funding feeds. Free, single-IP, ~30 req/min.",
      fields: ["company_domain", "company_description", "company_logo_url", "company_industry", "company_country", "email", "linkedin_url", "twitter_handle", "company_tech_stack"],
      gcc_coverage: "n/a",
      pricing: "Free",
      needs_key: false,
      region_badge: "Global",
      rate_hint: "Single-IP · ~30/min",
    },
  },
  // ── 2. Python AI sidecar (Crawl4AI + BeautifulSoup) — wired but the
  //       service itself is a separate artifact (artifacts/enrichment-scraper).
  {
    source_key: "python_scraper",
    name: "Python AI Scraper (Crawl4AI)",
    kind: "ai_scraper",
    default_priority: 15,
    default_enabled: false,
    connector: pythonScraperConnector,
    meta: {
      category: "ai_sidecar",
      blurb: "Python sidecar running Crawl4AI + BeautifulSoup for AI-powered structured extraction from messy/JS-heavy pages.",
      fields: ["company_description", "company_industry", "company_size", "company_tech_stack", "news_recent", "hiring_signals"],
      gcc_coverage: "n/a",
      pricing: "Free (compute only)",
      needs_key: false,
      region_badge: "Global",
      rate_hint: "Sidecar service",
    },
  },
  // ── 3. Hunter.io
  {
    source_key: "hunter",
    name: "Hunter.io",
    kind: "api",
    default_priority: 20,
    default_enabled: true,
    connector: hunterConnector,
    meta: {
      category: "western_api",
      blurb: "Email finder + verifier built on domain pattern detection. Strong on Western corps, decent for big GCC enterprises.",
      fields: ["email", "email_verified", "first_name", "last_name", "title", "company_domain", "linkedin_url", "twitter_handle", "phone"],
      gcc_coverage: "medium",
      pricing: "50 free / mo · $34+ paid",
      docs_url: "https://hunter.io/api-keys",
      needs_key: true,
      key_label: "API Key",
      region_badge: "Global",
      rate_hint: "10 req/sec",
    },
  },
  // ── 4. Apollo.io — best Western coverage of GCC enterprise contacts
  {
    source_key: "apollo",
    name: "Apollo.io",
    kind: "api",
    default_priority: 25,
    default_enabled: true,
    connector: apolloConnector,
    meta: {
      category: "western_api",
      blurb: "Largest Western contact DB with ~20–30M MENA contacts. Best for KSA/UAE enterprise filtering by title + company.",
      fields: ["email", "phone", "first_name", "last_name", "title", "seniority", "linkedin_url", "company_name", "company_domain", "company_industry", "company_size", "company_funding", "company_tech_stack"],
      gcc_coverage: "high",
      pricing: "Free (200 credits) · $49+ paid",
      docs_url: "https://app.apollo.io/#/settings/integrations/api",
      needs_key: true,
      key_label: "API Key",
      region_badge: "Global · GCC tilt",
      rate_hint: "200 req/min",
    },
  },
  // ── 5. Lusha — strong direct-dial coverage
  {
    source_key: "lusha",
    name: "Lusha",
    kind: "api",
    default_priority: 30,
    default_enabled: true,
    connector: lushaConnector,
    meta: {
      category: "western_api",
      blurb: "Direct-dial mobile + work emails. GDPR-compliant. Moderate GCC coverage but very high accuracy on EU/US execs visiting GCC.",
      fields: ["email", "phone", "linkedin_url", "first_name", "last_name", "title", "seniority", "company_name", "company_domain"],
      gcc_coverage: "medium",
      pricing: "5 free / mo · $39+ paid",
      docs_url: "https://www.lusha.com/business/api/",
      needs_key: true,
      key_label: "API Key",
      region_badge: "Global",
      rate_hint: "60 req/min",
    },
  },
  // ── 6. Crunchbase Basic (free)
  {
    source_key: "crunchbase",
    name: "Crunchbase",
    kind: "api",
    default_priority: 40,
    default_enabled: true,
    connector: crunchbaseConnector,
    meta: {
      category: "western_api",
      blurb: "Funding rounds + investor data. Coverage skewed to well-funded startups; misses most Tadawul/DFM-listed firms (use those exchanges instead).",
      fields: ["company_name", "company_domain", "company_industry", "company_funding", "company_size", "company_founded_year", "company_description", "company_logo_url"],
      gcc_coverage: "low",
      pricing: "Basic free · Pro $49/mo",
      docs_url: "https://data.crunchbase.com/docs/getting-started",
      needs_key: true,
      key_label: "User Key",
      region_badge: "Global",
      rate_hint: "200 req/day (free)",
    },
  },
  // ── 7. RocketReach
  {
    source_key: "rocketreach",
    name: "RocketReach",
    kind: "api",
    default_priority: 45,
    default_enabled: true,
    connector: rocketreachConnector,
    meta: {
      category: "western_api",
      blurb: "LinkedIn-derived contact DB. Weaker GCC coverage but useful for cross-checking Western execs at GCC subsidiaries.",
      fields: ["email", "phone", "linkedin_url", "title", "company_name", "company_domain"],
      gcc_coverage: "low",
      pricing: "Trial · $39+ paid",
      docs_url: "https://rocketreach.co/api",
      needs_key: true,
      key_label: "API Key",
      region_badge: "Global",
      rate_hint: "100 req/hr",
    },
  },
  // ── 8. People Data Labs
  {
    source_key: "pdl",
    name: "People Data Labs",
    kind: "api",
    default_priority: 50,
    default_enabled: true,
    connector: pdlConnector,
    meta: {
      category: "western_api",
      blurb: "Person + company enrichment from a 3B-record graph. Decent GCC coverage and very rich firmographics.",
      fields: ["email", "phone", "linkedin_url", "title", "seniority", "first_name", "last_name", "company_name", "company_domain", "company_industry", "company_size", "company_revenue", "company_tech_stack"],
      gcc_coverage: "medium",
      pricing: "Free trial · usage-based paid",
      docs_url: "https://docs.peopledatalabs.com/docs/quickstart",
      needs_key: true,
      key_label: "API Key",
      region_badge: "Global",
      rate_hint: "100 req/min",
    },
  },
  // ── 9. MAGNiTT (GCC-native: startup + funding)
  {
    source_key: "magnitt",
    name: "MAGNiTT",
    kind: "api",
    default_priority: 22,
    default_enabled: true,
    connector: magnittConnector,
    meta: {
      category: "gcc_native",
      blurb: "Dubai-based GCC + MENA startup intelligence. Best-in-class for funding rounds in KSA/UAE/Egypt that Crunchbase misses.",
      fields: ["company_name", "company_domain", "company_industry", "company_funding", "company_size", "company_country", "company_founded_year", "company_description"],
      gcc_coverage: "high",
      pricing: "Subscription (contact sales)",
      docs_url: "https://magnitt.com/contact",
      needs_key: true,
      key_label: "Bearer Token",
      region_badge: "🇦🇪 GCC + MENA",
      rate_hint: "60 req/min",
    },
  },
  // ── 10. Wathiq (KSA Ministry of Commerce — public registry)
  {
    source_key: "wathiq",
    name: "Wathiq (KSA Registry)",
    kind: "gov_registry",
    default_priority: 24,
    default_enabled: true,
    connector: wathiqConnector,
    meta: {
      category: "gcc_native",
      blurb: "Saudi Ministry of Commerce official commercial registration lookup. Authoritative for any KSA-registered entity (CR number, address, status).",
      fields: ["company_name", "company_cr_number", "company_country", "company_industry", "company_founded_year"],
      gcc_coverage: "high",
      pricing: "Free (registration required)",
      docs_url: "https://wathiq.business.sa/",
      needs_key: true,
      key_label: "App ID",
      region_badge: "🇸🇦 KSA",
      rate_hint: "Govt — slow",
    },
  },
  // ── 11. Tadawul + DFM + ADX
  {
    source_key: "tadawul",
    name: "Tadawul / DFM / ADX",
    kind: "exchange",
    default_priority: 26,
    default_enabled: true,
    connector: tadawulConnector,
    meta: {
      category: "gcc_native",
      blurb: "Saudi (Tadawul), Dubai (DFM), and Abu Dhabi (ADX) stock exchanges — public disclosures. Authoritative for any GCC-listed corp's revenue, leadership, sector.",
      fields: ["company_name", "company_isin", "company_industry", "company_revenue", "company_country", "company_size", "company_description"],
      gcc_coverage: "high",
      pricing: "Free (public disclosures)",
      docs_url: "https://www.saudiexchange.sa/",
      needs_key: false,
      region_badge: "🇸🇦🇦🇪 GCC exchanges",
      rate_hint: "Web scrape · 10/min",
    },
  },
];

/** Fast lookup by source_key. */
const REGISTRY_BY_KEY = new Map(REGISTRY.map(r => [r.source_key, r]));

export function getRegistryEntry(source_key: string): RegistryEntry | null {
  return REGISTRY_BY_KEY.get(source_key) ?? null;
}

/**
 * Auto-seed enrichment_sources from the registry. Called on cold-start.
 * - Inserts any registry rows missing from DB.
 * - Updates display metadata (name, kind) for existing rows.
 * - Never overwrites the user's saved api_key, priority, or enabled state.
 */
export async function seedSources(): Promise<void> {
  const existing = await db.select().from(enrichment_sources);
  const existingByKey = new Map(existing.map(r => [r.source_key, r]));

  for (const entry of REGISTRY) {
    const found = existingByKey.get(entry.source_key);
    if (!found) {
      await db.insert(enrichment_sources).values({
        source_key: entry.source_key,
        name: entry.name,
        kind: entry.kind,
        priority: entry.default_priority,
        enabled: entry.default_enabled,
        config: {},
      });
    } else if (found.name !== entry.name || found.kind !== entry.kind) {
      // Keep user-managed fields, only refresh display metadata
      await db
        .update(enrichment_sources)
        .set({ name: entry.name, kind: entry.kind, updated_at: new Date() })
        .where(eq(enrichment_sources.source_key, entry.source_key));
    }
  }
}
