/**
 * Wathiq connector — KSA Ministry of Commerce official commercial registry.
 * Authoritative for any KSA-registered entity.
 *
 * The Wathiq API requires onboarding through https://wathiq.business.sa/
 * and an "App ID" issued per-app. Endpoints below match the public
 * lookup-by-CR-number contract; if the user provides a CR number in
 * seed.notes (regex \\b\\d{10}\\b) we hit /commercialRegistration/{cr}.
 * Otherwise we fall back to the company-name search endpoint.
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { fetchJSON, pickNeeded } from "./_common.js";

interface WathiqEntity {
  crNumber?: string;
  crName?: string;
  status?: string;
  isicActivity?: { mainActivity?: string };
  nationalAddress?: { city?: string; region?: string };
  issueDate?: string;
}

const BASE = "https://api.wathq.sa/v5";
const CR_REGEX = /\b(\d{10})\b/;

export const wathiqConnector: Connector = {
  source_key: "wathiq",

  async test({ apiKey }) {
    if (!apiKey) return { ok: false, message: "No App ID set" };
    // Probe a known-public CR (Aramco's CR is 1010068483)
    const r = await fetchJSON(`${BASE}/commercialregistration/info/1010068483`, {
      headers: { apiKey },
    }, 6_000);
    if (r.status === 401 || r.status === 403) return { ok: false, message: "Invalid App ID" };
    if (!r.ok && r.status !== 404) return { ok: false, message: r.error ?? "Wathiq rejected" };
    return { ok: true, message: "Connected to Wathiq" };
  },

  async enrich({ seed, apiKey, alreadyFilled }): Promise<EnrichResult> {
    if (!apiKey) return { status: "skipped", fields: {} };

    // Only meaningful for KSA companies — short-circuit if obviously not KSA
    if (seed.country && !/saudi|ksa|riyadh|jeddah|dammam/i.test(seed.country)) {
      return { status: "skipped", fields: {} };
    }

    // Try to extract CR number from seed.notes
    const crMatch = (seed.notes ?? "").match(CR_REGEX);
    if (!crMatch) {
      // No CR number provided — Wathiq doesn't support free-text search
      // on its public endpoint, so we mark as miss rather than error.
      return { status: "miss", fields: {} };
    }

    const cr = crMatch[1]!;
    const r = await fetchJSON<WathiqEntity>(
      `${BASE}/commercialregistration/info/${cr}`,
      { headers: { apiKey } },
    );
    if (!r.ok) {
      if (r.status === 404) return { status: "miss", fields: {} };
      return { status: "error", fields: {}, error: r.error };
    }

    const d = r.data;
    if (!d) return { status: "miss", fields: {} };

    const out: Partial<Record<Field, unknown>> = {};
    if (d.crName) out.company_name = d.crName;
    if (d.crNumber) out.company_cr_number = d.crNumber;
    if (d.isicActivity?.mainActivity) out.company_industry = d.isicActivity.mainActivity;
    if (d.nationalAddress?.city || d.nationalAddress?.region) {
      out.company_country = "Saudi Arabia";
    }
    if (d.issueDate) out.company_founded_year = Number(d.issueDate.slice(0, 4));

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length > 0 ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0,
    };
  },
};
