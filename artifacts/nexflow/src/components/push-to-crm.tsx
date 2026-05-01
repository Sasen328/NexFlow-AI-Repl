/**
 * <PushToCrm /> — reusable selection + dedup + ICP + manager-approval
 * workflow for any enrichment surface (Prospecting, Bulk Enrichment,
 * Quick Lead Enrich, Card Scanner, List Upload, Buying Signals).
 *
 * USAGE
 *   <PushToCrm
 *     records={enrichedLeads}        // array of { id, ...lead fields }
 *     getKey={(r) => r.id}
 *     renderRow={(r) => <span>{r.name} · {r.company}</span>}
 *     source="Bulk Enrichment"
 *   />
 *
 * BEHAVIOUR
 *   1. Each row carries a checkbox + AI badge (Already in CRM / Possible
 *      duplicate / New).
 *   2. Click "Push selected into CRM" → run dedup + ICP fit check on the
 *      brand-new records.
 *   3. Records that PASS ICP get pushed straight to /api/contacts.
 *   4. Records that FAIL ICP open a modal listing the reasons. Rep can
 *      choose "Don't push" or "Push anyway → manager approval", which
 *      drops them into the manager approvals queue.
 *
 * The dedup check, ICP check, and approval queue all live client-side in
 * localStorage so the demo is fully wired without backend churn — the
 * manager's Home Tab 03 reads the same store to surface the alert.
 */

