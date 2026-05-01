import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { usePersona } from "@/lib/personas";
import { formatCurrency, getTimeOfDay } from "@/data/mockData";
import {
  apiPost,
  initials,
  useDashboardSummary,
  useSignalSummary,
  useTopContacts,
  useForgottenLeads,
} from "@/lib/api";

// Provider-routed AI models (mirrors web /assistant + /marketing-assistant).
const AI_PROVIDERS = [
  { key: "auto",       label: "Auto",       color: "#B8A0C8" },
  { key: "anthropic",  label: "Claude 4.6", color: "#C8A880" },
  { key: "openai",     label: "GPT-4o",     color: "#88B8B0" },
  { key: "gemini",     label: "Gemini 2.5", color: "#90B8D8" },
  { key: "perplexity", label: "Perplexity", color: "#B8B880" },
] as const;
type ProviderKey = typeof AI_PROVIDERS[number]["key"];

// ─── Static data (mirrors web briefing.tsx) ───────────────────────────────────
const TODAY_AGENDA = [
  { time: "09:00", title: "Discovery call · Sara Al-Mansouri", channel: "phone", status: "upcoming" },
  { time: "10:30", title: "Demo follow-up · Ahmed Al-Rashidi", channel: "phone", status: "upcoming" },
  { time: "12:00", title: "Send proposal · Aramco Digital", channel: "mail", status: "task" },
  { time: "14:00", title: "WhatsApp · Fatima Khalid", channel: "message-square", status: "task" },
  { time: "16:00", title: "Pipeline review with team", channel: "phone", status: "upcoming" },
];

const HOT_SIGNALS = [
  { title: "Gulf Ventures closed $50M Series B", contact: "Sara Al-Mansouri", impact: "+$1.2M expansion", action: "Call within 24h", score: 96, source: "Crunchbase" },
  { title: "Ahmed Al-Rashidi promoted to CIO", contact: "Ahmed Al-Rashidi", impact: "Increased budget authority", action: "Send congrats + MSA", score: 87, source: "LinkedIn" },
  { title: "Aramco Digital approved Q2 budget", contact: "Mohammed Al-Otaibi", impact: "Contract ready to sign", action: "Push to Negotiation", score: 84, source: "WhatsApp" },
];

const AT_RISK = [
  { name: "Layla Hassan", deal: "SMB Starter", value: 95000, risk: "Score dropped 72 → 65", days: 9 },
  { name: "Khalid Al-Hamdan", deal: "Pilot Expansion", value: 145000, risk: "No contact in 14 days", days: 14 },
];

const AUTO_TASKS = [
  { id: "t1", priority: "urgent", label: "Follow up: Sara Al-Mansouri (Series B funding)", due: "Today · 09:00", contact: "Sara Al-Mansouri", source: "Signal", done: false },
  { id: "t2", priority: "high", label: "Send proposal to Aramco Digital", due: "Today · 12:00", contact: "Mohammed Al-Otaibi", source: "Schedule", done: false },
  { id: "t3", priority: "high", label: "Re-engage: Khalid Al-Hamdan — 14 days silent", due: "Today", contact: "Khalid Al-Hamdan", source: "AI", done: false },
  { id: "t4", priority: "normal", label: "Congratulations to Ahmed Al-Rashidi (CIO promotion)", due: "Today · 11:00", contact: "Ahmed Al-Rashidi", source: "LinkedIn", done: false },
  { id: "t5", priority: "normal", label: "Review pipeline: 3 deals stalled >30 days", due: "This week", contact: null, source: "CRM", done: false },
  { id: "t6", priority: "normal", label: "Update lead scores for Q2 enrichment batch", due: "This week", contact: null, source: "AI", done: false },
  { id: "t7", priority: "low", label: "WhatsApp check-in: Fatima Khalid", due: "Today · 14:00", contact: "Fatima Khalid", source: "Schedule", done: false },
  { id: "t8", priority: "low", label: "Add 10 enriched leads from sourcing to call list", due: "This week", contact: null, source: "AI", done: false },
];

const AI_INSIGHTS = [
  { icon: "trending-up", color: "#88B8B0", title: "Pipeline acceleration detected", body: "Your Negotiation stage has 3 deals <7 days old — all with strong engagement. Push for close this week, probability is 71%.", tag: "Pipeline" },
  { icon: "alert-triangle", color: "#C8A880", title: "SLA breach risk: 2 follow-ups overdue", body: "Khalid Al-Hamdan and Layla Hassan both had follow-up commitments from last week. Every 24h of delay drops close probability by ~4%.", tag: "Alerts" },
  { icon: "star", color: "#B8A0C8", title: "Best time to call this week", body: "Based on historical pick-up rates in KSA and UAE, Tue–Thu 09:30–11:00 AM Riyadh time has the highest connection rate (68% vs 41% average).", tag: "Analytics" },
  { icon: "cpu", color: "#C0A0B8", title: "AI Agent overnight results", body: "Voice AI ran 12 sessions overnight. 4 leads qualified (32%). 2 are hot enough for today's call list. Recommend calling Nora Al-Faisal first.", tag: "AI" },
  { icon: "bar-chart-2", color: "#B8B880", title: "Team velocity up 18% WoW", body: "Call volume, email opens, and WhatsApp reply rates all trending up. You're on track to hit 112% of monthly pipeline target.", tag: "Performance" },
];

