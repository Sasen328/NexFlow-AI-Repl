import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ChameleonGradient } from "@/components/ui/ChameleonGradient";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/data/mockData";
import {
  apiFetch,
  dealHealth,
  initials,
  stageLabel,
  useCalls,
  useContact,
  useContactActivities,
  useContactLists,
  useContactOverview,
  useDeals,
  useLogCall,
  useProperties,
  usePropertyValues,
  useSignals,
  useUpsertPropertyValue,
} from "@/lib/api";

const TABS = ["Overview", "Engagement", "Calls", "Deals", "Network", "Enrichment"] as const;
type TabKey = (typeof TABS)[number];

const ENRICHMENT_SOURCES = [
  { name: "Lusha", color: "#9747FF", confidence: 98, fields: ["email", "phone", "title"] },
  { name: "Crunchbase", color: "#146AFF", confidence: 95, fields: ["funding", "investors"] },
  { name: "LinkedIn", color: "#0A66C2", confidence: 99, fields: ["title", "experience"] },
  { name: "Clay", color: "#FFB800", confidence: 92, fields: ["enrichment waterfall"] },
];

const TECH_STACK = [
  { name: "Salesforce", category: "CRM", since: "2019" },
  { name: "Slack", category: "Comms", since: "2020" },
  { name: "AWS", category: "Cloud", since: "2018" },
  { name: "Tableau", category: "BI", since: "2021" },
  { name: "Zoom", category: "Video", since: "2020" },
  { name: "Workday", category: "HR", since: "2022" },
];

const EXPERIENCE = [
  { role: "Managing Partner", company: "Gulf Ventures", period: "2020 — Present", current: true },
  { role: "Director of Investments", company: "SAMBA Capital", period: "2017 — 2020", current: false },
  { role: "VP, Strategic Investments", company: "Riyad Bank", period: "2014 — 2017", current: false },
];

const MUTUAL_CONNECTIONS = [
  { name: "Mohammed Al-Otaibi", initials: "MA", color: "#88B8B0", relationship: "Co-investors" },
  { name: "Fatima Khalid", initials: "FK", color: "#C8A880", relationship: "Conference speaker" },
  { name: "Tariq Bin-Laden", initials: "TB", color: "#B8B880", relationship: "Portfolio company" },
];

const BEHAVIORAL = [
  ["Email Open Rate", "87% (last 30d)"],
  ["Avg Response Time", "< 2 hours"],
  ["Preferred Time", "9–11 AM Riyadh"],
  ["Communication Style", "Direct, formal"],
  ["Best Channel", "WhatsApp Voice"],
  ["Decision Style", "Consensus-driven"],
];

const COSTS: Array<[string, string, string]> = [
  ["Lusha", "1 credit", "$0.20"],
  ["Crunchbase", "1 credit", "$0.50"],
  ["LinkedIn", "1 credit", "$0.10"],
  ["Clay waterfall", "2 credits", "$0.40"],
];

function timeAgo(iso: string | null | undefined) {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  return `${d}d ago`;
}

function formatDur(s: number | null | undefined) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function scoreColor(s: number) {
  return s >= 80 ? "#88B8B0" : s >= 60 ? "#B8B880" : "#C0A0B8";
}

function scoreLabel(s: number) {
  return s >= 80 ? "BUYING NOW" : s >= 60 ? "HIGH INTENT" : s >= 40 ? "EVALUATING" : "COLD";
}

