import { Router } from "express";
import { db } from "@workspace/db";
import { calls, contacts, activities } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { aiJson } from "../lib/ai.js";

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

    // Always create an "activity" row mirroring the call so it appears in the
    // contact timeline. AI polishes the title/body when notes are provided.
    let activityTitle = `${outcome.replace("_", " ")} call`;
    let activityBody = notes ?? null;
    if (notes) {
      try {
        const polished = await aiJson<{ title: string; body: string }>({
          system: "You polish raw sales-call notes into a concise activity entry.",
          user: `Outcome: ${outcome}. Duration: ${duration_seconds ?? 0}s. Raw notes: ${notes}. Return JSON {"title": "concise <=70 char title", "body": "2-3 sentence summary"}.`,
          fallback: { title: activityTitle, body: notes },
        });
        if (polished?.title) activityTitle = polished.title;
        if (polished?.body) activityBody = polished.body;
      } catch {}
    }
    await db.insert(activities).values({
      type: "call" as any,
      title: activityTitle,
      body: activityBody,
      contact_id,
      status: "completed",
      completed_at: new Date(),
      metadata: { source: "quick_log", call_id: call.id, outcome, duration_seconds: duration_seconds ?? null },
    } as any);

    // Optional: chain to AI post-call orchestration to seed next-best-action activities.
    let orchestration: { plan: any; activities_created: number } | null = null;
    if (run_orchestrator) {
      try {
        const [c] = contact_id ? await db.select().from(contacts).where(eq(contacts.id, contact_id)) : [];
        const plan = await aiJson<any>({
          system: "You are a sales operations orchestrator. Decide post-call actions.",
          user: `Call outcome: ${outcome}. Contact: ${c?.first_name ?? ""} ${c?.last_name ?? ""} (${c?.title ?? ""}). Notes: ${notes ?? ""}. Decide actions JSON: {"actions": [{"type": "send_whatsapp|create_task|schedule_meeting|send_followup_email", "title": "...", "body": "...", "delay_hours": 0}], "summary": "..."}`,
          fallback: {
            actions: outcome === "no_answer" || outcome === "voicemail"
              ? [
                  { type: "send_whatsapp", title: "WhatsApp follow-up", body: "Tried calling — happy to schedule a quick chat?", delay_hours: 2 },
                  { type: "create_task", title: "Retry call tomorrow AM", delay_hours: 20 },
                ]
              : [
                  { type: "send_followup_email", title: "Thank you & next steps", body: "Recap of our discussion and proposed next steps." },
                  { type: "create_task", title: "Send proposal", delay_hours: 24 },
                ],
            summary: "Auto-generated next-best actions.",
          },
        });
        let created = 0;
        const typeMap: Record<string, string> = {
          send_whatsapp: "whatsapp",
          send_followup_email: "email",
          schedule_meeting: "meeting",
          create_task: "task",
        };
        for (const a of (plan.actions ?? [])) {
          const scheduledAt = new Date(Date.now() + ((a.delay_hours ?? 0) * 3600 * 1000));
          await db.insert(activities).values({
            type: (typeMap[a.type] ?? "task") as any,
            title: a.title ?? a.type,
            body: a.body ?? null,
            contact_id,
            status: "pending",
            scheduled_at: scheduledAt,
            metadata: { source: "post_call_orchestrator", call_id: call.id },
          } as any);
          created++;
        }
        orchestration = { plan, activities_created: created };
        await db.update(calls).set({ ai_insights: plan } as any).where(eq(calls.id, call.id));
      } catch (e: any) {
        req.log.warn({ err: e?.message }, "post-call orchestration failed");
      }
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
