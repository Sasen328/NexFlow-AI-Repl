import { Router } from "express";
import { db } from "@workspace/db";
import { automation_rules, automation_runs, deals, contacts, activities } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(automation_rules).orderBy(desc(automation_rules.created_at));
    res.json({ rules: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

// Allowed triggers in the schema enum. Anything else (e.g. "lead_routing"
// from the routing builder UI) is stored inside trigger_config so the rule
// row remains valid while preserving the client intent.
const TRIGGER_ENUM = new Set([
  "stage_change", "activity_completed", "signal_received", "no_answer",
  "form_submitted", "score_threshold", "schedule", "campaign_open",
]);
function normalizeTrigger(input: any): { trigger: any; trigger_config: any } {
  if (!input) return { trigger: "form_submitted", trigger_config: { kind: "lead_routing" } };
  if (typeof input === "string") {
    return TRIGGER_ENUM.has(input)
      ? { trigger: input, trigger_config: null }
      : { trigger: "form_submitted", trigger_config: { kind: input } };
  }
  // object form: { kind: "lead_routing", ... }
  const kind = (input as any).kind ?? (input as any).type;
  return TRIGGER_ENUM.has(kind)
    ? { trigger: kind, trigger_config: input }
    : { trigger: "form_submitted", trigger_config: input };
}
function normalizeBody(b: any) {
  const out: Record<string, unknown> = {};
  if (b.name !== undefined) out.name = String(b.name);
  if (b.description !== undefined) out.description = b.description;
  if (b.trigger !== undefined || b.trigger_config !== undefined) {
    const t = normalizeTrigger(b.trigger ?? b.trigger_config);
    out.trigger = t.trigger;
    out.trigger_config = b.trigger_config ?? t.trigger_config;
  }
  if (b.conditions !== undefined) out.conditions = b.conditions;
  if (b.actions !== undefined) out.actions = Array.isArray(b.actions) ? b.actions : [b.actions];
  if (b.enabled !== undefined) out.enabled = Boolean(b.enabled);
  if (b.is_active !== undefined && b.enabled === undefined) out.enabled = Boolean(b.is_active);
  return out;
}

router.post("/", async (req, res) => {
  try {
    const body = normalizeBody(req.body ?? {});
    if (!body.actions) body.actions = [];
    if (!body.trigger) {
      const t = normalizeTrigger(undefined);
      body.trigger = t.trigger;
      body.trigger_config = t.trigger_config;
    }
    const [r] = await db.insert(automation_rules).values({ ...(body as any), org_id: "default" }).returning();
    res.status(201).json(r);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const body = normalizeBody(req.body ?? {});
    const [r] = await db.update(automation_rules).set(body as any).where(eq(automation_rules.id, req.params.id)).returning();
    res.json(r);
  } catch (err: any) { res.status(500).json({ error: err?.message ?? "Failed" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(automation_rules).where(eq(automation_rules.id, req.params.id));
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

router.post("/:id/run", async (req, res) => {
  try {
    const [rule] = await db.select().from(automation_rules).where(eq(automation_rules.id, req.params.id));
    if (!rule) return res.status(404).json({ error: "Not found" });

    let affected = 0;
    const actions = (rule.actions as any[]) ?? [];
    const result: any = { actions: [], errors: [] };

    // Execute each action — currently supports a few primitives
    for (const a of actions) {
      try {
        if (a.type === "create_task") {
          const targets = a.target === "all_open_deals"
            ? await db.select().from(deals).where(sql`stage not in ('closed_won','closed_lost')`)
            : [];
          for (const d of targets) {
            await db.insert(activities).values({
              type: "task",
              title: a.title ?? "Automation: Follow up",
              body: a.body ?? rule.description ?? "",
              status: "pending",
              deal_id: d.id,
              contact_id: d.contact_id,
              scheduled_at: new Date(Date.now() + 24 * 3600 * 1000),
            });
            affected++;
          }
          result.actions.push({ type: "create_task", count: targets.length });
        } else if (a.type === "advance_stage") {
          const next = a.to_stage;
          const r = await db.update(deals).set({ stage: next, stage_changed_at: new Date() }).where(eq(deals.stage, a.from_stage)).returning();
          affected += r.length;
          result.actions.push({ type: "advance_stage", count: r.length });
        } else if (a.type === "log_note") {
          result.actions.push({ type: "log_note", message: a.message });
        }
      } catch (e: any) {
        result.errors.push({ action: a.type, error: e?.message });
      }
    }

    await db.update(automation_rules).set({
      run_count: (rule.run_count ?? 0) + 1,
      last_run_at: new Date(),
    }).where(eq(automation_rules.id, rule.id));

    await db.insert(automation_runs).values({
      rule_id: rule.id,
      status: "completed",
      result,
    });

    res.json({ ok: true, affected, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.get("/:id/runs", async (req, res) => {
  try {
    const rows = await db.select().from(automation_runs).where(eq(automation_runs.rule_id, req.params.id)).orderBy(desc(automation_runs.ran_at)).limit(50);
    res.json({ runs: rows });
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

export default router;
