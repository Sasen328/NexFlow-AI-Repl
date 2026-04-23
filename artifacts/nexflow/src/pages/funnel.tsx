import { useFunnel, useFunnelStage, useFunnelStageInsights, useFunnelStuck, useAutoAdvanceStages } from "@/hooks/useApi";
import { TrendingDown, TrendingUp, Sparkles, Zap, AlertTriangle, X, Clock, Loader2, ArrowRight, Building2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const STAGES = ["lead", "qualified", "proposal", "negotiation", "closed_won"] as const;
const STAGE_COLORS: Record<string, string> = {
  lead: "#90B8B8",
  qualified: "#88B8B0",
  proposal: "#B8A0C8",
  negotiation: "#C8A880",
  closed_won: "#88B870",
};
const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
};

export default function FunnelPage() {
  const { data, isLoading } = useFunnel();
  const { data: stuckData } = useFunnelStuck();
  const autoAdvance = useAutoAdvanceStages();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const funnel = data?.funnel ?? [];
  const stuck = stuckData?.stuck ?? [];
  const max = Math.max(...funnel.map((f: any) => f.count), 1);

  async function runAutoAdvance() {
    const r = await autoAdvance.mutateAsync();
    setFeedback(r?.message ?? "Done.");
    setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Funnel</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Click a stage to inspect deals, time-in-stage, and AI stall diagnosis.</p>
        </div>
        <div className="flex items-center gap-2">
          {feedback && <span className="text-xs text-[#88B8B0] font-semibold">{feedback}</span>}
          <button
            onClick={runAutoAdvance}
            disabled={autoAdvance.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl nf-chameleon-bg text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {autoAdvance.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Run Auto-Advance
          </button>
        </div>
      </div>

      {/* Funnel bars */}
      <div className="glass-card rounded-2xl p-6">
        {isLoading ? (
          <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div>
        ) : (
          <div className="space-y-3">
            {funnel.map((f: any, i: number) => {
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
                    <div className="text-xs font-bold uppercase tracking-wide text-foreground/70 w-32">{STAGE_LABELS[f.stage]}</div>
                    <div className="text-xs text-muted-foreground flex-1">
                      {f.count} deals · ${f.value.toLocaleString()}
                    </div>
                    {i > 0 && (
                      <div className={"text-xs font-semibold flex items-center gap-1 " + (f.conversion_from_prev >= 50 ? "text-[#88B8B0]" : "text-[#C8A880]")}>
                        {f.conversion_from_prev >= 50 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
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

      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Top of funnel" value={funnel[0]?.count ?? 0} color="#90B8B8" />
        <Stat label="Total pipeline value" value={`$${funnel.reduce((s: number, f: any) => s + f.value, 0).toLocaleString()}`} color="#88B8B0" />
        <Stat label="Lead→Won %" value={funnel[0]?.count ? Math.round((funnel[funnel.length - 1]?.count / funnel[0].count) * 100) + "%" : "—"} color="#B8A0C8" />
      </div>

      {/* Stuck deals across pipeline */}
      {stuck.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-[#C8A880]" />
            Stuck Deals · &gt;30 days in stage
            <span className="text-xs text-muted-foreground font-normal ml-1">({stuck.length})</span>
          </h3>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {stuck.slice(0, 10).map((d: any) => (
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

      {/* Drill-down panel */}
      {selectedStage && (
        <StageDrilldown stage={selectedStage} onClose={() => setSelectedStage(null)} />
      )}
    </div>
  );
}

function Stat({ label, value, color }: any) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{label}</div>
      <div className="text-2xl font-black mt-1.5" style={{ color }}>{value}</div>
    </div>
  );
}

function StageDrilldown({ stage, onClose }: { stage: string; onClose: () => void }) {
  const { data, isLoading } = useFunnelStage(stage);
  const { data: insightsData, isLoading: insightsLoading } = useFunnelStageInsights(stage);
  const deals = data?.deals ?? [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-stretch justify-end" onClick={onClose}>
      <div className="w-full max-w-2xl bg-background border-l border-border/40 overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-background border-b border-border/30 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Stage drill-down</div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: STAGE_COLORS[stage] }} />
              {STAGE_LABELS[stage]}
              <span className="text-xs text-muted-foreground font-normal">· {data?.count ?? 0} deals · ${(data?.total_value ?? 0).toLocaleString()}</span>
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

          {/* Deals list */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Deals in this stage</h3>
            {isLoading ? (
              <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="h-14 bg-muted/40 rounded-xl animate-pulse" />)}</div>
            ) : deals.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No deals in this stage.</p>
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
