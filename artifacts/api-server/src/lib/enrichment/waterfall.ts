/**
 * Waterfall orchestrator.
 *
 * Given a seed, walk all enabled sources in priority order and accumulate
 * filled fields. Returns a structured result the UI can display per-field
 * with source attribution + per-source timing.
 */

import { db, enrichment_sources, enrichment_runs } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { Field, Seed } from "./types.js";
import { REGISTRY, getRegistryEntry } from "./sources.js";
import { decryptKey } from "./crypto.js";
import { logger } from "../logger.js";

export interface PerSourceResult {
  source_key: string;
  source_name: string;
  status: "ok" | "miss" | "error" | "skipped";
  fields_filled: Field[];
  duration_ms: number;
  cost_usd: number;
  error?: string;
}

export interface WaterfallResult {
  waterfall_id: string;
  fields: Record<string, { value: unknown; source_key: string; source_name: string }>;
  per_source: PerSourceResult[];
  total_cost_usd: number;
  total_ms: number;
}

export async function runWaterfall(
  seed: Seed,
  opts: { dry_run?: boolean; only?: string[] } = {},
): Promise<WaterfallResult> {
  const t0 = Date.now();
  const waterfall_id = randomUUID();
  const filled: WaterfallResult["fields"] = {};
  const perSource: PerSourceResult[] = [];

  // Load enabled source configs from DB, ordered by priority asc
  const dbRows = await db
    .select()
    .from(enrichment_sources)
    .where(eq(enrichment_sources.enabled, true))
    .orderBy(enrichment_sources.priority);

  for (const row of dbRows) {
    if (opts.only && !opts.only.includes(row.source_key)) continue;
    const entry = getRegistryEntry(row.source_key);
    if (!entry) continue; // skip rows whose connector was removed

    const apiKey = row.api_key_cipher ? decryptKey(row.api_key_cipher) : null;
    const alreadyFilled = new Set(Object.keys(filled) as Field[]);

    const t = Date.now();
    let res;
    try {
      // The AI Composer (runs last) needs a snapshot of every field
      // upstream sources have filled so it can write a polished
      // narrative. Other connectors ignore composer_input.
      const baseConfig = (row.config as Record<string, unknown>) ?? {};
      const config = row.source_key === "openrouter_composer"
        ? {
            ...baseConfig,
            composer_input: Object.fromEntries(
              Object.entries(filled).map(([k, v]) => [k, v.value]),
            ),
          }
        : baseConfig;
      res = await entry.connector.enrich({
        seed,
        apiKey: apiKey || null,
        config,
        alreadyFilled,
      });
    } catch (e) {
      const err = scrubSecrets(e instanceof Error ? e.message : String(e), apiKey);
      res = { status: "error" as const, fields: {}, error: err };
      logger.warn({ source: row.source_key, err }, "connector threw");
    }
    const ms = Date.now() - t;

    // Merge new fields
    const filledKeys: Field[] = [];
    for (const [k, v] of Object.entries(res.fields)) {
      if (v == null || v === "") continue;
      if (filled[k]) continue;
      filled[k] = { value: v, source_key: row.source_key, source_name: row.name };
      filledKeys.push(k as Field);
    }

    perSource.push({
      source_key: row.source_key,
      source_name: row.name,
      status: res.status,
      fields_filled: filledKeys,
      duration_ms: ms,
      cost_usd: res.cost_usd ?? 0,
      error: res.error,
    });

    // Audit log (skipped on dry-run to keep dev DB lean)
    if (!opts.dry_run) {
      try {
        await db.insert(enrichment_runs).values({
          waterfall_id,
          source_key: row.source_key,
          target_kind: "seed",
          target_id: null,
          seed: seed as Record<string, unknown>,
          fields_filled: filledKeys,
          payload: res.fields as Record<string, unknown>,
          cost_usd: res.cost_usd ?? 0,
          duration_ms: ms,
          status: res.status,
          error: res.error,
        });
        // Roll up counters
        await db
          .update(enrichment_sources)
          .set({
            total_calls: sql`${enrichment_sources.total_calls} + 1`,
            total_fields_filled: sql`${enrichment_sources.total_fields_filled} + ${filledKeys.length}`,
            updated_at: new Date(),
          })
          .where(eq(enrichment_sources.source_key, row.source_key));
      } catch (e) {
        logger.warn({ err: e }, "enrichment_runs insert failed");
      }
    }
  }

  return {
    waterfall_id,
    fields: filled,
    per_source: perSource,
    total_cost_usd: perSource.reduce((a, r) => a + r.cost_usd, 0),
    total_ms: Date.now() - t0,
  };
}

/** Re-export the registry length for diagnostics. */
export const KNOWN_SOURCE_COUNT = REGISTRY.length;

/**
 * Strip the API key (and any common URL-embedded api_key=… pattern) from
 * a connector error message before it bubbles up to clients/logs. Some
 * connectors (Hunter, Apollo) put the key in the query string so a fetch
 * failure could otherwise leak it.
 */
function scrubSecrets(msg: string, apiKey: string | null): string {
  let out = msg;
  if (apiKey) out = out.split(apiKey).join("***");
  return out
    .replace(/(api[_-]?key=)[^&\s"']+/gi, "$1***")
    .replace(/(authorization:\s*bearer\s+)[^\s"']+/gi, "$1***");
}
