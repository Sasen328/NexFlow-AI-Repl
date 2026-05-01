import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contacts, activities, calls, deals, signals } from "@workspace/db";
import { eq, and, or, sql, ne } from "drizzle-orm";

const router: IRouter = Router();

function normalizeEmail(email?: string | null): string | null {
  if (!email) return null;
  return email.trim().toLowerCase();
}

function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  return phone.replace(/[^0-9+]/g, "");
}

function normalizeName(s?: string | null): string {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
}

function similarity(a: string, b: string): number {
  if (!a.length && !b.length) return 1;
  if (!a.length || !b.length) return 0;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

// GET /api/dedup/find — scan contacts for duplicate clusters
router.get("/find", async (req, res) => {
  try {
    const strict = String(req.query.strict ?? "false") === "true";
    const all = await db.select().from(contacts);
    type Group = { key: string; reason: string; confidence: number; contacts: any[] };
    const groups: Group[] = [];

    // Pass 1: exact email matches
    const byEmail = new Map<string, any[]>();
    for (const c of all) {
      const e = normalizeEmail(c.email as any);
      if (!e) continue;
      const arr = byEmail.get(e) ?? [];
      arr.push(c);
      byEmail.set(e, arr);
    }
    for (const [email, list] of byEmail.entries()) {
      if (list.length > 1) {
        groups.push({
          key: `email:${email}`,
          reason: `Same email: ${email}`,
          confidence: 0.99,
          contacts: list,
        });
      }
    }

    // Pass 2: exact phone matches
    const byPhone = new Map<string, any[]>();
    for (const c of all) {
      const p = normalizePhone(c.phone as any);
      if (!p || p.length < 7) continue;
      const arr = byPhone.get(p) ?? [];
      arr.push(c);
      byPhone.set(p, arr);
    }
    for (const [phone, list] of byPhone.entries()) {
      if (list.length > 1) {
        const ids = new Set(list.map((c) => c.id));
        const existing = groups.find((g) => g.contacts.every((c) => ids.has(c.id)) && g.contacts.length === list.length);
        if (!existing) {
          groups.push({
            key: `phone:${phone}`,
            reason: `Same phone: ${phone}`,
            confidence: 0.95,
            contacts: list,
          });
        }
      }
    }

    // Pass 3: same full name + same company (fuzzy)
    if (!strict) {
      const seen = new Set<string>();
      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          const a = all[i], b = all[j];
          const aName = normalizeName(`${a.first_name ?? ""} ${a.last_name ?? ""}`);
          const bName = normalizeName(`${b.first_name ?? ""} ${b.last_name ?? ""}`);
          if (!aName || !bName) continue;
          const nameSim = similarity(aName, bName);
          if (nameSim < 0.85) continue;
          const sameCompany = a.company_id && b.company_id && a.company_id === b.company_id;
          if (!sameCompany) continue;
          const key = `name:${[a.id, b.id].sort().join("|")}`;
          if (seen.has(key)) continue;
          seen.add(key);
          groups.push({
            key,
            reason: `Similar name (${Math.round(nameSim * 100)}%) at same company`,
            confidence: nameSim * 0.92,
            contacts: [a, b],
          });
        }
      }
    }

    // De-dupe overlapping groups: prefer higher confidence
    groups.sort((a, b) => b.confidence - a.confidence);

    res.json({
      total_groups: groups.length,
      total_duplicates: groups.reduce((acc, g) => acc + g.contacts.length, 0),
      groups: groups.map((g) => ({
        ...g,
        contacts: g.contacts.map((c) => ({
          id: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          email: c.email,
          phone: c.phone,
          title: c.title,
          company_id: c.company_id,
          lead_score: c.lead_score,
          last_engaged_at: c.last_engaged_at,
          created_at: c.created_at,
        })),
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// POST /api/dedup/merge — merge duplicates into a survivor
// body: { survivor_id: string, duplicate_ids: string[] }
router.post("/merge", async (req, res) => {
  try {
    const { survivor_id, duplicate_ids } = req.body ?? {};
    if (!survivor_id || !Array.isArray(duplicate_ids) || !duplicate_ids.length) {
      return res.status(400).json({ error: "survivor_id and duplicate_ids[] required" });
    }
    const dupes = duplicate_ids.filter((id: string) => id !== survivor_id);
    if (!dupes.length) return res.status(400).json({ error: "no duplicates to merge" });

    const [survivor] = await db.select().from(contacts).where(eq(contacts.id, survivor_id));
    if (!survivor) return res.status(404).json({ error: "survivor not found" });

    const dupeRows = await db.select().from(contacts).where(sql`id = ANY(${dupes}::text[])`);

    // Field-level merge: prefer survivor unless null/empty, then take from any duplicate
    const merged: any = { ...survivor };
    const fieldsToFill = ["email", "phone", "title", "linkedin_url", "company_id", "tags", "notes", "lead_score"];
    for (const f of fieldsToFill) {
      if (merged[f] == null || merged[f] === "" || (Array.isArray(merged[f]) && !merged[f].length)) {
        for (const d of dupeRows) {
          const dv: any = (d as any)[f];
          if (dv != null && dv !== "" && !(Array.isArray(dv) && !dv.length)) {
            merged[f] = dv;
            break;
          }
        }
      }
    }
    // Take highest lead_score
    const maxScore = Math.max(survivor.lead_score ?? 0, ...dupeRows.map((d: any) => d.lead_score ?? 0));
    merged.lead_score = maxScore;

    // Concat unique tags
    const tagsAll = new Set<string>();
    for (const t of (survivor.tags as any) ?? []) tagsAll.add(t);
    for (const d of dupeRows) for (const t of ((d as any).tags as string[]) ?? []) tagsAll.add(t);
    if (tagsAll.size) merged.tags = Array.from(tagsAll);

    await db.update(contacts).set({
      email: merged.email,
      phone: merged.phone,
      title: merged.title,
      linkedin_url: merged.linkedin_url,
      company_id: merged.company_id,
      tags: merged.tags,
      notes: merged.notes,
      lead_score: merged.lead_score,
      updated_at: new Date(),
    }).where(eq(contacts.id, survivor_id));

    // Re-parent activities, calls, deals, signals
    let movedActivities = 0, movedCalls = 0, movedDeals = 0, movedSignals = 0;
    for (const dupId of dupes) {
      const r1 = await db.update(activities).set({ contact_id: survivor_id }).where(eq(activities.contact_id, dupId));
      const r2 = await db.update(calls).set({ contact_id: survivor_id }).where(eq(calls.contact_id, dupId));
      const r3 = await db.update(deals).set({ contact_id: survivor_id }).where(eq(deals.contact_id, dupId));
      const r4 = await db.update(signals).set({ contact_id: survivor_id }).where(eq(signals.contact_id, dupId));
      movedActivities += (r1 as any).rowCount ?? 0;
      movedCalls += (r2 as any).rowCount ?? 0;
      movedDeals += (r3 as any).rowCount ?? 0;
      movedSignals += (r4 as any).rowCount ?? 0;
    }

    // Delete duplicates
    await db.delete(contacts).where(sql`id = ANY(${dupes}::text[])`);

    res.json({
      ok: true,
      survivor_id,
      removed: dupes.length,
      moved: { activities: movedActivities, calls: movedCalls, deals: movedDeals, signals: movedSignals },
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Merge failed" });
  }
});

// POST /api/dedup/check — pre-flight check before creating a contact
// body: { email?, phone?, first_name?, last_name?, company_id? }
router.post("/check", async (req, res) => {
  try {
    const { email, phone, first_name, last_name, company_id } = req.body ?? {};
    const matches: any[] = [];
    if (email) {
      const ex = await db.select().from(contacts).where(sql`lower(email) = lower(${email})`).limit(5);
      ex.forEach((c) => matches.push({ ...c, match_reason: "email", confidence: 0.99 }));
    }
    if (phone) {
      const norm = normalizePhone(phone);
      if (norm) {
        const ex = await db.select().from(contacts).where(sql`regexp_replace(coalesce(phone,''), '[^0-9+]', '', 'g') = ${norm}`).limit(5);
        ex.forEach((c) => {
          if (!matches.find((m) => m.id === c.id)) {
            matches.push({ ...c, match_reason: "phone", confidence: 0.95 });
          }
        });
      }
    }
    if (first_name && last_name && company_id) {
      const ex = await db.select().from(contacts).where(and(
        sql`lower(first_name) = lower(${first_name})`,
        sql`lower(last_name) = lower(${last_name})`,
        eq(contacts.company_id, company_id),
      )).limit(5);
      ex.forEach((c) => {
        if (!matches.find((m) => m.id === c.id)) {
          matches.push({ ...c, match_reason: "name+company", confidence: 0.85 });
        }
      });
    }
    res.json({ has_duplicates: matches.length > 0, matches });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// POST /api/dedup/check-batch — pre-import dedup for a list of staged leads
// body: { leads: Array<{ id, name, email?, phone?, company? }> }
// resp: { results: Array<{ id, status, match_name?, contact_id?, match_reason? }> }
router.post("/check-batch", async (req, res) => {
  try {
    const { leads } = req.body ?? {};
    if (!Array.isArray(leads) || !leads.length) {
      return res.status(400).json({ error: "leads[] required" });
    }

    const all = await db.select({
      id: contacts.id,
      first_name: contacts.first_name,
      last_name: contacts.last_name,
      email: contacts.email,
      phone: contacts.phone,
      company_id: contacts.company_id,
    }).from(contacts);

    const results = leads.map((lead: any) => {
      const probeEmail = normalizeEmail(lead.email);
      const probePhone = normalizePhone(lead.phone);
      const probeName  = normalizeName(`${lead.name ?? lead.first_name ?? ""} ${lead.last_name ?? ""}`);
      const probeCo    = normalizeName(lead.company ?? "");

      // Pass 1: exact email
      if (probeEmail) {
        const hit = all.find((c) => normalizeEmail(c.email as any) === probeEmail);
        if (hit) return {
          id: lead.id,
          status: "duplicate",
          match_reason: `Same email: ${probeEmail}`,
          match_name: `${hit.first_name} ${hit.last_name}`,
          contact_id: hit.id,
          confidence: 0.99,
        };
      }
      // Pass 2: exact phone
      if (probePhone && probePhone.length >= 7) {
        const hit = all.find((c) => normalizePhone(c.phone as any) === probePhone);
        if (hit) return {
          id: lead.id,
          status: "duplicate",
          match_reason: `Same phone: ${probePhone}`,
          match_name: `${hit.first_name} ${hit.last_name}`,
          contact_id: hit.id,
          confidence: 0.95,
        };
      }
      // Pass 3: fuzzy name + same company
      if (probeName && probeCo) {
        const hit = all.find((c) => {
          const cName = normalizeName(`${c.first_name ?? ""} ${c.last_name ?? ""}`);
          const nameSim = similarity(probeName, cName);
          return nameSim >= 0.85;
        });
        if (hit) {
          const cName = normalizeName(`${hit.first_name ?? ""} ${hit.last_name ?? ""}`);
          const sim = similarity(probeName, cName);
          return {
            id: lead.id,
            status: sim >= 0.95 ? "duplicate" : "possible",
            match_reason: `Similar name (${Math.round(sim * 100)}%)`,
            match_name: `${hit.first_name} ${hit.last_name}`,
            contact_id: hit.id,
            confidence: sim * 0.9,
          };
        }
      }

      return { id: lead.id, status: "new", confidence: 0 };
    });

    const summary = {
      total: results.length,
      duplicates: results.filter((r) => r.status === "duplicate").length,
      possible: results.filter((r) => r.status === "possible").length,
      new: results.filter((r) => r.status === "new").length,
    };

    res.json({ results, summary });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Batch check failed" });
  }
});

// POST /api/dedup/push-staged — push a list of staged (new) leads to contacts
// body: { leads: Array<{ name, email?, phone?, company?, title?, industry?, region? }> }
router.post("/push-staged", async (req, res) => {
  try {
    const { leads } = req.body ?? {};
    if (!Array.isArray(leads) || !leads.length) {
      return res.status(400).json({ error: "leads[] required" });
    }

    const created: string[] = [];
    const skipped: string[] = [];

    for (const lead of leads) {
      try {
        const nameParts = (lead.name ?? "").trim().split(/\s+/);
        const first_name = nameParts[0] || "Unknown";
        const last_name = nameParts.slice(1).join(" ") || "";

        const [contact] = await db.insert(contacts).values({
          first_name,
          last_name,
          email: lead.email ?? null,
          phone: lead.phone ?? null,
          title: lead.title ?? null,
          source: "list_import",
          status: "new",
          tags: ["dedup-import"],
          lead_score: 50,
        }).returning();
        created.push(contact.id);
      } catch {
        skipped.push(lead.name ?? "unknown");
      }
    }

    res.json({ created: created.length, skipped: skipped.length, contact_ids: created });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Push staged failed" });
  }
});

export default router;
