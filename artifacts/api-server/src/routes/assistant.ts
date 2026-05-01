/**
 * /api/assistant — Unified NexFlow AI assistant.
 *
 *   • Pulls REAL dashboard / pipeline / contact / signal data from the DB.
 *   • Stuffs that data into a GCC-tuned, persona/tone/focus-aware system prompt.
 *   • Sends to OpenRouter (auto-routes Anthropic / OpenAI / Gemini /
 *     Perplexity by user-selected provider, with auto-routing for research).
 *   • Returns a single answer + suggested next actions + structured commands
 *     the client can render as buttons (open path, run shortcut, draft msg).
 *
 * The frontend AssistantPanel hits POST /api/assistant/chat with
 *   { message, provider?, mode?, tone?, focus?, language?, accent?,
 *     agent_name?, history?[] }.
 *
 * It also hits POST /api/assistant/transcribe with
 *   { audio_base64, mime?, language? } to get text from a recorded clip.
 */

import { Router, type IRouter } from "express";
import { db, contacts, deals, signals, activities } from "@workspace/db";
import { sql, desc } from "drizzle-orm";
import { aiGeminiChat, aiGeminiTts, aiTranscribe, type AiProvider } from "../lib/ai.js";

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

// ─── Persona / tone / focus / accent system-prompt builder ──────────────
type Tone = "conversational" | "concise" | "coach" | "enthusiastic" | "formal";
type Mode = "chat" | "research" | "analysis" | "command";
type Focus = "sales" | "marketing" | "research" | "general";
type Accent = "saudi" | "uae" | "egyptian" | "default";

const TONE_GUIDE: Record<Tone, string> = {
  conversational:
    "Default to a warm, conversational style — chat like a trusted colleague. Use 1–3 short paragraphs. Ask one clarifying question at the end if helpful. Avoid heavy headings, bullet floods, or lecture-style analysis unless the user explicitly asks for analysis.",
  concise:
    "Be terse and direct. 1–3 sentences. No headings. No fluff. Bullets only when listing options.",
  coach:
    "Coach the user. Reflect what they said, suggest the next concrete action, and end with one question that moves them forward.",
  enthusiastic:
    "Be high-energy and encouraging. Use confident, motivating language. Still grounded in real data — never invent numbers.",
  formal:
    "Be professional and structured. Use clear headings, bullet points, and a polished register suitable for an executive briefing.",
};

const FOCUS_GUIDE: Record<Focus, string> = {
  sales:
    "Bias toward sales actions: opening deals, calls, follow-ups, objection-handling, pipeline movement.",
  marketing:
    "Bias toward marketing: campaign ideas, audience cuts, timing, channel mix, A/B testing, cultural localization.",
  research:
    "Bias toward research: pull recent web context, cite sources, summarise findings into digestible briefs with key links.",
  general:
    "Be a balanced revenue copilot — answer whatever is asked.",
};

const ACCENT_GUIDE: Record<Accent, string> = {
  saudi:
    "When replying in Arabic, use Najdi Saudi register: 'حياك الله', 'تمام', 'إن شاء الله', 'ابشر'.",
  uae:
    "When replying in Arabic, use Khaleeji UAE register: 'هلا والله', 'مع السلامة', 'إن شاء الله'.",
  egyptian:
    "When replying in Arabic, use Egyptian register: 'إزيك', 'حاضر', 'إن شاء الله'.",
  default: "When replying in Arabic, use neutral Modern Standard Arabic with light Gulf warmth.",
};

const MODE_GUIDE: Record<Mode, string> = {
  chat:
    "This is a back-and-forth chat. Conversation first, analysis only when explicitly asked. Default to short replies.",
  research:
    "Run a research-style answer. Cite sources inline like [name](url) when you used the web. Summarise crisply at the top, then add details.",
  analysis:
    "Produce a structured analysis: 3–6 bullets of insights, a numbered next-action list, and a one-line bottom-line takeaway.",
  command:
    "The user wants you to RUN a command in the app. Acknowledge, execute conceptually, and emit an `actions` block in the JSON tail (see below).",
};

