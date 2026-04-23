import { useState } from "react";
import {
  Bot, Phone, PhoneCall, Play, Pause, Volume2, Settings, Plus,
  Activity, Clock, CheckCircle2, AlertCircle, BarChart3, Mic,
  Languages, Brain, Target, Users, ChevronRight, RefreshCw, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const AGENTS = [
  {
    id: "a1", name: "Layla", role: "Outbound Qualifier — Arabic",
    voice: "Female · Gulf Arabic", status: "live", calls_today: 47, avg_duration: "3:42",
    qualification_rate: 38, language: "Arabic (MSA + Gulf)",
    skills: ["Lead qualification", "Demo booking", "Objection handling"],
    color: "#B8A0C8", model: "Retell AI · GPT-4o", concurrent: 8,
  },
  {
    id: "a2", name: "Adam", role: "Inbound Receptionist — English",
    voice: "Male · Neutral English", status: "live", calls_today: 32, avg_duration: "2:18",
    qualification_rate: 65, language: "English",
    skills: ["Routing", "Info capture", "Appointment booking"],
    color: "#88B8B0", model: "Retell AI · Claude 3.5", concurrent: 12,
  },
  {
    id: "a3", name: "Noor",  role: "Follow-Up Specialist — Bilingual",
    voice: "Female · Bilingual EN/AR", status: "live", calls_today: 23, avg_duration: "4:15",
    qualification_rate: 51, language: "Arabic + English",
    skills: ["Re-engagement", "Pricing discussion", "Closing"],
    color: "#C8A880", model: "Retell AI · GPT-4o", concurrent: 6,
  },
  {
    id: "a4", name: "Faisal", role: "Enterprise SDR — KSA Market",
    voice: "Male · Saudi Arabic", status: "paused", calls_today: 0, avg_duration: "—",
    qualification_rate: 42, language: "Arabic (Saudi)",
    skills: ["C-suite outreach", "Discovery", "Multi-stakeholder"],
    color: "#90B8B8", model: "Retell AI · Claude 3.5", concurrent: 4,
  },
];

const LIVE_CALLS = [
  { id: "lc1", agent: "Layla", contact: "Sara Al-Mansouri", company: "Gulf Ventures", duration: 142, sentiment: "positive", phase: "Discovery", transcript: "...exploring AI sales tools for our portfolio..." },
  { id: "lc2", agent: "Adam", contact: "Tariq Hassan", company: "Inbound caller", duration: 67, sentiment: "neutral", phase: "Qualification", transcript: "...looking for pricing information..." },
  { id: "lc3", agent: "Noor", contact: "Ahmed Al-Rashidi", company: "Riyadh Capital", duration: 234, sentiment: "positive", phase: "Closing", transcript: "...يبدو ممتاز، أرسل لي العقد..." },
];

const VOICES = [
  { id: "v1", name: "Layla", gender: "Female", language: "Arabic Gulf", style: "Warm, professional", samples: 12 },
  { id: "v2", name: "Adam", gender: "Male", language: "English Neutral", style: "Confident, clear", samples: 18 },
  { id: "v3", name: "Noor", gender: "Female", language: "Bilingual AR/EN", style: "Friendly, dynamic", samples: 9 },
  { id: "v4", name: "Faisal", gender: "Male", language: "Arabic Saudi", style: "Authoritative", samples: 7 },
  { id: "v5", name: "Reem", gender: "Female", language: "Arabic Levantine", style: "Soft, persuasive", samples: 5 },
  { id: "v6", name: "Omar", gender: "Male", language: "Arabic Egyptian", style: "Energetic", samples: 4 },
];

export default function VoiceAgentsPage() {
  const [tab, setTab] = useState<"agents" | "live" | "voices">("agents");
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  function playVoice(id: string) {
    setPlayingVoice(id);
    setTimeout(() => setPlayingVoice(null), 2400);
  }

  const totalCalls = AGENTS.reduce((a, x) => a + x.calls_today, 0);
  const liveCount = AGENTS.filter(a => a.status === "live").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#B8A0C8]" />
            AI Voice Agents
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Autonomous voice AI for outbound, inbound, and follow-up · Powered by Retell AI</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-card rounded-xl px-3 py-2 text-center">
            <div className="text-sm font-bold text-[#88B8B0]">{liveCount}/{AGENTS.length}</div>
            <div className="text-[10px] text-muted-foreground">live agents</div>
          </div>
          <div className="glass-card rounded-xl px-3 py-2 text-center">
            <div className="text-sm font-bold text-[#B8A0C8]">{totalCalls}</div>
            <div className="text-[10px] text-muted-foreground">calls today</div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            New Agent
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/40 w-fit">
        {[
          { k: "agents", label: "Agents", icon: Bot },
          { k: "live", label: `Live Calls (${LIVE_CALLS.length})`, icon: Activity },
          { k: "voices", label: "Voice Library", icon: Mic },
        ].map(t => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as any)}
            className={cn("flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all", tab === t.k ? "nf-chameleon-bg text-white" : "text-muted-foreground hover:text-foreground")}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "agents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {AGENTS.map(a => (
            <div key={a.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0 relative" style={{ background: a.color }}>
                  <Bot className="w-6 h-6" />
                  {a.status === "live" && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#88B8B0] border-2 border-background animate-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{a.name}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider",
                      a.status === "live" ? "bg-[#88B8B0]/20 text-[#88B8B0]" : "bg-muted/60 text-muted-foreground")}>
                      {a.status === "live" ? "● Live" : "Paused"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">{a.role}</div>
                  <div className="text-[10px] text-muted-foreground/70 mt-0.5 flex items-center gap-1.5">
                    <Languages className="w-2.5 h-2.5" />
                    {a.voice}
                  </div>
                </div>
                <button className={cn("p-2 rounded-lg transition-colors", a.status === "live" ? "bg-[#C0A0B8]/15 text-[#C0A0B8] hover:bg-[#C0A0B8]/25" : "bg-[#88B8B0]/15 text-[#88B8B0] hover:bg-[#88B8B0]/25")}>
                  {a.status === "live" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 rounded-xl bg-muted/30">
                  <div className="text-lg font-black text-foreground">{a.calls_today}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wide">calls today</div>
                </div>
                <div className="text-center p-2 rounded-xl bg-muted/30">
                  <div className="text-lg font-black text-foreground">{a.avg_duration}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wide">avg time</div>
                </div>
                <div className="text-center p-2 rounded-xl bg-[#88B8B0]/15">
                  <div className="text-lg font-black text-[#88B8B0]">{a.qualification_rate}%</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wide">qualified</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {a.skills.map(s => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">{s}</span>
                ))}
              </div>

              <div className="pt-3 border-t border-border/20 flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><Brain className="w-3 h-3" />{a.model}</span>
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" />Up to {a.concurrent} concurrent</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "live" && (
        <div className="space-y-3">
          {LIVE_CALLS.map(c => {
            const agent = AGENTS.find(a => a.name === c.agent);
            const sentColor = c.sentiment === "positive" ? "#88B8B0" : c.sentiment === "neutral" ? "#B8B880" : "#C0A0B8";
            return (
              <div key={c.id} className="glass-card rounded-2xl p-4 border border-[#88B8B0]/30">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0 relative" style={{ background: agent?.color ?? "#B8A0C8" }}>
                    <Bot className="w-5 h-5" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#88B8B0] border-2 border-background flex items-center justify-center">
                      <PhoneCall className="w-2 h-2 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{c.agent}</span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm text-foreground">{c.contact}</span>
                      <span className="text-xs text-muted-foreground">· {c.company}</span>
                      <span className="ml-auto text-xs font-mono text-[#88B8B0]">
                        {Math.floor(c.duration / 60)}:{(c.duration % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B8A0C8]/15 text-[#B8A0C8] font-medium">{c.phase}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${sentColor}20`, color: sentColor }}>
                        {c.sentiment}
                      </span>
                    </div>
                    <div className="mt-2 px-3 py-2 rounded-lg bg-muted/30 text-xs text-foreground/80 italic" dir="auto">
                      "{c.transcript}"
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button className="p-2 rounded-lg bg-[#88B8B0]/15 text-[#88B8B0] hover:bg-[#88B8B0]/25 transition-colors" title="Listen in">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 rounded-lg bg-muted/40 text-foreground hover:bg-muted/60 transition-colors" title="Take over">
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "voices" && (
        <div>
          <p className="text-xs text-muted-foreground mb-3">Production-ready voices fine-tuned for GCC and Arabic markets · Add custom voices via API</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VOICES.map(v => (
              <div key={v.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#B8A0C8]/20 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-[#B8A0C8]" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{v.name}</div>
                      <div className="text-[10px] text-muted-foreground">{v.gender} · {v.samples} samples</div>
                    </div>
                  </div>
                  <button onClick={() => playVoice(v.id)} className={cn("p-2 rounded-full transition-all", playingVoice === v.id ? "nf-chameleon-bg text-white" : "bg-muted/60 text-foreground hover:bg-muted")}>
                    {playingVoice === v.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-xs text-muted-foreground mb-1"><Languages className="w-3 h-3 inline mr-1" />{v.language}</div>
                <div className="text-xs text-foreground/70">{v.style}</div>
                {playingVoice === v.id && (
                  <div className="mt-3 flex items-center gap-1">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="w-1 rounded-full bg-[#B8A0C8]" style={{ height: `${10 + Math.random() * 20}px`, animation: `pulse 0.4s ease-in-out ${i * 0.05}s infinite alternate` }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
