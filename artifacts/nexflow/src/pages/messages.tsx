import { useState } from "react";
import { MessageSquare, Mail, Send, Phone, Check, CheckCheck, Search, Plus, Paperclip, Smile, Brain, RefreshCw, X, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

const WA_THREADS = [
  {
    id: "wa1", channel: "whatsapp", contactName: "Sara Al-Mansouri", initials: "SA", company: "Gulf Ventures",
    lastMessage: "Sounds great! I'll review the proposal tonight 🙏", time: "10:42 AM", unread: 2,
    messages: [
      { id: "m1", from: "them", text: "As-salamu alaykum! I received the NexFlow proposal.", time: "09:15 AM" },
      { id: "m2", from: "me", text: "Wa alaykum assalam Sara! Happy to walk you through the ROI model.", time: "09:18 AM" },
      { id: "m3", from: "them", text: "The pricing looks competitive. Can you clarify the Arabic AI voice agent pricing?", time: "10:30 AM" },
      { id: "m4", from: "me", text: "The Arabic AI Voice Agent is included in the Enterprise plan. Gulf dialect out of the box.", time: "10:35 AM" },
      { id: "m5", from: "them", text: "Sounds great! I'll review the proposal tonight 🙏", time: "10:42 AM" },
    ],
  },
  {
    id: "wa2", channel: "whatsapp", contactName: "Mohammed Al-Otaibi", initials: "MA", company: "Aramco Digital",
    lastMessage: "The Q2 budget just got approved. Let's talk.", time: "Mon", unread: 3,
    messages: [
      { id: "m1", from: "them", text: "The Q2 budget just got approved. Let's talk.", time: "Mon 9:00 AM" },
      { id: "m2", from: "them", text: "We're looking at a 500-seat deployment.", time: "Mon 9:01 AM" },
    ],
  },
  {
    id: "em1", channel: "email", contactName: "Ahmed Al-Rashidi", initials: "AA", company: "Riyadh Capital",
    lastMessage: "Perfect. Our legal team will review the MSA.", time: "Yesterday", unread: 0,
    messages: [
      { id: "m1", from: "me", text: "Ahmed, legal has approved our standard MSA for GCC entities. Ready to send.", time: "Yesterday 2:00 PM" },
      { id: "m2", from: "them", text: "Perfect. Our legal team will review the MSA.", time: "Yesterday 3:15 PM" },
    ],
    subject: "Next Steps — MSA Review",
  },
  {
    id: "em2", channel: "email", contactName: "Fatima Khalid", initials: "FK", company: "Al-Noor Investments",
    lastMessage: "Thank you for the excellent presentation!", time: "Yesterday", unread: 1,
    messages: [
      { id: "m1", from: "me", text: "Fatima, wanted to follow up after our demo. The Arabic voice agent was a hit!", time: "Yesterday 11:00 AM" },
      { id: "m2", from: "them", text: "Thank you for the excellent presentation!", time: "Yesterday 12:30 PM" },
    ],
    subject: "عرض حصري من NexFlow",
  },
  {
    id: "wa3", channel: "whatsapp", contactName: "Nora Al-Faisal", initials: "NF", company: "Riyadh Capital",
    lastMessage: "Can we move Thursday's call to Friday?", time: "Tue", unread: 1,
    messages: [
      { id: "m1", from: "them", text: "Can we move Thursday's call to Friday?", time: "Tue 4:30 PM" },
    ],
  },
];

const EMAIL_TEMPLATES = [
  { name: "Post-Demo Follow-Up", text: "Hi {name},\n\nThank you for joining us today for the NexFlow demo.\n\nKey highlights:\n• Arabic AI voice support\n• GCC compliance module\n• 40% avg CRM cost reduction\n\nLet's connect to discuss ROI?\n\nBest,\n[Your Name]" },
  { name: "Proposal Sent", text: "Hi {name},\n\nI've just sent the NexFlow Enterprise proposal.\n\n📋 Scope: {seats} seats, Enterprise plan\n💰 Investment: [Amount] per year\n🚀 Timeline: 6-week implementation\n\nHappy to walk through it?\n\nBest," },
  { name: "Arabic Greeting", text: "السلام عليكم {name}،\n\nأتمنى أن تكون بخير.\n\nيسعدني تقديم NexFlow — منصة CRM مدعومة بالذكاء الاصطناعي.\n\nهل يمكننا تحديد موعد عرض؟\n\nمع خالص التقدير،" },
];

const WA_TEMPLATES = [
  { name: "Follow-up After Demo", text: "Hi {name}! Great connecting with you. NexFlow's {feature} will help {company} achieve {benefit}. Happy to answer questions! 🚀" },
  { name: "Meeting Reminder", text: "Hi {name}, just a reminder about our call tomorrow at {time}. Looking forward to it! 📅" },
  { name: "Arabic Greeting", text: "السلام عليكم {name}! أردت فقط المتابعة بشأن عرضنا. هل لديك أي أسئلة؟" },
];

type Filter = "all" | "whatsapp" | "email";

export default function MessagesPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [threads, setThreads] = useState(WA_THREADS);
  const [activeThread, setActiveThread] = useState<any>(threads[0]);
  const [input, setInput] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  const filtered = threads.filter(t => {
    const matchFilter = filter === "all" || t.channel === filter;
    const matchSearch = t.contactName.toLowerCase().includes(search.toLowerCase()) ||
      t.company.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalUnread = threads.reduce((a, t) => a + t.unread, 0);

  const isEmail = activeThread?.channel === "email";
  const templates = isEmail ? EMAIL_TEMPLATES : WA_TEMPLATES;

  function sendMessage() {
    if (!input.trim()) return;
    const newMsg = { id: `m${Date.now()}`, from: "me" as const, text: input.trim(), time: "Now" };
    const updated = threads.map(t =>
      t.id === activeThread.id
        ? { ...t, messages: [...t.messages, newMsg], lastMessage: input.trim(), time: "Now", unread: 0 }
        : t
    );
    setThreads(updated);
    setActiveThread((prev: any) => ({ ...prev, messages: [...prev.messages, newMsg], unread: 0 }));
    setInput("");
    setShowTemplates(false);
    setEmailSubject("");
  }

  function aiImprove() {
    if (!input) return;
    setAiGenerating(true);
    setTimeout(() => {
      setInput(prev => prev + " [AI: Added personalization + GCC-specific CTA]");
      setAiGenerating(false);
    }, 1200);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0 rounded-2xl overflow-hidden glass-card">
      {/* Left: Thread list */}
      <div className="w-72 flex-shrink-0 border-r border-border/30 flex flex-col">
        <div className="p-4 border-b border-border/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#B8A0C8]" />
              Messages
              {totalUnread > 0 && (
                <span className="w-5 h-5 rounded-full nf-chameleon-bg text-white text-[10px] font-black flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </h2>
            <button className="w-7 h-7 rounded-lg nf-chameleon-bg flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Channel filter chips */}
          <div className="flex gap-1">
            {([["all", "All"], ["whatsapp", "WhatsApp"], ["email", "Email"]] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={cn(
                  "text-[10px] px-2 py-1 rounded-full font-semibold transition-all",
                  filter === k ? "nf-chameleon-bg text-white" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <Search className="w-3.5 h-3.5" />
            <input
              className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map(thread => (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread)}
              className={cn(
                "w-full flex items-start gap-3 p-3.5 hover:bg-muted/30 transition-colors text-left border-b border-border/10",
                activeThread?.id === thread.id && "bg-muted/40"
              )}
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-xs font-bold">
                  {thread.initials}
                </div>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background flex items-center justify-center",
                  thread.channel === "whatsapp" ? "bg-[#25D366]" : "bg-[#B8A0C8]"
                )}>
                  {thread.channel === "whatsapp"
                    ? <MessageSquare className="w-1.5 h-1.5 text-white" />
                    : <Mail className="w-1.5 h-1.5 text-white" />
                  }
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-semibold text-foreground truncate">{thread.contactName}</span>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">{thread.time}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mb-0.5 truncate">{thread.company}</div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground truncate flex-1">{thread.lastMessage}</span>
                  {thread.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#88B8B0] text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                      {thread.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Chat area */}
      {activeThread ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/20 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-xs font-bold">
                {activeThread.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{activeThread.contactName}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                    activeThread.channel === "whatsapp" ? "bg-[#25D366]/15 text-[#25D366]" : "bg-[#B8A0C8]/15 text-[#B8A0C8]"
                  )}>
                    {activeThread.channel === "whatsapp" ? "WhatsApp" : "Email"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{activeThread.company}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"><Phone className="w-4 h-4" /></button>
              <button className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"><Search className="w-4 h-4" /></button>
            </div>
          </div>

          {isEmail && (
            <div className="px-5 py-2 border-b border-border/10 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Subject:</span>
              <input
                className="flex-1 text-xs text-foreground bg-transparent outline-none"
                placeholder="Email subject..."
                value={emailSubject || activeThread.subject || ""}
                onChange={e => setEmailSubject(e.target.value)}
                dir="auto"
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeThread.messages.map((msg: any) => (
              <div key={msg.id} className={cn("flex", msg.from === "me" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm",
                  msg.from === "me"
                    ? "nf-chameleon-bg text-white rounded-tr-sm"
                    : "bg-muted/60 text-foreground rounded-tl-sm"
                )}>
                  <div className="leading-relaxed" dir="auto">{msg.text}</div>
                  <div className={cn(
                    "flex items-center gap-1 mt-1 text-[10px]",
                    msg.from === "me" ? "justify-end text-white/60" : "text-muted-foreground"
                  )}>
                    <span>{msg.time}</span>
                    {msg.from === "me" && <CheckCheck className="w-3 h-3 text-white/80" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showTemplates && (
            <div className="px-4 py-2 border-t border-border/20 bg-muted/20 max-h-48 overflow-y-auto">
              <div className="text-xs font-semibold text-muted-foreground mb-2">Quick Templates</div>
              <div className="space-y-1.5">
                {templates.map(t => (
                  <button
                    key={t.name}
                    onClick={() => { setInput(t.text); setShowTemplates(false); }}
                    className="w-full text-left p-2.5 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                  >
                    <div className="text-xs font-semibold text-foreground mb-0.5">{t.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{t.text.slice(0, 80)}…</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end gap-2 p-4 border-t border-border/20 flex-shrink-0">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={cn("p-2.5 rounded-xl flex-shrink-0 transition-all", showTemplates ? "nf-chameleon-bg text-white" : "bg-muted/50 text-muted-foreground hover:text-foreground")}
              title="Templates"
            >
              <Smile className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </button>
            <div className="flex-1 flex items-end gap-2 px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border/40">
              <textarea
                className="flex-1 bg-transparent text-sm outline-none resize-none text-foreground placeholder:text-muted-foreground leading-relaxed"
                placeholder={isEmail ? "Write your email..." : "Type a message..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !isEmail) { e.preventDefault(); sendMessage(); }}}
                rows={1}
                dir="auto"
              />
            </div>
            {isEmail && (
              <button
                onClick={aiImprove}
                disabled={!input || aiGenerating}
                className="p-2.5 rounded-xl bg-[#B8A0C8]/20 text-[#B8A0C8] hover:bg-[#B8A0C8]/30 flex-shrink-0 disabled:opacity-50"
                title="AI improve"
              >
                {aiGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={cn("p-2.5 rounded-xl flex-shrink-0 transition-all", input.trim() ? "nf-chameleon-bg text-white hover:opacity-90" : "bg-muted/30 text-muted-foreground cursor-not-allowed")}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
