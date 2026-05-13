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
// AI orchestration (OpenRouter)
import {
  openrouterSearchConnector,
  openrouterExtractorConnector,
  openrouterComposerConnector,
} from "./connectors/openrouter-ai.js";
// Free / no-key / open-data sources
import { gleifConnector } from "./connectors/gleif.js";
import { opencorporatesConnector } from "./connectors/opencorporates.js";
import { wikidataConnector } from "./connectors/wikidata.js";
import { clearbitLogoConnector } from "./connectors/clearbit-logo.js";
import { githubOrgConnector } from "./connectors/github-org.js";
import { wappalyzerConnector } from "./connectors/wappalyzer.js";
import { emailPermutatorConnector } from "./connectors/email-permutator.js";
// SaaS stubs (real APIs but require user-pasted keys)
import {
  zoominfoConnector, cognismConnector, seamlessConnector, kasprConnector,
  datanyzeConnector, signalhireConnector, proxycurlConnector, lead411Connector,
  prospeoConnector, clearbitDeprecatedConnector, salesintelConnector, swordfishConnector,
  adaptConnector, leadgibbonConnector, linkedinSalesNavConnector, explorumConnector, vibeConnector,
} from "./connectors/saas-stubs.js";
// Compliance & sanctions screening (free public APIs + Saudi regulatory portals)
import { complianceConnector } from "./connectors/compliance.js";
// News seeder — Perplexity web search + DeepSeek synthesis
import { newsSeederConnector } from "./connectors/news-seeder.js";
// GCC-native + global paid source stubs (Dhow, Decypha, Argaam, Wamda,
// FullContact, D&B, Breeze Intelligence, Bombora, Clay)
import {
  dhowConnector, decyphaConnector, argaamConnector, wamdaConnector,
  fullcontactConnector, dnbConnector, breezeConnector, bomboraConnector,
  clayConnector,
} from "./connectors/gcc-stubs.js";

