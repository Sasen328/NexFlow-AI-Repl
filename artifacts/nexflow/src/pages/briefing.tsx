import { Link, useLocation } from "wouter";
import {
  Sparkles, Sun, AlertTriangle, TrendingUp, Phone, Mail, MessageSquare,
  Calendar, Zap, ArrowRight, Coffee, Brain, Target, Users, RefreshCw, ChevronRight,
  Clock, Loader2, CheckSquare, CheckCircle2, Circle, ListTodo, BarChart3,
  Bot, BellRing, TrendingDown, Star, Flame, Mic, FileText, Send, CalendarPlus,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { useDashboard, useContacts, useForgottenLeads, useRegenerateInsights, useCalls, apiFetch } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getRole, type RoleKey, type RoleProfile } from "@/lib/marketing-auth";
import { listApprovals, subscribeApprovals, type ApprovalItem } from "@/lib/approvals";
import MarketingDashboardPage from "@/pages/marketing-dashboard";
import CulturalIntelligencePage from "@/pages/cultural-intelligence";
import CEOHomePage from "@/pages/ceo-home";
import { Globe as GlobeIcon, LayoutDashboard as LayoutDashboardIcon } from "lucide-react";
import Briefing360AIAnalysis from "@/components/briefing-360";
import { PerformanceWireframeBlocks, TasksAlertsWireframeBlocks } from "@/components/briefing-tab-extras";

interface PersonaTask {
  id: string;
  priority: "urgent" | "high" | "normal" | "low";
  label: string;
  due: string;
  contact: string | null;
  source: string;
  done: boolean;
}
interface PersonaAgendaItem {
  time: string;
  title: string;
  channel: string;
  status: string;
}
interface PersonaInsight {
  icon: LucideIcon;
  color: string;
  title: string;
  body: string;
  tag: string;
  anchor?: string;
}
interface PersonaBriefing {
  /** First-person framing of what the persona is here to do today. */
  briefing: (totalPipeline: string) => React.ReactNode;
  /** 4 KPI tiles tuned to the persona's job. */
  kpis: { label: string; value: string; sub: string; color: string; icon: LucideIcon }[];
  /**
   * Persona-specific Today's To-Do queue. When omitted, the shared sales-rep
   * default (AUTO_TASKS) is used so we don't have to author 5 lists for personas
   * whose work is genuinely the same.
   */
  tasks?: PersonaTask[];
  /** Persona-specific calendar / agenda for today. Defaults to TODAY_AGENDA. */
  agenda?: PersonaAgendaItem[];
  /** Persona-specific AI insights feed. Defaults to AI_INSIGHTS. */
  insights?: PersonaInsight[];
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
    tasks: [
      { id: "mt1", priority: "urgent", label: "Launch Ramadan re-engagement to 1,840 dormant contacts", due: "Today · 10:00", contact: null, source: "Calendar", done: false },
      { id: "mt2", priority: "high",   label: "Approve LinkedIn carousel for Q2 KSA enterprise push",   due: "Today · 12:00", contact: null, source: "Campaign Builder", done: false },
      { id: "mt3", priority: "high",   label: "Review WhatsApp broadcast Khaleeji copy variants",        due: "Today",         contact: null, source: "AI", done: false },
      { id: "mt4", priority: "normal", label: "Refresh segment: Aramco Digital + 12 sub-companies",      due: "Today · 14:00", contact: null, source: "Segments", done: false },
      { id: "mt5", priority: "normal", label: "Cultural alert — fix Friday afternoon send times on 3 active campaigns", due: "This week", contact: null, source: "AI", done: false },
      { id: "mt6", priority: "normal", label: "Re-allocate $4K from FB Ads → LinkedIn Sponsored Content", due: "This week", contact: null, source: "AI", done: false },
      { id: "mt7", priority: "low",    label: "Pre-warm second sending domain (deliverability rotation)", due: "This week", contact: null, source: "Marketing Ops", done: false },
    ],
    agenda: [
      { time: "09:30", title: "Marketing standup · Channel performance review",     channel: "voice",    status: "upcoming" },
      { time: "11:00", title: "Approve creative · Q2 GCC enterprise push",          channel: "email",    status: "task" },
      { time: "13:00", title: "Walk-through with Sales · MQL → SQL handoff SLA",    channel: "voice",    status: "upcoming" },
      { time: "15:00", title: "Send Ramadan campaign · 1,840 dormant contacts",     channel: "whatsapp", status: "task" },
      { time: "16:30", title: "Performance review · Campaign Performance dashboard", channel: "voice",   status: "upcoming" },
    ],
    insights: [
      { icon: TrendingUp,    color: "#88B8B0", title: "LinkedIn long-form is converting 4.2× the org average",
        body: "Your Q3 thought-leadership series is your highest-yield channel. Recommend doubling cadence and reallocating $4K from underperforming Facebook Ads.", tag: "Channel" },
      { icon: AlertTriangle, color: "#C8A880", title: "Cold email reply rate dropped 22% in 14 days",
        body: "Sender reputation is degrading — pre-warm a second sending domain and rotate over 7 days to recover deliverability before the Q2 launch.", tag: "Deliverability" },
      { icon: Star,          color: "#B8A0C8", title: "WhatsApp opens at 71% within 30 minutes",
        body: "Strongest channel for time-sensitive offers in the GCC. Use for the Ramadan re-engagement to 1,840 dormants — Khaleeji copy is drafted and ready.", tag: "Channel" },
      { icon: Flame,         color: "#C0A0B8", title: "Cultural mismatch on 3 active campaigns",
        body: "'Q4 GCC Push' and 'Riyadh Roadshow' use English-only copy and Friday afternoon send times that conflict with prayer schedules. Switch to Arabic-first variants & Sun–Wed mornings.", tag: "Cultural" },
      { icon: BarChart3,     color: "#B8B880", title: "MQL volume up 22% WoW",
        body: "612 MQLs this week. Conversion-by-channel report shows LinkedIn + WhatsApp are responsible for 68% of growth — keep momentum.", tag: "Performance", anchor: "performance" },
    ],
  },
};

/** Shared default task/agenda/insight constants are defined below; persona overrides
 * above point at the same shape so we can swap in role-specific lists transparently. */

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

type Tab = "briefing" | "performance" | "todo" | "insights";

