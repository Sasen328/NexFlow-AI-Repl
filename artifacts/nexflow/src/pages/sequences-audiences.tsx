import { useState } from "react";
import { GitBranch, Layers, Target } from "lucide-react";
import SequencesPage from "@/pages/sequences";
import TemplatesPage from "@/pages/templates";
import AudiencesPage from "@/pages/audiences";

type Tab = "sequences" | "templates" | "audiences";

const TABS: { key: Tab; label: string; icon: any; desc: string }[] = [
  { key: "sequences", label: "Sequences",  icon: GitBranch, desc: "Build automated multi-step cadences" },
  { key: "templates", label: "Templates",  icon: Layers,    desc: "Reuse on-brand content blocks" },
  { key: "audiences", label: "Audiences",  icon: Target,    desc: "Build & sync target segments" },
];

export default function SequencesAudiencesPage() {
  const [tab, setTab] = useState<Tab>("sequences");
  const active = TABS.find((t) => t.key === tab)!;

  return (
    <div className="p-5 pb-3">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center">
              <active.icon className="w-5 h-5 text-white"/>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Sequences & Audiences</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#C8A880]/15 text-[#C8A880] text-[10px] font-bold uppercase border border-[#C8A880]/30">Merged</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">{active.desc}</p>
        </div>
      </div>

      {/* ── Sub-tab strip ──────────────────────────────────── */}
      <div className="flex items-center gap-0 border-b border-border/40 mb-0 -mx-5 px-5" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              tab === t.key
                ? "border-[#C8A880] text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4"/> {t.label}
          </button>
        ))}
      </div>

      {/* ── Embedded page ──────────────────────────────────── */}
      <div className="-mx-5 -mb-3">
        {tab === "sequences" && <SequencesPage/>}
        {tab === "templates" && <TemplatesPage/>}
        {tab === "audiences" && <AudiencesPage/>}
      </div>
    </div>
  );
}
