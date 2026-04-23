import React from "react";
import { StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

type Props = ViewProps & { padded?: boolean; style?: ViewStyle | ViewStyle[] };

export function Card({ children, padded = true, style, ...rest }: Props) {
  const colors = useColors();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          padding: padded ? 16 : 0,
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 4 },
        },
        style as ViewStyle,
      ]}
    >
      {children}
    </View>
  );
}

export const cardStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
});
