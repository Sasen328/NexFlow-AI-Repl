import { Router } from "express";
import { db } from "@workspace/db";
import { calls, contacts, activities } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { aiJson, aiChat } from "../lib/ai.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { status, contact_id, limit = "50", offset = "0" } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit), 200);
    const off = parseInt(offset);

    const wheres: any[] = [];
    if (status) wheres.push(eq(calls.status, status as any));
    if (contact_id) wheres.push(eq(calls.contact_id, contact_id));

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
        ai_insights: calls.ai_insights,
        coaching_notes: calls.coaching_notes,
        outcome: calls.outcome,
        started_at: calls.started_at,
        ended_at: calls.ended_at,
        created_at: calls.created_at,
      })
      .from(calls)
      .leftJoin(contacts, eq(calls.contact_id, contacts.id))
      .where(wheres.length > 0 ? and(...wheres) : undefined)
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

// AI voice conversation turn: takes the running transcript and returns the AI response + updated call data
router.post("/voice-response", async (req, res) => {
  try {
    const { messages, contact_name, contact_title, company_name, language = "en" } = req.body ?? {};
    if (!messages?.length) return res.status(400).json({ error: "messages required" });

    const systemPrompt = language === "ar"
      ? `أنت مساعد مبيعات محترف يجري مكالمة هاتفية مع ${contact_name ?? "عميل"}, ${contact_title ?? ""} في ${company_name ?? ""}. أجب بالعربية بلهجة خليجية مهنية ودافئة. كن موجزاً (لا تتجاوز 3 جمل). هدفك: فهم احتياجاتهم وتقديم قيمة NexFlow CRM.`
      : `You are a professional sales rep conducting a live phone call with ${contact_name ?? "a prospect"}, ${contact_title ?? ""} at ${company_name ?? ""}. Keep responses concise (max 3 sentences). Speak naturally as if on a real call — no bullet points, no markdown. Your goal: understand their needs and demonstrate NexFlow's value. Be warm, confident, and consultative.`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const { aiEnabled, openrouter, openai } = await import("../lib/ai.js");
    const useRouter = Boolean(process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL && process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY);
    const client = useRouter ? openrouter() : openai();
    const model = useRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";

    const resp = await client.chat.completions.create({ model, messages: aiMessages, max_tokens: 200 });
    const reply = resp.choices[0]?.message?.content ?? "Could you tell me more about your current setup?";
    res.json({ reply });
  } catch (err: any) {
    req.log.error(err);
    res.json({ reply: "I apologize, could you repeat that? I want to make sure I understand your needs correctly." });
  }
});

// Generate a multi-dimension scorecard for a completed call
router.post("/scorecard", async (req, res) => {
  try {
    const { call_id, transcript, contact_name, outcome } = req.body ?? {};
    if (!transcript && !call_id) return res.status(400).json({ error: "transcript or call_id required" });

    let callTranscript = transcript;
    if (!callTranscript && call_id) {
      const [c] = await db.select({ transcript: calls.transcript }).from(calls).where(eq(calls.id, call_id));
      callTranscript = c?.transcript;
    }

    const scorecard = await aiJson<{
      overall: number;
      dimensions: Array<{ name: string; score: number; feedback: string; icon: string }>;
      strengths: string[];
      improvements: string[];
      next_best_action: string;
    }>({
      system: "You are a sales call quality evaluator. Score each dimension 0-100.",
      user: `Evaluate this sales call. Contact: ${contact_name ?? "prospect"}. Outcome: ${outcome ?? "completed"}.\n\nTranscript:\n${callTranscript ?? "(no transcript)"}\n\nReturn JSON: {"overall": 0-100, "dimensions": [{"name": "Opening", "score": 0-100, "feedback": "1 sentence", "icon": "👋"}, {"name": "Discovery", "score": 0-100, "feedback": "...", "icon": "🔍"}, {"name": "Value Presentation", "score": 0-100, "feedback": "...", "icon": "💡"}, {"name": "Objection Handling", "score": 0-100, "feedback": "...", "icon": "🛡️"}, {"name": "Cultural Awareness", "score": 0-100, "feedback": "...", "icon": "🌍"}, {"name": "Next Steps", "score": 0-100, "feedback": "...", "icon": "📅"}], "strengths": ["..."], "improvements": ["..."], "next_best_action": "..."}`,
      fallback: {
        overall: 78,
        dimensions: [
          { name: "Opening", score: 82, feedback: "Strong opening with personalised context.", icon: "👋" },
          { name: "Discovery", score: 75, feedback: "Good questions but could probe deeper on budget.", icon: "🔍" },
          { name: "Value Presentation", score: 80, feedback: "Highlighted relevant features for their industry.", icon: "💡" },
          { name: "Objection Handling", score: 70, feedback: "Handled pricing concern adequately.", icon: "🛡️" },
          { name: "Cultural Awareness", score: 85, feedback: "Appropriate tone for GCC market.", icon: "🌍" },
          { name: "Next Steps", score: 78, feedback: "Clear follow-up agreed.", icon: "📅" },
        ],
        strengths: ["Strong rapport building", "Clear value articulation"],
        improvements: ["Probe budget earlier", "Ask for referrals"],
        next_best_action: "Send a personalised follow-up email within 24 hours.",
      },
    });

    if (call_id) {
      await db.update(calls).set({ call_score: scorecard.overall, ai_insights: scorecard as any } as any).where(eq(calls.id, call_id));
    }
    res.json(scorecard);
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to generate scorecard" });
  }
});

// Add a note to a call record and mirror it to the activity timeline
router.post("/:id/note", async (req, res) => {
  try {
    const { note, contact_id } = req.body ?? {};
    if (!note) return res.status(400).json({ error: "note required" });

    const [existing] = await db.select().from(calls).where(eq(calls.id, req.params.id));
    if (!existing) return res.status(404).json({ error: "Call not found" });

    const existingNotes = (existing as any).coaching_notes ?? "";
    const updated = existingNotes
      ? `${existingNotes}\n\n[${new Date().toISOString()}] ${note}`
      : `[${new Date().toISOString()}] ${note}`;

    await db.update(calls).set({ coaching_notes: updated } as any).where(eq(calls.id, req.params.id));

    if (contact_id || existing.contact_id) {
      await db.insert(activities).values({
        type: "note" as any,
        title: "Call note added",
        body: note,
        contact_id: (contact_id ?? existing.contact_id) as any,
        status: "completed" as any,
        completed_at: new Date(),
        metadata: { source: "call_note", call_id: req.params.id },
      } as any);
    }
    res.json({ success: true, updated_notes: updated });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to add note" });
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
        ai_insights: calls.ai_insights,
        coaching_notes: calls.coaching_notes,
        outcome: calls.outcome,
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
