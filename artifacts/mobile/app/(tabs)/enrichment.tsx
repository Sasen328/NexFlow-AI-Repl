/**
 * Enrichment tab — Prospecting · AI Research · Bulk · Signals · Engines · Card Scanner
 * Native mirror of the web Enrichment Engine.
 */
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { SubTabs } from "@/components/ui/SubTabs";
import { useColors } from "@/hooks/useColors";
import {
  useBusinessCards,
  useEnrichmentRuns,
  useEnrichmentSources,
  useResearchProspect,
  useRunWaterfall,
  useSaveBusinessCard,
  useScanBusinessCard,
  useSignalsFeed,
} from "@/lib/api";

type SubKey = "prospect" | "signals" | "enrich" | "waterfall" | "bulk" | "card" | "engines" | "history";

export default function EnrichmentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [sub, setSub] = useState<SubKey>("prospect");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>ENRICHMENT</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Find · Research · Enrich</Text>
        </View>
        <PersonaSwitcher />
      </View>

      <SubTabs<SubKey>
        value={sub}
        onChange={setSub}
        tabs={[
          { key: "prospect", label: "Prospecting" },
          { key: "signals", label: "Buying Signals" },
          { key: "enrich", label: "Quick Enrich" },
          { key: "waterfall", label: "Waterfall Sources" },
          { key: "bulk", label: "Bulk Enrichment" },
          { key: "card", label: "Card Scanner" },
          { key: "engines", label: "Intel Engines" },
          { key: "history", label: "History" },
        ]}
      />

      {sub === "prospect" && <ProspectingView />}
      {sub === "signals" && <SignalsView />}
      {sub === "enrich" && <QuickEnrichView />}
      {sub === "waterfall" && <WaterfallView />}
      {sub === "bulk" && <BulkEnrichView />}
      {sub === "card" && <CardScannerView />}
      {sub === "engines" && <EnginesView />}
      {sub === "history" && <HistoryView />}
    </View>
  );
}

/* ─────────────────────────── Prospecting (waterfall) ─────────────────────────── */

