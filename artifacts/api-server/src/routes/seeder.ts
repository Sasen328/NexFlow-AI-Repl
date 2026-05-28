// ─── /api/prosengine/seeder — Data Seeder Pipeline ───────────────────────────
//
//  POST /api/prosengine/seeder/eval          — evaluate a seed URL (GPT-4o vision)
//  POST /api/prosengine/seeder/approve       — approve a plan
//  POST /api/prosengine/seeder/harvest/:id   — run harvest (SSE)
//  POST /api/prosengine/seeder/enrich/:id    — run enrichment (SSE)
//  GET  /api/prosengine/seeder/plans         — list plans
//  GET  /api/prosengine/seeder/plans/:id     — get plan + rows
//  DELETE /api/prosengine/seeder/plans/:id   — delete plan
//
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { seederPlansTable, seederRowsTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { nexusRunRole } from "../lib/nexus/index.js";
import { scrapeGraphExtract } from "../lib/scrapers/scrapegraph-client.js";
import { scrapePage } from "../lib/power-scraper.js";

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tryParseJson(text: string | null | undefined): Record<string, unknown> | null {
  if (!text) return null;
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) as Record<string, unknown>; } catch { /* */ }
  return null;
}

function tryParseArray(text: string | null | undefined): Record<string, unknown>[] | null {
  if (!text) return null;
  try { const m = text.match(/\[[\s\S]*\]/); if (m) return JSON.parse(m[0]) as Record<string, unknown>[]; } catch { /* */ }
  return null;
}

// ── Phase 1: Eval ─────────────────────────────────────────────────────────────

