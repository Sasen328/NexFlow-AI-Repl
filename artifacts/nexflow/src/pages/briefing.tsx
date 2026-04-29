import { Link } from "wouter";
import {
  Sparkles, Sun, AlertTriangle, TrendingUp, Phone, Mail, MessageSquare,
  Calendar, Zap, ArrowRight, Coffee, Brain, Target, Users, RefreshCw, ChevronRight,
  Clock, Loader2, CheckSquare, CheckCircle2, Circle, ListTodo, BarChart3,
  Bot, BellRing, TrendingDown, Star, Flame,
} from "lucide-react";
import { useDashboard, useContacts, useForgottenLeads, useRegenerateInsights } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  { icon: BarChart3, color: "#B8B880", title: "Team velocity is up 18% WoW", body: "Call volume, email opens, and WhatsApp reply rates are all trending up this week. Keep momentum — you're on track to hit 112% of monthly pipeline target.", tag: "Performance" },
];

const PRIORITY_COLOR: Record<string, string> = { urgent: "#C8A880", high: "#B8A0C8", normal: "#88B8B0", low: "#90B8B8" };
const PRIORITY_BG: Record<string, string> = { urgent: "#C8A88020", high: "#B8A0C820", normal: "#88B8B020", low: "#90B8B820" };

type Tab = "overview" | "tasks" | "insights" | "assistant";

