/**
 * Thin browser-native voice wrappers used by the AI Assistant bubble.
 *
 * - Speech-to-text uses the Web Speech API's `SpeechRecognition` (or its
 *   `webkitSpeechRecognition` prefix in Chromium-family browsers).
 * - Text-to-speech uses `window.speechSynthesis`.
 *
 * Both are graceful no-ops in unsupported environments — the assistant UI
 * checks `isSpeechRecognitionSupported()` / `isSpeechSynthesisSupported()`
 * before exposing the toggles.
 *
 * Arabic Gulf voices: when lang is "ar-AE" or "ar-SA" the speak() function
 * prefers known Gulf-dialect voices available in Chromium:
 *   Female — Zariyah (ar-SA), Hala (ar-AE), Layla (ar-AE)
 *   Male   — Tarik (ar-SA) or any other ar-SA/ar-AE male voice
 */

export interface RecognitionUpdate {
  interim: string;
  final: string;
}

export interface RecognizerHandle {
  isSupported: boolean;
  start: () => void;
  stop: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function createRecognizer(opts: {
  onUpdate: (u: RecognitionUpdate) => void;
  onEnd?: () => void;
  onError?: (msg: string) => void;
  lang?: string;
}): RecognizerHandle {
  if (!isSpeechRecognitionSupported()) {
    return { isSupported: false, start: () => {}, stop: () => {} };
  }
  const w = window as unknown as Record<string, unknown>;
  const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as new () => any;
  const r = new Ctor();
  r.lang = opts.lang ?? "en-US";
  r.interimResults = true;
  // Single-shot: auto-finalises on natural pause for snappier turn-taking.
  r.continuous = false;
  r.maxAlternatives = 1;
  r.onresult = (event: any) => {
    let interim = "";
    let final = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const text = result[0]?.transcript ?? "";
      if (result.isFinal) final += text;
      else interim += text;
    }
    opts.onUpdate({ interim: interim.trim(), final: final.trim() });
  };
  r.onend = () => opts.onEnd?.();
  r.onerror = (e: any) => opts.onError?.(typeof e?.error === "string" ? e.error : "unknown");
  return {
    isSupported: true,
    start: () => {
      try { r.start(); } catch { /* ignore double-start */ }
    },
    stop: () => {
      try { r.stop(); } catch { /* ignore */ }
    },
  };
}

// Known Gulf-Arabic voice name fragments, in preference order.
// Chromium ships Zariyah (ar-SA female) and Tarik (ar-SA male) on most platforms.
// macOS/iOS add Layla (ar-AE female). We fall back gracefully.
const ARABIC_FEMALE_HINTS = ["zariyah", "hala", "layla", "maged"];
const ARABIC_MALE_HINTS   = ["tarik",   "naayf", "omar", "maged"];

function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
  gender: "female" | "male" | "any",
): SpeechSynthesisVoice | undefined {
  const hints = gender === "female" ? ARABIC_FEMALE_HINTS
              : gender === "male"   ? ARABIC_MALE_HINTS
              : [];

  const rootLang = lang.split("-")[0]; // "ar", "en", …

  // 1. Exact lang + name hint
  for (const hint of hints) {
    const v = voices.find(v => v.lang === lang && v.name.toLowerCase().includes(hint));
    if (v) return v;
  }
  // 2. Root lang match + name hint (catches "ar-SA" when we ask for "ar-AE")
  for (const hint of hints) {
    const v = voices.find(v => v.lang.startsWith(rootLang) && v.name.toLowerCase().includes(hint));
    if (v) return v;
  }
  // 3. Exact lang, any voice
  const exact = voices.find(v => v.lang === lang);
  if (exact) return exact;
  // 4. Root lang, any voice
  return voices.find(v => v.lang.startsWith(rootLang));
}

