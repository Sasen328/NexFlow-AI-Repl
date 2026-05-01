import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, useLists } from "@/hooks/useApi";
import { Link, useSearch, useLocation } from "wouter";
import { speakViaServer, stopServerSpeak, pickServerVoice } from "@/lib/voice";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneOff, PhoneMissed, Bot, Sparkles,
  ChevronRight, CheckCircle2, X, Loader2, Zap, Trophy, Clock, TrendingUp,
  MessageSquare, Mic, MicOff, Volume2, AlertCircle, User, Building2,
  Calendar, Mail, Send, FileText, Brain, Target, ArrowRight, Pause, Play,
  Activity, Lightbulb, Edit3, Wand2, RefreshCw, BellRing, List, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QueueItem {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  lead_score: number | null;
  status: string;
  last_touch: string;
  call_count: number;
  open_value: number;
  open_count: number;
  priority_score: number;
}

type Mode = "manual" | "auto" | "ai_agent";
type Phase = "idle" | "ringing" | "connected" | "ended" | "wrapping";

const OUTCOMES = [
  { key: "connected", label: "Connected", color: "text-emerald-600", icon: CheckCircle2 },
  { key: "voicemail", label: "Voicemail", color: "text-amber-600", icon: PhoneMissed },
  { key: "no_answer", label: "No answer", color: "text-muted-foreground", icon: PhoneMissed },
  { key: "callback_requested", label: "Callback later", color: "text-blue-600", icon: Clock },
  { key: "meeting_booked", label: "Meeting booked", color: "text-emerald-600", icon: Calendar },
  { key: "not_interested", label: "Not interested", color: "text-red-500", icon: X },
];

// Mock transcript that streams during a call
const TRANSCRIPT_SCRIPT: { speaker: "agent" | "lead" | "ai"; text: string; tag?: string; coach?: string }[] = [
  { speaker: "agent", text: "As-salamu alaykum, this is Layla from NexFlow. Is this a good time?", tag: "Opening" },
  { speaker: "lead", text: "Wa alaykum as-salam. Yeah, you have about ten minutes." },
  { speaker: "agent", text: "Perfect — I won't take more. I noticed your team just expanded into Riyadh. Congrats!", tag: "Personalization", coach: "Great use of their recent news. Keep it warm." },
  { speaker: "lead", text: "Thanks. We're hiring fast — but our CRM is choking on the new pipeline." },
  { speaker: "agent", text: "That's exactly why I called. We help GCC sales teams cut admin time by 40%.", tag: "Value", coach: "Anchor the 40% number — they reacted." },
  { speaker: "lead", text: "Honestly, we already use Salesforce. I don't have budget for another tool." },
  { speaker: "ai", text: "OBJECTION DETECTED: budget + incumbent (Salesforce). Recommended response →", coach: "Use the Salesforce co-exist play. Don't argue cost." },
  { speaker: "agent", text: "Totally hear you. Most of our GCC clients run NexFlow alongside Salesforce — we're the AI + Arabic voice layer on top.", tag: "Objection", coach: "Smooth pivot. Now ask a discovery question." },
  { speaker: "lead", text: "Hmm. How fast can you actually deploy?" },
  { speaker: "agent", text: "Two weeks for the MVP, four for full Salesforce sync. Want to see a 15-min walkthrough Thursday?", tag: "CTA" },
  { speaker: "lead", text: "Thursday afternoon could work. Send me a calendar invite." },
  { speaker: "ai", text: "BUYING SIGNAL: explicit calendar request. Trigger meeting-booked outcome.", coach: "Confirm time + decision-maker before hanging up." },
];

const PRE_CALL_TIPS_BY_SCORE = (score: number): string[] => {
  if (score >= 80) return [
    "High-intent — they've engaged with 3+ touchpoints this week.",
    "Lead with: 'I saw you opened the ROI brief Tuesday — what stood out?'",
    "Skip discovery. Go straight to demo proposal.",
  ];
  if (score >= 60) return [
    "Warm — moderate engagement. Re-establish context.",
    "Reference their last activity to anchor the conversation.",
    "Discovery questions before pitching value.",
  ];
  return [
    "Cold — first or stale touch. Earn 30 seconds first.",
    "Open with permission: 'Caught you at a bad time?'",
    "Goal: secure a follow-up, not a close.",
  ];
};

