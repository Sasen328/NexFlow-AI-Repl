/**
 * Floating AI Assistant bubble — visible on every screen.
 *
 *   • Chameleon-gradient bubble in the bottom-right (color reflects user accent)
 *   • Slide-up glass panel with chat
 *   • 8 Action GPT shortcuts (Find contact / Draft email / Pipeline summary /
 *     Today's tasks / Schedule call / Start a call / At-risk deals / Hot signals)
 *   • Mic button — Web Speech API on supported browsers, MediaRecorder + Whisper
 *     transcription fallback on Safari/iOS/Android web
 *   • Bilingual EN / AR with accent picker (Saudi / UAE / Egyptian / Default)
 *   • Settings sheet: agent name, AI provider, mode, tone, focus, language,
 *     accent, accent color — persisted to AsyncStorage
 *   • Mode pills: Chat / Research / Analyze (drives backend system prompt)
 *   • Renders structured action buttons returned by the backend (open route,
 *     start call, draft email/whatsapp, run research)
 *   • TTS playback of assistant replies via expo-speech, voice picked from the
 *     accent setting
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useRouter } from "expo-router";

import { useColors } from "@/hooks/useColors";
import { ChameleonGradient } from "@/components/ui/ChameleonGradient";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  useAssistantSend,
  useAssistantTranscribe,
  type AssistantHistoryItem,
  type AssistantProvider,
  type AssistantMode,
  type AssistantTone,
  type AssistantFocus,
  type AssistantLanguage,
  type AssistantAccent,
  type AssistantAction,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Settings model + persistence
// ---------------------------------------------------------------------------
type AccentColor = "violet" | "teal" | "amber" | "rose" | "emerald" | "indigo";

const ACCENT_SWATCHES: Record<AccentColor, string> = {
  violet: "#7A5C9E",
  teal: "#2FA8A0",
  amber: "#D9913F",
  rose: "#C25151",
  emerald: "#3F9E6E",
  indigo: "#4A5BB8",
};

type Settings = {
  agentName: string;
  provider: AssistantProvider;
  language: AssistantLanguage;
  accent: AssistantAccent;
  accentColor: AccentColor;
  tone: AssistantTone;
  focus: AssistantFocus;
  voiceId: "layla" | "faisal" | "noor" | "adam" | "sara";
};

const DEFAULT_SETTINGS: Settings = {
  agentName: "NexFlow AI",
  provider: "auto",
  language: "auto",
  accent: "default",
  accentColor: "violet",
  tone: "conversational",
  focus: "general",
  voiceId: "layla",
};

const SETTINGS_KEY = "nexflow.assistant.settings.v1";

async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function saveSettings(s: Settings) {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Action GPT shortcuts
// ---------------------------------------------------------------------------
type ActionGpt = {
  id: string;
  label: string;
  labelAr: string;
  icon: keyof typeof Feather.glyphMap;
  prompt: string;
  promptAr: string;
};

const ACTION_GPTS: ActionGpt[] = [
  {
    id: "find-contact",
    label: "Find contact",
    labelAr: "ابحث عن جهة",
    icon: "search",
    prompt: "Find me my top 3 contacts at companies in the banking sector.",
    promptAr: "ابحث عن أفضل 3 جهات اتصال لدي في شركات قطاع البنوك.",
  },
  {
    id: "draft-email",
    label: "Draft email",
    labelAr: "اكتب إيميل",
    icon: "mail",
    prompt: "Draft a follow-up email for my last open opportunity.",
    promptAr: "اكتب إيميل متابعة لآخر فرصة مفتوحة لدي.",
  },
  {
    id: "pipeline-summary",
    label: "Pipeline summary",
    labelAr: "ملخص خط المبيعات",
    icon: "git-branch",
    prompt: "Give me a 5-bullet summary of my open pipeline by stage.",
    promptAr: "أعطني ملخصاً من 5 نقاط لخط المبيعات المفتوح حسب المرحلة.",
  },
  {
    id: "todays-tasks",
    label: "Today's tasks",
    labelAr: "مهام اليوم",
    icon: "check-square",
    prompt: "What's on my plate today and what should I prioritise?",
    promptAr: "ما هي مهامي اليوم وما الذي يجب أن أركز عليه؟",
  },
  {
    id: "schedule-call",
    label: "Schedule call",
    labelAr: "جدولة مكالمة",
    icon: "calendar",
    prompt: "Suggest the best 2 time slots this week to call my top hot lead.",
    promptAr: "اقترح أفضل وقتين هذا الأسبوع للاتصال بأفضل عميل ساخن لدي.",
  },
  {
    id: "start-call",
    label: "Start a call",
    labelAr: "ابدأ مكالمة",
    icon: "phone-call",
    prompt: "Set up an AI call with my top hot lead — give me the talk track.",
    promptAr: "جهّز مكالمة AI مع أفضل عميل ساخن — أعطني نقاط الحديث.",
  },
  {
    id: "at-risk",
    label: "At-risk deals",
    labelAr: "صفقات في خطر",
    icon: "alert-triangle",
    prompt: "Which deals are stalled or at risk and what can I do today?",
    promptAr: "ما الصفقات المتعثرة أو في خطر وما الذي يمكنني فعله اليوم؟",
  },
  {
    id: "hot-signals",
    label: "Hot signals",
    labelAr: "إشارات ساخنة",
    icon: "zap",
    prompt: "What buying signals fired in the last 24h that I should act on?",
    promptAr: "ما إشارات الشراء التي ظهرت آخر 24 ساعة ويجب أن أتحرك بناءً عليها؟",
  },
];

const GREETING: Record<"en" | "ar", (name: string) => string> = {
  en: (n) =>
    `Hi — I'm ${n}, your NexFlow copilot. Tap a shortcut, type, or hold the mic to talk. I can chat, run research with live web data, or analyse your pipeline. Tweak my voice, language and tone in Settings (gear icon).`,
  ar: (n) =>
    `مرحباً — أنا ${n}، مساعدك الذكي في نكس فلو. اختر اختصاراً، اكتب، أو اضغط الميكروفون للحديث. أقدر أتحدث معك، أو أبحث في الإنترنت، أو أحلل خط مبيعاتك. عدّل صوتي ولغتي ونبرتي من الإعدادات (الترس).`,
};

// ---------------------------------------------------------------------------
// Web Speech API recognizer (Chrome/Edge desktop). Returns null elsewhere.
// ---------------------------------------------------------------------------
function getWebRecognizer(lang: "en" | "ar"): any | null {
  if (Platform.OS !== "web") return null;
  if (typeof window === "undefined") return null;
  const w: any = window;
  const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.continuous = false;
  rec.interimResults = false;
  rec.lang = lang === "ar" ? "ar-SA" : "en-US";
  return rec;
}

// ---------------------------------------------------------------------------
// MediaRecorder fallback (Safari / iOS / Firefox web). Returns a handle the
// caller stores in a ref so it can be stopped/cleaned up cleanly on unmount.
// ---------------------------------------------------------------------------
type RecorderHandle = {
  stream: MediaStream;
  rec: any;
  mime: string;
  chunks: BlobPart[];
  abort: () => void;
  finish: () => Promise<{ base64: string; mime: string }>;
};

async function startMediaRecorderHandle(): Promise<RecorderHandle | null> {
  if (Platform.OS !== "web") return null;
  if (typeof navigator === "undefined") return null;
  const md: any = (navigator as any).mediaDevices;
  if (!md?.getUserMedia || typeof (window as any).MediaRecorder === "undefined") return null;

  const stream: MediaStream = await md.getUserMedia({ audio: true });
  const MR: any = (window as any).MediaRecorder;
  const mime = MR.isTypeSupported?.("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : MR.isTypeSupported?.("audio/mp4")
      ? "audio/mp4"
      : "audio/webm";
  const rec = new MR(stream, { mimeType: mime });
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e: any) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const stopTracks = () => {
    try {
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      /* ignore */
    }
  };

  const handle: RecorderHandle = {
    stream,
    rec,
    mime,
    chunks,
    abort: () => {
      try {
        if (rec.state !== "inactive") rec.stop();
      } catch {
        /* ignore */
      }
      stopTracks();
    },
    finish: () =>
      new Promise<{ base64: string; mime: string }>((resolve, reject) => {
        rec.onstop = async () => {
          stopTracks();
          try {
            const blob = new Blob(chunks, { type: mime });
            // FileReader handles arbitrarily large blobs without overflowing
            // the call stack the way String.fromCharCode(...bytes) would.
            const dataUrl: string = await new Promise((res, rej) => {
              const reader = new FileReader();
              reader.onload = () => res(reader.result as string);
              reader.onerror = () => rej(reader.error ?? new Error("read_error"));
              reader.readAsDataURL(blob);
            });
            const comma = dataUrl.indexOf(",");
            const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
            resolve({ base64, mime });
          } catch (err) {
            reject(err);
          }
        };
        try {
          if (rec.state !== "inactive") rec.stop();
        } catch (err) {
          stopTracks();
          reject(err);
        }
      }),
  };

  rec.start();
  return handle;
}

