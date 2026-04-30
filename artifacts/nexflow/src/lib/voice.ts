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
  r.continuous = true;
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
      try {
        r.start();
      } catch {
        // Some browsers throw when start() is called twice in a row — safe to ignore.
      }
    },
    stop: () => {
      try {
        r.stop();
      } catch {
        // ignore
      }
    },
  };
}

export function speak(
  text: string,
  opts?: { lang?: string; rate?: number; pitch?: number; onEnd?: () => void },
): void {
  if (!isSpeechSynthesisSupported() || !text.trim()) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = opts?.lang ?? "en-US";
  utter.rate = opts?.rate ?? 1;
  utter.pitch = opts?.pitch ?? 1;
  if (opts?.onEnd) utter.onend = () => opts.onEnd?.();
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}
