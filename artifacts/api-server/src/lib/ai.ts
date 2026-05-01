import OpenAI from "openai";

const openaiBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const openaiApiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const openrouterBaseUrl = process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL;
const openrouterApiKey = process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY;

// Direct OpenAI key for TTS fallback (proxy doesn't support audio/speech).
const directOpenaiKey = process.env.OPENAI_API_KEY;
// Gemini key — used directly with Google's REST API for TTS (proxy doesn't support audio).
const geminiApiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

export const aiEnabled = Boolean(openaiBaseUrl && openaiApiKey);
export const ttsEnabled = Boolean(geminiApiKey || directOpenaiKey);

let _openaiClient: OpenAI | null = null;
let _openrouterClient: OpenAI | null = null;
let _directClient: OpenAI | null = null;

export function openai(): OpenAI {
  if (!aiEnabled) {
    throw new Error("OpenAI integration not configured");
  }
  if (!_openaiClient) {
    _openaiClient = new OpenAI({ apiKey: openaiApiKey!, baseURL: openaiBaseUrl! });
  }
  return _openaiClient;
}

/** Direct OpenAI client — used as TTS fallback when Gemini TTS fails. */
function openaiDirect(): OpenAI {
  if (!directOpenaiKey) throw new Error("OPENAI_API_KEY not configured");
  if (!_directClient) {
    _directClient = new OpenAI({ apiKey: directOpenaiKey });
  }
  return _directClient;
}

/** Build a 44-byte WAV header for 16-bit PCM mono at the given sample rate. */
function pcmToWav(pcm: Buffer, sampleRate = 24000, channels = 1, bitsPerSample = 16): Buffer {
  const dataSize = pcm.length;
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + dataSize, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(channels, 22);
  h.writeUInt32LE(sampleRate, 24);
  h.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28);
  h.writeUInt16LE(channels * (bitsPerSample / 8), 32);
  h.writeUInt16LE(bitsPerSample, 34);
  h.write("data", 36);
  h.writeUInt32LE(dataSize, 40);
  return Buffer.concat([h, pcm]);
}

/**
 * Gemini TTS voices — mapped to persona names used by the TTS_VOICES catalog.
 * Primary voice engine: Google Gemini 2.5 Flash TTS (returns 24kHz mono PCM).
 * Voices chosen for warmth and Gulf-Arabic naturalness where possible.
 */
const GEMINI_VOICE_MAP: Record<string, string> = {
  shimmer: "Zephyr",
  nova:    "Leda",
  onyx:    "Charon",
  ash:     "Puck",
  coral:   "Aoede",
  echo:    "Orus",
  alloy:   "Kore",
  fable:   "Fenrir",
};

