import { useDashboard, useContacts, useCompanies, useFunnel } from "@/hooks/useApi";
import {
  Users, Building2, GitBranch, Target, TrendingUp, Sparkles, ArrowRight,
  Phone, Mail, MessageSquare, Activity, Briefcase,
} from "lucide-react";
import { Link } from "wouter";
import { useMemo } from "react";

/**
 * /crm-dashboard — CRM Workspace dashboard.
 *
 * Aggregates contacts, companies, lead-stage funnel, and recent activity
 * into one home for the CRM section. Different from /section/crm (the
 * tools-grid hub) — this one is the data-rich daily snapshot.
 */
export default function CrmDashboardPage() {
  const { data: dashboard } = useDashboard();
  const { data: contactsData } = useContacts();
  const { data: companiesData } = useCompanies();
  const { data: funnelData } = useFunnel();

  const stats = (dashboard?.stats ?? {}) as Record<string, number | undefined>;
  const contactsTotal = contactsData?.total ?? 0;
  const companiesTotal = companiesData?.total ?? 0;
  const funnel = funnelData?.funnel ?? [];

  const insight = useMemo(() => {
    const lead = funnel.find((f: any) => f.stage === "lead");
    const qualified = funnel.find((f: any) => f.stage === "qualified");
    const closed = funnel.find((f: any) => f.stage === "closed_won");
    const conv = lead && qualified && lead.count
      ? Math.round((qualified.count / lead.count) * 100)
      : null;
    const cta = lead && qualified && (qualified.count / Math.max(lead.count, 1)) < 0.3
      ? "Lead → Qualified conversion is below 30% — open Pipeline to see the AI gap analysis."
      : `You're tracking ${contactsTotal.toLocaleString()} contacts across ${companiesTotal.toLocaleString()} companies. ${closed?.count ?? 0} deals closed this period.`;
    return { conv, cta };
  }, [funnel, contactsTotal, companiesTotal]);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#88B8B0]" /> CRM Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Daily snapshot of contacts, companies, lead stages, and revenue motion.
          </p>
        </div>
      </div>

      {/* AI summary */}
      <div className="rounded-2xl p-5 border relative overflow-hidden"
           style={{ background: "linear-gradient(135deg, rgba(184,160,200,0.10), rgba(136,184,176,0.10))", borderColor: "rgba(184,160,200,0.3)" }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider font-bold text-[#B8A0C8] mb-0.5">CRM AI Briefing</div>
            <p className="text-sm text-foreground/85 leading-relaxed">{insight.cta}</p>
          </div>
          <Link href="/pipeline">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/60 border border-[#B8A0C8]/40 text-[11px] font-semibold text-[#B8A0C8] hover:bg-white/80">
              Open Pipeline <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Contacts" value={contactsTotal.toLocaleString()} icon={Users} color="#C0A0B8" href="/contacts" />
        <KpiCard label="Companies" value={companiesTotal.toLocaleString()} icon={Building2} color="#88B8B0" href="/companies" />
        <KpiCard label="Open deals" value={String(stats.openDeals ?? 0)} icon={GitBranch} color="#B8A0C8" href="/deal-pipeline" />
        <KpiCard label="Pipeline value" value={`$${((stats.pipelineValue ?? 0) / 100).toLocaleString()}`} icon={TrendingUp} color="#C8A880" href="/forecasting" />
      </div>

      {/* Lead-stage strip (mini funnel preview) */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-[#88B8B0]" />
            Lead-stage snapshot
          </h2>
          <Link href="/pipeline">
            <span className="text-xs text-[#88B8B0] hover:underline cursor-pointer">Full pipeline →</span>
          </Link>
        </div>
        {funnel.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center">No funnel data yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {funnel.map((f: any) => (
              <Link key={f.stage} href="/pipeline">
                <div className="rounded-xl p-3 bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground capitalize">{f.stage.replace("_", " ")}</div>
                  <div className="text-2xl font-black text-foreground mt-0.5">{f.count}</div>
                  <div className="text-[10px] text-muted-foreground">${(f.value ?? 0).toLocaleString()}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#B8A0C8]" /> Quick actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Add Contact", icon: Users, color: "#C0A0B8", href: "/contacts" },
            { label: "Add Company", icon: Building2, color: "#88B8B0", href: "/companies" },
            { label: "New Deal", icon: GitBranch, color: "#B8A0C8", href: "/deal-pipeline" },
            { label: "Log Engagement", icon: MessageSquare, color: "#C8A880", href: "/engagement" },
            { label: "Start a Call", icon: Phone, color: "#88B8B0", href: "/calls" },
            { label: "Send Email", icon: Mail, color: "#B8A0C8", href: "/email" },
            { label: "Forecast", icon: TrendingUp, color: "#B8B880", href: "/forecasting" },
            { label: "Find leads", icon: Target, color: "#90B8B8", href: "/sourcing" },
          ].map((a) => (
            <Link key={a.label} href={a.href}>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}20` }}>
                  <a.icon className="w-4 h-4" style={{ color: a.color }} />
                </div>
                <span className="text-sm font-medium text-foreground flex-1">{a.label}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color, href }: { label: string; value: string; icon: any; color: string; href: string }) {
  return (
    <Link href={href}>
      <div className="glass-card rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20`, color }}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{label}</div>
            <div className="text-xl font-black mt-0.5" style={{ color }}>{value}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
