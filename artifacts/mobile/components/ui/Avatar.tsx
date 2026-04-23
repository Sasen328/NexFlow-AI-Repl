import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const PALETTE = ["#B8A0C8", "#88B8B0", "#C8A880", "#E6A971", "#7FB069"];

export function Avatar({ initials, size = 44 }: { initials: string; size?: number }) {
  const colors = useColors();
  const idx = initials.charCodeAt(0) % PALETTE.length;
  const bg = PALETTE[idx];
  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg + "33", borderColor: bg }]}>
      <Text style={[styles.text, { fontSize: size * 0.36, color: bg }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  text: { fontFamily: "Inter_700Bold" },
});
