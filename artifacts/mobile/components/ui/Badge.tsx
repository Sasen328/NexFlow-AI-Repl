import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type Tone = "neutral" | "violet" | "teal" | "gold" | "danger" | "success";

export function Badge({ label, tone = "neutral", small }: { label: string; tone?: Tone; small?: boolean }) {
  const colors = useColors();
  const map: Record<Tone, { bg: string; fg: string }> = {
    neutral: { bg: colors.muted, fg: colors.mutedForeground },
    violet: { bg: "#B8A0C822", fg: "#8C6FA8" },
    teal: { bg: "#88B8B022", fg: "#5C8E86" },
    gold: { bg: "#C8A88022", fg: "#A07F4D" },
    danger: { bg: "#E0747422", fg: "#B85454" },
    success: { bg: "#7FB06922", fg: "#5C8C4A" },
  };
  const { bg, fg } = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg, paddingVertical: small ? 2 : 4, paddingHorizontal: small ? 6 : 8 }]}>
      <Text style={[styles.text, { color: fg, fontSize: small ? 10 : 11 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 999, alignSelf: "flex-start" },
  text: { fontFamily: "Inter_600SemiBold", letterSpacing: 0.2 },
});