export interface RegistryEntry {
  source_key: string;
  name: string;
  kind: "api" | "scraper" | "gov_registry" | "exchange" | "ai_scraper" | "ai_search" | "ai_extractor" | "ai_composer" | "open_data" | "manual";
  default_priority: number;
  default_enabled: boolean;
  connector: Connector;
  meta: {
    category: "western_api" | "gcc_native" | "scraper" | "ai_sidecar" | "ai_orchestration" | "open_data" | "manual";
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
  // ──────────────────────────────────────────────────────────────────
  // OPEN DATA / NO-KEY SOURCES — run cheap, run early
  // ──────────────────────────────────────────────────────────────────
  {
    source_key: "openrouter_search",
    name: "AI Search (Perplexity)",
    kind: "ai_search",
    default_priority: 5,
    default_enabled: true,
    connector: openrouterSearchConnector,
    meta: {
      category: "ai_orchestration",
      blurb: "Perplexity Sonar via OpenRouter — finds the official domain for fuzzy / Arabic / GCC-local company names. Replaces the old DuckDuckGo HTML scrape.",
      fields: ["company_domain"],
      gcc_coverage: "high",
      pricing: "~$0.001/lookup (OpenRouter)",
      docs_url: "https://openrouter.ai/perplexity/sonar",
      needs_key: false,
      region_badge: "Global · GCC-aware",
      rate_hint: "OpenRouter env-keyed",
    },
  },
  {
    source_key: "openrouter_extractor",
    name: "AI Extractor (Gemini)",
    kind: "ai_extractor",
    default_priority: 12,
    default_enabled: true,
    connector: openrouterExtractorConnector,
    meta: {
      category: "ai_orchestration",
      blurb: "Gemini 2.5 Flash via OpenRouter — turns scraped HTML into structured fields (industry, size, founded year, tech stack). Far better than regex.",
      fields: ["company_name", "company_description", "company_industry", "company_country", "company_size", "company_founded_year", "company_tech_stack", "linkedin_url", "twitter_handle"],
      gcc_coverage: "high",
      pricing: "~$0.0005/page (OpenRouter)",
      docs_url: "https://openrouter.ai/google/gemini-2.5-flash",
      needs_key: false,
      region_badge: "Global",
      rate_hint: "OpenRouter env-keyed",
    },
  },
  {
    source_key: "gleif",
    name: "GLEIF (LEI Registry)",
    kind: "open_data",
    default_priority: 18,
    default_enabled: true,
    connector: gleifConnector,
    meta: {
      category: "open_data",
      blurb: "Global Legal Entity Identifier Foundation — free, authoritative for every GCC corp with international banking (Aramco, Emirates NBD, ADNOC, STC, QNB).",
      fields: ["company_name", "company_country", "company_isin", "company_founded_year"],
      gcc_coverage: "high",
      pricing: "Free, no key",
      docs_url: "https://www.gleif.org/en/lei-data/gleif-api",
      needs_key: false,
      region_badge: "Global · GCC strong",
      rate_hint: "Free public API",
    },
  },
  {
    source_key: "opencorporates",
    name: "OpenCorporates",
    kind: "open_data",
    default_priority: 28,
    default_enabled: true,
    connector: opencorporatesConnector,
    meta: {
      category: "open_data",
      blurb: "200M+ companies across 130+ jurisdictions including UAE Federal, DIFC, ADGM, KSA, Qatar, Bahrain, Kuwait, Oman. Free tier needs no key.",
      fields: ["company_name", "company_cr_number", "company_country", "company_founded_year", "company_industry"],
      gcc_coverage: "high",
      pricing: "Free tier · paid for higher rate",
      docs_url: "https://opencorporates.com/api_accounts/new",
      needs_key: false,
      key_label: "API Token (optional)",
      region_badge: "Global · GCC strong",
      rate_hint: "~50/day free",
    },
  },
  {
    source_key: "wikidata",
    name: "Wikidata",
    kind: "open_data",
    default_priority: 32,
    default_enabled: true,
    connector: wikidataConnector,
    meta: {
      category: "open_data",
      blurb: "Open structured knowledge graph. Best for any well-known public company — fills founded year, headcount band, official site, headquarters.",
      fields: ["company_name", "company_description", "company_country", "company_size", "company_founded_year", "company_domain"],
      gcc_coverage: "medium",
      pricing: "Free, no key",
      docs_url: "https://www.wikidata.org/wiki/Wikidata:Data_access",
      needs_key: false,
      region_badge: "Global",
      rate_hint: "Free public API",
    },
  },
  {
    source_key: "clearbit_logo",
    name: "Clearbit Logo CDN",
    kind: "open_data",
    default_priority: 34,
    default_enabled: true,
    connector: clearbitLogoConnector,
    meta: {
      category: "open_data",
      blurb: "Free company logo CDN — instant, no key. Falls back gracefully when domain unknown.",
      fields: ["company_logo_url"],
      gcc_coverage: "high",
      pricing: "Free, no key",
      docs_url: "https://clearbit.com/logo",
      needs_key: false,
      region_badge: "Global",
      rate_hint: "Unmetered",
    },
  },
  {
    source_key: "github_org",
    name: "GitHub Org / User",
    kind: "open_data",
    default_priority: 36,
    default_enabled: true,
    connector: githubOrgConnector,
    meta: {
      category: "open_data",
      blurb: "Catches dev-tools / fintech / AI companies with an open-source presence — strong hiring signal indicator.",
      fields: ["company_description", "company_country", "twitter_handle", "company_domain", "company_founded_year", "hiring_signals"],
      gcc_coverage: "medium",
      pricing: "Free · optional PAT for higher rate",
      docs_url: "https://docs.github.com/en/rest",
      needs_key: false,
      key_label: "Personal Access Token (optional)",
      region_badge: "Global",
      rate_hint: "60/hr unauth · 5000/hr auth",
    },
  },
  {
    source_key: "wappalyzer",
    name: "Wappalyzer (Tech Stack)",
    kind: "open_data",
    default_priority: 38,
    default_enabled: true,
    connector: wappalyzerConnector,
    meta: {
      category: "open_data",
      blurb: "Open-source tech stack fingerprinting applied to the company homepage — detects CRM, analytics, payment, framework. Includes GCC-relevant payment processors (PayTabs, Tap, HyperPay).",
      fields: ["company_tech_stack"],
      gcc_coverage: "high",
      pricing: "Free, runs locally",
      docs_url: "https://github.com/wappalyzer/wappalyzer",
      needs_key: false,
      region_badge: "Global · GCC payments",
      rate_hint: "Local fingerprint match",
    },
  },
  {
    source_key: "email_permutator",
    name: "Email Permutator",
    kind: "open_data",
    default_priority: 60,
    default_enabled: true,
    connector: emailPermutatorConnector,
    meta: {
      category: "open_data",
      blurb: "Generates the most-likely email pattern (first.last@domain) when nothing else found one. Marked unverified — Hunter or Prospeo will validate downstream.",
      fields: ["email", "email_verified"],
      gcc_coverage: "medium",
      pricing: "Free, runs locally",
      needs_key: false,
      region_badge: "Global",
      rate_hint: "Instant",
    },
  },
  // ──────────────────────────────────────────────────────────────────
  // SAAS STUBS — registered so the user can plug a key any time
  // ──────────────────────────────────────────────────────────────────
  {
    source_key: "zoominfo", name: "ZoomInfo", kind: "api",
    default_priority: 70, default_enabled: false, connector: zoominfoConnector,
    meta: { category: "western_api", blurb: "Largest enterprise contact DB. Strong on US/EU; thin on local GCC SMBs but solid on GCC subsidiaries of multinationals.", fields: ["company_name", "company_industry", "company_size", "company_revenue"], gcc_coverage: "medium", pricing: "Enterprise only ($15k+/yr)", docs_url: "https://api-docs.zoominfo.com/", needs_key: true, key_label: "Bearer Token", region_badge: "Global", rate_hint: "Account-tiered" },
  },
  {
    source_key: "cognism", name: "Cognism", kind: "api",
    default_priority: 72, default_enabled: false, connector: cognismConnector,
    meta: { category: "western_api", blurb: "GDPR-compliant Western contact DB with strong EMEA coverage. Decent for GCC sales targeting EU-based decision makers.", fields: ["company_name", "company_industry", "company_size", "linkedin_url"], gcc_coverage: "medium", pricing: "Subscription (sales-led)", docs_url: "https://docs.cognism.com/", needs_key: true, key_label: "API Key", region_badge: "EMEA strong", rate_hint: "60/min" },
  },
  {
    source_key: "seamless", name: "Seamless.AI", kind: "api",
    default_priority: 74, default_enabled: false, connector: seamlessConnector,
    meta: { category: "western_api", blurb: "AI-powered contact finder. Free tier available. Western-tilted but useful for cross-border GCC enrichment.", fields: ["email", "phone", "title", "linkedin_url"], gcc_coverage: "low", pricing: "Free tier · $147+/mo", docs_url: "https://api.seamless.ai/", needs_key: true, key_label: "Bearer Token", region_badge: "Global", rate_hint: "Plan-tiered" },
  },
  {
    source_key: "kaspr", name: "Kaspr", kind: "api",
    default_priority: 76, default_enabled: false, connector: kasprConnector,
    meta: { category: "western_api", blurb: "EU-based LinkedIn-derived contact finder. Strong on EMEA; can hit GCC LinkedIn profiles with EU links.", fields: ["email", "phone", "title"], gcc_coverage: "low", pricing: "€49+/mo", docs_url: "https://www.kaspr.io/api", needs_key: true, key_label: "X-API-Key", region_badge: "EMEA", rate_hint: "Plan-tiered" },
  },
  {
    source_key: "datanyze", name: "Datanyze (ZoomInfo)", kind: "api",
    default_priority: 78, default_enabled: false, connector: datanyzeConnector,
    meta: { category: "western_api", blurb: "Tech-stack discovery (now part of ZoomInfo). Detects CRM, marketing tools, frameworks for any company by domain.", fields: ["company_tech_stack", "company_size"], gcc_coverage: "medium", pricing: "$29+/mo (legacy)", docs_url: "https://www.datanyze.com/", needs_key: true, key_label: "Bearer Token", region_badge: "Global", rate_hint: "Plan-tiered" },
  },
  {
    source_key: "signalhire", name: "SignalHire", kind: "api",
    default_priority: 80, default_enabled: false, connector: signalhireConnector,
    meta: { category: "western_api", blurb: "Contact finder with email + mobile. Reasonable global coverage including GCC.", fields: ["email", "phone", "linkedin_url", "title"], gcc_coverage: "medium", pricing: "$49+/mo · $0.39/contact", docs_url: "https://www.signalhire.com/api", needs_key: true, key_label: "API Key", region_badge: "Global", rate_hint: "100/min" },
  },
  {
    source_key: "proxycurl", name: "Proxycurl (LinkedIn)", kind: "api",
    default_priority: 82, default_enabled: false, connector: proxycurlConnector,
    meta: { category: "western_api", blurb: "ToS-safe LinkedIn data API. Powers Clay, Apollo, etc. under the hood. Best legal way to get LinkedIn profile + employer data at scale.", fields: ["linkedin_url", "title", "company_name", "company_country"], gcc_coverage: "high", pricing: "Pay-as-you-go ~$0.01/lookup", docs_url: "https://nubela.co/proxycurl/docs", needs_key: true, key_label: "Bearer Token", region_badge: "Global · LinkedIn", rate_hint: "300/min" },
  },
  {
    source_key: "lead411", name: "Lead411", kind: "api",
    default_priority: 84, default_enabled: false, connector: lead411Connector,
    meta: { category: "western_api", blurb: "B2B contact + intent-data provider. Strong on US tech; thin GCC.", fields: ["company_name", "company_industry", "company_size", "company_revenue"], gcc_coverage: "low", pricing: "$99+/mo", docs_url: "https://lead411.com/api/", needs_key: true, key_label: "Bearer Token", region_badge: "US strong", rate_hint: "Plan-tiered" },
  },
  {
    source_key: "prospeo", name: "Prospeo", kind: "api",
    default_priority: 86, default_enabled: false, connector: prospeoConnector,
    meta: { category: "western_api", blurb: "Email finder + verifier. Cheap, simple. Pairs well with the email permutator above for verification.", fields: ["email", "email_verified"], gcc_coverage: "medium", pricing: "Free 75 credits · $39+/mo", docs_url: "https://prospeo.io/api", needs_key: true, key_label: "X-KEY", region_badge: "Global", rate_hint: "60/min" },
  },
  {
    source_key: "salesintel", name: "SalesIntel", kind: "api",
    default_priority: 88, default_enabled: false, connector: salesintelConnector,
    meta: { category: "western_api", blurb: "Human-verified B2B data, US-strong. Thin on GCC but useful for US-based decision makers at GCC subsidiaries.", fields: ["company_name", "company_size", "company_revenue"], gcc_coverage: "low", pricing: "Subscription", docs_url: "https://salesintel.io/api/", needs_key: true, key_label: "X-API-KEY", region_badge: "US strong", rate_hint: "Plan-tiered" },
  },
  {
    source_key: "swordfish", name: "Swordfish", kind: "api",
    default_priority: 90, default_enabled: false, connector: swordfishConnector,
    meta: { category: "western_api", blurb: "Specializes in mobile phone numbers for hard-to-find execs. US strong, decent GCC executive coverage.", fields: ["email", "phone"], gcc_coverage: "medium", pricing: "$99+/mo", docs_url: "https://swordfish.ai/api", needs_key: true, key_label: "api_key", region_badge: "Global · mobiles", rate_hint: "60/min" },
  },
  {
    source_key: "clearbit", name: "Clearbit (deprecated)", kind: "api",
    default_priority: 92, default_enabled: false, connector: clearbitDeprecatedConnector,
    meta: { category: "western_api", blurb: "HubSpot acquired Clearbit and the old Enrichment API is winding down. Stub kept in case you have legacy keys.", fields: ["company_name", "company_industry", "company_size", "company_logo_url"], gcc_coverage: "low", pricing: "Discontinued (legacy keys only)", docs_url: "https://dashboard.clearbit.com/docs", needs_key: true, key_label: "Bearer Token", region_badge: "Legacy", rate_hint: "Sunset" },
  },
  // ──────────────────────────────────────────────────────────────────
  // COMPLIANCE & SANCTIONS SCREENING (priority 8 — runs before all paid sources)
  // Free public APIs: OFAC SDN, UN Consolidated, EU FSF.
  // Saudi portals: Maroof, CMA, SAMA, ZATCA, Najiz.
  // Compliance screening order per ProspectSA PDF:
  //   1. Maroof + CMA → 2. OFAC + UN + EU → 3. SAMA + Najiz + ZATCA
  // ──────────────────────────────────────────────────────────────────
  {
    source_key: "compliance_screening",
    name: "Compliance & Sanctions Screening",
    kind: "api",
    default_priority: 8,
    default_enabled: true,
    connector: complianceConnector,
    meta: {
      category: "open_data",
      blurb: "Multi-layer sanctions & regulatory screening. Layer 1: Saudi CMA + Maroof commercial flags. Layer 2: OFAC SDN, UN Security Council, EU Consolidated (all free). Layer 3: SAMA, ZATCA tax violations, Najiz court judgments. Returns `compliance_status` JSON field.",
      fields: ["compliance_status"],
      gcc_coverage: "high",
      pricing: "Free (public government APIs)",
      docs_url: "https://ofac.treasury.gov/ofac-api",
      needs_key: false,
      region_badge: "KSA + Global sanctions",
      rate_hint: "Free · ~10 req/min per portal",
    },
  },
  // ──────────────────────────────────────────────────────────────────
  // NEWS SEEDER (priority 16 — after Python scraper, before GLEIF)
  // Perplexity live web search → DeepSeek-V3 synthesis.
  // Fills news_recent + intent_signals + optionally company_funding.
  // ──────────────────────────────────────────────────────────────────
  {
    source_key: "news_seeder",
    name: "News Seeder (AI Search)",
    kind: "ai_search",
    default_priority: 16,
    default_enabled: true,
    connector: newsSeederConnector,
    meta: {
      category: "ai_orchestration",
      blurb: "Perplexity sonar live web search finds recent news, funding rounds, M&A, and hiring signals for the company. DeepSeek-V3 (free tier via OpenRouter) synthesizes results into structured intent_signals and news_recent fields. $0.002/call.",
      fields: ["news_recent", "intent_signals", "company_funding", "hiring_signals"],
      gcc_coverage: "high",
      pricing: "~$0.002/call (Perplexity + DeepSeek via OpenRouter)",
      needs_key: false,
      region_badge: "Global",
      rate_hint: "OpenRouter rate limits apply",
    },
  },
  // ──────────────────────────────────────────────────────────────────
  // GCC-NATIVE PAID SOURCES (priorities 23–31)
  // ──────────────────────────────────────────────────────────────────
  {
    source_key: "dhow",
    name: "Dhow",
    kind: "api",
    default_priority: 23,
    default_enabled: false,
    connector: dhowConnector,
    meta: {
      category: "gcc_native",
      blurb: "\"The Middle East's Apollo.\" GCC B2B contacts database: Arabic names, Gulf phone numbers, WhatsApp IDs, CR-linked profiles. Subscription priced in SAR. Best GCC-native contact source for local decision-makers.",
      fields: ["email", "phone", "name_ar", "company_name_ar", "linkedin_url", "title"],
      gcc_coverage: "high",
      pricing: "Subscription (SAR pricing)",
      docs_url: "https://dhow.io",
      needs_key: true,
      key_label: "Bearer Token (DHOW_API_KEY)",
      region_badge: "GCC",
      rate_hint: "Plan-tiered",
    },
  },
  {
    source_key: "decypha",
    name: "Decypha",
    kind: "api",
    default_priority: 27,
    default_enabled: false,
    connector: decyphaConnector,
    meta: {
      category: "gcc_native",
      blurb: "MENA financial data covering all 6 GCC exchanges. Revenue, EBITDA, board composition, ownership structure, analyst reports, ESG scores, dividends. Best for listed company financials across Saudi, UAE, Qatar, Kuwait, Bahrain, Oman.",
      fields: ["company_revenue", "company_isin", "company_size", "company_description", "company_industry", "company_founded_year"],
      gcc_coverage: "high",
      pricing: "Subscription",
      docs_url: "https://decypha.com",
      needs_key: true,
      key_label: "X-Api-Key (DECYPHA_API_KEY)",
      region_badge: "All 6 GCC exchanges",
      rate_hint: "Plan-tiered",
    },
  },
  {
    source_key: "argaam",
    name: "Argaam",
    kind: "api",
    default_priority: 29,
    default_enabled: false,
    connector: argaamConnector,
    meta: {
      category: "gcc_native",
      blurb: "Saudi Arabia's leading Arabic financial news + Tadawul filing aggregator. Real-time corporate actions, earnings, exec changes, M&A, bankruptcy. Arabic-first. Best KSA aggregator for same-day deal discovery. Pro tier: email alerts by company.",
      fields: ["news_recent", "company_isin", "company_name_ar", "company_revenue", "company_industry"],
      gcc_coverage: "high",
      pricing: "Freemium / Pro subscription",
      docs_url: "https://argaam.com",
      needs_key: true,
      key_label: "Bearer Token (ARGAAM_API_KEY)",
      region_badge: "KSA — Very High coverage",
      rate_hint: "Plan-tiered",
    },
  },
  {
    source_key: "wamda",
    name: "Wamda",
    kind: "api",
    default_priority: 31,
    default_enabled: false,
    connector: wamdaConnector,
    meta: {
      category: "gcc_native",
      blurb: "MENA startup ecosystem intelligence: deal announcements, exits, founder profiles, investor data. Complements MAGNiTT — Wamda is stronger on early-stage deals and founder biographical data for mid-tier HNW prospects.",
      fields: ["company_funding", "company_description", "company_industry", "news_recent"],
      gcc_coverage: "high",
      pricing: "Contact sales",
      docs_url: "https://wamda.com",
      needs_key: true,
      key_label: "X-API-Key (WAMDA_API_KEY)",
      region_badge: "MENA",
      rate_hint: "Plan-tiered",
    },
  },
  // ──────────────────────────────────────────────────────────────────
  // GLOBAL PAID SOURCES — MID PRIORITY (48–65)
  // ──────────────────────────────────────────────────────────────────
  {
    source_key: "fullcontact",
    name: "FullContact",
    kind: "api",
    default_priority: 48,
    default_enabled: false,
    connector: fullcontactConnector,
    meta: {
      category: "western_api",
      blurb: "Person identity graph built on email, phone, and social handles. Strong phone → person resolution ($0.05–0.15/lookup). Medium GCC executive coverage — best for resolving a known phone/email to a full profile and employer.",
      fields: ["full_name", "email", "phone", "phone_confidence", "linkedin_url", "title", "company_name", "company_domain"],
      gcc_coverage: "medium",
      pricing: "$0.05–0.15/lookup",
      docs_url: "https://docs.fullcontact.com",
      needs_key: true,
      key_label: "Bearer Token (FULLCONTACT_API_KEY)",
      region_badge: "Global · phone resolution",
      rate_hint: "60/min",
    },
  },
  {
    source_key: "dnb",
    name: "Dun & Bradstreet Direct+",
    kind: "api",
    default_priority: 52,
    default_enabled: false,
    connector: dnbConnector,
    meta: {
      category: "western_api",
      blurb: "Global company firmographics with strong GCC coverage via regional registrar partnerships. Revenue, headcount, CR numbers, city, industry. Enterprise pricing but best-in-class for cross-referencing KSA + UAE company registrations.",
      fields: ["company_name", "company_size", "company_revenue", "company_industry", "company_country", "company_city", "company_cr_number", "company_founded_year"],
      gcc_coverage: "high",
      pricing: "Enterprise",
      docs_url: "https://directplus.dnb.com",
      needs_key: true,
      key_label: "Client ID:Secret (DUNS_API_KEY format: clientId:clientSecret)",
      region_badge: "Global · GCC registrar partnerships",
      rate_hint: "Enterprise SLA",
    },
  },
  {
    source_key: "breeze_intelligence",
    name: "Breeze Intelligence (HubSpot)",
    kind: "api",
    default_priority: 55,
    default_enabled: false,
    connector: breezeConnector,
    meta: {
      category: "western_api",
      blurb: "HubSpot Breeze Intelligence (formerly Clearbit Enrichment). Company + contact data by domain or email. $0.005/lookup — very affordable. Medium GCC executive coverage. Best for quick company firmographic fill when domain is known.",
      fields: ["company_name", "company_description", "company_industry", "company_size", "company_revenue", "company_founded_year", "company_logo_url", "company_tech_stack", "company_city"],
      gcc_coverage: "medium",
      pricing: "$0.005/lookup",
      docs_url: "https://knowledge.hubspot.com/reports/breeze-intelligence",
      needs_key: true,
      key_label: "HubSpot Private App Token (BREEZE_API_KEY)",
      region_badge: "Global",
      rate_hint: "100/min",
    },
  },
  {
    source_key: "bombora",
    name: "Bombora Intent",
    kind: "api",
    default_priority: 57,
    default_enabled: false,
    connector: bomboraConnector,
    meta: {
      category: "western_api",
      blurb: "B2B intent data — topic-level surge scores showing which companies are actively researching topics relevant to your product. Enterprise pricing. Low-Medium GCC coverage but valuable for US-GCC cross-border tech deals.",
      fields: ["intent_signals"],
      gcc_coverage: "medium",
      pricing: "Enterprise",
      docs_url: "https://bombora.com",
      needs_key: true,
      key_label: "Bearer Token (BOMBORA_API_KEY)",
      region_badge: "Global · intent data",
      rate_hint: "Enterprise SLA",
    },
  },
  {
    source_key: "clay",
    name: "Clay (Fallback)",
    kind: "api",
    default_priority: 65,
    default_enabled: false,
    connector: clayConnector,
    meta: {
      category: "western_api",
      blurb: "Clay data orchestration layer used as final waterfall fallback. Aggregates 50+ sources under one credit system. Runs only when all other sources miss a contact field. Medium GCC coverage; credit-based pricing.",
      fields: ["email", "phone", "linkedin_url", "title", "company_name"],
      gcc_coverage: "medium",
      pricing: "Credits-based (clay.com pricing)",
      docs_url: "https://clay.com/developers",
      needs_key: true,
      key_label: "Bearer Token (CLAY_API_KEY)",
      region_badge: "Global · aggregated",
      rate_hint: "Credit-limited",
    },
  },
  // ── Manual / no-public-API tools — registered so they show in the UI
  //    with clear status; they never run automatically.
  {
    source_key: "linkedin_sales_nav", name: "LinkedIn Sales Navigator", kind: "manual",
    default_priority: 99, default_enabled: false, connector: linkedinSalesNavConnector,
    meta: { category: "manual", blurb: "No public API. Use via Sales Nav search export → CSV upload to Bulk Enrichment, OR plug Proxycurl above for LinkedIn data via API.", fields: [], gcc_coverage: "high", pricing: "$99/mo (LinkedIn license)", needs_key: false, region_badge: "Manual export", rate_hint: "Manual / browser" },
  },
  {
    source_key: "adapt", name: "Adapt", kind: "manual",
    default_priority: 99, default_enabled: false, connector: adaptConnector,
    meta: { category: "manual", blurb: "No public REST API — Chrome extension only. Use via browser then export CSV.", fields: [], gcc_coverage: "low", pricing: "Free / paid plans", needs_key: false, region_badge: "Manual export", rate_hint: "Browser only" },
  },
  {
    source_key: "leadgibbon", name: "LeadGibbon", kind: "manual",
    default_priority: 99, default_enabled: false, connector: leadgibbonConnector,
    meta: { category: "manual", blurb: "Chrome extension, no public API. Manual workflow only.", fields: [], gcc_coverage: "low", pricing: "$49+/mo", needs_key: false, region_badge: "Manual export", rate_hint: "Browser only" },
  },
  {
    source_key: "explorum", name: "Explorium", kind: "manual",
    default_priority: 99, default_enabled: false, connector: explorumConnector,
    meta: { category: "manual", blurb: "Enterprise data signals platform — partner-led integration only, not a self-serve API.", fields: [], gcc_coverage: "medium", pricing: "Enterprise", needs_key: false, region_badge: "Enterprise", rate_hint: "Partner-led" },
  },
  {
    source_key: "vibe_prospecting", name: "Vibe Prospecting", kind: "manual",
    default_priority: 99, default_enabled: false, connector: vibeConnector,
    meta: { category: "manual", blurb: "No public API documented. Manual workflow.", fields: [], gcc_coverage: "low", pricing: "Subscription", needs_key: false, region_badge: "Manual", rate_hint: "Manual" },
  },
  // ──────────────────────────────────────────────────────────────────
  // FINAL PASS — AI Composer always runs LAST
  // ──────────────────────────────────────────────────────────────────
  {
    source_key: "openrouter_composer",
    name: "AI Composer (Claude)",
    kind: "ai_composer",
    default_priority: 95,
    default_enabled: true,
    connector: openrouterComposerConnector,
    meta: {
      category: "ai_orchestration",
      blurb: "Claude 3.5 Sonnet via OpenRouter — final synthesis pass. Takes everything every other source filled and writes a polished narrative description, recent-news inference, and hiring signal. Frontend output flows from this connector.",
      fields: ["company_description", "news_recent", "hiring_signals"],
      gcc_coverage: "high",
      pricing: "~$0.003/lead (OpenRouter)",
      docs_url: "https://openrouter.ai/anthropic/claude-3.5-sonnet",
      needs_key: false,
      region_badge: "Global · runs last",
      rate_hint: "OpenRouter env-keyed",
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
