/**
 * VoiceCallModal — Real AI-powered voice call using browser Speech APIs + OpenAI.
 * SpeechRecognition captures the user's voice, sends each utterance to the AI,
 * SpeechSynthesis speaks the AI response aloud. Full transcript is saved to DB.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, Loader2,
  X, Sparkles, Clock, User, Bot, MessageSquare, Mail,
  CheckCircle2, ChevronRight, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";
import { speakViaServer, pickServerVoice, stopServerSpeak, type ServerVoiceId } from "@/lib/voice";

interface VoiceCallModalProps {
  contact: {
    id: string;
    first_name?: string;
    last_name?: string;
    title?: string;
    company_name?: string;
  };
  onClose: () => void;
  onCallSaved?: (callId: string) => void;
  /** Optional voice ID from the Voice Library — if set, used for AI TTS instead of the language default. */
  serverVoice?: ServerVoiceId;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

type CallState = "idle" | "connecting" | "active" | "listening" | "processing" | "ended";

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function ScoreBar({ score, label, feedback }: { score: number; label: string; feedback: string }) {
  const color = score >= 80 ? "#88B8B0" : score >= 60 ? "#B8B880" : "#C0A0B8";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-bold" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
      </div>
      <p className="text-[10px] text-muted-foreground">{feedback}</p>
    </div>
  );
}

