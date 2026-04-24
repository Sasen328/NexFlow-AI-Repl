import { useState } from "react";
import {
  Search, Database, Filter, Download, Plus, Check, ChevronDown,
  Building2, Users, Mail, Phone, Linkedin, MapPin, Briefcase, Globe,
  Sparkles, Zap, Target, ArrowRight, Layers, RefreshCw, X
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  { id: "lusha", name: "Lusha", color: "#9747FF", category: "B2B Contacts", credits: 487, status: "connected", description: "Verified emails & direct dials" },
  { id: "clay", name: "Clay", color: "#FFB800", category: "Enrichment Engine", credits: 1240, status: "connected", description: "Multi-provider waterfalls" },
  { id: "signalhire", name: "SignalHire", color: "#3DC2FF", category: "Talent + B2B", credits: 312, status: "connected", description: "Real-time email/phone discovery" },
  { id: "rocketreach", name: "RocketReach", color: "#FF5C5C", category: "B2B Database", credits: 95, status: "connected", description: "750M+ professionals" },
  { id: "crunchbase", name: "Crunchbase", color: "#146AFF", category: "Company Intelligence", credits: 60, status: "connected", description: "Funding + leadership data" },
  { id: "apollo", name: "Apollo.io", color: "#8B5CF6", category: "B2B Platform", credits: 0, status: "disconnected", description: "260M+ contacts (mock-ready)" },
  { id: "zoominfo", name: "ZoomInfo", color: "#1A6BE8", category: "Enterprise Intel", credits: 0, status: "disconnected", description: "Enterprise-grade data" },
  { id: "dnb", name: "Dun & Bradstreet", color: "#0070AD", category: "Company Records", credits: 0, status: "disconnected", description: "Global business records" },
];

const PROSPECTS = [
  {
    id: "p1", name: "Khalid Al-Saud", title: "VP Sales · Aramco Trading", location: "Riyadh, KSA",
    email: "k.alsaud@aramcotrading.com", phone: "+966 50 ***", linkedin: true,
    confidence: 96, source: "Lusha + Crunchbase", company_size: "10,000+", funding: "Series Public",
    intent: "Researching CRM platforms", initials: "KS", color: "#B8A0C8",
  },
  {
    id: "p2", name: "Mariam Al-Khalifa", title: "Head of Digital · Bahrain Bank", location: "Manama, BH",
    email: "m.khalifa@bahrainbank.bh", phone: "+973 33 ***", linkedin: true,
    confidence: 89, source: "Apollo + LinkedIn", company_size: "1001-5000", funding: "—",
    intent: "Hiring Sales Director (signal)", initials: "MK", color: "#88B8B0",
  },
  {
    id: "p3", name: "Saeed bin Rashid", title: "CTO · UAE Telecom Holdings", location: "Dubai, UAE",
    email: "s.rashid@uaetel.ae", phone: "+971 50 ***", linkedin: true,
    confidence: 92, source: "RocketReach + ZoomInfo", company_size: "5001-10,000", funding: "—",
    intent: "Visited pricing page 4x", initials: "SR", color: "#C8A880",
  },
  {
    id: "p4", name: "Hessa Al-Mansoor", title: "Chief Commercial · Noor Telecom", location: "Doha, QA",
    email: "h.almansoor@noortel.qa", phone: "+974 33 ***", linkedin: true,
    confidence: 87, source: "SignalHire + Clay waterfall", company_size: "501-1000", funding: "Series C",
    intent: "Downloaded GCC AI Sales Report", initials: "HM", color: "#90B8B8",
  },
  {
    id: "p5", name: "Yousef Al-Bahar", title: "Head of Innovation · Kuwait Holding", location: "Kuwait City, KW",
    email: "y.bahar@kuwaitholding.kw", phone: "+965 99 ***", linkedin: true,
    confidence: 81, source: "Crunchbase + Lusha", company_size: "1001-5000", funding: "Private",
    intent: "Job posting for AE roles", initials: "YB", color: "#B8B880",
  },
];

const SAVED_SEARCHES = [
  { name: "GCC SaaS C-Level", count: 348, growth: "+12 this week" },
  { name: "KSA Enterprise · Series B+", count: 67, growth: "+5 this week" },
  { name: "UAE Banking Tech Decision Makers", count: 124, growth: "+8 this week" },
  { name: "Arabic-First Buyers · 500+ employees", count: 213, growth: "+19 this week" },
];

