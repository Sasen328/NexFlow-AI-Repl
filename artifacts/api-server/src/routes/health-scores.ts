import { Router } from "express";
import { db } from "@workspace/db";
import { contacts, activities, deals } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

function computeScore(opts: {
  daysSinceEngagement: number | null;
  activityCount30d: number;
  meetingCount30d: number;
  hasOpenDeal: boolean;
  hasWonDeal: boolean;
  hasNegativeActivity: boolean;
}) {
  let score = 50;
  if (opts.daysSinceEngagement === null) score -= 25;
  else if (opts.daysSinceEngagement <= 7) score += 30;
  else if (opts.daysSinceEngagement <= 30) score += 15;
  else if (opts.daysSinceEngagement <= 60) score -= 5;
  else score -= 25;

  score += Math.min(20, opts.activityCount30d * 2);
  score += Math.min(15, opts.meetingCount30d * 5);
  if (opts.hasOpenDeal) score += 10;
  if (opts.hasWonDeal) score += 5;
  if (opts.hasNegativeActivity) score -= 15;

  return Math.max(0, Math.min(100, score));
}

function bucket(score: number) {
  if (score >= 75) return { label: "healthy", color: "#88B8B0" };
  if (score >= 50) return { label: "stable", color: "#B8B880" };
  if (score >= 25) return { label: "at risk", color: "#C8A880" };
  return { label: "critical", color: "#C0A0B8" };
}

router.get("/", async (_req, res) => {
  try {
    const rows = await db.execute(sql`
      SELECT
        c.id,
        c.first_name || ' ' || c.last_name as name,
        c.email,
        c.title,
        co.name as company,
        c.last_engaged_at,
        EXTRACT(EPOCH FROM (NOW() - c.last_engaged_at)) / 86400 as days_since_engaged,
        (SELECT COUNT(*) FROM activities WHERE contact_id = c.id AND completed_at > NOW() - INTERVAL '30 days')::int as activity_30d,
        (SELECT COUNT(*) FROM activities WHERE contact_id = c.id AND type = 'meeting' AND completed_at > NOW() - INTERVAL '30 days')::int as meetings_30d,
        EXISTS(SELECT 1 FROM deals WHERE contact_id = c.id AND stage NOT IN ('closed_won','closed_lost'))::int as has_open_deal,
        EXISTS(SELECT 1 FROM deals WHERE contact_id = c.id AND stage = 'closed_won')::int as has_won_deal
      FROM contacts c
      LEFT JOIN companies co ON co.id = c.company_id
      WHERE c.status IN ('active', 'qualified', 'customer')
      ORDER BY c.last_engaged_at DESC NULLS LAST
      LIMIT 50
    `);

    const items = ((rows.rows ?? rows) as any[]).map((r) => {
      const score = computeScore({
        daysSinceEngagement: r.days_since_engaged !== null ? Number(r.days_since_engaged) : null,
        activityCount30d: Number(r.activity_30d ?? 0),
        meetingCount30d: Number(r.meetings_30d ?? 0),
        hasOpenDeal: Boolean(r.has_open_deal),
        hasWonDeal: Boolean(r.has_won_deal),
        hasNegativeActivity: false,
      });
      return {
        contact_id: r.id,
        name: r.name,
        email: r.email,
        title: r.title,
        company: r.company,
        score,
        bucket: bucket(score),
        days_since_engaged: r.days_since_engaged !== null ? Math.round(Number(r.days_since_engaged)) : null,
        activity_30d: Number(r.activity_30d ?? 0),
        meetings_30d: Number(r.meetings_30d ?? 0),
        has_open_deal: Boolean(r.has_open_deal),
      };
    });

    const summary = {
      total: items.length,
      healthy: items.filter((i) => i.score >= 75).length,
      stable: items.filter((i) => i.score >= 50 && i.score < 75).length,
      at_risk: items.filter((i) => i.score >= 25 && i.score < 50).length,
      critical: items.filter((i) => i.score < 25).length,
      avg: items.length ? Math.round(items.reduce((s, i) => s + i.score, 0) / items.length) : 0,
    };

    res.json({ items, summary });
  } catch (err: any) {
    console.error("[health-scores] failed:", err?.message ?? err);
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
