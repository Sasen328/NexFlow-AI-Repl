/**
 * Email permutator — FREE, no key.
 *
 * Given a name + domain, generate the most-likely email patterns. We
 * do NOT live-verify against SMTP from inside Replit (port 25 is
 * usually blocked) — instead we mark results as `email_verified: false`
 * and let Hunter.io's verifier (if connected) confirm later.
 *
 * Returns a single best guess (the most common pattern), not the full
 * permutation list, to keep the waterfall result tidy.
 */

import type { Connector, EnrichResult } from "../types.js";
import { extractDomain, splitName } from "./_common.js";

export const emailPermutatorConnector: Connector = {
  source_key: "email_permutator",

  async test() {
    return { ok: true, message: "Permutator runs locally — always ready" };
  },

  async enrich({ seed, alreadyFilled }): Promise<EnrichResult> {
    if (alreadyFilled.has("email")) return { status: "skipped", fields: {} };
    const { first, last } = splitName(seed);
    const domain = extractDomain(seed);
    if (!first || !last || !domain) return { status: "miss", fields: {} };

    const f = first.toLowerCase();
    const l = last.toLowerCase();
    // Most common pattern in B2B is first.last@ — use it as best guess.
    const best = `${f}.${l}@${domain}`;

    return {
      status: "ok",
      fields: {
        email: best,
        email_verified: false,
      },
      cost_usd: 0,
    };
  },
};
