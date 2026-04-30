import { useState } from "react";
import { Bot, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import VoiceAgentsPage from "@/pages/voice-agents";
import AgentBuilderPage from "@/pages/agent-builder";

/**
 * Call Center → AI Agent — merged Voice Agents + Agent Builder. Voice agents
 * are the deployed personas; Builder is where you craft new ones.
 */
type Tab = "voice" | "builder";

export default function CallCenterAgentPage() {
  const [tab, setTab] = useState<Tab>("voice");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Agent</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Voice agent deployments and the builder for new ones.</p>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-muted/40 border border-border/40">
          <Btn label="Voice Agents" icon={Bot}    active={tab === "voice"}    onClick={() => setTab("voice")} />
          <Btn label="Builder"      icon={Wand2}  active={tab === "builder"}  onClick={() => setTab("builder")} />
        </div>
      </div>
      {tab === "voice" ? <VoiceAgentsPage /> : <AgentBuilderPage />}
    </div>
  );
}

function Btn({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
        active ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
