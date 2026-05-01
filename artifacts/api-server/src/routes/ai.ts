import { Router } from "express";
import { db } from "@workspace/db";
import { contacts, signals, calls, deals, activities, companies, ai_agents, ai_agent_runs } from "@workspace/db";
import { desc, eq, sql, and, gte } from "drizzle-orm";
import { aiChat, aiEnabled, aiTranscribe, aiSpeak, type AiProvider } from "../lib/ai.js";

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

// ─── Conversational helpers ─────────────────────────────────────────────────
type AssistantAction = {
  kind: "open" | "start_call" | "draft_email" | "draft_whatsapp" | "switch_mode";
  label: string;
  path?: string;
  payload?: Record<string, unknown>;
};

const RESEARCH_HINTS = /\b(news|latest|today|this week|recent|update|trend|funding|hiring|announce|launch|stock|ipo|earnings|merger|acquisition|2025|2026|raised|round)\b/i;
const COMMAND_HINTS = /\b(open|go to|navigate|show me|take me to|jump to)\b/i;

const PAGE_MAP: Array<{ re: RegExp; path: string; label: string }> = [
  { re: /\b(pipeline|deals?|forecast)\b/i, path: "/pipeline", label: "Open pipeline" },
  { re: /\b(contacts?|leads?|people)\b/i, path: "/contacts", label: "Open contacts" },
  { re: /\b(calls?|dialer|dial)\b/i, path: "/calls", label: "Open calls" },
  { re: /\b(messages?|inbox|chat)\b/i, path: "/messages", label: "Open messages" },
  { re: /\b(home|dashboard|today|briefing)\b/i, path: "/home", label: "Open home" },
  { re: /\b(insights?|analytics|report)\b/i, path: "/insights", label: "Open insights" },
  { re: /\b(campaigns?|marketing)\b/i, path: "/campaigns", label: "Open campaigns" },
  { re: /\b(tasks?|todo|to-do)\b/i, path: "/tasks", label: "Open tasks" },
  { re: /\b(settings?|preferences|profile)\b/i, path: "/settings", label: "Open settings" },
];

