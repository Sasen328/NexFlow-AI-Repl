import { useState } from "react";
import { Users, Plus, Target, Filter, Zap, TrendingUp, BarChart3, ChevronDown, X, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export const AUDIENCES = [
  {
    id: "a1", name: "GCC Enterprise Decision Makers", size: 1240, growth: "+48 this week",
    channel: "Email + WhatsApp", lastSync: "2h ago", status: "active",
    description: "C-Level + VP at companies with 500+ employees in KSA, UAE, Qatar",
    filters: [
      { field: "Seniority", op: "is", value: "C-Level, VP" },
      { field: "Company Size", op: "≥", value: "500 employees" },
      { field: "Region", op: "in", value: "KSA, UAE, Qatar, Kuwait" },
    ],
    color: "#B8A0C8",
  },
  {
    id: "a2", name: "High-Intent Buyers · Series B+", size: 267, growth: "+12 this week",
    channel: "Email", lastSync: "6h ago", status: "active",
    description: "Companies that recently raised $10M+ funding and are showing buying signals",
    filters: [
      { field: "Funding Stage", op: "in", value: "Series B, Series C, Series D+" },
      { field: "Signal Score", op: "≥", value: "75" },
      { field: "Last Funding", op: "within", value: "90 days" },
    ],
    color: "#88B8B0",
  },
  {
    id: "a3", name: "Re-engagement · Cold 60 Days", size: 89, growth: "Stable",
    channel: "WhatsApp", lastSync: "1d ago", status: "active",
    description: "Contacts with no activity in 60+ days but previous strong engagement",
    filters: [
      { field: "Last Contact", op: "≥", value: "60 days ago" },
      { field: "Lead Score", op: "was ≥", value: "65 (historical)" },
      { field: "Status", op: "is", value: "Active, Qualified" },
    ],
    color: "#C8A880",
  },
  {
    id: "a4", name: "Arabic-First Buyers", size: 538, growth: "+19 this week",
    channel: "WhatsApp + Email", lastSync: "3h ago", status: "active",
    description: "Decision makers who prefer Arabic communication based on engagement patterns",
    filters: [
      { field: "Language Preference", op: "is", value: "Arabic" },
      { field: "Region", op: "in", value: "KSA, Bahrain, Kuwait, Oman" },
      { field: "WhatsApp Engagement", op: "≥", value: "2 interactions" },
    ],
    color: "#90B8B8",
  },
  {
    id: "a5", name: "Near-Close · Negotiation Stage", size: 34, growth: "+3 this week",
    channel: "Email", lastSync: "30m ago", status: "active",
    description: "Contacts with open deals in Negotiation stage worth $20K+",
    filters: [
      { field: "Deal Stage", op: "is", value: "Negotiation" },
      { field: "Deal Value", op: "≥", value: "$20,000" },
      { field: "Days in Stage", op: "≤", value: "30 days" },
    ],
    color: "#B8B880",
  },
];

const FILTER_FIELDS = ["Seniority", "Company Size", "Region", "Lead Score", "Deal Stage", "Last Contact", "Signal Score", "Language Preference", "Industry", "Funding Stage"];
const FILTER_OPS = ["is", "is not", "≥", "≤", "in", "contains", "within"];

export default function AudiencesPage() {
  const [showNew, setShowNew] = useState(false);
  const [newFilters, setNewFilters] = useState([{ field: "Seniority", op: "is", value: "" }]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  function addFilter() {
    setNewFilters(f => [...f, { field: "Seniority", op: "is", value: "" }]);
  }

  function runAiAudience() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiResult(`Based on your prompt, I'll target: C-Level and VP contacts at companies with 200+ employees in your specified region, with a lead score above 65 and at least one buying signal in the past 30 days. Estimated audience size: ~340 contacts.`);
      setAiLoading(false);
    }, 1400);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-[#88B8B0]" />
            Audiences
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Dynamic contact groups for targeted marketing campaigns</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          New Audience
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Audiences", value: AUDIENCES.length, color: "#B8A0C8" },
          { label: "Total Contacts", value: AUDIENCES.reduce((a, x) => a + x.size, 0).toLocaleString(), color: "#88B8B0" },
          { label: "Active Campaigns", value: "3", color: "#C8A880" },
          { label: "Avg Audience Size", value: Math.round(AUDIENCES.reduce((a, x) => a + x.size, 0) / AUDIENCES.length).toLocaleString(), color: "#90B8B8" },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4">
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Audience cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {AUDIENCES.map(a => (
          <div key={a.id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: a.color + "25" }}>
                  <Users className="w-5 h-5" style={{ color: a.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{a.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{a.description}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <div className="text-xl font-black text-foreground">{a.size.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">contacts</div>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              {a.filters.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Filter className="w-3 h-3 flex-shrink-0" />
                  <span className="font-medium text-foreground/80">{f.field}</span>
                  <span className="text-muted-foreground/60">{f.op}</span>
                  <span className="font-medium" style={{ color: a.color }}>{f.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/20">
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="text-[#88B8B0] font-semibold">{a.growth}</span>
                <span>· {a.channel}</span>
                <span>· Synced {a.lastSync}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="text-xs px-2.5 py-1 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">Edit</button>
                <button className="text-xs px-2.5 py-1 rounded-lg nf-chameleon-bg text-white font-semibold">Use in Campaign</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Audience Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-2xl bg-background max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">New Audience</h3>
              <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>

            {/* AI Builder */}
            <div className="glass-card rounded-xl p-4 border border-[#B8A0C8]/30 bg-[#B8A0C8]/5 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#B8A0C8]" />
                <span className="text-sm font-semibold text-foreground">AI Audience Builder</span>
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm text-foreground outline-none"
                  placeholder="e.g. 'High-intent SaaS buyers in the UAE with recent funding'"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                />
                <button
                  onClick={runAiAudience}
                  disabled={!aiPrompt.trim() || aiLoading}
                  className="px-3 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  Generate
                </button>
              </div>
              {aiResult && (
                <div className="mt-2 text-xs text-foreground/80 leading-relaxed bg-muted/30 rounded-lg p-3">{aiResult}</div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Audience Name</label>
                <input className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm text-foreground outline-none" placeholder="e.g. GCC Enterprise Buyers Q2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Filters</label>
                  <button onClick={addFilter} className="text-xs text-[#B8A0C8] font-semibold hover:underline">+ Add filter</button>
                </div>
                <div className="space-y-2">
                  {newFilters.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-muted/60 border border-border/40 text-xs text-foreground outline-none"
                        value={f.field}
                        onChange={e => setNewFilters(fs => fs.map((x, j) => j === i ? { ...x, field: e.target.value } : x))}
                      >
                        {FILTER_FIELDS.map(ff => <option key={ff}>{ff}</option>)}
                      </select>
                      <select
                        className="px-2.5 py-1.5 rounded-lg bg-muted/60 border border-border/40 text-xs text-foreground outline-none"
                        value={f.op}
                        onChange={e => setNewFilters(fs => fs.map((x, j) => j === i ? { ...x, op: e.target.value } : x))}
                      >
                        {FILTER_OPS.map(op => <option key={op}>{op}</option>)}
                      </select>
                      <input
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-muted/60 border border-border/40 text-xs text-foreground outline-none"
                        placeholder="Value..."
                        value={f.value}
                        onChange={e => setNewFilters(fs => fs.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                      />
                      {newFilters.length > 1 && (
                        <button onClick={() => setNewFilters(fs => fs.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowNew(false)} className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground">Cancel</button>
              <button onClick={() => setShowNew(false)} className="px-4 py-1.5 rounded-lg text-xs font-semibold nf-chameleon-bg text-white">Create Audience</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
