import { useCallList, useLogCall, useAutoAdvanceStages } from "@/hooks/useApi";
import { Link } from "wouter";
import { Phone, Sparkles, Flame, Snowflake, RotateCw, TrendingUp, Clock, Zap, Check, X, SkipForward, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<string, { icon: any; color: string; label: string; desc: string }> = {
  hot: { icon: Flame, color: "#C8A880", label: "Hot", desc: "High intent, recent engagement" },
  warm: { icon: Sparkles, color: "#B8A0C8", label: "Warm", desc: "Active in pipeline" },
  retry: { icon: RotateCw, color: "#90B8B8", label: "Retry", desc: "No answer recently — try again" },
  cold: { icon: Snowflake, color: "#88B8B0", label: "Cold", desc: "Lower priority but worth a touch" },
};

const OUTCOMES = [
  { value: "connected_interested", label: "Connected · interested", color: "#88B8B0" },
  { value: "connected_followup", label: "Connected · needs follow-up", color: "#B8A0C8" },
  { value: "connected_not_interested", label: "Connected · not interested", color: "#C0A0B8" },
  { value: "no_answer", label: "No answer", color: "#90B8B8" },
  { value: "voicemail", label: "Left voicemail", color: "#C8A880" },
  { value: "wrong_number", label: "Wrong number", color: "#C0A0B8" },
];

export default function CallListPage() {
  const { data, isLoading } = useCallList();
  const autoAdvance = useAutoAdvanceStages();
  const [logging, setLogging] = useState<any | null>(null);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);

  function skip(id: string) {
    const next = new Set(skipped);
    next.add(id);
    setSkipped(next);
  }
  async function runAutoAdvance() {
    const r = await autoAdvance.mutateAsync();
    setFeedback(r?.message ?? "Done.");
    setTimeout(() => setFeedback(null), 4000);
  }

  const totalDone = done.size;
  const totalSkipped = skipped.size;
  const totalQueued = (data?.total ?? 0) - totalDone - totalSkipped;

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Phone className="w-6 h-6 text-[#B8A0C8]" /> Today's Call List
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{data?.date} · AI-prioritized by intent score, recency, and signal velocity.</p>
        </div>
        <div className="flex items-center gap-2">
          {feedback && <span className="text-xs text-[#88B8B0] font-semibold">{feedback}</span>}
          <button
            onClick={runAutoAdvance}
            disabled={autoAdvance.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 text-foreground text-xs font-semibold hover:bg-muted disabled:opacity-50"
          >
            {autoAdvance.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-[#B8A0C8]" />}
            Auto-Advance Stages
          </button>
        </div>
      </div>

      {/* Progress strip */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-6">
        <div>
          <div className="text-2xl font-black text-foreground">{totalDone}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Logged</div>
        </div>
        <div className="w-px h-10 bg-border/40" />
        <div>
          <div className="text-2xl font-black text-muted-foreground">{totalSkipped}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Skipped</div>
        </div>
        <div className="w-px h-10 bg-border/40" />
        <div>
          <div className="text-2xl font-black text-[#B8A0C8]">{totalQueued}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Remaining</div>
        </div>
        <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden ml-auto">
          <div
            className="h-full nf-chameleon-bg transition-all"
            style={{ width: `${data?.total ? ((totalDone + totalSkipped) / data.total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {data?.ai_recommendation && (
        <div className="glass-card rounded-2xl p-4 border border-[#B8A0C8]/30 bg-[#B8A0C8]/5">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#B8A0C8] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground/90">{data.ai_recommendation}</div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-32 glass-card rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-5">
          {(["hot", "warm", "retry", "cold"] as const).map(cat => {
            const items = (data?.categories?.[cat] ?? []).filter((c: any) => !skipped.has(c.id) && !done.has(c.id));
            if (!items.length) return null;
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2.5">
                  <Icon className="w-4 h-4" style={{ color: meta.color }} />
                  <h2 className="font-bold text-foreground text-sm uppercase tracking-wide">{meta.label}</h2>
                  <span className="text-xs text-muted-foreground">· {items.length} · {meta.desc}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {items.map((c: any) => (
                    <div key={c.id} className="glass-card rounded-2xl p-4 group">
                      <div className="flex items-start gap-3">
                        <Link href={`/contacts/${c.id}`}>
                          <div className="w-10 h-10 rounded-full nf-chameleon-bg text-white text-xs font-bold flex items-center justify-center flex-shrink-0 cursor-pointer">
                            {c.first_name?.[0]}{c.last_name?.[0]}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Link href={`/contacts/${c.id}`}>
                              <div className="font-semibold text-foreground text-sm truncate hover:text-[#B8A0C8] cursor-pointer">{c.first_name} {c.last_name}</div>
                            </Link>
                            <div className="text-xs font-bold" style={{ color: meta.color }}>{Math.round(c.priority_score)}</div>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{c.title} · {c.company_name}</div>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground flex-wrap">
                            {c.deal_value && <span className="flex items-center gap-1 text-[#88B8B0]"><TrendingUp className="w-3 h-3" />${c.deal_value.toLocaleString()}</span>}
                            {c.best_call_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.best_call_time}</span>}
                            {c.owner_name && <span>· {c.owner_name}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Quick actions */}
                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/20">
                        <button
                          onClick={() => setLogging(c)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg nf-chameleon-bg text-white text-xs font-semibold hover:opacity-90"
                        >
                          <Check className="w-3 h-3" /> Log call
                        </button>
                        <button
                          onClick={() => skip(c.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground text-xs font-medium hover:bg-muted"
                          title="Skip for today"
                        >
                          <SkipForward className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {totalDone + totalSkipped >= (data?.total ?? 0) && (data?.total ?? 0) > 0 && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <Sparkles className="w-8 h-8 text-[#B8A0C8] mx-auto mb-3" />
              <div className="text-lg font-bold text-foreground">List complete for today.</div>
              <div className="text-sm text-muted-foreground mt-1">{totalDone} logged · {totalSkipped} skipped.</div>
            </div>
          )}
        </div>
      )}

      {logging && (
        <LogCallModal
          contact={logging}
          onClose={() => setLogging(null)}
          onLogged={(id) => { setDone(new Set([...done, id])); setLogging(null); }}
        />
      )}
    </div>
  );
}

function LogCallModal({ contact, onClose, onLogged }: any) {
  const [outcome, setOutcome] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [runOrch, setRunOrch] = useState(true);
  const logCall = useLogCall();

  async function submit() {
    if (!outcome) return;
    await logCall.mutateAsync({
      contact_id: contact.id,
      outcome,
      duration_seconds: duration ? Math.round(Number(duration) * 60) : undefined,
      notes: notes || undefined,
      run_orchestrator: runOrch,
    });
    onLogged(contact.id);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-5 w-full max-w-md bg-background" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Log call with</div>
            <h3 className="text-base font-bold text-foreground">{contact.first_name} {contact.last_name}</h3>
            <div className="text-xs text-muted-foreground">{contact.title} · {contact.company_name}</div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Outcome</label>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {OUTCOMES.map(o => (
                <button
                  key={o.value}
                  onClick={() => setOutcome(o.value)}
                  className={cn(
                    "text-left px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors",
                    outcome === o.value ? "border-[#B8A0C8] bg-[#B8A0C8]/10 text-foreground" : "border-border/40 text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block mr-1.5" style={{ background: o.color }} />
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Duration (min)</label>
              <input
                type="number"
                min="0"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground"
                placeholder="0"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pb-2">
                <input type="checkbox" checked={runOrch} onChange={e => setRunOrch(e.target.checked)} className="accent-[#B8A0C8]" />
                Run AI post-call orchestrator
              </label>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full mt-1.5 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground resize-none"
              placeholder="What was discussed? Next steps?"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
          <button
            onClick={submit}
            disabled={!outcome || logCall.isPending}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold nf-chameleon-bg text-white disabled:opacity-50 flex items-center gap-1.5"
          >
            {logCall.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            Save call
          </button>
        </div>
      </div>
    </div>
  );
}
