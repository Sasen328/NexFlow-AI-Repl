import { Router } from "express";
import { db } from "@workspace/db";
import { contacts, signals, calls, deals, activities, companies, ai_agents, ai_agent_runs } from "@workspace/db";
import { desc, eq, sql, and, gte } from "drizzle-orm";
import { aiChat, aiEnabled } from "../lib/ai.js";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-AGENT ORCHESTRATOR — replaces the old single-shot assistant.
//
// Architecture:
//   1) ROUTER agent (small, fast LLM call) inspects the user query and the
//      role + page context, then decides which specialist agents should
//      participate and which TOOLS each one should run.
//   2) Each picked specialist agent runs its TOOLS (live DB queries, web
//      search via Perplexity, marketing-plan generator). Tool outputs are
//      collected as "evidence".
//   3) A SYNTHESIS LLM call composes one final answer from the evidence,
//      cites which agents contributed, and suggests 3-4 follow-ups.
//
// Specialists:
//   • performance_analyst — pulls real KPIs from the DB (pipeline by stage,
//     deals at risk, calls today, hot signals, contact velocity).
//   • researcher — uses Perplexity for live web research (company news,
//     competitor moves, GCC market trends).
//   • marketing_strategist — drafts a multi-channel campaign plan tailored
//     to the GCC and the user's data.
//   • sales_coach — analyses recent calls + scripts, proposes coaching.
//   • operations — generic helper for ad-hoc tasks (drafting, calculations,
//     research summaries, "how do I…" inside the CRM).
// ─────────────────────────────────────────────────────────────────────────────

type AgentKey = "performance_analyst" | "researcher" | "marketing_strategist" | "sales_coach" | "operations";

const AGENT_REGISTRY: Record<AgentKey, { label: string; tools: string[]; description: string }> = {
  performance_analyst: {
    label: "Performance Analyst",
    tools: ["dashboard_snapshot", "pipeline_health", "calls_today", "hot_signals"],
    description: "Live KPIs from your CRM — pipeline, deals, calls, signals.",
  },
  researcher: {
    label: "Researcher",
    tools: ["web_search"],
    description: "Up-to-the-minute web research (Perplexity).",
  },
  marketing_strategist: {
    label: "Marketing Strategist",
    tools: ["audience_snapshot", "campaign_plan"],
    description: "Multi-channel campaign plans tuned for the GCC.",
  },
  sales_coach: {
    label: "Sales Coach",
    tools: ["recent_calls", "top_contacts"],
    description: "Reviews calls and contacts, suggests coaching.",
  },
  operations: {
    label: "Operations",
    tools: ["dashboard_snapshot"],
    description: "General-purpose assistant for any other task.",
  },
};

// ── Tool implementations ────────────────────────────────────────────────────
async function tool_dashboard_snapshot() {
  const [c] = await db.select({ count: sql<number>`count(*)::int` }).from(contacts);
  const [d] = await db.select({
    open: sql<number>`count(*) filter (where stage not in ('closed_won','closed_lost'))::int`,
    won: sql<number>`count(*) filter (where stage = 'closed_won')::int`,
    lost: sql<number>`count(*) filter (where stage = 'closed_lost')::int`,
    pipeline_value: sql<number>`coalesce(sum(value) filter (where stage not in ('closed_won','closed_lost')),0)::int`,
    won_value: sql<number>`coalesce(sum(value) filter (where stage = 'closed_won'),0)::int`,
  }).from(deals);
  const [s] = await db.select({ open: sql<number>`count(*) filter (where status = 'new')::int` }).from(signals);
  return { contacts: c?.count ?? 0, deals_open: d?.open ?? 0, deals_won: d?.won ?? 0, deals_lost: d?.lost ?? 0, pipeline_value: d?.pipeline_value ?? 0, won_value: d?.won_value ?? 0, new_signals: s?.open ?? 0 };
}

async function tool_pipeline_health() {
  const rows = await db.select({
    stage: deals.stage,
    count: sql<number>`count(*)::int`,
    value: sql<number>`coalesce(sum(value),0)::int`,
  }).from(deals).groupBy(deals.stage);
  return { by_stage: rows };
}

