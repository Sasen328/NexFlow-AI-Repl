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
}
