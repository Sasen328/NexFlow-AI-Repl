// ─── /api/relationship-intel — Relationship Intelligence Routes ───────────────
//
//  POST /api/relationship-intel/run      — start 4-agent pipeline (SSE stream)
//  GET  /api/relationship-intel/jobs     — list jobs
//  GET  /api/relationship-intel/jobs/:id — get job + org tree
//  DELETE /api/relationship-intel/jobs/:id — cancel job
//  POST /api/relationship-intel/jobs/:id/push-to-crm — push contacts to CRM
//
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { relationshipIntelJobsTable, contacts, companies } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import {
  createRelationshipIntelJob,
  getRelationshipIntelEmitter,
  cancelRelationshipIntelJob,
  runRelationshipIntelPipeline,
  type RelationshipIntelBrief,
  type OrgNode,
} from "../lib/relationship-intel-engine.js";

const router = Router();

// ── Start pipeline ────────────────────────────────────────────────────────────

router.post("/relationship-intel/run", async (req: Request, res: Response): Promise<void> => {
  const brief = req.body as RelationshipIntelBrief;

  if (!brief.targetCompanyName) {
    res.status(400).json({ error: "targetCompanyName is required" });
    return;
  }

  const jobId = createRelationshipIntelJob();
  const emitter = getRelationshipIntelEmitter(jobId);
  if (!emitter) { res.status(500).json({ error: "Failed to create job" }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (data: string) => { res.write(`data: ${data}\n\n`); };

  emitter.on("data", (d: string) => send(d));
  emitter.once("done", () => { send(JSON.stringify({ type: "done", jobId })); res.end(); });
  req.on("close", () => { emitter.removeListener("data", send); cancelRelationshipIntelJob(jobId); });

  runRelationshipIntelPipeline(jobId, brief).catch((err) => {
    send(JSON.stringify({ type: "error", message: String(err) }));
    res.end();
  });
});

// ── List jobs ────────────────────────────────────────────────────────────────

router.get("/relationship-intel/jobs", async (_req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await db.select().from(relationshipIntelJobsTable).orderBy(desc(relationshipIntelJobsTable.id)).limit(50);
    res.json({ ok: true, jobs });
  } catch (err) {
    res.json({ ok: true, jobs: [], error: String(err) });
  }
});

// ── Get job ──────────────────────────────────────────────────────────────────

router.get("/relationship-intel/jobs/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const [job] = await db.select().from(relationshipIntelJobsTable)
      .where(eq(relationshipIntelJobsTable.id, parseInt(req.params.id as string))).limit(1);
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }
    res.json({ ok: true, job });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Cancel ───────────────────────────────────────────────────────────────────

router.delete("/relationship-intel/jobs/:id", (req: Request, res: Response): void => {
  const cancelled = cancelRelationshipIntelJob(req.params.id as string);
  res.json({ ok: true, cancelled });
});

// ── Push contacts to CRM ──────────────────────────────────────────────────────

router.post("/relationship-intel/jobs/:id/push-to-crm", async (req: Request, res: Response): Promise<void> => {
  try {
    const [job] = await db.select().from(relationshipIntelJobsTable)
      .where(eq(relationshipIntelJobsTable.id, parseInt(req.params.id as string))).limit(1);

    if (!job) { res.status(404).json({ error: "Job not found" }); return; }

    const orgData = (job.orgChartData as { orgNodes?: OrgNode[] } | null);
    const nodes: OrgNode[] = orgData?.orgNodes || [];

    const targetName = job.targetCompanyName || "";
    let companyId: string | null = null;
    if (targetName) {
      const [existing] = await db.select({ id: companies.id }).from(companies)
        .where(eq(companies.name, targetName)).limit(1);
      if (existing) {
        companyId = existing.id;
      } else {
        const [newCo] = await db.insert(companies).values({
          name: targetName || "Unknown",
          created_at: new Date(),
          updated_at: new Date(),
        }).returning({ id: companies.id });
        companyId = newCo?.id || null;
      }
    }

    const created: string[] = [];
    const skipped: string[] = [];

    for (const node of nodes) {
      if (!node.nameEn) continue;
      const [firstName, ...rest] = node.nameEn.split(" ");
      const lastName = rest.join(" ") || "-";

      // Dedup by email or name
      const existing = node.email
        ? await db.select({ id: contacts.id }).from(contacts).where(eq(contacts.email, node.email)).limit(1)
        : [];

      if (existing.length > 0) {
        skipped.push(node.nameEn);
        continue;
      }

      await db.insert(contacts).values({
        first_name:  firstName || "Unknown",
        last_name:   lastName,
        email:       node.email || null,
        phone:       node.phone || null,
        title:       node.title || null,
        linkedin_url: node.linkedin || null,
        company_id:  companyId,
        org_id:      "default",
        created_at:  new Date(),
        updated_at:  new Date(),
      });
      created.push(node.nameEn);
    }

    res.json({ ok: true, created: created.length, skipped: skipped.length, createdNames: created, skippedNames: skipped });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