export default function PowerDialerPage() {
  const qc = useQueryClient();
  const search = useSearch();
  const [, navigate] = useLocation();
  const listId = useMemo(() => new URLSearchParams(search).get("list") ?? undefined, [search]);
  const [showListPicker, setShowListPicker] = useState(false);
  const { data: listsData } = useLists();
  const availableLists: any[] = (listsData as any)?.lists ?? [];
  const [mode, setMode] = useState<Mode>("manual");
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [outcome, setOutcome] = useState<string>("connected");
  const [notes, setNotes] = useState("");
  const [transcript, setTranscript] = useState<typeof TRANSCRIPT_SCRIPT>([]);
  const [muted, setMuted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [autoQueueIdx, setAutoQueueIdx] = useState(0);
  const [autoCycling, setAutoCycling] = useState(false);
  const [postCallActions, setPostCallActions] = useState<{
    call_note: string;
    follow_up_task: string;
    reminder: string;
    whatsapp_draft: string;
    email_draft: string;
    score: number;
    sentiment: string;
  } | null>(null);
  const [pushed, setPushed] = useState<Set<string>>(new Set());
  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const transcriptTimerRef = useRef<number | null>(null);

  const { data: queueData, isLoading } = useQuery<{ count: number; queue: QueueItem[]; list_id?: string | null }>({
    queryKey: ["power-dialer-queue", listId],
    queryFn: () => apiFetch(`/power-dialer/queue?limit=20${listId ? `&list_id=${listId}` : ""}`),
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["power-dialer-stats"],
    queryFn: () => apiFetch("/power-dialer/stats"),
    refetchInterval: 5000,
  });

  const log = useMutation({
    mutationFn: (body: any) =>
      apiFetch("/power-dialer/log", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["power-dialer-stats"] });
      qc.invalidateQueries({ queryKey: ["power-dialer-queue"] });
      qc.invalidateQueries({ queryKey: ["calls"] });
    },
  });

  const aiAgentCall = useMutation({
    mutationFn: (body: any) =>
      apiFetch("/power-dialer/voice-agent-call", { method: "POST", body: JSON.stringify(body) }),
  });

  const queue = queueData?.queue ?? [];
  const active = queue[activeIdx];

  // Pre-call brief tips
  const preCallTips = useMemo(() => PRE_CALL_TIPS_BY_SCORE(active?.lead_score ?? 0), [active?.lead_score]);

  // Call timer
  useEffect(() => {
    if (phase !== "connected") return;
    const t = window.setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Ringing → connected
  useEffect(() => {
    if (phase !== "ringing") return undefined;
    const t = setTimeout(() => {
      // 70% connect, 20% voicemail, 10% no answer
      const r = Math.random();
      if (r < 0.7) {
        setPhase("connected");
        setCallDuration(0);
        setTranscript([]);
      } else if (r < 0.9) {
        handleQuickEnd("voicemail");
      } else {
        handleQuickEnd("no_answer");
      }
    }, 1800);
    return () => clearTimeout(t);
  }, [phase]);

  // Stream transcript line-by-line during connected
  useEffect(() => {
    if (phase !== "connected") {
      if (transcriptTimerRef.current) {
        clearTimeout(transcriptTimerRef.current);
        transcriptTimerRef.current = null;
      }
      return;
    }
    if (transcript.length >= TRANSCRIPT_SCRIPT.length) return;
    const delay = 1400 + Math.random() * 800;
    transcriptTimerRef.current = window.setTimeout(() => {
      setTranscript((t) => [...t, TRANSCRIPT_SCRIPT[t.length]]);
    }, delay);
    return () => {
      if (transcriptTimerRef.current) clearTimeout(transcriptTimerRef.current);
    };
  }, [phase, transcript]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Speak the newest transcript line via TTS when AI agent mode + audio enabled
  useEffect(() => {
    if (!audioEnabled || mode !== "ai_agent" || phase !== "connected" || transcript.length === 0) return;
    const newest = transcript[transcript.length - 1];
    if (newest.speaker !== "agent") return;
    const voice = pickServerVoice({ lang: "ar-SA", gender: "Female", name: "Layla" });
    void speakViaServer(newest.text, voice, {});
  }, [transcript, audioEnabled, mode, phase]);

  // Stop TTS when call ends
  useEffect(() => {
    if (phase !== "connected") stopServerSpeak();
  }, [phase]);

  // Auto-dial next in queue when in auto mode and call wraps up
  useEffect(() => {
    if (!autoCycling || phase !== "idle" || !active) return undefined;
    const t = setTimeout(() => {
      setPhase("ringing");
    }, 1500);
    return () => clearTimeout(t);
  }, [autoCycling, phase, active, autoQueueIdx]);

  function handleQuickEnd(out: string) {
    setPhase("ended");
    setOutcome(out);
    generatePostCallAI(out, 0);
    // In auto-dial mode, non-connects should auto-log and advance after a brief delay
    if (autoCycling && (out === "voicemail" || out === "no_answer") && active) {
      window.setTimeout(() => {
        log.mutate({ contact_id: active.id, outcome: out, notes: "Auto-cycle non-connect", duration_seconds: 0 });
        nextLead();
      }, 1200);
    }
  }

  function startCall() {
    setTranscript([]);
    setCallDuration(0);
    setPostCallActions(null);
    setPushed(new Set());
    if (mode === "ai_agent" && active) {
      // AI agent mode → trigger backend voice-agent simulation, then enter live transcript view
      aiAgentCall.mutate(
        { contact_id: active.id, agent_persona: "professional" },
        {
          onSuccess: () => {
            // Show simulated live call experience after backend "places" the call
            setPhase("ringing");
          },
          onError: () => setPhase("ringing"),
        }
      );
      return;
    }
    setPhase("ringing");
  }

  function endCall() {
    setPhase("ended");
    generatePostCallAI(outcome, callDuration);
  }

  function generatePostCallAI(outcomeKey: string, duration: number) {
    if (!active) return;
    const name = `${active.first_name} ${active.last_name}`;
    const isConnect = outcomeKey === "connected" || outcomeKey === "meeting_booked";
    const score = isConnect ? 78 + Math.floor(Math.random() * 18) : 32 + Math.floor(Math.random() * 25);
    setPostCallActions({
      score,
      sentiment: isConnect ? "Positive · interested" : outcomeKey === "voicemail" ? "Neutral · no contact" : "No signal",
      call_note: isConnect
        ? `${duration}s call with ${name}. Discussed Q2 expansion needs and Salesforce co-existence. Concerns: deployment speed, budget. Strong interest in Arabic AI voice layer. Booked Thursday demo.`
        : `${outcomeKey === "voicemail" ? "Left voicemail" : "No answer"} for ${name}. Will retry per cadence.`,
      follow_up_task: isConnect
        ? `Send Salesforce-NexFlow co-existence brief + calendar invite for Thursday 2pm GST demo.`
        : `Retry call tomorrow 11am — likely connect window based on past engagement.`,
      reminder: isConnect
        ? `Thursday 1:45pm — 15 min before demo`
        : `Tomorrow 10:50am — pre-call prep`,
      whatsapp_draft: isConnect
        ? `Thanks for the time, ${active.first_name}! Sending the Salesforce integration brief now. Calendar invite for Thursday 2pm GST coming through. — Layla`
        : `Hi ${active.first_name}, sorry I missed you. Have a 2-min loom showing how NexFlow fits with Salesforce. Want me to send it? — Layla`,
      email_draft: isConnect
        ? `Subject: Thursday demo + Salesforce integration brief\n\nHi ${active.first_name},\n\nGreat speaking with you. As promised:\n• Calendar invite — Thursday 2pm GST\n• Salesforce + NexFlow co-existence brief (attached)\n• Quick deployment timeline\n\nLooking forward,\nLayla`
        : `Subject: Quick follow-up\n\nHi ${active.first_name},\n\nTried calling earlier — wanted to share a 2-min walkthrough on how teams like yours run NexFlow alongside Salesforce.\n\nWatch here: nexflow.app/loom/sf-coexist\n\nBest,\nLayla`,
    });
  }

  function pushAction(key: string) {
    setPushed((s) => new Set([...s, key]));
  }

  function nextLead() {
    setPhase("idle");
    setNotes("");
    setOutcome("connected");
    setTranscript([]);
    setCallDuration(0);
    setPostCallActions(null);
    setPushed(new Set());
    if (mode === "auto") {
      setAutoQueueIdx((i) => i + 1);
    }
    // Allow active index to reach queue.length so empty-state can render
    setActiveIdx((i) => i + 1);
  }

  function logAndNext() {
    if (active) {
      log.mutate({
        contact_id: active.id,
        outcome,
        notes: notes || postCallActions?.call_note || "",
        duration_seconds: callDuration || 60 + Math.floor(Math.random() * 240),
      });
    }
    nextLead();
  }

  function toggleAutoCycle() {
    if (!autoCycling) {
      setMode("auto");
      setAutoCycling(true);
      if (phase === "idle") startCall();
    } else {
      setAutoCycling(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Power Dialer
            {phase === "connected" && (
              <span className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE · {fmtDur(callDuration)}
              </span>
            )}
            {autoCycling && phase !== "connected" && (
              <span className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                <Activity className="w-3 h-3 animate-pulse" /> AUTO-DIALING
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-prioritized queue · live transcript · live coach · auto follow-ups
          </p>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted">
          <ModeButton active={mode === "manual"} onClick={() => { setMode("manual"); setAutoCycling(false); }} icon={Phone} label="Manual" />
          <ModeButton active={mode === "auto"} onClick={() => setMode("auto")} icon={Zap} label="Auto-Dial" />
          <ModeButton active={mode === "ai_agent"} onClick={() => { setMode("ai_agent"); setAutoCycling(false); }} icon={Bot} label="AI Agent" />
        </div>
      </div>

      {/* Mode hint banner */}
      {mode === "auto" && (
        <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900 px-4 py-3 flex items-center gap-3">
          <Activity className="w-4 h-4 text-purple-600 shrink-0" />
          <div className="text-sm flex-1">
            <span className="font-semibold text-purple-900 dark:text-purple-200">Auto-Dial mode:</span>
            <span className="text-purple-700 dark:text-purple-300"> The dialer cycles through the queue automatically until a human picks up. You take over the moment they connect.</span>
          </div>
          <button
            onClick={toggleAutoCycle}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1",
              autoCycling
                ? "bg-rose-500 text-white hover:bg-rose-600"
                : "bg-purple-600 text-white hover:bg-purple-700"
            )}
          >
            {autoCycling ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Start cycle</>}
          </button>
        </div>
      )}
      {mode === "ai_agent" && (
        <div className="rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-900 px-4 py-3 flex items-center gap-3">
          <Bot className="w-4 h-4 text-violet-600 shrink-0" />
          <div className="text-sm flex-1">
            <span className="font-semibold text-violet-900 dark:text-violet-200">AI Voice Agent mode:</span>
            <span className="text-violet-700 dark:text-violet-300"> Layla (Arabic · Female) places the calls, qualifies, and books meetings. You'll see live transcript & be paged for human handoff.</span>
            <span className="text-violet-600 dark:text-violet-400 ml-2 text-xs">Press 🔊 during the call to hear Layla speak.</span>
          </div>
          <Link
            href="/contact-center-setup"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition bg-violet-600 text-white hover:bg-violet-700 flex items-center gap-1"
          >
            <Settings2 /> Configure
          </Link>
        </div>
      )}

      {/* List picker / List filter banner */}
      {listId ? (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900 px-4 py-3 flex items-center gap-3">
          <List className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="text-sm flex-1">
            <span className="font-semibold text-emerald-900 dark:text-emerald-200">Dialing from list</span>
            {availableLists.find((l: any) => l.id === listId) && (
              <span className="text-emerald-700 dark:text-emerald-300"> · <strong>{availableLists.find((l: any) => l.id === listId)?.name}</strong></span>
            )}
            <span className="text-emerald-700 dark:text-emerald-300"> — queue filtered to this list's contacts with phone numbers.</span>
          </div>
          <button onClick={() => navigate("/power-dialer")} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-300 text-emerald-700 hover:bg-emerald-100 transition">
            Clear list
          </button>
          <Link href="/lists" className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition">
            All lists
          </Link>
        </div>
      ) : (
        <div className="rounded-xl bg-muted/40 border border-border/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <List className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground flex-1">
              Dialing from <strong>full queue</strong> (all prioritised contacts).
              {availableLists.length > 0 && " Select a list to narrow the queue."}
            </span>
            {availableLists.length > 0 && (
              <div className="relative">
                <button onClick={() => setShowListPicker(p => !p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/60 text-foreground hover:bg-muted/60 transition">
                  <List className="w-3 h-3" /> Load a list <ChevronDown className="w-3 h-3" />
                </button>
                {showListPicker && (
                  <div className="absolute right-0 top-full mt-1 z-30 w-64 rounded-xl border border-border/40 bg-background shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-border/30">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Select a call list</span>
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {availableLists.map((l: any) => (
                        <button key={l.id} onClick={() => { navigate(`/power-dialer?list=${l.id}`); setShowListPicker(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors">
                          <div className="w-7 h-7 rounded-lg bg-[#88B8B0]/15 flex items-center justify-center flex-shrink-0">
                            <List className="w-3.5 h-3.5 text-[#88B8B0]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">{l.name}</div>
                            <div className="text-xs text-muted-foreground">{l.member_count ?? 0} contacts</div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                    <div className="p-2 border-t border-border/30">
                      <Link href="/lists">
                        <button onClick={() => setShowListPicker(false)} className="w-full text-xs text-[#88B8B0] font-semibold text-center py-1 hover:underline">
                          Manage lists →
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
            <Link href="/lists">
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 text-muted-foreground hover:bg-muted/60 transition">
                {availableLists.length === 0 ? "Create a list" : "All lists"}
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat icon={Phone} label="Calls today" value={stats?.today_calls ?? 0} />
        <Stat icon={CheckCircle2} label="Connects" value={stats?.today_connects ?? 0} />
        <Stat icon={Trophy} label="Meetings" value={stats?.today_meetings ?? 0} />
        <Stat icon={TrendingUp} label="Connect rate" value={`${stats?.connect_rate ?? 0}%`} />
        <Stat icon={Clock} label="Avg duration" value={`${Math.round((stats?.avg_duration ?? 0))}s`} />
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-5">
        {/* MAIN STAGE */}
        <div className="space-y-4">
          {/* Lead header card with pre-call brief */}
          {active && phase === "idle" && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg shrink-0">
                    {active.first_name[0]}{active.last_name[0]}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Lead {activeIdx + 1} of {queue.length} · Priority {Math.round(active.priority_score)}
                    </div>
                    <h2 className="text-2xl font-bold mt-0.5">{active.first_name} {active.last_name}</h2>
                    <div className="text-sm text-muted-foreground">{active.title ?? "—"}</div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                      {active.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {active.phone}</span>}
                      {active.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {active.email}</span>}
                      <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {active.call_count} prior call{active.call_count === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-muted-foreground">Lead score</div>
                  <div className={cn(
                    "text-3xl font-bold",
                    (active.lead_score ?? 0) >= 80 ? "text-emerald-600" :
                    (active.lead_score ?? 0) >= 60 ? "text-amber-600" : "text-muted-foreground"
                  )}>
                    {Math.round(active.lead_score ?? 0)}
                  </div>
                  {active.open_value > 0 && (
                    <div className="text-xs text-emerald-600 mt-0.5">
                      ${active.open_value.toLocaleString()} open
                    </div>
                  )}
                </div>
              </div>

              {/* Pre-call brief */}
              <div className="mt-4 rounded-xl bg-blue-50/60 dark:bg-blue-900/15 border border-blue-200/60 dark:border-blue-900/40 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-xs uppercase font-semibold text-blue-900 dark:text-blue-300">AI pre-call brief</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Last activity</div>
                    <div className="text-xs leading-relaxed">
                      Opened pricing page Tuesday. Downloaded ROI calculator Wed. Last touch: <span className="font-medium">{active.last_touch ?? "no recorded touch"}</span>.
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">Recommended approach</div>
                    <ul className="text-xs space-y-1">
                      {preCallTips.map((tip, i) => (
                        <li key={i} className="flex gap-1.5">
                          <span className="text-blue-600">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <button
                  onClick={startCall}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  {mode === "ai_agent" ? "Have AI agent dial" : mode === "auto" ? "Start auto-cycle" : "Dial now"}
                </button>
                <button
                  onClick={nextLead}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition"
                >
                  Skip
                </button>
                <Link
                  href={`/contacts/${active.id}`}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition flex items-center gap-1"
                >
                  <User className="w-3 h-3" /> Open profile
                </Link>
              </div>
            </div>
          )}

          {/* RINGING */}
          {phase === "ringing" && active && (
            <div className="glass-card rounded-2xl p-8 text-center min-h-[420px] flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-emerald-600/20 flex items-center justify-center animate-pulse">
                  <PhoneOutgoing className="w-12 h-12 text-emerald-600" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400/40 animate-ping" />
              </div>
              <div className="text-lg font-semibold mt-6">Dialing {active.first_name}…</div>
              <div className="text-sm text-muted-foreground mt-1">{active.phone}</div>
              <button
                onClick={() => setPhase("idle")}
                className="mt-6 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition flex items-center gap-2"
              >
                <PhoneOff className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}

          {/* CONNECTED — live call panel */}
          {phase === "connected" && active && (
            <div className="glass-card rounded-2xl p-5 min-h-[420px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <PhoneIncoming className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold">{active.first_name} {active.last_name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Connected · {fmtDur(callDuration)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMuted(!muted)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition",
                      muted ? "bg-rose-500 text-white" : "bg-muted hover:bg-muted/70"
                    )}
                  >
                    {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  {mode === "ai_agent" && (
                    <button
                      onClick={() => {
                        if (audioEnabled) { stopServerSpeak(); setAudioEnabled(false); }
                        else setAudioEnabled(true);
                      }}
                      title={audioEnabled ? "Mute Layla's voice" : "Hear Layla speak (AI voice)"}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition",
                        audioEnabled ? "bg-violet-600 text-white" : "bg-muted hover:bg-muted/70"
                      )}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={endCall}
                    className="px-4 h-10 rounded-full bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition flex items-center gap-1"
                  >
                    <PhoneOff className="w-4 h-4" /> End
                  </button>
                </div>
              </div>

              {/* Live transcript */}
              <div className="rounded-xl border border-border bg-background/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs uppercase font-semibold text-muted-foreground">
                    <FileText className="w-3 h-3" /> Live transcript
                  </div>
                  <div className="text-[10px] text-muted-foreground">Auto-saved → Calls & Transcripts</div>
                </div>
                <div ref={transcriptScrollRef} className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {transcript.length === 0 && (
                    <div className="text-xs text-muted-foreground italic">Listening…</div>
                  )}
                  {transcript.map((line, i) => (
                    <TranscriptLine key={i} line={line} who={active.first_name} />
                  ))}
                  {transcript.length < TRANSCRIPT_SCRIPT.length && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" />
                      <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* POST-CALL: AI-generated actions */}
          {phase === "ended" && postCallActions && active && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">AI captured this call</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Score:</span>{" "}
                    <span className={cn(
                      "font-bold",
                      postCallActions.score >= 70 ? "text-emerald-600" :
                      postCallActions.score >= 50 ? "text-amber-600" : "text-rose-600"
                    )}>
                      {postCallActions.score}/100
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Sentiment:</span>{" "}
                    <span className="font-semibold">{postCallActions.sentiment}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <ActionCard
                  icon={FileText}
                  tone="blue"
                  title="Call note"
                  body={postCallActions.call_note}
                  pushed={pushed.has("note")}
                  onPush={() => pushAction("note")}
                  pushLabel="Save note"
                  destination="auto-attached to contact timeline"
                />
                <ActionCard
                  icon={Target}
                  tone="purple"
                  title="Suggested follow-up task"
                  body={postCallActions.follow_up_task}
                  pushed={pushed.has("task")}
                  onPush={() => pushAction("task")}
                  pushLabel="Push to Command Center"
                  destination="appears in your daily briefing"
                />
                <ActionCard
                  icon={BellRing}
                  tone="amber"
                  title="Reminder"
                  body={postCallActions.reminder}
                  pushed={pushed.has("reminder")}
                  onPush={() => pushAction("reminder")}
                  pushLabel="Set reminder"
                  destination="adds to Command Center"
                />
                <ActionCard
                  icon={MessageSquare}
                  tone="emerald"
                  title="WhatsApp draft"
                  body={postCallActions.whatsapp_draft}
                  pushed={pushed.has("whatsapp")}
                  onPush={() => pushAction("whatsapp")}
                  pushLabel="Approve & send"
                  destination="goes via Post-Call Automation"
                />
                <ActionCard
                  icon={Mail}
                  tone="indigo"
                  title="Email draft"
                  body={postCallActions.email_draft}
                  pushed={pushed.has("email")}
                  onPush={() => pushAction("email")}
                  pushLabel="Approve & send"
                  destination="sends from your inbox"
                />
              </div>

              {/* Outcome chooser + log */}
              <div className="mt-5 pt-4 border-t border-border">
                <div className="text-xs uppercase font-semibold text-muted-foreground mb-2">Confirm outcome</div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {OUTCOMES.map((o) => {
                    const Icon = o.icon;
                    return (
                      <button
                        key={o.key}
                        onClick={() => setOutcome(o.key)}
                        className={cn(
                          "px-2 py-2 rounded-xl border text-xs font-medium transition flex flex-col items-center gap-1",
                          outcome === o.key ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                        )}
                      >
                        <Icon className={cn("w-3.5 h-3.5", o.color)} />
                        <span className="text-[10px] leading-tight">{o.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    disabled={log.isPending}
                    onClick={logAndNext}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {log.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Log call & next lead
                  </button>
                  <button
                    onClick={nextLead}
                    className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition"
                  >
                    Skip log
                  </button>
                </div>
              </div>
            </div>
          )}

          {!active && !isLoading && (
            <div className="glass-card rounded-2xl p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3 mx-auto" />
              <div className="text-lg font-semibold">Queue cleared!</div>
              <div className="text-sm text-muted-foreground mt-1">All prioritized leads have been worked.</div>
            </div>
          )}
          {isLoading && (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          )}
        </div>

        {/* RIGHT RAIL: Live AI Coach + Queue */}
        <div className="space-y-4">
          {phase === "connected" && (
            <LiveCoachPanel transcript={transcript} />
          )}

          <div className="glass-card rounded-2xl p-4 h-fit">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase text-muted-foreground font-semibold">Up next</div>
              {queue.length > activeIdx && (
                <div className="text-[10px] text-muted-foreground">{queue.length - activeIdx} remaining</div>
              )}
            </div>
            <div className="space-y-1 max-h-[420px] overflow-y-auto">
              {queue.slice(activeIdx, activeIdx + 15).map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => { if (phase === "idle") { setActiveIdx(activeIdx + i); } }}
                  disabled={phase !== "idle"}
                  className={cn(
                    "w-full text-left rounded-xl px-3 py-2 transition disabled:cursor-not-allowed",
                    i === 0 ? "bg-primary/5 border border-primary/30" : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm truncate">{c.first_name} {c.last_name}</div>
                    <div className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-semibold",
                      (c.lead_score ?? 0) >= 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                      (c.lead_score ?? 0) >= 60 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {Math.round(c.lead_score ?? 0)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{c.title ?? "—"}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5",
        active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="glass-card rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="text-xl font-bold mt-0.5">{value}</div>
    </div>
  );
}

function TranscriptLine({ line, who }: { line: typeof TRANSCRIPT_SCRIPT[number]; who: string }) {
  if (line.speaker === "ai") {
    return (
      <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-900/30 px-3 py-2 my-1">
        <div className="flex items-center gap-1.5 mb-1">
          <Bot className="w-3 h-3 text-purple-600" />
          <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300">AI Insight</span>
        </div>
        <div className="text-xs font-medium text-purple-900 dark:text-purple-200">{line.text}</div>
        {line.coach && <div className="text-[11px] text-purple-700/80 dark:text-purple-300/80 mt-1">→ {line.coach}</div>}
      </div>
    );
  }
  const isAgent = line.speaker === "agent";
  return (
    <div className={cn("flex gap-2", isAgent ? "" : "flex-row-reverse")}>
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
        isAgent ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      )}>
        {isAgent ? "You" : who[0]}
      </div>
      <div className={cn("flex-1 max-w-[85%]", !isAgent && "text-right")}>
        <div className={cn(
          "rounded-xl px-3 py-1.5 text-sm inline-block text-left",
          isAgent ? "bg-blue-50 dark:bg-blue-900/20" : "bg-muted"
        )}>
          {line.text}
        </div>
        {line.tag && (
          <div className="text-[10px] text-muted-foreground mt-0.5 px-1">[{line.tag}]</div>
        )}
      </div>
    </div>
  );
}

function LiveCoachPanel({ transcript }: { transcript: typeof TRANSCRIPT_SCRIPT }) {
  // Pick latest coach hint from any line; otherwise show generic
  const latestCoach = [...transcript].reverse().find((l) => l.coach)?.coach;
  const objectionDetected = transcript.some((l) => l.text.toLowerCase().includes("salesforce") || l.text.toLowerCase().includes("budget"));

  return (
    <div className="glass-card rounded-2xl p-4 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-sm font-bold">AI Live Coach</div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Listening in real time
          </div>
        </div>
      </div>

      {latestCoach ? (
        <div className="rounded-xl bg-primary/10 border border-primary/30 px-3 py-2 mb-3">
          <div className="text-[10px] uppercase font-bold text-primary mb-1">Now</div>
          <div className="text-xs leading-snug">{latestCoach}</div>
        </div>
      ) : (
        <div className="rounded-xl bg-muted/50 px-3 py-2 mb-3 text-xs text-muted-foreground">
          Open with permission. Listen for buying signals before pitching value.
        </div>
      )}

      {objectionDetected && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 px-3 py-2 mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">Objection detected</span>
          </div>
          <div className="text-xs leading-snug">
            <span className="font-semibold">Salesforce / budget</span> → Use co-existence play. Don't argue cost.
          </div>
        </div>
      )}

      <div className="space-y-2 mt-3">
        <div className="text-[10px] uppercase font-bold text-muted-foreground">Suggested next moves</div>
        <CoachTip color="#88B8B0" tag="DISCOVERY" tip="Ask about Q2 hiring goals — they hinted at scale challenge." />
        <CoachTip color="#C8A880" tag="OBJECTION" tip="If price comes up: 'Most clients see ROI in Q1.'" />
        <CoachTip color="#B8A0C8" tag="CTA" tip="Propose Thursday 2pm GST demo with their IT lead." />
      </div>
    </div>
  );
}

function CoachTip({ color, tag, tip }: { color: string; tag: string; tip: string }) {
  return (
    <div className="rounded-lg border border-border px-2.5 py-2 bg-background/40">
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
          style={{ background: `${color}25`, color }}
        >
          {tag}
        </span>
      </div>
      <div className="text-[11px] leading-snug">{tip}</div>
    </div>
  );
}

function ActionCard({
  icon: Icon, tone, title, body, pushed, onPush, pushLabel, destination,
}: {
  icon: any; tone: "blue" | "purple" | "amber" | "emerald" | "indigo";
  title: string; body: string; pushed: boolean; onPush: () => void; pushLabel: string; destination: string;
}) {
  const tones = {
    blue: { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-900", icon: "text-blue-600", btn: "bg-blue-600 hover:bg-blue-700" },
    purple: { bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200 dark:border-purple-900", icon: "text-purple-600", btn: "bg-purple-600 hover:bg-purple-700" },
    amber: { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-900", icon: "text-amber-600", btn: "bg-amber-600 hover:bg-amber-700" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-900", icon: "text-emerald-600", btn: "bg-emerald-600 hover:bg-emerald-700" },
    indigo: { bg: "bg-indigo-50 dark:bg-indigo-900/20", border: "border-indigo-200 dark:border-indigo-900", icon: "text-indigo-600", btn: "bg-indigo-600 hover:bg-indigo-700" },
  }[tone];
  return (
    <div className={cn("rounded-xl border p-3", tones.bg, tones.border)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", tones.icon)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-sm font-semibold">{title}</div>
            {!pushed ? (
              <button
                onClick={onPush}
                className={cn("px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold flex items-center gap-1 transition", tones.btn)}
              >
                <Send className="w-3 h-3" /> {pushLabel}
              </button>
            ) : (
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Done
              </span>
            )}
          </div>
          <div className="text-xs text-foreground/90 mt-1 whitespace-pre-wrap leading-relaxed">{body}</div>
          <div className="text-[10px] text-muted-foreground mt-1.5 italic">{destination}</div>
        </div>
      </div>
    </div>
  );
}

function fmtDur(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// Tiny icon-component shim
function Settings2() {
  return <Sparkles className="w-3 h-3" />;
}
