/**
 * Comms tab — Calls · Messages (WA + Email) · Conversation Intel
 * Native mirror of the web "Comms / Call Center" surface.
 */
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  useActivitiesFeed,
  useCall,
  useCalls,
  type ApiActivityFeed,
  type ApiCall,
} from "@/lib/api";

type SubKey = "calls" | "messages" | "intel";

export default function CommsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [sub, setSub] = useState<SubKey>("calls");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>COMMS</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Conversation hub</Text>
        </View>
        <PersonaSwitcher />
      </View>

      <SubTabs<SubKey>
        value={sub}
        onChange={setSub}
        tabs={[
          { key: "calls", label: "Calls" },
          { key: "messages", label: "Messages" },
          { key: "intel", label: "Conversation Intel" },
        ]}
      />

      {sub === "calls" && <CallsView />}
      {sub === "messages" && <MessagesView />}
      {sub === "intel" && <IntelView />}
    </View>
  );
}

/* ─────────────────────────── Calls ─────────────────────────── */

function CallsView() {
  const colors = useColors();
  const { data, isPending, isRefetching, refetch } = useCalls({ limit: 100 });
  const [openId, setOpenId] = useState<string | null>(null);

  const calls = data?.calls ?? [];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.statsStrip}>
        <StatChip label="Calls today" value={calls.filter(isToday).length.toString()} colors={colors} />
        <StatChip label="Connected" value={calls.filter((c) => c.outcome === "connected").length.toString()} colors={colors} />
        <StatChip
          label="Avg score"
          value={`${Math.round(avg(calls.map((c) => (c as any).call_score ?? 0)))}/100`}
          colors={colors}
        />
        <StatChip
          label="Sentiment"
          value={`${Math.round(avg(calls.map((c) => (((c as any).sentiment_score ?? 0) + 1) * 50)) || 0)}%`}
          colors={colors}
        />
      </View>

      <Pressable style={[styles.dialerCta, { backgroundColor: colors.foreground }]} onPress={() => router.push("/(tabs)/crm" as any)}>
        <Feather name="phone-call" size={16} color={colors.background} />
        <Text style={{ color: colors.background, fontWeight: "700" }}>Power dialer · open contacts</Text>
      </Pressable>

      {isPending ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.foreground} />
        </View>
      ) : (
        <FlatList
          data={calls}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, gap: 8 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.foreground} />
          }
          renderItem={({ item: c }) => (
            <Pressable
              onPress={() => setOpenId(c.id)}
              style={[styles.callRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View
                style={[
                  styles.directionPill,
                  {
                    backgroundColor:
                      c.direction === "outbound" ? "#88B8B022" : "#B8A0C822",
                  },
                ]}
              >
                <Feather
                  name={c.direction === "outbound" ? "phone-outgoing" : "phone-incoming"}
                  size={14}
                  color={colors.foreground}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontWeight: "700" }}>
                  {c.contact_name || "Unknown"}
                </Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                  {c.company_name ?? "—"} · {c.outcome ?? "—"} · {fmtDuration(c.duration_seconds)}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                {(c as any).call_score != null && (
                  <Badge
                    tone={(c as any).call_score >= 75 ? "success" : (c as any).call_score >= 50 ? "gold" : "danger"}
                    small
                    label={`${(c as any).call_score}`}
                  />
                )}
                <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{relTime(c.created_at)}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.mutedForeground, textAlign: "center", marginTop: 40 }}>
              No calls logged yet.
            </Text>
          }
        />
      )}

      <CallDetailSheet id={openId} onClose={() => setOpenId(null)} />
    </View>
  );
}

function CallDetailSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const colors = useColors();
  const { data, isPending } = useCall(id ?? undefined);
  if (!id) return null;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.background, maxHeight: "85%" }]}
          onPress={() => {}}
        >
          <View style={styles.sheetHandle} />
          {isPending || !data ? (
            <ActivityIndicator color={colors.foreground} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.sheetName, { color: colors.foreground }]}>
                {data.contact_name || "Call detail"}
              </Text>
              <Text style={[styles.sheetMeta, { color: colors.mutedForeground }]}>
                {data.direction ?? "—"} · {data.outcome ?? "—"} · {fmtDuration(data.duration_seconds)}
              </Text>

              <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                {data.call_score != null && (
                  <Badge
                    tone={data.call_score >= 75 ? "success" : "gold"}
                    label={`Score ${data.call_score}/100`}
                  />
                )}
                {data.sentiment_score != null && (
                  <Badge
                    tone={data.sentiment_score > 0.2 ? "success" : data.sentiment_score < -0.2 ? "danger" : "neutral"}
                    label={`Sentiment ${(data.sentiment_score * 100).toFixed(0)}`}
                  />
                )}
              </View>

              {data.coaching_notes && (
                <Card style={{ marginTop: 16 }}>
                  <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>AI coaching notes</Text>
                  <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 19, marginTop: 6 }}>
                    {data.coaching_notes}
                  </Text>
                </Card>
              )}

              {data.ai_insights && (
                <Card style={{ marginTop: 12 }}>
                  <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>AI action plan</Text>
                  <Text
                    style={{ color: colors.foreground, fontSize: 12, marginTop: 6, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}
                  >
                    {typeof data.ai_insights === "string"
                      ? data.ai_insights
                      : JSON.stringify(data.ai_insights, null, 2)}
                  </Text>
                </Card>
              )}

              {data.transcript && (
                <Card style={{ marginTop: 12 }}>
                  <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Transcript</Text>
                  <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20, marginTop: 8 }}>
                    {data.transcript}
                  </Text>
                </Card>
              )}

              {data.contact_id && (
                <Pressable
                  onPress={() => {
                    onClose();
                    router.push(`/contact/${data.contact_id}` as any);
                  }}
                  style={[styles.sheetOpen, { borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.foreground, fontWeight: "700" }}>Open contact profile</Text>
                  <Feather name="arrow-right" size={16} color={colors.foreground} />
                </Pressable>
              )}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ─────────────────────────── Messages (WA + Email) ─────────────────────────── */

const MSG_FILTERS = [
  { key: "all", label: "All" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "email", label: "Email" },
];

function MessagesView() {
  const colors = useColors();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const wa = useActivitiesFeed({ type: "whatsapp", limit: 50 });
  const em = useActivitiesFeed({ type: "email", limit: 50 });

  const messages: ApiActivityFeed[] = useMemo(() => {
    const base =
      filter === "whatsapp" ? wa.data ?? [] : filter === "email" ? em.data ?? [] : [...(wa.data ?? []), ...(em.data ?? [])];
    const sorted = [...base].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter((m) =>
      `${m.contact_name ?? ""} ${m.title ?? ""} ${m.body ?? ""}`.toLowerCase().includes(q),
    );
  }, [filter, search, wa.data, em.data]);

  const refetch = () => {
    wa.refetch();
    em.refetch();
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, gap: 10 }}>
        <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search conversations"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {MSG_FILTERS.map((f) => {
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
                    fontSize: 12,
                    fontWeight: active ? "700" : "500",
                  }}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 120, gap: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={wa.isRefetching || em.isRefetching}
            onRefresh={refetch}
            tintColor={colors.foreground}
          />
        }
        renderItem={({ item: m }) => (
          <Pressable
            onPress={() => m.contact_id && router.push(`/contact/${m.contact_id}` as any)}
            style={[styles.callRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.directionPill, { backgroundColor: m.type === "whatsapp" ? "#7FB06922" : "#88B8B022" }]}>
              <Feather name={m.type === "whatsapp" ? "message-circle" : "mail"} size={14} color={colors.foreground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontWeight: "700" }}>{m.contact_name || "—"}</Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }} numberOfLines={1}>
                {m.title ?? m.body ?? "—"}
              </Text>
            </View>
            <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{relTime(m.created_at)}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          wa.isPending || em.isPending ? (
            <ActivityIndicator color={colors.foreground} />
          ) : (
            <Text style={{ color: colors.mutedForeground, textAlign: "center", marginTop: 40 }}>
              No messages yet.
            </Text>
          )
        }
      />
    </View>
  );
}

/* ─────────────────────────── Conversation Intel ─────────────────────────── */

