import React from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useAgents, type ApiAgent } from "@/lib/api";

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

export default function AgentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, refetch, isRefetching } = useAgents();
  const agents: ApiAgent[] = data?.agents ?? [];

  const enabledCount = agents.filter((a) => a.enabled).length;
  const totalRuns = agents.reduce((s, a) => s + (a.run_count || 0), 0);
  const scheduled = agents.filter((a) => a.trigger_type === "schedule").length;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
        paddingBottom: 120,
        paddingHorizontal: 16,
        gap: 16,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={undefined}
    >
      <View>
        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>AI WORKFORCE</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Agents</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Card style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>ENABLED</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={[styles.livePulse, { backgroundColor: "#7FB069" }]} />
            <Text style={[styles.bigValue, { color: colors.foreground }]}>{enabledCount}</Text>
          </View>
        </Card>
        <Card style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>TOTAL RUNS</Text>
          <Text style={[styles.bigValue, { color: "#B8A0C8" }]}>{totalRuns}</Text>
        </Card>
        <Card style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>SCHEDULED</Text>
          <Text style={[styles.bigValue, { color: "#88B8B0" }]}>{scheduled}</Text>
        </Card>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Feather name="cpu" size={16} color={colors.mutedForeground} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Agents · {agents.length}</Text>
        </View>
        <Pressable onPress={() => refetch()}>
          <Feather
            name="refresh-cw"
            size={14}
            color={colors.mutedForeground}
            style={{ opacity: isRefetching ? 0.4 : 1 }}
          />
        </Pressable>
      </View>

      {isPending ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <ActivityIndicator color={colors.mutedForeground} />
        </View>
      ) : isError ? (
        <Card style={{ alignItems: "center", gap: 8 }}>
          <Feather name="wifi-off" size={24} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>
            Couldn't load agents.
          </Text>
        </Card>
      ) : agents.length === 0 ? (
        <Card style={{ alignItems: "center", gap: 8 }}>
          <Feather name="cpu" size={24} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>
            No agents configured yet.
          </Text>
        </Card>
      ) : (
        agents.map((a) => {
          const enabled = a.enabled;
          const statusColor = enabled ? "#7FB069" : "#C8A880";
          const initials = (a.name || "?")
            .split(" ")
            .map((w) => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <Card key={a.id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Avatar initials={initials} size={48} />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <Text style={[styles.agentName, { color: colors.foreground }]} numberOfLines={1}>
                    {a.name}
                  </Text>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
                  <Text style={{ fontFamily: "Inter_500Medium", fontSize: 11, color: statusColor }}>
                    {enabled ? "ENABLED" : "PAUSED"}
                  </Text>
                </View>
                {a.description ? (
                  <Text style={[styles.agentSub, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {a.description}
                  </Text>
                ) : null}
                <View style={{ flexDirection: "row", gap: 8, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
                  <Badge label={a.trigger_type.toUpperCase()} tone="violet" small />
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Feather name="zap" size={10} color={colors.mutedForeground} />
                    <Text style={[styles.agentMeta, { color: colors.mutedForeground }]}>{a.run_count} runs</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Feather name="clock" size={10} color={colors.mutedForeground} />
                    <Text style={[styles.agentMeta, { color: colors.mutedForeground }]}>{timeAgo(a.last_run_at)}</Text>
                  </View>
                </View>
              </View>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.2 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, marginTop: 2 },
  bigValue: { fontFamily: "Inter_700Bold", fontSize: 22 },
  livePulse: { width: 8, height: 8, borderRadius: 4 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  agentName: { fontFamily: "Inter_700Bold", fontSize: 15, flexShrink: 1 },
  agentSub: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17 },
  agentMeta: { fontFamily: "Inter_500Medium", fontSize: 11 },
});
