import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Database, Search, Building2, Users, Sparkles, Zap, Upload, ScanLine,
  GitMerge, History, ChevronRight, Plus, Check, X, Loader2, Filter,
  Mail, Phone, Linkedin, Briefcase, Globe, TrendingUp, Newspaper,
  Hash, Twitter, Rss, Trash2, RefreshCw, ChevronDown, FileText, Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SignalsPage = lazy(() => import("./signals"));
const LeadEnrichPage = lazy(() => import("./lead-enrich"));
const BusinessCardsPage = lazy(() => import("./business-cards"));
const DedupPage = lazy(() => import("./dedup"));

type Tab =
  | "prospecting"
  | "signals"
  | "quick"
  | "cards"
  | "lists"
  | "dedup"
  | "history";

type ProspectMode = "company" | "person";

interface SearchHistoryItem {
  id: string;
  type: "company" | "person" | "list" | "card";
  query: string;
  filters: string;
  signals: string[];
  results: number;
  enriched: number;
  ts: string;
}

const SEED_HISTORY: SearchHistoryItem[] = [
  { id: "h1", type: "company", query: "Aramco Trading", filters: "KSA · 10,000+ employees", signals: ["Email", "Phone", "LinkedIn", "Funding"], results: 24, enriched: 24, ts: "Today · 09:14" },
  { id: "h2", type: "person", query: "VP Sales · Banking · UAE", filters: "Series B+ · 500+ employees", signals: ["Email", "Phone", "Intent", "Hiring"], results: 87, enriched: 64, ts: "Today · 08:02" },
  { id: "h3", type: "list", query: "GITEX 2026 booth scans", filters: "342 rows · auto-deduped to 318", signals: ["Persona", "Tags", "Lead score"], results: 318, enriched: 318, ts: "Yesterday · 18:47" },
  { id: "h4", type: "company", query: "STC Group", filters: "KSA · Telecom", signals: ["Email", "Phone", "LinkedIn", "Tech stack", "Headcount"], results: 41, enriched: 41, ts: "Yesterday · 14:21" },
  { id: "h5", type: "card", query: "5 cards scanned at Riyadh meetup", filters: "OCR + GCC enrichment waterfall", signals: ["Email", "Phone", "LinkedIn", "Persona"], results: 5, enriched: 5, ts: "Apr 28" },
];

const ENRICHMENT_SIGNALS = [
  { id: "email", label: "Verified email", icon: Mail, group: "Contact" },
  { id: "phone", label: "Direct phone", icon: Phone, group: "Contact" },
  { id: "linkedin", label: "LinkedIn URL", icon: Linkedin, group: "Contact" },
  { id: "title", label: "Job title & seniority", icon: Briefcase, group: "Profile" },
  { id: "persona", label: "Buyer persona", icon: Users, group: "Profile" },
  { id: "tags", label: "AI tags", icon: Tag, group: "Profile" },
  { id: "lead_score", label: "Lead score", icon: Sparkles, group: "Profile" },
  { id: "company_size", label: "Headcount band", icon: Building2, group: "Company" },
  { id: "funding", label: "Funding stage / round", icon: TrendingUp, group: "Company" },
  { id: "industry", label: "Industry & sub-vertical", icon: Globe, group: "Company" },
  { id: "tech_stack", label: "Tech stack", icon: Hash, group: "Company" },
  { id: "intent", label: "Active intent signals", icon: Zap, group: "Buying signals" },
  { id: "hiring", label: "Hiring activity", icon: Users, group: "Buying signals" },
  { id: "news", label: "News & PR mentions", icon: Newspaper, group: "Buying signals" },
  { id: "social", label: "Social handles", icon: Twitter, group: "Social" },
] as const;

const COMPANY_LEAD_PREVIEW = [
  { name: "Khalid Al-Saud",   title: "VP Sales",          dept: "Commercial",  loc: "Riyadh, KSA",  initials: "KS" },
  { name: "Reem Al-Otaibi",   title: "Head of Marketing", dept: "Marketing",   loc: "Riyadh, KSA",  initials: "RO" },
  { name: "Faisal Al-Harbi",  title: "CTO",               dept: "Technology",  loc: "Riyadh, KSA",  initials: "FH" },
  { name: "Layla Al-Sabah",   title: "Director of Ops",   dept: "Operations",  loc: "Jeddah, KSA",  initials: "LS" },
  { name: "Sara Al-Mansouri", title: "Head of People",    dept: "People",      loc: "Riyadh, KSA",  initials: "SM" },
  { name: "Yousef Al-Bahar",  title: "Innovation Lead",   dept: "Strategy",    loc: "Khobar, KSA",  initials: "YB" },
];

