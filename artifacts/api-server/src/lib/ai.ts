import OpenAI from "openai";

const openaiBaseUrl = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const openaiApiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const openrouterBaseUrl = process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL;
const openrouterApiKey = process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY;

export const aiEnabled = Boolean(openaiBaseUrl && openaiApiKey);

let _openaiClient: OpenAI | null = null;
let _openrouterClient: OpenAI | null = null;

export function openai(): OpenAI {
  if (!aiEnabled) {
    throw new Error("OpenAI integration not configured");
  }
  if (!_openaiClient) {
    _openaiClient = new OpenAI({ apiKey: openaiApiKey!, baseURL: openaiBaseUrl! });
  }
  return _openaiClient;
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
 * High-quality TTS via OpenAI gpt-4o-mini-tts.
 * Voices: alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer, verse.
 * The `instructions` field tunes accent / style (e.g. warm Saudi female).
 */
export async function aiSpeak(opts: {
  text: string;
  voice?: string;
  instructions?: string;
  format?: "mp3" | "wav" | "opus" | "aac" | "flac";
}): Promise<Buffer> {
  if (!aiEnabled) throw new Error("OpenAI integration not configured");
  const client = openai();
  const voice = (opts.voice ?? "shimmer") as any;
  const format = opts.format ?? "mp3";
  try {
    const resp = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice,
      input: opts.text.slice(0, 4000),
      response_format: format,
      ...(opts.instructions ? { instructions: opts.instructions } : {}),
    } as any);
    const arrayBuf = await resp.arrayBuffer();
    return Buffer.from(arrayBuf);
  } catch (err: any) {
    console.error("[ai] speak failed:", err?.message ?? err);
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
