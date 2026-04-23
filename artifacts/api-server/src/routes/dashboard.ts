import { Router } from "express";
import { db } from "@workspace/db";
import { contacts, companies, deals, calls, signals, notifications, activities } from "@workspace/db";
import { eq, desc, gte, sql } from "drizzle-orm";

const router = Router();

router.get("/summary", async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalContacts] = await db.select({ count: sql<number>`count(*)::int` }).from(contacts);
    const [newContacts] = await db.select({ count: sql<number>`count(*)::int` }).from(contacts).where(gte(contacts.created_at, weekAgo));
    const [totalCompanies] = await db.select({ count: sql<number>`count(*)::int` }).from(companies);
    const [openDeals] = await db.select({ count: sql<number>`count(*)::int` }).from(deals)
      .where(sql`stage NOT IN ('closed_won', 'closed_lost')`);
    const [pipelineValue] = await db.select({ sum: sql<number>`coalesce(sum(value), 0)::int` }).from(deals)
      .where(sql`stage NOT IN ('closed_won', 'closed_lost')`);
    const [closedDeals] = await db.select({ count: sql<number>`count(*)::int` }).from(deals)
      .where(sql`stage = 'closed_won' AND created_at >= ${monthAgo}`);
    const [revenueMonth] = await db.select({ sum: sql<number>`coalesce(sum(value), 0)::int` }).from(deals)
      .where(sql`stage = 'closed_won' AND created_at >= ${monthAgo}`);
    const [callsToday] = await db.select({ count: sql<number>`count(*)::int` }).from(calls)
      .where(gte(calls.created_at, todayStart));
    const [activeSignals] = await db.select({ count: sql<number>`count(*)::int` }).from(signals)
      .where(sql`status IN ('new', 'viewed')`);
    const [unreadNotifs] = await db.select({ count: sql<number>`count(*)::int` }).from(notifications)
      .where(eq(notifications.read, false));
    const [wonDeals] = await db.select({ count: sql<number>`count(*)::int` }).from(deals)
      .where(sql`stage = 'closed_won'`);
    const [totalClosed] = await db.select({ count: sql<number>`count(*)::int` }).from(deals)
      .where(sql`stage IN ('closed_won', 'closed_lost')`);
    const [avgDeal] = await db.select({ avg: sql<number>`coalesce(avg(value), 0)::int` }).from(deals)
      .where(eq(deals.stage as any, "closed_won"));

    const winRate = totalClosed.count > 0 ? (wonDeals.count / totalClosed.count) * 100 : 0;

    res.json({
      total_contacts: totalContacts.count,
      new_contacts_this_week: newContacts.count,
      total_companies: totalCompanies.count,
      open_deals: openDeals.count,
      pipeline_value: pipelineValue.sum,
      deals_closed_this_month: closedDeals.count,
      revenue_this_month: revenueMonth.sum,
      calls_today: callsToday.count,
      active_signals: activeSignals.count,
      unread_notifications: unreadNotifs.count,
      win_rate: Math.round(winRate * 10) / 10,
      avg_deal_size: avgDeal.avg,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get dashboard summary" });
  }
});

router.get("/recent-activity", async (req, res) => {
  try {
    const { limit = "10" } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit), 50);

    const results = await db
      .select({
        id: activities.id,
        org_id: activities.org_id,
        contact_id: activities.contact_id,
        contact_name: sql<string>`coalesce(concat(contacts.first_name, ' ', contacts.last_name), '')`,
        deal_id: activities.deal_id,
        type: activities.type,
        title: activities.title,
        body: activities.body,
        status: activities.status,
        scheduled_at: activities.scheduled_at,
        completed_at: activities.completed_at,
        created_at: activities.created_at,
      })
      .from(activities)
      .leftJoin(contacts, eq(activities.contact_id, contacts.id))
      .orderBy(desc(activities.created_at))
      .limit(lim);

    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get recent activity" });
  }
});

router.get("/pipeline-by-stage", async (req, res) => {
  try {
    const results = await db
      .select({
        stage: deals.stage,
        count: sql<number>`count(*)::int`,
        total_value: sql<number>`coalesce(sum(value), 0)::int`,
      })
      .from(deals)
      .groupBy(deals.stage)
      .orderBy(deals.stage);
    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get pipeline by stage" });
  }
});

router.get("/signal-summary", async (req, res) => {
  try {
    const [total] = await db.select({ count: sql<number>`count(*)::int` }).from(signals);
    const [newCount] = await db.select({ count: sql<number>`count(*)::int` }).from(signals).where(eq(signals.status, "new"));

    const byType = await db
      .select({ type: signals.type, count: sql<number>`count(*)::int` })
      .from(signals)
      .groupBy(signals.type);

    const topSignals = await db
      .select({
        id: signals.id,
        org_id: signals.org_id,
        contact_id: signals.contact_id,
        contact_name: sql<string>`coalesce(concat(contacts.first_name, ' ', contacts.last_name), '')`,
        company_id: signals.company_id,
        company_name: companies.name,
        type: signals.type,
        title: signals.title,
        body: signals.body,
        score: signals.score,
        status: signals.status,
        source_url: signals.source_url,
        created_at: signals.created_at,
      })
      .from(signals)
      .leftJoin(contacts, eq(signals.contact_id, contacts.id))
      .leftJoin(companies, eq(signals.company_id, companies.id))
      .where(eq(signals.status, "new"))
      .orderBy(desc(signals.score))
      .limit(5);

    const byTypeMap: Record<string, number> = {};
    byType.forEach(r => { byTypeMap[r.type] = r.count; });

    res.json({
      total: total.count,
      new: newCount.count,
      by_type: byTypeMap,
      top_signals: topSignals,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get signal summary" });
  }
});

router.get("/top-contacts", async (req, res) => {
  try {
    const { limit = "5" } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit), 20);

    const results = await db
      .select({
        id: contacts.id,
        org_id: contacts.org_id,
        first_name: contacts.first_name,
        last_name: contacts.last_name,
        email: contacts.email,
        phone: contacts.phone,
        title: contacts.title,
        company_id: contacts.company_id,
        company_name: companies.name,
        lead_score: contacts.lead_score,
        status: contacts.status,
        avatar_url: contacts.avatar_url,
        linkedin_url: contacts.linkedin_url,
        notes: contacts.notes,
        tags: contacts.tags,
        created_at: contacts.created_at,
        updated_at: contacts.updated_at,
      })
      .from(contacts)
      .leftJoin(companies, eq(contacts.company_id, companies.id))
      .orderBy(desc(contacts.lead_score))
      .limit(lim);

    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get top contacts" });
  }
});

export default router;