export default function CommandCenterPage() {
  const { data: dash } = useDashboard();
  const { data: contactsData } = useContacts({ limit: "100" });
  const { data: forgottenData } = useForgottenLeads();
  const regenerate = useRegenerateInsights();
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
  const stats = dash?.stats ?? {};
  const totalPipeline = ((stats.totalRevenue ?? 0) / 100).toLocaleString();

  const [tab, setTab] = useState<Tab>("overview");
  const [tasks, setTasks] = useState(AUTO_TASKS);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    { role: "ai", text: "Good morning! I've analyzed your pipeline, signals, and overnight AI agent activity. You have 3 urgent actions today. How can I help you prioritize?" },
  ]);

  function toggleTask(id: string) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function sendAiMessage() {
    if (!aiInput.trim()) return;
    const userMsg = { role: "user", text: aiInput };
    setAiMessages(m => [...m, userMsg]);
    setAiInput("");
    setTimeout(() => {
      setAiMessages(m => [...m, {
        role: "ai",
        text: `Great question. Based on your current pipeline data and today's signals, here's what I recommend: focus on Sara Al-Mansouri first (funding signal + high score), then tackle the 2 overdue follow-ups before noon. This sequence optimizes your probability of 3 conversions today. Want me to draft the outreach messages?`
      }]);
    }, 900);
  }

  const TABS = [
    { k: "overview" as Tab, label: "Overview", icon: BarChart3 },
    { k: "tasks" as Tab, label: "Tasks", icon: ListTodo, badge: tasks.filter(t => !t.done && t.priority === "urgent").length },
    { k: "insights" as Tab, label: "Insights", icon: Sparkles },
    { k: "assistant" as Tab, label: "AI Assistant", icon: Bot },
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
                <h1 className="text-3xl font-black text-foreground leading-tight">{tod.greeting}, Admin</h1>
                <div className="text-sm font-semibold mt-0.5 nf-chameleon-text">Daily Command Center</div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 border border-white/80 text-xs text-muted-foreground hover:text-foreground shadow-sm backdrop-blur-sm">
              <RefreshCw className="w-3 h-3" />
              Refresh briefing
            </button>
          </div>

          <div className="mt-4 p-5 rounded-2xl backdrop-blur-sm border" style={{ background: "rgba(255,255,255,0.6)", borderColor: "rgba(184,160,200,0.3)" }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-[#B8A0C8] uppercase tracking-wider mb-1">Your AI Daily Briefing</div>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  You have <span className="font-bold text-foreground">3 high-intent prospects</span> ready for outreach today, combined pipeline{" "}
                  <span className="font-bold text-[#88B8B0]">${totalPipeline}</span>. Most urgent:{" "}
                  <span className="font-bold text-foreground">Sara Al-Mansouri</span> — Gulf Ventures closed a $50M Series B.{" "}
                  <span className="font-bold text-destructive">2 deals at risk</span> need attention.
                  AI Voice Agent handled <span className="font-bold text-foreground">12 conversations</span> overnight — 4 qualified leads added.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { label: "Calls Today", value: "5", sub: "3 confirmed", color: "#88B8B0", icon: Phone },
              { label: "Hot Signals", value: HOT_SIGNALS.length, sub: "Last 24h", color: "#B8B880", icon: Zap },
              { label: "AI Sessions", value: "12", sub: "4 qualified", color: "#B8A0C8", icon: Brain },
              { label: "At-Risk Deals", value: AT_RISK.length, sub: "$240K exposure", color: "#C0A0B8", icon: AlertTriangle },
            ].map(s => (
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

      {/* ──── OVERVIEW TAB ──── */}
      {tab === "overview" && (
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
                  {forgotten.slice(0, 6).map((l: any, i: number) => {
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
                {HOT_SIGNALS.map((s, i) => (
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

      {/* ──── TASKS TAB ──── */}
      {tab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">AI-Generated Tasks</h2>
              <p className="text-sm text-muted-foreground">Auto-generated from pipeline activity, signals, and commitments</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{tasks.filter(t => t.done).length}</span>/{tasks.length} complete
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
            <div className="h-full nf-chameleon-bg transition-all" style={{ width: `${tasks.filter(t => t.done).length / tasks.length * 100}%` }} />
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
      )}

      {/* ──── INSIGHTS TAB ──── */}
      {tab === "insights" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">AI Insights · Today</h2>
            <p className="text-sm text-muted-foreground">Auto-generated from pipeline, calls, signals, and team activity</p>
          </div>
          <div className="space-y-3">
            {AI_INSIGHTS.map((insight, i) => {
              const Icon = insight.icon;
              return (
                <div key={i} className="glass-card rounded-2xl p-5 flex items-start gap-4"
                  style={{ borderLeft: `4px solid ${insight.color}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${insight.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: insight.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-foreground">{insight.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${insight.color}20`, color: insight.color }}>{insight.tag}</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{insight.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="glass-card rounded-2xl p-5 text-center">
            <button className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90">
              <Sparkles className="w-4 h-4" />
              Generate deeper analysis
            </button>
            <p className="text-xs text-muted-foreground mt-2">AI will analyze the last 30 days of pipeline and call data</p>
          </div>
        </div>
      )}

      {/* ──── AI ASSISTANT TAB ──── */}
      {tab === "assistant" && (
        <div className="flex flex-col h-[600px]">
          <div className="glass-card rounded-2xl flex flex-col h-full">
            <div className="p-4 border-b border-border/20 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl nf-chameleon-bg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">NexFlow AI Assistant</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#88B8B0] inline-block" />
                  Online · Analyzing your pipeline
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiMessages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                  {msg.role === "ai" && (
                    <div className="w-7 h-7 rounded-full nf-chameleon-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user" ? "nf-chameleon-bg text-white rounded-br-sm" : "bg-muted/40 text-foreground rounded-bl-sm")}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border/20">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/40 text-sm outline-none text-foreground focus:border-[#B8A0C8]"
                  placeholder="Ask about your pipeline, leads, next actions…"
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendAiMessage()}
                />
                <button onClick={sendAiMessage} disabled={!aiInput.trim()}
                  className="px-4 py-2.5 rounded-xl nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90">
                  Send
                </button>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {["Who should I call first today?", "Which deals are at risk?", "Draft follow-up for Sara"].map(s => (
                  <button key={s} onClick={() => { setAiInput(s); }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
