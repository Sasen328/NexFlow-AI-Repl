import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
import { StatTile } from "@/components/ui/StatTile";
import { formatCurrency, getTimeOfDay } from "@/data/mockData";
import {
  initials,
  useDashboardSummary,
  useSignalSummary,
  useTopContacts,
  useForgottenLeads,
} from "@/lib/api";

const RE_ENGAGEMENT_SIGNALS = ["Wealth signal", "Job change", "Site visits", "Email opens", "Follow-up missed"];

export default function CommandCenterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tod = getTimeOfDay();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

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

  const tap = (route: string) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    router.push(route as any);
  };

  const loading = summary.isPending || top.isPending;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
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
          <Text style={[styles.subtitle, { color: colors.violet }]}>Daily Command Center</Text>
        </View>
        <Pressable
          style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => tap("/notifications")}
        >
          <Feather name="bell" size={18} color={colors.foreground} />
          {hotSignals > 0 && <View style={[styles.badgeDot, { backgroundColor: colors.violet }]} />}
        </Pressable>
      </View>

      {/* AI Briefing card — light pastel version */}
      <LinearGradient
        colors={["#f4eeff", "#eaf7f5", "#fff8ee"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.aiCard, { borderColor: colors.border }]}
      >
        <View style={styles.aiCardInner}>
          <View style={styles.aiBadgeRow}>
            <LinearGradient
              colors={["#B8A0C8", "#88B8B0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.aiPill}
            >
              <Feather name="zap" size={10} color="#fff" />
              <Text style={styles.aiPillText}>YOUR AI DAILY BRIEFING</Text>
            </LinearGradient>
          </View>
          {loading ? (
            <Text style={[styles.aiText, { color: colors.mutedForeground }]}>Loading your day…</Text>
          ) : (
            <Text style={[styles.aiText, { color: colors.foreground }]}>
              You have{" "}
              <Text style={[styles.aiBold, { color: colors.violet }]}>{top3.length} high-intent prospects</Text>{" "}
              ready for outreach today, combined pipeline{" "}
              <Text style={[styles.aiBold, { color: colors.teal }]}>{formatCurrency(totalPipeline)}</Text>.
              {topSignal ? (
                <>
                  {" "}Most urgent:{" "}
                  <Text style={[styles.aiBold, { color: colors.foreground }]}>
                    {topSignal.contact_name || topSignal.company_name || "a top account"}
                  </Text>
                  {" — "}{topSignal.title}.
                </>
              ) : null}
              {" "}You have{" "}
              <Text style={[styles.aiBold, { color: colors.foreground }]}>{openDeals} open deals</Text> in flight.
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
        <StatTile icon="activity" value={String(activeSignals)} label="Signals tracked" tone="danger" />
      </View>

      {/* Re-Engagement Opportunities */}
      {reEngagementLeads.length > 0 && (
        <View>
          <LinearGradient
            colors={["#fffbf0", "#f9f3ff", "#f0f9f8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.reEngageCard, { borderColor: "rgba(200,168,128,0.3)" }]}
          >
            <View style={styles.reEngageHeader}>
              <View style={[styles.reEngageIconBox, { backgroundColor: "rgba(200,168,128,0.2)" }]}>
                <Feather name="clock" size={14} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.reEngageTitle, { color: colors.foreground }]}>
                  Re-Engagement Opportunities
                </Text>
                <Text style={[styles.reEngageSub, { color: colors.mutedForeground }]}>
                  No contact ≥90 days + high-value signal
                </Text>
              </View>
              <View style={[styles.reEngageBadge, { backgroundColor: colors.gold }]}>
                <Text style={styles.reEngageBadgeText}>{reEngagementLeads.length}</Text>
              </View>
            </View>

            <View style={{ gap: 8, marginTop: 12 }}>
              {reEngagementLeads.slice(0, 3).map((lead: any, i: number) => {
                const signal = RE_ENGAGEMENT_SIGNALS[i % RE_ENGAGEMENT_SIGNALS.length];
                const priority = Math.round(Number(lead.lead_score) * 0.9 + 5);
                return (
                  <Pressable
                    key={lead.id}
                    onPress={() => tap(`/contact/${lead.id}`)}
                    style={({ pressed }) => [
                      styles.reEngageRow,
                      { backgroundColor: "rgba(255,255,255,0.7)", borderColor: "rgba(200,168,128,0.2)", opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <LinearGradient
                      colors={["#C8A880", "#B8A0C8"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.reEngageAvatar}
                    >
                      <Text style={styles.reEngageAvatarText}>
                        {(lead.first_name?.[0] ?? "") + (lead.last_name?.[0] ?? "")}
                      </Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.reEngageName, { color: colors.foreground }]}>
                        {lead.first_name} {lead.last_name}
                      </Text>
                      <Text style={[styles.reEngageCompany, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {lead.company_name ?? "—"} · silent {Math.round(Number(lead.days_silent))}d
                      </Text>
                      <View style={[styles.signalPill, { backgroundColor: "rgba(200,168,128,0.15)" }]}>
                        <Text style={[styles.signalPillText, { color: colors.gold }]}>{signal}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={[styles.priorityScore, { color: colors.gold }]}>{priority}</Text>
                      <Text style={[styles.priorityLabel, { color: colors.mutedForeground }]}>priority</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Top 3 to Call */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Feather name="target" size={16} color={colors.violet} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Top 3 to Call</Text>
        </View>
        <Pressable onPress={() => tap("/contacts")}>
          <Text style={[styles.linkText, { color: colors.teal }]}>All →</Text>
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
                <View style={[styles.scoreCircle, { borderColor: colors.violet }]}>
                  <Text style={{ fontFamily: "Inter_700Bold", fontSize: 11, color: colors.violet }}>
                    {c.lead_score ?? 0}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </Card>

      {/* Hot Signals */}
      {topSignal && (
        <View>
          <View style={[styles.sectionHeader, { marginBottom: 8 }]}>
            <View style={styles.sectionTitleRow}>
              <Feather name="zap" size={16} color={colors.gold} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Hot Signal</Text>
            </View>
          </View>
          <LinearGradient
            colors={["#fffff0", "#f8fff6"]}
            style={[styles.signalCard, { borderColor: "rgba(184,184,128,0.3)" }]}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
              <View style={[styles.signalIcon, { backgroundColor: "rgba(184,184,128,0.2)" }]}>
                <Feather name="zap" size={16} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.signalTitle, { color: colors.foreground }]}>{topSignal.title}</Text>
                <Text style={[styles.signalContact, { color: colors.violet }]}>
                  {topSignal.contact_name || topSignal.company_name}
                </Text>
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: colors.violet }]}
                  onPress={() => tap("/contacts")}
                >
                  <Text style={styles.actionBtnText}>Take action →</Text>
                </Pressable>
              </View>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Quick Actions */}
      <View>
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 10 }]}>Quick Actions</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[
            { icon: "phone", label: "Start Call", color: colors.teal, route: "/contacts" },
            { icon: "mail", label: "Email", color: colors.violet, route: "/contacts" },
            { icon: "message-square", label: "WhatsApp", color: colors.teal, route: "/contacts" },
            { icon: "users", label: "Find Leads", color: colors.gold, route: "/sourcing" },
          ].map((a) => (
            <Pressable
              key={a.label}
              onPress={() => tap(a.route)}
              style={({ pressed }) => [styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${a.color}20` }]}>
                <Feather name={a.icon as any} size={18} color={a.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {summary.isError || top.isError ? (
        <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium", fontSize: 12, textAlign: "center" }}>
          Couldn't reach the server. Pull to refresh later.
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start" },
  dateText: { fontFamily: "Inter_500Medium", fontSize: 12, letterSpacing: 0.4 },
  greeting: { fontFamily: "Inter_700Bold", fontSize: 26, marginTop: 2 },
  subtitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginTop: 2 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  badgeDot: {
    position: "absolute", top: 9, right: 10, width: 8, height: 8, borderRadius: 4,
  },

  aiCard: {
    borderRadius: 22, borderWidth: 1, padding: 16,
  },
  aiCardInner: { gap: 10 },
  aiBadgeRow: { flexDirection: "row" },
  aiPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999,
  },
  aiPillText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.8 },
  aiText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  aiBold: { fontFamily: "Inter_700Bold" },

  reEngageCard: {
    borderRadius: 20, borderWidth: 1, padding: 14,
  },
  reEngageHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  reEngageIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  reEngageTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  reEngageSub: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  reEngageBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  reEngageBadgeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 11 },
  reEngageRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1, padding: 10,
  },
  reEngageAvatar: {
    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
  },
  reEngageAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 },
  reEngageName: { fontFamily: "Inter_700Bold", fontSize: 13 },
  reEngageCompany: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  signalPill: {
    alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2, marginTop: 4,
  },
  signalPillText: { fontFamily: "Inter_600SemiBold", fontSize: 9 },
  priorityScore: { fontFamily: "Inter_700Bold", fontSize: 16 },
  priorityLabel: { fontFamily: "Inter_400Regular", fontSize: 9 },

  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  linkText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },

  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  contactRank: { fontFamily: "Inter_700Bold", fontSize: 14, width: 18 },
  contactName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  contactSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  scoreCircle: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center", borderWidth: 2,
  },

  signalCard: { borderRadius: 16, borderWidth: 1, padding: 14 },
  signalIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  signalTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  signalContact: { fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 2 },
  actionBtn: {
    alignSelf: "flex-start", marginTop: 8,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  actionBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 12 },

  quickActionBtn: {
    flex: 1, borderRadius: 14, borderWidth: 1,
    padding: 12, alignItems: "center", gap: 6,
  },
  quickActionIcon: {
    width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  quickActionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, textAlign: "center" },
});
