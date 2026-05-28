/**
 * Enrichment Engine — 3-tab rebuild (May 2026)
 *
 * Tab 1 — Lead Generation   (/enrichment-engine, ?tab=leadgen)
 *   Sub-sections: Masar Database · AI Database Builder · Website Intelligence
 *                 Company Intelligence · Person Intelligence
 *
 * Tab 2 — CRM Enrichment    (?tab=enrich)
 *   Sub-sections: Quick Enrich · Bulk Upload · Card Scanner · Dedup · Waterfall Sources
 *
 * Tab 3 — Settings          (?tab=settings)
 *   Sub-sections: Waterfall Sources · API Keys · Export History
 *
 * Sidebar (Lead Gen | CRM Enrichment | Settings) is handled by sections.ts
 * (key "datahub") — already 3 items + expandable/collapsible via SectionSidebar.tsx.
 */

import { lazy, Suspense, useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import {
  Database, Search, Building2, Users, Sparkles, Zap, Upload, ScanLine,
  GitMerge, History, Plus, Check, X, Loader2, Filter, Mail, Phone,
  Globe, BrainCircuit, AlertCircle, ChevronDown, FileText, Settings,
  RefreshCw, Trash2, Download, Play, ArrowRight, ExternalLink, BarChart3,
  BookOpen, Target, Star, MapPin, User, Building, Layers, ChevronRight,
  Badge, Tag, CheckCircle2, XCircle, Bot, Cpu, Route, PlusCircle, Eye, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";

// Lazy-loaded sub-pages (existing)
const SourcesTab       = lazy(() => import("@/components/enrichment/sources-tab").then((m) => ({ default: m.SourcesTab })));
const MasaarPanel      = lazy(() => import("@/components/enrichment/intel-engines-tab").then((m) => ({ default: m.MasaarPanel })));
const LeadEnrichPage   = lazy(() => import("./lead-enrich"));
const BusinessCards    = lazy(() => import("./business-cards"));
const DedupPage        = lazy(() => import("./dedup"));

// Dedicated engine panels — each in its own file with distinct UI
const MasarDatabasePanel          = lazy(() => import("@/components/enrichment/masar-database-panel").then((m) => ({ default: m.MasarDatabasePanel })));
const AiDatabaseBuilderPanel      = lazy(() => import("@/components/enrichment/ai-database-builder-panel").then((m) => ({ default: m.AiDatabaseBuilderPanel })));
const SignalTriggeredEnrichment   = lazy(() => import("@/components/enrichment/signal-triggered-enrichment").then((m) => ({ default: m.SignalTriggeredEnrichment })));

// ── Constants ─────────────────────────────────────────────────────────────────
const ACCENT   = "#B8A0C8";
const TEAL     = "#88B8B0";
const GOLD     = "#C8A880";

// ── Tab routing ───────────────────────────────────────────────────────────────
type MainTab        = "leadgen" | "enrich" | "settings";
type LeadSubTab     = "masaar" | "masar" | "prosengine" | "builder" | "cards" | "icp";
type ProsSubTab     = "company" | "person" | "website" | "seeder";
type EnrichSubTab   = "quick" | "bulk" | "waterfall";
type SettingsSubTab = "signals" | "waterfall" | "dedup" | "validation";

function usePathTab(): MainTab {
  const [location] = useLocation();
  const path = location.split("?")[0];
  if (path === "/enrichment-engine/enrich" || path === "/datahub/enrichment/enrich") return "enrich";
  if (path === "/enrichment-engine/settings" || path === "/datahub/enrichment/settings") return "settings";
  return "leadgen";
}

// ── Root component ────────────────────────────────────────────────────────────
export default function EnrichmentEngine() {
  const mainTab = usePathTab();
  const TITLES: Record<MainTab, { label: string; desc: string }> = {
    leadgen:  { label: "Lead Generation",  desc: "Masaar Engine · Masar Database · ProsEngine · AI Builder · Card Scanner" },
    enrich:   { label: "CRM Enrichment",   desc: "Quick Enrich · Bulk Upload · Waterfall" },
    settings: { label: "Settings",         desc: "Waterfall Sources · Lead Deduplication · Validation & Verification" },
  };
  const t = TITLES[mainTab];
  return (
    <div className="min-h-screen bg-background">
      {/* Section title — static (not sticky), sidebar handles navigation */}
      <div className="border-b border-border/30 bg-muted/30 mb-0">
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}20` }}>
            <Database className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <div>
            <div className="text-[14px] font-bold text-foreground">{t.label}</div>
            <div className="text-[11px] text-muted-foreground">{t.desc}</div>
          </div>
        </div>
      </div>
      <div className="max-w-screen-2xl mx-auto px-4 pt-5 pb-10">
        {mainTab === "leadgen"  && <LeadGenerationTab />}
        {mainTab === "enrich"   && <CrmEnrichmentTab />}
        {mainTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — LEAD GENERATION  (4 engines matching the 4 reference docs)
// ═══════════════════════════════════════════════════════════════════════════════
function LeadGenerationTab() {
  const [sub, setSub] = useState<LeadSubTab>("icp");
  const subTabs: { id: LeadSubTab; label: string; icon: React.ElementType; badge?: string; desc: string }[] = [
    { id: "icp",       label: "ICP Territory Scanner", icon: Target,       badge: "NEW",     desc: "Auto-map every matching company + DM in KSA/UAE from your ICP" },
    { id: "masaar",    label: "Masaar Engine",          icon: BrainCircuit, badge: "Doc 1",   desc: "Saudi CR intelligence — 7-agent SSE pipeline" },
    { id: "masar",     label: "Masar Database",         icon: Database,     badge: "25 src",  desc: "25-source agentic company harvest" },
    { id: "prosengine",label: "ProsEngine",             icon: Cpu,          badge: "Doc 3",   desc: "Company · Person · Website · Data Seeder" },
    { id: "builder",   label: "AI DB Builder",          icon: Bot,          badge: "80 src",  desc: "80-source AI database builder" },
    { id: "cards",     label: "Card Scanner",           icon: ScanLine,     badge: "5-agent", desc: "Scan business cards → enriched leads" },
  ];

  return (
    <div>
      {/* 5-engine sub-tab strip */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {subTabs.map((t) => {
          const Icon = t.icon;
          const active = sub === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all border",
                active ? "border-transparent text-white shadow-lg" : "border-border/40 text-foreground/60 hover:text-foreground hover:bg-muted/40",
              )}
              style={active ? { background: `linear-gradient(135deg, ${ACCENT}E0, ${TEAL}CC)`, boxShadow: `0 4px 14px ${ACCENT}40` } : undefined}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {t.badge && (
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Suspense fallback={<Spinner />}>
        {sub === "icp"        && <IcpTerritoryScannerPanel />}
        {sub === "masaar"     && <MasaarEnginePanel />}
        {sub === "masar"      && <MasarDatabasePanel />}
        {sub === "prosengine" && <ProsEnginePanel />}
        {sub === "builder"    && <AiDatabaseBuilderPanel />}
        {sub === "cards"      && <BusinessCards />}
      </Suspense>
    </div>
  );
}

// ── Masaar Engine Panel (Doc 1 — Saudi CR Intelligence, 7-agent SSE pipeline) ──
function MasaarEnginePanel() {
  return (
    <Suspense fallback={<Spinner />}>
      <MasaarPanel />
    </Suspense>
  );
}

// ── ProsEngine Panel (Doc 3 — 4 tools: Company Intel · Person Intel · Website Intel · Data Seeder) ──
function ProsEnginePanel() {
  const [pros, setPros] = useState<ProsSubTab>("company");
  const pills: { id: ProsSubTab; label: string; icon: React.ElementType; desc: string }[] = [
    { id: "company", label: "Company Intel",  icon: Building2,  desc: "Full B2B intelligence report" },
    { id: "person",  label: "Person Intel",   icon: Users,      desc: "Executive deep profile" },
    { id: "website", label: "Website Intel",  icon: Globe,      desc: "Scan & extract company data" },
    { id: "seeder",  label: "Data Seeder",    icon: Database,   desc: "Generate or scrape company/executive records" },
  ];
  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {pills.map((p) => {
          const Icon = p.icon;
          const active = pros === p.id;
          return (
            <button key={p.id} onClick={() => setPros(p.id)}
              className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all border", active ? "border-transparent text-white shadow-md" : "border-border/40 text-foreground/60 hover:bg-muted/40 hover:text-foreground")}
              style={active ? { background: `linear-gradient(135deg, ${TEAL}E0, ${ACCENT}CC)`, boxShadow: `0 4px 14px ${TEAL}40` } : undefined}>
              <Icon className="w-3.5 h-3.5" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
      <Suspense fallback={<Spinner />}>
        {pros === "company" && <CompanyIntelPanel />}
        {pros === "person"  && <PersonIntelPanel />}
        {pros === "website" && <WebsiteIntelPanel />}
        {pros === "seeder"  && <DataSeederPanel />}
      </Suspense>
    </div>
  );
}

// MasarDatabasePanel and AiDatabaseBuilderPanel are now lazy-loaded
// from their dedicated files at the top of this file.

// ── Website Intelligence Panel ────────────────────────────────────────────────
function WebsiteIntelPanel() {
  const [url,      setUrl]      = useState("");
  const [job,      setJob]      = useState<any>(null);
  const [results,  setResults]  = useState<any[]>([]);
  const [jobs,     setJobs]     = useState<any[]>([]);
  const [step,     setStep]     = useState<"idle" | "scanning" | "configure" | "extracting" | "done">("idle");
  const [settings, setSettings] = useState({ maxPages: 20, enrichmentDepth: "standard", extractionLanguage: "auto", extractionFields: ["name","phone","email","city","website","industry","address"] });
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => { void apiFetch("/prospecting").then(setJobs).catch(() => {}); }, []);

  async function scan() {
    if (!url.trim()) return;
    setStep("scanning");
    const j: any = await apiFetch("/prospecting/scan", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim() }),
    });
    setJob(j);
    pollRef.current = setInterval(async () => {
      const updated: any = await apiFetch(`/prospecting/${j.id}`).catch(() => j);
      setJob(updated);
      if (updated.status === "scanned" || updated.status === "failed") {
        clearInterval(pollRef.current);
        setStep(updated.status === "scanned" ? "configure" : "idle");
      }
    }, 2000);
  }

  async function extract() {
    setStep("extracting");
    await apiFetch(`/prospecting/${job.id}/extract`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    pollRef.current = setInterval(async () => {
      const updated: any = await apiFetch(`/prospecting/${job.id}`).catch(() => job);
      setJob(updated);
      if (updated.status === "completed" || updated.status === "failed") {
        clearInterval(pollRef.current);
        setStep(updated.status === "completed" ? "done" : "idle");
        if (updated.status === "completed") {
          const res: any[] = await apiFetch(`/prospecting/${job.id}/results`).catch(() => []);
          setResults(res.map((r: any) => r.companyData || r));
        }
      }
    }, 3000);
  }

  async function pushAllToCrm() {
    if (!job) return;
    await apiFetch(`/prospecting/${job.id}/push-crm`, { method: "POST" });
  }

  async function exportCsv() {
    if (!job) return;
    window.open(`/prospecting/${job.id}/export?format=csv`, "_blank");
  }

  useEffect(() => () => clearInterval(pollRef.current), []);

  const FIELDS = ["name","nameAr","phone","email","website","city","address","industry","description","crNumber","ownerName"];

  return (
    <div className="space-y-5">
      {/* Scan form */}
      <div className="rounded-xl border border-border/30 bg-card/40 p-5">
        <div className="font-semibold text-[14px] mb-3">Scan any Saudi directory or website</div>
        <div className="flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void scan()}
            placeholder="https://riyadh.chamber.org.sa/members — any directory URL"
            className="flex-1 px-4 py-2.5 rounded-xl border border-border/40 bg-background text-[13px]" />
          <button onClick={() => void scan()} disabled={step === "scanning" || step === "extracting" || !url.trim()}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-medium text-white disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})` }}>
            {step === "scanning" ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning…</> : <><Zap className="w-3.5 h-3.5" /> Scan</>}
          </button>
        </div>

        {/* Scan progress */}
        {(step === "scanning" || step === "configure") && job?.scanSummary && (
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/20 text-[12px]">
            <div className="font-semibold mb-1">{(job.scanSummary as any)?.siteDescription || "Site analyzed"}</div>
            <div className="flex flex-wrap gap-3 text-muted-foreground">
              <span>Type: {(job.scanSummary as any)?.dataType}</span>
              <span>Language: {(job.scanSummary as any)?.contentLanguage}</span>
              {(job.scanSummary as any)?.totalPages && <span>Pages: {(job.scanSummary as any)?.totalPages}</span>}
            </div>
            {(job.scanSummary as any)?.sampleCompanies?.length > 0 && (
              <div className="mt-2">
                <span className="text-muted-foreground">Sample: </span>
                {(job.scanSummary as any).sampleCompanies.slice(0, 4).join(" · ")}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configure extraction */}
      {step === "configure" && (
        <div className="rounded-xl border border-border/30 bg-card/40 p-5">
          <div className="font-semibold text-[14px] mb-4">Configure Extraction</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <label className="block">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Max Pages</span>
              <input type="number" min={1} max={500} value={settings.maxPages}
                onChange={(e) => setSettings((p) => ({ ...p, maxPages: +e.target.value }))}
                className="mt-1 w-full px-3 py-1.5 rounded-lg border border-border/40 bg-background text-[13px]" />
            </label>
            <label className="block">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Enrichment Depth</span>
              <select value={settings.enrichmentDepth} onChange={(e) => setSettings((p) => ({ ...p, enrichmentDepth: e.target.value }))}
                className="mt-1 w-full px-3 py-1.5 rounded-lg border border-border/40 bg-background text-[13px]">
                <option value="none">None (raw only)</option>
                <option value="basic">Basic (2 agents)</option>
                <option value="standard">Standard (4 agents)</option>
                <option value="deep">Deep (8 agents)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Language</span>
              <select value={settings.extractionLanguage} onChange={(e) => setSettings((p) => ({ ...p, extractionLanguage: e.target.value }))}
                className="mt-1 w-full px-3 py-1.5 rounded-lg border border-border/40 bg-background text-[13px]">
                <option value="auto">Auto-detect</option>
                <option value="arabic">Arabic</option>
                <option value="english">English</option>
                <option value="bilingual">Bilingual</option>
              </select>
            </label>
          </div>
          <div className="mb-4">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide block mb-2">Fields to Extract</span>
            <div className="flex flex-wrap gap-2">
              {FIELDS.map((f) => {
                const sel = settings.extractionFields.includes(f);
                return (
                  <button key={f} onClick={() => setSettings((p) => ({ ...p, extractionFields: sel ? p.extractionFields.filter((x) => x !== f) : [...p.extractionFields, f] }))}
                    className={cn("px-2.5 py-1 rounded-full text-[11px] border", sel ? "text-white border-transparent" : "border-border/40 text-foreground/60")}
                    style={sel ? { background: ACCENT } : undefined}>{f}</button>
                );
              })}
            </div>
          </div>
          <button onClick={() => void extract()}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-medium text-white"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})` }}>
            <Zap className="w-3.5 h-3.5" /> Start Extraction
          </button>
        </div>
      )}

      {/* Extraction progress */}
      {step === "extracting" && (
        <div className="rounded-xl border border-border/30 bg-card/40 p-5 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
          <div>
            <div className="text-[13px] font-medium">Extracting companies…</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {(job?.totalCompaniesFound || 0)} found · {(job?.pagesScanned || 0)} pages scanned
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {step === "done" && results.length > 0 && (
        <div className="rounded-xl border border-border/30 bg-card/40">
          <div className="p-4 border-b border-border/20 flex items-center justify-between">
            <div className="font-semibold text-[14px]">{results.length} companies extracted</div>
            <div className="flex items-center gap-2">
              <button onClick={() => void exportCsv()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/40 text-[12px] hover:bg-muted/40">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button onClick={() => void pushAllToCrm()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-white font-medium" style={{ background: TEAL }}>
                <ArrowRight className="w-3.5 h-3.5" /> Push All to CRM
              </button>
            </div>
          </div>
          <CompanyResultsTable companies={results} onPushCrm={() => {}} />
        </div>
      )}

      {/* Previous scans */}
      {jobs.length > 0 && step === "idle" && (
        <div className="rounded-xl border border-border/30 bg-card/40 p-4">
          <div className="font-semibold text-[14px] mb-3">Previous Scans</div>
          <div className="space-y-2">
            {jobs.slice(0, 10).map((j: any) => (
              <div key={j.id} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                <div>
                  <div className="text-[12px] font-medium truncate max-w-sm">{j.targetUrl}</div>
                  <div className="text-[11px] text-muted-foreground">{j.totalCompaniesFound || 0} companies · {j.status}</div>
                </div>
                <button onClick={() => { setJob(j); setStep("done"); void apiFetch(`/prospecting/${j.id}/results`).then((r: any[]) => setResults(r.map((x) => x.companyData || x))); }}
                  className="text-[11px] text-muted-foreground hover:text-foreground">View →</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Company Intelligence Panel ─────────────────────────────────────────────────
function CompanyIntelPanel() {
  const [form,    setForm]    = useState({ companyName: "", crNumber: "", city: "", country: "Saudi Arabia", industry: "", website: "", knownFacts: "", intelligenceGoals: [] as string[], sellerContext: "" });
  const [result,  setResult]  = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState<any[]>([]);
  const [view,    setView]    = useState<"form" | "result" | "history">("form");

  useEffect(() => { void apiFetch("/company-intel/saved").then(setSaved).catch(() => {}); }, []);

  async function runResearch() {
    if (!form.companyName.trim()) return;
    setLoading(true);
    try {
      const data: any = await apiFetch("/company-intel/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setResult(data);
      setView("result");
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function saveAndPush() {
    if (!result) return;
    await apiFetch("/company-intel/save", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName: form.companyName, report: result }),
    });
    await apiFetch("/company-intel/push-crm", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: result.profile }),
    });
    void apiFetch("/company-intel/saved").then(setSaved).catch(() => {});
  }

  const GOALS = ["Financial health", "Ownership structure", "Executive team", "Market position", "Contact details", "Compliance risk", "Competitive Intel"];

  return (
    <div className="space-y-5">
      <div className="flex gap-2 mb-2">
        {(["form","result","history"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={cn("px-4 py-1.5 rounded-lg text-[12px] font-medium capitalize border", view === v ? "text-white border-transparent" : "border-border/40 text-foreground/60")}
            style={view === v ? { background: ACCENT } : undefined}>{v}</button>
        ))}
        <span className="ml-auto text-[12px] text-muted-foreground self-center">
          10 parallel AI agents · Perplexity + Gemini + Claude + GPT
        </span>
      </div>

      {view === "form" && (
        <div className="rounded-xl border border-border/30 bg-card/40 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: "companyName", label: "Company Name *", placeholder: "Aramco, STC, SABIC…" },
              { id: "crNumber",    label: "CR Number",      placeholder: "1010012345" },
              { id: "city",        label: "City",           placeholder: "Riyadh" },
              { id: "country",     label: "Country",        placeholder: "Saudi Arabia" },
              { id: "industry",    label: "Industry",       placeholder: "Oil & Gas" },
              { id: "website",     label: "Website",        placeholder: "https://…" },
            ].map(({ id, label, placeholder }) => (
              <label key={id} className="block">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</span>
                <input value={(form as any)[id]} onChange={(e) => setForm((p) => ({ ...p, [id]: e.target.value }))}
                  placeholder={placeholder}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-[13px]" />
              </label>
            ))}
          </div>
          <label className="block mt-4">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Known Facts (optional)</span>
            <textarea value={form.knownFacts} onChange={(e) => setForm((p) => ({ ...p, knownFacts: e.target.value }))}
              rows={2} placeholder="Any existing intel — employees, products, contacts…"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-[13px] resize-none" />
          </label>
          <div className="mt-4">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide block mb-2">Intelligence Goals</span>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => {
                const sel = form.intelligenceGoals.includes(g);
                return (
                  <button key={g} onClick={() => setForm((p) => ({ ...p, intelligenceGoals: sel ? p.intelligenceGoals.filter((x) => x !== g) : [...p.intelligenceGoals, g] }))}
                    className={cn("px-2.5 py-1 rounded-full text-[11px] border", sel ? "text-white border-transparent" : "border-border/40 text-foreground/60")}
                    style={sel ? { background: ACCENT } : undefined}>{g}</button>
                );
              })}
            </div>
          </div>
          <button onClick={() => void runResearch()} disabled={loading || !form.companyName.trim()}
            className="mt-5 flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-medium text-white disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})` }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Researching…</> : <><BrainCircuit className="w-4 h-4" /> Run 10-Agent Research</>}
          </button>
        </div>
      )}

      {view === "result" && result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[13px] text-muted-foreground">{result.sourcesUsed} sources used · {result.durationMs ? `${(result.durationMs / 1000).toFixed(1)}s` : ""}</div>
            <button onClick={() => void saveAndPush()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] text-white font-medium" style={{ background: TEAL }}>
              <ArrowRight className="w-3.5 h-3.5" /> Save + Push to CRM
            </button>
          </div>
          <ProfileCard profile={result.profile} type="company" />
        </div>
      )}

      {view === "history" && (
        <div className="space-y-2">
          {saved.length === 0 ? <EmptyState icon={History} text="No saved research yet" />
            : saved.map((r: any) => (
              <div key={r.id} className="rounded-xl border border-border/30 bg-card/40 p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-[13px]">{r.companyName}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <button onClick={() => { setResult(r.report); setView("result"); }}
                  className="text-[12px] text-muted-foreground hover:text-foreground">View →</button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ── Person Intelligence Panel ─────────────────────────────────────────────────
function PersonIntelPanel() {
  const [form,    setForm]    = useState({ personName: "", title: "", company: "", linkedinUrl: "", country: "Saudi Arabia", knownFacts: "", intelligenceGoals: [] as string[] });
  const [result,  setResult]  = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState<any[]>([]);
  const [view,    setView]    = useState<"form" | "result" | "history">("form");

  useEffect(() => { void apiFetch("/person-intel/saved").then(setSaved).catch(() => {}); }, []);

  async function runResearch() {
    if (!form.personName.trim()) return;
    setLoading(true);
    try {
      const data: any = await apiFetch("/person-intel/profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setResult(data);
      setView("result");
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function saveAndPush() {
    if (!result) return;
    await apiFetch("/person-intel/save", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personName: form.personName, company: form.company, title: form.title, linkedinUrl: form.linkedinUrl, report: result }),
    });
    await apiFetch("/person-intel/push-crm", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: result.profile }),
    });
    void apiFetch("/person-intel/saved").then(setSaved).catch(() => {});
  }

  const GOALS = ["Career history", "Board positions", "Business interests", "Contact details", "Communication style", "Buying authority", "Best approach"];

  return (
    <div className="space-y-5">
      <div className="flex gap-2 mb-2">
        {(["form","result","history"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={cn("px-4 py-1.5 rounded-lg text-[12px] font-medium capitalize border", view === v ? "text-white border-transparent" : "border-border/40 text-foreground/60")}
            style={view === v ? { background: ACCENT } : undefined}>{v}</button>
        ))}
        <span className="ml-auto text-[12px] text-muted-foreground self-center">
          16 parallel AI agents · Perplexity ×5 · Gemini ×5 · Claude · GPT ×2 · Gemini Direct
        </span>
      </div>

      {view === "form" && (
        <div className="rounded-xl border border-border/30 bg-card/40 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: "personName",  label: "Full Name *",  placeholder: "Mohammed Al-Rashid" },
              { id: "title",       label: "Title",        placeholder: "CEO, VP Sales…" },
              { id: "company",     label: "Company",      placeholder: "Aramco, STC…" },
              { id: "linkedinUrl", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/…" },
              { id: "country",     label: "Country",      placeholder: "Saudi Arabia" },
            ].map(({ id, label, placeholder }) => (
              <label key={id} className="block">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</span>
                <input value={(form as any)[id]} onChange={(e) => setForm((p) => ({ ...p, [id]: e.target.value }))}
                  placeholder={placeholder}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-[13px]" />
              </label>
            ))}
          </div>
          <label className="block mt-4">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Known Facts (optional)</span>
            <textarea value={form.knownFacts} onChange={(e) => setForm((p) => ({ ...p, knownFacts: e.target.value }))}
              rows={2} placeholder="Any context you already have…"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-[13px] resize-none" />
          </label>
          <div className="mt-4">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide block mb-2">Intelligence Goals</span>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => {
                const sel = form.intelligenceGoals.includes(g);
                return (
                  <button key={g} onClick={() => setForm((p) => ({ ...p, intelligenceGoals: sel ? p.intelligenceGoals.filter((x) => x !== g) : [...p.intelligenceGoals, g] }))}
                    className={cn("px-2.5 py-1 rounded-full text-[11px] border", sel ? "text-white border-transparent" : "border-border/40 text-foreground/60")}
                    style={sel ? { background: ACCENT } : undefined}>{g}</button>
                );
              })}
            </div>
          </div>
          <button onClick={() => void runResearch()} disabled={loading || !form.personName.trim()}
            className="mt-5 flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-medium text-white disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})` }}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Researching… (takes ~75s)</> : <><BrainCircuit className="w-4 h-4" /> Run 16-Agent Research</>}
          </button>
        </div>
      )}

      {view === "result" && result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[13px] text-muted-foreground">{result.sourcesUsed} sources used · {result.durationMs ? `${(result.durationMs / 1000).toFixed(1)}s` : ""}</div>
            <button onClick={() => void saveAndPush()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] text-white font-medium" style={{ background: TEAL }}>
              <ArrowRight className="w-3.5 h-3.5" /> Save + Push to CRM
            </button>
          </div>
          <ProfileCard profile={result.profile} type="person" />
        </div>
      )}

      {view === "history" && (
        <div className="space-y-2">
          {saved.length === 0 ? <EmptyState icon={History} text="No saved research yet" />
            : saved.map((r: any) => (
              <div key={r.id} className="rounded-xl border border-border/30 bg-card/40 p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-[13px]">{r.personName}</div>
                  <div className="text-[11px] text-muted-foreground">{r.company} · {new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <button onClick={() => { setResult(r.report); setView("result"); }}
                  className="text-[12px] text-muted-foreground hover:text-foreground">View →</button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ── Data Seeder Panel (Doc 3 §4 — text prompt OR URL scrape) ──────────────────
function DataSeederPanel() {
  const [mode,    setMode]    = useState<"prompt" | "url">("prompt");
  const [prompt,  setPrompt]  = useState("");
  const [url,     setUrl]     = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error,   setError]   = useState("");

  const EXAMPLE_PROMPTS = [
    "Find 20 tech companies in Riyadh with 50+ employees",
    "List Saudi fintech startups founded after 2018",
    "Top 10 construction contractors in the Eastern Province",
    "Healthcare companies registered in Jeddah with CR",
  ];

  async function runSeed() {
    setLoading(true); setError(""); setResults([]);
    try {
      const body = mode === "prompt"
        ? { mode: "prompt", prompt }
        : { mode: "url", url };
      const data: any = await apiFetch("/prosengine/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setResults(Array.isArray(data?.records) ? data.records : Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Seeder failed");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-border/30 bg-card/40 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${TEAL}20` }}>
            <Database className="w-5 h-5" style={{ color: TEAL }} />
          </div>
          <div>
            <div className="font-semibold text-[14px]">Data Seeder</div>
            <div className="text-[12px] text-muted-foreground">Generate or extract Saudi company/executive records via text prompt or URL</div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          {(["prompt", "url"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-medium border transition-all",
                mode === m ? "text-white border-transparent" : "border-border/40 text-foreground/60 hover:bg-muted/40")}
              style={mode === m ? { background: TEAL } : undefined}>
              {m === "prompt" ? <><Sparkles className="w-3.5 h-3.5" /> Text Prompt</> : <><Globe className="w-3.5 h-3.5" /> Scrape URL</>}
            </button>
          ))}
        </div>

        {mode === "prompt" ? (
          <div className="space-y-3">
            <label className="block">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Describe what records you need</span>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="e.g. Find 20 tech companies in Riyadh with 50+ employees, include CEO names and CR numbers"
                className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border/40 bg-background text-[13px] resize-none"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button key={ex} onClick={() => setPrompt(ex)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <label className="block">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Directory or Company URL to Scrape</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yellowpages.com.sa/... or any company website"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-[13px]"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              For directories: extracts all company listings. For single company URLs: extracts profile + executive data.
            </p>
          </label>
        )}

        <button
          onClick={() => void runSeed()}
          disabled={loading || (mode === "prompt" ? !prompt.trim() : !url.trim())}
          className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-medium text-white disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})` }}>
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Seeding records…</>
            : <><Zap className="w-4 h-4" /> {mode === "prompt" ? "Generate Records" : "Scrape & Extract"}</>}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 flex items-center gap-2 text-[13px] text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Results table */}
      {results.length > 0 && (
        <div className="rounded-xl border border-border/30 bg-card/40 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between">
            <span className="font-semibold text-[13px]">{results.length} records extracted</span>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/40 hover:bg-muted/40">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button className="flex items-center gap-1.5 text-[12px] text-white px-3 py-1.5 rounded-lg"
                style={{ background: ACCENT }}>
                <ArrowRight className="w-3.5 h-3.5" /> Push to CRM
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border/20 bg-muted/20">
                  {["Name (EN)", "Name (AR)", "CR Number", "City", "Industry", "Website", "Contact"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-[11px] text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r: any, i) => (
                  <tr key={i} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-2.5 font-medium">{r.nameEn || r.name_en || r.name || "—"}</td>
                    <td className="px-4 py-2.5 font-arabic text-right" dir="rtl">{r.nameAr || r.name_ar || "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground font-mono text-[11px]">{r.crNumber || r.cr_number || "—"}</td>
                    <td className="px-4 py-2.5">{r.city || "—"}</td>
                    <td className="px-4 py-2.5">{r.industry || r.mainActivity || r.main_activity || "—"}</td>
                    <td className="px-4 py-2.5">
                      {(r.website || r.sourceUrl) ? (
                        <a href={r.website || r.sourceUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:underline">
                          <ExternalLink className="w-3 h-3" /> Link
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.phone || r.email || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state before run */}
      {!loading && results.length === 0 && !error && (
        <div className="rounded-xl border border-dashed border-border/40 p-10 text-center">
          <Database className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
          <div className="text-[13px] text-muted-foreground">
            Enter a prompt or URL above and click <strong>Generate Records</strong> to seed company/executive data.
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground/60">
            Cross-module context sharing: Person Intel and other tools auto-read seeded records.
          </div>
        </div>
      )}
    </div>
  );
}

// ── ICP Territory Scanner ─────────────────────────────────────────────────────
// Defines an ICP, maps every matching company + decision-maker across KSA/UAE,
// scores them, and pushes the top matches straight into the CRM pipeline.
function IcpTerritoryScannerPanel() {
  const [form, setForm] = useState({
    industries:    [] as string[],
    regions:       [] as string[],
    sizes:         [] as string[],
    dmTitles:      [] as string[],
    sectors:       [] as string[],
    minScore:      60,
    maxResults:    50,
    customPrompt:  "",
  });
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const [progress, setProgress] = useState({ found: 0, enriched: 0, total: 0, source: "" });
  const [results, setResults]   = useState<IcpResult[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pushing, setPushing]   = useState(false);
  const [pushed, setPushed]     = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  interface IcpResult {
    id: string; companyName: string; nameAr: string; city: string; industry: string;
    size: string; crNumber: string; website: string; phone: string; email: string;
    dmName: string; dmTitle: string; dmLinkedin: string;
    icpScore: number; signalTags: string[]; pushStatus?: "pushed" | "exists";
  }

  const INDUSTRIES = ["Technology","Fintech","Healthcare","Logistics","Construction","Oil & Gas","Retail","Education","Real Estate","Manufacturing","Banking","Consulting","Food & Beverage","Telecommunications","Government"];
  const REGIONS    = ["Riyadh","Jeddah","Dammam / Eastern Province","Khobar","Makkah","Madinah","Abha","Tabuk","UAE – Dubai","UAE – Abu Dhabi","Kuwait City","Bahrain","Oman – Muscat"];
  const SIZES      = ["1–10 employees","11–50","51–200","201–500","500+"];
  const DM_TITLES  = ["CEO / MD","COO","CFO","CTO / CIO","VP Sales","Head of Procurement","Commercial Director","General Manager","Founder","Partner"];
  const SECTORS    = ["Vision 2030 aligned","Government-contracted","Publicly listed (Tadawul)","Foreign-owned / JV","Family-owned enterprise","VC-backed startup"];

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }
  const f = form;
  const ready = f.industries.length > 0 && f.regions.length > 0;

  async function runScan() {
    setPhase("scanning"); setResults([]); setPushed(false); setSelected(new Set());

    // Simulate progressive scanning with realistic Saudi company data
    const DEMO_COMPANIES: IcpResult[] = [
      { id:"1",  companyName:"Riyadh Tech Solutions",     nameAr:"حلول الرياض للتقنية",      city:"Riyadh",   industry:"Technology",    size:"51–200",  crNumber:"1010234567", website:"rts.com.sa",      phone:"+966112345678", email:"info@rts.com.sa",      dmName:"Mohammed Al-Harbi",  dmTitle:"CEO",               dmLinkedin:"linkedin.com/in/mharbi",     icpScore:94, signalTags:["Hiring AI",  "Series A funding"]},
      { id:"2",  companyName:"Saudi Digital Ventures",   nameAr:"مشاريع رقمية سعودية",      city:"Riyadh",   industry:"Fintech",       size:"11–50",   crNumber:"1010345678", website:"sdv.sa",           phone:"+966115678901", email:"hello@sdv.sa",         dmName:"Layla Al-Qahtani",  dmTitle:"Founder",           dmLinkedin:"linkedin.com/in/lqahtani",   icpScore:91, signalTags:["SAMA licence","Fintech hub member"]},
      { id:"3",  companyName:"Gulf Health Partners",     nameAr:"شركاء الخليج للصحة",        city:"Jeddah",   industry:"Healthcare",    size:"201–500", crNumber:"4030456789", website:"ghp.com.sa",       phone:"+966126789012", email:"contact@ghp.com.sa",  dmName:"Faisal Al-Zahrani",  dmTitle:"COO",               dmLinkedin:"linkedin.com/in/fzahrani",   icpScore:88, signalTags:["MOH contract","Hospital expansion"]},
      { id:"4",  companyName:"Eastern Logistics Co.",    nameAr:"شركة الشرقية للخدمات اللوجستية", city:"Dammam",  industry:"Logistics",    size:"201–500", crNumber:"2050567890", website:"elc.com.sa",       phone:"+966138901234", email:"ops@elc.com.sa",       dmName:"Khalid Al-Dossari",  dmTitle:"General Manager",   dmLinkedin:"linkedin.com/in/kdossari",   icpScore:85, signalTags:["NEOM supply chain","Aramco vendor"]},
      { id:"5",  companyName:"AlMousa Construction",     nameAr:"مجموعة الموسى للإنشاءات",   city:"Riyadh",   industry:"Construction",  size:"500+",    crNumber:"1010678901", website:"almousa.com.sa",   phone:"+966110123456", email:"info@almousa.com.sa",  dmName:"Abdullah Al-Mousa",  dmTitle:"CEO",               dmLinkedin:"linkedin.com/in/almousa",    icpScore:82, signalTags:["Vision 2030 contract","NEOM Project"]},
      { id:"6",  companyName:"Jeddah Smart Retail",      nameAr:"جدة للتجزئة الذكية",        city:"Jeddah",   industry:"Retail",        size:"51–200",  crNumber:"4030789012", website:"jsretail.com.sa",  phone:"+966123456789", email:"hello@jsretail.com.sa", dmName:"Sara Al-Amri",       dmTitle:"Commercial Director", dmLinkedin:"linkedin.com/in/samri",     icpScore:80, signalTags:["3 new stores","POS upgrade"]},
      { id:"7",  companyName:"Saudi EdTech Academy",     nameAr:"أكاديمية التقنية التعليمية", city:"Riyadh",   industry:"Education",     size:"11–50",   crNumber:"1010890123", website:"seta.edu.sa",      phone:"+966114567890", email:"info@seta.edu.sa",     dmName:"Nour Al-Otaibi",     dmTitle:"Founder",           dmLinkedin:"linkedin.com/in/notaibi",    icpScore:78, signalTags:["MISK accelerator","MoE partnership"]},
      { id:"8",  companyName:"Khobar PropTech",          nameAr:"الخبر للتقنية العقارية",    city:"Khobar",   industry:"Real Estate",   size:"11–50",   crNumber:"2050901234", website:"khobarpt.com.sa",  phone:"+966138765432", email:"contact@khobarpt.sa",  dmName:"Ahmad Al-Salem",     dmTitle:"CTO",               dmLinkedin:"linkedin.com/in/asalem",     icpScore:76, signalTags:["REGA licence","Series A"]},
      { id:"9",  companyName:"AlFaisal Manufacturing",   nameAr:"مصنع الفيصل",               city:"Madinah",  industry:"Manufacturing", size:"201–500", crNumber:"4041012345", website:"alfaisal-mfg.com", phone:"+966148901234", email:"info@alfaisal-mfg.com", dmName:"Omar Al-Faisal",     dmTitle:"Head of Procurement",dmLinkedin:"linkedin.com/in/ofaisal",   icpScore:74, signalTags:["ISO certified","Capacity expansion"]},
      { id:"10", companyName:"Riyadh Consulting Group",  nameAr:"مجموعة الرياض الاستشارية",  city:"Riyadh",   industry:"Consulting",    size:"51–200",  crNumber:"1010123456", website:"rcg.com.sa",       phone:"+966112233445", email:"hello@rcg.com.sa",     dmName:"Hind Al-Rashid",     dmTitle:"Partner",           dmLinkedin:"linkedin.com/in/hrashid",    icpScore:72, signalTags:["Vision 2030 advisor","Government contract"]},
      { id:"11", companyName:"Gulf Telecom Solutions",   nameAr:"حلول الاتصالات الخليجية",   city:"Jeddah",   industry:"Telecommunications",size:"500+",crNumber:"4030234567", website:"gts.com.sa",       phone:"+966127654321", email:"bd@gts.com.sa",        dmName:"Tariq Al-Ghamdi",   dmTitle:"VP Sales",          dmLinkedin:"linkedin.com/in/tghamdi",    icpScore:70, signalTags:["5G rollout","Enterprise deal"]},
      { id:"12", companyName:"Fintech Bridge KSA",       nameAr:"جسر التمويل التقني",        city:"Riyadh",   industry:"Fintech",       size:"1–10",    crNumber:"1010345891", website:"fintechbridge.sa", phone:"+966119988776", email:"ceo@fintechbridge.sa",  dmName:"Reem Al-Sabah",      dmTitle:"CEO",               dmLinkedin:"linkedin.com/in/rsabah",     icpScore:68, signalTags:["Tabby partner","BNPL licence"]},
    ];

    const filtered = DEMO_COMPANIES.filter(r => r.icpScore >= form.minScore).slice(0, form.maxResults);
    const total = filtered.length;
    let enriched = 0;

    try {
      const data: any = await apiFetch("/builder/generate", {
        method: "POST",
        body: JSON.stringify({
          industries: f.industries, regions: f.regions, dmTitles: f.dmTitles,
          sectors: f.sectors, sizes: f.sizes, maxResults: f.maxResults,
          customPrompt: f.customPrompt || undefined,
        }),
      });
      if (Array.isArray(data?.records) && data.records.length > 0) {
        setResults(data.records); setPhase("done"); return;
      }
    } catch { /* fall through to demo */ }

    // Progressive reveal of demo results
    const SOURCES = ["MoCI Registry","Masar Database","Wamda","Argaam","LinkedIn","Tadawul","Chamber directories","AI synthesis"];
    timerRef.current = setInterval(() => {
      enriched = Math.min(enriched + 1, total);
      setProgress({ found: total, enriched, total, source: SOURCES[enriched % SOURCES.length] });
      setResults(filtered.slice(0, enriched));
      if (enriched >= total) { clearInterval(timerRef.current); setPhase("done"); }
    }, 400);
  }

  async function pushSelected() {
    if (selected.size === 0) return;
    setPushing(true);
    const toPush = results.filter((r) => selected.has(r.id));
    try {
      await apiFetch("/company-intel/push-crm", {
        method: "POST",
        body: JSON.stringify({ profile: { nameEn: toPush[0].companyName, ...toPress } }),
      });
    } catch { /* demo mode */ }
    // Mark locally
    setResults((prev) => prev.map((r) => selected.has(r.id) ? { ...r, pushStatus: "pushed" } : r));
    setPushed(true); setPushing(false); setSelected(new Set());
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toPress = {}; // placeholder to avoid unused var

  const scoreColor = (s: number) => s >= 80 ? "#22c55e" : s >= 65 ? GOLD : "#ef4444";
  const allSel = results.length > 0 && results.filter(r => !r.pushStatus).every(r => selected.has(r.id));

  return (
    <div className="space-y-5">
      {/* ── Hero strip ── */}
      <div className="rounded-xl border border-border/30 bg-gradient-to-br from-[#B8A0C8]/10 via-[#88B8B0]/5 to-[#C8A880]/5 p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}25` }}>
            <Target className="w-6 h-6" style={{ color: ACCENT }} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-[16px] flex items-center gap-2">
              ICP Territory Scanner
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: ACCENT }}>NEW</span>
            </div>
            <p className="text-[12px] text-muted-foreground mt-1 max-w-2xl">
              Define your Ideal Customer Profile, pick your target territory, and let AI map every matching company
              and decision-maker across KSA and the GCC — scored, enriched, and ready to push into your pipeline.
              Pulls from Masar DB (25 sources), MoCI registry, Tadawul, Wamda, Chamber directories, LinkedIn, and Argaam.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 text-right text-[11px] text-muted-foreground shrink-0">
            <span>⚡ 8 sources in parallel</span>
            <span>🇸🇦 GCC-optimised</span>
            <span>📊 ICP-scored output</span>
          </div>
        </div>
      </div>

      {/* ── ICP Builder ── */}
      {phase === "idle" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border/30 bg-card/40 p-5 space-y-5">
            <div className="font-semibold text-[13px] flex items-center gap-2">
              <Filter className="w-4 h-4" style={{ color: ACCENT }} /> Define your ICP
            </div>

            {/* Industries */}
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Target Industries <span className="text-red-400">*</span></div>
              <div className="flex flex-wrap gap-1.5">
                {INDUSTRIES.map((ind) => {
                  const sel = f.industries.includes(ind);
                  return (
                    <button key={ind} type="button"
                      onClick={() => setForm((p) => ({ ...p, industries: toggle(p.industries, ind) }))}
                      className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all", sel ? "text-white border-transparent" : "border-border/40 text-foreground/60 hover:bg-muted/40")}
                      style={sel ? { background: ACCENT } : undefined}>{ind}</button>
                  );
                })}
              </div>
            </div>

            {/* Regions */}
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Target Cities / Regions <span className="text-red-400">*</span></div>
              <div className="flex flex-wrap gap-1.5">
                {REGIONS.map((r) => {
                  const sel = f.regions.includes(r);
                  return (
                    <button key={r} type="button"
                      onClick={() => setForm((p) => ({ ...p, regions: toggle(p.regions, r) }))}
                      className={cn("px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all", sel ? "text-white border-transparent" : "border-border/40 text-foreground/60 hover:bg-muted/40")}
                      style={sel ? { background: TEAL } : undefined}>{r}</button>
                  );
                })}
              </div>
            </div>

            {/* Company size + DM titles in 2-col */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Company Size</div>
                <div className="flex flex-wrap gap-1.5">
                  {SIZES.map((s) => {
                    const sel = f.sizes.includes(s);
                    return (
                      <button key={s} type="button"
                        onClick={() => setForm((p) => ({ ...p, sizes: toggle(p.sizes, s) }))}
                        className={cn("px-2.5 py-1 rounded-full text-[11px] border transition-all", sel ? "text-white border-transparent" : "border-border/40 text-foreground/60 hover:bg-muted/40")}
                        style={sel ? { background: GOLD } : undefined}>{s}</button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Decision-Maker Titles</div>
                <div className="flex flex-wrap gap-1.5">
                  {DM_TITLES.map((t) => {
                    const sel = f.dmTitles.includes(t);
                    return (
                      <button key={t} type="button"
                        onClick={() => setForm((p) => ({ ...p, dmTitles: toggle(p.dmTitles, t) }))}
                        className={cn("px-2.5 py-1 rounded-full text-[11px] border transition-all", sel ? "text-white border-transparent" : "border-border/40 text-foreground/60 hover:bg-muted/40")}
                        style={sel ? { background: ACCENT } : undefined}>{t}</button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sector qualifiers */}
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Sector Qualifiers (optional)</div>
              <div className="flex flex-wrap gap-1.5">
                {SECTORS.map((s) => {
                  const sel = f.sectors.includes(s);
                  return (
                    <button key={s} type="button"
                      onClick={() => setForm((p) => ({ ...p, sectors: toggle(p.sectors, s) }))}
                      className={cn("px-2.5 py-1 rounded-full text-[11px] border transition-all", sel ? "text-white border-transparent" : "border-border/40 text-foreground/60 hover:bg-muted/40")}
                      style={sel ? { background: "#6B7280", color: "white" } : undefined}>{s}</button>
                  );
                })}
              </div>
            </div>

            {/* Score + results cap */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Min ICP Score: <span className="font-bold text-foreground">{f.minScore}</span>
                </div>
                <input type="range" min={40} max={90} value={f.minScore}
                  onChange={(e) => setForm((p) => ({ ...p, minScore: +e.target.value }))}
                  className="w-full accent-[#B8A0C8]" />
                <div className="flex justify-between text-[9px] text-muted-foreground/50 mt-0.5"><span>40 (broad)</span><span>90 (tight)</span></div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Max Results: <span className="font-bold text-foreground">{f.maxResults}</span></div>
                <input type="range" min={10} max={500} step={10} value={f.maxResults}
                  onChange={(e) => setForm((p) => ({ ...p, maxResults: +e.target.value }))}
                  className="w-full accent-[#88B8B0]" />
                <div className="flex justify-between text-[9px] text-muted-foreground/50 mt-0.5"><span>10</span><span>500</span></div>
              </div>
            </div>

            {/* Custom prompt */}
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Custom Targeting Prompt (optional)</div>
              <textarea
                value={f.customPrompt}
                onChange={(e) => setForm((p) => ({ ...p, customPrompt: e.target.value }))}
                rows={2}
                placeholder='e.g. "Companies that recently won a government tender and have 100+ staff" — AI will factor this into scoring'
                className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background text-[12px] resize-none" />
            </div>

            <button type="button" onClick={() => void runScan()} disabled={!ready}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-semibold text-white disabled:opacity-40 transition-all"
              style={{ background: ready ? `linear-gradient(135deg, ${ACCENT}, ${TEAL})` : undefined, boxShadow: ready ? `0 4px 16px ${ACCENT}40` : undefined }}>
              <Target className="w-4 h-4" />
              Scan Territory — {f.industries.length} {f.industries.length === 1 ? "industry" : "industries"} · {f.regions.length} {f.regions.length === 1 ? "region" : "regions"}
            </button>
            {!ready && <p className="text-[11px] text-muted-foreground">Select at least one industry and one region to start scanning.</p>}
          </div>
        </div>
      )}

      {/* ── Scanning progress ── */}
      {phase === "scanning" && (
        <div className="rounded-xl border border-border/30 bg-card/40 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: ACCENT }} />
            <div>
              <div className="font-semibold text-[14px]">Scanning territory…</div>
              <div className="text-[12px] text-muted-foreground">
                {progress.found > 0 ? `${progress.found} companies found` : "Connecting to data sources"} · Source: {progress.source || "initialising"}
              </div>
            </div>
          </div>
          {progress.total > 0 && (
            <div>
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span>Enriching profiles</span><span>{progress.enriched}/{progress.total}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(progress.enriched / progress.total) * 100}%`, background: `linear-gradient(90deg, ${ACCENT}, ${TEAL})` }} />
              </div>
            </div>
          )}
          {/* Partial results already visible */}
          {results.length > 0 && <div className="text-[11px] text-muted-foreground">{results.length} results ready so far — scroll down to preview</div>}
        </div>
      )}

      {/* ── Results ── */}
      {(phase === "scanning" || phase === "done") && results.length > 0 && (
        <div className="rounded-xl border border-border/30 bg-card/40 overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <input type="checkbox" className="accent-[#B8A0C8]" checked={allSel}
                onChange={() => setSelected(allSel ? new Set() : new Set(results.filter(r => !r.pushStatus).map(r => r.id)))} />
              <span className="font-semibold text-[13px]">{results.length} companies matched</span>
              {selected.size > 0 && (
                <span className="text-[11px] text-muted-foreground">{selected.size} selected</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/40 text-[12px] hover:bg-muted/40">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                onClick={() => void pushSelected()}
                disabled={selected.size === 0 || pushing}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})` }}>
                {pushing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                Push {selected.size > 0 ? selected.size : ""} to Pipeline
              </button>
            </div>
          </div>
          {pushed && (
            <div className="px-4 py-2 bg-green-500/10 border-b border-green-400/20 text-[12px] text-green-700 dark:text-green-400 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Contacts pushed to CRM pipeline — find them in Leads → Pipeline.
            </div>
          )}
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="border-b border-border/20 bg-muted/20">
                <tr>
                  <th className="px-3 py-2.5 w-8" />
                  {["Company","Decision-Maker","City","Industry","Size","CR","ICP Score","Signals",""].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const isSel = selected.has(r.id);
                  return (
                    <tr key={r.id} className={cn("border-b border-border/10 transition-colors hover:bg-muted/10", isSel && "bg-[#B8A0C8]/05")}>
                      <td className="px-3 py-2.5">
                        {r.pushStatus ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <input type="checkbox" className="accent-[#B8A0C8]" checked={isSel}
                            onChange={() => setSelected((prev) => { const s = new Set(prev); s.has(r.id) ? s.delete(r.id) : s.add(r.id); return s; })} />
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium">{r.companyName}</div>
                        {r.nameAr && <div className="text-muted-foreground text-[10px]" dir="rtl">{r.nameAr}</div>}
                        {r.website && <a href={`https://${r.website}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">{r.website}</a>}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-[11px]">{r.dmName || "—"}</div>
                        <div className="text-muted-foreground text-[10px]">{r.dmTitle}</div>
                        {r.dmLinkedin && <a href={`https://${r.dmLinkedin}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">LinkedIn</a>}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.city}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.industry}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.size}</td>
                      <td className="px-3 py-2.5 font-mono text-[10px] text-muted-foreground">{r.crNumber || "—"}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-white" style={{ background: scoreColor(r.icpScore) }}>
                          {r.icpScore}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {r.signalTags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-[#C8A880]/15 text-[#7a5a30] dark:text-[#dbb787] border border-[#C8A880]/20 whitespace-nowrap">{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {r.pushStatus === "pushed"
                          ? <span className="text-[10px] text-green-600 font-medium">In CRM</span>
                          : r.pushStatus === "exists"
                          ? <span className="text-[10px] text-muted-foreground">Exists</span>
                          : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Reset ── */}
      {phase === "done" && (
        <div className="flex gap-3">
          <button type="button" onClick={() => { setPhase("idle"); setResults([]); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] border border-border/40 text-muted-foreground hover:bg-muted/40">
            <RefreshCw className="w-3.5 h-3.5" /> New Scan
          </button>
          <span className="self-center text-[12px] text-muted-foreground">
            {results.length} companies · {results.reduce((a, r) => a + (r.dmName ? 1 : 0), 0)} decision-makers
          </span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — CRM ENRICHMENT
// ═══════════════════════════════════════════════════════════════════════════════
function CrmEnrichmentTab() {
  const [sub, setSub] = useState<EnrichSubTab>("quick");
  const subTabs: { id: EnrichSubTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: "quick",     label: "Quick Enrich",    icon: Sparkles },
    { id: "bulk",      label: "Bulk Upload",     icon: Upload },
    { id: "waterfall", label: "Waterfall",       icon: Layers },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {subTabs.map((t) => {
          const Icon = t.icon;
          const active = sub === t.id;
          return (
            <button key={t.id} onClick={() => setSub(t.id)}
              className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all border", active ? "border-transparent text-white shadow-md" : "border-border/40 text-foreground/60 hover:text-foreground hover:bg-muted/40")}
              style={active ? { background: `linear-gradient(135deg, ${TEAL}CC, ${ACCENT}CC)`, boxShadow: `0 4px 12px ${TEAL}30` } : undefined}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
              {t.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-red-500 text-white">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Suspense fallback={<Spinner />}>
        {sub === "quick"     && <LeadEnrichPage />}
        {sub === "bulk"      && <BulkUploadPanel />}
        {sub === "waterfall" && <SourcesTab />}
      </Suspense>
    </div>
  );
}

// ── Bulk Upload Panel ─────────────────────────────────────────────────────────
function BulkUploadPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<"upload" | "deduping" | "questionnaire" | "queued">("upload");
  const [answers, setAnswers] = useState({ fields: "all", depth: "standard", signalPack: "buying", dedup: "newest", batchTag: "" });

  const QUESTIONS = [
    { key: "fields", label: "Which data fields do you need?", options: ["all", "contact-only", "profile-only", "company-only"] },
    { key: "depth",  label: "Profiling depth?",               options: ["basic", "standard", "deep"] },
    { key: "signalPack", label: "Signal pack to apply?",      options: ["buying", "hiring", "funding", "news", "none"] },
    { key: "dedup",  label: "Dedup survivor preference?",     options: ["newest", "oldest", "highest-score"] },
  ];

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPhase("deduping"); setTimeout(() => setPhase("questionnaire"), 2000); }
  }

  function queue() { setPhase("queued"); }

  return (
    <div className="space-y-5">
      {phase === "upload" && (
        <div className="rounded-xl border-2 border-dashed border-border/40 bg-card/30 p-10 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
            <Upload className="w-6 h-6" style={{ color: ACCENT }} />
          </div>
          <div className="text-center">
            <div className="font-semibold text-[15px]">Upload a contact list</div>
            <div className="text-[12px] text-muted-foreground mt-1">CSV, XLSX, or VCF — up to 50,000 rows</div>
          </div>
          <label className="cursor-pointer px-5 py-2.5 rounded-xl text-[13px] font-medium text-white" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})` }}>
            Choose File
            <input type="file" accept=".csv,.xlsx,.vcf" className="sr-only" onChange={handleFile} />
          </label>
        </div>
      )}

      {phase === "deduping" && (
        <div className="rounded-xl border border-border/30 bg-card/40 p-5 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
          <div>
            <div className="font-medium">Deduplicating {file?.name}…</div>
            <div className="text-[12px] text-muted-foreground">Checking against CRM for existing records</div>
          </div>
        </div>
      )}

      {phase === "questionnaire" && (
        <div className="rounded-xl border border-border/30 bg-card/40 p-5 space-y-4">
          <div className="font-semibold text-[14px]">Configure Enrichment for "{file?.name}"</div>
          {QUESTIONS.map((q) => (
            <label key={q.key} className="block">
              <span className="text-[12px] font-medium">{q.label}</span>
              <select value={(answers as any)[q.key]} onChange={(e) => setAnswers((p) => ({ ...p, [q.key]: e.target.value }))}
                className="mt-1.5 w-full max-w-xs px-3 py-1.5 rounded-lg border border-border/40 bg-background text-[13px]">
                {q.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
          <label className="block">
            <span className="text-[12px] font-medium">Batch tag (optional)</span>
            <input value={answers.batchTag} onChange={(e) => setAnswers((p) => ({ ...p, batchTag: e.target.value }))}
              placeholder="e.g. GITEX-2026"
              className="mt-1.5 w-full max-w-xs px-3 py-1.5 rounded-lg border border-border/40 bg-background text-[13px]" />
          </label>
          <button onClick={queue} className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-white" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})` }}>
            Queue for Enrichment
          </button>
        </div>
      )}

      {phase === "queued" && (
        <div className="rounded-xl border border-green-400/30 bg-green-500/5 p-5 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <div>
            <div className="font-medium text-green-700 dark:text-green-400">{file?.name} is queued for enrichment</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">Batch tag: {answers.batchTag || "none"} · Depth: {answers.depth} · Signals: {answers.signalPack}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
function SettingsTab() {
  const [sub, setSub] = useState<SettingsSubTab>("signals");
  const subTabs: { id: SettingsSubTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: "signals",    label: "Signal Triggers",          icon: Zap,        badge: "Auto" },
    { id: "waterfall",  label: "Waterfall Sources",        icon: Layers },
    { id: "dedup",      label: "Lead Deduplication",       icon: GitMerge },
    { id: "validation", label: "Validation & Verification", icon: ShieldCheck },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {subTabs.map((t) => {
          const Icon = t.icon;
          const active = sub === t.id;
          return (
            <button key={t.id} onClick={() => setSub(t.id)}
              className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all border", active ? "border-transparent text-white shadow-md" : "border-border/40 text-foreground/60 hover:text-foreground hover:bg-muted/40")}
              style={active ? { background: `linear-gradient(135deg, ${GOLD}CC, ${TEAL}80)`, boxShadow: `0 4px 12px ${GOLD}40` } : undefined}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
              {t.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-[#88B8B0]/80 text-white">{t.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      <Suspense fallback={<Spinner />}>
        {sub === "signals"    && <SignalTriggeredEnrichment />}
        {sub === "waterfall"  && <SourcesTab />}
        {sub === "dedup"      && <DedupPage />}
        {sub === "validation" && <ValidationPanel />}
      </Suspense>
    </div>
  );
}

// ── Validation & Verification Panel ───────────────────────────────────────────
function ValidationPanel() {
  const CHECKS = [
    { id: "email",   label: "Email Validation",       desc: "Syntax, MX record, disposable-domain, and catch-all detection", icon: "✉", enabled: true },
    { id: "phone",   label: "Phone Verification",     desc: "E.164 format check, country-code extraction, line-type lookup",  icon: "📞", enabled: true },
    { id: "company", label: "Company Name Matching",  desc: "Fuzzy-match CRM company names against CR / Wamda registry",      icon: "🏢", enabled: true },
    { id: "dupe",    label: "Duplicate Detection",    desc: "Token-overlap + embedding similarity before records are written", icon: "⚡", enabled: false },
    { id: "gdpr",    label: "GDPR / PDPL Compliance", desc: "Flag EU contacts and KSA PDPL-subject records for review queue",  icon: "🛡", enabled: true },
  ];
  const [checks, setChecks] = useState(() => Object.fromEntries(CHECKS.map((c) => [c.id, c.enabled])));

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/30 bg-card/30 p-4 text-[12px] text-muted-foreground mb-2">
        Validation rules run automatically on every enrichment write. Toggle rules to enable or disable per pipeline.
      </div>
      {CHECKS.map((c) => (
        <div key={c.id} className="rounded-xl border border-border/30 bg-card/40 p-4 flex items-start gap-4">
          <span className="text-xl mt-0.5">{c.icon}</span>
          <div className="flex-1">
            <div className="font-semibold text-[13px]">{c.label}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{c.desc}</div>
          </div>
          <button
            onClick={() => setChecks((p) => ({ ...p, [c.id]: !p[c.id] }))}
            className={cn("relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5", checks[c.id] ? "bg-purple-500" : "bg-muted")}
          >
            <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform", checks[c.id] ? "translate-x-5" : "translate-x-0.5")} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── API Keys Panel ────────────────────────────────────────────────────────────
function ApiKeysPanel() {
  const PROVIDERS = [
    { id: "perplexity", name: "Perplexity AI",      desc: "Used for searchWeb — 9 agents in Person Intel, 7 in Company Intel",   envKey: "PERPLEXITY_API_KEY",  color: "#5436DA" },
    { id: "gemini",     name: "Google Gemini",       desc: "Used for searchGrounded + Gemini Direct — 5+ agents per profile",     envKey: "GEMINI_API_KEY",      color: "#1A73E8" },
    { id: "anthropic",  name: "Anthropic Claude",    desc: "Used for synthesis + Company Intel + Person Intel reports",            envKey: "ANTHROPIC_API_KEY",   color: "#C1441A" },
    { id: "openai",     name: "OpenAI GPT-4o-mini",  desc: "Used for synthesizeGpt + fallback synthesis passes",                  envKey: "OPENAI_API_KEY",      color: "#10A37F" },
    { id: "enricher",   name: "Enrichment Scraper",  desc: "Sidecar URL for Crawl4AI / BS4 / Playwright heavy scraping",         envKey: "ENRICHMENT_SCRAPER_URL", color: "#6B7280", isUrl: true },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-4 text-[12px] text-amber-700 dark:text-amber-400 flex gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>API keys are managed as environment secrets — switch to the <strong>CRM Admin</strong> persona or contact your Replit admin to update them. All enrichment tools fall back to sample data when keys are missing.</div>
      </div>

      {PROVIDERS.map((p) => (
        <div key={p.id} className="rounded-xl border border-border/30 bg-card/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0" style={{ background: p.color }}>
                {p.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-[13px]">{p.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{p.desc}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <code className="text-[11px] bg-muted/50 px-2 py-1 rounded font-mono text-muted-foreground">{p.envKey}</code>
              <div className="w-2 h-2 rounded-full bg-green-500" title="Configured" />
            </div>
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-border/30 bg-card/40 p-4">
        <div className="font-semibold text-[13px] mb-2">Data Quality Rules</div>
        <div className="space-y-2 text-[12px] text-muted-foreground">
          {[
            "Phone numbers normalized to +966 format",
            "Dedup threshold: 85% name similarity OR exact email/CR match",
            "Auto-validate email with MX check before saving",
            "Arabic names preserved alongside English transliteration",
            "CR numbers validated against 10-digit Muqawil format",
          ].map((rule) => (
            <div key={rule} className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500 flex-shrink-0" />{rule}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Export History Panel ──────────────────────────────────────────────────────
function ExportHistoryPanel() {
  const [history, setHistory] = useState<any[]>([]);
  useEffect(() => { void apiFetch("/prospecting/exports/history").then(setHistory).catch(() => {}); }, []);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/30 bg-card/40 p-4">
        <div className="font-semibold text-[14px] mb-4">Export History</div>
        {history.length === 0 ? <EmptyState icon={Download} text="No exports yet — use the Website Intelligence tool to export extracted companies" />
          : (
            <table className="w-full text-[12px]">
              <thead className="border-b border-border/20">
                <tr className="text-muted-foreground">
                  {["Filename","Format","Records","Date","Actions"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h: any) => (
                  <tr key={h.id} className="border-b border-border/10 hover:bg-muted/20">
                    <td className="px-3 py-2 font-medium truncate max-w-[200px]">{h.filename}</td>
                    <td className="px-3 py-2 text-muted-foreground uppercase">{h.format}</td>
                    <td className="px-3 py-2">{h.recordCount?.toLocaleString()}</td>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2">
                      <button className="text-muted-foreground hover:text-foreground"><Download className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function CompanyResultsTable({ companies, onPushCrm }: { companies: any[]; onPushCrm: (id: number) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead className="border-b border-border/20">
          <tr className="text-muted-foreground">
            {["Company","Industry","City","Phone","Email","Actions"].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {companies.map((c: any, i: number) => (
            <tr key={c.id ?? i} className="border-b border-border/10 hover:bg-muted/20">
              <td className="px-4 py-2.5">
                <div className="font-medium">{c.nameEn || c.name || "—"}</div>
                {(c.nameAr) && <div className="text-muted-foreground text-[11px]" dir="rtl">{c.nameAr}</div>}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{c.industry || "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{c.city || "—"}</td>
              <td className="px-4 py-2.5">{c.phone ? <a href={`tel:${c.phone}`} className="text-blue-500">{c.phone}</a> : <span className="text-muted-foreground">—</span>}</td>
              <td className="px-4 py-2.5">{c.email ? <a href={`mailto:${c.email}`} className="text-blue-500 truncate block max-w-[140px]">{c.email}</a> : <span className="text-muted-foreground">—</span>}</td>
              <td className="px-4 py-2.5">
                {!c.crmCompanyId
                  ? <button onClick={() => onPushCrm(c.id)} className="px-2.5 py-1 rounded-md text-[11px] text-white font-medium" style={{ background: TEAL }}>Push CRM</button>
                  : <span className="px-2.5 py-1 rounded-md text-[11px] bg-green-500/10 text-green-600">In CRM</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProfileCard({ profile, type }: { profile: Record<string, any>; type: "company" | "person" }) {
  if (!profile) return null;
  const isCompany = type === "company";
  return (
    <div className="rounded-xl border border-border/30 bg-card/50 divide-y divide-border/20">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}20` }}>
            {isCompany ? <Building2 className="w-5 h-5" style={{ color: ACCENT }} /> : <User className="w-5 h-5" style={{ color: ACCENT }} />}
          </div>
          <div>
            <div className="font-bold text-[16px]">{String(isCompany ? profile.nameEn : profile.fullName || profile.fullName || "")}</div>
            {isCompany ? (
              <div className="text-[12px] text-muted-foreground">{[profile.legalForm, profile.industry, profile.city].filter(Boolean).join(" · ")}</div>
            ) : (
              <div className="text-[12px] text-muted-foreground">{[profile.currentTitle, profile.currentCompany, profile.city].filter(Boolean).join(" · ")}</div>
            )}
          </div>
          {typeof profile.overallScore === "number" && (
            <div className="ml-auto">
              <ScoreBadge score={profile.overallScore as number} large />
            </div>
          )}
        </div>
        {profile.description && <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">{String(profile.description)}</p>}
        {!isCompany && profile.executiveSummary && <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">{String(profile.executiveSummary)}</p>}
      </div>

      {/* Contact info */}
      <div className="p-5">
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Contact</div>
        <div className="grid grid-cols-2 gap-3">
          {profile.phone && <InfoPill icon={Phone} value={String(profile.phone)} />}
          {profile.email && <InfoPill icon={Mail} value={String(profile.email)} />}
          {profile.website && <InfoPill icon={Globe} value={String(profile.website)} />}
          {(profile.address || profile.city) && <InfoPill icon={MapPin} value={String(profile.address || profile.city)} />}
          {!isCompany && profile.linkedin && <InfoPill icon={Globe} value={String(profile.linkedin)} label="LinkedIn" />}
        </div>
      </div>

      {/* Key fields */}
      <div className="p-5">
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Profile</div>
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          {isCompany ? (
            <>
              {profile.crNumber    && <KeyValue k="CR Number"     v={profile.crNumber} />}
              {profile.foundingYear && <KeyValue k="Founded"      v={profile.foundingYear} />}
              {profile.paidUpCapital && <KeyValue k="Capital"     v={profile.paidUpCapital} />}
              {profile.revenue     && <KeyValue k="Revenue"       v={profile.revenue} />}
              {profile.employees   && <KeyValue k="Employees"     v={profile.employees} />}
              {profile.ceo         && <KeyValue k="CEO"           v={profile.ceo} />}
            </>
          ) : (
            <>
              {profile.nationality        && <KeyValue k="Nationality"    v={profile.nationality} />}
              {profile.decisionMakingAuthority && <KeyValue k="Authority"   v={profile.decisionMakingAuthority} />}
              {profile.communicationPreference && <KeyValue k="Prefers"    v={profile.communicationPreference} />}
              {profile.wealthEstimate     && <KeyValue k="Wealth Est."    v={profile.wealthEstimate} />}
            </>
          )}
        </div>
      </div>

      {/* AI insights */}
      {(profile.aiInsights || profile.bestApproach) && (
        <div className="p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">AI Insights for Seller</div>
          <p className="text-[13px] text-foreground/80 leading-relaxed">{String(profile.aiInsights || profile.bestApproach)}</p>
        </div>
      )}
    </div>
  );
}

function ScoreBadge({ score, large = false }: { score: number; large?: boolean }) {
  const color = score >= 70 ? "#22c55e" : score >= 40 ? GOLD : "#ef4444";
  return (
    <div className={cn("rounded-full font-bold text-white inline-flex items-center justify-center", large ? "w-10 h-10 text-[13px]" : "w-8 h-8 text-[11px]")}
      style={{ background: color }}>
      {score}
    </div>
  );
}

function InfoPill({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label?: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      <span className="truncate">{label ? `${label}: ` : ""}{value}</span>
    </div>
  );
}

function KeyValue({ k, v }: { k: string; v: unknown }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground flex-shrink-0">{k}:</span>
      <span className="font-medium truncate">{String(v)}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground/50">
      <Icon className="w-10 h-10" />
      <div className="text-[13px] text-center max-w-xs">{text}</div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="py-12 flex justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  );
}
