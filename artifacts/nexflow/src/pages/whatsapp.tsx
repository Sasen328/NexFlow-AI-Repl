import { useState } from "react";
import { MessageSquare, Send, Phone, Check, CheckCheck, Clock, Search, Plus, Smile, Paperclip, Mic } from "lucide-react";
import { useContacts } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

const MOCK_THREADS = [
  {
    id: "1", contactName: "Sara Al-Mansouri", initials: "SA", company: "Gulf Ventures",
    lastMessage: "Sounds great! I'll review the proposal tonight 🙏", time: "10:42 AM",
    unread: 2, status: "delivered",
    messages: [
      { id: "m1", from: "them", text: "As-salamu alaykum! I received the NexFlow proposal.", time: "09:15 AM", read: true },
      { id: "m2", from: "me", text: "Wa alaykum assalam Sara! Yes, I sent it this morning. Happy to walk you through the ROI model anytime.", time: "09:18 AM", read: true },
      { id: "m3", from: "them", text: "The pricing looks competitive. Can you clarify the Arabic AI voice agent pricing?", time: "10:30 AM", read: true },
      { id: "m4", from: "me", text: "Of course! The Arabic AI Voice Agent is included in the Enterprise plan. It supports MSA and Gulf dialect out of the box.", time: "10:35 AM", read: true },
      { id: "m5", from: "them", text: "Sounds great! I'll review the proposal tonight 🙏", time: "10:42 AM", read: false },
      { id: "m6", from: "them", text: "Can we schedule a call Thursday at 2pm Riyadh time?", time: "10:43 AM", read: false },
    ]
  },
  {
    id: "2", contactName: "Ahmed Al-Rashidi", initials: "AA", company: "Riyadh Capital",
    lastMessage: "Perfect. Our legal team will review the MSA.", time: "Yesterday",
    unread: 0, status: "read",
    messages: [
      { id: "m1", from: "me", text: "Ahmed, great news — legal has approved our standard MSA for GCC entities. Ready to send.", time: "Yesterday 2:00 PM", read: true },
      { id: "m2", from: "them", text: "Perfect. Our legal team will review the MSA.", time: "Yesterday 3:15 PM", read: true },
    ]
  },
  {
    id: "3", contactName: "Fatima Khalid", initials: "FK", company: "Al-Noor Investments",
    lastMessage: "جزاك الله خيراً على العرض الممتاز!", time: "Yesterday",
    unread: 1, status: "delivered",
    messages: [
      { id: "m1", from: "me", text: "Fatima, wanted to follow up after our demo. The Arabic voice agent demo was a hit with your team!", time: "Yesterday 11:00 AM", read: true },
      { id: "m2", from: "them", text: "جزاك الله خيراً على العرض الممتاز!", time: "Yesterday 12:30 PM", read: false },
    ]
  },
  {
    id: "4", contactName: "Mohammed Al-Otaibi", initials: "MA", company: "Aramco Digital",
    lastMessage: "The Q2 budget just got approved. Let's talk.", time: "Mon",
    unread: 3, status: "delivered",
    messages: [
      { id: "m1", from: "them", text: "The Q2 budget just got approved. Let's talk.", time: "Mon 9:00 AM", read: false },
      { id: "m2", from: "them", text: "We're looking at a 500-seat deployment.", time: "Mon 9:01 AM", read: false },
      { id: "m3", from: "them", text: "Can you send me the enterprise deck ASAP?", time: "Mon 9:02 AM", read: false },
    ]
  },
];

const TEMPLATES = [
  { name: "Follow-up After Demo", text: "Hi {name}! Great connecting with you today. As discussed, NexFlow's {feature} will help {company} achieve {benefit}. Happy to answer any questions! 🚀" },
  { name: "Arabic Greeting", text: "السلام عليكم {name}! أتمنى أن تكون بخير. أردت فقط المتابعة بشأن عرضنا لـ {company}. هل لديك أي أسئلة؟" },
  { name: "Meeting Reminder", text: "Hi {name}, just a reminder about our call tomorrow at {time}. Looking forward to it! 📅" },
  { name: "Proposal Sent", text: "Hi {name}! I just sent the NexFlow proposal to your inbox. Key highlights: {highlights}. Let me know when you've had a chance to review 🙏" },
  { name: "Closing Urgency", text: "Hi {name}, wanted to share — our Q2 pricing expires {date}. I'd love to get you locked in before then. Can we connect tomorrow?" },
];

