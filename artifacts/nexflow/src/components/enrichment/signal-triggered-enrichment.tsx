/**
 * Signal-Triggered Enrichment
 * ============================
 * Buying signals automatically re-enrich affected CRM records.
 * Zero manual runs — the engine watches, matches, and updates.
 *
 * Layout:
 *   TOP    — KPI stats bar (live counters)
 *   LEFT   — Signal Rules (create / toggle / edit)
 *   RIGHT  — Live Signal Feed (scrolling stream + waterfall drill-down)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, Plus, ToggleLeft, ToggleRight, ChevronDown, ChevronRight,
  TrendingUp, UserPlus, Newspaper, Building2, Briefcase, Globe,
  Handshake, BarChart3, CheckCircle2, XCircle, Clock, Loader2,
  Settings, Trash2, Play, Bell, BellOff, ArrowRight, Sparkles,
  Database, Users, RefreshCw, Activity, Filter, Mail,
  AlertTriangle, Star, CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Brand colours ─────────────────────────────────────────────────────────────
const ACCENT = "#B8A0C8";
const TEAL   = "#88B8B0";
const GOLD   = "#C8A880";
const DARK   = "#0F1117";

// ── Signal type definitions ───────────────────────────────────────────────────
const SIGNAL_TYPES = [
  { id: "funding",     label: "Funding Round",         icon: TrendingUp,  color: "#10B981", desc: "New investment detected via Wamda / Crunchbase / news" },
  { id: "exec_hire",   label: "Executive Hire / Exit", icon: UserPlus,    color: "#6366F1", desc: "C-level or VP job change on LinkedIn" },
  { id: "news",        label: "News Mention",          icon: Newspaper,   color: "#F59E0B", desc: "Company appears in Reuters, Argaam, or PR Newswire" },
  { id: "cr_update",   label: "CR Registry Update",   icon: Building2,   color: TEAL,      desc: "Saudi MoCI / CCHI commercial registration change" },
  { id: "job_posting", label: "Job Postings Spike",    icon: Briefcase,   color: "#EC4899", desc: "3+ tech / sales roles posted = growth signal" },
  { id: "website",     label: "Website Change",        icon: Globe,       color: "#3B82F6", desc: "Major redesign or new product / pricing page" },
  { id: "partnership", label: "Partnership / Deal",    icon: Handshake,   color: GOLD,      desc: "Announcement of new contract or strategic alliance" },
  { id: "financials",  label: "Financial Filing",      icon: BarChart3,   color: "#EF4444", desc: "Annual report or Tadawul filing published" },
] as const;

type SignalTypeId = (typeof SIGNAL_TYPES)[number]["id"];

const ACTION_TARGETS = [
  { id: "company",      label: "Company record" },
  { id: "contacts",     label: "All contacts at company" },
  { id: "decision",     label: "Decision-makers only (C/VP/Dir)" },
  { id: "company_contacts", label: "Company + all contacts" },
];

const SOURCE_PACKS = [
  { id: "quick",    label: "Quick (3 sources, ~10s)" },
  { id: "standard", label: "Standard (8 sources, ~30s)" },
  { id: "deep",     label: "Deep (14 sources, ~90s)" },
];

// ── Sample data ───────────────────────────────────────────────────────────────
interface SignalRule {
  id:        string;
  name:      string;
  signalType: SignalTypeId;
  condition: string;
  target:    string;
  sourcePack: string;
  priority:  "high" | "medium" | "low";
  enabled:   boolean;
  triggered: number;
  lastFired?: string;
  notify:    boolean;
}

const SEED_RULES: SignalRule[] = [
  { id: "r1", name: "Funding → Full Re-enrich",       signalType: "funding",     condition: "Company in CRM",          target: "company_contacts", sourcePack: "deep",     priority: "high",   enabled: true,  triggered: 14, lastFired: "2h ago",   notify: true  },
  { id: "r2", name: "New C-Level → Exec Profile",     signalType: "exec_hire",   condition: "Company is active deal",  target: "decision",         sourcePack: "standard", priority: "high",   enabled: true,  triggered: 7,  lastFired: "5h ago",   notify: true  },
  { id: "r3", name: "CR Update → Registry Refresh",   signalType: "cr_update",   condition: "Company in CRM",          target: "company",          sourcePack: "quick",    priority: "medium", enabled: true,  triggered: 31, lastFired: "1d ago",   notify: false },
  { id: "r4", name: "Job Spike → Buying Intent",      signalType: "job_posting", condition: "ICP score ≥ 60",          target: "company",          sourcePack: "standard", priority: "medium", enabled: true,  triggered: 9,  lastFired: "3d ago",   notify: false },
  { id: "r5", name: "News Mention → Sales Alert",     signalType: "news",        condition: "Company in pipeline",     target: "company",          sourcePack: "quick",    priority: "low",    enabled: false, triggered: 3,  lastFired: "1w ago",   notify: true  },
  { id: "r6", name: "Financial Filing → Opportunity", signalType: "financials",  condition: "Industry = Finance/RE",   target: "company_contacts", sourcePack: "deep",     priority: "medium", enabled: false, triggered: 0,                         notify: false },
];

interface WaterfallSource {
  name:    string;
  filled:  string[];
  missed:  string[];
  time:    number;
  color:   string;
}

interface SignalEvent {
  id:         string;
  ts:         Date;
  type:       SignalTypeId;
  company:    string;
  city:       string;
  matched:    boolean;
  ruleId?:    string;
  ruleName?:  string;
  status:     "detected" | "matched" | "enriching" | "done" | "no_match";
  summary:    string;
  waterfall?: WaterfallSource[];
  fieldsAdded?: number;
}

const COMPANIES = [
  { name: "Saudi Aramco Digital",      city: "Dhahran"  },
  { name: "Acwa Power",                city: "Riyadh"   },
  { name: "stc Solutions",             city: "Riyadh"   },
  { name: "Aldar Properties",          city: "Abu Dhabi"},
  { name: "Tamkeen Capital",           city: "Riyadh"   },
  { name: "Majid Al Futtaim",          city: "Dubai"    },
  { name: "Mobily Enterprise",         city: "Riyadh"   },
  { name: "Al Rajhi Digital",          city: "Riyadh"   },
  { name: "NEOM Tech & Digital",       city: "Tabuk"    },
  { name: "Riyad Bank Commercial",     city: "Riyadh"   },
  { name: "Alfanar Group",             city: "Riyadh"   },
  { name: "Rawaj Holding",             city: "Jeddah"   },
];

const SIGNAL_SUMMARIES: Record<SignalTypeId, string[]> = {
  funding:     ["Series B — $40M raised", "Pre-IPO bridge round announced", "Strategic investment from PIF"],
  exec_hire:   ["New CTO joined from Microsoft", "Former Aramco VP now COO", "CMO appointment announced"],
  news:        ["Featured in Argaam as 'Company to Watch'", "Reuters: Major contract win", "Vision 2030 project milestone coverage"],
  cr_update:   ["CR renewed — activity updated to include fintech", "Branch added in Dammam", "Capital increase registered"],
  job_posting: ["6 Software Engineer roles posted this week", "4 Sales Manager openings", "Hiring rapidly — 11 new roles"],
  website:     ["New enterprise pricing page launched", "Product redesign — AI features highlighted", "Arabic-first website relaunch"],
  partnership: ["MoU signed with SABIC", "Joint venture with Saudi Telecom announced", "Strategic partnership with NEOM"],
  financials:  ["Q3 report shows 34% revenue growth", "Annual filing: net profit up 21%", "Tadawul disclosure: expansion budget"],
};

function makeWaterfall(): WaterfallSource[] {
  return [
    { name: "MoCI Registry",  filled: ["crNumber","legalForm","registeredCity"], missed: ["phone","email"],           time: 1.2, color: TEAL    },
    { name: "Web Scraper",    filled: ["website","phone","industry"],             missed: ["email","linkedinUrl"],      time: 2.1, color: "#3B82F6" },
    { name: "Perplexity",     filled: ["email","description","keyPeople"],        missed: ["funding","techStack"],      time: 4.7, color: "#8B5CF6" },
    { name: "Gemini Vision",  filled: ["funding","techStack","revenue"],          missed: [],                           time: 6.3, color: "#10B981" },
  ];
}

function randomEvent(rules: SignalRule[]): SignalEvent {
  const type    = SIGNAL_TYPES[Math.floor(Math.random() * SIGNAL_TYPES.length)].id;
  const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
  const summaries = SIGNAL_SUMMARIES[type];
  const summary = summaries[Math.floor(Math.random() * summaries.length)];
  const matchedRule = rules.find((r) => r.enabled && r.signalType === type);
  const matched = !!matchedRule;
  return {
    id:        Math.random().toString(36).slice(2),
    ts:        new Date(),
    type,
    company:   company.name,
    city:      company.city,
    matched,
    ruleId:    matchedRule?.id,
    ruleName:  matchedRule?.name,
    status:    matched ? "enriching" : "no_match",
    summary,
    waterfall: matched ? makeWaterfall() : undefined,
    fieldsAdded: matched ? Math.floor(Math.random() * 8) + 4 : 0,
  };
}

// ── Main component ────────────────────────────────────────────────────────────
export function SignalTriggeredEnrichment() {
  const [rules,      setRules]      = useState<SignalRule[]>(SEED_RULES);
  const [feed,       setFeed]       = useState<SignalEvent[]>([]);
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [liveMode,   setLiveMode]   = useState(true);
  const [filterType, setFilterType] = useState<SignalTypeId | "all">("all");
  const [editRule,   setEditRule]   = useState<SignalRule | null>(null);
  const [newRule,    setNewRule]    = useState<Partial<SignalRule>>({
    signalType: "funding", condition: "Company in CRM",
    target: "company_contacts", sourcePack: "standard",
    priority: "medium", enabled: true, notify: true,
  });
  const feedRef  = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Seed feed on mount
  useEffect(() => {
    const seed: SignalEvent[] = Array.from({ length: 8 }, () => {
      const ev = randomEvent(SEED_RULES);
      ev.ts = new Date(Date.now() - Math.random() * 3_600_000);
      ev.status = ev.matched ? "done" : "no_match";
      return ev;
    }).sort((a, b) => b.ts.getTime() - a.ts.getTime());
    setFeed(seed);
  }, []);

  // Live signal simulation
  useEffect(() => {
    if (!liveMode) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      const ev = randomEvent(rules);
      setFeed((prev) => [ev, ...prev.slice(0, 49)]);
      // Simulate enriching → done
      if (ev.matched) {
        setTimeout(() => {
          setFeed((prev) => prev.map((e) => e.id === ev.id ? { ...e, status: "done" } : e));
          // increment triggered on matching rule
          setRules((prev) => prev.map((r) => r.id === ev.ruleId
            ? { ...r, triggered: r.triggered + 1, lastFired: "just now" } : r));
        }, 4000);
      }
    }, 7000);
    return () => clearInterval(timerRef.current);
  }, [liveMode, rules]);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = 0;
  }, [feed.length]);

  const toggleRule = useCallback((id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }, []);

  const deleteRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  function saveNewRule() {
    if (!newRule.name?.trim()) return;
    const r: SignalRule = {
      id:         Math.random().toString(36).slice(2),
      name:       newRule.name!,
      signalType: newRule.signalType as SignalTypeId,
      condition:  newRule.condition || "Company in CRM",
      target:     newRule.target || "company_contacts",
      sourcePack: newRule.sourcePack || "standard",
      priority:   newRule.priority as SignalRule["priority"] || "medium",
      enabled:    true,
      triggered:  0,
      notify:     newRule.notify ?? false,
    };
    setRules((prev) => [r, ...prev]);
    setShowCreate(false);
    setNewRule({ signalType: "funding", condition: "Company in CRM", target: "company_contacts", sourcePack: "standard", priority: "medium", enabled: true, notify: true });
  }

  // Stats
  const totalTriggered = rules.reduce((s, r) => s + r.triggered, 0);
  const enabledRules   = rules.filter((r) => r.enabled).length;
  const doneCount      = feed.filter((e) => e.status === "done").length;
  const fieldsAdded    = feed.filter((e) => e.status === "done").reduce((s, e) => s + (e.fieldsAdded ?? 0), 0);

  const filteredFeed = filterType === "all" ? feed : feed.filter((e) => e.type === filterType);

  return (
    <div className="flex flex-col gap-5">

      {/* ── Stats bar ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Rules Active",      value: enabledRules,    total: rules.length, icon: Zap,        color: ACCENT,    suffix: `/ ${rules.length}` },
          { label: "Signals Triggered", value: totalTriggered,  icon: Activity,      color: TEAL,      suffix: " total" },
          { label: "Records Updated",   value: doneCount,        icon: Database,     color: "#22c55e", suffix: " this session" },
          { label: "Fields Added",      value: fieldsAdded,      icon: Sparkles,     color: GOLD,      suffix: " this session" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-border/20 bg-card/50 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}18` }}>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-[22px] font-bold leading-tight" style={{ color: s.color }}>
                  {s.value.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main two-column ──────────────────────────────────────────────────── */}
      <div className="flex gap-5">

        {/* LEFT — Signal Rules ──────────────────────────────────────────────── */}
        <div className="w-[340px] flex-shrink-0 flex flex-col gap-3">

          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-[14px]">Signal Rules</div>
              <div className="text-[11px] text-muted-foreground">{enabledRules} active · {rules.length} total</div>
            </div>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #7C3AED)` }}>
              <Plus className="w-3.5 h-3.5" /> New Rule
            </button>
          </div>

          {/* Create rule form */}
          {showCreate && (
            <div className="rounded-xl border border-border/30 bg-card/60 p-4 space-y-3"
              style={{ borderTop: `3px solid ${ACCENT}` }}>
              <div className="font-semibold text-[13px]">Create Signal Rule</div>

              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Rule Name</label>
                <input
                  value={newRule.name || ""}
                  onChange={(e) => setNewRule((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Funding → Deep Re-enrich"
                  className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-[12px]"
                />
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Signal Type</label>
                <select value={newRule.signalType} onChange={(e) => setNewRule((p) => ({ ...p, signalType: e.target.value as SignalTypeId }))}
                  className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-[12px]">
                  {SIGNAL_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Condition</label>
                <select value={newRule.condition} onChange={(e) => setNewRule((p) => ({ ...p, condition: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-[12px]">
                  {["Company in CRM","Company is active deal","ICP score ≥ 60","Industry = Finance","Industry = Real Estate","Company in pipeline"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-muted-foreground mb-1 block">Enrich Target</label>
                  <select value={newRule.target} onChange={(e) => setNewRule((p) => ({ ...p, target: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-[12px]">
                    {ACTION_TARGETS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground mb-1 block">Source Pack</label>
                  <select value={newRule.sourcePack} onChange={(e) => setNewRule((p) => ({ ...p, sourcePack: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-[12px]">
                    {SOURCE_PACKS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-[12px]">
                  <input type="checkbox" checked={!!newRule.notify}
                    onChange={(e) => setNewRule((p) => ({ ...p, notify: e.target.checked }))}
                    className="rounded" />
                  Notify on trigger
                </label>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={saveNewRule}
                  className="flex-1 py-2 rounded-lg text-[12px] font-semibold text-white"
                  style={{ background: ACCENT }}>
                  Save Rule
                </button>
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 rounded-lg text-[12px] border border-border/30 hover:bg-muted/40 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Rules list */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {rules.map((rule) => {
              const sigMeta = SIGNAL_TYPES.find((t) => t.id === rule.signalType)!;
              const SigIcon = sigMeta.icon;
              const priorityColor = rule.priority === "high" ? "#ef4444" : rule.priority === "medium" ? GOLD : "#6B7280";
              return (
                <div key={rule.id}
                  className={cn("rounded-xl border transition-all", rule.enabled ? "border-border/30 bg-card/50" : "border-border/15 bg-muted/10 opacity-60")}>
                  <div className="p-3 flex items-start gap-3">
                    {/* Signal icon */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${sigMeta.color}15` }}>
                      <SigIcon className="w-4 h-4" style={{ color: sigMeta.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[12px] truncate">{rule.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border/30 text-muted-foreground">
                          {sigMeta.label}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{ background: `${priorityColor}15`, color: priorityColor }}>
                          {rule.priority}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1.5">
                        {rule.condition} → {ACTION_TARGETS.find((t) => t.id === rule.target)?.label}
                      </div>
                      {rule.lastFired && (
                        <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                          Triggered {rule.triggered}× · last {rule.lastFired}
                        </div>
                      )}
                    </div>

                    {/* Toggle */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button onClick={() => toggleRule(rule.id)} className="transition-all">
                        {rule.enabled
                          ? <ToggleRight className="w-6 h-6" style={{ color: TEAL }} />
                          : <ToggleLeft className="w-6 h-6 text-muted-foreground/40" />}
                      </button>
                      <button onClick={() => deleteRule(rule.id)}
                        className="p-1 rounded-md hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-3 h-3 text-muted-foreground/40 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Live Signal Feed ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">

          {/* Feed toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <CircleDot className={cn("w-3.5 h-3.5", liveMode ? "text-red-500 animate-pulse" : "text-muted-foreground/40")} />
                <span className="text-[13px] font-semibold">
                  {liveMode ? "Live Signal Feed" : "Signal Feed (Paused)"}
                </span>
              </div>
              <button onClick={() => setLiveMode(!liveMode)}
                className={cn("text-[10px] px-2.5 py-1 rounded-full border transition-all",
                  liveMode ? "border-red-400/40 text-red-400" : "border-border/30 text-muted-foreground hover:border-border")}>
                {liveMode ? "Pause" : "Resume"}
              </button>
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-1 flex-wrap">
              <button onClick={() => setFilterType("all")}
                className={cn("px-2.5 py-1 rounded-full text-[10px] border transition-all",
                  filterType === "all" ? "text-white border-transparent" : "border-border/30 text-muted-foreground")}
                style={filterType === "all" ? { background: ACCENT } : undefined}>
                All
              </button>
              {SIGNAL_TYPES.slice(0, 5).map((t) => (
                <button key={t.id} onClick={() => setFilterType(filterType === t.id ? "all" : t.id)}
                  className={cn("px-2.5 py-1 rounded-full text-[10px] border transition-all",
                    filterType === t.id ? "text-white border-transparent" : "border-border/30 text-muted-foreground")}
                  style={filterType === t.id ? { background: t.color } : undefined}>
                  {t.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Feed */}
          <div ref={feedRef} className="flex-1 space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredFeed.length === 0 && (
              <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground/40">
                <Activity className="w-12 h-12" />
                <div className="text-[13px]">Waiting for signals…</div>
              </div>
            )}
            {filteredFeed.map((ev) => (
              <SignalCard
                key={ev.id}
                event={ev}
                expanded={expanded === ev.id}
                onToggle={() => setExpanded(expanded === ev.id ? null : ev.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Signal Card ───────────────────────────────────────────────────────────────
function SignalCard({ event: ev, expanded, onToggle }: {
  event:    SignalEvent;
  expanded: boolean;
  onToggle: () => void;
}) {
  const sigMeta = SIGNAL_TYPES.find((t) => t.id === ev.type)!;
  const SigIcon = sigMeta.icon;

  const statusCfg = {
    detected:  { label: "Detected",  color: "#6B7280",  pulse: false },
    matched:   { label: "Matched",   color: GOLD,        pulse: true  },
    enriching: { label: "Enriching", color: TEAL,        pulse: true  },
    done:      { label: "Updated",   color: "#22c55e",  pulse: false },
    no_match:  { label: "No Rule",   color: "#6B7280",  pulse: false },
  }[ev.status];

  const relativeTime = (() => {
    const diff = Date.now() - ev.ts.getTime();
    if (diff < 10000)   return "just now";
    if (diff < 60000)   return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  })();

  return (
    <div className={cn("rounded-xl border transition-all overflow-hidden",
      ev.matched ? "border-border/30 bg-card/50" : "border-border/15 bg-muted/5 opacity-70")}>

      {/* Header row */}
      <div className="px-4 py-3 flex items-center gap-3 cursor-pointer" onClick={onToggle}>
        {/* Signal type icon */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${sigMeta.color}15` }}>
          <SigIcon className="w-4 h-4" style={{ color: sigMeta.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[13px] truncate">{ev.company}</span>
            <span className="text-[10px] text-muted-foreground">{ev.city}</span>
          </div>
          <div className="text-[11px] text-muted-foreground truncate mt-0.5">{ev.summary}</div>
          {ev.ruleName && (
            <div className="text-[10px] mt-0.5" style={{ color: ACCENT }}>
              → {ev.ruleName}
            </div>
          )}
        </div>

        {/* Status + time */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5">
            {ev.status === "enriching" && <Loader2 className="w-3 h-3 animate-spin" style={{ color: TEAL }} />}
            {ev.status === "done"      && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${statusCfg.color}15`, color: statusCfg.color }}>
              {statusCfg.label}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground/60">{relativeTime}</div>
          {ev.status === "done" && ev.fieldsAdded && (
            <div className="text-[10px] font-semibold" style={{ color: "#22c55e" }}>
              +{ev.fieldsAdded} fields
            </div>
          )}
        </div>

        {ev.waterfall && (
          <div className="flex-shrink-0 ml-1">
            {expanded
              ? <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
              : <ChevronRight className="w-4 h-4 text-muted-foreground/40" />}
          </div>
        )}
      </div>

      {/* Waterfall drill-down */}
      {expanded && ev.waterfall && (
        <div className="border-t border-border/20 px-4 py-4 space-y-3"
          style={{ background: `${DARK}60` }}>
          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Enrichment Waterfall
          </div>

          {/* Source pipeline */}
          <div className="flex items-start gap-2 overflow-x-auto pb-2">
            {ev.waterfall.map((src, idx) => (
              <div key={src.name} className="flex items-start gap-2 flex-shrink-0">
                {/* Source block */}
                <div className="rounded-xl border border-border/20 bg-card/60 p-3 w-[160px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold" style={{ color: src.color }}>{src.name}</span>
                    <span className="text-[10px] text-muted-foreground">{src.time}s</span>
                  </div>
                  {src.filled.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {src.filled.map((f) => (
                        <span key={f} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium text-white"
                          style={{ background: src.color }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                  {src.missed.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {src.missed.map((f) => (
                        <span key={f} className="text-[9px] px-1.5 py-0.5 rounded-full border border-border/30 text-muted-foreground/50">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Arrow between sources */}
                {idx < ev.waterfall!.length - 1 && (
                  <div className="mt-4 flex-shrink-0">
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary row */}
          <div className="flex items-center gap-4 pt-1 border-t border-border/10 text-[11px]">
            <span className="text-muted-foreground">
              Total time: <strong className="text-foreground">{(ev.waterfall.reduce((s, w) => s + w.time, 0)).toFixed(1)}s</strong>
            </span>
            <span className="text-muted-foreground">
              Fields filled: <strong style={{ color: "#22c55e" }}>{ev.waterfall.reduce((s, w) => s + w.filled.length, 0)}</strong>
            </span>
            <span className="text-muted-foreground">
              Gaps remaining: <strong style={{ color: GOLD }}>{ev.waterfall.reduce((s, w) => s + w.missed.length, 0)}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
