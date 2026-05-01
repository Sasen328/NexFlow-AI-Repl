/**
 * Bottom tab bar — role-aware, mirrors the web TopNav exactly.
 *
 * Same architecture as `artifacts/nexflow/src/lib/sections.ts`:
 *   • Sales rep (Sara)  → Home · CRM · Comms · Enrichment · Marketing
 *   • Marketing (Maya)  → Home · Marketing · Insights · Enrichment · Assistant
 *
 * All tab routes are registered up-front; `href: null` hides the ones the
 * current persona shouldn't see while keeping them deep-linkable.
 */

import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { useColors } from "@/hooks/useColors";
import { usePersona } from "@/lib/personas";

export default function TabsLayout() {
  const colors = useColors();
  const { role } = usePersona();
  const isSales = role === "sales";

  const hide = { href: null as null } as const;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
        },
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 10 },
      }}
    >
      {/* ── Always visible ───────────────────────────────────────────── */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />

      {/* ── Sales-only tabs ──────────────────────────────────────────── */}
      <Tabs.Screen
        name="pipeline"
        options={
          isSales
            ? {
                title: "CRM",
                tabBarIcon: ({ color, size }) => (
                  <Feather name="git-branch" size={size} color={color} />
                ),
              }
            : hide
        }
      />
      <Tabs.Screen
        name="calls"
        options={
          isSales
            ? {
                title: "Comms",
                tabBarIcon: ({ color, size }) => (
                  <Feather name="phone" size={size} color={color} />
                ),
              }
            : hide
        }
      />

      {/* ── Common ───────────────────────────────────────────────────── */}
      <Tabs.Screen
        name="enrichment"
        options={{
          title: "Enrichment",
          tabBarIcon: ({ color, size }) => (
            <Feather name="zap" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="marketing"
        options={{
          title: "Growth",
          tabBarIcon: ({ color, size }) => (
            <Feather name="trending-up" size={size} color={color} />
          ),
        }}
      />

      {/* ── Marketing-only tabs ──────────────────────────────────────── */}
      <Tabs.Screen
        name="insights"
        options={
          !isSales
            ? {
                title: "Insights",
                tabBarIcon: ({ color, size }) => (
                  <Feather name="bar-chart-2" size={size} color={color} />
                ),
              }
            : hide
        }
      />
      <Tabs.Screen
        name="agents"
        options={
          !isSales
            ? {
                title: "Assistant",
                tabBarIcon: ({ color, size }) => (
                  <Feather name="message-circle" size={size} color={color} />
                ),
              }
            : hide
        }
      />

      {/* ── Always hidden — accessible via deep links from screens ───── */}
      <Tabs.Screen name="contacts" options={hide} />
    </Tabs>
  );
}