/** Call Google Gemini 2.5 Flash TTS and return a WAV buffer. */
async function geminiSpeak(opts: {
  text: string;
  geminiVoice: string;
  instructions?: string;
}): Promise<Buffer> {
  if (!geminiApiKey) throw new Error("Gemini API key not configured");
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${geminiApiKey}`;
  // Wrap text in a TTS instruction so the model stays in audio-generation mode
  // even when the input contains mixed Arabic-Latin scripts (e.g. names).
  const ttsPrompt = `Read aloud the following text exactly as written, do not translate or interpret it:\n${opts.text.slice(0, 4000)}`;
  const body: any = {
    contents: [{ parts: [{ text: ttsPrompt }] }],
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: opts.geminiVoice } },
      },
    },
  };
  const r = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json: any = await r.json();
  if (!r.ok || json.error) {
    throw new Error(json.error?.message ?? `Gemini TTS HTTP ${r.status}`);
  }
  const part = json.candidates?.[0]?.content?.parts?.[0];
  if (!part?.inlineData?.data) throw new Error("Gemini TTS returned no audio");
  const pcm = Buffer.from(part.inlineData.data, "base64");
  return pcmToWav(pcm, 24000, 1, 16);
}

/**
 * Gemini Vision — send an image + text prompt and get a JSON response back.
 * Model: gemini-2.5-flash (supports vision + JSON output).
 */
export async function aiGeminiVisionJson(opts: {
  prompt: string;
  imageDataUrl: string;
  maxTokens?: number;
}): Promise<any> {
  if (!geminiApiKey) throw new Error("Gemini API key not configured");
  const { prompt, imageDataUrl, maxTokens = 2000 } = opts;
  const [header, b64] = imageDataUrl.split(",");
  const mimeType = header?.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: b64 } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: maxTokens,
      temperature: 0.1,
    },
  };
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  const json: any = await r.json();
  if (!r.ok || json.error) throw new Error(json.error?.message ?? `Gemini Vision HTTP ${r.status}`);
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  try { return JSON.parse(text); } catch { return {}; }
}

/**
 * Direct Gemini text-generation — bypasses the OpenRouter proxy entirely.
 * Uses gemini-2.5-flash which is fast, reliable, and supports bilingual GCC content.
 */
export async function aiGeminiChat(opts: {
  system?: string;
  messages: Array<{ role: "user" | "model"; text: string }>;
  maxTokens?: number;
}): Promise<string> {
  if (!geminiApiKey) throw new Error("Gemini API key not configured");
  const { system, messages, maxTokens = 1500 } = opts;

  const contents: any[] = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  const body: any = {
    contents,
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
    },
  };
  if (system) {
    body.systemInstruction = { parts: [{ text: system }] };
  }

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  const json: any = await r.json();
  if (!r.ok || json.error) throw new Error(json.error?.message ?? `Gemini HTTP ${r.status}`);
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

/**
 * Gemini TTS — returns a WAV buffer for the given text + voice.
 * voiceName must be a valid Gemini prebuilt voice (e.g. "Aoede", "Charon", "Leda").
 * dialectInstruction is prepended to the TTS prompt so the model reads with the right accent.
 */
export async function aiGeminiTts(opts: {
  text: string;
  voiceName: string;
  dialectInstruction?: string;
}): Promise<Buffer> {
  const { text, voiceName, dialectInstruction } = opts;
  const prefix = dialectInstruction
    ? `Read aloud the following text exactly as written with a ${dialectInstruction} accent, do not translate:\n`
    : `Read aloud the following text exactly as written, do not translate:\n`;
  return geminiSpeak({ text: prefix + text.slice(0, 3900), geminiVoice: voiceName });
}

export function openrouter(): OpenAI {
  if (!openrouterBaseUrl || !openrouterApiKey) {
    throw new Error("OpenRouter integration not configured");
  }
  if (!_openrouterClient) {
    _openrouterClient = new OpenAI({ apiKey: openrouterApiKey, baseURL: openrouterBaseUrl });
  }
  return _openrouterClient;
}

export type AiProvider = "openai" | "anthropic" | "gemini" | "perplexity" | "openrouter" | "auto";

const providerModelMap: Record<AiProvider, string> = {
  openai: "openai/gpt-4o-mini",
  anthropic: "anthropic/claude-sonnet-4.6",
  gemini: "google/gemini-2.5-flash",
  perplexity: "perplexity/sonar",
  openrouter: "openrouter/auto",
  auto: "openrouter/auto",
};

/** Transcribe an audio buffer with OpenAI Whisper via the integration. */
export async function aiTranscribe(opts: {
  audio: Buffer;
  filename?: string;
  language?: string;
}): Promise<{ text: string; language?: string }> {
  if (!aiEnabled) {
    throw new Error("OpenAI integration not configured");
  }
  const client = openai();
  // Lazy import — only this code path needs the File polyfill on Node 18.
  const { toFile } = await import("openai/uploads");
  const file = await toFile(opts.audio, opts.filename ?? "audio.webm", {
    type: "audio/webm",
  });
  try {
    const r = await client.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: opts.language,
    });
    return { text: (r as any).text ?? "", language: opts.language };
  } catch (err: any) {
    console.error("[ai] transcribe failed:", err?.message ?? err);
    throw new Error(err?.message ?? "transcribe_failed");
  }
}

/**
 * High-quality TTS — Gemini 2.5 Flash TTS primary, OpenAI gpt-4o-mini-tts fallback.
 * Returns { buffer, mimeType } so the route can set the correct Content-Type.
 *
 * voice: OpenAI voice name (shimmer, nova, onyx, ash, coral…) — auto-mapped to Gemini voice.
 * instructions: Style/accent hint passed to both engines.
 */
export async function aiSpeak(opts: {
  text: string;
  voice?: string;
  instructions?: string;
}): Promise<{ buffer: Buffer; mimeType: string }> {
  if (!ttsEnabled) throw new Error("No TTS API key configured");

  const openaiVoice = opts.voice ?? "shimmer";
  const geminiVoice = GEMINI_VOICE_MAP[openaiVoice] ?? "Zephyr";

  // 1) Try Gemini TTS (primary)
  if (geminiApiKey) {
    try {
      const buffer = await geminiSpeak({
        text: opts.text,
        geminiVoice,
        instructions: opts.instructions,
      });
      return { buffer, mimeType: "audio/wav" };
    } catch (err: any) {
      console.error("[ai] gemini TTS failed, falling back to OpenAI:", err?.message ?? err);
    }
  }

  // 2) Fall back to OpenAI direct TTS
  if (!directOpenaiKey) throw new Error("No TTS API key available");
  try {
    const client = openaiDirect();
    const resp = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: openaiVoice as any,
      input: opts.text.slice(0, 4000),
      response_format: "mp3",
      ...(opts.instructions ? { instructions: opts.instructions } : {}),
    } as any);
    const arrayBuf = await resp.arrayBuffer();
    return { buffer: Buffer.from(arrayBuf), mimeType: "audio/mpeg" };
  } catch (err: any) {
    console.error("[ai] openai TTS fallback failed:", err?.message ?? err);
    throw new Error(err?.message ?? "tts_failed");
  }
}

export async function aiChat(opts: {
  system?: string;
  user: string;
  provider?: AiProvider;
  model?: string;
  json?: boolean;
  maxTokens?: number;
}): Promise<string> {
  const { system, user, provider = "auto", model, json = false, maxTokens = 1500 } = opts;

  // Prefer OpenRouter when available (multi-provider). Fall back to OpenAI.
  const useRouter = Boolean(openrouterBaseUrl && openrouterApiKey);

  let client: OpenAI;
  try {
    client = useRouter ? openrouter() : openai();
  } catch (err: any) {
    // No AI integration configured — return empty so caller can fallback
    console.error("[ai] init failed:", err?.message ?? err);
    return json ? "" : "";
  }

  const chosenModel = useRouter
    ? (model ?? providerModelMap[provider])
    : "gpt-4o-mini";

  // OpenAI requires the word "json" to appear in messages when using json_object response format
  const systemText = json && system && !/json/i.test(system)
    ? `${system} Always respond with valid JSON.`
    : system;

  const messages: any[] = [];
  if (systemText) messages.push({ role: "system", content: systemText });
  messages.push({ role: "user", content: user });

  try {
    const resp = await client.chat.completions.create({
      model: chosenModel,
      messages,
      max_tokens: maxTokens,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    });
    return resp.choices[0]?.message?.content ?? "";
  } catch (err: any) {
    // Graceful degradation — never crash the route
    console.error("[ai] request failed:", err?.message ?? err);
    return "";
  }
}

export async function aiJson<T = any>(opts: {
  system?: string;
  user: string;
  provider?: AiProvider;
  model?: string;
  fallback?: T;
}): Promise<T> {
  const text = await aiChat({ ...opts, json: true });
  if (!text || !text.trim()) {
    return (opts.fallback ?? ({} as T));
  }
  try {
    const parsed = JSON.parse(text) as T;
    // Empty object means model returned "{}" — prefer fallback if provided
    if (
      opts.fallback &&
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      Object.keys(parsed as Record<string, unknown>).length === 0
    ) {
      return opts.fallback;
    }
    return parsed;
  } catch {
    return (opts.fallback ?? ({} as T));
  }
}
