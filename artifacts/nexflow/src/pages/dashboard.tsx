import { Link } from "wouter";
import {
  Phone, Mail, Calendar, Users, Target, TrendingUp, TrendingDown, Clock,
  Sparkles, Bot, MessageSquare, CheckCircle2, Award, Flame, Zap, ArrowRight,
  GitBranch, Headphones, FileText, BarChart3, Heart, Activity, Briefcase,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Account Overview Dashboard — personal "what I've done" view for the
 * signed-in user. Lives at /dashboard and is the Home → Dashboard tab.
 */

interface KPI {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
  trend: { dir: "up" | "down"; pct: string };
  color: string;
}

const TODAY = new Date().toLocaleDateString("en-US", {
  weekday: "long", month: "long", day: "numeric", year: "numeric",
});

// ── Personal KPIs (this month) ─────────────────────────────────────
const KPIS: KPI[] = [
  { icon: Phone,    label: "Calls Made",      value: "187",   sub: "92 connected · 49% rate", trend: { dir: "up",   pct: "11%" }, color: "#88B8B0" },
  { icon: Mail,     label: "Emails Sent",     value: "412",   sub: "38% open · 12% reply",     trend: { dir: "up",   pct: "8%"  }, color: "#B8A0C8" },
  { icon: Calendar, label: "Meetings Booked", value: "23",    sub: "14 demos · 9 discovery",   trend: { dir: "up",   pct: "4"   }, color: "#C8A880" },
  { icon: Target,   label: "Deals Worked",    value: "31",    sub: "$1.42M influenced",        trend: { dir: "up",   pct: "18%" }, color: "#B8B880" },
  { icon: CheckCircle2, label: "Deals Closed", value: "6",   sub: "$284K won this month",     trend: { dir: "up",   pct: "2"   }, color: "#88B8B0" },
  { icon: Bot,      label: "AI Sessions",     value: "94",    sub: "Voice + chat + enrich",    trend: { dir: "up",   pct: "23"  }, color: "#A090C8" },
  { icon: Clock,    label: "Hours Saved",     value: "31h",   sub: "vs manual baseline",       trend: { dir: "up",   pct: "5h"  }, color: "#90B8B8" },
  { icon: MessageSquare, label: "WhatsApp Replies", value: "47", sub: "GCC contacts only",     trend: { dir: "down", pct: "3"   }, color: "#C0A0B8" },
];

// ── Quota progress ────────────────────────────────────────────────
const QUOTAS = [
  { label: "Revenue Quota",    current: 284_000, target: 250_000, unit: "$", suffix: "K", color: "#88B8B0" },
  { label: "Calls Quota",      current: 187,     target: 220,     unit: "",  suffix: "",  color: "#B8A0C8" },
  { label: "Meetings Quota",   current: 23,      target: 20,      unit: "",  suffix: "",  color: "#C8A880" },
  { label: "Pipeline Created", current: 1_420,   target: 1_500,   unit: "$", suffix: "K", color: "#B8B880" },
];

// ── Activity feed (last 7 days) ───────────────────────────────────
interface ActivityItem {
  icon: LucideIcon;
  color: string;
  text: string;
  meta: string;
  ts: string;
}
const ACTIVITY: ActivityItem[] = [
  { icon: CheckCircle2, color: "#88B8B0", text: "Closed Won — Aramco Digital · $145K",      meta: "Sales · Pipeline",        ts: "2h ago" },
  { icon: Phone,        color: "#B8A0C8", text: "Call with Sara Al-Mansouri · 12m 04s",     meta: "Call Center · Outbound",  ts: "3h ago" },
  { icon: Mail,         color: "#C8A880", text: "Sent quote to Khalid Al-Hamdan",           meta: "Sales · Quotes & CPQ",    ts: "4h ago" },
  { icon: Bot,          color: "#A090C8", text: "AI Voice Agent qualified 4 leads overnight", meta: "Call Center · AI Voice", ts: "8h ago" },
  { icon: Calendar,     color: "#88B8B0", text: "Booked demo with Layla Hassan · Thu 10:00", meta: "Marketing · Meetings",   ts: "1d ago" },
  { icon: Sparkles,     color: "#B8A0C8", text: "AI re-scored 12 forgotten leads",           meta: "AI Hub · Predictive",     ts: "1d ago" },
  { icon: Zap,          color: "#C8A880", text: "Enriched 38 contacts via waterfall",        meta: "Enrichment · Bulk",       ts: "2d ago" },
  { icon: GitBranch,    color: "#90B8B8", text: "Workflow 'Series B → CIO' fired 5 times",   meta: "Automation · Workflows",  ts: "2d ago" },
  { icon: MessageSquare,color: "#C0A0B8", text: "WhatsApp follow-up to Nora Al-Faisal",      meta: "Call Center · WhatsApp",  ts: "3d ago" },
  { icon: FileText,     color: "#B8B880", text: "Updated 6 deals in Negotiation",            meta: "Sales · Pipeline",        ts: "3d ago" },
];

// ── Section breakdown — what user did per area ────────────────────
const PER_SECTION = [
  { key: "sales",      label: "Sales",       icon: Briefcase,  color: "#88B8B0", value: "31 deals · 6 closed",      sub: "$284K won · $1.14M open",     href: "/section/sales" },
  { key: "callcenter", label: "Call Center", icon: Headphones, color: "#C0A0B8", value: "187 calls · 92 connected", sub: "Avg talk 7m 12s",             href: "/section/callcenter" },
  { key: "marketing",  label: "Marketing",   icon: Mail,       color: "#C8A880", value: "412 emails · 23 meetings", sub: "38% open rate",               href: "/section/marketing" },
  { key: "enrichment", label: "Enrichment",  color: "#B8B880", icon: Zap,        value: "284 leads enriched",       sub: "91% match rate · $0.31/lead", href: "/section/enrichment" },
  { key: "ai",         label: "AI Hub",      icon: Bot,        color: "#A090C8", value: "94 AI sessions used",      sub: "31h saved this month",        href: "/section/ai" },
  { key: "automation", label: "Automation",  icon: Activity,   color: "#90B8B8", value: "3 workflows owned",        sub: "Fired 142 times this week",   href: "/section/automation" },
];

// ── Coaching & wins (what AI noticed about THIS user) ─────────────
const COACHING = [
  {
    icon: Award, color: "#88B8B0", tag: "Strength",
    title: "Top discovery questions in your team",
    body: "Your call discovery question rate is 14/call vs team avg 8. Aramco and stc deals correlate strongly with this strength.",
  },
  {
    icon: Flame, color: "#C8A880", tag: "Streak",
    title: "6-day call streak · personal best",
    body: "You've made ≥20 calls every day for the last 6 days. One more day to beat your personal record.",
  },
  {
    icon: Heart, color: "#B8A0C8", tag: "Coaching",
    title: "Practice: handling 'too expensive vs HubSpot'",
    body: "Conversation Intelligence flagged this objection on 5 of your calls this week. Open the Sales Playbook for 3 winning rebuttals.",
  },
];

// ── Top accounts you own ──────────────────────────────────────────
const TOP_ACCOUNTS = [
  { name: "Aramco Digital",   stage: "Closed Won",  value: "$145K", health: 96, lastTouch: "2h ago",  color: "#88B8B0" },
  { name: "stc Pay",          stage: "Negotiation", value: "$87K",  health: 84, lastTouch: "4h ago",  color: "#88B8B0" },
  { name: "Gulf Ventures",    stage: "Proposal",    value: "$120K", health: 91, lastTouch: "1d ago",  color: "#B8A0C8" },
  { name: "NEOM Tech",        stage: "Discovery",   value: "$240K", health: 78, lastTouch: "2d ago",  color: "#C8A880" },
  { name: "ladwa Investment", stage: "Negotiation", value: "$95K",  health: 65, lastTouch: "5d ago",  color: "#C0A0B8" },
];

function fmtMoney(n: number, unit: string, suffix: string): string {
  if (suffix === "K") return `${unit}${(n / 1000).toFixed(1)}K`;
  return `${unit}${n.toLocaleString()}${suffix}`;
}

export default function Dashboard() {
  return (
    <div className="space-y-5 max-w-7xl">
      {/* ── Hero — your personal account overview ─────────────────── */}
      <div
        className="relative rounded-3xl overflow-hidden p-8"
        style={{
          background:
            "linear-gradient(135deg, #B8A0C818 0%, #88B8B015 40%, #C8A88015 80%, #B8A0C810 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-25"
            style={{ background: "radial-gradient(circle, #B8A0C8, transparent)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(circle, #88B8B0, transparent)" }}
          />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl nf-chameleon-bg flex items-center justify-center text-white text-2xl font-black shadow-lg">
                A
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">{TODAY} · Riyadh</div>
                <h1 className="text-3xl font-black text-foreground leading-tight">
                  Welcome back, Admin
                </h1>
                <div className="text-sm font-semibold mt-0.5" style={{ color: "#B8A0C8" }}>
                  Account Overview · Sales Lead · with NexFlow since Jan 2025
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5"
                style={{ background: "#88B8B020", color: "#5a8d83" }}
              >
                <Award className="w-3 h-3" /> 112% of monthly target
              </span>
              <span
                className="px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5"
                style={{ background: "#C8A88020", color: "#9b7e4a" }}
              >
                <Flame className="w-3 h-3" /> 6-day call streak
              </span>
            </div>
          </div>

          {/* Personal AI briefing */}
          <div
            className="mt-2 p-5 rounded-2xl backdrop-blur-sm border"
            style={{ background: "rgba(255,255,255,0.6)", borderColor: "#B8A0C840" }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm"
                style={{ background: "linear-gradient(135deg, #B8A0C8, #88B8B0)" }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#B8A0C8" }}>
                  Your month so far
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  You've made <b>187 calls</b>, sent <b>412 emails</b>, booked <b>23 meetings</b>, and closed <b>6 deals worth $284K</b> —
                  putting you at <b className="text-[#5a8d83]">112% of your monthly revenue target</b> with 1 day to go. Your AI workforce
                  saved you an estimated <b>31 hours</b> this month. Top win this week:{" "}
                  <b>Aramco Digital · $145K</b>.
                </p>
              </div>
            </div>
          </div>

          {/* KPI grid — 8 stats (4×2) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {KPIS.map((s) => {
              const Icon = s.icon;
              const TrendIcon = s.trend.dir === "up" ? TrendingUp : TrendingDown;
              return (
                <div
                  key={s.label}
                  className="rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm"
                  style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.7)" }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xl font-black text-foreground leading-none">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight truncate">
                      {s.sub}
                    </div>
                    <div className="text-[10px] font-bold mt-0.5 flex items-center gap-0.5"
                      style={{ color: s.trend.dir === "up" ? "#5a8d83" : "#9C3838" }}>
                      <TrendIcon className="w-2.5 h-2.5" /> {s.trend.pct}
                      <span className="text-muted-foreground font-normal ml-1">{s.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Quotas + Coaching — two columns ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quota progress */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-[#88B8B0]" /> Quota Progress · April
            </h2>
            <span className="text-xs text-muted-foreground">1 day remaining</span>
          </div>
          <div className="space-y-4">
            {QUOTAS.map((q) => {
              const pct = Math.min(150, (q.current / q.target) * 100);
              const over = q.current >= q.target;
              return (
                <div key={q.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{q.label}</span>
                      {over && (
                        <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: `${q.color}20`, color: q.color }}>
                          Achieved
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      <b className="text-foreground">{fmtMoney(q.current, q.unit, q.suffix)}</b>{" "}
                      / {fmtMoney(q.target, q.unit, q.suffix)} ({Math.round((q.current / q.target) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden bg-muted/40 relative">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        background: `linear-gradient(90deg, ${q.color}, #B8A0C8)`,
                      }}
                    />
                    {over && (
                      <div
                        className="absolute top-0 right-0 h-full w-px"
                        style={{ left: `${(q.target / q.current) * 100}%`, background: "rgba(0,0,0,0.25)" }}
                        aria-hidden
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coaching cards */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B8A0C8]" /> AI noticed about you
            </h2>
          </div>
          <div className="space-y-3">
            {COACHING.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="rounded-xl p-3 backdrop-blur-sm"
                  style={{ background: `${c.color}10`, border: `1px solid ${c.color}30` }}
                >
                  <div className="flex items-start gap-2 mb-1.5">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: `${c.color}25` }}
                    >
                      <Icon className="w-3 h-3" style={{ color: c.color }} />
                    </div>
                    <span
                      className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${c.color}20`, color: c.color }}
                    >
                      {c.tag}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-foreground leading-tight mb-0.5">{c.title}</div>
                  <p className="text-[11px] text-foreground/75 leading-snug">{c.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── What you did per section ────────────────────────────── */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#88B8B0]" /> Your work · by section
          </h2>
          <span className="text-xs text-muted-foreground">Click to drill in</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PER_SECTION.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.key} href={s.href}>
                <div
                  className="rounded-xl p-3 cursor-pointer transition-all border border-transparent hover:border-border/60 group"
                  style={{ background: `${s.color}10` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${s.color}25` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs uppercase tracking-wider font-bold text-foreground/60">
                        {s.label}
                      </div>
                      <div className="text-sm font-bold text-foreground mt-0.5 flex items-center gap-1">
                        {s.value}
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Activity timeline + Top accounts ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Activity */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#B8A0C8]" /> Recent activity
            </h2>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </div>
          <div className="space-y-2.5 relative">
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border/50" aria-hidden />
            {ACTIVITY.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-3 relative">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 border-2 border-white"
                    style={{ background: `${a.color}25` }}
                  >
                    <Icon className="w-3 h-3" style={{ color: a.color }} />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="text-[13px] font-medium text-foreground leading-tight">
                      {a.text}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span>{a.meta}</span>
                      <span>·</span>
                      <span>{a.ts}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top accounts owned */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-[#88B8B0]" /> Top accounts you own
            </h2>
            <Link href="/funnel">
              <span className="text-xs text-[#B8A0C8] hover:underline cursor-pointer">View pipeline →</span>
            </Link>
          </div>
          <div className="space-y-2">
            {TOP_ACCOUNTS.map((a) => (
              <div
                key={a.name}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${a.color}, #B8A0C8)` }}
                >
                  {a.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-foreground truncate">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span>{a.stage}</span>
                    <span>·</span>
                    <span>Last touch {a.lastTouch}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-black text-foreground">{a.value}</div>
                  <div className="flex items-center gap-1 mt-0.5 justify-end">
                    <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${a.health}%`,
                          background: a.health >= 80 ? "#88B8B0" : a.health >= 65 ? "#C8A880" : "#C0A0B8",
                        }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: a.health >= 80 ? "#5a8d83" : a.health >= 65 ? "#9b7e4a" : "#9C3838" }}
                    >
                      {a.health}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick actions footer ─────────────────────────────────── */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Zap className="w-4 h-4 text-[#C8A880]" /> Jump back into work
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <QuickAction href="/funnel"             icon={GitBranch}  label="Pipeline"          color="#88B8B0" />
            <QuickAction href="/calls"              icon={Phone}      label="Recent calls"      color="#B8A0C8" />
            <QuickAction href="/email"              icon={Mail}       label="Inbox"             color="#C8A880" />
            <QuickAction href="/section/enrichment" icon={Zap}        label="Enrich a lead"     color="#B8B880" />
            <QuickAction href="/voice-agents"       icon={Bot}        label="AI Voice Agent"    color="#A090C8" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, color }: { href: string; icon: LucideIcon; label: string; color: string }) {
  return (
    <Link href={href}>
      <button
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all border",
        )}
        style={{ background: `${color}10`, color, borderColor: `${color}40` }}
      >
        <Icon className="w-3.5 h-3.5" />
        {label}
      </button>
    </Link>
  );
}
