import { useDashboard, useSignals, useActivities, useNotifications } from "@/hooks/useApi";
import { TrendingUp, Users, DollarSign, Zap, Phone, ArrowUpRight, Target, Brain, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", color)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "#88B8B0" : score >= 60 ? "#B8B880" : "#C0A0B8";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold text-foreground w-8 text-right">{score}</span>
    </div>
  );
}

export default function Dashboard() {
  const { data: dashboard, isLoading } = useDashboard();
  const { data: signalsData } = useSignals({ limit: "5" });
  const { data: activitiesData } = useActivities({ limit: "5" });
  const { data: notifData } = useNotifications();

  const signals = signalsData?.signals ?? [];
  const activities = activitiesData?.activities ?? [];
  const notifications = (notifData?.notifications ?? []).filter((n: any) => !n.read);

  const stats = dashboard?.stats ?? {
    totalContacts: 0, totalCompanies: 0, openDeals: 0, totalRevenue: 0,
    avgLeadScore: 0, completedCalls: 0, pendingActivities: 0, newSignals: 0
  };
  const pipeline = dashboard?.pipeline ?? [];
  const topContacts = dashboard?.topContacts ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">AI-native overview of your pipeline and signals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Contacts" value={stats.totalContacts?.toLocaleString() ?? "—"} sub="Total" color="bg-[#B8A0C8]" />
        <StatCard icon={Building2Placeholder} label="Companies" value={stats.totalCompanies?.toLocaleString() ?? "—"} sub="Tracked" color="bg-[#88B8B0]" />
        <StatCard icon={TrendingUp} label="Open Deals" value={stats.openDeals?.toLocaleString() ?? "—"} sub={`$${((stats.totalRevenue ?? 0) / 100).toLocaleString()} pipeline`} color="bg-[#C8A880]" />
        <StatCard icon={Zap} label="New Signals" value={stats.newSignals?.toLocaleString() ?? "—"} sub="This week" color="bg-[#C0A0B8]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Pipeline Overview</h2>
            <span className="text-xs text-muted-foreground">By stage</span>
          </div>
          {pipeline.length === 0 && isLoading ? (
            <div className="space-y-3">
              {["Lead", "Qualified", "Proposal", "Negotiation", "Won"].map(s => (
                <div key={s} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-24">{s}</span>
                  <div className="flex-1 h-6 bg-muted/60 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {pipeline.map((p: any) => {
                const max = Math.max(...pipeline.map((x: any) => x.totalValue || 1));
                const pct = ((p.totalValue || 0) / max) * 100;
                return (
                  <div key={p.stage} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24 capitalize">{p.stage?.replace("_", " ")}</span>
                    <div className="flex-1 h-6 bg-muted/40 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full rounded-lg nf-chameleon-bg opacity-70 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground">
                        {p.count} deals · ${((p.totalValue || 0) / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Contacts */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Top Contacts</h2>
            <Brain className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {topContacts.length === 0 ? (
              [92, 87, 82, 78, 74].map((s, i) => (
                <div key={i} className="h-8 bg-muted/60 rounded animate-pulse" />
              ))
            ) : (
              topContacts.map((c: any) => (
                <ScoreBar key={c.id} score={c.leadScore ?? 0} label={`${c.firstName} ${c.lastName}`} />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Signals */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Signals</h2>
            <Zap className="w-4 h-4 text-[#B8B880]" />
          </div>
          <div className="space-y-3">
            {signals.length === 0 ? (
              [1,2,3].map(i => <div key={i} className="h-14 bg-muted/60 rounded-lg animate-pulse" />)
            ) : (
              signals.map((s: any) => (
                <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#B8B880]/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3.5 h-3.5 text-[#B8B880]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-foreground truncate">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.body}</div>
                  </div>
                  <div className="flex-shrink-0 text-xs font-bold text-[#88B8B0]">{s.score}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Activities</h2>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {activities.length === 0 ? (
              [1,2,3].map(i => <div key={i} className="h-14 bg-muted/60 rounded-lg animate-pulse" />)
            ) : (
              activities.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    a.type === "call" ? "bg-[#88B8B0]/20" : a.type === "email" ? "bg-[#B8A0C8]/20" : "bg-[#C8A880]/20"
                  )}>
                    {a.type === "call" ? <Phone className="w-3.5 h-3.5 text-[#88B8B0]" /> : <Activity className="w-3.5 h-3.5 text-[#B8A0C8]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-foreground truncate">{a.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.body}</div>
                  </div>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0",
                    a.status === "completed" ? "bg-[#88B8B0]/20 text-[#88B8B0]" : "bg-[#C8A880]/20 text-[#C8A880]"
                  )}>{a.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Notifications Banner */}
      {notifications.length > 0 && (
        <div className="nf-chameleon-border rounded-2xl p-4 glass-card">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-4 h-4 text-[#B8A0C8]" />
            <span className="text-sm font-semibold text-foreground">AI Insights — {notifications.length} unread</span>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((n: any) => (
              <div key={n.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                <ArrowUpRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#88B8B0]" />
                <span>{n.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Building2Placeholder({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
