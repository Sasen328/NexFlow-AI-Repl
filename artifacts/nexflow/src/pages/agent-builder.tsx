import { useState } from "react";
import { useAgents, useCreate, useDelete, useUpdate, useRunCustomAgent } from "@/hooks/useApi";
import { Bot, Plus, Play, Trash2, Sparkles, Power, PowerOff } from "lucide-react";
import { cn } from "@/lib/utils";

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
          <p className="text-muted-foreground text-sm mt-0.5">Build and deploy your own AI agents — describe the role, give a system prompt, run on demand.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New Agent
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-44 glass-card rounded-2xl animate-pulse" />) :
          agents.map((a: any) => (
            <div key={a.id} className={cn("glass-card rounded-2xl p-5 hover:shadow-md cursor-pointer h-full", !a.enabled && "opacity-60")}>
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
              <p className="text-xs text-muted-foreground line-clamp-3 mt-1 mb-3">{a.description}</p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
                <span>Runs: {a.run_count}</span>
                {a.last_run_at && <span>{new Date(a.last_run_at).toLocaleDateString()}</span>}
              </div>
              <button onClick={() => { setActive(a); setOutput(""); setInput(""); }} disabled={!a.enabled} className="w-full px-3 py-1.5 rounded-lg bg-[#88B8B0] text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
                <Play className="w-3 h-3" /> Run
              </button>
            </div>
          ))
        }
      </div>

      {showNew && <NewAgentModal onClose={() => setShowNew(false)} onCreate={(d) => create.mutate(d, { onSuccess: () => setShowNew(false) })} />}
      {active && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setActive(null)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2"><Bot className="w-5 h-5 text-[#B8A0C8]" /><h3 className="font-bold text-foreground">{active.name}</h3></div>
            <p className="text-xs text-muted-foreground mb-4">{active.description}</p>
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Optional: ask the agent something specific" rows={3} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
            <button
              onClick={() => run.mutate({ id: active.id, input }, { onSuccess: (r) => setOutput(r.output) })}
              disabled={run.isPending}
              className="mt-3 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" /> {run.isPending ? "Running…" : "Execute"}
            </button>
            {output && (
              <div className="mt-4 p-4 rounded-xl bg-muted/40 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{output}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NewAgentModal({ onClose, onCreate }: any) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [prompt, setPrompt] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg my-8" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-foreground mb-4">New AI Agent</h3>
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Agent name (e.g. Quote Wizard)" className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short description" className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="System prompt (the agent's role, tone, constraints, output format)…" rows={6} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none font-mono" />
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm">Cancel</button>
          <button onClick={() => onCreate({ name, description: desc, system_prompt: prompt, enabled: true })} disabled={!name || !prompt} className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50">Create Agent</button>
        </div>
      </div>
    </div>
  );
}