function ProspectingView() {
  const colors = useColors();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [domain, setDomain] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const run = useRunWaterfall();
  const recent = useEnrichmentRuns();

  const submit = () => {
    if (!name && !company && !domain && !linkedin) {
      Alert.alert("Add at least one field", "Name, company, domain or LinkedIn.");
      return;
    }
    run.mutate(
      { full_name: name, company, domain, linkedin },
      {
        onSuccess: () => {
          recent.refetch();
          Alert.alert("Enrichment complete", "Check the result card below.");
        },
        onError: (e: any) => Alert.alert("Failed", e.message),
      },
    );
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
      <Card style={{ margin: 16 }}>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Single-lead waterfall</Text>
        <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 6 }}>
          Runs your sources in priority order (Apollo → Lusha → Wathiq → Argaam) until we hit verified email + phone.
        </Text>

        <Field label="Full name" value={name} onChange={setName} placeholder="e.g. Sara Al-Mansouri" />
        <Field label="Company" value={company} onChange={setCompany} placeholder="e.g. Gulf Ventures" />
        <Field label="Domain" value={domain} onChange={setDomain} placeholder="e.g. gulfventures.sa" />
        <Field label="LinkedIn URL" value={linkedin} onChange={setLinkedin} placeholder="linkedin.com/in/..." />

        <Pressable
          onPress={submit}
          disabled={run.isPending}
          style={[styles.cta, { backgroundColor: colors.foreground, opacity: run.isPending ? 0.6 : 1 }]}
        >
          {run.isPending ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Feather name="zap" size={16} color={colors.background} />
              <Text style={{ color: colors.background, fontWeight: "700" }}>Run waterfall</Text>
            </>
          )}
        </Pressable>

        {run.data && (
          <View style={{ marginTop: 14, padding: 12, backgroundColor: colors.muted, borderRadius: 10 }}>
            <Text style={{ color: colors.foreground, fontWeight: "700", marginBottom: 6 }}>Enriched result</Text>
            <Text style={{ color: colors.foreground, fontSize: 12, lineHeight: 18 }}>
              {JSON.stringify(run.data.result ?? run.data, null, 2)}
            </Text>
          </View>
        )}
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent enrichments</Text>
      <View style={{ paddingHorizontal: 16, gap: 8 }}>
        {recent.isPending ? (
          <ActivityIndicator color={colors.foreground} />
        ) : (recent.data?.runs ?? []).length === 0 ? (
          <Text style={{ color: colors.mutedForeground }}>No runs yet — try the waterfall above.</Text>
        ) : (
          (recent.data?.runs ?? []).slice(0, 8).map((r: any) => (
            <Card key={r.id}>
              <Text style={{ color: colors.foreground, fontWeight: "700" }}>
                {r.seed?.full_name || r.seed?.company || r.seed?.domain || "Run"}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 4 }}>
                {r.status ?? "ok"} · {new Date(r.created_at).toLocaleString()}
              </Text>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

/* ─────────────────────────── Quick Enrich (single lead research) ─────────────────────────── */

function QuickEnrichView() {
  const colors = useColors();
  const [company, setCompany] = useState("");
  const [person, setPerson] = useState("");
  const [topic, setTopic] = useState("");
  const research = useResearchProspect();

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
      <Card style={{ margin: 16 }}>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Multi-model research lab</Text>
        <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 6 }}>
          Live web research with Perplexity + Claude. Returns a structured brief.
        </Text>

        <Field label="Company" value={company} onChange={setCompany} placeholder="NEOM Tech & Digital" />
        <Field label="Person" value={person} onChange={setPerson} placeholder="Rashid Al-Ghamdi" />
        <Field label="Topic" value={topic} onChange={setTopic} placeholder="Vision 2030 spend, partners…" />

        <Pressable
          onPress={() =>
            research.mutate(
              { company, person, topic },
              { onError: (e: any) => Alert.alert("Failed", e.message) },
            )
          }
          disabled={research.isPending}
          style={[styles.cta, { backgroundColor: colors.foreground, opacity: research.isPending ? 0.6 : 1 }]}
        >
          {research.isPending ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Feather name="search" size={16} color={colors.background} />
              <Text style={{ color: colors.background, fontWeight: "700" }}>Run research</Text>
            </>
          )}
        </Pressable>

        {research.data && (
          <View style={{ marginTop: 14 }}>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Brief</Text>
            <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20, marginTop: 8 }}>
              {research.data.summary}
            </Text>
            {(research.data.sources ?? []).length > 0 && (
              <View style={{ marginTop: 10, gap: 4 }}>
                <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Sources</Text>
                {(research.data.sources ?? []).slice(0, 6).map((s: any, i: number) => (
                  <Text key={i} style={{ color: colors.mutedForeground, fontSize: 11 }} numberOfLines={1}>
                    • {s.title || s.url}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

/* ─────────────────────────── Bulk Enrichment (paste list) ─────────────────────────── */

function BulkEnrichView() {
  const colors = useColors();
  const [pasted, setPasted] = useState("");
  const run = useRunWaterfall();
  const lines = pasted.split(/[\r\n,;]+/).map((l) => l.trim()).filter(Boolean);

  const runBulk = async () => {
    if (lines.length === 0) {
      Alert.alert("Add some lines", "Paste names, emails or domains separated by commas or new lines.");
      return;
    }
    let ok = 0;
    for (const ln of lines.slice(0, 25)) {
      try {
        await run.mutateAsync(
          ln.includes("@") ? { email: ln } : ln.includes(".") ? { domain: ln } : { full_name: ln },
        );
        ok += 1;
      } catch {
        /* swallow */
      }
    }
    Alert.alert("Bulk done", `Enriched ${ok}/${lines.length}.`);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
      <Card style={{ margin: 16 }}>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Bulk paste</Text>
        <Text style={{ color: colors.foreground, fontSize: 12, marginTop: 4 }}>
          Names, emails or domains — one per line. Each row runs the full waterfall (max 25).
        </Text>
        <TextInput
          value={pasted}
          onChangeText={setPasted}
          multiline
          placeholder={"rashid@neom.com\nsara@gulfventures.sa\nmubadala.ae"}
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.bulkInput,
            { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted },
          ]}
        />
        <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 6 }}>
          {lines.length} row{lines.length === 1 ? "" : "s"} detected
        </Text>
        <Pressable
          onPress={runBulk}
          disabled={run.isPending || lines.length === 0}
          style={[styles.cta, { backgroundColor: colors.foreground, opacity: run.isPending || lines.length === 0 ? 0.6 : 1 }]}
        >
          {run.isPending ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Feather name="upload-cloud" size={16} color={colors.background} />
              <Text style={{ color: colors.background, fontWeight: "700" }}>Run bulk waterfall</Text>
            </>
          )}
        </Pressable>
      </Card>
    </ScrollView>
  );
}

