import { useState } from "react";
import {
  Zap, Mail, Phone, ArrowRight, Plus, CheckCircle2, Brain, TrendingUp,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Trash2, Play, History, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAutomations, useCreate, useUpdate, useDelete, useRunAutomation, useAutomationRuns,
  useAiDraftAutomation,
} from "@/hooks/useApi";
import { Sparkles, Loader2 as Loader2B } from "lucide-react";

const TRIGGER_OPTIONS = [
  { value: "stage_change", label: "Stage change" },
  { value: "activity_completed", label: "Activity completed" },
  { value: "signal_received", label: "Signal received" },
  { value: "no_answer", label: "No answer on call" },
  { value: "form_submitted", label: "Form submitted" },
  { value: "score_threshold", label: "Lead score threshold" },
  { value: "schedule", label: "Schedule (cron)" },
  { value: "campaign_open", label: "Campaign opened" },
];

const TRIGGER_CATEGORY: Record<string, string> = {
  activity_completed: "calls", no_answer: "calls",
  stage_change: "deals", score_threshold: "deals",
  campaign_open: "email", form_submitted: "email",
  signal_received: "ai", schedule: "ai",
};
const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  calls: { label: "Calls", color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/15", icon: Phone },
  email: { label: "Email", color: "text-[#B8A0C8]", bg: "bg-[#B8A0C8]/15", icon: Mail },
  deals: { label: "Deals", color: "text-[#C8A880]", bg: "bg-[#C8A880]/15", icon: TrendingUp },
  ai: { label: "AI", color: "text-[#B8B880]", bg: "bg-[#B8B880]/15", icon: Brain },
};

const ACTION_TEMPLATES = [
  { type: "create_task", label: "Create follow-up task", target: "all_open_deals", title: "Follow up", body: "Automated check-in" },
  { type: "advance_stage", label: "Advance stage qualified→proposal", from_stage: "qualified", to_stage: "proposal" },
  { type: "log_note", label: "Log a note", message: "Triggered by automation rule" },
];