const SIGNAL_CHANNELS = [
  { id: "linkedin",   label: "LinkedIn",            icon: Linkedin,  type: "Social",   on: true,  pulls: "Job changes · hiring · posts" },
  { id: "twitter",    label: "X (Twitter)",         icon: Twitter,   type: "Social",   on: true,  pulls: "Mentions · funding chatter" },
  { id: "wamda",      label: "Wamda",               icon: Globe,     type: "PR · MENA", on: true,  pulls: "Startup funding (MENA)" },
  { id: "moci",       label: "MoCI (KSA registry)", icon: Building2, type: "Registry", on: true,  pulls: "New entities · expansions" },
  { id: "prnews",     label: "PR Newswire",         icon: Newspaper, type: "PR",       on: true,  pulls: "Press releases" },
  { id: "reuters",    label: "Reuters Business",    icon: Newspaper, type: "News",     on: false, pulls: "Global business news" },
  { id: "argaam",     label: "Argaam",              icon: Newspaper, type: "News · GCC", on: true,  pulls: "GCC equities & corporate news" },
  { id: "rss",        label: "Custom RSS feed",     icon: Rss,       type: "Custom",   on: false, pulls: "Any RSS URL" },
];

const LIST_FIELD_OPTIONS = ["Email", "Phone", "LinkedIn", "Job title", "Seniority", "Department", "Company size", "Industry", "Country", "Funding stage", "Tech stack"];
const PROFILING_DEPTH = ["Light (3-5 fields)", "Standard (6-10 fields)", "Deep (10-15 + signals)", "Full GCC waterfall (15+ + Khaleeji enrichment)"];
const SIGNAL_CHOICES = ["None", "Buying intent only", "Hiring + funding", "Full signal pack"];
const SURVIVOR_PREF = ["Most recent", "Most engaged (lead score)", "Most complete profile", "Manual pick"];