function buildSystemPrompt(opts: {
  agentName: string;
  tone: Tone;
  mode: Mode;
  focus: Focus;
  language: "auto" | "en" | "ar";
  accent: Accent;
}): string {
  const langLine =
    opts.language === "auto"
      ? "Reply in the language the user wrote in. Mirror their script (English ↔ Arabic)."
      : opts.language === "ar"
        ? "Reply ONLY in Arabic. Even if the user writes English, reply in Arabic."
        : "Reply ONLY in English. Even if the user writes Arabic, reply in English.";

  return `You are ${opts.agentName}, NexFlow's AI revenue copilot. You are fluent in English and Gulf Arabic, deeply tuned for the GCC B2B context (Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman).

You always answer using the LIVE pipeline data injected below. Never invent numbers. If a number is not in the data, say so plainly.

${MODE_GUIDE[opts.mode]}

${TONE_GUIDE[opts.tone]}

${FOCUS_GUIDE[opts.focus]}

${langLine}

${ACCENT_GUIDE[opts.accent]}

When the user asks you to OPEN, FIND, GO TO, or START something inside the app (e.g. "open my hot leads", "show pipeline", "start a call with Rashid", "draft an email to Sara") you must end your reply with a single fenced JSON block:

\`\`\`json
{ "actions": [ { "kind": "open"|"start_call"|"draft_email"|"draft_whatsapp", "label": "Open hot leads", "path": "/comms" } ] }
\`\`\`

Valid \`kind\` values: open, start_call, draft_email, draft_whatsapp, run_research.
Valid \`path\` values for kind=open: /, /crm, /comms, /enrichment, /marketing, /pipeline, /insights.
Always include a friendly \`label\` so the client can render it as a button.
If no app action is needed, OMIT the JSON block entirely. Never wrap a normal answer in JSON.`;
}

// ─── Auto-routing helpers ───────────────────────────────────────────────
function looksLikeResearch(message: string): boolean {
  const m = message.toLowerCase();
  return (
    /\bnews\b|latest|today's|recent|update on|search the web|google|find me articles|what's happening|what is happening|fetch.*data|fetch.*news|research/i
      .test(m)
  );
}

function pickProvider(provider: AiProvider, mode: Mode, message: string): AiProvider {
  if (provider !== "auto") return provider;
  if (mode === "research" || looksLikeResearch(message)) return "perplexity";
  if (mode === "analysis") return "anthropic";
  return "openai";
}

// ─── Action extraction (find the LAST ```json block in the reply) ──────
function extractActions(reply: string): { cleanText: string; actions: any[] } {
  if (!reply) return { cleanText: reply, actions: [] };
  // Match every fenced json block, take the last one (model can append a
  // friendly trailing line after the JSON).
  const re = /```json\s*([\s\S]*?)\s*```/g;
  let lastMatch: RegExpExecArray | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(reply)) !== null) lastMatch = m;
  if (!lastMatch) return { cleanText: reply, actions: [] };
  try {
    const parsed = JSON.parse(lastMatch[1]!);
    const actions = Array.isArray(parsed?.actions) ? parsed.actions : [];
    const cleanText =
      reply.slice(0, lastMatch.index) +
      reply.slice(lastMatch.index + lastMatch[0]!.length);
    return { cleanText: cleanText.trim(), actions };
  } catch {
    return { cleanText: reply, actions: [] };
  }
}