/* ─────────────────────────── Waterfall Sources (data providers) ─────────────────────────── */

function WaterfallView() {
  const colors = useColors();
  const { data, isPending } = useEnrichmentSources();
  const sources = (data?.sources ?? []) as any[];
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140, gap: 10 }}>
      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12 }}>
        Active enrichment providers in the waterfall.
      </Text>
      {isPending ? (
        <ActivityIndicator color={colors.foreground} />
      ) : sources.length === 0 ? (
        <Text style={{ color: colors.mutedForeground, textAlign: "center", marginTop: 30 }}>
          No sources configured yet.
        </Text>
      ) : (
        sources.map((s, i) => (
          <Card key={s.id ?? s.name ?? i} style={{ gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 14 }}>
                {s.label ?? s.name ?? "Source"}
              </Text>
              <Badge tone={s.enabled === false ? "neutral" : "success"} small label={s.enabled === false ? "off" : "on"} />
            </View>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }}>
              {s.description ?? s.category ?? s.kind ?? "Provider"}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
              <Badge tone="neutral" small label={`coverage ${Math.round((s.coverage ?? 0.7) * 100)}%`} />
              <Badge tone="gold" small label={`accuracy ${Math.round((s.accuracy ?? 0.85) * 100)}%`} />
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

/* ─────────────────────────── History (recent runs) ─────────────────────────── */

function HistoryView() {
  const colors = useColors();
  const { data, isPending } = useEnrichmentRuns();
  const jobs = (data?.runs ?? []) as any[];
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140, gap: 8 }}>
      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12 }}>
        Recent enrichment & research jobs.
      </Text>
      {isPending ? (
        <ActivityIndicator color={colors.foreground} />
      ) : jobs.length === 0 ? (
        <Text style={{ color: colors.mutedForeground, textAlign: "center", marginTop: 30 }}>
          No enrichment runs yet.
        </Text>
      ) : (
        jobs.slice(0, 30).map((j, i) => (
          <Card key={j.id ?? i} style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                {j.subject ?? j.input ?? j.full_name ?? j.email ?? j.domain ?? "Run"}
              </Text>
              <Badge
                tone={j.status === "completed" ? "success" : j.status === "failed" ? "danger" : "gold"}
                small
                label={j.status ?? "queued"}
              />
            </View>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11 }}>
              {(j.kind ?? j.type ?? "waterfall")} · {j.created_at ? relTime(j.created_at) : "—"}
            </Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

function relTime(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
}

/* ─────────────────────────── Buying Signals ─────────────────────────── */

function SignalsView() {
  const colors = useColors();
  const { data, isPending, isRefetching, refetch } = useSignalsFeed(40);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 140 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.foreground} />}
    >
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Live buying intent</Text>
      <View style={{ paddingHorizontal: 16, gap: 8 }}>
        {isPending ? (
          <ActivityIndicator color={colors.foreground} />
        ) : (data ?? []).length === 0 ? (
          <Text style={{ color: colors.mutedForeground }}>No signals yet.</Text>
        ) : (
          (data ?? []).map((s: any) => (
            <Pressable
              key={s.id}
              onPress={() => s.contact_id && router.push(`/contact/${s.contact_id}` as any)}
            >
              <Card>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Badge tone={s.score >= 70 ? "success" : "gold"} small label={`${s.score ?? 0}`} />
                  {s.type && <Badge tone="violet" small label={s.type} />}
                </View>
                <Text style={{ color: colors.foreground, fontWeight: "700" }}>{s.title}</Text>
                {s.body && (
                  <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 4 }} numberOfLines={3}>
                    {s.body}
                  </Text>
                )}
                <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 6 }}>
                  {s.contact_name || s.company_name || "—"} · {new Date(s.created_at).toLocaleDateString()}
                </Text>
              </Card>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

/* ─────────────────────────── Engines (sources) ─────────────────────────── */

function EnginesView() {
  const colors = useColors();
  const { data, isPending, isRefetching, refetch } = useEnrichmentSources();
  const sources = data?.sources ?? [];

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 140 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.foreground} />}
    >
      <View style={styles.statsStrip}>
        <StatChip label="Sources" value={sources.length.toString()} colors={colors} />
        <StatChip label="Enabled" value={sources.filter((s) => s.enabled).length.toString()} colors={colors} />
        <StatChip label="Keyed" value={sources.filter((s) => s.has_key).length.toString()} colors={colors} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Intel engines</Text>
      <View style={{ paddingHorizontal: 16, gap: 8 }}>
        {isPending ? (
          <ActivityIndicator color={colors.foreground} />
        ) : (
          sources
            .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
            .map((s) => (
              <Card key={s.id}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: s.enabled ? "#7FB06922" : colors.muted,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Feather
                      name={s.enabled ? "check-circle" : "circle"}
                      size={16}
                      color={s.enabled ? "#5C8C4A" : colors.mutedForeground}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.foreground, fontWeight: "700" }}>{s.name}</Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                      {s.category ?? "general"} · priority {s.priority ?? "—"}
                    </Text>
                  </View>
                  {s.has_key ? (
                    <Badge tone="success" small label="API key" />
                  ) : (
                    <Badge tone="neutral" small label="no key" />
                  )}
                </View>
                {s.capabilities && s.capabilities.length > 0 && (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {s.capabilities.map((c: string) => (
                      <Badge key={c} tone="violet" small label={c} />
                    ))}
                  </View>
                )}
              </Card>
            ))
        )}
      </View>
    </ScrollView>
  );
}