// ──────────────────────────────────────────────
// ApprovalsAlertSection — surfaces pending "Push anyway" requests from
// reps (rows that failed ICP fit but were escalated). Subscribes to the
// localStorage approvals queue so badges update live across tabs.
// ──────────────────────────────────────────────
function ApprovalsAlertSection() {
  const [pending, setPending] = useState<ApprovalItem[]>([]);
  useEffect(() => {
    setPending(listApprovals().filter(a => a.status === "pending"));
    return subscribeApprovals(() => {
      setPending(listApprovals().filter(a => a.status === "pending"));
    });
  }, []);
  if (pending.length === 0) return null;
  const top = pending.slice(0, 3);
  return (
    <div className="rounded-2xl p-4 border-2" style={{ borderColor: "rgba(184,160,200,0.45)", background: "linear-gradient(135deg, #f9f3ff, #fffaf3)" }}>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-[#B8A0C8]" />
        <h2 className="font-bold text-sm text-foreground">Approvals Required</h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#B8A0C8]/20 text-[#B8A0C8]">{pending.length} pending</span>
        <Link href="/approvals" className="ml-auto text-[11px] font-bold text-[#B8A0C8] hover:underline">Open queue →</Link>
      </div>
      <div className="space-y-2">
        {top.map(a => (
          <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-[#B8A0C8]/20">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#B8A0C8]/15 flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-[#B8A0C8]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-foreground truncate">{a.name || a.company || "Unnamed lead"} · {a.company || "—"}</div>
              <div className="text-[10px] text-muted-foreground truncate">
                From {a.source} · ICP fit {a.score}% · {a.reasons.length} fail reason{a.reasons.length === 1 ? "" : "s"}
              </div>
            </div>
            <Link href="/approvals">
              <button type="button" className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#B8A0C8] text-white hover:opacity-90 flex-shrink-0">
                Review
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// CommandCenterPage — thin role router for /home.
// IMPORTANT: This wrapper exists so we don't fetch sales-side data
// (contacts, calls, forgotten leads, dashboard pipeline) for marketing
// users. Each branch uses its own component which scopes its own
// hooks. Avoids both UI leak AND data-fetch leak between personas.
// ──────────────────────────────────────────────
export default function CommandCenterPage() {
  // Subscribe to role changes so a persona switch from the avatar menu
  // re-routes /home without a full page reload.
  const [roleKey, setRoleKey] = useState<RoleKey>(() => getRole().key);
  useEffect(() => {
    const refresh = () => setRoleKey(getRole().key);
    window.addEventListener("nf:role-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("nf:role-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (roleKey === "marketing") {
    return <MarketingHomePage />;
  }
  if (roleKey === "ceo") {
    return <CEOHomePage />;
  }
  return <SalesAndExecHome />;
}

// ──────────────────────────────────────────────
// SalesAndExecHome — original /home for sales rep / sales manager /
// CEO / admin personas. Loads all the sales-side hooks. Marketing
// users never reach this branch, so its API calls don't fire for them.
// ──────────────────────────────────────────────
function SalesAndExecHome() {
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
      if (hash === "todo" || hash === "alerts") setTab("todo");
      else if (hash === "performance") setTab("performance");
      else if (hash === "insights") setTab("insights");
      else setTab("briefing");
      // Defer so the new tab content is in the DOM before we scroll.
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    applyHash();
    // wouter uses history.pushState which fires popstate but NOT hashchange —
    // we must listen to both so nav-dropdown links (/home#performance, /home#todo)
    // correctly switch tabs + scroll.
    window.addEventListener("hashchange", applyHash);
    window.addEventListener("popstate", applyHash);
    return () => {
      window.removeEventListener("hashchange", applyHash);
      window.removeEventListener("popstate", applyHash);
    };
  }, []);
  // Persona-aware Today's To-Do, Today's Schedule, and AI Insights feed.
  // The persona's overrides (if defined in PERSONA_BRIEFINGS) take precedence;
  // otherwise we fall back to the shared sales-rep defaults so we never break
  // personas that genuinely share the same daily work.
  const personaTasks   = persona.tasks   ?? AUTO_TASKS;
  const personaAgenda  = persona.agenda  ?? TODAY_AGENDA;
  const personaInsights = persona.insights ?? AI_INSIGHTS;
  const [tasks, setTasks] = useState(personaTasks);
  // When the persona changes (avatar menu switch), swap in their task list.
  useEffect(() => { setTasks(personaTasks); }, [role.key]); // eslint-disable-line react-hooks/exhaustive-deps
  const [refreshingBriefing, setRefreshingBriefing] = useState(false);
  const [briefingRefreshedAt, setBriefingRefreshedAt] = useState<Date | null>(null);
  // Collapsible secondary sections in Overview (start collapsed for scannability)
  const [showAllRecall, setShowAllRecall] = useState(false);
  const [showAllSignals, setShowAllSignals] = useState(false);
  // Insights tab — per-card snooze + action-taken state
  const [insightSnoozed, setInsightSnoozed] = useState<Set<number>>(new Set());
  const [insightActed, setInsightActed] = useState<Set<number>>(new Set());
  // "Deeper analysis" expands an inline panel below the AI summary —
  // does NOT navigate to /insights anymore (user feedback).
  const [showDeeperAnalysis, setShowDeeperAnalysis] = useState(false);
  // Performance tab — date filter
  type PerfFilter = "Today" | "This Week" | "This Month" | "Quarter" | "Custom";
  const PERF_FILTERS: PerfFilter[] = ["Today", "This Week", "This Month", "Quarter", "Custom"];
  const [perfFilter, setPerfFilter] = useState<PerfFilter>("This Week");
  // To-Do tab — bulk select
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  function toggleTaskSelect(id: string) {
    setSelectedTasks(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  // Insights tab — news filter
  const [newsFilter, setNewsFilter] = useState<string>("All");

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
    { k: "briefing"    as Tab, label: role.key === "sales" ? "360° AI Analysis" : "Daily Briefing", icon: Sparkles },
    { k: "performance" as Tab, label: "Performance",        icon: TrendingUp },
    { k: "todo"        as Tab, label: "To-Do & Alerts",     icon: ListTodo, badge: tasks.filter(t => !t.done && t.priority === "urgent").length },
    { k: "insights"    as Tab, label: "Insights Dashboard", icon: BarChart3, badge: personaInsights.length },
  ];

  // Marketing persona is routed earlier by CommandCenterPage to
  // MarketingHomePage — it never reaches SalesAndExecHome — so no
  // additional branch is needed here.

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

          <div id="performance" className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 scroll-mt-32">
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

      {/* ──── Studio entry-point CTA — discoverable from Home ──── */}
      <Link href="/studio">
        <div className="group rounded-2xl p-4 border cursor-pointer transition-all hover:shadow-md flex items-center gap-4"
             style={{ background: "linear-gradient(135deg, #fdf6ff 0%, #f4f0ff 100%)", borderColor: "rgba(184,160,200,0.45)" }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 nf-chameleon-bg shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Open Studio</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#B8A0C8]/20 text-[#B8A0C8] font-bold uppercase tracking-wide">New</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Your all-in-one workspace — focus list, active subject overview, and Conductor lane.</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#B8A0C8] flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>

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

      {/* ──── DAILY BRIEFING — sales rep gets the 360° AI Analysis experience ──── */}
      {role.key === "sales" && tab === "briefing" && (
        <div className="space-y-5">
          <Briefing360AIAnalysis />
        </div>
      )}
      {tab === "briefing" && role.key !== "sales" && (
        <div className="space-y-5">
          {/* AI Briefing Summary Card */}
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(184,160,200,0.3)" }}>
            <div className="p-5" style={{ background: "linear-gradient(135deg, #f9f3ff 0%, #f0f9f8 60%, #fffbf0 100%)" }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8A0C8] mb-0.5">AI · your daily briefing</div>
                  <h2 className="text-lg font-black text-foreground leading-tight">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {firstName}</h2>
                </div>
                <button
                  type="button"
                  onClick={handleRefreshBriefing}
                  disabled={refreshingBriefing}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 border border-white/80 text-[11px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60 flex-shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${refreshingBriefing ? "animate-spin" : ""}`} />
                  {refreshingBriefing ? "Refreshing…" : "Refresh"}
                </button>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed mb-5">
                {persona.briefing(totalPipeline)}
              </p>

              {/* Actionable buttons row */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-white/60">
                {([
                  { label: "Call Now",      icon: Phone,        color: "#88B8B0", href: "/callcenter/calls" },
                  { label: "WhatsApp",      icon: MessageSquare,color: "#90B8B8", href: "/callcenter/messages" },
                  { label: "Send Email",    icon: Mail,         color: "#B8A0C8", href: "/callcenter/messages" },
                  { label: "Log Call Note", icon: FileText,     color: "#C8A880", href: "/callcenter/calls" },
                  { label: "Schedule",      icon: CalendarPlus, color: "#C0A0B8", href: "/callcenter/messages" },
                ] as const).map(a => (
                  <Link key={a.label} href={a.href}>
                    <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-border/30 bg-white/70 hover:bg-white hover:shadow-sm transition-all"
                      style={{ color: a.color }}>
                      <a.icon className="w-3 h-3" />
                      {a.label}
                    </button>
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => setTab("todo")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold nf-chameleon-bg text-white hover:opacity-90 transition-all shadow-sm ml-auto"
                >
                  <Zap className="w-3 h-3" />
                  Open To-Do Queue
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Suggested next actions — task cards attached below */}
            <div className="border-t px-5 py-4" style={{ background: "rgba(255,255,255,0.7)", borderColor: "rgba(184,160,200,0.15)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-foreground/70 uppercase tracking-wide">Suggested next actions</span>
                <span className="text-[10px] text-muted-foreground">AI ranked · tap to act</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tasks.filter(t => !t.done).slice(0, 4).map((t) => {
                  const cid = t.contact ? findContactId(t.contact) : null;
                  const href = cid ? `/contacts/${cid}` : "/home#todo";
                  const color = PRIORITY_COLOR[t.priority] ?? "#B8A0C8";
                  const bg = PRIORITY_BG[t.priority] ?? "#B8A0C820";
                  return (
                    <Link key={t.id} href={href}>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 hover:bg-white border border-white/90 hover:border-[#B8A0C8]/30 transition-all cursor-pointer group shadow-sm">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                          <Zap className="w-3.5 h-3.5" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate">{t.label}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide" style={{ background: bg, color }}>{t.priority}</span>
                            <span className="text-[10px] text-muted-foreground">{t.due}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
                {tasks.filter(t => !t.done).length === 0 && (
                  <div className="col-span-2 py-4 text-center text-sm text-muted-foreground">All caught up — no open tasks!</div>
                )}
              </div>
            </div>
          </div>

          {/* Two-column layout — LEFT sidebar = Schedule + Signals stacked,
              RIGHT main column = Bottlenecks & Coaching analysis. */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* LEFT — Schedule + Signals stacked */}
            <div className="lg:col-span-1 space-y-4">
              {/* Today's Schedule */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-[#88B8B0]" />
                  <h2 className="font-semibold text-foreground text-sm">Today's Schedule</h2>
                  <Link href="/meetings" className="ml-auto text-[10px] font-semibold text-[#88B8B0] hover:underline">All →</Link>
                </div>
                <div className="space-y-2">
                  {personaAgenda.slice(0, 6).map((item, i) => {
                    const Channel = CHANNEL_ICON[item.channel];
                    return (
                      <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/40 transition-colors">
                        <div className="text-[10px] font-bold text-muted-foreground w-10 text-right flex-shrink-0">{item.time}</div>
                        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", item.status === "task" ? "bg-[#C8A880]" : "bg-[#88B8B0]")} />
                        <Channel className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-foreground/85 leading-snug flex-1">{item.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Signals — last 24h */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-[#B8B880]" />
                  <h2 className="font-semibold text-foreground text-sm">Top Signals · 24h</h2>
                  <Link href="/signals" className="ml-auto text-[10px] font-semibold text-[#B8B880] hover:underline">All →</Link>
                </div>
                <div className="space-y-2">
                  {HOT_SIGNALS.slice(0, 4).map((s, i) => (
                    <div key={i} className="p-2.5 rounded-lg border" style={{ borderColor: "#B8B88025", background: "#B8B88008" }}>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "#B8B88025" }}>
                          <Zap className="w-3 h-3 text-[#B8B880]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground leading-snug">{s.title}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{s.impact}</div>
                          <Link href={`/contacts/${s.contactId}`}>
                            <span className="text-[10px] font-bold text-[#B8A0C8] hover:underline cursor-pointer">{s.contact} →</span>
                          </Link>
                        </div>
                        <span className="text-xs font-black text-[#B8B880] flex-shrink-0">{s.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Bottlenecks & Coaching (full analysis) */}
            <div className="lg:col-span-2">
              <BottlenecksCoachingPanel
                tasks={tasks}
                forgotten={forgotten}
                forgottenSummary={forgottenSummary}
                recentCalls={recentCalls}
                contactByName={contactByName}
                navigate={navigate}
              />
            </div>
          </div>

          {/* Action Launcher (compact, full width) */}
          <CommandLauncher firstName={firstName} navigate={navigate} />
        </div>
      )}

      {/* ──── PERFORMANCE TAB (spec §2.2) ──── */}
      {tab === "performance" && role.key === "sales" && (
        <div className="mb-5">
          <PerformanceWireframeBlocks />
        </div>
      )}
      {tab === "performance" && (() => {
        const MULT: Record<string, number> = { "Today": 0.15, "This Week": 1, "This Month": 4.2, "Quarter": 13, "Custom": 1.5 };
        const m = MULT[perfFilter] ?? 1;
        const kpis = [
          { label: "Calls Made",       value: String(Math.round(23 * m)), sub: "vs target " + String(Math.round(28 * m)), color: "#88B8B0", icon: Phone,    delta: "+12%", up: true  },
          { label: "Calls Connected",  value: String(Math.round(14 * m)), sub: String(Math.round(61)) + "% connect rate",  color: "#B8A0C8", icon: Phone,    delta: "+5%",  up: true  },
          { label: "Meetings Booked",  value: String(Math.round(5  * m)), sub: "vs target " + String(Math.round(6  * m)), color: "#C8A880", icon: Calendar, delta: "-8%",  up: false },
          { label: "SAL Conversions",  value: String(Math.round(3  * m)), sub: "SAL1 → SAL2",                             color: "#90B8B8", icon: TrendingUp,delta: "+2%",  up: true  },
          { label: "Deals Opened",     value: String(Math.round(2  * m)), sub: "new this period",                         color: "#C0A0B8", icon: Star,     delta: "0%",   up: true  },
          { label: "Pipeline Value",   value: "SAR " + Math.round(420 * m).toLocaleString() + "k", sub: "total open",    color: "#B8B880", icon: BarChart3, delta: "+18%", up: true  },
          { label: "Win Rate",         value: String(Math.round(34)) + "%", sub: "team avg 29%",                          color: "#88B8B0", icon: TrendingUp,delta: "+5pp", up: true  },
        ];
        const bottlenecks = [
          { title: "3 prospects silent 14+ days",   body: "Nora Al-Faisal, Khaled Bin Saad, Tariq Al-Rashid — last touch was an email. Re-engage by WhatsApp today.", color: "#C8A880", action: "Re-engage now" },
          { title: "Meetings-to-SAL conversion low", body: "12 meetings held this month but only 3 converted. Review call scoring for common objections.",              color: "#C0A0B8", action: "View call scores" },
          { title: "Follow-up task backlog rising",  body: "7 follow-ups are past due. Each day delay drops win probability by ~4%. Batch-execute from To-Do tab.",   color: "#B8A0C8", action: "Go to To-Do" },
        ];
        const trends = [
          { label: "Calls",     bars: [40, 55, 70, 62, 80, 73, 88] },
          { label: "Connects",  bars: [22, 31, 40, 38, 49, 45, 53] },
          { label: "Meetings",  bars: [2,  3,  4,  5,  4,  6,  5 ] },
        ];
        const maxBar = 100;
        return (
        <div className="space-y-5" id="performance">
          {/* AI Analysis Summary band */}
          <div className="rounded-2xl p-5 border relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f9f3ff 0%, #f0f9f8 60%, #fffbf0 100%)", borderColor: "rgba(184,160,200,0.3)" }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #B8A0C8, transparent)" }} />
            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm"><Sparkles className="w-5 h-5 text-white" /></div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8A0C8] mb-0.5">AI Performance Analysis · {perfFilter}</div>
                <h2 className="text-lg font-black text-foreground mb-1">Your Performance Brief</h2>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  {perfFilter === "Today" ? "Good pacing — 3 calls made so far. Connect rate is strong (67%). One bottleneck: 2 scheduled follow-ups are already overdue. Prioritise those before your 2 PM block."
                  : perfFilter === "This Week" ? "Calls are up 12% week-on-week. Meeting bookings are slightly behind target (-1). Win rate is tracking above team average (34% vs 29%). Focus: re-engage the 3 silent prospects before the week closes."
                  : perfFilter === "This Month" ? "Month is on track. Pipeline at SAR 1.76M vs SAR 1.4M target. Two deals moved to SAL2 this month — strong. One deal at risk due to SLA breach. Check SLA alerts."
                  : "Quarter performance: 87% of quarterly target achieved with 3 weeks remaining. Team velocity is up. Forecast: 104% of target if current trend continues. One bottleneck: meeting-to-SAL rate (25%) is below team benchmark (31%)."}
                </p>
              </div>
            </div>
          </div>

          {/* Date filter strip */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {PERF_FILTERS.map(f => (
              <button key={f} onClick={() => setPerfFilter(f)}
                className={cn("px-4 py-1.5 rounded-xl text-xs font-semibold transition-all", f === perfFilter ? "nf-chameleon-bg text-white shadow-sm" : "bg-muted/40 text-muted-foreground hover:bg-muted/70")}>
                {f}
              </button>
            ))}
            <span className="ml-auto text-[10px] text-muted-foreground">Last updated: just now</span>
          </div>

          {/* KPI tiles — 7 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {kpis.map(k => (
              <div key={k.label} className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${k.color}20` }}>
                    <k.icon className="w-4 h-4" style={{ color: k.color }} />
                  </div>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", k.up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600")}>{k.delta}</span>
                </div>
                <div className="text-2xl font-black text-foreground leading-none mb-0.5">{k.value}</div>
                <div className="text-[10px] text-muted-foreground">{k.label}</div>
                <div className="text-[9px] text-muted-foreground/70 mt-0.5">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Trend mini-charts + Bottlenecks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2"><Activity className="w-4 h-4 text-[#88B8B0]" /> Trends · {perfFilter}</h2>
                <span className="text-[10px] text-muted-foreground">7-day rolling</span>
              </div>
              {trends.map(t => (
                <div key={t.label} className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-foreground">{t.label}</span>
                    <span className="text-xs font-black text-foreground">{Math.round(t.bars[t.bars.length - 1] * m / (perfFilter === "Today" ? 8 : 1))}</span>
                  </div>
                  <div className="flex items-end gap-1 h-10">
                    {t.bars.map((b, i) => (
                      <div key={i} className="flex-1 rounded-t-sm transition-all" style={{ height: `${Math.max(8, (b / maxBar) * 100)}%`, background: i === t.bars.length - 1 ? "linear-gradient(180deg, #B8A0C8, #88B8B0)" : "#B8A0C820" }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground/50 mt-1">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottleneck panel */}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4"><AlertTriangle className="w-4 h-4 text-[#C8A880]" /> Bottlenecks</h2>
              <div className="space-y-3">
                {bottlenecks.map((b, i) => (
                  <div key={i} className="p-3 rounded-xl border" style={{ borderColor: `${b.color}30`, background: `${b.color}08` }}>
                    <div className="text-xs font-bold text-foreground mb-1" style={{ color: b.color }}>{b.title}</div>
                    <p className="text-[11px] text-foreground/75 leading-relaxed mb-2">{b.body}</p>
                    <button
                      type="button"
                      onClick={() => b.action === "Go to To-Do" ? setTab("todo") : undefined}
                      className="text-[10px] font-semibold flex items-center gap-1"
                      style={{ color: b.color }}>
                      {b.action} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rep vs Team toggle */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><Users className="w-4 h-4 text-[#B8A0C8]" /> Rep vs Team Average</h2>
              <span className="text-[10px] text-muted-foreground">· {perfFilter}</span>
            </div>
            <div className="space-y-3">
              {[
                { metric: "Calls Made",      you: 23, team: 18 },
                { metric: "Connect Rate",    you: 61, team: 48, pct: true },
                { metric: "Win Rate",        you: 34, team: 29, pct: true },
                { metric: "Meetings Booked", you: 5,  team: 4  },
              ].map(r => {
                const youPct = Math.round((r.you / (Math.max(r.you, r.team) * 1.2)) * 100);
                const teamPct = Math.round((r.team / (Math.max(r.you, r.team) * 1.2)) * 100);
                return (
                  <div key={r.metric}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-foreground">{r.metric}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#B8A0C8] font-bold">You: {r.you}{r.pct ? "%" : ""}</span>
                        <span className="text-muted-foreground">Team: {r.team}{r.pct ? "%" : ""}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground w-8">You</span>
                        <div className="flex-1 h-2 rounded-full bg-muted/30">
                          <div className="h-2 rounded-full nf-chameleon-bg" style={{ width: `${youPct}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-muted-foreground w-8">Team</span>
                        <div className="flex-1 h-2 rounded-full bg-muted/30">
                          <div className="h-2 rounded-full bg-muted-foreground/40" style={{ width: `${teamPct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        );
      })()}

      {/* ──── TO-DO & ALERTS TAB ──── */}
      {/* User-built wireframe layout — Red flagged · Tasks (Name → Action by
       *  AI agent) · Lead insights, with the AI Action Taken commentary
       *  underneath. Restored after a regrettable detour where I had
       *  replaced it with a long bucket-by-priority list. */}
      {tab === "todo" && (
        <>
          <div id="todo" className="scroll-mt-32" />
          <TasksAlertsWireframeBlocks tasks={tasks} />
        </>
      )}

      {/* ──── INSIGHTS DASHBOARD TAB (spec §2.4) ──── */}
      {tab === "insights" && (() => {
        const visibleInsights = personaInsights
          .map((ins, idx) => ({ ins, idx }))
          .filter(({ idx }) => !insightSnoozed.has(idx));
        const actedCount = insightActed.size;
        // AI summary analysis across all insights — pulls 2-3 themes
        const tagCounts = visibleInsights.reduce<Record<string, number>>((m, { ins }) => {
          m[ins.tag] = (m[ins.tag] ?? 0) + 1;
          return m;
        }, {});
        const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
        const aiSummary = visibleInsights.length === 0
          ? "All caught up — no fresh insights to act on right now."
          : `${visibleInsights.length} active insight${visibleInsights.length === 1 ? "" : "s"}${actedCount > 0 ? `, ${actedCount} already actioned today` : ""}. Recurring themes: ${topTags.join(" · ")}. Focus first on the highest-impact card below.`;
        return (
        <div className="space-y-4">
          {/* AI summary header — refined */}
          <div className="rounded-2xl p-6 border relative overflow-hidden"
               style={{ background: "linear-gradient(135deg, #f9f3ff 0%, #f0f9f8 50%, #fff8f0 100%)", borderColor: "rgba(184,160,200,0.35)" }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-25" style={{ background: "radial-gradient(circle, #B8A0C8, transparent)" }} />
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-2xl opacity-20" style={{ background: "radial-gradient(circle, #88B8B0, transparent)" }} />
            </div>
            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8A0C8] mb-0.5">AI summary · today's insights</div>
                    <h2 className="text-xl font-black text-foreground">Daily Insights</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeeperAnalysis(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl nf-chameleon-bg text-white text-xs font-semibold hover:opacity-90 flex-shrink-0"
                    aria-expanded={showDeeperAnalysis}
                  >
                    <Sparkles className="w-3 h-3" />
                    {showDeeperAnalysis ? "Hide deeper analysis" : "Deeper analysis"}
                    <ChevronRight className={cn("w-3 h-3 transition-transform", showDeeperAnalysis ? "rotate-90" : "")} />
                  </button>
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed mt-2">{aiSummary}</p>
                {topTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {topTags.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-white/70 text-foreground/70 border border-white">{t}</span>
                    ))}
                    <span className="text-[10px] text-muted-foreground ml-1">· {visibleInsights.length} active · {actedCount} actioned</span>
                  </div>
                )}

                {/* Inline "deeper analysis" panel — opens in place, no nav. */}
                {showDeeperAnalysis && (
                  <div className="mt-4 p-4 rounded-xl bg-white/70 border border-[#B8A0C8]/30 space-y-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8A0C8] mb-1">Cross-insight pattern</div>
                      <p className="text-xs text-foreground/85 leading-relaxed">
                        {topTags.length === 0
                          ? "Not enough active insights to detect a pattern yet."
                          : `${topTags[0]} dominates today's signal (${tagCounts[topTags[0]] ?? 0} of ${visibleInsights.length} insights). When this theme clusters, the highest-leverage move is usually to address the root cause once instead of patching each card individually.`}
                      </p>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#88B8B0] mb-1">Recommended order of attack</div>
                      <ol className="text-xs text-foreground/80 leading-relaxed space-y-1 list-decimal pl-4">
                        {visibleInsights.slice(0, 3).map(({ ins }, i) => (
                          <li key={i}>
                            <span className="font-semibold">{ins.title}</span> — start here, expected impact within 24-48h.
                          </li>
                        ))}
                        {visibleInsights.length === 0 && (
                          <li>Nothing urgent — use the time to call back stalled prospects.</li>
                        )}
                      </ol>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#C8A880] mb-1">If you only have 15 minutes today</div>
                      <p className="text-xs text-foreground/85 leading-relaxed">
                        {visibleInsights.length > 0
                          ? `Pick the top insight ("${visibleInsights[0].ins.title}"), execute its primary action below, mark it actioned, and move on. Compounding small wins beats one perfect action.`
                          : "Use the time for outbound dialing in the 09:30-11:00 KSA window — highest pick-up rate of the day."}
                      </p>
                    </div>
                  </div>
                )}
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
                  {/* Action buttons — spec §2.4: Open Lead / Add to Today / Send WhatsApp / Schedule Call / Snooze */}
                  <div className="flex flex-wrap gap-2 mt-4 pl-14">
                    <button
                      type="button"
                      onClick={() => navigate("/contacts")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white border-transparent hover:opacity-90 shadow-sm transition-all"
                      style={{ background: ins.color }}
                    >
                      <ArrowRight className="w-3 h-3" />
                      Open Lead
                    </button>
                    <button
                      type="button"
                      onClick={() => { setInsightActed((s) => new Set([...s, idx])); }}
                      disabled={acted}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all",
                        acted
                          ? "bg-[#88B8B0]/15 text-[#88B8B0] border-[#88B8B0]/30 cursor-default"
                          : "border-border/30 text-foreground hover:bg-muted/40",
                      )}
                    >
                      {acted ? <CheckCircle2 className="w-3 h-3" /> : <CalendarPlus className="w-3 h-3" />}
                      {acted ? "Added to Today" : "Add to Today"}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/messages")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-border/30 text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Send WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/calendar")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-border/30 text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <Calendar className="w-3 h-3" />
                      Schedule Call
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

          {/* News & Market Signals — filter row */}
          {(() => {
            const NEWS_FILTERS = ["All", "KSA Market", "Vision 2030", "Competitor", "Regulation", "Tech"];
            const NEWS_ITEMS = [
              { tag: "KSA Market",   headline: "Saudi private equity inflows up 34% YoY — GCC wealth migration accelerating",        age: "2h ago", impact: "High",   color: "#88B8B0" },
              { tag: "Vision 2030",  headline: "NEOM Phase 2 procurement tenders released — SAR 4.2B facility management package",  age: "4h ago", impact: "High",   color: "#B8A0C8" },
              { tag: "Competitor",   headline: "Al-Rajhi Commercial expands Riyadh SME desk — new competitor footprint in target segment", age: "6h ago", impact: "Medium", color: "#C0A0B8" },
              { tag: "Regulation",   headline: "SAMA updates open banking API rules — fintech integrations require re-certification by Q3", age: "1d ago", impact: "Medium", color: "#C8A880" },
              { tag: "Tech",         headline: "GPT-4o voice API launches Arabic dialect support — CRM voice agents now viable",      age: "1d ago", impact: "Low",    color: "#B8B880" },
              { tag: "KSA Market",   headline: "Construction sector GDP contribution hits 11.2% — highest since 2018",              age: "2d ago", impact: "Low",    color: "#88B8B0" },
            ];
            const filtered = newsFilter === "All" ? NEWS_ITEMS : NEWS_ITEMS.filter(n => n.tag === newsFilter);
            return (
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Flame className="w-4 h-4 text-[#C8A880]" />
                  <h2 className="font-semibold text-foreground text-sm">News &amp; Market Signals</h2>
                  <div className="ml-auto flex flex-wrap gap-1.5">
                    {NEWS_FILTERS.map(f => (
                      <button key={f} onClick={() => setNewsFilter(f)}
                        className={cn("px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all", f === newsFilter ? "nf-chameleon-bg text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted/70")}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {filtered.map((n, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border" style={{ borderColor: `${n.color}20`, background: `${n.color}06` }}>
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground leading-snug">{n.headline}</div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span className="px-1.5 py-0.5 rounded-full font-semibold" style={{ background: `${n.color}20`, color: n.color }}>{n.tag}</span>
                          <span>{n.age}</span>
                          <span className={cn("px-1.5 py-0.5 rounded-full font-bold", n.impact === "High" ? "bg-red-100 text-red-600" : n.impact === "Medium" ? "bg-orange-100 text-orange-600" : "bg-muted/40 text-muted-foreground")}>
                            {n.impact} impact
                          </span>
                        </div>
                      </div>
                      <button type="button" className="text-[10px] font-semibold text-[#B8A0C8] flex items-center gap-0.5 flex-shrink-0 hover:underline">
                        Analyse <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
        );
      })()}

    </div>
  );
}

// ──────────────────────────────────────────────
// BottlenecksCoachingPanel — the user's "full analysis on bottlenecks
// where I need to develop coaching" centerpiece. Auto-derives bottlenecks
// from the rep's actual signal (silent prospects, overdue tasks, low
// connect rate, declining call scores) and shows full coaching analysis
// with one-tap actions per bottleneck.
//
// Each bottleneck card includes:
//   • Title + severity dot
//   • Root-cause analysis (1-2 sentences)
//   • Affected leads (clickable → /contacts/{id})
//   • Coaching tip (what to do differently)
//   • Action buttons (Re-engage, Open call, Coaching session, etc.)
// ──────────────────────────────────────────────
function BottlenecksCoachingPanel({
  tasks, forgotten, forgottenSummary, recentCalls, contactByName, navigate,
}: {
  tasks: PersonaTask[];
  forgotten: any[];
  forgottenSummary?: string;
  recentCalls: any[];
  contactByName: Map<string, string>;
  navigate: (to: string) => void;
}) {
  // Derive real-data bottlenecks from the rep's actual state. Only fall
  // back to demo content if the API genuinely returned nothing.
  const overdueTasks = tasks.filter(t => !t.done && (t.priority === "urgent" || t.priority === "high"));
  const silentLeads = (forgotten ?? []).slice(0, 4);

  // Connect rate from the rep's actual recent calls
  const completedCalls = recentCalls.filter(c => c.status === "completed").length;
  const connectedCalls = recentCalls.filter(c => c.status === "completed" && (c.duration_seconds ?? 0) > 30).length;
  const connectRate = completedCalls > 0 ? Math.round((connectedCalls / completedCalls) * 100) : 0;

  // Average call score (lower = coaching opportunity)
  const scoredCalls = recentCalls.filter(c => c.call_score != null);
  const avgScore = scoredCalls.length > 0
    ? Math.round(scoredCalls.reduce((acc, c) => acc + (c.call_score ?? 0), 0) / scoredCalls.length)
    : null;

  type Bottleneck = {
    id: string;
    severity: "high" | "medium" | "low";
    title: string;
    rootCause: string;
    coachingTip: string;
    affectedLeads?: { name: string; contactId: string | null }[];
    primaryAction: { label: string; icon: any; href: string; color: string };
    secondaryAction?: { label: string; href: string };
  };

  const bottlenecks: Bottleneck[] = [];

  if (silentLeads.length > 0) {
    bottlenecks.push({
      id: "silent",
      severity: "high",
      title: `${silentLeads.length} prospects silent 14+ days`,
      rootCause: forgottenSummary
        ?? "These leads were warm at first contact but received no follow-up touch within the SLA window. Pattern across cases: discovery call ran long, the rep skipped logging the next-step commitment, and the lead was never re-queued.",
      coachingTip: "After every discovery, log the agreed next step with a calendar trigger. WhatsApp re-engages 3x better than email at the 14-day mark in GCC — start there.",
      affectedLeads: silentLeads.map((l: any) => ({
        name: `${l.first_name ?? ""} ${l.last_name ?? ""}`.trim() || l.company_name || "Unknown",
        contactId: l.id ?? contactByName.get((`${l.first_name ?? ""} ${l.last_name ?? ""}`).trim().toLowerCase()) ?? null,
      })),
      primaryAction: { label: "Re-engage now", icon: MessageSquare, href: "/forgotten-leads", color: "#C8A880" },
      secondaryAction: { label: "View all", href: "/forgotten-leads" },
    });
  }

  if (overdueTasks.length >= 3) {
    const overdueWithContact = overdueTasks
      .filter(t => t.contact)
      .slice(0, 4)
      .map(t => ({
        name: t.contact!,
        contactId: contactByName.get(t.contact!.trim().toLowerCase()) ?? null,
      }));
    bottlenecks.push({
      id: "overdue",
      severity: "high",
      title: `${overdueTasks.length} high-priority follow-ups overdue`,
      rootCause: "Backlog is rising faster than throughput. Each 24h delay drops close probability by ~4% — at the current backlog you're losing roughly 12% of pipeline value to inaction.",
      coachingTip: "Block 90 minutes tomorrow morning for a focused execution sprint — batch-execute from the To-Do tab. Don't bounce between channels; finish all the WhatsApp messages first, then all the calls.",
      affectedLeads: overdueWithContact,
      primaryAction: { label: "Open To-Do queue", icon: ListTodo, href: "/home#todo", color: "#B8A0C8" },
    });
  }

  if (completedCalls >= 3 && connectRate < 50) {
    bottlenecks.push({
      id: "connect-rate",
      severity: "medium",
      title: `Connect rate is ${connectRate}% — below team average (61%)`,
      rootCause: `${connectedCalls} out of ${completedCalls} dialled calls were truly answered (>30s). The dial windows you're using are hitting voicemail walls — likely calling outside the GCC peak window.`,
      coachingTip: "Move 70% of dial volume to Tue–Thu, 09:30–11:00 Riyadh time. Pick-up rate jumps to ~68% in that window. AI Power Dialer can auto-queue this for you.",
      primaryAction: { label: "Open Power Dialer", icon: Phone, href: "/power-dialer", color: "#88B8B0" },
      secondaryAction: { label: "View call analytics", href: "/conversation-intelligence" },
    });
  }

  if (avgScore != null && avgScore < 65) {
    bottlenecks.push({
      id: "call-score",
      severity: "medium",
      title: `Average call score ${avgScore}/100 — coaching opportunity`,
      rootCause: "Scoring drops on the discovery → demo transition. Reps are pitching too early before fully qualifying budget, authority, and timeline.",
      coachingTip: "Spend the first 8 minutes purely on discovery. Use the BANT prompt deck. Listen back to your top 3 lowest-scored calls and tag the moment you started selling — that's where the score drops.",
      primaryAction: { label: "Start coaching session", icon: Brain, href: "/coaching", color: "#B8A0C8" },
      secondaryAction: { label: "Review call scores", href: "/conversation-intelligence" },
    });
  }

  // Always show the meeting → SAL conversion bottleneck (org-level coaching insight)
  bottlenecks.push({
    id: "sal-conversion",
    severity: "low",
    title: "Meeting → SAL2 conversion at 25% (team benchmark 31%)",
    rootCause: "Meetings are being booked too easily but qualifying weakly. The result is a polite 2nd meeting that never converts — wasted slot.",
    coachingTip: "Add a hard qualification gate before booking the demo: confirmed budget cycle + identified champion + explicit next step. If two are missing, route to nurture instead.",
    primaryAction: { label: "Open pipeline", icon: BarChart3, href: "/pipeline", color: "#90B8B8" },
  });

  const sevColor: Record<string, string> = { high: "#C8A880", medium: "#B8A0C8", low: "#90B8B8" };
  const sevLabel: Record<string, string> = { high: "High impact", medium: "Medium impact", low: "Low impact" };

  return (
    <div className="rounded-2xl border h-full" style={{ borderColor: "rgba(184,160,200,0.3)", background: "linear-gradient(135deg, #fffbf5 0%, #f9f3ff 100%)" }}>
      {/* Header */}
      <div className="p-5 border-b" style={{ borderColor: "rgba(184,160,200,0.15)" }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8A0C8] mb-0.5">AI Coaching · Full Bottleneck Analysis</div>
            <h2 className="text-lg font-black text-foreground leading-tight">Where you're losing pipeline today</h2>
            <p className="text-xs text-foreground/70 leading-relaxed mt-1">
              {bottlenecks.length} bottleneck{bottlenecks.length === 1 ? "" : "s"} detected from your actual data — pick one and I'll guide you through the fix.
            </p>
          </div>
        </div>
      </div>

      {/* Bottleneck cards */}
      <div className="p-5 space-y-3">
        {bottlenecks.map(b => {
          const PrimaryIcon = b.primaryAction.icon;
          return (
            <div key={b.id} className="rounded-xl bg-white/80 border p-4" style={{ borderColor: `${sevColor[b.severity]}30` }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: sevColor[b.severity] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-bold text-foreground leading-snug">{b.title}</h3>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                      style={{ background: `${sevColor[b.severity]}20`, color: sevColor[b.severity] }}>
                      {sevLabel[b.severity]}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/75 leading-relaxed">{b.rootCause}</p>
                </div>
              </div>

              {b.affectedLeads && b.affectedLeads.length > 0 && (
                <div className="ml-5 mt-2 mb-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">Affected:</span>
                  {b.affectedLeads.slice(0, 5).map((lead, i) =>
                    lead.contactId ? (
                      <Link key={i} href={`/contacts/${lead.contactId}`}>
                        <span className="text-[10px] font-bold text-[#B8A0C8] hover:underline cursor-pointer px-2 py-0.5 rounded-full bg-[#B8A0C8]/10">
                          {lead.name}
                        </span>
                      </Link>
                    ) : (
                      <span key={i} className="text-[10px] font-bold text-foreground/60 px-2 py-0.5 rounded-full bg-muted/30">
                        {lead.name}
                      </span>
                    )
                  )}
                </div>
              )}

              <div className="ml-5 p-2.5 rounded-lg bg-[#B8A0C8]/8 border-l-2 border-[#B8A0C8]/40 mb-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-3 h-3 text-[#B8A0C8] flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-foreground/80 leading-relaxed italic">{b.coachingTip}</p>
                </div>
              </div>

              <div className="ml-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate(b.primaryAction.href)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white shadow-sm hover:opacity-90 transition-all"
                  style={{ background: b.primaryAction.color }}
                >
                  <PrimaryIcon className="w-3 h-3" />
                  {b.primaryAction.label}
                </button>
                {b.secondaryAction && (
                  <button
                    type="button"
                    onClick={() => navigate(b.secondaryAction!.href)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-border/40 text-foreground hover:bg-muted/40 transition-colors"
                  >
                    {b.secondaryAction.label}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
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

// ──────────────────────────────────────────────
// MarketingHomeView — fully separate marketing journey for /home.
// No sales-style widgets (priority contacts, recent calls, forgotten
// leads, pipeline numbers). Only marketing-flavored content + the
// embedded marketing dashboard.
// ──────────────────────────────────────────────
// MarketingHomePage is the top-level marketing /home component. It
// owns the marketing-only state (briefing refresh, task checkboxes)
// and reads the persona profile + persona-specific tasks/agenda/
// insights. It does NOT call any sales hooks — keeping the marketing
// experience scoped at the data layer too, not just visually.
function MarketingHomePage() {
  const role = getRole();
  const persona = PERSONA_BRIEFINGS[role.key];
  const firstName = role.name.split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const tod = getTimeOfDay();
  const TODIcon = tod.icon;

  // AUTO_TASKS is the shared sales-rep default — its inferred priority
  // type is `string`, so cast to PersonaTask[] when this is the
  // fallback. Marketing's own persona.tasks list is already typed.
  const personaTasks    = (persona.tasks    ?? AUTO_TASKS) as PersonaTask[];
  const personaAgenda   = persona.agenda   ?? TODAY_AGENDA;
  const personaInsights = persona.insights ?? AI_INSIGHTS;

  const [tasks, setTasks] = useState<PersonaTask[]>(personaTasks);
  // If persona changes underneath us (avatar switch), reset tasks.
  useEffect(() => { setTasks(personaTasks); }, [role.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const [refreshingBriefing, setRefreshingBriefing] = useState(false);
  const [briefingRefreshedAt, setBriefingRefreshedAt] = useState<Date | null>(null);
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

  return (
    <MarketingHomeView
      role={role}
      persona={persona}
      firstName={firstName}
      today={today}
      tod={tod}
      TODIcon={TODIcon}
      tasks={tasks}
      toggleTask={toggleTask}
      personaAgenda={personaAgenda}
      personaInsights={personaInsights}
      refreshingBriefing={refreshingBriefing}
      briefingRefreshedAt={briefingRefreshedAt}
      handleRefreshBriefing={handleRefreshBriefing}
    />
  );
}

type MarketingHomeTab = "overview" | "pulse" | "cultural";

function MarketingHomeView({
  role, persona, firstName, today, tod, TODIcon,
  tasks, toggleTask, personaAgenda, personaInsights,
  refreshingBriefing, briefingRefreshedAt, handleRefreshBriefing,
}: {
  role: RoleProfile;
  persona: PersonaBriefing;
  firstName: string;
  today: string;
  tod: ReturnType<typeof getTimeOfDay>;
  TODIcon: LucideIcon;
  tasks: PersonaTask[];
  toggleTask: (id: string) => void;
  personaAgenda: PersonaAgendaItem[];
  personaInsights: PersonaInsight[];
  refreshingBriefing: boolean;
  briefingRefreshedAt: Date | null;
  handleRefreshBriefing: () => void;
}) {
  const [tab, setTab] = useState<MarketingHomeTab>("overview");
  const SUB_TABS: { key: MarketingHomeTab; label: string; icon: LucideIcon; hint: string }[] = [
    { key: "overview", label: "Overview",             icon: Sparkles,             hint: "Briefing · KPIs · today's plan" },
    { key: "pulse",    label: "Marketing Pulse",      icon: LayoutDashboardIcon,  hint: "Live campaign performance dashboard" },
    { key: "cultural", label: "Cultural Intelligence",icon: GlobeIcon,            hint: "GCC calendar, blackout dates, advisor" },
  ];
  return (
    <div className="space-y-5 max-w-7xl">
      {/* Hero — marketing-themed (warm Khaleeji palette) */}
      <div className="relative rounded-3xl overflow-hidden p-8"
        style={{ background: "linear-gradient(135deg, #fff8f0 0%, #fdf6e8 40%, #f8f4ff 80%, #fff8f0 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(circle, #C8A880, transparent)" }} />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #B8B880, transparent)" }} />
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
                <div className="text-sm font-semibold mt-0.5" style={{ color: "#C8A880" }}>{role.title} · Marketing Command Center</div>
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

          <div className="mt-4 p-5 rounded-2xl backdrop-blur-sm border" style={{ background: "rgba(255,255,255,0.6)", borderColor: "rgba(200,168,128,0.3)" }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm" style={{ background: "linear-gradient(135deg, #C8A880, #B8B880)" }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#C8A880" }}>
                  Your AI Marketing Briefing · for {role.label}
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  {/* Marketing's briefing function ignores totalPipeline (sales metric). */}
                  {persona.briefing("")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {persona.kpis.map(s => (
              <div key={s.label} className="rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.7)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-black text-foreground leading-none">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
                  <div className="text-[10px] text-muted-foreground/70">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-tab strip — keeps /home short by switching content panels */}
      <div className="flex items-center gap-0 border-b border-border/40 -mx-1 px-1 overflow-x-auto" role="tablist">
        {SUB_TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              title={t.hint}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap",
                active
                  ? "border-[#C8A880] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Three-column: Today's Marketing To-Do · Schedule · AI Marketing Insights */}
      {tab === "overview" && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's marketing to-do */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="w-4 h-4 text-[#C8A880]" />
            <h2 className="font-semibold text-foreground">Today's Marketing To-Do</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#C8A880]/20 text-[#C8A880] font-bold ml-auto">
              {tasks.filter(t => !t.done).length} open
            </span>
          </div>
          <div className="space-y-2">
            {tasks.map((t) => {
              const priorityColor =
                t.priority === "urgent" ? "#C0A0B8" :
                t.priority === "high"   ? "#C8A880" :
                t.priority === "normal" ? "#B8A0C8" : "#88B8B0";
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTask(t.id)}
                  className={cn(
                    "w-full flex items-start gap-2.5 text-left p-2.5 rounded-xl border transition-all",
                    t.done
                      ? "bg-muted/30 border-border/30 opacity-60"
                      : "bg-white/60 border-border/40 hover:border-border/60",
                  )}
                >
                  <div
                    className="mt-0.5 w-4 h-4 rounded-md border flex-shrink-0 flex items-center justify-center"
                    style={{ borderColor: priorityColor, background: t.done ? priorityColor : "transparent" }}
                  >
                    {t.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-xs font-medium leading-snug",
                      t.done ? "line-through text-muted-foreground" : "text-foreground",
                    )}>
                      {t.label}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span>{t.due}</span>
                      <span className="opacity-50">·</span>
                      <span>{t.source}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's marketing schedule */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-[#88B8B0]" />
            <h2 className="font-semibold text-foreground">Today's Schedule</h2>
          </div>
          <div className="space-y-2.5">
            {personaAgenda.map((item, i) => {
              const Channel = CHANNEL_ICON[item.channel] ?? Calendar;
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

        {/* AI marketing insights */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#B8A0C8]" />
            <h2 className="font-semibold text-foreground">AI Marketing Insights</h2>
          </div>
          <div className="space-y-3">
            {personaInsights.map((ins, i) => {
              const Icon = ins.icon;
              return (
                <div key={i} className="p-3 rounded-xl border bg-white/60" style={{ borderColor: `${ins.color}30` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3.5 h-3.5" style={{ color: ins.color }} />
                    <span className="text-xs font-bold text-foreground">{ins.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{ins.body}</p>
                  <div className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: `${ins.color}15`, color: ins.color }}>
                    {ins.tag}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* Marketing Pulse — full embedded dashboard */}
      {tab === "pulse" && (
        <div className="pt-2">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#C8A880]" />
              Marketing Pulse
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Live campaign performance · KPIs · winning + pain + how-to-win analysis · hot leads
            </p>
          </div>
          <MarketingDashboardPage />
        </div>
      )}

      {/* Cultural Intelligence — embedded GCC calendar + advisor */}
      {tab === "cultural" && (
        <div className="pt-2">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <GlobeIcon className="w-5 h-5 text-[#88B8B0]" />
              Cultural Intelligence
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              GCC holiday calendar, blackout windows, regional playbook, and AI cultural advisor
            </p>
          </div>
          <CulturalIntelligencePage />
        </div>
      )}
    </div>
  );
}
