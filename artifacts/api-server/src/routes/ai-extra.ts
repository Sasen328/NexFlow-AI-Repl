import { Router } from "express";
import { db } from "@workspace/db";
import {
  contacts, companies, deals, calls, activities, signals, ai_insights,
  campaigns, automation_rules,
} from "@workspace/db";
import { eq, desc, sql, and, gte, isNotNull } from "drizzle-orm";
import { aiChat, aiJson } from "../lib/ai.js";

const router = Router();

// Block obviously dangerous fragments inside AI/user-generated SQL filter clauses.
function isSafeFilter(s: string): boolean {
  if (!s || typeof s !== "string") return false;
  if (s.length > 2000) return false;
  if (s.includes(";") || s.includes("--") || s.includes("/*") || s.includes("*/")) return false;
  const banned = /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy|vacuum|attach|pg_|do\s+\$\$|begin|commit|rollback|union\s+all|union\s+select|into\s+outfile|into\s+dumpfile)\b/i;
  if (banned.test(s)) return false;
  return true;
}

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

// ── Insights: regenerate today (clears cache for today and re-runs) ──────────
router.post("/insights/regenerate", async (_req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    await db.delete(ai_insights).where(gte(ai_insights.generated_at, today));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── Insights: 14-day trend by category ──────────────────────────────────────
router.get("/insights/trend", async (_req, res) => {
  try {
    const r = await db.execute(sql`
      select date_trunc('day', generated_at)::date as day,
        category,
        count(*)::int as count
      from ai_insights
      where generated_at > now() - interval '14 days'
      group by 1, 2 order by 1
    `);
    res.json({ trend: (r as any).rows ?? r });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── AI Dashboard Builder: build full dashboard (name + widgets) from prompt ─
router.post("/dashboard-builder", async (req, res) => {
  try {
    const { prompt } = req.body as { prompt: string };
    if (!prompt) return res.status(400).json({ error: "prompt required" });
    const { aiJson } = await import("../lib/ai.js");
    const spec = await aiJson<any>({
      system: `You design CRM dashboards. Output strict JSON.
Available widget types: metric, funnel, deal_stages, leaderboard, activity_timeline, stage_conversion, time_series.
Available metrics: deals_open, pipeline_value, won_value, contacts_total, calls_completed, signals_new.
Time-series metrics: deals_won, calls_completed, contacts_added.`,
      user: `User prompt: "${prompt}". Design a dashboard with 4 to 6 complementary widgets that tell a coherent story.
Output: { "name": "...", "description": "1 sentence", "widgets": [{ "type": "...", "title": "...", "config": { ... }, "width": "sm|md|lg|full" }] }`,
    }).catch(() => ({
      name: "Pipeline Pulse",
      description: "Auto-generated default dashboard.",
      widgets: [
        { type: "metric", title: "Open Deals", config: { metric: "deals_open" }, width: "sm" },
        { type: "metric", title: "Pipeline Value", config: { metric: "pipeline_value", format: "currency" }, width: "sm" },
        { type: "funnel", title: "Pipeline Funnel", config: {}, width: "lg" },
        { type: "leaderboard", title: "Top Reps", config: {}, width: "md" },
      ],
    }));
    res.json(spec);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── AI: summarize a dashboard's current state ───────────────────────────────
router.post("/dashboard-summary", async (req, res) => {
  try {
    const { widgets } = req.body as { widgets: any[] };
    const { aiJson } = await import("../lib/ai.js");
    const summary = await aiJson<any>({
      system: "You are a sales operations analyst. Output strict JSON.",
      user: `Here are dashboard widget snapshots: ${JSON.stringify(widgets).slice(0, 4000)}.
Return: { "headline": "1 sentence top-line takeaway", "callouts": [{ "text": "...", "tone": "good|neutral|warn" }] } (3 callouts max)`,
    }).catch(() => ({
      headline: "Dashboard data captured — refresh widgets for a fresh AI read.",
      callouts: [],
    }));
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
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

// ── Funnel: deals in a specific stage with time-in-stage ───────────────────
router.get("/funnel/stage/:stage", async (req, res) => {
  try {
    const stage = req.params.stage;
    const r = await db.execute(sql`
      select
        d.id, d.title as name, d.value, d.stage, d.stage_changed_at, d.created_at,
        d.contact_id,
        c.first_name || ' ' || c.last_name as contact_name,
        co.name as company_name,
        u.name as owner_name,
        extract(day from now() - coalesce(d.stage_changed_at, d.created_at))::int as days_in_stage
      from deals d
      left join contacts c on c.id = d.contact_id
      left join companies co on co.id = d.company_id
      left join users u on u.id = d.owner_id
      where d.stage = ${stage}::deal_stage
      order by d.value desc nulls last
      limit 100
    `);
    const rows = (r as any).rows ?? r;
    const stuck = rows.filter((d: any) => (d.days_in_stage ?? 0) > 30);
    const totalValue = rows.reduce((s: number, d: any) => s + (Number(d.value) || 0), 0);
    res.json({ stage, deals: rows, stuck_count: stuck.length, total_value: totalValue, count: rows.length });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── Funnel: AI explains why deals stall in a stage ─────────────────────────
router.get("/funnel/stage/:stage/insights", async (req, res) => {
  try {
    const stage = req.params.stage;
    const r = await db.execute(sql`
      select count(*)::int as total,
        avg(extract(day from now() - coalesce(stage_changed_at, created_at)))::int as avg_days,
        sum(case when extract(day from now() - coalesce(stage_changed_at, created_at)) > 30 then 1 else 0 end)::int as stuck,
        coalesce(sum(value),0)::int as total_value
      from deals where stage = ${stage}::deal_stage
    `);
    const stats = ((r as any).rows ?? r)[0] ?? {};
    const { aiJson } = await import("../lib/ai.js");
    const result = await aiJson({
      system: "You are a sales operations analyst. Output strict JSON.",
      user: `Stage "${stage}" has ${stats.total ?? 0} deals worth $${stats.total_value ?? 0}, average ${stats.avg_days ?? 0} days in stage, ${stats.stuck ?? 0} stuck >30 days. Diagnose likely root causes and prescribe 3 next-best actions.

Return JSON: { "diagnosis": string (2 sentences), "actions": [{ "title": string, "why": string }] }`,
    }).catch(() => ({
      diagnosis: `${stats.stuck ?? 0} of ${stats.total ?? 0} deals at this stage have aged past 30 days.`,
      actions: [
        { title: "Schedule re-engagement call", why: "Reset expectations and surface blockers." },
        { title: "Trigger AI post-call orchestrator", why: "Generate next-best actions automatically." },
        { title: "Move stalled deals to nurture campaign", why: "Free up rep capacity." },
      ],
    }));
    res.json({ stage, stats, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── Funnel: deals stuck across the whole pipeline ──────────────────────────
router.get("/funnel/stuck", async (_req, res) => {
  try {
    const r = await db.execute(sql`
      select
        d.id, d.title as name, d.value, d.stage,
        extract(day from now() - coalesce(d.stage_changed_at, d.created_at))::int as days_in_stage,
        co.name as company_name,
        u.name as owner_name
      from deals d
      left join companies co on co.id = d.company_id
      left join users u on u.id = d.owner_id
      where d.stage not in ('closed_won'::deal_stage, 'closed_lost'::deal_stage)
        and extract(day from now() - coalesce(d.stage_changed_at, d.created_at)) > 30
      order by days_in_stage desc
      limit 25
    `);
    res.json({ stuck: (r as any).rows ?? r });
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

// ── AI Agent: Improve a system prompt ──────────────────────────────────────
router.post("/agents/improve-prompt", async (req, res) => {
  try {
    const { name = "", description = "", system_prompt = "" } = req.body ?? {};
    const { aiChat } = await import("../lib/ai.js");
    const improved = await aiChat({
      system: "You are a senior prompt engineer. Rewrite system prompts so they are crisp, role-anchored, list constraints, define output format, and forbid hallucination. Return ONLY the improved prompt — no preamble, no explanation, no markdown fences.",
      user: `Agent name: ${name}\nDescription: ${description}\n\nCurrent system prompt:\n${system_prompt || "(empty — write one from scratch based on the description)"}`,
      maxTokens: 600,
    }).catch(() => null);
    res.json({ improved: (improved || system_prompt).trim() });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── AI: Generate a list from a natural-language prompt ─────────────────────
router.post("/lists/generate", async (req, res) => {
  try {
    const { prompt = "", name = "" } = req.body ?? {};
    if (!prompt.trim()) return res.status(400).json({ error: "prompt required" });
    const { aiJson } = await import("../lib/ai.js");
    const { db, contacts, static_lists, static_list_members } = await import("@workspace/db");
    const { eq, sql, desc } = await import("drizzle-orm");

    const allContacts = await db.select({
      id: contacts.id, first_name: contacts.first_name, last_name: contacts.last_name,
      title: contacts.title, status: contacts.status, lead_score: contacts.lead_score,
      tags: contacts.tags, source: contacts.source,
    }).from(contacts).orderBy(desc(contacts.lead_score)).limit(200);

    const result = await aiJson<{ list_name: string; description: string; contact_ids: string[] }>({
      system: "You are a CRM list-builder. Pick the contacts that match the user's criteria. Return JSON: {list_name: string, description: string, contact_ids: string[]}. Keep contact_ids strictly to provided ids. Pick at most 50.",
      user: `Criteria: ${prompt}\n\nContacts JSON:\n${JSON.stringify(allContacts.slice(0, 150))}`,
      maxTokens: 1500,
    }).catch(() => null);

    const ids = (result?.contact_ids ?? []).filter((id: string) =>
      allContacts.some(c => c.id === id)
    );
    if (ids.length === 0) {
      return res.json({ created: false, message: "AI couldn't match contacts. Try a more specific prompt.", suggestion: result?.description });
    }

    const listName = name.trim() || result?.list_name || "AI-Generated List";
    const [list] = await db.insert(static_lists).values({
      name: listName,
      description: result?.description ?? `AI-generated from: ${prompt}`,
      object_type: "contact" as any,
      member_count: ids.length,
    }).returning();

    await db.insert(static_list_members).values(
      ids.map(id => ({ list_id: list.id, entity_id: id }))
    );

    res.json({ created: true, list, member_count: ids.length, contact_ids: ids });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── AI: Suggest custom property definitions ────────────────────────────────
router.post("/properties/suggest", async (req, res) => {
  try {
    const { prompt = "", object_type = "contact" } = req.body ?? {};
    if (!prompt.trim()) return res.status(400).json({ error: "prompt required" });
    const { aiJson } = await import("../lib/ai.js");

    const result = await aiJson<{ properties: Array<{ name: string; label: string; type: string; description: string; options?: string[] }> }>({
      system: `You are a CRM data architect. Suggest 2-5 custom property fields for ${object_type} records. Return JSON: {properties:[{name:string (snake_case), label:string (Human Title Case), type: "text"|"number"|"date"|"select"|"boolean"|"url"|"email", description:string, options?:string[]}]}. For 'select' type, include options.`,
      user: prompt,
      maxTokens: 800,
    }).catch(() => null);

    res.json({ properties: result?.properties ?? [] });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── AI: Generate a segment definition from prompt ──────────────────────────
router.post("/segments/generate", async (req, res) => {
  try {
    const { prompt = "" } = req.body ?? {};
    if (!prompt.trim()) return res.status(400).json({ error: "prompt required" });
    const { aiJson } = await import("../lib/ai.js");
    const { db, segments, contacts } = await import("@workspace/db");
    const { sql } = await import("drizzle-orm");

    const result = await aiJson<{ name: string; description: string; sql_where: string; reasoning: string }>({
      system: `You are a SQL-savvy CRM analyst. Translate the user's NL criteria into a Postgres WHERE clause against the 'contacts' table. Available columns: first_name, last_name, email, title, status (enum: new|active|qualified|unqualified|customer), lead_score (0-100 float), tags (text[]), source (text), last_engaged_at (timestamp), created_at (timestamp), company_id (uuid). Use ILIKE for text matches, ANY() for tag matches. Return JSON: {name:string, description:string, sql_where:string (without WHERE keyword), reasoning:string}. Keep it valid Postgres syntax. NEVER include semicolons, comments, or other statements.`,
      user: prompt,
      maxTokens: 600,
    }).catch(() => null);

    if (!result?.sql_where) {
      return res.status(400).json({ error: "AI couldn't translate that criteria. Try rephrasing." });
    }
    if (!isSafeFilter(result.sql_where)) {
      return res.status(400).json({ error: "Generated filter rejected by safety check.", sql: result.sql_where });
    }

    // Validate by running a count query — abort if it errors
    let count = 0;
    try {
      const r: any = await db.execute(sql.raw(`select count(*)::int as c from contacts where (${result.sql_where})`));
      count = (r.rows ?? r)[0]?.c ?? 0;
    } catch {
      return res.status(400).json({ error: "AI generated invalid SQL — try rephrasing", sql: result.sql_where });
    }

    const [segment] = await db.insert(segments).values({
      name: result.name,
      description: result.description,
      filter_query: result.sql_where,
      contact_count: count,
    }).returning();

    res.json({ segment, count, reasoning: result.reasoning });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── AI: Get contacts in a segment ──────────────────────────────────────────
router.get("/segments/:id/members", async (req, res) => {
  try {
    const { db, segments } = await import("@workspace/db");
    const { eq, sql } = await import("drizzle-orm");
    const [seg] = await db.select().from(segments).where(eq(segments.id, req.params.id));
    if (!seg) return res.status(404).json({ error: "segment not found" });
    if (!seg.filter_query) return res.json({ segment: seg, members: [] });
    if (!isSafeFilter(seg.filter_query)) {
      return res.status(400).json({ error: "Stored segment filter failed safety check." });
    }
    const r: any = await db.execute(sql.raw(
      `select id, first_name, last_name, email, title, status, lead_score, source, last_engaged_at from contacts where (${seg.filter_query}) order by lead_score desc nulls last limit 100`
    ));
    res.json({ segment: seg, members: r.rows ?? r });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── AI: Draft a company from name + optional domain ────────────────────────
router.post("/companies/draft", async (req, res) => {
  try {
    const { name = "", domain = "", website = "" } = req.body ?? {};
    if (!name.trim()) return res.status(400).json({ error: "name required" });
    const { aiJson } = await import("../lib/ai.js");
    const result = await aiJson<{
      industry: string; size: string; description: string; hq_location: string;
      annual_revenue: string; technologies: string[]; pain_points: string[];
    }>({
      system: "You are a B2B research analyst. Given a company name (and optional domain), return your best educated guess as JSON: {industry, size (one of '1-10','11-50','51-200','201-500','501-1000','1000+'), description (1-2 sentences), hq_location, annual_revenue (e.g. '$10M-$50M'), technologies:string[], pain_points:string[]}. If unknown, infer plausibly. Return strict JSON only.",
      user: `Company: ${name}${domain ? `\nDomain: ${domain}` : ""}${website ? `\nWebsite: ${website}` : ""}`,
      maxTokens: 500,
    }).catch(() => null);
    res.json({ draft: result ?? {} });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── AI: CSV import — normalize, score, insert contacts ─────────────────────
router.post("/contacts/import-csv", async (req, res) => {
  try {
    const { rows = [], default_source = "csv-import" } = req.body ?? {};
    if (!Array.isArray(rows) || rows.length === 0) return res.status(400).json({ error: "rows[] required" });
    if (rows.length > 200) return res.status(400).json({ error: "max 200 rows per import" });

    const { aiJson } = await import("../lib/ai.js");
    const { db, contacts } = await import("@workspace/db");

    // Have AI normalize fuzzy column names + infer lead score
    const normalized = await aiJson<{ contacts: Array<{
      first_name: string; last_name: string; email?: string; phone?: string;
      title?: string; lead_score?: number; tags?: string[]; notes?: string;
    }> }>({
      system: "You are a data-cleaning agent. The user pasted CSV-like rows with various column names. Normalize each row to: {first_name, last_name, email, phone, title, lead_score (0-100 based on title seniority and completeness — VPs/Directors/CXOs score 70-95, managers 50-70, ICs 30-50, no title/email 10-25), tags:string[] (extracted hints like 'enterprise', 'finance' if obvious from data), notes (a 1-line enrichment summary)}. Skip rows missing both name and email. Return {contacts:[...]}.",
      user: `Rows (JSON):\n${JSON.stringify(rows.slice(0, 200))}`,
      maxTokens: 4000,
    }).catch(() => null);

    const cleaned = (normalized?.contacts ?? []).filter(c => (c.first_name || c.last_name) || c.email);
    if (cleaned.length === 0) return res.json({ inserted: 0, contacts: [] });

    const inserted = await db.insert(contacts).values(
      cleaned.map(c => ({
        first_name: (c.first_name || "").trim() || (c.email?.split("@")[0] ?? "Unknown"),
        last_name: (c.last_name || "").trim() || "",
        email: c.email || null,
        phone: c.phone || null,
        title: c.title || null,
        lead_score: typeof c.lead_score === "number" ? Math.max(0, Math.min(100, c.lead_score)) : 25,
        tags: c.tags && c.tags.length ? c.tags : null,
        notes: c.notes || null,
        source: default_source,
        status: "new" as any,
      }))
    ).returning();

    res.json({ inserted: inserted.length, contacts: inserted });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── AI: Analyze a call — generate transcript + objections + coaching ───────
router.post("/calls/:id/analyze", async (req, res) => {
  try {
    const { db, calls, contacts, companies } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const [call] = await db.select().from(calls).where(eq(calls.id, req.params.id));
    if (!call) return res.status(404).json({ error: "call not found" });

    let contact: any = null, company: any = null;
    if (call.contact_id) {
      [contact] = await db.select().from(contacts).where(eq(contacts.id, call.contact_id));
      if (contact?.company_id) {
        [company] = await db.select().from(companies).where(eq(companies.id, contact.company_id));
      }
    }

    const { aiJson } = await import("../lib/ai.js");
    const ctx = `Call direction: ${call.direction}\nDuration: ${call.duration_seconds}s\nOutcome: ${call.outcome ?? "n/a"}\nSentiment: ${call.sentiment_score ?? "n/a"}\nContact: ${contact ? `${contact.first_name} ${contact.last_name}, ${contact.title ?? ""}` : "Unknown"}\nCompany: ${company?.name ?? "Unknown"}, industry: ${company?.industry ?? "Unknown"}`;

    const result = await aiJson<{
      transcript_summary: string; key_topics: string[]; objections: Array<{ objection: string; response_suggestion: string }>;
      next_steps: string[]; coaching_notes: string; talk_ratio_estimate: { rep: number; prospect: number };
      win_probability_change: number;
    }>({
      system: "You are an elite sales-enablement coach. Synthesize a realistic post-call analysis from the metadata. Return JSON: {transcript_summary (3-4 sentence narrative recap), key_topics:string[] (3-5 topics), objections:[{objection, response_suggestion}], next_steps:string[] (2-3 concrete steps), coaching_notes (1 paragraph of constructive feedback), talk_ratio_estimate:{rep:number 0-100, prospect:number 0-100, sums to 100}, win_probability_change:number (-20 to +20)}. Be specific to the contact and industry.",
      user: ctx,
      maxTokens: 1500,
    }).catch(() => null);

    if (!result) return res.status(500).json({ error: "AI analysis failed" });

    const ai_insights = {
      transcript_summary: result.transcript_summary,
      key_topics: result.key_topics,
      objections: result.objections,
      next_steps: result.next_steps,
      talk_ratio: result.talk_ratio_estimate,
      win_probability_change: result.win_probability_change,
      generated_at: new Date().toISOString(),
    };

    const [updated] = await db.update(calls).set({
      coaching_notes: result.coaching_notes,
      ai_insights: ai_insights as any,
      transcript: call.transcript ?? `[AI-synthesized recap]\n\n${result.transcript_summary}`,
    }).where(eq(calls.id, req.params.id)).returning();

    res.json({ call: updated, analysis: result });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── AI: Forgotten leads — high-score contacts with stale activity ──────────
router.get("/forgotten-leads", async (_req, res) => {
  try {
    const { db } = await import("@workspace/db");
    const { sql } = await import("drizzle-orm");
    const r: any = await db.execute(sql.raw(`
      select c.id, c.first_name, c.last_name, c.title, c.lead_score, c.status, c.last_engaged_at,
             co.name as company_name,
             extract(epoch from (now() - coalesce(c.last_engaged_at, c.created_at)))/86400 as days_silent,
             (select count(*)::int from activities a where a.contact_id = c.id and a.created_at > now() - interval '14 days') as recent_activity_count
      from contacts c
      left join companies co on co.id = c.company_id
      where c.lead_score >= 60
        and c.status not in ('customer', 'unqualified')
        and (c.last_engaged_at is null or c.last_engaged_at < now() - interval '14 days')
      order by c.lead_score desc nulls last, days_silent desc nulls last
      limit 12
    `));
    const rows = (r.rows ?? r).filter((x: any) => x.recent_activity_count === 0);

    let summary = "";
    if (rows.length > 0) {
      try {
        const { aiChat } = await import("../lib/ai.js");
        summary = await aiChat({
          system: "You are a sales-ops AI. In ONE sentence, summarize what's at risk if these forgotten leads aren't re-engaged this week. No preamble.",
          user: `Forgotten leads:\n${rows.slice(0, 8).map((l: any) => `- ${l.first_name} ${l.last_name} (${l.company_name ?? "?"}) — score ${Math.round(l.lead_score)}, silent ${Math.round(l.days_silent)} days`).join("\n")}`,
          maxTokens: 120,
        }).catch(() => "");
      } catch {}
    }
    res.json({ leads: rows, summary: summary.trim() });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── AI: Generate a default agent config from a single sentence ─────────────
router.post("/agents/draft", async (req, res) => {
  try {
    const { description = "" } = req.body ?? {};
    if (!description.trim()) return res.status(400).json({ error: "description required" });
    const { aiJson } = await import("../lib/ai.js");
    const result = await aiJson<{
      name: string; icon: string; system_prompt: string; trigger_type: string;
      schedule_cron?: string; tools: string[];
    }>({
      system: `You are an AI agent designer for a CRM. Given a 1-line description, return JSON: {name (3-4 words), icon (one of: Bot, Brain, Phone, Mail, Search, Zap, TrendingUp, Users, Target, Sparkles), system_prompt (a complete production prompt 4-8 sentences), trigger_type (one of "manual","scheduled","event"), schedule_cron (only if scheduled, like "0 9 * * 1-5"), tools:string[] (from: search_contacts, send_email, create_task, score_lead, draft_call_notes, summarize_pipeline)}.`,
      user: description,
      maxTokens: 800,
    }).catch(() => null);
    res.json({ draft: result ?? {} });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── Contact AI Overview / Recommendations ───────────────────────────────────
router.post("/contacts/:id/overview", async (req, res) => {
  try {
    const [c] = await db.select().from(contacts).where(eq(contacts.id, req.params.id));
    if (!c) return res.status(404).json({ error: "Not found" });

    const company = c.company_id ? (await db.select().from(companies).where(eq(companies.id, c.company_id)))[0] : null;
    const recentActivities = await db.select().from(activities).where(eq(activities.contact_id, c.id)).orderBy(desc(activities.created_at)).limit(5);
    const recentCalls = await db.select().from(calls).where(eq(calls.contact_id, c.id)).orderBy(desc(calls.created_at)).limit(3);
    const recentSignals = await db.select().from(signals).where(eq(signals.contact_id, c.id)).orderBy(desc(signals.created_at)).limit(5);
    const openDeals = await db.select().from(deals).where(and(eq(deals.contact_id, c.id), sql`stage not in ('closed_won','closed_lost')`));

    const ctx = {
      contact: { name: `${c.first_name} ${c.last_name}`, title: c.title, email: c.email, status: c.status, lead_score: c.lead_score, tags: c.tags, last_engaged_at: c.last_engaged_at },
      company: company ? { name: company.name, industry: company.industry, country: company.country, size: company.size } : null,
      activities: recentActivities.map(a => ({ type: a.type, title: a.title, status: a.status, at: a.created_at })),
      calls: recentCalls.map(cl => ({ outcome: cl.outcome, score: cl.score, summary: cl.summary })),
      signals: recentSignals.map(s => ({ type: s.type, title: s.title, score: s.score })),
      open_deals: openDeals.map(d => ({ title: d.title, stage: d.stage, value: d.value, probability: d.probability })),
    };

    const overview = await aiJson<any>({
      system: "You are a B2B sales intelligence analyst. Analyze a contact's profile, engagement history, and pipeline. Output strict JSON only.",
      user: `Analyze this contact and produce JSON: {"summary":"2-3 sentences about who they are and where the relationship stands","strengths":["3 short bullets"],"risks":["2-3 short bullets"],"recommendations":[{"action":"call|email|whatsapp|meeting|enrich|nurture","title":"short imperative","reasoning":"1 sentence","priority":"high|medium|low"}],"talking_points":["3 short conversational openers based on their context"],"engagement_score":0-100}.\n\nContext: ${JSON.stringify(ctx).slice(0, 4000)}`,
      fallback: {
        summary: `${c.first_name} ${c.last_name} is a ${c.title ?? "contact"}${company ? ` at ${company.name}` : ""}. Lead score ${c.lead_score ?? 0}.`,
        strengths: ["Active in CRM", "Has assigned owner", "Profile populated"],
        risks: ["Limited recent engagement", "Needs enrichment refresh"],
        recommendations: [
          { action: "call", title: "Reach out within 48h", reasoning: "Maintain warm relationship.", priority: "high" },
          { action: "enrich", title: "Re-enrich profile", reasoning: "Refresh data from sources.", priority: "medium" },
        ],
        talking_points: ["Reference recent industry news", "Ask about current quarter priorities", "Offer a tailored case study"],
        engagement_score: c.lead_score ?? 50,
      },
    });

    res.json(overview);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── AI Automation Rule Drafter ─────────────────────────────────────────────
router.post("/automations/draft", async (req, res) => {
  try {
    const { description = "" } = req.body ?? {};
    if (!description.trim()) return res.status(400).json({ error: "description required" });
    const draft = await aiJson<any>({
      system: `You design CRM automation rules. Output strict JSON only.
Allowed triggers: stage_change, activity_completed, signal_received, no_answer, form_submitted, score_threshold, schedule, campaign_open.
Allowed action types:
- create_task (fields: title, body, target: "all_open_deals")
- advance_stage (fields: from_stage, to_stage; stages: lead, qualified, proposal, negotiation, closed_won, closed_lost)
- log_note (fields: message)`,
      user: `User wants: "${description}". Output JSON: {"name":"3-6 words","description":"1 sentence","trigger":"<trigger>","actions":[{"type":"...","title":"...","body":"...","from_stage":"...","to_stage":"...","message":"...","target":"..."}]}`,
      fallback: {
        name: "Follow up on no-answer calls",
        description: "Auto-create a follow-up task whenever a call goes unanswered.",
        trigger: "no_answer",
        actions: [{ type: "create_task", target: "all_open_deals", title: "Retry call tomorrow", body: "Auto-generated follow-up from missed call." }],
      },
    });
    res.json({ draft });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
