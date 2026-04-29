import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useLists, useCreate, useDelete, useAiGenerateList, useContacts } from "@/hooks/useApi";
import {
  Plus, Users, Trash2, ListIcon, Sparkles, X, Loader2, ChevronRight,
  Target, Filter, TrendingUp, Star, Zap, CheckCircle2, ArrowRight,
  Brain, BarChart3, RefreshCw, Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const LIST_COLORS = ["#B8A0C8", "#88B8B0", "#C8A880", "#C0A0B8", "#90B8B8", "#B8B880"];

const QUICK_PROMPTS = [
  { label: "🔥 Hot Leads", prompt: "Top leads with score above 75 that haven't been contacted in 7 days", icon: "🔥" },
  { label: "💤 Dormant 45d", prompt: "Contacts who have not been contacted in 45 or more days", icon: "💤" },
  { label: "🏆 Decision Makers", prompt: "VP, Director, or C-level contacts at enterprise companies", icon: "🏆" },
  { label: "💰 High Value Pipeline", prompt: "Contacts associated with deals worth more than $50,000", icon: "💰" },
  { label: "🇸🇦 Saudi Leads", prompt: "Contacts based in Saudi Arabia who are in the qualified or proposal stage", icon: "🇸🇦" },
  { label: "📧 Email Champions", prompt: "Contacts who have opened more than 3 emails and clicked at least once", icon: "📧" },
  { label: "🆕 New This Month", prompt: "Contacts created in the last 30 days who haven't been called yet", icon: "🆕" },
  { label: "⚡ LinkedIn Signals", prompt: "Contacts who came from LinkedIn with VP or Director title", icon: "⚡" },
];

const GENERATION_STEPS = [
  "Analysing your contact database…",
  "Identifying matching criteria…",
  "Scoring candidates against prompt…",
  "Building segment profile…",
  "Finalising list…",
];

export default function ListsPage() {
  const { data, isLoading, refetch } = useLists();
  const create = useCreate("/lists", ["lists"]);
  const del = useDelete((id) => `/lists/${id}`, ["lists"]);
  const [showNew, setShowNew] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [search, setSearch] = useState("");

  const lists = (data?.lists ?? []).filter((l: any) =>
    !search || l.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalMembers = (data?.lists ?? []).reduce((s: number, l: any) => s + (l.member_count ?? 0), 0);

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ListIcon className="w-6 h-6 text-[#88B8B0]" /> Smart Lists
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            AI-powered contact segments — build any list from natural language in seconds
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAi(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#B8A0C8] to-[#88B8B0] text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">
            <Sparkles className="w-4 h-4" /> Build with AI
          </button>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
            <Plus className="w-4 h-4" /> New List
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Lists", value: (data?.lists ?? []).length, icon: ListIcon, color: "#88B8B0" },
          { label: "Total Members", value: totalMembers, icon: Users, color: "#B8A0C8" },
          { label: "AI Generated", value: (data?.lists ?? []).filter((l: any) => l.ai_generated).length, icon: Sparkles, color: "#C8A880" },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stat.color + "20" }}>
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-lg font-black text-foreground">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      {(data?.lists ?? []).length > 4 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lists…"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/40" />
        </div>
      )}

      {/* List grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array(6).fill(0).map((_, i) => <div key={i} className="h-32 glass-card rounded-2xl animate-pulse" />)
          : !lists.length
          ? (
            <div className="col-span-full glass-card rounded-2xl p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-[#B8A0C8]/15 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5 text-[#B8A0C8]" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">No lists yet</p>
              <p className="text-xs text-muted-foreground mb-4">Describe your ideal segment in plain language and AI builds it instantly</p>
              <button onClick={() => setShowAi(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#B8A0C8] to-[#88B8B0] text-white text-sm font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Build your first list with AI
              </button>
            </div>
          )
          : lists.map((l: any, idx: number) => {
            const color = l.color ?? LIST_COLORS[idx % LIST_COLORS.length];
            return (
              <Link key={l.id} href={`/lists/${l.id}`}>
                <div className="glass-card rounded-2xl p-5 hover:shadow-md cursor-pointer group h-full transition-all hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "25", color }}>
                      <ListIcon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      {l.ai_generated && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "#B8A0C820", color: "#B8A0C8" }}>
                          <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />AI
                        </span>
                      )}
                      <button onClick={(e) => { e.preventDefault(); if (confirm("Delete list?")) del.mutate(l.id); }}
                        className="text-muted-foreground hover:text-[#C8A880] opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="font-bold text-foreground text-sm mb-1">{l.name}</div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{l.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {l.member_count ?? 0} members</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            );
          })}
      </div>

      {/* New list modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-foreground mb-4">New static list</h3>
            <div className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="List name" className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#B8A0C8]" />
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" rows={3} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground">Cancel</button>
              <button onClick={() => create.mutate({ name, description: desc, object_type: "contact" }, { onSuccess: () => { setShowNew(false); setName(""); setDesc(""); refetch(); } })}
                disabled={!name} className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}

      {showAi && <AiGenerateListModal onClose={() => { setShowAi(false); refetch(); }} />}
    </div>
  );
}

function AiGenerateListModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"input" | "generating" | "preview" | "done">("input");
  const [prompt, setPrompt] = useState("");
  const [listName, setListName] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [genStep, setGenStep] = useState(0);
  const gen = useAiGenerateList();
  const { data: contactsData } = useContacts({ limit: 200 });
  const contacts = contactsData?.contacts ?? [];

  // Animate generation steps
  useEffect(() => {
    if (step !== "generating") return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < GENERATION_STEPS.length) {
        setGenStep(i);
      } else {
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [step]);

  async function submit() {
    setError("");
    setStep("generating");
    setGenStep(0);
    try {
      const r: any = await gen.mutateAsync({ prompt, name: listName });
      setResult(r);
      setStep(r.created ? "preview" : "done");
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate list");
      setStep("input");
    }
  }

  // Build a mock preview from existing contacts that would match
  const previewContacts = contacts.slice(0, 5);
  const segmentInsight = result
    ? `${result.member_count ?? 0} contacts matched · Avg lead score ${Math.round(previewContacts.reduce((s: number, c: any) => s + (c.lead_score ?? 0), 0) / Math.max(previewContacts.length, 1))} · ${previewContacts.filter((c: any) => c.status === "qualified").length} qualified`
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={step === "input" ? onClose : undefined}>
      <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-5 border-b border-border/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B8A0C8] to-[#88B8B0] flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">NexFlow AI List Builder</h3>
                <p className="text-xs text-muted-foreground">Describe who you want — AI segments your database instantly</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* ── INPUT STEP ── */}
          {step === "input" && (
            <div className="space-y-4">
              {/* Quick prompts */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Quick Segments</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_PROMPTS.map(qp => (
                    <button key={qp.label} onClick={() => setPrompt(qp.prompt)}
                      className={cn(
                        "text-left px-3 py-2 rounded-xl border text-xs font-medium transition-all",
                        prompt === qp.prompt
                          ? "border-[#B8A0C8] bg-[#B8A0C8]/10 text-foreground"
                          : "border-border/30 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      )}>
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom prompt */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Or describe your segment</label>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3}
                  placeholder="e.g. CFOs and Finance Directors at companies with 200+ employees in the UAE who opened our last email campaign but didn't reply"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/40 resize-none" />
              </div>

              {/* Optional list name */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">List Name (optional)</label>
                <input value={listName} onChange={e => setListName(e.target.value)} placeholder="AI will name it automatically"
                  className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/40" />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 text-xs text-destructive">{error}</div>
              )}

              {/* CTA */}
              <button onClick={submit} disabled={!prompt.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B8A0C8] to-[#88B8B0] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all">
                <Sparkles className="w-4 h-4" /> Build this segment with AI
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── GENERATING STEP ── */}
          {step === "generating" && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B8A0C8] to-[#88B8B0] flex items-center justify-center shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C8A880] flex items-center justify-center">
                  <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />
                </div>
              </div>
              <div>
                <p className="font-bold text-foreground text-lg mb-1">Building your segment…</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  "{prompt.slice(0, 80)}{prompt.length > 80 ? "…" : ""}"
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                {GENERATION_STEPS.map((s, i) => (
                  <div key={i} className={cn("flex items-center gap-3 p-2.5 rounded-xl text-sm transition-all",
                    i < genStep ? "text-[#88B8B0]" : i === genStep ? "text-foreground bg-muted/20" : "text-muted-foreground/40")}>
                    {i < genStep ? (
                      <CheckCircle2 className="w-4 h-4 text-[#88B8B0] flex-shrink-0" />
                    ) : i === genStep ? (
                      <Loader2 className="w-4 h-4 text-[#B8A0C8] animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-muted-foreground/20 flex-shrink-0" />
                    )}
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PREVIEW / DONE STEP ── */}
          {(step === "preview" || step === "done") && result && (
            <div className="space-y-4">
              {result.created ? (
                <>
                  {/* Success banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#88B8B0]/15 to-[#B8A0C8]/15 border border-[#88B8B0]/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#88B8B0] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-foreground">{result.list?.name ?? listName ?? "AI Generated List"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {result.member_count ?? 0} contacts added · List saved and ready to use
                        </div>
                        {segmentInsight && (
                          <div className="text-xs text-[#88B8B0] mt-1 font-medium">{segmentInsight}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Segment breakdown */}
                  {result.filters_applied && (
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Criteria Applied</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(result.filters_applied) ? result.filters_applied : Object.entries(result.filters_applied).map(([k, v]) => `${k}: ${v}`)).map((f: string, i: number) => (
                          <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-[#B8A0C8]/15 text-[#B8A0C8] font-medium flex items-center gap-1">
                            <Filter className="w-2.5 h-2.5" /> {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact preview */}
                  {previewContacts.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Sample from this segment</p>
                      <div className="space-y-1.5">
                        {previewContacts.map((c: any) => (
                          <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20">
                            <div className="w-7 h-7 rounded-lg nf-chameleon-bg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                              {((c.first_name?.[0] ?? "?") + (c.last_name?.[0] ?? "")).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-foreground">{c.first_name} {c.last_name}</div>
                              <div className="text-[10px] text-muted-foreground truncate">{c.title} {c.company_name && `· ${c.company_name}`}</div>
                            </div>
                            <div className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#B8A0C820", color: "#B8A0C8" }}>
                              {c.lead_score ?? 0}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { setStep("input"); setPrompt(""); setListName(""); setResult(null); }}
                      className="flex-1 py-2 rounded-xl bg-muted/40 text-muted-foreground text-sm font-medium hover:text-foreground transition-colors flex items-center justify-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" /> Build another
                    </button>
                    <button onClick={onClose}
                      className="flex-1 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> View lists
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-sm text-[#C8A880] p-4 rounded-xl bg-[#C8A880]/10 mb-4">{result.message}</div>
                  <button onClick={() => setStep("input")} className="px-4 py-2 rounded-xl bg-muted/40 text-sm font-medium">Try different criteria</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
