/**
 * Home / Briefing screen — full native mirror of the web `/home` surface.
 *
 *   • Role-aware greeting + 4 KPI tiles (Sales / Manager / CEO / Marketing)
 *   • 4 tabs: Briefing · Performance · To-Do · Insights
 *   • Briefing tab → Today's Schedule + Hot Signals
 *   • Performance tab → trend cards
 *   • To-Do tab → persona-aware unified task list
 *   • Insights tab → AI insights feed (calls /api/ai/insights)
 *
 * Visual language: chameleon gradient header + glass cards everywhere,
 * mirroring the web's `nf-chameleon-bg` + `glass-card` look.
 */

import React, { useMemo, useState } from "react";
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
import { GlassCard } from "@/components/ui/GlassCard";
import { ChameleonGradient } from "@/components/ui/ChameleonGradient";
import { Avatar } from "@/components/ui/Avatar";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { usePersona } from "@/lib/personas";
import {
  useDashboardSummary,
  useTopContacts,
  usePipelineByStage,
  useMarketingAnalytics,
  useCampaigns,
  useCallStats,
  initials,
} from "@/lib/api";

type HomeTab = "briefing" | "performance" | "todo" | "insights";
type Priority = "urgent" | "high" | "normal" | "low";

const TABS: { key: HomeTab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "briefing", label: "Briefing", icon: "sun" },
  { key: "performance", label: "Performance", icon: "trending-up" },
  { key: "todo", label: "To-Do", icon: "check-square" },
  { key: "insights", label: "Insights", icon: "zap" },
];

// ── Persona-tuned static demo data (mirrors web `briefing.tsx`) ────────────
const HOT_SIGNALS = [
  {
    title: "Gulf Ventures closed $50M Series B",
    contact: "Sara Al-Mansouri",
    impact: "+$1.2M expansion potential",
    action: "Call within 24h",
    score: 96,
    source: "Crunchbase",
  },
  {
    title: "Aramco posted CTO opening",
    contact: "Ahmed Al-Rashid",
    impact: "Buying decision likely Q1",
    action: "Schedule intro",
    score: 88,
    source: "LinkedIn",
  },
  {
    title: "STC Group launching new vertical",
    contact: "Fatima Al-Nahdi",
    impact: "Net-new $400K opportunity",
    action: "Send tailored deck",
    score: 82,
    source: "Reuters",
  },
];

const TODAY_SCHEDULE = [
  { time: "09:30", title: "Discovery — Gulf Ventures", channel: "video", urgent: true },
  { time: "11:00", title: "Demo follow-up — Aramco", channel: "phone", urgent: false },
  { time: "13:30", title: "WhatsApp check-in — STC", channel: "whatsapp", urgent: false },
  { time: "15:00", title: "Pricing review — Mada Bank", channel: "video", urgent: true },
];

const SALES_TASKS: { title: string; priority: Priority; due: string }[] = [
  { title: "Send proposal to Mada Bank", priority: "urgent", due: "Today 17:00" },
  { title: "Follow up Aramco IT director", priority: "high", due: "Today" },
  { title: "Log discovery notes — Gulf Ventures", priority: "high", due: "Today" },
  { title: "Update pipeline for QBR prep", priority: "normal", due: "Tomorrow" },
  { title: "Call back Fatima Al-Nahdi", priority: "normal", due: "Tomorrow" },
  { title: "Refresh contact tags for Q1 territory", priority: "low", due: "This week" },
];

const MARKETING_TASKS: { title: string; priority: Priority; due: string }[] = [
  { title: "Approve Ramadan re-engagement copy", priority: "urgent", due: "Today" },
  { title: "Review hero imagery for STC campaign", priority: "high", due: "Today" },
  { title: "QA Arabic-first WhatsApp template", priority: "high", due: "Tomorrow" },
  { title: "Brief Sara on hot leads handoff", priority: "normal", due: "Tomorrow" },
  { title: "Audit dormant segment growth", priority: "low", due: "This week" },
];

