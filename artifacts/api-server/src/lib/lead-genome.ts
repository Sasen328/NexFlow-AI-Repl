// ─── LEAD GENOME ENGINE — Dedup Index + Hunt + Lists ─────────────────────────
//
//  Dedup       │ Normalized name/domain/phone/email matching
//  Hunt        │ Search across leads, contacts, masaar, builder tables
//  Lists       │ Lead list CRUD using lead_lists + lead_list_items tables
//
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "@workspace/db";
import {
  leadFingerprintsTable,
  leadsTable,
  lead_lists,
  lead_list_items,
  masar_companies,
  builder_companies,
  contacts,
} from "@workspace/db";
import { eq, ilike, or, and, desc, sql } from "drizzle-orm";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GenomeInput {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  company?: string;
  email?: string;
  linkedinUrl?: string;
  phone?: string;
  jobTitle?: string;
  city?: string;
  crNumber?: string;
  sourceTable?: string;
  sourceId?: number;
}

export interface DuplicateMatch {
  existingId: number;
  similarity: string;
  isDuplicate: boolean;
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ").replace(/[^\w\s]/g, "");
}

function normalizeDomain(email: string): string {
  const parts = email.toLowerCase().trim().split("@");
  return parts.length > 1 ? parts[1] : "";
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^00966/, "966").replace(/^0/, "966");
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// ─── Dedup Check ──────────────────────────────────────────────────────────────

/** Check if a lead already exists by normalized fields. */
export async function checkDuplicate(input: GenomeInput): Promise<DuplicateMatch | null> {
  const name  = normalizeName(input.fullName || `${input.firstName || ""} ${input.lastName || ""}`.trim());
  const email = input.email ? normalizeEmail(input.email) : null;
  const phone = input.phone ? normalizePhone(input.phone) : null;

  // Exact email match
  if (email) {
    const rows = await db.select().from(leadFingerprintsTable)
      .where(eq(leadFingerprintsTable.emailNormalized!, email)).limit(1);
    if (rows.length > 0) return { existingId: rows[0]!.id, similarity: "email_exact", isDuplicate: true };
  }

  // Exact phone match
  if (phone && phone.length >= 9) {
    const rows = await db.select().from(leadFingerprintsTable)
      .where(eq(leadFingerprintsTable.phoneNormalized!, phone)).limit(1);
    if (rows.length > 0) return { existingId: rows[0]!.id, similarity: "phone_exact", isDuplicate: true };
  }

  // Normalized name + domain match
  if (name && email) {
    const domain = normalizeDomain(email);
    const rows = await db.select().from(leadFingerprintsTable)
      .where(and(eq(leadFingerprintsTable.normalizedName!, name), eq(leadFingerprintsTable.domain!, domain))).limit(1);
    if (rows.length > 0) return { existingId: rows[0]!.id, similarity: "name_domain", isDuplicate: true };
  }

  return null;
}

// ─── Save Fingerprint ────────────────────────────────────────────────────────

export async function saveLead(input: GenomeInput): Promise<{ id: number; duplicate: boolean }> {
  const dupe = await checkDuplicate(input);
  if (dupe) return { id: dupe.existingId, duplicate: true };

  const name  = normalizeName(input.fullName || `${input.firstName || ""} ${input.lastName || ""}`.trim());
  const email = input.email ? normalizeEmail(input.email) : null;
  const phone = input.phone ? normalizePhone(input.phone) : null;
  const domain = email ? normalizeDomain(email) : null;

  const [saved] = await db.insert(leadFingerprintsTable).values({
    normalizedName:  name || null,
    domain:          domain,
    phoneNormalized: phone,
    emailNormalized: email,
    crNumber:        input.crNumber || null,
    sourceTable:     input.sourceTable || null,
    sourceId:        input.sourceId || null,
    createdAt:       new Date(),
  }).returning({ id: leadFingerprintsTable.id });

  return { id: saved!.id, duplicate: false };
}

