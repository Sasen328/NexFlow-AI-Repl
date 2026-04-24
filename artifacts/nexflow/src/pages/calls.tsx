import { useCalls, useAnalyzeCall, useScripts } from "@/hooks/useApi";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Brain,
  Play, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, ChevronDown,
  ChevronUp, Activity, X, Loader2, Sparkles, MessageSquare, Mic, Volume2,
  BookOpen, Shield, Wand2, ToggleLeft, ToggleRight, Copy, Check, Star,
  Filter, Search
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SENTIMENT_CONFIG = (score: number | null) => {
  if (score === null) return null;
  if (score >= 0.75) return { label: "Very Positive", color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/15", icon: TrendingUp };
  if (score >= 0.5) return { label: "Positive", color: "text-[#B8B880]", bg: "bg-[#B8B880]/15", icon: TrendingUp };
  if (score >= 0.3) return { label: "Neutral", color: "text-[#C8A880]", bg: "bg-[#C8A880]/15", icon: Activity };
  return { label: "Negative", color: "text-destructive", bg: "bg-destructive/15", icon: TrendingDown };
};

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#88B8B0" : score >= 60 ? "#B8B880" : "#C0A0B8";
  const pct = score / 100;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
          <circle cx="32" cy="32" r="24" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${pct * 150.8} 150.8`} strokeLinecap="round" transform="rotate(-90 32 32)" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-black text-foreground leading-none">{score}</span>
        </div>
      </div>
      <span className="text-[9px] text-muted-foreground font-medium">AI Score</span>
    </div>
  );
}

const LIVE_COACH_TIPS = [
  { tag: "Opening", color: "#B8A0C8", tip: "Start with 'As-salamu alaykum' for KSA contacts — 38% higher engagement rate." },
  { tag: "Discovery", color: "#88B8B0", tip: "Ask about their Q2 goals before introducing features — let them sell themselves." },
  { tag: "Objection", color: "#C8A880", tip: "If they mention Salesforce, say: 'We complement it — our clients use both.'" },
  { tag: "Closing", color: "#C0A0B8", tip: "Propose a 3-way call with their IT lead to accelerate decision-making." },
  { tag: "Value", color: "#90B8B8", tip: "Anchor on ROI: 40% CRM cost reduction, 22% close rate improvement." },
];

const OBJECTION_PROMPTS = [
  { trigger: "It's too expensive", response: "Totally understand. Most GCC clients saw ROI in the first quarter — want me to share a quick calculation?", color: "#C8A880" },
  { trigger: "We use Salesforce", response: "Great news — we natively integrate. Many clients use NexFlow for AI + Arabic voice on top of Salesforce.", color: "#B8A0C8" },
  { trigger: "Need more time", response: "Of course. Can we schedule a 30-min technical review with your team this week?", color: "#88B8B0" },
  { trigger: "Too complex", response: "The onboarding takes under 2 hours — and we handle migration. Want to see a live setup?", color: "#90B8B8" },
];

const VOICE_LIBRARY = [
  { name: "Layla (Arabic)", lang: "ar", gender: "Female", tone: "Professional", active: true },
  { name: "Khalid (Arabic)", lang: "ar", gender: "Male", tone: "Warm", active: false },
  { name: "Sarah (English)", lang: "en", gender: "Female", tone: "Energetic", active: false },
  { name: "James (English)", lang: "en", gender: "Male", tone: "Authoritative", active: false },
];

type CoachTab = "coaching" | "objections" | "scripts" | "voice";

export default function CallsPage() {
  const { data, isLoading } = useCalls();
  const { data: scriptsData } = useScripts();
  const calls = data?.calls ?? [];
  const scripts = scriptsData?.scripts ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);
  const [openCall, setOpenCall] = useState<any>(null);
  const [showCoach, setShowCoach] = useState(true);
  const [coachTab, setCoachTab] = useState<CoachTab>("coaching");
  const [voiceToggle, setVoiceToggle] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const completedCalls = calls.filter((c: any) => c.status === "completed");
  const scored = completedCalls.filter((c: any) => c.call_score !== null);
  const avgScore = scored.length
    ? Math.round(scored.reduce((acc: number, c: any) => acc + (c.call_score ?? 0), 0) / scored.length)
    : 0;

  function copyText(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }

  const filteredCalls = search
    ? calls.filter((c: any) => (c.contact_name ?? "").toLowerCase().includes(search.toLowerCase()))
    : calls;

  const COACH_TABS = [
    { k: "coaching" as CoachTab, label: "Live Tips", icon: Brain },
    { k: "objections" as CoachTab, label: "Objections", icon: Shield },
    { k: "scripts" as CoachTab, label: "Scripts", icon: BookOpen },
    { k: "voice" as CoachTab, label: "Voice Library", icon: Volume2 },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Phone className="w-6 h-6 text-[#88B8B0]" />
            Calls & Transcripts
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Live coaching, AI insights, objection handling, and voice library</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card rounded-xl px-3 py-2 text-center">
            <div className="text-lg font-bold text-[#88B8B0]">{avgScore || "—"}</div>
            <div className="text-[10px] text-muted-foreground">Avg score</div>
          </div>
          <div className="glass-card rounded-xl px-3 py-2 text-center">
            <div className="text-lg font-bold text-[#B8A0C8]">{completedCalls.length}</div>
            <div className="text-[10px] text-muted-foreground">Completed</div>
          </div>
          <button
            onClick={() => setShowCoach(!showCoach)}
            className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all",
              showCoach ? "nf-chameleon-bg text-white border-transparent" : "bg-muted/40 text-muted-foreground border-border/40 hover:text-foreground"
            )}>
            <Wand2 className="w-3.5 h-3.5" />
            {showCoach ? "Hide Coach" : "Live Coach"}
          </button>
        </div>
      </div>

      <div className={cn("grid gap-5 transition-all", showCoach ? "grid-cols-1 lg:grid-cols-5" : "grid-cols-1")}>
        {/* Call list - main area */}
        <div className={showCoach ? "lg:col-span-3" : ""}>
          {/* Search + filter */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border/30 flex-1">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground flex-1"
                placeholder="Search by contact name…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="text-xs text-muted-foreground px-2">{filteredCalls.length} calls</div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => <div key={i} className="glass-card rounded-2xl p-5 h-24 animate-pulse" />)
            ) : filteredCalls.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center text-sm text-muted-foreground">No calls logged yet.</div>
            ) : filteredCalls.map((c: any) => {
              const sentiment = SENTIMENT_CONFIG(c.sentiment_score);
              const mins = c.duration_seconds ? Math.floor(c.duration_seconds / 60) : null;
              const secs = c.duration_seconds ? c.duration_seconds % 60 : null;
              const isExpandedCard = expanded === c.id;
              return (
                <div key={c.id} className="glass-card rounded-2xl overflow-hidden hover:shadow-md transition-all">
                  <button
                    className="w-full flex items-center gap-4 p-4 hover:bg-muted/10 transition-colors text-left"
                    onClick={() => setExpanded(isExpandedCard ? null : c.id)}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      c.status === "completed" ? "bg-[#88B8B0]/20" : c.status === "missed" ? "bg-destructive/20" : "bg-muted/60")}>
                      {c.direction === "inbound"
                        ? <PhoneIncoming className={cn("w-5 h-5", c.status === "completed" ? "text-[#88B8B0]" : "text-muted-foreground")} />
                        : c.status === "missed"
                          ? <PhoneMissed className="w-5 h-5 text-destructive" />
                          : <PhoneOutgoing className={cn("w-5 h-5", c.status === "completed" ? "text-[#88B8B0]" : "text-muted-foreground")} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{c.contact_name ?? "Unknown Contact"}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                        <span className="capitalize">{c.direction} · {c.status}</span>
                        {mins !== null && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mins}m {secs}s</span>}
                        {sentiment && (
                          <span className={cn("flex items-center gap-1 font-medium", sentiment.color)}>
                            <sentiment.icon className="w-3 h-3" />{sentiment.label}
                          </span>
                        )}
                      </div>
                    </div>
                    {c.call_score !== null && c.call_score !== undefined && (
                      <div className="flex-shrink-0"><ScoreGauge score={Math.round(c.call_score)} /></div>
                    )}
                    {isExpandedCard ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                  </button>

                  {isExpandedCard && (
                    <div className="px-4 pb-4 border-t border-border/20">
                      {c.coaching_notes && (
                        <div className="mt-3 p-3.5 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Brain className="w-3.5 h-3.5 text-[#B8A0C8]" />
                            <span className="text-xs font-bold text-[#B8A0C8]">AI Coaching Notes</span>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{c.coaching_notes}</p>
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-3">
                        <button onClick={() => setOpenCall(c)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#B8A0C8]/15 text-[#B8A0C8] font-semibold hover:bg-[#B8A0C8]/25">
                          <MessageSquare className="w-3.5 h-3.5" />View transcript & analysis
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <Play className="w-3.5 h-3.5" />Play recording
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Coach Panel */}
        {showCoach && (
          <div className="lg:col-span-2">
            <div className="sticky top-4 space-y-3">
              {/* Coach header */}
              <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #f8f4ff, #f0f9f8)", border: "1px solid rgba(184,160,200,0.3)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl nf-chameleon-bg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">Live AI Coach</div>
                      <div className="flex items-center gap-1 text-[10px] text-[#88B8B0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#88B8B0] inline-block" />
                        Active coaching mode
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                    <button onClick={() => setVoiceToggle(!voiceToggle)} className="text-[#B8A0C8]">
                      {voiceToggle ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                    </button>
                    <span className="text-[10px] text-muted-foreground">Voice</span>
                  </div>
                </div>

                {/* Coach tabs */}
                <div className="flex gap-0.5 p-1 rounded-xl bg-white/50 backdrop-blur-sm">
                  {COACH_TABS.map(t => {
                    const Icon = t.icon;
                    return (
                      <button key={t.k} onClick={() => setCoachTab(t.k)}
                        className={cn("flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all",
                          coachTab === t.k ? "nf-chameleon-bg text-white" : "text-muted-foreground hover:text-foreground")}>
                        <Icon className="w-3 h-3" />{t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Tips */}
              {coachTab === "coaching" && (
                <div className="space-y-2">
                  {LIVE_COACH_TIPS.map((tip, i) => (
                    <div key={i} className="glass-card rounded-xl p-3.5" style={{ borderLeft: `3px solid ${tip.color}` }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                          style={{ background: `${tip.color}20`, color: tip.color }}>{tip.tag}</span>
                      </div>
                      <p className="text-xs text-foreground/85 leading-snug">{tip.tip}</p>
                    </div>
                  ))}
                  <div className="glass-card rounded-xl p-3 text-center">
                    <button className="flex items-center gap-1.5 mx-auto text-xs text-[#B8A0C8] font-semibold hover:underline">
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate context-specific tips
                    </button>
                  </div>
                </div>
              )}

              {/* Objections */}
              {coachTab === "objections" && (
                <div className="space-y-2">
                  <p className="text-[11px] text-muted-foreground px-1">Tap any response to copy it instantly during the call.</p>
                  {OBJECTION_PROMPTS.map((obj, i) => (
                    <div key={i} className="glass-card rounded-xl p-3.5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: obj.color }} />
                          <span className="text-xs font-bold text-foreground italic">"{obj.trigger}"</span>
                        </div>
                        <button onClick={() => copyText(obj.response, i)}
                          className="text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors">
                          {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-[#88B8B0]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="text-[11px] text-foreground/80 leading-snug p-2.5 rounded-lg"
                        style={{ background: `${obj.color}10`, border: `1px solid ${obj.color}25` }}>
                        {obj.response}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Scripts */}
              {coachTab === "scripts" && (
                <div className="space-y-2">
                  {scripts.length === 0 ? (
                    <div className="glass-card rounded-xl p-4 text-center text-xs text-muted-foreground">No scripts yet — add them in Knowledge Base.</div>
                  ) : scripts.slice(0, 4).map((s: any, i: number) => (
                    <div key={s.id} className="glass-card rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-foreground">{s.name}</span>
                        <button onClick={() => copyText(s.content, i + 100)}
                          className="text-muted-foreground hover:text-foreground transition-colors">
                          {copiedIdx === i + 100 ? <Check className="w-3.5 h-3.5 text-[#88B8B0]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-foreground/70 leading-snug line-clamp-3">{s.content}</p>
                    </div>
                  ))}
                  {scripts.length === 0 && (
                    <div className="glass-card rounded-xl p-3 text-center">
                      <a href="/scripts" className="text-xs text-[#B8A0C8] font-semibold hover:underline">Manage Knowledge Base →</a>
                    </div>
                  )}
                </div>
              )}

              {/* Voice Library */}
              {coachTab === "voice" && (
                <div className="space-y-2">
                  <div className="glass-card rounded-xl p-3 mb-1">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-[#B8A0C8]" />
                      <span className="text-xs font-bold text-foreground">AI Voice Library</span>
                      <button onClick={() => setVoiceToggle(!voiceToggle)} className="ml-auto">
                        {voiceToggle
                          ? <ToggleRight className="w-5 h-5 text-[#B8A0C8]" />
                          : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {voiceToggle ? "AI voice agent is active and available." : "Voice agent is paused — human agent mode."}
                    </p>
                  </div>
                  {VOICE_LIBRARY.map((v, i) => (
                    <div key={i} className={cn("glass-card rounded-xl p-3.5 flex items-center gap-3 cursor-pointer transition-all hover:shadow-md",
                      v.active && "border border-[#B8A0C8]/30 bg-[#B8A0C8]/5")}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white"
                        style={{ background: v.active ? "linear-gradient(135deg, #B8A0C8, #88B8B0)" : "#e2dde6" }}>
                        {v.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground">{v.name}</div>
                        <div className="text-[10px] text-muted-foreground">{v.tone} · {v.lang.toUpperCase()}</div>
                      </div>
                      {v.active && <Star className="w-3.5 h-3.5 text-[#C8A880] fill-current flex-shrink-0" />}
                      <button className="text-xs px-2 py-1 rounded-lg border text-muted-foreground border-border/40 hover:text-foreground">
                        {v.active ? "Active" : "Use"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {openCall && <CallDetailModal call={openCall} onClose={() => setOpenCall(null)} />}
    </div>
  );
}

function CallDetailModal({ call, onClose }: { call: any; onClose: () => void }) {
  const analyze = useAnalyzeCall();
  const [analysis, setAnalysis] = useState<any>(call.ai_insights ?? null);
  const [transcript, setTranscript] = useState<string>(call.transcript ?? "");
  const [coaching, setCoaching] = useState<string>(call.coaching_notes ?? "");

  const runAnalysis = async () => {
    const r: any = await analyze.mutateAsync(call.id);
    setAnalysis(r?.analysis);
    if (r?.call?.transcript) setTranscript(r.call.transcript);
    if (r?.call?.coaching_notes) setCoaching(r.call.coaching_notes);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-stretch justify-end" onClick={onClose}>
      <div className="bg-background w-full max-w-2xl h-full overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">{call.contact_name ?? "Call"}</h2>
            <div className="text-xs text-muted-foreground capitalize">{call.direction} · {call.status} · {Math.floor((call.duration_seconds ?? 0) / 60)}m</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        {!analysis && (
          <button onClick={runAnalysis} disabled={analyze.isPending}
            className="w-full px-4 py-3 rounded-xl nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {analyze.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> AI is analyzing…</> : <><Sparkles className="w-4 h-4" /> Generate AI analysis</>}
          </button>
        )}

        {analysis && (
          <div className="space-y-4 mt-2">
            {analysis.transcript_summary && (
              <div className="p-4 rounded-xl bg-muted/30">
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-foreground" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wide">Transcript Summary</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{analysis.transcript_summary}</p>
              </div>
            )}
            {analysis.key_topics?.length > 0 && (
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Key Topics</div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.key_topics.map((t: string, i: number) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-[#88B8B0]/15 text-[#88B8B0] font-medium">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {analysis.objections?.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-[#C8A880]" />
                  <span className="text-xs font-bold text-[#C8A880] uppercase tracking-wide">Objections raised</span>
                </div>
                <div className="space-y-2">
                  {analysis.objections.map((o: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-[#C8A880]/10 border border-[#C8A880]/20">
                      <div className="text-sm font-semibold text-foreground mb-1">"{o.objection}"</div>
                      <div className="text-xs text-foreground/70"><span className="text-[#88B8B0] font-semibold">Suggested response:</span> {o.response_suggestion}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {analysis.next_steps?.length > 0 && (
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Recommended next steps</div>
                <ul className="space-y-1.5">
                  {analysis.next_steps.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#88B8B0] flex-shrink-0 mt-0.5" />{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.talk_ratio && (
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Talk ratio</div>
                <div className="h-3 bg-muted/40 rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#B8A0C8]" style={{ width: `${analysis.talk_ratio.rep ?? 50}%` }} />
                  <div className="h-full bg-[#88B8B0]" style={{ width: `${analysis.talk_ratio.prospect ?? 50}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>You</span><span>Prospect</span></div>
              </div>
            )}
            {coaching && (
              <div className="p-4 rounded-xl bg-[#B8A0C8]/10 border border-[#B8A0C8]/20">
                <div className="flex items-center gap-1.5 mb-2">
                  <Brain className="w-3.5 h-3.5 text-[#B8A0C8]" />
                  <span className="text-xs font-bold text-[#B8A0C8] uppercase tracking-wide">Coaching</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{coaching}</p>
              </div>
            )}
            {transcript && (
              <details className="p-4 rounded-xl bg-muted/30">
                <summary className="text-xs font-bold text-foreground cursor-pointer">Full transcript</summary>
                <pre className="mt-3 text-xs text-foreground/70 whitespace-pre-wrap font-mono">{transcript}</pre>
              </details>
            )}
            <button onClick={runAnalysis} disabled={analyze.isPending}
              className="w-full px-4 py-2 rounded-lg bg-muted/50 text-foreground text-xs font-semibold hover:bg-muted disabled:opacity-50 flex items-center justify-center gap-2">
              {analyze.isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Re-analyzing…</> : <><Sparkles className="w-3.5 h-3.5" /> Re-run AI analysis</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