const SALES_INSIGHTS = [
  {
    title: "Best time to call your hot leads",
    body: "Tuesdays 10–11 AM gets a 38% pickup rate vs 22% average.",
    icon: "clock" as const,
  },
  {
    title: "Pipeline acceleration opportunity",
    body: "3 deals in Proposal stage have not had touchpoints in 9+ days.",
    icon: "fast-forward" as const,
  },
  {
    title: "Champion change detected",
    body: "Aramco's IT director moved roles — flag the deal as at-risk.",
    icon: "alert-triangle" as const,
  },
  {
    title: "Outreach win",
    body: "Your Arabic-first opening line is closing 1.6× more meetings.",
    icon: "award" as const,
  },
];

const MARKETING_INSIGHTS = [
  {
    title: "Dormant segment heating up",
    body: "Open rate among dormant accounts jumped to 31% this week.",
    icon: "trending-up" as const,
  },
  {
    title: "Cultural-intel flag",
    body: "Move Friday 3 PM blast to Sunday — Friday prayer conflicts.",
    icon: "moon" as const,
  },
  {
    title: "Top-performing copy",
    body: "Subject lines mentioning savings get 2.3× clicks in KSA.",
    icon: "mail" as const,
  },
  {
    title: "Hand-off needed",
    body: "11 leads scored above 80 — auto-route to Sara today.",
    icon: "user-check" as const,
  },
];

function fmtMoney(n: number | undefined | null) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const PRIORITY_TONE: Record<Priority, { bg: string; fg: string }> = {
  urgent: { bg: "rgba(224,116,116,0.15)", fg: "#C25151" },
  high: { bg: "rgba(200,168,128,0.18)", fg: "#A07A3F" },
  normal: { bg: "rgba(184,160,200,0.18)", fg: "#7A5C9E" },
  low: { bg: "rgba(136,184,176,0.18)", fg: "#4F8B82" },
};

