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

export type AiProvider = "openai" | "anthropic" | "gemini" | "perplexity" | "auto";

const providerModelMap: Record<AiProvider, string> = {
  openai: "openai/gpt-4o-mini",
  anthropic: "anthropic/claude-3.5-sonnet",
  gemini: "google/gemini-2.0-flash-001",
  perplexity: "perplexity/llama-3.1-sonar-large-128k-online",
  auto: "openai/gpt-4o-mini",
};

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
  const client = useRouter ? openrouter() : openai();
  const chosenModel = useRouter
    ? (model ?? providerModelMap[provider])
    : "gpt-4o-mini";

  const messages: any[] = [];
  if (system) messages.push({ role: "system", content: system });
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
    console.error("[ai]", err?.message ?? err);
    if (json) return "{}";
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
  try {
    return JSON.parse(text) as T;
  } catch {
    return (opts.fallback ?? ({} as T));
  }
}
