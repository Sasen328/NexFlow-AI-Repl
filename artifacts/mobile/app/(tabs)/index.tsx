/**
 * Home screen — AI-powered daily briefing, mirrors the web `/home` surface.
 *
 * Sales (Sara) sees: hot leads · pipeline pulse · push-to-action shortcuts.
 * Marketing (Maya) sees: campaign pulse · stalled leads · generate-content CTA.
 *
 * The persona switcher at the top swaps the entire experience instantly,
 * exactly like the avatar dropdown on the web TopBar.
 */

import React, { useMemo } from "react";
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
import { Avatar } from "@/components/ui/Avatar";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { usePersona } from "@/lib/personas";
import {
  useDashboardSummary,
  useTopContacts,
  usePipelineByStage,
  useMarketingAnalytics,
  useCampaigns,
  initials,
  stageLabel,
} from "@/lib/api";

function fmtMoney(n: number | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M SAR`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k SAR`;
  return `${Math.round(n)} SAR`;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { persona, role } = usePersona();

  const isSales = role === "sales";

  const summary = useDashboardSummary();
  const topContacts = useTopContacts(3);
  const pipeline = usePipelineByStage();
  const marketing = useMarketingAnalytics();
  const campaigns = useCampaigns();

  const refreshing = useMemo(
    () =>
      summary.isRefetching ||
      topContacts.isRefetching ||
      pipeline.isRefetching ||
      marketing.isRefetching ||
      campaigns.isRefetching,
    [summary, topContacts, pipeline, marketing, campaigns],
  );

  const onRefresh = () => {
    summary.refetch();
    topContacts.refetch();
    pipeline.refetch();
    marketing.refetch();
    campaigns.refetch();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.foreground} />}
    >
      {/* ── Header / persona switcher ─────────────────────────────────── */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Good morning, {persona.name.split(" ")[0]}
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {isSales ? "Your daily revenue briefing" : "Your campaign command deck"}
          </Text>
        </View>
        <PersonaSwitcher compact />
      </View>

      {/* ── KPI strip ─────────────────────────────────────────────────── */}
      {isSales ? (
        <View style={styles.kpiRow}>
          <KpiTile
            icon="users"
            label="Total contacts"
            value={summary.data?.total_contacts?.toLocaleString() ?? "—"}
            colors={colors}
          />
          <KpiTile
            icon="git-branch"
            label="Open deals"
            value={summary.data?.open_deals?.toString() ?? "—"}
            colors={colors}
          />
          <KpiTile
            icon="trending-up"
            label="Pipeline"
            value={fmtMoney(summary.data?.pipeline_value)}
            colors={colors}
          />
        </View>
      ) : (
        <View style={styles.kpiRow}>
          <KpiTile
            icon="send"
            label="Sent"
            value={(marketing.data?.totals?.sent ?? 0).toLocaleString()}
            colors={colors}
          />
          <KpiTile
            icon="mail"
            label="Open rate"
            value={`${Math.round((marketing.data?.totals?.open_rate ?? 0) * 100)}%`}
            colors={colors}
          />
          <KpiTile
            icon="mouse-pointer"
            label="Click rate"
            value={`${Math.round((marketing.data?.totals?.click_rate ?? 0) * 100)}%`}
            colors={colors}
          />
        </View>
      )}

      {/* ── Quick actions ─────────────────────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Jump into</Text>
      <View style={styles.actionGrid}>
        {isSales ? (
          <>
            <ActionTile
              colors={colors}
              icon="git-branch"
              label="CRM"
              hint="Command Center · Pipeline · Contacts"
              onPress={() => router.push("/(tabs)/pipeline")}
            />
            <ActionTile
              colors={colors}
              icon="phone"
              label="Comms"
              hint="Calls · WhatsApp · Voice agent"
              onPress={() => router.push("/(tabs)/calls")}
            />
            <ActionTile
              colors={colors}
              icon="zap"
              label="Enrichment"
              hint="Live AI lead enrichment"
              onPress={() => router.push("/(tabs)/enrichment")}
            />
            <ActionTile
              colors={colors}
              icon="trending-up"
              label="Marketing briefing"
              hint="Hot leads from your campaigns"
              onPress={() => router.push("/(tabs)/marketing")}
            />
            <ActionTile
              colors={colors}
              icon="message-circle"
              label="AI Assistant"
              hint="5 providers · auto-pick best"
              onPress={() => router.push("/(tabs)/agents")}
            />
            <ActionTile
              colors={colors}
              icon="bar-chart-2"
              label="Insights"
              hint="Dashboards · reports · forecasts"
              onPress={() => router.push("/(tabs)/insights")}
            />
          </>
        ) : (
          <>
            <ActionTile
              colors={colors}
              icon="trending-up"
              label="Campaigns"
              hint="Builder · performance · attribution"
              onPress={() => router.push("/(tabs)/marketing")}
            />
            <ActionTile
              colors={colors}
              icon="bar-chart-2"
              label="Insights"
              hint="Dashboards · reports · funnels"
              onPress={() => router.push("/(tabs)/insights")}
            />
            <ActionTile
              colors={colors}
              icon="zap"
              label="Enrichment"
              hint="Build segments from live data"
              onPress={() => router.push("/(tabs)/enrichment")}
            />
            <ActionTile
              colors={colors}
              icon="message-circle"
              label="AI Assistant"
              hint="Generate copy · summarise · brainstorm"
              onPress={() => router.push("/(tabs)/agents")}
            />
          </>
        )}
      </View>

      {/* ── Persona-specific feed ─────────────────────────────────────── */}
      {isSales ? (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Hot contacts</Text>
          <Card style={{ marginBottom: 16 }}>
            {topContacts.isPending ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.foreground} />
              </View>
            ) : (
              (topContacts.data ?? []).map((c, idx, arr) => (
                <Pressable
                  key={c.id}
                  onPress={() => router.push(`/contact/${c.id}` as any)}
                  style={[
                    styles.contactRow,
                    idx < arr.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <Avatar initials={initials(c.first_name, c.last_name)} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contactName, { color: colors.foreground }]}>
                      {c.first_name} {c.last_name}
                    </Text>
                    <Text style={[styles.contactMeta, { color: colors.mutedForeground }]}>
                      {c.title ?? "—"} · {c.company_name ?? "—"}
                    </Text>
                  </View>
                  <Badge tone="success" label={String(c.lead_score ?? 0)} />
                </Pressable>
              ))
            )}
          </Card>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pipeline pulse</Text>
          <Card>
            {pipeline.isPending ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.foreground} />
              </View>
            ) : (
              (pipeline.data ?? []).map((s, i, arr) => (
                <View
                  key={s.stage}
                  style={[
                    styles.pipelineRow,
                    i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <Text style={[styles.pipelineStage, { color: colors.foreground }]}>
                    {stageLabel(s.stage)}
                  </Text>
                  <Text style={[styles.pipelineMeta, { color: colors.mutedForeground }]}>
                    {s.count} · {fmtMoney(s.total_value)}
                  </Text>
                </View>
              ))
            )}
          </Card>
        </>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Active campaigns</Text>
          <Card>
            {campaigns.isPending ? (
              <View style={styles.center}>
                <ActivityIndicator color={colors.foreground} />
              </View>
            ) : (campaigns.data?.campaigns ?? []).length === 0 ? (
              <Text style={{ padding: 16, color: colors.mutedForeground, textAlign: "center" }}>
                No campaigns yet. Tap Marketing to build your first one.
              </Text>
            ) : (
              (campaigns.data?.campaigns ?? []).slice(0, 5).map((c, i, arr) => (
                <View
                  key={c.id}
                  style={[
                    styles.pipelineRow,
                    i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pipelineStage, { color: colors.foreground }]}>{c.name}</Text>
                    <Text style={[styles.pipelineMeta, { color: colors.mutedForeground }]}>
                      {c.channel ?? "—"} · {c.status}
                    </Text>
                  </View>
                  <Badge
                    tone={c.status === "active" ? "success" : "neutral"}
                    label={`${(c.sent_count ?? 0).toLocaleString()} sent`}
                  />
                </View>
              ))
            )}
          </Card>
        </>
      )}
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

function ActionTile({
  icon,
  label,
  hint,
  onPress,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  hint: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionTile,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: colors.background }]}>
        <Feather name={icon} size={16} color={colors.foreground} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.foreground }]}>{label}</Text>
      <Text style={[styles.actionHint, { color: colors.mutedForeground }]} numberOfLines={2}>
        {hint}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 4 },

  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  greeting: { fontFamily: "Inter_500Medium", fontSize: 13, marginBottom: 2 },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, lineHeight: 28 },

  kpiRow: { flexDirection: "row", gap: 8, marginBottom: 18 },
  kpiTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  kpiValue: { fontFamily: "Inter_700Bold", fontSize: 18, marginTop: 2 },
  kpiLabel: { fontFamily: "Inter_400Regular", fontSize: 11 },

  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 14, marginTop: 8, marginBottom: 10 },

  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  actionTile: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  actionLabel: { fontFamily: "Inter_700Bold", fontSize: 14 },
  actionHint: { fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 15 },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  contactName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  contactMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },

  pipelineRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  pipelineStage: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  pipelineMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },

  center: { padding: 24, alignItems: "center" },
});
