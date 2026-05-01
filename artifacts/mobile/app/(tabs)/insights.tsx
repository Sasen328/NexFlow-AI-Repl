/**
 * Insights tab — Predictive · Team Performance · Report Builder
 * Native mirror of the web Insights surface.
 */
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
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
import { useColors } from "@/hooks/useColors";
import {
  useCallStats,
  useCalls,
  useDashboardSummary,
  useForecast,
  usePipelineByStage,
  useRevenueTrend,
} from "@/lib/api";

type SubKey = "predictive" | "team" | "reports";

export default function InsightsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [sub, setSub] = useState<SubKey>("predictive");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>INSIGHTS</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Predictive · Team · Reports</Text>
        </View>
        <PersonaSwitcher />
      </View>

      <SubTabs<SubKey>
        value={sub}
        onChange={setSub}
        tabs={[
          { key: "predictive", label: "Predictive" },
          { key: "team", label: "Team" },
          { key: "reports", label: "Reports" },
        ]}
      />

      {sub === "predictive" && <PredictiveView />}
      {sub === "team" && <TeamView />}
      {sub === "reports" && <ReportsView />}
    </View>
  );
}

/* ─────────────────────────── Predictive ─────────────────────────── */

function fmt$(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function PredictiveView() {
  const colors = useColors();
  const forecast = useForecast();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const trend = useRevenueTrend(period);
  const summary = useDashboardSummary();
  const pipeline = usePipelineByStage();

  const max = Math.max(1, ...(trend.data ?? []).map((p) => p.value));
  const sum = (trend.data ?? []).reduce((a, b) => a + b.value, 0);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 140 }}
      refreshControl={
        <RefreshControl
          refreshing={forecast.isRefetching || trend.isRefetching}
          onRefresh={() => {
            forecast.refetch();
            trend.refetch();
          }}
          tintColor={colors.foreground}
        />
      }
    >
      <Card style={{ margin: 16 }}>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Quarter forecast</Text>
        {forecast.isPending ? (
          <ActivityIndicator color={colors.foreground} />
        ) : (
          <View style={{ marginTop: 10, gap: 12 }}>
            <ForecastBar
              label="Worst case (closed)"
              value={forecast.data?.worst ?? 0}
              target={forecast.data?.target ?? 1}
              tone="#9C9098"
              colors={colors}
            />
            <ForecastBar
              label="Likely (probability-weighted)"
              value={forecast.data?.likely ?? 0}
              target={forecast.data?.target ?? 1}
              tone="#88B8B0"
              colors={colors}
            />
            <ForecastBar
              label="Best case (full pipeline)"
              value={forecast.data?.best ?? 0}
              target={forecast.data?.target ?? 1}
              tone="#7FB069"
              colors={colors}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingTop: 10,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
              }}
            >
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                Target {fmt$(forecast.data?.target ?? 0)}
              </Text>
              <Badge
                tone={(forecast.data?.confidence ?? 0) >= 80 ? "success" : "gold"}
                small
                label={`${forecast.data?.confidence ?? 0}% confidence`}
              />
            </View>
          </View>
        )}
      </Card>

      <Card style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Revenue trend</Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {(["7d", "30d", "90d"] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={[
                  styles.miniPill,
                  {
                    backgroundColor: period === p ? colors.foreground : "transparent",
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: period === p ? colors.background : colors.foreground,
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "800", marginTop: 8 }}>
          {fmt$(sum)}
        </Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
          Closed-won in last {period}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 80, marginTop: 12 }}>
          {(trend.data ?? []).map((p, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: `${Math.max(2, (p.value / max) * 100)}%`,
                backgroundColor: p.value > 0 ? "#88B8B0" : colors.muted,
                borderRadius: 2,
              }}
            />
          ))}
        </View>
      </Card>

      <Card style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Pipeline by stage</Text>
        <View style={{ marginTop: 10, gap: 8 }}>
          {(pipeline.data ?? []).map((s) => (
            <View key={s.stage}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>
                  {s.stage.replace(/_/g, " ")}
                </Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                  {s.count} · {fmt$(s.total_value)}
                </Text>
              </View>
              <View style={{ height: 6, backgroundColor: colors.muted, borderRadius: 3 }}>
                <View
                  style={{
                    width: `${Math.min(100, (s.count / Math.max(1, ...(pipeline.data ?? []).map((x) => x.count))) * 100)}%`,
                    height: "100%",
                    backgroundColor: "#88B8B0",
                    borderRadius: 3,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>AI prediction</Text>
        <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 8, lineHeight: 20 }}>
          Based on current pipeline velocity and {summary.data?.open_deals ?? 0} open deals, you are tracking{" "}
          <Text style={{ fontWeight: "700" }}>
            {forecast.data?.confidence ?? 0}% to target
          </Text>
          . Top 3 stuck deals would unlock ~{fmt$((forecast.data?.likely ?? 0) * 0.18)} if cleared this week.
        </Text>
      </Card>
    </ScrollView>
  );
}

function ForecastBar({
  label,
  value,
  target,
  tone,
  colors,
}: {
  label: string;
  value: number;
  target: number;
  tone: string;
  colors: ReturnType<typeof useColors>;
}) {
  const pct = Math.min(100, (value / target) * 100);
  return (
    <View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }}>{label}</Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{fmt$(value)}</Text>
      </View>
      <View style={{ height: 8, backgroundColor: colors.muted, borderRadius: 4 }}>
        <View style={{ width: `${pct}%`, height: "100%", backgroundColor: tone, borderRadius: 4 }} />
      </View>
    </View>
  );
}

