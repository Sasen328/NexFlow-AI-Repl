import { Router } from "express";
import { db } from "@workspace/db";
import { deals, calls } from "@workspace/db";
import { sql, desc, gte } from "drizzle-orm";

const router = Router();

router.get("/revenue-trend", async (req, res) => {
  try {
    const { period = "30d" } = req.query as Record<string, string>;
    const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const results = await db
      .select({
        date: sql<string>`date_trunc('day', created_at)::date::text`,
        value: sql<number>`coalesce(sum(value), 0)::int`,
      })
      .from(deals)
      .where(sql`stage = 'closed_won' AND created_at >= ${since}`)
      .groupBy(sql`date_trunc('day', created_at)`)
      .orderBy(sql`date_trunc('day', created_at)`);

    // Fill gaps with 0s
    const points = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      const found = results.find(r => r.date === dateStr);
      points.push({ date: dateStr, value: found?.value || 0 });
    }

    res.json(points);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get revenue trend" });
  }
});

router.get("/call-stats", async (req, res) => {
  try {
    const [stats] = await db.select({
      total_calls: sql<number>`count(*)::int`,
      avg_duration_seconds: sql<number>`coalesce(avg(duration_seconds), 0)::int`,
      avg_call_score: sql<number>`coalesce(avg(call_score), 0)`,
      avg_sentiment: sql<number>`coalesce(avg(sentiment_score), 0)`,
    }).from(calls);

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const byDay = await db
      .select({
        date: sql<string>`date_trunc('day', created_at)::date::text`,
        value: sql<number>`count(*)::int`,
      })
      .from(calls)
      .where(gte(calls.created_at, since))
      .groupBy(sql`date_trunc('day', created_at)`)
      .orderBy(sql`date_trunc('day', created_at)`);

    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      const found = byDay.find(r => r.date === dateStr);
      days.push({ date: dateStr, value: found?.value || 0 });
    }

    res.json({
      total_calls: stats.total_calls,
      avg_duration_seconds: stats.avg_duration_seconds,
      avg_call_score: Math.round(stats.avg_call_score * 10) / 10,
      avg_sentiment: Math.round(stats.avg_sentiment * 100) / 100,
      calls_by_day: days,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get call stats" });
  }
});

router.get("/forecast", async (req, res) => {
  try {
    const quarterStart = new Date();
    quarterStart.setMonth(Math.floor(quarterStart.getMonth() / 3) * 3, 1);
    quarterStart.setHours(0, 0, 0, 0);

    const [pipeline] = await db.select({
      likely: sql<number>`coalesce(sum(value * probability / 100), 0)::int`,
      best: sql<number>`coalesce(sum(value), 0)::int`,
    }).from(deals).where(sql`stage NOT IN ('closed_won', 'closed_lost')`);

    const [closed] = await db.select({
      won: sql<number>`coalesce(sum(value), 0)::int`,
    }).from(deals).where(sql`stage = 'closed_won' AND created_at >= ${quarterStart}`);

    const target = 500000000; // $5M
    const likely = (closed.won || 0) + (pipeline.likely || 0);
    const best = (closed.won || 0) + (pipeline.best || 0);
    const worst = closed.won || 0;
    const confidence = Math.min(100, Math.round((likely / target) * 100));

    // Monthly projections for next 6 months
    const monthly = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      monthly.push({
        date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`,
        value: Math.round(likely / 6 * (1 + i * 0.05)),
        label: d.toLocaleString("default", { month: "short" }),
      });
    }

    res.json({
      current_quarter_target: target,
      current_quarter_likely: likely,
      current_quarter_best_case: best,
      current_quarter_worst_case: worst,
      confidence,
      monthly_projections: monthly,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get forecast" });
  }
});

export default router;