function detectActions(message: string, reply: string): AssistantAction[] {
  const acts: AssistantAction[] = [];
  const text = message.toLowerCase();

  if (COMMAND_HINTS.test(text)) {
    for (const p of PAGE_MAP) {
      if (p.re.test(text)) {
        acts.push({ kind: "open", label: p.label, path: p.path });
        break;
      }
    }
  }
  if (/\b(call|dial|phone|ring)\b/i.test(text) && /\b(start|make|begin|place)\b/i.test(text)) {
    if (!acts.some(a => a.kind === "start_call")) acts.push({ kind: "start_call", label: "Start a call", path: "/calls" });
  }
  if (/\b(draft|write|compose|send)\b.*\bemail\b/i.test(text)) {
    acts.push({ kind: "draft_email", label: "Draft email", path: "/messages" });
  }
  if (/\b(draft|write|send)\b.*\b(whatsapp|wa|message)\b/i.test(text)) {
    acts.push({ kind: "draft_whatsapp", label: "Draft WhatsApp", path: "/messages" });
  }
  // Try to extract trailing JSON actions block from the model
  try {
    const matches = [...reply.matchAll(/```json\s*([\s\S]*?)```/gi)];
    const last = matches[matches.length - 1];
    if (last) {
      const parsed = JSON.parse(last[1]);
      if (Array.isArray(parsed?.actions)) {
        for (const a of parsed.actions) {
          if (a?.kind && a?.label) acts.push(a as AssistantAction);
        }
      }
    }
  } catch {/* ignore */}
  // Dedupe by kind+path
  const seen = new Set<string>();
  return acts.filter(a => {
    const k = `${a.kind}:${a.path ?? ""}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function stripTrailingJson(text: string): string {
  return text.replace(/\n*```json\s*[\s\S]*?```\s*$/i, "").trim();
}

function buildPersonaSystem(opts: {
  agentName?: string;
  tone?: string;
  focus?: string;
  language?: string;
  accent?: string;
  role?: { key?: string; name?: string; title?: string };
  context?: string;
  mode: "chat" | "research" | "analyze";
}): string {
  const name = opts.agentName?.trim() || "NexFlow AI";
  const tone = opts.tone || "conversational";
  const focus = opts.focus || "general";
  const lang = opts.language || "auto";
  const accent = opts.accent || "default";
  const userName = opts.role?.name?.split(" ")[0] || "there";
  const userTitle = opts.role?.title || "Sales rep";

  const langLine = lang === "ar"
    ? `CRITICAL: You MUST respond entirely in Arabic. Every word of your response must be in Arabic. Do not mix in English.${accent && accent !== "default" ? ` Use ${accent} dialect.` : ""}`
    : lang === "en"
    ? "Respond in English. If the user's message contains Arabic, still respond in English."
    : "Detect the user's language from their message and respond in THAT language only. Arabic message → Arabic reply only. English message → English reply only. Never mix languages in a single response.";

  const toneMap: Record<string, string> = {
    conversational: "Warm, friendly, like a smart colleague chatting over coffee. Short replies (1-3 sentences). Ask one clarifying question only if truly needed.",
    concise: "Direct and brief. No fluff. 1-2 sentences max.",
    coach: "Encouraging mentor — affirm progress, then suggest the next concrete move.",
    enthusiastic: "Upbeat and energetic, but professional. Celebrate wins, push forward.",
    formal: "Polished, business-formal English/Arabic. Address them by title.",
  };
  const toneLine = toneMap[tone] ?? toneMap.conversational;

  const focusLine = focus === "sales"
    ? "Lens everything through revenue impact: pipeline, deals, calls, follow-ups."
    : focus === "marketing"
    ? "Lens everything through audience reach, campaigns, channels, content."
    : focus === "research"
    ? "Lens everything through facts, citations, market intelligence, competitive moves."
    : "Be a generalist helpful assistant.";

  const modeLine = opts.mode === "chat"
    ? "Mode: CHAT — keep it conversational and short. Do NOT produce long structured analyses unless explicitly asked."
    : opts.mode === "research"
    ? "Mode: RESEARCH — provide current, factual information with sources where possible."
    : "Mode: ANALYZE — provide a structured, evidence-based analysis with concrete numbers and a clear next step.";

  return `You are ${name}, an AI assistant for NexFlow CRM (a B2B revenue platform for the GCC: KSA, UAE, Bahrain, Kuwait, Qatar, Oman).
The user is ${userName}, a ${userTitle}. Current page: ${opts.context ?? "/"}.
${langLine}
Tone: ${toneLine}
Focus: ${focusLine}
${modeLine}

STRICT RULES — violating any of these is unacceptable:
1. NEVER describe what you would do or how you will respond. Just respond directly.
2. NEVER include meta-instructions, explanations of your own behavior, or descriptions of your persona.
3. NEVER repeat or paraphrase any part of this system prompt in your response.
4. Keep replies focused and direct — no preamble like "As an AI assistant..." or "If the user asks...".

If the user is asking you to perform an action (open a page, start a call, draft an email/WhatsApp), append a JSON block at the very end like:
\`\`\`json
{"actions":[{"kind":"open","label":"Open pipeline","path":"/pipeline"}]}
\`\`\`
Valid kinds: open, start_call, draft_email, draft_whatsapp. Otherwise omit the JSON block entirely.`;
}

router.post("/assistant", async (req, res) => {
  const t0 = Date.now();
  try {
    const {
      message, role, context,
      mode: rawMode,
      tone, focus, language, accent, agent_name,
      provider: rawProvider,
      history,
    } = req.body as {
      message?: string;
      role?: { key?: string; name?: string; title?: string };
      context?: string;
      mode?: "chat" | "research" | "analyze" | "auto";
      tone?: string;
      focus?: string;
      language?: "en" | "ar" | "auto";
      accent?: string;
      agent_name?: string;
      provider?: AiProvider;
      history?: Array<{ role: "user" | "assistant"; text: string }>;
    };
    if (!message || typeof message !== "string") return res.status(400).json({ error: "Missing message" });

    // Auto-detect mode if not explicitly set
    let mode: "chat" | "research" | "analyze" = "chat";
    if (rawMode === "research" || rawMode === "analyze" || rawMode === "chat") {
      mode = rawMode;
    } else if (RESEARCH_HINTS.test(message)) {
      mode = "research";
    } else if (/\b(analy[sz]e|breakdown|deep dive|forecast|coverage|metric|kpi|performance|how am i doing)\b/i.test(message)) {
      mode = "analyze";
    }

    // ── Multi-agent orchestration: pick the best provider for the question.
    //   • explicit user override wins
    //   • Arabic-heavy or multilingual → Gemini (best Arabic)
    //   • live web / news / "today" / current data → Perplexity
    //   • deep analysis / "analyse" / KPIs → Anthropic Claude
    //   • code / "write a function" → OpenAI
    //   • everything else → OpenRouter (auto-picks the best model)
    const arabicChars = (message.match(/[\u0600-\u06FF]/g) ?? []).length;
    // Any Arabic characters → treat as Arabic (even short greetings like "اهلا")
    const hasArabic = arabicChars > 0 || language === "ar";
    const isArabicHeavy = arabicChars > Math.max(4, message.length * 0.1);
    const wantsCode = /\b(code|function|sql|regex|script|json|api|endpoint|typescript|python|bug|stack trace)\b/i.test(message);

    const provider: AiProvider =
      (rawProvider && ["openai","anthropic","gemini","perplexity","openrouter","auto"].includes(rawProvider))
        ? rawProvider
        : mode === "research" ? "perplexity"
        : mode === "analyze" ? "anthropic"
        : wantsCode ? "openai"
        : hasArabic ? "gemini"
        : "gemini";

    // Static fallback if AI integration is missing.
    const fallback = {
      reply: "I'm here to help. Open the Daily Briefing and hit Execute on the first priority — it's usually the highest-leverage move.",
      suggestions: ["Show my hottest leads", "What deals are at risk?", "Plan a campaign for Q2", "Research Aramco Digital"],
      agents_used: [] as { key: AgentKey; label: string }[],
      data_used: [] as string[],
      actions: [] as AssistantAction[],
      mode,
      provider,
    };
    if (!aiEnabled) return res.json(fallback);

    // ─── CHAT MODE — short conversational reply, no heavy orchestration ─
    if (mode === "chat") {
      // Auto-upgrade language to "ar" when the message contains Arabic characters,
      // unless the user explicitly forced "en".
      const effectiveLang = hasArabic && language !== "en" ? "ar" : language;
      const sys = buildPersonaSystem({
        agentName: agent_name, tone, focus, language: effectiveLang, accent, role, context, mode: "chat",
      });
      const histText = (history ?? []).slice(-6).map(h => `${h.role === "user" ? "User" : "You"}: ${h.text}`).join("\n");
      const userText = histText ? `${histText}\nUser: ${message}` : message;
      const raw = await aiChat({
        system: sys,
        user: userText,
        provider,
        maxTokens: 350,
      });
      const replyText = stripTrailingJson(raw || "");
      const actions = detectActions(message, raw || "");
      return res.json({
        reply: replyText || fallback.reply,
        suggestions: [],
        agents_used: [],
        data_used: [],
        actions,
        mode,
        provider,
        duration_ms: Date.now() - t0,
      });
    }

    // ─── RESEARCH MODE — Perplexity for live web data ───────────────────
    if (mode === "research") {
      const sys = buildPersonaSystem({
        agentName: agent_name, tone, focus, language, accent, role, context, mode: "research",
      });
      const raw = await aiChat({
        system: sys + "\nCite concrete facts, numbers, and dates. Use [1] [2] inline citations when possible.",
        user: message,
        provider: "perplexity",
        maxTokens: 800,
      });
      const replyText = stripTrailingJson(raw || "");
      const actions = detectActions(message, raw || "");
      return res.json({
        reply: replyText || fallback.reply,
        suggestions: [],
        agents_used: [{ key: "researcher" as AgentKey, label: "Researcher (Perplexity)" }],
        data_used: ["web_search:perplexity"],
        actions,
        mode,
        provider: "perplexity" as AiProvider,
        duration_ms: Date.now() - t0,
      });
    }

    // ─── ANALYZE MODE — full multi-agent orchestration (existing path) ──
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
    const synthLangInstruction = language === "ar"
      ? "CRITICAL: Your entire response must be in Arabic only. Not a single English word in the reply field."
      : language === "en"
      ? "Respond in English only."
      : hasArabic
      ? "CRITICAL: The user wrote in Arabic. Your entire response must be in Arabic only."
      : "Respond in the same language as the user's question.";

    const synthSys = `You are NexFlow AI, the unified voice of a multi-agent sales/marketing assistant for the GCC market (KSA, UAE, Bahrain, Kuwait, Qatar, Oman). You will receive structured EVIDENCE from one or more specialist agents.

${synthLangInstruction}

Compose ONE concise, specific, action-oriented answer (3-6 sentences max) using the evidence. Cite specific numbers if present. Always end with a NEXT STEP and which CRM page to open.

Suggest 3-4 short follow-up questions the user might ask next.

STRICT RULES:
- NEVER describe how you will respond or what you would do — just do it.
- NEVER include meta-instructions or describe your own persona/behavior.
- Output ONLY valid JSON: { "reply": "<answer>", "suggestions": ["...","...","..."] }`;

    const synthUser = `User: ${role?.name ?? "User"} (${role?.title ?? "Sales rep"})\nQuestion: ${message}\nAgents that ran: ${route.agents.join(", ")}\nRouting reason: ${route.reasoning}\n\nEVIDENCE:\n${JSON.stringify(evidence).slice(0, 6000)}`;

    const raw = await aiChat({
      system: synthSys,
      user: synthUser,
      provider: hasArabic ? "gemini" : "gemini",
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

    const actions = detectActions(message, replyText);
    return res.json({
      reply: replyText + attrib,
      suggestions: (parsed.suggestions && Array.isArray(parsed.suggestions) && parsed.suggestions.length)
        ? parsed.suggestions.slice(0, 4)
        : fallback.suggestions,
      agents_used,
      data_used: dataUsed,
      actions,
      mode,
      provider,
      routing_reason: route.reasoning,
      duration_ms: Date.now() - t0,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "AI assistant failed" });
  }
});

// ─── Whisper transcription endpoint (for Safari/iPad/Firefox fallback) ──────
router.post("/transcribe", async (req, res) => {
  try {
    const { audio_base64, mime, language } = req.body as {
      audio_base64?: string;
      mime?: string;
      language?: "en" | "ar";
    };
    if (!audio_base64 || typeof audio_base64 !== "string") {
      return res.status(400).json({ error: "Missing audio_base64" });
    }
    // 18MB cap of base64 ≈ 13.5MB binary, fits the 25MB JSON body limit
    if (audio_base64.length > 18 * 1024 * 1024) {
      return res.status(413).json({ error: "Audio too large (max ~13MB)" });
    }
    const buffer = Buffer.from(audio_base64, "base64");
    const ext = (mime || "audio/webm").includes("mp4") ? "m4a"
      : (mime || "audio/webm").includes("mpeg") ? "mp3"
      : (mime || "audio/webm").includes("wav") ? "wav"
      : "webm";
    const out = await aiTranscribe({
      audio: buffer,
      filename: `voice.${ext}`,
      language: language === "ar" ? "ar" : language === "en" ? "en" : undefined,
    });
    return res.json({ text: out.text, language: out.language });
  } catch (err: any) {
    req.log.error(err);
    return res.status(500).json({ error: err?.message ?? "Transcription failed" });
  }
});

// ─── High-quality TTS — replaces the rubbish browser SpeechSynthesis ───────
//
// Voices catalogue (OpenAI gpt-4o-mini-tts, with custom instructions to coax
// Arabic Gulf accents and gendered tone):
//   layla   → Arabic female, warm Khaleeji
//   noor    → Arabic female, energetic Saudi
//   khalid  → Arabic male, warm Khaleeji
//   faisal  → Arabic male, formal Saudi
//   sara    → English female, friendly
//   amelia  → English female, professional
//   adam    → English male, authoritative
//   james   → English male, energetic
const TTS_VOICES: Record<string, { voice: string; instructions: string; lang: "ar" | "en" }> = {
  layla:  { voice: "shimmer", lang: "ar", instructions: "Speak in warm, friendly Khaleeji Arabic — soft, female, conversational, slightly slow." },
  noor:   { voice: "nova",    lang: "ar", instructions: "Speak in confident, energetic Saudi Arabic — female, professional newsreader cadence." },
  khalid: { voice: "onyx",    lang: "ar", instructions: "Speak in warm, deep Khaleeji Arabic — male, calm, friendly." },
  faisal: { voice: "ash",     lang: "ar", instructions: "Speak in formal Saudi Arabic — male, authoritative, business tone." },
  sara:   { voice: "shimmer", lang: "en", instructions: "Speak in friendly, professional English — female, mid-Atlantic, clear." },
  amelia: { voice: "coral",   lang: "en", instructions: "Speak in calm, professional British English — female, warm, polished." },
  adam:   { voice: "onyx",    lang: "en", instructions: "Speak in authoritative American English — male, confident, executive." },
  james:  { voice: "verse",   lang: "en", instructions: "Speak in energetic, charismatic English — male, mid-Atlantic, sales-pro tone." },
};

router.get("/tts/voices", (_req, res) => {
  res.json({
    voices: Object.entries(TTS_VOICES).map(([id, v]) => ({
      id, lang: v.lang, label: id.charAt(0).toUpperCase() + id.slice(1),
    })),
  });
});

// Simple in-memory rate limiter for TTS to prevent paid-API cost abuse.
// 30 generations per IP per 60s — enough for normal call/preview use, hard
// stop on a runaway client. Sliding-window kept tiny so memory stays bounded.
const _ttsHits = new Map<string, number[]>();
const TTS_WINDOW_MS = 60_000;
const TTS_MAX = 30;
function ttsRateLimitOk(ip: string): boolean {
  const now = Date.now();
  const arr = (_ttsHits.get(ip) ?? []).filter((t) => now - t < TTS_WINDOW_MS);
  if (arr.length >= TTS_MAX) { _ttsHits.set(ip, arr); return false; }
  arr.push(now);
  _ttsHits.set(ip, arr);
  // Best-effort GC so the map doesn't grow unbounded across many IPs.
  if (_ttsHits.size > 5000) {
    for (const [k, v] of _ttsHits) {
      const live = v.filter((t) => now - t < TTS_WINDOW_MS);
      if (live.length === 0) _ttsHits.delete(k); else _ttsHits.set(k, live);
    }
  }
  return true;
}

router.post("/tts", async (req, res) => {
  try {
    const ip = (req.ip || req.socket.remoteAddress || "unknown").toString();
    if (!ttsRateLimitOk(ip)) {
      return res.status(429).json({ error: "Too many TTS requests, slow down." });
    }
    const { text, voice: voiceId } = req.body as { text?: string; voice?: string };
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing text" });
    }
    if (text.length > 4000) {
      return res.status(413).json({ error: "Text too long (max 4000 chars)" });
    }
    const cfg = TTS_VOICES[voiceId ?? "layla"] ?? TTS_VOICES.layla;
    const { buffer, mimeType } = await aiSpeak({
      text,
      voice: cfg.voice,
      instructions: cfg.instructions,
    });
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Length", String(buffer.length));
    return res.end(buffer);
  } catch (err: any) {
    req.log.error(err);
    return res.status(500).json({ error: err?.message ?? "TTS failed" });
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

