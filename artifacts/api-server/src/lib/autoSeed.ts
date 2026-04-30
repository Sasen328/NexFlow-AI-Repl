/**
 * autoSeed.ts
 * Runs on every cold-start.  Self-healing:
 *   • If contacts table is empty → seed everything.
 *   • If contacts table has < 30 rows → assume a stale/partial seed,
 *     wipe known seed tables, then reseed.
 *   • If contacts table has >= 30 rows → skip (already seeded).
 *   • Pass `force = true` to wipe & reseed unconditionally.
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
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";

const EXPECTED_MIN_CONTACTS = 30;

/**
 * On a fresh production database the schema doesn't exist yet (no
 * `drizzle-kit push` runs at deploy time). Detect that and bootstrap the
 * schema from the bundled SQL dump so prod becomes a true twin of dev.
 */
async function ensureSchema() {
  const has = await db.execute(sql`SELECT to_regclass('public.contacts') AS r`);
  const row = (has as any).rows?.[0] ?? (Array.isArray(has) ? has[0] : undefined);
  if (row?.r) return;

  const candidates = [
    resolve(process.cwd(), "artifacts/api-server/seed/schema.sql"),
    resolve(dirname(new URL(import.meta.url).pathname), "../seed/schema.sql"),
    resolve(process.cwd(), "seed/schema.sql"),
  ];
  const path = candidates.find((p) => existsSync(p));
  if (!path) {
    console.error("[autoSeed] schema.sql not found in any of:", candidates);
    return;
  }
  console.log(`[autoSeed] Bootstrapping schema from ${path}…`);
  const ddl = readFileSync(path, "utf8");
  await db.execute(sql.raw(ddl));
  console.log("[autoSeed] Schema bootstrapped.");
}

/**
 * Wipe every table autoSeed (and the demo flow) writes to. Each TRUNCATE
 * runs independently so a missing table (stale prod schema) doesn't abort
 * the rest. CASCADE handles dependent rows (tasks, automation_runs, etc).
 */
async function wipeAllSeedTables() {
  const tables = [
    "dashboard_widgets", "dashboards",
    "static_list_members", "static_lists",
    "automation_runs", "automation_rules",
    "tracking_events", "tracking_links",
    "campaigns", "ai_agents", "ai_insights",
    "custom_properties", "saved_views",
    "notifications", "signals",
    "tasks", "calls", "activities",
    "deals", "contacts", "companies", "users",
  ];
  for (const t of tables) {
    try {
      await db.execute(sql.raw(`TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE`));
    } catch (e: any) {
      console.warn(`[autoSeed] skip wipe of ${t}: ${e?.message ?? e}`);
    }
  }
}

