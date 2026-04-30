import { Link, useLocation } from "wouter";
import {
  Sparkles, Sun, AlertTriangle, TrendingUp, Phone, Mail, MessageSquare,
  Calendar, Zap, ArrowRight, Coffee, Brain, Target, Users, RefreshCw, ChevronRight,
  Clock, Loader2, CheckSquare, CheckCircle2, Circle, ListTodo, BarChart3,
  Bot, BellRing, TrendingDown, Star, Flame, Mic, FileText, Send, CalendarPlus,
  type LucideIcon,
} from "lucide-react";
import { useDashboard, useContacts, useForgottenLeads, useRegenerateInsights, useCalls, apiFetch } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getRole, type RoleKey } from "@/lib/marketing-auth";

interface PersonaBriefing {
  /** First-person framing of what the persona is here to do today. */
  briefing: (totalPipeline: string) => React.ReactNode;
  /** 4 KPI tiles tuned to the persona's job. */
  kpis: { label: string; value: string; sub: string; color: string; icon: LucideIcon }[];
}

const PERSONA_BRIEFINGS: Record<RoleKey, PersonaBriefing> = {
  sales: {
    briefing: (tp) => (
      <>
        You have <span className="font-bold text-foreground">3 high-intent prospects</span> ready to dial today —
        combined open pipeline <span className="font-bold text-[#88B8B0]">${tp}</span>. Most urgent:{" "}
        <span className="font-bold text-foreground">Sara Al-Mansouri</span> — Gulf Ventures just closed a $50M Series B.
        Your AI Voice Agent qualified <span className="font-bold text-foreground">4 leads</span> overnight — added to your call list.
        Hit your daily 12-call quota in ~3.2 hours of focus time.
      </>
    ),
    kpis: [
      { label: "Calls Today",      value: "5",  sub: "3 confirmed",      color: "#88B8B0", icon: Phone },
      { label: "Hot Signals",      value: "3",  sub: "Last 24h",         color: "#B8B880", icon: Zap },
      { label: "Quota Progress",   value: "47%", sub: "Of monthly goal", color: "#B8A0C8", icon: Target },
      { label: "At-Risk Deals",    value: "2",  sub: "$240K exposure",   color: "#C0A0B8", icon: AlertTriangle },
    ],
  },
  manager: {
    briefing: (tp) => (
      <>
        Team forecast for the quarter is <span className="font-bold text-[#88B8B0]">${tp}</span> — currently{" "}
        <span className="font-bold text-foreground">94% to plan</span>. Coaching priorities: 2 reps with declining
        connect rates, 1 rep crushing it (study the playbook). <span className="font-bold text-destructive">5 deals
        flagged at-risk</span> across the team — review with the AI rescue plan attached to each.
      </>
    ),
    kpis: [
      { label: "Team Pipeline",   value: "$4.8M", sub: "Forecast covered 94%", color: "#88B8B0", icon: TrendingUp },
      { label: "Reps On Pace",    value: "6 / 8", sub: "2 need coaching",       color: "#B8A0C8", icon: Users },
      { label: "Stalled > 30d",   value: "12",    sub: "Across all stages",    color: "#C8A880", icon: Clock },
      { label: "AI Coaching Hits",value: "31",    sub: "Last 7 days",          color: "#B8B880", icon: Brain },
    ],
  },
  ceo: {
    briefing: (tp) => (
      <>
        Quarter-to-date revenue <span className="font-bold text-[#88B8B0]">$2.31M</span>,{" "}
        <span className="font-bold text-foreground">+18% YoY</span>. Pipeline coverage{" "}
        <span className="font-bold text-foreground">3.2×</span> against next-quarter target.
        <span className="font-bold text-destructive"> 1 strategic deal stalled</span> (Aramco Digital — needs your call).
        AI surfaced 4 market signals worth your attention this morning.
      </>
    ),
    kpis: [
      { label: "QTD Revenue",       value: "$2.31M", sub: "+18% YoY",           color: "#88B8B0", icon: TrendingUp },
      { label: "Pipeline Coverage", value: "3.2×",   sub: "Next-Q target",      color: "#B8A0C8", icon: BarChart3 },
      { label: "Strategic Risk",    value: "1",      sub: "Aramco — call today",color: "#C0A0B8", icon: AlertTriangle },
      { label: "Market Signals",    value: "4",      sub: "Surfaced this AM",   color: "#B8B880", icon: Zap },
    ],
  },
  admin: {
    briefing: (tp) => (
      <>
        System health is green. <span className="font-bold text-foreground">14 duplicate contacts</span> detected —
        merge with one click. <span className="font-bold text-foreground">3 automation rules</span> need attention
        (one is firing too often). PDPL audit log is clean. Open pipeline integrity ${tp}.
        Tip: the new lead-routing rule is converting <span className="font-bold text-[#88B8B0]">+12%</span> faster.
      </>
    ),
    kpis: [
      { label: "Data Hygiene",     value: "98%",  sub: "14 dupes to merge",   color: "#88B8B0", icon: CheckCircle2 },
      { label: "Active Workflows", value: "27",   sub: "1 needs review",      color: "#B8A0C8", icon: Zap },
      { label: "PDPL Audit",       value: "100%", sub: "All checks passed",   color: "#B8B880", icon: CheckSquare },
      { label: "Routing Lift",     value: "+12%", sub: "New rule, last 7d",   color: "#C8A880", icon: TrendingUp },
    ],
  },
  marketing: {
    briefing: (tp) => (
      <>
        <span className="font-bold text-foreground">3 campaigns live</span> across LinkedIn, X, Email, and WhatsApp —
        combined reach <span className="font-bold text-[#88B8B0]">41.3K</span> in the last 7 days.
        <span className="font-bold text-foreground"> 612 MQLs</span> generated this week,{" "}
        <span className="font-bold text-[#88B8B0]">+22% WoW</span>. Re-engagement audience of{" "}
        <span className="font-bold text-foreground">1,840 dormant contacts</span> ready to push — Khaleeji copy already drafted.
      </>
    ),
    kpis: [
      { label: "Campaigns Live",   value: "3",     sub: "+1 scheduled",        color: "#C8A880", icon: Send },
      { label: "MQLs This Week",   value: "612",   sub: "+22% WoW",            color: "#88B8B0", icon: Target },
      { label: "Channel Reach",    value: "41.3K", sub: "Last 7 days",         color: "#B8A0C8", icon: BarChart3 },
      { label: "Dormant to Push",  value: "1,840", sub: "Re-engagement ready", color: "#B8B880", icon: Zap },
    ],
  },
};

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return { greeting: "Good morning", icon: Sun, color: "#C8A880" };
  if (h < 18) return { greeting: "Good afternoon", icon: Sun, color: "#B8B880" };
  return { greeting: "Good evening", icon: Coffee, color: "#B8A0C8" };
}

