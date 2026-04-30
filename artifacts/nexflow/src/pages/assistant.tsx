/**
 * NexFlow AI Assistant — real LLM-backed chat with live dashboard data.
 *
 *   • Backend: POST /api/assistant/chat (OpenRouter → Claude/GPT/Gemini/Perplexity)
 *   • Pulls live pipeline / contacts / signals / activities from the DB.
 *   • Voice playback uses browser SpeechSynthesis with the selected voice
 *     profile (default = Layla, Gulf Arabic female).
 *   • Provider selector lets the user pick which model answers.
 */

import { useState, useRef, useEffect } from "react";
import { Brain, Send, Volume2, VolumeX, Copy, RefreshCw, Sparkles, User, Loader2, ChevronDown, Database, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
  provider?: string;
  data_used?: string[];
}

const SUGGESTIONS = [
  "Give me today's pipeline briefing with real numbers",
  "Who are my top 3 hot contacts to call right now?",
  "Which deals are at risk of stalling?",
  "Write a Khaleeji WhatsApp follow-up to my hottest lead",
  "Summarize my recent activity and what I missed",
  "What buying signals should I act on first?",
];

// Provider-routed AI models. All of these go through OpenRouter automatically.
const PROVIDERS = [
  { key: "auto",       label: "Auto",        sub: "Best model picked for the task",        color: "#B8A0C8" },
  { key: "anthropic",  label: "Claude 4.6",  sub: "Best for nuance, drafting, persuasion", color: "#C8A880" },
  { key: "openai",     label: "GPT-4o",      sub: "Balanced reasoning + speed",            color: "#88B8B0" },
  { key: "gemini",     label: "Gemini 2.5",  sub: "Long context, multilingual",            color: "#90B8D8" },
  { key: "perplexity", label: "Perplexity",  sub: "Live web grounding for fresh facts",    color: "#B8B880" },
] as const;

const VOICES = [
  { id: "layla",  label: "Layla — Gulf Arabic Female", lang: "ar-SA", gender: "female" as const, default: true },
  { id: "faisal", label: "Faisal — Gulf Arabic Male",  lang: "ar-SA", gender: "male"   as const },
  { id: "noor",   label: "Noor — Bilingual AR/EN",     lang: "ar",    gender: "female" as const },
  { id: "adam",   label: "Adam — English Male",        lang: "en-US", gender: "male"   as const },
];

