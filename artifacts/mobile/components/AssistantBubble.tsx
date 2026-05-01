/**
 * Floating AI Assistant bubble — visible on every screen.
 *
 *   • Tap the bubble to open a slide-up chat
 *   • 5-provider toggle: Auto · Claude · GPT-4o · Gemini · Perplexity
 *   • Posts to /api/assistant/chat with conversation history
 */
import React, { useRef, useState } from "react";
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

import { useColors } from "@/hooks/useColors";
import {
  useAssistantSend,
  type AssistantHistoryItem,
  type AssistantProvider,
} from "@/lib/api";

const PROVIDERS: { id: AssistantProvider; label: string; icon: any }[] = [
  { id: "auto", label: "Auto", icon: "shuffle" },
  { id: "anthropic", label: "Claude", icon: "feather" },
  { id: "openai", label: "GPT-4o", icon: "cpu" },
  { id: "gemini", label: "Gemini", icon: "star" },
  { id: "perplexity", label: "Perplexity", icon: "search" },
];

export function AssistantBubble() {
  const colors = useColors();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.bubble,
          {
            backgroundColor: colors.foreground,
            shadowColor: "#000",
          },
        ]}
        hitSlop={8}
      >
        <Feather name="message-circle" size={22} color={colors.background} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent>
        <AssistantPanel onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}

/* Reusable chat surface — also used by the dedicated /agents tab. */
export function AssistantPanel({ onClose }: { onClose?: () => void }) {
  const colors = useColors();
  const [provider, setProvider] = useState<AssistantProvider>("auto");
  const [history, setHistory] = useState<AssistantHistoryItem[]>([
    {
      role: "assistant",
      text: "Hi — I'm your NexFlow AI. Ask me about your pipeline, draft a follow-up, or run live web research. Switch the model below.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const send = useAssistantSend();
  const scrollRef = useRef<ScrollView>(null);

  const submit = async () => {
    const text = draft.trim();
    if (!text || send.isPending) return;
    const userTurn: AssistantHistoryItem = { role: "user", text };
    const newHistory = [...history, userTurn];
    setHistory(newHistory);
    setDraft("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    try {
      const r = await send.mutateAsync({
        message: text,
        provider,
        history: newHistory,
      });
      setHistory((h) => [...h, { role: "assistant", text: r.reply ?? "(no reply)" }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (e: any) {
      setHistory((h) => [...h, { role: "assistant", text: `⚠️ ${e?.message ?? "Failed"}` }]);
    }
  };

  const inline = !onClose;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, justifyContent: "flex-end" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {!inline && <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />}

      <View
        style={[
          styles.panel,
          inline && { height: "100%", borderTopLeftRadius: 0, borderTopRightRadius: 0, borderWidth: 0 },
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        {/* Header */}
        {!inline && (
        <View style={[styles.panelHeader, { borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.kicker, { color: colors.mutedForeground }]}>AI ASSISTANT</Text>
            <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 18 }}>
              Ask me anything
            </Text>
          </View>
          {onClose && (
            <Pressable onPress={onClose} hitSlop={10}>
              <Feather name="x" size={22} color={colors.foreground} />
            </Pressable>
          )}
        </View>
        )}

        {/* Provider toggle */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, maxHeight: 52 }}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 6,
            alignItems: "center",
          }}
        >
          {PROVIDERS.map((p) => {
            const active = provider === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setProvider(p.id)}
                style={[
                  styles.providerChip,
                  {
                    backgroundColor: active ? colors.foreground : "transparent",
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather
                  name={p.icon}
                  size={12}
                  color={active ? colors.background : colors.foreground}
                />
                <Text
                  style={{
                    color: active ? colors.background : colors.foreground,
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Conversation */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: 20 }}
        >
          {history.map((m, i) => (
            <View
              key={i}
              style={[
                styles.bubbleRow,
                m.role === "user"
                  ? { alignSelf: "flex-end", backgroundColor: colors.foreground }
                  : { alignSelf: "flex-start", backgroundColor: colors.muted },
              ]}
            >
              <Text
                style={{
                  color: m.role === "user" ? colors.background : colors.foreground,
                  fontSize: 14,
                  lineHeight: 20,
                }}
              >
                {m.text}
              </Text>
            </View>
          ))}
          {send.isPending && (
            <View style={[styles.bubbleRow, { alignSelf: "flex-start", backgroundColor: colors.muted }]}>
              <ActivityIndicator size="small" color={colors.foreground} />
            </View>
          )}
        </ScrollView>

        {/* Composer */}
        <View style={[styles.composer, { borderTopColor: colors.border }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask anything…"
            placeholderTextColor={colors.mutedForeground}
            multiline
            style={[
              styles.input,
              { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted },
            ]}
            onSubmitEditing={submit}
          />
          <Pressable
            onPress={submit}
            disabled={send.isPending || !draft.trim()}
            style={[
              styles.sendBtn,
              {
                backgroundColor: colors.foreground,
                opacity: send.isPending || !draft.trim() ? 0.5 : 1,
              },
            ]}
          >
            <Feather name="send" size={16} color={colors.background} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    right: 18,
    bottom: Platform.OS === "ios" ? 110 : 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 999,
  },
  panel: {
    height: "82%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  kicker: { fontSize: 10, letterSpacing: 1, fontWeight: "700", textTransform: "uppercase" },
  providerChip: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  bubbleRow: {
    maxWidth: "85%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  composer: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
