import { useState, useRef, useEffect } from "react";
import { Brain, Send, Mic, Copy, RefreshCw, Sparkles, User, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

const SUGGESTIONS = [
  "Give me a daily briefing on my pipeline",
  "Who are my top 3 contacts to call today?",
  "Write a follow-up email for Sara Al-Mansouri in Arabic",
  "Which deals are at risk of stalling?",
  "Draft a WhatsApp message for Ahmed after our last call",
  "Summarize my call with Sara Al-Mansouri",
  "What buying signals should I act on today?",
  "Write an objection-handling script for pricing concerns",
];

const AI_RESPONSES: Record<string, string> = {
  briefing: `**Good morning! Here's your AI Daily Briefing for April 23, 2026:**

📊 **Pipeline Snapshot:**
• 5 open deals worth **$9.589M** total pipeline
• 1 deal in Negotiation: Ahmed Al-Rashidi ($2.16M) — needs closing call this week
• 2 deals in Lead stage — Sara Al-Mansouri ($4.895M) has high signal activity

⚡ **Top Signals Today:**
• Gulf Ventures closed $50M Series B → **Call Sara within 24 hours**
• Ahmed Al-Rashidi promoted to CIO → increased budget authority
• Al-Noor expanding to Kuwait → expansion opportunity with Fatima

🎯 **Priority Actions:**
1. Call Sara Al-Mansouri — close Gulf Ventures Enterprise 200-Seat deal
2. Send Ahmed Al-Rashidi MSA agreement today
3. Follow up Fatima Khalid re: Kuwait expansion seats

📞 **Call Score Avg:** 81/100 (↑ from last week)
💬 **Pending WhatsApp:** 3 unread from Mohammed Al-Otaibi (urgent — Q2 budget approved)`,

  default: `I'm your NexFlow AI Assistant. I can help you with:

• **Pipeline analysis** — which deals need attention
• **Contact insights** — enriched profiles and buying signals
• **Email & message drafting** — personalized in Arabic or English
• **Call prep** — talk tracks and objection handling
• **Daily briefing** — AI summary of your day
• **Lead scoring** — who to prioritize right now

What would you like help with today?`,
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("brief") || lower.includes("morning") || lower.includes("daily")) {
    return AI_RESPONSES.briefing;
  }
  if (lower.includes("sara") && lower.includes("email")) {
    return `Here's a personalized follow-up email for Sara Al-Mansouri:

---
**Subject:** Next Steps — Gulf Ventures × NexFlow Enterprise Partnership

Dear Sara,

شكراً جزيلاً على حسن استقبالكم خلال اجتماعنا. Thank you for the warm reception during our meeting.

Following our discussion, I wanted to summarize the key points for your board review:

**NexFlow Enterprise Plan — Gulf Ventures:**
• 200 seats with AI Voice Agent (Arabic MSA + Gulf dialect)
• Dedicated GCC compliance module (SAMA, PDPL)
• 40% estimated CRM cost reduction vs. current stack
• 6-week implementation with dedicated GCC success manager

The Series B announcement is exciting news — NexFlow scales seamlessly as your portfolio grows.

Shall we schedule a 30-minute session Thursday to finalize terms?

Best regards,
[Your Name]

---
*Drafted by NexFlow AI · Personalized for Gulf Ventures context*`;
  }
  if (lower.includes("ahmed") && (lower.includes("whatsapp") || lower.includes("message"))) {
    return `Here's a WhatsApp follow-up for Ahmed Al-Rashidi:

---
أستاذ أحمد، أهلاً وسهلاً! 

Congratulations on your promotion to CIO at Riyadh Capital — well deserved! 🎉

As we discussed, I'll have the MSA ready for your legal team by end of day. Given your expanded mandate, I'd love to also show you our new multi-entity dashboard — built specifically for investment firms managing multiple portfolios.

Are you free for a quick 20-minute call this Thursday?

---
*Draft by NexFlow AI · Ready to send via WhatsApp*`;
  }
  if (lower.includes("risk") || lower.includes("stall") || lower.includes("stalling")) {
    return `**At-Risk Deals Analysis:**

⚠️ **Gulf Ventures Pilot Expansion** — No update in 14 days. Sara's board meeting may be blocking decision. Recommend: Check in via WhatsApp today.

⚠️ **Layla Hassan SMB Starter** ($95,000) — Lead stage, 30% probability. Score dropped from 72 → 65. Consider: Reassign to senior rep or send value-add content.

**Healthy deals:**
✅ Ahmed Al-Rashidi ($2.16M) — Active negotiation, docs in review
✅ Aramco Digital ($4.8M) — Mohammed confirmed Q2 budget approved

**Recommended Action:** Call Sara first, then ping Mohammed via WhatsApp about contract signing timeline.`;
  }
  if (lower.includes("who") && lower.includes("call")) {
    return `**Top 3 contacts to call today:**

1. 📞 **Sara Al-Mansouri** (Score: 92)
   Gulf Ventures closed $50M Series B yesterday. This is a critical outreach window. Use the Enterprise closing script. Call before 11 AM Riyadh time.

2. 📞 **Mohammed Al-Otaibi** (Score: 71)
   Sent 3 WhatsApp messages about Q2 budget approval. He's ready to move. Aramco Digital deal ($4.8M) in Lead stage — push to Qualified today.

3. 📞 **Ahmed Al-Rashidi** (Score: 87)
   Negotiation stage. MSA is with legal. A quick check-in call will keep momentum and show commitment.

💡 *AI tip: Block 9–11 AM for outreach — GCC executives are most responsive in morning hours.*`;
  }
  if (lower.includes("objection") || lower.includes("pricing") || lower.includes("script")) {
    return `**Pricing Objection Script — GCC Enterprise:**

---
**When prospect says:** "Your pricing is higher than what we currently pay."

**Response framework:**

1. **Acknowledge:** "I completely understand — and I appreciate you being direct. Budget stewardship is exactly what we expect from a firm like yours."

2. **Reframe to ROI:** "The question isn't the monthly cost — it's what you're paying for *not* having AI-powered call coaching and Arabic voice agents. Most GCC clients see 40% rep productivity gains within 90 days."

3. **Proof point:** "Gulf Ventures went live in 6 weeks and recovered the entire first-year investment in one closed deal their AI agent surfaced."

4. **Close:** "What if we built a quick ROI model specific to your team size? I can have it ready before Thursday."

---
*Objection handled with value-based positioning · Tailored for GCC context*`;
  }
  return `Great question! Based on your current pipeline data:

Here's what NexFlow AI can tell you:

📊 **Pipeline:** $9.589M across 5 active deals
🎯 **Top priority:** Sara Al-Mansouri (Score 92) — Gulf Ventures Series B just closed
⚡ **Hot signal:** Mohammed Al-Otaibi reached out 3x about Q2 budget
📞 **Call average:** 81/100 AI coaching score

Would you like me to:
• Draft a specific message or email?
• Generate a call script for a contact?
• Analyze deal risk?
• Write in Arabic?

Just ask!`;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", role: "assistant", text: AI_RESPONSES.default, time: "Now" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send(text?: string) {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    const userMsg: Message = { id: `u${Date.now()}`, role: "user", text: msg, time: "Now" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const reply = getAIResponse(msg);
      setMessages(prev => [...prev, { id: `a${Date.now()}`, role: "assistant", text: reply, time: "Now" }]);
      setLoading(false);
    }, 900 + Math.random() * 600);
  }

  function copyMsg(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  function renderText(text: string) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const formatted = line
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/^(#{1,3}) (.+)$/, (_, h, t) => `<span class="font-bold text-foreground">${t}</span>`);
      return <p key={i} className={cn("leading-relaxed", line.startsWith("---") ? "border-t border-border/30 my-2" : "")} dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }} />;
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">NexFlow AI Assistant</h1>
          <p className="text-xs text-[#88B8B0]">● Online · Powered by GCC-tuned sales AI</p>
        </div>
        <button
          onClick={() => setMessages([{ id: "init", role: "assistant", text: AI_RESPONSES.default, time: "Now" }])}
          className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          New chat
        </button>
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
            <div className={cn("flex-1 max-w-[85%]", msg.role === "user" ? "items-end" : "items-start", "flex flex-col gap-1")}>
              <div className={cn(
                "rounded-2xl px-4 py-3 text-sm group relative",
                msg.role === "assistant"
                  ? "glass-card text-foreground/90 rounded-tl-sm"
                  : "nf-chameleon-bg text-white rounded-tr-sm"
              )}>
                <div className={cn("space-y-0.5", msg.role === "assistant" ? "text-foreground/85" : "text-white")}>
                  {renderText(msg.text)}
                </div>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => copyMsg(msg.id, msg.text)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full nf-chameleon-bg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#B8A0C8] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
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
            {SUGGESTIONS.slice(0, 4).map(s => (
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
            placeholder="Ask about your pipeline, contacts, deals, or request email drafts..."
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
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
