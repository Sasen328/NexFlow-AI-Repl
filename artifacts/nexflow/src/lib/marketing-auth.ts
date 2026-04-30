/* Lightweight client-side persona/auth shim for the demo. */

const KEY_SIGNED = "nf:signedIn";
const KEY_ROLE = "nf:role";

export type RoleKey = "sales" | "manager" | "ceo" | "admin" | "marketing";

export interface RoleProfile {
  key: RoleKey;
  label: string;       // "Sales Rep"
  name: string;        // "Khalid Al-Otaibi"
  initials: string;    // "KO"
  email: string;       // demo email
  title: string;       // job title
  accent: string;      // hex
  blurb: string;       // 1-line job description
  /** What surfaces this persona lives in most. Used to set the default landing page. */
  landingHref: string;
}

export const ROLES: Record<RoleKey, RoleProfile> = {
  sales: {
    key: "sales",
    label: "Sales Rep",
    name: "Khalid Al-Otaibi",
    initials: "KO",
    email: "sales@nexflow.demo",
    title: "Account Executive · KSA Enterprise",
    accent: "#88B8B0",
    blurb: "Power-dial top leads, close deals, never log a call manually.",
    // Sales reps start their day with the briefing → call list.
    landingHref: "/home",
  },
  manager: {
    key: "manager",
    label: "Sales Manager",
    name: "Layla Al-Sabah",
    initials: "LS",
    email: "manager@nexflow.demo",
    title: "Head of Sales · Gulf Region",
    accent: "#B8A0C8",
    blurb: "Forecast, coach, and rescue at-risk deals across the team.",
    // Managers start with the team briefing (KPIs are coaching-tuned).
    landingHref: "/home",
  },
  ceo: {
    key: "ceo",
    label: "CEO",
    name: "Faisal Al-Harbi",
    initials: "FH",
    email: "ceo@nexflow.demo",
    title: "Chief Executive Officer",
    accent: "#C0A0B8",
    blurb: "Revenue, market signals, board-ready answers in one place.",
    // CEO drops straight into the executive dashboards view.
    landingHref: "/insights/dashboards",
  },
  admin: {
    key: "admin",
    label: "CRM Admin",
    name: "Sara Al-Mansouri",
    initials: "SM",
    email: "admin@nexflow.demo",
    title: "Head of RevOps & CRM Administration",
    accent: "#C8A880",
    blurb: "Data hygiene, automations, dedup, and lead routing.",
    // Admin lands on Data Hub segments — closest to data-hygiene work.
    landingHref: "/datahub/segments",
  },
  marketing: {
    key: "marketing",
    label: "Marketing Lead",
    name: "Reem Al-Qahtani",
    initials: "RQ",
    email: "marketing@nexflow.demo",
    title: "Director of Marketing",
    accent: "#B8B880",
    blurb: "Run multi-channel campaigns and reactivate dormant leads.",
    // Marketing lands on the campaign-centric dashboard, not the sales briefing.
    landingHref: "/marketing-dashboard",
  },
};

export const ROLE_LIST: RoleProfile[] = [
  ROLES.sales,
  ROLES.manager,
  ROLES.ceo,
  ROLES.admin,
  ROLES.marketing,
];

export function isSignedIn(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY_SIGNED) === "1";
}

export function setSignedIn(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) window.localStorage.setItem(KEY_SIGNED, "1");
  else {
    window.localStorage.removeItem(KEY_SIGNED);
    window.localStorage.removeItem(KEY_ROLE);
  }
}

export function getRoleKey(): RoleKey {
  if (typeof window === "undefined") return "sales";
  const v = window.localStorage.getItem(KEY_ROLE) as RoleKey | null;
  return v && v in ROLES ? v : "sales";
}

export function getRole(): RoleProfile {
  return ROLES[getRoleKey()];
}

export function setRole(role: RoleKey) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_ROLE, role);
  // notify listeners in the same tab
  window.dispatchEvent(new CustomEvent("nf:role-change", { detail: role }));
}

/** Sign in (or switch) to a given persona in one call. */
export function signInAs(role: RoleKey) {
  setRole(role);
  setSignedIn(true);
}
