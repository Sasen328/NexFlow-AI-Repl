import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

export function StatTile({
  icon,
  value,
  label,
  tone = "violet",
}: {
  icon: keyof typeof Feather.glyphMap;
  value: string | number;
  label: string;
  tone?: "violet" | "teal" | "gold" | "danger";
}) {
  const colors = useColors();
  const accent = { violet: "#B8A0C8", teal: "#88B8B0", gold: "#C8A880", danger: "#E07474" }[tone];
  return (
    <View style={[styles.tile, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: accent + "22" }]}>
        <Feather name={icon} size={16} color={accent} />
      </View>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1, gap: 6 },
  iconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  value: { fontFamily: "Inter_700Bold", fontSize: 20 },
  label: { fontFamily: "Inter_500Medium", fontSize: 11 },
});
