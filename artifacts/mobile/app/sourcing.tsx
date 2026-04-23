import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { PROSPECTS } from "@/data/mockData";

const PROVIDERS = [
  { name: "Lusha", credits: 4820, color: "#88B8B0" },
  { name: "Apollo", credits: 12000, color: "#B8A0C8" },
  { name: "Clay", credits: 850, color: "#C8A880" },
  { name: "Crunchbase", credits: 5000, color: "#7FB069" },
  { name: "ZoomInfo", credits: 1240, color: "#E6A971" },
  { name: "RocketReach", credits: 600, color: "#88B8B0" },
];

export default function SourcingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="chevron-left" size={20} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: colors.mutedForeground }]}>SOURCING</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Find Prospects</Text>
          </View>
          <Pressable style={[styles.iconBtn, { backgroundColor: "#B8A0C8" }]}>
            <Feather name="zap" size={16} color="#fff" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {/* Providers row */}
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 10 }]}>Connected providers</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {PROVIDERS.map((p) => (
                <View key={p.name} style={[styles.providerChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.providerDot, { backgroundColor: p.color }]} />
                  <Text style={[styles.providerName, { color: colors.foreground }]}>{p.name}</Text>
                  <Text style={[styles.providerCredits, { color: colors.mutedForeground }]}>
                    {p.credits.toLocaleString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Clay waterfall */}
          <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={[styles.waterfallIcon, { backgroundColor: "#88B8B022" }]}>
              <Feather name="filter" size={18} color="#88B8B0" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.waterfallTitle, { color: colors.foreground }]}>Clay Waterfall</Text>
              <Text style={[styles.waterfallSub, { color: colors.mutedForeground }]}>
                Email + Phone, fallback across 8 providers
              </Text>
            </View>
            <View style={[styles.toggle, { backgroundColor: "#88B8B0" }]}>
              <View style={[styles.toggleDot, { right: 3 }]} />
            </View>
          </Card>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Discovered · {PROSPECTS.length}</Text>
            <Text style={[styles.linkText, { color: "#88B8B0" }]}>Filters</Text>
          </View>

          {PROSPECTS.map((p) => {
            const isSelected = selected.has(p.id);
            return (
              <Pressable
                key={p.id}
                onPress={() => toggle(p.id)}
                style={({ pressed }) => [
                  styles.prospectCard,
                  {
                    backgroundColor: isSelected ? "#88B8B011" : colors.card,
                    borderColor: isSelected ? "#88B8B0" : colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Avatar initials={p.initials} size={44} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.pName, { color: colors.foreground }]}>{p.name}</Text>
                  <Text style={[styles.pSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {p.title} · {p.company}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 2 }}>
                    <Badge label={p.industry} tone="violet" small />
                    <Badge label={p.fundingStage} tone="gold" small />
                    <Badge label={p.source} tone="teal" small />
                  </View>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <View style={[styles.intentChip, { backgroundColor: "#C8A88022" }]}>
                    <Text style={[styles.intentText, { color: "#A07F4D" }]}>{p.intent}</Text>
                  </View>
                  <Text style={[styles.confText, { color: colors.mutedForeground }]}>{p.confidence}% conf</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {selected.size > 0 && (
          <View style={[styles.actionBar, { backgroundColor: colors.foreground, bottom: insets.bottom + 16 }]}>
            <Text style={[styles.actionBarText, { color: "#fff" }]}>
              {selected.size} selected
            </Text>
            <Pressable style={[styles.enrichBtn, { backgroundColor: "#88B8B0" }]}>
              <Feather name="zap" size={14} color="#fff" />
              <Text style={styles.enrichBtnText}>Enrich & Import</Text>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  kicker: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.2 },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, marginTop: 2 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  linkText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  providerChip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  providerDot: { width: 8, height: 8, borderRadius: 4 },
  providerName: { fontFamily: "Inter_700Bold", fontSize: 12 },
  providerCredits: { fontFamily: "Inter_500Medium", fontSize: 11 },
  waterfallIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  waterfallTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  waterfallSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  toggle: { width: 36, height: 22, borderRadius: 11, justifyContent: "center" },
  toggleDot: { position: "absolute", width: 16, height: 16, borderRadius: 8, backgroundColor: "#fff" },
  prospectCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, borderWidth: 1 },
  pName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  pSub: { fontFamily: "Inter_400Regular", fontSize: 12 },
  intentChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  intentText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  confText: { fontFamily: "Inter_500Medium", fontSize: 10 },
  actionBar: { position: "absolute", left: 16, right: 16, padding: 14, borderRadius: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  actionBarText: { fontFamily: "Inter_700Bold", fontSize: 14 },
  enrichBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  enrichBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
});