const TODAY_AGENDA = [
  { time: "09:00", title: "Discovery call · Sara Al-Mansouri", channel: "voice", status: "upcoming" },
  { time: "10:30", title: "Demo follow-up · Ahmed Al-Rashidi", channel: "voice", status: "upcoming" },
  { time: "12:00", title: "Send proposal · Aramco Digital", channel: "email", status: "task" },
  { time: "14:00", title: "WhatsApp check-in · Fatima Khalid", channel: "whatsapp", status: "task" },
  { time: "16:00", title: "Pipeline review with team", channel: "voice", status: "upcoming" },
];

const HOT_SIGNALS = [
  { title: "Gulf Ventures closed $50M Series B", contact: "Sara Al-Mansouri", contactId: "c1", impact: "+$1.2M expansion potential", action: "Call within 24h", score: 96, source: "Crunchbase" },
  { title: "Ahmed Al-Rashidi promoted to CIO", contact: "Ahmed Al-Rashidi", contactId: "c2", impact: "Increased budget authority", action: "Send congrats + MSA", score: 87, source: "LinkedIn" },
  { title: "Aramco Digital approved Q2 budget", contact: "Mohammed Al-Otaibi", contactId: "c3", impact: "Contract ready to sign", action: "Push to Negotiation", score: 84, source: "WhatsApp message" },
];

const AT_RISK = [
  { name: "Layla Hassan", deal: "SMB Starter", value: 95000, risk: "Score dropped 72 → 65", days: 9 },
  { name: "Khalid Al-Hamdan", deal: "Pilot Expansion", value: 145000, risk: "No contact in 14 days", days: 14 },
];

const CHANNEL_ICON: Record<string, any> = { voice: Phone, email: Mail, whatsapp: MessageSquare, call: Phone };

const AUTO_TASKS = [
  { id: "t1", priority: "urgent", label: "Follow up: Sara Al-Mansouri (Series B funding)", due: "Today · 09:00", contact: "Sara Al-Mansouri", source: "Signal", done: false },
  { id: "t2", priority: "high", label: "Send proposal to Aramco Digital", due: "Today · 12:00", contact: "Mohammed Al-Otaibi", source: "Schedule", done: false },
  { id: "t3", priority: "high", label: "Re-engage: Khalid Al-Hamdan — 14 days silent", due: "Today", contact: "Khalid Al-Hamdan", source: "AI", done: false },
  { id: "t4", priority: "normal", label: "Congratulations message to Ahmed Al-Rashidi (CIO promotion)", due: "Today · 11:00", contact: "Ahmed Al-Rashidi", source: "LinkedIn", done: false },
  { id: "t5", priority: "normal", label: "Review pipeline: 3 deals stalled >30 days", due: "This week", contact: null, source: "CRM", done: false },
  { id: "t6", priority: "normal", label: "Update lead scores for Q2 enrichment batch", due: "This week", contact: null, source: "AI", done: false },
  { id: "t7", priority: "low", label: "WhatsApp check-in: Fatima Khalid", due: "Today · 14:00", contact: "Fatima Khalid", source: "Schedule", done: false },
  { id: "t8", priority: "low", label: "Add 10 enriched leads from sourcing to call list", due: "This week", contact: null, source: "AI", done: false },
];

const AI_INSIGHTS = [
  { icon: TrendingUp, color: "#88B8B0", title: "Pipeline acceleration detected", body: "Your Negotiation stage has 3 deals that have been there <7 days — all have strong engagement. Push for close this week, probability is 71%.", tag: "Pipeline" },
  { icon: AlertTriangle, color: "#C8A880", title: "SLA breach risk: 2 follow-ups overdue", body: "Khalid Al-Hamdan and Layla Hassan both had follow-up commitments from last week that haven't been actioned. Every 24h of delay drops close probability by ~4%.", tag: "Alerts" },
  { icon: Star, color: "#B8A0C8", title: "Best time to call this week", body: "Based on historical pick-up rates in KSA and UAE, Tuesday–Thursday between 09:30–11:00 AM Riyadh time has the highest connection rate (68% vs 41% average).", tag: "Analytics" },
  { icon: Flame, color: "#C0A0B8", title: "AI Agent overnight results", body: "The voice AI agent ran 12 sessions overnight. 4 leads qualified (32% rate). 2 are hot enough to add to today's call list. Recommend: call Nora Al-Faisal first.", tag: "AI" },
  { icon: BarChart3, color: "#B8B880", title: "Team velocity is up 18% WoW", body: "Call volume, email opens, and WhatsApp reply rates are all trending up this week. Keep momentum — you're on track to hit 112% of monthly pipeline target.", tag: "Performance", anchor: "performance" },
];

const PRIORITY_COLOR: Record<string, string> = { urgent: "#C8A880", high: "#B8A0C8", normal: "#88B8B0", low: "#90B8B8" };
const PRIORITY_BG: Record<string, string> = { urgent: "#C8A88020", high: "#B8A0C820", normal: "#88B8B020", low: "#90B8B820" };

