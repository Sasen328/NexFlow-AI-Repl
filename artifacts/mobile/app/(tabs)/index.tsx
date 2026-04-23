import React from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { StatTile } from "@/components/ui/StatTile";
import { formatCurrency, getTimeOfDay } from "@/data/mockData";
import {
  initials,
  useDashboardSummary,
  useSignalSummary,
  useTopContacts,
} from "@/lib/api";

export default function BriefingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tod = getTimeOfDay();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const summary = useDashboardSummary();
  const top = useTopContacts(3);
  const signals = useSignalSummary();

  const top3 = top.data ?? [];
  const totalPipeline = summary.data?.pipeline_value ?? 0;
  const callsToday = summary.data?.calls_today ?? 0;
  const hotSignals = signals.data?.new ?? 0;
  const activeSignals = signals.data?.total ?? 0;
  const openDeals = summary.data?.open_deals ?? 0;
  const topSignal = signals.data?.top_signals?.[0];

  const tap = (route: string) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.push(route as any);
  };

  const loading = summary.isPending || top.isPending;

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
          {hotSignals > 0 && <View style={[styles.badgeDot, { backgroundColor: "#B8A0C8" }]} />}
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
          {loading ? (
            <Text style={styles.aiText}>Loading your day…</Text>
          ) : (
            <Text style={styles.aiText}>
              You have <Text style={styles.aiBold}>{top3.length} high-intent prospects</Text> ready for outreach today,
              with a combined pipeline of <Text style={styles.aiBold}>{formatCurrency(totalPipeline)}</Text>.
              {topSignal ? (
                <>
                  {" "}The most urgent signal: <Text style={styles.aiBold}>{topSignal.contact_name || topSignal.company_name || "a top account"}</Text>
                  {" — "}{topSignal.title}.
                </>
              ) : null}
              {" "}You have <Text style={styles.aiBold}>{openDeals} open deals</Text> in flight and{" "}
              <Text style={styles.aiBold}>{activeSignals} active signals</Text> tracking right now.
            </Text>
          )}
        </View>
      </LinearGradient>

      {/* Stats row */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <StatTile icon="phone" value={String(callsToday)} label="Calls today" tone="teal" />
        <StatTile icon="zap" value={String(hotSignals)} label="New signals" tone="gold" />
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <StatTile icon="cpu" value={String(openDeals)} label="Open deals" tone="violet" />
        <StatTile icon="alert-triangle" value={String(activeSignals)} label="Signals tracked" tone="danger" />
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
        {top.isPending ? (
          <View style={{ paddingVertical: 32, alignItems: "center" }}>
            <ActivityIndicator color={colors.mutedForeground} />
          </View>
        ) : top3.length === 0 ? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>No contacts yet.</Text>
          </View>
        ) : (
          top3.map((c, i) => (
            <Pressable
              key={c.id}
              onPress={() => tap(`/contact/${c.id}`)}
              style={({ pressed }) => [
                styles.contactRow,
                {
                  borderBottomColor: colors.border,
                  borderBottomWidth: i < top3.length - 1 ? 1 : 0,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <Text style={[styles.contactRank, { color: colors.mutedForeground }]}>{i + 1}</Text>
              <Avatar initials={initials(c.first_name, c.last_name)} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactName, { color: colors.foreground }]}>
                  {c.first_name} {c.last_name}
                </Text>
                <Text style={[styles.contactSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {c.title || "—"}
                  {c.company_name ? ` · ${c.company_name}` : ""}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <View style={[styles.scoreCircle, { borderColor: "#B8A0C8" }]}>
                  <Text style={{ fontFamily: "Inter_700Bold", fontSize: 11, color: "#8C6FA8" }}>
                    {c.lead_score ?? 0}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </Card>

      {summary.isError || top.isError ? (
        <Text style={{ color: "#E07474", fontFamily: "Inter_500Medium", fontSize: 12, textAlign: "center" }}>
          Couldn't reach the server. Pull to refresh later.
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center" },
  dateText: { fontFamily: "Inter_500Medium", fontSize: 12, letterSpacing: 0.4 },
  greeting: { fontFamily: "Inter_700Bold", fontSize: 24, marginTop: 2 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeDot: { position: "absolute", top: 9, right: 10, width: 8, height: 8, borderRadius: 4 },
  aiCard: { borderRadius: 22, padding: 1.5 },
  aiCardInner: { backgroundColor: "rgba(28,26,36,0.92)", borderRadius: 21, padding: 16, gap: 12 },
  aiBadgeRow: { flexDirection: "row" },
  aiPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
  },
  aiPillText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.8 },
  aiText: { color: "#fff", fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  aiBold: { fontFamily: "Inter_700Bold" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  linkText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  contactRank: { fontFamily: "Inter_700Bold", fontSize: 14, width: 18 },
  contactName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  contactSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  scoreCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
});
