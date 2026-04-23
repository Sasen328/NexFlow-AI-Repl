import {
  Users, TrendingUp, Phone, Mail, Target, Award, BarChart3,
  ChevronUp, ChevronDown, Minus, Star, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCalls, useDeals, useActivities } from "@/hooks/useApi";

const REPS = [
  {
    id: "r1", name: "Khalid Al-Zahrani", initials: "KZ", role: "Senior AE — KSA",
    avatar: "#B8A0C8", deals: 4, pipeline: 6750000, won: 516000, callScore: 86,
    callCount: 12, emails: 34, meetings: 8, quota: 8000000, trend: "up",
    skills: ["Enterprise", "Arabic", "Closing"], languages: ["Arabic", "English"],
  },
  {
    id: "r2", name: "Nadia Al-Farhan", initials: "NF", role: "AE — UAE & Gulf",
    avatar: "#88B8B0", deals: 3, pipeline: 4895000, won: 396000, callScore: 91,
    callCount: 9, emails: 28, meetings: 6, quota: 5000000, trend: "up",
    skills: ["SaaS", "C-Suite", "Demo"], languages: ["Arabic", "English", "French"],
  },
  {
    id: "r3", name: "Omar Bin-Rashid", initials: "OR", role: "BDR — Outbound",
    avatar: "#C8A880", deals: 2, pipeline: 1045000, won: 0, callScore: 74,
    callCount: 31, emails: 87, meetings: 4, quota: 2000000, trend: "neutral",
    skills: ["Cold Outreach", "Prospecting"], languages: ["Arabic", "English"],
  },
  {
    id: "r4", name: "Hessa Al-Muhairi", initials: "HM", role: "AE — Saudi Enterprise",
    avatar: "#90B8B8", deals: 2, pipeline: 2255000, won: 120000, callScore: 79,
    callCount: 7, emails: 19, meetings: 5, quota: 3000000, trend: "down",
    skills: ["Negotiation", "Legal", "Compliance"], languages: ["Arabic", "English"],
  },
];

function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
    </div>
  );
}

function QuotaGauge({ pipeline, quota, color }: { pipeline: number; quota: number; color: string }) {
  const pct = Math.min((pipeline / quota) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Pipeline</span>
        <span className="font-medium" style={{ color }}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
        <span>${(pipeline / 100).toLocaleString()}</span>
        <span>Goal: ${(quota / 100).toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const totalPipeline = REPS.reduce((a, r) => a + r.pipeline, 0);
  const totalWon = REPS.reduce((a, r) => a + r.won, 0);
  const avgCallScore = Math.round(REPS.reduce((a, r) => a + r.callScore, 0) / REPS.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-[#B8A0C8]" />
            Team Performance
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Rep leaderboard, call scores, and pipeline attainment</p>
        </div>
        <div className="flex gap-2">
          <div className="glass-card rounded-xl px-3 py-2 text-center">
            <div className="text-sm font-bold text-[#88B8B0]">{REPS.length}</div>
            <div className="text-[10px] text-muted-foreground">Reps</div>
          </div>
          <div className="glass-card rounded-xl px-3 py-2 text-center">
            <div className="text-sm font-bold text-[#B8A0C8]">${(totalPipeline / 100).toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">Team pipeline</div>
          </div>
          <div className="glass-card rounded-xl px-3 py-2 text-center">
            <div className="text-sm font-bold text-[#C8A880]">{avgCallScore}/100</div>
            <div className="text-[10px] text-muted-foreground">Avg call score</div>
          </div>
        </div>
      </div>

      {/* Team Leaderboard */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C8A880]" />
            Rep Leaderboard
          </h2>
          <span className="text-xs text-muted-foreground">Q2 2026</span>
        </div>
        <div className="space-y-3">
          {REPS.sort((a, b) => b.pipeline - a.pipeline).map((rep, idx) => (
            <div key={rep.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/20 transition-colors">
              <div className="text-lg font-black text-muted-foreground/30 w-6 text-center flex-shrink-0">{idx + 1}</div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: rep.avatar }}>
                {rep.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{rep.name}</span>
                  {rep.trend === "up" ? <ChevronUp className="w-3.5 h-3.5 text-[#88B8B0]" /> :
                    rep.trend === "down" ? <ChevronDown className="w-3.5 h-3.5 text-destructive" /> :
                      <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
                <div className="text-xs text-muted-foreground">{rep.role}</div>
              </div>
              <div className="hidden md:block text-center flex-shrink-0">
                <div className="text-sm font-bold text-[#B8A0C8]">{rep.deals}</div>
                <div className="text-[10px] text-muted-foreground">deals</div>
              </div>
              <div className="hidden lg:block text-center flex-shrink-0">
                <div className="text-sm font-bold text-foreground">${(rep.pipeline / 100).toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">pipeline</div>
              </div>
              <div className="flex-shrink-0 w-12">
                <div className="text-xs font-bold text-center mb-1" style={{ color: rep.callScore >= 85 ? "#88B8B0" : rep.callScore >= 75 ? "#B8B880" : "#C0A0B8" }}>
                  {rep.callScore}
                </div>
                <ScoreBar value={rep.callScore} max={100} color={rep.callScore >= 85 ? "#88B8B0" : rep.callScore >= 75 ? "#B8B880" : "#C0A0B8"} />
                <div className="text-[9px] text-center text-muted-foreground mt-0.5">call score</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rep Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {REPS.map(rep => (
          <div key={rep.id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: rep.avatar }}>
                {rep.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground">{rep.name}</div>
                <div className="text-xs text-muted-foreground">{rep.role}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {rep.languages.map(l => (
                    <span key={l} className="text-[9px] px-1.5 py-0.5 rounded bg-[#B8A0C8]/15 text-[#B8A0C8] font-medium">{l}</span>
                  ))}
                </div>
              </div>
              <div className="text-center flex-shrink-0">
                <div className="text-xl font-black" style={{ color: rep.callScore >= 85 ? "#88B8B0" : rep.callScore >= 75 ? "#B8B880" : "#C0A0B8" }}>
                  {rep.callScore}
                </div>
                <div className="text-[9px] text-muted-foreground">call score</div>
              </div>
            </div>

            <QuotaGauge pipeline={rep.pipeline} quota={rep.quota} color={rep.avatar} />

            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: Phone, label: "Calls", value: rep.callCount, color: "#88B8B0" },
                { icon: Mail, label: "Emails", value: rep.emails, color: "#B8A0C8" },
                { icon: Users, label: "Meetings", value: rep.meetings, color: "#C8A880" },
              ].map(m => (
                <div key={m.label} className="text-center p-2 rounded-xl bg-muted/30">
                  <m.icon className="w-4 h-4 mx-auto mb-1" style={{ color: m.color }} />
                  <div className="text-sm font-bold text-foreground">{m.value}</div>
                  <div className="text-[10px] text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
              {rep.skills.map(s => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Team Activity Heatmap */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          Team Activity This Week
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, di) => (
            <div key={day} className="text-center">
              <div className="text-xs text-muted-foreground mb-2">{day}</div>
              {REPS.map((rep, ri) => {
                const intensity = Math.random();
                const color = rep.avatar;
                return (
                  <div
                    key={rep.id}
                    className="h-6 rounded mb-1 transition-all hover:scale-105 cursor-pointer"
                    style={{ background: `${color}${intensity > 0.6 ? "CC" : intensity > 0.3 ? "66" : "22"}` }}
                    title={`${rep.initials} · ${day}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-3 flex-wrap">
          {REPS.map(rep => (
            <div key={rep.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: rep.avatar }} />
              {rep.initials}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
