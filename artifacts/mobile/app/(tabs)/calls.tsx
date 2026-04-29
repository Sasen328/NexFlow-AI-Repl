import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useCalls, type ApiCall } from "@/lib/api";

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : (parts[0]?.[0] ?? "?").toUpperCase();
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const OUTCOME_COLORS: Record<string, string> = {
  connected: "#88B8B0",
  voicemail: "#C8A880",
  no_answer: "#B8B8B8",
  busy: "#C8A880",
  meeting_booked: "#B8A0C8",
  not_interested: "#C09090",
  follow_up: "#90B8B8",
};

const OUTCOME_ICONS: Record<string, string> = {
  connected: "phone-call",
  voicemail: "voicemail",
  no_answer: "phone-missed",
  busy: "phone-off",
  meeting_booked: "calendar",
  not_interested: "x-circle",
  follow_up: "clock",
};

type Tab = "all" | "meeting_booked" | "connected" | "voicemail" | "no_answer";

export default function CallsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [selected, setSelected] = useState<ApiCall | null>(null);

  const { data, isPending, isError, refetch, isRefetching } = useCalls();
  const allCalls: ApiCall[] = (data as any)?.calls ?? [];

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "meeting_booked", label: "Booked" },
    { key: "connected", label: "Connected" },
    { key: "voicemail", label: "Voicemail" },
    { key: "no_answer", label: "No Answer" },
  ];

  const filtered = activeTab === "all" ? allCalls : allCalls.filter((c) => c.outcome === activeTab);

  // KPIs
  const booked = allCalls.filter((c) => c.outcome === "meeting_booked").length;
  const connected = allCalls.filter((c) => c.outcome === "connected" || c.outcome === "meeting_booked").length;
  const connectRate = allCalls.length ? Math.round((connected / allCalls.length) * 100) : 0;
  const totalDuration = allCalls.reduce((s, c) => s + (c.duration_seconds ?? 0), 0);
  const avgDuration = allCalls.length ? Math.round(totalDuration / allCalls.length) : 0;

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }}
    >
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>COMMUNICATION</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Calls</Text>
      </View>

      {/* KPI Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingTop: 12, paddingBottom: 4 }}
      >
        {[
          { label: "Total Calls", value: allCalls.length.toString(), color: colors.foreground, icon: "phone" },
          { label: "Meetings Booked", value: booked.toString(), color: "#B8A0C8", icon: "calendar" },
          { label: "Connect Rate", value: `${connectRate}%`, color: "#88B8B0", icon: "trending-up" },
          { label: "Avg Duration", value: formatDuration(avgDuration), color: "#C8A880", icon: "clock" },
        ].map((k) => (
          <Card key={k.label} style={{ width: 130, gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Feather name={k.icon as any} size={11} color={colors.mutedForeground} />
              <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{k.label}</Text>
            </View>
            <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
          </Card>
        ))}
      </ScrollView>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
      >
        {tabs.map((t) => {
          const count = t.key === "all" ? allCalls.length : allCalls.filter((c) => c.outcome === t.key).length;
          const active = activeTab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setActiveTab(t.key)}
              style={[
                styles.tab,
                { backgroundColor: active ? "#1C1A24" : colors.card, borderColor: active ? "#1C1A24" : colors.border },
              ]}
            >
              <Text style={[styles.tabText, { color: active ? "#fff" : colors.mutedForeground }]}>
                {t.label} {count > 0 && `(${count})`}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* List */}
      {isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.mutedForeground} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={28} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground, marginTop: 8 }]}>Couldn't load calls.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c: any) => c.id}
          refreshing={isRefetching}
          onRefresh={refetch}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 10 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="phone" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, marginTop: 8 }]}>No calls here yet.</Text>
            </View>
          }
          renderItem={({ item: call }) => {
            const outcome = call.outcome ?? "no_answer";
            const outcomeColor = OUTCOME_COLORS[outcome] ?? "#B8B8B8";
            const iconName = (OUTCOME_ICONS[outcome] ?? "phone") as any;
            const insights = (call as any).ai_insights;
            return (
              <Pressable
                onPress={() => setSelected(selected?.id === call.id ? null : call)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Avatar initials={initials((call as any).contact_name)} size={44} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                        {(call as any).contact_name ?? "Unknown"}
                      </Text>
                      <View style={[styles.outcomeTag, { backgroundColor: `${outcomeColor}20` }]}>
                        <Feather name={iconName} size={9} color={outcomeColor} />
                        <Text style={[styles.outcomeText, { color: outcomeColor }]}>
                          {outcome.replace("_", " ")}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.sub, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {(call as any).contact_title ?? ""}{(call as any).company_name ? ` · ${(call as any).company_name}` : ""}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                        <Feather name="clock" size={9} color={colors.mutedForeground} />
                        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                          {formatDuration(call.duration_seconds)}
                        </Text>
                      </View>
                      <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                        {timeAgo((call as any).created_at ?? null)}
                      </Text>
                    </View>
                  </View>
                  <Feather
                    name={selected?.id === call.id ? "chevron-up" : "chevron-down"}
                    size={14}
                    color={colors.mutedForeground}
                  />
                </View>

                {/* Expanded: AI Insights */}
                {selected?.id === call.id && (
                  <View style={{ marginTop: 12, gap: 10 }}>
                    {(call as any).coaching_notes && (
                      <View style={{ padding: 10, borderRadius: 10, backgroundColor: `${colors.mutedForeground}12` }}>
                        <Text style={[styles.insightLabel, { color: colors.mutedForeground }]}>COACHING NOTES</Text>
                        <Text style={[styles.insightText, { color: colors.foreground }]}>
                          {(call as any).coaching_notes}
                        </Text>
                      </View>
                    )}
                    {insights && typeof insights === "object" && (
                      <>
                        {insights.summary && (
                          <View style={{ padding: 10, borderRadius: 10, backgroundColor: "#B8A0C820" }}>
                            <Text style={[styles.insightLabel, { color: "#B8A0C8" }]}>AI SUMMARY</Text>
                            <Text style={[styles.insightText, { color: colors.foreground }]}>{insights.summary}</Text>
                          </View>
                        )}
                        {insights.next_steps && (
                          <View style={{ padding: 10, borderRadius: 10, backgroundColor: "#88B8B020" }}>
                            <Text style={[styles.insightLabel, { color: "#88B8B0" }]}>NEXT STEPS</Text>
                            <Text style={[styles.insightText, { color: colors.foreground }]}>{insights.next_steps}</Text>
                          </View>
                        )}
                        {insights.sentiment && (
                          <View style={{ flexDirection: "row", gap: 8 }}>
                            <View style={{ flex: 1, padding: 8, borderRadius: 10, backgroundColor: `${colors.mutedForeground}10`, alignItems: "center" }}>
                              <Text style={[styles.insightLabel, { color: colors.mutedForeground }]}>SENTIMENT</Text>
                              <Text style={[styles.insightValue, { color: insights.sentiment === "positive" ? "#88B8B0" : insights.sentiment === "negative" ? "#C09090" : colors.foreground }]}>
                                {insights.sentiment}
                              </Text>
                            </View>
                            {insights.deal_probability && (
                              <View style={{ flex: 1, padding: 8, borderRadius: 10, backgroundColor: "#C8A88015", alignItems: "center" }}>
                                <Text style={[styles.insightLabel, { color: colors.mutedForeground }]}>WIN PROB</Text>
                                <Text style={[styles.insightValue, { color: "#C8A880" }]}>{insights.deal_probability}%</Text>
                              </View>
                            )}
                          </View>
                        )}
                      </>
                    )}
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.2, paddingHorizontal: 16 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, marginTop: 2, paddingHorizontal: 16 },
  kpiLabel: { fontFamily: "Inter_500Medium", fontSize: 10 },
  kpiValue: { fontFamily: "Inter_700Bold", fontSize: 20 },
  tab: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  card: { borderRadius: 18, borderWidth: 1, padding: 14 },
  name: { fontFamily: "Inter_700Bold", fontSize: 14 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 12 },
  meta: { fontFamily: "Inter_500Medium", fontSize: 11 },
  outcomeTag: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  outcomeText: { fontFamily: "Inter_600SemiBold", fontSize: 9, textTransform: "uppercase" },
  insightLabel: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1, marginBottom: 3 },
  insightText: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  insightValue: { fontFamily: "Inter_700Bold", fontSize: 16, marginTop: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  emptyText: { fontFamily: "Inter_500Medium", fontSize: 14 },
});
