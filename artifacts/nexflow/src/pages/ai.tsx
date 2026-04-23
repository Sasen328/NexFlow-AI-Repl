import { useAiAgents, useRunAiAgent } from "@/hooks/useApi";
import { Brain, Play, Zap, Phone, FileText, Search, Target, Star, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const AGENT_ICONS: Record<string, any> = {
  "signal-scanner": Zap,
  "lead-scorer": Star,
  "call-coach": Phone,
  "script-writer": FileText,
  "prospect-researcher": Search,
  "deal-predictor": Target,
  "objection-handler": Brain,
  "follow-up-writer": ArrowRight,
  "segment-builder": Target,
  "compliance-checker": Brain,
};

const AGENT_COLORS = [
  { color: "text-[#B8A0C8]", bg: "bg-[#B8A0C8]/20" },
  { color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/20" },
  { color: "text-[#C8A880]", bg: "bg-[#C8A880]/20" },
  { color: "text-[#90B8B8]", bg: "bg-[#90B8B8]/20" },
  { color: "text-[#B8B880]", bg: "bg-[#B8B880]/20" },
  { color: "text-[#C0A0B8]", bg: "bg-[#C0A0B8]/20" },
];

export default function AiPage() {
  const { data, isLoading } = useAiAgents();
  const runAgent = useRunAiAgent();
  const agents = data?.agents ?? [];
  const [runningId, setRunningId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<Record<string, string>>({});

  async function handleRun(agentId: string) {
    setRunningId(agentId);
    try {
      const result = await runAgent.mutateAsync({ agentId, payload: {} });
      setLastResult(prev => ({ ...prev, [agentId]: result?.message ?? "Agent completed successfully" }));
    } catch (e) {
      setLastResult(prev => ({ ...prev, [agentId]: "Agent run failed" }));
    } finally {
      setRunningId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Agents</h1>
        <p className="text-muted-foreground text-sm mt-0.5">10 autonomous agents powering your revenue intelligence</p>
      </div>

      <div className="nf-chameleon-border rounded-2xl p-5 glass-card">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl nf-chameleon-bg flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">NexFlow AI Command Center</h2>
            <p className="text-sm text-muted-foreground mt-1">
              All agents run on your live CRM data. Signal Scanner monitors 50+ data sources. Lead Scorer updates daily using ML scoring.
              Call Coach analyzes every conversation in real time.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {["GPT-4o", "Claude 3.5", "Gemini Pro", "Arabic NLP", "Real-time"].map(badge => (
                <span key={badge} className="text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-medium">{badge}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          Array(10).fill(0).map((_, i) => <div key={i} className="glass-card rounded-2xl p-5 h-40 animate-pulse" />)
        ) : agents.map((agent: any, idx: number) => {
          const { color, bg } = AGENT_COLORS[idx % AGENT_COLORS.length];
          const Icon = AGENT_ICONS[agent.id] ?? Brain;
          const isRunning = runningId === agent.id;
          const result = lastResult[agent.id];
          return (
            <div key={agent.id} className="glass-card rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
                    <Icon className={cn("w-5 h-5", color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{agent.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        agent.status === "active" ? "bg-[#88B8B0]" : "bg-muted-foreground"
                      )} />
                      <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRun(agent.id)}
                  disabled={isRunning || agent.status !== "active"}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    agent.status === "active"
                      ? "nf-chameleon-bg text-white hover:opacity-90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {isRunning ? "Running..." : "Run"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{agent.description}</p>
              {agent.capabilities?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {agent.capabilities.slice(0, 3).map((cap: string) => (
                    <span key={cap} className={cn("text-xs px-2 py-0.5 rounded-full font-medium", bg, color)}>{cap}</span>
                  ))}
                </div>
              )}
              {result && (
                <div className="p-2.5 rounded-xl bg-muted/30 border border-border/30 text-xs text-foreground/80">
                  {result}
                </div>
              )}
              {agent.lastRun && (
                <div className="text-xs text-muted-foreground mt-2">
                  Last run: {new Date(agent.lastRun).toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
