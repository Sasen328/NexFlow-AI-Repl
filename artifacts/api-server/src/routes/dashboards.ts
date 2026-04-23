import { Router } from "express";
import { db } from "@workspace/db";
import { dashboards, dashboard_widgets, contacts, deals, companies, calls, activities, signals } from "@workspace/db";
import { eq, desc, sql, and, gte, count } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(dashboards).orderBy(desc(dashboards.updated_at));
    res.json({ dashboards: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [d] = await db.insert(dashboards).values({ ...req.body, org_id: "default" }).returning();
    res.status(201).json(d);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [d] = await db.select().from(dashboards).where(eq(dashboards.id, req.params.id));
    if (!d) return res.status(404).json({ error: "Not found" });
    const widgets = await db.select().from(dashboard_widgets).where(eq(dashboard_widgets.dashboard_id, req.params.id)).orderBy(dashboard_widgets.position);
    res.json({ ...d, widgets });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const [d] = await db.update(dashboards).set({ ...req.body, updated_at: new Date() }).where(eq(dashboards.id, req.params.id)).returning();
    res.json(d);
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(dashboards).where(eq(dashboards.id, req.params.id));
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

router.post("/:id/widgets", async (req, res) => {
  try {
    const [w] = await db.insert(dashboard_widgets).values({ ...req.body, dashboard_id: req.params.id }).returning();
    res.status(201).json(w);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.delete("/widgets/:widgetId", async (req, res) => {
  try {
    await db.delete(dashboard_widgets).where(eq(dashboard_widgets.id, req.params.widgetId));
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

// Live data for widgets — single endpoint that returns aggregated data based on widget config
router.post("/widget-data", async (req, res) => {
  try {
    const { type, config = {}, dateRange } = req.body as any;
    const sinceDays = parseInt(dateRange?.days ?? "30");
    const since = new Date(Date.now() - sinceDays * 86400000);

    if (type === "metric") {
      const metric = config.metric ?? "deals_open";
      let value = 0;
      if (metric === "deals_open") {
        const r = await db.select({ c: count() }).from(deals).where(sql`${deals.stage} not in ('closed_won','closed_lost')`);
        value = r[0]?.c ?? 0;
      } else if (metric === "pipeline_value") {
        const r = await db.select({ s: sql<number>`coalesce(sum(${deals.value}),0)::int` }).from(deals).where(sql`${deals.stage} not in ('closed_won','closed_lost')`);
        value = r[0]?.s ?? 0;
      } else if (metric === "won_value") {
        const r = await db.select({ s: sql<number>`coalesce(sum(${deals.value}),0)::int` }).from(deals).where(eq(deals.stage, "closed_won"));
        value = r[0]?.s ?? 0;
      } else if (metric === "contacts_total") {
        const r = await db.select({ c: count() }).from(contacts);
        value = r[0]?.c ?? 0;
      } else if (metric === "calls_completed") {
        const r = await db.select({ c: count() }).from(calls).where(and(eq(calls.status, "completed"), gte(calls.created_at, since)));
        value = r[0]?.c ?? 0;
      } else if (metric === "signals_new") {
        const r = await db.select({ c: count() }).from(signals).where(and(eq(signals.status, "new"), gte(signals.created_at, since)));
        value = r[0]?.c ?? 0;
      }
      return res.json({ value });
    }

    if (type === "funnel" || type === "deal_stages") {
      const stages = ["lead","qualified","proposal","negotiation","closed_won","closed_lost"];
      const data: { stage: string; count: number; value: number }[] = [];
      for (const s of stages) {
        const r = await db.select({ c: count(), v: sql<number>`coalesce(sum(${deals.value}),0)::int` }).from(deals).where(eq(deals.stage, s as any));
        data.push({ stage: s, count: r[0]?.c ?? 0, value: r[0]?.v ?? 0 });
      }
      return res.json({ data });
    }

    if (type === "leaderboard") {
      const r = await db.execute(sql`
        select u.id, u.name, u.avatar_url,
          (select count(*) from deals where owner_id = u.id and stage = 'closed_won')::int as won_deals,
          (select coalesce(sum(value),0) from deals where owner_id = u.id and stage = 'closed_won')::int as won_value,
          (select count(*) from calls where owner_id = u.id and status = 'completed' and created_at > ${since})::int as calls_completed
        from users u where u.active = true order by won_value desc nulls last limit 10
      `);
      return res.json({ data: (r as any).rows ?? r });
    }

    if (type === "activity_timeline") {
      const r = await db.execute(sql`
        select date_trunc('day', created_at)::date as day, type, count(*)::int as count
        from activities where created_at > ${since}
        group by 1, 2 order by 1
      `);
      return res.json({ data: (r as any).rows ?? r });
    }

    if (type === "stage_conversion") {
      const r = await db.execute(sql`
        select stage, count(*)::int as count from deals group by stage
      `);
      return res.json({ data: (r as any).rows ?? r });
    }

    res.json({ data: [] });
  } catch (err: any) {
    console.error("widget-data", err);
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