/* ─────────────────────────── Team Performance ─────────────────────────── */

function TeamView() {
  const colors = useColors();
  const calls = useCalls({ limit: 100 });
  const stats = useCallStats();

  // Build a leaderboard from call rep_name + score
  const leaderboard = ((calls.data?.calls ?? []) as any[]).reduce<
    Record<string, { name: string; calls: number; score: number; total: number }>
  >(
    (acc, c: any) => {
      const name = c.rep_name ?? c.rep ?? "Unknown rep";
      const cur = acc[name] ?? { name, calls: 0, score: 0, total: 0 };
      cur.calls += 1;
      cur.total += c.call_score ?? 0;
      cur.score = cur.calls > 0 ? Math.round(cur.total / cur.calls) : 0;
      acc[name] = cur;
      return acc;
    },
    {},
  );
  type LbRow = { name: string; calls: number; score: number; total: number };
  const sorted = (Object.values(leaderboard) as LbRow[]).sort((a, b) => b.score - a.score);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={styles.kpiGrid}>
        <KpiTile label="Total calls" value={stats.data?.total_calls ?? 0} icon="phone" colors={colors} />
        <KpiTile
          label="Avg score"
          value={`${stats.data?.avg_call_score ?? 0}`}
          icon="award"
          colors={colors}
        />
        <KpiTile
          label="Avg duration"
          value={`${Math.round((stats.data?.avg_duration_seconds ?? 0) / 60)}m`}
          icon="clock"
          colors={colors}
        />
        <KpiTile
          label="Sentiment"
          value={`${Math.round((stats.data?.avg_sentiment ?? 0) * 100)}%`}
          icon="smile"
          colors={colors}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Leaderboard</Text>
      <View style={{ paddingHorizontal: 16, gap: 8 }}>
        {calls.isPending ? (
          <ActivityIndicator color={colors.foreground} />
        ) : sorted.length === 0 ? (
          <Text style={{ color: colors.mutedForeground }}>No call data yet.</Text>
        ) : (
          sorted.map((rep, i) => (
            <Card key={rep.name}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: i === 0 ? "#7FB069" : i === 1 ? "#88B8B0" : colors.muted,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: i < 2 ? "#fff" : colors.foreground, fontWeight: "800" }}>
                    {i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "700" }}>{rep.name}</Text>
                  <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                    {rep.calls} call{rep.calls === 1 ? "" : "s"}
                  </Text>
                </View>
                <Badge
                  tone={rep.score >= 80 ? "success" : rep.score >= 60 ? "gold" : "neutral"}
                  small
                  label={`${rep.score}`}
                />
              </View>
            </Card>
          ))
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Calls per day (30d)</Text>
      <Card style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 80 }}>
          {(stats.data?.calls_by_day ?? []).map((p, i) => {
            const max = Math.max(1, ...(stats.data?.calls_by_day ?? []).map((x) => x.value));
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: `${Math.max(2, (p.value / max) * 100)}%`,
                  backgroundColor: p.value > 0 ? "#88B8B0" : colors.muted,
                  borderRadius: 2,
                }}
              />
            );
          })}
        </View>
      </Card>
    </ScrollView>
  );
}

