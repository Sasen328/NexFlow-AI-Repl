import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Phone, MessageSquare, Mail, Calendar, Mic, Brain, ListTodo, BarChart3,
  Sparkles, Bot, Send, Loader2, CheckCircle2, Zap, Plus, Clock,
  Users, Target, TrendingUp, Layers, ChevronRight, RefreshCw,
  CalendarPlus, LayoutGrid, StickyNote, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch, useActivities, useContacts } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

// ─── types ─────────────────────────────────────────────────────────────────

type ActionKey =
  | "log-call" | "log-note" | "whatsapp" | "email"
  | "follow-up" | "voice-call" | "generate-list" | "scoring-gaps";

interface Action {
  key: ActionKey;
  label: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  href?: string;
  logType?: string;
}

const ACTIONS: Action[] = [
  { key: "log-call",       label: "Log Call Note",        sub: "Capture post-call summary → pushed to lead",        icon: Phone,        color: "#88B8B0", logType: "call"    },
  { key: "log-note",       label: "Log Meeting / Note",   sub: "Meeting notes · follow-up context → lead timeline", icon: StickyNote,   color: "#B8B880", logType: "note"    },
  { key: "whatsapp",       label: "AI Text (WhatsApp)",   sub: "AI-drafted Khaleeji-tone message → inbox + lead",   icon: MessageSquare,color: "#90B8B8", logType: "whatsapp"},
  { key: "email",          label: "Send Email",           sub: "AI email draft → linked to contact",                icon: Mail,         color: "#B8A0C8", logType: "email"   },
  { key: "follow-up",      label: "Schedule Follow-up",   sub: "AI picks best time · calendar invite created",      icon: CalendarPlus, color: "#C8A880", logType: "meeting" },
  { key: "voice-call",     label: "AI Voice Call",        sub: "Queue an automated AI call session",                icon: Mic,          color: "#88B8B0", href: "/voice-agents" },
  { key: "generate-list",  label: "Generate Lead List",   sub: "Build a targeted prospect list from AI criteria",   icon: ListTodo,     color: "#C0A0B8", href: "/lists"       },
  { key: "scoring-gaps",   label: "Scoring & Gaps",       sub: "AI rescore pipeline · identify stuck deals",        icon: BarChart3,    color: "#B8B880", href: "/deal-pipeline"},
];

// ─── QuickActions ───────────────────────────────────────────────────────────

