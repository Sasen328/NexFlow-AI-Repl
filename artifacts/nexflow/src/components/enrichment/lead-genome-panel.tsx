import { useState, useEffect } from "react";
import { Database, Download, Plus, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";

const ACCENT = "#B8A0C8";
const TEAL   = "#88B8B0";
const GOLD   = "#C8A880";
const ROSE   = "#C0A0B8";

const DEMO_LEADS = [
  { name: "Sara Al-Otaibi",  title: "CTO",               company: "Lean Technologies", source: "factory",    icp: 0.94, pushed: false },
  { name: "Omar Al-Farhan",  title: "VP Engineering",     company: "Tamara",            source: "prosengine", icp: 0.91, pushed: false },
  { name: "Layla Al-Harbi",  title: "Founder",            company: "Mod5r",             source: "masaar",     icp: 0.85, pushed: true  },
  { name: "Faisal Al-Noor",  title: "Head of Data",       company: "Foodics",           source: "signals",    icp: 0.79, pushed: false },
  { name: "Ahmad Al-Dosari", title: "VP Procurement",     company: "STC Group",         source: "ai-chat",    icp: 0.75, pushed: true  },
  { name: "Nour Al-Otaibi",  title: "Founder",            company: "Saudi EdTech",      source: "factory",    icp: 0.78, pushed: false },
  { name: "Tariq Al-Ghamdi", title: "VP Sales",           company: "Gulf Telecom",      source: "masaar",     icp: 0.70, pushed: false },
];

const DEMO_LISTS = [
  { name: "Riyadh Fintech CTOs",        count: 48, tag: "factory",    avg: 96, desc: "Lead Factory + Signals · ICP avg 96" },
  { name: "SAMA-Licensed Fintechs",     count: 7,  tag: "masaar",     avg: 91, desc: "Masaar Engine · ICP avg 91" },
  { name: "Manufacturing UAE-exporters",count: 126,tag: "builder",    avg: 88, desc: "AI DB Builder · ICP avg 88" },
];

const SOURCE_COLOR: Record<string, string> = {
  factory:    ACCENT,
  prosengine: TEAL,
  masaar:     GOLD,
  signals:    TEAL,
  "ai-chat":  ROSE,
  builder:    "#8BB8A8",
};

function IcpBar({ score }: { score: number }) {
  const color = score >= 0.85 ? ACCENT : score >= 0.75 ? TEAL : GOLD;
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score * 100}%`, background: color }} />
      </div>
      <span className="text-[12px] font-bold" style={{ color }}>{score.toFixed(2)}</span>
    </div>
  );
}

export function LeadGenomePanel() {
  const [leads, setLeads] = useState(DEMO_LEADS);
  const [stats, setStats] = useState({ total: 1842, today: 47, lists: 12, emails: 268 });
  const [pushingId, setPushingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | string>("all");

  useEffect(() => {
    apiFetch("/engines/runs?limit=20").then((data: any) => {
      const rows = Array.isArray(data) ? data : data?.rows ?? [];
      if (rows.length > 0) {
        setStats((p) => ({ ...p, total: p.total + rows.length }));
      }
    }).catch(() => {});
  }, []);

  async function pushToCrm(idx: number) {
    const lead = leads[idx];
    setPushingId(String(idx));
    try {
      await apiFetch("/contacts", {
        method: "POST",
        body: JSON.stringify({ firstName: lead.name.split(" ")[0], lastName: lead.name.split(" ").slice(1).join(" "), jobTitle: lead.title, companyName: lead.company }),
      });
    } catch { /* demo */ }
    setLeads((p) => p.map((l, i) => i === idx ? { ...l, pushed: true } : l));
    setPushingId(null);
  }

  const filtered = filter === "all" ? leads : leads.filter((l) => l.source === filter);
  const sources  = Array.from(new Set(leads.map((l) => l.source)));

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold">Lead Genome</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">All enriched leads from every engine · link to lists, CRM, export</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { val: stats.total.toLocaleString(), label: "Total leads",     color: ACCENT },
          { val: stats.today,                  label: "Added today",     color: TEAL   },
          { val: stats.lists,                  label: "Active lists",    color: GOLD   },
          { val: stats.emails,                 label: "Verified emails", color: ROSE   },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/30 bg-card/50 p-4 text-center">
            <div className="text-[24px] font-bold" style={{ color: s.color }}>{s.val}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
        {/* Leads table */}
        <div className="rounded-2xl border border-border/30 bg-card/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between gap-3">
            <span className="font-semibold text-[13px]">Saved Leads</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <button onClick={() => setFilter("all")}
                  className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all", filter === "all" ? "text-white border-transparent" : "border-border/30 text-muted-foreground")}
                  style={filter === "all" ? { background: ACCENT } : undefined}>All</button>
                {sources.map((s) => (
                  <button key={s} onClick={() => setFilter(filter === s ? "all" : s)}
                    className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all capitalize", filter === s ? "text-white border-transparent" : "border-border/30 text-muted-foreground")}
                    style={filter === s ? { background: SOURCE_COLOR[s] || ACCENT } : undefined}>{s}</button>
                ))}
              </div>
              <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-border/30 text-muted-foreground hover:bg-muted/40">
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-border/20 text-[10.5px] text-muted-foreground uppercase tracking-wide">
                  {["Name", "Title", "Company", "Source", "ICP", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr key={i} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold">{l.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.title}</td>
                    <td className="px-4 py-3 font-medium">{l.company}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize"
                        style={{ background: (SOURCE_COLOR[l.source] || ACCENT) + "18", borderColor: (SOURCE_COLOR[l.source] || ACCENT) + "50", color: SOURCE_COLOR[l.source] || ACCENT }}>
                        {l.source}
                      </span>
                    </td>
                    <td className="px-4 py-3"><IcpBar score={l.icp} /></td>
                    <td className="px-4 py-3">
                      {l.pushed ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> In CRM
                        </span>
                      ) : (
                        <button onClick={() => void pushToCrm(i)} disabled={pushingId === String(i)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white disabled:opacity-50"
                          style={{ background: TEAL }}>
                          {pushingId === String(i) ? "…" : "CRM →"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead lists */}
        <div className="rounded-2xl border border-border/30 bg-card/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/20 font-semibold text-[13px]">Lead Lists</div>
          <div className="p-3 space-y-2">
            {DEMO_LISTS.map((list) => (
              <div key={list.name} className="rounded-xl border border-border/20 bg-card/60 p-3 cursor-pointer hover:border-[#B8A0C8]/40 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-[13px]">{list.name}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0"
                    style={{ background: `${ACCENT}18`, borderColor: `${ACCENT}40`, color: ACCENT }}>
                    {list.count} leads
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{list.desc}</div>
              </div>
            ))}
            <button className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-border/40 text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:border-[#B8A0C8]/50 transition-all mt-2">
              <Plus className="w-4 h-4" /> New list
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
