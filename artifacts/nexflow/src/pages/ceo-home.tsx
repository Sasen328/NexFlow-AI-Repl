import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Crown, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Sparkles,
  Brain, Building2, Users, Target, DollarSign, AlertTriangle, Award,
  Zap, Newspaper, Radar, Activity, BarChart3, PieChart as PieIcon,
  Headphones, Play, Pause, Star, Trophy, Flame, AlertCircle, Megaphone,
  GitBranch, Clock, ChevronRight, Phone, Mail, MessageSquare, Eye,
  Filter, Download, Calendar, MapPin, Globe2, Layers, ShieldAlert,
} from "lucide-react";
import { useDashboard, useContacts, useCalls, useForgottenLeads, useAnalytics } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// CEO HOME — exec-grade situation room.
// Mirrors what a CEO of a GCC B2B firm needs to see at a glance:
//   • Pulse strip (revenue, pipeline, win rate, burn vs target)
//   • Office & team performance grid (UAE, KSA, Qatar, Kuwait, Bahrain, Oman)
//   • Strategic & predictive forecast
//   • News + macro signals affecting accounts
//   • Marketing & campaign performance
//   • Funnel leakage — where leads went cold
//   • Call recordings library + per-agent scoring
//   • Top performers, gaps, bottlenecks
//   • Untaken actions ledger (where reps didn't follow up)
// ─────────────────────────────────────────────────────────────────

const OFFICES = [
  { city: "Dubai",       country: "UAE",     team: 14, revenue: 4_280_000, target: 4_000_000, pipeline: 12_400_000, winRate: 32, change: +18, leadOwner: "Layla Hassan",     status: "exceeding" },
  { city: "Riyadh",      country: "KSA",     team: 18, revenue: 5_640_000, target: 5_500_000, pipeline: 18_200_000, winRate: 29, change: +11, leadOwner: "Tariq Bin-Laden",  status: "exceeding" },
  { city: "Doha",        country: "Qatar",   team:  9, revenue: 2_140_000, target: 2_400_000, pipeline:  6_800_000, winRate: 24, change:  -6, leadOwner: "Hessa Al-Thani",   status: "behind" },
  { city: "Kuwait City", country: "Kuwait",  team:  7, revenue: 1_780_000, target: 1_700_000, pipeline:  4_900_000, winRate: 27, change:  +4, leadOwner: "Yousef Al-Sabah",  status: "ontrack" },
  { city: "Manama",      country: "Bahrain", team:  5, revenue: 1_120_000, target: 1_400_000, pipeline:  3_100_000, winRate: 21, change: -14, leadOwner: "Nadia Al-Khalifa", status: "behind" },
  { city: "Muscat",      country: "Oman",    team:  6, revenue: 1_460_000, target: 1_300_000, pipeline:  3_800_000, winRate: 26, change:  +9, leadOwner: "Khalid Al-Said",   status: "ontrack" },
];

const NEWS_SIGNALS = [
  { type: "regulatory", icon: ShieldAlert, color: "#C0A0B8", title: "UAE corporate tax reform — Q3 deadline",   detail: "12 enterprise accounts will need compliance advisory. Estimated services pipeline: $1.4M.", source: "Federal Tax Authority", time: "2h ago", impact: "high" },
  { type: "deal",       icon: Flame,       color: "#C8A880", title: "Aramco Digital Initiative announced",      detail: "$2.1B procurement program — 4 of our KSA accounts are pre-qualified suppliers. Activate Tier-1 outreach.", source: "Reuters MENA",     time: "4h ago", impact: "high" },
  { type: "macro",      icon: TrendingUp,  color: "#88B8B0", title: "GCC IT spend projected +14% YoY for FY26",  detail: "Gartner forecast — strongest in financial services and energy. Reposition our Q4 narrative.", source: "Gartner",            time: "1d ago", impact: "med" },
  { type: "account",    icon: Radar,       color: "#B8A0C8", title: "Emirates NBD CTO change — Karim Al-Maktoum", detail: "Champion of one of our open opps just left. Reassign account, brief new CTO via warm intro.", source: "LinkedIn signal",    time: "1d ago", impact: "high" },
  { type: "competitor", icon: AlertTriangle, color: "#C0A0B8", title: "Competitor X price cut on enterprise tier", detail: "Their flagship now $89/seat. Three of our late-stage deals at risk — flag for pricing committee.", source: "Win/loss intel",    time: "2d ago", impact: "med" },
];

