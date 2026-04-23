import { useContacts } from "@/hooks/useApi";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-[#90B8B8]/20 text-[#90B8B8]",
  active: "bg-[#88B8B0]/20 text-[#88B8B0]",
  qualified: "bg-[#B8A0C8]/20 text-[#B8A0C8]",
  churned: "bg-destructive/20 text-destructive",
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "#88B8B0" : score >= 60 ? "#B8B880" : "#C0A0B8";
  return (
    <div className="relative w-9 h-9">
      <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/40" />
        <circle
          cx="18" cy="18" r="15" fill="none" strokeWidth="2.5"
          stroke={color}
          strokeDasharray={`${(score / 100) * 94.2} 94.2`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">{score}</span>
    </div>
  );
}

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [, navigate] = useLocation();
  const { data, isLoading } = useContacts(
    search || status ? { ...(search ? { search } : {}), ...(status ? { status } : {}) } : undefined
  );
  const contacts = data?.contacts ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{data?.total ?? 0} contacts tracked</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/60 border border-border/40">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2.5 rounded-xl bg-muted/60 border border-border/40 text-sm text-foreground outline-none"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="active">Active</option>
          <option value="qualified">Qualified</option>
          <option value="churned">Churned</option>
        </select>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Company</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Title</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Score</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden xl:table-cell">Tags</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-border/20">
                  <td colSpan={7} className="px-5 py-3.5">
                    <div className="h-8 bg-muted/60 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground text-sm">
                  No contacts found
                </td>
              </tr>
            ) : (
              contacts.map((c: any) => (
                <tr
                  key={c.id}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/contacts/${c.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(c.first_name?.[0] ?? "") + (c.last_name?.[0] ?? "")}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground group-hover:text-[#B8A0C8] transition-colors">
                          {c.first_name} {c.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-foreground/80">{c.company_name ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{c.title ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-center">
                      <ScoreBadge score={c.lead_score ?? 0} />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium capitalize", STATUS_COLORS[c.status] ?? "bg-muted text-muted-foreground")}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden xl:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {(c.tags ?? []).slice(0, 2).map((t: string) => (
                        <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-[10px] text-[#B8A0C8] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View profile →
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
