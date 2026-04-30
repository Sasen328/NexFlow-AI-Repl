import { useFunnel, useFunnelStage, useFunnelStageInsights, useFunnelStuck } from "@/hooks/useApi";
import {
  Sparkles, AlertTriangle, ArrowRight, X, Building2, Clock,
  TrendingDown, TrendingUp, Filter, Users, Target, ChevronRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

/**
 * /pipeline — Pre-SAL lead funnel.
 *
 * Differs from /deal-pipeline (the post-SAL kanban for active deals): this
 * page focuses on the early-stage pre-deal funnel (Lead → Qualified) and the
 * AI gap analysis the user needs to fix conversion leaks.
 */
const PRE_SAL_STAGES = ["lead", "qualified"] as const;
const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
};
const STAGE_COLORS: Record<string, string> = {
  lead: "#90B8B8",
  qualified: "#88B8B0",
  proposal: "#B8A0C8",
  negotiation: "#C8A880",
  closed_won: "#88B870",
};

export default function PipelinePage() {
  const { data, isLoading } = useFunnel();
  const { data: stuckData } = useFunnelStuck();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [showAllStages, setShowAllStages] = useState(false);

  const funnel = data?.funnel ?? [];
  const visible = showAllStages
    ? funnel
    : funnel.filter((f: any) => (PRE_SAL_STAGES as readonly string[]).includes(f.stage));
  const max = Math.max(...visible.map((f: any) => f.count), 1);

  // Pre-SAL totals
  const preSalLeads = funnel
    .filter((f: any) => (PRE_SAL_STAGES as readonly string[]).includes(f.stage))
    .reduce((s: number, f: any) => s + (f.count ?? 0), 0);
  const preSalValue = funnel
    .filter((f: any) => (PRE_SAL_STAGES as readonly string[]).includes(f.stage))
    .reduce((s: number, f: any) => s + (f.value ?? 0), 0);

  // ─── AI gap analysis derived from funnel data ───────────────────────────
  const gaps = useMemo(() => {
    const items: { title: string; severity: "warn" | "ok" | "info"; body: string; cta?: string; stage?: string }[] = [];
    if (funnel.length === 0) return items;

    // Conversion leaks
    funnel.forEach((f: any, i: number) => {
      if (i === 0) return;
      if (f.conversion_from_prev != null && f.conversion_from_prev < 35) {
        items.push({
          title: `${f.conversion_from_prev}% conversion ${STAGE_LABELS[funnel[i - 1].stage]} → ${STAGE_LABELS[f.stage]}`,
          severity: "warn",
          body: `Industry benchmark for B2B GCC is 45–55%. ${funnel[i - 1].count - f.count} prospects dropped at this step. Common causes: weak follow-up cadence, mis-qualified personas, no next-step booked on first call.`,
          cta: "Inspect stalled leads",
          stage: funnel[i - 1].stage,
        });
      }
    });

    // Top-of-funnel volume
    const tof = funnel[0];
    if (tof && tof.count < 30) {
      items.push({
        title: `Top-of-funnel volume thin · ${tof.count} leads`,
        severity: "warn",
        body: `Lead volume needs to be 3–5× current to hit a healthy pipeline cover ratio. Recommend: launch a Bulk Enrichment run + LinkedIn ABM sequence for the top 50 target accounts.`,
        cta: "Open Bulk Enrichment",
      });
    }

    // Avg days in stage
    funnel.forEach((f: any) => {
      if ((f.avg_days_in_stage ?? 0) > 21 && (PRE_SAL_STAGES as readonly string[]).includes(f.stage)) {
        items.push({
          title: `${STAGE_LABELS[f.stage]} aging fast · ${f.avg_days_in_stage}d avg`,
          severity: "warn",
          body: `Leads sitting in ${STAGE_LABELS[f.stage]} > 21 days have a 4× lower conversion rate. Recommend: triage list this morning, bulk-WhatsApp the top 10, archive ghosts after 3 attempts.`,
          cta: "Open Power Dialer",
          stage: f.stage,
        });
      }
    });

    if (items.length === 0) {
      items.push({
        title: "No major gaps detected",
        severity: "ok",
        body: "Pre-SAL funnel is healthy: conversion rates and aging are within benchmark. Keep volume up and hand off Qualified leads to Deal Pipeline within 48h.",
      });
    }

    return items;
  }, [funnel]);

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Pre-SAL lead funnel · click a stage to inspect · AI flags conversion gaps automatically.
          </p>
        </div>
        <button
          onClick={() => setShowAllStages((s) => !s)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors",
            showAllStages
              ? "bg-[#B8A0C8]/15 text-[#B8A0C8] border border-[#B8A0C8]/40"
              : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          {showAllStages ? "Showing all stages" : "Pre-SAL only"}
        </button>
      </div>

      {/* Pre-SAL KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="Pre-SAL leads" value={preSalLeads.toLocaleString()} icon={Users} color="#88B8B0" />
        <KpiCard label="Pre-SAL pipeline value" value={`$${(preSalValue).toLocaleString()}`} icon={Target} color="#B8A0C8" />
        <KpiCard
          label="Lead → Qualified conv."
          value={
            (() => {
              const lead = funnel.find((f: any) => f.stage === "lead");
              const qual = funnel.find((f: any) => f.stage === "qualified");
              if (!lead || !qual || !lead.count) return "—";
              return Math.round((qual.count / lead.count) * 100) + "%";
            })()
          }
          icon={TrendingUp}
          color="#C8A880"
        />
      </div>

      {/* Funnel bars */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#88B8B0]" />
          {showAllStages ? "Full funnel" : "Pre-SAL funnel"}
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">No stages to show.</div>
        ) : (
          <div className="space-y-3">
            {visible.map((f: any, i: number) => {
              const widthPct = Math.max(15, (f.count / max) * 100);
              const color = STAGE_COLORS[f.stage] ?? "#90B8B8";
              const isSelected = selectedStage === f.stage;
              return (
                <button
                  key={f.stage}
                  onClick={() => setSelectedStage(isSelected ? null : f.stage)}
                  className={cn(
                    "w-full text-left rounded-xl p-2 transition-all",
                    isSelected ? "bg-muted/40 ring-2 ring-[#B8A0C8]/40" : "hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-center gap-3 mb-1.5 px-2">
                    <div className="text-xs font-bold uppercase tracking-wide text-foreground/70 w-32">{STAGE_LABELS[f.stage] ?? f.stage}</div>
                    <div className="text-xs text-muted-foreground flex-1">
                      {f.count} leads · ${f.value.toLocaleString()}
                    </div>
                    {i > 0 && f.conversion_from_prev != null && (
                      <div
                        className={
                          "text-xs font-semibold flex items-center gap-1 " +
                          (f.conversion_from_prev >= 50 ? "text-[#88B8B0]" : "text-[#C8A880]")
                        }
                      >
                        {f.conversion_from_prev >= 50
                          ? <TrendingUp className="w-3 h-3" />
                          : <TrendingDown className="w-3 h-3" />}
                        {f.conversion_from_prev}% from prev
                      </div>
                    )}
                  </div>
                  <div className="h-10 rounded-lg flex items-center justify-end px-4 text-white text-xs font-bold transition-all" style={{ width: `${widthPct}%`, backgroundColor: color }}>
                    {f.count}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* AI gap analysis */}
      <div className="glass-card rounded-2xl p-5 border border-[#B8A0C8]/30 bg-[#B8A0C8]/5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl nf-chameleon-bg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-bold text-foreground">AI Gap Analysis</h2>
          <span className="text-xs text-muted-foreground">· {gaps.length} {gaps.length === 1 ? "finding" : "findings"}</span>
        </div>
        <div className="space-y-2">
          {gaps.map((g, i) => (
            <button
              key={i}
              type="button"
              onClick={() => g.stage && setSelectedStage(g.stage)}
              className={cn(
                "w-full text-left rounded-xl p-3.5 border transition-all flex items-start gap-3 group",
                g.severity === "warn" ? "bg-[#C8A880]/10 border-[#C8A880]/30 hover:bg-[#C8A880]/15"
                : g.severity === "ok" ? "bg-[#88B8B0]/10 border-[#88B8B0]/30"
                : "bg-muted/20 border-border/40"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                  g.severity === "warn" ? "bg-[#C8A880]/25 text-[#C8A880]"
                  : g.severity === "ok" ? "bg-[#88B8B0]/25 text-[#88B8B0]"
                  : "bg-muted/40 text-muted-foreground"
                )}
              >
                {g.severity === "warn" ? <AlertTriangle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{g.title}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{g.body}</p>
                {g.cta && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#B8A0C8]">
                    {g.cta} <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stuck leads */}
      {stuckData?.stuck && stuckData.stuck.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-[#C8A880]" />
            Stuck Leads · &gt;30 days in stage
            <span className="text-xs text-muted-foreground font-normal ml-1">({stuckData.stuck.length})</span>
          </h3>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {stuckData.stuck.slice(0, 10).map((d: any) => (
              <div key={d.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/30">
                <div className="w-1.5 h-8 rounded-full" style={{ background: STAGE_COLORS[d.stage] }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                    <Building2 className="w-3 h-3" />{d.company_name ?? "—"} · {d.owner_name ?? "Unassigned"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#88B8B0]">${(d.value ?? 0).toLocaleString()}</div>
                  <div className="text-[10px] text-[#C8A880] font-semibold">{d.days_in_stage}d in {STAGE_LABELS[d.stage]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drill-down panel — same UI as funnel */}
      {selectedStage && (
        <StageDrilldown stage={selectedStage} onClose={() => setSelectedStage(null)} />
      )}
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20`, color }}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{label}</div>
          <div className="text-2xl font-black mt-1" style={{ color }}>{value}</div>
        </div>
      </div>
    </div>
  );
}

function StageDrilldown({ stage, onClose }: { stage: string; onClose: () => void }) {
  const { data, isLoading } = useFunnelStage(stage);
  const { data: insightsData, isLoading: insightsLoading } = useFunnelStageInsights(stage);
  const deals = data?.deals ?? [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-stretch justify-end" onClick={onClose}>
      <div className="w-full max-w-2xl bg-background border-l border-border/40 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-background border-b border-border/30 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Stage drill-down</div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: STAGE_COLORS[stage] }} />
              {STAGE_LABELS[stage] ?? stage}
              <span className="text-xs text-muted-foreground font-normal">· {data?.count ?? 0} leads · ${(data?.total_value ?? 0).toLocaleString()}</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* AI insights */}
          <div className="glass-card rounded-2xl p-4 border border-[#B8A0C8]/30 bg-[#B8A0C8]/5">
            <h3 className="text-xs font-bold text-[#B8A0C8] uppercase tracking-wider flex items-center gap-2 mb-2">
              <Sparkles className="w-3 h-3" />
              AI Stall Diagnosis
            </h3>
            {insightsLoading ? (
              <div className="space-y-2"><div className="h-3 bg-muted/50 rounded animate-pulse w-3/4" /><div className="h-3 bg-muted/50 rounded animate-pulse w-1/2" /></div>
            ) : insightsData?.diagnosis ? (
              <>
                <p className="text-sm text-foreground/90 leading-snug">{insightsData.diagnosis}</p>
                <div className="mt-3 space-y-1.5">
                  {(insightsData.actions ?? []).map((a: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <ArrowRight className="w-3 h-3 text-[#B8A0C8] mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-foreground">{a.title}</span>
                        <span className="text-muted-foreground"> — {a.why}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No insights available.</p>
            )}
          </div>

          {/* Leads list */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Leads in this stage</h3>
            {isLoading ? (
              <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="h-14 bg-muted/40 rounded-xl animate-pulse" />)}</div>
            ) : deals.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No leads in this stage.</p>
            ) : (
              <div className="space-y-1.5">
                {deals.map((d: any) => {
                  const stuck = (d.days_in_stage ?? 0) > 30;
                  return (
                    <div key={d.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">{d.name}</div>
                        <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                          {d.company_name && (
                            <>
                              <Building2 className="w-3 h-3" />
                              <span>{d.company_name}</span>
                              {d.owner_name && <span> · {d.owner_name}</span>}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-[#88B8B0]">${(d.value ?? 0).toLocaleString()}</div>
                        <div className={cn("text-[10px] flex items-center gap-1 justify-end", stuck ? "text-[#C8A880] font-semibold" : "text-muted-foreground")}>
                          <Clock className="w-3 h-3" />{d.days_in_stage ?? 0}d
                        </div>
                      </div>
                      {d.contact_id && (
                        <Link href={`/contacts/${d.contact_id}`}>
                          <button className="text-[10px] text-[#B8A0C8] font-semibold hover:underline">Open →</button>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