const STRATEGIC_INITIATIVES = [
  { name: "GCC market expansion — penetrate Oman & Bahrain mid-market", owner: "Dalia Mansour", status: "on-track",   pct: 64, eta: "Q3 close", risk: "low",    impact: "$3.2M ARR" },
  { name: "Enterprise GTM — land 5 new logos > $500K ACV",              owner: "Tariq Bin-Laden", status: "at-risk",    pct: 42, eta: "Q4 close", risk: "med",    impact: "$3.5M ARR" },
  { name: "AI-product upsell to existing top-50 accounts",               owner: "Layla Hassan",   status: "ahead",      pct: 78, eta: "Q3 close", risk: "low",    impact: "$2.1M ARR" },
  { name: "Reduce CAC payback from 18 → 12 months",                      owner: "Marketing Ops",  status: "on-track",   pct: 55, eta: "FY-end",   risk: "low",    impact: "Margin +6 pts" },
  { name: "KSA nationalisation hires (target 60% Saudization)",          owner: "People Ops",     status: "behind",     pct: 31, eta: "Q4 close", risk: "high",   impact: "Compliance" },
];

const PREDICTIVE = [
  { label: "Quarter forecast (commit + best-case)", value: "$18.4M", sub: "+9% vs target · 87% confidence",      tone: "good" as const },
  { label: "Pipeline coverage ratio",                value: "3.6×",   sub: "Above the 3.0× floor",                tone: "good" as const },
  { label: "Win-rate trend (last 4 weeks)",          value: "27%",    sub: "−3 pts vs 30-day baseline",           tone: "warn" as const },
  { label: "Churn risk (top 50 accounts)",           value: "4 acc.", sub: "Auto-flagged · trigger CSM playbook", tone: "bad"  as const },
  { label: "Hiring gap (open seats vs ramp need)",   value: "−7",     sub: "KSA & Oman shortfall by Q3",          tone: "warn" as const },
  { label: "Cash runway @ current burn",             value: "32 mo.", sub: "No funding event needed in plan",     tone: "good" as const },
];

const CAMPAIGN_PERF = [
  { name: "Q3 GCC CFO Summit",            channel: "Field event",    spend: 180_000, sourced: 42, mql: 28, sql: 14, pipe: 4_200_000, cpl: 4_286, status: "winning" },
  { name: "AI-CRM thought leadership",     channel: "LinkedIn",       spend:  62_000, sourced: 71, mql: 44, sql: 18, pipe: 3_100_000, cpl:   873, status: "winning" },
  { name: "Banking sector ABM (24 acc.)",  channel: "Multi-touch",    spend: 145_000, sourced: 18, mql: 14, sql: 11, pipe: 6_400_000, cpl: 8_056, status: "winning" },
  { name: "Email · KSA mid-market",        channel: "Outbound email", spend:  18_000, sourced: 24, mql:  7, sql:  2, pipe:   320_000, cpl:   750, status: "watch"   },
  { name: "Webinar · CIO automation",      channel: "Webinar",        spend:  28_000, sourced: 33, mql: 11, sql:  3, pipe:   480_000, cpl:   848, status: "watch"   },
  { name: "Display · brand awareness",     channel: "Display",        spend:  92_000, sourced:  9, mql:  2, sql:  0, pipe:         0, cpl:10_222, status: "kill"    },
];

const FUNNEL_LEAKAGE = [
  { stage: "MQL → SQL",         left: 184, idleDays: 11, value: 6_200_000, primaryReason: "No first-touch within 48h",          owner: "BDR pod 2" },
  { stage: "SQL → Discovery",   left:  92, idleDays: 14, value: 8_800_000, primaryReason: "Demo booked but never confirmed",     owner: "AE — KSA"  },
  { stage: "Discovery → Pilot", left:  41, idleDays: 21, value: 12_400_000, primaryReason: "Pilot scoping doc not delivered",     owner: "AE — UAE"  },
  { stage: "Pilot → Proposal",  left:  18, idleDays: 28, value:  9_600_000, primaryReason: "Pricing approval queued > 2 weeks",    owner: "Deal desk" },
  { stage: "Proposal → Closed", left:  11, idleDays: 34, value:  5_400_000, primaryReason: "No exec sponsor on customer side",     owner: "Sales VP"  },
];

