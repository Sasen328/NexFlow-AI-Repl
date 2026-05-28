/**
 * AI Database Builder Panel
 * ==========================
 * 15-source AI-powered database construction.
 * Dedicated file — extracted from enrichment-engine.tsx.
 *
 * Layout: builder workspace
 *   TOP    — Natural language prompt ("Build me a database of…")
 *   MIDDLE — Source grid (category cards with toggles) + depth picker
 *   LIVE   — Agent activity log (terminal stream during build)
 *   BOTTOM — Built database results with confidence scores
 */

import { useState, useEffect, useRef } from "react";
import {
  Bot, Sparkles, Play, Loader2, CheckCircle2, XCircle, Plus,
  Trash2, Search, Download, ArrowRight, Database, Globe,
  Building2, Users, BarChart3, FileText, Cpu, Layers,
  Terminal, ChevronRight, CircleDot, AlertTriangle, RefreshCw,
  Star, Mail, Phone, MapPin, ExternalLink, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";

const ACCENT = "#B8A0C8";
const GOLD   = "#C8A880";
const TEAL   = "#88B8B0";
const DARK   = "#0F1117";

// ── Source categories ─────────────────────────────────────────────────────────
interface SourceDef {
  id:          string;
  name:        string;
  url?:        string;
  category:    string;
  engine:      "scraper" | "ai" | "both";
  harvestedCount?: number;
  estimatedCompanies?: number;
}

const ENGINE_ICONS: Record<string, React.ElementType> = {
  directory:   Globe,
  registry:    Database,
  government:  Building2,
  financial:   BarChart3,
  association: Users,
  custom:      Cpu,
};

const ENGINE_COLORS: Record<string, string> = {
  directory:   "#7C3AED",
  registry:    "#0891B2",
  government:  "#065F46",
  financial:   "#B45309",
  association: "#BE185D",
  custom:      "#6B7280",
};

// ── Agent log entry ───────────────────────────────────────────────────────────
interface LogEntry {
  ts:      number;
  level:   "info" | "success" | "warn" | "agent" | "error";
  source?: string;
  msg:     string;
}

// ── Main component ────────────────────────────────────────────────────────────
export function AiDatabaseBuilderPanel() {
  const [sources,     setSources]     = useState<SourceDef[]>([]);
  const [results,     setResults]     = useState<any[]>([]);
  const [stats,       setStats]       = useState<any>(null);
  const [activeJob,   setActiveJob]   = useState<any>(null);
  const [loading,     setLoading]     = useState(false);
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const [search,      setSearch]      = useState("");
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [depth,       setDepth]       = useState("standard");
  const [prompt,      setPrompt]      = useState("");
  const [showAddSrc,  setShowAddSrc]  = useState(false);
  const [newSrc,      setNewSrc]      = useState({ name: "", url: "", category: "directory" });
  const [agentLog,    setAgentLog]    = useState<LogEntry[]>([]);
  const [activeView,  setActiveView]  = useState<"sources" | "log" | "results">("sources");
  const logRef  = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    void apiFetch("/builder/sources").then((d: any) => setSources(Array.isArray(d) ? d : [])).catch(() => {});
    void apiFetch("/builder/stats").then(setStats).catch(() => {});
    loadResults(1, "");
  }, []);

  // Auto-scroll agent log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [agentLog]);

  function loadResults(p: number, q: string) {
    setLoading(true);
    void apiFetch(`/builder/results?page=${p}&limit=20&search=${encodeURIComponent(q)}`)
      .then((d: any) => { setResults(d.companies || []); setTotal(d.total || 0); setPage(p); })
      .finally(() => setLoading(false));
  }

  function addLog(level: LogEntry["level"], msg: string, source?: string) {
    setAgentLog((prev) => [...prev.slice(-199), { ts: Date.now(), level, msg, source }]);
  }

  async function startBuild() {
    if (isRunning) return;
    setAgentLog([]);
    setActiveView("log");
    addLog("info", `Build started — ${selected.size > 0 ? selected.size : "all"} sources · depth: ${depth}`);
    if (prompt.trim()) addLog("agent", `Prompt: "${prompt.trim()}"`);

    try {
      const data: any = await apiFetch("/builder/harvest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceIds:       selected.size > 0 ? Array.from(selected) : undefined,
          enrichmentDepth: depth,
          prompt:          prompt.trim() || undefined,
        }),
      });
      setActiveJob(data);
      addLog("info", `Job ${data.jobId} queued`);

      pollRef.current = setInterval(() => {
        void apiFetch(`/builder/jobs/${data.jobId}`).then((j: any) => {
          setActiveJob(j);

          if (j.latestLog) addLog("agent", j.latestLog);

          if (j.status === "harvesting") {
            addLog("info", `Harvesting… ${j.companiesHarvested ?? 0} companies so far`);
          } else if (j.status === "enriching") {
            addLog("success", `Enriching ${j.companiesHarvested ?? 0} records with AI agents`);
          } else if (j.status === "completed") {
            clearInterval(pollRef.current);
            addLog("success", `Build complete — ${j.companiesHarvested ?? 0} companies added to database`);
            void apiFetch("/builder/stats").then(setStats);
            loadResults(1, search);
            setActiveView("results");
          } else if (j.status === "failed") {
            clearInterval(pollRef.current);
            addLog("error", j.error ?? "Build failed");
          }
        }).catch(() => {});
      }, 2500);
    } catch (e: any) {
      addLog("error", e.message ?? "Failed to start build");
    }
  }

  async function harvestSingle(id: string) {
    setAgentLog([]);
    setActiveView("log");
    addLog("info", `Single-source harvest: ${sources.find((s) => s.id === id)?.name ?? id}`);
    try {
      const data: any = await apiFetch(`/builder/sources/${id}/harvest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrichmentDepth: depth }),
      });
      setActiveJob(data);
      addLog("info", `Job ${data.jobId} started`);
    } catch (e: any) {
      addLog("error", e.message ?? "Failed");
    }
  }

  async function addCustomSource() {
    if (!newSrc.name || !newSrc.url) return;
    try {
      const s: any = await apiFetch("/builder/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSrc),
      });
      setSources((prev) => [...prev, s.source]);
      setNewSrc({ name: "", url: "", category: "directory" });
      setShowAddSrc(false);
    } catch { /* silent */ }
  }

  async function pushToCrm(id: number) {
    await apiFetch(`/builder/results/${id}/push-crm`, { method: "POST" });
    loadResults(page, search);
  }

  function toggleSource(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  useEffect(() => () => clearInterval(pollRef.current), []);

  const isRunning  = activeJob && !["completed","failed","cancelled"].includes(activeJob?.status ?? "");
  const grouped    = sources.reduce<Record<string, SourceDef[]>>((acc, s) => {
    const cat = s.category || "directory";
    (acc[cat] = acc[cat] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">

      {/* ── Prompt bar ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/30 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${DARK}F5, #1A1240F5)`, borderColor: `${ACCENT}30` }}>
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-5 h-5" style={{ color: ACCENT }} />
            <span className="font-bold text-[14px] text-white">AI Database Builder</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${ACCENT}20`, color: ACCENT }}>
              15 sources · Scraper + AI agents
            </span>
          </div>

          {/* Prompt input */}
          <div className="relative">
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: GOLD }} />
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void startBuild(); } }}
              placeholder="e.g., Fintech companies in Riyadh with 50+ employees, Series A or later…"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-[14px] text-white placeholder:text-white/30 border outline-none focus:ring-2 transition-all"
              style={{
                background: "#FFFFFF08",
                borderColor: `${ACCENT}40`,
                fontFamily: "system-ui",
              }}
            />
          </div>

          {/* Prompt examples */}
          <div className="flex flex-wrap gap-2 mt-2.5">
            {[
              "Real estate developers in Jeddah",
              "Construction contractors KSA Vision 2030",
              "Healthcare clinics Riyadh 50+ staff",
              "FMCG distributors GCC region",
            ].map((ex) => (
              <button key={ex} onClick={() => setPrompt(ex)}
                className="px-2.5 py-1 rounded-full text-[10px] border transition-all hover:opacity-80"
                style={{ borderColor: `${ACCENT}30`, color: `${ACCENT}CC`, background: `${ACCENT}08` }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Stats + launch */}
        <div className="px-5 pb-4 flex items-center justify-between gap-4 border-t border-white/5 pt-3 flex-wrap">
          <div className="flex items-center gap-5">
            {stats && [
              { label: "Built",    value: stats.total,       color: ACCENT },
              { label: "Enriched", value: stats.enriched,    color: "#22c55e" },
              { label: "In CRM",   value: stats.pushedToCrm, color: TEAL },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[18px] font-bold" style={{ color: s.color }}>{(s.value ?? 0).toLocaleString()}</div>
                <div className="text-[10px] text-white/40">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select value={depth} onChange={(e) => setDepth(e.target.value)}
              className="text-[12px] rounded-xl px-3 py-2 border text-white/80 outline-none"
              style={{ background: "#FFFFFF08", borderColor: `${ACCENT}30` }}>
              <option value="basic" style={{ background: "#1A1240" }}>Scraper only</option>
              <option value="standard" style={{ background: "#1A1240" }}>Scraper + 3 AI agents</option>
              <option value="deep" style={{ background: "#1A1240" }}>Scraper + 14 AI agents</option>
            </select>

            <button onClick={startBuild} disabled={!!isRunning}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[13px] text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-100"
              style={{
                background: isRunning
                  ? "#374151"
                  : `linear-gradient(135deg, ${ACCENT}, #7C3AED)`,
                boxShadow: isRunning ? "none" : `0 4px 20px ${ACCENT}50`,
              }}>
              {isRunning
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Building…</>
                : <><Bot className="w-4 h-4" /> Build Database</>}
            </button>
          </div>
        </div>
      </div>

      {/* ── View switcher ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border border-border/30 rounded-xl p-1 self-start bg-muted/20">
        {(([
          { id: "sources", label: "Sources",   icon: Layers,    badge: undefined as string | undefined },
          { id: "log",     label: "Build Log", icon: Terminal,  badge: isRunning ? "live" : agentLog.length > 0 ? String(agentLog.length) : undefined },
          { id: "results", label: "Database",  icon: Database,  badge: total > 0 ? total.toLocaleString() : undefined },
        ]) as { id: "sources" | "log" | "results"; label: string; icon: React.ElementType; badge?: string }[]).map((v) => {
          const Icon = v.icon;
          const active = activeView === v.id;
          return (
            <button key={v.id} onClick={() => setActiveView(v.id)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all",
                active ? "text-white shadow-md" : "text-muted-foreground hover:text-foreground")}
              style={active ? { background: `linear-gradient(135deg, ${ACCENT}D0, #7C3AED90)` } : undefined}>
              <Icon className="w-3.5 h-3.5" />
              {v.label}
              {v.badge && (
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  v.badge === "live"
                    ? "bg-red-500 text-white animate-pulse"
                    : active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")}>
                  {v.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Sources view ─────────────────────────────────────────────────────── */}
      {activeView === "sources" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-[13px]">
                {selected.size > 0 ? `${selected.size} of ${sources.length} sources selected` : `${sources.length} sources available`}
              </span>
              {selected.size > 0 && (
                <button onClick={() => setSelected(new Set())}
                  className="ml-3 text-[11px] text-muted-foreground underline">
                  clear selection
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelected(new Set(sources.map((s) => s.id)))}
                className="text-[12px] px-3 py-1.5 rounded-lg border border-border/30 hover:bg-muted/40 transition-all">
                Select All
              </button>
              <button onClick={() => setShowAddSrc(!showAddSrc)}
                className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg border border-border/30 hover:bg-muted/40 transition-all">
                <Plus className="w-3.5 h-3.5" /> Add Source
              </button>
            </div>
          </div>

          {/* Add source form */}
          {showAddSrc && (
            <div className="rounded-xl border border-border/30 bg-muted/20 p-4 flex gap-3 flex-wrap items-end">
              <div className="flex-1 min-w-[160px]">
                <label className="text-[11px] text-muted-foreground mb-1 block">Source Name</label>
                <input value={newSrc.name} onChange={(e) => setNewSrc((p) => ({ ...p, name: e.target.value }))}
                  placeholder="SAMA Business Directory"
                  className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-[12px]" />
              </div>
              <div className="flex-1 min-w-[240px]">
                <label className="text-[11px] text-muted-foreground mb-1 block">URL</label>
                <input value={newSrc.url} onChange={(e) => setNewSrc((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-[12px]" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Category</label>
                <select value={newSrc.category} onChange={(e) => setNewSrc((p) => ({ ...p, category: e.target.value }))}
                  className="px-3 py-2 rounded-lg border border-border/40 bg-background text-[12px]">
                  {Object.keys(ENGINE_ICONS).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={addCustomSource}
                  className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white"
                  style={{ background: ACCENT }}>
                  Add
                </button>
                <button onClick={() => setShowAddSrc(false)}
                  className="px-3 py-2 rounded-lg text-[12px] border border-border/30 hover:bg-muted/40">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Source category grid */}
          {Object.entries(grouped).map(([cat, srcs]) => {
            const Icon  = ENGINE_ICONS[cat] || Globe;
            const color = ENGINE_COLORS[cat] || "#555";
            const selCount = srcs.filter((s) => selected.has(s.id)).length;

            return (
              <div key={cat} className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
                {/* Category header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-border/20"
                  style={{ background: `${color}08` }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `${color}18` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <span className="font-semibold text-[13px] capitalize">{cat.replace(/-/g, " ")}</span>
                    <span className="text-[11px] text-muted-foreground">{srcs.length} sources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selCount > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${color}20`, color }}>
                        {selCount} selected
                      </span>
                    )}
                    <button
                      onClick={() => {
                        const ids = srcs.map((s) => s.id);
                        const allSel = ids.every((id) => selected.has(id));
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (allSel) ids.forEach((id) => next.delete(id));
                          else ids.forEach((id) => next.add(id));
                          return next;
                        });
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg border border-border/30 hover:bg-muted/40 transition-all">
                      {selCount === srcs.length ? "Deselect all" : "Select all"}
                    </button>
                  </div>
                </div>

                {/* Source cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3">
                  {srcs.map((s) => {
                    const sel = selected.has(s.id);
                    return (
                      <div key={s.id}
                        className={cn("rounded-xl border p-3 cursor-pointer transition-all group",
                          sel
                            ? "border-transparent shadow-md"
                            : "border-border/25 hover:border-border/50 bg-card/50")}
                        style={sel ? { background: `${color}12`, borderColor: `${color}50` } : undefined}
                        onClick={() => toggleSource(s.id)}>
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <div className={cn("w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all",
                            sel ? "border-transparent" : "border-border/40")}
                            style={sel ? { background: color } : undefined}>
                            {sel && (
                              <svg className="w-3 h-3 text-white" viewBox="0 0 10 10" fill="none">
                                <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            )}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); void harvestSingle(s.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-muted/60 transition-all flex-shrink-0"
                            title="Harvest this source only">
                            <Play className="w-3 h-3" style={{ color }} />
                          </button>
                        </div>
                        <div className="text-[12px] font-semibold leading-tight mb-1 pr-1">{s.name}</div>
                        <div className="flex flex-wrap gap-1">
                          {s.harvestedCount != null && s.harvestedCount > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              {s.harvestedCount.toLocaleString()} harvested
                            </span>
                          )}
                          {s.estimatedCompanies != null && s.estimatedCompanies > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              ~{s.estimatedCompanies.toLocaleString()} est.
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Agent log view ───────────────────────────────────────────────────── */}
      {activeView === "log" && (
        <div className="rounded-xl border border-border/20 overflow-hidden"
          style={{ background: DARK }}>
          <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-white/40" />
              <span className="text-[12px] font-mono text-white/60">agent.log</span>
              {isRunning && (
                <span className="flex items-center gap-1 text-[10px] text-red-400">
                  <CircleDot className="w-2.5 h-2.5 animate-pulse" /> LIVE
                </span>
              )}
            </div>
            <button onClick={() => setAgentLog([])}
              className="text-[11px] text-white/30 hover:text-white/60 transition-all">
              Clear
            </button>
          </div>

          <div ref={logRef} className="p-4 h-72 overflow-y-auto font-mono text-[12px] space-y-1.5 scroll-smooth">
            {agentLog.length === 0 ? (
              <div className="text-white/20 text-center py-8">
                Build log will appear here when you start a build
              </div>
            ) : (
              agentLog.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-white/20 flex-shrink-0 text-[10px] mt-0.5">
                    {new Date(entry.ts).toLocaleTimeString("en-US", { hour12: false })}
                  </span>
                  <span className={cn("flex-shrink-0 text-[10px] font-bold w-14 text-right mt-0.5", {
                    "text-blue-400":  entry.level === "info",
                    "text-green-400": entry.level === "success",
                    "text-yellow-400": entry.level === "warn",
                    "text-purple-400": entry.level === "agent",
                    "text-red-400":   entry.level === "error",
                  })}>
                    {entry.level.toUpperCase()}
                  </span>
                  {entry.source && (
                    <span className="text-white/30 flex-shrink-0 text-[11px]">[{entry.source}]</span>
                  )}
                  <span className={cn({
                    "text-white/70": entry.level === "info",
                    "text-green-300": entry.level === "success",
                    "text-yellow-300": entry.level === "warn",
                    "text-purple-200": entry.level === "agent",
                    "text-red-300":   entry.level === "error",
                  })}>
                    {entry.msg}
                  </span>
                </div>
              ))
            )}
            {isRunning && (
              <div className="flex items-center gap-2 text-white/30 text-[11px]">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>processing…</span>
                <span className="animate-pulse">|</span>
              </div>
            )}
          </div>

          {/* Job status bar */}
          {activeJob && (
            <div className="px-4 py-2.5 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isRunning
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: ACCENT }} />
                  : activeJob.status === "completed"
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                <span className="text-[12px] font-mono capitalize"
                  style={{ color: isRunning ? ACCENT : activeJob.status === "completed" ? "#22c55e" : "#ef4444" }}>
                  {activeJob.status}
                </span>
              </div>
              <span className="text-[11px] font-mono text-white/30">
                {activeJob.companiesHarvested != null
                  ? `${activeJob.companiesHarvested.toLocaleString()} records built`
                  : `job: ${activeJob.jobId}`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Database results view ─────────────────────────────────────────────── */}
      {activeView === "results" && (
        <div className="rounded-xl border border-border/20 bg-card/40 flex flex-col">
          {/* Toolbar */}
          <div className="p-3 border-b border-border/20 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); loadResults(1, e.target.value); }}
                placeholder="Search built database…"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border/40 bg-background text-[12px]"
              />
            </div>
            <span className="text-[12px] text-muted-foreground whitespace-nowrap">
              {total.toLocaleString()} companies built
            </span>
            <button
              onClick={() => {
                void fetch(`/api/builder/results/export`).then((r) => r.blob()).then((blob) => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url;
                  a.download = `builder-export-${Date.now()}.csv`; a.click();
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/30 text-[11px] hover:bg-muted/40 transition-all">
              <Download className="w-3 h-3" /> Export
            </button>
          </div>

          {/* Results */}
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground/40">
              <Bot className="w-12 h-12" />
              <div className="text-[13px] text-center max-w-xs">
                No database entries yet.<br />Start a build to generate company records.
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {results.map((c: any, idx: number) => (
                <ResultRow key={c.id ?? idx} company={c} onPushCrm={pushToCrm} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className="p-3 border-t border-border/20 flex items-center justify-between">
              <button disabled={page <= 1} onClick={() => loadResults(page - 1, search)}
                className="px-3 py-1 rounded-lg text-[12px] border border-border/30 hover:bg-muted/40 disabled:opacity-30 transition-all">
                ← Previous
              </button>
              <span className="text-[12px] text-muted-foreground">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button disabled={page >= Math.ceil(total / 20)} onClick={() => loadResults(page + 1, search)}
                className="px-3 py-1 rounded-lg text-[12px] border border-border/30 hover:bg-muted/40 disabled:opacity-30 transition-all">
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Result row ────────────────────────────────────────────────────────────────
function ResultRow({ company: c, onPushCrm }: { company: any; onPushCrm: (id: number) => void }) {
  const score  = c.enrichmentScore ?? c.icpScore ?? null;
  const color  = score == null ? "#888" : score >= 70 ? "#22c55e" : score >= 40 ? GOLD : "#ef4444";

  return (
    <div className="px-5 py-4 flex items-center gap-4 hover:bg-muted/10 transition-colors">
      {/* Score ring */}
      <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-bold text-[12px]"
        style={{ borderColor: color, color }}>
        {score ?? "?"}
      </div>

      {/* Company info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[13px]">{c.nameEn || c.name || "—"}</span>
          {c.nameAr && (
            <span className="text-[11px] text-muted-foreground" dir="rtl">{c.nameAr}</span>
          )}
          {c.enrichmentStatus === "enriched" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: "#22c55e15", color: "#22c55e" }}>
              enriched
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {c.industry && (
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-border/30 text-muted-foreground">
              {c.industry}
            </span>
          )}
          {c.city && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="w-3 h-3" />{c.city}
            </span>
          )}
          {c.sourceId && (
            <span className="text-[10px] text-muted-foreground opacity-60">
              via {c.sourceId}
            </span>
          )}
        </div>
      </div>

      {/* Contact quick-links */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {c.phone && (
          <a href={`tel:${c.phone}`}
            className="p-1.5 rounded-lg border border-border/30 hover:bg-muted/40 transition-all"
            title={c.phone}>
            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        )}
        {c.email && (
          <a href={`mailto:${c.email}`}
            className="p-1.5 rounded-lg border border-border/30 hover:bg-muted/40 transition-all"
            title={c.email}>
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        )}
        {c.website && (
          <a href={c.website} target="_blank" rel="noreferrer"
            className="p-1.5 rounded-lg border border-border/30 hover:bg-muted/40 transition-all"
            title={c.website}>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        )}
      </div>

      {/* CRM action */}
      <div className="flex-shrink-0">
        {!c.crmCompanyId ? (
          <button onClick={() => onPushCrm(c.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #7C3AED)` }}>
            <ArrowRight className="w-3 h-3" /> Push to CRM
          </button>
        ) : (
          <span className="flex items-center gap-1 text-[11px] text-green-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> In CRM
          </span>
        )}
      </div>
    </div>
  );
}