export function speak(
  text: string,
  opts?: {
    lang?: string;
    rate?: number;
    pitch?: number;
    gender?: "female" | "male" | "any";
    onEnd?: () => void;
  },
): void {
  if (!isSpeechSynthesisSupported() || !text.trim()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  const lang = opts?.lang ?? "en-US";
  utter.lang = lang;
  utter.rate = opts?.rate ?? 1.05;
  utter.pitch = opts?.pitch ?? 1;
  if (opts?.onEnd) utter.onend = () => opts.onEnd?.();

  const voices = synth.getVoices();
  const isArabic = lang.startsWith("ar");
  const gender = opts?.gender ?? (isArabic ? "female" : "any");
  const preferred = pickVoice(voices, lang, gender);
  if (preferred) utter.voice = preferred;

  // Defer one micro-tick to dodge the cancel-then-speak race in some browsers.
  setTimeout(() => synth.speak(utter), 0);
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
  stopServerSpeak();
}

// ─── Server-side TTS via /api/ai/tts (OpenAI gpt-4o-mini-tts) ────────────────
//
// Voice IDs map to backend personas — see artifacts/api-server/src/routes/ai.ts
// TTS_VOICES catalogue:
//   Arabic female: layla (warm Khaleeji), noor (energetic Saudi)
//   Arabic male:   khalid (warm Khaleeji), faisal (formal Saudi)
//   English female: sara (friendly), amelia (professional)
//   English male:   adam (authoritative), james (energetic)

let _activeAudio: HTMLAudioElement | null = null;
let _activeUrl: string | null = null;

export type ServerVoiceId =
  | "layla" | "noor" | "khalid" | "faisal"
  | "sara"  | "amelia" | "adam" | "james";

export function pickServerVoice(opts: {
  lang?: "ar" | "en" | string;
  gender?: "Female" | "Male" | "female" | "male" | "any";
  name?: string;
}): ServerVoiceId {
  // Direct name match first (case-insensitive)
  const lower = (opts.name ?? "").toLowerCase().trim();
  if (lower === "layla" || lower === "ليلى") return "layla";
  if (lower === "noor"  || lower === "نور")   return "noor";
  if (lower === "khalid"|| lower === "خالد") return "khalid";
  if (lower === "faisal"|| lower === "فيصل") return "faisal";
  if (lower === "sara"  || lower === "sarah") return "sara";
  if (lower === "amelia") return "amelia";
  if (lower === "adam") return "adam";
  if (lower === "james") return "james";

  const isArabic = (opts.lang ?? "").toLowerCase().startsWith("ar");
  const gender = String(opts.gender ?? "").toLowerCase();
  const female = gender === "female" || gender === "f";
  if (isArabic) return female ? "layla" : "khalid";
  return female ? "sara" : "adam";
}

export async function speakViaServer(
  text: string,
  voice: ServerVoiceId,
  opts?: { onEnd?: () => void; onError?: (msg: string) => void; signal?: AbortSignal },
): Promise<void> {
  if (!text.trim()) return;
  stopServerSpeak();
  // Stop any browser TTS too so they don't overlap.
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
  try {
    const r = await fetch("/api/ai/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 3500), voice }),
      signal: opts?.signal,
    });
    if (!r.ok) {
      const msg = `TTS HTTP ${r.status}`;
      opts?.onError?.(msg);
      // Fall back to browser TTS so the user still hears something.
      // Critically: only fire onEnd when the fallback finishes, otherwise
      // turn-taking callers (voice-call modal) will start the mic while the
      // assistant is still talking and capture itself.
      const fallbackLang = (voice === "layla" || voice === "noor" || voice === "khalid" || voice === "faisal") ? "ar-SA" : "en-US";
      speak(text, { lang: fallbackLang, onEnd: () => opts?.onEnd?.() });
      return;
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    _activeAudio = audio;
    _activeUrl = url;
    audio.onended = () => {
      if (_activeUrl === url) { URL.revokeObjectURL(url); _activeUrl = null; _activeAudio = null; }
      opts?.onEnd?.();
    };
    audio.onerror = () => {
      if (_activeUrl === url) { URL.revokeObjectURL(url); _activeUrl = null; _activeAudio = null; }
      opts?.onError?.("audio_error");
      // Single onEnd — caller's turn-taking should resume now since playback failed.
      opts?.onEnd?.();
    };
    await audio.play().catch((e) => {
      opts?.onError?.(e?.message ?? "play_blocked");
      // play() failed (e.g. autoplay block). onerror may not fire — release the
      // turn now so the conversation does not stall.
      if (_activeUrl === url) { URL.revokeObjectURL(url); _activeUrl = null; _activeAudio = null; }
      opts?.onEnd?.();
    });
  } catch (e: any) {
    if (e?.name === "AbortError") return;
    opts?.onError?.(e?.message ?? "tts_failed");
    // Last-resort browser fallback so the assistant still feels alive.
    const isArabicVoice = voice === "layla" || voice === "noor" || voice === "khalid" || voice === "faisal";
    const fallbackLang = isArabicVoice ? "ar-SA" : "en-US";
    const fallbackGender: "female" | "male" = (voice === "khalid" || voice === "faisal" || voice === "adam" || voice === "james") ? "male" : "female";
    speak(text, { lang: fallbackLang, gender: fallbackGender, onEnd: () => opts?.onEnd?.() });
  }
}

export function stopServerSpeak(): void {
  if (_activeAudio) {
    try { _activeAudio.pause(); } catch { /* noop */ }
    _activeAudio = null;
  }
  if (_activeUrl) {
    try { URL.revokeObjectURL(_activeUrl); } catch { /* noop */ }
    _activeUrl = null;
  }
}
