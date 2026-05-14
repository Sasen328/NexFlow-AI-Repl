/**
 * Masar Database Panel
 * ====================
 * 25-source agentic Saudi/GCC company harvest.
 * Dedicated file — extracted from enrichment-engine.tsx.
 *
 * Layout: two-column
 *   LEFT  — Source Library (grouped by category, per-source status)
 *   RIGHT — Harvest Workspace + Live Progress + Company Database
 */

import { useState, useEffect, useRef } from "react";
import {
  Building2, Search, Play, Loader2, CheckCircle2, XCircle,
  RefreshCw, ExternalLink, ArrowRight, Filter, Download,
  LayoutGrid, List, ChevronDown, MapPin, Phone, Mail,
  Globe, Landmark, BadgeCheck, Clock, AlertTriangle,
  Database, BookOpen, Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";

const TEAL   = "#88B8B0";
const GOLD   = "#C8A880";
const ACCENT = "#B8A0C8";
const NAVY   = "#1E3A5F";

// ── Source categories ─────────────────────────────────────────────────────────
const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  government:  { label: "Government Registries",  icon: Landmark,  color: "#1E6F9F" },
  chamber:     { label: "Chambers of Commerce",   icon: Building2, color: "#2D7D6F" },
  financial:   { label: "Financial Platforms",    icon: Database,  color: "#8B5E3C" },
  directory:   { label: "Business Directories",   icon: BookOpen,  color: "#6B4F9E" },
  portal:      { label: "Industry Portals",       icon: Globe,     color: "#2E7D52" },
  association: { label: "Trade Associations",     icon: BadgeCheck,color: "#7D5E2E" },
  custom:      { label: "Custom Sources",         icon: Cpu,       color: "#555" },
};

type SourceStatus = "idle" | "crawling" | "done" | "failed";

interface SourceState {
  id: string;
  name: string;
  url?: string;
  category: string;
  harvestedCount?: number;
  estimatedCompanies?: number;
  status?: SourceStatus;
}

