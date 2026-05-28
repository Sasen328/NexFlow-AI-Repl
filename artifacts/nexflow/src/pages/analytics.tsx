import { useAnalytics } from "@/hooks/useApi";
import { BarChart3, TrendingUp, Users, DollarSign, Phone, Zap } from "lucide-react";

function MetricCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="text-xs text-muted-foreground font-medium mb-2">{label}</div>
      <div className="text-2xl font-bold text-foreground" style={{ color }}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 truncate">{label}</span>
      <div className="flex-1 h-2 bg-muted/60 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold text-foreground w-12 text-right">{typeof value === "number" && value > 1000 ? `$${(value / 100).toLocaleString()}` : value}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();
  const overview: any = data?.overview ?? {};
  const dealsByStage = data?.dealsByStage ?? [];
  const callMetrics: any = data?.callMetrics ?? {};
  const signalMetrics: any = data?.signalMetrics ?? {};

  const stageMax = Math.max(...dealsByStage.map((s: any) => s.totalValue ?? 0), 1);
  const stageColors = ["#B8A0C8", "#88B8B0", "#C8A880", "#90B8B8", "#B8B880", "#C0A0B8"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Revenue intelligence and performance metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Contacts" color="#B8A0C8"
          value={isLoading ? "—" : (overview.totalContacts ?? 0).toLocaleString()}
          sub="All time"
        />
        <MetricCard
          label="Pipeline Value" color="#88B8B0"
          value={isLoading ? "—" : `$${((overview.pipelineValue ?? 0) / 100).toLocaleString()}`}
          sub="Active deals"
        />
        <MetricCard
          label="Win Rate" color="#C8A880"
          value={isLoading ? "—" : `${(overview.winRate ?? 0).toFixed(1)}%`}
          sub="Closed won"
        />
        <MetricCard
          label="Avg Call Score" color="#90B8B8"
          value={isLoading ? "—" : `${(callMetrics.avgCallScore ?? 0).toFixed(0)}/100`}
          sub="AI evaluated"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground">Pipeline by Stage</h2>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => <div key={i} className="h-7 bg-muted/60 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {dealsByStage.map((s: any, idx: number) => (
                <MiniBar
                  key={s.stage}
                  label={s.stage?.replace("_", " ")}
                  value={s.totalValue ?? 0}
                  max={stageMax}
                  color={stageColors[idx % stageColors.length]}
                />
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground">Key Metrics</h2>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {[
              { label: "Total Deals", value: overview.totalDeals ?? 0, icon: TrendingUp, color: "#B8A0C8", format: "num" },
              { label: "Companies", value: overview.totalCompanies ?? 0, icon: Users, color: "#88B8B0", format: "num" },
              { label: "Revenue (Won)", value: overview.totalWonValue ?? 0, icon: DollarSign, color: "#C8A880", format: "money" },
              { label: "Calls Completed", value: callMetrics.completedCalls ?? 0, icon: Phone, color: "#90B8B8", format: "num" },
              { label: "Active Signals", value: signalMetrics.totalSignals ?? 0, icon: Zap, color: "#B8B880", format: "num" },
            ].map(({ label, value, icon: Icon, color, format }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {isLoading ? "—" : format === "money" ? `$${(value / 100).toLocaleString()}` : value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Signal Intelligence</h2>
          <div className="space-y-3">
            {[
              { label: "Total Signals", value: signalMetrics.totalSignals ?? 0 },
              { label: "New Signals", value: signalMetrics.newSignals ?? 0 },
              { label: "Avg Score", value: `${(signalMetrics.avgScore ?? 0).toFixed(0)}/100` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold text-foreground">{isLoading ? "—" : value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Call Performance</h2>
          <div className="space-y-3">
            {[
              { label: "Total Calls", value: callMetrics.totalCalls ?? 0 },
              { label: "Completed", value: callMetrics.completedCalls ?? 0 },
              { label: "Avg Duration", value: callMetrics.avgDuration ? `${Math.round(callMetrics.avgDuration / 60)}m` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold text-foreground">{isLoading ? "—" : value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Deal Performance</h2>
          <div className="space-y-3">
            {[
              { label: "Open Deals", value: overview.openDeals ?? 0 },
              { label: "Closed Won", value: overview.closedWon ?? 0 },
              { label: "Avg Deal Size", value: overview.avgDealSize ? `$${(overview.avgDealSize / 100).toFixed(0)}` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold text-foreground">{isLoading ? "—" : value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
