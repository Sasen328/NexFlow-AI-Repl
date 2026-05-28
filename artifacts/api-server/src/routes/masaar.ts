// ─── /api/masaar — Masaar Engine SSE Routes ──────────────────────────────────
//
//  POST /api/masaar/run         — start 5-agent Masaar pipeline (SSE stream)
//  GET  /api/masaar/jobs        — list recent Masaar harvest jobs
//  GET  /api/masaar/jobs/:id    — get job status
//  DELETE /api/masaar/jobs/:id  — cancel a job
//
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { masar_harvest_jobs } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import {
  createMasaarJob,
  getMasaarEmitter,
  cancelMasaarJob,
  runMasaarPipeline,
  type MasaarBrief,
} from "../lib/masaar-engine.js";

const router = Router();

// ── Start Masaar pipeline ─────────────────────────────────────────────────────

router.post("/masaar/run", async (req: Request, res: Response): Promise<void> => {
  const brief = req.body as MasaarBrief;

  if (!brief.searchQuery && !brief.companyName && !brief.crNumber) {
    res.status(400).json({ error: "searchQuery, companyName, or crNumber is required" });
    return;
  }

  const jobId = createMasaarJob();
  const emitter = getMasaarEmitter(jobId);
  if (!emitter) { res.status(500).json({ error: "Failed to create job" }); return; }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (data: string) => { res.write(`data: ${data}\n\n`); };

  emitter.on("data", send);
  emitter.once("done", () => { send(JSON.stringify({ type: "done", jobId })); res.end(); });

  req.on("close", () => { emitter.removeListener("data", send); cancelMasaarJob(jobId); });

  // Run pipeline in background
  runMasaarPipeline(jobId, brief).catch((err) => {
    send(JSON.stringify({ type: "error", message: String(err) }));
    res.end();
  });
});

// ── List jobs ────────────────────────────────────────────────────────────────

router.get("/masaar/jobs", async (_req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await db.select().from(masar_harvest_jobs).orderBy(desc(masar_harvest_jobs.startedAt)).limit(50);
    res.json({ ok: true, jobs });
  } catch (err) {
    res.json({ ok: true, jobs: [], error: String(err) });
  }
});

// ── Get job ──────────────────────────────────────────────────────────────────

router.get("/masaar/jobs/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const [job] = await db.select().from(masar_harvest_jobs).where(eq(masar_harvest_jobs.id, parseInt(req.params.id as string))).limit(1);
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }
    res.json({ ok: true, job });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Cancel job ───────────────────────────────────────────────────────────────

router.delete("/masaar/jobs/:id", (req: Request, res: Response): void => {
  const cancelled = cancelMasaarJob(req.params.id as string);
  res.json({ ok: true, cancelled });
});

export default router;
