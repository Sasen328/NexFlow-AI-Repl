import { Router } from "express";
import { db } from "@workspace/db";
import { activities, contacts, deals } from "@workspace/db";
import { sql, eq } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const wonDeals = await db.select().from(deals).where(eq(deals.stage, "closed_won"));
    const totalRevenue = wonDeals.reduce((s, d) => s + (d.value ?? 0), 0);

    const channelRows = await db.execute(sql`
      SELECT
        COALESCE(c.utm_source, a.type::text, 'unknown') as channel,
        COUNT(DISTINCT a.contact_id)::int as touches,
        COUNT(DISTINCT a.id)::int as events
      FROM activities a
      LEFT JOIN contacts c ON c.id = a.contact_id
      WHERE a.type::text IN ('email','email_open','email_click','form_submit','web_visit','call','meeting','whatsapp')
      GROUP BY 1
      ORDER BY events DESC
      LIMIT 12
    `);

    const sourceRows = await db.execute(sql`
      SELECT
        COALESCE(c.utm_source, c.source, 'direct') as source,
        COUNT(DISTINCT c.id)::int as contacts,
        COUNT(DISTINCT d.id) FILTER (WHERE d.stage = 'closed_won')::int as won_deals,
        COALESCE(SUM(d.value) FILTER (WHERE d.stage = 'closed_won'), 0)::int as revenue
      FROM contacts c
      LEFT JOIN deals d ON d.contact_id = c.id
      GROUP BY 1
      ORDER BY revenue DESC NULLS LAST, contacts DESC
      LIMIT 12
    `);

    const channels = (channelRows.rows ?? channelRows) as any[];
    const sources = (sourceRows.rows ?? sourceRows) as any[];

    // Each model splits 100% of revenue across channels weighted differently:
    // - linear: equal weight per touch event
    // - first-touch: weight on earliest channel per contact (proxy: bias toward higher-volume top-of-funnel: email/web/whatsapp)
    // - last-touch: bias toward closing channels (call/meeting)
    const totalChannelEvents = channels.reduce((s, r) => s + Number(r.events ?? 0), 0) || 1;
    const FIRST_BIAS: Record<string, number> = { email: 1.6, whatsapp: 1.4, web: 1.5, call: 0.7, meeting: 0.5 };
    const LAST_BIAS:  Record<string, number> = { meeting: 1.8, call: 1.5, whatsapp: 1.0, email: 0.7, web: 0.6 };
    const weighted = (bias: Record<string, number>) => {
      const ws = channels.map((r) => Number(r.events ?? 0) * (bias[String(r.channel).toLowerCase()] ?? 1));
      const tot = ws.reduce((a, b) => a + b, 0) || 1;
      return ws.map((w) => w / tot);
    };
    const fw = weighted(FIRST_BIAS);
    const lw = weighted(LAST_BIAS);
    const channelsWithRevenue = channels.map((r, i) => ({
      channel: r.channel,
      touches: Number(r.touches ?? 0),
      events: Number(r.events ?? 0),
      first_touch_revenue: Math.round(totalRevenue * fw[i]),
      last_touch_revenue: Math.round(totalRevenue * lw[i]),
      linear_revenue: Math.round(totalRevenue * (Number(r.events ?? 0) / totalChannelEvents)),
    }));

    res.json({
      total_revenue: totalRevenue,
      won_deals: wonDeals.length,
      channels: channelsWithRevenue,
      sources: sources.map((s) => ({
        source: s.source,
        contacts: Number(s.contacts ?? 0),
        won_deals: Number(s.won_deals ?? 0),
        revenue: Number(s.revenue ?? 0),
      })),
    });
  } catch (err: any) {
    console.error("[attribution] failed:", err?.message ?? err);
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
