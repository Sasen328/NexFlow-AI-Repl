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
