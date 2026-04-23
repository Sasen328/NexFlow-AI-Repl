import React, { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { AGENTS, LIVE_CALLS } from "@/data/mockData";

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AgentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const liveAgents = AGENTS.filter((a) => a.status === "live").length;
  const totalCalls = AGENTS.reduce((s, a) => s + a.callsToday, 0);
  const concurrentNow = AGENTS.reduce((s, a) => s + a.concurrent, 0);

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
    >
      <View>
        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>AI WORKFORCE</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Voice Agents</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Card style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>LIVE NOW</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={[styles.livePulse, { backgroundColor: "#7FB069" }]} />
            <Text style={[styles.bigValue, { color: colors.foreground }]}>{liveAgents}</Text>
          </View>
        </Card>
        <Card style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>CALLS TODAY</Text>
          <Text style={[styles.bigValue, { color: "#B8A0C8" }]}>{totalCalls}</Text>
        </Card>
        <Card style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>CONCURRENT</Text>
          <Text style={[styles.bigValue, { color: "#88B8B0" }]}>{concurrentNow}</Text>
        </Card>
      </View>

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.livePulse, { backgroundColor: "#E07474" }]} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Live Calls · {LIVE_CALLS.length}</Text>
        </View>
      </View>

      {LIVE_CALLS.map((c) => {
        const liveDur = c.durationSec + tick;
        const sentColor = c.sentiment === "positive" ? "#7FB069" : c.sentiment === "neutral" ? "#C8A880" : "#E07474";
        return (
          <Card key={c.id} style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={[styles.livePulse, { backgroundColor: "#E07474" }]} />
              <Text style={[styles.callContact, { color: colors.foreground }]}>{c.contact}</Text>
              <Text style={[styles.callCompany, { color: colors.mutedForeground }]}>· {c.company}</Text>
              <View style={{ flex: 1 }} />
              <Text style={[styles.callDur, { color: colors.foreground }]}>{formatDuration(liveDur)}</Text>
            </View>

            <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
              <Badge label={`Agent: ${c.agent}`} tone="violet" small />
              <Badge label={c.phase.toUpperCase()} tone="teal" small />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sentColor }} />
                <Text style={{ fontFamily: "Inter_500Medium", fontSize: 11, color: sentColor }}>{c.sentiment}</Text>
              </View>
            </View>

            <View style={[styles.transcript, { backgroundColor: colors.muted }]}>
              <Feather name="mic" size={12} color={colors.mutedForeground} />
              <Text style={[styles.transcriptText, { color: colors.foreground }]} numberOfLines={2}>
                {c.lastUtterance}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable style={[styles.callBtn, { backgroundColor: colors.muted }]}>
                <Feather name="headphones" size={14} color={colors.foreground} />
                <Text style={[styles.callBtnText, { color: colors.foreground }]}>Listen</Text>
              </Pressable>
              <Pressable style={[styles.callBtn, { backgroundColor: "#88B8B0" }]}>
                <Feather name="phone-forwarded" size={14} color="#fff" />
                <Text style={[styles.callBtnText, { color: "#fff" }]}>Take over</Text>
              </Pressable>
            </View>
          </Card>
        );
      })}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Feather name="cpu" size={16} color={colors.mutedForeground} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Agents</Text>
        </View>
      </View>

      {AGENTS.map((a) => {
        const statusColor =
          a.status === "live" ? "#7FB069" : a.status === "idle" ? "#C8A880" : "#B8A0C8";
        return (
          <Card key={a.id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Avatar initials={a.avatar} size={48} />
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={[styles.agentName, { color: colors.foreground }]}>{a.name}</Text>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
                <Text style={{ fontFamily: "Inter_500Medium", fontSize: 11, color: statusColor }}>
                  {a.status.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.agentSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                {a.voice} · {a.model}
              </Text>
              <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Feather name="phone" size={10} color={colors.mutedForeground} />
                  <Text style={[styles.agentMeta, { color: colors.mutedForeground }]}>{a.callsToday} today</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Feather name="check-circle" size={10} color={colors.mutedForeground} />
                  <Text style={[styles.agentMeta, { color: colors.mutedForeground }]}>{a.qualRate}% qual</Text>
                </View>
              </View>
            </View>
            <Pressable style={[styles.iconBtn, { backgroundColor: colors.muted }]}>
              <Feather name="settings" size={14} color={colors.foreground} />
            </Pressable>
          </Card>
        );
      })}
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
  callContact: { fontFamily: "Inter_700Bold", fontSize: 14 },
  callCompany: { fontFamily: "Inter_400Regular", fontSize: 12 },
  callDur: { fontFamily: "Inter_700Bold", fontSize: 14 },
  transcript: { flexDirection: "row", gap: 8, padding: 10, borderRadius: 12, alignItems: "flex-start" },
  transcriptText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 12, fontStyle: "italic", lineHeight: 17 },
  callBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12 },
  callBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  agentName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  agentSub: { fontFamily: "Inter_400Regular", fontSize: 12 },
  agentMeta: { fontFamily: "Inter_500Medium", fontSize: 11 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