import { useEffect, useMemo, useState } from "react";
import {
  CheckSquare, Square, Loader2, ShieldCheck, ShieldAlert, AlertTriangle,
  Send, X, UserCheck, Building2, ArrowRight, Sparkles, Settings2,
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { scoreIcp, type IcpRecord, type IcpFitResult } from "@/lib/icp";
import { addApproval } from "@/lib/approvals";
import { dedupCheck, type DedupVerdict } from "@/lib/dedup-check";
import { apiFetch } from "@/hooks/useApi";

// ────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────

export interface PushToCrmProps<T> {
  records: T[];
  getKey: (r: T) => string;
  /** Each row's primary visual (name / company / signal etc.) */
  renderRow: (r: T) => React.ReactNode;
  /** Map a record to the data we need to dedup + ICP-check */
  toIcp?: (r: T) => IcpRecord & { name?: string; company?: string; email?: string };
  /** Where this push came from — shown to the manager in the approval queue */
  source: string;
  /** Optional title above the table */
  title?: string;
  /** Optional dense mode for compact inline use */
  dense?: boolean;
}

// ────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────

export function PushToCrm<T>({
  records, getKey, renderRow, toIcp, source, title, dense,
}: PushToCrmProps<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [verdicts, setVerdicts] = useState<Record<string, DedupVerdict>>({});
  const [scoring, setScoring] = useState(false);
  const [reviewModal, setReviewModal] = useState<null | {
    fail: { record: T; key: string; fit: IcpFitResult }[];
    pass: { record: T; key: string }[];
  }>(null);
  const [pushedCount, setPushedCount] = useState(0);
  const [approvalCount, setApprovalCount] = useState(0);

  // ── Auto dedup-badge as records load ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function run() {
      const v: Record<string, DedupVerdict> = {};
      for (const r of records) {
        const k = getKey(r);
        const probe = toIcp?.(r);
        v[k] = await dedupCheck({
          name:    probe?.name,
          email:   probe?.email,
          company: probe?.company,
        });
      }
      if (!cancelled) setVerdicts(v);
    }
    void run();
    return () => { cancelled = true; };
  }, [records, getKey, toIcp]);

  const allKeys = useMemo(() => records.map(getKey), [records, getKey]);
  const eligibleKeys = useMemo(
    () => allKeys.filter((k) => verdicts[k]?.status !== "duplicate"),
    [allKeys, verdicts],
  );
  const allEligibleSelected = eligibleKeys.length > 0 && eligibleKeys.every((k) => selected.has(k));

  function toggle(k: string) {
    if (verdicts[k]?.status === "duplicate") return;
    const next = new Set(selected);
    if (next.has(k)) next.delete(k); else next.add(k);
    setSelected(next);
  }

  function toggleAll() {
    if (allEligibleSelected) setSelected(new Set());
    else setSelected(new Set(eligibleKeys));
  }

  async function handlePush() {
    if (selected.size === 0) return;
    setScoring(true);
    const fail: { record: T; key: string; fit: IcpFitResult }[] = [];
    const pass: { record: T; key: string }[] = [];
    for (const r of records) {
      const k = getKey(r);
      if (!selected.has(k)) continue;
      const probe = toIcp?.(r) ?? {};
      const fit = scoreIcp(probe);
      if (fit.fits) pass.push({ record: r, key: k });
      else fail.push({ record: r, key: k, fit });
    }
    setScoring(false);

    // If everything fits, push immediately. Otherwise pop the review modal.
    if (fail.length === 0) {
      pushNow(pass);
    } else {
      setReviewModal({ fail, pass });
    }
  }

  async function pushNow(rows: { record: T; key: string }[]) {
    let pushed = 0;
    for (const row of rows) {
      try {
        const probe = toIcp?.(row.record) ?? {};
        const nameParts = (probe.name ?? "Unknown").trim().split(/\s+/);
        const first_name = nameParts[0] ?? "Unknown";
        const last_name = nameParts.slice(1).join(" ") || "—";

        // Find or create company
        let company_id: string | undefined;
        if (probe.company) {
          try {
            const coRes: any = await apiFetch("/companies", {
              method: "POST",
              body: JSON.stringify({
                name: probe.company,
                industry: (probe as any).industry ?? null,
                country: (probe as any).region ?? null,
              }),
            });
            company_id = coRes?.id;
          } catch { /* company may already exist — skip */ }
        }

        await apiFetch("/contacts", {
          method: "POST",
          body: JSON.stringify({
            first_name,
            last_name,
            email: probe.email ?? null,
            phone: (probe as any).phone ?? null,
            title: (probe as any).title ?? null,
            company_id: company_id ?? null,
            status: "new",
            tags: ["enrichment-push", source.toLowerCase().replace(/\s+/g, "-")],
            notes: `Pushed from: ${source}`,
            lead_score: probe.score ?? null,
          }),
        });
        pushed++;
      } catch {
        // Single row failure — skip and continue
      }
    }
    setPushedCount((n) => n + pushed);
    const next = new Set(selected);
    rows.forEach((r) => next.delete(r.key));
    setSelected(next);
    // Selection cleared — newly pushed contacts visible on next dedup scan
  }

  function sendForApproval(rows: { record: T; key: string; fit: IcpFitResult }[]) {
    rows.forEach((r) => {
      const probe = toIcp?.(r.record) ?? {};
      addApproval({
        source,
        name:    probe.name    ?? "Unnamed lead",
        company: probe.company ?? "—",
        email:   probe.email,
        reasons: r.fit.failed.map((f) => f.reason),
        score:   r.fit.score,
      });
    });
    setApprovalCount((n) => n + rows.length);
    const next = new Set(selected);
    rows.forEach((r) => next.delete(r.key));
    setSelected(next);
  }

  function closeModal() { setReviewModal(null); }

  return (
    <div className="space-y-3">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-2.5">
        <button
          onClick={toggleAll}
          disabled={eligibleKeys.length === 0}
          className="flex items-center gap-1.5 text-xs font-medium hover:opacity-80 disabled:opacity-40"
        >
          {allEligibleSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          Select all eligible ({eligibleKeys.length})
        </button>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">{selected.size} selected</span>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/datahub/icp-rules" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Settings2 className="w-3 h-3" /> ICP rules
          </Link>
          <button
            onClick={handlePush}
            disabled={selected.size === 0 || scoring}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-40"
          >
            {scoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Push selected into CRM
          </button>
        </div>
      </div>

      {/* Confirmation pills */}
      {(pushedCount > 0 || approvalCount > 0) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {pushedCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> {pushedCount} pushed to CRM
            </span>
          )}
          {approvalCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> {approvalCount} sent for manager approval
            </span>
          )}
        </div>
      )}

      {/* Table */}
      {title && <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</div>}
      <div className={cn("rounded-2xl border border-border overflow-hidden", dense && "text-xs")}>
        <ul className="divide-y divide-border">
          {records.map((r) => {
            const k = getKey(r);
            const v = verdicts[k];
            const isDup = v?.status === "duplicate";
            const isPossible = v?.status === "possible";
            const isNew = v?.status === "new";
            return (
              <li key={k} className={cn("flex items-center gap-3 px-3 py-2.5", isDup && "opacity-60")}>
                <button onClick={() => toggle(k)} disabled={isDup} className="shrink-0">
                  {selected.has(k) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">{renderRow(r)}</div>
                {!v && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                {isDup      && <Badge tone="muted"  icon={ShieldCheck} label="Already in CRM" />}
                {isPossible && <Badge tone="amber"  icon={AlertTriangle} label={`Possible duplicate of ${v.matchName ?? "existing"}`} />}
                {isNew      && <Badge tone="emerald" icon={Sparkles} label="New" />}
              </li>
            );
          })}
        </ul>
      </div>

      {/* ICP review modal */}
      {reviewModal && (
        <ReviewModal
          fail={reviewModal.fail}
          pass={reviewModal.pass}
          renderRow={(r) => renderRow(r as T)}
          onCancel={closeModal}
          onPushFitOnly={() => { pushNow(reviewModal.pass); closeModal(); }}
          onSendForApproval={() => { if (reviewModal.pass.length) pushNow(reviewModal.pass); sendForApproval(reviewModal.fail); closeModal(); }}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────

function Badge({ tone, icon: Icon, label }: { tone: "muted" | "amber" | "emerald"; icon: any; label: string }) {
  const map = {
    muted:   "bg-muted text-muted-foreground",
    amber:   "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  } as const;
  return (
    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 whitespace-nowrap", map[tone])}>
      <Icon className="w-2.5 h-2.5" /> {label}
    </span>
  );
}

interface ReviewModalProps<T> {
  fail: { record: T; key: string; fit: IcpFitResult }[];
  pass: { record: T; key: string }[];
  renderRow: (r: T) => React.ReactNode;
  onCancel: () => void;
  onPushFitOnly: () => void;
  onSendForApproval: () => void;
}

function ReviewModal<T>({ fail, pass, renderRow, onCancel, onPushFitOnly, onSendForApproval }: ReviewModalProps<T>) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-background border border-border shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border bg-amber-50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 grid place-items-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold">{fail.length} lead{fail.length === 1 ? "" : "s"} are not a targeted client</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                These don't match your ICP rules. {pass.length > 0 && `${pass.length} other lead${pass.length === 1 ? "" : "s"} fit and will be pushed to CRM either way.`}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-muted shrink-0"><X className="w-4 h-4" /></button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-5 py-4 space-y-3">
          {fail.map(({ record, key, fit }) => (
            <div key={key} className="rounded-xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/10 p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="font-medium text-sm">{renderRow(record)}</div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-semibold whitespace-nowrap">
                  ICP fit {fit.score}%
                </span>
              </div>
              <ul className="space-y-1">
                {fit.failed.map((f, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className={cn("mt-0.5 w-1.5 h-1.5 rounded-full shrink-0", f.weight === "hard" ? "bg-red-500" : "bg-amber-500")} />
                    {f.reason}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border bg-muted/30">
          <Link href="/datahub/icp-rules" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Settings2 className="w-3 h-3" /> Edit ICP rules
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="px-3 py-1.5 rounded-lg border border-border text-xs">Don't push</button>
            {pass.length > 0 && (
              <button onClick={onPushFitOnly} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /> Push only the {pass.length} that fit
              </button>
            )}
            <button onClick={onSendForApproval} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Push anyway → manager approval <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
