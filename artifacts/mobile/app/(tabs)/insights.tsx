/**
 * Insights screen — mobile mirror of the web `/insights/dashboards` and
 * `/insights/reports` surfaces.
 *
 * Shows pipeline KPIs, marketing analytics, top contacts, and a daily AI
 * insight. Pull-to-refresh re-runs every query.
 */

import React from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import {
  apiFetch,
  useDashboardSummary,
  usePipelineByStage,
  useMarketingAnalytics,
  useTopContacts,
  stageLabel,
} from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type DailyInsights = {
  insights?: Array<{ title: string; body: string; tone?: string }>;
  generated_at?: string;
};

function fmtMoney(n: number | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M SAR`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k SAR`;
  return `${Math.round(n)} SAR`;
}

export default function InsightsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const summary = useDashboardSummary();
  const pipeline = usePipelineByStage();
  const marketing = useMarketingAnalytics();
  const topContacts = useTopContacts(5);
  const daily = useQuery<DailyInsights>({
    queryKey: ["insights-daily"],
    queryFn: () => apiFetch("/insights/daily"),
  });

  const refreshing =
    summary.isRefetching ||
    pipeline.isRefetching ||
    marketing.isRefetching ||
    topContacts.isRefetching ||
    daily.isRefetching;

  const onRefresh = () => {
    summary.refetch();
    pipeline.refetch();
    marketing.refetch();
    topContacts.refetch();
    daily.refetch();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.foreground} />
      }
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            Dashboards · reports · forecasts
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Insights</Text>
        </View>
        <PersonaSwitcher compact />
      </View>

      {/* ── KPI grid ────────────────────────────────────────────────── */}
      <View style={styles.kpiGrid}>
        <KpiTile colors={colors} icon="users" label="Contacts" value={summary.data?.total_contacts?.toLocaleString() ?? "—"} />
        <KpiTile colors={colors} icon="git-branch" label="Open deals" value={summary.data?.open_deals?.toString() ?? "—"} />
        <KpiTile colors={colors} icon="trending-up" label="Pipeline" value={fmtMoney(summary.data?.pipeline_value)} />
        <KpiTile colors={colors} icon="check-circle" label="Revenue MTD" value={fmtMoney(summary.data?.revenue_this_month)} />
        <KpiTile colors={colors} icon="send" label="Sent" value={(marketing.data?.totals?.sent ?? 0).toLocaleString()} />
        <KpiTile colors={colors} icon="mail" label="Open rate" value={`${Math.round((marketing.data?.totals?.open_rate ?? 0) * 100)}%`} />
      </View>

      {/* ── AI daily insight ────────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Daily AI insight</Text>
      <Card style={{ marginBottom: 18, padding: 14 }}>
        {daily.isPending ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.foreground} />
          </View>
        ) : !daily.data?.insights?.length ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No insight generated yet today.
          </Text>
        ) : (
          daily.data.insights.slice(0, 3).map((it, i) => (
            <View key={i} style={[styles.insightItem, i > 0 && { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }]}>
              <View style={[styles.insightDot, { backgroundColor: colors.foreground }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.insightTitle, { color: colors.foreground }]}>{it.title}</Text>
                <Text style={[styles.insightBody, { color: colors.mutedForeground }]}>{it.body}</Text>
              </View>
            </View>
          ))
        )}
      </Card>

      {/* ── Pipeline by stage ───────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pipeline by stage</Text>
      <Card style={{ marginBottom: 18 }}>
        {pipeline.isPending ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.foreground} />
          </View>
        ) : (
          (pipeline.data ?? []).map((s, i, arr) => (
            <View
              key={s.stage}
              style={[
                styles.row,
                i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.rowTitle, { color: colors.foreground }]}>{stageLabel(s.stage)}</Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>{fmtMoney(s.total_value)}</Text>
                <Text style={[styles.rowMeta, { color: colors.mutedForeground }]}>{s.count} deal{s.count === 1 ? "" : "s"}</Text>
              </View>
            </View>
          ))
        )}
      </Card>

      {/* ── Top contacts ────────────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top scoring contacts</Text>
      <Card>
        {topContacts.isPending ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.foreground} />
          </View>
        ) : (
          (topContacts.data ?? []).map((c, i, arr) => (
            <Pressable
              key={c.id}
              onPress={() => router.push(`/contact/${c.id}` as any)}
              style={[
                styles.row,
                i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>
                  {c.first_name} {c.last_name}
                </Text>
                <Text style={[styles.rowMeta, { color: colors.mutedForeground }]}>
                  {c.title ?? "—"} · {c.company_name ?? "—"}
                </Text>
              </View>
              <Badge tone="success" label={String(c.lead_score ?? 0)} />
            </Pressable>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

function KpiTile({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.kpiTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon} size={14} color={colors.mutedForeground} />
      <Text style={[styles.kpiValue, { color: colors.foreground }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 4 },

  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  eyebrow: { fontFamily: "Inter_500Medium", fontSize: 12, marginBottom: 2 },
  title: { fontFamily: "Inter_700Bold", fontSize: 22 },

  kpiGrid: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 18 },
  kpiTile: {
    flexBasis: "31%",
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  kpiValue: { fontFamily: "Inter_700Bold", fontSize: 17, marginTop: 2 },
  kpiLabel: { fontFamily: "Inter_400Regular", fontSize: 10 },

  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 14, marginTop: 8, marginBottom: 10 },

  insightItem: { flexDirection: "row", gap: 10 },
  insightDot: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  insightTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  insightBody: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17, marginTop: 4 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  rowTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  rowMeta: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },

  center: { padding: 20, alignItems: "center" },
  emptyText: { padding: 12, fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center" },
});
