import { useFunnel } from "@/hooks/useApi";
import { TrendingDown, TrendingUp } from "lucide-react";

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
  const funnel = data?.funnel ?? [];
  const max = Math.max(...funnel.map((f: any) => f.count), 1);

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sales Funnel</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Stage-by-stage conversion across the pipeline.</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        {isLoading ? <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}</div> : (
          <div className="space-y-3">
            {funnel.map((f: any, i: number) => {
              const widthPct = Math.max(15, (f.count / max) * 100);
              const color = STAGE_COLORS[f.stage] ?? "#90B8B8";
              return (
                <div key={f.stage}>
                  <div className="flex items-center gap-3 mb-1.5">
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Stat label="Top of funnel" value={funnel[0]?.count ?? 0} color="#90B8B8" />
        <Stat label="Total pipeline value" value={`$${funnel.reduce((s: number, f: any) => s + f.value, 0).toLocaleString()}`} color="#88B8B0" />
        <Stat label="Lead→Won %" value={funnel[0]?.count ? Math.round((funnel[funnel.length-1]?.count / funnel[0].count) * 100) + "%" : "—"} color="#B8A0C8" />
      </div>
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
