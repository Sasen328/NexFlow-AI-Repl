/**
 * Intel Engines tab — Data Hub > Enrichment Engine > Intel Engines
 *
 * Four AI-driven intelligence engines, each with input form + run + report:
 *   1. Masaar             — Saudi CR-number lookup (7-agent pipeline)
 *   2. Person Intel       — ProsEngine person dossier (20 sources)
 *   3. Company Intel      — ProsEngine company dossier (11 sources)
 *   4. Lead Finder (NEW)  — discover real leads at a company by name
 *
 * Each engine posts to /api/engines/{kind}/run and renders a structured
 * report with source attribution. History is shared across all four
 * engines via /api/engines/runs.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, Building2, Users, Target, Loader2, Play, Save, History,
  ChevronRight, ExternalLink, Mail, Phone, Linkedin, MapPin, BadgeCheck,
  AlertTriangle, FileText, Globe, Star, Trash2, Eye, X, Zap, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";

type EngineKind = "masaar" | "person_intel" | "company_intel" | "lead_finder";

const ENGINE_META: Record<EngineKind, {
  title: string;
  blurb: string;
  icon: typeof Sparkles;
  accent: string;          // tailwind classes
  badge: string;
  sourcesNote: string;
}> = {
  masaar: {
    title: "Masaar — Saudi CR Lookup",
    blurb: "10-digit Saudi commercial registration number → bilingual EN+AR intel report with shareholders, capital, leadership, AOA data, and conflict detection.",
    icon: BadgeCheck,
    accent: "from-[#88B8B0]/10 to-[#88B8B0]/0 border-[#88B8B0]/30",
    badge: "🇸🇦 Saudi government",
    sourcesNote: "Best-effort scraper on emagazine.aamaly.sa + 5 parallel AI research agents (Perplexity ×3, Gemini ×2) + Claude bilingual synthesis",
  },
  person_intel: {
    title: "Person Intel — ProsEngine",
    blurb: "Deep dossier on a single person: career, education, wealth, board roles, approach strategy, ready-to-send first message.",
    icon: Users,
    accent: "from-[#B8B880]/10 to-[#B8B880]/0 border-[#B8B880]/30",
    badge: "20 sources",
    sourcesNote: "9× Perplexity + 4× Gemini grounded + Claude/GPT knowledge + LinkedIn/website crawl. Apollo & Explorium gracefully skipped (no key).",
  },
  company_intel: {
    title: "Company Intel — ProsEngine",
    blurb: "Structured company dossier: financials, ownership, leadership, market position, news, sample outreach message.",
    icon: Building2,
    accent: "from-[#B8A0C8]/10 to-[#B8A0C8]/0 border-[#B8A0C8]/30",
    badge: "11 sources",
    sourcesNote: "4× Gemini grounded + 4× Perplexity + Claude/GPT knowledge + stealth crawl (Cheerio/Playwright + Crawl4AI sidecar)",
  },
  lead_finder: {
    title: "Lead Finder — Find Leads at a Company",
    blurb: "Give a company name → get a ranked list of named senior employees with titles, departments, LinkedIn URLs, and a recommended outreach sequence.",
    icon: Target,
    accent: "from-[#D4955A]/10 to-[#D4955A]/0 border-[#D4955A]/40",
    badge: "NEW",
    sourcesNote: "Site team-page crawl (8 paths) + Perplexity ×3 + Gemini ×2 + Claude knowledge + Crawl4AI sidecar fallback. Dedupes across sources.",
  },
};

interface RunHistoryRow {
  id: string;
  engine: EngineKind;
  title: string;
  sources_used: string[];
  duration_ms: number;
  status: "pending" | "ok" | "error";
  error: string | null;
  saved: boolean;
  tags: string | null;
  notes: string | null;
  created_at: string;
}

export function IntelEnginesTab() {
  const [activeEngine, setActiveEngine] = useState<EngineKind | "history">("masaar");

  return (
    <div className="space-y-5">
      {/* Engine picker */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(ENGINE_META) as EngineKind[]).map((k) => {
          const m = ENGINE_META[k];
          const Icon = m.icon;
          const active = activeEngine === k;
          return (
            <button
              key={k}
              onClick={() => setActiveEngine(k)}
              className={cn(
                "relative text-left rounded-xl border p-4 transition-all bg-gradient-to-br hover:scale-[1.01]",
                m.accent,
                active ? "ring-2 ring-[#B8B880] shadow-md" : "shadow-sm hover:shadow",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <Icon className="w-5 h-5 text-foreground/80 shrink-0" />
                <span className={cn(
                  "text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full",
                  k === "lead_finder"
                    ? "bg-[#D4955A] text-white"
                    : "bg-background/80 text-muted-foreground border border-border",
                )}>
                  {m.badge}
                </span>
              </div>
              <div className="mt-2 font-semibold text-sm leading-tight">{m.title}</div>
              <div className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-3">{m.blurb}</div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={() => setActiveEngine("history")}
          className={cn(
            "text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md border",
            activeEngine === "history"
              ? "bg-foreground text-background border-foreground"
              : "border-border hover:bg-muted text-muted-foreground",
          )}
        >
          <History className="w-3.5 h-3.5" /> Run history
        </button>
      </div>

      {/* Body */}
      {activeEngine === "masaar"        && <MasaarPanel />}
      {activeEngine === "person_intel"  && <PersonIntelPanel />}
      {activeEngine === "company_intel" && <CompanyIntelPanel />}
      {activeEngine === "lead_finder"   && <LeadFinderPanel />}
      {activeEngine === "history"       && <HistoryPanel />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Shared form chrome
// ─────────────────────────────────────────────────────────────────────

function PanelShell({
  engine, children, footer,
}: { engine: EngineKind; children: React.ReactNode; footer?: React.ReactNode }) {
  const m = ENGINE_META[engine];
  const Icon = m.icon;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4">
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-start gap-3 pb-3 border-b border-border">
          <Icon className="w-5 h-5 text-foreground/80 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-sm">{m.title}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{m.sourcesNote}</div>
          </div>
        </div>
        {children}
      </div>
      <div className="min-h-[400px]">{footer}</div>
    </div>
  );
}

function FormRow({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </div>
      {children}
      {hint && <div className="text-[10px] text-muted-foreground mt-1">{hint}</div>}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#B8B880]/40", props.className)} />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#B8B880]/40 min-h-[80px] resize-y", props.className)} />;
}

function RunButton({ onClick, busy, label = "Run engine" }: { onClick: () => void; busy: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-foreground text-background text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
    >
      {busy
        ? (<><Loader2 className="w-4 h-4 animate-spin" /> Running… (30-90s)</>)
        : (<><Play className="w-4 h-4" /> {label}</>)}
    </button>
  );
}

function StatusPill({ children, kind = "info" }: { children: React.ReactNode; kind?: "info" | "success" | "warn" | "error" }) {
  const map = {
    info: "bg-muted text-foreground",
    success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    warn: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    error: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  };
  return <span className={cn("px-2 py-0.5 text-[10px] rounded-full font-medium", map[kind])}>{children}</span>;
}

function SourceChips({ sources }: { sources: string[] }) {
  if (!sources?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {sources.map((s) => (
        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{s}</span>
      ))}
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-border bg-muted/20">
      <Sparkles className="w-8 h-8 text-muted-foreground/40 mb-3" />
      <div className="text-sm font-medium text-muted-foreground">Fill in the form and run the engine.</div>
      <div className="text-xs text-muted-foreground/70 mt-1">Results appear here. Most runs take 30-90 seconds.</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// MASAAR
// ─────────────────────────────────────────────────────────────────────

function MasaarPanel() {
  const [crNumber, setCrNumber] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [reportLang, setReportLang] = useState<"en" | "ar">("en");

  async function run() {
    setErr(null); setResult(null); setBusy(true);
    try {
      const r = await apiFetch("/api/engines/masaar/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crNumber: crNumber.trim() || undefined,
          nameEn: nameEn.trim() || undefined,
          nameAr: nameAr.trim() || undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Run failed");
      setResult(data);
    } catch (e: any) {
      setErr(e?.message ?? "Run failed");
    } finally { setBusy(false); }
  }

  return (
    <PanelShell engine="masaar" footer={
      err ? <ErrorBlock msg={err} /> :
      !result ? <EmptyResult /> :
      <MasaarReport result={result} lang={reportLang} setLang={setReportLang} />
    }>
      <FormRow label="CR Number" hint="10-digit Saudi commercial registration (e.g. 1010123456). Optional if you provide a company name.">
        <Input value={crNumber} onChange={(e) => setCrNumber(e.target.value)} placeholder="1010123456" pattern="\d{10}" />
      </FormRow>
      <FormRow label="Company name (English)" hint="Optional. Use this when you don't have the CR number.">
        <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Saudi Telecom Company" />
      </FormRow>
      <FormRow label="Company name (Arabic)">
        <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="شركة الاتصالات السعودية" dir="rtl" />
      </FormRow>
      <RunButton busy={busy} onClick={run} label="Run Masaar pipeline" />
      <div className="text-[10px] text-muted-foreground bg-amber-500/10 border border-amber-500/30 rounded p-2 leading-relaxed">
        <AlertTriangle className="w-3 h-3 inline mr-1" />
        Direct stealth-browser access to mc.gov.sa and najiz.sa requires residential-IP infrastructure not available here. We use AI research (Perplexity/Gemini grounded) to gather equivalent intel, plus best-effort scraping of emagazine.aamaly.sa.
      </div>
    </PanelShell>
  );
}

function MasaarReport({ result, lang, setLang }: { result: any; lang: "en" | "ar"; setLang: (l: "en" | "ar") => void }) {
  const r = result.report;
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs uppercase text-muted-foreground tracking-wider">Run complete</div>
          <div className="font-semibold text-base mt-0.5">{r.parsed?.nameEn || r.parsed?.nameAr || "Saudi company"}</div>
          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
            {r.parsed?.crNumber && <span>CR {r.parsed.crNumber}</span>}
            {r.parsed?.legalForm && <><span>·</span><span>{r.parsed.legalForm}</span></>}
            {r.parsed?.headquarterCity && <><span>·</span><span>{r.parsed.headquarterCity}</span></>}
            <span>·</span><span>{Math.round(result.durationMs / 1000)}s</span>
          </div>
        </div>
        <SourceChips sources={result.sourcesUsed} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Stat label="Capital" value={r.parsed?.capitalAmount} />
        <Stat label="Founded" value={r.parsed?.foundingYear} />
        <Stat label="Industry" value={r.parsed?.industry} />
        <Stat label="Est. Revenue" value={r.parsed?.estimatedRevenue} />
      </div>

      {r.conflicts?.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
          <div className="text-sm font-semibold flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-amber-600" /> {r.conflicts.length} source conflicts</div>
          <ul className="text-xs space-y-1.5 text-foreground/80">
            {r.conflicts.slice(0, 5).map((c: any, i: number) => (
              <li key={i}><span className="font-mono text-amber-700 dark:text-amber-500">{c.field}</span> — <span className="font-medium">{c.source1}:</span> {c.value1} <span className="text-muted-foreground">vs</span> <span className="font-medium">{c.source2}:</span> {c.value2}</li>
            ))}
          </ul>
        </div>
      )}

      {(r.parsed?.shareholders?.length > 0) && (
        <CollapseCard title={`Shareholders (${r.parsed.shareholders.length})`}>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr><th className="text-left py-1">Name</th><th className="text-left py-1">Arabic</th><th className="text-right py-1">%</th><th className="text-left py-1 pl-2">Nationality</th></tr>
            </thead>
            <tbody>
              {r.parsed.shareholders.map((s: any, i: number) => (
                <tr key={i} className="border-t border-border/50"><td className="py-1.5">{s.nameEn || "—"}</td><td className="py-1.5" dir="rtl">{s.nameAr || "—"}</td><td className="py-1.5 text-right font-mono">{s.ownershipPct || "—"}</td><td className="py-1.5 pl-2">{s.nationality || "—"}</td></tr>
              ))}
            </tbody>
          </table>
        </CollapseCard>
      )}

      {(r.parsed?.managers?.length > 0) && (
        <CollapseCard title={`Leadership (${r.parsed.managers.length})`}>
          <ul className="text-xs space-y-2">
            {r.parsed.managers.map((m: any, i: number) => (
              <li key={i} className="flex items-baseline justify-between gap-3">
                <span><span className="font-medium">{m.nameEn || "—"}</span> {m.nameAr && <span dir="rtl" className="text-muted-foreground">· {m.nameAr}</span>}</span>
                <span className="text-muted-foreground">{m.title || ""}</span>
              </li>
            ))}
          </ul>
        </CollapseCard>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Bilingual report</div>
          <div className="flex bg-background rounded-md border border-border p-0.5 text-xs">
            <button onClick={() => setLang("en")} className={cn("px-2 py-0.5 rounded", lang === "en" && "bg-foreground text-background")}>English</button>
            <button onClick={() => setLang("ar")} className={cn("px-2 py-0.5 rounded", lang === "ar" && "bg-foreground text-background")}>عربي</button>
          </div>
        </div>
        <div className="p-4 prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm" dir={lang === "ar" ? "rtl" : "ltr"}>
          {lang === "en" ? r.reportEn : r.reportAr}
        </div>
      </div>

      <SaveBar runId={result.id} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PERSON INTEL
// ─────────────────────────────────────────────────────────────────────

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
  const [result, setResult] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setErr(null); setResult(null); setBusy(true);
    try {
      const r = await apiFetch("/api/engines/person-intel/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Run failed");
      setResult(data);
    } catch (e: any) {
      setErr(e?.message ?? "Run failed");
    } finally { setBusy(false); }
  }

  return (
    <PanelShell engine="person_intel" footer={
      err ? <ErrorBlock msg={err} /> :
      !result ? <EmptyResult /> :
      <PersonReport result={result} />
    }>
      <FormRow label="Person's name" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Khalid Al-Saud" /></FormRow>
      <div className="grid grid-cols-2 gap-2">
        <FormRow label="Company"><Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Saudi Aramco" /></FormRow>
        <FormRow label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VP Sales" /></FormRow>
      </div>
      <FormRow label="LinkedIn URL" hint="If known, we crawl it directly"><Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/…" /></FormRow>
      <FormRow label="Company website" hint="Used to scan the team page"><Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://aramco.com" /></FormRow>
      <FormRow label="Country"><Input value={country} onChange={(e) => setCountry(e.target.value)} /></FormRow>
      <FormRow label="Known facts" hint="Anything you already know — saves time">
        <Textarea value={knownFacts} onChange={(e) => setKnownFacts(e.target.value)} placeholder="e.g. Spoke at LEAP 2025. Wharton MBA." />
      </FormRow>
      <div className="rounded-md bg-muted/40 border border-border p-2.5">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Your context (for tailored outreach)</div>
        <div className="grid grid-cols-2 gap-2">
          <Input value={sellerCompany} onChange={(e) => setSellerCompany(e.target.value)} placeholder="Your company" className="text-xs" />
          <Input value={sellerProduct} onChange={(e) => setSellerProduct(e.target.value)} placeholder="What you sell" className="text-xs" />
        </div>
      </div>
      <RunButton busy={busy} onClick={run} label="Run Person Intel" />
    </PanelShell>
  );
}

function PersonReport({ result }: { result: any }) {
  const r = result.report;
  const p = r.profile ?? {};
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="font-bold text-lg">{p.fullName || "—"}{p.arabicName && p.arabicName !== "Not found" && <span dir="rtl" className="text-muted-foreground ml-2">· {p.arabicName}</span>}</div>
            <div className="text-sm text-muted-foreground">{p.title} {p.company && <>· <span className="font-medium text-foreground/80">{p.company}</span></>}</div>
            <div className="mt-1.5 text-xs flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
              {p.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</span>}
              {p.nationality && <span>· {p.nationality}</span>}
              {p.linkedin && p.linkedin !== "Not found" && <a href={p.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><Linkedin className="w-3 h-3" />LinkedIn</a>}
            </div>
          </div>
          <div className="text-right">
            <StatusPill kind={r.intelligence_notes?.confidence_level === "High" ? "success" : r.intelligence_notes?.confidence_level === "Medium" ? "warn" : "error"}>
              {r.intelligence_notes?.confidence_level ?? "Low"} confidence
            </StatusPill>
            <div className="text-[10px] text-muted-foreground mt-1">{Math.round(result.durationMs / 1000)}s · {result.sourcesUsed.length} sources</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Career">
          {r.career?.length ? (
            <ul className="space-y-2 text-sm">
              {r.career.slice(0, 6).map((c: any, i: number) => (
                <li key={i}>
                  <div className="font-medium">{c.title} <span className="text-muted-foreground">at {c.company}</span></div>
                  <div className="text-[11px] text-muted-foreground">{c.period}</div>
                  {c.description && <div className="text-xs mt-0.5">{c.description}</div>}
                </li>
              ))}
            </ul>
          ) : <Empty />}
        </Section>

        <Section title="Education">
          {r.education?.length ? (
            <ul className="text-sm space-y-1.5">
              {r.education.map((e: any, i: number) => (
                <li key={i}><span className="font-medium">{e.degree}</span><span className="text-muted-foreground"> · {e.institution}</span> <span className="text-[11px] text-muted-foreground">({e.year})</span></li>
              ))}
            </ul>
          ) : <Empty />}
        </Section>

        <Section title="Wealth profile">
          <KeyVals
            data={{
              "Net worth": r.wealth_profile?.estimated_net_worth,
              "Income": r.wealth_profile?.income_estimate,
              "Sources": (r.wealth_profile?.wealth_sources ?? []).join(", "),
              "Assets": r.wealth_profile?.assets,
            }}
          />
        </Section>

        <Section title="Personal profile">
          <KeyVals
            data={{
              "Languages": (r.personal_profile?.languages ?? []).join(", "),
              "Interests": (r.personal_profile?.interests ?? []).join(", "),
              "Boards": (r.personal_profile?.board_memberships ?? []).join(", "),
              "Awards": (r.personal_profile?.awards ?? []).join(", "),
            }}
          />
        </Section>
      </div>

      <Section title="Approach strategy" highlight>
        <div className="space-y-3 text-sm">
          <KeyVals data={{
            "Best channel": r.approach_strategy?.best_channel,
            "Best timing": r.approach_strategy?.best_timing,
            "Opening angle": r.approach_strategy?.opening_angle,
            "Value prop": r.approach_strategy?.value_proposition,
          }} />
          {r.approach_strategy?.cultural_notes && (
            <div className="text-xs italic text-muted-foreground p-2 bg-muted/40 rounded">{r.approach_strategy.cultural_notes}</div>
          )}
          {r.approach_strategy?.recommended_approach && (
            <div className="text-xs leading-relaxed whitespace-pre-wrap">{r.approach_strategy.recommended_approach}</div>
          )}
          {r.approach_strategy?.sample_message && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Sample first outreach</div>
              <div className="rounded-md border border-[#B8B880]/40 bg-[#B8B880]/5 p-3 text-xs whitespace-pre-wrap font-mono">{r.approach_strategy.sample_message}</div>
            </div>
          )}
        </div>
      </Section>

      <SaveBar runId={result.id} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// COMPANY INTEL
// ─────────────────────────────────────────────────────────────────────

function CompanyIntelPanel() {
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [city, setCity] = useState("");
  const [knownFacts, setKnownFacts] = useState("");
  const [sellerProduct, setSellerProduct] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setErr(null); setResult(null); setBusy(true);
    try {
      const r = await apiFetch("/api/engines/company-intel/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          website: website.trim() || undefined,
          crNumber: crNumber.trim() || undefined,
          city: city.trim() || undefined,
          knownFacts: knownFacts.trim() || undefined,
          sellerContext: sellerProduct ? { product: sellerProduct.trim() } : undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Run failed");
      setResult(data);
    } catch (e: any) { setErr(e?.message ?? "Run failed"); }
    finally { setBusy(false); }
  }

  return (
    <PanelShell engine="company_intel" footer={
      err ? <ErrorBlock msg={err} /> :
      !result ? <EmptyResult /> :
      <CompanyReport result={result} />
    }>
      <FormRow label="Company name" required><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="STC" /></FormRow>
      <FormRow label="Website" hint="If you don't supply one, we'll guess via AI"><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://stc.com.sa" /></FormRow>
      <div className="grid grid-cols-2 gap-2">
        <FormRow label="CR Number"><Input value={crNumber} onChange={(e) => setCrNumber(e.target.value)} placeholder="1010123456" /></FormRow>
        <FormRow label="City"><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Riyadh" /></FormRow>
      </div>
      <FormRow label="Known facts">
        <Textarea value={knownFacts} onChange={(e) => setKnownFacts(e.target.value)} placeholder="Anything you already know" />
      </FormRow>
      <FormRow label="What are you selling?" hint="Used to tailor the sample outreach message">
        <Input value={sellerProduct} onChange={(e) => setSellerProduct(e.target.value)} placeholder="e.g. CRM software for telcos" />
      </FormRow>
      <RunButton busy={busy} onClick={run} label="Run Company Intel" />
    </PanelShell>
  );
}

function CompanyReport({ result }: { result: any }) {
  const r = result.report;
  const p = r.profile ?? {};
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="font-bold text-lg">{p.nameEn || "—"} {p.nameAr && <span dir="rtl" className="text-muted-foreground ml-1">· {p.nameAr}</span>}</div>
            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              {p.legalForm && <span>{p.legalForm}</span>}
              {p.crNumber && <span>· CR {p.crNumber}</span>}
              {p.founded && <span>· Founded {p.founded}</span>}
              {p.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.city}</span>}
              {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><Globe className="w-3 h-3" />{p.website.replace(/^https?:\/\//, "")}</a>}
            </div>
          </div>
          <div className="text-right">
            <StatusPill kind={r.intelligence?.dataQuality === "high" ? "success" : r.intelligence?.dataQuality === "medium" ? "warn" : "error"}>
              {r.intelligence?.confidenceScore ?? 0}% confidence
            </StatusPill>
            <div className="text-[10px] text-muted-foreground mt-1">{Math.round(result.durationMs / 1000)}s · {result.sourcesUsed.length} sources</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Stat label="Revenue est." value={r.financials?.revenueEstimate ?? r.financials?.revenueRange} />
        <Stat label="Employees" value={r.financials?.employeeCount} />
        <Stat label="Capital" value={r.financials?.paidUpCapital} />
        <Stat label="Industry" value={p.industry} />
      </div>

      {r.executiveSummary && (
        <Section title="Executive summary"><div className="text-sm leading-relaxed whitespace-pre-wrap">{r.executiveSummary}</div></Section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Leadership">
          {r.leadership?.ceo?.nameEn && <div className="text-sm"><span className="font-semibold">CEO:</span> {r.leadership.ceo.nameEn} {r.leadership.ceo.nameAr && <span dir="rtl" className="text-muted-foreground">· {r.leadership.ceo.nameAr}</span>}</div>}
          {r.leadership?.boardChairman?.nameEn && <div className="text-sm mt-1.5"><span className="font-semibold">Chairman:</span> {r.leadership.boardChairman.nameEn}</div>}
          {r.leadership?.executives?.length > 0 && (
            <div className="mt-3 space-y-1 text-xs">
              {r.leadership.executives.slice(0, 6).map((e: any, i: number) => (
                <div key={i}><span className="font-medium">{e.nameEn}</span> <span className="text-muted-foreground">— {e.title}</span></div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Ownership">
          {r.ownership?.shareholders?.length > 0 ? (
            <ul className="text-xs space-y-1.5">
              {r.ownership.shareholders.slice(0, 8).map((s: any, i: number) => (
                <li key={i} className="flex items-baseline justify-between gap-2">
                  <span><span className="font-medium">{s.nameEn || "—"}</span> {s.nameAr && <span dir="rtl" className="text-muted-foreground">· {s.nameAr}</span>}</span>
                  <span className="font-mono text-muted-foreground">{s.ownershipPct || "—"}</span>
                </li>
              ))}
            </ul>
          ) : <Empty />}
        </Section>

        <Section title="Market position">
          <KeyVals data={{
            "Position": r.market?.marketPosition,
            "Share": r.market?.marketShare,
            "Competitors": (r.market?.competitors ?? []).slice(0, 5).join(", "),
            "Strengths": (r.market?.strengths ?? []).slice(0, 5).join(", "),
          }} />
        </Section>

        <Section title="Recent news">
          {r.news?.length ? (
            <ul className="text-xs space-y-2">
              {r.news.slice(0, 5).map((n: any, i: number) => (
                <li key={i}>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-muted-foreground text-[11px]">{n.date} · {n.source}</div>
                  {n.summary && <div className="mt-0.5">{n.summary}</div>}
                </li>
              ))}
            </ul>
          ) : <Empty />}
        </Section>
      </div>

      <Section title="Suggested approach" highlight>
        <KeyVals data={{
          "Channel": r.approach?.bestChannel,
          "Entry point": r.approach?.entryPoint,
          "Value prop": r.approach?.valueProp,
        }} />
        {r.approach?.sampleMessage && (
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Sample first outreach</div>
            <div className="rounded-md border border-[#B8A0C8]/40 bg-[#B8A0C8]/5 p-3 text-xs whitespace-pre-wrap">{r.approach.sampleMessage}</div>
          </div>
        )}
      </Section>

      <SaveBar runId={result.id} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// LEAD FINDER  (the new one)
// ─────────────────────────────────────────────────────────────────────

function LeadFinderPanel() {
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Saudi Arabia");
  const [rolesText, setRolesText] = useState("CEO, CFO, CTO, VP Sales, Head of Procurement");
  const [count, setCount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setErr(null); setResult(null); setBusy(true);
    try {
      const r = await apiFetch("/api/engines/lead-finder/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          website: website.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim() || undefined,
          rolesWanted: rolesText.split(",").map((s) => s.trim()).filter(Boolean),
          count: Number(count) || 10,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Run failed");
      setResult(data);
    } catch (e: any) { setErr(e?.message ?? "Run failed"); }
    finally { setBusy(false); }
  }

  return (
    <PanelShell engine="lead_finder" footer={
      err ? <ErrorBlock msg={err} /> :
      !result ? <EmptyResult /> :
      <LeadFinderResult result={result} />
    }>
      <FormRow label="Company name" required>
        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="STC, Saudi Aramco, Almarai…" />
      </FormRow>
      <FormRow label="Website (optional)" hint="If we don't have it, we'll find it">
        <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
      </FormRow>
      <div className="grid grid-cols-2 gap-2">
        <FormRow label="City"><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Riyadh" /></FormRow>
        <FormRow label="Country"><Input value={country} onChange={(e) => setCountry(e.target.value)} /></FormRow>
      </div>
      <FormRow label="Roles wanted" hint="Comma-separated. Be specific.">
        <Textarea value={rolesText} onChange={(e) => setRolesText(e.target.value)} />
      </FormRow>
      <FormRow label="How many leads">
        <input type="range" min={3} max={25} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full" />
        <div className="text-xs text-muted-foreground mt-1">{count} leads</div>
      </FormRow>
      <RunButton busy={busy} onClick={run} label="Find leads" />
      <div className="text-[10px] text-muted-foreground bg-[#D4955A]/10 border border-[#D4955A]/30 rounded p-2 leading-relaxed">
        <Sparkles className="w-3 h-3 inline mr-1" />
        We crawl the company's About/Team/Leadership pages (8 paths), run 6 parallel research agents, then dedupe and rank the discovered names. Confidence is set per-lead.
      </div>
    </PanelShell>
  );
}

function LeadFinderResult({ result }: { result: any }) {
  const r = result.report;
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="font-bold text-lg">{r.company?.name}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
              {r.company?.website && <a href={r.company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{r.company.website.replace(/^https?:\/\//, "")}</a>}
              {r.company?.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.company.city}</span>}
              <span>· {r.totalFound} leads found</span>
              <span>· {Math.round(result.durationMs / 1000)}s</span>
            </div>
          </div>
          <SourceChips sources={result.sourcesUsed.slice(0, 8)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Stat label="C-suite" value={r.bySeniority?.["C-suite"] ?? 0} />
        <Stat label="VPs" value={r.bySeniority?.["VP"] ?? 0} />
        <Stat label="Directors" value={r.bySeniority?.["Director"] ?? 0} />
        <Stat label="Total" value={r.totalFound} />
      </div>

      {r.recommendations && (
        <div className="rounded-xl border border-[#D4955A]/40 bg-[#D4955A]/5 p-4">
          <div className="text-sm font-semibold mb-2 flex items-center gap-2"><Star className="w-4 h-4 text-[#D4955A]" /> Recommended attack plan</div>
          {r.recommendations.bestEntryPoints?.length > 0 && (
            <div className="text-xs mb-2"><span className="font-semibold">Start with:</span> {r.recommendations.bestEntryPoints.join("; ")}</div>
          )}
          {r.recommendations.decisionMakers?.length > 0 && (
            <div className="text-xs mb-2"><span className="font-semibold">Decision makers:</span> {r.recommendations.decisionMakers.join(", ")}</div>
          )}
          {r.recommendations.suggestedSequence && (
            <div className="text-xs whitespace-pre-wrap mt-2 text-foreground/80">{r.recommendations.suggestedSequence}</div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-muted/30 text-sm font-semibold">Discovered leads ({r.leads?.length ?? 0})</div>
        <div className="divide-y divide-border">
          {(r.leads ?? []).map((l: any, i: number) => (
            <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/30">
              <div className="w-9 h-9 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold shrink-0">
                {(l.fullName ?? "?").split(/\s+/).slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div>
                    <span className="font-semibold text-sm">{l.fullName}</span>
                    {l.arabicName && <span dir="rtl" className="text-muted-foreground text-xs ml-2">· {l.arabicName}</span>}
                  </div>
                  <StatusPill kind={l.confidence === "high" ? "success" : l.confidence === "medium" ? "warn" : "info"}>{l.confidence}</StatusPill>
                </div>
                <div className="text-xs text-muted-foreground">{l.title}{l.department && <> · {l.department}</>}{l.seniority && <> · {l.seniority}</>}</div>
                <div className="mt-1 flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px]">
                  {l.email && <span className="flex items-center gap-1 text-muted-foreground"><Mail className="w-3 h-3" />{l.email}</span>}
                  {l.phone && <span className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3 h-3" />{l.phone}</span>}
                  {l.linkedinUrl && <a href={l.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline"><Linkedin className="w-3 h-3" />LinkedIn</a>}
                  <span className="text-muted-foreground/70 font-mono text-[10px]">via {l.source}</span>
                </div>
                {l.notes && <div className="text-xs italic text-muted-foreground mt-1">{l.notes}</div>}
              </div>
            </div>
          ))}
          {!r.leads?.length && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No verifiable leads surfaced. Try giving a website URL or a more specific city.</div>
          )}
        </div>
      </div>

      <SaveBar runId={result.id} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// History
// ─────────────────────────────────────────────────────────────────────

function HistoryPanel() {
  const [rows, setRows] = useState<RunHistoryRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | EngineKind | "saved">("all");
  const [openRow, setOpenRow] = useState<RunHistoryRow | null>(null);

  async function load() {
    setBusy(true); setErr(null);
    try {
      const params = new URLSearchParams();
      if (filter === "saved") params.set("saved", "1");
      else if (filter !== "all") params.set("engine", filter);
      const r = await apiFetch(`/api/engines/runs?${params.toString()}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Load failed");
      setRows(data.rows ?? []);
    } catch (e: any) { setErr(e?.message ?? "Load failed"); }
    finally { setBusy(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs">
          {(["all", "masaar", "person_intel", "company_intel", "lead_finder", "saved"] as const).map((k) => (
            <button key={k} onClick={() => setFilter(k)} className={cn(
              "px-2.5 py-1 rounded-md border",
              filter === k ? "bg-foreground text-background border-foreground" : "border-border hover:bg-muted text-muted-foreground"
            )}>{k === "all" ? "All" : k === "saved" ? "★ Saved" : ENGINE_META[k as EngineKind].title.split(" — ")[0]}</button>
          ))}
        </div>
        <button onClick={load} className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-muted text-muted-foreground"><RefreshCw className={cn("w-3 h-3", busy && "animate-spin")} /> Refresh</button>
      </div>

      {err && <ErrorBlock msg={err} />}
      {!busy && rows.length === 0 && !err && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No runs yet. Run an engine and the history will appear here.
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {rows.map((row) => (
          <div key={row.id} className="px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: row.status === "ok" ? "#10b981" : row.status === "error" ? "#ef4444" : "#888" }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-medium text-sm">{row.title}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{ENGINE_META[row.engine]?.title.split(" — ")[0] ?? row.engine}</span>
                {row.saved && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{new Date(row.created_at).toLocaleString()}</span>
                <span>· {Math.round(row.duration_ms / 1000)}s</span>
                <span>· {row.sources_used.length} sources</span>
                {row.error && <span className="text-rose-500">· {row.error.slice(0, 80)}</span>}
              </div>
            </div>
            <button onClick={() => setOpenRow(row)} className="text-xs px-2 py-1 rounded hover:bg-muted flex items-center gap-1"><Eye className="w-3 h-3" /> View</button>
          </div>
        ))}
      </div>

      {openRow && <RunDetailModal id={openRow.id} onClose={() => setOpenRow(null)} onChanged={load} />}
    </div>
  );
}

function RunDetailModal({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const [row, setRow] = useState<any | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await apiFetch(`/api/engines/runs/${id}`);
      const d = await r.json();
      setRow(d.row);
      setBusy(false);
    })();
  }, [id]);

  async function toggleSaved() {
    if (!row) return;
    await apiFetch(`/api/engines/runs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ saved: !row.saved }),
    });
    setRow({ ...row, saved: !row.saved });
    onChanged();
  }

  async function remove() {
    if (!confirm("Delete this run?")) return;
    await apiFetch(`/api/engines/runs/${id}`, { method: "DELETE" });
    onClose();
    onChanged();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-background rounded-xl border border-border max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="font-semibold">{row?.title ?? "Run details"}</div>
          <div className="flex items-center gap-2">
            <button onClick={toggleSaved} className={cn("text-xs px-2 py-1 rounded flex items-center gap-1 border", row?.saved ? "bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400" : "border-border hover:bg-muted")}>
              <Star className={cn("w-3 h-3", row?.saved && "fill-current")} /> {row?.saved ? "Saved" : "Save"}
            </button>
            <button onClick={remove} className="text-xs px-2 py-1 rounded text-rose-500 hover:bg-rose-500/10 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
            <button onClick={onClose} className="text-xs p-1 hover:bg-muted rounded"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-5">
          {busy && <div className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin inline" /></div>}
          {row && (
            <pre className="text-xs whitespace-pre-wrap font-mono bg-muted/30 p-3 rounded">{JSON.stringify(row.report, null, 2)}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tiny shared bits
// ─────────────────────────────────────────────────────────────────────

function ErrorBlock({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-rose-500/40 bg-rose-500/5 p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
      <div>
        <div className="font-semibold text-sm text-rose-700 dark:text-rose-400">Engine run failed</div>
        <div className="text-xs text-foreground/80 mt-1 whitespace-pre-wrap">{msg}</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-semibold text-sm mt-0.5 truncate">{value ?? "—"}</div>
    </div>
  );
}

function Section({ title, highlight, children }: { title: string; highlight?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", highlight ? "border-[#B8B880]/50" : "border-border")}>
      <div className={cn("px-4 py-2 border-b text-sm font-semibold", highlight ? "border-[#B8B880]/30 bg-[#B8B880]/5" : "border-border bg-muted/30")}>{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Empty() { return <div className="text-xs italic text-muted-foreground">No data found.</div>; }

function KeyVals({ data }: { data: Record<string, any> }) {
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== "");
  if (entries.length === 0) return <Empty />;
  return (
    <dl className="text-xs grid grid-cols-[100px_1fr] gap-x-3 gap-y-1.5">
      {entries.map(([k, v]) => (
        <div key={k} className="contents"><dt className="text-muted-foreground">{k}</dt><dd className="text-foreground/90">{v}</dd></div>
      ))}
    </dl>
  );
}

function CollapseCard({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full px-4 py-2 border-b border-border bg-muted/30 text-sm font-semibold flex items-center justify-between">
        <span>{title}</span><ChevronRight className={cn("w-4 h-4 transition-transform", open && "rotate-90")} />
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function SaveBar({ runId }: { runId: string }) {
  const [saved, setSaved] = useState(false);
  async function save() {
    await apiFetch(`/api/engines/runs/${runId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ saved: true }),
    });
    setSaved(true);
  }
  return (
    <div className="flex justify-end pt-2">
      <button onClick={save} disabled={saved} className={cn("text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md border", saved ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400" : "border-border hover:bg-muted")}>
        <Star className={cn("w-3 h-3", saved && "fill-amber-500 text-amber-500")} /> {saved ? "Saved to history" : "Save run"}
      </button>
    </div>
  );
}

// useMemo touch to silence import-without-use lint
void useMemo;
