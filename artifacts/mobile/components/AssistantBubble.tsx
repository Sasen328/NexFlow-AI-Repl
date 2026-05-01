/**
 * Floating AI Assistant bubble — visible on every screen.
 *
 * Mirrors the web `AIAssistantBubble.tsx`:
 *   • Chameleon-gradient bubble in the bottom-right
 *   • Slide-up glass panel with chat
 *   • 8 Action GPT shortcuts (Find contact / Draft email / Pipeline summary /
 *     Today's tasks / Schedule call / Start a call / At-risk deals / Hot signals)
 *   • Mic button for voice input (web: Web Speech API; native: graceful fallback)
 *   • Arabic / English language toggle
 *   • TTS playback of assistant replies via expo-speech (Arabic ar-SA voice
 *     when toggle = AR)
 */
import React, { useEffect, useRef, useState } from "react";
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
import { Feather } from "@expo/vector-icons";
import * as Speech from "expo-speech";

import { useColors } from "@/hooks/useColors";
import { ChameleonGradient } from "@/components/ui/ChameleonGradient";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAssistantSend, type AssistantHistoryItem } from "@/lib/api";

type Lang = "en" | "ar";

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

const GREETING: Record<Lang, string> = {
  en: "Hi — I'm your NexFlow AI. Tap a shortcut, type, or hold the mic to speak. I can help with contacts, deals, calls and more.",
  ar: "مرحباً — أنا مساعدك الذكي في نكس فلو. اختر اختصاراً، اكتب، أو اضغط الميكروفون للتحدث. أساعدك في جهات الاتصال والصفقات والمكالمات.",
};

// ---------------------------------------------------------------------------
// Web-Speech bridge (works in the Expo web build; safe no-op on native).
// ---------------------------------------------------------------------------
function getWebRecognizer(lang: Lang): any | null {
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
// Floating bubble
// ---------------------------------------------------------------------------
export function AssistantBubble() {
  const [open, setOpen] = useState(false);

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
          }}
        >
          <Feather name="message-circle" size={26} color="#FFFFFF" />
        </ChameleonGradient>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent>
        <AssistantPanel onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}

// ---------------------------------------------------------------------------
// Reusable panel (used by both bubble Modal and the dedicated Assistant tab)
// ---------------------------------------------------------------------------
export function AssistantPanel({ onClose }: { onClose?: () => void }) {
  const colors = useColors();
  const [lang, setLang] = useState<Lang>("en");
  const [history, setHistory] = useState<AssistantHistoryItem[]>([
    { role: "assistant", text: GREETING.en },
  ]);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const send = useAssistantSend();
  const scrollRef = useRef<ScrollView>(null);
  const recognizerRef = useRef<any>(null);

  // Swap greeting when the language toggles.
  useEffect(() => {
    setHistory((h) => {
      if (h.length === 1 && h[0].role === "assistant") {
        return [{ role: "assistant", text: GREETING[lang] }];
      }
      return h;
    });
  }, [lang]);

  // Stop any in-flight TTS when closing the panel.
  useEffect(() => {
    return () => {
      Speech.stop().catch(() => {});
    };
  }, []);

  const speak = (text: string) => {
    Speech.stop().catch(() => {});
    setSpeaking(true);
    Speech.speak(text, {
      language: lang === "ar" ? "ar-SA" : "en-US",
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

  const startListening = () => {
    const rec = getWebRecognizer(lang);
    if (!rec) {
      // Native (or unsupported web browser) — surface a guidance reply.
      const msg =
        lang === "ar"
          ? "الإدخال الصوتي يعمل حالياً على المتصفح فقط. اكتب رسالتك أو استخدم اختصاراً."
          : "Voice input is currently supported in the web preview. Type or pick a shortcut for now.";
      setHistory((h) => [...h, { role: "assistant", text: msg }]);
      return;
    }
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
    } catch {
      setListening(false);
    }
  };

  const stopListening = () => {
    try {
      recognizerRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    setListening(false);
  };

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
        provider: "auto",
        history: newHistory,
      });
      const reply = r.reply ?? "(no reply)";
      setHistory((h) => [...h, { role: "assistant", text: reply }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
      // Auto-speak short replies; longer ones the user can tap to play.
      if (reply.length < 320) speak(reply);
    } catch (e: any) {
      setHistory((h) => [
        ...h,
        { role: "assistant", text: `⚠️ ${e?.message ?? "Failed"}` },
      ]);
    }
  };

  const runShortcut = (s: ActionGpt) => {
    submit(lang === "ar" ? s.promptAr : s.prompt);
  };

  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);
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
        {/* Chameleon header */}
        <ChameleonGradient
          radius={inline ? 0 : 24}
          style={[
            styles.header,
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
              <Text style={styles.headerTitle}>NexFlow AI</Text>
              <Text style={styles.headerSub}>
                {t("Your always-on revenue copilot", "مساعدك الذكي للمبيعات")}
              </Text>
            </View>

            {/* Language toggle */}
            <Pressable
              onPress={() => setLang(lang === "en" ? "ar" : "en")}
              style={styles.langPill}
            >
              <Feather name="globe" size={12} color="#FFFFFF" />
              <Text style={styles.langText}>
                {lang === "en" ? "EN" : "AR"}
              </Text>
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
              textAlign: lang === "ar" ? "right" : "left",
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
                      borderColor: "rgba(184,160,200,0.45)",
                    },
                  ]}
                >
                  <Feather name={s.icon} size={12} color="#7A5C9E" />
                  <Text
                    style={[styles.actionLabel, { color: colors.foreground }]}
                  >
                    {lang === "ar" ? s.labelAr : s.label}
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
                  maxWidth: "85%",
                }}
              >
                {isUser ? (
                  <ChameleonGradient
                    radius={14}
                    style={{ paddingHorizontal: 14, paddingVertical: 10 }}
                  >
                    <Text style={styles.bubbleTextLight}>{h.text}</Text>
                  </ChameleonGradient>
                ) : (
                  <GlassCard padded={false} style={{ padding: 12 }}>
                    <Text
                      style={[styles.bubbleText, { color: colors.foreground }]}
                    >
                      {h.text}
                    </Text>
                    <Pressable
                      onPress={() => (speaking ? stopSpeaking() : speak(h.text))}
                      style={{ marginTop: 8, alignSelf: "flex-start" }}
                      hitSlop={6}
                    >
                      <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
                        <Feather
                          name={speaking ? "volume-x" : "volume-2"}
                          size={12}
                          color="#7A5C9E"
                        />
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 11,
                            color: "#7A5C9E",
                          }}
                        >
                          {speaking
                            ? t("Stop", "إيقاف")
                            : t("Play", "استمع")}
                        </Text>
                      </View>
                    </Pressable>
                  </GlassCard>
                )}
              </View>
            );
          })}
          {send.isPending && (
            <View
              style={{
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 4,
              }}
            >
              <ActivityIndicator color="#7A5C9E" />
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                {t("Thinking…", "جارٍ التفكير…")}
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
              {
                backgroundColor: listening ? "#C25151" : colors.muted,
              },
            ]}
            hitSlop={6}
          >
            <Feather
              name={listening ? "square" : "mic"}
              size={16}
              color={listening ? "#FFFFFF" : "#7A5C9E"}
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
                textAlign: lang === "ar" ? "right" : "left",
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
              }}
            >
              <Feather name="arrow-up" size={18} color="#FFFFFF" />
            </ChameleonGradient>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

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
});