export default function EnrichmentEnginePage() {
  const [tab, setTab] = useState<Tab>("prospecting");
  const [prospectSeed, setProspectSeed] = useState<{ mode: ProspectMode; query: string } | null>(null);

  function rerunFromHistory(item: SearchHistoryItem) {
    if (item.type === "company" || item.type === "person") {
      setProspectSeed({ mode: item.type, query: item.query });
      setTab("prospecting");
    } else if (item.type === "list") {
      setTab("lists");
    } else if (item.type === "card") {
      setTab("cards");
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-[#B8B880]" /> Enrichment Engine
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Prospect from your seed database, monitor buying signals, scan cards, upload lists, and dedupe — all in one place.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-[#B8B880]/15 text-[#7a7a4a] dark:text-[#cfcf90] font-medium">91% match rate</span>
          <span className="px-2.5 py-1 rounded-full bg-[#88B8B0]/15 text-[#3f7a72] dark:text-[#9ae0d6] font-medium">$0.31 / lead</span>
          <span className="px-2.5 py-1 rounded-full bg-[#B8A0C8]/15 text-[#724f8a] dark:text-[#d3b9e6] font-medium">Clay-style waterfall</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-border flex items-center gap-1 overflow-x-auto" role="tablist">
        <SubTab active={tab === "prospecting"} onClick={() => setTab("prospecting")} icon={Search}      label="Prospecting" />
        <SubTab active={tab === "signals"}     onClick={() => setTab("signals")}     icon={Zap}         label="Buying Signals" />
        <SubTab active={tab === "quick"}       onClick={() => setTab("quick")}       icon={Sparkles}    label="Quick Lead Enrich" />
        <SubTab active={tab === "cards"}       onClick={() => setTab("cards")}       icon={ScanLine}    label="Card Scanner" />
        <SubTab active={tab === "lists"}       onClick={() => setTab("lists")}       icon={Upload}      label="List Upload" />
        <SubTab active={tab === "dedup"}       onClick={() => setTab("dedup")}       icon={GitMerge}    label="Deduplication" />
        <SubTab active={tab === "history"}     onClick={() => setTab("history")}     icon={History}     label="Search History" />
      </div>

      {tab === "prospecting" && <ProspectingTab seed={prospectSeed} onConsumeSeed={() => setProspectSeed(null)} />}
      {tab === "signals"     && <BuyingSignalsTab />}
      {tab === "quick"       && <Lazy><LeadEnrichPage /></Lazy>}
      {tab === "cards"       && <Lazy><BusinessCardsPage /></Lazy>}
      {tab === "lists"       && <ListUploadTab />}
      {tab === "dedup"       && <Lazy><DedupPage /></Lazy>}
      {tab === "history"     && <SearchHistoryTab onRerun={rerunFromHistory} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PROSPECTING — search by company OR person, pick signals
// ─────────────────────────────────────────────────────────
function ProspectingTab({ seed, onConsumeSeed }: { seed: { mode: ProspectMode; query: string } | null; onConsumeSeed: () => void }) {
  const [mode, setMode] = useState<ProspectMode>("company");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("GCC");
  const [industry, setIndustry] = useState("All industries");
  const [seniority, setSeniority] = useState("VP & above");
  const [signals, setSignals] = useState<Set<string>>(new Set(["email", "phone", "linkedin", "title", "lead_score"]));
  const [signalsOpen, setSignalsOpen] = useState(false);
  const [searched, setSearched] = useState<null | { mode: ProspectMode; company: string; people: typeof COMPANY_LEAD_PREVIEW }>(null);
  const [enriching, setEnriching] = useState(false);
  const [enriched, setEnriched] = useState<Set<string>>(new Set());

  // Honor a re-run request coming from Search History.
  useEffect(() => {
    if (!seed) return;
    setMode(seed.mode);
    setQuery(seed.query);
    setEnriched(new Set());
    setSearched({ mode: seed.mode, company: seed.query, people: COMPANY_LEAD_PREVIEW });
    onConsumeSeed();
  }, [seed, onConsumeSeed]);

  function toggleSignal(id: string) {
    setSignals((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function changeMode(next: ProspectMode) {
    if (next === mode) return;
    setMode(next);
    // Stale results would mislabel the header; clear them.
    setSearched(null);
    setEnriched(new Set());
  }

  function runSearch() {
    if (!query.trim()) return;
    setEnriched(new Set());
    setSearched({ mode, company: query.trim(), people: COMPANY_LEAD_PREVIEW });
  }

  function enrichAll() {
    if (!searched) return;
    setEnriching(true);
    setTimeout(() => {
      setEnriched(new Set(searched.people.map((p) => p.name)));
      setEnriching(false);
    }, 1400);
  }

  function enrichOne(name: string) {
    setEnriched((s) => new Set([...s, name]));
  }

  const grouped = useMemo(() => {
    const out: Record<string, typeof ENRICHMENT_SIGNALS[number][]> = {};
    for (const s of ENRICHMENT_SIGNALS) {
      (out[s.group] ??= []).push(s);
    }
    return out;
  }, []);

  return (
    <div className="space-y-5">
      {/* Intro card */}
      <div className="glass-card rounded-2xl p-5 border-l-4 border-[#B8B880]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B8B880]/15 flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5 text-[#B8B880]" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Prospecting from your seed database</div>
            <p className="text-sm text-muted-foreground mt-1">
              Search across <span className="text-foreground font-medium">your enriched company & contact seed pool</span> (Lusha + Apollo + Crunchbase + GCC sources). Pick a company to pull all its leads, or query by persona. Then choose which enrichment signals you want pulled in the waterfall.
            </p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeMode("company")}
            aria-pressed={mode === "company"}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition", mode === "company" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}
          >
            <Building2 className="w-3 h-3 inline mr-1" /> By company
          </button>
          <button
            onClick={() => changeMode("person")}
            aria-pressed={mode === "person"}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition", mode === "person" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}
          >
            <Users className="w-3 h-3 inline mr-1" /> By persona
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder={mode === "company" ? "e.g. Aramco Trading · STC Group · Emirates NBD" : "e.g. CFO at Series B+ SaaS in UAE"}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm"
            />
          </div>
          <button
            onClick={runSearch}
            disabled={!query.trim()}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" /> Search seed database
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <FilterPill label="Region" value={region} onChange={setRegion} options={["GCC", "KSA only", "UAE only", "Bahrain & Qatar", "Global"]} />
          <FilterPill label="Industry" value={industry} onChange={setIndustry} options={["All industries", "Banking & Fintech", "Telecom", "Energy", "Real Estate", "Retail & e-commerce", "Government & Public"]} />
          <FilterPill label="Seniority" value={seniority} onChange={setSeniority} options={["C-Level only", "VP & above", "Director & above", "All"]} />
        </div>

        {/* Signal multi-select */}
        <div className="rounded-xl border border-border bg-background/50">
          <button
            onClick={() => setSignalsOpen((o) => !o)}
            aria-expanded={signalsOpen}
            className="w-full px-4 py-3 flex items-center justify-between text-sm hover:bg-muted/40 transition rounded-xl"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#B8B880]" />
              <span className="font-medium">Enrichment signals to pull</span>
              <span className="text-xs text-muted-foreground">({signals.size} selected)</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition", signalsOpen && "rotate-180")} />
          </button>
          {signalsOpen && (
            <div className="border-t border-border p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{group}</div>
                  <div className="space-y-1.5">
                    {items.map((s) => {
                      const Icon = s.icon;
                      const on = signals.has(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleSignal(s.id)}
                          aria-pressed={on}
                          className={cn(
                            "w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition",
                            on ? "bg-[#B8B880]/15 text-foreground border border-[#B8B880]/40" : "bg-muted/40 text-muted-foreground hover:text-foreground border border-transparent",
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="flex-1 text-left">{s.label}</span>
                          {on && <Check className="w-3 h-3 text-[#B8B880]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="sm:col-span-2 lg:col-span-3 pt-2 border-t border-border flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  placeholder="Add custom signal (e.g. 'Recently changed CRM')"
                  className="flex-1 bg-transparent text-xs outline-none border-b border-dashed border-border focus:border-primary py-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs text-muted-foreground uppercase">{searched.mode === "company" ? "Leads at" : "People matching"}</div>
              <div className="text-lg font-semibold flex items-center gap-2">
                {searched.mode === "company" ? <Building2 className="w-4 h-4 text-muted-foreground" /> : <Users className="w-4 h-4 text-muted-foreground" />}
                {searched.company}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {searched.people.length} contacts · {signals.size} signals will be pulled per contact
              </div>
            </div>
            <button
              onClick={enrichAll}
              disabled={enriching}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-60"
            >
              {enriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {enriching ? "Enriching all…" : `Enrich all ${searched.people.length} leads`}
            </button>
          </div>
          <div className="divide-y divide-border">
            {searched.people.map((p) => {
              const isEnriched = enriched.has(p.name);
              return (
                <div key={p.name} className="px-5 py-3 flex items-center gap-3 hover:bg-muted/30 transition">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
                    {p.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.title} · {p.dept} · {p.loc}</div>
                  </div>
                  {isEnriched ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Enriched
                    </span>
                  ) : (
                    <button
                      onClick={() => enrichOne(p.name)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Enrich
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!searched && (
        <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <div className="text-sm">Enter a {mode === "company" ? "company name" : "persona query"} above to prospect from your seed database.</div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// BUYING SIGNALS — channel mapping + existing signals feed
// ─────────────────────────────────────────────────────────
function BuyingSignalsTab() {
  const [channels, setChannels] = useState(SIGNAL_CHANNELS);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  function toggleChannel(id: string) {
    setChannels((cs) => cs.map((c) => (c.id === id ? { ...c, on: !c.on } : c)));
  }

  function addChannel() {
    if (!newName.trim()) return;
    setChannels((cs) => [
      ...cs,
      { id: `c${Date.now()}`, label: newName.trim(), icon: Globe, type: "Custom", on: true, pulls: newUrl.trim() || "Custom source" },
    ]);
    setNewName("");
    setNewUrl("");
    setShowAdd(false);
  }

  return (
    <div className="space-y-5">
      {/* Channel mapping */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C8A880]" /> Public sources & channel mapping
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Pick which public channels NexFlow monitors to generate buying signals about your accounts — social, PR, news, registries, or any custom URL.
            </p>
          </div>
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add channel
          </button>
        </div>

        {showAdd && (
          <div className="rounded-xl border border-dashed border-border p-3 mb-4 grid sm:grid-cols-[1fr_1fr_auto] gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Channel name (e.g. ArabNet)"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="URL or RSS feed"
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <div className="flex items-center gap-2">
              <button onClick={addChannel} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium">Save</button>
              <button onClick={() => setShowAdd(false)} className="px-3 py-2 rounded-lg border border-border text-xs">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                className={cn(
                  "rounded-xl border p-3 transition",
                  c.on ? "border-[#C8A880]/50 bg-[#C8A880]/5" : "border-border bg-background/40",
                )}
              >
                <div className="flex items-start gap-2">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", c.on ? "bg-[#C8A880]/15 text-[#C8A880]" : "bg-muted text-muted-foreground")}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium flex items-center gap-1.5">
                      {c.label}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{c.type}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{c.pulls}</div>
                  </div>
                  <button
                    onClick={() => toggleChannel(c.id)}
                    aria-pressed={c.on}
                    aria-label={`${c.on ? "Disable" : "Enable"} ${c.label}`}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition flex-shrink-0",
                      c.on ? "bg-[#C8A880]" : "bg-muted",
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", c.on ? "translate-x-4" : "translate-x-0")} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live signals feed (existing page) */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-[#B8B880]" />
          <div className="font-semibold">Live signals feed</div>
          <span className="text-xs text-muted-foreground">— pulled from your enabled channels</span>
        </div>
        <Lazy><SignalsPage /></Lazy>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LIST UPLOAD — upload → dedup → questionnaire
// ─────────────────────────────────────────────────────────
function ListUploadTab() {
  const [phase, setPhase] = useState<"upload" | "deduping" | "questionnaire" | "queued">("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState(0);
  const [duplicates, setDuplicates] = useState(0);

  // questionnaire state
  const [fields, setFields] = useState<Set<string>>(new Set(["Email", "Phone", "Job title", "Company size"]));
  const [depth, setDepth] = useState(PROFILING_DEPTH[1]);
  const [signals, setSignals] = useState(SIGNAL_CHOICES[1]);
  const [survivor, setSurvivor] = useState(SURVIVOR_PREF[1]);
  const [tagList, setTagList] = useState("");

  function handleFile(f: File | null) {
    if (!f) return;
    setFileName(f.name);
    const r = 100 + Math.floor(Math.random() * 600);
    const d = Math.floor(r * (0.05 + Math.random() * 0.15));
    setRows(r);
    setDuplicates(d);
    setPhase("deduping");
    setTimeout(() => setPhase("questionnaire"), 1600);
  }

  function toggleField(f: string) {
    setFields((s) => {
      const n = new Set(s);
      if (n.has(f)) n.delete(f);
      else n.add(f);
      return n;
    });
  }

  function reset() {
    setPhase("upload");
    setFileName(null);
    setRows(0);
    setDuplicates(0);
  }

  return (
    <div className="space-y-5">
      {phase === "upload" && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <div className="font-semibold">Upload a list to enrich</div>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Drop a CSV / Excel file. We'll auto-deduplicate it, then ask you a few questions about what data and profiling you need before queueing it for the enrichment waterfall.
          </p>
          <label className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition cursor-pointer">
            <Upload className="w-4 h-4" /> Choose file
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          </label>
          <div className="text-xs text-muted-foreground mt-3">CSV · XLSX · up to 50,000 rows</div>
        </div>
      )}

      {phase === "deduping" && (
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#B8B880] mb-3" />
          <div className="font-semibold">Deduping {fileName}…</div>
          <div className="text-sm text-muted-foreground mt-1">{rows.toLocaleString()} rows · scanning for duplicates</div>
        </div>
      )}

      {phase === "questionnaire" && (
        <div className="space-y-5">
          {/* Dedup result strip */}
          <div className="glass-card rounded-2xl p-5 border-l-4 border-emerald-500">
            <div className="flex items-center gap-3 flex-wrap">
              <FileText className="w-5 h-5 text-emerald-500" />
              <div className="flex-1 min-w-[200px]">
                <div className="font-medium text-sm">{fileName} — deduplicated</div>
                <div className="text-xs text-muted-foreground">
                  {rows.toLocaleString()} rows uploaded · <span className="text-amber-600 font-medium">{duplicates} duplicates merged</span> · <span className="text-emerald-600 font-medium">{(rows - duplicates).toLocaleString()} unique records</span>
                </div>
              </div>
              <button onClick={reset} className="text-xs px-2.5 py-1 rounded-lg border border-border hover:bg-muted transition flex items-center gap-1">
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>

          {/* Questionnaire */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#B8A0C8]/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-[#B8A0C8]" />
              </div>
              <div>
                <div className="font-semibold">A few quick questions before we enrich</div>
                <p className="text-xs text-muted-foreground mt-0.5">Tell NexFlow what data, profiling depth, and survivor rules you want for this list.</p>
              </div>
            </div>

            {/* Q1: fields */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">1 · Which fields do you need filled in?</div>
              <div className="flex flex-wrap gap-1.5">
                {LIST_FIELD_OPTIONS.map((f) => {
                  const on = fields.has(f);
                  return (
                    <button
                      key={f}
                      onClick={() => toggleField(f)}
                      aria-pressed={on}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium transition border",
                        on ? "bg-[#B8B880]/20 text-foreground border-[#B8B880]/40" : "bg-muted/40 text-muted-foreground border-transparent hover:text-foreground",
                      )}
                    >
                      {on && <Check className="w-3 h-3 inline mr-1" />}
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Q2: profiling depth */}
            <Question label="2 · Profiling depth" value={depth} onChange={setDepth} options={PROFILING_DEPTH} />

            {/* Q3: signals */}
            <Question label="3 · Which buying signals do you want?" value={signals} onChange={setSignals} options={SIGNAL_CHOICES} />

            {/* Q4: survivor */}
            <Question label="4 · When duplicates were merged, who should win as the survivor?" value={survivor} onChange={setSurvivor} options={SURVIVOR_PREF} />

            {/* Q5: tags */}
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">5 · Tag this batch (optional)</div>
              <input
                value={tagList}
                onChange={(e) => setTagList(e.target.value)}
                placeholder="e.g. GITEX 2026 · Riyadh roadshow · Q2 KSA expansion"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
              />
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs text-muted-foreground">
                {fields.size} fields · {depth.split(" ")[0]} profiling · {signals}
              </div>
              <button
                onClick={() => setPhase("queued")}
                disabled={fields.size === 0}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" /> Queue for enrichment
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "queued" && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <Check className="w-10 h-10 mx-auto mb-3 text-emerald-500" />
          <div className="font-semibold">Queued · {(rows - duplicates).toLocaleString()} records</div>
          <p className="text-sm text-muted-foreground mt-1">
            Estimated completion ~ {Math.max(2, Math.round((rows - duplicates) / 120))} min. We'll notify you when this batch is ready and the new contacts are visible in your CRM.
          </p>
          <button
            onClick={reset}
            className="mt-4 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Upload another list
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SEARCH HISTORY
// ─────────────────────────────────────────────────────────
function SearchHistoryTab({ onRerun }: { onRerun: (item: SearchHistoryItem) => void }) {
  const [items, setItems] = useState(SEED_HISTORY);
  const [filter, setFilter] = useState<"all" | "company" | "person" | "list" | "card">("all");

  const visible = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          {(["all", "company", "person", "list", "card"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium capitalize transition",
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? "All searches" : f === "card" ? "Card scans" : f}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">{visible.length} entries</div>
      </div>

      <div className="glass-card rounded-2xl divide-y divide-border overflow-hidden">
        {visible.length === 0 && (
          <div className="p-10 text-center text-muted-foreground text-sm">No searches in this filter yet.</div>
        )}
        {visible.map((h) => {
          const TypeIcon = h.type === "company" ? Building2 : h.type === "person" ? Users : h.type === "list" ? Upload : ScanLine;
          return (
            <div key={h.id} className="p-4 flex items-start gap-3 hover:bg-muted/30 transition group">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                <TypeIcon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{h.query}</span>
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{h.type}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">{h.filters}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {h.signals.map((s) => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#B8B880]/15 text-[#7a7a4a] dark:text-[#cfcf90]">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-muted-foreground">{h.ts}</div>
                <div className="text-sm font-semibold mt-0.5">{h.enriched}/{h.results}</div>
                <div className="text-[10px] text-muted-foreground">enriched / found</div>
              </div>
              <div className="flex items-center gap-1 ml-2 opacity-60 group-hover:opacity-100 focus-within:opacity-100 transition">
                <button
                  onClick={() => onRerun(h)}
                  aria-label="Re-run search"
                  title="Re-run search"
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setItems((arr) => arr.filter((x) => x.id !== h.id))}
                  aria-label="Delete entry"
                  title="Delete entry"
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Shared UI helpers
// ─────────────────────────────────────────────────────────
function SubTab({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={cn(
        "px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap",
        active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function FilterPill({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="rounded-xl border border-border bg-background/50 px-3 py-2 flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none text-foreground font-medium cursor-pointer"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Question({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-2">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm cursor-pointer"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="glass-card rounded-2xl p-10 flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
      </div>
    }>
      {children}
    </Suspense>
  );
}
