import { useState } from "react";
import { Link } from "wouter";
import {
  GitBranch, Mail, MessageSquare, Phone, Clock, Plus, Play, Pause, MoreHorizontal,
  ArrowRight, CheckCircle2, TrendingUp, Users, Calendar, Sparkles, Zap, Globe,
  Target, FileText, ChevronRight, BarChart3, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SEQUENCES = [
  {
    id: "s1",
    name: "GCC Enterprise Cold Outreach",
    description: "5-touch cadence for new C-level prospects in KSA & UAE",
    status: "running",
    enrolled: 47,
    completed: 12,
    replied: 14,
    meetings: 6,
    steps: [
      { type: "email", label: "Initial outreach (English/Arabic)", delay: 0, day: "Day 1" },
      { type: "wait", label: "Wait 2 business days", delay: 2 },
      { type: "linkedin", label: "Connection request + note", delay: 0, day: "Day 3" },
      { type: "wait", label: "Wait 3 business days", delay: 3 },
      { type: "call", label: "AI Voice Agent — qualify", delay: 0, day: "Day 6" },
      { type: "wait", label: "Wait 2 business days", delay: 2 },
      { type: "whatsapp", label: "WhatsApp soft check-in", delay: 0, day: "Day 8" },
      { type: "wait", label: "Wait 4 business days", delay: 4 },
      { type: "email", label: "Final breakup email", delay: 0, day: "Day 12" },
    ],
    color: "#B8A0C8",
  },
  {
    id: "s2",
    name: "Dormant Lead Re-engagement",
    description: "Win-back sequence for leads silent >60 days",
    status: "running",
    enrolled: 89,
    completed: 31,
    replied: 19,
    meetings: 4,
    steps: [
      { type: "email", label: "Pattern interrupt — \"Wrong person?\"", delay: 0, day: "Day 1" },
      { type: "wait", label: "Wait 4 days", delay: 4 },
      { type: "email", label: "Value drop — case study", delay: 0, day: "Day 5" },
      { type: "wait", label: "Wait 5 days", delay: 5 },
      { type: "whatsapp", label: "Cultural personalisation", delay: 0, day: "Day 10" },
      { type: "wait", label: "Wait 7 days", delay: 7 },
      { type: "email", label: "Permission to close file", delay: 0, day: "Day 17" },
    ],
    color: "#88B8B0",
  },
  {
    id: "s3",
    name: "Post-Demo Follow-up",
    description: "Trigger after meeting completed — accelerate to proposal",
    status: "running",
    enrolled: 23,
    completed: 8,
    replied: 18,
    meetings: 0,
    steps: [
      { type: "email", label: "Recap + recording link", delay: 0, day: "Day 1 — 1 hour after meeting" },
      { type: "wait", label: "Wait 2 days", delay: 2 },
      { type: "email", label: "Proposal + pricing options", delay: 0, day: "Day 3" },
      { type: "wait", label: "Wait 3 days", delay: 3 },
      { type: "call", label: "Decision call task", delay: 0, day: "Day 6" },
    ],
    color: "#C8A880",
  },
  {
    id: "s4",
    name: "Ramadan Relationship Touchpoint",
    description: "Culturally-aware soft engagement during Ramadan",
    status: "scheduled",
    enrolled: 0,
    completed: 0,
    replied: 0,
    meetings: 0,
    steps: [
      { type: "whatsapp", label: "Ramadan Kareem greeting (personalised)", delay: 0, day: "Day 1" },
      { type: "wait", label: "Wait 14 days", delay: 14 },
      { type: "email", label: "Eid Mubarak + soft business follow-up", delay: 0, day: "Day 15" },
    ],
    color: "#C0A0B8",
  },
  {
    id: "s5",
    name: "Champion Multi-Threader",
    description: "When champion identified, sequence stakeholders",
    status: "draft",
    enrolled: 0,
    completed: 0,
    replied: 0,
    meetings: 0,
    steps: [
      { type: "email", label: "Champion intro request", delay: 0, day: "Day 1" },
      { type: "wait", label: "Wait 2 days", delay: 2 },
      { type: "linkedin", label: "Connect with each stakeholder", delay: 0, day: "Day 3" },
      { type: "email", label: "Personalised exec value props", delay: 0, day: "Day 4" },
    ],
    color: "#90B8B8",
  },
  {
    id: "s6",
    name: "Inbound MQL Qualifier",
    description: "Auto-enrolls when web form submitted with high intent",
    status: "running",
    enrolled: 134,
    completed: 87,
    replied: 51,
    meetings: 22,
    steps: [
      { type: "email", label: "Instant value-add response", delay: 0, day: "Day 1 — 5 min" },
      { type: "wait", label: "Wait 1 day", delay: 1 },
      { type: "call", label: "AI agent qualify call", delay: 0, day: "Day 2" },
      { type: "wait", label: "Wait 2 days", delay: 2 },
      { type: "email", label: "Calendar booking link", delay: 0, day: "Day 4" },
    ],
    color: "#B8B880",
  },
];

const STEP_META: Record<string, { icon: any; color: string; label: string }> = {
  email:    { icon: Mail,          color: "#B8A0C8", label: "Email" },
  call:     { icon: Phone,         color: "#88B8B0", label: "Call" },
  whatsapp: { icon: MessageSquare, color: "#90B8B8", label: "WhatsApp" },
  linkedin: { icon: Globe,         color: "#C8A880", label: "LinkedIn" },
  wait:     { icon: Clock,         color: "#9aa0a6", label: "Wait" },
};

const STATUS_STYLE: Record<string, string> = {
  running:   "bg-[#88B8B0]/15 text-[#88B8B0] border-[#88B8B0]/30",
  paused:    "bg-[#C8A880]/15 text-[#C8A880] border-[#C8A880]/30",
  scheduled: "bg-[#B8A0C8]/15 text-[#B8A0C8] border-[#B8A0C8]/30",
  draft:     "bg-muted/40 text-muted-foreground border-border/40",
};

export default function SequencesPage() {
  const [selected, setSelected] = useState<string>(SEQUENCES[0].id);
  const seq = SEQUENCES.find((s) => s.id === selected) ?? SEQUENCES[0];
  const totalEnrolled = SEQUENCES.reduce((a, s) => a + s.enrolled, 0);
  const totalReplied = SEQUENCES.reduce((a, s) => a + s.replied, 0);
  const totalMeetings = SEQUENCES.reduce((a, s) => a + s.meetings, 0);
  const replyRate = totalEnrolled ? Math.round((totalReplied / totalEnrolled) * 100) : 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <GitBranch className="w-7 h-7 text-[#B8A0C8]" />
            <h1 className="text-3xl font-black text-foreground">Sequences</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Multi-step cadences across email, calls, WhatsApp, and LinkedIn — auto-enrolls leads, auto-pauses on reply, and AI-personalises every touch in English & Arabic.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl nf-chameleon-bg text-white text-sm font-semibold shadow-md hover:opacity-90">
          <Plus className="w-4 h-4" />
          New Sequence
        </button>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users}        color="#B8A0C8" label="Active enrolled"   value={totalEnrolled.toString()}      sub={`across ${SEQUENCES.filter(s=>s.status==="running").length} sequences`} />
        <StatCard icon={MessageSquare}color="#88B8B0" label="Reply rate"        value={`${replyRate}%`}               sub="industry avg 21%" />
        <StatCard icon={Calendar}     color="#C8A880" label="Meetings booked"   value={totalMeetings.toString()}      sub="this period" />
        <StatCard icon={Sparkles}     color="#C0A0B8" label="AI-personalised"   value="100%"                          sub="every step localised" />
      </div>

      {/* Two-column: list + detail */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sequence list */}
        <div className="col-span-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Your Sequences</h2>
            <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter
            </button>
          </div>
          {SEQUENCES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={cn(
                "w-full glass-card rounded-xl p-4 text-left transition-all border-2",
                selected === s.id
                  ? "border-[#B8A0C8]/40 shadow-md"
                  : "border-transparent hover:border-border/40"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}25` }}>
                  <GitBranch className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-foreground truncate">{s.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{s.description}</p>
                  <div className="flex items-center gap-2 text-[11px] flex-wrap">
                    <span className={cn("px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border", STATUS_STYLE[s.status])}>
                      {s.status}
                    </span>
                    <span className="text-muted-foreground">{s.steps.filter((x:any)=>x.type!=="wait").length} steps</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-foreground/80 font-semibold">{s.enrolled} enrolled</span>
                    {s.replied > 0 && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-[#88B8B0] font-semibold">{Math.round((s.replied/Math.max(s.enrolled,1))*100)}% reply</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Sequence detail */}
        <div className="col-span-7">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border/30 flex items-start justify-between gap-3" style={{ background: `${seq.color}10` }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-black text-foreground">{seq.name}</h2>
                  <span className={cn("px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border text-[10px]", STATUS_STYLE[seq.status])}>
                    {seq.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{seq.description}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {seq.status === "running" ? (
                  <button className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground" title="Pause"><Pause className="w-4 h-4" /></button>
                ) : (
                  <button className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground" title="Activate"><Play className="w-4 h-4" /></button>
                )}
                <button className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Performance bar */}
            <div className="grid grid-cols-4 divide-x divide-border/20 border-b border-border/20">
              <Metric label="Enrolled"  value={seq.enrolled} />
              <Metric label="Completed" value={seq.completed} />
              <Metric label="Replied"   value={seq.replied}   accent="#88B8B0" />
              <Metric label="Meetings"  value={seq.meetings}  accent="#C8A880" />
            </div>

            {/* Steps timeline */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Cadence</h3>
                <button className="text-xs text-[#B8A0C8] font-semibold hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add step
                </button>
              </div>
              <div className="space-y-2">
                {seq.steps.map((step, i) => {
                  const meta = STEP_META[step.type];
                  const Icon = meta.icon;
                  if (step.type === "wait") {
                    return (
                      <div key={i} className="flex items-center gap-3 py-1 ml-6">
                        <div className="w-px h-6 bg-border/40" />
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground italic">{step.label}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors group">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${meta.color}25` }}>
                        <Icon className="w-4 h-4" style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>{meta.label}</span>
                          {step.day && <span className="text-[10px] text-muted-foreground">· {step.day}</span>}
                        </div>
                        <div className="text-sm font-medium text-foreground">{step.label}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  );
                })}
              </div>

              {/* AI suggestion */}
              <div className="mt-4 p-3 rounded-xl border border-[#B8A0C8]/30 bg-[#B8A0C8]/5 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#B8A0C8] flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <span className="font-bold text-[#B8A0C8]">AI suggestion:</span>{" "}
                  <span className="text-foreground/80">
                    Reply rate would improve ~14% if you added a WhatsApp touch on Day 4 — your KSA prospects pick up WhatsApp 3.2× more than email cold opens.
                  </span>
                </div>
                <button className="text-[10px] font-bold text-[#B8A0C8] hover:underline whitespace-nowrap">Apply</button>
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="mt-4 glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4" /> Sequence library
              </h3>
              <Link href="/templates"><span className="text-xs text-[#B8A0C8] hover:underline cursor-pointer">Browse all 24 templates →</span></Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Banking sector outreach", icon: Target,  color: "#88B8B0" },
                { name: "Government tender follow-up", icon: Zap, color: "#C8A880" },
                { name: "Family office introduction", icon: Sparkles, color: "#B8A0C8" },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.name} className="text-left p-3 rounded-xl border border-border/30 hover:border-[#B8A0C8]/40 hover:bg-muted/20 transition-all">
                    <Icon className="w-4 h-4 mb-2" style={{ color: t.color }} />
                    <div className="text-xs font-semibold text-foreground">{t.name}</div>
                  </button>
                );
              })}
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

function Metric({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="p-4 text-center">
      <div className="text-2xl font-black" style={{ color: accent ?? "currentColor" }}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-1">{label}</div>
    </div>
  );
}
