import { useState } from "react";
import {
  Mic, Play, Pause, Volume2, Phone, MessageSquare, Sparkles,
  TrendingUp, AlertCircle, CheckCircle2, Target, Clock, User,
  ChevronRight, Filter, Search, Tag, FileText, ArrowRight, Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CALLS = [
  {
    id: "ci1",
    contact: "Sara Al-Mansouri",
    company: "Gulf Ventures",
    duration: "23:42",
    date: "Today · 11:30",
    sentiment: 87,
    talkRatio: 38,
    listenRatio: 62,
    language: "English",
    topics: ["Pricing", "Integration", "Timeline", "Competitor: HubSpot"],
    objections: ["Implementation time concern"],
    nextSteps: ["Send technical deep-dive", "Loop in CIO Ahmed"],
    summary: "Strong intent. CFO confirmed Q3 budget approved. Timeline concern about 8-week implementation — proposed phased rollout starting July. Mentioned HubSpot in evaluation but priced 2.5× higher.",
    color: "#88B8B0",
  },
  {
    id: "ci2",
    contact: "Khalid Al-Hamdan",
    company: "Doha Petroleum",
    duration: "14:18",
    date: "Today · 09:45",
    sentiment: 42,
    talkRatio: 64,
    listenRatio: 36,
    language: "Arabic",
    topics: ["Budget cycle", "Government compliance", "Sharia banking"],
    objections: ["Budget freeze until Q4", "Need Sharia-compliant payment terms"],
    nextSteps: ["Send Sharia-compliant pricing variant", "Schedule for September"],
    summary: "Lukewarm. Government budget cycle pushes decision to Q4. Champion still engaged but blocked. Sharia compliance question requires legal review — assigned to Reem.",
    color: "#C8A880",
  },
  {
    id: "ci3",
    contact: "Hessa Al-Nahyan",
    company: "Abu Dhabi Holdings",
    duration: "41:07",
    date: "Yesterday · 15:00",
    sentiment: 92,
    talkRatio: 45,
    listenRatio: 55,
    language: "Bilingual",
    topics: ["Multi-region rollout", "AI Voice Agent", "Arabic NLP", "Vision 2030"],
    objections: [],
    nextSteps: ["Schedule executive briefing with VP Sales", "Prepare 3-currency pricing"],
    summary: "Hot deal. Hessa requested executive briefing with our VP. AI Voice Agent Arabic NLP is decisive differentiator. Wants pricing in AED, SAR, and USD for board comparison.",
    color: "#88B8B0",
  },
  {
    id: "ci4",
    contact: "Mohammed Al-Otaibi",
    company: "Aramco Digital",
    duration: "08:24",
    date: "Yesterday · 10:15",
    sentiment: 68,
    talkRatio: 52,
    listenRatio: 48,
    language: "English",
    topics: ["Contract terms", "MSA review"],
    objections: ["Procurement requires 3 vendor RFQ"],
    nextSteps: ["Submit formal RFQ response", "Coordinate with legal"],
    summary: "Procurement-driven. Need to compete in formal RFQ with 2 other vendors. Champion confident but process bound. ETA contract: 6 weeks.",
    color: "#B8A0C8",
  },
  {
    id: "ci5",
    contact: "Layla Hassan",
    company: "Mena Banking",
    duration: "17:55",
    date: "2 days ago",
    sentiment: 23,
    talkRatio: 71,
    listenRatio: 29,
    language: "English",
    topics: ["Pricing too high", "Competitor: Salesforce"],
    objections: ["Salesforce 40% cheaper", "Don't see ROI"],
    nextSteps: ["Send ROI calculator", "Compare TCO with implementation"],
    summary: "At risk. Sticker shock. Salesforce came in lower but excludes implementation. Need to send TCO comparison showing 18-month parity.",
    color: "#C0A0B8",
  },
];

const TRANSCRIPT_SAMPLE = [
  { time: "00:00", speaker: "Rep",     text: "Sara, thanks for jumping on. I know you've been evaluating CRMs — can I ask what's pushing this decision now?" },
  { time: "00:14", speaker: "Sara",    text: "Honestly, our current setup can't handle the multi-region rollout. We just closed Series B and need to scale across three GCC markets in 90 days.", highlight: "topic" },
  { time: "00:38", speaker: "Rep",     text: "Got it. So speed-to-value is critical. What was your experience with HubSpot's onboarding when you scoped them?" },
  { time: "01:02", speaker: "Sara",    text: "HubSpot was great on the marketing side, but their sales tooling for Arabic is weak. And the price came in around $180K for the first year alone.", highlight: "competitor" },
  { time: "01:30", speaker: "Rep",     text: "That's actually a common pattern — strong marketing, thin Arabic localisation. Tell me more about your Arabic-first user requirement…" },
  { time: "01:48", speaker: "Sara",    text: "Sixty percent of our pipeline is in KSA and Qatar. Reps need to log calls in Arabic, AI summaries in Arabic, the whole flow.", highlight: "requirement" },
  { time: "02:25", speaker: "Rep",     text: "Perfect. Let me show you exactly how that works in NexFlow. One thing first — when you mentioned timeline, what does \"90 days\" really need to mean for you to win?" },
  { time: "02:51", speaker: "Sara",    text: "Honestly? If we can have first KSA team live in 6 weeks and Qatar by week 10, the board will be thrilled. But 8 weeks for KSA feels long to me.", highlight: "objection" },
];

const HIGHLIGHT_STYLE: Record<string, string> = {
  topic:       "border-l-[#B8A0C8] bg-[#B8A0C8]/8",
  competitor:  "border-l-[#C0A0B8] bg-[#C0A0B8]/8",
  requirement: "border-l-[#88B8B0] bg-[#88B8B0]/8",
  objection:   "border-l-[#C8A880] bg-[#C8A880]/8",
};

const HIGHLIGHT_LABEL: Record<string, string> = {
  topic:       "Topic",
  competitor:  "Competitor mention",
  requirement: "Requirement",
  objection:   "Objection",
};

export default function ConversationIntelligencePage() {
  const [selected, setSelected] = useState(CALLS[0].id);
  const [playing, setPlaying] = useState(false);
  const call = CALLS.find((c) => c.id === selected) ?? CALLS[0];

  const totalCalls = CALLS.length;
  const avgSentiment = Math.round(CALLS.reduce((s, c) => s + c.sentiment, 0) / totalCalls);
  const avgTalkRatio = Math.round(CALLS.reduce((s, c) => s + c.talkRatio, 0) / totalCalls);

  return (
    <div className="max-w-[1500px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Mic className="w-7 h-7 text-[#B8A0C8]" />
            <h1 className="text-3xl font-black text-foreground">Conversation Intelligence</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Auto-recorded calls with English &amp; Arabic transcription, AI sentiment, talk-ratio, competitor &amp; objection detection, and coaching insights for every conversation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/40 text-foreground text-sm font-semibold hover:bg-muted/40">
            <Search className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/40 text-foreground text-sm font-semibold hover:bg-muted/40">
            <Filter className="w-4 h-4" /> All calls
          </button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Phone}    color="#B8A0C8" label="Calls analysed · 30d" value={(totalCalls * 8).toString()} sub="auto-transcribed" />
        <StatCard icon={Sparkles} color="#88B8B0" label="Avg sentiment"        value={`${avgSentiment}%`}          sub="positive trend +6pp" />
        <StatCard icon={Mic}      color="#C8A880" label="Talk : Listen"        value={`${avgTalkRatio}/${100-avgTalkRatio}`} sub="ideal 40/60" />
        <StatCard icon={Languages}color="#C0A0B8" label="Bilingual support"    value="EN · AR"                     sub="dialect-aware" />
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-12 gap-6">
        {/* Calls list */}
        <div className="col-span-4 space-y-2">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide mb-2">Recent calls</h2>
          {CALLS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={cn(
                "w-full glass-card rounded-xl p-3 text-left transition-all border-2",
                selected === c.id ? "border-[#B8A0C8]/40 shadow-md" : "border-transparent hover:border-border/40"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
                  {c.contact.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="text-sm font-bold text-foreground truncate">{c.contact}</h3>
                    <SentimentChip score={c.sentiment} />
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{c.company} · {c.duration}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {c.date}
                    <span>·</span>
                    <Languages className="w-2.5 h-2.5" /> {c.language}
                  </div>
                </div>
              </div>
              {c.objections.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border/15 flex items-center gap-1 text-[10px] text-[#C8A880]">
                  <AlertCircle className="w-2.5 h-2.5" />
                  <span className="font-semibold">{c.objections.length} objection{c.objections.length !== 1 && "s"}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Call detail */}
        <div className="col-span-8 space-y-4">
          {/* Summary card */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border/30" style={{ background: `${call.color}10` }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h2 className="text-lg font-black text-foreground">{call.contact} · {call.company}</h2>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
                    <Clock className="w-3 h-3" /> {call.date}
                    <span>·</span>
                    <span>{call.duration} min</span>
                    <span>·</span>
                    <Languages className="w-3 h-3" /> {call.language}
                    <span>·</span>
                    <SentimentChip score={call.sentiment} />
                  </div>
                </div>
              </div>

              {/* Player */}
              <div className="mt-4 p-3 rounded-xl bg-background/60 backdrop-blur-sm flex items-center gap-3">
                <button onClick={() => setPlaying(!playing)} className="w-9 h-9 rounded-full nf-chameleon-bg flex items-center justify-center text-white shadow-sm hover:opacity-90">
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="flex-1">
                  {/* Waveform */}
                  <div className="flex items-end gap-0.5 h-7">
                    {Array.from({ length: 60 }).map((_, i) => {
                      const h = 20 + Math.sin(i * 0.7) * 30 + Math.random() * 30;
                      const isPast = i < 24;
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm"
                          style={{
                            height: `${Math.max(h, 8)}%`,
                            background: isPast ? "#B8A0C8" : "#B8A0C840"
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mt-1">
                    <span>09:28</span>
                    <span>{call.duration}</span>
                  </div>
                </div>
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Summary + AI insights */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#B8A0C8]" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">AI Summary</h3>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">{call.summary}</p>

              {/* Talk ratio */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-muted-foreground">Talk / Listen ratio</span>
                  <span className="font-bold text-foreground">{call.talkRatio}% talking · {call.listenRatio}% listening</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden flex">
                  <div className="bg-[#B8A0C8]" style={{ width: `${call.talkRatio}%` }} />
                  <div className="bg-[#88B8B0]" style={{ width: `${call.listenRatio}%` }} />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {call.talkRatio > 55 ? "💡 You're talking more than ideal — try listening more on next call" : "✓ Good listening balance"}
                </div>
              </div>

              {/* Tags grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Topics detected
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {call.topics.map((t) => (
                      <span key={t} className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                        t.startsWith("Competitor")
                          ? "bg-[#C0A0B8]/15 text-[#C0A0B8] border-[#C0A0B8]/30"
                          : "bg-[#B8A0C8]/15 text-[#B8A0C8] border-[#B8A0C8]/30"
                      )}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" /> Objections
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {call.objections.length === 0 ? (
                      <span className="text-[11px] text-[#88B8B0] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> No objections detected
                      </span>
                    ) : call.objections.map((o) => (
                      <span key={o} className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-[#C8A880]/15 text-[#C8A880] border-[#C8A880]/30">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next steps */}
              <div className="mt-4 p-3 rounded-xl bg-[#88B8B0]/10 border border-[#88B8B0]/30">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-3.5 h-3.5 text-[#88B8B0]" />
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#88B8B0]">AI-extracted next steps</h4>
                </div>
                <ul className="space-y-1.5">
                  {call.nextSteps.map((s) => (
                    <li key={s} className="text-xs text-foreground/80 flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-[#88B8B0] flex-shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Transcript */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border/30 flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4" /> Transcript · {call.language}
              </h3>
              <button className="text-xs text-[#B8A0C8] font-semibold hover:underline">Download</button>
            </div>
            <div className="divide-y divide-border/15 max-h-[400px] overflow-y-auto">
              {TRANSCRIPT_SAMPLE.map((t, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-3 flex items-start gap-3 border-l-4 transition-colors hover:bg-muted/20",
                    t.highlight ? HIGHLIGHT_STYLE[t.highlight] : "border-l-transparent"
                  )}
                >
                  <span className="text-[10px] font-mono text-muted-foreground w-12 flex-shrink-0 mt-1">{t.time}</span>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-0.5"
                    style={{ background: t.speaker === "Rep" ? "#B8A0C8" : "#88B8B0" }}>
                    {t.speaker[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-foreground">{t.speaker}</span>
                      {t.highlight && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-foreground/10 text-foreground/70">
                          {HIGHLIGHT_LABEL[t.highlight]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed">{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value, sub }: any) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}25` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="text-2xl font-black text-foreground leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function SentimentChip({ score }: { score: number }) {
  const color = score >= 70 ? "#88B8B0" : score >= 40 ? "#C8A880" : "#C0A0B8";
  const label = score >= 70 ? "Positive" : score >= 40 ? "Neutral" : "Negative";
  return (
    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
      style={{ background: `${color}15`, color, borderColor: `${color}40` }}>
      {label} {score}
    </span>
  );
}
