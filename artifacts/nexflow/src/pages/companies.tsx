import { useCompanies } from "@/hooks/useApi";
import { Search, Plus, Building2, Globe, Users2, TrendingUp, Sparkles } from "lucide-react";
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
  const { data, isLoading } = useCompanies(search ? { search } : undefined);
  const companies = data?.companies ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Companies</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{data?.total ?? 0} companies tracked</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">
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
          <div className="glass-card rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group h-full">
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
    </div>
  );
}