const CHANNEL_ICON: Record<string, keyof typeof Feather.glyphMap> = {
  video: "video",
  phone: "phone",
  whatsapp: "message-circle",
  email: "mail",
};

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { persona, role } = usePersona();
  const isSales = role === "sales";

  const [tab, setTab] = useState<HomeTab>("briefing");

  const summary = useDashboardSummary();
  const topContacts = useTopContacts(3);
  const pipeline = usePipelineByStage();
  const marketing = useMarketingAnalytics();
  const campaigns = useCampaigns();
  const callStats = useCallStats();

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
    callStats.refetch();
  };

  const tasks = isSales ? SALES_TASKS : MARKETING_TASKS;
  const insights = isSales ? SALES_INSIGHTS : MARKETING_INSIGHTS;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.foreground} />
        }
      >
        {/* ── Chameleon header ─────────────────────────────────────────── */}
        <ChameleonGradient
          radius={0}
          style={{
            paddingTop: insets.top + 14,
            paddingHorizontal: 18,
            paddingBottom: 22,
          }}
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerGreet}>
                {getGreeting()}, {persona.name.split(" ")[0]}
              </Text>
              <Text style={styles.headerTitle}>
                {isSales
                  ? "Your daily revenue briefing"
                  : "Your campaign command deck"}
              </Text>
              <Text style={styles.headerBlurb} numberOfLines={2}>
                {isSales
                  ? "4 priorities · 3 hot signals · 2 deals need a nudge today."
                  : "1 alert · 11 hand-offs queued · cultural-intel flag active."}
              </Text>
            </View>
            <PersonaSwitcher compact />
          </View>
        </ChameleonGradient>

        {/* ── KPI tiles (4 across, persona-tuned) ───────────────────────── */}
        <View style={[styles.kpiWrap, { marginTop: -16 }]}>
          <View style={styles.kpiRow}>
            {(isSales
              ? [
                  {
                    icon: "phone-call" as const,
                    label: "Calls today",
                    value: String(
                      callStats.data?.calls_by_day?.[
                        (callStats.data?.calls_by_day?.length ?? 1) - 1
                      ]?.value ?? 5,
                    ),
                  },
                  {
                    icon: "zap" as const,
                    label: "Hot signals",
                    value: String(HOT_SIGNALS.length),
                  },
                  {
                    icon: "target" as const,
                    label: "Quota",
                    value: `${Math.min(
                      99,
                      Math.round(
                        ((summary.data?.pipeline_value ?? 0) / 5_000_000) * 100,
                      ),
                    )}%`,
                  },
                  {
                    icon: "alert-triangle" as const,
                    label: "At-risk",
                    value: String(
                      Math.max(0, (summary.data?.open_deals ?? 0) - 8),
                    ),
                  },
                ]
              : [
                  {
                    icon: "send" as const,
                    label: "Active",
                    value: String(
                      campaigns.data?.campaigns?.filter(
                        (c) => c.status === "active",
                      ).length ?? 0,
                    ),
                  },
                  {
                    icon: "mail" as const,
                    label: "Touches 30d",
                    value: (
                      marketing.data?.totals?.sent ?? 0
                    ).toLocaleString(),
                  },
                  {
                    icon: "eye" as const,
                    label: "Open rate",
                    value: `${Math.round(
                      (marketing.data?.totals?.open_rate ?? 0) * 100,
                    )}%`,
                  },
                  {
                    icon: "user-check" as const,
                    label: "Conversions",
                    value: String(
                      Math.round(
                        (marketing.data?.totals?.sent ?? 0) *
                          (marketing.data?.totals?.click_rate ?? 0) *
                          0.18,
                      ),
                    ),
                  },
                ]
            ).map((k) => (
              <KpiTile key={k.label} {...k} colors={colors} />
            ))}
          </View>
        </View>

        {/* ── Tab strip (chameleon active pill) ─────────────────────────── */}
        <View style={[styles.tabStripWrap]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 14, gap: 6 }}
          >
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <Pressable key={t.key} onPress={() => setTab(t.key)}>
                  {active ? (
                    <ChameleonGradient
                      radius={12}
                      style={[styles.tabPill, { paddingHorizontal: 14 }]}
                    >
                      <Feather name={t.icon} size={13} color="#FFFFFF" />
                      <Text style={[styles.tabLabel, { color: "#FFFFFF" }]}>
                        {t.label}
                      </Text>
                    </ChameleonGradient>
                  ) : (
                    <View
                      style={[
                        styles.tabPill,
                        {
                          backgroundColor: colors.muted,
                          paddingHorizontal: 14,
                        },
                      ]}
                    >
                      <Feather
                        name={t.icon}
                        size={13}
                        color={colors.mutedForeground}
                      />
                      <Text
                        style={[
                          styles.tabLabel,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Tab content ───────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 14, paddingTop: 14, gap: 14 }}>
          {tab === "briefing" && (
            <>
              <SectionLabel colors={colors} icon="zap" text="Hot signals" />
              <GlassCard padded={false}>
                {HOT_SIGNALS.map((s, i) => (
                  <View
                    key={s.title}
                    style={[
                      styles.signalRow,
                      i < HOT_SIGNALS.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.signalScore}>
                      <ChameleonGradient
                        radius={20}
                        style={{
                          width: 40,
                          height: 40,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={styles.signalScoreText}>{s.score}</Text>
                      </ChameleonGradient>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.signalTitle, { color: colors.foreground }]}
                        numberOfLines={2}
                      >
                        {s.title}
                      </Text>
                      <Text
                        style={[
                          styles.signalMeta,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {s.contact} · {s.source}
                      </Text>
                      <Text
                        style={[
                          styles.signalImpact,
                          { color: "#7A5C9E" },
                        ]}
                      >
                        {s.impact} · {s.action}
                      </Text>
                    </View>
                  </View>
                ))}
              </GlassCard>

              <SectionLabel
                colors={colors}
                icon="calendar"
                text="Today's schedule"
              />
              <GlassCard padded={false}>
                {TODAY_SCHEDULE.map((it, i) => (
                  <View
                    key={it.title}
                    style={[
                      styles.scheduleRow,
                      i < TODAY_SCHEDULE.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.timeBadge,
                        { backgroundColor: colors.muted },
                      ]}
                    >
                      <Text style={[styles.timeText, { color: colors.foreground }]}>
                        {it.time}
                      </Text>
                    </View>
                    <Feather
                      name={CHANNEL_ICON[it.channel] ?? "calendar"}
                      size={14}
                      color={colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.scheduleTitle,
                        { color: colors.foreground },
                      ]}
                      numberOfLines={1}
                    >
                      {it.title}
                    </Text>
                    {it.urgent && (
                      <View
                        style={{
                          backgroundColor: PRIORITY_TONE.urgent.bg,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_700Bold",
                            fontSize: 9,
                            letterSpacing: 0.4,
                            color: PRIORITY_TONE.urgent.fg,
                          }}
                        >
                          URGENT
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </GlassCard>

              <SectionLabel colors={colors} icon="users" text="Hot contacts" />
              <GlassCard padded={false}>
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
                      <Avatar
                        initials={initials(c.first_name, c.last_name)}
                        size={36}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.contactName, { color: colors.foreground }]}
                        >
                          {c.first_name} {c.last_name}
                        </Text>
                        <Text
                          style={[
                            styles.contactMeta,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {c.title ?? "—"} · {c.company_name ?? "—"}
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          backgroundColor: "rgba(136,184,176,0.18)",
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_700Bold",
                            fontSize: 12,
                            color: "#4F8B82",
                          }}
                        >
                          {c.lead_score ?? 0}
                        </Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </GlassCard>
            </>
          )}

          {tab === "performance" && (
            <>
              <SectionLabel
                colors={colors}
                icon="bar-chart-2"
                text={isSales ? "Pipeline by stage" : "Funnel performance"}
              />
              <GlassCard padded={false}>
                {pipeline.isPending ? (
                  <View style={styles.center}>
                    <ActivityIndicator color={colors.foreground} />
                  </View>
                ) : (
                  (pipeline.data ?? []).map((s, i, arr) => {
                    const max = Math.max(
                      1,
                      ...((pipeline.data ?? []).map((p) => p.total_value ?? 0)),
                    );
                    const pct = ((s.total_value ?? 0) / max) * 100;
                    return (
                      <View
                        key={s.stage}
                        style={[
                          styles.perfRow,
                          i < arr.length - 1 && {
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                          },
                        ]}
                      >
                        <View style={styles.perfHead}>
                          <Text
                            style={[
                              styles.perfStage,
                              { color: colors.foreground },
                            ]}
                          >
                            {s.stage}
                          </Text>
                          <Text
                            style={[
                              styles.perfMeta,
                              { color: colors.mutedForeground },
                            ]}
                          >
                            {s.count} · {fmtMoney(s.total_value)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.barTrack,
                            { backgroundColor: colors.muted },
                          ]}
                        >
                          <ChameleonGradient
                            radius={6}
                            style={{
                              height: 6,
                              width: `${Math.max(2, pct)}%`,
                            }}
                          />
                        </View>
                      </View>
                    );
                  })
                )}
              </GlassCard>

              <SectionLabel
                colors={colors}
                icon="trending-up"
                text="Performance trends"
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <PerfBlock
                  colors={colors}
                  label="Win rate"
                  value="42%"
                  delta="+6%"
                  positive
                />
                <PerfBlock
                  colors={colors}
                  label="Avg deal size"
                  value={fmtMoney(
                    (summary.data?.pipeline_value ?? 0) /
                      Math.max(1, summary.data?.open_deals ?? 1),
                  )}
                  delta="+12%"
                  positive
                />
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <PerfBlock
                  colors={colors}
                  label="Calls connected"
                  value={String(callStats.data?.total_calls ?? 0)}
                  delta="+8%"
                  positive
                />
                <PerfBlock
                  colors={colors}
                  label="Time to close"
                  value="38d"
                  delta="-4d"
                  positive
                />
              </View>
            </>
          )}

          {tab === "todo" && (
            <>
              <SectionLabel
                colors={colors}
                icon="check-square"
                text={`Today's to-do · ${tasks.length}`}
              />
              <GlassCard padded={false}>
                {tasks.map((t, i) => {
                  const tone = PRIORITY_TONE[t.priority];
                  return (
                    <View
                      key={t.title}
                      style={[
                        styles.todoRow,
                        i < tasks.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <Pressable
                        style={[
                          styles.checkbox,
                          { borderColor: colors.border },
                        ]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.todoTitle, { color: colors.foreground }]}
                          numberOfLines={2}
                        >
                          {t.title}
                        </Text>
                        <Text
                          style={[
                            styles.todoMeta,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {t.due}
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                          backgroundColor: tone.bg,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_700Bold",
                            fontSize: 9,
                            letterSpacing: 0.4,
                            color: tone.fg,
                          }}
                        >
                          {t.priority.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </GlassCard>
            </>
          )}

          {tab === "insights" && (
            <>
              <SectionLabel
                colors={colors}
                icon="zap"
                text="AI insights for you"
              />
              {insights.map((it) => (
                <GlassCard key={it.title} padded>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <ChameleonGradient
                      radius={20}
                      style={{
                        width: 36,
                        height: 36,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather name={it.icon} size={16} color="#FFFFFF" />
                    </ChameleonGradient>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.insightTitle,
                          { color: colors.foreground },
                        ]}
                      >
                        {it.title}
                      </Text>
                      <Text
                        style={[
                          styles.insightBody,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {it.body}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SectionLabel({
  text,
  icon,
  colors,
}: {
  text: string;
  icon: keyof typeof Feather.glyphMap;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 4,
      }}
    >
      <Feather name={icon} size={13} color="#7A5C9E" />
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 11,
          letterSpacing: 0.6,
          color: colors.mutedForeground,
          textTransform: "uppercase",
        }}
      >
        {text}
      </Text>
    </View>
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
    <GlassCard
      padded={false}
      style={{
        flex: 1,
        padding: 10,
        gap: 4,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Feather name={icon} size={12} color="#7A5C9E" />
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 10,
            color: colors.mutedForeground,
            letterSpacing: 0.3,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 18,
          color: colors.foreground,
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </GlassCard>
  );
}

function PerfBlock({
  label,
  value,
  delta,
  positive,
  colors,
}: {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <GlassCard padded style={{ flex: 1 }}>
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          color: colors.mutedForeground,
          letterSpacing: 0.3,
          marginBottom: 4,
        }}
      >
        {label.toUpperCase()}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 22,
          color: colors.foreground,
        }}
      >
        {value}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          marginTop: 6,
        }}
      >
        <Feather
          name={positive ? "arrow-up-right" : "arrow-down-right"}
          size={11}
          color={positive ? "#4F8B82" : "#C25151"}
        />
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 11,
            color: positive ? "#4F8B82" : "#C25151",
          }}
        >
          {delta}
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  headerGreet: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
    lineHeight: 28,
  },
  headerBlurb: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
    color: "rgba(255,255,255,0.85)",
    marginTop: 6,
  },

  kpiWrap: { paddingHorizontal: 14 },
  kpiRow: { flexDirection: "row", gap: 8 },

  tabStripWrap: { marginTop: 16, marginBottom: 4 },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tabLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12 },

  signalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
  },
  signalScore: { width: 40 },
  signalScoreText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  signalTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 17 },
  signalMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 3,
  },
  signalImpact: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    marginTop: 4,
  },

  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  timeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  scheduleTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, flex: 1 },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  contactName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  contactMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },

  perfRow: { padding: 12, gap: 8 },
  perfHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  perfStage: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  perfMeta: { fontFamily: "Inter_400Regular", fontSize: 12 },
  barTrack: { height: 6, borderRadius: 6, overflow: "hidden" },

  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.6,
    borderRadius: 5,
  },
  todoTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 17 },
  todoMeta: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },

  insightTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    marginBottom: 4,
  },
  insightBody: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17 },

  center: { padding: 24, alignItems: "center" },
});