export default function ContactDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>("Overview");
  const [logOpen, setLogOpen] = useState(false);

  const contactQ = useContact(id);
  const activitiesQ = useContactActivities(id);
  const dealsQ = useDeals();
  const callsQ = useCalls({ contact_id: id, limit: 20 });
  const signalsQ = useSignals({ contact_id: id, limit: 5 });
  const logCall = useLogCall();

  const contact = contactQ.data;
  const activities = activitiesQ.data ?? [];
  const calls = callsQ.data?.calls ?? [];
  const signals = signalsQ.data?.signals ?? [];
  const myDeals = (dealsQ.data?.deals ?? []).filter((d) => d.contact_id === id);
  const myPipeline = myDeals.reduce((s, d) => s + (d.value || 0), 0);

  if (contactQ.isPending) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.mutedForeground} />
      </View>
    );
  }

  if (contactQ.isError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 }}>
        <Feather name="wifi-off" size={28} color={colors.mutedForeground} />
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Couldn't reach the server</Text>
        <Pressable onPress={() => contactQ.refetch()}>
          <Text style={{ color: "#88B8B0", fontFamily: "Inter_600SemiBold" }}>Retry</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12 }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (!contact) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Contact not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: "#88B8B0", fontFamily: "Inter_600SemiBold" }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const score = contact.lead_score ?? 0;
  const intent = scoreColor(score);
  const intentLabel = scoreLabel(score);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={["#B8A0C8", "#88B8B0", "#C8A880"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.heroTop}>
            <Pressable onPress={() => router.back()} style={styles.heroIconBtn}>
              <Feather name="chevron-left" size={22} color="#fff" />
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable style={styles.heroIconBtn}>
              <Feather name="more-horizontal" size={20} color="#fff" />
            </Pressable>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 10 }}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>{initials(contact.first_name, contact.last_name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <Text style={styles.heroName}>
                  {contact.first_name} {contact.last_name}
                </Text>
                <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                  <Text style={styles.heroBadgeText}>{intentLabel}</Text>
                </View>
              </View>
              {contact.title ? <Text style={styles.heroTitle}>{contact.title}</Text> : null}
              {contact.company_name ? <Text style={styles.heroCompany}>{contact.company_name}</Text> : null}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.heroScore}>{score}</Text>
              <Text style={styles.heroScoreLabel}>SCORE</Text>
              <Text style={styles.heroPipeline}>{formatCurrency(myPipeline)} pipe</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Action row (scrollable) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.actionRow, { backgroundColor: colors.background, marginTop: -22 }]}
        >
          {[
            { icon: "phone" as const, label: "Call", color: "#88B8B0", primary: true },
            { icon: "cpu" as const, label: "AI Voice", color: "#B8A0C8" },
            { icon: "mail" as const, label: "Email", color: "#C8A880" },
            { icon: "message-circle" as const, label: "WhatsApp", color: "#7FB069" },
            { icon: "linkedin" as const, label: "LinkedIn", color: "#0A66C2" },
            { icon: "refresh-cw" as const, label: "Re-enrich", color: "#C8A880" },
          ].map((a) => (
            <Pressable
              key={a.label}
              onPress={a.label === "Call" ? () => setLogOpen(true) : undefined}
              style={({ pressed }) => [
                styles.actionBtn,
                {
                  backgroundColor: a.primary ? a.color : colors.card,
                  borderColor: a.primary ? a.color : colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather name={a.icon} size={18} color={a.primary ? "#fff" : a.color} />
              <Text style={[styles.actionLabel, { color: a.primary ? "#fff" : colors.foreground }]}>{a.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* AI Next Action */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <View style={[styles.nextAction, { backgroundColor: "#B8A0C811", borderColor: "#B8A0C8" }]}>
            <View style={[styles.nextActionIcon, { backgroundColor: "#B8A0C8" }]}>
              <Feather name="zap" size={16} color="#fff" />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.nextActionLabel, { color: "#8C6FA8" }]}>AI-RECOMMENDED NEXT ACTION</Text>
              <Text style={[styles.nextActionText, { color: colors.foreground }]}>
                {score >= 80
                  ? "Call within next 24h — high lead score signals strong intent"
                  : myDeals.length > 0
                    ? `Follow up on ${myDeals[0].title}`
                    : "Send intro email to open the conversation"}
              </Text>
            </View>
            <Pressable style={[styles.executeBtn, { backgroundColor: "#B8A0C8" }]}>
              <Feather name="arrow-right" size={14} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Tabs — chameleon active pill */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 14 }}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 6 }}
        >
          {TABS.map((t) => {
            const active = t === activeTab;
            const count = t === "Calls" ? calls.length : t === "Deals" ? myDeals.length : null;
            const label = `${t}${count != null ? ` (${count})` : ""}`;
            return (
              <Pressable key={t} onPress={() => setActiveTab(t)}>
                {active ? (
                  <ChameleonGradient
                    radius={12}
                    style={{ paddingHorizontal: 14, paddingVertical: 8 }}
                  >
                    <Text style={[styles.tabPillText, { color: "#FFFFFF" }]}>{label}</Text>
                  </ChameleonGradient>
                ) : (
                  <View
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 12,
                      backgroundColor: colors.muted,
                    }}
                  >
                    <Text
                      style={[
                        styles.tabPillText,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ padding: 16, gap: 12 }}>
          {activeTab === "Overview" && (
            <OverviewTab
              colors={colors}
              contact={contact}
              activities={activities}
              calls={calls}
              myDeals={myDeals}
              myPipeline={myPipeline}
              signals={signals}
              contactId={id!}
            />
          )}

          {activeTab === "Engagement" && (
            <EngagementTab colors={colors} activities={activities} calls={calls} />
          )}

          {activeTab === "Calls" && (
            <CallsTab colors={colors} calls={calls} contact={contact} onStartCall={() => setLogOpen(true)} />
          )}

          {activeTab === "Deals" && (
            <DealsTab colors={colors} loading={dealsQ.isPending} deals={myDeals} />
          )}

          {activeTab === "Network" && (
            <NetworkTab colors={colors} contact={contact} />
          )}

          {activeTab === "Enrichment" && (
            <EnrichmentTab colors={colors} />
          )}
        </View>
      </ScrollView>

      <QuickLogSheet
        visible={logOpen}
        onClose={() => setLogOpen(false)}
        contactName={`${contact.first_name} ${contact.last_name}`.trim()}
        submitting={logCall.isPending}
        error={logCall.error ? (logCall.error as Error).message : null}
        onSubmit={async (payload) => {
          try {
            const result = await logCall.mutateAsync({ contact_id: id!, ...payload });
            setLogOpen(false);
            setActiveTab("Calls");
            activitiesQ.refetch();
            callsQ.refetch();
            return result;
          } catch {
            return null;
          }
        }}
      />
    </>
  );
}

// ── Overview tab ────────────────────────────────────────────────────────────
function OverviewTab({
  colors, contact, activities, calls, myDeals, myPipeline, signals, contactId,
}: any) {
  return (
    <>
      {/* Contact card */}
      <Card style={{ gap: 10 }}>
        <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>CONTACT</Text>
        {contact.email ? <Row icon="mail" label={contact.email} colors={colors} verified /> : null}
        {contact.phone ? <Row icon="phone" label={contact.phone} colors={colors} verified /> : null}
        {contact.company_name ? <Row icon="briefcase" label={contact.company_name} colors={colors} /> : null}
        <Row icon="linkedin" label="linkedin.com/in/profile" colors={colors} verified />
        {contact.tags && contact.tags.length > 0 ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
            {contact.tags.map((t: string) => (
              <Badge key={t} label={`#${t}`} tone="neutral" small />
            ))}
          </View>
        ) : null}
      </Card>

      {/* List memberships */}
      <ContactListsCard contactId={contactId} colors={colors} />

      {/* Custom properties */}
      <CustomPropertiesCard entityId={contactId} objectType="contact" colors={colors} />

      {/* AI Overview */}
      <ContactAIOverview contactId={contactId} colors={colors} />

      {/* 3 stat tiles */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Card style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>PIPELINE</Text>
          <Text style={[styles.cardBigValue, { color: "#88B8B0" }]}>{formatCurrency(myPipeline)}</Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{myDeals.length} deals</Text>
        </Card>
        <Card style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>ENGAGEMENT</Text>
          <Text style={[styles.cardBigValue, { color: "#B8A0C8" }]}>{activities.length + calls.length}</Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{calls.length}c · {activities.length}a</Text>
        </Card>
        <Card style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>LAST</Text>
          <Text style={[styles.cardBigValue, { color: colors.foreground }]}>
            {activities[0]?.created_at ? timeAgo(activities[0].created_at).replace(" ago", "") : "—"}
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>contact</Text>
        </Card>
      </View>

      {/* Mutual Connections */}
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Feather name="users" size={12} color={colors.mutedForeground} />
          <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>MUTUAL CONNECTIONS</Text>
        </View>
        {MUTUAL_CONNECTIONS.map((m) => (
          <View key={m.name} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: m.color, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 11 }}>{m.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>{m.name}</Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 10 }}>{m.relationship}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Buying Signals */}
      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Feather name="zap" size={12} color="#B8B880" />
          <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>BUYING SIGNALS · 30D</Text>
        </View>
        {(signals.length > 0 ? signals : [
          { id: "s1", title: "Closed $50M Series B", body: "Crunchbase · 1d ago", score: 96 },
          { id: "s2", title: "Hiring 12 sales roles", body: "LinkedIn · 5d ago", score: 88 },
          { id: "s3", title: "Visited pricing page 4x", body: "Web tracking · 2d ago", score: 82 },
        ]).map((s: any) => (
          <View key={s.id} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 12, backgroundColor: "#B8B88012", borderWidth: 1, borderColor: "#B8B88033" }}>
            <Feather name="zap" size={12} color="#B8B880" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>{s.title}</Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 10 }}>{s.body || ""}</Text>
            </View>
            <Text style={{ color: "#B8B880", fontFamily: "Inter_700Bold", fontSize: 13 }}>{s.score}</Text>
          </View>
        ))}
      </Card>

      {/* Experience */}
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Feather name="briefcase" size={14} color={colors.mutedForeground} />
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>Experience</Text>
        </View>
        {EXPERIENCE.map((e) => (
          <View key={e.role} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <View style={{
              width: 8, height: 8, borderRadius: 4, marginTop: 6,
              backgroundColor: e.current ? "#88B8B0" : colors.mutedForeground + "55",
            }} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>{e.role}</Text>
                {e.current && <Badge label="CURRENT" tone="success" small />}
              </View>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11 }}>
                {e.company} · {e.period}
              </Text>
            </View>
          </View>
        ))}
        <View style={{ paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border, gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather name="award" size={12} color={colors.mutedForeground} />
            <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 12 }}>MBA · Wharton</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather name="globe" size={12} color={colors.mutedForeground} />
            <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 12 }}>Arabic · English · French</Text>
          </View>
        </View>
      </Card>

      {/* Tech stack */}
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Feather name="code" size={14} color={colors.mutedForeground} />
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
            Tech Stack — {contact.company_name || "Company"}
          </Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {TECH_STACK.map((t) => (
            <View key={t.name} style={{
              paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
              backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border,
            }}>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 11 }}>{t.name}</Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 9 }}>
                {t.category} · {t.since}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {contact.notes ? (
        <Card style={{ gap: 6 }}>
          <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>NOTES</Text>
          <Text style={[styles.notesText, { color: colors.foreground }]}>{contact.notes}</Text>
        </Card>
      ) : null}
    </>
  );
}