export default function WhatsAppPage() {
  const [activeThread, setActiveThread] = useState(MOCK_THREADS[0]);
  const [input, setInput] = useState("");
  const [threads, setThreads] = useState(MOCK_THREADS);
  const [showTemplates, setShowTemplates] = useState(false);
  const [search, setSearch] = useState("");

  const totalUnread = threads.reduce((acc, t) => acc + t.unread, 0);

  function sendMessage() {
    if (!input.trim()) return;
    const newMsg = { id: `m${Date.now()}`, from: "me" as const, text: input.trim(), time: "Now", read: false };
    const updated = threads.map(t =>
      t.id === activeThread.id
        ? { ...t, messages: [...t.messages, newMsg], lastMessage: input.trim(), time: "Now", unread: 0 }
        : t
    );
    setThreads(updated);
    setActiveThread(prev => ({ ...prev, messages: [...prev.messages, newMsg], unread: 0 }));
    setInput("");
    setShowTemplates(false);
  }

  const filtered = threads.filter(t =>
    t.contactName.toLowerCase().includes(search.toLowerCase()) ||
    t.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0 rounded-2xl overflow-hidden glass-card">
      {/* Thread List */}
      <div className="w-72 flex-shrink-0 border-r border-border/30 flex flex-col">
        <div className="p-4 border-b border-border/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#88B8B0]" />
              WhatsApp
              {totalUnread > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#88B8B0] text-white text-[10px] font-black flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </h2>
            <button className="w-7 h-7 rounded-lg nf-chameleon-bg flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-white" />
            </button>
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
                activeThread.id === thread.id && "bg-muted/40"
              )}
            >
              <div className="w-10 h-10 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 relative">
                {thread.initials}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#88B8B0] border border-background" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-semibold text-foreground truncate">{thread.contactName}</span>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">{thread.time}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mb-1 truncate">{thread.company}</div>
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

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-xs font-bold">
              {activeThread.initials}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{activeThread.contactName}</div>
              <div className="text-xs text-[#88B8B0]">Online · {activeThread.company}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeThread.messages.map(msg => (
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
                  {msg.from === "me" && (
                    msg.read
                      ? <CheckCheck className="w-3 h-3 text-white/80" />
                      : <Check className="w-3 h-3 text-white/60" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Templates */}
        {showTemplates && (
          <div className="px-4 py-2 border-t border-border/20 bg-muted/20 max-h-48 overflow-y-auto">
            <div className="text-xs font-semibold text-muted-foreground mb-2">Quick Templates</div>
            <div className="space-y-1.5">
              {TEMPLATES.map(t => (
                <button
                  key={t.name}
                  onClick={() => { setInput(t.text); setShowTemplates(false); }}
                  className="w-full text-left p-2.5 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div className="text-xs font-semibold text-foreground mb-0.5">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.text}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-end gap-2 p-4 border-t border-border/20 flex-shrink-0">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={cn(
              "p-2.5 rounded-xl transition-all flex-shrink-0",
              showTemplates ? "nf-chameleon-bg text-white" : "bg-muted/50 text-muted-foreground hover:text-foreground"
            )}
            title="Message templates"
          >
            <Smile className="w-4 h-4" />
          </button>
          <button className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground transition-all flex-shrink-0">
            <Paperclip className="w-4 h-4" />
          </button>
          <div className="flex-1 flex items-end gap-2 px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border/40">
            <textarea
              className="flex-1 bg-transparent text-sm outline-none resize-none text-foreground placeholder:text-muted-foreground leading-relaxed"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              rows={1}
              dir="auto"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className={cn(
              "p-2.5 rounded-xl flex-shrink-0 transition-all",
              input.trim() ? "nf-chameleon-bg text-white hover:opacity-90" : "bg-muted/30 text-muted-foreground cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