// ─── Hunt (multi-table search) ────────────────────────────────────────────────

export interface HuntResult {
  source: string;
  record: Record<string, unknown>;
  score: number;
}

export async function huntLead(query: { email?: string; name?: string; company?: string }): Promise<HuntResult[]> {
  const results: HuntResult[] = [];

  // Search leads table
  if (query.email || query.name) {
    const conditions = [];
    if (query.email) conditions.push(ilike(leadsTable.email!, `%${query.email}%`));
    if (query.name) {
      const parts = (query.name || "").split(" ");
      conditions.push(ilike(leadsTable.firstName!, `%${parts[0] || ""}%`));
    }
    if (conditions.length > 0) {
      const rows = await db.select().from(leadsTable).where(or(...conditions)).limit(10);
      for (const r of rows) results.push({ source: "leads", record: r as unknown as Record<string, unknown>, score: 0.9 });
    }
  }

  // Search contacts table
  if (query.email || query.name) {
    const conditions = [];
    if (query.email) conditions.push(ilike(contacts.email, `%${query.email}%`));
    if (query.name) {
      const parts = (query.name || "").split(" ");
      if (parts[0]) conditions.push(ilike(contacts.first_name, `%${parts[0]}%`));
    }
    if (conditions.length > 0) {
      const rows = await db.select().from(contacts).where(or(...conditions)).limit(10);
      for (const r of rows) results.push({ source: "contacts", record: r as unknown as Record<string, unknown>, score: 0.85 });
    }
  }

  // Search masaar companies
  if (query.company) {
    const rows = await db.select().from(masar_companies)
      .where(or(ilike(masar_companies.nameEn!, `%${query.company}%`), ilike(masar_companies.nameAr!, `%${query.company}%`)))
      .limit(5);
    for (const r of rows) results.push({ source: "masaar", record: r as unknown as Record<string, unknown>, score: 0.7 });
  }

  // Search builder companies
  if (query.company) {
    const rows = await db.select().from(builder_companies)
      .where(or(ilike(builder_companies.nameEn!, `%${query.company}%`), ilike(builder_companies.nameAr!, `%${query.company}%`)))
      .limit(5);
    for (const r of rows) results.push({ source: "builder", record: r as unknown as Record<string, unknown>, score: 0.7 });
  }

  return results.sort((a, b) => b.score - a.score);
}

// ─── List Management ──────────────────────────────────────────────────────────

export async function createList(name: string, criteria?: string): Promise<{ id: number }> {
  const [row] = await db.insert(lead_lists).values({
    name,
    criteria: criteria || null,
    status:   "pending",
    totalFound: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({ id: lead_lists.id });
  return { id: row!.id };
}

export async function addToList(listId: number, personName: string, companyName?: string, linkedin?: string, source?: string): Promise<void> {
  await db.insert(lead_list_items).values({
    listId,
    personName: personName || null,
    companyName: companyName || null,
    linkedin: linkedin || null,
    source: source || null,
    createdAt: new Date(),
  }).onConflictDoNothing();
}

export async function getListItems(listId: number, limit = 100, offset = 0): Promise<Record<string, unknown>[]> {
  const rows = await db.select().from(lead_list_items)
    .where(eq(lead_list_items.listId, listId))
    .limit(limit).offset(offset);
  return rows as unknown as Record<string, unknown>[];
}

export async function getStats(): Promise<Record<string, number>> {
  const [fingerprints] = await db.select({ count: sql<number>`count(*)` }).from(leadFingerprintsTable);
  const [leadsCount]   = await db.select({ count: sql<number>`count(*)` }).from(leadsTable);
  const [listsCount]   = await db.select({ count: sql<number>`count(*)` }).from(lead_lists);

  return {
    fingerprints: Number(fingerprints?.count || 0),
    leads:        Number(leadsCount?.count || 0),
    lists:        Number(listsCount?.count || 0),
  };
}
