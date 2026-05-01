/**
 * Python AI sidecar connector — calls the enrichment-scraper artifact
 * (FastAPI service running Crawl4AI + BeautifulSoup at /scraper/*).
 *
 * The sidecar URL defaults to localhost:80 (the workspace reverse proxy)
 * and the path prefix is /scraper. The connector is no-op when the
 * sidecar isn't running, so the waterfall keeps moving.
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { fetchJSON, pickNeeded, extractDomain } from "./_common.js";

// The Python enrichment sidecar listens on port 8000 in dev (PORT env var fallback).
// In production / custom deploys set ENRICHMENT_SCRAPER_URL to the internal service address.
const SIDECAR_URL = process.env["ENRICHMENT_SCRAPER_URL"] ?? "http://localhost:8000/scraper";
const SHARED_SECRET = process.env["SCRAPER_SHARED_SECRET"] ?? "";
const IS_PROD = process.env["NODE_ENV"] === "production";
const HAS_EXPLICIT_URL = !!process.env["ENRICHMENT_SCRAPER_URL"];

const authHeaders: Record<string, string> = SHARED_SECRET
  ? { "X-Sidecar-Token": SHARED_SECRET }
  : {};

function disabledForProd(): boolean {
  // We now route through localhost:80 (the shared proxy) which is always
  // correct within the Replit environment. Only disable if explicitly
  // overridden to a URL that looks wrong (safety net).
  return false;
}

interface SidecarExtractResponse {
  ok: boolean;
  url: string;
  text?: string;
  structured?: {
    company_name?: string;
    description?: string;
    industry?: string;
    size_band?: string;
    tech_stack?: string[];
    headcount_signals?: string[];
    news?: string[];
  };
  error?: string;
}

export const pythonScraperConnector: Connector = {
  source_key: "python_scraper",

  async test() {
    if (disabledForProd()) {
      return {
        ok: false,
        message: "Disabled in production: set ENRICHMENT_SCRAPER_URL to enable.",
      };
    }
    const r = await fetchJSON<{ ok: boolean; version?: string }>(
      `${SIDECAR_URL}/health`,
      { headers: authHeaders },
      4_000,
    );
    if (!r.ok) return { ok: false, message: r.error ?? "Sidecar unreachable" };
    return { ok: true, message: `Sidecar v${r.data?.version ?? "?"} reachable` };
  },

  async enrich({ seed, alreadyFilled }): Promise<EnrichResult> {
    if (disabledForProd()) return { status: "skipped", fields: {} };
    const domain = extractDomain(seed);
    if (!domain) return { status: "skipped", fields: {} };
    const url = `https://${domain}`;

    const r = await fetchJSON<SidecarExtractResponse>(
      `${SIDECAR_URL}/extract`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ url, mode: "crawl4ai" }),
      },
      20_000,
    );
    if (!r.ok) {
      return { status: "error", fields: {}, error: r.error ?? "sidecar error" };
    }
    // The sidecar sets body-level ok:false for robots-blocked / fetch-failed
    // cases (HTTP 200 still). Surface those as soft errors instead of "miss".
    if (r.data && r.data.ok === false) {
      return { status: "error", fields: {}, error: r.data.error ?? "sidecar refused" };
    }

    const s = r.data?.structured;
    if (!s) return { status: "miss", fields: {} };

    const out: Partial<Record<Field, unknown>> = {};
    if (s.company_name) out.company_name = s.company_name;
    if (s.description) out.company_description = s.description;
    if (s.industry) out.company_industry = s.industry;
    if (s.size_band) out.company_size = s.size_band;
    if (s.tech_stack?.length) out.company_tech_stack = s.tech_stack.join(", ");
    if (s.news?.length) out.news_recent = s.news.join(" · ");
    if (s.headcount_signals?.length) out.hiring_signals = s.headcount_signals.join(" · ");

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length > 0 ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0,
    };
  },
};
