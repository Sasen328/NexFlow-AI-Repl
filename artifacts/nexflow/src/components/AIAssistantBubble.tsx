/**
 * Global floating AI Assistant bubble — production-ready.
 *
 * • Draggable, position persisted in localStorage.
 * • Click to expand into a chat panel anchored to the bubble.
 * • Voice input: Web Speech API on Chrome/Edge, MediaRecorder→Whisper
 *   fallback for Safari / iPad / Firefox so it works in production.
 * • TTS via Web Speech Synthesis with Arabic Gulf voice support.
 * • Conversational by default (Chat mode). Pick Research or Analyze
 *   from the mode pills to route to Perplexity / Claude / multi-agent.
 * • Full Settings drawer: agent name, AI provider, tone, focus,
 *   language, Arabic accent, voice, accent colour.
 * • Action buttons returned by the backend route the user (open page,
 *   start a call, draft email/WhatsApp).
 * • Bilingual EN ⇄ AR labels.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Mic, MicOff, X, Volume2, VolumeX, Send, Bot,
  Phone, Mail, MessageSquare, ArrowRight,
  Settings as SettingsIcon, AlertTriangle, Loader2,
  ChevronLeft,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  getRole, isSignedIn, signInAs,
} from "@/lib/marketing-auth";
import {
  createRecognizer, speak, stopSpeaking,
  speakViaServer, pickServerVoice,
  isSpeechRecognitionSupported, isSpeechSynthesisSupported,
  type RecognizerHandle,
} from "@/lib/voice";
import { cn } from "@/lib/utils";

// ─── Storage keys ────────────────────────────────────────────────────
const STORAGE_POS      = "nf:assistant:pos";
const STORAGE_TTS      = "nf:assistant:tts";
const STORAGE_LANG     = "nf:assistant:lang";
const STORAGE_SETTINGS = "nf:assistant:settings:v1";

// ─── Types ───────────────────────────────────────────────────────────
type AiProvider = "auto" | "openai" | "anthropic" | "gemini" | "perplexity" | "openrouter";
type Tone = "conversational" | "concise" | "coach" | "enthusiastic" | "formal";
type Focus = "general" | "sales" | "marketing" | "research";
type Language = "auto" | "en" | "ar";
type Accent = "default" | "saudi" | "uae" | "egyptian";
type VoiceName = "layla" | "faisal" | "noor" | "adam" | "sara";

type AssistantAction = {
  kind: "open" | "start_call" | "draft_email" | "draft_whatsapp" | "switch_mode";
  label: string;
  path?: string;
  payload?: Record<string, unknown>;
};

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
  ts: number;
  actions?: AssistantAction[];
};

type AssistantSettings = {
  agentName: string;
  provider: AiProvider;
  tone: Tone;
  focus: Focus;
  language: Language;
  accent: Accent;
  voice: VoiceName;
  color: string;
};

const DEFAULT_SETTINGS: AssistantSettings = {
  agentName: "NexFlow AI",
  provider: "auto",
  tone: "conversational",
  focus: "general",
  language: "auto",
  accent: "default",
  voice: "layla",
  color: "#B8A0C8",
};

const ACCENT_COLORS = [
  { name: "Lavender", value: "#B8A0C8" },
  { name: "Teal",     value: "#88B8B0" },
  { name: "Sand",     value: "#C8A880" },
  { name: "Olive",    value: "#B8B880" },
  { name: "Rose",     value: "#C0A0B8" },
  { name: "Sky",      value: "#90B8C8" },
];

// ─── i18n labels ────────────────────────────────────────────────────
const L = {
  en: {
    greetingChat: (name: string, agent: string) =>
      `Hi ${name} 👋 I'm ${agent}. Ask me anything, or tap the mic to talk.`,
    settings: "Settings", chat: "Chat", research: "Research", analyze: "Analyze",
    askAnything: "Ask anything…", listening: "Listening…", transcribing: "Transcribing…",
    thinking: "Thinking…", ready: "Ready", muteVoice: "Mute voice replies",
    enableVoice: "Speak replies aloud", micUnsupported: "Mic not supported here",
    startListening: "Start listening", stopListening: "Stop listening",
    close: "Close", back: "Back", agentName: "Agent name", aiProvider: "AI provider",
    tone: "Tone", focus: "Focus", language: "Language", arabicAccent: "Arabic accent",
    voice: "Voice", accentColor: "Accent colour", auto: "Auto",
    sender: "Send",
  },
  ar: {
    greetingChat: (name: string, agent: string) =>
      `مرحباً ${name} 👋 أنا ${agent}. اسألني أي شيء أو اضغط على الميكروفون للتحدث.`,
    settings: "الإعدادات", chat: "محادثة", research: "بحث", analyze: "تحليل",
    askAnything: "اسألني أي شيء…", listening: "أستمع إليك…", transcribing: "جارٍ التحويل…",
    thinking: "جارٍ التفكير…", ready: "جاهز", muteVoice: "كتم الصوت",
    enableVoice: "تحدّث بالردود", micUnsupported: "الميكروفون غير مدعوم",
    startListening: "ابدأ الاستماع", stopListening: "أوقف الاستماع",
    close: "إغلاق", back: "رجوع", agentName: "اسم المساعد", aiProvider: "المزود",
    tone: "النبرة", focus: "التركيز", language: "اللغة", arabicAccent: "اللهجة العربية",
    voice: "الصوت", accentColor: "اللون", auto: "تلقائي",
    sender: "إرسال",
  },
};

// ─── Helpers ────────────────────────────────────────────────────────
function loadSettings(): AssistantSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AssistantSettings>;
    // Validate every field against allow-lists so a poisoned localStorage
    // can't inject CSS / arbitrary strings into our inline styles.
    const allowedColors = new Set(ACCENT_COLORS.map(c => c.value));
    const allowedProviders: AiProvider[] = ["auto", "openai", "anthropic", "gemini", "perplexity"];
    const allowedTones: Tone[] = ["conversational", "concise", "coach", "enthusiastic", "formal"];
    const allowedFocus: Focus[] = ["general", "sales", "marketing", "research"];
    const allowedLangs: Language[] = ["auto", "en", "ar"];
    const allowedAccents: Accent[] = ["default", "saudi", "uae", "egyptian"];
    const allowedVoices: VoiceName[] = ["layla", "faisal", "noor", "adam", "sara"];
    const safe: AssistantSettings = {
      agentName: typeof parsed.agentName === "string" && parsed.agentName.trim()
        ? parsed.agentName.replace(/[<>]/g, "").slice(0, 40)
        : DEFAULT_SETTINGS.agentName,
      provider: allowedProviders.includes(parsed.provider as AiProvider) ? (parsed.provider as AiProvider) : DEFAULT_SETTINGS.provider,
      tone: allowedTones.includes(parsed.tone as Tone) ? (parsed.tone as Tone) : DEFAULT_SETTINGS.tone,
      focus: allowedFocus.includes(parsed.focus as Focus) ? (parsed.focus as Focus) : DEFAULT_SETTINGS.focus,
      language: allowedLangs.includes(parsed.language as Language) ? (parsed.language as Language) : DEFAULT_SETTINGS.language,
      accent: allowedAccents.includes(parsed.accent as Accent) ? (parsed.accent as Accent) : DEFAULT_SETTINGS.accent,
      voice: allowedVoices.includes(parsed.voice as VoiceName) ? (parsed.voice as VoiceName) : DEFAULT_SETTINGS.voice,
      color: typeof parsed.color === "string" && allowedColors.has(parsed.color) ? parsed.color : DEFAULT_SETTINGS.color,
    };
    return safe;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function loadPosition(): { x: number; y: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_POS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x !== "number" || typeof parsed?.y !== "number") return null;
    // Clamp to current viewport so a stale off-screen position from a
    // previous, larger window never hides the bubble.
    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = Math.max(8, Math.min(w - 64, parsed.x));
    const y = Math.max(8, Math.min(h - 64, parsed.y));
    return { x, y };
  } catch {/* ignore */}
  return null;
}

