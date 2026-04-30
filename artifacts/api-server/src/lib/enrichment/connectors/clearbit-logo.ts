/**
 * Clearbit Logo API — FREE, no key, no auth.
 * https://clearbit.com/logo  →  always-on company logo CDN.
 */

import type { Connector, EnrichResult } from "../types.js";
import { extractDomain, SCRAPER_UA } from "./_common.js";

export const clearbitLogoConnector: Connector = {
  source_key: "clearbit_logo",

  async test() {
    const r = await fetch("https://logo.clearbit.com/google.com", {
      method: "HEAD",
      headers: { "User-Agent": SCRAPER_UA },
    }).catch(() => null);
    return r && r.ok
      ? { ok: true, message: "Clearbit Logo CDN reachable" }
      : { ok: false, message: "Logo CDN unreachable" };
  },

  async enrich({ seed, alreadyFilled }): Promise<EnrichResult> {
    if (alreadyFilled.has("company_logo_url")) return { status: "skipped", fields: {} };
    const domain = extractDomain(seed);
    if (!domain) return { status: "miss", fields: {} };
    // We don't HEAD-verify in production — Clearbit's CDN returns a 404
    // for unknown domains but the URL itself is harmless to embed and
    // browsers will gracefully fall back if it 404s.
    return {
      status: "ok",
      fields: { company_logo_url: `https://logo.clearbit.com/${domain}` },
      cost_usd: 0,
    };
  },
};
