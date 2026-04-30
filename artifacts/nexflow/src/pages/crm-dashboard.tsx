import { useDashboard, useContacts, useCompanies, useFunnel, useCalls } from "@/hooks/useApi";
import {
  Users, Building2, GitBranch, TrendingUp, Sparkles, ArrowRight, Flame,
  Phone, MessageSquare, Activity, Briefcase, Trophy, Zap, AlertTriangle,
  CheckCircle2, Clock, Target, BarChart3, ArrowUpRight, ArrowDownRight,
  Star, RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const WINNING_TACTICS = [
  { tag: "Top play", title: "Same-day WhatsApp after missed call", result: "38% callback rate vs 9% email follow-up", color: "#88B8B0", icon: MessageSquare },
  { tag: "High impact", title: "Send ROI brief before first meeting", result: "Show-up rate improves from 62% → 89% in KSA accounts", color: "#B8A0C8", icon: Trophy },
  { tag: "Pipeline", title: "Multi-stakeholder intro in week 1", result: "Deals with 3+ contacts close 2.4x faster", color: "#C8A880", icon: Users },
];

const FLOW_STAGES = [
  { id: "mql",   label: "MQL",        sub: "Marketing Qualified" },
  { id: "sal1",  label: "SAL1",       sub: "Sales Accepted Lead" },
  { id: "sal2",  label: "SAL2",       sub: "Meeting Confirmed" },
  { id: "deal",  label: "Deal",       sub: "Active Negotiation" },
  { id: "won",   label: "Closed Won", sub: "Revenue Booked" },
];

const CONVERSION_BENCHMARKS: Record<string, { rate: number; benchmark: number; label: string }> = {
  mql_sal1: { rate: 41, benchmark: 35, label: "MQL → SAL1" },
  sal1_sal2: { rate: 68, benchmark: 55, label: "SAL1 → SAL2" },
  sal2_deal: { rate: 79, benchmark: 65, label: "SAL2 → Deal" },
  deal_won:  { rate: 34, benchmark: 29, label: "Deal → Won" },
};

const RISK_SIGNALS = [
  { id: "r1", contact: "Tariq Al-Rashid",  company: "Aramco Trading", risk: "No activity 18 days · SAL2 at risk of expiry", score: 82, color: "#C8A880" },
  { id: "r2", contact: "Nora Al-Faisal",   company: "NCB Capital",    risk: "SLA breach imminent · 3 unanswered messages",    score: 74, color: "#B8A0C8" },
  { id: "r3", contact: "Khaled Bin Saad",  company: "Saudi Telecom",  risk: "Deal stalled — last stage update 22 days ago",   score: 68, color: "#C0A0B8" },
];

export default function CrmDashboardPage() {
  const { data: dashboard } = useDashboard();
  const { data: contactsData } = useContacts();
  const { data: companiesData } = useCompanies();
  const { data: funnelData } = useFunnel();
  const { data: callsData } = useCalls();

  const stats = (dashboard?.stats ?? {}) as Record<string, number | undefined>;
  const contactsTotal = contactsData?.total ?? 0;
  const companiesTotal = companiesData?.total ?? 0;
  const funnel = funnelData?.funnel ?? [];
  const [refreshing, setRefreshing] = useState(false);

  const kpis = useMemo(() => {
    const openDeals = stats.openDeals ?? 12;
    const pipeline = (stats.pipelineValue ?? 4200000) / 100;
    const calls = (callsData?.calls ?? []).length || 23;
    return [
      { label: "Contacts", value: contactsTotal.toLocaleString() || "1,247", icon: Users,     color: "#C0A0B8", href: "/contacts",     delta: "+24 this week", up: true },
      { label: "Companies", value: companiesTotal.toLocaleString() || "318",  icon: Building2,  color: "#88B8B0", href: "/companies",    delta: "+6 this week",  up: true },
      { label: "Open Deals", value: String(openDeals),                         icon: GitBranch,  color: "#B8A0C8", href: "/leads/pipeline", delta: "3 at risk",   up: false },
      { label: "Pipeline",   value: `SAR ${Math.round(pipeline / 1000)}k`,     icon: TrendingUp, color: "#C8A880", href: "/leads/pipeline", delta: "+18% vs last week", up: true },
      { label: "Calls Today", value: String(calls),                            icon: Phone,      color: "#90B8B8", href: "/callcenter/calls", delta: "14 connected", up: true },
      { label: "Win Rate",   value: "34%",                                     icon: Trophy,     color: "#B8B880", href: "/leads/pipeline", delta: "+5pp vs team avg", up: true },
    ];
  }, [stats, contactsTotal, companiesTotal, callsData]);

  const aiSummary = useMemo(() => {
    const total = contactsTotal || 1247;
    const risk = 3;
    return `${total.toLocaleString()} contacts active across ${companiesTotal || 318} accounts. ${risk} deals are at risk of going cold this week — Tariq Al-Rashid (Aramco) is the highest-value. Lead→SAL1 conversion (41%) is ahead of benchmark (35%). Priority: re-engage 3 stalled deals and book SAL2 meetings for 5 SAL1 leads before Friday.`;
  }, [contactsTotal, companiesTotal]);

  function doRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#88B8B0]" /> CRM Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Revenue flows · winning tactics · risk signals · next best actions.</p>
        </div>
        <button onClick={doRefresh} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-border/40 bg-muted/30 hover:bg-muted/50 text-foreground">
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* AI Analysis Summary band */}
      <div className="rounded-2xl p-6 border relative overflow-hidden"
           style={{ background: "linear-gradient(135deg, #f9f3ff 0%, #f0f9f8 55%, #fffbf0 100%)", borderColor: "rgba(184,160,200,0.35)" }}>
        <div className="absolute top-0 right-0 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #B8A0C8, transparent)" }} />
        <div className="relative flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8A0C8] mb-0.5">AI CRM Intelligence · Today</div>
            <h2 className="text-lg font-black text-foreground mb-2">Revenue Flow Briefing</h2>
            <p className="text-sm text-foreground/85 leading-relaxed">{aiSummary}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link href="/leads/pipeline"><button type="button" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold nf-chameleon-bg text-white hover:opacity-90">Open Pipeline <ArrowRight className="w-3 h-3" /></button></Link>
              <Link href="/contacts"><button type="button" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 bg-white/70 hover:bg-white text-foreground">View Contacts</button></Link>
              <Link href="/callcenter/calls"><button type="button" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 bg-white/70 hover:bg-white text-foreground"><Phone className="w-3 h-3" /> Start Calling</button></Link>
            </div>
          </div>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(k => (
          <Link key={k.label} href={k.href}>
            <div className="glass-card rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${k.color}20` }}>
                  <k.icon className="w-4 h-4" style={{ color: k.color }} />
                </div>
                {k.up
                  ? <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
                  : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
              </div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-0.5">{k.label}</div>
              <div className="text-xl font-black" style={{ color: k.color }}>{k.value}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{k.delta}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue flow + Winning tactics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Flow funnel */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2"><Activity className="w-4 h-4 text-[#88B8B0]" /> Revenue Flow — Stage Velocity</h2>
            <Link href="/leads/pipeline"><span className="text-xs text-[#88B8B0] hover:underline cursor-pointer">Full pipeline →</span></Link>
          </div>
          {/* Stage pills */}
          <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
            {FLOW_STAGES.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="px-3 py-1.5 rounded-lg text-xs font-bold nf-chameleon-bg text-white whitespace-nowrap">{s.label}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5 whitespace-nowrap">{s.sub}</div>
                </div>
                {i < FLOW_STAGES.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground/50 mx-1 flex-shrink-0" />}
              </div>
            ))}
          </div>
          {/* Conversion rates */}
          <div className="space-y-3">
            {Object.entries(CONVERSION_BENCHMARKS).map(([k, v]) => (
              <div key={k}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-foreground">{v.label}</span>
                  <div className="flex items-center gap-3">
                    <span className={cn("font-bold", v.rate >= v.benchmark ? "text-[#88B8B0]" : "text-[#C8A880]")}>{v.rate}%</span>
                    <span className="text-muted-foreground text-[10px]">benchmark {v.benchmark}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted/30 relative">
                    <div className="h-2 rounded-full" style={{ width: `${v.rate}%`, background: v.rate >= v.benchmark ? "linear-gradient(90deg, #88B8B0, #B8A0C8)" : "linear-gradient(90deg, #C8A880, #C0A0B8)" }} />
                    <div className="absolute top-0 h-2 w-0.5 bg-muted-foreground/50" style={{ left: `${v.benchmark}%` }} title={`Benchmark: ${v.benchmark}%`} />
                  </div>
                  {v.rate >= v.benchmark
                    ? <ArrowUpRight className="w-3.5 h-3.5 text-[#88B8B0] flex-shrink-0" />
                    : <ArrowDownRight className="w-3.5 h-3.5 text-[#C8A880] flex-shrink-0" />}
                </div>
              </div>
            ))}
          </div>
          {/* Funnel live snapshot */}
          {funnel.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-border/20">
              {funnel.slice(0, 5).map((f: any) => (
                <Link key={f.stage} href="/leads/pipeline">
                  <div className="rounded-xl p-2.5 bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors text-center">
                    <div className="text-[9px] uppercase tracking-wide font-bold text-muted-foreground capitalize">{String(f.stage).replace("_", " ")}</div>
                    <div className="text-lg font-black text-foreground mt-0.5">{f.count}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Winning tactics */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4"><Trophy className="w-4 h-4 text-[#C8A880]" /> Winning Tactics</h2>
          <div className="space-y-3">
            {WINNING_TACTICS.map((t, i) => (
              <div key={i} className="p-3 rounded-xl border" style={{ borderColor: `${t.color}25`, background: `${t.color}06` }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${t.color}20` }}>
                    <t.icon className="w-3 h-3" style={{ color: t.color }} />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${t.color}15`, color: t.color }}>{t.tag}</span>
                </div>
                <div className="text-xs font-bold text-foreground mb-0.5">{t.title}</div>
                <div className="text-[11px] text-foreground/70 leading-relaxed">{t.result}</div>
              </div>
            ))}
          </div>
          <Link href="/leads/pipeline">
            <button type="button" className="w-full mt-3 py-2 text-xs font-semibold text-[#B8A0C8] hover:underline flex items-center justify-center gap-1">
              Full gap analysis <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      </div>

      {/* At-risk deals */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-[#C8A880]" />
          <h2 className="font-semibold text-foreground text-sm">At-Risk Deals · Immediate Attention</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#C8A880]/15 text-[#C8A880]">{RISK_SIGNALS.length} flagged</span>
        </div>
        <div className="space-y-2">
          {RISK_SIGNALS.map(r => (
            <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl border border-[#C8A880]/20 bg-[#C8A880]/04">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#C8A880]/15">
                <AlertTriangle className="w-4 h-4 text-[#C8A880]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground">{r.contact}</div>
                <div className="text-xs text-muted-foreground">{r.company} · Lead score {r.score}</div>
                <div className="text-[11px] text-[#C8A880] font-medium mt-0.5">{r.risk}</div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <Link href={`/contacts`}>
                  <button type="button" className="px-3 py-1.5 rounded-lg text-[11px] font-bold nf-chameleon-bg text-white hover:opacity-90">
                    <Zap className="w-3 h-3 inline mr-1" />Re-engage
                  </button>
                </Link>
                <button type="button" className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-border/40 text-muted-foreground hover:bg-muted/40">
                  <MessageSquare className="w-3 h-3 inline mr-1" />WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity signals grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-3"><Flame className="w-4 h-4 text-[#B8B880]" /> Hot Buying Signals · 24h</h2>
          <div className="space-y-2">
            {[
              { name: "Faisal Al-Mutairi",   co: "SABIC",       signal: "Opened pricing page 4× today",         score: 96 },
              { name: "Reem Al-Zahrani",      co: "Riyad Bank",   signal: "Submitted demo request form",          score: 93 },
              { name: "Omar Al-Qahtani",      co: "STC Group",    signal: "Forwarded ROI brief to CFO",           score: 88 },
              { name: "Aisha Mohammed",       co: "Saudi Aramco", signal: "LinkedIn visited your profile + reply", score: 85 },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
                <div className="w-7 h-7 rounded-full nf-chameleon-bg flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white">{s.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{s.name} <span className="font-normal text-muted-foreground">· {s.co}</span></div>
                  <div className="text-[10px] text-muted-foreground">{s.signal}</div>
                </div>
                <span className="text-xs font-black text-[#B8B880] flex-shrink-0">{s.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-foreground flex items-center gap-2 mb-3"><Star className="w-4 h-4 text-[#B8A0C8]" /> Next Best Actions · AI-generated</h2>
          <div className="space-y-2">
            {[
              { action: "Call Faisal Al-Mutairi",          reason: "4× pricing page today — highest intent",         color: "#88B8B0", type: "Call" },
              { action: "WhatsApp Reem Al-Zahrani",        reason: "Demo request 3h ago — no follow-up yet",         color: "#B8A0C8", type: "WA" },
              { action: "Send SAL2 invite to 5 SAL1 leads", reason: "Funnel conversion at risk — velocity dropping",  color: "#C8A880", type: "Email" },
              { action: "Reactivate Khaled Bin Saad",      reason: "22-day silence — deal at risk of loss",          color: "#C0A0B8", type: "Task" },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: `${a.color}08`, borderLeft: `3px solid ${a.color}` }}>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: `${a.color}20`, color: a.color }}>{a.type}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{a.action}</div>
                  <div className="text-[10px] text-muted-foreground">{a.reason}</div>
                </div>
                <Link href="/callcenter/calls">
                  <button type="button" className="p-1.5 rounded-lg text-white flex-shrink-0" style={{ background: a.color }}>
                    <Zap className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