function loadTTS(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_TTS) === "1";
}

function loadLang(): "en" | "ar" {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(STORAGE_LANG) === "ar" ? "ar" : "en";
}

function ttsLangFor(uiLang: "en" | "ar", accent: Accent): string {
  if (uiLang !== "ar") return "en-US";
  switch (accent) {
    case "saudi":    return "ar-SA";
    case "uae":      return "ar-AE";
    case "egyptian": return "ar-EG";
    default:         return "ar-AE";
  }
}

function voiceGenderFor(v: VoiceName): "female" | "male" {
  return v === "faisal" || v === "adam" ? "male" : "female";
}

// ─── Component ───────────────────────────────────────────────────────
export function AIAssistantBubble() {
  const [signed, setSigned] = useState<boolean>(() => isSignedIn());
  const [role, setRole] = useState(() => getRole());

  useEffect(() => {
    // Auto-sign in as Sales if the user arrives without going through the Welcome flow.
    // This is a demo app — the bubble should always be visible.
    if (!isSignedIn()) {
      signInAs("sales");
      setSigned(true);
      setRole(getRole());
    }
    const refresh = () => {
      setSigned(isSignedIn());
      setRole(getRole());
    };
    window.addEventListener("nf:role-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("nf:role-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return <BubbleInner role={role} key={role.key} />;
}

function BubbleInner({ role }: { role: ReturnType<typeof getRole> }) {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(loadPosition);
  const [ttsOn, setTtsOn] = useState<boolean>(loadTTS);
  const [uiLang, setUiLang] = useState<"en" | "ar">(loadLang);
  const [settings, setSettings] = useState<AssistantSettings>(loadSettings);
  const [pending, setPending] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const t = L[uiLang];
  const accent = settings.color;
  const firstName = role.name.split(" ")[0];

  const greetingText = uiLang === "ar"
    ? L.ar.greetingChat(firstName, settings.agentName)
    : L.en.greetingChat(firstName, settings.agentName);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: "g0", role: "ai", text: greetingText, ts: Date.now() },
  ]);
  const [input, setInput] = useState("");

  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognizerRef = useRef<RecognizerHandle | null>(null);
  const submitRef = useRef<((text: string) => void) | null>(null);
  const recorderRef = useRef<{ rec: MediaRecorder; chunks: BlobPart[]; stream: MediaStream } | null>(null);

  // Pre-warm voices list
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Refresh greeting when settings/lang change but only if no real chat yet
  useEffect(() => {
    setMessages(prev => {
      if (prev.length <= 1 && prev[0]?.id === "g0") {
        return [{ id: "g0", role: "ai", text: greetingText, ts: Date.now() }];
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLang, settings.agentName]);

  const constraintsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, interim, pending, transcribing]);

  // Persist toggles
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_TTS, ttsOn ? "1" : "0"); } catch {/* ignore */}
  }, [ttsOn]);
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_LANG, uiLang); } catch {/* ignore */}
  }, [uiLang]);
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings)); } catch {/* ignore */}
  }, [settings]);

  // Keep the visible UI language in sync with the user's settings choice.
  // settings.language === "auto" leaves uiLang untouched (browser preference wins).
  useEffect(() => {
    if (settings.language === "ar" && uiLang !== "ar") setUiLang("ar");
    else if (settings.language === "en" && uiLang !== "en") setUiLang("en");
  }, [settings.language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for global "open assistant" requests from anywhere in the app
  useEffect(() => {
    function onOpen(e: Event) {
      // Always force the bubble back to a guaranteed-visible spot first so
      // the panel that anchors to it is on-screen.
      try {
        const safe = {
          x: Math.max(8, window.innerWidth - 80),
          y: Math.max(8, window.innerHeight - 96),
        };
        setPosition(safe);
        window.localStorage.setItem(STORAGE_POS, JSON.stringify(safe));
      } catch {/* ignore */}
      setOpen(true);
      const detail = (e as CustomEvent).detail;
      if (detail?.text && typeof detail.text === "string") {
        setTimeout(() => submitRef.current?.(detail.text), 60);
      }
    }
    window.addEventListener("nf:open-assistant", onOpen);
    return () => window.removeEventListener("nf:open-assistant", onOpen);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    recognizerRef.current?.stop();
    stopSpeaking();
    try {
      recorderRef.current?.rec.stop();
      recorderRef.current?.stream.getTracks().forEach(t => t.stop());
    } catch {/* ignore */}
  }, []);

  // Default position — bottom-right with a 24px margin
  const defaultPos = useMemo(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    return { x: window.innerWidth - 80, y: window.innerHeight - 96 };
  }, []);
  const startPos = position ?? defaultPos;

  const speakReply = useCallback((text: string) => {
    if (!ttsOn || !text.trim()) return;
    const clean = text.replace(/\[\d+\]/g, "").slice(0, 600);
    const serverVoice = pickServerVoice({
      lang: uiLang === "ar" ? "ar" : "en",
      gender: voiceGenderFor(settings.voice) === "male" ? "male" : "female",
      name: settings.voice,
    });
    // Use high-quality server TTS; gracefully falls back to browser SpeechSynthesis on error.
    speakViaServer(clean, serverVoice).catch(() => {
      speak(clean, {
        lang: ttsLangFor(uiLang, settings.accent),
        gender: voiceGenderFor(settings.voice),
      });
    });
  }, [ttsOn, uiLang, settings.accent, settings.voice]);

  const runAction = useCallback((a: AssistantAction) => {
    // Mode switching has been retired in favour of fully auto-orchestrated routing.
    if (a.kind === "switch_mode") return;
    if (a.path) {
      navigate(a.path);
      setOpen(false);
    }
  }, [navigate]);

  const submit = useCallback(
    (textRaw: string) => {
      const text = textRaw.trim();
      if (!text) return;
      const userMsg: ChatMessage = { id: `u${Date.now()}`, role: "user", text, ts: Date.now() };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setInterim("");
      setPending(true);

      const placeholderId = `a${Date.now() + 1}`;
      setMessages((m) => [...m, { id: placeholderId, role: "ai", text: t.thinking, ts: Date.now() + 1 }]);

      // Build short history for context
      const history = messages.slice(-6).filter(m => m.id !== "g0").map(m => ({
        role: m.role === "user" ? "user" as const : "assistant" as const,
        text: m.text,
      }));

      void (async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30_000);
        try {
          const r = await fetch("/api/ai/assistant", {
            method: "POST",
            headers: { "content-type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              message: text,
              role: { key: role.key, name: role.name, title: role.title },
              context: typeof window !== "undefined" ? window.location.pathname : "/",
              mode: "auto",
              tone: settings.tone,
              focus: settings.focus,
              language: settings.language,
              accent: settings.accent,
              agent_name: settings.agentName,
              provider: settings.provider,
              history,
            }),
          });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const data = (await r.json()) as { reply?: string; actions?: AssistantAction[] };
          const reply = (data.reply || "").trim() ||
            (uiLang === "ar" ? "لم أستطع الرد الآن، حاول مرة أخرى." : "I couldn't reply just now — try again.");
          setMessages((m) =>
            m.map((msg) => (msg.id === placeholderId ? { ...msg, text: reply, actions: data.actions } : msg)),
          );
          speakReply(reply);
        } catch {
          const fallback = uiLang === "ar"
            ? "حدث خطأ في الاتصال. تأكد من الإنترنت وحاول مرة أخرى."
            : "Connection error. Check your network and try again.";
          setMessages((m) => m.map((msg) => (msg.id === placeholderId ? { ...msg, text: fallback } : msg)));
        } finally {
          clearTimeout(timeout);
          setPending(false);
        }
      })();
    },
    [messages, role, settings, uiLang, t.thinking, speakReply],
  );

  useEffect(() => { submitRef.current = submit; }, [submit]);

  // ─── Whisper fallback recorder (Safari/iPad/Firefox) ────────────────
  const startMediaRecorder = useCallback(async () => {
    setVoiceError(null);
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Pick a mime the browser supports
      const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];
      let mime = "";
      for (const c of candidates) {
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(c)) { mime = c; break; }
      }
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: BlobPart[] = [];
      // Capture the stream locally so the closure has a non-null reference
      // even after `stream` is reassigned in retry / error paths.
      const localStream = stream;
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      rec.onstop = () => {
        localStream.getTracks().forEach(t => t.stop());
        recorderRef.current = null;
        const blob = new Blob(chunks, { type: mime || "audio/webm" });
        if (blob.size < 800) {
          setListening(false);
          setVoiceError(uiLang === "ar" ? "لم أسمع أي صوت — حاول التحدث بصوت أعلى." : "I didn't hear anything — try speaking a bit louder.");
          return;
        }
        setListening(false);
        setTranscribing(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64 = String(reader.result || "").split(",")[1] || "";
            const r = await fetch("/api/ai/transcribe", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                audio_base64: base64,
                mime: blob.type,
                language: settings.language === "ar" ? "ar" : settings.language === "en" ? "en" : (uiLang === "ar" ? "ar" : "en"),
              }),
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data?.error || "transcribe_failed");
            const captured = String(data?.text || "").trim();
            if (captured) submit(captured);
            else setVoiceError(uiLang === "ar" ? "لم أتمكن من فهم ما قلت." : "I couldn't make out what you said.");
          } catch (err: any) {
            setVoiceError(uiLang === "ar"
              ? `فشل تحويل الصوت: ${err?.message ?? "خطأ"}`
              : `Transcription failed: ${err?.message ?? "error"}`);
          } finally {
            setTranscribing(false);
          }
        };
        reader.readAsDataURL(blob);
      };
      recorderRef.current = { rec, chunks, stream };
      rec.start();
      setListening(true);
    } catch (err: any) {
      // Release the mic if MediaRecorder construction failed after getUserMedia
      try { stream?.getTracks().forEach(t => t.stop()); } catch {/* ignore */}
      setListening(false);
      setVoiceError(
        err?.name === "NotAllowedError"
          ? (uiLang === "ar" ? "تم رفض إذن الميكروفون. فعّله من إعدادات المتصفح." : "Microphone permission denied. Allow it in your browser settings.")
          : (uiLang === "ar" ? "تعذّر فتح الميكروفون." : "Could not access the microphone.")
      );
    }
  }, [uiLang, settings.language, submit]);

  const stopMediaRecorder = useCallback(() => {
    try { recorderRef.current?.rec.stop(); } catch {/* ignore */}
  }, []);

  // Toggle voice listening — prefer Web Speech, fall back to MediaRecorder
  const toggleListening = useCallback(() => {
    if (transcribing) return;
    if (listening) {
      // Stop whichever path is active
      if (recorderRef.current) {
        stopMediaRecorder();
      } else {
        recognizerRef.current?.stop();
        const captured = interim.trim();
        setListening(false);
        if (captured) submit(captured);
      }
      return;
    }
    stopSpeaking();
    setVoiceError(null);

    const targetLang = uiLang === "ar" ? ttsLangFor("ar", settings.accent) : "en-US";

    // Prefer Web Speech API (Chrome/Edge) — instant interim transcription
    if (isSpeechRecognitionSupported()) {
      const rec = createRecognizer({
        lang: targetLang,
        onUpdate: ({ interim: i, final }) => {
          if (final) {
            setInterim("");
            submit(final);
          } else {
            setInterim(i);
          }
        },
        onEnd: () => { recognizerRef.current = null; setListening(false); },
        onError: (msg) => {
          recognizerRef.current = null;
          setListening(false);
          if (msg === "not-allowed" || msg === "service-not-allowed") {
            setVoiceError(uiLang === "ar" ? "تم حظر الميكروفون. فعّله ثم حاول مرة أخرى." : "Microphone blocked — allow it and try again.");
          } else if (msg === "no-speech") {
            setVoiceError(uiLang === "ar" ? "لم أسمع أي صوت." : "No speech detected — try again.");
          } else if (msg !== "aborted") {
            // Fall back to MediaRecorder on transient error
            void startMediaRecorder();
          }
        },
      });
      recognizerRef.current = rec;
      try {
        rec.start();
        setListening(true);
        return;
      } catch {
        // Fall through to MediaRecorder
      }
    }

    // Fallback for Safari / iPad / Firefox
    const hasGUM = typeof navigator !== "undefined"
      && typeof navigator.mediaDevices === "object"
      && navigator.mediaDevices !== null
      && typeof navigator.mediaDevices.getUserMedia === "function";
    if (typeof MediaRecorder !== "undefined" && hasGUM) {
      void startMediaRecorder();
    } else {
      setVoiceError(uiLang === "ar" ? "الميكروفون غير مدعوم في هذا المتصفح." : "Voice input isn't supported in this browser.");
    }
  }, [listening, transcribing, interim, uiLang, settings.accent, submit, startMediaRecorder, stopMediaRecorder]);

  // ─── Drag handlers (unchanged) ───────────────────────────────────
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number; startY: number;
    baseX: number;  baseY: number;
    moved: boolean;
  } | null>(null);

  function clamp(x: number, y: number) {
    const w = window.innerWidth, h = window.innerHeight;
    return { x: Math.max(8, Math.min(w - 64, x)), y: Math.max(8, Math.min(h - 64, y)) };
  }
  function persistPosition(p: { x: number; y: number }) {
    setPosition(p);
    try { window.localStorage.setItem(STORAGE_POS, JSON.stringify(p)); } catch {/* ignore */}
  }

  useEffect(() => {
    function ensureOnScreen() {
      const cur = position ?? defaultPos;
      const c = clamp(cur.x, cur.y);
      if (c.x !== cur.x || c.y !== cur.y) persistPosition(c);
    }
    // Clamp on mount + on resize + on iPad orientation change. This guarantees
    // the bubble can always be found, even after the window shrinks or the
    // device rotates between sessions.
    ensureOnScreen();
    window.addEventListener("resize", ensureOnScreen);
    window.addEventListener("orientationchange", ensureOnScreen);
    return () => {
      window.removeEventListener("resize", ensureOnScreen);
      window.removeEventListener("orientationchange", ensureOnScreen);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const base = position ?? defaultPos;
    dragStateRef.current = {
      pointerId: e.pointerId, startX: e.clientX, startY: e.clientY,
      baseX: base.x, baseY: base.y, moved: false,
    };
    draggingRef.current = false;
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const ds = dragStateRef.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    const dx = e.clientX - ds.startX, dy = e.clientY - ds.startY;
    if (!ds.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
    ds.moved = true;
    draggingRef.current = true;
    setPosition(clamp(ds.baseX + dx, ds.baseY + dy));
  }
  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const ds = dragStateRef.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    dragStateRef.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    if (!ds.moved) { draggingRef.current = false; return; }
    const cur = position ?? defaultPos;
    const w = window.innerWidth;
    const snapLeft = cur.x + 28 < w / 2;
    persistPosition(clamp(snapLeft ? 16 : w - 72, cur.y));
    setTimeout(() => { draggingRef.current = false; }, 80);
  }
  function handlePointerCancel(e: React.PointerEvent<HTMLDivElement>) {
    const ds = dragStateRef.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    dragStateRef.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    draggingRef.current = false;
  }

  const panelOnLeft = startPos.x > (typeof window !== "undefined" ? window.innerWidth / 2 : 600);
  const ttsSupported = isSpeechSynthesisSupported();
  const sttSupported = isSpeechRecognitionSupported() ||
    (typeof MediaRecorder !== "undefined"
      && typeof navigator !== "undefined"
      && typeof navigator.mediaDevices === "object"
      && navigator.mediaDevices !== null
      && typeof navigator.mediaDevices.getUserMedia === "function");

  const subtitle = listening ? t.listening
    : transcribing ? t.transcribing
    : pending ? t.thinking
    : `${t.ready} · ${role.label}`;

  return (
    // NOTE: keep this outer fixed wrapper in LTR even in Arabic mode — the
    // absolute-positioned panel below uses explicit `right`/`left` pixel
    // offsets, and an RTL parent flips those in Tailwind v4 → panel ends up
    // off-screen and "disappears". The inner content gets dir="rtl" itself.
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-40" dir="ltr">
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none"
        style={{
          width: 56, height: 56, touchAction: "none",
          transform: `translate3d(${startPos.x}px, ${startPos.y}px, 0)`,
          transition: dragStateRef.current ? "none" : "transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          willChange: "transform",
        }}
      >
        {/* Bubble */}
        <button
          type="button"
          onClick={(e) => {
            if (draggingRef.current) { e.preventDefault(); e.stopPropagation(); return; }
            setOpen((o) => !o);
          }}
          aria-label={open ? t.close : settings.agentName}
          className={cn(
            "relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl",
            "border border-white/40 backdrop-blur-md select-none",
            "transition-transform hover:scale-105 active:scale-95",
          )}
          style={{
            background: `conic-gradient(from 220deg, ${accent}, #88B8B0, #C8A880, #B8B880, ${accent})`,
            pointerEvents: "auto",
          }}
        >
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={listening
              ? { scale: [1, 1.5, 1], opacity: [0.45, 0, 0.45] }
              : { scale: [1, 1.18, 1], opacity: [0.25, 0, 0.25] }}
            transition={{ duration: listening ? 1.1 : 2.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: `radial-gradient(circle, ${accent}88, transparent 70%)` }}
          />
          <span className="absolute inset-1 rounded-full backdrop-blur-sm pointer-events-none" style={{ background: "rgba(255,255,255,0.18)" }} />
          <span className="relative z-10 text-white drop-shadow pointer-events-none">
            {listening ? <Mic className="w-5 h-5" /> : transcribing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          </span>
        </button>

        {/* Expanded panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className={cn(
                "absolute bg-background border border-border/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden",
              )}
              style={{
                width: 380, height: 580,
                maxHeight: "min(580px, calc(100vh - 32px))",
                top: startPos.y > 200 ? "auto" : 0,
                bottom: startPos.y > 200 ? 0 : "auto",
                // Use explicit physical-axis offsets so RTL never flips the panel off-screen.
                ...(panelOnLeft ? { right: "4rem" } : { left: "4rem" }),
              }}
              dir={uiLang === "ar" ? "rtl" : "ltr"}
              role="dialog" aria-modal="false" aria-label={settings.agentName}
            >
              {/* Header */}
              <div className="px-3 py-2.5 flex items-center justify-between border-b border-border/30"
                   style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}08)` }}>
                <div className="flex items-center gap-2 min-w-0">
                  {showSettings ? (
                    <button
                      type="button"
                      onClick={() => setShowSettings(false)}
                      className="p-1 rounded-lg hover:bg-muted/40 text-muted-foreground"
                      aria-label={t.back}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                         style={{ background: `linear-gradient(135deg, ${accent}, #88B8B0)` }}>
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-black truncate">
                      {showSettings ? t.settings : settings.agentName}
                    </div>
                    {!showSettings && (
                      <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
                        {subtitle}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!showSettings && (
                    <button
                      type="button"
                      onClick={() => setShowSettings(true)}
                      className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground"
                      aria-label={t.settings} title={t.settings}
                    >
                      <SettingsIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground"
                    aria-label={t.close}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {showSettings ? (
                <SettingsPanel
                  settings={settings}
                  onChange={setSettings}
                  uiLang={uiLang}
                  accent={accent}
                />
              ) : (
                <>
                  {/* Transcript */}
                  <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
                    {messages.map((m) => (
                      <ChatBubble key={m.id} m={m} accent={accent} onAction={runAction} dir={uiLang === "ar" ? "rtl" : "ltr"} />
                    ))}
                    {interim && (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl px-3 py-2 text-xs italic text-muted-foreground border border-dashed"
                             style={{ borderColor: `${accent}66`, background: `${accent}08` }}>
                          {interim}…
                        </div>
                      </div>
                    )}
                    {voiceError && (
                      <div className="flex justify-center">
                        <div className="max-w-[90%] rounded-xl px-3 py-2 text-[11px] text-[#C0A0B8] border border-[#C0A0B8]/40 bg-[#C0A0B8]/10 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          <span className="flex-1">{voiceError}</span>
                          <button type="button" onClick={() => setVoiceError(null)} className="text-[10px] underline hover:no-underline flex-shrink-0">×</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input row */}
                  <div className="px-3 pt-1.5 pb-2 border-t border-border/30">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={toggleListening}
                        disabled={!sttSupported || transcribing}
                        title={!sttSupported ? t.micUnsupported : listening ? t.stopListening : t.startListening}
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                          (!sttSupported || transcribing) && "opacity-60",
                        )}
                        style={listening ? { background: accent, color: "white", boxShadow: `0 4px 12px ${accent}55` } : undefined}
                        aria-label={listening ? t.stopListening : t.startListening}
                        aria-pressed={listening}
                      >
                        {transcribing ? <Loader2 className="w-4 h-4 animate-spin" />
                          : listening ? <Mic className="w-4 h-4 animate-pulse" />
                          : <MicOff className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!ttsSupported) return;
                          if (ttsOn) stopSpeaking();
                          setTtsOn((v) => !v);
                        }}
                        disabled={!ttsSupported}
                        title={!ttsSupported ? t.muteVoice : ttsOn ? t.muteVoice : t.enableVoice}
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                          !ttsSupported && "opacity-40 cursor-not-allowed",
                        )}
                        style={ttsOn ? { background: accent, color: "white" } : { background: "rgb(var(--muted) / 0.4)" }}
                        aria-label={ttsOn ? t.muteVoice : t.enableVoice}
                        aria-pressed={ttsOn}
                      >
                        {ttsOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopSpeaking();
                          recognizerRef.current?.stop();
                          setListening(false);
                          setUiLang(l => l === "en" ? "ar" : "en");
                        }}
                        title={uiLang === "ar" ? "English" : "العربية"}
                        className="h-9 px-2.5 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-bold tracking-wide bg-muted/40 hover:bg-muted/60"
                      >
                        {uiLang === "ar" ? "EN" : "ع"}
                      </button>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(input); } }}
                        placeholder={t.askAnything}
                        dir={uiLang === "ar" ? "rtl" : "ltr"}
                        className="flex-1 px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-xs outline-none focus:border-[var(--ai-accent)]"
                        style={{ ["--ai-accent" as any]: accent }}
                        aria-label="Message"
                      />
                      <button
                        type="button"
                        onClick={() => submit(input)}
                        disabled={!input.trim() || pending}
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                        style={{ background: `linear-gradient(135deg, ${accent}, #88B8B0)` }}
                        aria-label={t.sender}
                      >
                        {pending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Chat bubble ────────────────────────────────────────────────────
function ChatBubble({
  m, accent, onAction, dir,
}: {
  m: ChatMessage;
  accent: string;
  onAction: (a: AssistantAction) => void;
  dir: "ltr" | "rtl";
}) {
  const isUser = m.role === "user";
  const Icon = (kind: AssistantAction["kind"]) =>
    kind === "start_call"     ? Phone
    : kind === "draft_email"  ? Mail
    : kind === "draft_whatsapp" ? MessageSquare
    : ArrowRight;

  return (
    <div className={cn("flex flex-col gap-1.5", isUser ? "items-end" : "items-start")} dir={dir}>
      <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
        {!isUser && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-1.5"
               style={{ background: `linear-gradient(135deg, ${accent}, #88B8B0)` }}>
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        )}
        <div className={cn(
          "max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap",
          isUser ? "rounded-br-sm text-white" : "rounded-bl-sm bg-muted/40 text-foreground",
        )} style={isUser ? { background: `linear-gradient(135deg, ${accent}, #88B8B0)` } : undefined}>
          {m.text}
        </div>
      </div>
      {!isUser && m.actions && m.actions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 ml-7">
          {m.actions.map((a, idx) => {
            const ActionIcon = Icon(a.kind);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onAction(a)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors hover:shadow-sm"
                style={{ borderColor: `${accent}55`, color: accent, background: `${accent}10` }}
              >
                <ActionIcon className="w-3 h-3" />
                {a.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Settings panel ─────────────────────────────────────────────────
function SettingsPanel({
  settings, onChange, uiLang, accent,
}: {
  settings: AssistantSettings;
  onChange: (s: AssistantSettings) => void;
  uiLang: "en" | "ar";
  accent: string;
}) {
  const t = L[uiLang];
  const update = <K extends keyof AssistantSettings>(k: K, v: AssistantSettings[K]) =>
    onChange({ ...settings, [k]: v });

  const toneOptions: Array<{ v: Tone; en: string; ar: string }> = [
    { v: "conversational", en: "Conversational", ar: "ودود" },
    { v: "concise",        en: "Concise",        ar: "مختصر" },
    { v: "coach",          en: "Coach",          ar: "مدرّب" },
    { v: "enthusiastic",   en: "Enthusiastic",   ar: "حماسي" },
    { v: "formal",         en: "Formal",         ar: "رسمي" },
  ];
  const focusOptions: Array<{ v: Focus; en: string; ar: string }> = [
    { v: "general",   en: "General",   ar: "عام" },
    { v: "sales",     en: "Sales",     ar: "مبيعات" },
    { v: "marketing", en: "Marketing", ar: "تسويق" },
    { v: "research",  en: "Research",  ar: "بحث" },
  ];
  const providerOptions: Array<{ v: AiProvider; label: string }> = [
    { v: "auto",       label: t.auto },
    { v: "openai",     label: "OpenAI" },
    { v: "anthropic",  label: "Claude" },
    { v: "gemini",     label: "Gemini" },
    { v: "perplexity", label: "Perplexity" },
  ];
  const langOptions: Array<{ v: Language; en: string; ar: string }> = [
    { v: "auto", en: "Auto",    ar: "تلقائي" },
    { v: "en",   en: "English", ar: "إنجليزي" },
    { v: "ar",   en: "Arabic",  ar: "عربي" },
  ];
  const accentOptions: Array<{ v: Accent; en: string; ar: string }> = [
    { v: "default",  en: "Default", ar: "افتراضي" },
    { v: "saudi",    en: "Saudi",   ar: "سعودي" },
    { v: "uae",      en: "UAE",     ar: "إماراتي" },
    { v: "egyptian", en: "Egyptian", ar: "مصري" },
  ];
  const voiceOptions: Array<{ v: VoiceName; label: string }> = [
    { v: "layla",  label: "Layla" },
    { v: "noor",   label: "Noor" },
    { v: "sara",   label: "Sara" },
    { v: "faisal", label: "Faisal" },
    { v: "adam",   label: "Adam" },
  ];

  function l(opt: { en: string; ar: string }) { return uiLang === "ar" ? opt.ar : opt.en; }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
      {/* Agent name */}
      <Field label={t.agentName}>
        <input
          type="text"
          value={settings.agentName}
          onChange={(e) => update("agentName", e.target.value.slice(0, 40))}
          placeholder="NexFlow AI"
          dir={uiLang === "ar" ? "rtl" : "ltr"}
          className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-xs outline-none focus:border-[var(--ai-accent)]"
          style={{ ["--ai-accent" as any]: accent }}
        />
      </Field>

      {/* AI provider */}
      <Field label={t.aiProvider}>
        <ChipRow
          options={providerOptions.map(o => ({ value: o.v, label: o.label }))}
          value={settings.provider}
          onChange={(v) => update("provider", v as AiProvider)}
          accent={accent}
        />
      </Field>

      {/* Tone */}
      <Field label={t.tone}>
        <ChipRow
          options={toneOptions.map(o => ({ value: o.v, label: l(o) }))}
          value={settings.tone}
          onChange={(v) => update("tone", v as Tone)}
          accent={accent}
        />
      </Field>

      {/* Focus */}
      <Field label={t.focus}>
        <ChipRow
          options={focusOptions.map(o => ({ value: o.v, label: l(o) }))}
          value={settings.focus}
          onChange={(v) => update("focus", v as Focus)}
          accent={accent}
        />
      </Field>

      {/* Language */}
      <Field label={t.language}>
        <ChipRow
          options={langOptions.map(o => ({ value: o.v, label: l(o) }))}
          value={settings.language}
          onChange={(v) => update("language", v as Language)}
          accent={accent}
        />
      </Field>

      {/* Arabic accent */}
      <Field label={t.arabicAccent}>
        <ChipRow
          options={accentOptions.map(o => ({ value: o.v, label: l(o) }))}
          value={settings.accent}
          onChange={(v) => update("accent", v as Accent)}
          accent={accent}
        />
      </Field>

      {/* Voice */}
      <Field label={t.voice}>
        <ChipRow
          options={voiceOptions.map(o => ({ value: o.v, label: o.label }))}
          value={settings.voice}
          onChange={(v) => update("voice", v as VoiceName)}
          accent={accent}
        />
      </Field>

      {/* Accent colour */}
      <Field label={t.accentColor}>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => update("color", c.value)}
              title={c.name}
              aria-label={c.name}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                settings.color === c.value ? "ring-2 ring-offset-2 ring-foreground/40" : "border-white",
              )}
              style={{ background: c.value }}
            />
          ))}
        </div>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function ChipRow({
  options, value, onChange, accent,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
  accent: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors",
              active ? "text-white" : "text-muted-foreground hover:text-foreground border-border/40",
            )}
            style={active ? { background: accent, borderColor: accent } : undefined}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
