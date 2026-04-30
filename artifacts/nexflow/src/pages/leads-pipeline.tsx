import { useState } from "react";
import { GitBranch, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import PipelinePage from "@/pages/pipeline";
import DealPipelinePage from "@/pages/deal-pipeline";

/**
 * Leads → Pipeline & Deals — merged view of the pre-SAL Lead Funnel
 * (PipelinePage) and the post-SAL Deal Pipeline (DealPipelinePage). One
 * URL, internal segmented control to flip between the two.
 */
type Mode = "deals" | "leads";

export default function LeadsPipelinePage() {
  const [mode, setMode] = useState<Mode>("deals");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline & Deals</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Lead funnel and deal pipeline in one view.</p>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-muted/40 border border-border/40">
          <ToggleBtn label="Deal Pipeline" icon={TrendingUp} active={mode === "deals"} onClick={() => setMode("deals")} />
          <ToggleBtn label="Lead Funnel"   icon={GitBranch}  active={mode === "leads"} onClick={() => setMode("leads")} />
        </div>
      </div>
      {mode === "deals" ? <DealPipelinePage /> : <PipelinePage />}
    </div>
  );
}

function ToggleBtn({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) {
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
