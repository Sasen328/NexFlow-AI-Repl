/**
 * Mobile = the NexFlow web app, embedded as a full-screen WebView.
 *
 * Per direct user instruction ("push as is, one webpage in the app"),
 * the legacy native tab bar (Home / CRM / Contacts / Calls / Enrichment /
 * Assistant) has been removed. The mobile shell now renders the live web
 * experience, which already includes the AI assistant provider toggle, the
 * unified CRM (Contacts inside CRM), Sara/Maya personas, and the same
 * marketing vs sales role-aware navigation as on the web.
 *
 * The other files inside the (tabs) group remain on disk but are no longer
 * routed to — this layout only registers `index`, which renders the WebView.
 */

import { Stack } from "expo-router";
import React from "react";

export default function MobileShellLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
