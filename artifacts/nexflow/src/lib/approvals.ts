/**
 * Manager approval queue — populated by the Push-to-CRM flow whenever a
 * rep elects to push a lead that fails ICP. Surfaces as the "Approvals
 * alert" badge on the Sales Manager's Home Tab 03 (To-Do & Alerts) and on
 * the AI Analytics page in Data Hub.
 *
 * Backed by localStorage so the demo round-trips without a server table.
 */

const KEY = "nexflow.approvals.queue.v1";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalItem {
  id: string;
  source: string;          // "Bulk Enrichment", "Card Scanner", …
  name: string;
  company: string;
  email?: string;
  reasons: string[];
  score: number;           // 0–100
  status: ApprovalStatus;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
}

export function listApprovals(): ApprovalItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as ApprovalItem[];
  } catch { return []; }
}

function persist(items: ApprovalItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("nexflow:approvals-changed"));
}

export function addApproval(input: Omit<ApprovalItem, "id" | "status" | "createdAt">) {
  const items = listApprovals();
  items.unshift({
    ...input,
    id: `appr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  persist(items);
}

export function decideApproval(id: string, decision: "approved" | "rejected", by = "Manager") {
  const items = listApprovals().map((i) =>
    i.id === id ? { ...i, status: decision, decidedAt: new Date().toISOString(), decidedBy: by } : i,
  );
  persist(items);
}

export function pendingApprovalCount(): number {
  return listApprovals().filter((i) => i.status === "pending").length;
}

/**
 * Subscribe to approvals queue changes. Returns an unsubscribe fn.
 * Useful for badge counters that need to live-update on writes from
 * the Push-to-CRM modal in another part of the app.
 */
export function subscribeApprovals(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener("nexflow:approvals-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("nexflow:approvals-changed", handler);
    window.removeEventListener("storage", handler);
  };
}
