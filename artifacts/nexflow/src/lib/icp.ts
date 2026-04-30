/**
 * ICP (Ideal Customer Profile) — infinitely-expandable rule store.
 *
 * Used by the Push-to-CRM flow to score every enriched lead against the
 * company's targeted client profile BEFORE the lead can be added to the
 * CRM contacts table. If a lead fails ICP, the rep gets a popup explaining
 * why; if they push anyway it goes to the manager approval queue.
 *
 * Rules are stored in localStorage so a CRM Admin can add as many as they
 * want — there is no fixed schema. The default seed below is just a
 * starting point that can be deleted, edited, or extended.
 */

export type IcpOperator =
  | "equals" | "not_equals"
  | "in" | "not_in"
  | "contains" | "not_contains"
  | "gte" | "lte" | "between";

export interface IcpRule {
  /** stable id */
  id: string;
  /** "industry", "region", "headcount", "aum_usd", "tech_stack", … any field name */
  field: string;
  /** human label shown in the UI */
  label: string;
  op: IcpOperator;
  /** value(s) — string for equals/contains, string[] for in/not_in, [min,max] for between, number for gte/lte */
  value: string | string[] | number | [number, number];
  /** soft (advisory) vs hard (push blocked → manager approval) */
  weight: "hard" | "soft";
}

const STORAGE_KEY = "nexflow.icp.rules.v1";

const SEED: IcpRule[] = [
  { id: "r1", field: "industry",  label: "Industry",        op: "in",     value: ["Asset Management","Family Office","Insurance","Private Banking","Wealth Management"], weight: "hard" },
  { id: "r2", field: "region",    label: "Region",          op: "in",     value: ["KSA","UAE","Qatar","Bahrain","Kuwait","Oman"], weight: "hard" },
  { id: "r3", field: "headcount", label: "Company size",    op: "gte",    value: 50,                                                                                      weight: "hard" },
  { id: "r4", field: "aum_usd",   label: "AUM (USD)",       op: "gte",    value: 200_000_000,                                                                              weight: "soft" },
  { id: "r5", field: "seniority", label: "Contact seniority", op: "in",   value: ["VP","SVP","Director","Head","Chief","C-Level","Owner","Founder"],                      weight: "soft" },
];

/**
 * Returns the saved ICP rules. Per spec: NO hard-coded fallback rules —
 * the user said "expand to infinite", so admins author every rule. The
 * SEED array is exported only as an *initial demo seed* the page can
 * choose to install once on first visit, but `Wipe all rules` must
 * persist as truly empty.
 */
export function loadIcpRules(): IcpRule[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw) as IcpRule[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Demo seed admins can install once via the ICP page. Not a fallback. */
export function getIcpDemoSeed(): IcpRule[] {
  return SEED.map((r) => ({ ...r }));
}

export function saveIcpRules(rules: IcpRule[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

export function addIcpRule(rule: Omit<IcpRule, "id">): IcpRule[] {
  const rules = loadIcpRules();
  const next = [...rules, { ...rule, id: `r${Date.now().toString(36)}` }];
  saveIcpRules(next);
  return next;
}

export function removeIcpRule(id: string): IcpRule[] {
  const next = loadIcpRules().filter((r) => r.id !== id);
  saveIcpRules(next);
  return next;
}

export function updateIcpRule(id: string, patch: Partial<IcpRule>): IcpRule[] {
  const next = loadIcpRules().map((r) => (r.id === id ? { ...r, ...patch } : r));
  saveIcpRules(next);
  return next;
}

// ─── ICP scoring ─────────────────────────────────────────────────────────

export interface IcpRecord {
  /** Loose record shape — anything an enriched lead/company carries. */
  industry?: string;
  region?: string;
  country?: string;
  headcount?: number;
  aum_usd?: number;
  seniority?: string;
  tech_stack?: string[];
  [k: string]: unknown;
}

export interface IcpFitResult {
  /** true if every HARD rule passes */
  fits: boolean;
  /** 0–100 — weighted match score across all rules */
  score: number;
  /** rule ids that PASSED */
  passed: string[];
  /** rule ids that FAILED, with human reasons */
  failed: { ruleId: string; reason: string; weight: "hard" | "soft" }[];
}

function pass(value: unknown, op: IcpOperator, target: IcpRule["value"]): boolean {
  if (value === undefined || value === null || value === "") return false;
  switch (op) {
    case "equals":       return value === target;
    case "not_equals":   return value !== target;
    case "in":           return Array.isArray(target) && (target as string[]).includes(String(value));
    case "not_in":       return Array.isArray(target) && !(target as string[]).includes(String(value));
    case "contains":     return String(value).toLowerCase().includes(String(target).toLowerCase());
    case "not_contains": return !String(value).toLowerCase().includes(String(target).toLowerCase());
    case "gte":          return Number(value) >= Number(target);
    case "lte":          return Number(value) <= Number(target);
    case "between": {
      const [a, b] = target as [number, number];
      const n = Number(value);
      return n >= a && n <= b;
    }
  }
}

function reasonFor(rule: IcpRule, actual: unknown): string {
  const got = actual === undefined || actual === null || actual === "" ? "missing" : String(actual);
  switch (rule.op) {
    case "in":      return `${rule.label} = "${got}" is outside target list (${(rule.value as string[]).slice(0,3).join(", ")}…)`;
    case "not_in":  return `${rule.label} = "${got}" is on the excluded list`;
    case "equals":  return `${rule.label} should be "${rule.value}" — got "${got}"`;
    case "gte":     return `${rule.label} below threshold (${got} < ${rule.value})`;
    case "lte":     return `${rule.label} above threshold (${got} > ${rule.value})`;
    case "between": return `${rule.label} = ${got} is outside ${(rule.value as [number,number]).join(" – ")}`;
    case "contains":     return `${rule.label} should contain "${rule.value}" — got "${got}"`;
    case "not_contains": return `${rule.label} should not contain "${rule.value}"`;
    case "not_equals":   return `${rule.label} should not be "${rule.value}"`;
  }
}

export function scoreIcp(record: IcpRecord, rules: IcpRule[] = loadIcpRules()): IcpFitResult {
  const passed: string[] = [];
  const failed: IcpFitResult["failed"] = [];
  let totalWeight = 0;
  let earned = 0;
  for (const r of rules) {
    const w = r.weight === "hard" ? 2 : 1;
    totalWeight += w;
    if (pass(record[r.field], r.op, r.value)) {
      passed.push(r.id);
      earned += w;
    } else {
      failed.push({ ruleId: r.id, reason: reasonFor(r, record[r.field]), weight: r.weight });
    }
  }
  const fits = failed.every((f) => f.weight === "soft");
  const score = totalWeight === 0 ? 100 : Math.round((earned / totalWeight) * 100);
  return { fits, score, passed, failed };
}