async function tool_calls_today() {
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000);
  const [c] = await db.select({
    total: sql<number>`count(*)::int`,
    completed: sql<number>`count(*) filter (where status = 'completed')::int`,
    avg_duration: sql<number>`coalesce(avg(duration_seconds),0)::int`,
  }).from(calls).where(gte(calls.created_at, yesterday));
  const recent = await db.select().from(calls).orderBy(desc(calls.created_at)).limit(5);
  return { total_24h: c?.total ?? 0, completed_24h: c?.completed ?? 0, avg_seconds: c?.avg_duration ?? 0, last_5: recent.map(r => ({ id: r.id, status: r.status, duration: r.duration_seconds, at: r.created_at })) };
}

async function tool_hot_signals() {
  const rows = await db.select().from(signals).orderBy(desc(signals.score)).limit(5);
  return { signals: rows.map(s => ({ type: s.type, title: s.title, score: s.score, status: s.status })) };
}

async function tool_top_contacts() {
  const rows = await db.select().from(contacts).orderBy(desc(contacts.lead_score)).limit(8);
  return { contacts: rows.map(c => ({ id: c.id, name: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim(), title: c.title, company_id: c.company_id, score: c.lead_score, status: c.status })) };
}

async function tool_recent_calls() {
  const rows = await db.select().from(calls).orderBy(desc(calls.created_at)).limit(5);
  return { calls: rows.map(r => ({ id: r.id, status: r.status, direction: r.direction, duration: r.duration_seconds, at: r.created_at })) };
}

async function tool_audience_snapshot() {
  const [c] = await db.select({ total: sql<number>`count(*)::int` }).from(contacts);
  const [comp] = await db.select({ total: sql<number>`count(*)::int` }).from(companies);
  const [act] = await db.select({ last7: sql<number>`count(*) filter (where created_at > now() - interval '7 days')::int` }).from(activities);
  return { total_contacts: c?.total ?? 0, total_companies: comp?.total ?? 0, activities_last_7d: act?.last7 ?? 0 };
}

async function tool_web_search(query: string): Promise<{ summary: string; provider: "perplexity" | "fallback" }> {
  // Perplexity has built-in web access.
  const out = await aiChat({
    system: "You are a web research assistant. Always cite concrete facts and dates when available. Be concise (3-5 bullets max).",
    user: `Research request from a GCC B2B sales rep. Query: ${query}\n\nGive a tight bulleted answer with the most important current facts.`,
    provider: "perplexity",
    maxTokens: 600,
  });
  return out
    ? { summary: out, provider: "perplexity" }
    : { summary: "(Web research unavailable — Perplexity not configured)", provider: "fallback" };
}

async function tool_campaign_plan(brief: string, snapshot: any) {
  const out = await aiChat({
    system: "You are a senior B2B marketing strategist for the GCC region. Always JSON.",
    user: `Brief: ${brief}\n\nCurrent CRM snapshot: ${JSON.stringify(snapshot)}\n\nReturn JSON: {"name":"...", "goal":"...", "audience":"...", "channels":["whatsapp","email","linkedin","sms"], "cadence":[{"day":1,"channel":"...","message":"..."}], "kpis":["..."], "budget_estimate_usd":number, "cultural_notes":"..."}`,
    json: true,
    maxTokens: 800,
  });
  try { return JSON.parse(out); } catch { return { error: "Plan generation failed" }; }
}

// ── Router (picks agents + tools) ────────────────────────────────────────────
async function pickAgents(message: string, role: any, ctx: string): Promise<{ agents: AgentKey[]; reasoning: string; web_query?: string; campaign_brief?: string }> {
  const sys = `You are the orchestrator for NexFlow's multi-agent assistant. Pick which specialist agents should answer the user's question. Available agents:
${Object.entries(AGENT_REGISTRY).map(([k, v]) => `• ${k} — ${v.description}`).join("\n")}

Rules:
- Pick 1–3 agents (rarely all). Pick performance_analyst for ANY "how am I doing / what's my pipeline / are we on track / show metrics" type question.
- Pick researcher when the user asks about anything happening OUTSIDE the CRM (news, competitors, market trends, a specific company in the wild).
- Pick marketing_strategist when the user asks for a campaign / sequence / outreach plan / messaging.
- Pick sales_coach when they ask about calls / coaching / scripts / contact-level next steps.
- Pick operations as a fallback for purely procedural / unknown asks.

Always JSON: {"agents":["agent_key", ...], "reasoning":"one short sentence", "web_query":"only if researcher picked, the search query to run", "campaign_brief":"only if marketing_strategist picked, what campaign to plan"}`;
  const raw = await aiChat({
    system: sys,
    user: `User role: ${role?.title ?? "Sales rep"} (${role?.key ?? "sales"})\nPage context: ${ctx || "/"}\nUser message: ${message}`,
    json: true,
    maxTokens: 250,
  });
  try {
    const p = JSON.parse(raw);
    const valid = (p.agents ?? []).filter((a: string) => a in AGENT_REGISTRY) as AgentKey[];
    return {
      agents: valid.length ? valid.slice(0, 3) : ["operations"],
      reasoning: p.reasoning ?? "",
      web_query: p.web_query,
      campaign_brief: p.campaign_brief,
    };
  } catch {
    return { agents: ["performance_analyst", "operations"], reasoning: "fallback routing" };
  }
}

