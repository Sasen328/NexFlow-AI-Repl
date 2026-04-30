/**
 * /api/assistant — Unified NexFlow AI assistant.
 *
 *   • Pulls REAL dashboard / pipeline / contact / signal data from the DB.
 *   • Stuffs that data into a GCC-tuned system prompt.
 *   • Sends to OpenRouter (auto-routes Anthropic / OpenAI / Gemini /
 *     Perplexity by user-selected provider).
 *   • Returns a single answer + suggested next actions.
 *
 * The frontend AssistantPage hits POST /api/assistant/chat with
 *   { message, provider?, conversationId? }.
 */

import { Router, type IRouter } from "express";
import { db, contacts, deals, signals, activities } from "@workspace/db";
import { sql, desc, eq } from "drizzle-orm";
import { aiChat, type AiProvider } from "../lib/ai.js";

const router: IRouter = Router();

// ─── Real-data context builder ──────────────────────────────────────────
async function buildDashboardContext() {
  const [
    contactsAgg,
    dealsAgg,
    pipelineByStage,
    topContactsRows,
    recentSignals,
    recentActivities,
  ] = await Promise.all([
    db.select({
      total: sql<number>`COUNT(*)::int`,
      avgScore: sql<number>`COALESCE(AVG(${contacts.score}), 0)::int`,
      hot: sql<number>`SUM(CASE WHEN ${contacts.score} >= 80 THEN 1 ELSE 0 END)::int`,
    }).from(contacts),
    db.select({
      total: sql<number>`COUNT(*)::int`,
      open: sql<number>`SUM(CASE WHEN ${deals.stage} NOT IN ('won','lost') THEN 1 ELSE 0 END)::int`,
      pipelineUsd: sql<number>`COALESCE(SUM(CASE WHEN ${deals.stage} NOT IN ('won','lost') THEN ${deals.value} ELSE 0 END), 0)::bigint`,
      wonUsd: sql<number>`COALESCE(SUM(CASE WHEN ${deals.stage} = 'won' THEN ${deals.value} ELSE 0 END), 0)::bigint`,
    }).from(deals),
    db.select({
      stage: deals.stage,
      n: sql<number>`COUNT(*)::int`,
      usd: sql<number>`COALESCE(SUM(${deals.value}), 0)::bigint`,
    }).from(deals).groupBy(deals.stage),
    db.select({
      id: contacts.id,
      name: sql<string>`${contacts.first_name} || ' ' || ${contacts.last_name}`,
      title: contacts.title,
      company_name: contacts.company_name,
      score: contacts.score,
      country: contacts.country,
    }).from(contacts).orderBy(desc(contacts.score)).limit(8),
    db.select({
      id: signals.id,
      kind: signals.kind,
      title: signals.title,
      severity: signals.severity,
      created_at: signals.created_at,
    }).from(signals).orderBy(desc(signals.created_at)).limit(10),
    db.select({
      id: activities.id,
      type: activities.type,
      title: activities.title,
      created_at: activities.created_at,
    }).from(activities).orderBy(desc(activities.created_at)).limit(10),
  ]).catch(() => [null, null, [], [], [], []] as const);

  const c: any = contactsAgg?.[0] ?? {};
  const d: any = dealsAgg?.[0] ?? {};

  return {
    snapshot: {
      contacts_total: c.total ?? 0,
      contacts_hot: c.hot ?? 0,
      contacts_avg_score: c.avgScore ?? 0,
      deals_total: d.total ?? 0,
      deals_open: d.open ?? 0,
      pipeline_usd: Number(d.pipelineUsd ?? 0),
      won_usd: Number(d.wonUsd ?? 0),
    },
    pipeline_by_stage: (pipelineByStage as any[] ?? []).map((r) => ({
      stage: r.stage, count: r.n, usd: Number(r.usd ?? 0),
    })),
    top_contacts: topContactsRows ?? [],
    recent_signals: recentSignals ?? [],
    recent_activities: recentActivities ?? [],
  };
}

