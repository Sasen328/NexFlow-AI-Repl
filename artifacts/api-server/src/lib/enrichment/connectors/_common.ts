/**
 * Shared helpers for all connectors.
 */

import type { Field, Seed } from "../types.js";

/** Fetch with timeout — fail fast so the waterfall stays responsive. */
export async function fetchJSON<T = unknown>(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8_000,
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    let data: T | null = null;
    try { data = (await res.json()) as T; } catch { /* non-JSON */ }
    return {
      ok: res.ok,
      status: res.status,
      data,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (e) {
    return { ok: false, status: 0, data: null, error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Filter a candidate field set down to those NOT yet filled by earlier
 * sources, so the connector knows what's worth returning.
 */
export function pickNeeded(
  candidate: Partial<Record<Field, unknown>>,
  alreadyFilled: Set<Field>,
): Partial<Record<Field, unknown>> {
  const out: Partial<Record<Field, unknown>> = {};
  for (const [k, v] of Object.entries(candidate)) {
    if (v == null || v === "") continue;
    if (alreadyFilled.has(k as Field)) continue;
    out[k as Field] = v;
  }
  return out;
}

/** Best-effort domain extraction from email / company / linkedin. */
export function extractDomain(seed: Seed): string | null {
  if (seed.domain) return seed.domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "").split("/")[0]!;
  if (seed.email && seed.email.includes("@")) return seed.email.split("@")[1]!.toLowerCase();
  // very rough company → domain guess (used only when nothing else is available)
  return null;
}

/** Split a "First Last" into [first, last]. */
export function splitName(seed: Seed): { first?: string; last?: string } {
  const n = (seed.full_name ?? "").trim();
  if (!n) return {};
  const bits = n.split(/\s+/);
  if (bits.length === 1) return { first: bits[0] };
  return { first: bits[0], last: bits.slice(1).join(" ") };
}

/** Polite UA so we don't look like a bot to friendly servers. */
export const SCRAPER_UA =
  "NexFlowEnrichment/1.0 (+https://nexflow.demo/bot; contact=ops@nexflow.demo)";
