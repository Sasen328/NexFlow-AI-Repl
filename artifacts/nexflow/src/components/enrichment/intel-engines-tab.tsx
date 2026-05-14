/**
 * Intel Engines — ProspectSA-style design
 *
 * Five engines, each with:
 *   • Agent-pipeline progress visualization (numbered cards, live status)
 *   • Simulated live log feed during the async API wait
 *   • Full structured report matching ProspectSA schema
 *
 * Engines:
 *   1. Masaar        — Saudi CR lookup (5-agent pipeline)
 *   2. Person Intel  — ProsEngine person dossier (20 sources)
 *   3. Company Intel — ProsEngine company dossier (11 sources)
 *   4. AI Database  — Masar Company Database builder
 *   5. AI Database   — Masar company database builder
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  BadgeCheck, Users, Building2, Target, Database,
  Loader2, Play, Save, History, ChevronRight, ExternalLink,
  Mail, Phone, Linkedin, MapPin, AlertTriangle, FileText,
  Globe, Star, Eye, X, Zap, CheckCircle2, Circle,
  XCircle, Clock, Sparkles, Shield, BookOpen, BarChart3,
  TrendingUp, Award, Briefcase, GraduationCap, DollarSign,
  ChevronDown, ChevronUp, Copy, Check, Info, UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type EngineKind = "masaar" | "person_intel" | "company_intel" | "ai_database";

type AgentStatus = "waiting" | "running" | "done" | "error" | "skipped";

interface AgentDef {
  num: number;
  name: string;
  desc: string;
  durationHint: number; // rough seconds this agent typically takes
  logs: string[];       // sample log lines to simulate
}

interface RunAgent { status: AgentStatus; startedAt?: number; doneAt?: number; logLines: string[] }

// ─────────────────────────────────────────────────────────────────────────────
// Engine metadata
// ─────────────────────────────────────────────────────────────────────────────

const ENGINE_META: Record<EngineKind, {
  label: string; icon: typeof BadgeCheck;
  color: string; bg: string; border: string;
  badge: string; tagline: string;
}> = {
  masaar:       { label: "Masaar",       icon: BadgeCheck,  color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/10", border: "border-[#88B8B0]/30", badge: "🇸🇦 Saudi Gov", tagline: "5-agent Saudi CR intelligence pipeline" },
  person_intel: { label: "Person Intel", icon: Users,        color: "text-[#B8A0C8]", bg: "bg-[#B8A0C8]/10", border: "border-[#B8A0C8]/30", badge: "20 sources", tagline: "Deep executive dossier with approach strategy" },
  company_intel:{ label: "Company Intel",icon: Building2,    color: "text-[#C8A880]", bg: "bg-[#C8A880]/10", border: "border-[#C8A880]/30", badge: "11 sources", tagline: "Full Saudi company intelligence report" },
  ai_database:  { label: "AI Database",  icon: Database,     color: "text-[#7aab9a]", bg: "bg-[#7aab9a]/10", border: "border-[#7aab9a]/30", badge: "Masar", tagline: "Saudi B2B company database builder" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Agent definitions (simulated progress during the sync API wait)
// ─────────────────────────────────────────────────────────────────────────────

const MASAAR_AGENTS: AgentDef[] = [
  { num: 1, name: "MC.gov.sa Registry", desc: "Stealth browser · CAPTCHA solve · CR parse",
    durationHint: 8, logs: ["Launching stealth browser (Saudi locale)…", "Navigating mc.gov.sa/ar/eservices…", "CAPTCHA detected — sending to Claude Vision…", "CAPTCHA solved (confidence: high)", "Submitting CR number…", "Parsing registry fields (Claude Sonnet)…", "✓ nameAr, legalForm, capital, shareholders extracted"] },
  { num: 2, name: "Amaaly AOA Intelligence", desc: "Stealth-scrape AOA PDFs · Claude translate",
    durationHint: 12, logs: ["Searching emagazine.aamaly.sa…", "Traversing 6 result pages…", "Scoring AOA documents by name match + recency…", "Downloading top-scored AOA PDF…", "Extracting text (pdf-parse)…", "Claude translating Arabic → English…", "✓ shareholders, capital distribution, governance extracted"] },
  { num: 3, name: "Deep Research Intelligence", desc: "12 engines in parallel (Perplexity ×5, Gemini ×4, Claude, GPT-4o)",
    durationHint: 18, logs: ["Firing 12 research engines simultaneously…", "[P1] Querying Perplexity: company overview…", "[P2] Querying Perplexity: ownership & shareholders…", "[P3] Querying Perplexity: leadership (CEO/board)…", "[P4] Querying Perplexity: market & financials…", "[P5] Querying Perplexity: legal flags…", "[GA] Gemini grounded: full profile…", "[GB] Gemini grounded: ownership & AOA…", "[GC] Gemini grounded: leadership…", "[GD] Gemini grounded: 2023-2025 news…", "[Claude] Training knowledge base…", "[GPT-4o] Financial intelligence…", "✓ All 12 engines returned results — aggregating…"] },
  { num: 4, name: "Compliance & Sanctions", desc: "OFAC · UN SC · EU · CMA · SAMA · ZATCA · Maroof · Najiz",
    durationHint: 8, logs: ["Checking OFAC SDN list (US Treasury)…", "Checking UN Security Council consolidated list…", "Checking EU sanctions (sanctionsmap.eu)…", "Querying CMA violations (Perplexity)…", "Querying SAMA banking penalties…", "Querying ZATCA tax violations…", "Verifying Maroof.sa business status…", "Checking Najiz court records…", "✓ Risk assessment complete: overallRisk determined"] },
  { num: 5, name: "Bilingual Report Compiler", desc: "Claude (primary) → GPT-4o (fallback) · EN + AR",
    durationHint: 8, logs: ["Compiling 11-section bilingual report…", "Claude Sonnet: synthesizing English report (8,192 tokens)…", "Translating to Arabic (فصحى)…", "Formatting: Overview · Registration · Capital · Shareholders · Management · AOA · Research · Compliance · Market · Contact · Summary…", "✓ Full bilingual report compiled"] },
];

const PERSON_AGENTS: AgentDef[] = [
  { num: 1, name: "Perplexity × 9 — Web Research", desc: "Career · Company · Education · Wealth · Boards · Compensation · Personal · News · LinkedIn URL",
    durationHint: 25, logs: ["[P1] Firing: full career history…", "[P2] Firing: company intelligence…", "[P3] Firing: education background…", "[P4] Firing: wealth & investments…", "[P5] Firing: board memberships…", "[P6] Firing: compensation benchmarks…", "[P7] Firing: personal profile…", "[P8] Firing: news 2024-2025…", "[P9] Firing: LinkedIn URL discovery…", "✓ 9 Perplexity agents returned"] },
  { num: 2, name: "Gemini Google Search × 4", desc: "Career · LinkedIn & Social · Company News · Full Dossier",
    durationHint: 20, logs: ["[GA] Career & professional history (grounded search)…", "[GB] LinkedIn & social media discovery…", "[GC] Company context + news 2023-2025…", "[GD] Comprehensive deep dossier…", "✓ 4 Gemini agents completed"] },
  { num: 3, name: "LinkedIn + Website Crawl", desc: "Crawl4AI on LinkedIn URL · Web Seeder on company site",
    durationHint: 15, logs: ["Crawling LinkedIn profile via Crawl4AI…", "Launching Web Seeder on company website…", "Crawling team page, about, news (up to 8 pages)…", "Claude agent per page extraction…", "✓ Website crawl: 6 pages analyzed"] },
  { num: 4, name: "Claude + GPT-4o Knowledge Base", desc: "Training data cross-reference + gap fill",
    durationHint: 10, logs: ["Claude Sonnet: extracting from training knowledge…", "GPT-4o: cross-reference and gap fill…", "✓ Knowledge base agents complete"] },
  { num: 5, name: "AI Synthesis", desc: "Gemini → Claude → GPT-4o waterfall · JSON extraction",
    durationHint: 15, logs: ["Compiling all 20 agent outputs…", "Synthesis pass 1: Gemini Flash (preferred)…", "Synthesis pass 2: Claude (fallback)…", "Extracting structured JSON…", "Injecting sources, confidence scoring…", "✓ Person intelligence report ready"] },
];

const COMPANY_AGENTS: AgentDef[] = [
  { num: 1, name: "Web Seeder — Website Crawl", desc: "8 pages · Saudi UA · Claude per-page agent",
    durationHint: 20, logs: ["Crawling company website (up to 8 pages)…", "Link discovery on first 5 pages…", "Claude Haiku agent per page (1,024 tok)…", "Aggregation agent (3,000 tok)…", "✓ Website crawl complete"] },
  { num: 2, name: "Gemini Google Search × 4", desc: "Full profile · Ownership · Executives · Market intel",
    durationHint: 18, logs: ["[GA] Full profile (website, phone, CR, employees, revenue)…", "[GB] Ownership & shareholders…", "[GC] Leadership & executives…", "[GD] Market intelligence (2023-2025)…", "✓ 4 Gemini threads completed"] },
  { num: 3, name: "Perplexity Web Search × 4", desc: "Profile · Financials · Ownership · Leadership",
    durationHint: 15, logs: ["[P1] General profile & contact data…", "[P2] Financial intelligence (revenue, capital)…", "[P3] Ownership & AOA…", "[P4] Leadership: full names AR+EN…", "✓ 4 Perplexity threads completed"] },
  { num: 4, name: "Claude + GPT-4o Analysis", desc: "Comprehensive analysis + financial validation",
    durationHint: 10, logs: ["Claude Sonnet: comprehensive corporate analysis…", "GPT-4o: ownership %, revenue, key clients validation…", "✓ Knowledge agents complete"] },
  { num: 5, name: "Synthesis + Report", desc: "Claude (primary) · Gemini (secondary) · GPT-4o (fallback)",
    durationHint: 15, logs: ["Aggregating 11 source outputs…", "Claude Sonnet synthesis (primary, 4,000 tok)…", "Structuring: profile, financials, ownership, leadership, market, approach…", "✓ Company intelligence report ready"] },
];

// ─────────────────────────────────────────────────────────────────────────────
// Simulated live-log progress hook
// ─────────────────────────────────────────────────────────────────────────────

function useAgentProgress(agents: AgentDef[], busy: boolean) {
  const [agentStates, setAgentStates] = useState<RunAgent[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setAgentStates(agents.map(() => ({ status: "waiting" as AgentStatus, logLines: [] })));
    setLogs([]);
  }, [agents]);

  useEffect(() => { reset(); }, [reset]);

  useEffect(() => {
    if (!busy) { if (timerRef.current) clearTimeout(timerRef.current); return; }
    reset();

    let agentIdx = 0;
    let logIdx = 0;
    const allTimers: ReturnType<typeof setTimeout>[] = [];

    // Advance through agents sequentially
    let cumulativeDelay = 0;
    agents.forEach((agent, idx) => {
      const startDelay = cumulativeDelay;
      const endDelay = cumulativeDelay + agent.durationHint * 1000;
      cumulativeDelay = endDelay;

      allTimers.push(setTimeout(() => {
        setAgentStates((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], status: "running", startedAt: Date.now(), logLines: [] };
          return next;
        });

        // Stream logs for this agent
        agent.logs.forEach((line, li) => {
          const logDelay = (agent.durationHint * 1000 / (agent.logs.length + 1)) * (li + 1);
          const t = setTimeout(() => {
            setAgentStates((prev) => {
              const next = [...prev];
              next[idx] = { ...next[idx], logLines: [...next[idx].logLines, line] };
              return next;
            });
            setLogs((prev) => [`[Agent ${agent.num}] ${line}`, ...prev].slice(0, 80));
          }, logDelay);
          allTimers.push(t);
        });
      }, startDelay));

      allTimers.push(setTimeout(() => {
        setAgentStates((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], status: "done", doneAt: Date.now() };
          return next;
        });
      }, endDelay - 200));
    });

    return () => allTimers.forEach(clearTimeout);
  }, [busy, agents, reset]);

  return { agentStates, logs, reset };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function IntelEnginesTab() {
  const [active, setActive] = useState<EngineKind | "history">("masaar");

  return (
    <div className="space-y-5">
      {/* Engine picker */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(ENGINE_META) as EngineKind[]).map((k) => {
          const m = ENGINE_META[k];
          const Icon = m.icon;
          const isActive = active === k;
          return (
            <button key={k} onClick={() => setActive(k)}
              className={cn(
                "group relative text-left rounded-xl border p-4 transition-all duration-200",
                m.bg, m.border,
                isActive ? "ring-2 ring-offset-1 shadow-lg scale-[1.02]" : "hover:scale-[1.01] hover:shadow-md shadow-sm",
                isActive ? m.border.replace("border-", "ring-") : "",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", m.bg)}>
                  <Icon className={cn("w-4 h-4", m.color)} />
                </div>
                <span className={cn(
                  "text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border",
                  isActive ? cn(m.bg, m.border, m.color) : "bg-background/60 text-muted-foreground border-border",
                )}>
                  {m.badge}
                </span>
              </div>
              <div className={cn("mt-2.5 font-bold text-sm", m.color)}>{m.label}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{m.tagline}</div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button onClick={() => setActive("history")}
          className={cn("text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-colors",
            active === "history" ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted text-muted-foreground"
          )}
        >
          <History className="w-3.5 h-3.5" /> Run history
        </button>
      </div>

      {active === "masaar"        && <MasaarPanel />}
      {active === "person_intel"  && <PersonIntelPanel />}
      {active === "company_intel" && <CompanyIntelPanel />}
      {active === "ai_database"   && <AIDatabasePanel />}
      {active === "history"       && <HistoryPanel />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared layout shell
// ─────────────────────────────────────────────────────────────────────────────

function EngineShell({ engine, form, result }: {
  engine: EngineKind;
  form: React.ReactNode;
  result: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 items-start">
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <EngineFormHeader engine={engine} />
        <div className="p-5 space-y-4">{form}</div>
      </div>
      <div className="min-h-[500px]">{result}</div>
    </div>
  );
}

function EngineFormHeader({ engine }: { engine: EngineKind }) {
  const m = ENGINE_META[engine];
  const Icon = m.icon;
  return (
    <div className={cn("px-5 py-4 border-b border-border flex items-center gap-3", m.bg)}>
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", m.bg, "border", m.border)}>
        <Icon className={cn("w-5 h-5", m.color)} />
      </div>
      <div>
        <div className={cn("font-bold text-sm", m.color)}>{m.label}</div>
        <div className="text-[10px] text-muted-foreground">{m.tagline}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Form primitives
// ─────────────────────────────────────────────────────────────────────────────

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-rose-500 normal-case">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/70 leading-relaxed">{hint}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={cn(
      "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background",
      "focus:outline-none focus:ring-2 focus:ring-[#88B8B0]/30 focus:border-[#88B8B0]",
      "placeholder:text-muted-foreground/50 transition-colors",
      props.className,
    )} />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={cn(
      "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background resize-y min-h-[72px]",
      "focus:outline-none focus:ring-2 focus:ring-[#88B8B0]/30 focus:border-[#88B8B0]",
      "placeholder:text-muted-foreground/50 transition-colors",
      props.className,
    )} />
  );
}

function RunButton({ onClick, busy, label = "Run engine" }: { onClick: () => void; busy: boolean; label?: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!busy) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [busy]);

  return (
    <button onClick={onClick} disabled={busy}
      className={cn(
        "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all",
        "bg-foreground text-background hover:opacity-90 disabled:opacity-50",
        busy && "cursor-not-allowed",
      )}
    >
      {busy
        ? <><Loader2 className="w-4 h-4 animate-spin" /> Running… {elapsed > 0 ? `${elapsed}s` : ""}</>
        : <><Play className="w-4 h-4" /> {label}</>}
    </button>
  );
}

function SectionNote({ children, kind = "info" }: { children: React.ReactNode; kind?: "info" | "warn" }) {
  return (
    <div className={cn(
      "text-[10px] leading-relaxed p-2.5 rounded-lg border flex items-start gap-1.5",
      kind === "warn" ? "bg-amber-500/8 border-amber-500/30 text-amber-800 dark:text-amber-300" : "bg-muted/60 border-border text-muted-foreground",
    )}>
      <Info className="w-3 h-3 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent pipeline progress visualization
// ─────────────────────────────────────────────────────────────────────────────

function AgentPipeline({ agents, states, logs, color }: {
  agents: AgentDef[];
  states: RunAgent[];
  logs: string[];
  color: string;
}) {
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [logs]);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Pipeline — live agent view</span>
      </div>
      <div className="p-4 space-y-2">
        {agents.map((agent, idx) => {
          const state = states[idx] ?? { status: "waiting", logLines: [] };
          return (
            <AgentCard key={agent.num} agent={agent} state={state} color={color} />
          );
        })}
      </div>
      {/* Live log terminal */}
      <div className="border-t border-border bg-[#0f1117] rounded-b-2xl">
        <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-[10px] font-mono text-white/40">live log</span>
        </div>
        <div ref={logRef} className="h-32 overflow-y-auto p-3 font-mono text-[10px] space-y-0.5 flex flex-col-reverse">
          {logs.length === 0
            ? <span className="text-white/20">Waiting for engine to start…</span>
            : logs.map((line, i) => (
              <div key={i} className={cn(
                "leading-relaxed",
                line.includes("✓") ? "text-emerald-400" : line.includes("✗") || line.includes("error") ? "text-rose-400" : "text-white/60",
              )}>
                {line}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function AgentCard({ agent, state, color }: { agent: AgentDef; state: RunAgent; color: string }) {
  return (
    <div className={cn(
      "rounded-xl border p-3 transition-all duration-300",
      state.status === "running" ? "border-current/30 bg-current/5 shadow-sm" : "border-border bg-background/50",
    )}
      style={{ borderColor: state.status === "running" ? undefined : undefined }}>
      <div className="flex items-start gap-3">
        {/* Agent number + status icon */}
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold transition-all duration-300",
          state.status === "waiting" ? "bg-muted text-muted-foreground" :
          state.status === "running" ? cn("text-white", color.replace("text-", "bg-")) :
          state.status === "done"    ? "bg-emerald-500 text-white" :
          state.status === "error"   ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground",
        )}>
          {state.status === "running" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
           state.status === "done"    ? <CheckCircle2 className="w-3.5 h-3.5" /> :
           state.status === "error"   ? <XCircle className="w-3.5 h-3.5" /> :
           agent.num}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className={cn("text-xs font-semibold truncate", state.status === "running" ? color : "text-foreground/80")}>
              Agent {agent.num} — {agent.name}
            </div>
            <AgentStatusBadge status={state.status} />
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{agent.desc}</div>
          {state.status === "running" && state.logLines.length > 0 && (
            <div className="mt-1.5 text-[9px] text-muted-foreground/80 font-mono truncate">
              {state.logLines[state.logLines.length - 1]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentStatusBadge({ status }: { status: AgentStatus }) {
  const map = {
    waiting: { label: "Waiting", cls: "bg-muted text-muted-foreground" },
    running: { label: "Running", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400 animate-pulse" },
    done:    { label: "Done",    cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
    error:   { label: "Failed",  cls: "bg-rose-500/15 text-rose-700 dark:text-rose-400" },
    skipped: { label: "Skipped", cls: "bg-muted text-muted-foreground" },
  };
  const s = map[status];
  return <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full", s.cls)}>{s.label}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Error + Empty states
// ─────────────────────────────────────────────────────────────────────────────

function EngineEmpty({ engine }: { engine: EngineKind }) {
  const m = ENGINE_META[engine];
  const Icon = m.icon;
  return (
    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-border bg-muted/10">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4", m.bg)}>
        <Icon className={cn("w-7 h-7", m.color)} />
      </div>
      <div className="font-semibold text-foreground/70">{m.label} ready</div>
      <div className="text-xs text-muted-foreground mt-1 max-w-[220px] leading-relaxed">
        Fill in the form and run the engine. Results appear here.
      </div>
    </div>
  );
}

function EngineError({ msg }: { msg: string }) {
  return (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/5 p-5 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
      <div>
        <div className="font-semibold text-sm text-rose-700 dark:text-rose-400">Engine run failed</div>
        <div className="text-xs text-foreground/80 mt-1.5 whitespace-pre-wrap leading-relaxed">{msg}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MASAAR PANEL
// ─────────────────────────────────────────────────────────────────────────────

export function MasaarPanel() {
  const [crNumber, setCrNumber] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [reportLang, setReportLang] = useState<"en" | "ar">("en");
  const { agentStates, logs, reset } = useAgentProgress(MASAAR_AGENTS, busy);

  async function run() {
    if (!crNumber.trim() && !nameEn.trim() && !nameAr.trim()) return;
    setErr(null); setResult(null); setBusy(true);
    try {
      const data = await apiFetch("/engines/masaar/run", {
        method: "POST",
        body: JSON.stringify({
          crNumber: crNumber.trim() || undefined,
          nameEn: nameEn.trim() || undefined,
          nameAr: nameAr.trim() || undefined,
        }),
      });
      setResult(data);
    } catch (e: any) {
      setErr(e?.message ?? "Run failed");
    } finally { setBusy(false); }
  }

  return (
    <EngineShell engine="masaar" form={
      <>
        <Field label="CR Number" hint="10-digit Saudi commercial registration. Optional if providing a name.">
          <Input value={crNumber} onChange={(e) => setCrNumber(e.target.value)} placeholder="1010123456" />
        </Field>
        <Field label="Company Name (English)">
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Saudi Telecom Company" />
        </Field>
        <Field label="Company Name (Arabic)">
          <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="شركة الاتصالات السعودية" dir="rtl" />
        </Field>
        <RunButton busy={busy} onClick={run} label="Run Masaar Pipeline" />
        <SectionNote kind="warn">
          Stealth browser on mc.gov.sa requires residential-IP infra. We use Perplexity + Gemini grounded search + best-effort emagazine.aamaly.sa scraping to gather equivalent intel.
        </SectionNote>
      </>
    } result={
      busy ? (
        <AgentPipeline agents={MASAAR_AGENTS} states={agentStates} logs={logs} color="text-[#88B8B0]" />
      ) : err ? <EngineError msg={err} /> :
        !result ? <EngineEmpty engine="masaar" /> :
        <MasaarReport result={result} lang={reportLang} setLang={setReportLang} />
    } />
  );
}

function MasaarReport({ result, lang, setLang }: { result: any; lang: "en" | "ar"; setLang: (l: "en" | "ar") => void }) {
  const r = result.report ?? {};
  const p = r.parsed ?? r.profile ?? r;

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="rounded-2xl border border-[#88B8B0]/40 bg-gradient-to-br from-[#88B8B0]/8 to-transparent p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BadgeCheck className="w-5 h-5 text-[#88B8B0]" />
              <span className="text-xs font-semibold text-[#88B8B0] uppercase tracking-wider">Masaar Report</span>
            </div>
            <div className="font-bold text-xl">{p.nameEn || p.nameAr || "Saudi Company"}</div>
            {p.nameAr && <div className="text-base text-muted-foreground mt-0.5" dir="rtl">{p.nameAr}</div>}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {p.crNumber && <span className="font-mono bg-muted px-2 py-0.5 rounded">CR {p.crNumber}</span>}
              {p.legalForm && <span>{p.legalForm}</span>}
              {(p.headquarterCity || p.city) && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.headquarterCity || p.city}</span>}
              {p.registrationStatus && <StatusChip status={p.registrationStatus} />}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-muted-foreground">{Math.round(result.durationMs / 1000)}s · {result.sourcesUsed?.length ?? 0} sources</div>
            <div className="mt-2 flex flex-wrap gap-1 justify-end">
              {(result.sourcesUsed ?? []).slice(0, 4).map((s: string) => (
                <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#88B8B0]/15 text-[#88B8B0]">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile icon={DollarSign} label="Paid-up Capital" value={p.capitalAmount || p.paidUpCapital} />
        <KpiTile icon={Clock} label="Founded" value={p.foundingYear} />
        <KpiTile icon={Building2} label="Legal Form" value={p.legalFormAr || p.legalForm} />
        <KpiTile icon={TrendingUp} label="Est. Revenue" value={p.estimatedRevenue || p.revenueEstimate} />
      </div>

      {/* Conflicts */}
      {(r.conflicts?.length > 0) && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
          <div className="text-sm font-semibold flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" /> {r.conflicts.length} source conflicts detected
          </div>
          <ul className="text-xs space-y-1.5">
            {r.conflicts.slice(0, 5).map((c: any, i: number) => (
              <li key={i} className="flex items-baseline gap-2">
                <span className="font-mono text-amber-700 dark:text-amber-400 shrink-0">{c.field}</span>
                <span className="text-muted-foreground">{c.source1}: <span className="text-foreground">{c.value1}</span> vs {c.source2}: <span className="text-foreground">{c.value2}</span></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Shareholders */}
      {(p.shareholders?.length > 0) && (
        <CollapseSection title={`Shareholders (${p.shareholders.length})`} icon={Users} defaultOpen>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-2 pr-4">Name (English)</th>
                <th className="text-left py-2 pr-4">الاسم</th>
                <th className="text-right py-2 pr-4">Share %</th>
                <th className="text-left py-2">Nationality</th>
              </tr></thead>
              <tbody>
                {p.shareholders.map((s: any, i: number) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-4 font-medium">{s.nameEn || "—"}</td>
                    <td className="py-2 pr-4 text-muted-foreground" dir="rtl">{s.nameAr || "—"}</td>
                    <td className="py-2 pr-4 text-right font-mono font-semibold">{s.ownershipPct || "—"}</td>
                    <td className="py-2 text-muted-foreground">{s.nationality || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapseSection>
      )}

      {/* Management */}
      {(p.managers?.length > 0 || p.management?.length > 0) && (
        <CollapseSection title={`Leadership (${(p.managers || p.management)?.length})`} icon={Briefcase} defaultOpen>
          <ul className="space-y-2">
            {(p.managers || p.management || []).map((m: any, i: number) => (
              <li key={i} className="flex items-baseline justify-between gap-4 text-sm">
                <div>
                  <span className="font-medium">{m.nameEn || "—"}</span>
                  {m.nameAr && <span dir="rtl" className="text-muted-foreground text-xs ml-2">· {m.nameAr}</span>}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{m.title || m.role || ""}</span>
              </li>
            ))}
          </ul>
        </CollapseSection>
      )}

      {/* Full intelligence report — parsed markdown */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm"><FileText className="w-4 h-4" /> Full Intelligence Report</div>
          <LangToggle lang={lang} setLang={setLang} />
        </div>
        <div className="p-6" dir={lang === "ar" ? "rtl" : "ltr"}>
          <MasaarMarkdown
            text={lang === "en"
              ? (r.reportEn || r.report_en || "Report not available.")
              : (r.reportAr || r.report_ar || "التقرير غير متاح.")}
            dir={lang === "ar" ? "rtl" : "ltr"}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <PushCompanyToCrm parsed={p} runTitle={result.title} />
        <SaveBar runId={result.id} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSON INTEL PANEL
// ─────────────────────────────────────────────────────────────────────────────

function PersonIntelPanel() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [country, setCountry] = useState("Saudi Arabia");
  const [knownFacts, setKnownFacts] = useState("");
  const [sellerCompany, setSellerCompany] = useState("");
  const [sellerProduct, setSellerProduct] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const { agentStates, logs } = useAgentProgress(PERSON_AGENTS, busy);

  async function run() {
    if (!name.trim()) return;
    setErr(null); setResult(null); setBusy(true);
    try {
      const data = await apiFetch("/engines/person-intel/run", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim() || undefined,
          title: title.trim() || undefined,
          linkedinUrl: linkedinUrl.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          country: country.trim() || undefined,
          knownFacts: knownFacts.trim() || undefined,
          sellerContext: (sellerCompany || sellerProduct) ? {
            companyName: sellerCompany.trim() || undefined,
            product: sellerProduct.trim() || undefined,
          } : undefined,
        }),
      });
      setResult(data);
    } catch (e: any) {
      setErr(e?.message ?? "Run failed");
    } finally { setBusy(false); }
  }

  return (
    <EngineShell engine="person_intel" form={
      <>
        <Field label="Person's Full Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Khalid Al-Saud" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company"><Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Saudi Aramco" /></Field>
          <Field label="Job Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VP Sales" /></Field>
        </div>
        <Field label="LinkedIn URL" hint="If known — crawled directly via Crawl4AI">
          <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/…" />
        </Field>
        <Field label="Company Website" hint="Used to scan team page (up to 8 pages)">
          <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://aramco.com" />
        </Field>
        <Field label="Country">
          <Input value={country} onChange={(e) => setCountry(e.target.value)} />
        </Field>
        <Field label="Known Facts" hint="Anything you already know — saves research time">
          <Textarea value={knownFacts} onChange={(e) => setKnownFacts(e.target.value)} placeholder="e.g. Spoke at LEAP 2025. Wharton MBA. Previously at McKinsey." />
        </Field>
        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your context — tailored outreach angle</div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={sellerCompany} onChange={(e) => setSellerCompany(e.target.value)} placeholder="Your company" className="text-xs" />
            <Input value={sellerProduct} onChange={(e) => setSellerProduct(e.target.value)} placeholder="What you sell" className="text-xs" />
          </div>
        </div>
        <RunButton busy={busy} onClick={run} label="Run Person Intel (20 sources)" />
      </>
    } result={
      busy ? <AgentPipeline agents={PERSON_AGENTS} states={agentStates} logs={logs} color="text-[#B8A0C8]" /> :
      err ? <EngineError msg={err} /> :
      !result ? <EngineEmpty engine="person_intel" /> :
      <PersonReport result={result} />
    } />
  );
}

function hasContent(v: any): boolean {
  if (!v) return false;
  if (typeof v === "string") return v !== "" && v !== "Not found";
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function mergeApproach(real: any, fallback: Record<string, any>): Record<string, any> {
  const merged: Record<string, any> = { ...fallback };
  if (!real) return merged;
  for (const k of Object.keys(fallback)) {
    if (hasContent(real[k])) merged[k] = real[k];
  }
  return merged;
}

function PersonReport({ result }: { result: any }) {
  const r = result.report ?? {};
  const p = r.profile ?? {};
  const notes = r.intelligence_notes ?? {};

  const hasCareer = (r.career?.length ?? 0) > 0;
  const hasEducation = (r.education?.length ?? 0) > 0;
  const hasWealth = Object.values(r.wealth_profile ?? {}).some((v: any) => hasContent(v));
  const hasPersonal = Object.values(r.personal_profile ?? {}).some((v: any) => hasContent(v));
  const isLimitedProfile = !hasCareer && !hasEducation && !hasWealth && !hasPersonal;

  const rawApproach = r.approach_strategy ?? {};
  const hasRealApproach = Object.values(rawApproach).some((v: any) => hasContent(v));
  const fallbackApproach = buildSaudiBizApproach(p.fullName ?? "", p.title ?? "", p.company ?? "");
  const approach = hasRealApproach ? mergeApproach(rawApproach, fallbackApproach) : fallbackApproach;
  const approachIsGenerated = !hasRealApproach;

  return (
    <div className="space-y-4">
      {/* Person hero card */}
      <div className="rounded-2xl border border-[#B8A0C8]/40 bg-gradient-to-br from-[#B8A0C8]/8 to-transparent p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#B8A0C8]/20 flex items-center justify-center shrink-0 text-[#B8A0C8] font-bold text-xl">
            {(p.fullName || "?")[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="font-bold text-xl leading-tight">{p.fullName || "—"}</div>
                {p.arabicName && p.arabicName !== "Not found" && (
                  <div className="text-base text-muted-foreground" dir="rtl">{p.arabicName}</div>
                )}
                <div className="text-sm text-muted-foreground mt-0.5">
                  {p.title}{p.company && <> · <span className="font-medium text-foreground/80">{p.company}</span></>}
                </div>
              </div>
              <div className="text-right">
                <ConfidenceBadge level={notes.confidence_level ?? "Low"} />
                <div className="text-[10px] text-muted-foreground mt-1">
                  {Math.round(result.durationMs / 1000)}s · {result.sourcesUsed?.length ?? 0} sources
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {p.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</span>}
              {p.nationality && p.nationality !== "Not found" && <span>{p.nationality}</span>}
              {p.age && <span>{p.age} yrs</span>}
              {p.linkedin && p.linkedin !== "Not found" && (
                <a href={p.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#0a66c2] hover:underline">
                  <Linkedin className="w-3 h-3" /> LinkedIn
                </a>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {(result.sourcesUsed ?? []).slice(0, 6).map((s: string) => (
                <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#B8A0C8]/15 text-[#B8A0C8]">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLimitedProfile && (
        <LimitedProfileBanner name={p.fullName || "this person"} sources={result.sourcesUsed?.length ?? 0} />
      )}

      {/* ── Approach Strategy — ALWAYS FIRST ── */}
      <div className="rounded-2xl border border-[#B8A0C8]/50 bg-gradient-to-br from-[#B8A0C8]/8 to-transparent overflow-hidden">
        <div className="px-5 py-3 border-b border-[#B8A0C8]/30 bg-[#B8A0C8]/10 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#B8A0C8]" />
          <span className="font-semibold text-sm text-[#B8A0C8]">Approach Strategy</span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            {approachIsGenerated ? "Saudi B2B context · review before use" : "AI-generated · review before use"}
          </span>
          {approachIsGenerated && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
              Generated
            </span>
          )}
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <KpiTile label="Best channel" value={approach.best_channel} />
            <KpiTile label="Best timing" value={approach.best_timing} />
            <KpiTile label="Opening angle" value={approach.opening_angle} />
          </div>
          {hasContent(approach.value_proposition) && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Value proposition</div>
              <p className="text-sm">{approach.value_proposition}</p>
            </div>
          )}
          {hasContent(approach.conversation_starters) && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Conversation starters</div>
              <ul className="space-y-1">
                {(approach.conversation_starters as string[]).map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8A0C8]/60 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasContent(approach.cultural_notes) && (
            <div className="text-xs italic text-muted-foreground p-3 bg-muted/50 rounded-xl border border-border">
              🕌 {approach.cultural_notes}
            </div>
          )}
          {hasContent(approach.recommended_approach) && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Recommended approach</div>
              <p className="text-sm leading-relaxed whitespace-pre-line">{approach.recommended_approach}</p>
            </div>
          )}
          {hasContent(approach.potential_objections) && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Potential objections</div>
              <div className="flex flex-wrap gap-1.5">
                {(approach.potential_objections as string[]).map((o: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400">{o}</span>
                ))}
              </div>
            </div>
          )}
          {hasContent(approach.sample_message) && (
            <div className="rounded-xl bg-background border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ready-to-send first message</div>
                <CopyButton text={approach.sample_message as string} />
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line">{approach.sample_message}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail sections — only if at least one has real data ── */}
      {!isLimitedProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hasCareer && (
            <ReportSection title="Career History" icon={Briefcase}>
              <ul className="space-y-3">
                {r.career.slice(0, 6).map((c: any, i: number) => (
                  <li key={i} className="relative pl-4 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#B8A0C8]/60">
                    <div className="text-sm font-semibold">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.company} · {c.period}</div>
                    {c.description && <div className="text-xs mt-0.5 text-foreground/70">{c.description}</div>}
                  </li>
                ))}
              </ul>
            </ReportSection>
          )}
          {hasEducation && (
            <ReportSection title="Education" icon={GraduationCap}>
              <ul className="space-y-2">
                {r.education.map((e: any, i: number) => (
                  <li key={i} className="text-sm">
                    <div className="font-semibold">{e.degree}</div>
                    <div className="text-xs text-muted-foreground">{e.institution} · {e.year}</div>
                  </li>
                ))}
              </ul>
            </ReportSection>
          )}
          {hasWealth && (
            <ReportSection title="Wealth Profile" icon={DollarSign}>
              <KvList data={{
                "Est. net worth": r.wealth_profile?.estimated_net_worth,
                "Income estimate": r.wealth_profile?.income_estimate,
                "Wealth sources": (r.wealth_profile?.wealth_sources ?? []).join(", "),
                "Assets": r.wealth_profile?.assets,
                "Investments": r.wealth_profile?.investments,
                "Lifestyle": r.wealth_profile?.lifestyle_indicators,
              }} />
            </ReportSection>
          )}
          {hasPersonal && (
            <ReportSection title="Personal Profile" icon={Users}>
              <KvList data={{
                "Languages": (r.personal_profile?.languages ?? []).join(", "),
                "Interests": (r.personal_profile?.interests ?? []).join(", "),
                "Board roles": (r.personal_profile?.board_memberships ?? []).join(", "),
                "Style": r.personal_profile?.communication_style,
                "Awards": (r.personal_profile?.awards ?? []).join(", "),
                "Social": r.personal_profile?.social_presence,
              }} />
            </ReportSection>
          )}
        </div>
      )}

      {/* Company analysis */}
      {r.company_analysis && (
        <CollapseSection title="Company Context" icon={Building2}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <KpiTile label="Industry" value={r.company_analysis.industry} />
            <KpiTile label="Employees" value={r.company_analysis.employees} />
            <KpiTile label="Revenue" value={r.company_analysis.revenue_estimate} />
            <KpiTile label="Headquarters" value={r.company_analysis.headquarters} />
            <KpiTile label="Founded" value={r.company_analysis.founded} />
            <KpiTile label="Market position" value={r.company_analysis.market_position} />
          </div>
          {r.company_analysis.recent_developments && (
            <p className="mt-3 text-xs text-muted-foreground">{r.company_analysis.recent_developments}</p>
          )}
        </CollapseSection>
      )}

      {/* Intel notes */}
      {notes.caveats && notes.caveats !== "Not found" && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
          <div className="font-semibold text-foreground/70 mb-1">Confidence caveats</div>
          {notes.caveats}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <PushContactToCrm profile={p} runTitle={result.title} />
        <SaveBar runId={result.id} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY INTEL PANEL
// ─────────────────────────────────────────────────────────────────────────────

function CompanyIntelPanel() {
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [city, setCity] = useState("");
  const [knownFacts, setKnownFacts] = useState("");
  const [sellerCompany, setSellerCompany] = useState("");
  const [sellerProduct, setSellerProduct] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const { agentStates, logs } = useAgentProgress(COMPANY_AGENTS, busy);

  async function run() {
    if (!companyName.trim()) return;
    setErr(null); setResult(null); setBusy(true);
    try {
      const data = await apiFetch("/engines/company-intel/run", {
        method: "POST",
        body: JSON.stringify({
          companyName: companyName.trim(),
          website: website.trim() || undefined,
          crNumber: crNumber.trim() || undefined,
          city: city.trim() || undefined,
          knownFacts: knownFacts.trim() || undefined,
          sellerContext: (sellerCompany || sellerProduct) ? {
            companyName: sellerCompany.trim() || undefined,
            product: sellerProduct.trim() || undefined,
          } : undefined,
        }),
      });
      setResult(data);
    } catch (e: any) {
      setErr(e?.message ?? "Run failed");
    } finally { setBusy(false); }
  }

  return (
    <EngineShell engine="company_intel" form={
      <>
        <Field label="Company Name" required>
          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Saudi Aramco" />
        </Field>
        <Field label="Website" hint="Crawled up to 8 pages via Web Seeder">
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://aramco.com" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="CR Number"><Input value={crNumber} onChange={(e) => setCrNumber(e.target.value)} placeholder="1010123456" /></Field>
          <Field label="City"><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Riyadh" /></Field>
        </div>
        <Field label="Known Facts" hint="Prepended as confirmed data — reduces hallucination">
          <Textarea value={knownFacts} onChange={(e) => setKnownFacts(e.target.value)} placeholder="e.g. Listed on Tadawul 2019. Ticker: 2222." />
        </Field>
        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your context</div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={sellerCompany} onChange={(e) => setSellerCompany(e.target.value)} placeholder="Your company" className="text-xs" />
            <Input value={sellerProduct} onChange={(e) => setSellerProduct(e.target.value)} placeholder="What you sell" className="text-xs" />
          </div>
        </div>
        <RunButton busy={busy} onClick={run} label="Run Company Intel (11 sources)" />
      </>
    } result={
      busy ? <AgentPipeline agents={COMPANY_AGENTS} states={agentStates} logs={logs} color="text-[#C8A880]" /> :
      err ? <EngineError msg={err} /> :
      !result ? <EngineEmpty engine="company_intel" /> :
      <CompanyReport result={result} />
    } />
  );
}

function CompanyReport({ result }: { result: any }) {
  const r = result.report ?? {};
  const p = r.profile ?? r;
  const fin = r.financials ?? {};
  const own = r.ownership ?? {};
  const lead = r.leadership ?? {};
  const mkt = r.market ?? {};
  const app = r.approach ?? {};
  const intel = r.intelligence ?? {};

  return (
    <div className="space-y-4">
      {/* Company hero */}
      <div className="rounded-2xl border border-[#C8A880]/40 bg-gradient-to-br from-[#C8A880]/8 to-transparent p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-[#C8A880]" />
              <span className="text-xs font-semibold text-[#C8A880] uppercase tracking-wider">Company Intel Report</span>
            </div>
            <div className="font-bold text-xl">{p.nameEn || p.companyName || "—"}</div>
            {p.nameAr && <div className="text-sm text-muted-foreground" dir="rtl">{p.nameAr}</div>}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {p.crNumber && <span className="font-mono bg-muted px-2 py-0.5 rounded">CR {p.crNumber}</span>}
              {p.legalForm && <span>{p.legalForm}</span>}
              {(p.city || p.address) && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.city || p.address}</span>}
              {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#C8A880] hover:underline"><Globe className="w-3 h-3" />{p.website.replace(/^https?:\/\//, "").split("/")[0]}</a>}
            </div>
          </div>
          <div className="text-right">
            <DataQualityBadge quality={intel.dataQuality ?? "medium"} />
            <div className="text-[10px] text-muted-foreground mt-1">{Math.round(result.durationMs / 1000)}s · {result.sourcesUsed?.length ?? 0} sources</div>
            <div className="mt-2 flex flex-wrap gap-1 justify-end">
              {(result.sourcesUsed ?? []).slice(0, 5).map((s: string) => (
                <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#C8A880]/15 text-[#C8A880]">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile label="Revenue" value={fin.revenueEstimate} />
        <KpiTile label="Employees" value={p.employeeCount || fin.employeeCount} />
        <KpiTile label="Founded" value={p.founded} />
        <KpiTile label="Paid-up Capital" value={fin.paidUpCapital || p.paidUpCapital} />
      </div>

      {r.executiveSummary && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Executive Summary</div>
          <p className="text-sm leading-relaxed">{r.executiveSummary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Financials */}
        <ReportSection title="Financials" icon={BarChart3}>
          <KvList data={{
            "Revenue estimate": fin.revenueEstimate,
            "Revenue range": fin.revenueRange,
            "Revenue basis": fin.revenueRationale,
            "Profitability": fin.profitabilityIndicator,
            "Growth signals": (fin.growthSignals ?? []).join(", "),
          }} />
        </ReportSection>

        {/* Ownership */}
        <ReportSection title="Ownership" icon={Shield}>
          <KvList data={{
            "Structure": own.structure,
            "Publicly listed": own.isPubliclyListed ? "Yes" : (own.isPubliclyListed === false ? "No" : undefined),
            "Stock exchange": own.stockExchange,
            "Ticker": own.ticker,
          }} />
          {(own.shareholders?.length > 0) && (
            <div className="mt-3">
              <div className="text-[10px] font-semibold text-muted-foreground mb-1.5">Shareholders</div>
              <ul className="space-y-1.5">
                {own.shareholders.slice(0, 4).map((s: any, i: number) => (
                  <li key={i} className="flex items-baseline justify-between text-xs">
                    <span>{s.nameEn || "—"}</span>
                    <span className="font-mono font-semibold">{s.ownershipPct || "—"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ReportSection>

        {/* Leadership */}
        <ReportSection title="Leadership" icon={Users}>
          {lead.ceo && (
            <div className="flex items-baseline justify-between text-sm mb-2">
              <span className="font-semibold">{lead.ceo.nameEn}</span>
              <span className="text-xs text-muted-foreground">{lead.ceo.title}</span>
            </div>
          )}
          {(lead.executives?.length > 0) && (
            <ul className="space-y-1.5 mt-2">
              {lead.executives.slice(0, 5).map((e: any, i: number) => (
                <li key={i} className="flex items-baseline justify-between text-xs">
                  <span>{e.nameEn || "—"}</span>
                  <span className="text-muted-foreground">{e.title}</span>
                </li>
              ))}
            </ul>
          )}
        </ReportSection>

        {/* Market */}
        <ReportSection title="Market Intelligence" icon={TrendingUp}>
          <KvList data={{
            "Market position": mkt.marketPosition,
            "Market share": mkt.marketShare,
            "Competitors": (mkt.competitors ?? []).slice(0, 3).join(", "),
          }} />
          {(mkt.strengths?.length > 0) && (
            <TagList label="Strengths" items={mkt.strengths.slice(0, 3)} color="emerald" />
          )}
          {(mkt.weaknesses?.length > 0) && (
            <TagList label="Weaknesses" items={mkt.weaknesses.slice(0, 2)} color="rose" />
          )}
        </ReportSection>
      </div>

      {/* News */}
      {(r.news?.length > 0) && (
        <CollapseSection title={`Recent News (${r.news.length})`} icon={BookOpen}>
          <ul className="space-y-3">
            {r.news.slice(0, 5).map((n: any, i: number) => (
              <li key={i} className="text-sm border-b border-border/50 last:border-0 pb-2 last:pb-0">
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{n.date} · {n.source}</div>
                {n.summary && <div className="text-xs mt-1">{n.summary}</div>}
              </li>
            ))}
          </ul>
        </CollapseSection>
      )}

      {/* Approach — always shown */}
      {r.approach !== undefined && (
        <div className="rounded-2xl border border-[#C8A880]/50 bg-gradient-to-br from-[#C8A880]/8 to-transparent overflow-hidden">
          <div className="px-5 py-3 border-b border-[#C8A880]/30 bg-[#C8A880]/10 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#C8A880]" />
            <span className="font-semibold text-sm text-[#C8A880]">Approach Strategy</span>
            <span className="ml-auto text-[10px] text-muted-foreground">AI-generated · review before use</span>
          </div>
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <KpiTile label="Best channel" value={app.bestChannel} />
              <KpiTile label="Entry point" value={app.entryPoint} />
              <KpiTile label="Timing" value={app.bestTiming} />
            </div>
            {hasContent(app.valueProp) && <p className="text-sm"><span className="font-semibold">Value prop:</span> {app.valueProp}</p>}
            {hasContent(app.openingAngle) && <p className="text-sm"><span className="font-semibold">Opening angle:</span> {app.openingAngle}</p>}
            {hasContent(app.potentialObjections) && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Potential objections</div>
                <div className="flex flex-wrap gap-1.5">
                  {(app.potentialObjections as string[]).map((o: string, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400">{o}</span>
                  ))}
                </div>
              </div>
            )}
            {hasContent(app.culturalNotes) && (
              <div className="text-xs italic text-muted-foreground p-3 bg-muted/50 rounded-xl border border-border">🕌 {app.culturalNotes}</div>
            )}
            {hasContent(app.sampleMessage) && (
              <div className="rounded-xl bg-background border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sample message</div>
                  <CopyButton text={app.sampleMessage} />
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line">{app.sampleMessage}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <PushCompanyToCrm parsed={{ nameEn: p.nameEn || p.companyName, website: p.website, city: p.city }} runTitle={result.title} />
        <SaveBar runId={result.id} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI DATABASE PANEL (Masar Company Database)
// ─────────────────────────────────────────────────────────────────────────────

function AIDatabasePanel() {
  return (
    <div className="rounded-2xl border border-[#7aab9a]/40 bg-gradient-to-br from-[#7aab9a]/5 to-transparent p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[#7aab9a]/20 flex items-center justify-center mx-auto">
        <Database className="w-8 h-8 text-[#7aab9a]" />
      </div>
      <div>
        <div className="font-bold text-xl">Masar Company Database</div>
        <div className="text-muted-foreground text-sm mt-1">Saudi B2B company repository — harvest, enrich, deduplicate, export</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto">
        {[
          { icon: Sparkles, label: "25+ harvest sources", desc: "Wikipedia, GLEIF, OpenCorporates, Amaaly AOA, Bluepages, Wikidata, MoCI, directories…" },
          { icon: Zap, label: "14 enrichment sources", desc: "Perplexity, 3× Gemini, Claude, GPT-4o, Apollo, Aamaly, Maroof, free sources, Web Seeder…" },
          { icon: Shield, label: "Dedup + export", desc: "3-tier identity matching, CSV / Excel / Word / PDF export, compliance flags" },
        ].map((f) => (
          <div key={f.label} className="rounded-xl border border-border bg-card/60 p-3">
            <f.icon className="w-4 h-4 text-[#7aab9a] mb-1.5" />
            <div className="text-xs font-semibold">{f.label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
      <div className="pt-2">
        <a href="/enrichment-engine?tab=waterfall" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7aab9a] text-white font-semibold text-sm hover:opacity-90 transition-opacity">
          <Database className="w-4 h-4" /> Open Masar Database
        </a>
      </div>
      <p className="text-[10px] text-muted-foreground max-w-sm mx-auto">
        Full Masar Database UI (harvest jobs, company grid, SSE progress, dedup, export) is accessible via the Data Hub section.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY PANEL
// ─────────────────────────────────────────────────────────────────────────────

function HistoryPanel() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    apiFetch("/engines/runs").then((d: any) => {
      setRows(d?.rows ?? d ?? []);
    }).catch(() => setRows([])).finally(() => setLoading(false));
  }, []);

  async function openDetail(id: string) {
    const d: any = await apiFetch(`/engines/runs/${id}`);
    setDetail(d?.row ?? d);
    setDetailOpen(true);
  }

  async function deleteRun(id: string) {
    await apiFetch(`/engines/runs/${id}`, { method: "DELETE" });
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const ENGINE_COLORS: Record<string, string> = {
    masaar: "bg-[#88B8B0]/15 text-[#88B8B0]",
    person_intel: "bg-[#B8A0C8]/15 text-[#B8A0C8]",
    company_intel: "bg-[#C8A880]/15 text-[#C8A880]",
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-sm"><History className="w-4 h-4" /> Run History</div>
          <span className="text-xs text-muted-foreground">{rows.length} runs</span>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No engine runs yet. Run an engine to see results here.</div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0", ENGINE_COLORS[row.engine] ?? "bg-muted text-muted-foreground")}>
                  {row.engine?.replace("_", " ")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{row.title || "—"}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(row.created_at).toLocaleString()} · {Math.round((row.duration_ms ?? 0) / 1000)}s · {(row.sources_used ?? []).length} sources
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <RunStatusDot status={row.status} />
                  {row.saved && <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />}
                  <button onClick={() => openDetail(row.id)} className="p-1.5 rounded hover:bg-muted transition-colors"><Eye className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => deleteRun(row.id)} className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {detailOpen && detail && (
        <RunDetailDrawer detail={detail} onClose={() => setDetailOpen(false)} />
      )}
    </div>
  );
}

function RunStatusDot({ status }: { status: string }) {
  return (
    <div className={cn("w-1.5 h-1.5 rounded-full", status === "ok" ? "bg-emerald-500" : status === "error" ? "bg-rose-500" : "bg-amber-500")} />
  );
}

function RunDetailDrawer({ detail, onClose }: { detail: any; onClose: () => void }) {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const r = detail?.report ?? {};

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="font-semibold text-sm">{detail.title}</div>
        <div className="flex items-center gap-3">
          {(r.reportEn || r.report_en) && <LangToggle lang={lang} setLang={setLang} />}
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{detail.engine}</span>
          <span>·</span>
          <span>{Math.round((detail.duration_ms ?? 0) / 1000)}s</span>
          <span>·</span>
          <span>{(detail.sources_used ?? []).length} sources</span>
          <span>·</span>
          <RunStatusDot status={detail.status} />
          <span>{detail.status}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {(detail.sources_used ?? []).map((s: string) => (
            <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
          ))}
        </div>
        {detail.error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-700 dark:text-rose-400">{detail.error}</div>
        )}
        {(r.reportEn || r.report_en) && (
          <div className="rounded-xl border border-border p-5" dir={lang === "ar" ? "rtl" : "ltr"}>
            <MasaarMarkdown
              text={lang === "en" ? (r.reportEn || r.report_en) : (r.reportAr || r.report_ar || "التقرير غير متاح.")}
              dir={lang === "ar" ? "rtl" : "ltr"}
            />
          </div>
        )}
        {!r.reportEn && !r.report_en && (
          <pre className="text-[10px] bg-muted/50 p-3 rounded-xl overflow-auto max-h-96 font-mono text-muted-foreground">
            {JSON.stringify(r, null, 2).slice(0, 4000)}
          </pre>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared widgets
// ─────────────────────────────────────────────────────────────────────────────

function ReportSection({ title, icon: Icon, children }: { title: string; icon: typeof Users; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function CollapseSection({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: typeof Users; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold">{title}</span>
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function KpiTile({ icon: Icon, label, value }: { icon?: typeof Users; label: string; value?: any }) {
  const display = (value !== null && value !== undefined && value !== "" && value !== "Not found") ? value : "—";
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="w-3 h-3 text-muted-foreground" />}
        <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      </div>
      <div className={cn("font-semibold text-sm truncate", display === "—" && "text-muted-foreground")}>{display}</div>
    </div>
  );
}

function KvList({ data }: { data: Record<string, any> }) {
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== "" && v !== "Not found");
  if (!entries.length) return <NoData />;
  return (
    <dl className="text-xs grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5">
      {entries.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground font-medium">{k}</dt>
          <dd className="text-foreground/90 break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function TagList({ label, items, color }: { label: string; items: string[]; color: "emerald" | "rose" | "amber" }) {
  const cls = { emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", rose: "bg-rose-500/10 text-rose-700 dark:text-rose-400", amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400" }[color];
  return (
    <div className="mt-2">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => <span key={item} className={cn("text-[9px] px-1.5 py-0.5 rounded-full", cls)}>{item}</span>)}
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const active = status.toLowerCase().includes("active") || status.toLowerCase().includes("valid");
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
      active ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
    )}>{status}</span>
  );
}

function ConfidenceBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    High:   "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    Medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    Low:    "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  };
  return <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", map[level] ?? map.Low)}>{level} confidence</span>;
}

function DataQualityBadge({ quality }: { quality: string }) {
  const map: Record<string, string> = {
    high:   "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    low:    "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  };
  return <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", map[quality] ?? map.medium)}>{quality} data quality</span>;
}

function LangToggle({ lang, setLang }: { lang: "en" | "ar"; setLang: (l: "en" | "ar") => void }) {
  return (
    <div className="flex bg-background rounded-lg border border-border p-0.5 text-xs">
      <button onClick={() => setLang("en")} className={cn("px-2.5 py-1 rounded-md transition-colors", lang === "en" && "bg-foreground text-background")}>English</button>
      <button onClick={() => setLang("ar")} className={cn("px-2.5 py-1 rounded-md transition-colors", lang === "ar" && "bg-foreground text-background")}>عربي</button>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  return (
    <button onClick={copy} className="p-1.5 rounded hover:bg-muted transition-colors">
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
    </button>
  );
}

function SaveBar({ runId }: { runId: string }) {
  const [saved, setSaved] = useState(false);
  async function save() {
    await apiFetch(`/engines/runs/${runId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ saved: true }),
    });
    setSaved(true);
  }
  return (
    <div className="flex justify-end pt-2">
      <button onClick={save} disabled={saved}
        className={cn("text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors",
          saved ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400" : "border-border hover:bg-muted text-muted-foreground"
        )}>
        <Star className={cn("w-3 h-3", saved && "fill-amber-500 text-amber-500")} />
        {saved ? "Saved" : "Save run"}
      </button>
    </div>
  );
}

function NoData({ tip }: { tip?: string }) {
  return (
    <div className="py-2">
      <p className="text-xs text-muted-foreground/70 italic">No public data found for this field.</p>
      {tip && <p className="text-[10px] text-muted-foreground/50 mt-0.5">{tip}</p>}
    </div>
  );
}

function LimitedProfileBanner({ name, sources }: { name: string; sources: number }) {
  return (
    <div className="rounded-xl border border-amber-400/40 bg-amber-50/60 dark:bg-amber-900/10 px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
      <div>
        <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">Limited public profile</div>
        <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
          {sources} sources searched for <strong>{name}</strong> but returned minimal structured data.
          This is common for private executives at SME-level companies with a small digital footprint.
          The Approach Strategy below is generated based on their known role and Saudi B2B context.
        </p>
        <p className="text-[10px] text-amber-600/80 dark:text-amber-500 mt-1">
          Tip: Add their LinkedIn URL or company website URL and re-run for richer results.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKDOWN RENDERER — for Masaar reportEn / reportAr
// ─────────────────────────────────────────────────────────────────────────────

function parseMdInline(text: string): React.ReactNode {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  // Match **bold**, *italic*, `code`, [label](url)
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\)/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
    if (m[1] !== undefined) parts.push(<strong key={m.index}>{m[1]}</strong>);
    else if (m[2] !== undefined) parts.push(<em key={m.index}>{m[2]}</em>);
    else if (m[3] !== undefined) parts.push(<code key={m.index} className="bg-muted px-1 rounded text-[11px] font-mono">{m[3]}</code>);
    else if (m[4] !== undefined) parts.push(<a key={m.index} href={m[5]} target="_blank" rel="noreferrer" className="text-[#88B8B0] underline hover:opacity-80">{m[4]}</a>);
    lastIdx = re.lastIndex;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  return <>{parts}</>;
}

function MasaarMarkdown({ text, dir }: { text: string; dir?: "ltr" | "rtl" }) {
  if (!text) return null;
  const lines = text.split("\n");
  const els: React.ReactElement[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) { i++; continue; }

    // Horizontal rule
    if (line === "---") {
      els.push(<hr key={`hr${i}`} className="border-border my-5" />);
      i++; continue;
    }

    // Headings
    if (line.startsWith("#### ")) {
      els.push(<p key={`h4${i}`} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-4 mb-1">{parseMdInline(line.slice(5))}</p>);
      i++; continue;
    }
    if (line.startsWith("### ")) {
      els.push(<h3 key={`h3${i}`} className="text-sm font-bold mt-5 mb-1.5 text-foreground">{parseMdInline(line.slice(4))}</h3>);
      i++; continue;
    }
    if (line.startsWith("## ")) {
      els.push(<h2 key={`h2${i}`} className="text-base font-bold mt-6 mb-2 text-[#88B8B0] border-b border-[#88B8B0]/30 pb-1">{parseMdInline(line.slice(3))}</h2>);
      i++; continue;
    }
    if (line.startsWith("# ")) {
      els.push(<h1 key={`h1${i}`} className="text-xl font-bold mt-2 mb-3 text-foreground">{parseMdInline(line.slice(2))}</h1>);
      i++; continue;
    }

    // Blockquote — collect consecutive "> " lines
    if (line.startsWith("> ")) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        bqLines.push(lines[i].trim().slice(2));
        i++;
      }
      const joined = bqLines.join(" ");
      const isWarn = joined.includes("⚠️");
      const isNote = /^\*\*(Note|Data Gap|Source Note|Precision|Registry|Important)/.test(bqLines[0] ?? "");
      els.push(
        <div key={`bq${i}`} className={cn(
          "rounded-xl p-4 my-3 text-sm space-y-1 leading-relaxed",
          isWarn
            ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-300/70 dark:border-amber-700/40 text-amber-900 dark:text-amber-200"
            : isNote
            ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40"
            : "bg-muted/50 border-l-4 border-[#88B8B0] pl-4"
        )}>
          {bqLines.map((bl, bi) => bl.trim() ? <p key={bi}>{parseMdInline(bl)}</p> : null)}
        </div>
      );
      continue;
    }

    // Table — collect consecutive "|" lines
    if (line.startsWith("|")) {
      const tblLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tblLines.push(lines[i].trim());
        i++;
      }
      // Filter separator rows (e.g. |---|---|)
      const rows = tblLines.filter(r => !/^\|[\s\-:|]+\|$/.test(r));
      if (rows.length === 0) continue;
      const parseCells = (row: string) => row.split("|").slice(1, -1).map(c => c.trim());
      const [hdr, ...dataRows] = rows;
      const headers = parseCells(hdr);
      els.push(
        <div key={`tbl${i}`} className="overflow-x-auto my-4 rounded-xl border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/60 border-b border-border">
                {headers.map((cell, ci) => (
                  <th key={ci} className="text-left py-2.5 px-3 font-semibold text-foreground/80 whitespace-nowrap">{parseMdInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri} className={cn("border-b border-border/50 last:border-0", ri % 2 === 1 ? "bg-muted/20" : "")}>
                  {parseCells(row).map((cell, ci) => (
                    <td key={ci} className="py-2 px-3 align-top">{parseMdInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Bullet list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      els.push(
        <ul key={`ul${i}`} className="space-y-1 my-2 pl-1">
          {items.map((item, li) => (
            <li key={li} className="text-sm text-foreground/80 flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-[#88B8B0] mt-2 shrink-0" />
              {parseMdInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Regular paragraph
    els.push(
      <p key={`p${i}`} className="text-sm leading-relaxed text-foreground/90 mb-1">{parseMdInline(line)}</p>
    );
    i++;
  }

  return (
    <div className={cn("space-y-0.5", dir === "rtl" ? "text-right" : "")} dir={dir}>
      {els}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CRM PUSH BUTTONS
// ─────────────────────────────────────────────────────────────────────────────

function PushContactToCrm({ profile, runTitle }: { profile: any; runTitle?: string }) {
  const [st, setSt] = useState<"idle" | "saving" | "done" | "err">("idle");
  async function push() {
    setSt("saving");
    const parts = (profile.fullName || "").trim().split(/\s+/);
    const firstName = parts[0] || "Unknown";
    const lastName = parts.slice(1).join(" ") || profile.company || "Unknown";
    try {
      await apiFetch("/contacts", {
        method: "POST",
        body: JSON.stringify({
          firstName,
          lastName,
          company: profile.company || "",
          jobTitle: profile.title || "",
          linkedinUrl: profile.linkedin && profile.linkedin !== "Not found" ? profile.linkedin : undefined,
          location: profile.location || "",
          notes: `Imported via Person Intel · ${runTitle || ""}`.trim(),
        }),
      });
      setSt("done");
    } catch { setSt("err"); }
  }
  return (
    <button onClick={push} disabled={st !== "idle"}
      className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
        st === "done" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
        st === "err"  ? "bg-rose-500/15 text-rose-700" :
        "bg-[#B8A0C8]/15 text-[#B8A0C8] hover:bg-[#B8A0C8]/25"
      )}>
      {st === "saving" ? <Loader2 className="w-3 h-3 animate-spin" /> :
       st === "done"   ? <CheckCircle2 className="w-3 h-3" /> :
       st === "err"    ? <AlertTriangle className="w-3 h-3" /> :
                         <UserPlus className="w-3 h-3" />}
      {st === "saving" ? "Saving…" : st === "done" ? "Saved to CRM" : st === "err" ? "Save failed" : "Save to CRM"}
    </button>
  );
}

function PushCompanyToCrm({ parsed, runTitle }: { parsed: any; runTitle?: string }) {
  const [st, setSt] = useState<"idle" | "saving" | "done" | "err">("idle");
  async function push() {
    setSt("saving");
    const name = parsed.nameEn || parsed.nameAr || parsed.companyName || "";
    if (!name) { setSt("err"); return; }
    try {
      await apiFetch("/companies", {
        method: "POST",
        body: JSON.stringify({
          name,
          website: parsed.website || parsed.contactDetails?.website || "",
          city: parsed.headquarterCity || parsed.city || "",
          industry: parsed.industry || "",
          notes: `Imported via Masaar/Company Intel · ${runTitle || ""}`.trim(),
        }),
      });
      setSt("done");
    } catch { setSt("err"); }
  }
  return (
    <button onClick={push} disabled={st !== "idle"}
      className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all",
        st === "done" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
        st === "err"  ? "bg-rose-500/15 text-rose-700" :
        "bg-[#88B8B0]/15 text-[#88B8B0] hover:bg-[#88B8B0]/25"
      )}>
      {st === "saving" ? <Loader2 className="w-3 h-3 animate-spin" /> :
       st === "done"   ? <CheckCircle2 className="w-3 h-3" /> :
       st === "err"    ? <AlertTriangle className="w-3 h-3" /> :
                         <Building2 className="w-3 h-3" />}
      {st === "saving" ? "Saving…" : st === "done" ? "Company saved" : st === "err" ? "Save failed" : "Save company to CRM"}
    </button>
  );
}

function PushLeadToCrm({ lead }: { lead: any }) {
  const [st, setSt] = useState<"idle" | "saving" | "done" | "err">("idle");
  async function push() {
    setSt("saving");
    const full = (lead.name || lead.fullName || "").trim();
    const parts = full.split(/\s+/);
    const firstName = parts[0] || "Unknown";
    const lastName = parts.slice(1).join(" ") || "Lead";
    try {
      await apiFetch("/contacts", {
        method: "POST",
        body: JSON.stringify({
          firstName,
          lastName,
          company: lead.company || "",
          jobTitle: lead.title || "",
          email: lead.email || undefined,
          phone: lead.phone || undefined,
          linkedinUrl: lead.linkedin || undefined,
          location: lead.location || "",
          notes: `Imported via Intel Engine · ICP score ${lead.icpScore ?? lead.score ?? "?"}`,
        }),
      });
      setSt("done");
    } catch { setSt("err"); }
  }
  return (
    <button onClick={push} disabled={st !== "idle"}
      className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all",
        st === "done" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
        st === "err"  ? "bg-rose-500/15 text-rose-700" :
        "bg-[#D4955A]/15 text-[#D4955A] hover:bg-[#D4955A]/25"
      )}>
      {st === "saving" ? <Loader2 className="w-3 h-3 animate-spin" /> :
       st === "done"   ? <CheckCircle2 className="w-3 h-3" /> :
       st === "err"    ? <AlertTriangle className="w-3 h-3" /> :
                         <UserPlus className="w-3 h-3" />}
      {st === "saving" ? "Adding…" : st === "done" ? "Added to CRM" : st === "err" ? "Failed" : "Add to CRM"}
    </button>
  );
}

function buildSaudiBizApproach(name: string, title: string, company: string): Record<string, any> {
  const firstName = (name || "").split(" ")[0] || name || "there";
  const isCLevel = /(ceo|president|managing director|general manager|chairman|founder|owner)/i.test(title || "");
  const isVP = /(vp|vice president)/i.test(title || "");
  const seniority = isCLevel ? "C-Level executive" : isVP ? "VP-level leader" : "senior leader";
  const isConstruction = /(construct|contracting|engineering|infrastructure|build)/i.test(company || title || "");
  const industryHint = isConstruction
    ? "Vision 2030 infrastructure programmes, NEOM, or recent contract awards"
    : "market trends and growth opportunities in their sector";

  return {
    best_channel: "LinkedIn",
    best_timing: "Sunday–Wednesday, 9:00–11:30 AM (AST)",
    opening_angle: `Reference ${industryHint} relevant to ${company || "their company"}. Keep the opening relational, not transactional.`,
    value_proposition: `Tailored to ${seniority}s at GCC-based companies. Lead with how peers in their industry have benefited.`,
    potential_objections: [
      "Happy with current suppliers / vendors",
      "No budget allocation this quarter",
      "Too busy to evaluate new solutions",
    ],
    conversation_starters: [
      "Saudi Vision 2030 — opportunities and execution challenges in their sector",
      "Technology adoption and digital transformation in GCC firms",
      "Talent and operational efficiency in the Saudi market",
    ],
    cultural_notes:
      "Saudi executives value personal relationships and trust before business. Lead with a warm introduction or shared connection if possible. Avoid being overtly sales-driven in the first contact — propose a brief coffee or 15-minute call. Referencing shared context (a conference, a news story about their firm, or a mutual contact) significantly improves response rates.",
    recommended_approach:
      `As a ${title || seniority} at ${company || "their organisation"}, ${firstName} is a key decision-maker. Approach with a warm, respectful tone. Reference something specific about ${company || "their company"} to show you've done your research. Request a brief introductory call (15 min) rather than a full pitch meeting. Follow up once on LinkedIn if no response within a week — persistence is acceptable but keep it measured and professional.`,
    sample_message:
      `Dear ${firstName},\n\nI came across ${company || "your company"} while researching leading firms in the sector and was impressed by the work you're doing. We partner with similar organisations across the GCC to [your value proposition], and I'd love to share a few ideas that have helped comparable teams.\n\nWould you have 15 minutes for a brief call this week or next?\n\nWith respect,\n[Your name]`,
  };
}