// ─── POST /api/assistant/chat ───────────────────────────────────────────
router.post("/chat", async (req, res) => {
  const message: string = String(req.body?.message ?? "").trim();
  const provider: AiProvider = (req.body?.provider ?? "auto") as AiProvider;
  const mode: Mode = ((req.body?.mode ?? "chat") as string).toLowerCase() as Mode;
  const tone: Tone = ((req.body?.tone ?? "conversational") as string).toLowerCase() as Tone;
  const focus: Focus = ((req.body?.focus ?? "general") as string).toLowerCase() as Focus;
  const language: "auto" | "en" | "ar" =
    ((req.body?.language ?? "auto") as string).toLowerCase() as "auto" | "en" | "ar";
  const accent: Accent = ((req.body?.accent ?? "default") as string).toLowerCase() as Accent;
  const agentName: string = String(req.body?.agent_name ?? "NexFlow AI").slice(0, 40);
  const history: Array<{ role: "user" | "assistant"; text: string }> = Array.isArray(
    req.body?.history,
  )
    ? req.body.history.slice(-8)
    : [];

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
    ? `LIVE DATA (as of now — use these exact numbers, do not invent any):\n${JSON.stringify(ctx, null, 2)}`
    : `LIVE DATA: temporarily unavailable — answer generally.`;

  const system = buildSystemPrompt({ agentName, tone, mode, focus, language, accent });

  // Build message list in Gemini format: prior history (user/model alternating) + current user turn
  const geminiMessages: Array<{ role: "user" | "model"; text: string }> = [];

  // Prepend data context to the first user turn (or create a synthetic one if history is empty)
  const contextPreamble = `${dataBlock}\n\n---\nUSER MESSAGE: ${message}`;
  if (history.length === 0) {
    geminiMessages.push({ role: "user", text: contextPreamble });
  } else {
    // Insert data context into the first historical user turn so it doesn't bloat every turn
    for (let i = 0; i < history.length; i++) {
      const h = history[i]!;
      const isFirst = i === 0 && h.role === "user";
      geminiMessages.push({
        role: h.role === "user" ? "user" : "model",
        text: isFirst ? `${dataBlock}\n\nUSER: ${h.text}` : h.text,
      });
    }
    geminiMessages.push({ role: "user", text: message });
  }

  try {
    const reply = await aiGeminiChat({
      system,
      messages: geminiMessages,
      maxTokens: tone === "concise" ? 400 : 1200,
    });

    if (!reply) {
      res.json({
        reply:
          language === "ar"
            ? "لم أستطع الاتصال بالذكاء الاصطناعي الآن. حاول بعد لحظات."
            : "I couldn't reach the AI right now. Please try again in a moment.",
        provider_used: "gemini-2.0-flash",
        actions: [],
        data_used: ctx ? Object.keys(ctx) : [],
      });
      return;
    }

    const { cleanText, actions } = extractActions(reply);

    res.json({
      reply: cleanText,
      provider_used: "gemini-2.0-flash",
      actions,
      data_used: ctx ? Object.keys(ctx) : [],
    });
  } catch (err: any) {
    req.log.error({ err }, "[assistant] chat failed");
    res.status(500).json({ error: err?.message ?? "ai_error" });
  }
});

// ─── POST /api/assistant/transcribe — Whisper STT for voice input ──────
router.post("/transcribe", async (req, res) => {
  const audio_base64: string = String(req.body?.audio_base64 ?? "");
  const mime: string = String(req.body?.mime ?? "audio/webm");
  const language: string | undefined = req.body?.language ? String(req.body.language) : undefined;

  if (!audio_base64) {
    res.status(400).json({ error: "audio_base64 required" });
    return;
  }
  // Strip data-URL prefix if present.
  const b64 = audio_base64.includes(",") ? audio_base64.split(",", 2)[1]! : audio_base64;
  let buf: Buffer;
  try {
    buf = Buffer.from(b64, "base64");
  } catch {
    res.status(400).json({ error: "invalid base64" });
    return;
  }
  // Express body limit is 25mb; base64 inflates ~33%, so cap raw at 18mb.
  if (buf.length === 0 || buf.length > 18 * 1024 * 1024) {
    res.status(400).json({ error: "audio empty or too large (18mb max)" });
    return;
  }

  const ext = mime.includes("mp3")
    ? "mp3"
    : mime.includes("wav")
      ? "wav"
      : mime.includes("m4a") || mime.includes("mp4")
        ? "m4a"
        : mime.includes("ogg")
          ? "ogg"
          : "webm";

  try {
    const { text } = await aiTranscribe({
      audio: buf,
      filename: `voice.${ext}`,
      language,
    });
    res.json({ text, language });
  } catch (err: any) {
    req.log.error({ err }, "[assistant] transcribe failed");
    res.status(500).json({ error: err?.message ?? "transcribe_failed" });
  }
});

