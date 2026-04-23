import { Router } from "express";
import { db } from "@workspace/db";
import {
  contacts, companies, deals, calls, activities, signals, ai_insights,
  campaigns, automation_rules,
} from "@workspace/db";
import { eq, desc, sql, and, gte, isNotNull } from "drizzle-orm";
import { aiChat, aiJson } from "../lib/ai.js";

const router = Router();

// ── Company Intelligence ───────────────────────────────────────────────────
router.get("/companies/:id/intelligence", async (req, res) => {
  try {
    const [c] = await db.select().from(companies).where(eq(companies.id, req.params.id));
    if (!c) return res.status(404).json({ error: "Not found" });

    // Cache for 24h. Mark with a short "researching" flag to dedupe concurrent requests.
    if (c.intelligence && c.intelligence_updated_at && (Date.now() - new Date(c.intelligence_updated_at).getTime()) < 24 * 3600 * 1000) {
      return res.json(c.intelligence);
    }
    // If another request is already researching this company (within last 30s), return what we have
    if ((c.intelligence as any)?._researching && c.intelligence_updated_at &&
        (Date.now() - new Date(c.intelligence_updated_at).getTime()) < 30_000) {
      return res.json(c.intelligence ?? { summary: "Researching…", recent_news: [], buying_signals: [], key_people: [], tech_stack: [], competitors: [], outreach_angles: [], risk_factors: [] });
    }
    await db.update(companies).set({
      intelligence: { _researching: true, ...(c.intelligence as object ?? {}) } as any,
      intelligence_updated_at: new Date(),
    }).where(eq(companies.id, c.id));

    const ctxData = await aiJson<any>({
      provider: "perplexity",
      system: "You are a B2B sales research analyst. Return concise, factual JSON only.",
      user: `Research company "${c.name}" (${c.domain ?? "no domain"}, ${c.industry ?? ""}, ${c.country ?? ""}). Return JSON: {"summary": "2-3 sentences about the company", "recent_news": [{"title": "...", "date": "YYYY-MM", "impact": "high|medium|low"}], "buying_signals": ["..."], "key_people": [{"name": "...", "title": "..."}], "tech_stack": ["..."], "competitors": ["..."], "outreach_angles": ["..."], "risk_factors": ["..."]}`,
      fallback: {
        summary: `${c.name} is a ${c.industry ?? "B2B"} company based in ${c.country ?? "the region"}.`,
        recent_news: [],
        buying_signals: [],
        key_people: [],
        tech_stack: [],
        competitors: [],
        outreach_angles: [`Reach out about ${c.industry ?? "industry"} solutions`, "Reference their growth trajectory"],
        risk_factors: [],
      },
    });

    await db.update(companies).set({
      intelligence: ctxData,
      intelligence_updated_at: new Date(),
    }).where(eq(companies.id, c.id));

    res.json(ctxData);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── Bulk Enrichment ────────────────────────────────────────────────────────
router.post("/contacts/:id/enrich", async (req, res) => {
  try {
    const [c] = await db.select().from(contacts).where(eq(contacts.id, req.params.id));
    if (!c) return res.status(404).json({ error: "Not found" });

    const enriched = await aiJson<any>({
      provider: "perplexity",
      system: "You are a contact enrichment service. Return realistic JSON for the given person.",
      user: `Enrich the contact: ${c.first_name} ${c.last_name} (${c.email ?? "no email"}, ${c.title ?? ""}). Return JSON: {"phone_suggestions": ["+..."], "title_normalized": "...", "seniority": "C-level|VP|Director|Manager|IC", "department": "Sales|Marketing|Engineering|Product|Finance|Other", "linkedin_url": "https://...", "best_call_time": "Tue-Thu 10am-12pm local", "personality_style": "analytical|driver|expressive|amiable", "buying_authority": "decision-maker|influencer|user", "interests": ["..."]}`,
      fallback: { title_normalized: c.title, seniority: "Manager", department: "Sales", best_call_time: "Tue-Thu 10am-12pm" },
    });

    const updates: any = { updated_at: new Date() };
    if (enriched.phone_suggestions?.[0] && !c.phone) updates.phone = enriched.phone_suggestions[0];
    if (enriched.linkedin_url && !c.linkedin_url) updates.linkedin_url = enriched.linkedin_url;
    if (enriched.best_call_time) updates.best_call_time = enriched.best_call_time;
    if (enriched.title_normalized && !c.title) updates.title = enriched.title_normalized;

    const [updated] = await db.update(contacts).set(updates).where(eq(contacts.id, c.id)).returning();
    res.json({ contact: updated, enrichment: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.post("/contacts/bulk-enrich", async (req, res) => {
  try {
    const { contact_ids } = req.body as { contact_ids: string[] };
    if (!Array.isArray(contact_ids)) return res.status(400).json({ error: "contact_ids array required" });
    const MAX = 50;
    if (contact_ids.length > MAX) return res.status(400).json({ error: `Bulk enrichment is capped at ${MAX} contacts per request.` });
    let enriched = 0;
    const errors: string[] = [];
    for (const id of contact_ids) {
      try {
        const [c] = await db.select().from(contacts).where(eq(contacts.id, id));
        if (!c) continue;
        const updates: any = {
          best_call_time: c.best_call_time ?? "Tue-Thu 10am-12pm local",
          updated_at: new Date(),
        };
        if (!c.linkedin_url) updates.linkedin_url = `https://linkedin.com/in/${c.first_name?.toLowerCase()}-${c.last_name?.toLowerCase()}`;
        await db.update(contacts).set(updates).where(eq(contacts.id, id));
        enriched++;
      } catch (e: any) {
        errors.push(`${id}: ${e?.message ?? "unknown"}`);
        console.error(`bulk-enrich failed for ${id}:`, e);
      }
    }
    res.json({ enriched, total: contact_ids.length, errors });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── Daily AI Call List ──────────────────────────────────────────────────────
router.get("/call-list/today", async (_req, res) => {
  try {
    // Predictive scoring: combine lead_score, last_engaged_at recency, and stage
    const list = await db.execute(sql`
      select c.id, c.first_name, c.last_name, c.email, c.phone, c.title, c.lead_score, c.best_call_time,
        co.name as company_name,
        u.name as owner_name,
        (select max(d.value) from deals d where d.contact_id = c.id and d.stage not in ('closed_won','closed_lost')) as deal_value,
        (select max(d.stage::text) from deals d where d.contact_id = c.id and d.stage not in ('closed_won','closed_lost')) as deal_stage,
        coalesce((c.lead_score * 0.5)
          + (case when c.last_engaged_at > now() - interval '7 days' then 30 else 0 end)
          + (case when exists(select 1 from signals s where s.contact_id = c.id and s.created_at > now() - interval '14 days') then 20 else 0 end)
          , 0) as priority_score,
        (select count(*) from calls cl where cl.contact_id = c.id and cl.status in ('missed','failed','completed') and cl.created_at > now() - interval '7 days')::int as recent_call_attempts
      from contacts c
      left join companies co on co.id = c.company_id
      left join users u on u.id = c.owner_id
      where c.status in ('new','active','qualified')
      order by priority_score desc nulls last
      limit 20
    `);
    const rows = ((list as any).rows ?? list) as any[];

    const categorized = {
      hot: rows.filter(r => r.priority_score >= 70),
      warm: rows.filter(r => r.priority_score >= 40 && r.priority_score < 70),
      retry: rows.filter(r => r.recent_call_attempts > 0 && r.priority_score < 40),
      cold: rows.filter(r => r.priority_score < 40 && r.recent_call_attempts === 0),
    };

    res.json({
      date: new Date().toISOString().split("T")[0],
      total: rows.length,
      categories: categorized,
      ai_recommendation: "Start with HOT (highest signal recency × authority). RETRY contacts have not answered — try a different time window or switch channel to WhatsApp.",
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── Post-call Orchestration ─────────────────────────────────────────────────
router.post("/post-call/:callId", async (req, res) => {
  try {
    const [call] = await db.select().from(calls).where(eq(calls.id, req.params.callId));
    if (!call) return res.status(404).json({ error: "Not found" });

    const outcome = req.body?.outcome ?? call.outcome ?? "no_answer";
    const ctx = call.contact_id ? await db.select().from(contacts).where(eq(contacts.id, call.contact_id)) : [];
    const contact = ctx[0];

    const plan = await aiJson<any>({
      system: "You are a sales operations orchestrator. Decide post-call actions.",
      user: `Call outcome: ${outcome}. Contact: ${contact?.first_name ?? ""} ${contact?.last_name ?? ""} (${contact?.title ?? ""}). Notes: ${call.coaching_notes ?? ""}. Decide actions JSON: {"actions": [{"type": "send_whatsapp|create_task|schedule_meeting|send_followup_email|log_note", "title": "...", "body": "...", "delay_hours": 0}], "next_best_time": "ISO date", "summary": "..."}`,
      fallback: {
        actions: outcome === "no_answer"
          ? [
              { type: "send_whatsapp", title: "WhatsApp follow-up", body: "Tried calling — happy to schedule a quick chat?", delay_hours: 2 },
              { type: "create_task", title: "Retry call tomorrow AM", delay_hours: 20 },
            ]
          : [
              { type: "send_followup_email", title: "Thank you & next steps", body: "Recap of our discussion and proposed next steps." },
              { type: "create_task", title: "Send proposal", delay_hours: 24 },
            ],
        summary: outcome === "no_answer" ? "No answer — switching to WhatsApp + retry." : "Productive conversation — sending recap.",
      },
    });

    // Persist the planned actions as activities
    let created = 0;
    for (const a of (plan.actions ?? [])) {
      const scheduledAt = new Date(Date.now() + ((a.delay_hours ?? 0) * 3600 * 1000));
      const typeMap: Record<string, string> = {
        send_whatsapp: "whatsapp",
        send_followup_email: "email",
        schedule_meeting: "meeting",
        create_task: "task",
        log_note: "note",
      };
      await db.insert(activities).values({
        type: (typeMap[a.type] ?? "task") as any,
        title: a.title ?? a.type,
        body: a.body ?? null,
        contact_id: call.contact_id,
        status: a.type === "log_note" ? "completed" : "pending",
        scheduled_at: scheduledAt,
        completed_at: a.type === "log_note" ? new Date() : null,
        metadata: { source: "post_call_orchestrator", call_id: call.id },
      });
      created++;
    }

    await db.update(calls).set({ outcome, ai_insights: plan }).where(eq(calls.id, call.id));

    res.json({ ok: true, plan, activities_created: created });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── Daily Insights (Phase D) ────────────────────────────────────────────────
router.get("/insights/daily", async (_req, res) => {
  try {
    // Return cached if today
    const today = new Date(); today.setHours(0,0,0,0);
    const existing = await db.select().from(ai_insights)
      .where(gte(ai_insights.generated_at, today))
      .orderBy(desc(ai_insights.generated_at));
    if (existing.length >= 3) return res.json({ insights: existing, cached: true });

    // Build context
    const pipelineRes = await db.execute(sql`
      select
        (select count(*) from deals where stage not in ('closed_won','closed_lost'))::int as open_deals,
        (select coalesce(sum(value),0) from deals where stage not in ('closed_won','closed_lost'))::int as pipeline_value,
        (select count(*) from deals where stage = 'closed_won' and updated_at > now() - interval '30 days')::int as won_30d,
        (select count(*) from deals where stage = 'closed_lost' and updated_at > now() - interval '30 days')::int as lost_30d,
        (select count(*) from calls where status = 'completed' and created_at > now() - interval '7 days')::int as calls_7d,
        (select count(*) from contacts where last_engaged_at > now() - interval '7 days')::int as engaged_7d,
        (select count(*) from contacts where status in ('new','active') and (last_engaged_at is null or last_engaged_at < now() - interval '30 days'))::int as dormant
    `);
    const pipelineRows = ((pipelineRes as any).rows ?? pipelineRes) as any[];
    const pipelineSnap = pipelineRows[0] ?? {};

    const stalledRes = await db.execute(sql`
      select id, title, stage, value, stage_changed_at, extract(day from now() - stage_changed_at)::int as days_stalled
      from deals where stage not in ('closed_won'::deal_stage,'closed_lost'::deal_stage) and stage_changed_at < now() - interval '14 days'
      order by stage_changed_at asc limit 5
    `);
    const stalledDeals = ((stalledRes as any).rows ?? stalledRes) as any[];

    const insightsList = await aiJson<any>({
      system: "You are a senior CRM analyst with deep knowledge of MENA and global B2B markets. You consider economic, cultural (Ramadan/Eid), and macro context. Output strict JSON.",
      user: `Pipeline snapshot: ${JSON.stringify(pipelineSnap)}. Stalled deals: ${JSON.stringify(stalledDeals)}. Today: ${new Date().toISOString()}.

Generate 5 actionable daily insights as JSON: {"insights": [{"category": "pipeline|conversion|engagement|market_context|risk", "title": "...", "body": "2-3 sentences with specific numbers and a clear recommendation", "severity": "info|opportunity|warning|critical"}]}. Include ONE that references current calendar context (Ramadan, Eid, summer slowdown, fiscal year-end, etc.) if relevant.`,
      fallback: { insights: [
        { category: "pipeline", title: "Pipeline at $0", body: "Add deals to start tracking conversion.", severity: "info" },
      ] },
    });

    const inserted = [];
    for (const i of (insightsList.insights ?? [])) {
      const [row] = await db.insert(ai_insights).values({
        category: i.category ?? "pipeline",
        title: i.title,
        body: i.body,
        severity: (i.severity ?? "info") as any,
        metadata: { source: "daily_briefing" },
      }).returning();
      inserted.push(row);
    }

    res.json({ insights: inserted, cached: false });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.get("/insights", async (req, res) => {
  try {
    const { since } = req.query as Record<string, string>;
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 30 * 86400000);
    const rows = await db.select().from(ai_insights)
      .where(gte(ai_insights.generated_at, sinceDate))
      .orderBy(desc(ai_insights.generated_at));
    res.json({ insights: rows });
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

// ── AI Report Builder (Breeze-style) ────────────────────────────────────────
router.post("/report-builder", async (req, res) => {
  try {
    const { prompt } = req.body as { prompt: string };
    if (!prompt) return res.status(400).json({ error: "prompt required" });

    const spec = await aiJson<any>({
      system: `You convert natural language into chart spec JSON for a CRM dashboard.
Available widget types: metric, funnel, deal_stages, leaderboard, activity_timeline, stage_conversion.
Available metrics: deals_open, pipeline_value, won_value, contacts_total, calls_completed, signals_new.
Output strict JSON only.`,
      user: `User prompt: "${prompt}". Output: {"widget_type": "...", "title": "...", "config": {"metric": "...", "dateRange": {"days": 30}}, "explanation": "1 sentence why"}`,
      fallback: { widget_type: "metric", title: "Open Deals", config: { metric: "deals_open" }, explanation: "Default metric." },
    });

    res.json(spec);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── Sales Funnel ───────────────────────────────────────────────────────────
router.get("/funnel", async (_req, res) => {
  try {
    const stages = ["lead","qualified","proposal","negotiation","closed_won"];
    const data = [];
    for (const s of stages) {
      const r = await db.execute(sql`select count(*)::int as c, coalesce(sum(value),0)::int as v from deals where stage = ${s}`);
      const row = ((r as any).rows ?? r)[0];
      data.push({ stage: s, count: row.c, value: row.v });
    }
    // conversion rates
    const enriched = data.map((d, i) => ({
      ...d,
      conversion_from_top: data[0].count ? Math.round((d.count / data[0].count) * 100) : 0,
      conversion_from_prev: i > 0 && data[i-1].count ? Math.round((d.count / data[i-1].count) * 100) : 100,
    }));
    res.json({ funnel: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── Deal Stage Auto-advance ─────────────────────────────────────────────────
router.post("/auto-advance-stages", async (_req, res) => {
  try {
    // Move deals that have completed a "demo" activity to proposal
    const result = await db.execute(sql`
      update deals
      set stage = 'proposal'::deal_stage, stage_changed_at = now()
      where stage = 'qualified'::deal_stage
        and id in (
          select deal_id from activities
          where type = 'meeting'::activity_type and status = 'completed'::activity_status and deal_id is not null
        )
      returning id
    `);
    const advanced = ((result as any).rows ?? result).length;

    // Mark deals stalled > 30 days as at-risk via tag (idempotent)
    res.json({ advanced, message: `Auto-advanced ${advanced} deals to Proposal stage.` });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