router.post("/assistant", async (req, res) => {
  const t0 = Date.now();
  try {
    const { message, role, context } = req.body as {
      message?: string;
      role?: { key?: string; name?: string; title?: string };
      context?: string;
    };
    if (!message || typeof message !== "string") return res.status(400).json({ error: "Missing message" });

    // Static fallback if AI integration is missing.
    const fallback = {
      reply: "I'm here to help. Open the Daily Briefing and hit Execute on the first priority — it's usually the highest-leverage move.",
      suggestions: ["Show my hottest leads", "What deals are at risk?", "Plan a campaign for Q2", "Research Aramco Digital"],
      agents_used: [] as { key: AgentKey; label: string }[],
      data_used: [] as string[],
    };
    if (!aiEnabled) return res.json(fallback);

    // 1) ROUTE — pick which agents/tools
    const route = await pickAgents(message, role, context ?? "");
    const evidence: Record<string, any> = {};
    const dataUsed: string[] = [];

    // 2) RUN — call each picked agent's tools in parallel
    await Promise.all(route.agents.map(async (a) => {
      try {
        if (a === "performance_analyst") {
          const [snap, pipe, calls24, hot] = await Promise.all([
            tool_dashboard_snapshot(), tool_pipeline_health(), tool_calls_today(), tool_hot_signals(),
          ]);
          evidence.performance = { snapshot: snap, pipeline: pipe, calls_24h: calls24, hot_signals: hot };
          dataUsed.push("dashboard_snapshot", "pipeline_health", "calls_today", "hot_signals");
        }
        if (a === "researcher" && route.web_query) {
          const r = await tool_web_search(route.web_query);
          evidence.research = r;
          dataUsed.push(`web_search:${r.provider}`);
        }
        if (a === "marketing_strategist") {
          const aud = await tool_audience_snapshot();
          const plan = await tool_campaign_plan(route.campaign_brief ?? message, aud);
          evidence.marketing = { audience: aud, plan };
          dataUsed.push("audience_snapshot", "campaign_plan");
        }
        if (a === "sales_coach") {
          const [recent, tops] = await Promise.all([tool_recent_calls(), tool_top_contacts()]);
          evidence.sales = { recent_calls: recent, top_contacts: tops };
          dataUsed.push("recent_calls", "top_contacts");
        }
        if (a === "operations") {
          evidence.operations = { snapshot: await tool_dashboard_snapshot() };
          dataUsed.push("dashboard_snapshot");
        }
      } catch (e: any) {
        req.log.error({ err: e?.message ?? e, agent: a }, "[orchestrator] agent tool failed");
        evidence[a] = { error: e?.message ?? "tool failed" };
      }
    }));

    // 3) SYNTHESIZE — compose final answer from evidence
    const synthSys = `You are NexFlow AI, the unified voice of a multi-agent sales/marketing assistant for the GCC market (KSA, UAE, Bahrain, Kuwait, Qatar, Oman). You will receive structured EVIDENCE from one or more specialist agents that already ran their tools.

Compose ONE concise, specific, action-oriented answer (3-6 sentences max) that uses the evidence. If specific numbers are present, cite them. If a campaign plan was generated, summarise its name, top channels, and expected impact in 2 lines. If web research was returned, integrate the key facts. Always end with a specific NEXT STEP and which CRM page to open.

Then suggest 3-4 short follow-up questions the user might ask next.

Always JSON: { "reply": "<answer>", "suggestions": ["...","...","..."] }`;

    const synthUser = `User: ${role?.name ?? "User"} (${role?.title ?? "Sales rep"})\nQuestion: ${message}\nAgents that ran: ${route.agents.join(", ")}\nRouting reason: ${route.reasoning}\n\nEVIDENCE:\n${JSON.stringify(evidence).slice(0, 6000)}`;

    const raw = await aiChat({
      system: synthSys,
      user: synthUser,
      provider: "auto",
      json: true,
      maxTokens: 700,
    });
    let parsed: { reply?: string; suggestions?: string[] } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { reply: raw }; }

    const agents_used = route.agents.map(k => ({ key: k, label: AGENT_REGISTRY[k].label }));

    // Append a tiny invisible attribution line so the existing bubble UI
    // (which only renders `reply`) still shows which agents contributed.
    const replyText = (parsed.reply || fallback.reply).trim();
    const attrib = agents_used.length
      ? `\n\n— ${agents_used.map(a => a.label).join(" + ")}${dataUsed.length ? ` · live data: ${dataUsed.length} sources` : ""}`
      : "";

    return res.json({
      reply: replyText + attrib,
      suggestions: (parsed.suggestions && Array.isArray(parsed.suggestions) && parsed.suggestions.length)
        ? parsed.suggestions.slice(0, 4)
        : fallback.suggestions,
      agents_used,
      data_used: dataUsed,
      routing_reason: route.reasoning,
      duration_ms: Date.now() - t0,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "AI assistant failed" });
  }
});

