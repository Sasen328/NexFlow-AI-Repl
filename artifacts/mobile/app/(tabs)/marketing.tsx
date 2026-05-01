/**
 * Marketing screen — mobile mirror of the web `/marketing-dashboard` +
 * `/campaign-builder` surfaces.
 *
 * Sales rep (Sara) sees a curated "campaign briefing" — hot campaigns and
 * how to follow up. Marketing (Maya) sees the full builder: KPIs, active
 * campaign list, and an inline AI-strategy generator that calls
 * /api/campaigns/ai-strategy.
 */

import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { usePersona } from "@/lib/personas";
import {
  useCampaigns,
  useMarketingAnalytics,
  useGenerateAiStrategy,
} from "@/lib/api";

type StrategyResult = {
  strategy?: string;
  steps?: string[];
  channels?: string[];
  copy?: { subject?: string; body?: string };
  [k: string]: unknown;
};

export default function MarketingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { role, persona } = usePersona();
  const isMarketing = role === "marketing";

  const campaigns = useCampaigns();
  const analytics = useMarketingAnalytics();

  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [channel, setChannel] = useState<"email" | "whatsapp" | "sms">("email");
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [strategy, setStrategy] = useState<StrategyResult | null>(null);
  const generate = useGenerateAiStrategy();

  const onGenerate = async () => {
    if (!goal.trim() || !audience.trim()) return;
    setStrategy(null);
    try {
      const r = (await generate.mutateAsync({ goal, audience, channel, lang })) as StrategyResult;
      setStrategy(r ?? null);
    } catch {
      setStrategy(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={campaigns.isRefetching || analytics.isRefetching}
            onRefresh={() => {
              campaigns.refetch();
              analytics.refetch();
            }}
            tintColor={colors.foreground}
          />
        }
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
              {isMarketing ? "Growth · campaigns · attribution" : "Hot leads from your campaigns"}
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Marketing</Text>
          </View>
          <PersonaSwitcher compact />
        </View>

        {/* ── KPI strip ──────────────────────────────────────────────── */}
        <View style={styles.kpiRow}>
          <Kpi
            colors={colors}
            label="Campaigns"
            value={(analytics.data?.totals?.campaigns ?? campaigns.data?.campaigns?.length ?? 0).toString()}
          />
          <Kpi
            colors={colors}
            label="Sent"
            value={(analytics.data?.totals?.sent ?? 0).toLocaleString()}
          />
          <Kpi
            colors={colors}
            label="Open rate"
            value={`${Math.round((analytics.data?.totals?.open_rate ?? 0) * 100)}%`}
          />
          <Kpi
            colors={colors}
            label="Click rate"
            value={`${Math.round((analytics.data?.totals?.click_rate ?? 0) * 100)}%`}
          />
        </View>

        {/* ── AI Campaign Builder (marketing persona) ────────────────── */}
        {isMarketing && (
          <Card style={{ marginBottom: 18, padding: 16 }}>
            <View style={styles.builderHeader}>
              <LinearGradient
                colors={["#C8A880", "#B8A0C8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.builderBadge}
              >
                <Feather name="zap" size={14} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.builderTitle, { color: colors.foreground }]}>
                  AI Campaign Strategist
                </Text>
                <Text style={[styles.builderHint, { color: colors.mutedForeground }]}>
                  GCC-native. Bilingual. One tap.
                </Text>
              </View>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Campaign goal
            </Text>
            <TextInput
              value={goal}
              onChangeText={setGoal}
              placeholder="e.g. Reactivate dormant SaaS leads in Riyadh"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              multiline
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              Target audience
            </Text>
            <TextInput
              value={audience}
              onChangeText={setAudience}
              placeholder="e.g. CTOs at fintech startups, KSA"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            />

            {/* Channel + lang selectors */}
            <View style={styles.chipRow}>
              {(["email", "whatsapp", "sms"] as const).map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setChannel(c)}
                  style={[
                    styles.chip,
                    {
                      borderColor: colors.border,
                      backgroundColor:
                        channel === c ? colors.foreground : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: channel === c ? colors.background : colors.foreground,
                    }}
                  >
                    {c === "email" ? "Email" : c === "whatsapp" ? "WhatsApp" : "SMS"}
                  </Text>
                </Pressable>
              ))}
              <View style={{ flex: 1 }} />
              {(["en", "ar"] as const).map((l) => (
                <Pressable
                  key={l}
                  onPress={() => setLang(l)}
                  style={[
                    styles.chip,
                    {
                      borderColor: colors.border,
                      backgroundColor:
                        lang === l ? colors.foreground : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: lang === l ? colors.background : colors.foreground,
                    }}
                  >
                    {l.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={onGenerate}
              disabled={generate.isPending || !goal.trim() || !audience.trim()}
              style={({ pressed }) => [
                styles.cta,
                {
                  backgroundColor: colors.foreground,
                  opacity:
                    generate.isPending || !goal.trim() || !audience.trim()
                      ? 0.4
                      : pressed
                        ? 0.7
                        : 1,
                },
              ]}
            >
              {generate.isPending ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Feather name="zap" size={14} color={colors.background} />
              )}
              <Text style={[styles.ctaText, { color: colors.background }]}>
                {generate.isPending ? "Generating…" : "Generate strategy"}
              </Text>
            </Pressable>

            {strategy && (
              <View style={[styles.resultBox, { borderColor: colors.border }]}>
                {strategy.strategy && (
                  <>
                    <Text style={[styles.resultHeading, { color: colors.foreground }]}>
                      Strategy
                    </Text>
                    <Text style={[styles.resultBody, { color: colors.mutedForeground }]}>
                      {strategy.strategy}
                    </Text>
                  </>
                )}
                {Array.isArray(strategy.steps) && strategy.steps.length > 0 && (
                  <>
                    <Text style={[styles.resultHeading, { color: colors.foreground, marginTop: 12 }]}>
                      Suggested steps
                    </Text>
                    {strategy.steps.map((s, i) => (
                      <Text key={i} style={[styles.resultBody, { color: colors.mutedForeground }]}>
                        {i + 1}. {s}
                      </Text>
                    ))}
                  </>
                )}
                {strategy.copy?.body && (
                  <>
                    <Text style={[styles.resultHeading, { color: colors.foreground, marginTop: 12 }]}>
                      Draft copy
                    </Text>
                    {strategy.copy?.subject && (
                      <Text
                        style={[styles.resultBody, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
                      >
                        Subject: {strategy.copy.subject}
                      </Text>
                    )}
                    <Text style={[styles.resultBody, { color: colors.mutedForeground }]}>
                      {strategy.copy.body}
                    </Text>
                  </>
                )}
              </View>
            )}
          </Card>
        )}

        {/* ── Active campaigns ───────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {isMarketing ? "Active campaigns" : "Hot campaigns"}
        </Text>
        <Card>
          {campaigns.isPending ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.foreground} />
            </View>
          ) : campaigns.isError ? (
            <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
              Couldn't load campaigns.{" "}
              <Text style={{ color: colors.foreground }} onPress={() => campaigns.refetch()}>
                Retry
              </Text>
            </Text>
          ) : (campaigns.data?.campaigns ?? []).length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No campaigns yet. {isMarketing ? "Use the builder above to create your first one." : `Ask ${persona.name.split(" ")[0]} to start a campaign.`}
            </Text>
          ) : (
            (campaigns.data?.campaigns ?? []).map((c, i, arr) => (
              <View
                key={c.id}
                style={[
                  styles.row,
                  i < arr.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.foreground }]}>{c.name}</Text>
                  <Text style={[styles.rowMeta, { color: colors.mutedForeground }]}>
                    {(c.channel ?? "—").toUpperCase()} · {c.status}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Badge
                    tone={c.status === "active" ? "success" : "neutral"}
                    label={`${(c.sent_count ?? 0).toLocaleString()} sent`}
                  />
                  <Text style={[styles.rowMeta, { color: colors.mutedForeground }]}>
                    {(c.open_count ?? 0).toLocaleString()} opens · {(c.click_count ?? 0).toLocaleString()} clicks
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Kpi({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.kpiTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.kpiValue, { color: colors.foreground }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 4 },

  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  eyebrow: { fontFamily: "Inter_500Medium", fontSize: 12, marginBottom: 2 },
  title: { fontFamily: "Inter_700Bold", fontSize: 22 },

  kpiRow: { flexDirection: "row", gap: 8, marginBottom: 18, flexWrap: "wrap" },
  kpiTile: {
    flexBasis: "47%",
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  kpiValue: { fontFamily: "Inter_700Bold", fontSize: 18, marginTop: 2 },
  kpiLabel: { fontFamily: "Inter_400Regular", fontSize: 11 },

  builderHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  builderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  builderTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  builderHint: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },

  fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 11, marginTop: 8, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    minHeight: 40,
  },

  chipRow: { flexDirection: "row", gap: 6, marginTop: 10, flexWrap: "wrap" },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },

  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
  },
  ctaText: { fontFamily: "Inter_700Bold", fontSize: 14 },

  resultBox: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 14, gap: 4 },
  resultHeading: { fontFamily: "Inter_700Bold", fontSize: 13 },
  resultBody: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 19, marginTop: 4 },

  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 14, marginTop: 8, marginBottom: 10 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  rowTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  rowMeta: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2 },

  center: { padding: 24, alignItems: "center" },
  emptyText: { padding: 16, fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center" },
  errorText: { padding: 16, fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center" },
});
