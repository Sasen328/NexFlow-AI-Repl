import { Router } from "express";
import { db } from "@workspace/db";
import { calls, contacts } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { status, limit = "50", offset = "0" } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit), 200);
    const off = parseInt(offset);

    const results = await db
      .select({
        id: calls.id,
        org_id: calls.org_id,
        contact_id: calls.contact_id,
        contact_name: sql<string>`coalesce(concat(contacts.first_name, ' ', contacts.last_name), '')`,
        direction: calls.direction,
        status: calls.status,
        duration_seconds: calls.duration_seconds,
        recording_url: calls.recording_url,
        transcript: calls.transcript,
        sentiment_score: calls.sentiment_score,
        call_score: calls.call_score,
        coaching_notes: calls.coaching_notes,
        started_at: calls.started_at,
        ended_at: calls.ended_at,
        created_at: calls.created_at,
      })
      .from(calls)
      .leftJoin(contacts, eq(calls.contact_id, contacts.id))
      .orderBy(desc(calls.created_at))
      .limit(lim)
      .offset(off);

    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list calls" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [call] = await db.insert(calls).values({
      ...req.body,
      org_id: "default",
      status: "scheduled",
    }).returning();
    res.status(201).json(call);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create call" });
  }
});

// Quick-log a completed call in one shot. Optionally chain to AI post-call orchestrator.
router.post("/log", async (req, res) => {
  try {
    const { contact_id, outcome, duration_seconds, notes, run_orchestrator } = req.body ?? {};
    if (!contact_id || !outcome) return res.status(400).json({ error: "contact_id and outcome required" });
    const [call] = await db.insert(calls).values({
      contact_id,
      direction: "outbound",
      status: "completed",
      duration_seconds: duration_seconds ?? null,
      outcome,
      coaching_notes: notes ?? null,
      started_at: new Date(),
      ended_at: new Date(),
      org_id: "default",
    } as any).returning();
    // Update contact engagement timestamp
    await db.update(contacts).set({ last_engaged_at: new Date() } as any).where(eq(contacts.id, contact_id));

    let orchestration: any = null;
    if (run_orchestrator) {
      try {
        const { orchestratePostCall } = await import("../lib/post-call.js").catch(() => ({} as any));
        if (orchestratePostCall) orchestration = await orchestratePostCall(call.id, outcome);
      } catch {}
    }
    res.status(201).json({ call, orchestration });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: err?.message ?? "Failed to log call" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [call] = await db
      .select({
        id: calls.id,
        org_id: calls.org_id,
        contact_id: calls.contact_id,
        contact_name: sql<string>`coalesce(concat(contacts.first_name, ' ', contacts.last_name), '')`,
        direction: calls.direction,
        status: calls.status,
        duration_seconds: calls.duration_seconds,
        recording_url: calls.recording_url,
        transcript: calls.transcript,
        sentiment_score: calls.sentiment_score,
        call_score: calls.call_score,
        coaching_notes: calls.coaching_notes,
        started_at: calls.started_at,
        ended_at: calls.ended_at,
        created_at: calls.created_at,
      })
      .from(calls)
      .leftJoin(contacts, eq(calls.contact_id, contacts.id))
      .where(eq(calls.id, req.params.id));
    if (!call) return res.status(404).json({ error: "Call not found" });
    res.json(call);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get call" });
  }
});

export default router;