// ─── System prompt — GCC-tuned, multi-skill ─────────────────────────────
const SYSTEM = `You are NexFlow's AI Sales Assistant, fluent in English and Gulf Arabic, deeply tuned for the GCC B2B context (Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman).

You answer using the LIVE pipeline data injected below. Never invent numbers. If a number isn't in the data, say so. Use the data for:
  • Pipeline insights & forecasting
  • Performance review (hot contacts, stalled deals, signals)
  • Drafting emails, WhatsApp messages, call scripts (English or Khaleeji Arabic)
  • Objection handling, talk-tracks
  • Daily briefing, "what should I focus on now?"

Format crisply: short sections with bold headings, bullets, and concrete next actions. Always end with 1–3 suggested follow-up questions.

If the user writes in Arabic, reply in Arabic with Gulf-dialect warmth (e.g. "تمام", "إن شاء الله", "حياك الله"). Default tone is professional, direct, no fluff.`;

// ─── POST /api/assistant/chat ───────────────────────────────────────────
router.post("/chat", async (req, res) => {
  const message: string = String(req.body?.message ?? "").trim();
  const provider: AiProvider = (req.body?.provider ?? "auto") as AiProvider;
  const history: Array<{ role: "user" | "assistant"; text: string }> = Array.isArray(req.body?.history) ? req.body.history.slice(-6) : [];

  if (!message) {
    res.status(400).json({ error: "message required" });
    return;
  }

  let ctx;
  try {
    ctx = await buildDashboardContext();
  } catch (err: any) {
    req.log.error({ err }, "[assistant] failed to build context");
    ctx = null;
  }

  const dataBlock = ctx
    ? `LIVE DATA (as of now):\n${JSON.stringify(ctx, null, 2)}`
    : `LIVE DATA: (unavailable — answer generally and suggest the user retry)`;

  const historyBlock = history.length
    ? `\n\nRECENT CONVERSATION:\n${history.map((h) => `${h.role === "user" ? "USER" : "ASSISTANT"}: ${h.text}`).join("\n")}`
    : "";

  try {
    const reply = await aiChat({
      system: SYSTEM,
      user: `${dataBlock}${historyBlock}\n\nUSER QUESTION: ${message}`,
      provider,
      maxTokens: 1200,
    });

    if (!reply) {
      res.json({
        reply: "I couldn't reach the AI provider right now. Please try again in a moment.",
        provider_used: "none",
        data_used: ctx ? Object.keys(ctx) : [],
      });
      return;
    }

    res.json({
      reply,
      provider_used: provider,
      data_used: ctx ? Object.keys(ctx) : [],
    });
  } catch (err: any) {
    req.log.error({ err }, "[assistant] chat failed");
    res.status(500).json({ error: err?.message ?? "ai_error" });
  }
});

// ─── POST /api/assistant/voice — Gemini-style TTS sample ────────────────
// Returns a synthetic audio stream (base64 wav) using the configured TTS
// provider. The frontend uses this to play the AI assistant's voice.
// Falls back to browser's SpeechSynthesis when no TTS provider is set.
router.post("/voice", async (req, res) => {
  const text: string = String(req.body?.text ?? "").trim();
  const voiceId: string = String(req.body?.voice_id ?? "layla");
  if (!text) {
    res.status(400).json({ error: "text required" });
    return;
  }
  // Currently no server-side TTS provider is wired — return a directive
  // for the browser to use SpeechSynthesisUtterance with the matching
  // language hint. Frontend already handles this fallback.
  const voiceMap: Record<string, { lang: string; gender: "female" | "male"; label: string }> = {
    layla:  { lang: "ar-SA", gender: "female", label: "Layla — Gulf Arabic Female" },
    faisal: { lang: "ar-SA", gender: "male",   label: "Faisal — Gulf Arabic Male" },
    noor:   { lang: "ar",    gender: "female", label: "Noor — Bilingual AR/EN" },
    adam:   { lang: "en-US", gender: "male",   label: "Adam — English Male" },
  };
  const v = voiceMap[voiceId.toLowerCase()] ?? voiceMap["layla"]!;
  res.json({
    mode: "browser_tts",
    text,
    voice: { id: voiceId, ...v },
    note: "Browser SpeechSynthesis will speak in the requested language; install ElevenLabs/Gemini TTS provider for premium audio.",
  });
});

export default router;