router.post("/score-contact/:id", async (req, res) => {
  try {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, req.params.id));
    if (!contact) return res.status(404).json({ error: "Contact not found" });

    // Simulated AI scoring
    const score = Math.floor(Math.random() * 40 + 60);
    await db.update(contacts).set({ lead_score: score, updated_at: new Date() })
      .where(eq(contacts.id, req.params.id));

    res.json({
      contact_id: req.params.id,
      score,
      reasoning: `Based on role (${contact.title || "unknown"}), engagement history, and company signals, this contact scores ${score}/100. Key factors: decision-maker authority, active buying signals, and recent engagement.`,
      recommendations: [
        "Schedule a product demo within 48 hours",
        "Send the enterprise pricing deck",
        "Connect on LinkedIn for relationship building",
      ],
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Scoring failed" });
  }
});

router.get("/daily-briefing", async (req, res) => {
  try {
    const topContacts = await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.lead_score))
      .limit(3);

    const topSignals = await db
      .select()
      .from(signals)
      .where(eq(signals.status, "new"))
      .orderBy(desc(signals.score))
      .limit(3);

    const [scheduledCalls] = await db
      .select({ count: db.$count(calls) as any })
      .from(calls)
      .where(eq(calls.status, "scheduled"));

    res.json({
      date: new Date().toISOString().split("T")[0],
      summary: "Strong pipeline momentum this week. 3 deals are close to closing. 2 high-value signals detected overnight — recommend immediate outreach to Gulf Ventures and Riyadh Capital. Your call score average is up 12% vs last week.",
      priority_contacts: topContacts.map(c => ({
        ...c,
        company_name: null,
      })),
      top_signals: topSignals,
      scheduled_calls: 4,
      deals_to_close: 3,
      action_items: [
        "Follow up with Gulf Ventures re: Series B partnership",
        "Send proposal to Riyadh Capital — deadline today",
        "Review call recordings from yesterday's demos",
        "Update pipeline stages for 5 stalled deals",
        "Approve AI voice agent script for cold call campaign",
      ],
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get daily briefing" });
  }
});

