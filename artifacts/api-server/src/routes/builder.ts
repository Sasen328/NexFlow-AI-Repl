// ─── /api/builder — AI DB Builder Routes ─────────────────────────────────────
//
//  POST /api/builder/run         — start builder pipeline (SSE stream)
//  GET  /api/builder/jobs        — list recent builder jobs
//  GET  /api/builder/jobs/:id    — get job status
//  DELETE /api/builder/jobs/:id  — cancel a job
//  GET  /api/builder/sources     — list available sources (built-in + custom)
//  POST /api/builder/sources     — add a custom source
//  DELETE /api/builder/sources/:id — remove custom source
//  GET  /api/builder/companies   — browse harvested companies
//
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { builder_companies, builder_jobs, builder_custom_sources } from "@workspace/db";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  createBuilderJob,
  getBuilderEmitter,
  cancelBuilderJob,
  runBuilderPipeline,
  BUILDER_SOURCES,
  type BuilderBrief,
} from "../lib/builder-engine.js";

const router = Router();

// ── Start Builder pipeline ────────────────────────────────────────────────────

router.post("/builder/run", async (req: Request, res: Response): Promise<void> => {
  const brief = req.body as BuilderBrief;

  const jobId = createBuilderJob();
  const emitter = getBuilderEmitter(jobId);
  if (!emitter) { res.status(500).json({ error: "Failed to create job" }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (data: string) => { res.write(`data: ${data}\n\n`); };

  emitter.on("data", send);
  emitter.once("done", () => { send(JSON.stringify({ type: "done", jobId })); res.end(); });
  req.on("close", () => { emitter.removeListener("data", send); cancelBuilderJob(jobId); });

  runBuilderPipeline(jobId, brief).catch((err) => {
    send(JSON.stringify({ type: "error", message: String(err) }));
    res.end();
  });
});

// ── List jobs ────────────────────────────────────────────────────────────────

router.get("/builder/jobs", async (_req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await db.select().from(builder_jobs).orderBy(desc(builder_jobs.startedAt)).limit(50);
    res.json({ ok: true, jobs });
  } catch (err) {
    res.json({ ok: true, jobs: [], error: String(err) });
  }
});

router.get("/builder/jobs/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const [job] = await db.select().from(builder_jobs).where(eq(builder_jobs.id, parseInt(req.params.id as string))).limit(1);
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }
    res.json({ ok: true, job });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/builder/jobs/:id", (req: Request, res: Response): void => {
  const cancelled = cancelBuilderJob(req.params.id as string);
  res.json({ ok: true, cancelled });
});

// ── Sources ──────────────────────────────────────────────────────────────────

router.get("/builder/sources", async (_req: Request, res: Response): Promise<void> => {
  try {
    const custom = await db.select().from(builder_custom_sources);
    res.json({ ok: true, builtin: BUILDER_SOURCES, custom });
  } catch (err) {
    res.json({ ok: true, builtin: BUILDER_SOURCES, custom: [], error: String(err) });
  }
});

router.post("/builder/sources", async (req: Request, res: Response): Promise<void> => {
  const { name, url, category } = req.body as { name?: string; url?: string; category?: string };
  if (!name || !url) { res.status(400).json({ error: "name and url required" }); return; }

  try {
    const [row] = await db.insert(builder_custom_sources).values({
      name: name || "Custom",
      url: url || "",
      category: category || "custom",
      createdAt: new Date(),
    }).returning();
    res.status(201).json({ ok: true, source: row });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/builder/sources/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    await db.delete(builder_custom_sources).where(eq(builder_custom_sources.id, parseInt(req.params.id as string)));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Companies browser ────────────────────────────────────────────────────────

router.get("/builder/companies", async (req: Request, res: Response): Promise<void> => {
  const { search, limit = "50", offset = "0" } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit), 200);
  const off = parseInt(offset);

  try {
    const rows = await db.select().from(builder_companies)
      .where(search ? or(ilike(builder_companies.nameEn!, `%${search}%`), ilike(builder_companies.nameAr!, `%${search}%`)) : undefined)
      .orderBy(desc(builder_companies.createdAt!))
      .limit(lim).offset(off);

    const [total] = await db.select({ count: sql<number>`count(*)` }).from(builder_companies)
      .where(search ? or(ilike(builder_companies.nameEn!, `%${search}%`), ilike(builder_companies.nameAr!, `%${search}%`)) : undefined);

    res.json({ ok: true, companies: rows, total: Number(total?.count || 0) });
  } catch (err) {
    res.json({ ok: true, companies: [], total: 0, error: String(err) });
  }
});

export default router;