type Tab = "briefing" | "command";

export default function CommandCenterPage() {
  const { data: dash } = useDashboard();
  const { data: contactsData } = useContacts({ limit: "100" });
  const { data: forgottenData } = useForgottenLeads();
  const { data: callsData } = useCalls({ limit: "10" });
  const regenerate = useRegenerateInsights();
  const recentCalls = ((callsData?.calls ?? []) as any[])
    .filter((c) => c.status === "completed")
    .slice(0, 4);
  const forgotten = (forgottenData?.leads ?? []) as any[];
  const forgottenSummary = forgottenData?.summary as string | undefined;
  const allContacts = (contactsData?.contacts ?? []) as any[];
  // Build lowercase name → id lookup so tasks can deep-link to the contact page
  const contactByName = new Map<string, string>();
  for (const c of allContacts) {
    const full = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim().toLowerCase();
    if (full && c.id) contactByName.set(full, c.id);
  }
  const findContactId = (name: string | null | undefined): string | null => {
    if (!name) return null;
    return contactByName.get(name.trim().toLowerCase()) ?? null;
  };
  const priorityContacts = [...allContacts]
    .sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0))
    .slice(0, 3)
    .map((c, i) => ({
      id: c.id,
      name: `${c.first_name} ${c.last_name}`,
      company: c.company_name ?? "—",
      reason: c.notes?.split(".")[0] ?? "High lead score · ready for outreach",
      score: c.lead_score ?? 0,
      value: 1500000 + i * 600000,
      channel: i === 2 ? "whatsapp" : "call",
    }));

  const tod = getTimeOfDay();
  const TODIcon = tod.icon;
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const stats = (dash?.stats ?? {}) as Record<string, number | undefined>;
  const totalPipeline = ((stats.totalRevenue ?? 0) / 100).toLocaleString();

  // Re-render whenever the user switches persona from the avatar menu.
  const [role, setRole] = useState(() => getRole());
  useEffect(() => {
    const refresh = () => setRole(getRole());
    window.addEventListener("nf:role-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("nf:role-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  const persona = PERSONA_BRIEFINGS[role.key];
  const firstName = role.name.split(" ")[0];

  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("briefing");

  // ─── Hash routing for /home#performance and /home#todo ──────────
  // The new top-bar tab strip points its Performance / To-Do entries
  // at /home with an anchor. We honour both: switch the inner tab if
  // needed, then scroll the anchor into view.
  useEffect(() => {
    function applyHash() {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      if (hash === "todo") setTab("command");
      else setTab("briefing");
      // Defer so the new tab content is in the DOM before we scroll.
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);
  const [tasks, setTasks] = useState(AUTO_TASKS);
  const [refreshingBriefing, setRefreshingBriefing] = useState(false);
  const [briefingRefreshedAt, setBriefingRefreshedAt] = useState<Date | null>(null);
  // Collapsible secondary sections in Overview (start collapsed for scannability)
  const [showAllRecall, setShowAllRecall] = useState(false);
  const [showAllSignals, setShowAllSignals] = useState(false);
  // Insights tab — per-card snooze + action-taken state
  const [insightSnoozed, setInsightSnoozed] = useState<Set<number>>(new Set());
  const [insightActed, setInsightActed] = useState<Set<number>>(new Set());

  function handleRefreshBriefing() {
    setRefreshingBriefing(true);
    setTimeout(() => {
      setRefreshingBriefing(false);
      setBriefingRefreshedAt(new Date());
    }, 800);
  }

  function toggleTask(id: string) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  const TABS = [
    { k: "briefing" as Tab, label: "Daily Briefing", icon: Sparkles },
    { k: "command" as Tab, label: "Command Center", icon: Zap, badge: tasks.filter(t => !t.done && t.priority === "urgent").length },
  ];

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden p-8"
        style={{ background: "linear-gradient(135deg, #f8f4ff 0%, #f0f9f8 40%, #fff8f0 80%, #fdf6ff 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(circle, #B8A0C8, transparent)" }} />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #88B8B0, transparent)" }} />
          <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full blur-2xl opacity-15" style={{ background: "radial-gradient(circle, #C8A880, transparent)" }} />
        </div>
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: `${tod.color}30` }}>
                <TODIcon className="w-6 h-6" style={{ color: tod.color }} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">{today} · Riyadh</div>
                <h1 className="text-3xl font-black text-foreground leading-tight">{tod.greeting}, {firstName}</h1>
                <div className="text-sm font-semibold mt-0.5 nf-chameleon-text">{role.title} · Daily Command Center</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRefreshBriefing}
              disabled={refreshingBriefing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 border border-white/80 text-xs text-muted-foreground hover:text-foreground shadow-sm backdrop-blur-sm disabled:opacity-60"
            >
              <RefreshCw className={`w-3 h-3 ${refreshingBriefing ? "animate-spin" : ""}`} />
              {refreshingBriefing ? "Refreshing..." : briefingRefreshedAt ? `Refreshed ${briefingRefreshedAt.toLocaleTimeString()}` : "Refresh briefing"}
            </button>
          </div>

          <div className="mt-4 p-5 rounded-2xl backdrop-blur-sm border" style={{ background: "rgba(255,255,255,0.6)", borderColor: "rgba(184,160,200,0.3)" }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-[#B8A0C8] uppercase tracking-wider mb-1">
                  Your AI Daily Briefing · for {role.label}
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  {persona.briefing(totalPipeline)}
                </p>
              </div>
            </div>
          </div>

          <div id="performance" className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 scroll-mt-32">
            {persona.kpis.map(s => (
              <div key={s.label} className="rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.7)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-black text-foreground leading-none">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1.5 rounded-2xl w-fit" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(184,160,200,0.2)", backdropFilter: "blur(12px)" }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={cn("flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all relative",
                tab === t.k ? "nf-chameleon-bg text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/60"
              )}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              {t.badge ? (
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold", tab === t.k ? "bg-white/25 text-white" : "bg-[#C8A880]/20 text-[#C8A880]")}>
                  {t.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ──── DAILY BRIEFING TAB ──── */}
      {tab === "briefing" && (
        <div className="space-y-5">
          {/* Re-Engagement Opportunities */}
          {forgotten.length > 0 && (
            <div className="rounded-2xl p-5 relative overflow-hidden border"
              style={{ background: "linear-gradient(135deg, #fffbf0, #f9f3ff, #f0f9f8)", borderColor: "rgba(200,168,128,0.3)" }}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-2xl opacity-20" style={{ background: "radial-gradient(circle, #C8A880, transparent)" }} />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl opacity-15" style={{ background: "radial-gradient(circle, #B8A0C8, transparent)" }} />
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #C8A880, #B8A0C8)" }}>
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground flex items-center gap-2">
                        Re-Engagement Opportunities
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "linear-gradient(90deg, #C8A880, #B8A0C8)" }}>{forgotten.length}</span>
                      </h2>
                      <p className="text-[11px] text-muted-foreground">No contact ≥90 days + wealth, job change, or digital activity signal</p>
                    </div>
                  </div>
                  <button onClick={() => regenerate.mutate()} disabled={regenerate.isPending}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-sm"
                    style={{ background: "rgba(255,255,255,0.6)", borderColor: "rgba(200,168,128,0.4)", color: "#C8A880" }}>
                    {regenerate.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    {regenerate.isPending ? "Analysing…" : "AI Re-score"}
                  </button>
                </div>
                {forgottenSummary && (
                  <p className="text-xs text-foreground/80 italic mb-3 px-3 py-2 rounded-lg" style={{ background: "rgba(200,168,128,0.12)", borderLeft: "3px solid #C8A880" }}>
                    {forgottenSummary}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {forgotten.slice(0, showAllRecall ? 9 : 3).map((l: any, i: number) => {
                    const priorityScore = Math.round(Number(l.lead_score) * 0.9 + 5);
                    const signals = ["Wealth signal", "Job change", "Site visits", "Email opens", "Follow-up missed"][i % 5];
                    return (
                      <Link key={l.id} href={`/contacts/${l.id}`}>
                        <div className="flex items-center gap-2.5 p-3 rounded-xl cursor-pointer group backdrop-blur-sm transition-all hover:shadow-md"
                          style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(200,168,128,0.2)" }}
                          title="Missed opportunity based on inactivity + high-value signals">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #C8A880, #B8A0C8)" }}>
                            {(l.first_name?.[0] ?? "") + (l.last_name?.[0] ?? "")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-foreground truncate">{l.first_name} {l.last_name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{l.company_name ?? "—"} · silent {Math.round(Number(l.days_silent))}d</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "#C8A88020", color: "#C8A880" }}>{signals}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className="text-xs font-black" style={{ color: "#C8A880" }}>{priorityScore}</div>
                            <div className="text-[9px] text-muted-foreground">priority</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                {forgotten.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllRecall((s) => !s)}
                    className="mt-2 text-[11px] font-semibold text-[#C8A880] hover:underline flex items-center gap-1"
                  >
                    {showAllRecall ? "Show less" : `Show ${Math.min(forgotten.length - 3, 6)} more`}
                    <ChevronRight className={cn("w-3 h-3 transition-transform", showAllRecall && "rotate-90")} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ──── NEXT BEST ACTIONS — RECENT CALLS ──── */}
          {recentCalls.length > 0 && (
            <div className="glass-card rounded-2xl p-5 border-l-4" style={{ borderLeftColor: "#88B8B0" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #88B8B0, #B8A0C8)" }}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground flex items-center gap-2">
                      Next Best Actions · Recent Calls
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "#88B8B0" }}>{recentCalls.length}</span>
                    </h2>
                    <p className="text-[11px] text-muted-foreground">AI-suggested follow-ups for your most recent conversations — one tap to act</p>
                  </div>
                </div>
                <Link href="/calls"><span className="text-xs text-[#88B8B0] hover:underline cursor-pointer">All calls →</span></Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentCalls.map((call: any) => (
                  <NextActionCard key={call.id} call={call} contactByName={contactByName} />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Priority Contacts */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#B8A0C8]" />
                  Today's Top 3 to Call
                </h2>
                <Link href="/contacts"><span className="text-xs text-[#B8A0C8] hover:underline cursor-pointer">All contacts →</span></Link>
              </div>
              <div className="space-y-3">
                {priorityContacts.length === 0 && <div className="text-sm text-muted-foreground py-6 text-center">Loading…</div>}
                {priorityContacts.map((c, i) => {
                  const Channel = CHANNEL_ICON[c.channel];
                  return (
                    <Link key={c.id} href={`/contacts/${c.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
                        <div className="text-xl font-black text-muted-foreground/30 w-6 text-center flex-shrink-0">{i + 1}</div>
                        <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {c.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{c.name}</span>
                            <span className="text-xs text-muted-foreground">· {c.company}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">{c.reason}</div>
                        </div>
                        <div className="hidden md:block text-right flex-shrink-0">
                          <div className="text-sm font-bold text-[#88B8B0]">${(c.value / 100).toLocaleString()}</div>
                          <div className="text-[10px] text-muted-foreground">pipeline</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs"
                            style={{ background: `${c.score >= 85 ? "#88B8B0" : c.score >= 70 ? "#B8B880" : "#C0A0B8"}25`, color: c.score >= 85 ? "#88B8B0" : c.score >= 70 ? "#B8B880" : "#C0A0B8" }}>
                            {c.score}
                          </div>
                          <button className="w-9 h-9 rounded-full nf-chameleon-bg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <Channel className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Today's Agenda */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-[#88B8B0]" />
                <h2 className="font-semibold text-foreground">Today's Schedule</h2>
              </div>
              <div className="space-y-2.5">
                {TODAY_AGENDA.map((item, i) => {
                  const Channel = CHANNEL_ICON[item.channel];
                  return (
                    <div key={i} className="flex items-start gap-3 group">
                      <div className="text-[10px] font-bold text-muted-foreground w-10 text-right pt-1 flex-shrink-0">{item.time}</div>
                      <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", item.status === "task" ? "bg-[#C8A880]" : "bg-[#88B8B0]")} />
                      <div className="flex-1 min-w-0 pb-2 border-b border-border/15">
                        <div className="flex items-center gap-1.5">
                          <Channel className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-foreground/85 truncate">{item.title}</span>
                        </div>
                        <span className={cn("text-[9px] font-medium uppercase tracking-wide", item.status === "task" ? "text-[#C8A880]" : "text-[#88B8B0]")}>{item.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SLA Alerts */}
            <div className="glass-card rounded-2xl p-5 border-l-4" style={{ borderLeftColor: "#C0A0B8" }}>
              <div className="flex items-center gap-2 mb-3">
                <BellRing className="w-4 h-4 text-[#C0A0B8]" />
                <h2 className="font-semibold text-foreground">SLA Alerts</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#C0A0B8]/20 text-[#C0A0B8] font-bold">2</span>
              </div>
              <div className="space-y-2">
                {AT_RISK.map((d, i) => (
                  <div key={i} className="p-3 rounded-xl border" style={{ background: "#C0A0B808", borderColor: "#C0A0B825" }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{d.name}</span>
                      <span className="text-xs font-bold text-[#C0A0B8]">${(d.value / 100).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{d.deal}</div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[#C0A0B8]">
                      <AlertTriangle className="w-3 h-3" />{d.risk}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hot Signals */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#B8B880]" />Hot Signals · Last 24h
                </h2>
                <Link href="/signals"><span className="text-xs text-[#B8A0C8] hover:underline cursor-pointer">All signals →</span></Link>
              </div>
              <div className="space-y-2">
                {HOT_SIGNALS.slice(0, showAllSignals ? HOT_SIGNALS.length : 3).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl border" style={{ borderColor: "#B8B88025", background: "#B8B88008" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#B8B88025" }}>
                      <Zap className="w-4 h-4 text-[#B8B880]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{s.title}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs">
                        <Link href={`/contacts/${s.contactId}`}><span className="text-[#B8A0C8] hover:underline cursor-pointer">{s.contact}</span></Link>
                        <span className="text-muted-foreground">· {s.impact}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground font-medium uppercase tracking-wider">{s.source}</span>
                        <button className="text-[10px] font-semibold text-[#88B8B0] flex items-center gap-1 hover:underline">{s.action} <ArrowRight className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <span className="text-sm font-black text-[#B8B880] flex-shrink-0">{s.score}</span>
                  </div>
                ))}
              </div>
              {HOT_SIGNALS.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllSignals((s) => !s)}
                  className="mt-2 text-[11px] font-semibold text-[#B8B880] hover:underline flex items-center gap-1"
                >
                  {showAllSignals ? "Show less" : `Show ${HOT_SIGNALS.length - 3} more`}
                  <ChevronRight className={cn("w-3 h-3 transition-transform", showAllSignals && "rotate-90")} />
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-3 glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Start a Call", icon: Phone, color: "#88B8B0", href: "/calls" },
                  { label: "Compose Email", icon: Mail, color: "#B8A0C8", href: "/messages" },
                  { label: "WhatsApp Message", icon: MessageSquare, color: "#90B8B8", href: "/messages" },
                  { label: "Find New Leads", icon: Users, color: "#C8A880", href: "/sourcing" },
                ].map(a => (
                  <Link key={a.label} href={a.href}>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}20` }}>
                        <a.icon className="w-4 h-4" style={{ color: a.color }} />
                      </div>
                      <span className="text-sm font-medium text-foreground flex-1">{a.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──── COMMAND CENTER TAB ──── */}
      {tab === "command" && (
        <CommandLauncher firstName={firstName} navigate={navigate} />
      )}
      {tab === "command" && <div id="todo" className="scroll-mt-32" />}
      {tab === "command" && (() => {
        const totalCount = tasks.length;
        const doneCount = tasks.filter(t => t.done).length;
        const openCount = totalCount - doneCount;
        const urgentOpen = tasks.filter(t => !t.done && t.priority === "urgent").length;
        const highOpen   = tasks.filter(t => !t.done && t.priority === "high").length;
        const normalOpen = tasks.filter(t => !t.done && t.priority === "normal").length;
        const lowOpen    = tasks.filter(t => !t.done && t.priority === "low").length;
        const completionPct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
        const nextUp = tasks.find(t => !t.done && t.priority === "urgent")
          ?? tasks.find(t => !t.done);
        const aiSummary = openCount === 0
          ? `Inbox zero. You've cleared all ${totalCount} AI-generated tasks today — well done.`
          : `${openCount} of ${totalCount} tasks open · ${urgentOpen} urgent. Knock out ${nextUp ? `"${nextUp.label.split(" ").slice(0, 6).join(" ")}…"` : "the urgent items"} first to keep momentum.`;
        const buckets: { key: "urgent"|"high"|"normal"|"low"; label: string; open: number }[] = [
          { key: "urgent", label: "Urgent",  open: urgentOpen },
          { key: "high",   label: "High",    open: highOpen },
          { key: "normal", label: "Normal",  open: normalOpen },
          { key: "low",    label: "Low",     open: lowOpen },
        ];
        return (
        <div className="space-y-5">
          {/* AI summary header */}
          <div className="rounded-2xl p-5 border relative overflow-hidden"
               style={{ background: "linear-gradient(135deg, rgba(184,160,200,0.10), rgba(136,184,176,0.10))", borderColor: "rgba(184,160,200,0.3)" }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-bold text-[#B8A0C8] mb-0.5">AI Task Summary</div>
                <p className="text-sm text-foreground/85 leading-relaxed">{aiSummary}</p>
              </div>
              <div className="hidden sm:flex flex-col items-end flex-shrink-0">
                <div className="text-2xl font-black text-foreground leading-none">{completionPct}%</div>
                <div className="text-[10px] text-muted-foreground">complete</div>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/40 overflow-hidden mt-4">
              <div className="h-full nf-chameleon-bg transition-all" style={{ width: `${completionPct}%` }} />
            </div>
          </div>

          {/* Priority scorecards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {buckets.map((b) => (
              <div key={b.key} className="glass-card rounded-2xl p-4 border-l-4" style={{ borderLeftColor: PRIORITY_COLOR[b.key] }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{b.label}</div>
                    <div className="text-2xl font-black text-foreground leading-tight mt-1">{b.open}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{b.open === 1 ? "task open" : "tasks open"}</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: PRIORITY_BG[b.key], color: PRIORITY_COLOR[b.key] }}>
                    {b.key === "urgent" ? <Flame className="w-5 h-5" />
                      : b.key === "high" ? <TrendingUp className="w-5 h-5" />
                      : b.key === "normal" ? <ListTodo className="w-5 h-5" />
                      : <Clock className="w-5 h-5" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section divider */}
          <div className="flex items-center justify-between pt-1">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#88B8B0]" /> Today's task list
            </h2>
            <div className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{doneCount}</span>/{totalCount} complete
            </div>
          </div>

          {(["urgent", "high", "normal", "low"] as const).map(priority => {
            const group = tasks.filter(t => t.priority === priority);
            if (!group.length) return null;
            const labels: Record<string, string> = { urgent: "Urgent", high: "High Priority", normal: "Normal", low: "Low Priority" };
            return (
              <div key={priority}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PRIORITY_COLOR[priority] }} />
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{labels[priority]}</span>
                  <span className="text-xs text-muted-foreground">· {group.filter(t => !t.done).length} remaining</span>
                </div>
                <div className="space-y-2">
                  {group.map(task => (
                    <div key={task.id}
                      className={cn(
                        "glass-card rounded-xl flex items-stretch transition-all border",
                        task.done ? "opacity-60 border-border/10" : "border-border/20 hover:border-[#B8A0C8]/30 hover:shadow-sm"
                      )}>
                      {/* Big explicit tap target for the checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        className={cn(
                          "flex items-center justify-center w-14 flex-shrink-0 rounded-l-xl transition-all border-r",
                          task.done
                            ? "border-border/10"
                            : "border-border/10 hover:bg-[#88B8B0]/10 active:bg-[#88B8B0]/20"
                        )}
                        aria-label={task.done ? "Mark as incomplete" : "Mark as complete"}
                      >
                        {task.done
                          ? <CheckCircle2 className="w-6 h-6" style={{ color: PRIORITY_COLOR[priority] }} />
                          : <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/40 transition-colors" />
                        }
                      </button>

                      {/* Task content */}
                      <div className="flex-1 min-w-0 p-4">
                        <div className={cn("text-sm font-medium text-foreground leading-snug", task.done && "line-through text-muted-foreground")}>
                          {task.label}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>{task.due}</span>
                          {task.contact && (() => {
                            const cid = findContactId(task.contact);
                            return (
                              <>
                                <span>·</span>
                                {cid ? (
                                  <Link href={`/contacts/${cid}`}>
                                    <span
                                      className="text-[#B8A0C8] font-semibold cursor-pointer hover:underline hover:text-[#88B8B0] transition-colors inline-flex items-center gap-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {task.contact}
                                      <ChevronRight className="w-3 h-3" />
                                    </span>
                                  </Link>
                                ) : (
                                  <span className="text-[#B8A0C8] font-medium">{task.contact}</span>
                                )}
                              </>
                            );
                          })()}
                          <span className="ml-auto px-1.5 py-0.5 rounded bg-muted/60 text-[10px] font-medium flex-shrink-0">{task.source}</span>
                        </div>
                      </div>

                      {/* Done label appears when complete */}
                      {task.done && (
                        <div className="flex items-center pr-4">
                          <span className="text-[10px] font-bold text-[#88B8B0] uppercase tracking-wider">Done</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        );
      })()}

      {/* ──── INSIGHTS (rendered inside Command Center) ──── */}
      {tab === "command" && (() => {
        const visibleInsights = AI_INSIGHTS
          .map((ins, idx) => ({ ins, idx }))
          .filter(({ idx }) => !insightSnoozed.has(idx));
        const actedCount = insightActed.size;
        return (
        <div className="space-y-4">
          {/* AI summary header */}
          <div className="rounded-2xl p-5 border relative overflow-hidden"
               style={{ background: "linear-gradient(135deg, rgba(184,160,200,0.10), rgba(200,168,128,0.10))", borderColor: "rgba(184,160,200,0.3)" }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">AI Insights · Today</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Auto-generated from pipeline, calls, signals, and team activity. {visibleInsights.length} active · {actedCount} actioned today.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/insights")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl nf-chameleon-bg text-white text-xs font-semibold hover:opacity-90 flex-shrink-0"
                  >
                    <Sparkles className="w-3 h-3" />
                    Deeper analysis
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Insight cards with action buttons */}
          <div className="space-y-3">
            {visibleInsights.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
                You've reviewed every insight for now. Fresh ones will appear as new data lands.
              </div>
            ) : visibleInsights.map(({ ins, idx }) => {
              const Icon = ins.icon;
              const acted = insightActed.has(idx);
              return (
                <div key={idx} className="glass-card rounded-2xl p-5"
                  style={{ borderLeft: `4px solid ${ins.color}` }}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ins.color}20` }}>
                      <Icon className="w-5 h-5" style={{ color: ins.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-bold text-foreground">{ins.title}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${ins.color}20`, color: ins.color }}>{ins.tag}</span>
                        {acted && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#88B8B0]/20 text-[#88B8B0] flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Actioned
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{ins.body}</p>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mt-4 pl-14">
                    <button
                      type="button"
                      onClick={() => setInsightActed((s) => new Set([...s, idx]))}
                      disabled={acted}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all",
                        acted
                          ? "bg-[#88B8B0]/15 text-[#88B8B0] border-[#88B8B0]/30 cursor-default"
                          : "text-white border-transparent hover:opacity-90 shadow-sm",
                      )}
                      style={!acted ? { background: ins.color } : undefined}
                    >
                      {acted ? <CheckCircle2 className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                      {acted ? "Action taken" : "Take action"}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/insights")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-border/30 text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      View related
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/messages")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-border/30 text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      Create task
                    </button>
                    <button
                      type="button"
                      onClick={() => setInsightSnoozed((s) => new Set([...s, idx]))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-border/30 text-muted-foreground hover:bg-muted/40 transition-colors ml-auto"
                      title="Snooze for today"
                    >
                      <Clock className="w-3 h-3" />
                      Snooze
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {insightSnoozed.size > 0 && (
            <button
              type="button"
              onClick={() => setInsightSnoozed(new Set())}
              className="text-[11px] text-muted-foreground hover:text-foreground mx-auto block"
            >
              Restore {insightSnoozed.size} snoozed insight{insightSnoozed.size === 1 ? "" : "s"}
            </button>
          )}
        </div>
        );
      })()}
    </div>
  );
}

// ──────────────────────────────────────────────
// CommandLauncher — action launcher grid for the Command Center tab.
// Mirrors the user's spec: Log Call Note, Send WhatsApp, Send Email,
// Schedule Follow-up, AI Voice Call, Coaching Session, Generate List,
// Scoring/Gaps Report.
// ──────────────────────────────────────────────
function CommandLauncher({ firstName, navigate }: { firstName: string; navigate: (to: string) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  const ACTIONS: {
    key: string;
    label: string;
    sub: string;
    icon: any;
    color: string;
    href?: string;
    log?: { type: string; title: string; body: string };
  }[] = [
    {
      key: "log-call",
      label: "Log Call Note",
      sub: "Capture an after-call summary",
      icon: Phone,
      color: "#88B8B0",
      log: { type: "call", title: "Call note logged", body: "Manually-logged call summary captured from Command Center." },
    },
    {
      key: "whatsapp",
      label: "Send WhatsApp",
      sub: "Khaleeji-tone draft, ready to send",
      icon: MessageSquare,
      color: "#90B8B8",
      log: { type: "whatsapp", title: "WhatsApp message sent", body: "Outreach message dispatched from Command Center." },
    },
    {
      key: "email",
      label: "Send Email",
      sub: "AI-drafted with tone preset",
      icon: Mail,
      color: "#B8A0C8",
      log: { type: "email", title: "Email sent", body: "Outreach email dispatched from Command Center." },
    },
    {
      key: "follow-up",
      label: "Schedule Follow-up",
      sub: "Auto-pick best time per timezone",
      icon: CalendarPlus,
      color: "#C8A880",
      log: { type: "meeting", title: "Follow-up scheduled", body: "Calendar invite drafted from Command Center." },
    },
    {
      key: "voice-call",
      label: "AI Voice Call",
      sub: "Queue an AI re-call session",
      icon: Mic,
      color: "#88B8B0",
      href: "/voice-agents",
    },
    {
      key: "coaching",
      label: "Coaching Session",
      sub: "Run a 1:1 coaching review",
      icon: Brain,
      color: "#B8A0C8",
      href: "/coaching",
    },
    {
      key: "generate-list",
      label: "Generate List",
      sub: "Build a target list from criteria",
      icon: ListTodo,
      color: "#C0A0B8",
      href: "/lists",
    },
    {
      key: "scoring-gaps",
      label: "Scoring & Gaps Report",
      sub: "AI rescore + funnel gap analysis",
      icon: BarChart3,
      color: "#B8B880",
      href: "/pipeline",
    },
  ];

  async function handle(a: typeof ACTIONS[number]) {
    if (a.href) {
      navigate(a.href);
      return;
    }
    if (!a.log || done.has(a.key) || busy) return;
    setBusy(a.key);
    try {
      await apiFetch("/activities", {
        method: "POST",
        body: JSON.stringify({
          type: a.log.type,
          title: a.log.title,
          body: a.log.body,
          status: "completed",
          completed_at: new Date().toISOString(),
          metadata: { source: "command_center_launcher", action: a.key, by: firstName },
        }),
      });
      setDone((s) => new Set([...s, a.key]));
    } catch {
      // silent
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl p-5 border relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgba(184,160,200,0.10), rgba(136,184,176,0.10))", borderColor: "rgba(184,160,200,0.3)" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #B8A0C8, transparent)" }} />
      </div>
      <div className="relative">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl nf-chameleon-bg flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Action Launcher</h2>
            <p className="text-[11px] text-muted-foreground">One-tap shortcuts for the most common revenue motions</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {ACTIONS.map((a) => {
            const isDone = done.has(a.key);
            const isBusy = busy === a.key;
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => handle(a)}
                disabled={isBusy || isDone}
                className={cn(
                  "text-left rounded-xl p-3.5 border transition-all flex flex-col gap-2 group",
                  isDone
                    ? "bg-[#88B8B0]/15 border-[#88B8B0]/40 cursor-default"
                    : "bg-white/60 border-white/80 hover:shadow-md hover:-translate-y-0.5",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${a.color}20` }}>
                    {isBusy ? (
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: a.color }} />
                    ) : isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#88B8B0]" />
                    ) : (
                      <a.icon className="w-4 h-4" style={{ color: a.color }} />
                    )}
                  </div>
                  {!isDone && (
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground leading-tight">
                    {isDone ? "Done" : a.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{a.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// NextActionCard — recent call with one-tap follow-up actions
// ──────────────────────────────────────────────
function NextActionCard({ call, contactByName }: { call: any; contactByName: Map<string, string> }) {
  const [done, setDone] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const contactName: string = call.contact_name ?? "Unknown contact";
  const contactId =
    call.contact_id ??
    contactByName.get(contactName.trim().toLowerCase()) ??
    null;
  const score = call.call_score != null ? Math.round(call.call_score) : null;
  const sentiment = call.sentiment_score ?? 0;
  const minsAgo = call.ended_at
    ? Math.max(1, Math.round((Date.now() - new Date(call.ended_at).getTime()) / 60000))
    : null;
  const summary: string =
    call.ai_insights?.next_best_action ??
    call.ai_insights?.summary ??
    call.coaching_notes ??
    "Recap discussion and confirm the agreed next step.";

  // Choose a smart suggested channel based on call outcome / sentiment
  const suggestedChannel: "whatsapp" | "email" | "call" | "meeting" =
    sentiment >= 0.4 ? "meeting" : sentiment >= 0 ? "email" : "whatsapp";

  async function trigger(type: "whatsapp" | "email" | "call" | "meeting") {
    if (done.includes(type) || busy) return;
    setBusy(type);
    try {
      const titles: Record<string, string> = {
        whatsapp: "WhatsApp follow-up sent",
        email: "Follow-up email drafted",
        call: "AI voice agent re-call queued",
        meeting: "Meeting invite sent",
      };
      const bodies: Record<string, string> = {
        whatsapp: `Hi ${contactName.split(" ")[0]}! Following up on our call — let me know a good time to continue the conversation.`,
        email: `Hi ${contactName.split(" ")[0]},\n\nThank you for your time today. Recapping our conversation and the agreed next steps below.\n\nBest regards`,
        call: `AI voice agent will dial ${contactName} within the next 30 minutes for a follow-up touchpoint.`,
        meeting: `Calendar invite sent to ${contactName} for a follow-up meeting based on availability.`,
      };
      await apiFetch("/activities", {
        method: "POST",
        body: JSON.stringify({
          type: type === "meeting" ? "meeting" : type === "call" ? "call" : type === "whatsapp" ? "whatsapp" : "email",
          title: titles[type],
          body: bodies[type],
          contact_id: contactId,
          status: "completed",
          completed_at: new Date().toISOString(),
          metadata: { source: "command_center_nba", call_id: call.id },
        }),
      });
      setDone((d) => [...d, type]);
    } catch {
      // Silent fail keeps the UI snappy; user sees no green tick on failure
    } finally {
      setBusy(null);
    }
  }

  const ACTIONS: Array<{ type: "whatsapp" | "email" | "call" | "meeting"; label: string; icon: any; color: string }> = [
    { type: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "#90B8B8" },
    { type: "email", label: "Email", icon: Mail, color: "#B8A0C8" },
    { type: "call", label: "AI Re-call", icon: Mic, color: "#88B8B0" },
    { type: "meeting", label: "Schedule", icon: CalendarPlus, color: "#C8A880" },
  ];

  const scoreColor = score == null ? "#90B8B8" : score >= 80 ? "#88B8B0" : score >= 60 ? "#B8B880" : "#C0A0B8";

  return (
    <div className="p-4 rounded-xl bg-muted/15 border border-border/30 hover:border-border/60 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#88B8B020" }}>
          <Phone className="w-4 h-4 text-[#88B8B0]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {contactId ? (
              <Link href={`/contacts/${contactId}`}>
                <span className="text-sm font-semibold text-foreground hover:text-[#B8A0C8] hover:underline cursor-pointer truncate">
                  {contactName}
                </span>
              </Link>
            ) : (
              <span className="text-sm font-semibold text-foreground truncate">{contactName}</span>
            )}
            {score != null && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${scoreColor}20`, color: scoreColor }}>
                {score}/100
              </span>
            )}
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider" style={{ background: `${ACTIONS.find(a => a.type === suggestedChannel)?.color}25`, color: ACTIONS.find(a => a.type === suggestedChannel)?.color }}>
              ⭐ {suggestedChannel}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            {minsAgo ? (minsAgo < 60 ? `${minsAgo}m ago` : `${Math.round(minsAgo / 60)}h ago`) : "Recently"}
            {call.duration_seconds != null && <span>· {Math.floor(call.duration_seconds / 60)}m call</span>}
          </div>
        </div>
      </div>

      <div className="text-xs text-foreground/80 leading-relaxed mb-3 line-clamp-2 italic px-3 py-2 rounded-lg bg-[#B8A0C8]/8 border-l-2 border-[#B8A0C8]/40">
        <Sparkles className="w-3 h-3 inline mr-1 text-[#B8A0C8]" />
        {summary}
      </div>

      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => {
          const isDone = done.includes(a.type);
          const isBusy = busy === a.type;
          const isSuggested = a.type === suggestedChannel;
          return (
            <button
              key={a.type}
              onClick={() => trigger(a.type)}
              disabled={isDone || isBusy}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all border",
                isDone
                  ? "bg-[#88B8B0]/15 text-[#88B8B0] border-[#88B8B0]/30 cursor-default"
                  : isSuggested
                  ? "bg-white border-2 hover:shadow-md"
                  : "bg-muted/40 text-foreground border-border/30 hover:border-border/60",
              )}
              style={!isDone && isSuggested ? { borderColor: a.color, color: a.color } : undefined}
              title={isSuggested ? "AI-suggested next step" : a.label}
            >
              {isBusy ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isDone ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <a.icon className="w-3 h-3" style={!isSuggested ? { color: a.color } : undefined} />
              )}
              {isDone ? "Done" : a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
