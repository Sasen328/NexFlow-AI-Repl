/**
 * Marketing tab — Dashboard · AI Campaign Builder · MarkHub
 * Native mirror of the web Marketing surface.
 */
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { SubTabs } from "@/components/ui/SubTabs";
import { useColors } from "@/hooks/useColors";
import {
  useCampaigns,
  useCreateCampaign,
  useDormantMessage,
  useGenerateAiStrategy,
  useGenerateCampaignContent,
  useMarketingAnalytics,
  useSendCampaign,
  useTopContacts,
  useUpdateCampaign,
} from "@/lib/api";

type SubKey = "dashboard" | "builder" | "markhub";

export default function MarketingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [sub, setSub] = useState<SubKey>("dashboard");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>MARKETING</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>AI-Powered Growth</Text>
        </View>
        <PersonaSwitcher />
      </View>

      <SubTabs<SubKey>
        value={sub}
        onChange={setSub}
        tabs={[
          { key: "dashboard", label: "Dashboard" },
          { key: "builder", label: "Campaign Builder" },
          { key: "markhub", label: "MarkHub" },
        ]}
      />

      {sub === "dashboard" && <DashboardView />}
      {sub === "builder" && <CampaignWizard />}
      {sub === "markhub" && <MarkHubView />}
    </View>
  );
}

/* ─────────────────────────── Dashboard ─────────────────────────── */

function DashboardView() {
  const colors = useColors();
  const analytics = useMarketingAnalytics();
  const campaigns = useCampaigns();
  const hot = useTopContacts(8);
  const dormant = useDormantMessage();

  const t = analytics.data?.totals ?? {};
  const recent = (campaigns.data?.campaigns ?? []).slice(0, 5);
  const hotLeads = (hot.data ?? []).filter((c: any) => (c.lead_score ?? 0) >= 80);

  const generateForLead = (contact: any) => {
    dormant.mutate(
      { contact, dormant_days: 30 },
      {
        onSuccess: (msg) =>
          Alert.alert(
            `${msg.urgency.toUpperCase()} · ${msg.platform_recommendation}`,
            `${msg.email_subject}\n\n${msg.whatsapp_message}\n\n${msg.reason}`,
          ),
        onError: (e: any) => Alert.alert("AI failed", e.message),
      },
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 140 }}
      refreshControl={
        <RefreshControl
          refreshing={analytics.isRefetching || campaigns.isRefetching}
          onRefresh={() => {
            analytics.refetch();
            campaigns.refetch();
          }}
          tintColor={colors.foreground}
        />
      }
    >
      <View style={styles.kpiGrid}>
        <KpiTile label="Campaigns" value={t.campaigns ?? 0} icon="send" colors={colors} />
        <KpiTile label="Sent" value={t.sent ?? 0} icon="mail" colors={colors} />
        <KpiTile
          label="Open rate"
          value={`${Math.round((t.open_rate ?? 0) * 100)}%`}
          icon="eye"
          colors={colors}
        />
        <KpiTile
          label="Click rate"
          value={`${Math.round((t.click_rate ?? 0) * 100)}%`}
          icon="mouse-pointer"
          colors={colors}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Hot lead alerts</Text>
      <View style={{ paddingHorizontal: 16, gap: 8 }}>
        {hot.isPending ? (
          <ActivityIndicator color={colors.foreground} />
        ) : hotLeads.length === 0 ? (
          <Text style={{ color: colors.mutedForeground }}>No hot leads above 80 right now.</Text>
        ) : (
          hotLeads.map((c: any) => (
            <Card key={c.id}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "700" }}>
                    {c.first_name} {c.last_name}
                  </Text>
                  <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                    {c.title ?? "—"} · {c.company_name ?? "—"}
                  </Text>
                </View>
                <Badge tone="success" small label={`${c.lead_score}`} />
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                <Pressable
                  onPress={() => generateForLead(c)}
                  disabled={dormant.isPending}
                  style={[
                    styles.smallBtn,
                    { backgroundColor: colors.foreground, opacity: dormant.isPending ? 0.6 : 1 },
                  ]}
                >
                  <Feather name="zap" size={12} color={colors.background} />
                  <Text style={{ color: colors.background, fontWeight: "600", fontSize: 12 }}>
                    AI message
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => router.push(`/contact/${c.id}` as any)}
                  style={[styles.smallBtn, { borderWidth: 1, borderColor: colors.border }]}
                >
                  <Feather name="user" size={12} color={colors.foreground} />
                  <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 12 }}>
                    Open
                  </Text>
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent campaigns</Text>
      <View style={{ paddingHorizontal: 16, gap: 8 }}>
        {campaigns.isPending ? (
          <ActivityIndicator color={colors.foreground} />
        ) : recent.length === 0 ? (
          <Text style={{ color: colors.mutedForeground }}>No campaigns yet — open Campaign Builder.</Text>
        ) : (
          recent.map((c) => (
            <Card key={c.id}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ color: colors.foreground, fontWeight: "700", flex: 1 }} numberOfLines={1}>
                  {c.name}
                </Text>
                <Badge
                  tone={c.status === "sent" ? "success" : c.status === "draft" ? "neutral" : "violet"}
                  small
                  label={c.status ?? "draft"}
                />
              </View>
              <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 4 }}>
                {c.channel ?? "email"} · {(c as any).sent_count ?? 0} sent · {(c as any).open_count ?? 0} opens
              </Text>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

