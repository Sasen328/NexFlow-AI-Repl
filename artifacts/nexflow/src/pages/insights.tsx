import { useDailyInsights, useInsights, useRegenerateInsights, useInsightsTrend } from "@/hooks/useApi";
import { Sparkles, AlertTriangle, TrendingUp, Info, Flame, RefreshCw, Loader2, EyeOff, ArrowRight, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const SEVERITY: any = {
  critical: { color: "#C8A880", bg: "bg-[#C8A880]/10", border: "border-[#C8A880]/30", icon: AlertTriangle, label: "Critical" },
  warning: { color: "#C8A880", bg: "bg-[#C8A880]/10", border: "border-[#C8A880]/30", icon: AlertTriangle, label: "Warning" },
  opportunity: { color: "#88B8B0", bg: "bg-[#88B8B0]/10", border: "border-[#88B8B0]/30", icon: TrendingUp, label: "Opportunity" },
  info: { color: "#90B8B8", bg: "bg-[#90B8B8]/10", border: "border-[#90B8B8]/30", icon: Info, label: "Info" },
};

const CATEGORIES = ["pipeline", "conversion", "engagement", "market_context", "risk"] as const;

export default function InsightsPage() {
  const qc = useQueryClient();
  const { data: today } = useDailyInsights();
  const { data: history } = useInsights();
  const { data: trendData } = useInsightsTrend();
  const regen = useRegenerateInsights();
  const [, navigate] = useLocation();
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [filterSev, setFilterSev] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    qc.invalidateQueries({ queryKey: ["insights"] });
  }, [today]);

  const todayItems = (today?.insights ?? []).filter((i: any) => !dismissed.has(i.id));
  const allItems = history?.insights ?? [];

  const filtered = todayItems.filter((i: any) =>
    (!filterCat || i.category === filterCat) &&
    (!filterSev || i.severity === filterSev)
  );

  // Trend: build a 14-day strip
  const trendStrip = useMemo(() => {
    const trend = trendData?.trend ?? [];
    const map = new Map<string, number>();
    trend.forEach((r: any) => {
      const day = new Date(r.day).toISOString().slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + Number(r.count || 0));
    });
    const days: { day: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ day: key, count: map.get(key) ?? 0 });
    }
    return days;
  }, [trendData]);
  const trendMax = Math.max(...trendStrip.map(d => d.count), 1);

  // ─── AI summary derived from today's items ────────────────────────────
  const summary = useMemo(() => {
    const counts = { critical: 0, warning: 0, opportunity: 0, info: 0 } as Record<string, number>;
    todayItems.forEach((i: any) => {
      counts[i.severity] = (counts[i.severity] ?? 0) + 1;
    });
    const total = todayItems.length;
    const topCritical = todayItems.find((i: any) => i.severity === "critical")
      ?? todayItems.find((i: any) => i.severity === "warning");
    const topOpp = todayItems.find((i: any) => i.severity === "opportunity");

    let headline: string;
    if (total === 0) {
      headline = "Generating today's bottom line…";
    } else if (counts.critical > 0) {
      headline = `${counts.critical} critical issue${counts.critical === 1 ? "" : "s"} need your attention today.`;
    } else if (counts.warning > 0) {
      headline = `${counts.warning} warning${counts.warning === 1 ? "" : "s"} to review · ${counts.opportunity} opportunit${counts.opportunity === 1 ? "y" : "ies"} to lean into.`;
    } else if (counts.opportunity > 0) {
      headline = `Calm day. ${counts.opportunity} opportunit${counts.opportunity === 1 ? "y" : "ies"} are worth chasing.`;
    } else {
      headline = `${total} insight${total === 1 ? "" : "s"} on deck. Pipeline is steady.`;
    }

    const recs: { label: string; tone: "danger" | "ok" | "neutral"; onClick: () => void }[] = [];
    if (topCritical) {
      recs.push({
        label: `Address: ${topCritical.title.length > 60 ? topCritical.title.slice(0, 57) + "…" : topCritical.title}`,
        tone: topCritical.severity === "critical" ? "danger" : "neutral",
        onClick: () => setFilterSev(topCritical.severity),
      });
    }
    if (topOpp) {
      recs.push({
        label: `Lean into: ${topOpp.title.length > 60 ? topOpp.title.slice(0, 57) + "…" : topOpp.title}`,
        tone: "ok",
        onClick: () => setFilterSev("opportunity"),
      });
    }
    if (counts.critical + counts.warning >= 3) {
      recs.push({
        label: "Block 30 min for triage — multiple risk signals",
        tone: "neutral",
        onClick: () => setFilterCat("risk"),
      });
    }
    return { headline, counts, total, recs };
  }, [todayItems]);

  async function regenerate() {
    setBusy(true);
    try {
      await regen.mutateAsync();
      // Force re-fetch the daily endpoint (not just history)
      await qc.invalidateQueries({ queryKey: ["insights", "daily"] });
      await qc.refetchQueries({ queryKey: ["insights", "daily"] });
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Sparkles className="w-6 h-6 text-[#B8A0C8]" /> Daily Insights</h1>
          <p className="text-muted-foreground text-sm mt-0.5">AI-curated briefing combining pipeline data, market context, and rep behavior.</p>
        </div>
        <button
          onClick={regenerate}
          disabled={busy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl nf-chameleon-bg text-white text-xs font-semibold disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Regenerate today
        </button>
      </div>

      {/* AI Summary hero — Today's Bottom Line */}
      <div className="rounded-3xl p-5 sm:p-6 border relative overflow-hidden"
           style={{ background: "linear-gradient(135deg, rgba(184,160,200,0.12), rgba(136,184,176,0.10), rgba(200,168,128,0.10))", borderColor: "rgba(184,160,200,0.3)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-25" style={{ background: "radial-gradient(circle, #B8A0C8, transparent)" }} />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl opacity-15" style={{ background: "radial-gradient(circle, #88B8B0, transparent)" }} />
        </div>
        <div className="relative">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-bold text-[#B8A0C8]">Today's Bottom Line</div>
              <p className="text-base sm:text-lg font-bold text-foreground leading-snug mt-0.5">{summary.headline}</p>
            </div>
          </div>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(["critical", "warning", "opportunity", "info"] as const).map((sev) => {
              const count = summary.counts[sev] ?? 0;
              if (count === 0) return null;
              const meta = SEVERITY[sev];
              return (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setFilterSev(filterSev === sev ? null : sev)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors",
                    filterSev === sev ? "ring-2 ring-offset-1 ring-offset-background" : "",
                  )}
                  style={{
                    background: meta.color + "15",
                    borderColor: meta.color + "55",
                    color: meta.color,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                  {count} {meta.label.toLowerCase()}
                </button>
              );
            })}
            {summary.total > 0 && (
              <span className="text-[11px] text-muted-foreground self-center ml-1">
                · {summary.total} insight{summary.total === 1 ? "" : "s"} total
              </span>
            )}
          </div>

          {/* Recommendations */}
          {summary.recs.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Recommended next moves</div>
              {summary.recs.map((rec, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={rec.onClick}
                  className={cn(
                    "w-full flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs hover:shadow-sm transition-all group",
                    rec.tone === "danger" ? "bg-[#C8A880]/10 border-[#C8A880]/30 text-foreground"
                    : rec.tone === "ok" ? "bg-[#88B8B0]/10 border-[#88B8B0]/30 text-foreground"
                    : "bg-white/40 border-border/40 text-foreground",
                  )}
                >
                  {rec.tone === "danger" ? <AlertTriangle className="w-3.5 h-3.5 text-[#C8A880] flex-shrink-0" />
                    : rec.tone === "ok" ? <Zap className="w-3.5 h-3.5 text-[#88B8B0] flex-shrink-0" />
                    : <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                  <span className="flex-1 font-medium">{rec.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 14-day trend strip */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">14-day insight volume</div>
          <div className="text-xs text-muted-foreground">{trendStrip.reduce((s, d) => s + d.count, 0)} total</div>
        </div>
        <div className="flex items-end gap-1 h-12">
          {trendStrip.map(d => {
            const h = (d.count / trendMax) * 100;
            return (
              <div key={d.day} className="flex-1 h-full flex items-end group relative" title={`${d.day}: ${d.count}`}>
                <div className={cn("w-full rounded-t transition-all", d.count > 0 ? "nf-chameleon-bg" : "bg-muted/40")} style={{ height: `${Math.max(8, h)}%` }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Filter:</span>
        <FilterChip active={!filterCat} onClick={() => setFilterCat(null)}>All categories</FilterChip>
        {CATEGORIES.map(c => (
          <FilterChip key={c} active={filterCat === c} onClick={() => setFilterCat(c)}>{c.replace("_", " ")}</FilterChip>
        ))}
        <span className="w-px h-4 bg-border/40 mx-1" />
        <FilterChip active={!filterSev} onClick={() => setFilterSev(null)}>All severity</FilterChip>
        {Object.keys(SEVERITY).map(s => (
          <FilterChip key={s} active={filterSev === s} onClick={() => setFilterSev(s)}>{SEVERITY[s].label}</FilterChip>
        ))}
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-[#C8A880]" /> Today's Briefing
          <span className="text-muted-foreground font-normal normal-case">· {filtered.length} of {todayItems.length} shown</span>
        </h2>
        {!todayItems.length ? (
          <div className="glass-card rounded-2xl p-8 text-center text-sm text-muted-foreground">Generating today's briefing…</div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-sm text-muted-foreground">No insights match the current filter.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((i: any) => {
              const meta = SEVERITY[i.severity] ?? SEVERITY.info;
              const Icon = meta.icon;
              return (
                <div key={i.id} className={"glass-card rounded-2xl p-4 border group " + meta.border + " " + meta.bg}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.color + "30", color: meta.color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground text-sm">{i.title}</h3>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">{i.category}</span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed">{i.body}</p>
                    </div>
                    <button
                      onClick={() => setDismissed(new Set([...dismissed, i.id]))}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground p-1"
                      title="Dismiss"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">History</h2>
        <div className="space-y-2">
          {allItems.filter((i: any) => !todayItems.find((t: any) => t.id === i.id)).slice(0, 30).map((i: any) => {
            const meta = SEVERITY[i.severity] ?? SEVERITY.info;
            return (
              <div key={i.id} className="glass-card rounded-xl p-3 text-xs flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                <span className="text-muted-foreground w-20 flex-shrink-0">{new Date(i.generated_at).toLocaleDateString()}</span>
                <span className="font-medium text-foreground flex-1 truncate">{i.title}</span>
                <span className="text-muted-foreground capitalize hidden sm:inline">{i.category}</span>
              </div>
            );
          })}
          {allItems.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-4">No history yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ active, children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-[11px] px-2.5 py-1 rounded-full font-medium border capitalize transition-colors",
        active ? "bg-[#B8A0C8]/15 border-[#B8A0C8]/40 text-foreground" : "border-border/30 text-muted-foreground hover:bg-muted/30"
      )}
    >
      {children}
    </button>
  );
}
