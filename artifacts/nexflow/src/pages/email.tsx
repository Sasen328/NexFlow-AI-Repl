import { useState } from "react";
import { Mail, Send, ChevronDown, Plus, Paperclip, Brain, RefreshCw, Check, X, Inbox } from "lucide-react";
import { useContacts } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  {
    id: "t1", name: "Post-Demo Follow-Up", subject: "Next Steps — NexFlow × {Company}",
    body: `Hi {name},

Thank you for joining us today for the NexFlow demo. It was great to learn more about {Company}'s goals for this year.

As promised, here are the key highlights we covered:
• AI-powered call coaching with Arabic voice support
• GCC compliance module (SAMA, PDPL-ready)
• 40% average CRM cost reduction for similar firms

I'd love to schedule a follow-up call to discuss the ROI model specific to your team size. Are you free this Thursday?

Looking forward to your thoughts,
[Your Name]`,
  },
  {
    id: "t2", name: "Arabic Formal Greeting", subject: "عرض حصري من NexFlow",
    body: `السلام عليكم ورحمة الله وبركاته {name}،

أتمنى أن تكون بخير وعافية.

بناءً على اهتمام {Company} بتطوير منظومة إدارة العملاء، يسعدني تقديم NexFlow — منصة CRM مدعومة بالذكاء الاصطناعي، مصممة خصيصاً لأسواق الخليج العربي.

مزايا رئيسية:
• وكيل صوتي ذكي باللغة العربية (لهجة خليجية وعربية فصحى)
• لوحة تحكم متوافقة مع متطلبات هيئة السوق المالية وحماية البيانات
• تكامل WhatsApp وتحليل المكالمات الآلي

هل يمكننا تحديد موعد عرض قصير هذا الأسبوع؟

مع خالص التقدير والاحترام،
[اسمك]`,
  },
  {
    id: "t3", name: "Proposal Sent", subject: "NexFlow Proposal for {Company} — Ready to Review",
    body: `Hi {name},

I've just sent the NexFlow Enterprise proposal to your inbox. Here's a quick summary:

📋 Scope: {seats} seats, Enterprise plan
💰 Investment: [Amount] per year (includes onboarding + dedicated CSM)
🚀 Timeline: 6-week implementation + 4-week hypercare

Key decision points for your review:
1. Arabic AI Voice Agent — live demo available
2. SAMA compliance certification
3. Data residency in KSA (Riyadh region)

I'm happy to walk through any section with your team. A 30-minute call with your legal and technical leads would make approval straightforward.

Best,
[Your Name]`,
  },
  {
    id: "t4", name: "Re-Engagement", subject: "Quick check-in — {Company} × NexFlow",
    body: `Hi {name},

Hope Q2 is off to a strong start for you and the team at {Company}.

I noticed we haven't connected in a while, so I wanted to reach out with a quick update. Since our last conversation, NexFlow has added:
• Real-time call scoring with GCC-specific benchmarks
• WhatsApp Business API integration (with Arabic AI)
• New reporting for Vision 2030 compliance metrics

Would it make sense to reconnect for 20 minutes to see what's changed? Happy to fit around your schedule.

Kind regards,
[Your Name]`,
  },
];

