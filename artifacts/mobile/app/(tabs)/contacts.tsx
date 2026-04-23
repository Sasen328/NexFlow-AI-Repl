import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { initials, useContacts, type ApiContact } from "@/lib/api";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "qualified", label: "Qualified" },
  { key: "lead", label: "Lead" },
  { key: "customer", label: "Customer" },
];

export default function ContactsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data, isPending, isError, refetch, isRefetching } = useContacts({ limit: 100 });

  const filtered = useMemo<ApiContact[]>(() => {
    const all = data?.contacts ?? [];
    return all.filter((c) => {
      if (filter !== "all" && (c.status || "").toLowerCase() !== filter) return false;
      if (
        search &&
        !`${c.first_name} ${c.last_name} ${c.company_name || ""}`.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, search, filter]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
      }}
    >
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

      {isPending ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.mutedForeground} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 10 }}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name={isError ? "wifi-off" : "users"} size={28} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {isError ? "Couldn't load contacts." : "No contacts match."}
              </Text>
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
              <Avatar initials={initials(c.first_name, c.last_name)} size={48} />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.cName, { color: colors.foreground }]}>
                    {c.first_name} {c.last_name}
                  </Text>
                  {c.status === "qualified" && <Badge label="QUALIFIED" tone="violet" small />}
                  {c.status === "customer" && <Badge label="CUSTOMER" tone="success" small />}
                </View>
                <Text style={[styles.cSub, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {(c.title || "—") + (c.company_name ? ` · ${c.company_name}` : "")}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 2 }}>
                  {c.phone ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Feather name="phone" size={10} color={colors.mutedForeground} />
                      <Text style={[styles.cMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {c.phone}
                      </Text>
                    </View>
                  ) : null}
                  {c.email ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 }}>
                      <Feather name="mail" size={10} color={colors.mutedForeground} />
                      <Text style={[styles.cMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {c.email}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <View style={[styles.scoreCircle, { borderColor: "#B8A0C8" }]}>
                  <Text style={{ fontFamily: "Inter_700Bold", fontSize: 11, color: "#8C6FA8" }}>
                    {c.lead_score ?? 0}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.2 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, marginTop: 2 },
  fab: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14, paddingVertical: 0 },
  chip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  contactCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 18, borderWidth: 1 },
  cName: { fontFamily: "Inter_700Bold", fontSize: 15 },
  cSub: { fontFamily: "Inter_400Regular", fontSize: 12 },
  cMeta: { fontFamily: "Inter_500Medium", fontSize: 11 },
  scoreCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  empty: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyText: { fontFamily: "Inter_500Medium", fontSize: 14 },
});
