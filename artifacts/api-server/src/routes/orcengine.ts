// ─── /api/orcengine — OrcEngine Deep-Dive Orchestration ──────────────────────
//
//  OrcEngine is the admin-facing deep-research orchestrator. It coordinates
//  ALL intelligence engines simultaneously for a single target and produces
//  a comprehensive unified report.
//
//  POST /api/orcengine/run       — start full OrcEngine sweep (SSE stream)
//  POST /api/orcengine/fusion    — ensemble multiple LLMs on a research prompt
//  GET  /api/orcengine/runs      — list recent OrcEngine runs
//  GET  /api/orcengine/runs/:id  — get run detail
//
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type Request, type Response } from "express";
import { nexusRunRole, nexusFusion } from "../lib/nexus/index.js";
import { scanCompanySignals } from "../lib/signal-engine.js";
import { scoutSiteIntel } from "../lib/scout-client.js";
import { screenSanctions } from "../lib/sanctions-screen.js";

const router = Router();

// In-memory run cache (short TTL — OrcEngine runs are expensive)
const runCache = new Map<string, { id: string; created: Date; target: string; result?: Record<string, unknown> }>();

// ── Full OrcEngine sweep (SSE) ────────────────────────────────────────────────

router.post("/orcengine/run", async (req: Request, res: Response): Promise<void> => {
  const { target, targetType, depth, options } = req.body as {
    target?: string;
    targetType?: "company" | "person" | "domain";
    depth?: "fast" | "standard" | "deep";
    options?: { signals?: boolean; compliance?: boolean; relationships?: boolean; siteIntel?: boolean };
  };

  if (!target) { res.status(400).json({ error: "target required" }); return; }

  const runId = `orc-${Date.now()}`;
  runCache.set(runId, { id: runId, created: new Date(), target });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (data: Record<string, unknown>) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    send({ type: "orc_start", runId, target, targetType, depth });

    const opts = { signals: true, compliance: true, relationships: false, siteIntel: true, ...options };
    const results: Record<string, unknown> = {};

    // ── Parallel Phase 1: Core intel ─────────────────────────────────────────
    send({ type: "phase_start", phase: 1, name: "Core Intelligence Ensemble" });

    const corePrompts = [
      `Comprehensive intelligence brief on "${target}" (${targetType || "company"}) in Saudi Arabia / GCC: overview, leadership, financials, products, market position. JSON: { overview, leadership, financials, products, marketPosition }`,
      `"${target}" Saudi Arabia/GCC: recent news and developments 2024-2025. JSON: { recentNews: [{ headline, date, significance }] }`,
      `"${target}" competitive landscape: direct competitors, market share estimate, unique strengths. JSON: { competitors, marketShare, strengths }`,
      `"${target}" digital presence: website, social media, tech stack indicators, content themes. JSON: { website, socialMedia, techStack, contentThemes }`,
      `"${target}" Saudi Vision 2030 alignment: relevant programs, government relationships, strategic positioning. JSON: { vision2030Alignment, governmentRelationships, strategicPrograms }`,
    ];

    const coreResults = await Promise.all(corePrompts.map(p =>
      nexusRunRole("researcher", p, { maxTokens: 800 }).then(r => r.text).catch(() => "")
    ));
    results.core = coreResults;
    send({ type: "phase_done", phase: 1, fragmentCount: coreResults.filter(Boolean).length });

    // ── Parallel Phase 2: Signals + Compliance + Site Intel ──────────────────
    send({ type: "phase_start", phase: 2, name: "Signal / Compliance / Site Intel" });

    const phase2Tasks: Promise<unknown>[] = [];

    if (opts.signals) {
      phase2Tasks.push(
        scanCompanySignals({ companyName: target, saveToDB: false }).then((s) => { results.signals = s; return s; }).catch(() => ({ available: false }))
      );
    }

    if (opts.compliance) {
      phase2Tasks.push(
        screenSanctions(target).then((s) => { results.compliance = s; return s; }).catch(() => ({ available: false }))
      );
    }

    if (opts.siteIntel && (targetType === "domain" || targetType === "company")) {
      phase2Tasks.push(
        scoutSiteIntel(target).then((s) => { results.siteIntel = s; return s; }).catch(() => ({ available: false }))
      );
    }

    await Promise.all(phase2Tasks);
    send({ type: "phase_done", phase: 2 });

    // ── Phase 3: NEXUS Synthesis ──────────────────────────────────────────────
    send({ type: "phase_start", phase: 3, name: "Nexus Fusion Synthesis" });

    const coreBundle = (coreResults as string[]).filter(Boolean).join("\n---\n");
    const reportRaw = await nexusRunRole("writer", `
Synthesize this intelligence bundle into a comprehensive executive brief for "${target}".
Cover: overview, leadership, financials, competitive position, signals/news, compliance, strategic outlook.
Write in professional B2B tone. 600-900 words.

Core intel: ${coreBundle.slice(0, 8000)}
Signals: ${JSON.stringify(results.signals || {}).slice(0, 2000)}
Site intel: ${JSON.stringify(results.siteIntel || {}).slice(0, 2000)}
`, { maxTokens: 1500 });

    const report = reportRaw.text;
    results.report = report;
    send({ type: "phase_done", phase: 3, reportWords: report.split(" ").length });

    // Cache result
    runCache.set(runId, { id: runId, created: new Date(), target, result: results });

    send({ type: "orc_complete", runId, target, reportPreview: report.slice(0, 300) });
    res.end();
  } catch (err) {
    send({ type: "error", runId, message: String(err) });
    res.end();
  }
});

// ── Fusion endpoint ───────────────────────────────────────────────────────────

router.post("/orcengine/fusion", async (req: Request, res: Response): Promise<void> => {
  const { prompt, models, arbitrator } = req.body as {
    prompt?: string;
    models?: string[];
    arbitrator?: string;
  };

  if (!prompt) { res.status(400).json({ error: "prompt required" }); return; }

  try {
    const result = await nexusFusion(prompt, { models, arbitrator: arbitrator as ("openai" | "gemini" | "claude" | undefined) });
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── List runs ────────────────────────────────────────────────────────────────

router.get("/orcengine/runs", (_req: Request, res: Response): void => {
  const runs = Array.from(runCache.values())
    .sort((a, b) => b.created.getTime() - a.created.getTime())
    .slice(0, 50)
    .map(({ id, created, target, result }) => ({
      id, target, created, hasResult: !!result,
    }));
  res.json({ ok: true, runs });
});

// ── Get run ──────────────────────────────────────────────────────────────────

router.get("/orcengine/runs/:id", (req: Request, res: Response): void => {
  const run = runCache.get(req.params.id as string);
  if (!run) { res.status(404).json({ error: "Run not found" }); return; }
  res.json({ ok: true, run });
});

export default router;