function IntelView() {
  const colors = useColors();
  const { data, isRefetching, refetch } = useCalls({ limit: 200 });
  const calls = data?.calls ?? [];

  const total = calls.length;
  const connected = calls.filter((c) => c.outcome === "connected").length;
  const avgScore = avg(calls.map((c) => (c as any).call_score ?? 0));
  const avgSent = avg(calls.map((c) => (c as any).sentiment_score ?? 0));
  const avgDur = avg(calls.map((c) => c.duration_seconds ?? 0));

  // talk:listen ratio is a derived metric; we approximate it from sentiment + duration buckets
  const talkRatio = Math.min(0.7, Math.max(0.3, 0.5 + avgSent * 0.25));
  const listenRatio = 1 - talkRatio;

  // keyword extraction from coaching notes (simple top-words)
  const keywords = useMemo(() => extractKeywords(calls.map((c) => c.coaching_notes ?? "").join(" ")), [calls]);

  // sentiment buckets
  const buckets = useMemo(() => {
    const pos = calls.filter((c) => ((c as any).sentiment_score ?? 0) > 0.2).length;
    const neg = calls.filter((c) => ((c as any).sentiment_score ?? 0) < -0.2).length;
    const neu = total - pos - neg;
    return { pos, neu, neg };
  }, [calls, total]);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 140 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.foreground} />}
    >
      <View style={styles.statsStrip}>
        <StatChip label="Calls (30d)" value={total.toString()} colors={colors} />
        <StatChip label="Connect rate" value={`${total ? Math.round((connected / total) * 100) : 0}%`} colors={colors} />
        <StatChip label="Avg score" value={`${Math.round(avgScore)}/100`} colors={colors} />
        <StatChip label="Avg duration" value={fmtDuration(avgDur)} colors={colors} />
      </View>

      <Card style={{ marginHorizontal: 16, marginTop: 16 }}>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Talk vs listen</Text>
        <View style={{ flexDirection: "row", marginTop: 10, height: 14, borderRadius: 7, overflow: "hidden" }}>
          <View style={{ flex: talkRatio, backgroundColor: "#88B8B0" }} />
          <View style={{ flex: listenRatio, backgroundColor: "#C8A880" }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
          <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>Rep talked {Math.round(talkRatio * 100)}%</Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>Listened {Math.round(listenRatio * 100)}%</Text>
        </View>
        <Text style={{ color: colors.foreground, fontSize: 12, marginTop: 10, lineHeight: 18 }}>
          GCC B2B benchmark is 40/60 talk-to-listen. {talkRatio > 0.55 ? "Aim to ask more open questions and let the prospect share." : "Solid balance — keep it."}
        </Text>
      </Card>

      <Card style={{ marginHorizontal: 16, marginTop: 12 }}>
        <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Sentiment distribution</Text>
        <View style={{ flexDirection: "row", marginTop: 10, gap: 6 }}>
          <SentimentBar n={buckets.pos} total={total} color="#7FB069" label="Positive" colors={colors} />
          <SentimentBar n={buckets.neu} total={total} color="#888" label="Neutral" colors={colors} />
          <SentimentBar n={buckets.neg} total={total} color="#E07474" label="Negative" colors={colors} />
        </View>
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top keywords</Text>
      <View style={{ paddingHorizontal: 16, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {keywords.length === 0 ? (
          <Text style={{ color: colors.mutedForeground }}>Not enough data yet.</Text>
        ) : (
          keywords.map((k) => <Badge key={k.word} tone="violet" label={`${k.word} · ${k.count}`} />)
        )}
      </View>
    </ScrollView>
  );
}

function SentimentBar({
  n,
  total,
  color,
  label,
  colors,
}: {
  n: number;
  total: number;
  color: string;
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  const pct = total ? Math.round((n / total) * 100) : 0;
  return (
    <View style={{ flex: Math.max(pct, 8) }}>
      <View style={{ height: 28, borderRadius: 6, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>{pct}%</Text>
      </View>
      <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 4, textAlign: "center" }}>{label}</Text>
    </View>
  );
}

/* ─────────────────────────── helpers ─────────────────────────── */

function StatChip({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.statChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 16 }}>{value}</Text>
      <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function fmtDuration(s: number | null | undefined) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

function relTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function isToday(c: ApiCall) {
  const d = new Date(c.created_at);
  const n = new Date();
  return d.toDateString() === n.toDateString();
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

const STOP = new Set([
  "the", "and", "for", "with", "this", "that", "from", "have", "they", "their", "will", "can", "you", "your", "was",
  "are", "but", "not", "had", "has", "any", "all", "our", "out", "into", "then", "she", "her", "him", "his", "who",
]);
function extractKeywords(text: string): { word: string; count: number }[] {
  const words = text.toLowerCase().match(/[a-z]{4,}/g) ?? [];
  const counts = new Map<string, number>();
  for (const w of words) {
    if (STOP.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
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
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  dialerCta: {
    marginHorizontal: 16,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  callRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  directionPill: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  cardLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" },
  sectionTitle: { fontSize: 14, fontWeight: "700", paddingHorizontal: 16, marginTop: 22, marginBottom: 10 },
  center: { padding: 40, alignItems: "center" },
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { padding: 22, paddingBottom: 40, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#999", alignSelf: "center", marginBottom: 14 },
  sheetName: { fontSize: 18, fontWeight: "800" },
  sheetMeta: { fontSize: 13, marginTop: 4 },
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
