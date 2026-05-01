import React from "react";
import { Platform, StyleProp, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";

import { useColors } from "@/hooks/useColors";

export function GlassCard({
  children,
  style,
  intensity = 28,
  padded = true,
  borderColor,
  background,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  padded?: boolean;
  borderColor?: string;
  background?: string;
}) {
  const colors = useColors();
  const fallbackBg = background ?? "rgba(255,255,255,0.78)";
  const border = borderColor ?? "rgba(184,160,200,0.32)";

  const inner: ViewStyle = {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: border,
    overflow: "hidden",
    padding: padded ? 16 : 0,
    backgroundColor: Platform.OS === "android" ? colors.card : "transparent",
  };

  if (Platform.OS === "android") {
    // BlurView is unreliable on Android — fall back to a soft solid card.
    return <View style={[inner, { backgroundColor: fallbackBg }, style]}>{children}</View>;
  }

  return (
    <BlurView intensity={intensity} tint="light" style={[inner, style]}>
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: fallbackBg }}
        pointerEvents="none"
      />
      <View>{children}</View>
    </BlurView>
  );
}