const AGENT_SCORES = [
  { name: "Layla Hassan",    office: "Dubai",       calls: 184, talkRatio: 38, sentiment: 87, objHandling: 92, discovery: 88, closing: 84, overall: 89, trend: +5,  topRecording: "ENBD-Q3 discovery — 32 min" },
  { name: "Tariq Bin-Laden", office: "Riyadh",      calls: 211, talkRatio: 41, sentiment: 84, objHandling: 88, discovery: 91, closing: 86, overall: 88, trend: +3,  topRecording: "Aramco intro call — 28 min" },
  { name: "Hessa Al-Thani",  office: "Doha",        calls: 142, talkRatio: 47, sentiment: 76, objHandling: 79, discovery: 71, closing: 68, overall: 73, trend: -4,  topRecording: "QNB renewal — coaching needed" },
  { name: "Yousef Al-Sabah", office: "Kuwait City", calls: 161, talkRatio: 39, sentiment: 82, objHandling: 84, discovery: 80, closing: 78, overall: 81, trend: +1,  topRecording: "KFH expansion — 24 min" },
  { name: "Nadia Al-Khalifa",office: "Manama",      calls: 118, talkRatio: 52, sentiment: 71, objHandling: 70, discovery: 66, closing: 62, overall: 67, trend: -8,  topRecording: "BBK — talk ratio too high" },
  { name: "Khalid Al-Said",  office: "Muscat",      calls: 154, talkRatio: 36, sentiment: 85, objHandling: 86, discovery: 84, closing: 81, overall: 84, trend: +6,  topRecording: "Bank Muscat pilot — 35 min" },
];

const BOTTLENECKS = [
  { area: "Deal desk pricing approvals",   waitDays: 14, deals: 9,  blockedRevenue: 3_200_000, owner: "Finance",   severity: "high" as const },
  { area: "Legal redlines on MSA",          waitDays: 21, deals: 6,  blockedRevenue: 4_100_000, owner: "Legal",     severity: "high" as const },
  { area: "Security review for FSI clients",waitDays: 11, deals: 4,  blockedRevenue: 2_800_000, owner: "InfoSec",   severity: "med"  as const },
  { area: "Solution architect availability", waitDays:  7, deals: 12, blockedRevenue: 5_100_000, owner: "SE org",    severity: "high" as const },
  { area: "Onboarding capacity (post-sale)", waitDays:  9, deals: 7,  blockedRevenue: 1_900_000, owner: "Customer Success", severity: "med" as const },
];

const UNTAKEN_ACTIONS = [
  { rep: "Hessa Al-Thani",  account: "Qatar Insurance Co.",  action: "Send revised proposal — promised 6 days ago", value:   840_000, idle: "6d", channel: "email"     },
  { rep: "Nadia Al-Khalifa",account: "Gulf Cement",          action: "Schedule pilot kickoff — committed last call", value: 1_200_000, idle: "9d", channel: "call"      },
  { rep: "Hessa Al-Thani",  account: "Doha Bank",            action: "Intro CTO to product team",                    value: 2_100_000, idle: "11d",channel: "intro"     },
  { rep: "Yousef Al-Sabah", account: "Boursa Kuwait",        action: "Reply to procurement clarifications",          value:   560_000, idle: "4d", channel: "email"     },
  { rep: "Nadia Al-Khalifa",account: "Bahrain Telecom",      action: "Provide security architecture diagram",        value:   720_000, idle: "8d", channel: "email"     },
  { rep: "Tariq Bin-Laden", account: "Saudi Electricity",    action: "Escalate to VP after no-show",                 value: 1_650_000, idle: "5d", channel: "call"      },
];

// ─── helpers ─────────────────────────────────────────────────────
function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function statusTone(s: string): { bg: string; fg: string; label: string } {
  switch (s) {
    case "exceeding": return { bg: "bg-[#88B8B0]/15", fg: "text-[#3D8076]", label: "Exceeding" };
    case "ontrack":   return { bg: "bg-[#B8A0C8]/15", fg: "text-[#7050A0]", label: "On track" };
    case "behind":    return { bg: "bg-[#C0A0B8]/15", fg: "text-[#A04068]", label: "Behind" };
    default:          return { bg: "bg-muted/40",      fg: "text-muted-foreground", label: s };
  }
}