/* ─────────────────────────── Business Card Scanner ─────────────────────────── */

function CardScannerView() {
  const colors = useColors();
  const scan = useScanBusinessCard();
  const save = useSaveBusinessCard();
  const cards = useBusinessCards();
  const [preview, setPreview] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<any | null>(null);

  const pick = async (source: "camera" | "library") => {
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Camera permission denied");
        return;
      }
    }
    const res = source === "camera"
      ? await ImagePicker.launchCameraAsync({
          base64: true,
          quality: 0.7,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        })
      : await ImagePicker.launchImageLibraryAsync({
          base64: true,
          quality: 0.7,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        });
    if (res.canceled || !res.assets?.[0]) return;
    const asset = res.assets[0];
    if (!asset.base64) {
      Alert.alert("Could not read image");
      return;
    }
    const dataUrl = `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`;
    setPreview(asset.uri);
    scan.mutate(
      { image_data_url: dataUrl },
      {
        onSuccess: (data) => setExtracted(data.extracted ?? null),
        onError: (e: any) => Alert.alert("Scan failed", e.message),
      },
    );
  };

  const saveContact = () => {
    if (!extracted) return;
    save.mutate(
      { extracted },
      {
        onSuccess: (r) => {
          Alert.alert(r.duplicate ? "Already in CRM" : "Saved to CRM", "Opening contact…");
          if (r.contact_id) router.push(`/contact/${r.contact_id}` as any);
        },
        onError: (e: any) => Alert.alert("Save failed", e.message),
      },
    );
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
      <Card style={{ margin: 16 }}>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Business card scanner</Text>
        <Text style={{ color: colors.foreground, fontSize: 13, marginTop: 6 }}>
          Snap a card — AI extracts every field (Arabic + English) and pushes it straight into your CRM.
        </Text>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
          <Pressable
            onPress={() => pick("camera")}
            style={[styles.cta, { backgroundColor: colors.foreground, flex: 1 }]}
          >
            <Feather name="camera" size={16} color={colors.background} />
            <Text style={{ color: colors.background, fontWeight: "700" }}>Camera</Text>
          </Pressable>
          <Pressable
            onPress={() => pick("library")}
            style={[styles.cta, { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border, flex: 1 }]}
          >
            <Feather name="image" size={16} color={colors.foreground} />
            <Text style={{ color: colors.foreground, fontWeight: "700" }}>From gallery</Text>
          </Pressable>
        </View>

        {preview && (
          <Image
            source={{ uri: preview }}
            style={{ width: "100%", height: 180, borderRadius: 10, marginTop: 14, resizeMode: "cover" }}
          />
        )}

        {scan.isPending && (
          <View style={{ marginTop: 14, alignItems: "center" }}>
            <ActivityIndicator color={colors.foreground} />
            <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 6 }}>
              Reading card with GPT-4o Vision…
            </Text>
          </View>
        )}

        {extracted && (
          <View style={{ marginTop: 14, gap: 6 }}>
            <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Extracted fields</Text>
            <Field2 label="Name" value={extracted.name_en} colors={colors} />
            {extracted.name_ar && <Field2 label="الاسم" value={extracted.name_ar} colors={colors} />}
            <Field2 label="Title" value={extracted.title} colors={colors} />
            <Field2 label="Company" value={extracted.company} colors={colors} />
            <Field2 label="Email" value={extracted.email} colors={colors} />
            <Field2 label="Mobile" value={extracted.mobile} colors={colors} />
            <Field2 label="Country" value={extracted.country} colors={colors} />
            <Field2 label="LinkedIn" value={extracted.linkedin} colors={colors} />

            <Pressable
              onPress={saveContact}
              disabled={save.isPending}
              style={[styles.cta, { backgroundColor: "#88B8B0", marginTop: 12 }]}
            >
              {save.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="user-plus" size={16} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Save to CRM</Text>
                </>
              )}
            </Pressable>
          </View>
        )}
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent scans</Text>
      <View style={{ paddingHorizontal: 16, gap: 8 }}>
        {cards.isPending ? (
          <ActivityIndicator color={colors.foreground} />
        ) : (cards.data?.scans ?? []).length === 0 ? (
          <Text style={{ color: colors.mutedForeground }}>No scans yet.</Text>
        ) : (
          (cards.data?.scans ?? []).slice(0, 8).map((c) => (
            <Card key={c.id}>
              <Text style={{ color: colors.foreground, fontWeight: "700" }}>{c.full_name ?? "—"}</Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                {c.title ?? "—"} · {c.company ?? "—"}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                {c.email ?? "—"} · {c.phone ?? "—"}
              </Text>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

/* ─────────────────────────── helpers ─────────────────────────── */

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

function Field2({ label, value, colors }: { label: string; value: any; colors: ReturnType<typeof useColors> }) {
  if (!value) return null;
  return (
    <View style={{ flexDirection: "row", paddingVertical: 4 }}>
      <Text style={{ color: colors.mutedForeground, fontSize: 12, width: 100 }}>{label}</Text>
      <Text style={{ color: colors.foreground, fontSize: 13, flex: 1 }}>{String(value)}</Text>
    </View>
  );
}

function StatChip({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.statChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 16 }}>{value}</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 2 }}>{label}</Text>
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
  statsStrip: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 14 },
  statChip: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  bulkInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    minHeight: 140,
    marginTop: 8,
    textAlignVertical: "top",
  },
  cta: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
  },
});
