import { useDeals } from "@/hooks/useApi";
import { Sparkles, TrendingUp, Target, Clock, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import DealsPage from "@/pages/deals";

/**
 * /deal-pipeline — Post-SAL deals pipeline.
 *
 * Wraps the existing /deals kanban with a top "AI stage analysis" header so
 * the post-SAL view feels distinct from /pipeline (the pre-SAL lead funnel).
 */
export default function DealPipelinePage() {
  const { data } = useDeals();
  const deals = data?.deals ?? [];

  const analysis = useMemo(() => {
    const active = deals.filter((d: any) => !["closed_won", "closed_lost"].includes(d.stage));
    const totalValue = active.reduce((s: number, d: any) => s + (d.value ?? 0), 0);
    const negotiation = deals.filter((d: any) => d.stage === "negotiation");
    const proposal = deals.filter((d: any) => d.stage === "proposal");
    const won = deals.filter((d: any) => d.stage === "closed_won");
    const lost = deals.filter((d: any) => d.stage === "closed_lost");
    const winRate = won.length + lost.length > 0
      ? Math.round((won.length / (won.length + lost.length)) * 100)
      : null;

    // Heuristic AI summary
    const summaryBits: string[] = [];
    summaryBits.push(`$${(totalValue / 100).toLocaleString()} active in ${active.length} deals`);
    if (negotiation.length) summaryBits.push(`${negotiation.length} in Negotiation — push for close this week`);
    if (proposal.length) summaryBits.push(`${proposal.length} in Proposal — confirm decision criteria + budget`);
    if (winRate != null) summaryBits.push(`Win rate ${winRate}% over ${won.length + lost.length} closed deals`);

    return { totalValue, active, negotiation, proposal, won, lost, winRate, summary: summaryBits.join(" · ") };
  }, [deals]);

  return (
    <div className="space-y-5">
      {/* Header / AI summary */}
      <div
        className="rounded-3xl p-5 sm:p-6 border relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(184,160,200,0.10), rgba(136,184,176,0.10), rgba(200,168,128,0.10))",
          borderColor: "rgba(184,160,200,0.3)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #B8A0C8, transparent)" }} />
        </div>
        <div className="relative">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Deal Pipeline</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Post-SAL deals · drag stages, drill into each card, watch AI analysis below.
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-white/55 border border-[#B8A0C8]/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-bold text-[#B8A0C8] mb-0.5">AI Stage Analysis</div>
              <p className="text-sm text-foreground/85 leading-relaxed">{analysis.summary}</p>
            </div>
          </div>

          {/* Mini KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <MiniStat label="Active deals" value={String(analysis.active.length)} icon={Target} color="#88B8B0" />
            <MiniStat label="Active value" value={`$${(analysis.totalValue / 100).toLocaleString()}`} icon={TrendingUp} color="#B8A0C8" />
            <MiniStat label="In Negotiation" value={String(analysis.negotiation.length)} icon={Clock} color="#C8A880" />
            <MiniStat
              label="Win rate"
              value={analysis.winRate != null ? `${analysis.winRate}%` : "—"}
              icon={analysis.winRate != null && analysis.winRate >= 40 ? Sparkles : AlertTriangle}
              color={analysis.winRate != null && analysis.winRate >= 40 ? "#88B8B0" : "#C0A0B8"}
            />
          </div>
        </div>
      </div>

      {/* Reuse the kanban from /deals */}
      <DealsPage />
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <div className="rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.7)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xl font-black text-foreground leading-none">{value}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}