// ---------------------------------------------------------------------------
// Floating bubble entry point
// ---------------------------------------------------------------------------
export function AssistantBubble() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const accentHex = ACCENT_SWATCHES[settings.accentColor];

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={10}
        style={[styles.bubble, { shadowColor: "#000" }]}
      >
        <ChameleonGradient
          radius={32}
          style={{
            width: 60,
            height: 60,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: accentHex,
          }}
        >
          <Feather name="message-circle" size={26} color="#FFFFFF" />
        </ChameleonGradient>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent>
        <AssistantPanel
          onClose={() => setOpen(false)}
          settings={settings}
          onSettingsChange={(s) => {
            setSettings(s);
            saveSettings(s);
          }}
        />
      </Modal>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------
export function AssistantPanel({
  onClose,
  settings: settingsProp,
  onSettingsChange,
}: {
  onClose?: () => void;
  settings?: Settings;
  onSettingsChange?: (s: Settings) => void;
}) {
  const colors = useColors();
  const router = useRouter();

  // Inline usage (Agents tab) loads its own settings.
  const [internalSettings, setInternalSettings] = useState<Settings>(
    settingsProp ?? DEFAULT_SETTINGS,
  );
  useEffect(() => {
    if (!settingsProp) loadSettings().then(setInternalSettings);
  }, [settingsProp]);
  const settings = settingsProp ?? internalSettings;
  const updateSettings = (next: Settings) => {
    if (onSettingsChange) onSettingsChange(next);
    else {
      setInternalSettings(next);
      saveSettings(next);
    }
  };

  const accentHex = ACCENT_SWATCHES[settings.accentColor];

  // Effective UI language (auto follows current draft / default to EN).
  const [draft, setDraft] = useState("");
  const draftIsArabic = useMemo(() => /[\u0600-\u06FF]/.test(draft), [draft]);
  const uiLang: "en" | "ar" =
    settings.language === "ar"
      ? "ar"
      : settings.language === "en"
        ? "en"
        : draftIsArabic
          ? "ar"
          : "en";

  const [history, setHistory] = useState<
    Array<AssistantHistoryItem & { actions?: AssistantAction[] }>
  >([{ role: "assistant", text: GREETING.en(settings.agentName) }]);
  const [mode, setMode] = useState<AssistantMode>("chat");
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const send = useAssistantSend();
  const transcribe = useAssistantTranscribe();
  const scrollRef = useRef<ScrollView>(null);
  const recognizerRef = useRef<any>(null);
  const recorderRef = useRef<RecorderHandle | null>(null);

  // Re-greet when language or agent name changes (only if chat hasn't started).
  useEffect(() => {
    setHistory((h) => {
      if (h.length === 1 && h[0].role === "assistant") {
        return [{ role: "assistant", text: GREETING[uiLang](settings.agentName) }];
      }
      return h;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiLang, settings.agentName]);

  useEffect(() => {
    return () => {
      Speech.stop().catch(() => {});
      // Critical: release the microphone if user closes the panel mid-recording.
      try {
        recorderRef.current?.abort();
      } catch {
        /* ignore */
      }
      recorderRef.current = null;
      try {
        recognizerRef.current?.stop?.();
      } catch {
        /* ignore */
      }
      recognizerRef.current = null;
    };
  }, []);

  const speak = (text: string) => {
    Speech.stop().catch(() => {});
    setSpeaking(true);
    const looksArabic = /[\u0600-\u06FF]/.test(text);
    const lang = looksArabic ? "ar-SA" : "en-US";
    Speech.speak(text, {
      language: lang,
      rate: 1.0,
      pitch: 1.0,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const stopSpeaking = () => {
    Speech.stop().catch(() => {});
    setSpeaking(false);
  };

  // ── Voice input ───────────────────────────────────────────────────────
  const startListening = async () => {
    // Try Web Speech API first (instant, no upload).
    const rec = getWebRecognizer(uiLang);
    if (rec) {
      setListening(true);
      rec.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript ?? "";
        setListening(false);
        if (transcript) submit(transcript);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      try {
        rec.start();
        recognizerRef.current = rec;
        return;
      } catch {
        setListening(false);
      }
    }

    // Fallback — record on web with MediaRecorder, send to Whisper.
    if (Platform.OS === "web") {
      try {
        const handle = await startMediaRecorderHandle();
        if (!handle) {
          throw new Error("MediaRecorder not supported in this browser");
        }
        recorderRef.current = handle;
        setListening(true);
        return;
      } catch (err: any) {
        setListening(false);
        const msg =
          uiLang === "ar"
            ? `تعذّر الوصول إلى الميكروفون: ${err?.message ?? ""}`
            : `Couldn't access microphone: ${err?.message ?? "permission denied"}`;
        setHistory((h) => [...h, { role: "assistant", text: msg }]);
        return;
      }
    }

    // True native — graceful guidance.
    const msg =
      uiLang === "ar"
        ? "الإدخال الصوتي يعمل حالياً على المتصفح. اكتب رسالتك أو استخدم اختصاراً."
        : "Voice input is currently supported in the web preview. Type or pick a shortcut for now.";
    setHistory((h) => [...h, { role: "assistant", text: msg }]);
  };

  const stopListening = async () => {
    // Web Speech API path.
    if (recognizerRef.current) {
      try {
        recognizerRef.current?.stop?.();
      } catch {
        /* ignore */
      }
      recognizerRef.current = null;
      setListening(false);
      return;
    }

    // MediaRecorder path → Whisper.
    if (recorderRef.current) {
      const handle = recorderRef.current;
      recorderRef.current = null;
      setListening(false);
      setTranscribing(true);
      try {
        const audio = await handle.finish();
        const r = await transcribe.mutateAsync({
          audio_base64: audio.base64,
          mime: audio.mime,
          language: settings.language === "auto" ? undefined : settings.language,
        });
        setTranscribing(false);
        const text = (r.text ?? "").trim();
        if (text) submit(text);
      } catch (err: any) {
        setTranscribing(false);
        const msg =
          uiLang === "ar"
            ? `تعذر تحويل الصوت: ${err?.message ?? ""}`
            : `Transcription failed: ${err?.message ?? ""}`;
        setHistory((h) => [...h, { role: "assistant", text: msg }]);
      }
      return;
    }

    setListening(false);
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const submit = async (overrideText?: string) => {
    const text = (overrideText ?? draft).trim();
    if (!text || send.isPending) return;
    const userTurn: AssistantHistoryItem = { role: "user", text };
    const newHistory = [...history, userTurn];
    setHistory(newHistory);
    setDraft("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const r = await send.mutateAsync({
        message: text,
        provider: settings.provider,
        mode,
        tone: settings.tone,
        focus: settings.focus,
        language: settings.language,
        accent: settings.accent,
        agent_name: settings.agentName,
        history: newHistory.map(({ role, text }) => ({ role, text })),
      });
      const reply = r.reply ?? "(no reply)";
      const actions = (r.actions ?? []) as AssistantAction[];
      setHistory((h) => [...h, { role: "assistant", text: reply, actions }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
      // Auto-speak short replies in chat mode; longer / analysis modes wait for tap.
      if (reply.length < 320 && mode === "chat") speak(reply);
    } catch (e: any) {
      setHistory((h) => [
        ...h,
        { role: "assistant", text: `⚠️ ${e?.message ?? "Failed"}` },
      ]);
    }
  };

  const runShortcut = (s: ActionGpt) => {
    submit(uiLang === "ar" ? s.promptAr : s.prompt);
  };

  const runAction = (a: AssistantAction) => {
    if (a.kind === "open" && a.path) {
      router.push(a.path as any);
      onClose?.();
      return;
    }
    if (a.kind === "start_call") {
      router.push("/calls" as any);
      onClose?.();
      return;
    }
    if (a.kind === "draft_email" || a.kind === "draft_whatsapp") {
      router.push("/comms" as any);
      onClose?.();
      return;
    }
    if (a.kind === "run_research") {
      setMode("research");
      submit(typeof a.payload?.query === "string" ? a.payload.query : a.label);
    }
  };

  const t = (en: string, ar: string) => (uiLang === "ar" ? ar : en);
  const inline = !onClose;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[
        inline ? styles.inlineWrap : styles.modalWrap,
        { backgroundColor: inline ? "transparent" : "rgba(20,16,32,0.45)" },
      ]}
    >
      <View
        style={[
          inline ? styles.inlinePanel : styles.modalPanel,
          { backgroundColor: colors.background },
        ]}
      >
        {/* Header */}
        <ChameleonGradient
          radius={inline ? 0 : 24}
          style={[
            styles.header,
            { backgroundColor: accentHex },
            inline && { borderTopLeftRadius: 0, borderTopRightRadius: 0 },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.22)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="zap" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>{settings.agentName}</Text>
              <Text style={styles.headerSub}>
                {t(
                  `${capitalise(mode)} · ${capitalise(settings.tone)} · ${capitalise(settings.focus)}`,
                  `${arMode(mode)} · ${arTone(settings.tone)} · ${arFocus(settings.focus)}`,
                )}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                updateSettings({
                  ...settings,
                  language:
                    settings.language === "ar"
                      ? "en"
                      : settings.language === "en"
                        ? "auto"
                        : "ar",
                })
              }
              style={styles.langPill}
            >
              <Feather name="globe" size={12} color="#FFFFFF" />
              <Text style={styles.langText}>
                {settings.language === "auto"
                  ? "AUTO"
                  : settings.language.toUpperCase()}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowSettings(true)}
              hitSlop={10}
              style={{ padding: 4 }}
            >
              <Feather name="settings" size={18} color="#FFFFFF" />
            </Pressable>

            {onClose && (
              <Pressable
                onPress={() => {
                  stopSpeaking();
                  stopListening();
                  onClose();
                }}
                hitSlop={10}
                style={{ padding: 4 }}
              >
                <Feather name="x" size={20} color="#FFFFFF" />
              </Pressable>
            )}
          </View>

          {/* Mode pills */}
          <View style={styles.modeRow}>
            {(["chat", "research", "analysis"] as const).map((m) => {
              const active = mode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={[
                    styles.modePill,
                    {
                      backgroundColor: active
                        ? "rgba(255,255,255,0.95)"
                        : "rgba(255,255,255,0.18)",
                    },
                  ]}
                >
                  <Feather
                    name={
                      m === "chat" ? "message-square" : m === "research" ? "search" : "bar-chart-2"
                    }
                    size={11}
                    color={active ? accentHex : "#FFFFFF"}
                  />
                  <Text
                    style={[
                      styles.modeText,
                      { color: active ? accentHex : "#FFFFFF" },
                    ]}
                  >
                    {t(
                      m === "chat" ? "Chat" : m === "research" ? "Research" : "Analyze",
                      m === "chat" ? "محادثة" : m === "research" ? "بحث" : "تحليل",
                    )}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ChameleonGradient>

        {/* Action GPT chips */}
        <View
          style={[
            styles.actionsWrap,
            { borderBottomColor: colors.border, backgroundColor: colors.muted },
          ]}
        >
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 10,
              color: colors.mutedForeground,
              letterSpacing: 0.6,
              marginBottom: 8,
              textAlign: uiLang === "ar" ? "right" : "left",
            }}
          >
            {t("ACTION GPTs", "اختصارات الذكاء")}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {ACTION_GPTS.map((s) => (
              <Pressable key={s.id} onPress={() => runShortcut(s)}>
                <View
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: colors.card,
                      borderColor: hexToRgba(accentHex, 0.45),
                    },
                  ]}
                >
                  <Feather name={s.icon} size={12} color={accentHex} />
                  <Text style={[styles.actionLabel, { color: colors.foreground }]}>
                    {uiLang === "ar" ? s.labelAr : s.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Chat history */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 14, gap: 10 }}
        >
          {history.map((h, i) => {
            const isUser = h.role === "user";
            return (
              <View
                key={i}
                style={{
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  maxWidth: "88%",
                }}
              >
                {isUser ? (
                  <ChameleonGradient
                    radius={14}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      backgroundColor: accentHex,
                    }}
                  >
                    <Text style={styles.bubbleTextLight}>{h.text}</Text>
                  </ChameleonGradient>
                ) : (
                  <GlassCard padded={false} style={{ padding: 12 }}>
                    <Text style={[styles.bubbleText, { color: colors.foreground }]}>
                      {h.text}
                    </Text>

                    {(h.actions ?? []).length > 0 && (
                      <View style={styles.actionsRow}>
                        {(h.actions ?? []).map((a, ai) => (
                          <Pressable
                            key={ai}
                            onPress={() => runAction(a)}
                            style={[
                              styles.replyAction,
                              { backgroundColor: hexToRgba(accentHex, 0.12), borderColor: accentHex },
                            ]}
                          >
                            <Feather
                              name={iconForAction(a.kind)}
                              size={11}
                              color={accentHex}
                            />
                            <Text style={[styles.replyActionText, { color: accentHex }]}>
                              {a.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}

                    <Pressable
                      onPress={() => (speaking ? stopSpeaking() : speak(h.text))}
                      style={{ marginTop: 8, alignSelf: "flex-start" }}
                      hitSlop={6}
                    >
                      <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
                        <Feather
                          name={speaking ? "volume-x" : "volume-2"}
                          size={12}
                          color={accentHex}
                        />
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 11,
                            color: accentHex,
                          }}
                        >
                          {speaking ? t("Stop", "إيقاف") : t("Play", "استمع")}
                        </Text>
                      </View>
                    </Pressable>
                  </GlassCard>
                )}
              </View>
            );
          })}
          {(send.isPending || transcribing) && (
            <View
              style={{
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 4,
              }}
            >
              <ActivityIndicator color={accentHex} />
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                {transcribing
                  ? t("Transcribing…", "جارٍ تحويل الصوت…")
                  : t("Thinking…", "جارٍ التفكير…")}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Composer */}
        <View
          style={[
            styles.composer,
            { borderTopColor: colors.border, backgroundColor: colors.background },
          ]}
        >
          <Pressable
            onPress={listening ? stopListening : startListening}
            style={[
              styles.micBtn,
              { backgroundColor: listening ? "#C25151" : colors.muted },
            ]}
            hitSlop={6}
          >
            <Feather
              name={listening ? "square" : "mic"}
              size={16}
              color={listening ? "#FFFFFF" : accentHex}
            />
          </Pressable>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t("Ask anything…", "اسألني أي شيء…")}
            placeholderTextColor={colors.mutedForeground}
            onSubmitEditing={() => submit()}
            returnKeyType="send"
            multiline
            style={[
              styles.input,
              {
                color: colors.foreground,
                backgroundColor: colors.muted,
                textAlign: uiLang === "ar" ? "right" : "left",
              },
            ]}
          />
          <Pressable
            onPress={() => submit()}
            disabled={!draft.trim() || send.isPending}
            style={{ opacity: !draft.trim() || send.isPending ? 0.5 : 1 }}
          >
            <ChameleonGradient
              radius={20}
              style={{
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: accentHex,
              }}
            >
              <Feather name="arrow-up" size={18} color="#FFFFFF" />
            </ChameleonGradient>
          </Pressable>
        </View>
      </View>

      {/* Settings sheet */}
      <Modal visible={showSettings} animationType="slide" transparent>
        <SettingsSheet
          settings={settings}
          onChange={(s) => updateSettings(s)}
          onClose={() => setShowSettings(false)}
          accentHex={accentHex}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Settings sheet
// ---------------------------------------------------------------------------
function SettingsSheet({
  settings,
  onChange,
  onClose,
  accentHex,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
  accentHex: string;
}) {
  const colors = useColors();
  const isAr = settings.language === "ar";
  const t = (en: string, ar: string) => (isAr ? ar : en);

  const Row = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <View style={{ gap: 8, marginBottom: 18 }}>
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 11,
          letterSpacing: 0.6,
          color: colors.mutedForeground,
          textAlign: isAr ? "right" : "left",
        }}
      >
        {label.toUpperCase()}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {children}
      </View>
    </View>
  );

  const Pill = ({
    active,
    label,
    onPress,
  }: {
    active: boolean;
    label: string;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.optPill,
        {
          backgroundColor: active ? accentHex : colors.muted,
          borderColor: active ? accentHex : colors.border,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 12,
          color: active ? "#FFFFFF" : colors.foreground,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.modalWrap, { backgroundColor: "rgba(20,16,32,0.55)" }]}>
      <View
        style={[
          styles.modalPanel,
          { backgroundColor: colors.background, height: "88%" },
        ]}
      >
        <ChameleonGradient
          radius={24}
          style={[styles.header, { backgroundColor: accentHex }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Feather name="sliders" size={18} color="#FFFFFF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                {t("Assistant Settings", "إعدادات المساعد")}
              </Text>
              <Text style={styles.headerSub}>
                {t(
                  "Persona, voice, language and behaviour",
                  "الشخصية، الصوت، اللغة والسلوك",
                )}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={{ padding: 4 }}>
              <Feather name="x" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </ChameleonGradient>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {/* Agent name */}
          <Row label={t("Agent name", "اسم المساعد")}>
            <TextInput
              value={settings.agentName}
              onChangeText={(v) => onChange({ ...settings, agentName: v })}
              placeholder="NexFlow AI"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.nameInput,
                {
                  backgroundColor: colors.muted,
                  color: colors.foreground,
                  borderColor: colors.border,
                  textAlign: isAr ? "right" : "left",
                },
              ]}
            />
          </Row>

          {/* AI Provider */}
          <Row label={t("AI provider", "مزود الذكاء")}>
            {([
              ["auto", t("Auto", "تلقائي")],
              ["openai", "OpenAI"],
              ["anthropic", "Claude"],
              ["gemini", "Gemini"],
              ["perplexity", "Perplexity"],
            ] as Array<[AssistantProvider, string]>).map(([k, label]) => (
              <Pill
                key={k}
                active={settings.provider === k}
                label={label}
                onPress={() => onChange({ ...settings, provider: k })}
              />
            ))}
          </Row>

          {/* Tone */}
          <Row label={t("Tone", "النبرة")}>
            {([
              ["conversational", t("Conversational", "محادثة")],
              ["concise", t("Concise", "مختصرة")],
              ["coach", t("Coach", "مدرب")],
              ["enthusiastic", t("Enthusiastic", "متحمسة")],
              ["formal", t("Formal", "رسمية")],
            ] as Array<[AssistantTone, string]>).map(([k, label]) => (
              <Pill
                key={k}
                active={settings.tone === k}
                label={label}
                onPress={() => onChange({ ...settings, tone: k })}
              />
            ))}
          </Row>

          {/* Focus */}
          <Row label={t("Focus", "التركيز")}>
            {([
              ["general", t("General", "عام")],
              ["sales", t("Sales", "مبيعات")],
              ["marketing", t("Marketing", "تسويق")],
              ["research", t("Research", "بحث")],
            ] as Array<[AssistantFocus, string]>).map(([k, label]) => (
              <Pill
                key={k}
                active={settings.focus === k}
                label={label}
                onPress={() => onChange({ ...settings, focus: k })}
              />
            ))}
          </Row>

          {/* Language */}
          <Row label={t("Language", "اللغة")}>
            {([
              ["auto", t("Auto", "تلقائي")],
              ["en", "English"],
              ["ar", "العربية"],
            ] as Array<[AssistantLanguage, string]>).map(([k, label]) => (
              <Pill
                key={k}
                active={settings.language === k}
                label={label}
                onPress={() => onChange({ ...settings, language: k })}
              />
            ))}
          </Row>

          {/* Accent (Arabic dialect) */}
          <Row label={t("Arabic accent", "اللهجة العربية")}>
            {([
              ["default", t("Default", "افتراضي")],
              ["saudi", t("Saudi", "سعودي")],
              ["uae", t("UAE", "إماراتي")],
              ["egyptian", t("Egyptian", "مصري")],
            ] as Array<[AssistantAccent, string]>).map(([k, label]) => (
              <Pill
                key={k}
                active={settings.accent === k}
                label={label}
                onPress={() => onChange({ ...settings, accent: k })}
              />
            ))}
          </Row>

          {/* Voice */}
          <Row label={t("Voice", "الصوت")}>
            {([
              ["layla", "Layla — AR ♀"],
              ["faisal", "Faisal — AR ♂"],
              ["noor", "Noor — AR/EN"],
              ["adam", "Adam — EN ♂"],
              ["sara", "Sara — EN ♀"],
            ] as Array<[Settings["voiceId"], string]>).map(([k, label]) => (
              <Pill
                key={k}
                active={settings.voiceId === k}
                label={label}
                onPress={() => onChange({ ...settings, voiceId: k })}
              />
            ))}
          </Row>

          {/* Accent color */}
          <Row label={t("Accent colour", "لون التمييز")}>
            {(Object.entries(ACCENT_SWATCHES) as Array<[AccentColor, string]>).map(
              ([k, hex]) => (
                <Pressable
                  key={k}
                  onPress={() => onChange({ ...settings, accentColor: k })}
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: hex,
                      borderColor:
                        settings.accentColor === k ? colors.foreground : "transparent",
                    },
                  ]}
                />
              ),
            )}
          </Row>

          <Pressable
            onPress={() => onChange(DEFAULT_SETTINGS)}
            style={[
              styles.resetBtn,
              { borderColor: colors.border, backgroundColor: colors.muted },
            ]}
          >
            <Feather name="rotate-ccw" size={13} color={colors.foreground} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
                color: colors.foreground,
              }}
            >
              {t("Reset to defaults", "استعادة الافتراضي")}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function arMode(m: AssistantMode): string {
  return m === "chat" ? "محادثة" : m === "research" ? "بحث" : m === "analysis" ? "تحليل" : "أوامر";
}
function arTone(t: AssistantTone): string {
  return t === "conversational"
    ? "ودية"
    : t === "concise"
      ? "مختصرة"
      : t === "coach"
        ? "تدريبية"
        : t === "enthusiastic"
          ? "متحمسة"
          : "رسمية";
}
function arFocus(f: AssistantFocus): string {
  return f === "sales" ? "مبيعات" : f === "marketing" ? "تسويق" : f === "research" ? "بحث" : "عام";
}

function iconForAction(kind: AssistantAction["kind"]): keyof typeof Feather.glyphMap {
  switch (kind) {
    case "open":
      return "external-link";
    case "start_call":
      return "phone-call";
    case "draft_email":
      return "mail";
    case "draft_whatsapp":
      return "message-circle";
    case "run_research":
      return "search";
    default:
      return "arrow-right";
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    right: 16,
    bottom: 96,
    width: 60,
    height: 60,
    borderRadius: 32,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    zIndex: 99,
  },

  modalWrap: { flex: 1, justifyContent: "flex-end" },
  modalPanel: {
    height: "92%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },

  inlineWrap: { flex: 1 },
  inlinePanel: { flex: 1 },

  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 8,
  },
  langText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  modeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  modePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  modeText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 0.4,
  },

  actionsWrap: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12 },

  bubbleText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  bubbleTextLight: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    lineHeight: 19,
    color: "#FFFFFF",
  },

  actionsRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  replyAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  replyActionText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 0.3,
  },

  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },

  optPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
  },
  nameInput: {
    flex: 1,
    minWidth: 200,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
});
