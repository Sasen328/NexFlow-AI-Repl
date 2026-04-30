/**
 * /api/enrichment/* — Sources orchestrator REST surface.
 *
 *   GET    /sources              — list all sources with status + meta
 *   PATCH  /sources/:id          — { api_key?, enabled?, priority?, config? }
 *   POST   /sources/:id/test     — ping the source
 *   POST   /run                  — run the waterfall on a seed lead
 *   GET    /runs                 — recent waterfall audit rows
 */

import { Router, type IRouter } from "express";
import { db, enrichment_sources, enrichment_runs } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { REGISTRY, getRegistryEntry, seedSources } from "../lib/enrichment/sources.js";
import { encryptKey, decryptKey } from "../lib/enrichment/crypto.js";
import { runWaterfall } from "../lib/enrichment/waterfall.js";
import type { Seed } from "../lib/enrichment/types.js";

const router: IRouter = Router();

// Seed runs once at server startup (see autoSeed.ts). This in-process
// singleton is a defensive backup in case startup seeding was skipped
// (e.g. tests that bypass autoSeed). The DB-side ON CONFLICT DO NOTHING
// in seedSources() makes concurrent seeds safe.
let seeded = false;
async function ensureSeeded() {
  if (seeded) return;
  await seedSources();
  seeded = true;
}

// ─────────────────────────────────────────────────────────────────────
// GET /sources
// ─────────────────────────────────────────────────────────────────────
router.get("/sources", async (req, res) => {
  try {
    await ensureSeeded();
    const rows = await db.select().from(enrichment_sources).orderBy(enrichment_sources.priority);

    const sources = rows.map(r => {
      const entry = getRegistryEntry(r.source_key);
      return {
        id: r.id,
        source_key: r.source_key,
        name: r.name,
        kind: r.kind,
        enabled: r.enabled,
        priority: r.priority,
        key_set: Boolean(r.api_key_cipher),
        last_test_ok: r.last_test_ok,
        last_test_message: r.last_test_message,
        last_test_at: r.last_test_at,
        total_calls: r.total_calls,
        total_fields_filled: r.total_fields_filled,
        meta: entry?.meta ?? {
          category: "western_api",
          blurb: "Unknown source — registry entry missing",
          fields: [],
          gcc_coverage: "n/a",
          pricing: "—",
          needs_key: true,
        },
      };
    });

    res.json({ sources, registry_count: REGISTRY.length });
  } catch (e) {
    req.log.error({ err: e }, "GET /enrichment/sources failed");
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

// ─────────────────────────────────────────────────────────────────────
// PATCH /sources/:id
// ─────────────────────────────────────────────────────────────────────
const PatchSchema = z.object({
  api_key: z.string().optional(),    // empty string = clear
  enabled: z.boolean().optional(),
  priority: z.number().int().min(1).max(100).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

router.patch("/sources/:id", async (req, res) => {
  try {
    const parsed = PatchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid body", details: parsed.error.flatten() });
      return;
    }
    const update: Record<string, unknown> = { updated_at: new Date() };
    if (parsed.data.api_key !== undefined) {
      update["api_key_cipher"] = parsed.data.api_key ? encryptKey(parsed.data.api_key) : null;
    }
    if (parsed.data.enabled !== undefined) update["enabled"] = parsed.data.enabled;
    if (parsed.data.priority !== undefined) update["priority"] = parsed.data.priority;
    if (parsed.data.config !== undefined) update["config"] = parsed.data.config;

    const [row] = await db
      .update(enrichment_sources)
      .set(update)
      .where(eq(enrichment_sources.id, req.params.id))
      .returning();

    if (!row) {
      res.status(404).json({ error: "source not found" });
      return;
    }
    res.json({ ok: true, key_set: Boolean(row.api_key_cipher) });
  } catch (e) {
    req.log.error({ err: e }, "PATCH /enrichment/sources/:id failed");
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

// ─────────────────────────────────────────────────────────────────────
// POST /sources/:id/test
// ─────────────────────────────────────────────────────────────────────
router.post("/sources/:id/test", async (req, res) => {
  try {
    const [row] = await db.select().from(enrichment_sources).where(eq(enrichment_sources.id, req.params.id)).limit(1);
    if (!row) {
      res.status(404).json({ error: "source not found" });
      return;
    }
    const entry = getRegistryEntry(row.source_key);
    if (!entry) {
      res.status(500).json({ error: `no connector for ${row.source_key}` });
      return;
    }
    const apiKey = row.api_key_cipher ? decryptKey(row.api_key_cipher) : null;
    const result = await entry.connector.test({
      apiKey: apiKey || null,
      config: (row.config as Record<string, unknown>) ?? {},
    });
    await db
      .update(enrichment_sources)
      .set({
        last_test_ok: result.ok,
        last_test_message: result.message.slice(0, 200),
        last_test_at: new Date(),
      })
      .where(eq(enrichment_sources.id, row.id));
    res.json(result);
  } catch (e) {
    req.log.error({ err: e }, "POST /enrichment/sources/:id/test failed");
    res.status(500).json({ ok: false, message: e instanceof Error ? e.message : String(e) });
  }
});

// ─────────────────────────────────────────────────────────────────────
// POST /run
// ─────────────────────────────────────────────────────────────────────
const RunSchema = z.object({
  seed: z.object({
    full_name: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    domain: z.string().optional(),
    linkedin_url: z.string().optional(),
    country: z.string().optional(),
    notes: z.string().optional(),
  }),
  dry_run: z.boolean().optional(),
  only: z.array(z.string()).optional(),
});

router.post("/run", async (req, res) => {
  try {
    await ensureSeeded();
    const parsed = RunSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid body", details: parsed.error.flatten() });
      return;
    }
    const seedRaw = parsed.data.seed;
    // Normalise: the UI form sends "name" and the registry expects "full_name"
    const seed: Seed = {
      ...seedRaw,
      full_name: seedRaw.full_name ?? seedRaw.name,
    };
    const result = await runWaterfall(seed, { dry_run: parsed.data.dry_run, only: parsed.data.only });
    res.json(result);
  } catch (e) {
    req.log.error({ err: e }, "POST /enrichment/run failed");
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

// ─────────────────────────────────────────────────────────────────────
// GET /runs — recent audit rows for the operator console
// ─────────────────────────────────────────────────────────────────────
router.get("/runs", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(enrichment_runs)
      .orderBy(desc(enrichment_runs.created_at))
      .limit(50);
    res.json({ runs: rows });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

export default router;
