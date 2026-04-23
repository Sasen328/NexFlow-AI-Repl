import { useSegments } from "@/hooks/useApi";
import { Target, Users2, Plus, Code } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["#B8A0C8", "#88B8B0", "#C8A880", "#90B8B8", "#B8B880", "#C0A0B8"];

export default function SegmentsPage() {
  const { data, isLoading } = useSegments();
  const segments = data?.segments ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Segments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Dynamic audience segments powered by AI</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Segment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="glass-card rounded-2xl p-6 h-40 animate-pulse" />)
        ) : segments.map((s: any, idx: number) => {
          const color = COLORS[idx % COLORS.length];
          return (
            <div key={s.id} className="glass-card rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                    <Target className="w-5 h-5" style={{ color }} />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:opacity-80 transition-opacity">{s.name}</h3>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color }}>{s.contact_count ?? 0}</div>
                  <div className="text-xs text-muted-foreground">contacts</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{s.description}</p>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Code className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">Filter</span>
                </div>
                <code className="text-xs text-foreground/70 font-mono break-all">{s.filter_query}</code>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