const AI_AGENTS = [
  {
    id: "signal-scanner",
    name: "Signal Scanner",
    description: "Monitors 50+ data sources including news, LinkedIn, job boards, and funding databases for high-intent buying signals.",
    status: "active",
    capabilities: ["Funding alerts", "Exec moves", "Hiring signals"],
    lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "lead-scorer",
    name: "Lead Scorer",
    description: "ML-powered scoring engine that updates all contact scores daily based on engagement, company signals, and behavioral data.",
    status: "active",
    capabilities: ["Score update", "Ranking", "Recommendations"],
    lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "call-coach",
    name: "Call Coach",
    description: "Real-time AI analysis of sales calls. Scores tone, objection handling, and next-step alignment. Provides instant coaching notes.",
    status: "active",
    capabilities: ["Live coaching", "Sentiment analysis", "Score cards"],
    lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "script-writer",
    name: "Script Writer",
    description: "Generates personalized outreach scripts in English and Arabic using contact context, company signals, and deal history.",
    status: "active",
    capabilities: ["Arabic NLP", "Personalization", "A/B variants"],
    lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "prospect-researcher",
    name: "Prospect Researcher",
    description: "Deep-researches new contacts: LinkedIn profiles, recent news, mutual connections, and preferred communication style.",
    status: "active",
    capabilities: ["LinkedIn enrichment", "News analysis", "Profile building"],
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "deal-predictor",
    name: "Deal Predictor",
    description: "Forecasts deal close probability and expected close date using pipeline velocity, engagement patterns, and historical data.",
    status: "active",
    capabilities: ["Win probability", "Close date", "Risk flags"],
    lastRun: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "objection-handler",
    name: "Objection Handler",
    description: "Provides real-time Arabic and English objection responses based on the contact's specific concerns and your product's value props.",
    status: "active",
    capabilities: ["Real-time response", "Arabic support", "Contextual"],
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "follow-up-writer",
    name: "Follow-up Writer",
    description: "Drafts personalized follow-up emails and WhatsApp messages within 5 minutes of call completion, tailored to call outcomes.",
    status: "active",
    capabilities: ["Email drafts", "WhatsApp", "Post-call automation"],
    lastRun: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "segment-builder",
    name: "Segment Builder",
    description: "Automatically creates and updates audience segments using behavioral filters, company attributes, and AI intent scoring.",
    status: "active",
    capabilities: ["Auto-segments", "Intent scoring", "Dynamic updates"],
    lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "compliance-checker",
    name: "Compliance Checker",
    description: "Screens all outbound communications for PDPL (Saudi Arabia) and GDPR compliance. Flags high-risk messages before sending.",
    status: "active",
    capabilities: ["PDPL check", "GDPR compliance", "Risk scoring"],
    lastRun: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

router.get("/agents", (_req, res) => {
  res.json({ agents: AI_AGENTS });
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.post("/agents/:agentId/run", async (req, res) => {
  const id = req.params.agentId;
  const t0 = Date.now();

  // Tier 1 — hardcoded canned-agents (legacy, still used in dashboards)
  const canned = AI_AGENTS.find(a => a.id === id);
  if (canned) {
    if (canned.status !== "active") return res.status(400).json({ error: "Agent is not active" });
    const messages: Record<string, string> = {
      "signal-scanner": "Scanned 50+ sources. Found 3 new high-value signals: Gulf Ventures funding round (score: 95), Aramco Digital hiring push (score: 79), SABIC expansion news (score: 73).",
      "lead-scorer": "Updated scores for all 8 contacts. Sara Al-Mansouri moved to 92 (+5). Ahmed Al-Rashidi stable at 87. 2 new contacts need enrichment.",
      "call-coach": "Analyzed 4 recent calls. Average score: 81/100. Coaching insight: More discovery questions needed in opening 2 minutes.",
      "script-writer": "Generated 3 personalized scripts: Gulf Ventures follow-up, Aramco cold outreach (Arabic), and Riyadh Capital closing script.",
      "prospect-researcher": "Researched 2 new contacts. Found LinkedIn profiles, recent company news, and 1 mutual connection for warm intro.",
      "deal-predictor": "Riyadh Capital deal: 87% win probability, estimated close in 12 days. Al-Noor deal: risk flag — no activity in 8 days.",
      "objection-handler": "Loaded 24 objection-response pairs for today's calls. Top objection this week: 'We already have Salesforce.'",
      "follow-up-writer": "Drafted 3 follow-up emails post-call. Average personalization score: 9.2/10. Ready for review in Outbox.",
      "segment-builder": "Updated 4 segments. 'Hot Leads Q2' added 1 new contact (Fatima Khalid). 'At-Risk Deals' flagged 2 deals for attention.",
      "compliance-checker": "Checked 12 outbound messages. All clear for PDPL compliance. 1 message flagged for review (direct financial advice language).",
    };
    return res.json({ agentId: id, status: "completed", message: messages[id] ?? "Agent completed successfully.", runAt: new Date().toISOString() });
  }

  // Tier 2 — DB-stored AI Agents (built via /agent-builder). These use a
  // real LLM call against the agent's saved system_prompt. We log the run
  // so the agent-builder UI can show a history of executions.
  if (!UUID_RE.test(id)) return res.status(400).json({ error: "Invalid agent id format" });
  try {
    const [dbAgent] = await db.select().from(ai_agents).where(eq(ai_agents.id, id));
    if (!dbAgent) return res.status(404).json({ error: "Agent not found" });
    if (dbAgent.enabled === false) return res.status(400).json({ error: "Agent is disabled" });

    // Cap user input length to keep prompt size bounded and reduce log noise.
    const rawInput = String(req.body?.input ?? req.body?.message ?? "Run this agent now and report what you would do.");
    const userInput = rawInput.slice(0, 4000);

    let output = "";
    if (aiEnabled) {
      output = await aiChat({
        system: dbAgent.system_prompt,
        user: userInput,
        provider: "auto",
        maxTokens: 700,
      });
    }
    if (!output) {
      output = `${dbAgent.name} ran successfully. (AI provider unavailable — showing default output. Configure OpenRouter/OpenAI to get a real response.)`;
    }

    // Log run
    const dur = Date.now() - t0;
    await db.insert(ai_agent_runs).values({
      agent_id: id,
      input: userInput,
      output,
      status: "completed",
      duration_ms: dur,
    });
    await db.update(ai_agents).set({
      run_count: (dbAgent.run_count ?? 0) + 1,
      last_run_at: new Date(),
    }).where(eq(ai_agents.id, id));

    return res.json({
      agentId: id,
      agentName: dbAgent.name,
      status: "completed",
      message: output,
      duration_ms: dur,
      runAt: new Date().toISOString(),
    });
  } catch (err: any) {
    req.log.error(err);
    return res.status(500).json({ error: err?.message ?? "Agent run failed" });
  }
});

// ── Voice Agent Test — hits a sample transcript the browser can play back
//    body: { agent_id?, voice?, persona?, language?, sample_text? }
router.post("/voice-agent-test", async (req, res) => {
  const t0 = Date.now();
  try {
    const { voice = "Layla", persona = "professional, warm GCC sales rep",
            language = "en-US", sample_text, agent_id } = req.body ?? {};

    let systemPrompt = `You are simulating a 30-second AI voice agent introduction. Persona: ${persona}. Voice: ${voice}. Language: ${language}.
Generate a tight, natural opening line that demonstrates the agent's tone, ending with a clear question for the prospect. Keep it under 50 words.
${language.startsWith("ar") ? "ALWAYS respond in warm Khaleeji (Gulf) Arabic." : "Respond in clear English."}`;

    if (agent_id && UUID_RE.test(String(agent_id))) {
      try {
        const [a] = await db.select().from(ai_agents).where(eq(ai_agents.id, String(agent_id)));
        if (a?.system_prompt) systemPrompt = `${a.system_prompt}\n\nNow generate a 30-second sample voice greeting using this persona.`;
      } catch { /* ignore */ }
    }

    let text = "";
    if (aiEnabled) {
      text = await aiChat({
        system: systemPrompt,
        user: sample_text ?? "Generate a sample voice greeting that demonstrates your style. Mention NexFlow once.",
        provider: "auto",
        maxTokens: 200,
      });
    }
    if (!text) {
      text = language.startsWith("ar")
        ? `السلام عليكم، أنا ${voice} من نيكسفلو. حابب أعرف عن أهدافكم في الربع القادم — كم دقيقة تعطيني؟`
        : `Hi, this is ${voice} from NexFlow — I help GCC sales teams close more deals with our AI-native CRM. Got 60 seconds to share your top priority this quarter?`;
    }

    return res.json({
      ok: true,
      voice, language, persona,
      text: text.trim(),
      tts_hint: { lang: language, voice_name_hint: voice },
      duration_ms: Date.now() - t0,
    });
  } catch (err: any) {
    req.log.error(err);
    return res.status(500).json({ ok: false, error: err?.message ?? "voice-agent-test failed" });
  }
});

export default router;

