/**
 * Manager approval queue. Reps land here from the AI Analytics page or
 * from the "Approvals alert" badge on the Sales Manager's Home Tab 03.
 */

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, X, Check, Clock, Building2, Mail, Sparkles, Inbox } from "lucide-react";
import {
  listApprovals, decideApproval, subscribeApprovals,
  type ApprovalItem, type ApprovalStatus,
} from "@/lib/approvals";
import { cn } from "@/lib/utils";

const TABS: { key: ApprovalStatus; label: string; icon: any }[] = [
  { key: "pending",  label: "Pending",  icon: Clock },
  { key: "approved", label: "Approved", icon: Check },
  { key: "rejected", label: "Rejected", icon: X },
];

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [tab, setTab] = useState<ApprovalStatus>("pending");

  useEffect(() => {
    const refresh = () => setItems(listApprovals());
    refresh();
    return subscribeApprovals(refresh);
  }, []);

  const filtered = items.filter((i) => i.status === tab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-500" /> Approval Queue
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Leads that failed the ICP check but were pushed by a rep. Approve to write them into CRM contacts; reject to discard.
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((t) => {
          const count = items.filter((i) => i.status === t.key).length;
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 -mb-px transition",
                active ? "border-primary text-foreground font-semibold" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
              {count > 0 && (
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", active ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
          <Inbox className="w-8 h-8 opacity-40" />
          {tab === "pending"
            ? "No leads awaiting approval. Reps haven't pushed any non-fit leads yet."
            : tab === "approved"
            ? "No approvals decided yet."
            : "No rejections yet."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((it) => <ApprovalCard key={it.id} item={it} />)}
        </div>
      )}
    </div>
  );
}

function ApprovalCard({ item }: { item: ApprovalItem }) {
  const isPending = item.status === "pending";
  const tone =
    item.status === "approved" ? "border-emerald-500/30 bg-emerald-500/5"
    : item.status === "rejected" ? "border-red-500/30 bg-red-500/5"
    : "border-amber-500/30 bg-amber-500/5";

  return (
    <div className={cn("rounded-2xl border p-4 space-y-3", tone)}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary/15 grid place-items-center shrink-0">
            <ShieldAlert className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold flex items-center gap-2 flex-wrap">
              {item.name}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 font-semibold">
                ICP fit {item.score}%
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                from {item.source}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {item.company}</span>
              {item.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {item.email}</span>}
              <span>· requested {new Date(item.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
        {isPending && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => decideApproval(item.id, "rejected")}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
            <button
              onClick={() => decideApproval(item.id, "approved")}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:opacity-90 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Approve & push to CRM
            </button>
          </div>
        )}
        {!isPending && item.decidedAt && (
          <span className="text-[11px] text-muted-foreground">
            {item.status === "approved" ? "Approved" : "Rejected"} {new Date(item.decidedAt).toLocaleString()}
          </span>
        )}
      </div>
      <div className="rounded-xl bg-background/60 border border-border p-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Why this lead failed ICP
        </div>
        <ul className="space-y-1">
          {item.reasons.map((r, i) => (
            <li key={i} className="text-xs flex items-start gap-1.5">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