// ── Engagement tab ──────────────────────────────────────────────────────────
function EngagementTab({ colors, activities, calls }: any) {
  return (
    <>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Feather name="activity" size={14} color={colors.mutedForeground} />
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>Activity Timeline</Text>
        </View>
        {activities.length === 0 ? (
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12 }}>No activities yet</Text>
        ) : (
          activities.slice(0, 12).map((a: any) => {
            const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
              call: "phone", email: "mail", note: "edit-3", meeting: "calendar",
              sms: "message-circle", whatsapp: "message-circle",
            };
            const colorMap: Record<string, string> = {
              call: "#88B8B0", email: "#B8A0C8", note: "#C8A880",
              meeting: "#7FB069", sms: "#B8A0C8", whatsapp: "#7FB069",
            };
            const ico = iconMap[a.type] || "activity";
            const col = colorMap[a.type] || "#88B8B0";
            return (
              <View key={a.id} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                <View style={[styles.timelineIcon, { backgroundColor: col + "22" }]}>
                  <Feather name={ico} size={14} color={col} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 12 }} numberOfLines={1}>
                    {a.title || a.type}
                  </Text>
                  {a.body ? (
                    <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11 }} numberOfLines={2}>
                      {a.body}
                    </Text>
                  ) : null}
                  {a.status ? (
                    <View style={{ marginTop: 4 }}>
                      <Badge label={a.status.toUpperCase()} tone={a.status === "completed" ? "success" : "gold"} small />
                    </View>
                  ) : null}
                </View>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 10 }}>
                  {timeAgo(a.completed_at || a.created_at)}
                </Text>
              </View>
            );
          })
        )}
      </Card>

      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Feather name="phone" size={14} color={colors.mutedForeground} />
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>Call History</Text>
        </View>
        {calls.length === 0 ? (
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12 }}>No calls yet</Text>
        ) : (
          calls.slice(0, 8).map((c: any) => (
            <View key={c.id} style={{ padding: 10, borderRadius: 12, backgroundColor: colors.muted }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 12, textTransform: "capitalize" }}>
                  {c.direction || "—"} · {c.outcome || "completed"}
                </Text>
                {c.score != null && (
                  <Text style={{ color: "#88B8B0", fontFamily: "Inter_700Bold", fontSize: 12 }}>{c.score}/100</Text>
                )}
              </View>
              {(c.summary || c.ai_insights?.summary) ? (
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 4 }} numberOfLines={2}>
                  {c.summary || c.ai_insights?.summary}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </Card>
    </>
  );
}

