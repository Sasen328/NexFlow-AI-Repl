import { useSegments, useAiGenerateSegment, useSegmentMembers, useDelete } from "@/hooks/useApi";
import { Target, Users2, Plus, Code, Sparkles, X, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const COLORS = ["#B8A0C8", "#88B8B0", "#C8A880", "#90B8B8", "#B8B880", "#C0A0B8"];

export default function SegmentsPage() {
  const { data, isLoading } = useSegments();
  const [showNew, setShowNew] = useState(false);
  const [openSeg, setOpenSeg] = useState<any>(null);
  const del = useDelete((id) => `/segments/${id}`, ["segments"]);
  const segments = data?.segments ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Segments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Dynamic audience segments — described in plain English, translated by AI</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          <Sparkles className="w-4 h-4" />
          New AI Segment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="glass-card rounded-2xl p-6 h-40 animate-pulse" />)
        ) : segments.length === 0 ? (
          <div className="col-span-full glass-card rounded-2xl p-10 text-center">
            <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-3">No segments yet. Describe an audience and let AI build it.</p>
            <button onClick={() => setShowNew(true)} className="text-xs px-3 py-1.5 rounded-lg nf-chameleon-bg text-white font-semibold">Create your first segment</button>
          </div>
        ) : segments.map((s: any, idx: number) => {
          const color = COLORS[idx % COLORS.length];
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => setOpenSeg(s)}
              className="w-full text-left glass-card rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer group relative"
            >
              <div
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete segment?")) del.mutate(s.id);
                }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded cursor-pointer"
                aria-label="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                    <Target className="w-5 h-5" style={{ color }} />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">{s.name}</h3>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color }}>{s.contact_count ?? 0}</div>
                  <div className="text-xs text-muted-foreground">contacts</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{s.description}</p>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Code className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground">Filter</span>
                </div>
                <code className="text-xs text-foreground/70 font-mono break-all line-clamp-2">{s.filter_query}</code>
              </div>
            </button>
          );
        })}
      </div>

      {showNew && <NewSegmentModal onClose={() => setShowNew(false)} />}
      {openSeg && <SegmentDrawer segment={openSeg} onClose={() => setOpenSeg(null)} />}
    </div>
  );
}

function NewSegmentModal({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const gen = useAiGenerateSegment();

  const examples = [
    "VPs and Directors at companies in finance with lead score above 70",
    "Contacts tagged 'enterprise' that haven't been engaged in 30 days",
    "Qualified contacts at tech companies sourced from LinkedIn",
  ];

  const submit = async () => {
    setError("");
    try {
      await gen.mutateAsync({ prompt });
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B8A0C8]" /> AI Segment Builder
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Describe the audience in plain English. AI will translate to a SQL filter, run it, and create the segment.</p>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={4}
          placeholder="e.g. Senior decision-makers at Saudi tech companies with high lead scores"
          className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#B8A0C8]"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {examples.map(ex => (
            <button key={ex} onClick={() => setPrompt(ex)} className="text-[11px] px-2 py-1 rounded-full bg-muted/40 text-muted-foreground hover:bg-muted">
              {ex.slice(0, 40)}…
            </button>
          ))}
        </div>
        {error && <div className="mt-3 text-xs text-destructive p-2 rounded bg-destructive/10">{error}</div>}
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">Cancel</button>
          <button
            onClick={submit}
            disabled={!prompt.trim() || gen.isPending}
            className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {gen.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {gen.isPending ? "AI is building…" : "Generate segment"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SegmentDrawer({ segment, onClose }: { segment: any; onClose: () => void }) {
  const { data, isLoading } = useSegmentMembers(segment.id);
  const members = data?.members ?? [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-stretch justify-end" onClick={onClose}>
      <div className="bg-background w-full max-w-md h-full overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-foreground">{segment.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{segment.description}</p>

        <div className="p-3 rounded-xl bg-muted/30 mb-4">
          <div className="text-xs font-semibold text-muted-foreground mb-1">SQL Filter</div>
          <code className="text-xs text-foreground/80 font-mono break-all">{segment.filter_query}</code>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Users2 className="w-4 h-4 text-[#B8A0C8]" />
          <span className="text-sm font-semibold text-foreground">{isLoading ? "…" : members.length} matching contacts</span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-muted/40 rounded-lg animate-pulse" />)}
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No contacts match this segment.</p>
        ) : (
          <div className="space-y-2">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
                <div className="w-8 h-8 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  {(m.first_name?.[0] ?? "") + (m.last_name?.[0] ?? "")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{m.first_name} {m.last_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.title ?? "—"}</div>
                </div>
                <div className="text-xs font-bold text-[#88B8B0]">{Math.round(m.lead_score ?? 0)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