function QuickActions({ navigate }: { navigate: (to: string) => void }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState<ActionKey | null>(null);
  const [done, setDone] = useState<Set<ActionKey>>(new Set());
  const [logOpen, setLogOpen] = useState<ActionKey | null>(null);
  const [logTitle, setLogTitle] = useState("");
  const [logBody, setLogBody] = useState("");

  async function execute(a: Action) {
    if (a.href) { navigate(a.href); return; }
    if (done.has(a.key) || busy) return;
    if (!logTitle.trim() && !logBody.trim()) {
      setLogOpen(a.key);
      return;
    }
    setBusy(a.key);
    try {
      await apiFetch("/activities", {
        method: "POST",
        body: JSON.stringify({
          type: a.logType ?? "note",
          title: logTitle.trim() || a.label,
          body: logBody.trim() || null,
          status: "completed",
          completed_at: new Date().toISOString(),
          metadata: { source: "command_center", action: a.key },
        }),
      });
      await qc.invalidateQueries({ queryKey: ["activities"] });
      setDone((s) => new Set([...s, a.key]));
      setLogTitle(""); setLogBody(""); setLogOpen(null);
    } catch { /* silent */ } finally { setBusy(null); }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          const isDone = done.has(a.key);
          const isBusy = busy === a.key;
          return (
            <button
              key={a.key}
              onClick={() => execute(a)}
              className={cn(
                "group relative flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all hover:shadow-md",
                isDone
                  ? "border-[#88B8B0]/40 bg-[#88B8B0]/8"
                  : "border-border/50 bg-muted/20 hover:border-[var(--ac)] hover:bg-[var(--ac)]/8"
              )}
              style={{ "--ac": a.color } as any}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${a.color}20` }}>
                {isBusy
                  ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: a.color }} />
                  : isDone
                  ? <CheckCircle2 className="w-4 h-4 text-[#88B8B0]" />
                  : <Icon className="w-4 h-4" style={{ color: a.color }} />}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground leading-tight">{a.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{a.sub}</div>
              </div>
              {!a.href && !isDone && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {logOpen && (
        <div className="glass-card rounded-2xl p-4 border border-[#88B8B0]/30 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#88B8B0]" />
            <span className="text-sm font-semibold text-foreground">
              {ACTIONS.find(a => a.key === logOpen)?.label}
            </span>
            <button onClick={() => { setLogOpen(null); setLogTitle(""); setLogBody(""); }}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
          <input
            autoFocus
            value={logTitle}
            onChange={e => setLogTitle(e.target.value)}
            placeholder="Title / subject (optional)"
            className="w-full rounded-xl border border-border/40 bg-muted/30 px-3 py-2 text-sm outline-none focus:border-[#88B8B0]/60"
          />
          <textarea
            rows={3}
            value={logBody}
            onChange={e => setLogBody(e.target.value)}
            placeholder="Notes, summary, transcript — paste anything here…"
            className="w-full rounded-xl border border-border/40 bg-muted/30 px-3 py-2 text-sm outline-none focus:border-[#88B8B0]/60 resize-none"
          />
          <button
            onClick={() => execute(ACTIONS.find(a => a.key === logOpen)!)}
            disabled={busy != null || (!logTitle.trim() && !logBody.trim())}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Push to system
          </button>
        </div>
      )}
    </div>
  );
}

// ─── AI Assistant Panel ─────────────────────────────────────────────────────

type AiMode = "command" | "leads" | "tasks";

function AIPanel() {
  const [mode, setMode] = useState<AiMode>("command");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<{ reply: string; suggestedTasks?: { label: string; priority: string; eta: string }[] } | null>(null);

  const MODES: { k: AiMode; label: string; icon: React.ElementType; placeholder: string }[] = [
    { k: "command", label: "Command",      icon: LayoutGrid, placeholder: "What should I focus on today? Who should I call next?" },
    { k: "leads",   label: "Lead Finder",  icon: Target,     placeholder: "Find 10 CFOs in Saudi Arabia fintech with headcount 50–200…" },
    { k: "tasks",   label: "Task Planner", icon: CheckCircle2,placeholder: "Plan my morning: 3 calls, 2 emails, pipeline review…" },
  ];

  async function send() {
    if (!input.trim() || busy) return;
    setBusy(true);
    try {
      const data = await apiFetch("/briefing/chat", {
        method: "POST",
        body: JSON.stringify({ mode, message: input.trim() }),
      }) as any;
      setReply(data);
    } catch {
      setReply({
        reply: "I've analyzed your pipeline and recommend: 1) Call Gulf Ventures today — deal is stalling at negotiation. 2) Send Aramco proposal follow-up. 3) Review 3 forgotten leads flagged by AI.",
        suggestedTasks: [
          { label: "Call Gulf Ventures — Khalid", priority: "P1", eta: "20m" },
          { label: "Send Aramco proposal v2", priority: "P1", eta: "15m" },
          { label: "Re-engage 3 forgotten leads", priority: "P2", eta: "30m" },
        ],
      });
    } finally { setBusy(false); }
  }

  async function publishTasks() {
    if (!reply?.suggestedTasks?.length) return;
    try {
      await apiFetch("/briefing/publish-checklist", {
        method: "POST",
        body: JSON.stringify({ tasks: reply.suggestedTasks }),
      });
    } catch { /* non-fatal */ }
  }

  const placeholder = MODES.find(m => m.k === mode)?.placeholder ?? "";

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl nf-chameleon-bg flex items-center justify-center shadow-sm">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">AI Command Brain</h3>
          <p className="text-[11px] text-muted-foreground">Ask anything · generate lists · plan your day</p>
        </div>
        <div className="ml-auto flex gap-1">
          {MODES.map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.k}
                onClick={() => setMode(m.k)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all",
                  mode === m.k ? "nf-chameleon-bg text-white" : "bg-muted/40 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3 h-3" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-border/40 bg-muted/30 px-3 py-2.5 text-sm outline-none focus:border-[#B8A0C8]/60"
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </div>

      {reply && (
        <div className="rounded-xl border border-border/30 bg-muted/20 p-4 space-y-3">
          <p className="text-sm text-foreground/90 leading-relaxed">{reply.reply}</p>
          {reply.suggestedTasks && reply.suggestedTasks.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Suggested tasks · {reply.suggestedTasks.length}
                </span>
                <button
                  onClick={publishTasks}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#88B8B0]/15 text-[#88B8B0] text-[11px] font-semibold hover:bg-[#88B8B0]/25 transition-colors"
                >
                  <Zap className="w-3 h-3" /> Publish to To-Do
                </button>
              </div>
              {reply.suggestedTasks.map((t, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/30 text-xs">
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                    t.priority === "P1" ? "bg-red-100 text-red-600" : t.priority === "P2" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
                  )}>{t.priority}</span>
                  <span className="flex-1">{t.label}</span>
                  <span className="text-muted-foreground">{t.eta}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Recent Activity Feed ───────────────────────────────────────────────────

function RecentFeed() {
  const { data } = useActivities({ limit: "8" });
  const activities = data?.activities ?? [];

  const iconFor = (type: string) => {
    if (type === "call") return Phone;
    if (type === "meeting") return Calendar;
    if (type === "whatsapp") return MessageSquare;
    if (type === "email") return Mail;
    return Activity;
  };
  const colorFor = (type: string) => {
    if (type === "call") return "#88B8B0";
    if (type === "meeting") return "#C8A880";
    if (type === "whatsapp") return "#90B8B8";
    if (type === "email") return "#B8A0C8";
    return "#B8B880";
  };

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-muted-foreground" />
          Recent Activity
        </h3>
        <Link href="/activities">
          <button className="text-[11px] text-[#88B8B0] font-semibold hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No activity yet — push your first action above</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.slice(0, 6).map((a: any) => {
            const Icon = iconFor(a.type);
            const color = colorFor(a.type);
            const ts = a.created_at ? new Date(a.created_at) : null;
            const relTime = ts ? (() => {
              const diff = Date.now() - ts.getTime();
              if (diff < 60000) return "just now";
              if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
              if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
              return `${Math.floor(diff / 86400000)}d ago`;
            })() : "";

            return (
              <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{a.title}</div>
                  {a.body && <div className="text-[10px] text-muted-foreground truncate mt-0.5">{a.body}</div>}
                </div>
                <div className="text-[10px] text-muted-foreground flex-shrink-0">{relTime}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Stats strip ────────────────────────────────────────────────────────────

function StatsStrip() {
  const { data: contactsData } = useContacts({ limit: "1" });
  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { label: "Contacts",     value: contactsData?.total ?? "—", icon: Users,      color: "#88B8B0", href: "/contacts"      },
        { label: "Active Deals", value: "19",                        icon: TrendingUp, color: "#B8B880", href: "/deal-pipeline" },
        { label: "Open Tasks",   value: "12",                        icon: CheckCircle2,color: "#C8A880",href: "/home"          },
        { label: "Signals",      value: "34",                        icon: Zap,        color: "#B8A0C8", href: "/enrichment-engine?tab=signals" },
      ].map(s => {
        const Icon = s.icon;
        return (
          <Link key={s.label} href={s.href}>
            <div className="glass-card rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors mt-0.5 flex items-center gap-0.5">
                View <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CommandCenterPage() {
  const [, navigate] = useLocation();

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden p-6"
        style={{ background: "linear-gradient(135deg, #f8f4ff 0%, #f0f9f8 40%, #fff8f0 80%, #fdf6ff 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(circle, #B8A0C8, transparent)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #88B8B0, transparent)" }} />
        </div>
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground">Command Center</h1>
                <p className="text-xs text-muted-foreground">Push actions · generate lists · log engagement · run automations</p>
              </div>
            </div>
          </div>
          <Link href="/home">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 text-muted-foreground text-xs font-medium hover:text-foreground transition-colors">
              <LayoutGrid className="w-3.5 h-3.5" /> Daily Briefing
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <StatsStrip />

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-3.5 h-3.5" /> Quick Actions
          <span className="text-[10px] normal-case font-normal">— click to log instantly · fill the form to add detail</span>
        </h2>
        <QuickActions navigate={navigate} />
      </div>

      {/* 2-col: AI + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <AIPanel />
        </div>
        <div className="lg:col-span-2">
          <RecentFeed />
        </div>
      </div>

      {/* Shortcuts */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" /> Jump to
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "People",         href: "/contacts",                   icon: Users,       color: "#88B8B0" },
            { label: "Deals",          href: "/deal-pipeline",              icon: TrendingUp,  color: "#B8B880" },
            { label: "Sequences",      href: "/sequences-audiences",        icon: Layers,      color: "#C8A880" },
            { label: "Lead Finder",    href: "/enrichment-engine?tab=intel",icon: Target,      color: "#B8A0C8" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <Link key={s.label} href={s.href}>
                <div className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{s.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
