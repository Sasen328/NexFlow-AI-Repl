import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CONTACTS, formatCurrency } from "@/data/mockData";

const TABS = ["Overview", "Activity", "Deals", "Enrich"] as const;

export default function ContactDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Overview");

  const contact = CONTACTS.find((c) => c.id === id);

  if (!contact) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Contact not found</Text>
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
              <Text style={styles.heroAvatarText}>{contact.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <Text style={styles.heroName}>{contact.firstName} {contact.lastName}</Text>
                {contact.stage === "buying-now" && (
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>BUYING NOW</Text>
                  </View>
                )}
              </View>
              <Text style={styles.heroTitle}>{contact.title}</Text>
              <Text style={styles.heroCompany}>{contact.company}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.heroScore}>{contact.leadScore}</Text>
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
              <Text
                style={[
                  styles.actionLabel,
                  { color: a.primary ? "#fff" : colors.foreground },
                ]}
              >
                {a.label}
              </Text>
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
                Call within next 24h — {contact.signals[0] ?? "high intent signal active"}
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
                <Row icon="mail" label={contact.email} colors={colors} />
                <Row icon="phone" label={contact.phone} colors={colors} />
                <Row icon="map-pin" label={contact.location} colors={colors} />
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {contact.tags.map((t) => (
                    <Badge key={t} label={`#${t}`} tone="neutral" small />
                  ))}
                </View>
              </Card>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <Card style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>PIPELINE</Text>
                  <Text style={[styles.cardBigValue, { color: "#88B8B0" }]}>{formatCurrency(contact.pipelineValue)}</Text>
                </Card>
                <Card style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>LAST CONTACT</Text>
                  <Text style={[styles.cardBigValue, { color: colors.foreground }]}>{contact.lastContactDays}d</Text>
                </Card>
              </View>

              <Card style={{ gap: 10 }}>
                <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>BUYING SIGNALS · 30D</Text>
                {contact.signals.map((s, i) => (
                  <View key={i} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                    <Feather name="trending-up" size={14} color="#C8A880" style={{ marginTop: 2 }} />
                    <Text style={[styles.signalLine, { color: colors.foreground }]}>{s}</Text>
                  </View>
                ))}
              </Card>

              <Card style={{ gap: 8 }}>
                <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>NOTES</Text>
                <Text style={[styles.notesText, { color: colors.foreground }]}>{contact.notes}</Text>
              </Card>
            </>
          )}

          {activeTab === "Activity" && (
            <Card style={{ gap: 12 }}>
              {[
                { icon: "phone" as const, text: "Discovery call · 18 min", time: `${contact.lastContactDays}d ago`, color: "#88B8B0" },
                { icon: "mail" as const, text: "Proposal sent", time: "5d ago", color: "#B8A0C8" },
                { icon: "message-circle" as const, text: "WhatsApp · pricing question", time: "8d ago", color: "#7FB069" },
                { icon: "user-plus" as const, text: "Imported from Lusha", time: "21d ago", color: "#C8A880" },
              ].map((e, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                  <View style={[styles.timelineIcon, { backgroundColor: e.color + "22" }]}>
                    <Feather name={e.icon} size={14} color={e.color} />
                  </View>
                  <Text style={[styles.timelineText, { color: colors.foreground, flex: 1 }]}>{e.text}</Text>
                  <Text style={[styles.timelineTime, { color: colors.mutedForeground }]}>{e.time}</Text>
                </View>
              ))}
            </Card>
          )}

          {activeTab === "Deals" && (
            <Card style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={[styles.dealName, { color: colors.foreground }]}>{contact.company} Expansion</Text>
                <Text style={[styles.dealValue, { color: "#88B8B0" }]}>{formatCurrency(contact.pipelineValue)}</Text>
              </View>
              <View style={{ height: 6, backgroundColor: colors.muted, borderRadius: 3, overflow: "hidden" }}>
                <View style={{ height: "100%", width: "78%", backgroundColor: "#B8A0C8" }} />
              </View>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <Badge label="NEGOTIATION" tone="violet" small />
                <Badge label="78% PROBABILITY" tone="teal" small />
                <Badge label="CLOSE MAY 12" tone="gold" small />
              </View>
            </Card>
          )}

          {activeTab === "Enrich" && (
            <View style={{ gap: 10 }}>
              {[
                { source: "Lusha", confidence: 96, cost: "$0.18", color: "#88B8B0" },
                { source: "Crunchbase", confidence: 92, cost: "$0.06", color: "#C8A880" },
                { source: "LinkedIn", confidence: 88, cost: "free", color: "#B8A0C8" },
                { source: "Clay Waterfall", confidence: 94, cost: "$0.22", color: "#7FB069" },
              ].map((s) => (
                <Card key={s.source} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={[styles.sourceDot, { backgroundColor: s.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sourceName, { color: colors.foreground }]}>{s.source}</Text>
                    <Text style={[styles.sourceMeta, { color: colors.mutedForeground }]}>
                      {s.confidence}% confidence · {s.cost}
                    </Text>
                  </View>
                  <Feather name="check-circle" size={16} color={s.color} />
                </Card>
              ))}
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
      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: colors.foreground, flex: 1 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingBottom: 36, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  heroTop: { flexDirection: "row", alignItems: "center" },
  heroIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.18)" },
  heroAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" },
  heroAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 22 },
  heroName: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 22 },
  heroBadge: { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  heroBadgeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.8 },
  heroTitle: { color: "rgba(255,255,255,0.92)", fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 2 },
  heroCompany: { color: "rgba(255,255,255,0.78)", fontFamily: "Inter_400Regular", fontSize: 12 },
  heroScore: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 28 },
  heroScoreLabel: { color: "rgba(255,255,255,0.78)", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1 },
  actionRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 4 },
  actionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  nextAction: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
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
  signalLine: { fontFamily: "Inter_500Medium", fontSize: 13, flex: 1 },
  notesText: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19 },
  timelineIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  timelineText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  timelineTime: { fontFamily: "Inter_400Regular", fontSize: 11 },
  dealName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  dealValue: { fontFamily: "Inter_700Bold", fontSize: 15 },
  sourceDot: { width: 10, height: 10, borderRadius: 5 },
  sourceName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  sourceMeta: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
});
