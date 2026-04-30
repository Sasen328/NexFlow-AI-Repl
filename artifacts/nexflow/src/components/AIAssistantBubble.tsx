/**
 * Global floating AI Assistant bubble.
 *
 * • Draggable to anywhere on screen, position persisted in localStorage.
 * • Click to expand into a chat panel anchored to the bubble.
 * • Voice (mic) toggle uses Web Speech API for live transcription.
 * • Speaker toggle reads AI replies aloud via speech synthesis.
 * • Configurable "Action GPTs" — a settings drawer lets the user toggle
 *   which actions are available; the assistant routes natural-language
 *   requests to enabled actions.
 *
 * The bubble is mounted globally inside <AppLayout> so it follows the
 * user across every CRM page. It reads the current persona on mount and
 * subscribes to nf:role-change so its tone stays in sync with the avatar
 * menu.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Mic, MicOff, X, Volume2, VolumeX, Send, Bot,
  ListTodo, Target, Phone, Mail, Calendar, Search,
  Settings as SettingsIcon, AlertTriangle,
  Zap, type LucideIcon,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  getRole, isSignedIn,
} from "@/lib/marketing-auth";
import {
  createRecognizer, speak, stopSpeaking,
  isSpeechRecognitionSupported, isSpeechSynthesisSupported,
  type RecognizerHandle,
} from "@/lib/voice";
import { cn } from "@/lib/utils";

// ─── Storage keys ────────────────────────────────────────────────────
const STORAGE_POS = "nf:assistant:pos";
const STORAGE_TTS = "nf:assistant:tts";
const STORAGE_ACTIONS = "nf:assistant:actions";

// ─── Types ───────────────────────────────────────────────────────────
type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
  ts: number;
  matchedAction?: string;
};

type ActionContext = {
  navigate: (path: string) => void;
  role: ReturnType<typeof getRole>;
};

type ActionDef = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  triggers: RegExp;
  run: (query: string, ctx: ActionContext) => string;
};

// ─── Action GPTs (configurable) ──────────────────────────────────────
const ACTIONS: ActionDef[] = [
  {
    id: "find-contact",
    label: "Find a contact",
    description: "Searches your CRM for a person or company.",
    icon: Search,
    color: "#88B8B0",
    triggers: /\b(find|search|look ?up|show me)\b.*\b(contact|lead|person|company)\b/i,
    run: (_q, { navigate }) => {
      navigate("/contacts");
      return "Opening Contacts so you can search by name, company, or filter chip.";
    },
  },
  {
    id: "draft-email",
    label: "Draft email",
    description: "Drafts a follow-up email tailored to the recipient.",
    icon: Mail,
    color: "#B8A0C8",
    triggers: /\b(draft|write|compose|send)\b.*\b(email|message|note)\b/i,
    run: () =>
      "Drafted a follow-up email based on your last conversation. Review and send it from the Messages page when you're ready.",
  },
  {
    id: "schedule-call",
    label: "Schedule call",
    description: "Books a tentative slot on your calendar.",
    icon: Calendar,
    color: "#C8A880",
    triggers: /\b(schedule|book|set up|arrange)\b.*\b(call|meeting|demo|chat)\b/i,
    run: () =>
      "I've added a tentative slot to your calendar — you'll see it on your Today's Schedule. Confirm or reschedule from there.",
  },
  {
    id: "pipeline-summary",
    label: "Pipeline summary",
    description: "Quick state-of-the-pipeline read for your role.",
    icon: Target,
    color: "#90B8B8",
    triggers: /\b(pipeline|forecast|deals?|revenue|coverage|quota)\b/i,
    run: (_q, { role }) => {
      switch (role.key) {
        case "manager":
          return "Team forecast is $4.8M — 94% covered. Two reps need coaching, one is crushing it. Five deals are flagged at risk; rescue plans attached.";
        case "ceo":
          return "QTD revenue $2.31M, +18% YoY. Pipeline coverage 3.2× against next-quarter target. One strategic deal stalled — Aramco Digital, owner expects your call.";
        case "marketing":
          return "Three campaigns live across LinkedIn, X, Email and WhatsApp — combined reach 41.3K in 7 days. 612 MQLs this week, +22% WoW.";
        case "admin":
          return "Pipeline data is healthy. 14 duplicate contacts to merge, one automation firing too often. PDPL audit log clean.";
        default:
          return "You're at 47% of monthly quota with three high-intent prospects ready today. Combined open pipeline ${role.title}.";
      }
    },
  },
  {
    id: "todays-tasks",
    label: "Today's tasks",
    description: "What you should focus on right now.",
    icon: ListTodo,
    color: "#C0A0B8",
    triggers: /\b(task|todo|priorit|focus|what should i do|first)\b/i,
    run: (_q, { navigate }) => {
      navigate("/home");
      return "Three urgent tasks today. Top priority: follow up with Sara Al-Mansouri before noon — she's on a fresh funding signal. Check the Tasks tab on Home for the rest.";
    },
  },
  {
    id: "start-call",
    label: "Start a call",
    description: "Opens the dialer.",
    icon: Phone,
    color: "#88B8B0",
    triggers: /\b(start|make|place)\b.*\b(call|dial|ring)\b/i,
    run: (_q, { navigate }) => {
      navigate("/calls");
      return "Opening the call dialer. Your call list is sorted by AI-suggested priority.";
    },
  },
  {
    id: "at-risk",
    label: "At-risk deals",
    description: "Lists deals trending the wrong way.",
    icon: AlertTriangle,
    color: "#C0A0B8",
    triggers: /\b(at risk|risk|stalled|silent|losing|drop)\b/i,
    run: () =>
      "Two deals are at risk: Layla Hassan (SMB Starter, $95K) — score dropped from 72 to 65; and Khalid Al-Hamdan (Pilot Expansion, $145K) — silent for 14 days. Want me to draft re-engagement messages?",
  },
  {
    id: "hot-signals",
    label: "Hot signals",
    description: "Recent buying signals from your accounts.",
    icon: Zap,
    color: "#B8B880",
    triggers: /\b(signal|news|update|hot|trending|funding|hiring)\b/i,
    run: () =>
      "Three signals in the last 24 hours: Gulf Ventures closed $50M Series B, Ahmed Al-Rashidi promoted to CIO, Aramco Digital approved Q2 budget. The first one is highest impact — call Sara within 24 hours.",
  },
];

const DEFAULT_ENABLED = ACTIONS.map((a) => a.id);

// ─── Utility helpers ─────────────────────────────────────────────────
function loadEnabledActions(): Set<string> {
  if (typeof window === "undefined") return new Set(DEFAULT_ENABLED);
  try {
    const raw = window.localStorage.getItem(STORAGE_ACTIONS);
    if (!raw) return new Set(DEFAULT_ENABLED);
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed.length ? parsed : DEFAULT_ENABLED);
  } catch {
    return new Set(DEFAULT_ENABLED);
  }
}

function loadPosition(): { x: number; y: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_POS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === "number" && typeof parsed?.y === "number") return parsed;
  } catch {
    // ignore
  }
  return null;
}

function loadTTS(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_TTS) === "1";
}

function generateResponse(
  query: string,
  enabled: Set<string>,
  ctx: ActionContext,
): { text: string; matchedAction?: string } {
  const trimmed = query.trim();
  if (!trimmed) {
    return { text: "I'm listening — what would you like to do?" };
  }
  for (const action of ACTIONS) {
    if (!enabled.has(action.id)) continue;
    if (action.triggers.test(trimmed)) {
      return { text: action.run(trimmed, ctx), matchedAction: action.id };
    }
  }
  // Generic fallback that stays on-brand
  const role = ctx.role;
  return {
    text: `Got it. As your ${role.title.toLowerCase()}, I'd suggest reviewing your top three priorities first — say "what should I do today" and I'll walk you through them, or pick an action below.`,
  };
}

function greetingFor(role: ReturnType<typeof getRole>): string {
  return `Hi ${role.name.split(" ")[0]}, I'm your NexFlow assistant. Tap the mic to talk, type a question, or pick an action below.`;
}

// ─── Component ───────────────────────────────────────────────────────
export function AIAssistantBubble() {
  const [signed, setSigned] = useState<boolean>(() => isSignedIn());
  const [role, setRole] = useState(() => getRole());

  // Re-evaluate auth + persona on storage / role-change events
  useEffect(() => {
    const refresh = () => {
      setSigned(isSignedIn());
      setRole(getRole());
    };
    window.addEventListener("nf:role-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("nf:role-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!signed) return null;
  return <BubbleInner role={role} key={role.key} />;
}

// Inner component takes a fixed persona snapshot — keying by role.key resets
// state cleanly on persona switch (greeting + transcript).
function BubbleInner({ role }: { role: ReturnType<typeof getRole> }) {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(loadPosition);
  const [enabled, setEnabled] = useState<Set<string>>(loadEnabledActions);
  const [ttsOn, setTtsOn] = useState<boolean>(loadTTS);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: "g0", role: "ai", text: greetingFor(role), ts: Date.now() },
  ]);
  const [input, setInput] = useState("");

  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognizerRef = useRef<RecognizerHandle | null>(null);

  // Pre-warm voices list — some browsers populate it lazily after the first call.
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const constraintsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, interim]);

  // Persist toggles
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_ACTIONS, JSON.stringify([...enabled]));
    } catch {/* ignore */}
  }, [enabled]);
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_TTS, ttsOn ? "1" : "0");
    } catch {/* ignore */}
  }, [ttsOn]);

  // Cleanup on unmount
  useEffect(() => () => {
    recognizerRef.current?.stop();
    stopSpeaking();
  }, []);

  // Default position — bottom-right with a 24px margin
  const defaultPos = useMemo(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    return { x: window.innerWidth - 80, y: window.innerHeight - 96 };
  }, []);
  const startPos = position ?? defaultPos;

  const submit = useCallback(
    (textRaw: string) => {
      const text = textRaw.trim();
      if (!text) return;
      const userMsg: ChatMessage = {
        id: `u${Date.now()}`,
        role: "user",
        text,
        ts: Date.now(),
      };
      const reply = generateResponse(text, enabled, { navigate, role });
      const aiMsg: ChatMessage = {
        id: `a${Date.now() + 1}`,
        role: "ai",
        text: reply.text,
        ts: Date.now() + 1,
        matchedAction: reply.matchedAction,
      };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      setInterim("");
      // Stagger the reply slightly for a "thinking" feel
      setTimeout(() => {
        setMessages((m) => [...m, aiMsg]);
        if (ttsOn) speak(reply.text);
      }, 350);
    },
    [enabled, navigate, role, ttsOn],
  );

  // Toggle voice listening
  const toggleListening = useCallback(() => {
    if (listening) {
      recognizerRef.current?.stop();
      setListening(false);
      // Auto-submit whatever was captured
      const captured = interim.trim();
      if (captured) submit(captured);
      return;
    }
    if (!isSpeechRecognitionSupported()) {
      setVoiceError("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    stopSpeaking();
    setVoiceError(null);
    const rec = createRecognizer({
      onUpdate: ({ interim: i, final }) => {
        if (final) {
          setInterim("");
          submit(final);
        } else {
          setInterim(i);
        }
      },
      onEnd: () => setListening(false),
      onError: (msg) => {
        setListening(false);
        if (msg === "not-allowed" || msg === "service-not-allowed") {
          setVoiceError("Microphone access blocked. Allow mic permission and try again.");
        } else if (msg === "no-speech") {
          setVoiceError("No speech detected — try again and speak a bit louder.");
        } else if (msg !== "aborted") {
          setVoiceError(`Voice input failed (${msg}). Try again.`);
        }
      },
    });
    recognizerRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, interim, submit]);

  // ─── Native pointer-event drag (replaces framer-motion `drag`) ───
  // Why: framer-motion's drag introduced visible jank on rapid pointer
  // moves (snap-back animations conflicting with pointer deltas) and
  // didn't snap to the screen edge after release. We use raw pointer
  // events with a manual delta + a snap-to-nearest-edge on release. The
  // bubble is positioned via `transform: translate3d()` for buttery 60fps.
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    moved: boolean;
  } | null>(null);

  function clamp(x: number, y: number) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      x: Math.max(8, Math.min(w - 64, x)),
      y: Math.max(8, Math.min(h - 64, y)),
    };
  }

  function persistPosition(p: { x: number; y: number }) {
    setPosition(p);
    try { window.localStorage.setItem(STORAGE_POS, JSON.stringify(p)); } catch {/* ignore */}
  }

  // Re-clamp on viewport resize so the bubble can never get stuck off-screen.
  useEffect(() => {
    function onResize() {
      const cur = position ?? defaultPos;
      const c = clamp(cur.x, cur.y);
      if (c.x !== cur.x || c.y !== cur.y) persistPosition(c);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const base = position ?? defaultPos;
    dragStateRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      baseX: base.x,
      baseY: base.y,
      moved: false,
    };
    draggingRef.current = false;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const ds = dragStateRef.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    if (!ds.moved && Math.abs(dx) + Math.abs(dy) < 6) return; // 6px dead-zone — preserve clicks
    ds.moved = true;
    draggingRef.current = true;
    const next = clamp(ds.baseX + dx, ds.baseY + dy);
    setPosition(next);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const ds = dragStateRef.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    dragStateRef.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    if (!ds.moved) {
      // Plain click — clear drag flag so the button onClick fires.
      draggingRef.current = false;
      return;
    }
    // Snap to nearest horizontal edge with a 16px inset.
    const cur = position ?? defaultPos;
    const w = window.innerWidth;
    const snapLeft = cur.x + 28 < w / 2;
    const snapped = clamp(snapLeft ? 16 : w - 72, cur.y);
    persistPosition(snapped);
    // Suppress the synthetic click that follows pointer-up after a drag.
    setTimeout(() => { draggingRef.current = false; }, 80);
  }

  function handlePointerCancel(e: React.PointerEvent<HTMLDivElement>) {
    const ds = dragStateRef.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    dragStateRef.current = null;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    draggingRef.current = false;
  }

  function runAction(action: ActionDef) {
    submit(action.label);
  }

  function toggleAction(id: string) {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Decide whether the panel opens up-left or up-right based on bubble position
  const panelOnLeft = startPos.x > (typeof window !== "undefined" ? window.innerWidth / 2 : 600);

  const sttSupported = isSpeechRecognitionSupported();
  const ttsSupported = isSpeechSynthesisSupported();

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-40">
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className="absolute pointer-events-auto cursor-grab active:cursor-grabbing select-none"
        style={{
          width: 56,
          height: 56,
          touchAction: "none",
          transform: `translate3d(${startPos.x}px, ${startPos.y}px, 0)`,
          transition: dragStateRef.current ? "none" : "transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          willChange: "transform",
        }}
      >
        {/* Bubble */}
        <button
          type="button"
          onClick={(e) => {
            // If user just dragged, swallow the synthetic click.
            if (draggingRef.current) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            setOpen((o) => !o);
          }}
          aria-label={open ? "Close AI Assistant" : "Open AI Assistant"}
          className={cn(
            "relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl",
            "border border-white/40 backdrop-blur-md select-none",
            "transition-transform hover:scale-105 active:scale-95",
          )}
          style={{
            background:
              "conic-gradient(from 220deg, #B8A0C8, #88B8B0, #C8A880, #B8B880, #B8A0C8)",
            // Let the parent motion.div handle pointer drag — but clicks still fire.
            pointerEvents: "auto",
          }}
        >
          {/* Pulse ring (idle / listening) */}
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={
              listening
                ? { scale: [1, 1.5, 1], opacity: [0.45, 0, 0.45] }
                : { scale: [1, 1.18, 1], opacity: [0.25, 0, 0.25] }
            }
            transition={{ duration: listening ? 1.1 : 2.6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                listening
                  ? "radial-gradient(circle, rgba(184,160,200,0.55), transparent 70%)"
                  : "radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%)",
            }}
          />
          {/* Inner glass */}
          <span
            className="absolute inset-1 rounded-full backdrop-blur-sm pointer-events-none"
            style={{ background: "rgba(255,255,255,0.18)" }}
          />
          {/* Icon */}
          <span className="relative z-10 text-white drop-shadow pointer-events-none">
            {listening ? <Mic className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </span>
        </button>

        {/* Expanded panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className={cn(
                "absolute bg-background border border-border/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden",
                panelOnLeft ? "right-16" : "left-16",
              )}
              style={{
                width: 380,
                height: 560,
                maxHeight: "min(560px, calc(100vh - 32px))",
                top: startPos.y > 200 ? "auto" : 0,
                bottom: startPos.y > 200 ? 0 : "auto",
              }}
              role="dialog"
              aria-modal="false"
              aria-label="NexFlow AI Assistant"
            >
              {/* Header */}
              <div
                className="px-3 py-2.5 flex items-center justify-between border-b border-border/30"
                style={{ background: "linear-gradient(135deg,#B8A0C815,#88B8B015,#C8A88015)" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                       style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}>
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black truncate">NexFlow AI</div>
                    <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#88B8B0] animate-pulse" />
                      {listening ? "Listening…" : `Ready · ${role.label}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowSettings((s) => !s)}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      showSettings ? "bg-[#B8A0C8]/20 text-[#B8A0C8]" : "hover:bg-muted/40 text-muted-foreground",
                    )}
                    aria-label="Action settings"
                    title="Action GPTs"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground"
                    aria-label="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Body — chat or settings */}
              {showSettings ? (
                <SettingsPanel enabled={enabled} onToggle={toggleAction} ttsOn={ttsOn} setTtsOn={setTtsOn} ttsSupported={ttsSupported} sttSupported={sttSupported} />
              ) : (
                <>
                  {/* Transcript */}
                  <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
                    {messages.map((m) => (
                      <ChatBubble key={m.id} m={m} />
                    ))}
                    {interim && (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl px-3 py-2 text-xs italic text-muted-foreground border border-dashed border-[#B8A0C8]/40 bg-[#B8A0C8]/5">
                          {interim}…
                        </div>
                      </div>
                    )}
                    {voiceError && (
                      <div className="flex justify-center">
                        <div className="max-w-[90%] rounded-xl px-3 py-2 text-[11px] text-[#C0A0B8] border border-[#C0A0B8]/40 bg-[#C0A0B8]/10 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                          <span className="flex-1">{voiceError}</span>
                          <button
                            type="button"
                            onClick={() => setVoiceError(null)}
                            className="text-[10px] underline hover:no-underline flex-shrink-0"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action chips */}
                  <div className="px-3 pt-1 pb-2 border-t border-border/30">
                    <div className="flex gap-1.5 overflow-x-auto pb-1.5 -mx-1 px-1 scrollbar-thin">
                      {ACTIONS.filter((a) => enabled.has(a.id)).map((a) => {
                        const Icon = a.icon;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => runAction(a)}
                            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors hover:shadow-sm"
                            style={{
                              borderColor: `${a.color}55`,
                              color: a.color,
                              background: `${a.color}10`,
                            }}
                          >
                            <Icon className="w-3 h-3" />
                            {a.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Input row */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button
                        type="button"
                        onClick={toggleListening}
                        title={!sttSupported ? "Speech recognition not supported in this browser — click for details" : listening ? "Stop listening" : "Start listening"}
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                          !sttSupported && "opacity-60",
                          listening
                            ? "bg-[#C0A0B8] text-white shadow-md"
                            : "bg-muted/40 text-foreground hover:bg-muted/60",
                        )}
                        aria-label={listening ? "Stop listening" : "Start listening"}
                        aria-pressed={listening}
                      >
                        {listening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!ttsSupported) return;
                          if (ttsOn) stopSpeaking();
                          setTtsOn((v) => !v);
                        }}
                        disabled={!ttsSupported}
                        title={!ttsSupported ? "Speech synthesis not supported" : ttsOn ? "Mute voice replies" : "Speak replies aloud"}
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                          !ttsSupported && "opacity-40 cursor-not-allowed",
                          ttsOn ? "bg-[#88B8B0] text-white" : "bg-muted/40 text-foreground hover:bg-muted/60",
                        )}
                        aria-label={ttsOn ? "Mute voice replies" : "Enable voice replies"}
                        aria-pressed={ttsOn}
                      >
                        {ttsOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </button>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            submit(input);
                          }
                        }}
                        placeholder="Ask anything…"
                        className="flex-1 px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-xs outline-none focus:border-[#B8A0C8]"
                        aria-label="Message"
                      />
                      <button
                        type="button"
                        onClick={() => submit(input)}
                        disabled={!input.trim()}
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}
                        aria-label="Send"
                      >
                        <Send className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ChatBubble({ m }: { m: ChatMessage }) {
  const isUser = m.role === "user";
  const action = m.matchedAction ? ACTIONS.find((a) => a.id === m.matchedAction) : undefined;
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-1.5"
             style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}>
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      )}
      <div className={cn(
        "max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
        isUser
          ? "rounded-br-sm text-white"
          : "rounded-bl-sm bg-muted/40 text-foreground",
      )} style={isUser ? { background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" } : undefined}>
        {m.text}
        {action && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] opacity-80">
            <action.icon className="w-2.5 h-2.5" />
            <span>via {action.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsPanel({
  enabled, onToggle, ttsOn, setTtsOn, ttsSupported, sttSupported,
}: {
  enabled: Set<string>;
  onToggle: (id: string) => void;
  ttsOn: boolean;
  setTtsOn: (v: boolean) => void;
  ttsSupported: boolean;
  sttSupported: boolean;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Voice</div>
        <div className="space-y-1">
          <SettingRow
            label="Voice input"
            sub={sttSupported ? "Web Speech API" : "Not supported in this browser"}
            on={sttSupported}
            disabled={true}
          />
          <SettingRow
            label="Speak replies aloud"
            sub={ttsSupported ? "Synthesised in your browser" : "Not supported in this browser"}
            on={ttsOn}
            disabled={!ttsSupported}
            onToggle={() => setTtsOn(!ttsOn)}
          />
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1.5">Action GPTs</div>
        <p className="text-[10px] text-muted-foreground mb-2 leading-snug">
          Pick which actions the assistant can route requests to. Disabled actions are hidden from the chip rail and won't fire.
        </p>
        <div className="space-y-1">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            const on = enabled.has(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onToggle(a.id)}
                className="w-full flex items-center gap-2 p-2 rounded-xl border border-border/30 hover:bg-muted/30 transition-colors text-left"
                aria-pressed={on}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                     style={{ background: `${a.color}20`, color: a.color }}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{a.label}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{a.description}</div>
                </div>
                <div className={cn(
                  "w-9 h-5 rounded-full p-0.5 transition-colors flex-shrink-0",
                  on ? "bg-[#88B8B0]" : "bg-muted/60",
                )}>
                  <div className={cn(
                    "w-4 h-4 rounded-full bg-white shadow transition-transform",
                    on ? "translate-x-4" : "translate-x-0",
                  )} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  label, sub, on, disabled, onToggle,
}: { label: string; sub: string; on: boolean; disabled?: boolean; onToggle?: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled || !onToggle}
      className="w-full flex items-center gap-2 p-2 rounded-xl border border-border/30 hover:bg-muted/30 transition-colors text-left disabled:opacity-60 disabled:cursor-default"
      aria-pressed={on}
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground">{sub}</div>
      </div>
      <div className={cn(
        "w-9 h-5 rounded-full p-0.5 transition-colors flex-shrink-0",
        on ? "bg-[#88B8B0]" : "bg-muted/60",
      )}>
        <div className={cn(
          "w-4 h-4 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-4" : "translate-x-0",
        )} />
      </div>
    </button>
  );
}