export default function AutomationPage() {
  const { data, isLoading } = useAutomations();
  const create = useCreate("/automations", ["automations"]);
  const update = useUpdate((id) => `/automations/${id}`, ["automations"]);
  const del = useDelete((id) => `/automations/${id}`, ["automations"]);
  const run = useRunAutomation();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);

  const rules: any[] = data?.rules ?? [];
  const enabledCount = rules.filter(r => r.enabled).length;
  const totalRuns = rules.reduce((a, r) => a + (r.run_count ?? 0), 0);
  const filtered = filter === "all" ? rules : rules.filter(r => (TRIGGER_CATEGORY[r.trigger] ?? "ai") === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#B8B880]" />
            Automation Center
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Trigger-based workflows wired to live data — run, monitor, iterate.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Rules", value: enabledCount, color: "#88B8B0", icon: CheckCircle2 },
          { label: "Total Runs", value: totalRuns, color: "#B8A0C8", icon: Zap },
          { label: "Total Rules", value: rules.length, color: "#90B8B8", icon: Brain },
          { label: "Last Run", value: rules.find(r => r.last_run_at)?.last_run_at ? new Date(rules.find((r: any) => r.last_run_at).last_run_at).toLocaleDateString() : "—", color: "#C8A880", icon: History },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {[{ key: "all", label: "All" }, ...Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            filter === f.key ? "nf-chameleon-bg text-white" : "bg-muted/50 text-muted-foreground hover:text-foreground"
          )}>{f.label}</button>
        ))}
      </div>

      {runResult && (
        <div className="glass-card rounded-xl p-4 border border-[#88B8B0]/30 bg-[#88B8B0]/5 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#88B8B0] mt-0.5" />
          <div className="flex-1 text-sm">
            <div className="font-semibold text-foreground">Rule executed</div>
            <div className="text-xs text-muted-foreground mt-0.5">{runResult.affected ?? 0} record(s) affected · {(runResult.actions ?? []).length} action(s) ran{runResult.errors?.length ? ` · ${runResult.errors.length} error(s)` : ""}</div>
          </div>
          <button onClick={() => setRunResult(null)} className="text-xs text-muted-foreground hover:text-foreground">dismiss</button>
        </div>
      )}

      <div className="space-y-3">
        {isLoading && Array(3).fill(0).map((_, i) => <div key={i} className="h-20 glass-card rounded-2xl animate-pulse" />)}
        {!isLoading && filtered.length === 0 && (
          <div className="glass-card rounded-2xl p-10 text-center text-sm text-muted-foreground">No automation rules yet — create one to get started.</div>
        )}
        {filtered.map(rule => {
          const cat = CATEGORY_CONFIG[TRIGGER_CATEGORY[rule.trigger] ?? "ai"];
          const Icon = cat.icon;
          const isExp = expanded === rule.id;
          const actions = (rule.actions as any[]) ?? [];
          return (
            <div key={rule.id} className={cn("glass-card rounded-2xl overflow-hidden transition-all", rule.enabled ? "" : "opacity-60")}>
              <div className="flex items-center gap-4 p-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cat.bg)}>
                  <Icon className={cn("w-5 h-5", cat.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{rule.name}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium uppercase", cat.bg, cat.color)}>{cat.label}</span>
                    {rule.enabled && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#88B8B0]/15 text-[#88B8B0] font-medium uppercase">Active</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {TRIGGER_OPTIONS.find(t => t.value === rule.trigger)?.label ?? rule.trigger}
                    {rule.last_run_at && <span className="ml-2">· last ran {new Date(rule.last_run_at).toLocaleString()}</span>}
                  </div>
                </div>
                <div className="text-center flex-shrink-0 hidden md:block">
                  <div className="text-sm font-bold text-foreground">{rule.run_count ?? 0}</div>
                  <div className="text-[10px] text-muted-foreground">runs</div>
                </div>
                <button
                  onClick={() => run.mutate(rule.id, { onSuccess: (r) => setRunResult(r) })}
                  disabled={!rule.enabled || run.isPending}
                  className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-[#88B8B0]/15 text-[#88B8B0] text-xs font-semibold flex items-center gap-1 disabled:opacity-50 hover:bg-[#88B8B0]/25"
                  title="Run now"
                >
                  {run.isPending && run.variables === rule.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />} Run
                </button>
                <button onClick={() => update.mutate({ id: rule.id, data: { enabled: !rule.enabled } })} className="flex-shrink-0">
                  {rule.enabled ? <ToggleRight className="w-8 h-8 text-[#88B8B0]" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
                </button>
                <button onClick={() => setExpanded(isExp ? null : rule.id)} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
                  {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button onClick={() => { if (confirm(`Delete "${rule.name}"?`)) del.mutate(rule.id); }} className="flex-shrink-0 text-muted-foreground hover:text-[#C8A880]">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {isExp && (
                <div className="px-4 pb-4 border-t border-border/20 space-y-4">
                  {rule.description && <div className="text-xs text-muted-foreground mt-3 italic">{rule.description}</div>}
                  <div className="mt-3">
                    <div className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wide">Actions ({actions.length})</div>
                    <div className="space-y-1.5">
                      {actions.map((a: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                          <div className="w-5 h-5 rounded-full bg-[#B8A0C8]/20 flex items-center justify-center text-[10px] font-bold text-[#B8A0C8]">{i + 1}</div>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="font-mono">{a.type}</span>
                          {a.title && <span className="text-muted-foreground">— {a.title}</span>}
                          {a.from_stage && <span className="text-muted-foreground">{a.from_stage} → {a.to_stage}</span>}
                          {a.message && <span className="text-muted-foreground italic">"{a.message}"</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <RunHistory ruleId={rule.id} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showNew && <NewRuleModal
        onClose={() => setShowNew(false)}
        onCreate={(d: any) => create.mutate(d, { onSuccess: () => setShowNew(false) })}
      />}
    </div>
  );
}

function RunHistory({ ruleId }: { ruleId: string }) {
  const { data, isLoading } = useAutomationRuns(ruleId);
  const runs = data?.runs ?? [];
  return (
    <div>
      <div className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1.5"><History className="w-3 h-3" /> Recent runs</div>
      {isLoading ? <div className="h-8 bg-muted/30 rounded animate-pulse" /> :
        runs.length === 0 ? <div className="text-xs text-muted-foreground italic">No runs yet — click "Run" above to execute this rule.</div> :
        <div className="space-y-1">
          {runs.slice(0, 5).map((r: any) => (
            <div key={r.id} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded bg-muted/30">
              <CheckCircle2 className="w-3 h-3 text-[#88B8B0]" />
              <span className="text-muted-foreground">{new Date(r.ran_at).toLocaleString()}</span>
              <span className="ml-auto text-foreground/70">
                {(r.result?.actions ?? []).length} action{(r.result?.actions ?? []).length === 1 ? "" : "s"}
                {r.result?.errors?.length ? <span className="text-[#C8A880] ml-1">· {r.result.errors.length} err</span> : null}
              </span>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

function NewRuleModal({ onClose, onCreate }: any) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("stage_change");
  const [actionIdx, setActionIdx] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiActions, setAiActions] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const draft = useAiDraftAutomation();

  async function generateWithAI() {
    setError("");
    try {
      const r: any = await draft.mutateAsync(aiPrompt);
      const d = r?.draft ?? {};
      if (d.name) setName(d.name);
      if (d.description) setDescription(d.description);
      if (d.trigger && TRIGGER_OPTIONS.find(t => t.value === d.trigger)) setTrigger(d.trigger);
      if (Array.isArray(d.actions) && d.actions.length) setAiActions(d.actions);
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-xl my-8" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-foreground mb-4">New Automation Rule</h3>

        {/* AI generator */}
        <div className="p-3 rounded-xl bg-[#B8A0C8]/8 border border-[#B8A0C8]/30 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#B8A0C8]" />
            <span className="text-xs font-bold text-[#B8A0C8] uppercase tracking-wide">AI Rule Generator</span>
          </div>
          <textarea
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            rows={2}
            placeholder='e.g. "When a deal sits in qualified for over 14 days, advance it to proposal and create a follow-up task"'
            className="w-full px-3 py-2 rounded-lg bg-background/60 border border-border/40 text-sm outline-none"
          />
          <button
            onClick={generateWithAI}
            disabled={!aiPrompt.trim() || draft.isPending}
            className="mt-2 w-full px-3 py-1.5 rounded-lg nf-chameleon-bg text-white text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {draft.isPending ? <Loader2B className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {draft.isPending ? "Drafting…" : "Draft this rule with AI"}
          </button>
        </div>

        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Rule name" className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this rule do?" rows={2} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Trigger</label>
            <select value={trigger} onChange={e => setTrigger(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none">
              {TRIGGER_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
              {aiActions ? `Actions (AI-generated, ${aiActions.length})` : "Action"}
            </label>
            {aiActions ? (
              <div className="mt-1 p-3 rounded-lg bg-muted/30 border border-border/30 space-y-1">
                {aiActions.map((a, i) => (
                  <div key={i} className="text-xs text-foreground/80 font-mono">
                    {i + 1}. {a.type}{a.title ? ` — ${a.title}` : ""}{a.from_stage ? ` (${a.from_stage} → ${a.to_stage})` : ""}
                  </div>
                ))}
                <button onClick={() => setAiActions(null)} className="mt-1 text-[10px] text-muted-foreground hover:text-foreground underline">Use template instead</button>
              </div>
            ) : (
              <select value={actionIdx} onChange={e => setActionIdx(Number(e.target.value))} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none">
                {ACTION_TEMPLATES.map((a, i) => <option key={i} value={i}>{a.label}</option>)}
              </select>
            )}
          </div>
        </div>
        {error && <div className="mt-3 text-xs text-destructive p-2 rounded bg-destructive/10">{error}</div>}
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm">Cancel</button>
          <button
            onClick={() => onCreate({ name, description, trigger, enabled: true, actions: aiActions ?? [ACTION_TEMPLATES[actionIdx]] })}
            disabled={!name}
            className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50">
            Create rule
          </button>
        </div>
      </div>
    </div>
  );
}