/* ─────────────────────────── 6-step AI Campaign Builder ─────────────────────────── */

const CULTURAL_COPY: Record<string, { en: string; ar: string }> = {
  "ramadan-greeting": {
    en: "Wishing you a blessed Ramadan from the team — may this month bring opportunity and peace.",
    ar: "رمضان كريم — كل عام وأنتم بخير.",
  },
  "post-ramadan-followup": {
    en: "Hope you had a meaningful Ramadan. We're back online and ready when you are.",
    ar: "نتمنى أن تكون قضيت شهرًا مباركًا — نحن جاهزون للمتابعة معكم.",
  },
};

function CampaignWizard() {
  const colors = useColors();
  const [step, setStep] = useState(0);

  // Wizard state
  const [segment, setSegment] = useState("Hot leads (80+)");
  const [goal, setGoal] = useState("Re-engage dormant accounts");
  const [budget, setBudget] = useState("$5,000");
  const [channels, setChannels] = useState<string[]>(["email", "whatsapp"]);
  const [tone, setTone] = useState<"warm" | "direct" | "executive">("warm");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [cultural, setCultural] = useState(true);
  const [arabic, setArabic] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const strategy = useGenerateAiStrategy();
  const create = useCreateCampaign();
  const update = useUpdateCampaign();
  const generate = useGenerateCampaignContent();
  const send = useSendCampaign();

  const STEPS = ["Segment", "Goal", "Channels", "Copy", "Visuals", "Publish"];

  const runStrategy = () => {
    strategy.mutate(
      { goal, audience: segment, budget, platforms: channels },
      {
        onSuccess: (s: any) => {
          if (s?.summary) {
            Alert.alert("AI strategy ready", s.summary);
          }
        },
        onError: (e: any) => Alert.alert("Strategy failed", e.message),
      },
    );
  };

  const generateCopy = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Give the campaign a name first.");
      return;
    }
    try {
      let id = draftId;
      if (!id) {
        const c = await create.mutateAsync({
          name,
          channel: channels[0] ?? "email",
          goal,
          status: "draft",
          audience_filter: { segment },
        });
        id = c.id;
        setDraftId(id);
      }
      const updated = await generate.mutateAsync({
        id,
        audience: segment,
        goal,
        tone,
      });
      setSubject(updated.subject ?? "");
      let body = (updated as any).content ?? "";
      if (cultural) {
        const greet = CULTURAL_COPY["ramadan-greeting"];
        body = `${arabic ? greet.ar : greet.en}\n\n${body}`;
      }
      setContent(body);
      Alert.alert("Copy generated", "Review on the next step.");
      setStep(3);
    } catch (e: any) {
      Alert.alert("AI failed", e.message);
    }
  };

  const publish = async () => {
    if (!name.trim() || !subject.trim() || !content.trim()) {
      Alert.alert("Missing fields", "Name, subject and content all required.");
      return;
    }
    try {
      let id = draftId;
      if (id) {
        // Reuse the draft from the AI copy step — sync any manual edits.
        await update.mutateAsync({ id, name, subject, content, status: "ready" });
      } else {
        const c = await create.mutateAsync({
          name,
          channel: channels[0] ?? "email",
          goal,
          subject,
          content,
          status: "ready",
          audience_filter: { segment },
        });
        id = c.id;
        setDraftId(id);
      }
      const result = await send.mutateAsync(id);
      Alert.alert(
        "Campaign sent",
        `${result.sent} delivered · ${result.failed} failed.`,
        [
          {
            text: "Done",
            onPress: () => {
              setStep(0);
              setDraftId(null);
            },
          },
        ],
      );
    } catch (e: any) {
      Alert.alert("Send failed", e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
      {/* Progress */}
      <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingTop: 14, gap: 4 }}>
        {STEPS.map((label, i) => (
          <View key={label} style={{ flex: 1 }}>
            <View
              style={{
                height: 4,
                borderRadius: 4,
                backgroundColor: i <= step ? colors.foreground : colors.muted,
              }}
            />
            <Text
              style={{
                fontSize: 9,
                color: i === step ? colors.foreground : colors.mutedForeground,
                fontWeight: i === step ? "700" : "500",
                marginTop: 4,
                textAlign: "center",
              }}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      <Card style={{ margin: 16 }}>
        {step === 0 && (
          <View>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>1. Segment</Text>
            <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 4 }}>
              Who are you reaching?
            </Text>
            {[
              "Hot leads (80+)",
              "Warm leads (60-79)",
              "Dormant accounts (45+ days)",
              "All of CRM",
              "Custom segment",
            ].map((s) => (
              <Pressable
                key={s}
                onPress={() => setSegment(s)}
                style={[
                  styles.choiceRow,
                  {
                    borderColor: segment === s ? colors.foreground : colors.border,
                    backgroundColor: segment === s ? colors.muted : "transparent",
                  },
                ]}
              >
                <Feather
                  name={segment === s ? "check-circle" : "circle"}
                  size={16}
                  color={segment === s ? colors.foreground : colors.mutedForeground}
                />
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>2. Goal & budget</Text>
            <Field label="Campaign name" value={name} onChange={setName} placeholder="Q2 Re-engagement" />
            <Field label="Goal" value={goal} onChange={setGoal} placeholder="What do you want to happen?" />
            <Field label="Budget" value={budget} onChange={setBudget} placeholder="$5,000" />
            <Pressable
              onPress={runStrategy}
              disabled={strategy.isPending}
              style={[styles.cta, { backgroundColor: "#88B8B0", marginTop: 12 }]}
            >
              {strategy.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="cpu" size={14} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Get AI strategy</Text>
                </>
              )}
            </Pressable>
            {strategy.data?.summary && (
              <View style={{ marginTop: 12, padding: 10, backgroundColor: colors.muted, borderRadius: 10 }}>
                <Text style={{ color: colors.foreground, fontSize: 12 }}>{strategy.data.summary}</Text>
                {strategy.data.roi && (
                  <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 6 }}>
                    Projected ROI: {strategy.data.roi} · Est. meetings: {strategy.data.total_est_meetings ?? "—"}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>3. Channels & tone</Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 8 }}>CHANNELS</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
              {(["email", "whatsapp", "linkedin", "sms"] as const).map((ch) => (
                <Pressable
                  key={ch}
                  onPress={() =>
                    setChannels((cur) => (cur.includes(ch) ? cur.filter((c) => c !== ch) : [...cur, ch]))
                  }
                  style={[
                    styles.chip,
                    {
                      backgroundColor: channels.includes(ch) ? colors.foreground : "transparent",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: channels.includes(ch) ? colors.background : colors.foreground,
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    {ch}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 14 }}>TONE</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
              {(["warm", "direct", "executive"] as const).map((tn) => (
                <Pressable
                  key={tn}
                  onPress={() => setTone(tn)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: tone === tn ? colors.foreground : "transparent",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: tone === tn ? colors.background : colors.foreground,
                      fontWeight: "600",
                      fontSize: 12,
                    }}
                  >
                    {tn}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 13 }}>
                  Cultural intelligence
                </Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                  Add Ramadan / Eid framing where relevant
                </Text>
              </View>
              <Switch value={cultural} onValueChange={setCultural} />
            </View>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 13 }}>
                  Arabic primary
                </Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                  Lead with العربية, English follows
                </Text>
              </View>
              <Switch value={arabic} onValueChange={setArabic} />
            </View>

            <Pressable
              onPress={generateCopy}
              disabled={create.isPending || generate.isPending}
              style={[
                styles.cta,
                {
                  backgroundColor: colors.foreground,
                  marginTop: 16,
                  opacity: create.isPending || generate.isPending ? 0.6 : 1,
                },
              ]}
            >
              {create.isPending || generate.isPending ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <>
                  <Feather name="zap" size={14} color={colors.background} />
                  <Text style={{ color: colors.background, fontWeight: "700" }}>
                    Generate AI copy
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>4. Copy</Text>
            <Field label="Subject" value={subject} onChange={setSubject} placeholder="Email subject line" />
            <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 12, fontWeight: "600" }}>
              BODY
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              multiline
              placeholder="HTML or plain text body"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.bodyInput,
                { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted },
              ]}
            />
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>5. Visuals</Text>
            <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 6 }}>
              Choose a hero block. Visuals render in the email and any landing pages.
            </Text>
            <View style={{ marginTop: 12, gap: 10 }}>
              {[
                { id: "minimal", label: "Minimal — text + CTA" },
                { id: "hero", label: "Hero image + headline" },
                { id: "deal", label: "Deal card with savings" },
                { id: "testimonial", label: "Customer testimonial" },
              ].map((v) => (
                <Pressable
                  key={v.id}
                  style={[styles.choiceRow, { borderColor: colors.border }]}
                  onPress={() => Alert.alert("Visual selected", v.label)}
                >
                  <Feather name="image" size={16} color={colors.mutedForeground} />
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>{v.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 5 && (
          <View>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>6. Publish</Text>
            <Summary k="Name" v={name || "(unnamed)"} colors={colors} />
            <Summary k="Segment" v={segment} colors={colors} />
            <Summary k="Goal" v={goal} colors={colors} />
            <Summary k="Budget" v={budget} colors={colors} />
            <Summary k="Channels" v={channels.join(", ")} colors={colors} />
            <Summary k="Tone" v={tone} colors={colors} />
            <Summary k="Cultural intel" v={cultural ? "on" : "off"} colors={colors} />
            <Summary k="Arabic primary" v={arabic ? "yes" : "no"} colors={colors} />
            <Summary k="Subject" v={subject || "(missing)"} colors={colors} />

            <Pressable
              onPress={publish}
              disabled={create.isPending || send.isPending}
              style={[
                styles.cta,
                {
                  backgroundColor: "#7FB069",
                  marginTop: 16,
                  opacity: create.isPending || send.isPending ? 0.6 : 1,
                },
              ]}
            >
              {create.isPending || send.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="send" size={14} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Send campaign now</Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </Card>

      {/* Nav */}
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, marginTop: 4 }}>
        <Pressable
          onPress={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          style={[
            styles.cta,
            { flex: 1, borderWidth: 1, borderColor: colors.border, opacity: step === 0 ? 0.4 : 1 },
          ]}
        >
          <Feather name="arrow-left" size={14} color={colors.foreground} />
          <Text style={{ color: colors.foreground, fontWeight: "700" }}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          style={[
            styles.cta,
            { flex: 1, backgroundColor: colors.foreground, opacity: step === STEPS.length - 1 ? 0.4 : 1 },
          ]}
        >
          <Text style={{ color: colors.background, fontWeight: "700" }}>Next</Text>
          <Feather name="arrow-right" size={14} color={colors.background} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

/* ─────────────────────────── MarkHub (asset library) ─────────────────────────── */

function MarkHubView() {
  const colors = useColors();
  const campaigns = useCampaigns();
  const [filter, setFilter] = useState<"all" | "draft" | "sent">("all");

  const list = useMemo(() => {
    const all = campaigns.data?.campaigns ?? [];
    if (filter === "all") return all;
    return all.filter((c) => c.status === filter);
  }, [campaigns.data, filter]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
      <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingTop: 14, gap: 8 }}>
        {(["all", "draft", "sent"] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.chip,
              {
                backgroundColor: filter === f ? colors.foreground : "transparent",
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={{
                color: filter === f ? colors.background : colors.foreground,
                fontWeight: "600",
                fontSize: 12,
              }}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Campaign library</Text>
      <View style={{ paddingHorizontal: 16, gap: 8 }}>
        {campaigns.isPending ? (
          <ActivityIndicator color={colors.foreground} />
        ) : list.length === 0 ? (
          <Text style={{ color: colors.mutedForeground }}>No campaigns match.</Text>
        ) : (
          list.map((c) => (
            <Card key={c.id}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ color: colors.foreground, fontWeight: "700", flex: 1 }} numberOfLines={1}>
                  {c.name}
                </Text>
                <Badge
                  tone={c.status === "sent" ? "success" : c.status === "draft" ? "neutral" : "violet"}
                  small
                  label={c.status ?? "draft"}
                />
              </View>
              <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 4 }}>
                {c.channel ?? "email"} · {(c as any).sent_count ?? 0} sent · created{" "}
                {new Date(c.created_at).toLocaleDateString()}
              </Text>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

/* ─────────────────────────── helpers ─────────────────────────── */

function KpiTile({
  label,
  value,
  icon,
  colors,
}: {
  label: string;
  value: string | number;
  icon: any;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.kpiTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon} size={14} color={colors.mutedForeground} />
      <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 18, marginTop: 6 }}>
        {value}
      </Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{label}</Text>
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const colors = useColors();
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: "600", marginBottom: 4 }}>
        {label.toUpperCase()}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
      />
    </View>
  );
}

function Summary({ k, v, colors }: { k: string; v: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flexDirection: "row", paddingVertical: 4 }}>
      <Text style={{ color: colors.mutedForeground, fontSize: 12, width: 110 }}>{k}</Text>
      <Text style={{ color: colors.foreground, fontSize: 13, flex: 1 }}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 16 : 8,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  kicker: { fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "800" },
  cardLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" },
  sectionTitle: { fontSize: 14, fontWeight: "700", paddingHorizontal: 16, marginTop: 22, marginBottom: 10 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 8 },
  kpiTile: { flexBasis: "47%", flexGrow: 1, padding: 12, borderRadius: 12, borderWidth: 1 },
  smallBtn: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(127,127,127,0.2)",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  bodyInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    minHeight: 180,
    marginTop: 6,
    textAlignVertical: "top",
  },
  cta: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
});
