/**
 * CRM tab — Command Center · Contacts · Pipeline
 * Native mirror of the web CRM section (sections.ts → "CRM").
 */
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
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

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { SubTabs } from "@/components/ui/SubTabs";
import { useColors } from "@/hooks/useColors";
import {
  useContacts,
  useDashboardSummary,
  useDeals,
  useLogCall,
  usePipelineByStage,
  useTopContacts,
  type ApiContact,
  type ApiDeal,
  initials,
  stageLabel,
  dealHealth,
} from "@/lib/api";

type SubKey = "command" | "contacts" | "pipeline";

export default function CrmScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [sub, setSub] = useState<SubKey>("command");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>CRM</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Run your day</Text>
        </View>
        <PersonaSwitcher />
      </View>

      <SubTabs<SubKey>
        value={sub}
        onChange={setSub}
        tabs={[
          { key: "command", label: "Command Center" },
          { key: "contacts", label: "Contacts" },
          { key: "pipeline", label: "Pipeline" },
        ]}
      />

      {sub === "command" && <CommandCenter />}
      {sub === "contacts" && <ContactsView />}
      {sub === "pipeline" && <PipelineView />}
    </View>
  );
}

/* ─────────────────────────── Command Center ─────────────────────────── */

function CommandCenter() {
  const colors = useColors();
  const summary = useDashboardSummary();
  const top = useTopContacts(8);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<ApiContact | null>(null);

  const refreshing = summary.isRefetching || top.isRefetching;
  const contacts = top.data ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      `${c.first_name} ${c.last_name} ${c.company_name ?? ""} ${c.phone ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [contacts, search]);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 120 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            summary.refetch();
            top.refetch();
          }}
          tintColor={colors.foreground}
        />
      }
    >
      {/* Stats strip */}
      <View style={styles.statsStrip}>
        <StatChip label="Contacts" value={summary.data?.total_contacts?.toString() ?? "—"} colors={colors} />
        <StatChip label="Open deals" value={summary.data?.open_deals?.toString() ?? "—"} colors={colors} />
        <StatChip label="Pipeline" value={fmtMoney(summary.data?.pipeline_value)} colors={colors} />
        <StatChip label="MTD won" value={fmtMoney(summary.data?.revenue_this_month)} colors={colors} />
      </View>

      {/* Quick search */}
      <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
        <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Quick action — name, phone, company"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Live scorecards</Text>
      <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
        Tap any name to push an action into their timeline.
      </Text>

      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        {top.isPending ? (
          <ActivityIndicator color={colors.foreground} />
        ) : (
          filtered.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setActive(c)}
              style={({ pressed }) => [
                styles.scorecard,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
              ]}
            >
              <Avatar initials={initials(c.first_name, c.last_name)} size={42} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.scoreName, { color: colors.foreground }]}>
                  {c.first_name} {c.last_name}
                </Text>
                <Text style={[styles.scoreMeta, { color: colors.mutedForeground }]}>
                  {c.title ?? "—"} · {c.company_name ?? "—"}
                </Text>
                <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
                  <Badge tone={(c.lead_score ?? 0) >= 80 ? "success" : "neutral"} small label={`${c.lead_score ?? 0}`} />
                  {c.status && <Badge tone="neutral" small label={c.status} />}
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))
        )}
      </View>

      <ActionSheet contact={active} onClose={() => setActive(null)} />
    </ScrollView>
  );
}

function ActionSheet({ contact, onClose }: { contact: ApiContact | null; onClose: () => void }) {
  const colors = useColors();
  const logCall = useLogCall();
  if (!contact) return null;

  const act = (label: string, fn: () => void) => fn();

  const actions: Array<{ icon: keyof typeof Feather.glyphMap; label: string; fn: () => void }> = [
    {
      icon: "phone",
      label: "Log call",
      fn: () =>
        logCall.mutate(
          { contact_id: contact.id, outcome: "connected", notes: "Logged from Command Center" },
          { onSuccess: () => Alert.alert("Call logged"), onError: (e: any) => Alert.alert("Failed", e.message) },
        ),
    },
    {
      icon: "edit-3",
      label: "Log note",
      fn: () => router.push(`/contact/${contact.id}` as any),
    },
    {
      icon: "message-circle",
      label: "AI WhatsApp",
      fn: () => router.push(`/contact/${contact.id}` as any),
    },
    {
      icon: "mail",
      label: "Email draft",
      fn: () => router.push(`/contact/${contact.id}` as any),
    },
    {
      icon: "headphones",
      label: "AI Voice call",
      fn: () => router.push(`/contact/${contact.id}` as any),
    },
  ];

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.background }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <Text style={[styles.sheetName, { color: colors.foreground }]}>
            {contact.first_name} {contact.last_name}
          </Text>
          <Text style={[styles.sheetMeta, { color: colors.mutedForeground }]}>
            {contact.title ?? "—"} · {contact.company_name ?? "—"}
          </Text>
          <View style={{ marginTop: 16, gap: 8 }}>
            {actions.map((a) => (
              <Pressable
                key={a.label}
                onPress={() => act(a.label, a.fn)}
                style={({ pressed }) => [
                  styles.sheetAction,
                  { borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Feather name={a.icon} size={18} color={colors.foreground} />
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => router.push(`/contact/${contact.id}` as any)}
            style={[styles.sheetOpen, { borderColor: colors.border }]}
          >
            <Text style={{ color: colors.foreground, fontWeight: "700" }}>Open full profile</Text>
            <Feather name="arrow-right" size={16} color={colors.foreground} />
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ─────────────────────────── Contacts ─────────────────────────── */

const CONTACT_FILTERS = [
  { key: "all", label: "All" },
  { key: "qualified", label: "Qualified" },
  { key: "lead", label: "Lead" },
  { key: "customer", label: "Customer" },
];

function ContactsView() {
  const colors = useColors();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const { data, isPending, isRefetching, refetch } = useContacts({ limit: 200 });

  const all = data?.contacts ?? [];
  const filtered = useMemo<ApiContact[]>(
    () =>
      all.filter((c) => {
        if (filter !== "all" && (c.status || "").toLowerCase() !== filter) return false;
        if (
          search &&
          !`${c.first_name} ${c.last_name} ${c.company_name ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [all, search, filter],
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, gap: 10 }}>
        <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search contacts"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {CONTACT_FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.foreground : "transparent",
                    borderColor: active ? colors.foreground : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? colors.background : colors.foreground,
                    fontWeight: active ? "700" : "500",
                    fontSize: 12,
                  }}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.foreground} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120, gap: 8 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.foreground} />
          }
          renderItem={({ item: c }) => (
            <Pressable
              onPress={() => router.push(`/contact/${c.id}` as any)}
              style={({ pressed }) => [
                styles.contactRow,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Avatar initials={initials(c.first_name, c.last_name)} size={42} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.scoreName, { color: colors.foreground }]}>
                  {c.first_name} {c.last_name}
                </Text>
                <Text style={[styles.scoreMeta, { color: colors.mutedForeground }]}>
                  {c.title ?? "—"} · {c.company_name ?? "—"}
                </Text>
              </View>
              <Badge tone={(c.lead_score ?? 0) >= 80 ? "success" : "neutral"} small label={`${c.lead_score ?? 0}`} />
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.mutedForeground, textAlign: "center", marginTop: 40 }}>
              No contacts match.
            </Text>
          }
        />
      )}
    </View>
  );
}

