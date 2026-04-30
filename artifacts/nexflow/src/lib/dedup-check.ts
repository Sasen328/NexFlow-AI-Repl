/**
 * Lightweight dedup check used by the Push-to-CRM flow.
 *
 * Compares an enrichment hit against the contacts already in CRM
 * (live from /api/contacts). Returns one of:
 *   - duplicate  → exact email or (first+last name AND company) match
 *   - possible   → fuzzy name match within the same company / domain
 *   - new        → no overlap detected
 *
 * Implemented client-side so every enrichment surface can call it
 * without each one reinventing the wheel and without an extra round-trip.
 */

import { apiFetch } from "@/hooks/useApi";

export type DedupVerdict =
  | { status: "duplicate"; matchName: string; contactId?: string }
  | { status: "possible";  matchName: string; contactId?: string }
  | { status: "new" };

interface ProbeInput {
  name?: string;
  email?: string;
  company?: string;
}

let CONTACT_CACHE: { ts: number; rows: any[] } | null = null;
const TTL_MS = 30_000;

async function getContacts(): Promise<any[]> {
  const now = Date.now();
  if (CONTACT_CACHE && now - CONTACT_CACHE.ts < TTL_MS) return CONTACT_CACHE.rows;
  try {
    const r: any = await apiFetch("/contacts");
    const rows = Array.isArray(r) ? r : Array.isArray(r?.contacts) ? r.contacts : [];
    CONTACT_CACHE = { ts: now, rows };
    return rows;
  } catch {
    CONTACT_CACHE = { ts: now, rows: [] };
    return [];
  }
}

function normalize(s?: string | null): string {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function nameKey(s?: string | null): string {
  return (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function emailDomain(e?: string | null): string {
  const m = (e ?? "").toLowerCase().match(/@(.+)$/);
  return m?.[1] ?? "";
}

export async function dedupCheck(probe: ProbeInput): Promise<DedupVerdict> {
  if (!probe.name && !probe.email && !probe.company) return { status: "new" };
  const contacts = await getContacts();
  if (contacts.length === 0) return { status: "new" };

  const probeEmail = normalize(probe.email);
  const probeName  = nameKey(probe.name);
  const probeCo    = normalize(probe.company);
  const probeDom   = emailDomain(probe.email);

  let best: { contact: any; reason: "email" | "namecompany" | "fuzzy" } | null = null;

  for (const c of contacts) {
    const cEmail = normalize(c.email);
    const cName  = nameKey([c.first_name, c.last_name].filter(Boolean).join(" ") || c.name);
    const cCo    = normalize(c.company_name ?? c.company);

    if (probeEmail && cEmail && probeEmail === cEmail) {
      return {
        status: "duplicate",
        matchName: cName || c.email,
        contactId: c.id,
      };
    }
    if (probeName && cName && probeName === cName && probeCo && cCo && probeCo === cCo) {
      return {
        status: "duplicate",
        matchName: cName,
        contactId: c.id,
      };
    }
    if (probeName && cName) {
      const sameCompany = probeCo && cCo && probeCo === cCo;
      const sameDomain  = probeDom && emailDomain(c.email) === probeDom;
      const lastNameMatches = probeName.split(" ").slice(-1)[0] === cName.split(" ").slice(-1)[0];
      if (lastNameMatches && (sameCompany || sameDomain)) {
        best = { contact: c, reason: "fuzzy" };
      }
    }
  }

  if (best) {
    const cName = nameKey([best.contact.first_name, best.contact.last_name].filter(Boolean).join(" ") || best.contact.name);
    return { status: "possible", matchName: cName, contactId: best.contact.id };
  }
  return { status: "new" };
}

export function clearDedupCache() {
  CONTACT_CACHE = null;
}