export default function VoiceCallModal({ contact, onClose, onCallSaved, serverVoice }: VoiceCallModalProps) {
  const contactName = `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() || "Prospect";

  const [callState, setCallState] = useState<CallState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [savedCallId, setSavedCallId] = useState<string | null>(null);
  const [scorecard, setScorecard] = useState<any>(null);
  const [loadingScorecard, setLoadingScorecard] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [postCallActions, setPostCallActions] = useState<{ done: string[] }>({ done: [] });
  const [lang, setLang] = useState<"en" | "ar">("en");

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  // Mirror call state to a ref so async TTS callbacks see the latest value
  // (closure capture would otherwise let "speak finished" restart listening
  // after the user already hung up).
  const callStateRef = useRef<CallState>("idle");
  useEffect(() => { callStateRef.current = callState; }, [callState]);
  // Ensure server-side audio stops if the modal unmounts mid-call.
  useEffect(() => () => { stopServerSpeak(); }, []);

  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const speechSupported = Boolean(SpeechRecognitionAPI);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages, currentTranscript]);

  // Duration timer
  useEffect(() => {
    if (callState === "active" || callState === "listening" || callState === "processing") {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState]);

  function speakText(text: string) {
    // Stop any prior browser TTS just in case some other path queued one up.
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    stopServerSpeak();
    if (isMuted) {
      // Skip audio but keep the conversation flowing on the listening side.
      setIsAiSpeaking(false);
      if (callStateRef.current !== "ended") startListening();
      return;
    }
    setIsAiSpeaking(true);
    // Use the voice the user picked in the Voice Library when one is supplied;
    // otherwise fall back to the language default (Layla for AR, Sara for EN).
    const sv: ServerVoiceId = serverVoice
      ?? pickServerVoice({ lang: lang === "ar" ? "ar" : "en", gender: "female" });
    void speakViaServer(text, sv, {
      onEnd: () => {
        setIsAiSpeaking(false);
        // Use the ref so a hang-up that happened during playback prevents
        // accidentally re-opening the mic for an "ended" call.
        if (callStateRef.current !== "ended") startListening();
      },
      onError: () => {
        // speakViaServer will call onEnd again after the fallback finishes —
        // do NOT start listening here, otherwise the mic captures the fallback
        // TTS as if it were the user speaking.
        setIsAiSpeaking(false);
      },
    });
  }

  const getAiResponse = useCallback(async (userMessage: string, history: Message[]) => {
    setCallState("processing");
    try {
      const conversationMsgs = history.map(m => ({ role: m.role, content: m.content }));
      conversationMsgs.push({ role: "user", content: userMessage });
      const { reply } = await apiFetch("/calls/voice-response", {
        method: "POST",
        body: JSON.stringify({
          messages: conversationMsgs,
          contact_name: contactName,
          contact_title: contact.title,
          company_name: contact.company_name,
          language: lang,
        }),
      });
      const aiMsg: Message = { role: "assistant", content: reply, ts: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      setCallState("active");
      speakText(reply);
    } catch {
      const fallback: Message = { role: "assistant", content: "I apologize, could you repeat that?", ts: Date.now() };
      setMessages(prev => [...prev, fallback]);
      setCallState("active");
      speakText(fallback.content);
    }
  }, [contactName, contact.title, contact.company_name, lang]);

  function startListening() {
    if (!speechSupported || isMuted) return;
    // Don't open the mic if the user already hung up (defends against stale
    // TTS callbacks restarting recognition after endCall()).
    if (callStateRef.current === "ended") return;
    const rec = new SpeechRecognitionAPI();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang === "ar" ? "ar-SA" : "en-US";
    rec.onstart = () => { if (callStateRef.current !== "ended") setCallState("listening"); };
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as any).map((r: any) => r[0].transcript).join("");
      setCurrentTranscript(transcript);
      if (e.results[0].isFinal) {
        const finalText = transcript.trim();
        if (finalText && callStateRef.current !== "ended") {
          setCurrentTranscript("");
          const userMsg: Message = { role: "user", content: finalText, ts: Date.now() };
          setMessages(prev => {
            const next = [...prev, userMsg];
            getAiResponse(finalText, next.slice(0, -1));
            return next;
          });
        }
      }
    };
    rec.onend = () => {
      if (callStateRef.current === "listening") setCallState("active");
    };
    rec.onerror = () => {
      if (callStateRef.current !== "ended") setCallState("active");
    };
    recognitionRef.current = rec;
    try { rec.start(); } catch { /* already started or denied */ }
  }

  async function startCall() {
    setCallState("connecting");
    setMessages([]);
    setDuration(0);
    await new Promise(r => setTimeout(r, 800));

    const greeting = lang === "ar"
      ? `السلام عليكم ${contact.first_name ?? ""}، أنا أتصل من NexFlow. كيف حالك اليوم؟`
      : `Hi ${contact.first_name ?? "there"}, this is Sarah from NexFlow. How are you today? I'd love to learn more about your current CRM setup.`;

    const aiMsg: Message = { role: "assistant", content: greeting, ts: Date.now() };
    setMessages([aiMsg]);
    setCallState("active");
    speakText(greeting);
  }

  async function endCall() {
    // Tear down both audio paths so a stale TTS clip can't keep playing or
    // re-trigger the mic via onEnd after hang-up.
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    stopServerSpeak();
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    if (timerRef.current) clearInterval(timerRef.current);
    callStateRef.current = "ended";
    setCallState("ended");
    setIsAiSpeaking(false);

    // Save transcript to DB
    const fullTranscript = messages.map(m => `${m.role === "user" ? "Rep" : "AI Agent"}: ${m.content}`).join("\n\n");
    try {
      const saved = await apiFetch("/calls/log", {
        method: "POST",
        body: JSON.stringify({
          contact_id: contact.id,
          outcome: "completed",
          duration_seconds: duration,
          notes: fullTranscript,
          run_orchestrator: true,
        }),
      });
      if (saved?.call?.id) {
        setSavedCallId(saved.call.id);
        onCallSaved?.(saved.call.id);

        // Generate scorecard
        setLoadingScorecard(true);
        const sc = await apiFetch("/calls/scorecard", {
          method: "POST",
          body: JSON.stringify({
            call_id: saved.call.id,
            transcript: fullTranscript,
            contact_name: contactName,
            outcome: "completed",
          }),
        });
        setScorecard(sc);
        setLoadingScorecard(false);
      }
    } catch {
      setLoadingScorecard(false);
    }
  }

  async function saveNote() {
    if (!noteText.trim() || !savedCallId) return;
    await apiFetch(`/calls/${savedCallId}/note`, {
      method: "POST",
      body: JSON.stringify({ note: noteText, contact_id: contact.id }),
    });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
    setNoteText("");
  }

  async function triggerAction(type: "whatsapp" | "email") {
    if (postCallActions.done.includes(type)) return;
    setPostCallActions(prev => ({ done: [...prev.done, type] }));
    // Create follow-up activity
    const titleMap = { whatsapp: "WhatsApp follow-up sent", email: "Follow-up email drafted" };
    const bodyMap = {
      whatsapp: `Post-call WhatsApp: "Great speaking with you, ${contact.first_name ?? ""}! As discussed, I'll send over the details shortly."`,
      email: `Hi ${contact.first_name ?? ""},\n\nThank you for your time on our call today. As discussed, I've attached the relevant information about NexFlow.\n\nLooking forward to the next step.\n\nBest regards`,
    };
    await apiFetch("/activities", {
      method: "POST",
      body: JSON.stringify({
        type: type === "whatsapp" ? "whatsapp" : "email",
        title: titleMap[type],
        body: bodyMap[type],
        contact_id: contact.id,
        status: "completed",
        completed_at: new Date().toISOString(),
        metadata: { source: "post_call_action", call_id: savedCallId },
      }),
    });
  }

  function toggleMute() {
    setIsMuted(m => {
      if (!m && recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
      return !m;
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="p-5 border-b border-border/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl nf-chameleon-bg flex items-center justify-center text-white text-lg font-black">
              {contactName[0]}
            </div>
            <div>
              <div className="font-bold text-foreground">{contactName}</div>
              <div className="text-xs text-muted-foreground">{contact.title}{contact.company_name ? ` · ${contact.company_name}` : ""}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {callState !== "idle" && callState !== "ended" && (
              <div className="flex items-center gap-1.5 text-sm font-mono text-foreground/70">
                <div className={cn("w-2 h-2 rounded-full", callState === "active" || callState === "listening" ? "bg-[#88B8B0] animate-pulse" : "bg-[#C8A880] animate-pulse")} />
                {formatDuration(duration)}
              </div>
            )}
            {/* Language toggle */}
            {callState === "idle" && (
              <div className="flex gap-1 p-1 rounded-lg bg-muted/40">
                {(["en", "ar"] as const).map(l => (
                  <button key={l} onClick={() => setLang(l)}
                    className={cn("px-2.5 py-1 rounded text-xs font-semibold transition-all", lang === l ? "nf-chameleon-bg text-white" : "text-muted-foreground hover:text-foreground")}>
                    {l === "en" ? "EN" : "AR"}
                  </button>
                ))}
              </div>
            )}
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Body */}
        {callState === "ended" ? (
          /* ── POST-CALL ── */
          <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#88B8B0]" />
              <span className="font-bold text-foreground">Call Complete · {formatDuration(duration)}</span>
            </div>

            {/* Transcript */}
            <div className="glass-card rounded-2xl p-4">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Transcript</div>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {messages.map((m, i) => (
                  <div key={i} className={cn("text-xs p-2 rounded-lg", m.role === "user" ? "bg-[#B8A0C8]/10 text-foreground" : "bg-[#88B8B0]/10 text-foreground")}>
                    <span className={cn("font-bold mr-1.5", m.role === "user" ? "text-[#B8A0C8]" : "text-[#88B8B0]")}>
                      {m.role === "user" ? "You" : "AI Agent"}:
                    </span>
                    {m.content}
                  </div>
                ))}
              </div>
            </div>

            {/* Scorecard */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-[#C8A880]" />
                <span className="text-sm font-bold text-foreground">AI Call Scorecard</span>
              </div>
              {loadingScorecard ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analysing call…
                </div>
              ) : scorecard ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall</span>
                    <span className="text-2xl font-black" style={{ color: scorecard.overall >= 80 ? "#88B8B0" : scorecard.overall >= 60 ? "#B8B880" : "#C0A0B8" }}>
                      {scorecard.overall}<span className="text-sm font-normal text-muted-foreground">/100</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    {scorecard.dimensions?.map((d: any) => (
                      <ScoreBar key={d.name} score={d.score} label={`${d.icon} ${d.name}`} feedback={d.feedback} />
                    ))}
                  </div>
                  {scorecard.next_best_action && (
                    <div className="mt-2 p-2.5 rounded-xl bg-[#B8A0C8]/10 border border-[#B8A0C8]/20">
                      <div className="text-[10px] font-bold text-[#B8A0C8] uppercase tracking-wider mb-0.5">Recommended next action</div>
                      <div className="text-xs text-foreground">{scorecard.next_best_action}</div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Scorecard unavailable.</p>
              )}
            </div>

            {/* Post-call actions */}
            <div className="glass-card rounded-2xl p-4">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Post-Call Actions</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: "whatsapp" as const, icon: MessageSquare, label: "Send WhatsApp", color: "#B8B880" },
                  { type: "email" as const,     icon: Mail,          label: "Draft Follow-up Email", color: "#B8A0C8" },
                ].map(action => {
                  const done = postCallActions.done.includes(action.type);
                  return (
                    <button key={action.type} onClick={() => triggerAction(action.type)}
                      className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border",
                        done
                          ? "bg-[#88B8B0]/15 text-[#88B8B0] border-[#88B8B0]/30"
                          : "bg-muted/40 text-foreground border-border/30 hover:border-border/60"
                      )}>
                      {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <action.icon className="w-3.5 h-3.5" style={{ color: action.color }} />}
                      {done ? "Sent ✓" : action.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add note */}
            <div className="glass-card rounded-2xl p-4">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Push Note to Lead Profile</div>
              <div className="flex gap-2">
                <input
                  value={noteText} onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a note about this call…"
                  className="flex-1 px-3 py-2 rounded-xl bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/40"
                />
                <button onClick={saveNote} disabled={!noteText.trim() || !savedCallId}
                  className={cn("px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                    noteSaved ? "bg-[#88B8B0] text-white" : "nf-chameleon-bg text-white disabled:opacity-40")}>
                  {noteSaved ? "Saved ✓" : "Save"}
                </button>
              </div>
            </div>

            <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-semibold bg-muted/40 text-muted-foreground hover:text-foreground transition-colors">
              Close
            </button>
          </div>
        ) : (
          /* ── ACTIVE CALL ── */
          <div className="p-5 space-y-4">
            {/* Status banner */}
            {callState === "idle" && (
              <div className="rounded-2xl p-4 bg-muted/30 text-center space-y-1">
                <Bot className="w-8 h-8 text-[#B8A0C8] mx-auto" />
                <p className="text-sm font-semibold text-foreground">AI Voice Agent ready</p>
                <p className="text-xs text-muted-foreground">
                  {speechSupported
                    ? `Your microphone will capture your voice in ${lang === "ar" ? "Arabic" : "English"}. The AI agent will speak responses aloud.`
                    : "Your browser doesn't support voice recognition. The AI will still respond — type your messages instead."}
                </p>
              </div>
            )}

            {callState === "connecting" && (
              <div className="rounded-2xl p-6 bg-muted/30 text-center space-y-3">
                <div className="w-16 h-16 rounded-full nf-chameleon-bg mx-auto flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                </div>
                <p className="text-sm font-semibold text-foreground">Connecting AI agent…</p>
              </div>
            )}

            {(callState === "active" || callState === "listening" || callState === "processing") && (
              <>
                {/* Waveform / status */}
                <div className="flex items-center justify-center gap-3 py-2">
                  {isAiSpeaking ? (
                    <div className="flex items-center gap-1.5">
                      {[4, 7, 5, 8, 3, 6, 4].map((h, i) => (
                        <div key={i} className="w-1 rounded-full bg-[#B8A0C8] animate-pulse" style={{ height: `${h * 3}px`, animationDelay: `${i * 80}ms` }} />
                      ))}
                      <span className="ml-2 text-xs text-[#B8A0C8] font-medium">AI speaking…</span>
                    </div>
                  ) : callState === "listening" ? (
                    <div className="flex items-center gap-1.5">
                      {[3, 6, 4, 8, 3, 7, 5].map((h, i) => (
                        <div key={i} className="w-1 rounded-full bg-[#88B8B0] animate-pulse" style={{ height: `${h * 3}px`, animationDelay: `${i * 70}ms` }} />
                      ))}
                      <span className="ml-2 text-xs text-[#88B8B0] font-medium">Listening…</span>
                    </div>
                  ) : callState === "processing" ? (
                    <div className="flex items-center gap-2 text-xs text-[#C8A880]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing…
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">{isMuted ? "Microphone muted" : "Tap mic to speak"}</div>
                  )}
                </div>

                {/* Transcript */}
                <div ref={transcriptRef} className="bg-muted/20 rounded-2xl p-4 h-48 overflow-y-auto space-y-2">
                  {messages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-8">Call transcript will appear here…</p>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[80%] text-xs px-3 py-2 rounded-2xl",
                        m.role === "user"
                          ? "bg-[#B8A0C8]/20 text-foreground rounded-br-sm"
                          : "bg-[#88B8B0]/15 text-foreground rounded-bl-sm"
                      )}>
                        <span className={cn("text-[9px] font-bold uppercase tracking-wider block mb-0.5",
                          m.role === "user" ? "text-[#B8A0C8]" : "text-[#88B8B0]")}>
                          {m.role === "user" ? "You" : "AI Agent"}
                        </span>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {currentTranscript && (
                    <div className="flex justify-end">
                      <div className="max-w-[80%] text-xs px-3 py-2 rounded-2xl bg-[#B8A0C8]/10 text-muted-foreground rounded-br-sm italic">
                        {currentTranscript}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 pt-1">
              {callState === "idle" ? (
                <button
                  onClick={startCall}
                  className="flex items-center gap-2 px-8 py-3 rounded-full nf-chameleon-bg text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg"
                >
                  <Phone className="w-5 h-5" />
                  Start AI Call
                </button>
              ) : (
                <>
                  <button
                    onClick={toggleMute}
                    className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all border",
                      isMuted ? "bg-destructive/15 border-destructive/30 text-destructive" : "bg-muted/40 border-border/30 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  {!isMuted && callState === "active" && speechSupported && (
                    <button
                      onClick={startListening}
                      disabled={isAiSpeaking}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B8A0C8]/20 text-[#B8A0C8] border border-[#B8A0C8]/30 text-xs font-semibold hover:bg-[#B8A0C8]/30 transition-all disabled:opacity-40"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      Speak
                    </button>
                  )}
                  <button
                    onClick={endCall}
                    className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center transition-all hover:bg-destructive/90 shadow-lg"
                  >
                    <PhoneOff className="w-6 h-6 text-white" />
                  </button>
                  <button className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all border",
                    "bg-muted/40 border-border/30 text-muted-foreground hover:text-foreground")}>
                    <Volume2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