function initiativeTone(s: string): string {
  if (s === "ahead")    return "text-[#3D8076] bg-[#88B8B0]/15";
  if (s === "on-track") return "text-[#7050A0] bg-[#B8A0C8]/15";
  if (s === "at-risk")  return "text-[#C8A880] bg-[#C8A880]/15";
  return "text-[#A04068] bg-[#C0A0B8]/15";
}

// ─── component ───────────────────────────────────────────────────
export default function CEOHomePage() {
  const { data: dash } = useDashboard();
  const { data: callsData } = useCalls({ limit: "50" });
  const { data: forgottenData } = useForgottenLeads();
  useAnalytics();
  useContacts({ limit: "50" });

  const [officeFilter, setOfficeFilter] = useState<string>("all");
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [period, setPeriod] = useState<"week" | "month" | "qtr">("qtr");

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const totalRevenue = OFFICES.reduce((s, o) => s + o.revenue, 0);
  const totalTarget = OFFICES.reduce((s, o) => s + o.target, 0);
  const totalPipeline = OFFICES.reduce((s, o) => s + o.pipeline, 0);
  const avgWinRate = Math.round(OFFICES.reduce((s, o) => s + o.winRate, 0) / OFFICES.length);
  const targetPct = Math.round((totalRevenue / totalTarget) * 100);

  const filteredOffices = useMemo(
    () => officeFilter === "all" ? OFFICES : OFFICES.filter(o => o.country === officeFilter),
    [officeFilter]
  );

  const recentRecordings = ((callsData?.calls ?? []) as any[])
    .filter((c) => c.status === "completed")
    .slice(0, 5);

  const forgotten = (forgottenData?.leads ?? []) as any[];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1530 0%, #2a1f4a 50%, #4a3070 100%)" }}>
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, #C8A880, transparent)" }} />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, #88B8B0, transparent)" }} />
        </div>
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#C8A880] text-xs font-bold uppercase tracking-widest">
                <Crown className="w-3.5 h-3.5" />
                Executive Situation Room
              </div>
              <h1 className="text-3xl font-black text-white mt-2">Good morning, executive team</h1>
              <p className="text-white/60 text-sm mt-1">{today} · GCC operations across 6 offices · 59 reps live</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/10 backdrop-blur-sm">
                {(["week", "month", "qtr"] as const).map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      period === p ? "bg-white text-[#1a1530]" : "text-white/70 hover:text-white")}>
                    {p === "qtr" ? "Quarter" : p === "week" ? "Week" : "Month"}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white text-xs font-semibold hover:bg-white/15">
                <Download className="w-3.5 h-3.5" />
                Board pack
              </button>
            </div>
          </div>

          {/* Pulse strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            {[
              { label: "Revenue (QTD)",   value: fmtMoney(totalRevenue), sub: `${targetPct}% of $${(totalTarget / 1_000_000).toFixed(1)}M target`, icon: DollarSign, accent: "#C8A880" },
              { label: "Pipeline",        value: fmtMoney(totalPipeline), sub: `${(totalPipeline / totalTarget).toFixed(1)}× coverage`,            icon: GitBranch,  accent: "#B8A0C8" },
              { label: "Avg win rate",    value: `${avgWinRate}%`,         sub: "−2 pts vs LQ",                                                    icon: Target,     accent: "#88B8B0" },
              { label: "Open opps",       value: "284",                    sub: "47 in commit · 92 best-case",                                     icon: Layers,     accent: "#90B8B8" },
              { label: "At-risk revenue", value: "$8.2M",                  sub: "Stalled, no exec sponsor, or competitor active",                  icon: AlertTriangle, accent: "#C0A0B8" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4 bg-white/8 backdrop-blur-md border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.accent}25` }}>
                    <s.icon className="w-4 h-4" style={{ color: s.accent }} />
                  </div>
                  <Sparkles className="w-3 h-3 text-white/30" />
                </div>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">{s.label}</div>
                <div className="text-[11px] text-white/70 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Office & Team Performance Grid ─────────────────────── */}
      <section className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-[#B8A0C8]" />
              Offices & teams — performance vs target
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Live feed across the GCC. Click any office for the team-level breakdown.</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => setOfficeFilter("all")}
              className={cn("px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all",
                officeFilter === "all" ? "nf-chameleon-bg text-white" : "bg-muted/40 text-muted-foreground hover:text-foreground")}>
              All GCC
            </button>
            {Array.from(new Set(OFFICES.map(o => o.country))).map(c => (
              <button key={c} onClick={() => setOfficeFilter(c)}
                className={cn("px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all",
                  officeFilter === c ? "nf-chameleon-bg text-white" : "bg-muted/40 text-muted-foreground hover:text-foreground")}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredOffices.map(o => {
            const pct = Math.round((o.revenue / o.target) * 100);
            const t = statusTone(o.status);
            const up = o.change >= 0;
            return (
              <div key={o.city} className="rounded-2xl p-4 border border-border/50 bg-white/60 backdrop-blur-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B8A0C8]" />
                      <h3 className="font-bold text-foreground text-sm">{o.city}</h3>
                      <span className="text-[10px] text-muted-foreground">{o.country}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{o.team} reps · led by {o.leadOwner}</div>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold", t.bg, t.fg)}>{t.label}</span>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <div className="text-xl font-black text-foreground">{fmtMoney(o.revenue)}</div>
                    <div className="text-[10px] text-muted-foreground">of {fmtMoney(o.target)} target</div>
                  </div>
                  <div className={cn("flex items-center gap-0.5 text-xs font-bold", up ? "text-[#3D8076]" : "text-[#A04068]")}>
                    {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {Math.abs(o.change)}%
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, pct)}%`, background: pct >= 100 ? "#88B8B0" : pct >= 85 ? "#B8A0C8" : "#C0A0B8" }} />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] text-muted-foreground">
                  <div><span className="text-foreground font-bold">{pct}%</span><br />of target</div>
                  <div><span className="text-foreground font-bold">{fmtMoney(o.pipeline)}</span><br />pipeline</div>
                  <div><span className="text-foreground font-bold">{o.winRate}%</span><br />win rate</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 2-col: News+signals · Strategic+predictive ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* News + market signals */}
        <section className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#C8A880]" />
              News & market signals
            </h2>
            <span className="text-[10px] text-muted-foreground">Refreshed 12 min ago · {NEWS_SIGNALS.length} live</span>
          </div>
          <div className="space-y-2">
            {NEWS_SIGNALS.map((n, i) => (
              <div key={i} className="rounded-xl p-3 border border-border/30 hover:border-[#B8A0C8]/40 transition-all"
                style={{ background: `${n.color}08`, borderLeft: `3px solid ${n.color}` }}>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${n.color}20` }}>
                    <n.icon className="w-3.5 h-3.5" style={{ color: n.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-foreground truncate">{n.title}</h3>
                      {n.impact === "high" && <span className="text-[9px] font-bold text-[#A04068] bg-[#C0A0B8]/15 px-1.5 py-0.5 rounded uppercase">High impact</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{n.detail}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                      <span>{n.source}</span><span>·</span><span>{n.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Strategic planning + predictive */}
        <section className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#B8A0C8]" />
              Strategic plan & predictive forecast
            </h2>
            <button className="text-[11px] font-semibold text-[#B8A0C8] hover:underline flex items-center gap-1">
              Open planning board <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Predictive grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {PREDICTIVE.map(p => {
              const tone = p.tone === "good" ? { fg: "text-[#3D8076]", bg: "bg-[#88B8B0]/10" }
                          : p.tone === "warn" ? { fg: "text-[#C8A880]", bg: "bg-[#C8A880]/10" }
                          :                       { fg: "text-[#A04068]", bg: "bg-[#C0A0B8]/10" };
              return (
                <div key={p.label} className={cn("rounded-xl p-3 border border-border/30", tone.bg)}>
                  <div className={cn("text-lg font-black", tone.fg)}>{p.value}</div>
                  <div className="text-[10px] font-semibold text-foreground leading-tight mt-0.5">{p.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{p.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Initiatives */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Strategic initiatives</div>
            {STRATEGIC_INITIATIVES.map((s, i) => (
              <div key={i} className="rounded-xl p-3 border border-border/30">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{s.owner} · {s.eta} · {s.impact}</div>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold capitalize whitespace-nowrap", initiativeTone(s.status))}>{s.status}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${s.pct}%`, background: s.status === "ahead" ? "#88B8B0" : s.status === "on-track" ? "#B8A0C8" : s.status === "at-risk" ? "#C8A880" : "#C0A0B8" }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ─── Marketing + Campaign Performance ───────────────────── */}
      <section className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#C0A0B8]" />
            Marketing & campaign performance
          </h2>
          <Link href="/marketing/insights" className="text-[11px] font-semibold text-[#B8A0C8] hover:underline flex items-center gap-1">
            Full marketing dashboard <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {[
            { label: "Total marketing spend (QTD)", value: "$525K",   sub: "−4% vs plan" },
            { label: "Pipe sourced",                value: "$14.5M",  sub: "27.6× ROI on spend" },
            { label: "MQL → SQL conversion",        value: "32%",     sub: "+5 pts vs LQ" },
            { label: "Cost per SQL (blended)",      value: "$1,128",  sub: "−18% vs Q1" },
          ].map(k => (
            <div key={k.label} className="rounded-xl p-3 border border-border/30 bg-[#C0A0B8]/5">
              <div className="text-xl font-black text-foreground">{k.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{k.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/40">
              <tr>
                <th className="text-left py-2 font-semibold">Campaign</th>
                <th className="text-left py-2 font-semibold">Channel</th>
                <th className="text-right py-2 font-semibold">Spend</th>
                <th className="text-right py-2 font-semibold">Sourced</th>
                <th className="text-right py-2 font-semibold">MQL</th>
                <th className="text-right py-2 font-semibold">SQL</th>
                <th className="text-right py-2 font-semibold">Pipe</th>
                <th className="text-right py-2 font-semibold">CPL</th>
                <th className="text-center py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGN_PERF.map(c => {
                const tone = c.status === "winning" ? { bg: "bg-[#88B8B0]/15", fg: "text-[#3D8076]" }
                          : c.status === "watch"     ? { bg: "bg-[#C8A880]/15", fg: "text-[#9C7028]" }
                          :                            { bg: "bg-[#C0A0B8]/15", fg: "text-[#A04068]" };
                return (
                  <tr key={c.name} className="border-b border-border/20 hover:bg-muted/30">
                    <td className="py-2.5 font-semibold text-foreground">{c.name}</td>
                    <td className="py-2.5 text-muted-foreground">{c.channel}</td>
                    <td className="py-2.5 text-right text-foreground">{fmtMoney(c.spend)}</td>
                    <td className="py-2.5 text-right text-foreground">{c.sourced}</td>
                    <td className="py-2.5 text-right text-foreground">{c.mql}</td>
                    <td className="py-2.5 text-right text-foreground">{c.sql}</td>
                    <td className="py-2.5 text-right font-semibold text-foreground">{fmtMoney(c.pipe)}</td>
                    <td className="py-2.5 text-right text-muted-foreground">${c.cpl.toLocaleString()}</td>
                    <td className="py-2.5 text-center">
                      <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold capitalize", tone.bg, tone.fg)}>{c.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── Funnel leakage ─────────────────────────────────────── */}
      <section className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#A04068]" />
            Funnel leakage — where leads were left
          </h2>
          <span className="text-[11px] text-muted-foreground">{FUNNEL_LEAKAGE.reduce((s, f) => s + f.left, 0)} leads · {fmtMoney(FUNNEL_LEAKAGE.reduce((s, f) => s + f.value, 0))} at risk</span>
        </div>
        <div className="space-y-2">
          {FUNNEL_LEAKAGE.map(f => {
            const sev = f.idleDays >= 28 ? { bg: "bg-[#C0A0B8]/15", fg: "text-[#A04068]", bar: "#C0A0B8" }
                       : f.idleDays >= 14 ? { bg: "bg-[#C8A880]/15", fg: "text-[#9C7028]", bar: "#C8A880" }
                       :                     { bg: "bg-[#B8A0C8]/15", fg: "text-[#7050A0]", bar: "#B8A0C8" };
            return (
              <div key={f.stage} className="rounded-xl p-3 border border-border/30">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground">{f.stage}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{f.primaryReason} · owner: {f.owner}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-black text-foreground">{f.left}</div>
                    <div className="text-[10px] text-muted-foreground">leads stuck</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, f.idleDays * 2.5)}%`, background: sev.bar }} />
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap", sev.bg, sev.fg)}>
                    {f.idleDays}d idle · {fmtMoney(f.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 2-col: Call recordings · Untaken actions ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Call recordings + per-agent scoring */}
        <section className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#88B8B0]" />
              Call recordings & agent scoring
            </h2>
            <Link href="/callcenter" className="text-[11px] font-semibold text-[#B8A0C8] hover:underline flex items-center gap-1">
              Call center <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Per-agent score table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/40">
                <tr>
                  <th className="text-left py-2 font-semibold">Agent</th>
                  <th className="text-right py-2 font-semibold">Calls</th>
                  <th className="text-right py-2 font-semibold">Talk %</th>
                  <th className="text-right py-2 font-semibold">Sentiment</th>
                  <th className="text-right py-2 font-semibold">Closing</th>
                  <th className="text-right py-2 font-semibold">Overall</th>
                </tr>
              </thead>
              <tbody>
                {AGENT_SCORES.map(a => (
                  <tr key={a.name} className="border-b border-border/20 hover:bg-muted/30">
                    <td className="py-2">
                      <div className="font-semibold text-foreground text-xs">{a.name}</div>
                      <div className="text-[10px] text-muted-foreground">{a.office}</div>
                    </td>
                    <td className="py-2 text-right text-foreground">{a.calls}</td>
                    <td className="py-2 text-right text-foreground">{a.talkRatio}%</td>
                    <td className="py-2 text-right text-foreground">{a.sentiment}</td>
                    <td className="py-2 text-right text-foreground">{a.closing}</td>
                    <td className="py-2 text-right">
                      <div className="inline-flex items-center gap-1">
                        <span className={cn("font-bold", a.overall >= 85 ? "text-[#3D8076]" : a.overall >= 75 ? "text-[#7050A0]" : "text-[#A04068]")}>{a.overall}</span>
                        {a.trend >= 0
                          ? <ArrowUpRight className="w-3 h-3 text-[#3D8076]" />
                          : <ArrowDownRight className="w-3 h-3 text-[#A04068]" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top recordings */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Listen to top recordings</div>
            {AGENT_SCORES.slice(0, 4).map(a => {
              const isPlaying = playingRecording === a.name;
              return (
                <div key={a.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30">
                  <button onClick={() => setPlayingRecording(isPlaying ? null : a.name)}
                    className="w-8 h-8 rounded-full nf-chameleon-bg text-white flex items-center justify-center flex-shrink-0">
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground truncate">{a.topRecording}</div>
                    <div className="text-[10px] text-muted-foreground">{a.name} · {a.office}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-foreground">
                    <Star className="w-3 h-3 text-[#C8A880]" />
                    {a.overall}
                  </div>
                </div>
              );
            })}
            {recentRecordings.length > 0 && (
              <div className="text-[10px] text-muted-foreground pt-1.5 border-t border-border/30 mt-2">
                + {recentRecordings.length} more recordings from live call data
              </div>
            )}
          </div>
        </section>

        {/* Untaken actions */}
        <section className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#A04068]" />
                Untaken actions ledger
              </h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">Where reps committed but didn't follow up</p>
            </div>
            <span className="text-[11px] font-bold text-[#A04068] bg-[#C0A0B8]/15 px-2 py-1 rounded-md">
              {fmtMoney(UNTAKEN_ACTIONS.reduce((s, a) => s + a.value, 0))} at risk
            </span>
          </div>
          <div className="space-y-2">
            {UNTAKEN_ACTIONS.map((a, i) => {
              const ChannelIcon = a.channel === "email" ? Mail : a.channel === "call" ? Phone : a.channel === "intro" ? Users : MessageSquare;
              const idleDays = parseInt(a.idle, 10);
              const sev = idleDays >= 9 ? "text-[#A04068] bg-[#C0A0B8]/15" : idleDays >= 5 ? "text-[#9C7028] bg-[#C8A880]/15" : "text-[#7050A0] bg-[#B8A0C8]/15";
              return (
                <div key={i} className="rounded-xl p-3 border border-border/30 hover:bg-muted/20">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#C0A0B8]/15 flex items-center justify-center flex-shrink-0">
                      <ChannelIcon className="w-3.5 h-3.5 text-[#A04068]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="text-xs font-bold text-foreground truncate">{a.account}</div>
                        <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap", sev)}>{a.idle} idle</span>
                      </div>
                      <div className="text-[11px] text-foreground/85 leading-snug">{a.action}</div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <div className="text-[10px] text-muted-foreground">{a.rep}</div>
                        <div className="text-[10px] font-bold text-[#3D8076]">{fmtMoney(a.value)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ─── 2-col: Top performers · Bottlenecks ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top performers */}
        <section className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#C8A880]" />
              Top performers & coaching gaps
            </h2>
            <span className="text-[11px] text-muted-foreground">QTD ranking</span>
          </div>
          <div className="space-y-2">
            {[...AGENT_SCORES].sort((a, b) => b.overall - a.overall).map((a, idx) => {
              const isTop = idx === 0;
              const isGap = a.overall < 75;
              return (
                <div key={a.name} className={cn("flex items-center gap-3 p-3 rounded-xl border",
                  isTop ? "border-[#C8A880]/40 bg-[#C8A880]/5"
                  : isGap ? "border-[#C0A0B8]/40 bg-[#C0A0B8]/5"
                  : "border-border/30")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0",
                    isTop ? "bg-[#C8A880] text-white" : isGap ? "bg-[#C0A0B8] text-white" : "bg-muted text-foreground")}>
                    {idx === 0 ? <Trophy className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className="font-bold text-foreground text-xs">{a.name}</div>
                      <div className="text-[10px] text-muted-foreground">· {a.office}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{a.calls} calls · sentiment {a.sentiment} · closing {a.closing}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-lg font-black", a.overall >= 85 ? "text-[#3D8076]" : a.overall >= 75 ? "text-[#7050A0]" : "text-[#A04068]")}>{a.overall}</div>
                    <div className={cn("text-[9px] font-bold uppercase tracking-wider",
                      a.trend >= 0 ? "text-[#3D8076]" : "text-[#A04068]")}>
                      {a.trend >= 0 ? "+" : ""}{a.trend} this wk
                    </div>
                  </div>
                  {isGap && (
                    <Link href="/insights" className="px-2 py-1 rounded-lg bg-[#C0A0B8] text-white text-[10px] font-bold hover:opacity-90 whitespace-nowrap">
                      Coach
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottlenecks */}
        <section className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#C0A0B8]" />
              Operational bottlenecks
            </h2>
            <span className="text-[11px] text-muted-foreground">{fmtMoney(BOTTLENECKS.reduce((s, b) => s + b.blockedRevenue, 0))} blocked</span>
          </div>
          <div className="space-y-2">
            {BOTTLENECKS.map(b => {
              const sevTone = b.severity === "high" ? "text-[#A04068] bg-[#C0A0B8]/15" : "text-[#9C7028] bg-[#C8A880]/15";
              return (
                <div key={b.area} className="rounded-xl p-3 border border-border/30">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground">{b.area}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Owner: {b.owner}</div>
                    </div>
                    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap capitalize", sevTone)}>{b.severity}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-muted/40 p-2 text-center">
                      <div className="text-sm font-black text-foreground">{b.waitDays}d</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">avg wait</div>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2 text-center">
                      <div className="text-sm font-black text-foreground">{b.deals}</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">deals</div>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2 text-center">
                      <div className="text-sm font-black text-[#A04068]">{fmtMoney(b.blockedRevenue)}</div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">blocked</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ─── Forgotten leads strip (live data passthrough) ──────── */}
      {forgotten.length > 0 && (
        <section className="glass-card rounded-2xl p-5 border-l-4 border-[#C0A0B8]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#C0A0B8]" />
              Forgotten leads — re-engagement queue
            </h2>
            <Link href="/leads/forgotten" className="text-[11px] font-semibold text-[#B8A0C8] hover:underline flex items-center gap-1">
              Open queue <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {forgotten.slice(0, 3).map((l: any) => (
              <Link key={l.id} href={`/contacts/${l.id}`}
                className="rounded-xl p-3 border border-border/30 hover:border-[#B8A0C8]/40 transition-all">
                <div className="text-xs font-bold text-foreground truncate">{l.first_name} {l.last_name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{l.title} · {l.company_name}</div>
                <div className="text-[10px] text-[#A04068] font-semibold mt-1">{l.days_idle ?? "90+"}d idle · fresh signal detected</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
