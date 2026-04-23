import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";

const NOTIFS = [
  { icon: "trending-up" as const, title: "Gulf Ventures closed $50M Series B", time: "14h", color: "#C8A880", unread: true },
  { icon: "phone-incoming" as const, title: "Inbound call from Aramco — handled by AI Voice Agent Layla", time: "2h", color: "#88B8B0", unread: true },
  { icon: "alert-triangle" as const, title: "Layla Hassan deal score dropped 72 → 65", time: "5h", color: "#E07474", unread: true },
  { icon: "user-plus" as const, title: "12 new prospects matched your saved search ‘GCC SaaS VPs of Sales’", time: "8h", color: "#B8A0C8", unread: true },
  { icon: "message-circle" as const, title: "WhatsApp reply from Mohammed — “Send revised pricing”", time: "1d", color: "#7FB069", unread: false },
];

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="chevron-left" size={20} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: colors.mutedForeground }]}>INBOX</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
          </View>
          <Pressable>
            <Text style={[styles.linkText, { color: "#88B8B0" }]}>Mark all read</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {NOTIFS.map((n, i) => (
            <Card key={i} style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
              <View style={[styles.notifIcon, { backgroundColor: n.color + "22" }]}>
                <Feather name={n.icon} size={16} color={n.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.notifText, { color: colors.foreground }]}>{n.title}</Text>
                <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{n.time} ago</Text>
              </View>
              {n.unread && <View style={[styles.unreadDot, { backgroundColor: "#B8A0C8" }]} />}
            </Card>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  kicker: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.2 },
  title: { fontFamily: "Inter_700Bold", fontSize: 22, marginTop: 2 },
  linkText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  notifIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  notifText: { fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 18 },
  notifTime: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
});
