/**
 * Persona switcher — compact avatar pill that opens a bottom sheet listing
 * the available personas (Sara — Sales, Maya — Marketing). Tapping a persona
 * persists the choice and closes the sheet.
 *
 * Mirrors the avatar dropdown in the web TopBar so the demo behaves the same
 * across platforms.
 */

import React, { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import { usePersona, type PersonaProfile, type RoleKey } from "@/lib/personas";

interface Props {
  /** Hide the textual label next to the avatar (use for compact spaces). */
  compact?: boolean;
}

export function PersonaSwitcher({ compact = false }: Props) {
  const colors = useColors();
  const { persona, list, setPersona } = usePersona();
  const [open, setOpen] = useState(false);

  const tap = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setOpen(true);
  };

  const pick = async (p: PersonaProfile) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    if (p.key !== persona.key) {
      await setPersona(p.key as RoleKey);
    }
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={tap}
        style={[
          s.trigger,
          { backgroundColor: colors.muted, borderColor: colors.border },
        ]}
        accessibilityLabel="Switch user persona"
        accessibilityRole="button"
      >
        <View style={[s.avatar, { backgroundColor: persona.accent }]}>
          <Text style={s.avatarText}>{persona.initials}</Text>
        </View>
        {!compact && (
          <Text style={[s.triggerLabel, { color: colors.foreground }]} numberOfLines={1}>
            {persona.name.split(" ")[0]}
          </Text>
        )}
        <Feather name="chevron-down" size={14} color={colors.mutedForeground} />
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[s.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[s.sheetTitle, { color: colors.foreground }]}>Switch user</Text>
            <Text style={[s.sheetSub, { color: colors.mutedForeground }]}>
              Demo personas — both share the same data, but each lands on a tailored experience.
            </Text>

            <View style={{ marginTop: 16, gap: 8 }}>
              {list.map((p) => {
                const active = p.key === persona.key;
                return (
                  <Pressable
                    key={p.key}
                    onPress={() => pick(p)}
                    style={[
                      s.row,
                      {
                        borderColor: active ? p.accent : colors.border,
                        backgroundColor: active ? `${p.accent}15` : "transparent",
                      },
                    ]}
                  >
                    <View style={[s.avatarLg, { backgroundColor: p.accent }]}>
                      <Text style={s.avatarLgText}>{p.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.rowName, { color: colors.foreground }]}>{p.name}</Text>
                      <Text style={[s.rowTitle, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {p.title}
                      </Text>
                      <Text style={[s.rowBlurb, { color: colors.mutedForeground }]} numberOfLines={2}>
                        {p.blurb}
                      </Text>
                    </View>
                    {active && <Feather name="check-circle" size={18} color={p.accent} />}
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => setOpen(false)}
              style={[s.closeBtn, { borderColor: colors.border }]}
            >
              <Text style={[s.closeBtnText, { color: colors.foreground }]}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 180,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#1F1B2E",
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },
  triggerLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    maxWidth: 90,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  sheet: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  sheetTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  sheetSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  avatarLg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLgText: {
    color: "#1F1B2E",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  rowName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  rowTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 1,
  },
  rowBlurb: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 4,
  },
  closeBtn: {
    marginTop: 16,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  closeBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
});
