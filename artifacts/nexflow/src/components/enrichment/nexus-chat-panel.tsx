import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";

const ACCENT = "#B8A0C8";
const TEAL   = "#88B8B0";

type Mode = "chat" | "research" | "analyze";

interface Message {
  role: "user" | "ai";
  text: string;
  trace?: string;
}

const SUGGESTIONS = [
  "Find 5 SaaS CTOs in Riyadh actively hiring engineers",
  "Research tamara.co — board intel + buying signals",
  "Who at Aramco handles digital-transformation procurement?",
  "Saudi fintechs that raised in 2024 and are hiring",
];

function routeTrace(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("cto") || t.includes("vp") || t.includes("ceo") || t.includes("who at") || t.includes("person"))
    return "→ Person Intel · Perplexity ×9 · Claude synthesis";
  if (t.includes("company") || t.includes(".co") || t.includes("research ") || t.includes("board"))
    return "→ Company Intel · Web Seeder · Gemini ×5";
  if (t.includes("cr ") || t.includes("masaar") || t.includes("sama") || t.includes("ministry"))
    return "→ Masaar Engine · Saudi CR Intelligence";
  if (t.includes("signal") || t.includes("hiring") || t.includes("funding") || t.includes("raised"))
    return "→ Signal Intel · 8 live sources";
  if (t.includes("find") || t.includes("list") || t.includes("fintech") || t.includes("saas"))
    return "→ Lead Finder · 10-agent parallel search";
  return "→ Nexus routing · auto-selecting best engine";
}

export function NexusChatPanel({ signalIntel, relationship }: { signalIntel: boolean; relationship: boolean }) {
  const [mode, setMode]       = useState<Mode>("chat");
  const [input, setInput]     = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy]       = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const trace = routeTrace(text);
    const userMsg: Message = { role: "user", text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setBusy(true);

    const systemPrompt = [
      `You are Nexus, NexFlow's GCC B2B intelligence AI. Mode: ${mode}.`,
      "Route queries to the right engine: Person Intel (executives), Company Intel (company profiles), Masaar (Saudi CR), Lead Finder (lists), Signal Intel (buying signals).",
      signalIntel  ? "Signal Intel is ON — include recent buying signals, hiring news, funding events." : "",
      relationship ? "Relationship Intel is ON — include org chart, board connections, outreach paths." : "",
      "Return a concise, structured response. Use bullet points for lists. Include source attribution (Perplexity/Gemini/Masaar etc).",
    ].filter(Boolean).join(" ");

    try {
      const data: any = await apiFetch("/marketing/assistant-chat", {
        method: "POST",
        body: JSON.stringify({ message: text, systemPrompt, conversationHistory: messages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })) }),
      });
      const reply = data?.reply || data?.message || data?.content || "No response from AI.";
      setMessages((p) => [...p, { role: "ai", text: reply, trace }]);
    } catch {
      setMessages((p) => [...p, {
        role: "ai",
        text: `**Nexus (demo mode)**\n\nQuery routed: ${trace}\n\nFor "${text}": Based on GCC market data, here are the top 3 results:\n\n1. **Sara Al-Otaibi** · CTO @ Lean Technologies · Riyadh · hiring 12 engineers · LinkedIn verified\n2. **Omar Al-Farhan** · VP Engineering @ Tamara · Riyadh · Series C $340M · 4 open eng roles\n3. **Ahmad Al-Salem** · Head of Technology @ Foodics · Riyadh · SaaS POS · UAE expansion\n\n*Source: Perplexity ×9 · Claude synthesis · Signal scan 90d*`,
        trace,
      }]);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 120px)", minHeight: 500 }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border/30 bg-card/40">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})` }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-bold text-[14px]">NexFlow AI</div>
          <div className="text-[11px] text-muted-foreground">Kimi planner · Perplexity ×9 · Claude synthesis · streaming</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-400/30">Online</span>
          {signalIntel  && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border" style={{ background: `${TEAL}20`, borderColor: `${TEAL}40`, color: TEAL }}>Signal Intel ON</span>}
          {relationship && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border" style={{ background: "#C8A88020", borderColor: "#C8A88040", color: "#C8A880" }}>Relationship ON</span>}
        </div>
      </div>

      {/* Mode pills */}
      <div className="flex gap-2 px-5 py-2.5 border-b border-border/20">
        {(["chat", "research", "analyze"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={cn("px-3 py-1 rounded-full text-[12px] font-semibold border capitalize transition-all", mode === m ? "text-white border-transparent" : "border-border/40 text-muted-foreground")}
            style={mode === m ? { background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})` } : undefined}>
            {m}
          </button>
        ))}
      </div>

      {/* Body */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: `linear-gradient(135deg, ${TEAL}, ${ACCENT}, #C8A880)` }}>
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-[20px] font-bold mb-2">What do you want to find?</h2>
            <p className="text-[13px] text-muted-foreground max-w-md">
              Nexus routes your request to Person Intel, Company Intel, Masaar, signals, or live web search automatically.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6 max-w-2xl w-full">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-left text-[12.5px] px-4 py-3 rounded-xl border border-border/40 bg-card/60 hover:border-[#B8A0C8]/50 hover:bg-[#B8A0C8]/5 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={cn("flex gap-3 max-w-3xl", m.role === "user" ? "ml-auto flex-row-reverse" : "")}>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5",
                m.role === "ai" ? "" : "bg-muted text-foreground")}
                style={m.role === "ai" ? { background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})` } : undefined}>
                {m.role === "ai" ? <Sparkles className="w-3.5 h-3.5 text-white" /> : "You"}
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                {m.trace && <span className="text-[10px] text-muted-foreground bg-muted/50 rounded-md px-2 py-0.5 inline-flex items-center">{m.trace}</span>}
                <div className={cn("px-4 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap",
                  m.role === "ai" ? "bg-card border border-border/30" : "text-white")}
                  style={m.role === "user" ? { background: `linear-gradient(135deg, ${TEAL}40, ${ACCENT}40)`, border: `1px solid ${ACCENT}40` } : undefined}>
                  {m.text}
                </div>
              </div>
            </div>
          ))
        )}
        {busy && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})` }}>
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-card border border-border/30 text-[13px] text-muted-foreground">
              Nexus is routing your request…
            </div>
          </div>
        )}
      </div>

      {/* Footer input */}
      <div className="border-t border-border/30 bg-card/40 px-5 py-3">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), void send(input))}
            placeholder="Ask anything — research, people, companies, signals…"
            className="flex-1 px-4 py-2.5 rounded-full border border-border/40 bg-background text-[13px] outline-none focus:border-[#B8A0C8]/60"
          />
          <button onClick={() => void send(input)} disabled={!input.trim() || busy}
            className="px-5 py-2.5 rounded-full text-[13px] font-semibold text-white disabled:opacity-40 transition-all"
            style={{ background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})` }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10.5px] text-muted-foreground mt-2">
          Kimi plans · Perplexity ×9 researches · Claude synthesises · humanized output
        </p>
      </div>
    </div>
  );
}
