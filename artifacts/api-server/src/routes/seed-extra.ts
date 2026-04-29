import { Router } from "express";
import { db } from "@workspace/db";
import {
  users, contacts, companies, deals,
  custom_properties, static_lists, static_list_members,
  dashboards, dashboard_widgets,
  automation_rules, campaigns, ai_agents, ai_insights,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.post("/seed-crm", async (_req, res) => {
  try {
    const created: Record<string, number> = {};

    // 1. Users
    const userSeed = [
      { name: "Sara Al-Mansouri", email: "sara@nexflow.ai", role: "AE", avatar_url: null, timezone: "Asia/Dubai" },
      { name: "Ahmed Khalid", email: "ahmed@nexflow.ai", role: "SDR", avatar_url: null, timezone: "Asia/Riyadh" },
      { name: "Layla Hassan", email: "layla@nexflow.ai", role: "VP Sales", avatar_url: null, timezone: "Africa/Cairo" },
      { name: "Omar Farouk", email: "omar@nexflow.ai", role: "AE", avatar_url: null, timezone: "Asia/Dubai" },
    ];
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      const u = await db.insert(users).values(userSeed.map(s => ({ ...s, org_id: "default" }))).returning();
      created.users = u.length;

      // Assign owners to existing contacts/companies/deals
      const allContacts = await db.select({ id: contacts.id }).from(contacts);
      for (let i = 0; i < allContacts.length; i++) {
        await db.update(contacts).set({ owner_id: u[i % u.length].id }).where(eq(contacts.id, allContacts[i].id));
      }
      const allCompanies = await db.select({ id: companies.id }).from(companies);
      for (let i = 0; i < allCompanies.length; i++) {
        await db.update(companies).set({ owner_id: u[i % u.length].id }).where(eq(companies.id, allCompanies[i].id));
      }
      const allDeals = await db.select({ id: deals.id }).from(deals);
      for (let i = 0; i < allDeals.length; i++) {
        await db.update(deals).set({ owner_id: u[i % u.length].id }).where(eq(deals.id, allDeals[i].id));
      }
    } else {
      created.users = 0;
    }
    const allUsers = await db.select().from(users);
    const firstUserId = allUsers[0]?.id ?? null;

    // 2. Custom properties
    const existingProps = await db.select().from(custom_properties);
    if (existingProps.length === 0) {
      const props = [
        { object_type: "contact" as const, name: "decision_authority", label: "Decision Authority", type: "select" as const, options: { values: ["Decision Maker", "Influencer", "User", "Champion"] } },
        { object_type: "contact" as const, name: "preferred_language", label: "Preferred Language", type: "select" as const, options: { values: ["English", "Arabic", "French", "Both"] } },
        { object_type: "contact" as const, name: "annual_budget", label: "Annual Budget (USD)", type: "number" as const },
        { object_type: "company" as const, name: "current_crm", label: "Current CRM", type: "select" as const, options: { values: ["Salesforce", "HubSpot", "Pipedrive", "Zoho", "None", "Other"] } },
        { object_type: "company" as const, name: "renewal_month", label: "Contract Renewal Month", type: "date" as const },
        { object_type: "deal" as const, name: "competitor", label: "Main Competitor", type: "text" as const },
        { object_type: "deal" as const, name: "champion_engaged", label: "Champion Engaged", type: "boolean" as const },
      ];
      await db.insert(custom_properties).values(props.map((p, i) => ({ ...p, org_id: "default", display_order: i })));
      created.custom_properties = props.length;
    }

    // 3. Static lists
    const existingLists = await db.select().from(static_lists);
    if (existingLists.length === 0) {
      const lists = await db.insert(static_lists).values([
        { name: "Hot MENA Decision Makers", description: "C-level prospects in MENA with active signals", color: "#B8A0C8", owner_id: firstUserId },
        { name: "Q2 Re-engagement", description: "Dormant leads to re-engage this quarter", color: "#88B8B0", owner_id: firstUserId },
        { name: "Enterprise Pipeline", description: "Deals over $100K", color: "#C8A880", owner_id: firstUserId },
        { name: "Ramadan Pause List", description: "Contacts to slow outreach during Ramadan", color: "#90B8B8", owner_id: firstUserId },
      ].map(l => ({ ...l, org_id: "default", object_type: "contact" as const }))).returning();
      // Add some members
      const someContacts = await db.select({ id: contacts.id }).from(contacts).limit(5);
      for (const list of lists) {
        for (const c of someContacts) {
          await db.insert(static_list_members).values({ list_id: list.id, entity_id: c.id }).onConflictDoNothing();
        }
      }
      created.static_lists = lists.length;
    }

    // 4. Default dashboard
    const existingDashboards = await db.select().from(dashboards);
    if (existingDashboards.length === 0) {
      const [dash] = await db.insert(dashboards).values({
        name: "Sales Command Center",
        description: "Default executive dashboard",
        owner_id: firstUserId,
        is_shared: true,
        org_id: "default",
      }).returning();
      const widgets = [
        { type: "metric", title: "Open Deals", config: { metric: "deals_open" }, position: 0, width: "sm" },
        { type: "metric", title: "Pipeline Value", config: { metric: "pipeline_value", format: "currency" }, position: 1, width: "sm" },
        { type: "metric", title: "Won This Month", config: { metric: "won_value", format: "currency" }, position: 2, width: "sm" },
        { type: "metric", title: "Calls (7d)", config: { metric: "calls_completed" }, position: 3, width: "sm" },
        { type: "funnel", title: "Sales Funnel", config: {}, position: 4, width: "lg" },
        { type: "leaderboard", title: "Top Reps", config: {}, position: 5, width: "md" },
      ];
      await db.insert(dashboard_widgets).values(widgets.map(w => ({ ...w, dashboard_id: dash.id })));
      created.dashboards = 1;
    }

    // 5. Sample automations
    const existingAuto = await db.select().from(automation_rules);
    if (existingAuto.length === 0) {
      await db.insert(automation_rules).values([
        {
          name: "Demo Completed → Proposal",
          description: "When a meeting is completed for a qualified deal, advance to Proposal",
          trigger: "activity_completed",
          trigger_config: { activity_type: "meeting" },
          actions: [{ type: "advance_stage", from_stage: "qualified", to_stage: "proposal" }],
          enabled: true,
          owner_id: firstUserId,
          org_id: "default",
        },
        {
          name: "No Answer → WhatsApp + Retry",
          description: "After 2 unanswered calls, send WhatsApp and schedule retry",
          trigger: "no_answer",
          trigger_config: { threshold: 2 },
          actions: [
            { type: "log_note", message: "Trigger WhatsApp template + create retry task." },
          ],
          enabled: true,
          owner_id: firstUserId,
          org_id: "default",
        },
        {
          name: "Stalled Deal Alert",
          description: "Create task for any deal stuck in stage > 14 days",
          trigger: "schedule",
          trigger_config: { cron: "0 9 * * *" },
          actions: [{ type: "create_task", target: "all_open_deals", title: "Review stalled deal", body: "This deal has not progressed — review next steps." }],
          enabled: true,
          owner_id: firstUserId,
          org_id: "default",
        },
      ]);
      created.automation_rules = 3;
    }

    // 6. Sample campaigns
    const existingCampaigns = await db.select().from(campaigns);
    if (existingCampaigns.length === 0) {
      await db.insert(campaigns).values([
        { name: "Q2 Dormant Re-engagement", channel: "email", status: "draft", utm_source: "newsletter", utm_medium: "email", utm_campaign: "q2_reengage", owner_id: firstUserId, org_id: "default" },
        { name: "MENA Enterprise Webinar", channel: "email", status: "draft", utm_source: "webinar", utm_medium: "email", utm_campaign: "mena_webinar_q2", owner_id: firstUserId, org_id: "default" },
        { name: "WhatsApp Cold Outreach", channel: "whatsapp", status: "draft", owner_id: firstUserId, org_id: "default" },
      ]);
      created.campaigns = 3;
    }

    // 7. Custom AI agents
    const existingAgents = await db.select().from(ai_agents);
    if (existingAgents.length === 0) {
      await db.insert(ai_agents).values([
        {
          name: "Pipeline Pulse",
          description: "Daily 60-second briefing on pipeline movement",
          icon: "Activity",
          system_prompt: "You are Pipeline Pulse — a daily briefer who summarizes CRM pipeline activity in under 60 seconds. Focus on movement, risk, and the single most important action.",
          enabled: true,
          org_id: "default",
        },
        {
          name: "Objection Crusher",
          description: "Generates Arabic + English objection responses on demand",
          icon: "Shield",
          system_prompt: "You handle sales objections in both English and Arabic. For any objection, return: 1) acknowledgement, 2) reframe, 3) proof point, 4) next step.",
          enabled: true,
          org_id: "default",
        },
        {
          name: "Deal Risk Scout",
          description: "Surfaces deals at risk of slipping",
          icon: "AlertTriangle",
          system_prompt: "You analyze deal pipelines and identify at-risk deals using stage age, engagement decay, and missing stakeholders. Output is always a ranked list with reasoning.",
          enabled: true,
          org_id: "default",
        },
      ]);
      created.ai_agents = 3;
    }

    res.json({ ok: true, created });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// DB Status + Force Reseed
router.get("/status", async (_req, res) => {
  try {
    const tables = [
      { name: "contacts", table: contacts },
      { name: "companies", table: companies },
      { name: "deals", table: deals },
      { name: "campaigns", table: campaigns },
      { name: "ai_agents", table: ai_agents },
    ];
    const counts: Record<string, number> = {};
    for (const { name, table } of tables) {
      const [{ c }] = await db.select({ c: sql<number>`count(*)` }).from(table as any);
      counts[name] = Number(c);
    }
    res.json({ status: "ok", counts, seeded: counts["contacts"] > 0 });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.post("/reseed", async (_req, res) => {
  try {
    // Only reseed if DB appears empty or very sparse
    const [{ c }] = await db.select({ c: sql<number>`count(*)` }).from(contacts);
    const contactCount = Number(c);
    if (contactCount >= 5) {
      return res.json({ ok: true, skipped: true, reason: `DB already has ${contactCount} contacts — no reseed needed`, contacts: contactCount });
    }
    // Import and run autoSeed
    const { autoSeed } = await import("../lib/autoSeed.js");
    await autoSeed();
    const [{ c: newCount }] = await db.select({ c: sql<number>`count(*)` }).from(contacts);
    res.json({ ok: true, skipped: false, contacts: Number(newCount) });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