// ── Calls tab (expandable rows w/ scorecard, transcript, post-call actions) ─
function CallsTab({ colors, calls, contact, onStartCall }: any) {
  return (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>Call History</Text>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11 }}>
            {calls.length} call{calls.length !== 1 ? "s" : ""} · tap any call for details
          </Text>
        </View>
        <Pressable
          onPress={onStartCall}
          style={({ pressed }) => ({
            paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "#88B8B0",
            flexDirection: "row", alignItems: "center", gap: 6, opacity: pressed ? 0.7 : 1,
          })}
        >
          <Feather name="mic" size={14} color="#fff" />
          <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 }}>Log Call</Text>
        </Pressable>
      </View>

      {calls.length === 0 ? (
        <Card style={{ alignItems: "center", paddingVertical: 28, gap: 10 }}>
          <Feather name="phone" size={28} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13 }}>No calls logged yet</Text>
          <Pressable
            onPress={onStartCall}
            style={({ pressed }) => ({
              paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: "#88B8B0",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 }}>Log first call</Text>
          </Pressable>
        </Card>
      ) : (
        calls.map((c: any) => (
          <CallRow key={c.id} call={c} contact={contact} colors={colors} />
        ))
      )}
    </>
  );
}

function CallRow({ call, contact, colors }: any) {
  const [expanded, setExpanded] = useState(false);
  const [loadingSc, setLoadingSc] = useState(false);
  const [scorecard, setScorecard] = useState<any>(call.ai_insights?.dimensions ? call.ai_insights : null);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [postDone, setPostDone] = useState<string[]>([]);

  const sCol = call.call_score != null ? scoreColor(call.call_score) : "#88B8B0";
  const dirIcon: keyof typeof Feather.glyphMap = call.direction === "inbound" ? "phone-incoming" : "phone-outgoing";

  async function analyze() {
    setLoadingSc(true);
    try {
      const sc = await apiFetch("/calls/scorecard", {
        method: "POST",
        body: JSON.stringify({
          call_id: call.id,
          contact_name: `${contact.first_name ?? ""} ${contact.last_name ?? ""}`,
          outcome: call.status,
        }),
      });
      setScorecard(sc);
    } finally {
      setLoadingSc(false);
    }
  }

  async function saveNote() {
    if (!note.trim()) return;
    await apiFetch(`/calls/${call.id}/note`, {
      method: "POST",
      body: JSON.stringify({ note, contact_id: contact.id }),
    });
    setNoteSaved(true);
    setNote("");
    setTimeout(() => setNoteSaved(false), 2000);
  }

  async function trigger(type: "whatsapp" | "email") {
    if (postDone.includes(type)) return;
    setPostDone((p) => [...p, type]);
    await apiFetch("/activities", {
      method: "POST",
      body: JSON.stringify({
        type,
        title: type === "whatsapp" ? "WhatsApp follow-up" : "Follow-up email drafted",
        body: type === "whatsapp"
          ? `Hi ${contact.first_name ?? ""}! Great speaking with you. I'll follow up with the details we discussed.`
          : `Hi ${contact.first_name ?? ""},\n\nThank you for your time.`,
        contact_id: contact.id,
        status: "completed",
        completed_at: new Date().toISOString(),
        metadata: { source: "post_call_action", call_id: call.id },
      }),
    });
  }

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <Pressable onPress={() => setExpanded((e) => !e)} style={{ padding: 12, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: sCol + "22", alignItems: "center", justifyContent: "center" }}>
          <Feather name={dirIcon} size={14} color={sCol} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13, textTransform: "capitalize" }}>
            {call.direction || "—"} · {call.status || "completed"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
            <Feather name="clock" size={10} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11 }}>
              {formatDur(call.duration_seconds)}
              {call.started_at ? ` · ${new Date(call.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}
            </Text>
          </View>
        </View>
        {call.call_score != null && (
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: sCol, fontFamily: "Inter_700Bold", fontSize: 18 }}>{Math.round(call.call_score)}</Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 9 }}>SCORE</Text>
          </View>
        )}
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
      </Pressable>

      {expanded && (
        <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: colors.border, gap: 12 }}>
          {call.transcript ? (
            <View>
              <Text style={[styles.cardKicker, { color: colors.mutedForeground, marginBottom: 6 }]}>TRANSCRIPT</Text>
              <View style={{ backgroundColor: colors.muted, padding: 10, borderRadius: 10, maxHeight: 160 }}>
                <ScrollView nestedScrollEnabled>
                  <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16 }}>
                    {call.transcript}
                  </Text>
                </ScrollView>
              </View>
            </View>
          ) : null}

          {call.ai_insights?.summary ? (
            <View style={{ padding: 10, borderRadius: 12, backgroundColor: "#B8A0C815", borderWidth: 1, borderColor: "#B8A0C833" }}>
              <Text style={{ color: "#B8A0C8", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>
                AI SUMMARY
              </Text>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 12 }}>
                {call.ai_insights.summary}
              </Text>
            </View>
          ) : null}

          {call.coaching_notes ? (
            <View>
              <Text style={[styles.cardKicker, { color: colors.mutedForeground, marginBottom: 6 }]}>NOTES</Text>
              <View style={{ backgroundColor: colors.muted, padding: 10, borderRadius: 10 }}>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16 }}>
                  {call.coaching_notes}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Scorecard */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>CALL SCORECARD</Text>
              {!scorecard && (
                <Pressable
                  onPress={analyze}
                  disabled={loadingSc}
                  style={({ pressed }) => ({
                    flexDirection: "row", alignItems: "center", gap: 4,
                    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: "#B8A0C8",
                    opacity: loadingSc || pressed ? 0.7 : 1,
                  })}
                >
                  {loadingSc ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="cpu" size={11} color="#fff" />}
                  <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 11 }}>
                    {loadingSc ? "Analyzing…" : "Analyze"}
                  </Text>
                </Pressable>
              )}
            </View>
            {scorecard ? (
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 11 }}>Overall</Text>
                  <Text style={{ color: scoreColor(scorecard.overall ?? 0), fontFamily: "Inter_700Bold", fontSize: 22 }}>
                    {scorecard.overall ?? "—"}<Text style={{ color: colors.mutedForeground, fontSize: 11 }}>/100</Text>
                  </Text>
                </View>
                {(scorecard.dimensions ?? []).map((d: any) => (
                  <View key={d.name} style={{ gap: 4 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 11 }}>
                        {d.icon ? `${d.icon} ` : ""}{d.name}
                      </Text>
                      <Text style={{ color: scoreColor(d.score), fontFamily: "Inter_700Bold", fontSize: 11 }}>{d.score}</Text>
                    </View>
                    <View style={{ height: 5, borderRadius: 3, backgroundColor: colors.muted, overflow: "hidden" }}>
                      <View style={{ height: "100%", width: `${d.score}%`, backgroundColor: scoreColor(d.score) }} />
                    </View>
                    {d.feedback ? (
                      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 10 }}>{d.feedback}</Text>
                    ) : null}
                  </View>
                ))}
                {scorecard.next_best_action ? (
                  <View style={{ padding: 10, borderRadius: 10, backgroundColor: "#B8A0C815", borderWidth: 1, borderColor: "#B8A0C833" }}>
                    <Text style={{ color: "#B8A0C8", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1 }}>NEXT BEST ACTION</Text>
                    <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 3 }}>
                      {scorecard.next_best_action}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              !loadingSc && <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11 }}>
                Tap Analyze to generate a multi-dimension scorecard.
              </Text>
            )}
          </View>

          {/* Post-call actions */}
          <View>
            <Text style={[styles.cardKicker, { color: colors.mutedForeground, marginBottom: 6 }]}>POST-CALL ACTIONS</Text>
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              {[
                { type: "whatsapp" as const, icon: "message-circle" as const, label: "WhatsApp", color: "#7FB069" },
                { type: "email" as const, icon: "mail" as const, label: "Draft email", color: "#B8A0C8" },
              ].map((a) => {
                const done = postDone.includes(a.type);
                return (
                  <Pressable
                    key={a.type}
                    onPress={() => trigger(a.type)}
                    style={({ pressed }) => ({
                      flexDirection: "row", alignItems: "center", gap: 5,
                      paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
                      borderWidth: 1, borderColor: done ? "#88B8B055" : colors.border,
                      backgroundColor: done ? "#88B8B015" : colors.muted,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Feather name={done ? "check-circle" : a.icon} size={11} color={done ? "#88B8B0" : a.color} />
                    <Text style={{ color: done ? "#88B8B0" : colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 11 }}>
                      {done ? "Pushed" : a.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Add note */}
          <View>
            <Text style={[styles.cardKicker, { color: colors.mutedForeground, marginBottom: 6 }]}>PUSH NOTE TO PROFILE</Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add note about this call…"
                placeholderTextColor={colors.mutedForeground}
                style={{
                  flex: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10,
                  backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border,
                  color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 11,
                }}
              />
              <Pressable
                onPress={saveNote}
                disabled={!note.trim()}
                style={({ pressed }) => ({
                  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
                  backgroundColor: noteSaved ? "#88B8B0" : "#B8A0C8",
                  opacity: !note.trim() || pressed ? 0.5 : 1,
                  alignItems: "center", justifyContent: "center",
                })}
              >
                <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 11 }}>
                  {noteSaved ? "✓" : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </Card>
  );
}

// ── Deals tab ──────────────────────────────────────────────────────────────
function DealsTab({ colors, loading, deals }: any) {
  if (loading) {
    return <ActivityIndicator color={colors.mutedForeground} />;
  }
  if (deals.length === 0) {
    return (
      <Card style={{ alignItems: "center", paddingVertical: 28, gap: 10 }}>
        <Feather name="dollar-sign" size={28} color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13 }}>
          No deals associated yet
        </Text>
      </Card>
    );
  }
  return (
    <>
      {deals.map((d: any) => {
        const health = dealHealth(d);
        const tone = health === "hot" ? "success" : health === "warm" ? "gold" : "danger";
        return (
          <Card key={d.id} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 14, flex: 1 }} numberOfLines={1}>
                {d.title}
              </Text>
              <Text style={{ color: "#88B8B0", fontFamily: "Inter_700Bold", fontSize: 14 }}>{formatCurrency(d.value)}</Text>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.muted, overflow: "hidden" }}>
              <View style={{ height: "100%", width: `${Math.max(0, Math.min(100, d.probability))}%`, backgroundColor: "#B8A0C8" }} />
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
              <Badge label={stageLabel(d.stage).toUpperCase()} tone="violet" small />
              <Badge label={`${d.probability}%`} tone="teal" small />
              <Badge label={health.toUpperCase()} tone={tone as any} small />
            </View>
          </Card>
        );
      })}
    </>
  );
}

// ── Network tab — mutual connections & relationship graph ─────────────────
function NetworkTab({ colors, contact }: any) {
  const company = contact?.company_name ?? "their company";
  const mutuals = [
    {
      name: "Khalid Al-Sayed",
      role: "VP Engineering · Aramco",
      relation: "Worked together 2019",
      strength: 92,
    },
    {
      name: "Layla Al-Suwaidi",
      role: "CFO · Mada Bank",
      relation: "Mutual board contact",
      strength: 78,
    },
    {
      name: "Omar Al-Harbi",
      role: "Head of Sales · STC",
      relation: "Met at LEAP 2024",
      strength: 64,
    },
  ];
  const stack = [
    { name: "Salesforce", category: "CRM", since: "2019" },
    { name: "Snowflake", category: "Data Warehouse", since: "2022" },
    { name: "Slack", category: "Comms", since: "2020" },
    { name: "DocuSign", category: "eSignature", since: "2021" },
  ];
  return (
    <>
      <GlassCard padded>
        <Text style={[styles.cardKicker, { color: "#7A5C9E", marginBottom: 8 }]}>
          MUTUAL CONNECTIONS
        </Text>
        {mutuals.map((m, i) => (
          <View
            key={m.name}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 12,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: colors.border,
            }}
          >
            <ChameleonGradient
              radius={20}
              style={{
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 12 }}>
                {m.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </Text>
            </ChameleonGradient>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                {m.name}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 }}>
                {m.role}
              </Text>
              <Text style={{ color: "#7A5C9E", fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 2 }}>
                {m.relation}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: "rgba(136,184,176,0.18)",
              }}
            >
              <Text style={{ color: "#4F8B82", fontFamily: "Inter_700Bold", fontSize: 11 }}>
                {m.strength}
              </Text>
            </View>
          </View>
        ))}
      </GlassCard>

      <GlassCard padded>
        <Text style={[styles.cardKicker, { color: "#7A5C9E", marginBottom: 8 }]}>
          {company.toUpperCase()} · TECH STACK
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {stack.map((s) => (
            <View
              key={s.name}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: colors.muted,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
                {s.name}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 2 }}>
                {s.category} · since {s.since}
              </Text>
            </View>
          ))}
        </View>
      </GlassCard>

      <GlassCard padded>
        <Text style={[styles.cardKicker, { color: "#7A5C9E", marginBottom: 8 }]}>
          RELATIONSHIP INSIGHTS
        </Text>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 }}>
          You share <Text style={{ fontFamily: "Inter_700Bold" }}>3 strong mutuals</Text> with {company}. Khalid Al-Sayed has a 92 strength score and previously
          championed a similar deal — consider asking for a warm intro.
        </Text>
      </GlassCard>
    </>
  );
}

// ── Enrichment tab ─────────────────────────────────────────────────────────
function EnrichmentTab({ colors }: any) {
  return (
    <>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather name="database" size={14} color="#C8A880" />
            <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>Data Sources</Text>
          </View>
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11 }}>2h ago</Text>
        </View>
        {ENRICHMENT_SOURCES.map((s) => (
          <View key={s.name} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 12, backgroundColor: colors.muted }}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: s.color, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 }}>{s.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>{s.name}</Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 10 }}>{s.fields.join(" · ")}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: s.confidence >= 95 ? "#88B8B0" : "#B8B880", fontFamily: "Inter_700Bold", fontSize: 13 }}>
                {s.confidence}%
              </Text>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 9 }}>conf</Text>
            </View>
          </View>
        ))}
      </Card>

      <Card style={{ gap: 10 }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>Behavioral Profile</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {BEHAVIORAL.map(([k, v]) => (
            <View key={k} style={{ width: "50%", paddingVertical: 6, paddingRight: 6 }}>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.8 }}>
                {k.toUpperCase()}
              </Text>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 3 }}>{v}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={{ gap: 8 }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>Enrichment Cost</Text>
        {COSTS.map(([s, c, p]) => (
          <View key={s} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 12, flex: 1 }}>{s}</Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, width: 70, textAlign: "right" }}>{c}</Text>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 12, width: 50, textAlign: "right" }}>{p}</Text>
          </View>
        ))}
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 8 }}>
          <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 12 }}>Total this month</Text>
          <Text style={{ color: "#88B8B0", fontFamily: "Inter_700Bold", fontSize: 13 }}>$1.20</Text>
        </View>
        <Pressable
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
            paddingVertical: 10, borderRadius: 12, backgroundColor: "#B8A0C8",
            marginTop: 4, opacity: pressed ? 0.7 : 1,
          })}
        >
          <Feather name="refresh-cw" size={12} color="#fff" />
          <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 }}>Run Full Re-Enrichment</Text>
        </Pressable>
      </Card>
    </>
  );
}

// ── Subcards ───────────────────────────────────────────────────────────────
function ContactListsCard({ contactId, colors }: { contactId: string; colors: any }) {
  const { data, isLoading } = useContactLists(contactId);
  const lists = data?.lists ?? [];
  return (
    <Card style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Feather name="list" size={12} color="#88B8B0" />
        <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>LIST MEMBERSHIPS</Text>
      </View>
      {isLoading ? (
        <View style={{ height: 22, borderRadius: 6, backgroundColor: colors.muted }} />
      ) : lists.length === 0 ? (
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11 }}>
          Not in any list yet.
        </Text>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {lists.map((l: any) => (
            <View key={l.id} style={{
              flexDirection: "row", alignItems: "center", gap: 5,
              paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
              backgroundColor: colors.muted,
            }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: l.color || "#B8A0C8" }} />
              <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 11 }}>{l.name}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

function CustomPropertiesCard({ entityId, objectType, colors }: { entityId: string; objectType: string; colors: any }) {
  const { data: propsData } = useProperties(objectType);
  const { data: valuesData } = usePropertyValues(entityId);
  const upsert = useUpsertPropertyValue();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");

  const properties = propsData?.properties ?? [];
  const values = valuesData?.values ?? [];
  const valueMap = new Map<string, any>(values.map((v) => [v.property_id, v.value]));

  function startEdit(propId: string, current: any) {
    setEditing(propId);
    setDraft(current == null ? "" : typeof current === "string" ? current : Array.isArray(current) ? current.join(", ") : String(current));
  }
  async function save(propId: string, type: string) {
    let parsed: any = draft;
    if (type === "number") parsed = draft === "" ? null : Number(draft);
    if (type === "boolean") parsed = draft === "true";
    if (type === "multiselect") parsed = draft.split(",").map((s) => s.trim()).filter(Boolean);
    await upsert.mutateAsync({ property_id: propId, entity_id: entityId, value: parsed });
    setEditing(null);
  }

  return (
    <Card style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Feather name="settings" size={12} color="#C8A880" />
        <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>CUSTOM PROPERTIES</Text>
      </View>
      {properties.length === 0 ? (
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11 }}>
          No custom properties defined.
        </Text>
      ) : (
        properties.map((p) => {
          const v = valueMap.get(p.id);
          const isEditing = editing === p.id;
          return (
            <View key={p.id} style={{ paddingTop: 6 }}>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.8 }}>
                {p.label.toUpperCase()}
              </Text>
              {isEditing ? (
                <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    autoFocus
                    style={{
                      flex: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
                      backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border,
                      color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 12,
                    }}
                  />
                  <Pressable
                    onPress={() => save(p.id, p.type)}
                    disabled={upsert.isPending}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: "#88B8B0" }}
                  >
                    <Feather name="check" size={14} color="#fff" />
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => startEdit(p.id, v)}>
                  <Text style={{
                    color: v == null || v === "" ? colors.mutedForeground : colors.foreground,
                    fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 3,
                    fontStyle: v == null || v === "" ? "italic" : "normal",
                  }}>
                    {v == null || v === "" ? "+ set value" : Array.isArray(v) ? v.join(", ") : String(v)}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })
      )}
    </Card>
  );
}

function ContactAIOverview({ contactId, colors }: { contactId: string; colors: any }) {
  const overview = useContactOverview();
  const data: any = overview.data;

  if (!data && !overview.isPending) {
    return (
      <Card style={{ borderColor: "#B8A0C855", borderWidth: 1, gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: "#B8A0C8", alignItems: "center", justifyContent: "center" }}>
            <Feather name="zap" size={16} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#B8A0C8", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1 }}>AI ANALYSIS</Text>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 2 }}>
              Generate AI overview, risks, and next actions.
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => overview.mutate(contactId)}
          style={({ pressed }) => ({
            paddingVertical: 10, borderRadius: 12, backgroundColor: "#B8A0C8",
            alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Feather name="zap" size={12} color="#fff" />
          <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 }}>Run analysis</Text>
        </Pressable>
      </Card>
    );
  }

  if (overview.isPending) {
    return (
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <ActivityIndicator color="#B8A0C8" />
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12 }}>
            AI is analyzing engagement, signals, pipeline…
          </Text>
        </View>
      </Card>
    );
  }

  const recs = data?.recommendations ?? [];
  const strengths = data?.strengths ?? [];
  const risks = data?.risks ?? [];
  const eng = data?.engagement_score ?? 0;

  return (
    <Card style={{ borderColor: "#B8A0C855", borderWidth: 1, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: "#B8A0C8", alignItems: "center", justifyContent: "center" }}>
            <Feather name="zap" size={13} color="#fff" />
          </View>
          <View>
            <Text style={{ color: "#B8A0C8", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1 }}>AI OVERVIEW</Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 10 }}>
              Engagement: <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold" }}>{eng}</Text>
            </Text>
          </View>
        </View>
        <Pressable onPress={() => overview.mutate(contactId)}>
          <Feather name="refresh-cw" size={14} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {data?.summary ? (
        <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17 }}>
          {data.summary}
        </Text>
      ) : null}

      {strengths.length > 0 ? (
        <View style={{ gap: 4 }}>
          <Text style={{ color: "#88B8B0", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.8 }}>STRENGTHS</Text>
          {strengths.map((s: string, i: number) => (
            <View key={i} style={{ flexDirection: "row", gap: 6 }}>
              <Feather name="check-circle" size={11} color="#88B8B0" style={{ marginTop: 2 }} />
              <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 11, flex: 1 }}>{s}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {risks.length > 0 ? (
        <View style={{ gap: 4 }}>
          <Text style={{ color: "#C8A880", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.8 }}>RISKS</Text>
          {risks.map((s: string, i: number) => (
            <View key={i} style={{ flexDirection: "row", gap: 6 }}>
              <Feather name="alert-circle" size={11} color="#C8A880" style={{ marginTop: 2 }} />
              <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 11, flex: 1 }}>{s}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {recs.length > 0 ? (
        <View style={{ gap: 6 }}>
          <Text style={{ color: "#B8A0C8", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.8 }}>RECOMMENDED ACTIONS</Text>
          {recs.map((r: any, i: number) => (
            <View key={i} style={{ padding: 8, borderRadius: 10, backgroundColor: colors.muted, gap: 3 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Badge
                  label={(r.priority ?? "med").toUpperCase()}
                  tone={r.priority === "high" ? "gold" : r.priority === "medium" ? "violet" : "neutral"}
                  small
                />
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 11, flex: 1 }} numberOfLines={1}>
                  {r.title}
                </Text>
              </View>
              {r.rationale ? (
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 10 }} numberOfLines={2}>
                  {r.rationale}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

// ── Quick log sheet ────────────────────────────────────────────────────────
type QuickLogPayload = {
  outcome: "connected" | "no_answer" | "voicemail" | "wrong_number";
  notes: string;
  duration_seconds: number;
};

function QuickLogSheet({
  visible, onClose, contactName, submitting, error, onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  contactName: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (p: QuickLogPayload) => Promise<any>;
}) {
  const colors = useColors();
  const [outcome, setOutcome] = useState<QuickLogPayload["outcome"]>("connected");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState(180);

  const outcomes: { key: QuickLogPayload["outcome"]; label: string; color: string }[] = [
    { key: "connected", label: "Connected", color: "#7FB069" },
    { key: "voicemail", label: "Voicemail", color: "#C8A880" },
    { key: "no_answer", label: "No Answer", color: "#B8A0C8" },
    { key: "wrong_number", label: "Wrong #", color: "#D88A8A" },
  ];
  const durations = [60, 180, 300, 600];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
              padding: 20, paddingBottom: 32, gap: 14,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>
            <View>
              <Text style={[sheetStyles.kicker, { color: "#88B8B0" }]}>LOG A CALL</Text>
              <Text style={[sheetStyles.title, { color: colors.foreground }]} numberOfLines={1}>
                {contactName || "Contact"}
              </Text>
              <Text style={[sheetStyles.sub, { color: colors.mutedForeground }]}>
                AI will polish your notes and queue next-best actions.
              </Text>
            </View>

            <View>
              <Text style={[sheetStyles.fieldLabel, { color: colors.mutedForeground }]}>OUTCOME</Text>
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {outcomes.map((o) => {
                  const active = outcome === o.key;
                  return (
                    <Pressable
                      key={o.key}
                      onPress={() => setOutcome(o.key)}
                      style={{
                        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
                        backgroundColor: active ? o.color : colors.muted,
                        borderWidth: 1, borderColor: active ? o.color : colors.border,
                      }}
                    >
                      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: active ? "#fff" : colors.foreground }}>
                        {o.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View>
              <Text style={[sheetStyles.fieldLabel, { color: colors.mutedForeground }]}>DURATION</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                {durations.map((d) => {
                  const active = duration === d;
                  const label = d < 60 ? `${d}s` : d < 3600 ? `${Math.round(d / 60)}m` : `${Math.round(d / 3600)}h`;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => setDuration(d)}
                      style={{
                        flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center",
                        backgroundColor: active ? "#88B8B0" : colors.muted,
                        borderWidth: 1, borderColor: active ? "#88B8B0" : colors.border,
                      }}
                    >
                      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, color: active ? "#fff" : colors.foreground }}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View>
              <Text style={[sheetStyles.fieldLabel, { color: colors.mutedForeground }]}>NOTES</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Quick brain-dump — AI will structure it..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                style={{
                  marginTop: 8, minHeight: 90, borderRadius: 14, borderWidth: 1,
                  borderColor: colors.border, padding: 12, color: colors.foreground,
                  fontFamily: "Inter_400Regular", fontSize: 13, textAlignVertical: "top",
                }}
              />
            </View>

            {error ? (
              <Text style={{ color: "#D88A8A", fontFamily: "Inter_500Medium", fontSize: 12 }}>{error}</Text>
            ) : null}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <Pressable
                onPress={onClose}
                disabled={submitting}
                style={{
                  flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: "center",
                  backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border,
                }}
              >
                <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Cancel</Text>
              </Pressable>
              <Pressable
                disabled={submitting}
                onPress={() => onSubmit({ outcome, notes, duration_seconds: duration })}
                style={{
                  flex: 2, paddingVertical: 14, borderRadius: 14, alignItems: "center",
                  flexDirection: "row", justifyContent: "center", gap: 8,
                  backgroundColor: "#88B8B0", opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="zap" size={14} color="#fff" />}
                <Text style={{ fontFamily: "Inter_700Bold", color: "#fff" }}>
                  {submitting ? "Saving…" : "Save with AI"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

function Row({ icon, label, colors, verified }: { icon: keyof typeof Feather.glyphMap; label: string; colors: any; verified?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Feather name={icon} size={14} color={colors.mutedForeground} />
      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: colors.foreground, flex: 1 }} numberOfLines={1}>
        {label}
      </Text>
      {verified ? <Feather name="check-circle" size={12} color="#88B8B0" /> : null}
    </View>
  );
}

const sheetStyles = StyleSheet.create({
  kicker: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1 },
  title: { fontFamily: "Inter_700Bold", fontSize: 20, marginTop: 2 },
  sub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 },
  fieldLabel: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1 },
});

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingBottom: 36, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  heroTop: { flexDirection: "row", alignItems: "center" },
  heroIconBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  heroAvatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.4)",
  },
  heroAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 22 },
  heroName: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 22 },
  heroBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  heroBadgeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.8 },
  heroTitle: { color: "rgba(255,255,255,0.92)", fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 2 },
  heroCompany: { color: "rgba(255,255,255,0.78)", fontFamily: "Inter_400Regular", fontSize: 12 },
  heroScore: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 28 },
  heroScoreLabel: { color: "rgba(255,255,255,0.78)", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1 },
  heroPipeline: { color: "rgba(255,255,255,0.78)", fontFamily: "Inter_500Medium", fontSize: 10, marginTop: 2 },
  actionRow: { gap: 8, paddingHorizontal: 16 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 4, minWidth: 86 },
  actionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  nextAction: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1,
  },
  nextActionIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  nextActionLabel: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.8 },
  nextActionText: { fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 18 },
  executeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  tabPillText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  cardKicker: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1 },
  cardBigValue: { fontFamily: "Inter_700Bold", fontSize: 18 },
  cardSub: { fontFamily: "Inter_400Regular", fontSize: 10 },
  notesText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  timelineIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
