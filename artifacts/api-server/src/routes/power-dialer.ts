import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contacts, calls, activities, deals } from "@workspace/db";
import { eq, and, sql, desc, isNull, or } from "drizzle-orm";
import { aiJson } from "../lib/ai.js";
import { randomUUID } from "crypto";

const router: IRouter = Router();

// GET /api/power-dialer/queue — prioritized list of who to call right now
router.get("/queue", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 25), 100);
    // Score = lead_score + (open deal value / 1000) - days_since_last_contact*2
    const rows = await db.execute(sql`
      with last_call as (
        select contact_id, max(created_at) as last_at, count(*) as call_count
        from calls group by contact_id
      ),
      open_deals as (
        select contact_id, sum(value) as open_value, count(*) as open_count
        from deals
        where stage not in ('closed_won','closed_lost')
        group by contact_id
      )
      select
        c.id, c.first_name, c.last_name, c.title, c.email, c.phone, c.lead_score, c.status, c.last_engaged_at,
        c.company_id,
        coalesce(lc.last_at, c.last_engaged_at, c.created_at) as last_touch,
        coalesce(lc.call_count, 0) as call_count,
        coalesce(od.open_value, 0) as open_value,
        coalesce(od.open_count, 0) as open_count,
        coalesce(c.lead_score, 0) +
          (coalesce(od.open_value, 0) / 1000.0) -
          (extract(epoch from (now() - coalesce(lc.last_at, c.last_engaged_at, c.created_at))) / 86400.0) * 2
          as priority_score
      from contacts c
      left join last_call lc on lc.contact_id = c.id
      left join open_deals od on od.contact_id = c.id
      where c.phone is not null and c.phone <> ''
      order by priority_score desc nulls last
      limit ${limit}
    `);
    const items = (rows as any).rows ?? rows;
    res.json({ count: items.length, queue: items });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// POST /api/power-dialer/log — log an outbound call as if it were inbound (gamified)
// body: { contact_id, outcome, duration_seconds?, notes? }
router.post("/log", async (req, res) => {
  try {
    const { contact_id, outcome, duration_seconds = 0, notes = "" } = req.body ?? {};
    if (!contact_id || !outcome) return res.status(400).json({ error: "contact_id & outcome required" });

    const callId = randomUUID();
    await db.insert(calls).values({
      id: callId,
      contact_id,
      direction: "outbound",
      outcome,
      duration_seconds,
      coaching_notes: notes || null,
      status: "completed",
      transcript: notes ? `[power-dialer] ${notes}` : null,
    } as any);

    await db.update(contacts).set({ last_engaged_at: new Date(), updated_at: new Date() }).where(eq(contacts.id, contact_id));

    await db.insert(activities).values({
      id: randomUUID(),
      contact_id,
      type: "call",
      title: `Power-dial call: ${outcome}`,
      status: "completed",
      body: notes || null,
      completed_at: new Date(),
    } as any);

    res.json({ ok: true, call_id: callId });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// GET /api/power-dialer/stats — daily stats for the gamified dashboard
router.get("/stats", async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [{ today_calls }] = await db.select({
      today_calls: sql<number>`count(*)`,
    }).from(calls).where(sql`${calls.created_at} >= ${today}`);
    const [{ today_connects }] = await db.select({
      today_connects: sql<number>`count(*)`,
    }).from(calls).where(and(sql`${calls.created_at} >= ${today}`, eq(calls.outcome, "connected")));
    const [{ today_meetings }] = await db.select({
      today_meetings: sql<number>`count(*)`,
    }).from(calls).where(and(sql`${calls.created_at} >= ${today}`, eq(calls.outcome, "meeting_booked")));
    const [{ avg_duration }] = await db.select({
      avg_duration: sql<number>`coalesce(avg(duration_seconds),0)`,
    }).from(calls).where(sql`${calls.created_at} >= ${today}`);

    res.json({
      today_calls: Number(today_calls),
      today_connects: Number(today_connects),
      today_meetings: Number(today_meetings),
      connect_rate: Number(today_calls) > 0 ? +(Number(today_connects) / Number(today_calls) * 100).toFixed(1) : 0,
      avg_duration: Math.round(Number(avg_duration)),
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// POST /api/power-dialer/voice-agent-call — stub for AI voice agent outbound
// body: { contact_id, agent_persona, talking_points }
router.post("/voice-agent-call", async (req, res) => {
  try {
    const { contact_id, agent_persona = "professional", talking_points = [] } = req.body ?? {};
    if (!contact_id) return res.status(400).json({ error: "contact_id required" });
    const [c] = await db.select().from(contacts).where(eq(contacts.id, contact_id));
    if (!c) return res.status(404).json({ error: "contact not found" });

    // Simulated voice agent run — produces a transcript-like preview
    const sim = await aiJson<any>({
      system: "You simulate an outbound AI voice agent call to a B2B contact and produce a realistic transcript & outcome. JSON only.",
      user: `Simulate a 60-90 second outbound voice call to ${c.first_name} ${c.last_name} (${c.title ?? "contact"}). Persona: ${agent_persona}. Talking points: ${talking_points.join("; ") || "introduce NexFlow CRM and qualify interest"}.
Output JSON: {"opening":"agent's opening line","contact_response":"contact's plausible response","key_exchange":[{"agent":"...","contact":"..."},{"agent":"...","contact":"..."}],"outcome":"connected|voicemail|no_answer|callback_requested|meeting_booked|not_interested","next_step":"what to do next","sentiment":"positive|neutral|negative","confidence":0-100,"requires_telephony":true}`,
      fallback: {
        opening: `Hi ${c.first_name}, this is NexFlow — calling about your sales workflow.`,
        contact_response: "Sure, what's this about?",
        key_exchange: [
          { agent: "We help GCC sales teams cut admin and close 30% more deals.", contact: "Interesting — how does it work?" },
          { agent: "Could I send a 90-second demo and book 20 minutes next week?", contact: "Yes, send it across." },
        ],
        outcome: "callback_requested",
        next_step: "Send demo email and book follow-up.",
        sentiment: "positive",
        confidence: 78,
        requires_telephony: true,
      },
    });

    // Log a synthetic call so the contact reflects the activity
    const callId = randomUUID();
    await db.insert(calls).values({
      id: callId,
      contact_id,
      direction: "outbound",
      outcome: sim.outcome ?? "connected",
      duration_seconds: 75,
      coaching_notes: `[AI voice agent simulation] ${sim.opening}`,
      transcript: JSON.stringify(sim.key_exchange ?? []),
      status: "completed",
      call_score: sim.confidence ?? 70,
    } as any);

    res.json({
      ok: true,
      call_id: callId,
      simulation: sim,
      note: "AI Voice Agent runs as a simulation. Connect Twilio Voice / Vapi / Retell in Settings → Integrations to place real calls.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
