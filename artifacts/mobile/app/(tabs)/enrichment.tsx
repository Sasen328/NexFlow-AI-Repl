/**
 * Enrichment screen (mobile).
 *
 * Live AI-powered lead enrichment that calls the same /api/lead-enrich/quick
 * endpoint the web app uses. Type a name + company (or just a name, or just
 * an email) and the engine returns a fully drafted contact profile with
 * scoring, persona, suggested next actions, and source attribution.
 */

import React, { useState } from "react";
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
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { apiPost } from "@/lib/api";

interface EnrichmentResult {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  title?: string;
  linkedin_url?: string;
  company?: {
    name?: string;
    industry?: string;
    country?: string;
    size?: string;
    website?: string;
  };
  seniority?: string;
  tags?: string[];
  persona?: string;
  summary?: string;
  next_actions?: { action: string; reason: string }[];
  lead_score?: number;
  confidence?: number;
  enriched_fields?: string[];
}

const ACTION_ICON: Record<string, string> = {
  call: "phone",
  email: "mail",
  whatsapp: "message-circle",
  linkedin: "linkedin",
};

export default function EnrichmentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnrichmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = (name.trim() || email.trim() || company.trim() || linkedin.trim()) && !loading;

  const reset = () => {
    setName(""); setEmail(""); setCompany(""); setLinkedin(""); setNotes("");
    setResult(null); setError(null);
  };

  const submit = async () => {
    if (!canSubmit) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await apiPost<{ enriched: EnrichmentResult; saved: boolean }>(
        "/lead-enrich/quick",
        { name, email, company, linkedin_url: linkedin, notes },
      );
      setResult(r.enriched);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      setError(e?.message ?? "Enrichment failed");
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const fullName = result ? `${result.first_name ?? ""} ${result.last_name ?? ""}`.trim() : "";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
          paddingHorizontal: 16,
          paddingBottom: 140,
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View>
          <Text style={[s.title, { color: colors.foreground }]}>Enrichment Engine</Text>
          <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
            Provide any seed — name, email, company, LinkedIn — and the engine drafts a full contact profile.
          </Text>
        </View>

        {/* Input form */}
        <Card>
          <View style={{ gap: 10 }}>
            <Field
              icon="user"
              label="Name"
              value={name}
              onChange={setName}
              placeholder="e.g. Ahmed Al-Rashidi"
              colors={colors}
            />
            <Field
              icon="briefcase"
              label="Company"
              value={company}
              onChange={setCompany}
              placeholder="e.g. Aramco Digital"
              colors={colors}
            />
            <Field
              icon="mail"
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="optional"
              keyboardType="email-address"
              colors={colors}
            />
            <Field
              icon="linkedin"
              label="LinkedIn URL"
              value={linkedin}
              onChange={setLinkedin}
              placeholder="optional"
              colors={colors}
            />
            <Field
              icon="file-text"
              label="Notes"
              value={notes}
              onChange={setNotes}
              placeholder="any extra context"
              multiline
              colors={colors}
            />

            <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
              <Pressable
                onPress={submit}
                disabled={!canSubmit}
                style={({ pressed }) => [{ flex: 1, opacity: !canSubmit || pressed ? 0.6 : 1 }]}
              >
                <LinearGradient
                  colors={["#B8A0C8", "#88B8B0", "#C8A880"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={s.runBtn}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Feather name="zap" size={16} color="#fff" />
                      <Text style={s.runBtnText}>Run Enrichment</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
              {(result || error) && (
                <Pressable
                  onPress={reset}
                  style={({ pressed }) => [
                    s.resetBtn,
                    { borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <Feather name="refresh-ccw" size={14} color={colors.foreground} />
                </Pressable>
              )}
            </View>
          </View>
        </Card>

        {/* Error */}
        {error && (
          <Card>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
              <Feather name="alert-circle" size={16} color="#C8A880" style={{ marginTop: 2 }} />
              <Text style={[s.errorText, { color: colors.foreground, flex: 1 }]}>{error}</Text>
            </View>
          </Card>
        )}

        {/* Loading hint */}
        {loading && (
          <Card>
            <View style={{ gap: 8 }}>
              <Text style={[s.stepText, { color: colors.foreground }]}>Enriching…</Text>
              {[
                "Looking up the company",
                "Inferring role and seniority",
                "Scoring intent + buying signals",
                "Drafting next actions",
              ].map((step) => (
                <View key={step} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                  <ActivityIndicator size="small" color={colors.violet} />
                  <Text style={[s.stepLine, { color: colors.mutedForeground }]}>{step}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Result */}
        {result && (
          <>
            {/* Identity card */}
            <Card>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                <LinearGradient
                  colors={["#B8A0C8", "#88B8B0"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.avatarLg}
                >
                  <Text style={s.avatarLgText}>
                    {(result.first_name?.[0] ?? "?")}
                    {(result.last_name?.[0] ?? "")}
                  </Text>
                </LinearGradient>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[s.resultName, { color: colors.foreground }]} numberOfLines={1}>
                    {fullName || "Enriched contact"}
                  </Text>
                  {result.title && (
                    <Text style={[s.resultTitle, { color: colors.mutedForeground }]} numberOfLines={2}>
                      {result.title}
                    </Text>
                  )}
                  {result.company?.name && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <Feather name="briefcase" size={11} color={colors.mutedForeground} />
                      <Text style={[s.resultCompany, { color: colors.foreground }]} numberOfLines={1}>
                        {result.company.name}
                      </Text>
                      {result.company.country && (
                        <Text style={[s.resultCompany, { color: colors.mutedForeground }]}>
                          · {result.company.country}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
                {typeof result.lead_score === "number" && (
                  <View style={[s.scoreBadge, { borderColor: scoreColor(result.lead_score) }]}>
                    <Text style={[s.scoreText, { color: scoreColor(result.lead_score) }]}>
                      {result.lead_score}
                    </Text>
                    <Text style={[s.scoreLabel, { color: colors.mutedForeground }]}>score</Text>
                  </View>
                )}
              </View>

              {result.tags && result.tags.length > 0 && (
                <View style={s.tagRow}>
                  {result.tags.slice(0, 6).map((t) => (
                    <View key={t} style={[s.tagPill, { backgroundColor: colors.muted }]}>
                      <Text style={[s.tagText, { color: colors.foreground }]}>{t}</Text>
                    </View>
                  ))}
                </View>
              )}

              {result.summary && (
                <Text style={[s.summaryText, { color: colors.mutedForeground }]}>{result.summary}</Text>
              )}
            </Card>

            {/* Detail rows */}
            <Card>
              <SectionTitle colors={colors}>Profile</SectionTitle>
              <Detail label="Persona" value={result.persona} colors={colors} />
              <Detail label="Seniority" value={result.seniority} colors={colors} />
              <Detail label="Email" value={result.email} colors={colors} />
              <Detail label="Phone" value={result.phone} colors={colors} />
              <Detail label="LinkedIn" value={result.linkedin_url} colors={colors} />
              <Detail label="Industry" value={result.company?.industry} colors={colors} />
              <Detail label="Company size" value={result.company?.size} colors={colors} />
              <Detail label="Website" value={result.company?.website} colors={colors} />
              <Detail
                label="Confidence"
                value={typeof result.confidence === "number" ? `${result.confidence}%` : undefined}
                colors={colors}
              />
            </Card>

            {/* Next actions */}
            {result.next_actions && result.next_actions.length > 0 && (
              <Card>
                <SectionTitle colors={colors}>Suggested next actions</SectionTitle>
                <View style={{ gap: 8, marginTop: 8 }}>
                  {result.next_actions.map((a, i) => (
                    <View
                      key={i}
                      style={[
                        s.actionRow,
                        { borderColor: colors.border, backgroundColor: colors.muted },
                      ]}
                    >
                      <View style={[s.actionIcon, { backgroundColor: colors.background }]}>
                        <Feather
                          name={(ACTION_ICON[a.action] ?? "play") as any}
                          size={14}
                          color={colors.violet}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.actionLabel, { color: colors.foreground }]}>
                          {a.action.toUpperCase()}
                        </Text>
                        <Text style={[s.actionReason, { color: colors.mutedForeground }]}>
                          {a.reason}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Sources */}
            {result.enriched_fields && result.enriched_fields.length > 0 && (
              <Card>
                <SectionTitle colors={colors}>Fields enriched</SectionTitle>
                <View style={[s.tagRow, { marginTop: 6 }]}>
                  {result.enriched_fields.map((f) => (
                    <Badge key={f} label={f} tone="violet" />
                  ))}
                </View>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────
function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  multiline,
  keyboardType,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "email-address";
  colors: any;
}) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <Feather name={icon as any} size={11} color={colors.mutedForeground} />
        <Text style={[s.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        multiline={multiline}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize="words"
        style={[
          s.input,
          {
            backgroundColor: colors.muted,
            borderColor: colors.border,
            color: colors.foreground,
            minHeight: multiline ? 60 : 38,
          },
        ]}
      />
    </View>
  );
}

function Detail({ label, value, colors }: { label: string; value?: string; colors: any }) {
  if (!value) return null;
  return (
    <View style={[s.detailRow, { borderTopColor: colors.border }]}>
      <Text style={[s.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[s.detailValue, { color: colors.foreground }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function SectionTitle({ colors, children }: { colors: any; children: React.ReactNode }) {
  return (
    <Text style={[s.sectionTitle, { color: colors.mutedForeground }]}>{children}</Text>
  );
}

function scoreColor(n: number): string {
  if (n >= 80) return "#88B8B0";
  if (n >= 60) return "#C8A880";
  if (n >= 40) return "#B8A0C8";
  return "#7A7090";
}

const s = StyleSheet.create({
  title: { fontFamily: "Inter_700Bold", fontSize: 24 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4, lineHeight: 18 },

  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },

  runBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  runBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  resetBtn: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
  },

  errorText: { fontFamily: "Inter_500Medium", fontSize: 13 },

  stepText: { fontFamily: "Inter_700Bold", fontSize: 14, marginBottom: 4 },
  stepLine: { fontFamily: "Inter_400Regular", fontSize: 12 },

  avatarLg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLgText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 18 },

  resultName: { fontFamily: "Inter_700Bold", fontSize: 17 },
  resultTitle: { fontFamily: "Inter_500Medium", fontSize: 12, marginTop: 2 },
  resultCompany: { fontFamily: "Inter_500Medium", fontSize: 12 },

  scoreBadge: {
    width: 52,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
  },
  scoreText: { fontFamily: "Inter_700Bold", fontSize: 18, lineHeight: 22 },
  scoreLabel: { fontFamily: "Inter_500Medium", fontSize: 9, marginTop: -2 },

  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  tagPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 10 },

  summaryText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },

  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  detailLabel: { fontFamily: "Inter_500Medium", fontSize: 11, flexShrink: 0 },
  detailValue: { fontFamily: "Inter_600SemiBold", fontSize: 12, flex: 1, textAlign: "right" },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.6 },
  actionReason: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 2, lineHeight: 16 },
});