// ─── POST /api/assistant/tts — Real Gemini TTS → WAV audio ─────────────
// Maps persona voice IDs to Gemini prebuilt voices + dialect instruction.
// Returns audio/wav binary — client should play via new Audio(URL.createObjectURL(blob)).
const TTS_VOICE_MAP: Record<string, { geminiVoice: string; dialectInstruction: string }> = {
  layla:  { geminiVoice: "Aoede",  dialectInstruction: "warm Gulf Arabic (Khaleeji) female"  },
  faisal: { geminiVoice: "Orus",   dialectInstruction: "Gulf Arabic (Khaleeji) male"          },
  noor:   { geminiVoice: "Leda",   dialectInstruction: "warm bilingual Arabic-English female" },
  adam:   { geminiVoice: "Charon", dialectInstruction: "professional English male"             },
  sara:   { geminiVoice: "Kore",   dialectInstruction: "professional English female"           },
};

router.post("/tts", async (req, res) => {
  const text: string = String(req.body?.text ?? "").slice(0, 4000).trim();
  const voiceId: string = String(req.body?.voice_id ?? "layla").toLowerCase();

  if (!text) {
    res.status(400).json({ error: "text required" });
    return;
  }

  const voiceCfg = TTS_VOICE_MAP[voiceId] ?? TTS_VOICE_MAP["layla"]!;

  try {
    const wav = await aiGeminiTts({
      text,
      voiceName: voiceCfg.geminiVoice,
      dialectInstruction: voiceCfg.dialectInstruction,
    });
    res.set({
      "Content-Type": "audio/wav",
      "Content-Length": String(wav.length),
      "Cache-Control": "no-store",
    });
    res.send(wav);
  } catch (err: any) {
    req.log.error({ err }, "[assistant/tts] Gemini TTS failed");
    res.status(500).json({ error: err?.message ?? "tts_failed" });
  }
});

// ─── POST /api/assistant/voice — legacy metadata (kept for compat) ──────
router.post("/voice", async (req, res) => {
  const text: string = String(req.body?.text ?? "").trim();
  const voiceId: string = String(req.body?.voice_id ?? "layla");
  if (!text) {
    res.status(400).json({ error: "text required" });
    return;
  }
  const voiceMap: Record<string, { lang: string; gender: "female" | "male"; label: string }> = {
    layla: { lang: "ar-SA", gender: "female", label: "Layla — Gulf Arabic Female" },
    faisal: { lang: "ar-SA", gender: "male", label: "Faisal — Gulf Arabic Male" },
    noor: { lang: "ar", gender: "female", label: "Noor — Bilingual AR/EN" },
    adam: { lang: "en-US", gender: "male", label: "Adam — English Male" },
    sara: { lang: "en-US", gender: "female", label: "Sara — English Female" },
  };
  const v = voiceMap[voiceId.toLowerCase()] ?? voiceMap["layla"]!;
  res.json({
    mode: "gemini_tts",
    text,
    voice: { id: voiceId, ...v },
    note: "Browser SpeechSynthesis / expo-speech speaks in the requested language; install ElevenLabs/Gemini TTS for premium audio.",
  });
});

export default router;