function speak(text: string, voiceId: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const v = VOICES.find(x => x.id === voiceId) ?? VOICES[0]!;
  const u = new SpeechSynthesisUtterance(text.replace(/\*\*/g, "").replace(/[#`]/g, ""));
  u.lang = v.lang;
  u.rate = 1.0;
  u.pitch = v.gender === "female" ? 1.1 : 0.95;
  // Try to pick a matching voice from the OS voice list.
  const list = window.speechSynthesis.getVoices();
  const match = list.find(s => s.lang.toLowerCase().startsWith(v.lang.toLowerCase().slice(0, 2)) && s.name.toLowerCase().includes(v.gender === "female" ? "female" : "male"))
    ?? list.find(s => s.lang.toLowerCase().startsWith(v.lang.toLowerCase().slice(0, 2)));
  if (match) u.voice = match;
  window.speechSynthesis.speak(u);
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      text: "Hello — I'm your NexFlow AI Assistant. I have live access to your pipeline, contacts, deals, signals, and activity feed. Ask me anything about your performance, who to call, what to send, or what's at risk.\n\nاهلاً وسهلاً — تقدر تكتبلي بالعربي وأنا أرد عليك بلهجة خليجية.",
      time: "Now",
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [provider, setProvider] = useState<typeof PROVIDERS[number]["key"]>("auto");
  const [voiceId, setVoiceId] = useState<string>("layla");
  const [voiceOn, setVoiceOn] = useState<boolean>(true);
  const [providerOpen, setProviderOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Force the OS to load voice list on mount (Chrome quirk).
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function send(text?: string) {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    const userMsg: Message = { id: `u${Date.now()}`, role: "user", text: msg, time: "Now" };
    const history = messages.filter(m => m.id !== "init").map(m => ({ role: m.role, text: m.text }));
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await apiFetch("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ message: msg, provider, history }),
      }) as { reply: string; provider_used?: string; data_used?: string[] };
      const reply: Message = {
        id: `a${Date.now()}`,
        role: "assistant",
        text: res.reply ?? "(no response)",
        time: "Now",
        provider: res.provider_used,
        data_used: res.data_used,
      };
      setMessages(prev => [...prev, reply]);
      if (voiceOn && res.reply) speak(res.reply, voiceId);
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: `a${Date.now()}`,
        role: "assistant",
        text: `I couldn't reach the AI right now (${e?.message ?? "network error"}). Please try again.`,
        time: "Now",
      }]);
    } finally {
      setLoading(false);
    }
  }

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
        .replace(/^(#{1,3}) (.+)$/, (_, _h, t) => `<span class="font-bold text-foreground">${t}</span>`);
      return <p key={i} className={cn("leading-relaxed", line.startsWith("---") ? "border-t border-border/30 my-2" : "")} dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }} />;
    });
  }

  const currentProvider = PROVIDERS.find(p => p.key === provider) ?? PROVIDERS[0];
  const currentVoice = VOICES.find(v => v.id === voiceId) ?? VOICES[0];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-foreground">NexFlow AI Assistant</h1>
          <p className="text-xs text-[#88B8B0] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#88B8B0] animate-pulse" />
            Live · powered by {currentProvider!.label} · reads your real pipeline
          </p>
        </div>
        <button
          onClick={() => setMessages([messages[0]!])}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          New chat
        </button>
      </div>

      {/* Provider + Voice strip */}
      <div className="flex flex-wrap gap-2 mb-3 flex-shrink-0">
        {/* Provider picker */}
        <div className="relative">
          <button
            onClick={() => { setProviderOpen(o => !o); setVoiceOpen(false); }}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-foreground border border-border/40"
          >
            <Sparkles className="w-3 h-3" style={{ color: currentProvider!.color }} />
            <span className="font-semibold">Model: {currentProvider!.label}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {providerOpen && (
            <div className="absolute top-full mt-1 left-0 z-20 w-72 glass-card rounded-xl p-1 shadow-xl border border-border/40">
              {PROVIDERS.map(p => (
                <button
                  key={p.key}
                  onClick={() => { setProvider(p.key); setProviderOpen(false); }}
                  className={cn("w-full text-left px-3 py-2 rounded-lg flex items-start gap-2 hover:bg-muted/40 transition-colors", provider === p.key && "bg-muted/60")}
                >
                  <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: p.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{p.label}</div>
                    <div className="text-[10px] text-muted-foreground">{p.sub}</div>
                  </div>
                  {provider === p.key && <CheckCircle2 className="w-3.5 h-3.5 text-[#88B8B0] mt-0.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Voice toggle */}
        <button
          onClick={() => setVoiceOn(v => !v)}
          className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors",
            voiceOn ? "bg-[#88B8B0]/15 border-[#88B8B0]/40 text-[#88B8B0]" : "bg-muted/40 border-border/40 text-muted-foreground")}
        >
          {voiceOn ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          <span className="font-semibold">Voice {voiceOn ? "on" : "off"}</span>
        </button>

        {/* Voice picker */}
        <div className="relative">
          <button
            onClick={() => { setVoiceOpen(o => !o); setProviderOpen(false); }}
            disabled={!voiceOn}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-foreground border border-border/40 disabled:opacity-50"
          >
            <span className="font-semibold">{currentVoice!.label}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {voiceOpen && (
            <div className="absolute top-full mt-1 left-0 z-20 w-64 glass-card rounded-xl p-1 shadow-xl border border-border/40">
              {VOICES.map(v => (
                <button
                  key={v.id}
                  onClick={() => { setVoiceId(v.id); setVoiceOpen(false); speak("مرحبا، أنا مساعدك الذكي", v.id); }}
                  className={cn("w-full text-left px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors flex items-center justify-between", voiceId === v.id && "bg-muted/60")}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{v.label}</span>
                    <span className="text-[10px] text-muted-foreground">{v.lang} · {v.gender}</span>
                  </div>
                  {voiceId === v.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#88B8B0]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground ml-auto">
          <Database className="w-3 h-3" />
          Live data: pipeline · contacts · signals · activities
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map(msg => (
          <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
              msg.role === "assistant" ? "nf-chameleon-bg" : "bg-muted/60"
            )}>
              {msg.role === "assistant" ? <Sparkles className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-foreground" />}
            </div>
            <div className={cn("flex-1 max-w-[85%] flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
              <div className={cn(
                "rounded-2xl px-4 py-3 text-sm group relative",
                msg.role === "assistant" ? "glass-card text-foreground/90 rounded-tl-sm" : "nf-chameleon-bg text-white rounded-tr-sm"
              )} dir="auto">
                <div className={cn("space-y-0.5", msg.role === "assistant" ? "text-foreground/85" : "text-white")}>
                  {renderText(msg.text)}
                </div>
                {msg.role === "assistant" && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => speak(msg.text, voiceId)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground"
                      title="Speak this answer"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => copyMsg(msg.id, msg.text)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground"
                      title="Copy"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              {msg.role === "assistant" && msg.provider && msg.id !== "init" && (
                <div className="text-[10px] text-muted-foreground flex items-center gap-2 px-1">
                  {msg.provider !== "none" && <span>via {msg.provider}</span>}
                  {msg.data_used && msg.data_used.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Database className="w-2.5 h-2.5" /> {msg.data_used.join(" · ")}
                    </span>
                  )}
                  {copied === msg.id && <span className="text-[#88B8B0]">copied</span>}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full nf-chameleon-bg flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-muted-foreground">
              Pulling live data and consulting {currentProvider!.label}…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="py-3 flex-shrink-0">
          <div className="text-xs text-muted-foreground mb-2">Try asking:</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 pt-3 border-t border-border/20 flex-shrink-0">
        <div className="flex-1 flex items-end gap-2 px-4 py-3 rounded-2xl bg-muted/50 border border-border/40 focus-within:border-[#B8A0C8] transition-colors">
          <textarea
            className="flex-1 bg-transparent text-sm outline-none resize-none text-foreground placeholder:text-muted-foreground leading-relaxed max-h-32"
            placeholder="Ask about pipeline, deals, contacts, signals — or request a draft (English / Arabic)…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
            rows={1}
            dir="auto"
          />
        </div>
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className={cn(
            "p-3 rounded-xl flex-shrink-0 transition-all",
            input.trim() && !loading ? "nf-chameleon-bg text-white hover:opacity-90" : "bg-muted/30 text-muted-foreground cursor-not-allowed"
          )}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