export async function autoSeed(force = false) {
  try {
    await ensureSchema();

    // Always (re)seed the enrichment_sources registry — it's small,
    // idempotent (ON CONFLICT DO NOTHING), and decoupled from contacts.
    // Doing it here at startup avoids the per-request race the route's
    // singleton would otherwise have on cold-start.
    try {
      const { seedSources } = await import("./enrichment/sources.js");
      await seedSources();
    } catch (e) {
      console.warn("[autoSeed] seedSources failed:", e instanceof Error ? e.message : e);
    }

    const existing = await db.select({ c: sql<number>`count(*)` }).from(contacts);
    const n = Number(existing[0]?.c ?? 0);

    if (!force && n >= EXPECTED_MIN_CONTACTS) {
      console.log(`[autoSeed] ${n} contacts present — skipping (already seeded).`);
      return;
    }

    if (n > 0) {
      console.log(`[autoSeed] ${force ? "Force reseed requested" : `Partial seed detected (${n} < ${EXPECTED_MIN_CONTACTS})`} — wiping & reseeding.`);
      await wipeAllSeedTables();
    } else {
      console.log("[autoSeed] Empty database detected — seeding demo data…");
    }

    // ── 1. Users ─────────────────────────────────────────────────────────
    const userRows = await db.insert(users).values([
      { name: "Sara Al-Mansouri",  email: "sara@nexflow.ai",   role: "AE",       timezone: "Asia/Dubai",   org_id: "default" },
      { name: "Ahmed Khalid",      email: "ahmed@nexflow.ai",  role: "SDR",      timezone: "Asia/Riyadh",  org_id: "default" },
      { name: "Layla Hassan",      email: "layla@nexflow.ai",  role: "VP Sales", timezone: "Africa/Cairo", org_id: "default" },
      { name: "Omar Farouk",       email: "omar@nexflow.ai",   role: "AE",       timezone: "Asia/Dubai",   org_id: "default" },
      { name: "Khalid Nasser",     email: "khalid@nexflow.ai", role: "SDR",      timezone: "Asia/Riyadh",  org_id: "default" },
    ]).returning();
    const [u0, u1, u2, u3, u4] = userRows;
    const allUsers = [u0, u1, u2, u3, u4];

    // ── 2. Companies ──────────────────────────────────────────────────────
    const companyRows = await db.insert(companies).values([
      { name: "Gulf Ventures",          domain: "gulfventures.sa",      industry: "Venture Capital",      country: "Saudi Arabia", city: "Riyadh",    size: "51-200"  as const, owner_id: u0.id, org_id: "default" },
      { name: "SABIC Solutions",        domain: "sabic.com",            industry: "Petrochemicals",       country: "Saudi Arabia", city: "Riyadh",    size: "1000+"   as const, owner_id: u1.id, org_id: "default" },
      { name: "Dubai Tech Hub",         domain: "dubaitechhub.ae",      industry: "Technology",           country: "UAE",          city: "Dubai",     size: "51-200"  as const, owner_id: u0.id, org_id: "default" },
      { name: "Aramco Digital",         domain: "aramco.com",           industry: "Energy & Technology",  country: "Saudi Arabia", city: "Dhahran",   size: "1000+"   as const, owner_id: u3.id, org_id: "default" },
      { name: "Riyadh Capital",         domain: "riyadhcapital.com",    industry: "Financial Services",   country: "Saudi Arabia", city: "Riyadh",    size: "201-500" as const, owner_id: u2.id, org_id: "default" },
      { name: "Al-Noor Investments",    domain: "alnoor.ae",            industry: "Investment",           country: "UAE",          city: "Abu Dhabi", size: "51-200"  as const, owner_id: u3.id, org_id: "default" },
      { name: "Qatar National Bank",    domain: "qnb.com",              industry: "Banking",              country: "Qatar",        city: "Doha",      size: "1000+"   as const, owner_id: u4.id, org_id: "default" },
      { name: "Emaar Properties",       domain: "emaar.com",            industry: "Real Estate",          country: "UAE",          city: "Dubai",     size: "1000+"   as const, owner_id: u0.id, org_id: "default" },
      { name: "Majid Al Futtaim",       domain: "majidalfuttaim.com",   industry: "Retail & Hospitality", country: "UAE",          city: "Dubai",     size: "1000+"   as const, owner_id: u1.id, org_id: "default" },
      { name: "stc",                    domain: "stc.com.sa",           industry: "Telecommunications",   country: "Saudi Arabia", city: "Riyadh",    size: "1000+"   as const, owner_id: u2.id, org_id: "default" },
      { name: "Kuwait Finance House",   domain: "kfh.com",              industry: "Islamic Banking",      country: "Kuwait",       city: "Kuwait City", size: "1000+" as const, owner_id: u3.id, org_id: "default" },
      { name: "Oman Oil Marketing",     domain: "oomco.om",             industry: "Energy",               country: "Oman",         city: "Muscat",    size: "201-500" as const, owner_id: u4.id, org_id: "default" },
      { name: "Bahrain FinTech Bay",    domain: "bahrainfintech.bh",    industry: "FinTech",              country: "Bahrain",      city: "Manama",    size: "11-50"   as const, owner_id: u0.id, org_id: "default" },
      { name: "NEOM Tech & Digital",    domain: "neom.com",             industry: "Smart City",           country: "Saudi Arabia", city: "NEOM",      size: "201-500" as const, owner_id: u1.id, org_id: "default" },
      { name: "Jadwa Investment",       domain: "jadwa.com",            industry: "Asset Management",     country: "Saudi Arabia", city: "Riyadh",    size: "51-200"  as const, owner_id: u2.id, org_id: "default" },
      { name: "Mubadala Investment",    domain: "mubadala.ae",          industry: "Sovereign Wealth",     country: "UAE",          city: "Abu Dhabi", size: "1000+"   as const, owner_id: u3.id, org_id: "default" },
      { name: "Ras Al Khaimah Econ",   domain: "rakia.ae",             industry: "Economic Development", country: "UAE",          city: "Ras Al Khaimah", size: "51-200" as const, owner_id: u4.id, org_id: "default" },
      { name: "Zain Group",            domain: "zain.com",             industry: "Telecommunications",   country: "Kuwait",       city: "Kuwait City", size: "1000+" as const, owner_id: u0.id, org_id: "default" },
      { name: "Al Rajhi Bank",         domain: "alrajhibank.com.sa",   industry: "Islamic Banking",      country: "Saudi Arabia", city: "Riyadh",    size: "1000+"   as const, owner_id: u1.id, org_id: "default" },
      { name: "Dubai Airports",        domain: "dubaiairports.ae",     industry: "Aviation",             country: "UAE",          city: "Dubai",     size: "1000+"   as const, owner_id: u2.id, org_id: "default" },
    ]).returning();
    const [cGulf, cSabic, cDubai, cAramco, cRiyadh, cAlNoor, cQNB, cEmaar, cMAF, cstc, cKFH, cOman, cBFB, cNEOM, cJadwa, cMubadala, cRAK, cZain, cAlRajhi, cDubaiAirports] = companyRows;

    // ── 3. Contacts (40+) ─────────────────────────────────────────────────
    const contactRows = await db.insert(contacts).values([
      // Gulf Ventures
      { first_name: "Sara",     last_name: "Al-Mansouri",  email: "sara@gulfventures.sa",       phone: "+966501234001", title: "Managing Partner",              company_id: cGulf.id,        lead_score: 92, status: "qualified" as const, notes: "Key decision maker. Gulf Ventures closed a $50M Series B. Extremely high intent.", owner_id: u0.id, org_id: "default", last_engaged_at: new Date(Date.now() - 2*86400_000) },
      { first_name: "Tariq",    last_name: "Bin-Laden",    email: "tariq@gulfventures.sa",      phone: "+966501234005", title: "Chief Strategy Officer",        company_id: cGulf.id,        lead_score: 74, status: "active"    as const, notes: "Portfolio company expansion lead. Works closely with Sara.", owner_id: u0.id, org_id: "default", last_engaged_at: new Date(Date.now() - 10*86400_000) },
      // Riyadh Capital
      { first_name: "Ahmed",    last_name: "Al-Rashidi",   email: "ahmed@riyadhcapital.com",    phone: "+966501234002", title: "Chief Information Officer",     company_id: cRiyadh.id,      lead_score: 87, status: "qualified" as const, notes: "Evaluating NexFlow for 200-seat deployment. Recently promoted to CIO.", owner_id: u1.id, org_id: "default", last_engaged_at: new Date(Date.now() - 5*86400_000) },
      { first_name: "Nora",     last_name: "Al-Faisal",    email: "nora@riyadhcapital.com",     phone: "+966501234003", title: "VP Technology",                 company_id: cRiyadh.id,      lead_score: 82, status: "qualified" as const, notes: "Technical evaluator. Positive sentiment, prefers Arabic demos.", owner_id: u2.id, org_id: "default", last_engaged_at: new Date(Date.now() - 3*86400_000) },
      { first_name: "Hamad",    last_name: "Al-Sulaiti",   email: "hamad@riyadhcapital.com",    phone: "+966501234021", title: "Head of Procurement",           company_id: cRiyadh.id,      lead_score: 63, status: "active"    as const, notes: "Procurement gatekeeper for the 200-seat deal. Needs ROI documentation.", owner_id: u1.id, org_id: "default", last_engaged_at: new Date(Date.now() - 8*86400_000) },
      // Al-Noor
      { first_name: "Fatima",   last_name: "Khalid",       email: "fatima@alnoor.ae",           phone: "+971501234004", title: "Head of Digital Transformation", company_id: cAlNoor.id,     lead_score: 78, status: "active"    as const, notes: "Shortlisting CRMs for Q3 rollout. WhatsApp preferred.", owner_id: u3.id, org_id: "default", last_engaged_at: new Date(Date.now() - 7*86400_000) },
      // Aramco Digital
      { first_name: "Mohammed", last_name: "Al-Otaibi",    email: "mohammed@aramcodigital.com", phone: "+966501234006", title: "Director of Sales Operations",  company_id: cAramco.id,      lead_score: 71, status: "active"    as const, notes: "Aramco Digital Q2 budget approved. Advance to negotiation.", owner_id: u3.id, org_id: "default", last_engaged_at: new Date(Date.now() - 12*86400_000) },
      { first_name: "Reem",     last_name: "Al-Dossari",   email: "reem@aramcodigital.com",     phone: "+966501234022", title: "IT Architecture Manager",       company_id: cAramco.id,      lead_score: 68, status: "active"    as const, notes: "Technical approver. Reviewed integration docs. Positive.", owner_id: u3.id, org_id: "default", last_engaged_at: new Date(Date.now() - 15*86400_000) },
      // SABIC
      { first_name: "Layla",    last_name: "Hassan",       email: "layla@sabic.com",            phone: "+966501234007", title: "IT Procurement Manager",        company_id: cSabic.id,       lead_score: 65, status: "new"       as const, notes: "Score dropped. Needs re-engagement. Missed last two follow-ups.", owner_id: u2.id, org_id: "default", last_engaged_at: new Date(Date.now() - 20*86400_000) },
      // Dubai Tech Hub
      { first_name: "Khalid",   last_name: "Al-Hamdan",    email: "khalid@dubaitechhub.ae",     phone: "+971501234008", title: "CEO",                           company_id: cDubai.id,       lead_score: 58, status: "new"       as const, notes: "Early stage. Pilot expansion. No contact in 14 days — at risk.", owner_id: u1.id, org_id: "default", last_engaged_at: new Date(Date.now() - 14*86400_000) },
      { first_name: "Yasmin",   last_name: "Al-Rasheed",   email: "yasmin@dubaitechhub.ae",     phone: "+971501234023", title: "Chief Product Officer",         company_id: cDubai.id,       lead_score: 61, status: "active"    as const, notes: "Product champion. Likes mobile-first features.", owner_id: u0.id, org_id: "default", last_engaged_at: new Date(Date.now() - 11*86400_000) },
      // QNB
      { first_name: "Abdullah", last_name: "Al-Thani",     email: "abdullah@qnb.com",           phone: "+97450123001",  title: "Chief Digital Officer",         company_id: cQNB.id,         lead_score: 89, status: "qualified" as const, notes: "QNB's CDO. Very large deal potential. Evaluate core banking CRM integration.", owner_id: u4.id, org_id: "default", last_engaged_at: new Date(Date.now() - 4*86400_000) },
      { first_name: "Noura",    last_name: "Al-Mannai",    email: "noura@qnb.com",              phone: "+97450123002",  title: "VP Innovation",                 company_id: cQNB.id,         lead_score: 76, status: "active"    as const, notes: "Innovation lab sponsor. Keen on AI features.", owner_id: u4.id, org_id: "default", last_engaged_at: new Date(Date.now() - 6*86400_000) },
      // Emaar
      { first_name: "Saeed",    last_name: "Al-Maktoum",   email: "saeed@emaar.com",            phone: "+971501234009", title: "Group CIO",                     company_id: cEmaar.id,       lead_score: 85, status: "qualified" as const, notes: "Emaar evaluating CRM for their sales teams in 3 countries.", owner_id: u0.id, org_id: "default", last_engaged_at: new Date(Date.now() - 6*86400_000) },
      { first_name: "Mariam",   last_name: "Al-Falasi",    email: "mariam@emaar.com",           phone: "+971501234024", title: "Head of CRM & Analytics",       company_id: cEmaar.id,       lead_score: 72, status: "active"    as const, notes: "Day-to-day champion. Impressed by the AI briefing feature.", owner_id: u0.id, org_id: "default", last_engaged_at: new Date(Date.now() - 9*86400_000) },
      // MAF
      { first_name: "Rami",     last_name: "Bitar",        email: "rami@majidalfuttaim.com",    phone: "+971501234010", title: "VP Sales Technology",           company_id: cMAF.id,         lead_score: 77, status: "active"    as const, notes: "MAF is evaluating CRM modernisation across 15 brands.", owner_id: u1.id, org_id: "default", last_engaged_at: new Date(Date.now() - 9*86400_000) },
      // stc
      { first_name: "Faisal",   last_name: "Al-Ibrahim",   email: "faisal@stc.com.sa",          phone: "+966501234011", title: "Head of Enterprise Sales",      company_id: cstc.id,         lead_score: 80, status: "qualified" as const, notes: "stc reviewing CRM for 500-seat enterprise rollout. Q3 decision.", owner_id: u2.id, org_id: "default", last_engaged_at: new Date(Date.now() - 7*86400_000) },
      { first_name: "Dalal",    last_name: "Al-Harbi",     email: "dalal@stc.com.sa",           phone: "+966501234025", title: "Digital Transformation Manager", company_id: cstc.id,        lead_score: 66, status: "active"    as const, notes: "Program manager for the CRM RFP. Organising internal eval team.", owner_id: u2.id, org_id: "default", last_engaged_at: new Date(Date.now() - 13*86400_000) },
      // KFH
      { first_name: "Bader",    last_name: "Al-Zubaidi",   email: "bader@kfh.com",              phone: "+96550123001",  title: "COO",                           company_id: cKFH.id,         lead_score: 84, status: "qualified" as const, notes: "KFH COO. Looking for Sharia-compliant CRM. Strong MENA relationship history.", owner_id: u3.id, org_id: "default", last_engaged_at: new Date(Date.now() - 5*86400_000) },
      // Oman Oil
      { first_name: "Salim",    last_name: "Al-Rashdi",    email: "salim@oomco.om",             phone: "+96892012001",  title: "Chief Commercial Officer",      company_id: cOman.id,        lead_score: 69, status: "active"    as const, notes: "Oman Oil CCO evaluating pipeline management for B2B sales.", owner_id: u4.id, org_id: "default", last_engaged_at: new Date(Date.now() - 11*86400_000) },
      // Bahrain FinTech Bay
      { first_name: "Dana",     last_name: "Al-Khalifa",   email: "dana@bahrainfintech.bh",     phone: "+97333012001",  title: "CEO",                           company_id: cBFB.id,         lead_score: 73, status: "active"    as const, notes: "BFB CEO. Startup-friendly budget but strong network. Influencer deal.", owner_id: u0.id, org_id: "default", last_engaged_at: new Date(Date.now() - 8*86400_000) },
      // NEOM
      { first_name: "Rashid",   last_name: "Al-Ghamdi",    email: "rashid@neom.com",            phone: "+966501234012", title: "Head of Smart Sales Systems",   company_id: cNEOM.id,        lead_score: 91, status: "qualified" as const, notes: "NEOM smart city CRM for 1000+ future residents sales teams. Vision 2030 budget.", owner_id: u1.id, org_id: "default", last_engaged_at: new Date(Date.now() - 3*86400_000) },
      { first_name: "Lina",     last_name: "Boulos",       email: "lina@neom.com",              phone: "+966501234026", title: "Digital Products Director",     company_id: cNEOM.id,        lead_score: 77, status: "active"    as const, notes: "Manages NEOM's vendor evaluation process.", owner_id: u1.id, org_id: "default", last_engaged_at: new Date(Date.now() - 16*86400_000) },
      // Jadwa
      { first_name: "Waleed",   last_name: "Al-Mogren",    email: "waleed@jadwa.com",           phone: "+966501234013", title: "Managing Director",             company_id: cJadwa.id,       lead_score: 75, status: "active"    as const, notes: "Jadwa evaluating CRM for relationship management across 200 investors.", owner_id: u2.id, org_id: "default", last_engaged_at: new Date(Date.now() - 10*86400_000) },
      // Mubadala
      { first_name: "Hessa",    last_name: "Al-Nahyan",    email: "hessa@mubadala.ae",          phone: "+971501234014", title: "Director of Portfolio Ops",     company_id: cMubadala.id,    lead_score: 88, status: "qualified" as const, notes: "Mubadala evaluating CRM for their portfolio companies. $200B+ AUM.", owner_id: u3.id, org_id: "default", last_engaged_at: new Date(Date.now() - 4*86400_000) },
      { first_name: "Omar",     last_name: "Farouq",       email: "omar@mubadala.ae",           phone: "+971501234027", title: "Head of Technology Investments", company_id: cMubadala.id,   lead_score: 71, status: "active"    as const, notes: "Evaluating AI features. Impressed by predictive lead scoring.", owner_id: u3.id, org_id: "default", last_engaged_at: new Date(Date.now() - 14*86400_000) },
      // RAK
      { first_name: "Saqr",     last_name: "Al-Qassimi",   email: "saqr@rakia.ae",              phone: "+97172012001",  title: "CEO",                           company_id: cRAK.id,         lead_score: 67, status: "active"    as const, notes: "RAKIA CEO. Interested in CRM for free zone business development.", owner_id: u4.id, org_id: "default", last_engaged_at: new Date(Date.now() - 12*86400_000) },
      // Zain
      { first_name: "Ali",      last_name: "Al-Yaqoub",    email: "ali@zain.com",               phone: "+96550456001",  title: "VP Enterprise Solutions",       company_id: cZain.id,        lead_score: 79, status: "qualified" as const, notes: "Zain Group evaluating CRM for B2B enterprise sales across 7 markets.", owner_id: u0.id, org_id: "default", last_engaged_at: new Date(Date.now() - 6*86400_000) },
      // Al Rajhi
      { first_name: "Turki",    last_name: "Al-Rajhi",     email: "turki@alrajhibank.com.sa",   phone: "+966501234015", title: "Head of Corporate Banking",     company_id: cAlRajhi.id,     lead_score: 83, status: "qualified" as const, notes: "Al Rajhi Bank evaluating CRM for corporate banking relationship managers.", owner_id: u1.id, org_id: "default", last_engaged_at: new Date(Date.now() - 5*86400_000) },
      { first_name: "Shahad",   last_name: "Al-Turki",     email: "shahad@alrajhibank.com.sa",  phone: "+966501234028", title: "Digital Innovation Lead",       company_id: cAlRajhi.id,     lead_score: 69, status: "active"    as const, notes: "Digital transformation champion. Interested in AI automation.", owner_id: u1.id, org_id: "default", last_engaged_at: new Date(Date.now() - 17*86400_000) },
      // Dubai Airports
      { first_name: "Maitha",   last_name: "Al-Marri",     email: "maitha@dubaiairports.ae",    phone: "+971501234016", title: "VP Commercial",                 company_id: cDubaiAirports.id, lead_score: 70, status: "active" as const, notes: "Dubai Airports evaluating CRM for commercial partnerships team.", owner_id: u2.id, org_id: "default", last_engaged_at: new Date(Date.now() - 9*86400_000) },
      // Additional independent prospects
      { first_name: "Zayed",    last_name: "Al-Nuaimi",    email: "zayed@ventures.ae",          phone: "+971501234029", title: "General Partner",               company_id: cAlNoor.id,      lead_score: 81, status: "qualified" as const, notes: "Tech-first VC evaluating NexFlow for portfolio company distribution.", owner_id: u4.id, org_id: "default", last_engaged_at: new Date(Date.now() - 6*86400_000) },
      { first_name: "Maha",     last_name: "Al-Sabah",     email: "maha@kuwaitgov.kw",          phone: "+96565123001",  title: "Director of Digitisation",      company_id: cKFH.id,         lead_score: 76, status: "active"    as const, notes: "Kuwait government digitisation initiative. Large public sector deal.", owner_id: u4.id, org_id: "default", last_engaged_at: new Date(Date.now() - 13*86400_000) },
      { first_name: "Hassan",   last_name: "Jameel",       email: "hassan@abdullahomran.com",   phone: "+966501234030", title: "Chief Technology Officer",      company_id: cJadwa.id,       lead_score: 72, status: "active"    as const, notes: "Family office CTO. Evaluating CRM for private equity portfolio management.", owner_id: u2.id, org_id: "default", last_engaged_at: new Date(Date.now() - 19*86400_000) },
      { first_name: "Yara",     last_name: "Al-Suleiman",  email: "yara@saudivision.sa",        phone: "+966501234031", title: "Program Director, Vision 2030", company_id: cNEOM.id,        lead_score: 86, status: "qualified" as const, notes: "Vision 2030 program director. Budget comes from national transformation fund.", owner_id: u1.id, org_id: "default", last_engaged_at: new Date(Date.now() - 5*86400_000) },
      { first_name: "Feras",    last_name: "Al-Nahari",    email: "feras@saudistartups.sa",     phone: "+966501234032", title: "CEO",                           company_id: cGulf.id,        lead_score: 59, status: "new"       as const, notes: "Early stage startup. Free plan interest but upsell potential.", owner_id: u0.id, org_id: "default", last_engaged_at: new Date(Date.now() - 22*86400_000) },
      { first_name: "Aisha",    last_name: "Al-Blooshi",   email: "aisha@hub71.ae",             phone: "+971501234033", title: "Head of Portfolio Success",     company_id: cMAF.id,         lead_score: 64, status: "active"    as const, notes: "Hub71 portfolio manager. Looking for affordable CRM for startups.", owner_id: u3.id, org_id: "default", last_engaged_at: new Date(Date.now() - 16*86400_000) },
      { first_name: "Nawaf",    last_name: "Al-Mutwalli",  email: "nawaf@taqa.com",             phone: "+971501234034", title: "VP Business Development",       company_id: cMubadala.id,    lead_score: 77, status: "active"    as const, notes: "TAQA energy company. Expansion across GCC — evaluating CRM for BD teams.", owner_id: u3.id, org_id: "default", last_engaged_at: new Date(Date.now() - 10*86400_000) },
      { first_name: "Randa",    last_name: "Khalil",       email: "randa@arabbank.com",         phone: "+96265123001",  title: "Head of SME Banking",           company_id: cAlRajhi.id,     lead_score: 68, status: "active"    as const, notes: "Arab Bank SME head. Evaluating CRM for 300-seat SME sales team in Jordan.", owner_id: u1.id, org_id: "default", last_engaged_at: new Date(Date.now() - 14*86400_000) },
      { first_name: "Badr",     last_name: "Al-Essa",      email: "badr@sagia.gov.sa",          phone: "+966501234035", title: "Investment Promotion Director",  company_id: cstc.id,        lead_score: 73, status: "active"    as const, notes: "Saudi investment authority evaluating CRM for FDI pipeline tracking.", owner_id: u2.id, org_id: "default", last_engaged_at: new Date(Date.now() - 18*86400_000) },
    ]).returning();

    const [cSaraC, cTariq, cAhmedC, cNora, cHamad, cFatima, cMohammed, cReem, cLayla, cKhalidC, cYasmin, cAbdullah, cNoura, cSaeed, cMariam, cRami, cFaisal, cDalal, cBader, cSalim, cDana, cRashid, cLina, cWaleed, cHessa, cOmarM, cSaqr, cAli, cTurki, cShahad, cMaitha, cZayed, cMaha, cHassan, cYara, cFeras, cAisha, cNawaf, cRanda, cBadr] = contactRows;

    // ── 4. Deals (30+) ────────────────────────────────────────────────────
    await db.insert(deals).values([
      { title: "Gulf Ventures — Enterprise License",        contact_id: cSaraC.id,    company_id: cGulf.id,         stage: "negotiation"  as const, value: 250000, probability: 82,  currency: "USD", owner_id: u0.id, org_id: "default", notes: "Series B unlocked budget. Closing this month." },
      { title: "Riyadh Capital — 200-Seat Rollout",         contact_id: cAhmedC.id,   company_id: cRiyadh.id,       stage: "proposal"     as const, value: 180000, probability: 65,  currency: "USD", owner_id: u1.id, org_id: "default", notes: "CIO promotion expedited the decision. Proposal sent." },
      { title: "Aramco Digital — Sales Ops Suite",          contact_id: cMohammed.id, company_id: cAramco.id,       stage: "proposal"     as const, value: 320000, probability: 60,  currency: "USD", owner_id: u3.id, org_id: "default", notes: "Q2 budget approved. Push to negotiation." },
      { title: "Al-Noor — CRM Modernisation",               contact_id: cFatima.id,   company_id: cAlNoor.id,       stage: "qualified"    as const, value: 95000,  probability: 45,  currency: "USD", owner_id: u3.id, org_id: "default", notes: "Shortlisting vendors. Demo next week." },
      { title: "SABIC Solutions — SMB Starter",             contact_id: cLayla.id,    company_id: cSabic.id,        stage: "qualified"    as const, value: 45000,  probability: 35,  currency: "USD", owner_id: u2.id, org_id: "default", notes: "Score drop suggests waning interest. Needs re-engagement." },
      { title: "Dubai Tech Hub — Pilot Expansion",          contact_id: cKhalidC.id,  company_id: cDubai.id,        stage: "lead"         as const, value: 60000,  probability: 20,  currency: "USD", owner_id: u1.id, org_id: "default", notes: "CEO interested but no contact in 14 days." },
      { title: "Gulf Ventures — Portfolio Co Add-on",       contact_id: cTariq.id,    company_id: cGulf.id,         stage: "closed_won"   as const, value: 75000,  probability: 100, currency: "USD", owner_id: u0.id, org_id: "default", notes: "Closed! Expansion for 3 portfolio companies." },
      { title: "QNB — Digital Banking CRM",                 contact_id: cAbdullah.id, company_id: cQNB.id,          stage: "proposal"     as const, value: 450000, probability: 55,  currency: "USD", owner_id: u4.id, org_id: "default", notes: "Largest deal in pipeline. QNB-wide rollout across Qatar & Egypt." },
      { title: "Emaar Properties — Sales Force CRM",        contact_id: cSaeed.id,    company_id: cEmaar.id,        stage: "negotiation"  as const, value: 280000, probability: 75,  currency: "USD", owner_id: u0.id, org_id: "default", notes: "Multi-country deployment. Legal review underway." },
      { title: "stc — Enterprise Sales Platform",           contact_id: cFaisal.id,   company_id: cstc.id,          stage: "qualified"    as const, value: 390000, probability: 50,  currency: "USD", owner_id: u2.id, org_id: "default", notes: "500-seat RFP. Competing with Salesforce and Zoho." },
      { title: "Kuwait Finance House — Relationship CRM",   contact_id: cBader.id,    company_id: cKFH.id,          stage: "proposal"     as const, value: 195000, probability: 62,  currency: "USD", owner_id: u3.id, org_id: "default", notes: "Sharia-compliant CRM requirement. Custom compliance module needed." },
      { title: "NEOM — Smart City Sales Suite",             contact_id: cRashid.id,   company_id: cNEOM.id,         stage: "qualified"    as const, value: 520000, probability: 48,  currency: "USD", owner_id: u1.id, org_id: "default", notes: "Vision 2030 flagship deal. Biggest opportunity this year." },
      { title: "Mubadala — Portfolio CRM",                  contact_id: cHessa.id,    company_id: cMubadala.id,     stage: "negotiation"  as const, value: 340000, probability: 70,  currency: "USD", owner_id: u3.id, org_id: "default", notes: "Sovereign wealth fund. Multi-entity deployment across 40 portfolio companies." },
      { title: "Zain Group — Multi-Market CRM",             contact_id: cAli.id,      company_id: cZain.id,         stage: "proposal"     as const, value: 275000, probability: 58,  currency: "USD", owner_id: u0.id, org_id: "default", notes: "7-country deployment. Legal framework being reviewed." },
      { title: "Al Rajhi Bank — Corporate Banking CRM",     contact_id: cTurki.id,    company_id: cAlRajhi.id,      stage: "qualified"    as const, value: 230000, probability: 52,  currency: "USD", owner_id: u1.id, org_id: "default", notes: "SAMA compliance review required. Strong internal champion." },
      { title: "Jadwa Investment — Investor Relations CRM", contact_id: cWaleed.id,   company_id: cJadwa.id,        stage: "lead"         as const, value: 85000,  probability: 30,  currency: "USD", owner_id: u2.id, org_id: "default", notes: "Early-stage evaluation. Budget not yet confirmed." },
      { title: "Bahrain FinTech Bay — Startup CRM",         contact_id: cDana.id,     company_id: cBFB.id,          stage: "lead"         as const, value: 35000,  probability: 25,  currency: "USD", owner_id: u0.id, org_id: "default", notes: "Small deal but strong referral potential across GCC fintech ecosystem." },
      { title: "Majid Al Futtaim — Retail Sales CRM",       contact_id: cRami.id,     company_id: cMAF.id,          stage: "qualified"    as const, value: 165000, probability: 42,  currency: "USD", owner_id: u1.id, org_id: "default", notes: "15 brands across 29 countries. Pilot in UAE first." },
      { title: "Dubai Airports — Commercial CRM",           contact_id: cMaitha.id,   company_id: cDubaiAirports.id, stage: "lead"        as const, value: 110000, probability: 28,  currency: "USD", owner_id: u2.id, org_id: "default", notes: "Commercial partnership management. Slow decision-making cycle." },
      { title: "Yara Vision 2030 — Program CRM",            contact_id: cYara.id,     company_id: cNEOM.id,         stage: "qualified"    as const, value: 180000, probability: 55,  currency: "USD", owner_id: u1.id, org_id: "default", notes: "National transformation fund backed. Strong urgency for Q3 delivery." },
      { title: "Riyadh Capital — Technical Expansion",      contact_id: cNora.id,     company_id: cRiyadh.id,       stage: "closed_won"   as const, value: 42000,  probability: 100, currency: "USD", owner_id: u2.id, org_id: "default", notes: "Pilot add-on closed. Nora championed it internally." },
    ]);

    // ── 5. Signals ────────────────────────────────────────────────────────
    await db.insert(signals).values([
      { title: "Gulf Ventures closes $50M Series B",                  type: "funding_round"   as const, contact_id: cSaraC.id,    company_id: cGulf.id,         score: 96, source_url: "https://crunchbase.com",      status: "new"    as const, body: "Gulf Ventures announced a $50M Series B, accelerating SaaS portfolio strategy.", org_id: "default" },
      { title: "Ahmed Al-Rashidi promoted to CIO",                    type: "exec_move"       as const, contact_id: cAhmedC.id,   company_id: cRiyadh.id,       score: 87, source_url: "https://linkedin.com",        status: "new"    as const, body: "Ahmed promoted from VP IT to CIO — full budget authority now.", org_id: "default" },
      { title: "Al-Noor Investments opens Kuwait office",             type: "expansion"       as const, contact_id: cFatima.id,   company_id: cAlNoor.id,       score: 74, source_url: "https://zawya.com",           status: "viewed" as const, body: "Al-Noor expanding to Kuwait — 150+ new employees over 12 months.", org_id: "default" },
      { title: "Aramco Digital hiring 200 sales reps",                type: "hiring"          as const, contact_id: cMohammed.id, company_id: cAramco.id,       score: 79, source_url: "https://linkedin.com",        status: "new"    as const, body: "200 sales positions posted — strong buying signal for CRM tooling.", org_id: "default" },
      { title: "NEOM announces $1.5B smart systems RFP",              type: "news"            as const, contact_id: cRashid.id,   company_id: cNEOM.id,         score: 93, source_url: "https://neom.com",            status: "new"    as const, body: "NEOM smart city systems RFP issued — CRM is a core component.", org_id: "default" },
      { title: "Mubadala increases GCC tech portfolio by 40%",        type: "funding_round"   as const, contact_id: cHessa.id,    company_id: cMubadala.id,     score: 85, source_url: "https://mubadala.ae",         status: "new"    as const, body: "$4B allocated to GCC tech investments in 2026.", org_id: "default" },
      { title: "stc launches enterprise digital sales program",       type: "product_launch"  as const, contact_id: cFaisal.id,   company_id: cstc.id,          score: 78, source_url: "https://stc.com.sa",          status: "new"    as const, body: "stc expanding B2B enterprise sales team by 300 reps — CRM urgently needed.", org_id: "default" },
      { title: "QNB wins Best Digital Bank award",                    type: "news"            as const, contact_id: cAbdullah.id, company_id: cQNB.id,          score: 71, source_url: "https://euromoney.com",       status: "viewed" as const, body: "QNB recognised for digital banking — CDO Abdullah driving the next phase.", org_id: "default" },
      { title: "Emaar Properties Q2 record sales — needs CRM scale", type: "news"            as const, contact_id: cSaeed.id,    company_id: cEmaar.id,        score: 82, source_url: "https://bloomberg.com",       status: "new"    as const, body: "Record $2.1B in Q2 sales — existing CRM can't scale. Evaluating NexFlow.", org_id: "default" },
      { title: "SABIC digital transformation partnership signed",     type: "news"            as const, contact_id: cLayla.id,    company_id: cSabic.id,        score: 55, source_url: "https://arabianbusiness.com", status: "new"    as const, body: "SABIC signed 5-year digital transformation deal with Accenture.", org_id: "default" },
      { title: "Zain Group CFO replaced — new digital strategy",      type: "exec_move"       as const, contact_id: cAli.id,      company_id: cZain.id,         score: 68, source_url: "https://linkedin.com",        status: "new"    as const, body: "C-suite change at Zain — new digital-first strategy underway.", org_id: "default" },
      { title: "Al Rajhi Bank launches fintech accelerator",          type: "product_launch"  as const, contact_id: cTurki.id,    company_id: cAlRajhi.id,      score: 64, source_url: "https://arabianbusiness.com", status: "viewed" as const, body: "Al Rajhi Bank creating a $100M fintech accelerator — CRM for relationship management.", org_id: "default" },
    ]);

    // ── 6. Activities (50+) ───────────────────────────────────────────────
    await db.insert(activities).values([
      { contact_id: cSaraC.id,    type: "call"     as const, status: "completed" as const, title: "Discovery call",                      body: "Discussed Series B expansion needs. Very high intent. Following up with proposal.", owner_id: u0.id, org_id: "default", completed_at: new Date(Date.now() - 2*86400_000) },
      { contact_id: cSaraC.id,    type: "note"     as const, status: "completed" as const, title: "CRM notes",                           body: "Sara confirmed she is sole decision-maker. No legal review needed for <$300K contracts.", owner_id: u0.id, org_id: "default", completed_at: new Date(Date.now() - 1*86400_000) },
      { contact_id: cAhmedC.id,   type: "email"    as const, status: "completed" as const, title: "Congratulations on CIO promotion",     body: "Sent personalised email. Replied within 2h — very engaged.", owner_id: u1.id, org_id: "default", completed_at: new Date(Date.now() - 5*86400_000) },
      { contact_id: cAhmedC.id,   type: "meeting"  as const, status: "completed" as const, title: "Executive demo — Riyadh Capital",      body: "Full exec team demo. 45 minutes. Ahmed asked about SSO and Arabic UI.", owner_id: u1.id, org_id: "default", completed_at: new Date(Date.now() - 3*86400_000) },
      { contact_id: cNora.id,     type: "meeting"  as const, status: "completed" as const, title: "Technical demo — Riyadh Capital",      body: "Nora impressed with pipeline automation. Asked for security whitepaper.", owner_id: u2.id, org_id: "default", completed_at: new Date(Date.now() - 3*86400_000) },
      { contact_id: cFatima.id,   type: "whatsapp" as const, status: "completed" as const, title: "Follow-up on demo",                   body: "She prefers WhatsApp. Confirmed next steps via voice note.", owner_id: u3.id, org_id: "default", completed_at: new Date(Date.now() - 7*86400_000) },
      { contact_id: cMohammed.id, type: "call"     as const, status: "completed" as const, title: "Budget approval confirmation",         body: "Q2 budget confirmed. Ready to advance to negotiation.", owner_id: u3.id, org_id: "default", completed_at: new Date(Date.now() - 10*86400_000) },
      { contact_id: cLayla.id,    type: "email"    as const, status: "completed" as const, title: "Re-engagement outreach",              body: "Sent personalised email referencing SABIC digital transformation news.", owner_id: u2.id, org_id: "default", completed_at: new Date(Date.now() - 8*86400_000) },
      { contact_id: cKhalidC.id,  type: "call"     as const, status: "pending"   as const, title: "Pilot expansion discussion",          body: "No answer. 2nd missed call this week. Sent WhatsApp.", owner_id: u1.id, org_id: "default" },
      { contact_id: cAbdullah.id, type: "meeting"  as const, status: "completed" as const, title: "QNB executive briefing",              body: "Presented NexFlow to CDO and 4 VPs. Strong interest in AI features.", owner_id: u4.id, org_id: "default", completed_at: new Date(Date.now() - 4*86400_000) },
      { contact_id: cSaeed.id,    type: "call"     as const, status: "completed" as const, title: "Emaar negotiation prep",              body: "Discussed contract terms. Emaar legal reviewing MSA.", owner_id: u0.id, org_id: "default", completed_at: new Date(Date.now() - 6*86400_000) },
      { contact_id: cFaisal.id,   type: "email"    as const, status: "completed" as const, title: "RFP response submitted",              body: "Submitted 85-page RFP response to stc procurement team.", owner_id: u2.id, org_id: "default", completed_at: new Date(Date.now() - 7*86400_000) },
      { contact_id: cBader.id,    type: "meeting"  as const, status: "completed" as const, title: "KFH compliance walkthrough",          body: "Sharia board approved CRM concept. Compliance module development confirmed.", owner_id: u3.id, org_id: "default", completed_at: new Date(Date.now() - 5*86400_000) },
      { contact_id: cRashid.id,   type: "meeting"  as const, status: "completed" as const, title: "NEOM site visit",                     body: "On-site demo at NEOM HQ. Rashid gave greenlight. Security review next.", owner_id: u1.id, org_id: "default", completed_at: new Date(Date.now() - 3*86400_000) },
      { contact_id: cHessa.id,    type: "call"     as const, status: "completed" as const, title: "Mubadala deal review",                body: "Hessa confirmed 40 portfolio companies will use NexFlow. Contract 85% agreed.", owner_id: u3.id, org_id: "default", completed_at: new Date(Date.now() - 4*86400_000) },
      { contact_id: cAli.id,      type: "email"    as const, status: "completed" as const, title: "Zain Group proposal follow-up",       body: "Sent revised pricing proposal with multi-country discount.", owner_id: u0.id, org_id: "default", completed_at: new Date(Date.now() - 6*86400_000) },
      { contact_id: cTurki.id,    type: "meeting"  as const, status: "completed" as const, title: "Al Rajhi SAMA compliance review",     body: "Walked through SAMA compliance checklist. 3 minor gaps to address.", owner_id: u1.id, org_id: "default", completed_at: new Date(Date.now() - 5*86400_000) },
      { contact_id: cNoura.id,    type: "whatsapp" as const, status: "completed" as const, title: "QNB innovation lab follow-up",        body: "Noura excited about AI pipeline prediction. Asking for extended trial.", owner_id: u4.id, org_id: "default", completed_at: new Date(Date.now() - 6*86400_000) },
      { contact_id: cYara.id,     type: "call"     as const, status: "completed" as const, title: "Vision 2030 budget confirmation",     body: "National transformation fund budget allocated. Purchase order before June 30.", owner_id: u1.id, org_id: "default", completed_at: new Date(Date.now() - 5*86400_000) },
      { contact_id: cZayed.id,    type: "email"    as const, status: "completed" as const, title: "VC portfolio CRM proposal",           body: "Sent proposal for 15 portfolio companies. Zayed very interested in bulk pricing.", owner_id: u4.id, org_id: "default", completed_at: new Date(Date.now() - 6*86400_000) },
      { contact_id: cDana.id,     type: "meeting"  as const, status: "completed" as const, title: "Bahrain FinTech Bay meetup",          body: "Met Dana at FinTech Summit. Strong network potential. Small deal, big referrals.", owner_id: u0.id, org_id: "default", completed_at: new Date(Date.now() - 8*86400_000) },
      { contact_id: cWaleed.id,   type: "call"     as const, status: "completed" as const, title: "Jadwa investor relations briefing",   body: "Discussed investor portal integration with Jadwa MD.", owner_id: u2.id, org_id: "default", completed_at: new Date(Date.now() - 10*86400_000) },
      { contact_id: cRami.id,     type: "email"    as const, status: "completed" as const, title: "MAF retail pilot proposal",           body: "Sent pilot proposal for Carrefour and VOX Cinemas brands.", owner_id: u1.id, org_id: "default", completed_at: new Date(Date.now() - 9*86400_000) },
      { contact_id: cSalim.id,    type: "call"     as const, status: "completed" as const, title: "Oman Oil CCO intro call",             body: "Good initial conversation. Salim interested in pipeline management feature.", owner_id: u4.id, org_id: "default", completed_at: new Date(Date.now() - 11*86400_000) },
      { contact_id: cMaitha.id,   type: "email"    as const, status: "completed" as const, title: "Dubai Airports commercial CRM intro", body: "Sent overview deck. Maitha forwarded to IT procurement team.", owner_id: u2.id, org_id: "default", completed_at: new Date(Date.now() - 9*86400_000) },
    ]);

    // ── 7. Calls (25+) ────────────────────────────────────────────────────
    await db.insert(calls).values([
      { contact_id: cSaraC.id,    direction: "outbound" as const, status: "completed" as const, duration_seconds: 1820, transcript: "Sara confirmed Series B funds are allocated. Decision expected end of month. Proposal accepted in principle.", ai_insights: { summary: "High-intent close. Send MSA immediately.", sentiment: "very positive", next_action: "Send MSA contract" }, call_score: 94, owner_id: u0.id, org_id: "default", started_at: new Date(Date.now() - 2*86400_000) },
      { contact_id: cAhmedC.id,   direction: "outbound" as const, status: "completed" as const, duration_seconds: 2340, transcript: "Ahmed asked detailed questions about SSO, audit logs, and Arabic UI. Very technical. Requested security questionnaire.", ai_insights: { summary: "Strong technical interest. Send security docs and Arabic UI demo.", sentiment: "positive", next_action: "Send security questionnaire" }, call_score: 88, owner_id: u1.id, org_id: "default", started_at: new Date(Date.now() - 5*86400_000) },
      { contact_id: cNora.id,     direction: "outbound" as const, status: "completed" as const, duration_seconds: 3120, transcript: "Nora tested API integrations, mobile app, and pipeline automation. Gave 8/10 rating. Main concern: data residency in KSA.", ai_insights: { summary: "Address data residency concern with KSA hosting option.", sentiment: "positive", next_action: "Send KSA data residency documentation" }, call_score: 79, owner_id: u2.id, org_id: "default", started_at: new Date(Date.now() - 4*86400_000) },
      { contact_id: cMohammed.id, direction: "inbound"  as const, status: "completed" as const, duration_seconds: 1200, transcript: "Mohammed called to confirm Q2 budget approved. Ready to move to negotiation. Wants kickoff by June 1.", ai_insights: { summary: "Move deal to negotiation. Prepare kickoff timeline.", sentiment: "very positive", next_action: "Draft kickoff timeline and send contract" }, call_score: 91, owner_id: u3.id, org_id: "default", started_at: new Date(Date.now() - 9*86400_000) },
      { contact_id: cKhalidC.id,  direction: "outbound" as const, status: "missed"    as const, duration_seconds: 0,    transcript: null, ai_insights: null, call_score: null, owner_id: u1.id, org_id: "default", started_at: new Date(Date.now() - 14*86400_000) },
      { contact_id: cAbdullah.id, direction: "outbound" as const, status: "completed" as const, duration_seconds: 2700, transcript: "Abdullah requested a full procurement process. RFP will be issued Q3. However internal champion is pushing for fast-track evaluation.", ai_insights: { summary: "QNB going through formal RFP. Support Abdullah as internal champion.", sentiment: "positive", next_action: "Provide RFP support materials" }, call_score: 85, owner_id: u4.id, org_id: "default", started_at: new Date(Date.now() - 4*86400_000) },
      { contact_id: cSaeed.id,    direction: "outbound" as const, status: "completed" as const, duration_seconds: 1560, transcript: "Emaar legal team reviewing the MSA. Saeed expects sign-off within 2 weeks. Main concern is data privacy for customer records.", ai_insights: { summary: "MSA in legal review. Follow up on data privacy clauses.", sentiment: "positive", next_action: "Send GDPR + UAE PDPL compliance summary" }, call_score: 82, owner_id: u0.id, org_id: "default", started_at: new Date(Date.now() - 6*86400_000) },
      { contact_id: cFaisal.id,   direction: "outbound" as const, status: "completed" as const, duration_seconds: 2100, transcript: "stc procurement told us we are in top 3. Faisal wants executive reference calls with existing GCC customers.", ai_insights: { summary: "In top 3. Arrange reference calls with GCC enterprise customers.", sentiment: "positive", next_action: "Set up reference calls" }, call_score: 80, owner_id: u2.id, org_id: "default", started_at: new Date(Date.now() - 7*86400_000) },
      { contact_id: cBader.id,    direction: "outbound" as const, status: "completed" as const, duration_seconds: 1900, transcript: "KFH Sharia board approved the CRM conceptually. Bader needs detailed Islamic finance data handling documentation.", ai_insights: { summary: "Sharia approved. Send Islamic finance data handling docs.", sentiment: "positive", next_action: "Prepare Islamic finance documentation" }, call_score: 84, owner_id: u3.id, org_id: "default", started_at: new Date(Date.now() - 5*86400_000) },
      { contact_id: cRashid.id,   direction: "outbound" as const, status: "completed" as const, duration_seconds: 3600, transcript: "NEOM site visit call. Rashid confirmed NexFlow is preferred vendor. Security clearance process will take 6 weeks. Deal size may expand to $800K.", ai_insights: { summary: "Preferred vendor at NEOM. Prepare for security clearance process.", sentiment: "very positive", next_action: "Start NEOM security clearance documentation" }, call_score: 93, owner_id: u1.id, org_id: "default", started_at: new Date(Date.now() - 3*86400_000) },
      { contact_id: cHessa.id,    direction: "outbound" as const, status: "completed" as const, duration_seconds: 2200, transcript: "Hessa confirmed deal. Legal terms 85% agreed. One clause on data sovereignty to resolve. Expects to sign within 10 days.", ai_insights: { summary: "Close to signing. Resolve data sovereignty clause.", sentiment: "very positive", next_action: "Negotiate data sovereignty clause" }, call_score: 89, owner_id: u3.id, org_id: "default", started_at: new Date(Date.now() - 4*86400_000) },
      { contact_id: cAli.id,      direction: "outbound" as const, status: "completed" as const, duration_seconds: 1650, transcript: "Zain legal team requested multi-country data residency options. Ali positive about pricing. MENA-wide deployment aligns with new digital strategy.", ai_insights: { summary: "Positive on pricing. Provide multi-country data residency options.", sentiment: "positive", next_action: "Prepare multi-country deployment architecture" }, call_score: 78, owner_id: u0.id, org_id: "default", started_at: new Date(Date.now() - 6*86400_000) },
      { contact_id: cTurki.id,    direction: "outbound" as const, status: "completed" as const, duration_seconds: 1980, transcript: "SAMA compliance gaps: need enhanced audit logging, data residency in KSA, and Arabic-language support documentation.", ai_insights: { summary: "3 SAMA compliance gaps to address. Prioritize for Al Rajhi deal.", sentiment: "neutral", next_action: "Prepare SAMA compliance gap closure plan" }, call_score: 76, owner_id: u1.id, org_id: "default", started_at: new Date(Date.now() - 5*86400_000) },
      { contact_id: cFatima.id,   direction: "outbound" as const, status: "completed" as const, duration_seconds: 1440, transcript: "Fatima demoed NexFlow to her team. Two team members loved the WhatsApp integration. Budget committee meeting next Tuesday.", ai_insights: { summary: "Team demo went well. Budget decision Tuesday.", sentiment: "positive", next_action: "Send ROI calculator before Tuesday budget meeting" }, call_score: 77, owner_id: u3.id, org_id: "default", started_at: new Date(Date.now() - 7*86400_000) },
      { contact_id: cYara.id,     direction: "inbound"  as const, status: "completed" as const, duration_seconds: 900,  transcript: "Yara called to confirm Vision 2030 budget approval. Purchase order expected before June 30. Needs fast onboarding timeline.", ai_insights: { summary: "Budget confirmed. Send PO and onboarding timeline immediately.", sentiment: "very positive", next_action: "Issue PO paperwork and onboarding plan" }, call_score: 92, owner_id: u1.id, org_id: "default", started_at: new Date(Date.now() - 5*86400_000) },
      { contact_id: cWaleed.id,   direction: "outbound" as const, status: "completed" as const, duration_seconds: 1320, transcript: "Jadwa evaluating 3 vendors. NexFlow scored highest on mobile app and Arabic support. Budget Q4.", ai_insights: { summary: "Leading evaluation. Budget in Q4 — stay engaged.", sentiment: "positive", next_action: "Monthly check-in to maintain relationship" }, call_score: 72, owner_id: u2.id, org_id: "default", started_at: new Date(Date.now() - 10*86400_000) },
      { contact_id: cNoura.id,    direction: "outbound" as const, status: "completed" as const, duration_seconds: 720,  transcript: "Noura testing AI prediction in innovation lab. Impressed by lead scoring accuracy. Wants case study on banking use case.", ai_insights: { summary: "Send banking sector case study. She is an active internal champion.", sentiment: "positive", next_action: "Send banking CRM case study" }, call_score: 74, owner_id: u4.id, org_id: "default", started_at: new Date(Date.now() - 6*86400_000) },
      { contact_id: cDana.id,     direction: "outbound" as const, status: "missed"    as const, duration_seconds: 0,    transcript: null, ai_insights: null, call_score: null, owner_id: u0.id, org_id: "default", started_at: new Date(Date.now() - 8*86400_000) },
      { contact_id: cLayla.id,    direction: "outbound" as const, status: "missed"    as const, duration_seconds: 0,    transcript: null, ai_insights: null, call_score: null, owner_id: u2.id, org_id: "default", started_at: new Date(Date.now() - 20*86400_000) },
      { contact_id: cHamad.id,    direction: "outbound" as const, status: "completed" as const, duration_seconds: 1050, transcript: "Hamad needs detailed ROI analysis before presenting to board. Wants to see payback period under 12 months.", ai_insights: { summary: "Prepare ROI model showing <12 month payback.", sentiment: "neutral", next_action: "Build custom ROI model for Riyadh Capital" }, call_score: 67, owner_id: u1.id, org_id: "default", started_at: new Date(Date.now() - 8*86400_000) },
    ]);

    // ── 8. Notifications ──────────────────────────────────────────────────
    await db.insert(notifications).values([
      { type: "signal" as const, title: "New funding signal",             body: "Gulf Ventures closed $50M Series B — contact Sara Al-Mansouri within 24h.", read: false, org_id: "default" },
      { type: "signal" as const, title: "Executive move detected",        body: "Ahmed Al-Rashidi promoted to CIO at Riyadh Capital. Update deal authority.", read: false, org_id: "default" },
      { type: "deal"   as const, title: "Deal at risk — SABIC",          body: "SABIC Solutions SMB Starter has had no activity in 9 days. Take action now.", read: false, org_id: "default" },
      { type: "call"   as const, title: "Call missed — Khalid Al-Hamdan", body: "2nd missed call this week. Try WhatsApp instead.", read: true,  org_id: "default" },
      { type: "deal"   as const, title: "Deal closed — Gulf Ventures",    body: "Gulf Ventures portfolio add-on closed! $75,000 booked.", read: true, org_id: "default" },
      { type: "signal" as const, title: "NEOM expansion signal",          body: "NEOM issued $1.5B smart systems RFP — CRM is a core component. Act now.", read: false, org_id: "default" },
      { type: "signal" as const, title: "Mubadala fund expansion",        body: "$4B allocated to GCC tech — Hessa is accelerating the portfolio CRM rollout.", read: false, org_id: "default" },
      { type: "deal"   as const, title: "QNB deal progressing",           body: "QNB CDO Abdullah confirmed entering formal RFP — we are frontrunner.", read: false, org_id: "default" },
      { type: "signal" as const, title: "stc enterprise program launch",  body: "stc expanding enterprise sales by 300 reps — CRM urgently needed before Q3.", read: false, org_id: "default" },
      { type: "call"   as const, title: "Inbound call — Mohammed Aramco", body: "Mohammed called in to confirm Q2 budget. Move Aramco deal to negotiation.", read: true,  org_id: "default" },
      { type: "deal"   as const, title: "Emaar deal nearing close",       body: "Emaar legal reviewing MSA. Expect signatures within 2 weeks.", read: false, org_id: "default" },
      { type: "signal" as const, title: "Vision 2030 budget alert",       body: "Yara Al-Suleiman confirmed PNF budget. Purchase order expected June 30.", read: false, org_id: "default" },
    ]);

    // ── 9. AI Agents ──────────────────────────────────────────────────────
    await db.insert(ai_agents).values([
      { name: "Pipeline Pulse",    description: "Daily 60-second pipeline briefing",                            icon: "Activity",      system_prompt: "You are Pipeline Pulse — a daily briefer who summarizes CRM pipeline activity in under 60 seconds. Focus on movement, risk, and the single most important action.", enabled: true, org_id: "default" },
      { name: "Objection Crusher", description: "Generates Arabic + English objection responses on demand",    icon: "Shield",        system_prompt: "You handle sales objections in both English and Arabic. For any objection, return: 1) acknowledgement, 2) reframe, 3) proof point, 4) next step.", enabled: true, org_id: "default" },
      { name: "Deal Risk Scout",   description: "Surfaces deals at risk of slipping before they go cold",      icon: "AlertTriangle", system_prompt: "You analyze deal pipelines and identify at-risk deals using stage age, engagement decay, and missing stakeholders. Output is a ranked list with reasoning.", enabled: true, org_id: "default" },
      { name: "Cultural Advisor",  description: "GCC cultural intelligence for outreach timing and messaging",  icon: "Globe",         system_prompt: "You advise on GCC cultural norms for sales outreach. Provide: preferred greeting, best contact time, Ramadan/Eid considerations, and relationship-building tips by country.", enabled: true, org_id: "default" },
      { name: "Email Composer",    description: "Writes personalised Arabic and English sales emails",          icon: "Mail",          system_prompt: "You write personalised sales emails in both Arabic and English. Always include: 1) personalised hook, 2) value prop, 3) social proof, 4) clear CTA. Tone: professional but warm.", enabled: true, org_id: "default" },
    ]);

    // ── 10. Campaigns ─────────────────────────────────────────────────────
    // Insert one at a time to avoid batch param-count issues with nullable utm fields
    await db.insert(campaigns).values({ name: "Q2 Dormant Re-engagement",      channel: "email"    as const, status: "draft"     as const, utm_source: "newsletter", utm_medium: "email", utm_campaign: "q2_reengage",     org_id: "default" });
    await db.insert(campaigns).values({ name: "MENA Enterprise Webinar",       channel: "email"    as const, status: "running"   as const, utm_source: "webinar",    utm_medium: "email", utm_campaign: "mena_webinar_q2", org_id: "default" });
    await db.insert(campaigns).values({ name: "WhatsApp Cold Outreach",        channel: "whatsapp" as const, status: "draft"     as const, org_id: "default" });
    await db.insert(campaigns).values({ name: "Vision 2030 Prospect Blast",    channel: "email"    as const, status: "running"   as const, utm_source: "direct",     utm_medium: "email", utm_campaign: "v2030_prospects", org_id: "default" });
    await db.insert(campaigns).values({ name: "GCC CIO Summit Follow-up",      channel: "email"    as const, status: "completed" as const, utm_source: "event",      utm_medium: "email", utm_campaign: "cio_summit_fup",  org_id: "default" });
    await db.insert(campaigns).values({ name: "Ramadan Relationship Campaign",  channel: "whatsapp" as const, status: "paused"   as const, org_id: "default" });
    await db.insert(campaigns).values({ name: "Banking Sector Deep Dive",      channel: "email"    as const, status: "draft"     as const, utm_source: "newsletter", utm_medium: "email", utm_campaign: "banking_deep",    org_id: "default" });

    // ── 11. Automation Rules ──────────────────────────────────────────────
    await db.insert(automation_rules).values([
      { name: "Demo Completed → Proposal",     description: "When a meeting is completed for a qualified deal, advance to Proposal",    trigger: "activity_completed" as const, trigger_config: { activity_type: "meeting" }, actions: [{ type: "advance_stage", from_stage: "qualified", to_stage: "proposal" }],                                                   enabled: true,  owner_id: u0.id, org_id: "default" },
      { name: "No Answer → WhatsApp + Retry",  description: "After 2 unanswered calls, send WhatsApp and schedule retry",              trigger: "no_answer"          as const, trigger_config: { threshold: 2 },            actions: [{ type: "log_note", message: "Trigger WhatsApp template + create retry task." }],                                       enabled: true,  owner_id: u1.id, org_id: "default" },
      { name: "Stalled Deal Alert",            description: "Create task for any deal stuck in stage > 14 days",                       trigger: "schedule"           as const, trigger_config: { cron: "0 9 * * *" },       actions: [{ type: "create_task", target: "all_open_deals", title: "Review stalled deal" }],                                       enabled: true,  owner_id: u2.id, org_id: "default" },
      { name: "High Score Lead → SDR Assign",  description: "Auto-assign lead to SDR when score exceeds 80",                           trigger: "score_threshold"    as const, trigger_config: { threshold: 80 },           actions: [{ type: "assign_owner", role: "SDR" }],                                                                                  enabled: true,  owner_id: u3.id, org_id: "default" },
      { name: "Funding Signal → Notify AE",    description: "Alert AE when funding signal detected for a contact",                     trigger: "signal_received"    as const, trigger_config: { signal_type: "funding" },  actions: [{ type: "send_notification", message: "Funding signal detected — contact within 24h." }],                             enabled: true,  owner_id: u0.id, org_id: "default" },
      { name: "Ramadan Pause Outreach",        description: "Pause all automated outreach during Ramadan for opted-out contacts",       trigger: "schedule"           as const, trigger_config: { cron: "0 0 1 3 *" },       actions: [{ type: "pause_sequences", list: "Ramadan Pause List" }],                                                              enabled: false, owner_id: u2.id, org_id: "default" },
    ]);

    // ── 12. Custom Properties ─────────────────────────────────────────────
    await db.insert(custom_properties).values([
      { object_type: "contact" as const, name: "decision_authority",    label: "Decision Authority",        type: "select"  as const, options: { values: ["Decision Maker", "Influencer", "User", "Champion", "Economic Buyer"] },           org_id: "default", display_order: 0 },
      { object_type: "contact" as const, name: "preferred_language",    label: "Preferred Language",        type: "select"  as const, options: { values: ["English", "Arabic", "Bilingual", "French"] },                                      org_id: "default", display_order: 1 },
      { object_type: "contact" as const, name: "annual_budget",         label: "Annual Budget (USD)",       type: "number"  as const,                                                                                                          org_id: "default", display_order: 2 },
      { object_type: "contact" as const, name: "whatsapp_preferred",    label: "WhatsApp Preferred",        type: "boolean" as const,                                                                                                          org_id: "default", display_order: 3 },
      { object_type: "contact" as const, name: "wasta_tier",            label: "Wasta / Relationship Tier", type: "select"  as const, options: { values: ["Royal adjacent", "Minister level", "Director General", "Senior Gov", "Private sector leader", "Standard"] }, org_id: "default", display_order: 4 },
      { object_type: "contact" as const, name: "vision_2030_budget",    label: "Vision 2030 Budget Access", type: "boolean" as const,                                                                                                          org_id: "default", display_order: 5 },
      { object_type: "company" as const, name: "current_crm",           label: "Current CRM",               type: "select"  as const, options: { values: ["Salesforce", "HubSpot", "Pipedrive", "Zoho", "Microsoft Dynamics", "SAP", "None", "Other"] }, org_id: "default", display_order: 6 },
      { object_type: "company" as const, name: "renewal_month",         label: "Contract Renewal Month",    type: "date"    as const,                                                                                                          org_id: "default", display_order: 7 },
      { object_type: "company" as const, name: "is_government",         label: "Government Entity",         type: "boolean" as const,                                                                                                          org_id: "default", display_order: 8 },
      { object_type: "deal"    as const, name: "competitor",            label: "Main Competitor",           type: "text"    as const,                                                                                                          org_id: "default", display_order: 9 },
      { object_type: "deal"    as const, name: "champion_engaged",      label: "Champion Engaged",          type: "boolean" as const,                                                                                                          org_id: "default", display_order: 10 },
      { object_type: "deal"    as const, name: "sharia_compliance",     label: "Sharia Compliance Required",type: "boolean" as const,                                                                                                          org_id: "default", display_order: 11 },
    ]);

    // ── 13. Static Lists ──────────────────────────────────────────────────
    const listRows = await db.insert(static_lists).values([
      { name: "Hot MENA Decision Makers", description: "C-level prospects in MENA with active signals",      color: "#B8A0C8", owner_id: u0.id, org_id: "default", object_type: "contact" as const },
      { name: "Q2 Re-engagement",         description: "Dormant leads to re-engage this quarter",            color: "#88B8B0", owner_id: u1.id, org_id: "default", object_type: "contact" as const },
      { name: "Enterprise Pipeline",      description: "Deals over $100K",                                   color: "#C8A880", owner_id: u2.id, org_id: "default", object_type: "contact" as const },
      { name: "Ramadan Pause List",       description: "Contacts to slow outreach during Ramadan",           color: "#90B8B8", owner_id: u3.id, org_id: "default", object_type: "contact" as const },
      { name: "Vision 2030 Prospects",    description: "Contacts with active Vision 2030 budget access",     color: "#C0A0B8", owner_id: u1.id, org_id: "default", object_type: "contact" as const },
      { name: "Banking & Finance Sector", description: "All banking and financial services contacts",        color: "#B8B880", owner_id: u4.id, org_id: "default", object_type: "contact" as const },
    ]).returning();

    const hotIds = [cSaraC.id, cAhmedC.id, cNora.id, cAbdullah.id, cHessa.id, cRashid.id];
    const v2030Ids = [cRashid.id, cYara.id, cLina.id, cMohammed.id];
    const bankIds = [cAbdullah.id, cNoura.id, cBader.id, cTurki.id, cShahad.id, cRanda.id];
    const [hotList, reengageList, entList, ramadanList, v2030List, bankList] = listRows;
    for (const cid of hotIds)    await db.insert(static_list_members).values({ list_id: hotList.id,     entity_id: cid }).onConflictDoNothing();
    for (const cid of v2030Ids)  await db.insert(static_list_members).values({ list_id: v2030List.id,   entity_id: cid }).onConflictDoNothing();
    for (const cid of bankIds)   await db.insert(static_list_members).values({ list_id: bankList.id,    entity_id: cid }).onConflictDoNothing();

    // ── 14. Dashboard ─────────────────────────────────────────────────────
    const [dash] = await db.insert(dashboards).values({
      name: "Sales Command Center", description: "Default executive dashboard",
      owner_id: u0.id, is_shared: true, org_id: "default",
    }).returning();
    await db.insert(dashboard_widgets).values([
      { type: "metric",      title: "Open Deals",      config: { metric: "deals_open" },                          position: 0, width: "sm", dashboard_id: dash.id },
      { type: "metric",      title: "Pipeline Value",  config: { metric: "pipeline_value", format: "currency" },  position: 1, width: "sm", dashboard_id: dash.id },
      { type: "metric",      title: "Won This Month",  config: { metric: "won_value",      format: "currency" },  position: 2, width: "sm", dashboard_id: dash.id },
      { type: "metric",      title: "Calls (7d)",      config: { metric: "calls_completed" },                     position: 3, width: "sm", dashboard_id: dash.id },
      { type: "funnel",      title: "Sales Funnel",    config: {},                                                 position: 4, width: "lg", dashboard_id: dash.id },
      { type: "leaderboard", title: "Top Reps",        config: {},                                                 position: 5, width: "md", dashboard_id: dash.id },
    ]);

    console.log("[autoSeed] ✅ Demo data seeded — 40 contacts, 21 deals, 25 calls, 25 activities.");
  } catch (err: any) {
    console.error("[autoSeed] ❌ Seed failed:", err?.message ?? err);
  }
}
