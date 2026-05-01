/**
 * AI Assistant tab — full chat surface + background agents catalog.
 * Provider toggle: Auto · Claude · GPT-4o · Gemini · Perplexity.
 */
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { SubTabs } from "@/components/ui/SubTabs";
import { AssistantPanel } from "@/components/AssistantBubble";
import { useColors } from "@/hooks/useColors";
import { useAgents, useVoiceAgentCall, type ApiAgent } from "@/lib/api";

type SubKey = "chat" | "agents";

export default function AgentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [sub, setSub] = useState<SubKey>("chat");
  const [showTestCall, setShowTestCall] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>AI</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Assistant</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable
            onPress={() => setShowTestCall(true)}
            style={({ pressed }) => [{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: "#3F726B",
              opacity: pressed ? 0.8 : 1,
            }]}
          >
            <Feather name="phone-call" size={13} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>Test Call Me</Text>
          </Pressable>
          <PersonaSwitcher />
        </View>
      </View>
      <TestCallModal visible={showTestCall} onClose={() => setShowTestCall(false)} />

      <SubTabs<SubKey>
        value={sub}
        onChange={setSub}
        tabs={[
          { key: "chat", label: "Chat" },
          { key: "agents", label: "Background agents" },
        ]}
      />

      {sub === "chat" ? (
        <View style={{ flex: 1 }}>
          <AssistantPanel />
        </View>
      ) : (
        <BackgroundAgents />
      )}
    </View>
  );
}

function timeAgo(iso: string | null) {
  if (!iso) return "Never run";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  return `${d}d ago`;
}

function BackgroundAgents() {
  const colors = useColors();
  const { data, isPending, isError } = useAgents();
  const agents: ApiAgent[] = data?.agents ?? [];

  if (isPending) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.foreground} />
      </View>
    );
  }
  if (isError) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: colors.foreground }}>Could not load agents.</Text>
      </View>
    );
  }

  const enabledCount = agents.filter((a) => a.enabled).length;
  const totalRuns = agents.reduce((s, a) => s + (a.run_count || 0), 0);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={styles.statsStrip}>
        <Stat label="Agents" value={`${agents.length}`} colors={colors} />
        <Stat label="Enabled" value={`${enabledCount}`} colors={colors} />
        <Stat label="Runs" value={`${totalRuns}`} colors={colors} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Always-on agents</Text>
      <View style={{ paddingHorizontal: 16, gap: 8 }}>
        {agents.map((a) => (
          <Card key={a.id}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: a.enabled ? "#88B8B033" : colors.muted,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="zap" size={16} color={a.enabled ? "#3F726B" : colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontWeight: "700" }}>{a.name}</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 11 }} numberOfLines={2}>
                  {a.description ?? a.model}
                </Text>
              </View>
              <Badge tone={a.enabled ? "success" : "neutral"} small label={a.enabled ? "on" : "off"} />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 8,
                paddingTop: 8,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
              }}
            >
              <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                {a.run_count} run{a.run_count === 1 ? "" : "s"}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                {timeAgo(a.last_run_at)}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.statTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16 }}>{value}</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const VOICES = [
  { key: "Layla", label: "Layla (Arabic female)" },
  { key: "Faisal", label: "Faisal (Arabic male)" },
  { key: "Noor", label: "Noor (Bilingual female)" },
  { key: "Adam", label: "Adam (English male)" },
];

function TestCallModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const [phone, setPhone] = useState("");
  const [voice, setVoice] = useState("Layla");
  const call = useVoiceAgentCall();

  const submit = () => {
    if (!phone.trim()) {
      Alert.alert("Phone required", "Enter your phone number to receive the test call.");
      return;
    }
    call.mutate(
      { phone: phone.trim(), voice, test_mode: true },
      {
        onSuccess: () => {
          Alert.alert("Test call initiated", "You should receive a call shortly.");
          onClose();
        },
        onError: (e: any) => Alert.alert("Failed", e.message ?? "Could not initiate test call."),
      },
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", padding: 24 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 24, gap: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 17 }}>Test Call Me</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
            We'll call your number using the selected voice agent so you can hear how it sounds.
          </Text>

          <View>
            <Text style={{ color: colors.mutedForeground, fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Your phone number
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+966 5X XXX XXXX"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 10,
                padding: 12,
                color: colors.foreground,
                backgroundColor: colors.muted,
                fontSize: 15,
              }}
            />
          </View>

          <View>
            <Text style={{ color: colors.mutedForeground, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Voice
            </Text>
            <View style={{ gap: 8 }}>
              {VOICES.map((v) => (
                <Pressable
                  key={v.key}
                  onPress={() => setVoice(v.key)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    padding: 10,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: voice === v.key ? "#3F726B" : colors.border,
                    backgroundColor: voice === v.key ? "#3F726B11" : colors.muted,
                  }}
                >
                  <View style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: voice === v.key ? "#3F726B" : colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {voice === v.key && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#3F726B" }} />}
                  </View>
                  <Text style={{ color: colors.foreground, fontSize: 13 }}>{v.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            onPress={submit}
            disabled={call.isPending}
            style={({ pressed }) => [{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: "#3F726B",
              opacity: call.isPending || pressed ? 0.7 : 1,
              marginTop: 4,
            }]}
          >
            {call.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="phone-call" size={16} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Call me now</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 16 : 8,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  kicker: { fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "800" },
  sectionTitle: { fontSize: 14, fontWeight: "700", paddingHorizontal: 16, marginTop: 22, marginBottom: 10 },
  statsStrip: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 14 },
  statTile: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1 },
});