const SENT_EMAILS = [
  { id: "e1", to: "sara@gulfventures.sa", subject: "Gulf Ventures Enterprise Proposal", status: "opened", time: "2h ago", opens: 3 },
  { id: "e2", to: "ahmed@riyadhcapital.com", subject: "Next Steps — MSA Review", status: "replied", time: "Yesterday", opens: 1 },
  { id: "e3", to: "fatima@alnoor.ae", subject: "عرض حصري من NexFlow", status: "opened", time: "2 days ago", opens: 5 },
  { id: "e4", to: "mother@aramcodigital.com", subject: "Aramco Digital — Q2 Pricing", status: "sent", time: "3 days ago", opens: 0 },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  opened: { label: "Opened", color: "text-[#B8B880]", bg: "bg-[#B8B880]/15", icon: Check },
  replied: { label: "Replied", color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/15", icon: Check },
  sent: { label: "Sent", color: "text-muted-foreground", bg: "bg-muted/40", icon: Send },
  bounced: { label: "Bounced", color: "text-destructive", bg: "bg-destructive/15", icon: X },
};

export default function EmailPage() {
  const { data } = useContacts();
  const contacts = data?.contacts ?? [];
  const [tab, setTab] = useState<"compose" | "sent">("compose");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  function applyTemplate(tid: string) {
    const t = TEMPLATES.find(x => x.id === tid);
    if (!t) return;
    setSubject(t.subject);
    setBody(t.body);
    setSelectedTemplate(tid);
  }

  function aiImprove() {
    if (!body) return;
    setAiGenerating(true);
    setTimeout(() => {
      setBody(prev => prev + "\n\n[AI Enhanced: Added personalization, tightened value proposition, added clear CTA specific to GCC enterprise context]");
      setAiGenerating(false);
    }, 1200);
  }

  function sendEmail() {
    if (!to || !subject || !body) return;
    setSent(true);
    setTimeout(() => { setSent(false); setTo(""); setSubject(""); setBody(""); setSelectedTemplate(""); }, 2000);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#B8A0C8]" />
            Email
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">AI-assisted email composer with templates and tracking</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50">
          <button onClick={() => setTab("compose")} className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", tab === "compose" ? "nf-chameleon-bg text-white" : "text-muted-foreground")}>
            Compose
          </button>
          <button onClick={() => setTab("sent")} className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", tab === "sent" ? "nf-chameleon-bg text-white" : "text-muted-foreground")}>
            Sent & Tracking
          </button>
        </div>
      </div>

      {tab === "compose" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Templates */}
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground text-sm">Templates</h2>
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id)}
                className={cn(
                  "w-full text-left p-3 rounded-xl border transition-all",
                  selectedTemplate === t.id
                    ? "nf-chameleon-border bg-[#B8A0C8]/10"
                    : "border-border/30 glass-card hover:border-[#B8A0C8]/40"
                )}
              >
                <div className="text-xs font-semibold text-foreground mb-0.5">{t.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{t.subject}</div>
              </button>
            ))}
          </div>

          {/* Composer */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12">To:</span>
              <div className="flex-1 relative">
                <select
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm text-foreground outline-none"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                >
                  <option value="">Select contact...</option>
                  {contacts.map((c: any) => (
                    <option key={c.id} value={c.email ?? ""}>{c.first_name} {c.last_name} — {c.email}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12">Subject:</span>
              <input
                className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm text-foreground outline-none focus:border-[#B8A0C8]"
                placeholder="Email subject..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
                dir="auto"
              />
            </div>
            <div className="border-t border-border/20" />
            <textarea
              className="w-full min-h-72 px-3 py-2 bg-transparent text-sm text-foreground outline-none resize-none leading-relaxed placeholder:text-muted-foreground"
              placeholder="Write your email, or pick a template to get started..."
              value={body}
              onChange={e => setBody(e.target.value)}
              dir="auto"
            />
            <div className="flex items-center gap-2 pt-2 border-t border-border/20">
              <button
                onClick={sendEmail}
                disabled={!to || !subject || !body || sent}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all",
                  to && subject && body ? "nf-chameleon-bg text-white hover:opacity-90" : "bg-muted/40 text-muted-foreground cursor-not-allowed"
                )}
              >
                {sent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {sent ? "Sent!" : "Send Email"}
              </button>
              <button
                onClick={aiImprove}
                disabled={!body || aiGenerating}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-[#B8A0C8]/20 text-[#B8A0C8] hover:bg-[#B8A0C8]/30 transition-colors disabled:opacity-50"
              >
                {aiGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                AI Improve
              </button>
              <button className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Recipient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Subject</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Opens</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Sent</th>
              </tr>
            </thead>
            <tbody>
              {SENT_EMAILS.map(e => {
                const cfg = STATUS_CONFIG[e.status] ?? STATUS_CONFIG.sent;
                return (
                  <tr key={e.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {e.to[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-foreground">{e.to}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-muted-foreground" dir="auto">{e.subject}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", cfg.bg, cfg.color)}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-sm font-semibold text-foreground">{e.opens}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-xs text-muted-foreground">{e.time}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
