/**
 * Mobile persona / role shim.
 *
 * Mirrors `artifacts/nexflow/src/lib/marketing-auth.ts` on the web side so
 * that switching personas on mobile feels identical to the web app. Persisted
 * via AsyncStorage so the choice survives app restarts.
 *
 * Two demo personas are exposed (matching the agreed plan):
 *   • Sara — Sales (default)
 *   • Maya — Marketing
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const KEY_ROLE = "nf:role";
const KEY_SIGNED_IN = "nf:signed-in";

export type RoleKey = "sales" | "marketing";

export interface PersonaProfile {
  key: RoleKey;
  label: string;       // "Sales Rep"
  name: string;        // "Sara Al-Otaibi"
  initials: string;    // "SA"
  email: string;
  title: string;
  accent: string;      // hex
  blurb: string;
  /** Default landing tab inside the (tabs) router. */
  landingTab: "index" | "pipeline" | "contacts" | "calls" | "agents";
}

export const PERSONAS: Record<RoleKey, PersonaProfile> = {
  sales: {
    key: "sales",
    label: "Sales Rep",
    name: "Sara Al-Otaibi",
    initials: "SA",
    email: "sara.sales@nexflow.demo",
    title: "Account Executive · KSA Enterprise",
    accent: "#88B8B0",
    blurb: "Power-dial top leads, close deals, never log a call manually.",
    landingTab: "index",
  },
  marketing: {
    key: "marketing",
    label: "Marketing Lead",
    name: "Maya Al-Qahtani",
    initials: "MQ",
    email: "maya.marketing@nexflow.demo",
    title: "Director of Marketing",
    accent: "#B8B880",
    blurb: "Run multi-channel campaigns and reactivate dormant leads.",
    landingTab: "agents", // marketing persona lives in the AI/Agents surface
  },
};

export const PERSONA_LIST: PersonaProfile[] = [PERSONAS.sales, PERSONAS.marketing];

// ── Storage ────────────────────────────────────────────────────────────────
async function readStoredRole(): Promise<RoleKey> {
  try {
    const v = await AsyncStorage.getItem(KEY_ROLE);
    if (v === "sales" || v === "marketing") return v;
  } catch {
    /* AsyncStorage unavailable (e.g. SSR / web build). Fall through. */
  }
  return "sales";
}

async function writeStoredRole(role: RoleKey): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_ROLE, role);
  } catch {
    /* no-op */
  }
}

async function readStoredSignedIn(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY_SIGNED_IN);
    return v === "1";
  } catch {
    return false;
  }
}

async function writeStoredSignedIn(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_SIGNED_IN, value ? "1" : "0");
  } catch {
    /* no-op */
  }
}

// ── Pub-sub (so all hooks see updates instantly) ───────────────────────────
type Listener = (role: RoleKey, signedIn: boolean) => void;
const listeners = new Set<Listener>();
let currentRole: RoleKey = "sales";
let currentSignedIn = false;
let hydrated = false;

// Hydrate on first import. Best-effort; safe if it races.
Promise.all([readStoredRole(), readStoredSignedIn()]).then(([r, s]) => {
  currentRole = r;
  currentSignedIn = s;
  hydrated = true;
  for (const l of listeners) l(r, s);
});

export function getPersona(): PersonaProfile {
  return PERSONAS[currentRole];
}

export async function setPersona(role: RoleKey): Promise<void> {
  if (role !== "sales" && role !== "marketing") return;
  currentRole = role;
  await writeStoredRole(role);
  for (const l of listeners) l(role, currentSignedIn);
}

/** Mark the user as signed in (after they pick a role on the sign-in screen). */
export async function signIn(role: RoleKey): Promise<void> {
  if (role !== "sales" && role !== "marketing") return;
  currentRole = role;
  currentSignedIn = true;
  await Promise.all([writeStoredRole(role), writeStoredSignedIn(true)]);
  for (const l of listeners) l(role, true);
}

/** Sign out — clears the signed-in flag but keeps the last-used role. */
export async function signOut(): Promise<void> {
  currentSignedIn = false;
  await writeStoredSignedIn(false);
  for (const l of listeners) l(currentRole, false);
}

// ── Hook ───────────────────────────────────────────────────────────────────
/**
 * `usePersona()` returns the live persona profile, a setter, and the
 * sign-in state. The component re-renders whenever any other code calls
 * `setPersona(...)`, `signIn(...)`, or `signOut(...)`.
 */
export function usePersona() {
  const [role, setRoleState] = useState<RoleKey>(currentRole);
  const [signedIn, setSignedInState] = useState<boolean>(currentSignedIn);
  const [ready, setReady] = useState<boolean>(hydrated);

  useEffect(() => {
    const listener: Listener = (r, s) => {
      setRoleState(r);
      setSignedInState(s);
      setReady(true);
    };
    listeners.add(listener);
    // Refresh once on mount in case the async hydration completed
    // between import and mount.
    setRoleState(currentRole);
    setSignedInState(currentSignedIn);
    setReady(hydrated);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    role,
    persona: PERSONAS[role],
    setPersona,
    signIn,
    signOut,
    signedIn,
    ready,
    list: PERSONA_LIST,
  };
}
