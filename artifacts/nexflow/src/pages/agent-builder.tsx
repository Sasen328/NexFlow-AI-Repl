import { useState } from "react";
import { useAgents, useCreate, useDelete, useUpdate, useRunCustomAgent, useAgentRuns, useImproveAgentPrompt } from "@/hooks/useApi";
import { Bot, Plus, Play, Trash2, Sparkles, Power, PowerOff, History, Wand2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  { name: "Quote Wizard", description: "Generates pricing proposals", system_prompt: "You are a B2B quote generator. Given product, quantity, and customer context, return a clean quote table with line items, subtotal, taxes, and a 30-day validity clause. Output only the quote — no preamble." },
  { name: "Discovery Coach", description: "Suggests next discovery questions", system_prompt: "You are a senior sales coach. Given a deal stage and last call notes, suggest 5 sharp discovery questions that uncover budget, authority, need, and timing. Number them 1-5. No fluff." },
  { name: "Arabic Outreach", description: "Drafts MSA Arabic outreach", system_prompt: "You are a bilingual SDR fluent in MSA Arabic. Write a warm, respectful outreach message in Arabic, then provide an English translation below. Maximum 4 sentences each. Tone: respectful and concise." },
];

export default function AgentBuilderPage() {
  const { data, isLoading } = useAgents();
  const create = useCreate("/agents", ["agents"]);
  const del = useDelete((id) => `/agents/${id}`, ["agents"]);
  const update = useUpdate((id) => `/agents/${id}`, ["agents"]);
  const run = useRunCustomAgent();

  const [showNew, setShowNew] = useState(false);
  const [active, setActive] = useState<any>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const agents = data?.agents ?? [];

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Bot className="w-6 h-6 text-[#B8A0C8]" /> AI Agent Builder</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Build and deploy custom AI agents — describe a role, get an AI-improved prompt, run on demand, review history.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New Agent
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-44 glass-card rounded-2xl animate-pulse" />) :
          agents.length === 0 ? <div className="md:col-span-3 glass-card rounded-2xl p-10 text-center text-sm text-muted-foreground">No agents yet — click "New Agent" to build your first.</div> :
          agents.map((a: any) => (
            <div key={a.id} className={cn("glass-card rounded-2xl p-5 hover:shadow-md h-full flex flex-col", !a.enabled && "opacity-60")}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#B8A0C8]/15 text-[#B8A0C8] flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => update.mutate({ id: a.id, data: { enabled: !a.enabled } })} className="p-1 text-muted-foreground hover:text-foreground" title={a.enabled ? "Disable" : "Enable"}>
                    {a.enabled ? <Power className="w-3.5 h-3.5 text-[#88B8B0]" /> : <PowerOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => { if (confirm("Delete agent?")) del.mutate(a.id); }} className="p-1 text-muted-foreground hover:text-[#C8A880]"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="font-bold text-foreground">{a.name}</div>
              <p className="text-xs text-muted-foreground line-clamp-3 mt-1 mb-3 flex-1">{a.description}</p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><History className="w-3 h-3" /> {a.run_count ?? 0} run{a.run_count === 1 ? "" : "s"}</span>
                {a.last_run_at && <span>{new Date(a.last_run_at).toLocaleDateString()}</span>}
              </div>
              <button onClick={() => { setActive(a); setOutput(""); setInput(""); }} disabled={!a.enabled} className="w-full px-3 py-1.5 rounded-lg bg-[#88B8B0] text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
                <Play className="w-3 h-3" /> Run
              </button>
            </div>
          ))
        }
      </div>

      {showNew && <NewAgentModal onClose={() => setShowNew(false)} onCreate={(d: any) => create.mutate(d, { onSuccess: () => setShowNew(false) })} />}
      {active && <RunAgentModal
        agent={active}
        input={input} setInput={setInput}
        output={output} setOutput={setOutput}
        onClose={() => setActive(null)}
        onRun={() => run.mutate({ id: active.id, input }, { onSuccess: (r) => setOutput(r.output) })}
        running={run.isPending}
      />}
    </div>
  );
}

function RunAgentModal({ agent, input, setInput, output, setOutput: _setOutput, onClose, onRun, running }: any) {
  const { data: runsData, isLoading: runsLoading } = useAgentRuns(agent.id);
  const runs = runsData?.runs ?? [];
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-3xl my-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-2"><Bot className="w-5 h-5 text-[#B8A0C8]" /><h3 className="font-bold text-foreground">{agent.name}</h3></div>
        <p className="text-xs text-muted-foreground mb-4">{agent.description}</p>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Optional: ask the agent something specific" rows={3} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
            <button
              onClick={onRun}
              disabled={running}
              className="px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {running ? "Running…" : "Execute"}
            </button>
            {output && (
              <div className="p-4 rounded-xl bg-muted/40 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">{output}</div>
            )}
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide mb-2 flex items-center gap-1.5"><History className="w-3 h-3" /> Recent runs</div>
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {runsLoading && <div className="h-12 bg-muted/30 rounded animate-pulse" />}
              {!runsLoading && runs.length === 0 && <div className="text-xs text-muted-foreground italic">No runs yet</div>}
              {runs.map((r: any) => (
                <div key={r.id} className="px-2.5 py-2 rounded-lg bg-muted/30 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">{new Date(r.ran_at).toLocaleString()}</span>
                    <span className="text-[#88B8B0] font-mono">{r.duration_ms}ms</span>
                  </div>
                  {r.input && <div className="mt-1 text-foreground/70 line-clamp-1 italic">"{r.input}"</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewAgentModal({ onClose, onCreate }: any) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [prompt, setPrompt] = useState("");
  const improve = useImproveAgentPrompt();

  function applyTemplate(t: typeof TEMPLATES[0]) {
    setName(t.name); setDesc(t.description); setPrompt(t.system_prompt);
  }
  function improvePrompt() {
    improve.mutate({ name, description: desc, system_prompt: prompt }, { onSuccess: (r) => setPrompt(r.improved) });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg my-8" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-foreground mb-2">New AI Agent</h3>
        <p className="text-xs text-muted-foreground mb-4">Start from a template or build from scratch. Use "Improve with AI" to polish your prompt.</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide self-center mr-1">Templates:</span>
          {TEMPLATES.map(t => (
            <button key={t.name} onClick={() => applyTemplate(t)} className="px-2.5 py-1 rounded-full bg-[#B8A0C8]/15 text-[#B8A0C8] text-[11px] font-semibold hover:bg-[#B8A0C8]/25">
              {t.name}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Agent name (e.g. Quote Wizard)" className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description" className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">System prompt</label>
              <button
                onClick={improvePrompt}
                disabled={improve.isPending || (!desc && !prompt)}
                className="text-[10px] font-bold text-[#B8A0C8] flex items-center gap-1 disabled:opacity-40 hover:underline"
              >
                {improve.isPending ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Wand2 className="w-2.5 h-2.5" />}
                {improve.isPending ? "Improving…" : "Improve with AI"}
              </button>
            </div>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="The agent's role, tone, constraints, output format…" rows={6} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none font-mono" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm">Cancel</button>
          <button onClick={() => onCreate({ name, description: desc, system_prompt: prompt, enabled: true })} disabled={!name || !prompt} className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50">Create Agent</button>
        </div>
      </div>
    </div>
  );
}
