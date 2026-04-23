import React, { useMemo, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/data/mockData";
import { dealHealth, stageLabel, useDeals, type ApiDeal } from "@/lib/api";

const STAGES = ["lead", "qualified", "proposal", "negotiation", "closed_won"] as const;

export default function PipelineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeStage, setActiveStage] = useState<string>("proposal");

  const { data, isPending, isError, refetch, isRefetching } = useDeals();
  const deals = data?.deals ?? [];

  const grouped = useMemo(() => {
    const map: Record<string, ApiDeal[]> = {};
    STAGES.forEach((s) => (map[s] = []));
    deals.forEach((d) => {
      if (!map[d.stage]) map[d.stage] = [];
      map[d.stage].push(d);
    });
    return map;
  }, [deals]);

  const totalValue = deals.reduce((s, d) => s + (d.value || 0), 0);
  const weighted = deals.reduce((s, d) => s + ((d.value || 0) * (d.probability || 0)) / 100, 0);
  const stageDeals = grouped[activeStage] ?? [];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
      }}
    >
      <View style={{ paddingHorizontal: 16, gap: 16 }}>
        <View>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>PIPELINE</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Deals</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Card style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.kicker, { color: colors.mutedForeground }]}>TOTAL PIPELINE</Text>
            <Text style={[styles.bigValue, { color: colors.foreground }]}>{formatCurrency(totalValue)}</Text>
          </Card>
          <Card style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.kicker, { color: colors.mutedForeground }]}>WEIGHTED</Text>
            <Text style={[styles.bigValue, { color: "#88B8B0" }]}>{formatCurrency(weighted)}</Text>
          </Card>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {STAGES.map((s) => {
            const active = s === activeStage;
            const count = (grouped[s] || []).length;
            return (
              <Pressable
                key={s}
                onPress={() => setActiveStage(s)}
                style={({ pressed }) => [
                  styles.tab,
                  {
                    backgroundColor: active ? "#88B8B0" : colors.card,
                    borderColor: active ? "#88B8B0" : colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.tabText, { color: active ? "#fff" : colors.foreground }]}>{stageLabel(s)}</Text>
                <View
                  style={[
                    styles.tabCount,
                    { backgroundColor: active ? "rgba(255,255,255,0.25)" : colors.muted },
                  ]}
                >
                  <Text style={[styles.tabCountText, { color: active ? "#fff" : colors.mutedForeground }]}>
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={undefined}
      >
        {isPending ? (
          <View style={styles.empty}>
            <ActivityIndicator color={colors.mutedForeground} />
          </View>
        ) : isError ? (
          <View style={styles.empty}>
            <Feather name="wifi-off" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Couldn't load deals.</Text>
            <Pressable
              onPress={() => refetch()}
              style={{ marginTop: 8, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.card, borderRadius: 999, borderWidth: 1, borderColor: colors.border }}
            >
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
                {isRefetching ? "Retrying…" : "Retry"}
              </Text>
            </Pressable>
          </View>
        ) : stageDeals.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="inbox" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No deals in this stage</Text>
          </View>
        ) : (
          stageDeals.map((d) => {
            const health = dealHealth(d);
            const tone = health === "hot" ? "success" : health === "warm" ? "gold" : "danger";
            const closeLabel = d.expected_close_date
              ? new Date(d.expected_close_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "No date";
            return (
              <Card key={d.id} style={{ gap: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.dealName, { color: colors.foreground }]}>{d.title}</Text>
                    <Text style={[styles.dealCompany, { color: colors.mutedForeground }]}>
                      {d.contact_name || "—"}
                      {d.company_name ? ` · ${d.company_name}` : ""}
                    </Text>
                  </View>
                  <Text style={[styles.dealValue, { color: "#88B8B0" }]}>{formatCurrency(d.value)}</Text>
                </View>

                <View style={{ height: 6, backgroundColor: colors.muted, borderRadius: 3, overflow: "hidden" }}>
                  <View
                    style={{
                      height: "100%",
                      width: `${Math.max(0, Math.min(100, d.probability))}%`,
                      backgroundColor: "#B8A0C8",
                    }}
                  />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <Badge label={`${d.probability}%`} tone="violet" small />
                    <Badge label={health.toUpperCase()} tone={tone as any} small />
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Feather name="calendar" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.dealDate, { color: colors.mutedForeground }]}>{closeLabel}</Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.2 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, marginTop: 2 },
  bigValue: { fontFamily: "Inter_700Bold", fontSize: 22 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  tabCount: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999, minWidth: 20, alignItems: "center" },
  tabCountText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  dealName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  dealCompany: { fontFamily: "Inter_400Regular", fontSize: 12 },
  dealValue: { fontFamily: "Inter_700Bold", fontSize: 16 },
  dealDate: { fontFamily: "Inter_500Medium", fontSize: 11 },
});
