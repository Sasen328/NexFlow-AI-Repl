import { useCompanies, useCreate, useAiDraftCompany } from "@/hooks/useApi";
import { Search, Plus, Building2, Globe, Users2, TrendingUp, Sparkles, Loader2, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const INDUSTRY_COLORS: Record<string, string> = {
  "Venture Capital": "bg-[#B8A0C8]/20 text-[#B8A0C8]",
  "Investment Banking": "bg-[#88B8B0]/20 text-[#88B8B0]",
  "Asset Management": "bg-[#C8A880]/20 text-[#C8A880]",
  "Technology": "bg-[#90B8B8]/20 text-[#90B8B8]",
  "Chemicals": "bg-[#B8B880]/20 text-[#B8B880]",
};

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const { data, isLoading } = useCompanies(search ? { search } : undefined);
  const companies = data?.companies ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Companies</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{data?.total ?? 0} companies tracked</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Add Company
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/60 border border-border/40 max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground"
          placeholder="Search companies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 h-40 animate-pulse bg-muted/30" />
          ))
        ) : companies.map((c: any) => (
          <Link key={c.id} href={`/companies/${c.id}`}>
          <div className="glass-card rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group h-full relative">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Sparkles className="w-3.5 h-3.5 text-[#B8A0C8]" />
            </div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {c.name?.[0] ?? "C"}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm group-hover:text-[#B8A0C8] transition-colors">{c.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Globe className="w-3 h-3" />
                    {c.domain}
                  </div>
                </div>
              </div>
              <span className={cn("text-xs px-2 py-1 rounded-full font-medium", INDUSTRY_COLORS[c.industry] ?? "bg-muted text-muted-foreground")}>
                {c.industry}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{c.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users2 className="w-3 h-3" />
                {c.size ?? "—"}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {c.country}
              </span>
              {c.revenue && (
                <span className="flex items-center gap-1 text-[#88B8B0] font-medium">
                  <TrendingUp className="w-3 h-3" />
                  ${(c.revenue / 100).toLocaleString()}
                </span>
              )}
            </div>
            {c.tags?.length > 0 && (
              <div className="flex gap-1 mt-3 flex-wrap">
                {c.tags.slice(0, 3).map((t: string) => (
                  <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">{t}</span>
                ))}
              </div>
            )}
          </div>
          </Link>
        ))}
      </div>

      {showNew && <NewCompanyModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewCompanyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const create = useCreate("/companies", ["companies", "dashboard"]);
  const draft = useAiDraftCompany();

  const fillFromAI = async () => {
    if (!name.trim()) return;
    const result: any = await draft.mutateAsync({ name, domain, website: domain ? `https://${domain}` : "" });
    const d = result?.draft ?? {};
    if (d.industry) setIndustry(d.industry);
    if (d.size) setSize(d.size);
    if (d.description) setDescription(d.description);
    if (d.hq_location) setCountry(d.hq_location);
    if (Array.isArray(d.technologies)) setTags(d.technologies.slice(0, 5));
  };

  const handleCreate = () => {
    const payload: Record<string, any> = { name };
    if (domain.trim()) payload.domain = domain.trim();
    if (industry.trim()) payload.industry = industry.trim();
    if (size.trim()) payload.size = size.trim();
    if (description.trim()) payload.description = description.trim();
    if (country.trim()) payload.country = country.trim();
    if (tags.length) payload.tags = tags;
    create.mutate(payload, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground text-lg">Add Company</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Acme Inc." className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#B8A0C8]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Domain</label>
            <div className="flex gap-2 mt-1">
              <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="acme.com" className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#B8A0C8]" />
              <button
                onClick={fillFromAI}
                disabled={!name || draft.isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#B8A0C8]/15 text-[#B8A0C8] text-xs font-semibold hover:bg-[#B8A0C8]/25 disabled:opacity-40"
              >
                {draft.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Auto-enrich
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Industry</label>
              <input value={industry} onChange={e => setIndustry(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Size</label>
              <select value={size} onChange={e => setSize(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none">
                <option value="">—</option>
                {["1-10","11-50","51-200","201-500","501-1000","1000+"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Country</label>
            <input value={country} onChange={e => setCountry(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[#B8A0C8]/15 text-[#B8A0C8] flex items-center gap-1">
                  {t}
                  <button onClick={() => setTags(tags.filter(x => x !== t))} className="hover:text-foreground"><X className="w-2.5 h-2.5" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">Cancel</button>
          <button onClick={handleCreate} disabled={!name || create.isPending} className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {create.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create company
          </button>
        </div>
      </div>
    </div>
  );
}