export default function SourcingPage() {
  const [tab, setTab] = useState<"discover" | "providers" | "saved">("discover");
  const [filters, setFilters] = useState({
    region: "GCC",
    industry: "All",
    seniority: "C-Level + VP",
    company_size: "501+",
    intent: "Active intent",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [waterfall, setWaterfall] = useState(true);
  const [showNewSearch, setShowNewSearch] = useState(false);

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const totalCredits = PROVIDERS.filter(p => p.status === "connected").reduce((a, p) => a + p.credits, 0);
  const connectedCount = PROVIDERS.filter(p => p.status === "connected").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="w-6 h-6 text-[#C8A880]" />
            Sourcing & Enrichment
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Discover, enrich, and import prospects from {connectedCount}+ B2B data providers</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-card rounded-xl px-3 py-2 text-center">
            <div className="text-sm font-bold text-[#88B8B0]">{totalCredits.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">credits available</div>
          </div>
          <button
            onClick={() => setShowNewSearch(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Search
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/40 w-fit">
        {[
          { k: "discover", label: "Discover Prospects", icon: Search },
          { k: "providers", label: "Data Providers", icon: Layers },
          { k: "saved", label: "Saved Searches", icon: Target },
        ].map(t => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as any)}
            className={cn("flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all", tab === t.k ? "nf-chameleon-bg text-white" : "text-muted-foreground hover:text-foreground")}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "discover" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Filters */}
          <div className="lg:col-span-1 space-y-3">
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Filters</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(filters).map(([key, val]) => (
                  <div key={key}>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">{key.replace("_", " ")}</label>
                    <div className="mt-1 px-3 py-1.5 rounded-lg bg-muted/40 text-xs text-foreground flex items-center justify-between cursor-pointer hover:bg-muted/60 transition-colors">
                      {val}
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#B8A0C8]" />
                  Clay Waterfall
                </span>
                <button onClick={() => setWaterfall(!waterfall)} className={cn("w-8 h-4 rounded-full relative transition-colors", waterfall ? "bg-[#88B8B0]" : "bg-muted")}>
                  <div className={cn("w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all", waterfall ? "left-4" : "left-0.5")} />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug">Auto-cascade through Lusha → Apollo → ZoomInfo → RocketReach for max coverage at lowest cost</p>
            </div>

            <div className="glass-card rounded-2xl p-4 nf-chameleon-border">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-[#B8B880]" />
                <span className="text-xs font-semibold text-foreground">AI Lookalike</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">Find prospects similar to your top customers</p>
              <button className="w-full text-xs px-3 py-1.5 rounded-lg nf-chameleon-bg text-white font-semibold">
                Generate from CRM
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-3">
            {/* Search bar */}
            <div className="glass-card rounded-2xl p-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground ml-2 flex-shrink-0" />
              <input
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                placeholder="Search by name, title, company, or domain..."
                defaultValue=""
              />
              <span className="text-xs text-muted-foreground flex-shrink-0 mr-2">{PROSPECTS.length} results</span>
            </div>

            {/* Bulk actions */}
            {selected.size > 0 && (
              <div className="glass-card rounded-2xl p-3 nf-chameleon-border flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">{selected.size} selected</span>
                <button className="px-3 py-1.5 rounded-lg nf-chameleon-bg text-white text-xs font-semibold">
                  Enrich & Import
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-muted/60 text-foreground text-xs font-medium">
                  Add to Sequence
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-muted/60 text-foreground text-xs font-medium flex items-center gap-1">
                  <Download className="w-3 h-3" /> Export CSV
                </button>
                <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Clear</button>
              </div>
            )}

            {/* Prospect cards */}
            <div className="space-y-2.5">
              {PROSPECTS.map(p => {
                const isSelected = selected.has(p.id);
                return (
                  <div key={p.id} className={cn("glass-card rounded-2xl p-4 transition-all cursor-pointer", isSelected && "nf-chameleon-border")}
                    onClick={() => toggle(p.id)}>
                    <div className="flex items-start gap-3">
                      <button className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center mt-1 flex-shrink-0 transition-all",
                        isSelected ? "nf-chameleon-bg border-transparent" : "border-border bg-transparent")}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: p.color }}>
                        {p.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-sm text-foreground">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.title}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-black" style={{ color: p.confidence >= 90 ? "#88B8B0" : p.confidence >= 80 ? "#B8B880" : "#C8A880" }}>
                              {p.confidence}%
                            </div>
                            <div className="text-[9px] text-muted-foreground">match</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {p.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {p.phone}</span>
                          <span className="flex items-center gap-1"><Linkedin className="w-3 h-3" /> Profile</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.location}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B8B880]/15 text-[#B8B880] font-medium flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" />
                            {p.intent}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-medium">
                            {p.company_size} emp
                          </span>
                          {p.funding !== "—" && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#88B8B0]/15 text-[#88B8B0] font-medium">
                              {p.funding}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground/70 ml-auto">via {p.source}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "providers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROVIDERS.map(p => (
            <div key={p.id} className={cn("glass-card rounded-2xl p-5 transition-all", p.status === "connected" ? "" : "opacity-70")}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0" style={{ background: p.color }}>
                  {p.name[0]}
                </div>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                  p.status === "connected" ? "bg-[#88B8B0]/20 text-[#88B8B0]" : "bg-muted/60 text-muted-foreground")}>
                  {p.status}
                </span>
              </div>
              <h3 className="font-bold text-foreground">{p.name}</h3>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">{p.category}</div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{p.description}</p>
              {p.status === "connected" ? (
                <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between">
                  <div>
                    <div className="text-base font-black text-foreground">{p.credits.toLocaleString()}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wide">credits left</div>
                  </div>
                  <button className="text-xs text-[#B8A0C8] font-semibold hover:underline">Manage</button>
                </div>
              ) : (
                <button className="mt-4 w-full px-3 py-2 rounded-xl bg-muted/40 text-foreground text-xs font-semibold hover:bg-muted/60 transition-colors">
                  Connect via API
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "saved" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAVED_SEARCHES.map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[#C8A880]/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-[#C8A880]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">{s.name}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground"><strong className="text-foreground">{s.count.toLocaleString()}</strong> prospects</span>
                  <span className="text-xs text-[#88B8B0] font-medium">{s.growth}</span>
                </div>
              </div>
              <button className="px-3 py-2 rounded-xl nf-chameleon-bg text-white text-xs font-semibold flex items-center gap-1">
                Run <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showNewSearch && (
        <NewSearchModal onClose={() => setShowNewSearch(false)} onSave={(name) => {
          setShowNewSearch(false);
          setTab("saved");
        }} />
      )}
    </div>
  );
}

function NewSearchModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string) => void }) {
  const [form, setForm] = useState({
    name: "",
    region: "GCC",
    industry: "All",
    seniority: "C-Level, VP",
    company_size: "501+",
    intent: "",
    providers: ["lusha", "clay"],
  });
  const [running, setRunning] = useState(false);
  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function handleSave() {
    if (!form.name.trim()) return;
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      onSave(form.name);
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg bg-background" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Search className="w-4 h-4 text-[#C8A880]" />
              New Prospect Search
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Define your ICP filters and run across connected providers</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Search Name *</label>
            <input autoFocus className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground focus:border-[#B8A0C8]" value={form.name} onChange={e => up("name", e.target.value)} placeholder='e.g. "KSA FinTech Decision Makers"' />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Region</label>
              <select className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground" value={form.region} onChange={e => up("region", e.target.value)}>
                {["GCC", "KSA", "UAE", "Qatar", "Bahrain", "Kuwait", "Oman", "MENA"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Industry</label>
              <select className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground" value={form.industry} onChange={e => up("industry", e.target.value)}>
                {["All", "FinTech", "SaaS", "Real Estate", "Healthcare", "Retail", "Telecom", "Energy", "Manufacturing"].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Seniority</label>
              <select className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground" value={form.seniority} onChange={e => up("seniority", e.target.value)}>
                {["C-Level, VP", "Director+", "Manager+", "Individual Contributor", "All levels"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Company Size</label>
              <select className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground" value={form.company_size} onChange={e => up("company_size", e.target.value)}>
                {["1-50", "51-200", "201-500", "501+", "1,000+", "5,000+"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Intent Signal (optional)</label>
            <input className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground focus:border-[#B8A0C8]" value={form.intent} onChange={e => up("intent", e.target.value)} placeholder='e.g. "Hiring for sales roles" or "raised Series B"' />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-1.5 block">Data Providers</label>
            <div className="flex flex-wrap gap-2">
              {["lusha", "clay", "signalhire", "rocketreach", "crunchbase"].map(p => {
                const on = form.providers.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => setForm(f => ({ ...f, providers: on ? f.providers.filter(x => x !== p) : [...f.providers, p] }))}
                    className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all capitalize", on ? "border-[#B8A0C8] bg-[#B8A0C8]/15 text-[#B8A0C8]" : "border-border/40 text-muted-foreground hover:text-foreground")}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || running}
            className="px-4 py-2 rounded-lg text-sm font-semibold nf-chameleon-bg text-white disabled:opacity-50 flex items-center gap-1.5"
          >
            {running ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Running search…</> : <><Sparkles className="w-3.5 h-3.5" /> Run & Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