router.post("/prosengine/seeder/eval", async (req: Request, res: Response): Promise<void> => {
  const { url, description } = req.body as { url?: string; description?: string };
  if (!url) { res.status(400).json({ error: "url required" }); return; }

  try {
    const scraped = await scrapePage(url, { forceEngine: "playwright-stealth", timeoutMs: 30000 });

    const evalResult = await nexusRunRole("extractor", `
Evaluate this web data source for company/contact harvesting.
URL: ${url}
Page: ${(scraped.text || "").slice(0, 5000)}

Return JSON: { "sourceType": "directory|registry|other", "estimatedRecords": 0, "dataFields": [], "harvestStrategy": "scrapegraph|playwright", "extractionSchema": "describe what to extract", "quality": "high|medium|low", "confidence": 0 }
`, { maxTokens: 600 });

    const plan = tryParseJson(evalResult.text) || {
      sourceType: "unknown", estimatedRecords: 0, dataFields: [],
      harvestStrategy: "playwright", extractionSchema: "Extract all company/contact records",
      quality: "medium", confidence: 50,
    };

    // Store url + description in config (seederPlansTable has: id, name, status, config, createdAt)
    const [savedPlan] = await db.insert(seederPlansTable).values({
      name:   url.slice(0, 200),
      status: "pending",
      config: { url, description, ...plan } as Record<string, unknown>,
      createdAt: new Date(),
    }).returning({ id: seederPlansTable.id });

    res.json({ ok: true, planId: savedPlan?.id, url, eval: plan });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Phase 2: Approve ──────────────────────────────────────────────────────────

router.post("/prosengine/seeder/approve", async (req: Request, res: Response): Promise<void> => {
  const { planId, overrides } = req.body as { planId?: number; overrides?: Record<string, unknown> };
  if (!planId) { res.status(400).json({ error: "planId required" }); return; }

  try {
    const [plan] = await db.select().from(seederPlansTable).where(eq(seederPlansTable.id, planId)).limit(1);
    if (!plan) { res.status(404).json({ error: "Plan not found" }); return; }

    const updated = { ...(plan.config as Record<string, unknown> || {}), ...(overrides || {}) };
    await db.update(seederPlansTable).set({ status: "approved", config: updated }).where(eq(seederPlansTable.id, planId));
    res.json({ ok: true, planId, status: "approved", plan: updated });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Phase 3: Harvest (SSE) ────────────────────────────────────────────────────

router.post("/prosengine/seeder/harvest/:id", async (req: Request, res: Response): Promise<void> => {
  const planId = parseInt(req.params.id as string);
  const [plan] = await db.select().from(seederPlansTable).where(eq(seederPlansTable.id, planId)).limit(1);
  if (!plan) { res.status(404).json({ error: "Plan not found" }); return; }
  if (plan.status !== "approved") { res.status(400).json({ error: "Plan must be approved before harvest" }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (data: Record<string, unknown>) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    const config   = plan.config as Record<string, unknown> || {};
    const url      = String(config.url || plan.name || "");
    const schema   = String(config.extractionSchema || "Extract all company and contact records");
    const strategy = String(config.harvestStrategy || "playwright");

    await db.update(seederPlansTable).set({ status: "harvesting" }).where(eq(seederPlansTable.id, planId));
    send({ type: "harvest_start", planId, strategy });

    let records: Record<string, unknown>[] = [];

    if (strategy === "scrapegraph") {
      const result = await scrapeGraphExtract(url, schema);
      if (result.available && result.data) {
        const d = result.data;
        records = Array.isArray(d) ? (d as Record<string, unknown>[])
          : Array.isArray((d as Record<string, unknown[]>).items) ? ((d as Record<string, unknown[]>).items as Record<string, unknown>[])
          : [d];
        send({ type: "harvest_progress", records: records.length, source: "scrapegraph" });
      }
    }

    if (records.length === 0) {
      const scraped = await scrapePage(url, { forceEngine: "playwright-stealth", timeoutMs: 45000 });
      if (!scraped.error && !scraped.blocked && scraped.text) {
        const extracted = await nexusRunRole("extractor", `
Extract all records matching: ${schema}
Return JSON array. Each object: { nameEn, nameAr, city, sector, website, phone, email }. Set missing to null.
Page: ${scraped.text.slice(0, 8000)}
`, { maxTokens: 3000 });
        const arr = tryParseArray(extracted.text);
        if (arr) records = arr;
      }
    }

    send({ type: "harvest_done", records: records.length });

    // seederRowsTable has: id, planId, data, status, createdAt
    let saved = 0;
    for (const record of records.slice(0, 500)) {
      try {
        await db.insert(seederRowsTable).values({
          planId, status: "harvested", data: record, createdAt: new Date(),
        });
        saved++;
      } catch { /* dup */ }
    }

    await db.update(seederPlansTable).set({ status: "harvested" }).where(eq(seederPlansTable.id, planId));
    send({ type: "done", planId, saved });
    res.end();
  } catch (err) {
    send({ type: "error", message: String(err) });
    res.end();
  }
});

// ── Phase 4: Enrich (SSE) ─────────────────────────────────────────────────────

router.post("/prosengine/seeder/enrich/:id", async (req: Request, res: Response): Promise<void> => {
  const planId = parseInt(req.params.id as string);
  const [plan] = await db.select().from(seederPlansTable).where(eq(seederPlansTable.id, planId)).limit(1);
  if (!plan) { res.status(404).json({ error: "Plan not found" }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (data: Record<string, unknown>) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    // seederRowsTable has: id, planId, data (not rowData), status, createdAt
    const rows = await db.select().from(seederRowsTable).where(eq(seederRowsTable.planId, planId)).limit(200);
    send({ type: "enrich_start", rows: rows.length });

    let enriched = 0;
    for (const row of rows) {
      const rowData = row.data as Record<string, unknown> | null || {};
      const name = String(rowData.nameEn || rowData.name || "");
      if (!name) continue;

      const [r1, r2] = await Promise.all([
        nexusRunRole("researcher", `Saudi company "${name}": CEO, city, sector. JSON: {ceo,city,sector}`, { maxTokens: 200 }).then(r => r.text).catch(() => ""),
        nexusRunRole("researcher", `"${name}" Saudi: website, phone, email. JSON: {website,phone,email}`, { maxTokens: 200 }).then(r => r.text).catch(() => ""),
      ]);

      const merged: Record<string, unknown> = { ...rowData };
      for (const r of [r1, r2]) {
        const parsed = tryParseJson(r);
        if (parsed) Object.assign(merged, parsed);
      }

      // seederRowsTable has `data` column not `rowData`
      await db.update(seederRowsTable).set({ status: "enriched", data: merged }).where(eq(seederRowsTable.id, row.id)).catch(() => {});

      enriched++;
      if (enriched % 10 === 0) send({ type: "enrich_progress", enriched, total: rows.length });
    }

    await db.update(seederPlansTable).set({ status: "enriched" }).where(eq(seederPlansTable.id, planId));
    send({ type: "done", planId, enriched });
    res.end();
  } catch (err) {
    send({ type: "error", message: String(err) });
    res.end();
  }
});

// ── Plans list + detail ───────────────────────────────────────────────────────

router.get("/prosengine/seeder/plans", async (_req: Request, res: Response): Promise<void> => {
  try {
    const plans = await db.select().from(seederPlansTable).orderBy(desc(seederPlansTable.createdAt)).limit(50);
    res.json({ ok: true, plans });
  } catch (err) {
    res.json({ ok: true, plans: [], error: String(err) });
  }
});

router.get("/prosengine/seeder/plans/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const [plan] = await db.select().from(seederPlansTable).where(eq(seederPlansTable.id, parseInt(req.params.id as string))).limit(1);
    if (!plan) { res.status(404).json({ error: "Plan not found" }); return; }

    const rows = await db.select().from(seederRowsTable).where(eq(seederRowsTable.planId, plan.id)).limit(200);
    const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(seederRowsTable).where(eq(seederRowsTable.planId, plan.id));
    res.json({ ok: true, plan, rows, total: Number(countRow?.count || 0) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/prosengine/seeder/plans/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    await db.delete(seederRowsTable).where(eq(seederRowsTable.planId, parseInt(req.params.id as string)));
    await db.delete(seederPlansTable).where(eq(seederPlansTable.id, parseInt(req.params.id as string)));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
