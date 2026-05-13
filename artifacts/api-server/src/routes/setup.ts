/**
 * Enterprise Setup Wizard routes
 *
 * POST   /api/setup/sessions              — create a new session
 * GET    /api/setup/sessions/:id          — get session state
 * PATCH  /api/setup/sessions/:id          — update answers
 * POST   /api/setup/sessions/:id/proposal — generate / regenerate AI proposal
 * POST   /api/setup/sessions/:id/approve  — approve and provision tenant
 * GET    /api/setup/sessions/:id/config   — get final tenant config
 */

import { Router } from "express";
import { db } from "@workspace/db";
import { setup_sessions, setup_proposals, tenant_configs } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { aiJson } from "../lib/ai.js";
import { randomUUID } from "crypto";

const router = Router();

// ── helpers ─────────────────────────────────────────────────────────────────

function calcPricing(answers: any, setupPath: string) {
  const totalSeats = (answers.seatsSales ?? 0) + (answers.seatsSDR ?? 0) +
                     (answers.seatsMarketing ?? 0) + (answers.seatsManagement ?? 0);
  const dialerSeats = (answers.seatsSales ?? 0) + (answers.seatsSDR ?? 0);
  const mods: string[] = answers.enabledModules ?? ["core"];

  const lines: { name: string; unit: string; monthly: number }[] = [];
  const seats = Math.max(totalSeats, 1);
  lines.push({ name: "Core CRM", unit: `SAR 149 × ${seats} seats`, monthly: 149 * seats });

  if (mods.includes("dialer") && dialerSeats > 0)
    lines.push({ name: "Power Dialer", unit: `SAR 89 × ${dialerSeats} seats`, monthly: 89 * dialerSeats });
  if (mods.includes("enrichment")) {
    const credits = answers.enrichmentCreditsMonthly ?? 1000;
    const cost = credits > 5000 ? 800 : credits > 1000 ? 200 : 50;
    lines.push({ name: "AI Enrichment", unit: `${credits.toLocaleString()} credits/mo`, monthly: cost });
  }
  if (mods.includes("marketing"))        lines.push({ name: "Marketing Suite",    unit: "Flat rate", monthly: 299  });
  if (mods.includes("voice-agents"))     lines.push({ name: "AI Voice Agents",    unit: "1k min",    monthly: 599  });
  if (mods.includes("intelligence"))     lines.push({ name: "Conversation Intel", unit: "Flat rate", monthly: 199  });
  if (mods.includes("forecasting"))      lines.push({ name: "Forecasting",        unit: "Flat rate", monthly: 149  });
  if (mods.includes("cpq"))             lines.push({ name: "CPQ & Quotes",       unit: "Flat rate", monthly: 99   });
  if (mods.includes("website-tracking")) lines.push({ name: "Website Tracking",   unit: "Flat rate", monthly: 199  });

  const totalMonthly = lines.reduce((s, l) => s + l.monthly, 0);
  let setupFee = 0;
  if (setupPath === "managed") {
    if (seats <= 10) setupFee = 5_000;
    else if (seats <= 50) setupFee = 12_000;
    else if (seats <= 200) setupFee = 25_000;
    else setupFee = 45_000;
  }
  let weeks = 4;
  if (answers.migrationNeeded) weeks += 2;
  if (seats > 100) weeks += 2;
  if (setupPath === "self") weeks += 1;

  return { lines, totalMonthly, setupFee, timelineWeeks: weeks, annualTotal: totalMonthly * 12 + setupFee };
}

