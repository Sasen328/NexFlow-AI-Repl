import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleProp, ViewStyle, View } from "react-native";

const CHAMELEON = [
  "#B8A0C8",
  "#C0A0B8",
  "#88B8B0",
  "#90B8B8",
  "#B8B880",
  "#C8A880",
  "#B8A0C8",
] as const;

export function ChameleonGradient({
  style,
  children,
  radius,
  soft,
}: {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  radius?: number;
  soft?: boolean;
}) {
  const colors = soft
    ? (["#F4EEFF", "#EAF7F5", "#FFF8EE", "#FFF4EA"] as const)
    : CHAMELEON;
  return (
    <LinearGradient
      colors={colors as unknown as readonly [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.6 }}
      style={[{ borderRadius: radius ?? 18 }, style]}
    >
      {children}
    </LinearGradient>
  );
}

export function ChameleonBorder({
  style,
  children,
  radius = 18,
  borderWidth = 1.4,
  background = "#FFFFFF",
}: {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  radius?: number;
  borderWidth?: number;
  background?: string;
}) {
  return (
    <ChameleonGradient style={[{ borderRadius: radius, padding: borderWidth }, style]} radius={radius}>
      <View style={{ borderRadius: radius - borderWidth, backgroundColor: background, overflow: "hidden" }}>
        {children}
      </View>
    </ChameleonGradient>
  );
}
