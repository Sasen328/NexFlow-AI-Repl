/**
 * AI Assistant tab — full chat surface + background agents catalog.
 * Provider toggle: Auto · Claude · GPT-4o · Gemini · Perplexity.
 */
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
import { useAgents, type ApiAgent } from "@/lib/api";

type SubKey = "chat" | "agents";

export default function AgentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [sub, setSub] = useState<SubKey>("chat");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>AI</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Assistant</Text>
        </View>
        <PersonaSwitcher />
      </View>

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
