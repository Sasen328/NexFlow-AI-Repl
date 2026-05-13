/**
 * Enrichment orchestrator — shared types.
 *
 * Every connector implements the Connector interface. The waterfall feeds
 * a Seed in, walks sources in priority order, and accumulates filled
 * Fields. Each Field is attributed to the source that filled it.
 */

/** Canonical fields the waterfall knows how to fill + attribute. */
export type Field =
  | "first_name"
  | "last_name"
  | "full_name"
  | "name_ar"             // Arabic full name
  | "email"
  | "email_verified"
  | "phone"
  | "phone_confidence"    // 0–1 confidence score on phone number
  | "linkedin_url"
  | "twitter_handle"
  | "title"
  | "seniority"
  | "company_name"
  | "company_name_ar"     // Arabic company name
  | "company_domain"
  | "company_country"
  | "company_city"        // HQ city
  | "company_industry"
  | "company_size"
  | "company_funding"
  | "company_tech_stack"
  | "company_description"
  | "company_logo_url"
  | "company_founded_year"
  | "company_revenue"
  | "company_cr_number"   // GCC commercial registration number
  | "company_isin"        // GCC stock identifier
  | "news_recent"         // recent funding / PR / market mentions
  | "hiring_signals"      // open roles / headcount growth signals
  | "intent_signals"      // buying intent indicators
  | "compliance_status";  // JSON: { clear, flags, checked, screened_at }

/** Lead seed passed into the waterfall. Sparse on purpose. */
export interface Seed {
  full_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  domain?: string;
  linkedin_url?: string;
  country?: string;
  notes?: string;
}

/** Per-source enrichment result. */
export interface EnrichResult {
  status: "ok" | "miss" | "error" | "skipped";
  /** Map of field → value the source filled (only NEW fields). */
  fields: Partial<Record<Field, unknown>>;
  /** Raw payload (capped at ~25KB upstream). */
  raw?: Record<string, unknown>;
  /** Approx USD cost of the call (0 for scrapers + free-tier APIs). */
  cost_usd?: number;
  error?: string;
}

/** Per-source connection-test result. */
export interface TestResult {
  ok: boolean;
  message: string;
}

/** Common shape for source config persisted in enrichment_sources.config */
export interface SourceConfig {
  // Waterfall context — fields already filled by earlier sources, so the
  // current source can skip work it can't improve on.
  already_filled?: Field[];
  [k: string]: unknown;
}

/** Connector contract — every source file exports one of these. */
export interface Connector {
  /** Stable machine key, must match the registry entry. */
  source_key: string;
  /**
   * Run enrichment. Receives the seed lead, the API key (or null), the
   * persisted source config, and the list of fields already filled by
   * higher-priority sources (so we can skip work).
   */
  enrich(args: {
    seed: Seed;
    apiKey: string | null;
    config: SourceConfig;
    alreadyFilled: Set<Field>;
  }): Promise<EnrichResult>;
  /** Quick connection ping — usually a /me or /account endpoint. */
  test(args: { apiKey: string | null; config: SourceConfig }): Promise<TestResult>;
}