const INITIAL_AI_MSGS = [
  { role: "ai", text: "Good morning! I've analyzed your pipeline, signals, and overnight AI agent activity. You have 3 urgent actions today. How can I help you prioritize?" },
];

const RE_ENGAGEMENT_SIGNALS = ["Wealth signal", "Job change", "Site visits", "Email opens", "Follow-up missed"];

type Tab = "overview" | "tasks" | "insights" | "assistant";

const PRIORITY_COLOR: Record<string, string> = { urgent: "#C8A880", high: "#B8A0C8", normal: "#88B8B0", low: "#90B8B8" };
const PRIORITY_LABELS: Record<string, string> = { urgent: "Urgent", high: "High", normal: "Normal", low: "Low" };

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function CommandCenterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tod = getTimeOfDay();
  const { persona } = usePersona();
  const firstName = persona.name.split(" ")[0];
  const personaSubtitle = persona.key === "marketing"
    ? "Daily Marketing Hub"
    : "Daily Command Center";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const [tab, setTab] = useState<Tab>("overview");
  const [tasks, setTasks] = useState(AUTO_TASKS);
  const [aiMessages, setAiMessages] = useState<{ role: string; text: string; provider?: string }[]>(INITIAL_AI_MSGS);
  const [aiInput, setAiInput] = useState("");
  const [aiProvider, setAiProvider] = useState<ProviderKey>("auto");
  const [aiProviderOpen, setAiProviderOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Reset chat + provider UI when the persona switches so Sara's pipeline
  // context doesn't bleed into Maya's marketing chat.
  useEffect(() => {
    setAiMessages(INITIAL_AI_MSGS);
    setAiInput("");
    setAiProviderOpen(false);
    setAiBusy(false);
  }, [persona.key]);

  const summary = useDashboardSummary();
  const top = useTopContacts(3);
  const signals = useSignalSummary();
  const forgotten = useForgottenLeads();

  const top3 = top.data ?? [];
  const totalPipeline = summary.data?.pipeline_value ?? 0;
  const callsToday = summary.data?.calls_today ?? 0;
  const hotSignals = signals.data?.new ?? 0;
  const activeSignals = signals.data?.total ?? 0;
  const openDeals = summary.data?.open_deals ?? 0;
  const topSignal = signals.data?.top_signals?.[0];
  const reEngagementLeads = (forgotten.data?.leads ?? []) as any[];
  const loading = summary.isPending || top.isPending;

  const doneCount = tasks.filter(t => t.done).length;
  const urgentCount = tasks.filter(t => !t.done && t.priority === "urgent").length;

  const tap = (route: string) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.push(route as any);
  };

  const switchTab = (t: Tab) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setTab(t);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const toggleTask = (id: string) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const sendAi = async () => {
    if (!aiInput.trim() || aiBusy) return;
    const txt = aiInput.trim();
    setAiMessages(m => [...m, { role: "user", text: txt }]);
    setAiInput("");
    setAiBusy(true);
    try {
      const r = await apiPost<{ reply: string; provider_used?: string }>(
        "/assistant/chat",
        {
          message: txt,
          provider: aiProvider,
          history: aiMessages
            .slice(-6)
            .map(m => ({ role: m.role === "ai" ? "assistant" : "user", text: m.text })),
        },
      );
      setAiMessages(m => [...m, { role: "ai", text: r.reply || "(no reply)", provider: r.provider_used ?? aiProvider }]);
    } catch (err: any) {
      setAiMessages(m => [...m, { role: "ai", text: `Couldn't reach the AI right now (${err?.message ?? "error"}). Try a different model or check your connection.` }]);
    } finally {
      setAiBusy(false);
    }
  };

  const currentProvider = AI_PROVIDERS.find(p => p.key === aiProvider) ?? AI_PROVIDERS[0];

  const TABS: { k: Tab; label: string; icon: string; badge?: number }[] = [
    { k: "overview", label: "Overview", icon: "bar-chart-2" },
    { k: "tasks", label: "Tasks", icon: "check-square", badge: urgentCount || undefined },
    { k: "insights", label: "Insights", icon: "zap" },
    { k: "assistant", label: "AI Chat", icon: "cpu" },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ── Sticky header + tabs ─────────────────────────────────── */}
      <View style={[s.stickyHeader, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12), backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {/* Greeting row */}
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[s.dateText, { color: colors.mutedForeground }]}>{today} · Riyadh</Text>
            <Text style={[s.greeting, { color: colors.foreground }]}>{tod.label}, {firstName}</Text>
            <Text style={[s.cmdLabel, { color: persona.accent }]}>{personaSubtitle}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <PersonaSwitcher compact />
            <Pressable style={[s.bellBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => tap("/notifications")}>
              <Feather name="bell" size={17} color={colors.foreground} />
              {hotSignals > 0 && <View style={[s.badgeDot, { backgroundColor: colors.violet }]} />}
            </Pressable>
          </View>
        </View>

        {/* Tab pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabScroll} contentContainerStyle={s.tabRow}>
          {TABS.map(t => {
            const active = tab === t.k;
            return (
              <Pressable key={t.k} onPress={() => switchTab(t.k)} style={({ pressed }) => [s.tabPill, { opacity: pressed ? 0.7 : 1 }]}>
                {active ? (
                  <LinearGradient colors={["#B8A0C8", "#88B8B0", "#C8A880"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.tabPillActive}>
                    <Feather name={t.icon as any} size={12} color="#fff" />
                    <Text style={s.tabLabelActive}>{t.label}</Text>
                    {t.badge ? <View style={s.tabBadgeActive}><Text style={s.tabBadgeText}>{t.badge}</Text></View> : null}
                  </LinearGradient>
                ) : (
                  <View style={[s.tabPillInactive, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                    <Feather name={t.icon as any} size={12} color={colors.mutedForeground} />
                    <Text style={[s.tabLabelInactive, { color: colors.mutedForeground }]}>{t.label}</Text>
                    {t.badge ? <View style={[s.tabBadgeInactive, { backgroundColor: colors.gold + "30" }]}><Text style={[s.tabBadgeText, { color: colors.gold }]}>{t.badge}</Text></View> : null}
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Tab content ────────────────────────────────────────────── */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 14 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ═══ OVERVIEW ═══ */}
        {tab === "overview" && (
          <>
            {/* AI Briefing card */}
            <LinearGradient colors={["#f4eeff", "#eaf7f5", "#fff8ee"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.aiCard, { borderColor: colors.border }]}>
              <LinearGradient colors={["#B8A0C8", "#88B8B0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.aiPill}>
                <Feather name="zap" size={10} color="#fff" />
                <Text style={s.aiPillText}>YOUR AI DAILY BRIEFING</Text>
              </LinearGradient>
              {loading
                ? <Text style={[s.aiText, { color: colors.mutedForeground }]}>Analysing your pipeline…</Text>
                : <Text style={[s.aiText, { color: colors.foreground }]}>
                    You have <Text style={[s.aiBold, { color: colors.violet }]}>{top3.length} high-intent prospects</Text> ready today, pipeline{" "}
                    <Text style={[s.aiBold, { color: colors.teal }]}>{formatCurrency(totalPipeline)}</Text>.
                    {topSignal ? <> Most urgent: <Text style={[s.aiBold, { color: colors.foreground }]}>{topSignal.contact_name || topSignal.company_name || "a top account"}</Text> — {topSignal.title}.</> : null}
                    {" "}<Text style={[s.aiBold, { color: "#E07474" }]}>2 deals at risk</Text> need attention.
                    AI Voice handled <Text style={[s.aiBold, { color: colors.foreground }]}>12 sessions</Text> overnight — 4 leads qualified.
                  </Text>
              }
            </LinearGradient>

            {/* Stats 2×2 */}
            {[
              [{ icon: "phone", val: String(callsToday), label: "Calls today", col: colors.teal }, { icon: "zap", val: String(hotSignals), label: "Hot signals", col: "#B8B880" }],
              [{ icon: "cpu", val: "12", label: "AI sessions", col: colors.violet }, { icon: "alert-triangle", val: String(AT_RISK.length), label: "At-risk deals", col: "#C0A0B8" }],
            ].map((row, ri) => (
              <View key={ri} style={{ flexDirection: "row", gap: 10 }}>
                {row.map(stat => (
                  <View key={stat.label} style={[s.statCard, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}>
                    <View style={[s.statIcon, { backgroundColor: stat.col + "20" }]}>
                      <Feather name={stat.icon as any} size={16} color={stat.col} />
                    </View>
                    <Text style={[s.statVal, { color: colors.foreground }]}>{stat.val}</Text>
                    <Text style={[s.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            ))}

            {/* Re-Engagement Opportunities */}
            {reEngagementLeads.length > 0 && (
              <LinearGradient colors={["#fffbf0", "#f9f3ff", "#f0f9f8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.reCard, { borderColor: "rgba(200,168,128,0.3)" }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <View style={[s.reIconBox, { backgroundColor: "rgba(200,168,128,0.2)" }]}>
                    <Feather name="clock" size={14} color={colors.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.sectionTitle, { color: colors.foreground }]}>Re-Engagement Opportunities</Text>
                    <Text style={[s.sectionSub, { color: colors.mutedForeground }]}>No contact ≥90 days + wealth, job change, or digital signal</Text>
                  </View>
                  <LinearGradient colors={["#C8A880", "#B8A0C8"]} style={s.reBadge}>
                    <Text style={s.reBadgeText}>{reEngagementLeads.length}</Text>
                  </LinearGradient>
                </View>
                {reEngagementLeads.slice(0, 4).map((l: any, i: number) => {
                  const sig = RE_ENGAGEMENT_SIGNALS[i % RE_ENGAGEMENT_SIGNALS.length];
                  const prio = Math.round(Number(l.lead_score) * 0.9 + 5);
                  return (
                    <Pressable key={l.id} onPress={() => tap(`/contact/${l.id}`)} style={({ pressed }) => [s.reRow, { backgroundColor: "rgba(255,255,255,0.75)", borderColor: "rgba(200,168,128,0.2)", opacity: pressed ? 0.7 : 1 }]}>
                      <LinearGradient colors={["#C8A880", "#B8A0C8"]} style={s.reAvatar}>
                        <Text style={s.reAvatarText}>{(l.first_name?.[0] ?? "") + (l.last_name?.[0] ?? "")}</Text>
                      </LinearGradient>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.reName, { color: colors.foreground }]}>{l.first_name} {l.last_name}</Text>
                        <Text style={[s.reSub, { color: colors.mutedForeground }]} numberOfLines={1}>{l.company_name ?? "—"} · silent {Math.round(Number(l.days_silent))}d</Text>
                        <View style={[s.sigPill, { backgroundColor: "rgba(200,168,128,0.15)" }]}>
                          <Text style={[s.sigPillText, { color: colors.gold }]}>{sig}</Text>
                        </View>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={[s.prioScore, { color: colors.gold }]}>{prio}</Text>
                        <Text style={[s.prioLabel, { color: colors.mutedForeground }]}>priority</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </LinearGradient>
            )}

            {/* Top 3 to Call */}
            <View style={{ gap: 8 }}>
              <View style={s.sectionRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="target" size={15} color={colors.violet} />
                  <Text style={[s.sectionTitle, { color: colors.foreground }]}>Today's Top 3 to Call</Text>
                </View>
                <Pressable onPress={() => tap("/contacts")}>
                  <Text style={[s.link, { color: colors.teal }]}>All →</Text>
                </Pressable>
              </View>
              <Card padded={false}>
                {top.isPending ? (
                  <View style={{ paddingVertical: 28, alignItems: "center" }}>
                    <ActivityIndicator color={colors.mutedForeground} />
                  </View>
                ) : top3.length === 0 ? (
                  <View style={{ padding: 20, alignItems: "center" }}>
                    <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>No contacts yet.</Text>
                  </View>
                ) : top3.map((c, i) => (
                  <Pressable key={c.id} onPress={() => tap(`/contact/${c.id}`)} style={({ pressed }) => [s.contactRow, { borderBottomColor: colors.border, borderBottomWidth: i < top3.length - 1 ? 1 : 0, opacity: pressed ? 0.6 : 1 }]}>
                    <Text style={[s.rank, { color: colors.mutedForeground }]}>{i + 1}</Text>
                    <Avatar initials={initials(c.first_name, c.last_name)} size={40} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.contactName, { color: colors.foreground }]}>{c.first_name} {c.last_name}</Text>
                      <Text style={[s.contactSub, { color: colors.mutedForeground }]} numberOfLines={1}>{c.title || "—"}{c.company_name ? ` · ${c.company_name}` : ""}</Text>
                    </View>
                    <View style={[s.scoreCircle, { borderColor: colors.violet }]}>
                      <Text style={{ fontFamily: "Inter_700Bold", fontSize: 11, color: colors.violet }}>{c.lead_score ?? 0}</Text>
                    </View>
                  </Pressable>
                ))}
              </Card>
            </View>

            {/* Today's Schedule */}
            <View>
              <View style={[s.sectionRow, { marginBottom: 8 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="calendar" size={15} color={colors.teal} />
                  <Text style={[s.sectionTitle, { color: colors.foreground }]}>Today's Schedule</Text>
                </View>
              </View>
              <Card padded={false}>
                {TODAY_AGENDA.map((item, i) => (
                  <View key={i} style={[s.agendaRow, { borderBottomColor: colors.border, borderBottomWidth: i < TODAY_AGENDA.length - 1 ? 1 : 0 }]}>
                    <Text style={[s.agendaTime, { color: colors.mutedForeground }]}>{item.time}</Text>
                    <View style={[s.agendaDot, { backgroundColor: item.status === "task" ? colors.gold : colors.teal }]} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <Feather name={item.channel as any} size={11} color={colors.mutedForeground} />
                        <Text style={[s.agendaTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
                      </View>
                      <Text style={[s.agendaStatus, { color: item.status === "task" ? colors.gold : colors.teal }]}>{item.status}</Text>
                    </View>
                  </View>
                ))}
              </Card>
            </View>

            {/* SLA Alerts */}
            <View>
              <View style={[s.sectionRow, { marginBottom: 8 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="bell" size={15} color="#C0A0B8" />
                  <Text style={[s.sectionTitle, { color: colors.foreground }]}>SLA Alerts</Text>
                  <View style={[s.slaCount, { backgroundColor: "#C0A0B820" }]}><Text style={{ fontFamily: "Inter_700Bold", fontSize: 10, color: "#C0A0B8" }}>{AT_RISK.length}</Text></View>
                </View>
              </View>
              <View style={{ gap: 8 }}>
                {AT_RISK.map((d, i) => (
                  <View key={i} style={[s.slaCard, { backgroundColor: "#C0A0B808", borderColor: "#C0A0B825", borderLeftColor: "#C0A0B8" }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text style={[s.slaName, { color: colors.foreground }]}>{d.name}</Text>
                      <Text style={[s.slaVal, { color: "#C0A0B8" }]}>${(d.value / 100).toLocaleString()}</Text>
                    </View>
                    <Text style={[s.slaDeal, { color: colors.mutedForeground }]}>{d.deal}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 }}>
                      <Feather name="alert-triangle" size={11} color="#C0A0B8" />
                      <Text style={[s.slaRisk, { color: "#C0A0B8" }]}>{d.risk}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Hot Signals */}
            <View>
              <View style={[s.sectionRow, { marginBottom: 8 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="zap" size={15} color="#B8B880" />
                  <Text style={[s.sectionTitle, { color: colors.foreground }]}>Hot Signals · Last 24h</Text>
                </View>
                <Pressable onPress={() => tap("/signals")}><Text style={[s.link, { color: colors.violet }]}>All →</Text></Pressable>
              </View>
              <View style={{ gap: 8 }}>
                {HOT_SIGNALS.map((sig, i) => (
                  <View key={i} style={[s.sigCard, { backgroundColor: "#B8B88008", borderColor: "#B8B88025" }]}>
                    <View style={[s.sigIcon, { backgroundColor: "#B8B88025" }]}>
                      <Feather name="zap" size={15} color="#B8B880" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.sigTitle, { color: colors.foreground }]}>{sig.title}</Text>
                      <Text style={[s.sigContact, { color: colors.violet }]}>{sig.contact} · <Text style={{ color: colors.mutedForeground }}>{sig.impact}</Text></Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                        <View style={[s.srcBadge, { backgroundColor: colors.muted }]}><Text style={[s.srcText, { color: colors.mutedForeground }]}>{sig.source}</Text></View>
                        <Text style={[s.sigAction, { color: colors.teal }]}>{sig.action} →</Text>
                      </View>
                    </View>
                    <Text style={[s.sigScore, { color: "#B8B880" }]}>{sig.score}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Quick Actions */}
            <View>
              <Text style={[s.sectionTitle, { color: colors.foreground, marginBottom: 10 }]}>Quick Actions</Text>
              {[
                { icon: "phone", label: "Start a Call", color: colors.teal, route: "/contacts" },
                { icon: "mail", label: "Compose Email", color: colors.violet, route: "/contacts" },
                { icon: "message-square", label: "WhatsApp Message", color: "#90B8B8", route: "/contacts" },
                { icon: "users", label: "Find New Leads", color: colors.gold, route: "/sourcing" },
              ].map(a => (
                <Pressable key={a.label} onPress={() => tap(a.route)} style={({ pressed }) => [s.qaRow, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}>
                  <View style={[s.qaIcon, { backgroundColor: a.color + "20" }]}>
                    <Feather name={a.icon as any} size={18} color={a.color} />
                  </View>
                  <Text style={[s.qaLabel, { color: colors.foreground }]}>{a.label}</Text>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* ═══ TASKS ═══ */}
        {tab === "tasks" && (
          <>
            <View style={s.sectionRow}>
              <View>
                <Text style={[s.tabPageTitle, { color: colors.foreground }]}>AI-Generated Tasks</Text>
                <Text style={[s.tabPageSub, { color: colors.mutedForeground }]}>From pipeline activity, signals & commitments</Text>
              </View>
              <Text style={[s.progressLabel, { color: colors.mutedForeground }]}>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold" }}>{doneCount}</Text>/{tasks.length}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={[s.progTrack, { backgroundColor: colors.muted }]}>
              <LinearGradient colors={["#B8A0C8", "#88B8B0", "#C8A880"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.progFill, { width: `${(doneCount / tasks.length) * 100}%` as any }]} />
            </View>

            {(["urgent", "high", "normal", "low"] as const).map(priority => {
              const group = tasks.filter(t => t.priority === priority);
              if (!group.length) return null;
              const remaining = group.filter(t => !t.done).length;
              return (
                <View key={priority}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <View style={[s.priorityDot, { backgroundColor: PRIORITY_COLOR[priority] }]} />
                    <Text style={[s.priorityLabel, { color: colors.mutedForeground }]}>{PRIORITY_LABELS[priority].toUpperCase()}</Text>
                    <Text style={[s.prioritySub, { color: colors.mutedForeground }]}>· {remaining} remaining</Text>
                  </View>
                  <View style={{ gap: 8 }}>
                    {group.map(task => (
                      <Pressable key={task.id} onPress={() => toggleTask(task.id)}
                        style={({ pressed }) => [s.taskCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: (task.done || pressed) ? 0.5 : 1 }]}>
                        <Feather
                          name={task.done ? "check-circle" : "circle"}
                          size={20}
                          color={task.done ? PRIORITY_COLOR[priority] : colors.mutedForeground}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={[s.taskLabel, { color: colors.foreground, textDecorationLine: task.done ? "line-through" : "none" }]}>{task.label}</Text>
                          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                              <Feather name="clock" size={10} color={colors.mutedForeground} />
                              <Text style={[s.taskMeta, { color: colors.mutedForeground }]}>{task.due}</Text>
                            </View>
                            {task.contact && <Text style={[s.taskMeta, { color: colors.violet }]}>{task.contact}</Text>}
                            <View style={[s.srcBadge, { backgroundColor: colors.muted, marginLeft: "auto" as any }]}>
                              <Text style={[s.srcText, { color: colors.mutedForeground }]}>{task.source}</Text>
                            </View>
                          </View>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ═══ INSIGHTS ═══ */}
        {tab === "insights" && (
          <>
            <View>
              <Text style={[s.tabPageTitle, { color: colors.foreground }]}>AI Insights · Today</Text>
              <Text style={[s.tabPageSub, { color: colors.mutedForeground }]}>Auto-generated from pipeline, calls, signals & team activity</Text>
            </View>
            {AI_INSIGHTS.map((ins, i) => (
              <View key={i} style={[s.insightCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: ins.color }]}>
                <View style={[s.insightIcon, { backgroundColor: ins.color + "20" }]}>
                  <Feather name={ins.icon as any} size={18} color={ins.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                    <Text style={[s.insightTitle, { color: colors.foreground }]}>{ins.title}</Text>
                    <View style={[s.insightTag, { backgroundColor: ins.color + "20" }]}>
                      <Text style={[s.insightTagText, { color: ins.color }]}>{ins.tag}</Text>
                    </View>
                  </View>
                  <Text style={[s.insightBody, { color: colors.foreground }]}>{ins.body}</Text>
                </View>
              </View>
            ))}
            <Pressable style={({ pressed }) => [s.deepBtn, { opacity: pressed ? 0.8 : 1 }]}>
              <LinearGradient colors={["#B8A0C8", "#88B8B0", "#C8A880"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.deepBtnInner}>
                <Feather name="zap" size={15} color="#fff" />
                <Text style={s.deepBtnText}>Generate deeper analysis</Text>
              </LinearGradient>
            </Pressable>
            <Text style={[s.deepNote, { color: colors.mutedForeground }]}>AI will analyze the last 30 days of pipeline and call data</Text>
          </>
        )}

        {/* ═══ AI ASSISTANT ═══ */}
        {tab === "assistant" && (
          <View style={[s.chatContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header */}
            <View style={[s.chatHeader, { borderBottomColor: colors.border }]}>
              <LinearGradient colors={["#B8A0C8", "#88B8B0", "#C8A880"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.chatAvatar}>
                <Feather name="cpu" size={18} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[s.chatName, { color: colors.foreground }]}>NexFlow AI Assistant</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <View style={[s.onlineDot, { backgroundColor: currentProvider.color }]} />
                  <Text style={[s.chatStatus, { color: colors.mutedForeground }]}>
                    via {currentProvider.label}
                  </Text>
                </View>
              </View>
              {/* Provider toggle */}
              <Pressable
                onPress={() => { if (Platform.OS !== "web") Haptics.selectionAsync(); setAiProviderOpen(o => !o); }}
                style={[s.providerBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              >
                <View style={[s.providerDot, { backgroundColor: currentProvider.color }]} />
                <Text style={[s.providerLabel, { color: colors.foreground }]}>{currentProvider.label}</Text>
                <Feather name={aiProviderOpen ? "chevron-up" : "chevron-down"} size={11} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {/* Provider dropdown */}
            {aiProviderOpen && (
              <View style={[s.providerMenu, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                {AI_PROVIDERS.map(p => (
                  <Pressable
                    key={p.key}
                    onPress={() => {
                      if (Platform.OS !== "web") Haptics.selectionAsync();
                      setAiProvider(p.key);
                      setAiProviderOpen(false);
                    }}
                    style={[
                      s.providerOpt,
                      { backgroundColor: aiProvider === p.key ? colors.muted : "transparent" },
                    ]}
                  >
                    <View style={[s.providerDot, { backgroundColor: p.color }]} />
                    <Text style={[s.providerOptText, { color: colors.foreground }]}>{p.label}</Text>
                    {aiProvider === p.key && <Feather name="check" size={14} color={p.color} />}
                  </Pressable>
                ))}
              </View>
            )}

            {/* Messages */}
            <ScrollView style={s.chatMessages} contentContainerStyle={{ gap: 12, padding: 14 }} showsVerticalScrollIndicator={false}>
              {aiMessages.map((msg, i) => (
                <View key={i} style={[s.msgRow, msg.role === "user" ? s.msgRowUser : s.msgRowAi]}>
                  {msg.role === "ai" && (
                    <LinearGradient colors={["#B8A0C8", "#88B8B0"]} style={s.msgAiAvatar}>
                      <Feather name="zap" size={12} color="#fff" />
                    </LinearGradient>
                  )}
                  {msg.role === "ai" ? (
                    <View style={{ flex: 1 }}>
                      <View style={[s.msgBubble, s.msgBubbleAi, { backgroundColor: colors.secondary }]}>
                        <Text style={[s.msgText, { color: colors.foreground }]}>{msg.text}</Text>
                      </View>
                      {msg.provider && (
                        <Text style={[s.msgMeta, { color: colors.mutedForeground }]}>via {msg.provider}</Text>
                      )}
                    </View>
                  ) : (
                    <LinearGradient colors={["#B8A0C8", "#88B8B0"]} style={[s.msgBubble, s.msgBubbleUser]}>
                      <Text style={[s.msgText, { color: "#fff" }]}>{msg.text}</Text>
                    </LinearGradient>
                  )}
                </View>
              ))}
              {aiBusy && (
                <View style={[s.msgRow, s.msgRowAi]}>
                  <LinearGradient colors={["#B8A0C8", "#88B8B0"]} style={s.msgAiAvatar}>
                    <Feather name="zap" size={12} color="#fff" />
                  </LinearGradient>
                  <View style={[s.msgBubble, s.msgBubbleAi, { backgroundColor: colors.secondary, flexDirection: "row", alignItems: "center", gap: 8 }]}>
                    <ActivityIndicator size="small" color={currentProvider.color} />
                    <Text style={[s.msgText, { color: colors.mutedForeground }]}>Thinking via {currentProvider.label}…</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Quick suggestions */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 14 }} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
              {["Who should I call first today?", "Which deals are at risk?", "Draft follow-up for Sara"].map(s2 => (
                <Pressable key={s2} onPress={() => setAiInput(s2)} style={[s.suggPill, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Text style={[s.suggText, { color: colors.mutedForeground }]}>{s2}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Input */}
            <View style={[s.chatInputRow, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
              <TextInput
                style={[s.chatInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Ask about your pipeline, leads…"
                placeholderTextColor={colors.mutedForeground}
                value={aiInput}
                onChangeText={setAiInput}
                onSubmitEditing={sendAi}
                returnKeyType="send"
              />
              <Pressable onPress={sendAi} disabled={!aiInput.trim()} style={({ pressed }) => [{ opacity: (!aiInput.trim() || pressed) ? 0.5 : 1 }]}>
                <LinearGradient colors={["#B8A0C8", "#88B8B0"]} style={s.sendBtn}>
                  <Feather name="send" size={16} color="#fff" />
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  stickyHeader: { paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  dateText: { fontFamily: "Inter_500Medium", fontSize: 11, letterSpacing: 0.3 },
  greeting: { fontFamily: "Inter_700Bold", fontSize: 24, marginTop: 2 },
  cmdLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12, marginTop: 2 },
  bellBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  badgeDot: { position: "absolute", top: 8, right: 9, width: 7, height: 7, borderRadius: 4 },
  tabScroll: { flexGrow: 0 },
  tabRow: { gap: 8, paddingBottom: 2 },
  tabPill: {},
  tabPillActive: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  tabPillInactive: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  tabLabelActive: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#fff" },
  tabLabelInactive: { fontFamily: "Inter_500Medium", fontSize: 13 },
  tabBadgeActive: { backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeInactive: { borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeText: { fontFamily: "Inter_700Bold", fontSize: 10, color: "#fff" },

  aiCard: { borderRadius: 20, borderWidth: 1, padding: 14, gap: 10 },
  aiPill: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  aiPillText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.8 },
  aiText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  aiBold: { fontFamily: "Inter_700Bold" },

  statCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 6 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statVal: { fontFamily: "Inter_700Bold", fontSize: 22 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 12 },

  reCard: { borderRadius: 20, borderWidth: 1, padding: 14 },
  reIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  reBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  reBadgeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 11 },
  reRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, padding: 10, marginBottom: 8 },
  reAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  reAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 },
  reName: { fontFamily: "Inter_700Bold", fontSize: 13 },
  reSub: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  sigPill: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2, marginTop: 4 },
  sigPillText: { fontFamily: "Inter_600SemiBold", fontSize: 9 },
  prioScore: { fontFamily: "Inter_700Bold", fontSize: 16 },
  prioLabel: { fontFamily: "Inter_400Regular", fontSize: 9 },

  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  sectionSub: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  link: { fontFamily: "Inter_600SemiBold", fontSize: 13 },

  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  rank: { fontFamily: "Inter_700Bold", fontSize: 14, width: 16 },
  contactName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  contactSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  scoreCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 2 },

  agendaRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12 },
  agendaTime: { fontFamily: "Inter_700Bold", fontSize: 11, width: 38, textAlign: "right", paddingTop: 2 },
  agendaDot: { width: 7, height: 7, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  agendaTitle: { fontFamily: "Inter_500Medium", fontSize: 12 },
  agendaStatus: { fontFamily: "Inter_700Bold", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 },

  slaCount: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  slaCard: { borderRadius: 14, borderWidth: 1, borderLeftWidth: 4, padding: 12 },
  slaName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  slaVal: { fontFamily: "Inter_700Bold", fontSize: 13 },
  slaDeal: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  slaRisk: { fontFamily: "Inter_500Medium", fontSize: 12 },

  sigCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 14, borderWidth: 1, padding: 12 },
  sigIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  sigTitle: { fontFamily: "Inter_700Bold", fontSize: 13 },
  sigContact: { fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 2 },
  sigAction: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  sigScore: { fontFamily: "Inter_700Bold", fontSize: 18, flexShrink: 0 },
  srcBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  srcText: { fontFamily: "Inter_500Medium", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5 },

  qaRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  qaIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontFamily: "Inter_500Medium", fontSize: 14, flex: 1 },

  tabPageTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  tabPageSub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 3 },
  progressLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  progTrack: { height: 6, borderRadius: 4, overflow: "hidden" },
  progFill: { height: "100%", borderRadius: 4 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  priorityLabel: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.5 },
  prioritySub: { fontFamily: "Inter_400Regular", fontSize: 11 },
  taskCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  taskLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, flex: 1 },
  taskMeta: { fontFamily: "Inter_400Regular", fontSize: 11 },

  insightCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 16, borderWidth: 1, borderLeftWidth: 4, padding: 14 },
  insightIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  insightTitle: { fontFamily: "Inter_700Bold", fontSize: 13, flex: 1 },
  insightTag: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  insightTagText: { fontFamily: "Inter_600SemiBold", fontSize: 9 },
  insightBody: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20, opacity: 0.8 },
  deepBtn: { borderRadius: 14, overflow: "hidden" },
  deepBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  deepBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  deepNote: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center" },

  chatContainer: { borderRadius: 20, borderWidth: 1, overflow: "hidden", minHeight: 500 },
  chatHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1 },
  chatAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  chatName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  chatStatus: { fontFamily: "Inter_400Regular", fontSize: 11 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  chatMessages: { maxHeight: 340 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowAi: { justifyContent: "flex-start" },
  msgRowUser: { justifyContent: "flex-end" },
  msgAiAvatar: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  msgBubble: { maxWidth: "80%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  msgBubbleAi: { borderBottomLeftRadius: 4 },
  msgBubbleUser: { borderBottomRightRadius: 4 },
  msgText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  suggPill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 6 },
  suggText: { fontFamily: "Inter_400Regular", fontSize: 11 },
  chatInputRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderTopWidth: 1 },
  chatInput: { flex: 1, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontFamily: "Inter_400Regular", fontSize: 13 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  msgMeta: { fontFamily: "Inter_500Medium", fontSize: 9, marginTop: 4, marginLeft: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  providerBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999, borderWidth: 1,
  },
  providerDot: { width: 8, height: 8, borderRadius: 4 },
  providerLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  providerMenu: { borderBottomWidth: 1, paddingVertical: 4 },
  providerOpt: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  providerOptText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 13 },
});