/* ─────────────────────────── Report Builder ─────────────────────────── */

function ReportsView() {
  const colors = useColors();
  const [name, setName] = useState("Q2 pipeline review");
  const [metrics, setMetrics] = useState<string[]>(["pipeline", "calls", "campaigns"]);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  const TEMPLATES = [
    { id: "exec", label: "Exec summary", icon: "trending-up" as const },
    { id: "pipeline", label: "Pipeline health", icon: "git-branch" as const },
    { id: "team", label: "Team scorecard", icon: "users" as const },
    { id: "marketing", label: "Marketing impact", icon: "send" as const },
  ];

  const allMetrics = ["pipeline", "calls", "campaigns", "signals", "forecast", "leaderboard"];

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Report templates</Text>
      <View style={{ paddingHorizontal: 16, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {TEMPLATES.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setName(t.label)}
            style={[
              styles.templateTile,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name={t.icon} size={18} color={colors.foreground} />
            <Text style={{ color: colors.foreground, fontWeight: "700", marginTop: 8 }}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Card style={{ margin: 16 }}>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Build a report</Text>
        <View style={{ marginTop: 10 }}>
          <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: "600", marginBottom: 4 }}>
            REPORT NAME
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[
              styles.input,
              { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted },
            ]}
          />
        </View>

        <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 14, fontWeight: "600" }}>
          PERIOD
        </Text>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
          {(["7d", "30d", "90d"] as const).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={[
                styles.chip,
                {
                  backgroundColor: period === p ? colors.foreground : "transparent",
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: period === p ? colors.background : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {p}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 14, fontWeight: "600" }}>
          METRICS
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {allMetrics.map((m) => (
            <Pressable
              key={m}
              onPress={() =>
                setMetrics((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]))
              }
              style={[
                styles.chip,
                {
                  backgroundColor: metrics.includes(m) ? colors.foreground : "transparent",
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={{
                  color: metrics.includes(m) ? colors.background : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {m}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() =>
            Alert.alert(
              "Report queued",
              `"${name}" with ${metrics.length} metric${metrics.length === 1 ? "" : "s"} for ${period}. We'll email a PDF when it's ready.`,
            )
          }
          style={[styles.cta, { backgroundColor: colors.foreground, marginTop: 16 }]}
        >
          <Feather name="download" size={14} color={colors.background} />
          <Text style={{ color: colors.background, fontWeight: "700" }}>
            Generate & email PDF
          </Text>
        </Pressable>
      </Card>
    </ScrollView>
  );
}

function KpiTile({
  label,
  value,
  icon,
  colors,
}: {
  label: string;
  value: string | number;
  icon: any;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.kpiTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon} size={14} color={colors.mutedForeground} />
      <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 18, marginTop: 6 }}>
        {value}
      </Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{label}</Text>
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
  cardLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" },
  sectionTitle: { fontSize: 14, fontWeight: "700", paddingHorizontal: 16, marginTop: 22, marginBottom: 10 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 8 },
  kpiTile: { flexBasis: "47%", flexGrow: 1, padding: 12, borderRadius: 12, borderWidth: 1 },
  templateTile: {
    flexBasis: "47%",
    flexGrow: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  miniPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  cta: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
});