// ── POST /sessions ────────────────────────────────────────────────────────────
router.post("/sessions", async (req, res) => {
  try {
    const { setupPath = "managed" } = req.body as { setupPath?: "managed" | "self" };
    const id = randomUUID();
    const [row] = await db.insert(setup_sessions).values({
      id,
      setup_path: setupPath,
      status: "draft",
      answers: {},
    }).returning();
    res.status(201).json({
      id: row.id,
      setupPath: row.setup_path,
      status: row.status,
      answers: row.answers,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// ── GET /sessions/:id ─────────────────────────────────────────────────────────
router.get("/sessions/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(setup_sessions).where(eq(setup_sessions.id, req.params.id));
    if (!row) { res.status(404).json({ error: "Session not found" }); return; }
    res.json({
      id: row.id,
      setupPath: row.setup_path,
      status: row.status,
      answers: row.answers,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// ── PATCH /sessions/:id ───────────────────────────────────────────────────────
router.patch("/sessions/:id", async (req, res) => {
  try {
    const [existing] = await db.select().from(setup_sessions).where(eq(setup_sessions.id, req.params.id));
    if (!existing) { res.status(404).json({ error: "Session not found" }); return; }

    const mergedAnswers = { ...(existing.answers as object), ...(req.body.answers ?? {}) };
    const [row] = await db.update(setup_sessions)
      .set({ answers: mergedAnswers, updated_at: new Date() })
      .where(eq(setup_sessions.id, req.params.id))
      .returning();

    res.json({
      id: row.id,
      setupPath: row.setup_path,
      status: row.status,
      answers: row.answers,
      updatedAt: row.updated_at,
    });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update session" });
  }
});

// ── POST /sessions/:id/proposal ───────────────────────────────────────────────
router.post("/sessions/:id/proposal", async (req, res) => {
  try {
    const [session] = await db.select().from(setup_sessions).where(eq(setup_sessions.id, req.params.id));
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }

    const answers = session.answers as any;
    const setupPath = (req.body.setupPath ?? session.setup_path) as string;
    const pricing = calcPricing(answers, setupPath);

    // Get version number
    const existing = await db.select().from(setup_proposals)
      .where(eq(setup_proposals.session_id, req.params.id))
      .orderBy(desc(setup_proposals.version));
    const version = (existing[0]?.version ?? 0) + 1;

    // AI generation with fallback
    const modules = (answers.enabledModules ?? ["core"]) as string[];
    const prompt = `You are a senior CRM consultant writing a sales proposal for a GCC enterprise client.

Company: ${answers.companyName || "the client"} (${answers.industry || "Technology"})
Countries: ${(answers.countries ?? ["Saudi Arabia"]).join(", ")}
Company size: ${answers.companySize || "11-50"} employees
Team: ${answers.seatsSales ?? 0} sales reps, ${answers.seatsSDR ?? 0} SDRs, ${answers.seatsMarketing ?? 0} marketers, ${answers.seatsManagement ?? 0} managers
Current CRM: ${answers.currentCrm || "none"} (migration needed: ${answers.migrationNeeded ? "yes" : "no"})
Setup path: ${setupPath === "managed" ? "NexFlow-managed implementation" : "self-service setup"}
Monthly lead volume: ${answers.monthlyLeadVolume || "100-500"}
Selected modules: ${modules.join(", ")}
Integrations wanted: ${(answers.integrations ?? []).join(", ") || "none specified"}
Monthly investment: SAR ${pricing.totalMonthly.toLocaleString()}/mo
Timeline: ${pricing.timelineWeeks} weeks
Notes: ${answers.notes || "none"}

Write a professional, specific proposal. Reference the GCC market, the company's industry, and their specific team size. Be concise but compelling.

Return ONLY valid JSON matching this exact schema:
{
  "executiveSummary": "2-3 paragraph summary specific to this company and GCC market context",
  "moduleRationale": {
    "Core CRM": "Why this module matters for their specific situation",
    "Power Dialer": "reason if selected",
    "AI Enrichment": "reason if selected",
    "Marketing Suite": "reason if selected",
    "AI Voice Agents": "reason if selected",
    "Conversation Intel": "reason if selected",
    "Forecasting": "reason if selected",
    "CPQ & Quotes": "reason if selected",
    "Website Tracking": "reason if selected"
  },
  "roiProjection": [
    { "metric": "Lead response time", "value": "↓ 68%" },
    { "metric": "Sales cycle length", "value": "↓ 30%" },
    { "metric": "Pipeline visibility", "value": "↑ 100%" },
    { "metric": "Rep productivity", "value": "↑ 40%" },
    { "metric": "Data accuracy", "value": "↑ 85%" },
    { "metric": "Revenue forecasting accuracy", "value": "↑ 55%" }
  ],
  "implementationPhases": [
    {
      "phase": "Foundation",
      "weeks": "Weeks 1-2",
      "tasks": ["Tenant provisioning", "Team onboarding", "Pipeline configuration"]
    },
    {
      "phase": "Migration & Integration",
      "weeks": "Weeks 2-4",
      "tasks": ["Data migration", "Integration setup", "Validation"]
    },
    {
      "phase": "Go-Live",
      "weeks": "Week ${pricing.timelineWeeks}",
      "tasks": ["Full team access", "Training sessions", "Hypercare begins"]
    }
  ],
  "nextSteps": [
    "Approve this proposal to provision your workspace",
    "Our team will schedule a kickoff call within 1 business day",
    "Provide access to your current CRM for migration planning",
    "Identify your CRM admin and 5-10 pilot users"
  ]
}`;

    let content: any;
    try {
      content = await aiJson({ provider: "openai", system: "You are a CRM sales consultant. Return ONLY valid JSON.", user: prompt });
    } catch {
      // Fallback proposal
      content = {
        executiveSummary: `NexFlow is pleased to present this tailored CRM proposal for ${answers.companyName || "your organisation"}. Operating across ${(answers.countries ?? ["Saudi Arabia"]).join(" and ")}, your team of ${(answers.seatsSales ?? 0) + (answers.seatsSDR ?? 0) + (answers.seatsMarketing ?? 0) + (answers.seatsManagement ?? 0)} will benefit from NexFlow's AI-native capabilities purpose-built for the GCC market.\n\nWith deep integrations into GCC data sources, Arabic-first AI, and a pipeline designed around the region's sales culture, NexFlow replaces your current setup with a unified platform that gives every rep, manager, and executive full visibility from first contact to closed deal.\n\nThe ${setupPath === "managed" ? "managed" : "self-service"} implementation path ensures your team is operational within ${pricing.timelineWeeks} weeks with minimal disruption to ongoing sales activity.`,
        moduleRationale: Object.fromEntries(pricing.lines.map((l) => [l.name, `Selected based on your team structure and ${answers.industry || "industry"} requirements.`])),
        roiProjection: [
          { metric: "Lead response time", value: "↓ 68%" },
          { metric: "Sales cycle", value: "↓ 30%" },
          { metric: "Pipeline visibility", value: "↑ 100%" },
          { metric: "Rep productivity", value: "↑ 40%" },
          { metric: "Data completeness", value: "↑ 85%" },
          { metric: "Forecast accuracy", value: "↑ 55%" },
        ],
        implementationPhases: [
          { phase: "Foundation", weeks: "Weeks 1–2", tasks: ["Workspace provisioning", "Admin configuration", "Team invitations"] },
          { phase: "Configuration", weeks: "Weeks 2–4", tasks: ["Pipeline & workflow setup", answers.migrationNeeded ? "Data migration from " + answers.currentCrm : "Data import", "Integration connections"] },
          { phase: "Go-Live", weeks: `Week ${pricing.timelineWeeks}`, tasks: ["Full team access", "Training sessions", "30-day hypercare"] },
        ],
        nextSteps: [
          "Approve this proposal to provision your workspace",
          setupPath === "managed" ? "Our team will reach out within 1 business day to schedule your kickoff" : "Your workspace will be ready immediately after approval",
          "Identify your CRM admin and first 5-10 pilot users",
          "Prepare your data export from " + (answers.currentCrm || "your current tools"),
        ],
      };
    }

    const [proposal] = await db.insert(setup_proposals).values({
      id: randomUUID(),
      session_id: req.params.id,
      version,
      content,
      pricing: pricing as any,
    }).returning();

    // Update session status
    await db.update(setup_sessions)
      .set({ status: "proposal_generated", updated_at: new Date() })
      .where(eq(setup_sessions.id, req.params.id));

    res.json({
      id: proposal.id,
      sessionId: proposal.session_id,
      version: proposal.version,
      pricing,
      executiveSummary: content.executiveSummary,
      moduleRationale: content.moduleRationale,
      roiProjection: content.roiProjection,
      implementationPhases: content.implementationPhases,
      nextSteps: content.nextSteps,
      createdAt: proposal.created_at,
    });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to generate proposal" });
  }
});

// ── POST /sessions/:id/approve ────────────────────────────────────────────────
router.post("/sessions/:id/approve", async (req, res) => {
  try {
    const [session] = await db.select().from(setup_sessions).where(eq(setup_sessions.id, req.params.id));
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }

    const answers = session.answers as any;
    const slug = `${(answers.companyName || "workspace").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)}-${Date.now().toString(36)}`;

    const [config] = await db.insert(tenant_configs).values({
      id: randomUUID(),
      session_id: req.params.id,
      slug,
      company_name: answers.companyName ?? "",
      company_name_ar: answers.companyNameAr ?? "",
      setup_path: session.setup_path,
      enabled_modules: answers.enabledModules ?? ["core"],
      tab_structure: answers.tabStructure ?? ["home","leads","callcenter","datahub","marketing","insights"],
      branding: {
        logoBase64: answers.logoBase64 ?? "",
        primaryColor: answers.primaryColor ?? "#4F46E5",
      },
      pipeline_stages: answers.pipelineStages ?? null,
      status: "active",
    }).returning();

    await db.update(setup_sessions)
      .set({ status: "approved", updated_at: new Date() })
      .where(eq(setup_sessions.id, req.params.id));

    res.json({ slug: config.slug, status: config.status });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to approve proposal" });
  }
});

// ── GET /sessions/:id/config ──────────────────────────────────────────────────
router.get("/sessions/:id/config", async (req, res) => {
  try {
    const [config] = await db.select().from(tenant_configs)
      .where(eq(tenant_configs.session_id, req.params.id));
    if (!config) { res.status(404).json({ error: "Config not found" }); return; }
    res.json({
      slug: config.slug,
      companyName: config.company_name,
      setupPath: config.setup_path,
      enabledModules: config.enabled_modules,
      tabStructure: config.tab_structure,
      branding: config.branding,
      status: config.status,
    });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch config" });
  }
});

export default router;
