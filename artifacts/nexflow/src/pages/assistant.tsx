/**
 * NexFlow AI Assistant
 *   • Chat: POST /api/assistant/chat → Gemini 2.0 Flash (direct, no proxy)
 *   • TTS:  POST /api/assistant/tts  → Gemini TTS (Aoede/Orus/Leda/Charon/Kore)
 *           WAV blob played via HTMLAudioElement — full Gulf Arabic accent support
 *   • All settings (tone, mode, focus, language, accent, voice) sent on every turn
 */

import { useState, useRef, useEffect } from "react";
import {
  Brain, Send, Volume2, VolumeX, Copy, RefreshCw, Sparkles, User, Loader2,
  ChevronDown, Database, CheckCircle2, Settings2, Globe, Mic, X, Play, Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
  provider?: string;
  data_used?: string[];
  actions?: { kind: string; label: string; path?: string }[];
}

// ─── Voices — map to /api/assistant/tts voice_id values ─────────────────────
const VOICES = [
  { id: "layla",  label: "Layla",  sub: "Gulf Arabic Female",   lang: "AR", gender: "female", flag: "🇦🇪" },
  { id: "faisal", label: "Faisal", sub: "Gulf Arabic Male",     lang: "AR", gender: "male",   flag: "🇸🇦" },
  { id: "noor",   label: "Noor",   sub: "Bilingual AR / EN",    lang: "AR", gender: "female", flag: "🌐"  },
  { id: "sara",   label: "Sara",   sub: "English Female",       lang: "EN", gender: "female", flag: "🇬🇧" },
  { id: "adam",   label: "Adam",   sub: "English Male",         lang: "EN", gender: "male",   flag: "🇺🇸" },
] as const;
type VoiceId = typeof VOICES[number]["id"];

// ─── Tone / Language / Mode ──────────────────────────────────────────────────
const TONES = [
  { id: "conversational", label: "Conversational" },
  { id: "concise",        label: "Concise" },
  { id: "formal",         label: "Formal" },
  { id: "coach",          label: "Coach" },
] as const;

const LANGUAGES = [
  { id: "auto", label: "Auto (mirror input)" },
  { id: "ar",   label: "Arabic only" },
  { id: "en",   label: "English only" },
] as const;

const ACCENTS = [
  { id: "uae",     label: "UAE / Khaleeji" },
  { id: "saudi",   label: "Saudi Najdi" },
  { id: "default", label: "Neutral Gulf MSA" },
] as const;

const MODES = [
  { id: "chat",     label: "Chat",     sub: "Conversational back-and-forth" },
  { id: "analysis", label: "Analysis", sub: "Structured insights + actions" },
  { id: "research", label: "Research", sub: "Live web grounding" },
] as const;

const SUGGESTIONS = [
  "Give me today's pipeline briefing with real numbers",
  "Who are my top 3 hot contacts to call right now?",
  "Which deals are at risk of stalling?",
  "Write a Khaleeji WhatsApp follow-up to my hottest lead",
  "Summarize recent activity and what I should act on",
  "What buying signals should I prioritize this week?",
];

// ─── Gemini TTS playback ─────────────────────────────────────────────────────
let _currentAudio: HTMLAudioElement | null = null;

