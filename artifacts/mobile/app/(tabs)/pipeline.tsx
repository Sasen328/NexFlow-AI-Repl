import React, { useMemo, useState } from "react";
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/data/mockData";
import { dealHealth, stageLabel, useAdvanceDeal, useDeals, type ApiDeal } from "@/lib/api";

const STAGES = ["lead", "qualified", "proposal", "negotiation", "closed_won"] as const;
const STAGE_NEXT: Record<string, string | null> = {
  lead: "qualified",
  qualified: "proposal",
  proposal: "negotiation",
  negotiation: "closed_won",
  closed_won: null,
  closed_lost: null,
};

export default function PipelineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeStage, setActiveStage] = useState<string>("proposal");

  const { data, isPending, isError, refetch, isRefetching } = useDeals();
  const deals = data?.deals ?? [];
  const advance = useAdvanceDeal();
  const [sheetDeal, setSheetDeal] = useState<ApiDeal | null>(null);

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
              <Pressable
                key={d.id}
                onPress={() => setSheetDeal(d)}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <Card style={{ gap: 12 }}>
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
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <DealActionSheet
        deal={sheetDeal}
        onClose={() => {
          setSheetDeal(null);
          advance.reset();
        }}
        submitting={advance.isPending}
        error={advance.error ? (advance.error as Error).message : null}
        onAdvance={async (toStage) => {
          if (!sheetDeal) return;
          try {
            await advance.mutateAsync({ deal_id: sheetDeal.id, to_stage: toStage });
            setSheetDeal(null);
            refetch();
          } catch {
            // surfaced via advance.error
          }
        }}
      />
    </View>
  );
}

function DealActionSheet({
  deal,
  onClose,
  submitting,
  error,
  onAdvance,
}: {
  deal: ApiDeal | null;
  onClose: () => void;
  submitting: boolean;
  error: string | null;
  onAdvance: (toStage?: string) => void;
}) {
  const colors = useColors();
  const visible = deal !== null;
  const next = deal ? STAGE_NEXT[deal.stage] : null;
  const isTerminal = deal ? (deal.stage === "closed_won" || deal.stage === "closed_lost") : false;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: 32,
            gap: 14,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
          </View>

          {deal ? (
            <>
              <View>
                <Text style={[sheetStyles.kicker, { color: "#88B8B0" }]}>{stageLabel(deal.stage).toUpperCase()}</Text>
                <Text style={[sheetStyles.title, { color: colors.foreground }]} numberOfLines={2}>
                  {deal.title}
                </Text>
                <View style={{ flexDirection: "row", gap: 16, marginTop: 6 }}>
                  <Text style={{ color: "#88B8B0", fontFamily: "Inter_700Bold", fontSize: 18 }}>
                    {formatCurrency(deal.value)}
                  </Text>
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13, alignSelf: "center" }}>
                    {deal.probability}% probability
                  </Text>
                </View>
                {deal.contact_name ? (
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 }}>
                    {deal.contact_name}{deal.company_name ? ` · ${deal.company_name}` : ""}
                  </Text>
                ) : null}
              </View>

              {isTerminal ? (
                <View style={{ alignItems: "center", paddingVertical: 12 }}>
                  <Feather name="check-circle" size={28} color={colors.mutedForeground} />
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 8 }}>
                    This deal is in a terminal stage.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {next ? (
                    <Pressable
                      disabled={submitting}
                      onPress={() => onAdvance(next)}
                      style={{
                        paddingVertical: 14,
                        borderRadius: 14,
                        backgroundColor: "#88B8B0",
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 8,
                        opacity: submitting ? 0.7 : 1,
                      }}
                    >
                      {submitting ? <ActivityIndicator color="#fff" size="small" /> : (
                        <Feather name="arrow-right-circle" size={16} color="#fff" />
                      )}
                      <Text style={{ color: "#fff", fontFamily: "Inter_700Bold" }}>
                        {submitting ? "Advancing…" : `Advance to ${stageLabel(next)}`}
                      </Text>
                    </Pressable>
                  ) : null}

                  <Pressable
                    disabled={submitting}
                    onPress={() => onAdvance("closed_lost")}
                    style={{
                      paddingVertical: 12,
                      borderRadius: 14,
                      backgroundColor: colors.muted,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: "center",
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: 8,
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    <Feather name="x-circle" size={14} color="#D88A8A" />
                    <Text style={{ color: "#D88A8A", fontFamily: "Inter_600SemiBold" }}>Mark Closed Lost</Text>
                  </Pressable>
                </View>
              )}

              {error ? (
                <Text style={{ color: "#D88A8A", fontFamily: "Inter_500Medium", fontSize: 12 }}>{error}</Text>
              ) : null}

              <Pressable
                onPress={onClose}
                style={{
                  paddingVertical: 12,
                  borderRadius: 14,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>Cancel</Text>
              </Pressable>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  kicker: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1 },
  title: { fontFamily: "Inter_700Bold", fontSize: 20, marginTop: 2 },
});

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
