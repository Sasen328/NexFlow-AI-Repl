import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { StatTile } from "@/components/ui/StatTile";
import { CONTACTS, SIGNALS, DEALS, formatCurrency, getTimeOfDay } from "@/data/mockData";

export default function BriefingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tod = getTimeOfDay();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const top3 = [...CONTACTS].sort((a, b) => b.leadScore - a.leadScore).slice(0, 3);
  const atRisk = DEALS.filter((d) => d.health === "at-risk");
  const totalPipeline = top3.reduce((sum, c) => sum + c.pipelineValue, 0);

  const tap = (route: string) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.push(route as any);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
        paddingBottom: 120,
        paddingHorizontal: 16,
        gap: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.dateText, { color: colors.mutedForeground }]}>{today} · Riyadh</Text>
          <Text style={[styles.greeting, { color: colors.foreground }]}>{tod.label}, Admin</Text>
        </View>
        <Pressable
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => tap("/notifications")}
        >
          <Feather name="bell" size={18} color={colors.foreground} />
          <View style={[styles.badgeDot, { backgroundColor: "#B8A0C8" }]} />
        </Pressable>
      </View>

      {/* AI Briefing card */}
      <LinearGradient
        colors={["#B8A0C8", "#88B8B0", "#C8A880"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiCard}
      >
        <View style={styles.aiCardInner}>
          <View style={styles.aiBadgeRow}>
            <View style={styles.aiPill}>
              <Feather name="zap" size={11} color="#fff" />
              <Text style={styles.aiPillText}>YOUR AI DAILY BRIEFING</Text>
            </View>
          </View>
          <Text style={styles.aiText}>
            You have <Text style={styles.aiBold}>3 high-intent prospects</Text> ready for outreach today, with a combined
            pipeline of <Text style={styles.aiBold}>{formatCurrency(totalPipeline)}</Text>. The most urgent is{" "}
            <Text style={styles.aiBold}>Sara Al-Mansouri</Text> — Gulf Ventures closed a $50M Series B last night, opening
            a 24-hour expansion window. <Text style={styles.aiBold}>2 deals are at risk</Text> and need a touch this week.
            Your AI Voice Agent handled <Text style={styles.aiBold}>12 conversations</Text> overnight — 4 qualified leads
            added.
          </Text>
        </View>
      </LinearGradient>

      {/* Stats row */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <StatTile icon="phone" value="5" label="Calls today" tone="teal" />
        <StatTile icon="zap" value="3" label="Hot signals" tone="gold" />
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <StatTile icon="cpu" value="12" label="AI sessions" tone="violet" />
        <StatTile icon="alert-triangle" value="2" label="At-risk" tone="danger" />
      </View>

      {/* Top 3 to Call */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Feather name="target" size={16} color="#B8A0C8" />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Top 3 to Call</Text>
        </View>
        <Pressable onPress={() => tap("/contacts")}>
          <Text style={[styles.linkText, { color: "#88B8B0" }]}>All</Text>
        </Pressable>
      </View>

      <Card padded={false}>
        {top3.map((c, i) => (
          <Pressable
            key={c.id}
            onPress={() => tap(`/contact/${c.id}`)}
            style={({ pressed }) => [
              styles.contactRow,
              { borderBottomColor: colors.border, borderBottomWidth: i < top3.length - 1 ? 1 : 0, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.contactRank, { color: colors.mutedForeground }]}>{i + 1}</Text>
            <Avatar initials={c.initials} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.contactName, { color: colors.foreground }]}>{c.firstName} {c.lastName}</Text>
              <Text style={[styles.contactSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                {c.title} · {c.company}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <Text style={[styles.contactValue, { color: "#88B8B0" }]}>{formatCurrency(c.pipelineValue)}</Text>
              <View style={[styles.scoreChip, { backgroundColor: "#B8A0C822" }]}>
                <Text style={[styles.scoreChipText, { color: "#8C6FA8" }]}>{c.leadScore}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </Card>

      {/* Hot Signals */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Feather name="zap" size={16} color="#C8A880" />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Hot Signals · 24h</Text>
        </View>
      </View>
      <View style={{ gap: 10 }}>
        {SIGNALS.slice(0, 3).map((s) => (
          <Card key={s.id} style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
            <View style={[styles.signalIcon, { backgroundColor: "#C8A88022" }]}>
              <Feather name="trending-up" size={16} color="#A07F4D" />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.signalTitle, { color: colors.foreground }]} numberOfLines={2}>
                {s.title}
              </Text>
              <Text style={[styles.signalSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                {s.contact} · {s.description}
              </Text>
              <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                <Badge label={s.source} tone="gold" small />
                <Badge label={`Intent ${s.intent}`} tone="teal" small />
                <Text style={[styles.signalTime, { color: colors.mutedForeground }]}>{s.hoursAgo}h ago</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* At-Risk */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Feather name="alert-triangle" size={16} color="#E07474" />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>At-Risk Deals</Text>
        </View>
      </View>
      <View style={{ gap: 10 }}>
        {atRisk.map((d) => (
          <Card key={d.id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={[styles.signalIcon, { backgroundColor: "#E0747422" }]}>
              <Feather name="alert-circle" size={16} color="#B85454" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.signalTitle, { color: colors.foreground }]}>{d.contact}</Text>
              <Text style={[styles.signalSub, { color: colors.mutedForeground }]}>{d.name}</Text>
            </View>
            <Text style={[styles.contactValue, { color: "#E07474" }]}>{formatCurrency(d.value)}</Text>
          </Card>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Feather name="grid" size={16} color={colors.mutedForeground} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        {[
          { icon: "phone" as const, label: "Call", color: "#88B8B0" },
          { icon: "mail" as const, label: "Email", color: "#B8A0C8" },
          { icon: "message-circle" as const, label: "WhatsApp", color: "#7FB069" },
          { icon: "search" as const, label: "Source", color: "#C8A880" },
        ].map((a) => (
          <Pressable
            key={a.label}
            onPress={() => tap(a.label === "Source" ? "/sourcing" : "/contacts")}
            style={({ pressed }) => [
              styles.qaBtn,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <View style={[styles.qaIcon, { backgroundColor: a.color + "22" }]}>
              <Feather name={a.icon} size={18} color={a.color} />
            </View>
            <Text style={[styles.qaLabel, { color: colors.foreground }]}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  dateText: { fontFamily: "Inter_500Medium", fontSize: 12, letterSpacing: 0.3 },
  greeting: { fontFamily: "Inter_700Bold", fontSize: 26, marginTop: 2 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", borderWidth: 1, position: "relative" },
  badgeDot: { position: "absolute", top: 10, right: 11, width: 8, height: 8, borderRadius: 4 },
  aiCard: { borderRadius: 22, padding: 1.5 },
  aiCardInner: { backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 20.5, padding: 16, gap: 10 },
  aiBadgeRow: { flexDirection: "row" },
  aiPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "#B8A0C8" },
  aiPillText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 9.5, letterSpacing: 1 },
  aiText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21, color: "#1C1A24" },
  aiBold: { fontFamily: "Inter_700Bold", color: "#1C1A24" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  linkText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 12 },
  contactRank: { fontFamily: "Inter_700Bold", fontSize: 14, width: 16 },
  contactName: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  contactSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  contactValue: { fontFamily: "Inter_700Bold", fontSize: 13 },
  scoreChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  scoreChipText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  signalIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  signalTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  signalSub: { fontFamily: "Inter_400Regular", fontSize: 12 },
  signalTime: { fontFamily: "Inter_400Regular", fontSize: 11, marginLeft: 4 },
  qaBtn: { flexBasis: "47%", flexGrow: 1, padding: 14, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 8 },
  qaIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
