import { useState } from "react";
import { MessageSquare, Send, Bot, Phone, Check, CheckCheck, AlertCircle, ExternalLink, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_THREADS = [
  { id: "1", name: "Ahmed Al-Rashidi", company: "NEOM Tech", phone: "+966 50 ***", last: "متى يمكننا جدولة عرض المنتج؟", time: "2m", unread: 1, channel: "Sales" },
  { id: "2", name: "Sara Al-Mansouri",  company: "Gulf Ventures", phone: "+971 50 ***", last: "Pricing PDF received, thanks!", time: "8m", unread: 0, channel: "Sales" },
  { id: "3", name: "Fatima Al-Khalid",  company: "Emirates BG", phone: "+971 50 ***", last: "Need procurement docs by Sunday", time: "1h", unread: 2, channel: "Support" },
  { id: "4", name: "Mohammed Al-Otaibi",company: "Aramco Digital", phone: "+966 55 ***", last: "Bot: Demo booked for Tuesday 2pm", time: "3h", unread: 0, channel: "Bot" },
];

const SAMPLE_MSGS = [
  { id: 1, dir: "in",  body: "Hi, interested in NexFlow for our 200-rep team", time: "10:14", status: "read" },
  { id: 2, dir: "out", body: "Marhaba! Happy to help. Are you replacing an existing CRM?", time: "10:15", status: "read", agent: "AI bot" },
  { id: 3, dir: "in",  body: "Yes, currently on Salesforce — too complex for our team", time: "10:18", status: "read" },
  { id: 4, dir: "out", body: "Got it. NexFlow is built for that. Can I book a 15-min demo this week?", time: "10:19", status: "read", agent: "AI bot" },
  { id: 5, dir: "in",  body: "متى يمكننا جدولة عرض المنتج؟", time: "10:22", status: "read" },
  { id: 6, dir: "out", body: "بكل سرور! يمكنني عرضه يوم الثلاثاء الساعة 2 مساءً، أو الأربعاء صباحاً. ما يناسبك؟", time: "10:23", status: "delivered", agent: "AI bot" },
];

const QUICK_REPLIES = [
  { ar: "بكل سرور 🌹", en: "Happy to help" },
  { ar: "سأرسل التفاصيل الآن", en: "Sending the details now" },
  { ar: "متى يناسبك؟", en: "When works for you?" },
];

export default function WhatsAppPage() {
  const [active, setActive] = useState(SAMPLE_THREADS[0]);
  const [draft, setDraft] = useState("");

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
              <MessageSquare className="w-5 h-5 text-white"/>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">WhatsApp Business</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#C8A880]/15 text-[#C8A880] text-[10px] font-bold uppercase border border-[#C8A880]/30">Demo · API setup required</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Bilingual chatbot, broadcast templates, and shared inbox — wired to WhatsApp Business API for #1 GCC channel.</p>
        </div>
      </div>

      <div className="glass-panel p-3 bg-[#C8A880]/10 border-[#C8A880]/30 flex items-start gap-3 text-xs">
        <AlertCircle className="w-4 h-4 text-[#C8A880] mt-0.5 flex-shrink-0"/>
        <div>
          <div className="font-bold text-foreground mb-1">Connect WhatsApp Business API to go live</div>
          <div className="text-muted-foreground">This UI is a working preview. To send real messages, connect via <a className="text-[#88B8B0] underline" href="https://business.whatsapp.com/products/business-platform" target="_blank">Meta Business Platform</a>, Twilio, or Infobip. Approved templates required for outbound after the 24-hour customer-reply window expires.</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[640px]">
        <div className="col-span-3 glass-panel p-0 overflow-hidden flex flex-col">
          <div className="px-3 py-2.5 border-b border-border/40 text-xs font-bold flex items-center justify-between">
            INBOX <span className="text-muted-foreground font-normal">{SAMPLE_THREADS.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border/30">
            {SAMPLE_THREADS.map(t => (
              <button key={t.id} onClick={() => setActive(t)} className={cn("w-full px-3 py-2.5 text-left hover:bg-muted/40", active.id === t.id && "bg-muted/60")}>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#88B8B0]/15 text-[#88B8B0] flex items-center justify-center text-xs font-bold flex-shrink-0">{t.name.split(" ").map(p=>p[0]).slice(0,2).join("")}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold truncate">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground">{t.time}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="text-[11px] text-muted-foreground truncate flex-1" dir="auto">{t.last}</div>
                      {t.unread > 0 && <span className="text-[9px] font-bold w-4 h-4 rounded-full bg-[#88B8B0] text-white flex items-center justify-center">{t.unread}</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={cn("text-[9px] font-bold px-1 rounded", t.channel === "Bot" ? "bg-[#B8A0C8]/20 text-[#B8A0C8]" : "bg-muted text-muted-foreground")}>{t.channel}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-6 glass-panel p-0 overflow-hidden flex flex-col bg-gradient-to-b from-[#88B8B0]/5 to-transparent">
          <div className="px-4 py-2.5 border-b border-border/40 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#88B8B0]/15 text-[#88B8B0] flex items-center justify-center text-xs font-bold">{active.name.split(" ").map(p=>p[0]).slice(0,2).join("")}</div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{active.name}</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3"/> {active.phone} · {active.company}</div>
            </div>
            <button className="text-xs px-2 py-1 rounded bg-[#B8A0C8]/15 text-[#B8A0C8] flex items-center gap-1"><Bot className="w-3 h-3"/> AI on</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {SAMPLE_MSGS.map(m => (
              <div key={m.id} className={cn("flex", m.dir === "out" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[70%] rounded-2xl px-3 py-2 text-sm", m.dir === "out" ? "bg-[#DCF8C6] text-[#075E54]" : "bg-white border border-border/30")}>
                  <div dir="auto">{m.body}</div>
                  <div className="flex items-center gap-1 justify-end mt-1 text-[9px] opacity-70">
                    {m.agent && <span className="bg-[#B8A0C8]/20 text-[#B8A0C8] px-1 rounded">{m.agent}</span>}
                    <span>{m.time}</span>
                    {m.dir === "out" && (m.status === "read" ? <CheckCheck className="w-3 h-3 text-[#34B7F1]"/> : <Check className="w-3 h-3"/>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border/40 p-2 space-y-2">
            <div className="flex gap-1 flex-wrap">
              {QUICK_REPLIES.map((q,i) => (
                <button key={i} onClick={() => setDraft(q.ar)} className="text-[10px] px-2 py-1 rounded bg-muted hover:bg-[#88B8B0]/15">{q.ar}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={draft} onChange={(e)=>setDraft(e.target.value)} placeholder="Type a message…" className="flex-1 px-3 py-2 rounded-lg border border-border/40 bg-transparent text-sm"/>
              <button className="px-3 py-2 rounded-lg text-white bg-[#25D366]"><Send className="w-4 h-4"/></button>
            </div>
          </div>
        </div>

        <div className="col-span-3 glass-panel p-3 overflow-y-auto">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Approved templates</div>
          <div className="space-y-2 text-xs">
            {[
              { name: "demo_invitation_ar", lang: "Arabic", body: "السلام عليكم {{1}}، نود دعوتك لعرض NexFlow يوم {{2}}." },
              { name: "follow_up_en", lang: "English", body: "Hi {{1}}, just checking in on the proposal — any questions?" },
              { name: "meeting_reminder", lang: "Bilingual", body: "Reminder: meeting tomorrow {{1}} | تذكير: اجتماع غداً" },
              { name: "payment_received_ar", lang: "Arabic", body: "تم استلام دفعتك بقيمة {{1}} ر.س. شكراً!" },
            ].map(t => (
              <div key={t.name} className="p-2 rounded border border-border/30">
                <div className="flex items-center justify-between mb-1">
                  <code className="text-[10px] font-semibold">{t.name}</code>
                  <span className="text-[9px] px-1 rounded bg-[#88B8B0]/15 text-[#88B8B0] font-bold">APPROVED</span>
                </div>
                <div className="text-[11px] text-muted-foreground" dir="auto">{t.body}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{t.lang}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border/30">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Coverage</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span>🇸🇦 Saudi</span><span className="font-semibold">98%</span></div>
              <div className="flex justify-between"><span>🇦🇪 UAE</span><span className="font-semibold">96%</span></div>
              <div className="flex justify-between"><span>🇶🇦 Qatar</span><span className="font-semibold">94%</span></div>
              <div className="flex justify-between"><span>🇰🇼 Kuwait</span><span className="font-semibold">91%</span></div>
              <div className="flex justify-between"><span>🇧🇭 Bahrain</span><span className="font-semibold">93%</span></div>
              <div className="flex justify-between"><span>🇴🇲 Oman</span><span className="font-semibold">89%</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
