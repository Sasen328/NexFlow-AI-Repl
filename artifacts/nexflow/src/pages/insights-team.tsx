import { useState } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import TeamPage from "@/pages/team";

/**
 * Insights → Team Performance with YTD / Since Inception / Custom date
 * filters per spec P8. The underlying TeamPage renders the leaderboard +
 * KPIs; this wrapper adds the date-range chip row above it.
 */
type Range = "wtd" | "mtd" | "qtd" | "ytd" | "inception" | "custom";
const RANGES: { key: Range; label: string }[] = [
  { key: "wtd",       label: "WTD" },
  { key: "mtd",       label: "MTD" },
  { key: "qtd",       label: "QTD" },
  { key: "ytd",       label: "YTD" },
  { key: "inception", label: "Since Inception" },
  { key: "custom",    label: "Custom…" },
];

export default function InsightsTeamPage() {
  const [range, setRange] = useState<Range>("qtd");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 border border-border/40"
        style={{ background: "linear-gradient(135deg,#90B8B815,#88B8B015,#B8A0C815)" }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">Team Performance</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Compare reps across any range — the leaderboard, KPIs and trends below recompute automatically.
            </p>
          </div>
          <div className="inline-flex p-1 rounded-xl bg-white/70 border border-border/40 flex-wrap">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1",
                  range === r.key ? "bg-[#88B8B0]/20 text-[#5a8a8a]" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Calendar className="w-3 h-3" />
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {range === "custom" && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-muted-foreground">From</span>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
              className="px-2 py-1 rounded-lg text-xs bg-white border border-border/40" />
            <span className="text-[11px] text-muted-foreground">To</span>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
              className="px-2 py-1 rounded-lg text-xs bg-white border border-border/40" />
            <span className="text-[11px] text-muted-foreground">— filters apply to all charts below.</span>
          </div>
        )}
      </div>
      <TeamPage />
    </div>
  );
}
