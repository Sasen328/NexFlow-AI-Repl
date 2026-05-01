import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export type SubTab<T extends string> = { key: T; label: string };

export function SubTabs<T extends string>({
  value,
  tabs,
  onChange,
}: {
  value: T;
  tabs: SubTab<T>[];
  onChange: (k: T) => void;
}) {
  const colors = useColors();
  return (
    <View style={[styles.wrap, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {tabs.map((t) => {
          const active = value === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => onChange(t.key)}
              style={({ pressed }) => [
                styles.pill,
                {
                  backgroundColor: active ? colors.foreground : "transparent",
                  borderColor: active ? colors.foreground : colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? colors.background : colors.foreground,
                  fontWeight: active ? "700" : "500",
                  fontSize: 13,
                }}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: StyleSheet.hairlineWidth },
  row: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: "center" },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
});
