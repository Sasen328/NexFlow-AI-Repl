import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/data/mockData";
import { dealHealth, initials, stageLabel, useContact, useContactActivities, useDeals } from "@/lib/api";

const TABS = ["Overview", "Activity", "Deals"] as const;

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

export default function ContactDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Overview");

  const contactQ = useContact(id);
  const activitiesQ = useContactActivities(id);
  const dealsQ = useDeals();
  const contact = contactQ.data;
  const activities = activitiesQ.data ?? [];
  const myDeals = (dealsQ.data?.deals ?? []).filter((d) => d.contact_id === id);
  const myPipeline = myDeals.reduce((s, d) => s + (d.value || 0), 0);
  const isBuying = (contact?.lead_score ?? 0) >= 80;

  if (contactQ.isPending) {
    return (
      <View
        style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator color={colors.mutedForeground} />
      </View>
    );
  }

  if (contactQ.isError) {
    return (
      <View
        style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 }}
      >
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
      <View
        style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", gap: 12 }}
      >
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Contact not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: "#88B8B0", fontFamily: "Inter_600SemiBold" }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero gradient */}
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
                {isBuying && (
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>HIGH INTENT</Text>
                  </View>
                )}
              </View>
              {contact.title ? <Text style={styles.heroTitle}>{contact.title}</Text> : null}
              {contact.company_name ? <Text style={styles.heroCompany}>{contact.company_name}</Text> : null}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.heroScore}>{contact.lead_score ?? 0}</Text>
              <Text style={styles.heroScoreLabel}>SCORE</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Action row */}
        <View style={[styles.actionRow, { backgroundColor: colors.background, marginTop: -22 }]}>
          {[
            { icon: "phone" as const, label: "Call", color: "#88B8B0", primary: true },
            { icon: "cpu" as const, label: "AI Voice", color: "#B8A0C8" },
            { icon: "mail" as const, label: "Email", color: "#C8A880" },
            { icon: "message-circle" as const, label: "Chat", color: "#7FB069" },
          ].map((a) => (
            <Pressable
              key={a.label}
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
        </View>

        {/* AI Next Action */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <View style={[styles.nextAction, { backgroundColor: "#B8A0C811", borderColor: "#B8A0C8" }]}>
            <View style={[styles.nextActionIcon, { backgroundColor: "#B8A0C8" }]}>
              <Feather name="zap" size={16} color="#fff" />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.nextActionLabel, { color: "#8C6FA8" }]}>AI-RECOMMENDED NEXT ACTION</Text>
              <Text style={[styles.nextActionText, { color: colors.foreground }]}>
                {isBuying
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

        {/* Tabs */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          {TABS.map((t) => {
            const active = t === activeTab;
            return (
              <Pressable key={t} onPress={() => setActiveTab(t)} style={styles.tab}>
                <Text style={[styles.tabText, { color: active ? "#88B8B0" : colors.mutedForeground }]}>{t}</Text>
                {active && <View style={styles.tabUnderline} />}
              </Pressable>
            );
          })}
        </View>

        <View style={{ padding: 16, gap: 12 }}>
          {activeTab === "Overview" && (
            <>
              <Card style={{ gap: 14 }}>
                <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>CONTACT</Text>
                {contact.email ? <Row icon="mail" label={contact.email} colors={colors} /> : null}
                {contact.phone ? <Row icon="phone" label={contact.phone} colors={colors} /> : null}
                {contact.company_name ? <Row icon="briefcase" label={contact.company_name} colors={colors} /> : null}
                {contact.tags && contact.tags.length > 0 ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                    {contact.tags.map((t) => (
                      <Badge key={t} label={`#${t}`} tone="neutral" small />
                    ))}
                  </View>
                ) : null}
              </Card>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <Card style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>PIPELINE</Text>
                  <Text style={[styles.cardBigValue, { color: "#88B8B0" }]}>{formatCurrency(myPipeline)}</Text>
                </Card>
                <Card style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>OPEN DEALS</Text>
                  <Text style={[styles.cardBigValue, { color: colors.foreground }]}>{myDeals.length}</Text>
                </Card>
              </View>

              {contact.notes ? (
                <Card style={{ gap: 8 }}>
                  <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>NOTES</Text>
                  <Text style={[styles.notesText, { color: colors.foreground }]}>{contact.notes}</Text>
                </Card>
              ) : null}
            </>
          )}

          {activeTab === "Activity" && (
            <Card style={{ gap: 12 }}>
              {activitiesQ.isPending ? (
                <ActivityIndicator color={colors.mutedForeground} />
              ) : activities.length === 0 ? (
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", textAlign: "center" }}>
                  No activity yet.
                </Text>
              ) : (
                activities.slice(0, 12).map((e, i) => {
                  const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
                    call: "phone",
                    email: "mail",
                    note: "edit-3",
                    meeting: "calendar",
                    sms: "message-circle",
                    whatsapp: "message-circle",
                  };
                  const colorMap: Record<string, string> = {
                    call: "#88B8B0",
                    email: "#B8A0C8",
                    note: "#C8A880",
                    meeting: "#7FB069",
                    sms: "#B8A0C8",
                    whatsapp: "#7FB069",
                  };
                  const ico = iconMap[e.type] || "activity";
                  const col = colorMap[e.type] || "#88B8B0";
                  return (
                    <View key={e.id || i} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                      <View style={[styles.timelineIcon, { backgroundColor: col + "22" }]}>
                        <Feather name={ico} size={14} color={col} />
                      </View>
                      <Text
                        style={[styles.timelineText, { color: colors.foreground, flex: 1 }]}
                        numberOfLines={2}
                      >
                        {e.title || e.body || e.type}
                      </Text>
                      <Text style={[styles.timelineTime, { color: colors.mutedForeground }]}>
                        {timeAgo(e.completed_at || e.created_at)}
                      </Text>
                    </View>
                  );
                })
              )}
            </Card>
          )}

          {activeTab === "Deals" && (
            <View style={{ gap: 10 }}>
              {dealsQ.isPending ? (
                <ActivityIndicator color={colors.mutedForeground} />
              ) : myDeals.length === 0 ? (
                <Card style={{ alignItems: "center", paddingVertical: 24 }}>
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>
                    No deals for this contact.
                  </Text>
                </Card>
              ) : (
                myDeals.map((d) => {
                  const health = dealHealth(d);
                  const tone = health === "hot" ? "success" : health === "warm" ? "gold" : "danger";
                  return (
                    <Card key={d.id} style={{ gap: 12 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={[styles.dealName, { color: colors.foreground, flex: 1 }]} numberOfLines={1}>
                          {d.title}
                        </Text>
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
                      <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                        <Badge label={stageLabel(d.stage).toUpperCase()} tone="violet" small />
                        <Badge label={`${d.probability}%`} tone="teal" small />
                        <Badge label={health.toUpperCase()} tone={tone as any} small />
                      </View>
                    </Card>
                  );
                })
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function Row({ icon, label, colors }: { icon: keyof typeof Feather.glyphMap; label: string; colors: any }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Feather name={icon} size={14} color={colors.mutedForeground} />
      <Text
        style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: colors.foreground, flex: 1 }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingBottom: 36, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  heroTop: { flexDirection: "row", alignItems: "center" },
  heroIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  heroAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 22 },
  heroName: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 22 },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  heroBadgeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.8 },
  heroTitle: { color: "rgba(255,255,255,0.92)", fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 2 },
  heroCompany: { color: "rgba(255,255,255,0.78)", fontFamily: "Inter_400Regular", fontSize: 12 },
  heroScore: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 28 },
  heroScoreLabel: { color: "rgba(255,255,255,0.78)", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1 },
  actionRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 4 },
  actionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  nextAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  nextActionIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  nextActionLabel: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.8 },
  nextActionText: { fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 18 },
  executeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  tabBar: { flexDirection: "row", marginTop: 16, paddingHorizontal: 16, borderBottomWidth: 1 },
  tab: { paddingVertical: 12, paddingHorizontal: 16, position: "relative" },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  tabUnderline: { position: "absolute", bottom: -1, left: 16, right: 16, height: 2, backgroundColor: "#88B8B0", borderRadius: 1 },
  cardKicker: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1 },
  cardBigValue: { fontFamily: "Inter_700Bold", fontSize: 20 },
  notesText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  timelineIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  timelineText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  timelineTime: { fontFamily: "Inter_400Regular", fontSize: 11 },
  dealName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  dealValue: { fontFamily: "Inter_700Bold", fontSize: 15 },
});
