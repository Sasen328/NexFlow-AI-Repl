/**
 * Mobile root screen — embeds the live NexFlow web app full-screen.
 *
 * The web app already ships:
 *   • the AI assistant model toggle (Auto / Claude / GPT-4o / Gemini /
 *     Perplexity) on /assistant and /marketing-assistant,
 *   • two demo personas (Sara Al-Otaibi / Sales, Maya Al-Qahtani / Marketing),
 *   • role-aware navigation (sales sees CRM + Contacts + Enrichment + Calls;
 *     marketing sees Marketing Hub + Insights),
 *   • unified CRM (Contacts live inside the CRM module).
 *
 * Embedding it directly via WebView guarantees mobile = web at all times,
 * with zero re-implementation drift.
 */

import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";

// react-native-webview doesn't support the "web" platform, so we lazy-load it
// only on native. On web (Replit preview pane / Expo web) we render a plain
// iframe directly, which is what the WebView itself does on native.
const WebViewNative: any =
  Platform.OS === "web" ? null : require("react-native-webview").WebView;

/**
 * Resolve the web URL the mobile shell should load.
 * Priority:
 *   1. EXPO_PUBLIC_WEB_URL (explicit override, e.g. production custom domain)
 *   2. EXPO_PUBLIC_DOMAIN  (set by the dev workflow to $REPLIT_DEV_DOMAIN)
 *   3. fallback: localhost (web preview only)
 */
function resolveWebUrl(): string {
  const explicit = process.env.EXPO_PUBLIC_WEB_URL;
  if (explicit) return explicit.startsWith("http") ? explicit : `https://${explicit}`;
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/`;
  return "http://localhost/";
}

export default function MobileWebShell() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const webRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  const url = resolveWebUrl();

  const reload = () => {
    setErrored(null);
    setLoading(true);
    if (Platform.OS === "web") {
      if (iframeRef.current) iframeRef.current.src = url;
    } else {
      webRef.current?.reload();
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {Platform.OS === "web" ? (
        // RNWeb branch — fixed-positioned iframe filling the viewport so we
        // sidestep RNWeb's flex/height resolution entirely.
        React.createElement("iframe", {
          ref: iframeRef,
          src: url,
          title: "NexFlow",
          onLoad: () => setLoading(false),
          onError: () => { setLoading(false); setErrored("Failed to load NexFlow"); },
          style: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            border: "0",
            display: "block",
            backgroundColor: "white",
            zIndex: 1,
          },
        })
      ) : (
        <WebViewNative
          ref={webRef}
          source={{ uri: url }}
          onNavigationStateChange={(e: any) => setCanGoBack(!!e?.canGoBack)}
          onLoadStart={() => { setLoading(true); setErrored(null); }}
          onLoadEnd={() => setLoading(false)}
          onError={(e: any) => {
            setLoading(false);
            setErrored(e?.nativeEvent?.description ?? "Failed to load NexFlow");
          }}
          onHttpError={(e: any) => {
            setLoading(false);
            setErrored(`HTTP ${e?.nativeEvent?.statusCode ?? "?"} loading NexFlow`);
          }}
          startInLoadingState={false}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={["*"]}
          pullToRefreshEnabled
          style={styles.webview}
        />
      )}

      {loading && !errored && (
        <View pointerEvents="none" style={styles.loaderOverlay}>
          <View style={[styles.loaderPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator size="small" color={colors.foreground} />
            <Text style={[styles.loaderText, { color: colors.mutedForeground }]}>
              Loading NexFlow…
            </Text>
          </View>
        </View>
      )}

      {errored && (
        <View style={[styles.errorOverlay, { backgroundColor: colors.background }]}>
          <Feather name="cloud-off" size={32} color={colors.mutedForeground} />
          <Text style={[styles.errorTitle, { color: colors.foreground }]}>Can't reach NexFlow</Text>
          <Text style={[styles.errorBody, { color: colors.mutedForeground }]}>{errored}</Text>
          <Text style={[styles.errorUrl, { color: colors.mutedForeground }]} numberOfLines={1}>
            {url}
          </Text>
          <Pressable
            onPress={reload}
            style={({ pressed }) => [
              styles.retryBtn,
              { backgroundColor: colors.foreground, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Feather name="refresh-cw" size={14} color={colors.background} />
            <Text style={[styles.retryText, { color: colors.background }]}>Retry</Text>
          </Pressable>
        </View>
      )}

      {canGoBack && Platform.OS !== "web" && (
        <Pressable
          onPress={() => webRef.current?.goBack()}
          style={({ pressed }) => [
            styles.backFab,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              bottom: insets.bottom + 16,
              opacity: pressed ? 0.6 : 1,
            },
          ]}
          accessibilityLabel="Go back in NexFlow"
        >
          <Feather name="chevron-left" size={20} color={colors.foreground} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webview: { flex: 1, backgroundColor: "transparent" },

  loaderOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 60,
  },
  loaderPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  loaderText: { fontFamily: "Inter_500Medium", fontSize: 12 },

  errorOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  errorTitle: { fontFamily: "Inter_700Bold", fontSize: 18, marginTop: 4 },
  errorBody: { fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center" },
  errorUrl: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 4, maxWidth: "100%" },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 12,
  },
  retryText: { fontFamily: "Inter_700Bold", fontSize: 13 },

  backFab: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