interface JobState {
  jobId: string;
  status: string;
  companiesHarvested?: number;
  sourceProgress?: Record<string, SourceStatus>;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

// ── Main component ────────────────────────────────────────────────────────────
export function MasarDatabasePanel() {
  const [sources,     setSources]     = useState<SourceState[]>([]);
  const [companies,   setCompanies]   = useState<any[]>([]);
  const [stats,       setStats]       = useState<any>(null);
  const [activeJob,   setActiveJob]   = useState<JobState | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const [search,      setSearch]      = useState("");
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [depth,       setDepth]       = useState("standard");
  const [cityFilter,  setCityFilter]  = useState("all");
  const [viewMode,    setViewMode]    = useState<"grid" | "list">("list");
  const [catFilter,   setCatFilter]   = useState<string>("all");
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    void apiFetch("/masar/sources").then((d: any) => setSources(Array.isArray(d) ? d : [])).catch(() => {});
    void apiFetch("/masar/stats").then(setStats).catch(() => {});
    loadCompanies(1, "");
  }, []);

  function loadCompanies(p: number, q: string) {
    setLoading(true);
    const cityQ = cityFilter !== "all" ? `&city=${encodeURIComponent(cityFilter)}` : "";
    void apiFetch(`/masar/companies?page=${p}&limit=20&search=${encodeURIComponent(q)}${cityQ}`)
      .then((d: any) => { setCompanies(d.companies || []); setTotal(d.total || 0); setPage(p); })
      .finally(() => setLoading(false));
  }

  function toggleSource(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectCategory(cat: string) {
    const catSources = sources.filter((s) => s.category === cat).map((s) => s.id);
    const allSelected = catSources.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) catSources.forEach((id) => next.delete(id));
      else catSources.forEach((id) => next.add(id));
      return next;
    });
  }

  async function startHarvest() {
    if (activeJob && !["completed","failed","cancelled"].includes(activeJob.status)) return;
    try {
      const data: any = await apiFetch("/masar/harvest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceIds:       selected.size > 0 ? Array.from(selected) : undefined,
          enrichmentDepth: depth,
        }),
      });
      setActiveJob(data);
      pollRef.current = setInterval(() => {
        void apiFetch(`/masar/jobs/${data.jobId}`).then((j: any) => {
          setActiveJob(j);
          if (j.status === "completed" || j.status === "failed") {
            clearInterval(pollRef.current);
            void apiFetch("/masar/stats").then(setStats);
            loadCompanies(1, search);
          }
        }).catch(() => {});
      }, 2500);
    } catch (e) {
      console.error("Harvest failed", e);
    }
  }

  async function pushToCrm(id: number) {
    await apiFetch(`/masar/companies/${id}/push-crm`, { method: "POST" });
    loadCompanies(page, search);
  }

  async function exportResults() {
    try {
      const blob = await fetch(`/api/masar/companies/export?search=${encodeURIComponent(search)}`).then((r) => r.blob());
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `masar-export-${Date.now()}.csv`; a.click();
    } catch { /* silent */ }
  }

  useEffect(() => () => clearInterval(pollRef.current), []);

  const isRunning = activeJob && !["completed","failed","cancelled"].includes(activeJob.status ?? "");

  // Group sources by category
  const grouped = sources.reduce<Record<string, SourceState[]>>((acc, s) => {
    const cat = s.category || "directory";
    (acc[cat] = acc[cat] || []).push(s);
    return acc;
  }, {});

  const filteredCats = catFilter === "all" ? Object.entries(grouped) : Object.entries(grouped).filter(([c]) => c === catFilter);

  const CITIES = ["all","Riyadh","Jeddah","Dammam","Mecca","Medina","Khobar","Dhahran"];

  return (
    <div className="flex gap-5 min-h-[600px]">

      {/* ── LEFT: Source Library ─────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-3">

        {/* Library header */}
        <div className="rounded-xl border border-border/30 bg-card/60 p-4"
          style={{ borderTop: `3px solid ${TEAL}` }}>
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-4 h-4" style={{ color: TEAL }} />
            <span className="font-bold text-[13px]">Source Library</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {sources.length} Saudi &amp; GCC registries
            {selected.size > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: `${TEAL}20`, color: TEAL }}>
                {selected.size} selected
              </span>
            )}
          </div>

          {/* Category filter tabs */}
          <div className="mt-3 flex flex-wrap gap-1">
            {["all", ...Object.keys(grouped)].map((c) => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all",
                  catFilter === c ? "text-white border-transparent" : "border-border/30 text-muted-foreground hover:border-border")}
                style={catFilter === c ? { background: TEAL } : undefined}>
                {c === "all" ? "All" : CATEGORY_META[c]?.label?.split(" ")[0] || c}
              </button>
            ))}
          </div>
        </div>

        {/* Source groups */}
        <div className="flex-1 overflow-y-auto space-y-3 max-h-[520px] pr-1">
          {filteredCats.map(([cat, srcs]) => {
            const meta   = CATEGORY_META[cat] || CATEGORY_META.custom;
            const Icon   = meta.icon;
            const allSel = srcs.every((s) => selected.has(s.id));
            return (
              <div key={cat} className="rounded-xl border border-border/20 bg-card/40 overflow-hidden">
                {/* Category header */}
                <div className="px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-muted/20"
                  style={{ borderLeft: `3px solid ${meta.color}` }}
                  onClick={() => selectCategory(cat)}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                    <span className="text-[11px] font-semibold">{meta.label}</span>
                    <span className="text-[10px] text-muted-foreground">({srcs.length})</span>
                  </div>
                  <div className={cn("w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all",
                    allSel ? "border-transparent" : "border-border/40")}
                    style={allSel ? { background: meta.color } : undefined}>
                    {allSel && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                  </div>
                </div>

                {/* Source rows */}
                {srcs.map((s) => {
                  const sel = selected.has(s.id);
                  const srcStatus: SourceStatus = isRunning
                    ? ((activeJob as any)?.sourceProgress?.[s.id] ?? "idle")
                    : "idle";
                  return (
                    <div key={s.id}
                      onClick={() => toggleSource(s.id)}
                      className={cn("px-3 py-2 flex items-center gap-2 cursor-pointer transition-all border-t border-border/10",
                        sel ? "bg-muted/30" : "hover:bg-muted/10")}>
                      <div className={cn("w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-all",
                        sel ? "border-transparent" : "border-border/30")}
                        style={sel ? { background: meta.color } : undefined}>
                        {sel && <svg className="w-2 h-2 text-white" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium truncate">{s.name}</div>
                        {s.harvestedCount ? (
                          <div className="text-[10px] text-muted-foreground">{s.harvestedCount.toLocaleString()} found</div>
                        ) : s.estimatedCompanies ? (
                          <div className="text-[10px] text-muted-foreground">~{s.estimatedCompanies.toLocaleString()} est.</div>
                        ) : null}
                      </div>
                      {/* Live status indicator */}
                      {isRunning && sel && (
                        <div className="flex-shrink-0">
                          {srcStatus === "crawling" && <Loader2 className="w-3 h-3 animate-spin" style={{ color: TEAL }} />}
                          {srcStatus === "done"     && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                          {srcStatus === "failed"   && <XCircle className="w-3 h-3 text-red-400" />}
                          {srcStatus === "idle"     && <Clock className="w-3 h-3 text-muted-foreground/40" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Select all / clear */}
        <div className="flex gap-2">
          <button onClick={() => setSelected(new Set(sources.map((s) => s.id)))}
            className="flex-1 py-1.5 rounded-lg border border-border/30 text-[11px] text-muted-foreground hover:bg-muted/30 transition-all">
            Select All
          </button>
          <button onClick={() => setSelected(new Set())}
            className="flex-1 py-1.5 rounded-lg border border-border/30 text-[11px] text-muted-foreground hover:bg-muted/30 transition-all">
            Clear
          </button>
        </div>
      </div>

      {/* ── RIGHT: Harvest Workspace ──────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">

        {/* Stats bar */}
        {stats && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Records",    value: stats.total,       icon: Database,     color: TEAL  },
              { label: "Enriched",         value: stats.enriched,    icon: CheckCircle2, color: "#22c55e" },
              { label: "Pending",          value: stats.pending,     icon: Clock,        color: GOLD  },
              { label: "Pushed to CRM",    value: stats.pushedToCrm, icon: ArrowRight,   color: ACCENT},
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl border border-border/20 bg-card/50 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}18` }}>
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <div>
                    <div className="text-[20px] font-bold leading-tight" style={{ color: s.color }}>
                      {(s.value ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Harvest control bar */}
        <div className="rounded-xl border border-border/30 bg-card/50 p-4"
          style={{ borderLeft: `4px solid ${TEAL}` }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="font-bold text-[14px]">
                {selected.size > 0 ? `Harvest ${selected.size} Selected Sources` : "Harvest All 25 Sources"}
              </div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                Scraper engine → AI enrichment agents → structured company records
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={depth} onChange={(e) => setDepth(e.target.value)}
                className="text-[12px] border border-border/40 rounded-lg px-3 py-1.5 bg-background">
                <option value="basic">Basic — scraper only</option>
                <option value="standard">Standard — scraper + 3 agents</option>
                <option value="deep">Deep — scraper + 14 agents</option>
              </select>
              <button
                onClick={startHarvest}
                disabled={!!isRunning}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold text-white disabled:opacity-60 transition-all"
                style={{ background: isRunning ? "#6B7280" : `linear-gradient(135deg, ${TEAL}, ${NAVY})` }}>
                {isRunning
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Harvesting…</>
                  : <><Play className="w-4 h-4" /> Start Harvest</>}
              </button>
            </div>
          </div>

          {/* Active job progress */}
          {activeJob && (
            <div className="mt-4 rounded-lg border border-border/20 bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isRunning
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: TEAL }} />
                    : activeJob.status === "completed"
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                  <span className="text-[12px] font-semibold capitalize">{activeJob.status}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {activeJob.companiesHarvested != null && (
                    <span>{activeJob.companiesHarvested.toLocaleString()} companies harvested</span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {isRunning && selected.size > 0 && (
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full animate-pulse"
                    style={{ width: "60%", background: `linear-gradient(90deg, ${TEAL}, ${ACCENT})` }} />
                </div>
              )}

              {activeJob.error && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-red-400">
                  <AlertTriangle className="w-3 h-3" />
                  {activeJob.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Company database */}
        <div className="flex-1 rounded-xl border border-border/20 bg-card/40 flex flex-col">
          {/* Toolbar */}
          <div className="p-3 border-b border-border/20 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); loadCompanies(1, e.target.value); }}
                placeholder="Search company name, CR, city…"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border/40 bg-background text-[12px]"
              />
            </div>

            <select value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); loadCompanies(1, search); }}
              className="text-[12px] border border-border/40 rounded-lg px-2.5 py-1.5 bg-background">
              {CITIES.map((c) => <option key={c} value={c}>{c === "all" ? "All Cities" : c}</option>)}
            </select>

            <div className="flex items-center gap-1 border border-border/30 rounded-lg p-0.5">
              <button onClick={() => setViewMode("list")}
                className={cn("p-1.5 rounded-md transition-all", viewMode === "list" ? "bg-muted" : "hover:bg-muted/50")}>
                <List className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setViewMode("grid")}
                className={cn("p-1.5 rounded-md transition-all", viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50")}>
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-[12px] text-muted-foreground whitespace-nowrap">
              {total.toLocaleString()} records
            </span>

            <button onClick={exportResults}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/30 text-[11px] hover:bg-muted/40 transition-all">
              <Download className="w-3 h-3" /> Export CSV
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : companies.length === 0 ? (
              <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground/40">
                <Landmark className="w-12 h-12" />
                <div className="text-[13px] text-center max-w-xs">
                  No companies harvested yet.<br/>Select sources and start a harvest.
                </div>
              </div>
            ) : viewMode === "list" ? (
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-card/80 backdrop-blur-sm border-b border-border/20">
                  <tr className="text-muted-foreground">
                    {["Company","CR Number","Industry","City","Contact","Enrichment","Actions"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left font-medium text-[11px] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c: any) => (
                    <tr key={c.id} className="border-b border-border/10 hover:bg-muted/15 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{c.nameEn}</div>
                        {c.nameAr && <div className="text-[11px] text-muted-foreground mt-0.5" dir="rtl">{c.nameAr}</div>}
                      </td>
                      <td className="px-4 py-3">
                        {c.crNumber ? (
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-muted/60 border border-border/30">
                            {c.crNumber}
                          </span>
                        ) : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {c.industry ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] border border-border/30 text-muted-foreground">
                            {c.industry}
                          </span>
                        ) : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {c.city ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {c.city}
                          </div>
                        ) : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          {c.phone && (
                            <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-[11px]" style={{ color: TEAL }}>
                              <Phone className="w-2.5 h-2.5" />{c.phone}
                            </a>
                          )}
                          {c.email && (
                            <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-[11px] truncate max-w-[130px]" style={{ color: TEAL }}>
                              <Mail className="w-2.5 h-2.5" />{c.email}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <EnrichmentBadge status={c.enrichmentStatus} score={c.enrichmentScore} />
                      </td>
                      <td className="px-4 py-3">
                        {!c.crmCompanyId ? (
                          <button onClick={() => pushToCrm(c.id)}
                            className="px-3 py-1 rounded-lg text-[11px] font-semibold text-white transition-all hover:opacity-90"
                            style={{ background: `linear-gradient(135deg, ${TEAL}, ${NAVY})` }}>
                            Push to CRM
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-green-600">
                            <CheckCircle2 className="w-3 h-3" /> In CRM
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* Grid view */
              <div className="p-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
                {companies.map((c: any) => (
                  <div key={c.id} className="rounded-xl border border-border/20 bg-card/50 p-4 flex flex-col gap-2 hover:border-border/40 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-[13px] leading-tight">{c.nameEn}</div>
                        {c.nameAr && <div className="text-[11px] text-muted-foreground" dir="rtl">{c.nameAr}</div>}
                      </div>
                      <EnrichmentBadge status={c.enrichmentStatus} score={c.enrichmentScore} compact />
                    </div>
                    {c.crNumber && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-muted/60 border border-border/30 self-start">
                        CR {c.crNumber}
                      </span>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {c.city && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />{c.city}
                        </span>
                      )}
                      {c.industry && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border/30 text-muted-foreground">
                          {c.industry}
                        </span>
                      )}
                    </div>
                    {!c.crmCompanyId ? (
                      <button onClick={() => pushToCrm(c.id)}
                        className="mt-auto px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white w-full"
                        style={{ background: `linear-gradient(135deg, ${TEAL}, ${NAVY})` }}>
                        Push to CRM
                      </button>
                    ) : (
                      <span className="mt-auto text-[11px] text-green-600 flex items-center gap-1 justify-center">
                        <CheckCircle2 className="w-3 h-3" /> In CRM
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="p-3 border-t border-border/20 flex items-center justify-between">
              <button disabled={page <= 1} onClick={() => loadCompanies(page - 1, search)}
                className="px-3 py-1 rounded-lg text-[12px] border border-border/30 hover:bg-muted/40 disabled:opacity-30 transition-all">
                ← Previous
              </button>
              <span className="text-[12px] text-muted-foreground">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button disabled={page >= Math.ceil(total / 20)} onClick={() => loadCompanies(page + 1, search)}
                className="px-3 py-1 rounded-lg text-[12px] border border-border/30 hover:bg-muted/40 disabled:opacity-30 transition-all">
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Enrichment badge ──────────────────────────────────────────────────────────
function EnrichmentBadge({
  status, score, compact = false,
}: { status?: string; score?: number; compact?: boolean }) {
  const s = status ?? "pending";
  const cfg = {
    enriched: { label: "Enriched",  color: "#22c55e",  bg: "#22c55e15" },
    pending:  { label: "Pending",   color: GOLD,        bg: `${GOLD}15` },
    failed:   { label: "Failed",    color: "#ef4444",  bg: "#ef444415" },
  }[s] ?? { label: s, color: "#888", bg: "#88888815" };

  if (compact) {
    return (
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
        style={{ background: score != null && score >= 70 ? "#22c55e" : score != null && score >= 40 ? GOLD : cfg.color }}>
        {score ?? "—"}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ color: cfg.color, background: cfg.bg }}>
        {cfg.label}
      </span>
      {score != null && (
        <span className="text-[11px] font-bold" style={{ color: score >= 70 ? "#22c55e" : score >= 40 ? GOLD : "#ef4444" }}>
          {score}
        </span>
      )}
    </div>
  );
}
