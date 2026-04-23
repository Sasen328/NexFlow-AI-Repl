import React, { useMemo, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { CONTACTS, formatCurrency } from "@/data/mockData";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "buying-now", label: "Buying" },
  { key: "warm", label: "Warm" },
  { key: "cold", label: "Cold" },
];

export default function ContactsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return CONTACTS.filter((c) => {
      if (filter !== "all" && c.stage !== filter) return false;
      if (search && !`${c.firstName} ${c.lastName} ${c.company}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, filter]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }}>
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
          <View>
            <Text style={[styles.kicker, { color: colors.mutedForeground }]}>CRM</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Contacts</Text>
          </View>
          <Pressable
            style={[styles.fab, { backgroundColor: "#88B8B0" }]}
            onPress={() => router.push("/sourcing" as any)}
          >
            <Feather name="user-plus" size={18} color="#fff" />
          </Pressable>
        </View>

        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search contacts, companies…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>

        <FlatList
          data={FILTERS}
          horizontal
          keyExtractor={(i) => i.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          renderItem={({ item }) => {
            const active = item.key === filter;
            return (
              <Pressable
                onPress={() => setFilter(item.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? "#1C1A24" : colors.card,
                    borderColor: active ? "#1C1A24" : colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: active ? "#fff" : colors.foreground }]}>{item.label}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 10 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="users" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No contacts match.</Text>
          </View>
        }
        renderItem={({ item: c }) => (
          <Pressable
            onPress={() => router.push(`/contact/${c.id}` as any)}
            style={({ pressed }) => [
              styles.contactCard,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Avatar initials={c.initials} size={48} />
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={[styles.cName, { color: colors.foreground }]}>
                  {c.firstName} {c.lastName}
                </Text>
                {c.stage === "buying-now" && <Badge label="BUYING" tone="violet" small />}
                {c.stage === "champion" && <Badge label="CHAMPION" tone="success" small />}
              </View>
              <Text style={[styles.cSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                {c.title} · {c.company}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Feather name="map-pin" size={10} color={colors.mutedForeground} />
                  <Text style={[styles.cMeta, { color: colors.mutedForeground }]}>{c.location.split(",")[0]}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Feather name="clock" size={10} color={colors.mutedForeground} />
                  <Text style={[styles.cMeta, { color: colors.mutedForeground }]}>{c.lastContactDays}d ago</Text>
                </View>
              </View>
            </View>
            <View style={{ alignItems: "flex-end", gap: 6 }}>
              <Text style={[styles.cValue, { color: "#88B8B0" }]}>{formatCurrency(c.pipelineValue)}</Text>
              <View style={[styles.scoreCircle, { borderColor: "#B8A0C8" }]}>
                <Text style={{ fontFamily: "Inter_700Bold", fontSize: 11, color: "#8C6FA8" }}>{c.leadScore}</Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.2 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, marginTop: 2 },
  fab: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  searchInput: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14, paddingVertical: 0 },
  chip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  contactCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 18, borderWidth: 1 },
  cName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  cSub: { fontFamily: "Inter_400Regular", fontSize: 12 },
  cMeta: { fontFamily: "Inter_500Medium", fontSize: 11 },
  cValue: { fontFamily: "Inter_700Bold", fontSize: 13 },
  scoreCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { fontFamily: "Inter_500Medium", fontSize: 14 },
});