async function speakGemini(text: string, voiceId: VoiceId): Promise<void> {
  // Stop any ongoing playback
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
  // Strip out markdown / JSON fences — only read the clean text
  const clean = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*`_~]/g, "")
    .slice(0, 800); // Keep TTS snappy — truncate long answers
  if (!clean.trim()) return;

  try {
    const res = await fetch("/api/assistant/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: clean, voice_id: voiceId }),
    });
    if (!res.ok) return; // Silently skip if TTS fails — never block chat
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    _currentAudio = new Audio(url);
    _currentAudio.onended = () => URL.revokeObjectURL(url);
    _currentAudio.play();
  } catch { /* TTS failure is non-fatal */ }
}

function stopAudio() {
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "init", role: "assistant",
    text: "Hello — I'm your NexFlow AI copilot. I have live access to your pipeline, contacts, deals, signals and activity feed. Ask me anything.\n\nاهلاً — تقدر تكتبلي بالعربي وأنا أرد بلهجة خليجية.",
    time: "Now",
  }]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [copied, setCopied]       = useState<string | null>(null);
  const [ttsLoading, setTtsLoad]  = useState(false);
  const [playing, setPlaying]     = useState(false);

  // Settings
  const [voiceId, setVoiceId]     = useState<VoiceId>("layla");
  const [voiceOn, setVoiceOn]     = useState(true);
  const [tone, setTone]           = useState<typeof TONES[number]["id"]>("conversational");
  const [language, setLanguage]   = useState<typeof LANGUAGES[number]["id"]>("auto");
  const [accent, setAccent]       = useState<typeof ACCENTS[number]["id"]>("uae");
  const [mode, setMode]           = useState<typeof MODES[number]["id"]>("chat");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentVoice = VOICES.find(v => v.id === voiceId) ?? VOICES[0];

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const history = messages
      .filter(m => m.id !== "init")
      .map(m => ({ role: m.role as "user" | "assistant", text: m.text }));

    setMessages(prev => [...prev, { id: `u${Date.now()}`, role: "user", text: msg, time: "Now" }]);
    setInput("");
    setLoading(true);

    try {
      const res: any = await apiFetch("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({
          message: msg,
          provider: "auto",
          tone,
          mode,
          focus: "general",
          language,
          accent,
          agent_name: "NexFlow AI",
          history,
        }),
      });

      const reply: Message = {
        id: `a${Date.now()}`,
        role: "assistant",
        text: res.reply ?? "(no response)",
        time: "Now",
        provider: res.provider_used,
        data_used: res.data_used,
        actions: res.actions ?? [],
      };
      setMessages(prev => [...prev, reply]);

      // Speak the reply with real Gemini TTS
      if (voiceOn && res.reply) {
        setTtsLoad(true);
        setPlaying(true);
        try {
          await speakGemini(res.reply, voiceId);
        } finally {
          setTtsLoad(false);
          setPlaying(false);
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: `a${Date.now()}`,
        role: "assistant",
        text: `Connection issue: ${e?.message ?? "request failed"}. The AI backend is Gemini 2.0 Flash — check API server logs if this persists.`,
        time: "Now",
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function replaySingle(text: string) {
    setTtsLoad(true); setPlaying(true);
    try { await speakGemini(text, voiceId); }
    finally { setTtsLoad(false); setPlaying(false); }
  }

  function handleStop() { stopAudio(); setPlaying(false); }

  function copyMsg(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  function renderText(text: string) {
    return text.split("\n").map((line, i) => {
      const formatted = line
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/^(#{1,3}) (.+)$/, (_, _h, t) => `<span class="font-bold">${t}</span>`);
      return (
        <p key={i}
          className={cn("leading-relaxed", line.startsWith("---") ? "border-t border-border/30 my-2" : "")}
          dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }}
        />
      );
    });
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto px-1 pt-2">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl nf-chameleon-bg flex items-center justify-center shadow-sm">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold">NexFlow AI</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#88B8B0]/15 text-[#88B8B0] border border-[#88B8B0]/30 uppercase tracking-wide">
                Gemini 2.0 Flash
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">Live pipeline · {mode} mode · {language === "auto" ? "bilingual" : language}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* TTS stop button */}
          {playing && (
            <button onClick={handleStop} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition">
              <Square className="w-3 h-3 fill-current" /> Stop
            </button>
          )}

          {/* Voice toggle */}
          <button
            onClick={() => { setVoiceOn(v => !v); if (playing) handleStop(); }}
            className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition",
              voiceOn ? "bg-[#88B8B0]/15 border-[#88B8B0]/40 text-[#88B8B0]" : "bg-muted/40 border-border/40 text-muted-foreground")}
          >
            {ttsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : voiceOn ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            {currentVoice.flag} {currentVoice.label}
          </button>

          {/* Settings panel toggle */}
          <button
            onClick={() => setSettingsOpen(v => !v)}
            className={cn("p-1.5 rounded-lg border transition",
              settingsOpen ? "bg-[#B8A0C8]/15 border-[#B8A0C8]/40 text-[#B8A0C8]" : "border-border/40 text-muted-foreground hover:bg-muted/40")}
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <button onClick={() => setMessages(m => [m[0]!])} title="Clear chat"
            className="p-1.5 rounded-lg border border-border/40 text-muted-foreground hover:bg-muted/40 transition">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Settings drawer ─────────────────────────────────────────────── */}
      {settingsOpen && (
        <div className="glass-panel p-4 mb-3 grid grid-cols-2 gap-4 flex-shrink-0">
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Voice persona</div>
            <div className="grid grid-cols-1 gap-1">
              {VOICES.map(v => (
                <button key={v.id} onClick={() => setVoiceId(v.id as VoiceId)}
                  className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition border",
                    voiceId === v.id ? "border-[#88B8B0]/50 bg-[#88B8B0]/10 text-[#88B8B0]" : "border-transparent hover:bg-muted/40")}>
                  <span className="text-base leading-none">{v.flag}</span>
                  <div>
                    <div className="font-semibold">{v.label}</div>
                    <div className="text-[10px] text-muted-foreground">{v.sub}</div>
                  </div>
                  {voiceId === v.id && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Setting label="Arabic accent / dialect" options={ACCENTS} value={accent} onChange={setAccent as any} />
            <Setting label="Language output" options={LANGUAGES} value={language} onChange={setLanguage as any} />
            <Setting label="Tone" options={TONES} value={tone} onChange={setTone as any} />
            <Setting label="Mode" options={MODES} value={mode} onChange={setMode as any} />
          </div>
        </div>
      )}

      {/* ── Message list ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
              "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5",
              msg.role === "user" ? "bg-[#B8A0C8]" : "nf-chameleon-bg"
            )}>
              {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
            </div>

            <div className={cn("max-w-[82%] space-y-1", msg.role === "user" ? "items-end" : "items-start")}>
              <div className={cn(
                "rounded-2xl px-4 py-2.5 text-sm",
                msg.role === "user"
                  ? "bg-[#B8A0C8]/20 border border-[#B8A0C8]/30 rounded-tr-sm"
                  : "glass-panel rounded-tl-sm"
              )}>
                <div className="prose prose-sm prose-compact max-w-none text-foreground">
                  {renderText(msg.text)}
                </div>

                {/* Action buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.actions.map((a, i) => (
                      <a key={i} href={a.path ?? "#"}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#B8A0C8]/15 text-[#B8A0C8] border border-[#B8A0C8]/30 hover:bg-[#B8A0C8]/25 transition">
                        <Sparkles className="w-3 h-3" /> {a.label}
                      </a>
                    ))}
                  </div>
                )}

                {/* Meta row */}
                {msg.role === "assistant" && msg.id !== "init" && (
                  <div className="mt-2 pt-1.5 border-t border-border/20 flex items-center gap-2 flex-wrap">
                    {msg.provider && (
                      <span className="text-[10px] text-muted-foreground">{msg.provider}</span>
                    )}
                    {msg.data_used && msg.data_used.length > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Database className="w-2.5 h-2.5" /> live data
                      </span>
                    )}
                    <button onClick={() => copyMsg(msg.id, msg.text)}
                      className="ml-auto text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition">
                      {copied === msg.id ? <CheckCircle2 className="w-3 h-3 text-[#88B8B0]" /> : <Copy className="w-3 h-3" />}
                      {copied === msg.id ? "Copied" : "Copy"}
                    </button>
                    {voiceOn && (
                      <button onClick={() => replaySingle(msg.text)}
                        className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition">
                        <Play className="w-3 h-3" /> Replay
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full nf-chameleon-bg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="glass-panel rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemini thinking…</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Suggestions (only when no real messages) ─────────────────────── */}
      {messages.length <= 1 && !loading && (
        <div className="grid grid-cols-2 gap-2 mb-3 flex-shrink-0">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)}
              className="text-left px-3 py-2 rounded-xl border border-border/40 hover:border-[#B8A0C8]/40 hover:bg-[#B8A0C8]/5 text-xs text-muted-foreground hover:text-foreground transition leading-snug">
              <Sparkles className="w-3 h-3 text-[#B8A0C8] inline mr-1.5 -mt-0.5" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ───────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 pb-2">
        <div className="flex items-end gap-2 px-4 py-2.5 rounded-2xl bg-muted/50 border border-border/40 focus-within:border-[#B8A0C8] transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask anything — pipeline, contacts, follow-ups, Arabic… (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent resize-none focus:outline-none text-sm placeholder:text-muted-foreground max-h-32"
            style={{ fieldSizing: "content" } as any}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className={cn(
              "p-2 rounded-xl transition-all flex-shrink-0",
              input.trim() && !loading
                ? "nf-chameleon-bg text-white shadow-sm hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="text-[10px] text-muted-foreground text-center mt-1.5">
          {currentVoice.flag} {currentVoice.label} · {accent} accent · {tone} · {language === "auto" ? "auto language" : language}
        </div>
      </div>
    </div>
  );
}

// ─── Small settings row component ────────────────────────────────────────────
function Setting<T extends string>({
  label, options, value, onChange,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">{label}</div>
      <div className="flex flex-wrap gap-1">
        {options.map(o => (
          <button key={o.id} onClick={() => onChange(o.id)}
            className={cn("px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition",
              value === o.id
                ? "border-[#B8A0C8]/50 bg-[#B8A0C8]/15 text-[#B8A0C8]"
                : "border-border/40 text-muted-foreground hover:bg-muted/40")}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
