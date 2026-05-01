import React from "react";
import { Pressable, StyleProp, Text, ViewStyle, View } from "react-native";

import { ChameleonGradient } from "./ChameleonGradient";

export function ChameleonButton({
  label,
  onPress,
  icon,
  style,
  small,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      <ChameleonGradient
        radius={small ? 12 : 14}
        style={{
          paddingHorizontal: small ? 12 : 18,
          paddingVertical: small ? 8 : 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {icon ? <View>{icon}</View> : null}
        <Text
          style={{
            color: "#FFFFFF",
            fontFamily: "Inter_600SemiBold",
            fontSize: small ? 12 : 14,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      </ChameleonGradient>
    </Pressable>
  );
}
