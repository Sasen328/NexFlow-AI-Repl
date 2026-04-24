/**
 * autoSeed.ts
 * Runs on every cold-start.  Inserts demo data only when the
 * contacts table is empty — fully idempotent.
 */
import { db } from "@workspace/db";
import {
  contacts, companies, deals, users, signals,
  activities, calls, notifications,
  ai_agents, campaigns, automation_rules,
  custom_properties, static_lists, static_list_members,
  dashboards, dashboard_widgets,
} from "@workspace/db";
import { sql } from "drizzle-orm";

export async function autoSeed() {
  try {
    // ── Guard: only seed if contacts table is empty ──────────────────────
    const existing = await db.select({ c: sql<number>`count(*)` }).from(contacts);
    if (Number(existing[0]?.c ?? 0) > 0) return;

    console.log("[autoSeed] Empty database detected — seeding demo data…");

    // ── 1. Users ─────────────────────────────────────────────────────────
    const userRows = await db.insert(users).values([
      { name: "Sara Al-Mansouri",  email: "sara@nexflow.ai",  role: "AE",       timezone: "Asia/Dubai",   org_id: "default" },
      { name: "Ahmed Khalid",      email: "ahmed@nexflow.ai", role: "SDR",      timezone: "Asia/Riyadh",  org_id: "default" },
      { name: "Layla Hassan",      email: "layla@nexflow.ai", role: "VP Sales", timezone: "Africa/Cairo", org_id: "default" },
      { name: "Omar Farouk",       email: "omar@nexflow.ai",  role: "AE",       timezone: "Asia/Dubai",   org_id: "default" },
    ]).returning();
    const [u0, u1, u2, u3] = userRows;

    // ── 2. Companies ──────────────────────────────────────────────────────
    const companyRows = await db.insert(companies).values([
      { name: "Gulf Ventures",       domain: "gulfventures.sa",   industry: "Venture Capital",    country: "Saudi Arabia", city: "Riyadh",    size: "51-200" as const,   owner_id: u0.id, org_id: "default" },
      { name: "SABIC Solutions",     domain: "sabic.com",         industry: "Petrochemicals",     country: "Saudi Arabia", city: "Riyadh",    size: "1000+" as const,    owner_id: u1.id, org_id: "default" },
      { name: "Dubai Tech Hub",      domain: "dubaitechhub.ae",   industry: "Technology",         country: "UAE",          city: "Dubai",     size: "51-200" as const,   owner_id: u0.id, org_id: "default" },
      { name: "Aramco Digital",      domain: "aramco.com",        industry: "Energy & Technology", country: "Saudi Arabia", city: "Dhahran",  size: "1000+" as const,    owner_id: u3.id, org_id: "default" },
      { name: "Riyadh Capital",      domain: "riyadhcapital.com", industry: "Financial Services", country: "Saudi Arabia", city: "Riyadh",    size: "201-500" as const,  owner_id: u2.id, org_id: "default" },
      { name: "Al-Noor Investments", domain: "alnoor.ae",         industry: "Investment",         country: "UAE",          city: "Abu Dhabi", size: "51-200" as const,   owner_id: u3.id, org_id: "default" },
    ]).returning();
    const [cGulf, cSabic, cDubai, cAramco, cRiyadh, cAlNoor] = companyRows;

    // ── 3. Contacts ───────────────────────────────────────────────────────
    const contactRows = await db.insert(contacts).values([
      {
        first_name: "Sara", last_name: "Al-Mansouri",
        email: "sara@gulfventures.sa", phone: "+966501234001",
        title: "Managing Partner", company_id: cGulf.id,
        lead_score: 92, status: "qualified" as const,
        notes: "Key decision maker. Gulf Ventures just closed a $50M Series B. Extremely high intent — closing window is now.",
        owner_id: u0.id, org_id: "default",
        last_engaged_at: new Date(Date.now() - 2 * 86400_000),
      },
      {
        first_name: "Ahmed", last_name: "Al-Rashidi",
        email: "ahmed@riyadhcapital.com", phone: "+966501234002",
        title: "Chief Information Officer", company_id: cRiyadh.id,
        lead_score: 87, status: "qualified" as const,
        notes: "Evaluating NexFlow for 200-seat deployment. Recently promoted to CIO — increased budget authority.",
        owner_id: u1.id, org_id: "default",
        last_engaged_at: new Date(Date.now() - 5 * 86400_000),
      },
      {
        first_name: "Nora", last_name: "Al-Faisal",
        email: "nora@riyadhcapital.com", phone: "+966501234003",
        title: "VP Technology", company_id: cRiyadh.id,
        lead_score: 82, status: "qualified" as const,
        notes: "Technical evaluator for the Riyadh Capital deal. Positive sentiment — prefers Arabic-language demos.",
        owner_id: u2.id, org_id: "default",
        last_engaged_at: new Date(Date.now() - 3 * 86400_000),
      },
      {
        first_name: "Fatima", last_name: "Khalid",
        email: "fatima@alnoor.ae", phone: "+971501234004",
        title: "Head of Digital Transformation", company_id: cAlNoor.id,
        lead_score: 78, status: "active" as const,
        notes: "Shortlisting CRMs for Q3 rollout. WhatsApp is her preferred channel.",
        owner_id: u3.id, org_id: "default",
        last_engaged_at: new Date(Date.now() - 7 * 86400_000),
      },
      {
        first_name: "Tariq", last_name: "Bin-Laden",
        email: "tariq@gulfventures.sa", phone: "+966501234005",
        title: "Chief Strategy Officer", company_id: cGulf.id,
        lead_score: 74, status: "active" as const,
        notes: "Portfolio company expansion lead. Works closely with Sara. Strong relationship.",
        owner_id: u0.id, org_id: "default",
        last_engaged_at: new Date(Date.now() - 10 * 86400_000),
      },
      {
        first_name: "Mohammed", last_name: "Al-Otaibi",
        email: "mohammed@aramcodigital.com", phone: "+966501234006",
        title: "Director of Sales Operations", company_id: cAramco.id,
        lead_score: 71, status: "active" as const,
        notes: "Aramco Digital approved Q2 budget. Contract ready to advance to negotiation.",
        owner_id: u3.id, org_id: "default",
        last_engaged_at: new Date(Date.now() - 12 * 86400_000),
      },
      {
        first_name: "Layla", last_name: "Hassan",
        email: "layla@sabic.com", phone: "+966501234007",
        title: "IT Procurement Manager", company_id: cSabic.id,
        lead_score: 65, status: "new" as const,
        notes: "Score dropped recently. Needs re-engagement. Missed last two follow-ups.",
        owner_id: u2.id, org_id: "default",
        last_engaged_at: new Date(Date.now() - 20 * 86400_000),
      },
      {
        first_name: "Khalid", last_name: "Al-Hamdan",
        email: "khalid@dubaitechhub.ae", phone: "+971501234008",
        title: "CEO", company_id: cDubai.id,
        lead_score: 58, status: "new" as const,
        notes: "Early stage. Pilot expansion discussion. No contact in 14 days — at risk.",
        owner_id: u1.id, org_id: "default",
        last_engaged_at: new Date(Date.now() - 14 * 86400_000),
      },
    ]).returning();
    const [cSara, cAhmed, cNora, cFatima, cTariq, cMohammed, cLayla, cKhalid] = contactRows;

    // ── 4. Deals ──────────────────────────────────────────────────────────
    await db.insert(deals).values([
      { title: "Gulf Ventures — Enterprise License",   contact_id: cSara.id,     company_id: cGulf.id,   stage: "negotiation" as const, value: 250000, probability: 80,  currency: "USD", owner_id: u0.id, org_id: "default", notes: "Series B funding unlocked budget. Closing this month." },
      { title: "Riyadh Capital — 200-Seat Rollout",    contact_id: cAhmed.id,    company_id: cRiyadh.id, stage: "proposal" as const,    value: 180000, probability: 65,  currency: "USD", owner_id: u1.id, org_id: "default", notes: "CIO promotion expedited the decision. Proposal sent." },
      { title: "Aramco Digital — Sales Ops Suite",     contact_id: cMohammed.id, company_id: cAramco.id, stage: "proposal" as const,    value: 320000, probability: 60,  currency: "USD", owner_id: u3.id, org_id: "default", notes: "Q2 budget approved. Need to push to negotiation." },
      { title: "Al-Noor — CRM Modernisation",          contact_id: cFatima.id,   company_id: cAlNoor.id, stage: "qualified" as const,   value: 95000,  probability: 45,  currency: "USD", owner_id: u3.id, org_id: "default", notes: "Shortlisting vendors. Demo scheduled next week." },
      { title: "SABIC Solutions — SMB Starter",        contact_id: cLayla.id,    company_id: cSabic.id,  stage: "qualified" as const,   value: 45000,  probability: 35,  currency: "USD", owner_id: u2.id, org_id: "default", notes: "Score drop suggests waning interest. Needs re-engagement." },
      { title: "Dubai Tech Hub — Pilot Expansion",     contact_id: cKhalid.id,   company_id: cDubai.id,  stage: "lead" as const,        value: 60000,  probability: 20,  currency: "USD", owner_id: u1.id, org_id: "default", notes: "CEO interested in full expansion. Needs follow-up urgently." },
      { title: "Gulf Ventures — Portfolio Co Add-on",  contact_id: cTariq.id,    company_id: cGulf.id,   stage: "closed_won" as const,  value: 75000,  probability: 100, currency: "USD", owner_id: u0.id, org_id: "default", notes: "Closed! Expansion deal for 3 portfolio companies." },
    ]);

    // ── 5. Signals ────────────────────────────────────────────────────────
    await db.insert(signals).values([
      { title: "Gulf Ventures closes $50M Series B",                 type: "funding_round" as const, contact_id: cSara.id,     company_id: cGulf.id,   score: 96, source_url: "https://crunchbase.com",       status: "new" as const,    body: "Gulf Ventures announced a $50M Series B funding round, accelerating their SaaS portfolio strategy.", org_id: "default" },
      { title: "Ahmed Al-Rashidi promoted to CIO at Riyadh Capital", type: "exec_move" as const,    contact_id: cAhmed.id,    company_id: cRiyadh.id, score: 87, source_url: "https://linkedin.com",         status: "new" as const,    body: "Ahmed Al-Rashidi has been promoted from VP IT to CIO, gaining full budget authority for Q2.", org_id: "default" },
      { title: "Al-Noor Investments opens Kuwait office",            type: "expansion" as const,    contact_id: cFatima.id,   company_id: cAlNoor.id, score: 74, source_url: "https://zawya.com",            status: "viewed" as const, body: "Al-Noor Investments is expanding into Kuwait, adding 150+ employees over the next 12 months.", org_id: "default" },
      { title: "Aramco Digital hiring 200 sales reps",               type: "hiring" as const,       contact_id: cMohammed.id, company_id: cAramco.id, score: 79, source_url: "https://linkedin.com",         status: "new" as const,    body: "Aramco Digital posted 200 sales positions — a strong buying signal for CRM tooling.", org_id: "default" },
      { title: "Gulf Ventures launches SaaS portfolio accelerator",  type: "product_launch" as const, contact_id: cTariq.id,  company_id: cGulf.id,   score: 68, source_url: "https://techcrunch.com",       status: "viewed" as const, body: "Gulf Ventures launched an accelerator for B2B SaaS startups — 12 portfolio companies need CRM.", org_id: "default" },
      { title: "SABIC enters digital transformation partnership",    type: "news" as const,         contact_id: cLayla.id,    company_id: cSabic.id,  score: 55, source_url: "https://arabianbusiness.com",  status: "new" as const,    body: "SABIC signed a 5-year digital transformation agreement with Accenture.", org_id: "default" },
    ]);

    // ── 6. Activities ─────────────────────────────────────────────────────
    await db.insert(activities).values([
      { contact_id: cSara.id,     type: "call" as const,     status: "completed" as const, title: "Discovery call",                       body: "Discussed Series B expansion needs. Very high intent. Following up with proposal.",     owner_id: u0.id, org_id: "default", completed_at: new Date(Date.now() - 2 * 86400_000) },
      { contact_id: cAhmed.id,    type: "email" as const,    status: "completed" as const, title: "Congratulations on CIO promotion",      body: "Sent personalised message. Replied within 2 hours — very engaged.",                    owner_id: u1.id, org_id: "default", completed_at: new Date(Date.now() - 5 * 86400_000) },
      { contact_id: cNora.id,     type: "meeting" as const,  status: "completed" as const, title: "Technical demo — Riyadh Capital",       body: "Full Arabic demo. Nora was impressed with pipeline automation. Asked for security whitepaper.", owner_id: u2.id, org_id: "default", completed_at: new Date(Date.now() - 3 * 86400_000) },
      { contact_id: cFatima.id,   type: "whatsapp" as const, status: "completed" as const, title: "Follow-up on demo",                    body: "She prefers WhatsApp for quick updates. Confirmed next steps via voice note.",          owner_id: u3.id, org_id: "default", completed_at: new Date(Date.now() - 7 * 86400_000) },
      { contact_id: cMohammed.id, type: "call" as const,     status: "completed" as const, title: "Budget approval confirmation",          body: "Q2 budget confirmed. Ready to advance to negotiation stage.",                          owner_id: u3.id, org_id: "default", completed_at: new Date(Date.now() - 10 * 86400_000) },
      { contact_id: cLayla.id,    type: "email" as const,    status: "completed" as const, title: "Re-engagement outreach",               body: "Sent personalised email referencing SABIC digital transformation news. Awaiting reply.", owner_id: u2.id, org_id: "default", completed_at: new Date(Date.now() - 8 * 86400_000) },
      { contact_id: cKhalid.id,   type: "call" as const,     status: "pending" as const,   title: "Pilot expansion discussion",           body: "No answer. Second missed call this week. Sent WhatsApp follow-up.",                    owner_id: u1.id, org_id: "default" },
      { contact_id: cSara.id,     type: "note" as const,     status: "completed" as const, title: "CRM notes",                            body: "Sara confirmed she is the sole decision-maker. No legal review needed for <$300K contracts.", owner_id: u0.id, org_id: "default", completed_at: new Date(Date.now() - 1 * 86400_000) },
    ]);

    // ── 7. Calls ──────────────────────────────────────────────────────────
    await db.insert(calls).values([
      { contact_id: cSara.id,     direction: "outbound" as const, status: "completed" as const, duration_seconds: 1820, transcript: "Sara confirmed Series B funds are allocated. Decision expected by end of month. Proposal accepted.", ai_insights: { summary: "High-intent close. Send MSA immediately." }, call_score: 94, owner_id: u0.id, org_id: "default", started_at: new Date(Date.now() - 2 * 86400_000) },
      { contact_id: cAhmed.id,    direction: "outbound" as const, status: "completed" as const, duration_seconds: 2340, transcript: "Ahmed asked detailed questions about SSO, audit logs, and Arabic UI. Very technical. Requested security questionnaire.", ai_insights: { summary: "Strong technical interest. Send security docs and custom Arabic UI demo." }, call_score: 88, owner_id: u1.id, org_id: "default", started_at: new Date(Date.now() - 5 * 86400_000) },
      { contact_id: cNora.id,     direction: "outbound" as const, status: "completed" as const, duration_seconds: 3120, transcript: "Nora tested API integrations, mobile app, and pipeline automation. Gave 8/10 rating. Main concern: data residency in KSA.", ai_insights: { summary: "Address data residency concern with KSA hosting option." }, call_score: 79, owner_id: u2.id, org_id: "default", started_at: new Date(Date.now() - 4 * 86400_000) },
      { contact_id: cMohammed.id, direction: "inbound" as const,  status: "completed" as const, duration_seconds: 1200, transcript: "Mohammed called to confirm Q2 budget is approved. Ready to move to negotiation. Wants kickoff by June 1.", ai_insights: { summary: "Move deal to negotiation. Prepare kickoff timeline." }, call_score: 91, owner_id: u3.id, org_id: "default", started_at: new Date(Date.now() - 9 * 86400_000) },
      { contact_id: cKhalid.id,   direction: "outbound" as const, status: "missed" as const,    duration_seconds: 0,    transcript: null, ai_insights: null, call_score: null, owner_id: u1.id, org_id: "default", started_at: new Date(Date.now() - 14 * 86400_000) },
    ]);

    // ── 8. Notifications ──────────────────────────────────────────────────
    await db.insert(notifications).values([
      { type: "signal" as const, title: "New funding signal",       body: "Gulf Ventures closed $50M Series B — contact Sara Al-Mansouri within 24h.", read: false, org_id: "default" },
      { type: "signal" as const, title: "Executive move detected",  body: "Ahmed Al-Rashidi promoted to CIO at Riyadh Capital. Update deal authority.", read: false, org_id: "default" },
      { type: "deal" as const,   title: "Deal at risk",            body: "SABIC Solutions — SMB Starter has had no activity in 9 days. Take action now.", read: false, org_id: "default" },
      { type: "call" as const,   title: "Call missed",             body: "Khalid Al-Hamdan did not answer. 2nd missed call this week.", read: true,  org_id: "default" },
      { type: "deal" as const,   title: "Stage change",            body: "Gulf Ventures portfolio deal moved to Closed Won. $75,000 booked!", read: true,  org_id: "default" },
      { type: "signal" as const, title: "Expansion signal",        body: "Al-Noor Investments opening Kuwait office — expansion opportunity.", read: false, org_id: "default" },
    ]);

    // ── 9. AI Agents ──────────────────────────────────────────────────────
    await db.insert(ai_agents).values([
      { name: "Pipeline Pulse",    description: "Daily 60-second briefing on pipeline movement",             icon: "Activity",      system_prompt: "You are Pipeline Pulse — a daily briefer who summarizes CRM pipeline activity in under 60 seconds. Focus on movement, risk, and the single most important action.", enabled: true, org_id: "default" },
      { name: "Objection Crusher", description: "Generates Arabic + English objection responses on demand",  icon: "Shield",        system_prompt: "You handle sales objections in both English and Arabic. For any objection, return: 1) acknowledgement, 2) reframe, 3) proof point, 4) next step.", enabled: true, org_id: "default" },
      { name: "Deal Risk Scout",   description: "Surfaces deals at risk of slipping before they go cold",    icon: "AlertTriangle", system_prompt: "You analyze deal pipelines and identify at-risk deals using stage age, engagement decay, and missing stakeholders. Output is always a ranked list with reasoning.", enabled: true, org_id: "default" },
    ]);

    // ── 10. Campaigns ─────────────────────────────────────────────────────
    await db.insert(campaigns).values([
      { name: "Q2 Dormant Re-engagement", channel: "email" as const,    status: "draft" as const, utm_source: "newsletter", utm_medium: "email", utm_campaign: "q2_reengage",     org_id: "default" },
      { name: "MENA Enterprise Webinar",  channel: "email" as const,    status: "draft" as const, utm_source: "webinar",    utm_medium: "email", utm_campaign: "mena_webinar_q2", org_id: "default" },
      { name: "WhatsApp Cold Outreach",   channel: "whatsapp" as const, status: "draft" as const, org_id: "default" },
    ]);

    // ── 11. Automation Rules ──────────────────────────────────────────────
    await db.insert(automation_rules).values([
      { name: "Demo Completed → Proposal",     description: "When a meeting is completed for a qualified deal, advance to Proposal",    trigger: "activity_completed" as const, trigger_config: { activity_type: "meeting" }, actions: [{ type: "advance_stage", from_stage: "qualified", to_stage: "proposal" }],              enabled: true, owner_id: u0.id, org_id: "default" },
      { name: "No Answer → WhatsApp + Retry",  description: "After 2 unanswered calls, send WhatsApp and schedule retry",              trigger: "no_answer" as const,          trigger_config: { threshold: 2 },            actions: [{ type: "log_note", message: "Trigger WhatsApp template + create retry task." }], enabled: true, owner_id: u1.id, org_id: "default" },
      { name: "Stalled Deal Alert",            description: "Create task for any deal stuck in stage > 14 days",                       trigger: "schedule" as const,           trigger_config: { cron: "0 9 * * *" },       actions: [{ type: "create_task", target: "all_open_deals", title: "Review stalled deal" }],  enabled: true, owner_id: u2.id, org_id: "default" },
    ]);

    // ── 12. Custom Properties ─────────────────────────────────────────────
    await db.insert(custom_properties).values([
      { object_type: "contact" as const, name: "decision_authority", label: "Decision Authority",    type: "select" as const,  options: { values: ["Decision Maker", "Influencer", "User", "Champion"] },                         org_id: "default", display_order: 0 },
      { object_type: "contact" as const, name: "preferred_language", label: "Preferred Language",   type: "select" as const,  options: { values: ["English", "Arabic", "French", "Both"] },                                      org_id: "default", display_order: 1 },
      { object_type: "contact" as const, name: "annual_budget",      label: "Annual Budget (USD)",  type: "number" as const,  org_id: "default", display_order: 2 },
      { object_type: "company" as const, name: "current_crm",        label: "Current CRM",          type: "select" as const,  options: { values: ["Salesforce", "HubSpot", "Pipedrive", "Zoho", "None", "Other"] },              org_id: "default", display_order: 3 },
      { object_type: "company" as const, name: "renewal_month",      label: "Contract Renewal Month", type: "date" as const,  org_id: "default", display_order: 4 },
      { object_type: "deal" as const,    name: "competitor",         label: "Main Competitor",      type: "text" as const,    org_id: "default", display_order: 5 },
      { object_type: "deal" as const,    name: "champion_engaged",   label: "Champion Engaged",     type: "boolean" as const, org_id: "default", display_order: 6 },
    ]);

    // ── 13. Static Lists ──────────────────────────────────────────────────
    const listRows = await db.insert(static_lists).values([
      { name: "Hot MENA Decision Makers", description: "C-level prospects in MENA with active signals", color: "#B8A0C8", owner_id: u0.id, org_id: "default", object_type: "contact" as const },
      { name: "Q2 Re-engagement",         description: "Dormant leads to re-engage this quarter",       color: "#88B8B0", owner_id: u1.id, org_id: "default", object_type: "contact" as const },
      { name: "Enterprise Pipeline",      description: "Deals over $100K",                              color: "#C8A880", owner_id: u2.id, org_id: "default", object_type: "contact" as const },
      { name: "Ramadan Pause List",       description: "Contacts to slow outreach during Ramadan",      color: "#90B8B8", owner_id: u3.id, org_id: "default", object_type: "contact" as const },
    ]).returning();
    const hotContactIds = [cSara.id, cAhmed.id, cNora.id];
    for (const list of listRows) {
      for (const cid of hotContactIds) {
        await db.insert(static_list_members).values({ list_id: list.id, entity_id: cid }).onConflictDoNothing();
      }
    }

    // ── 14. Dashboard ─────────────────────────────────────────────────────
    const [dash] = await db.insert(dashboards).values({
      name: "Sales Command Center", description: "Default executive dashboard",
      owner_id: u0.id, is_shared: true, org_id: "default",
    }).returning();
    await db.insert(dashboard_widgets).values([
      { type: "metric",      title: "Open Deals",      config: { metric: "deals_open" },                           position: 0, width: "sm", dashboard_id: dash.id },
      { type: "metric",      title: "Pipeline Value",  config: { metric: "pipeline_value", format: "currency" },   position: 1, width: "sm", dashboard_id: dash.id },
      { type: "metric",      title: "Won This Month",  config: { metric: "won_value",      format: "currency" },   position: 2, width: "sm", dashboard_id: dash.id },
      { type: "metric",      title: "Calls (7d)",      config: { metric: "calls_completed" },                      position: 3, width: "sm", dashboard_id: dash.id },
      { type: "funnel",      title: "Sales Funnel",    config: {},                                                  position: 4, width: "lg", dashboard_id: dash.id },
      { type: "leaderboard", title: "Top Reps",        config: {},                                                  position: 5, width: "md", dashboard_id: dash.id },
    ]);

    console.log("[autoSeed] ✅ Demo data seeded successfully.");
  } catch (err: any) {
    console.error("[autoSeed] ❌ Seed failed:", err?.message ?? err);
  }
}