/* ─────────────────────────── Pipeline ─────────────────────────── */

const STAGES = ["lead", "qualified", "proposal", "negotiation", "closed_won"] as const;

function PipelineView() {
  const colors = useColors();
  const { data, isPending, isRefetching, refetch } = useDeals();
  const stages = usePipelineByStage();
  const [activeStage, setActiveStage] = useState<string>("proposal");
  const [sheetDeal, setSheetDeal] = useState<ApiDeal | null>(null);

  const deals = data?.deals ?? [];
  const grouped = useMemo(() => {
    const m: Record<string, ApiDeal[]> = {};
    STAGES.forEach((s) => (m[s] = []));
    deals.forEach((d) => {
      if (!m[d.stage]) m[d.stage] = [];
      m[d.stage].push(d);
    });
    return m;
  }, [deals]);
  const stageDeals = grouped[activeStage] ?? [];
  const totalValue = deals.reduce((s, d) => s + (d.value || 0), 0);
  const weighted = deals.reduce((s, d) => s + ((d.value || 0) * (d.probability || 0)) / 100, 0);
  const stuck = deals.filter((d) => (d.probability ?? 0) < 25 && d.stage !== "closed_won" && d.stage !== "closed_lost");

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 140 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            refetch();
            stages.refetch();
          }}
          tintColor={colors.foreground}
        />
      }
    >
      <View style={styles.statsStrip}>
        <StatChip label="Open deals" value={deals.length.toString()} colors={colors} />
        <StatChip label="Pipeline" value={fmtMoney(totalValue)} colors={colors} />
        <StatChip label="Weighted" value={fmtMoney(weighted)} colors={colors} />
        <StatChip label="Stuck >30d" value={stuck.length.toString()} colors={colors} />
      </View>

      {/* AI Gap analysis */}
      <Card style={{ marginHorizontal: 16, marginTop: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Feather name="zap" size={16} color={colors.foreground} />
          <Text style={{ color: colors.foreground, fontWeight: "700" }}>AI gap analysis</Text>
        </View>
        <Text style={{ color: colors.mutedForeground, fontSize: 13, lineHeight: 18 }}>
          Lead → Qualified conversion is tracking at{" "}
          {Math.round(((stages.data?.[1]?.count ?? 0) / Math.max(stages.data?.[0]?.count ?? 1, 1)) * 100)}% vs the GCC
          B2B benchmark of ~50%. Push 5 enriched leads from your stuck pool to Qualified by EOW to recover the gap.
        </Text>
      </Card>

      {/* Funnel bars */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Funnel</Text>
      <View style={{ paddingHorizontal: 16, gap: 8 }}>
        {(stages.data ?? []).map((s) => {
          const max = Math.max(...(stages.data ?? []).map((x) => x.count || 0), 1);
          const ratio = (s.count || 0) / max;
          const isActive = s.stage === activeStage;
          return (
            <Pressable
              key={s.stage}
              onPress={() => setActiveStage(s.stage)}
              style={[
                styles.funnelRow,
                { backgroundColor: colors.card, borderColor: isActive ? colors.foreground : colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>{stageLabel(s.stage)}</Text>
                <View style={[styles.funnelTrack, { backgroundColor: colors.muted }]}>
                  <View
                    style={[
                      styles.funnelFill,
                      { width: `${ratio * 100}%`, backgroundColor: colors.foreground },
                    ]}
                  />
                </View>
              </View>
              <Text style={{ color: colors.foreground, fontWeight: "700", width: 40, textAlign: "right" }}>
                {s.count}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        {stageLabel(activeStage)} deals
      </Text>
      <View style={{ paddingHorizontal: 16, gap: 8 }}>
        {isPending ? (
          <ActivityIndicator color={colors.foreground} />
        ) : stageDeals.length === 0 ? (
          <Text style={{ color: colors.mutedForeground }}>No deals in this stage.</Text>
        ) : (
          stageDeals.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => setSheetDeal(d)}
              style={[styles.dealCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontWeight: "700" }}>{d.title}</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}>
                  {d.company_name ?? "—"} · prob {d.probability}%
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Text style={{ color: colors.foreground, fontWeight: "700" }}>{fmtMoney(d.value)}</Text>
                <Badge
                  tone={dealHealth(d) === "hot" ? "success" : dealHealth(d) === "warm" ? "gold" : "danger"}
                  small
                  label={dealHealth(d)}
                />
              </View>
            </Pressable>
          ))
        )}
      </View>

      {stuck.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Stuck leads</Text>
          <View style={{ paddingHorizontal: 16, gap: 8 }}>
            {stuck.slice(0, 5).map((d) => (
              <View key={d.id} style={[styles.dealCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>{d.title}</Text>
                  <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                    AI stall diagnosis: stage {stageLabel(d.stage)} idle &gt;30d — re-engage with a value-add insight.
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <DealSheet deal={sheetDeal} onClose={() => setSheetDeal(null)} />
    </ScrollView>
  );
}

function DealSheet({ deal, onClose }: { deal: ApiDeal | null; onClose: () => void }) {
  const colors = useColors();
  if (!deal) return null;
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.background }]} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <Text style={[styles.sheetName, { color: colors.foreground }]}>{deal.title}</Text>
          <Text style={[styles.sheetMeta, { color: colors.mutedForeground }]}>
            {deal.company_name ?? "—"} · {stageLabel(deal.stage)} · {fmtMoney(deal.value)}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
            <Badge tone="neutral" label={`Probability ${deal.probability}%`} />
            <Badge
              tone={dealHealth(deal) === "hot" ? "success" : dealHealth(deal) === "warm" ? "gold" : "danger"}
              label={dealHealth(deal)}
            />
          </View>
          {deal.contact_id && (
            <Pressable
              onPress={() => {
                onClose();
                router.push(`/contact/${deal.contact_id}` as any);
              }}
              style={[styles.sheetOpen, { borderColor: colors.border }]}
            >
              <Text style={{ color: colors.foreground, fontWeight: "700" }}>Open contact</Text>
              <Feather name="arrow-right" size={16} color={colors.foreground} />
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ─────────────────────────── shared ─────────────────────────── */

function StatChip({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.statChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 16 }}>{value}</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function fmtMoney(v?: number | null) {
  if (v == null) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
  return v.toString();
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
  statsStrip: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 14 },
  statChip: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  sectionTitle: { fontSize: 14, fontWeight: "700", paddingHorizontal: 16, marginTop: 22, marginBottom: 4 },
  sectionSub: { fontSize: 12, paddingHorizontal: 16, marginBottom: 10 },
  scorecard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  scoreName: { fontSize: 15, fontWeight: "700" },
  scoreMeta: { fontSize: 12, marginTop: 2 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  funnelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  funnelTrack: { height: 6, borderRadius: 3, marginTop: 6, overflow: "hidden" },
  funnelFill: { height: 6, borderRadius: 3 },
  dealCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  center: { padding: 40, alignItems: "center" },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    padding: 22,
    paddingBottom: 40,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    gap: 4,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#999",
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetName: { fontSize: 18, fontWeight: "800" },
  sheetMeta: { fontSize: 13 },
  sheetAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  sheetOpen: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
});
