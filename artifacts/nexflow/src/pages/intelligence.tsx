import { useContacts, useSignals, useDeals } from "@/hooks/useApi";
import { Star, Brain, TrendingUp, Zap, ArrowUp, ArrowDown, Minus, Target, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const INTENT_LABELS: Record<number, { label: string; color: string; bg: string; icon: any }> = {
  5: { label: "Buying Now", color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/15", icon: CheckCircle2 },
  4: { label: "High Intent", color: "text-[#B8B880]", bg: "bg-[#B8B880]/15", icon: TrendingUp },
  3: { label: "Evaluating", color: "text-[#C8A880]", bg: "bg-[#C8A880]/15", icon: Target },
  2: { label: "Researching", color: "text-[#B8A0C8]", bg: "bg-[#B8A0C8]/15", icon: Brain },
  1: { label: "Cold", color: "text-muted-foreground", bg: "bg-muted/30", icon: Minus },
};

function intentLevel(score: number) {
  if (score >= 85) return 5;
  if (score >= 70) return 4;
  if (score >= 55) return 3;
  if (score >= 40) return 2;
  return 1;
}

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#88B8B0" : score >= 60 ? "#B8B880" : score >= 40 ? "#C8A880" : "#C0A0B8";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="3.5" className="text-muted/30" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="3.5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-black text-foreground leading-none">{score}</span>
        <span className="text-[8px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function ScoringFactor({ label, score, weight }: { label: string; score: number; weight: string }) {
  const color = score >= 80 ? "#88B8B0" : score >= 60 ? "#B8B880" : "#C0A0B8";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xs font-semibold text-foreground">{score}</span>
        </div>
        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground/60 w-8 text-right flex-shrink-0">{weight}</span>
    </div>
  );
}

export default function IntelligencePage() {
  const { data: contactsData, isLoading } = useContacts();
  const { data: signalsData } = useSignals();
  const { data: dealsData } = useDeals();
  const contacts = contactsData?.contacts ?? [];
  const signals = signalsData?.signals ?? [];
  const deals = dealsData?.deals ?? [];

  const scoringFactors = [
    { label: "Title & Decision Authority", score: 85, weight: "25%" },
    { label: "Company Size & Fit", score: 78, weight: "20%" },
    { label: "Engagement Activity", score: 91, weight: "20%" },
    { label: "Signal Score (Funding/Hiring)", score: 88, weight: "15%" },
    { label: "Deal Stage Velocity", score: 72, weight: "10%" },
    { label: "Response Rate", score: 65, weight: "10%" },
  ];

  const hotContacts = [...contacts].sort((a: any, b: any) => (b.lead_score ?? 0) - (a.lead_score ?? 0));
  const riskContacts = [...contacts].filter((c: any) => (c.lead_score ?? 0) < 65);
  const newSignalsCount = signals.filter((s: any) => s.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Star className="w-6 h-6 text-[#B8B880]" />
            Lead Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">AI-powered scoring, intent detection, and pipeline intelligence</p>
        </div>
        <div className="flex gap-2">
          <div className="glass-card rounded-xl px-3 py-2 text-center">
            <div className="text-lg font-bold text-[#88B8B0]">{contacts.length}</div>
            <div className="text-[10px] text-muted-foreground">Tracked</div>
          </div>
          <div className="glass-card rounded-xl px-3 py-2 text-center">
            <div className="text-lg font-bold text-[#B8B880]">{newSignalsCount}</div>
            <div className="text-[10px] text-muted-foreground">New signals</div>
          </div>
          <div className="glass-card rounded-xl px-3 py-2 text-center">
            <div className="text-lg font-bold text-[#C8A880]">{riskContacts.length}</div>
            <div className="text-[10px] text-muted-foreground">At risk</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Lead Scoring Leaderboard</h2>
            <span className="text-xs text-muted-foreground">Updated by AI · 2h ago</span>
          </div>
          <div className="space-y-2">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => <div key={i} className="h-14 bg-muted/40 rounded-xl animate-pulse" />)
            ) : hotContacts.map((c: any, idx: number) => {
              const score = c.lead_score ?? 0;
              const level = intentLevel(score);
              const cfg = INTENT_LABELS[level];
              const Icon = cfg.icon;
              const contactDeals = deals.filter((d: any) => d.contact_id === c.id);
              return (
                <Link key={c.id} href={`/contacts/${c.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="text-sm font-bold text-muted-foreground/40 w-5 text-center flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="w-9 h-9 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(c.first_name?.[0] ?? "") + (c.last_name?.[0] ?? "")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground group-hover:text-[#B8A0C8] transition-colors">
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">{c.title} · {c.company_name}</div>
                    </div>
                    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0", cfg.bg, cfg.color)}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </div>
                    {contactDeals.length > 0 && (
                      <div className="text-xs text-muted-foreground flex-shrink-0 hidden lg:block">
                        ${((contactDeals[0].value ?? 0) / 100).toLocaleString()}
                      </div>
                    )}
                    <ScoreRing score={score} size={44} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Scoring Model */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-[#B8A0C8]" />
              <h2 className="font-semibold text-foreground">AI Scoring Model</h2>
            </div>
            <div className="space-y-3">
              {scoringFactors.map(f => (
                <ScoringFactor key={f.label} {...f} />
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-muted/30 text-xs text-muted-foreground">
              Model trained on 12,400+ B2B deals across GCC markets. Updated weekly.
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-[#C8A880]" />
              <h2 className="font-semibold text-foreground">At-Risk Contacts</h2>
            </div>
            <div className="space-y-2">
              {riskContacts.length === 0 ? (
                <p className="text-xs text-muted-foreground">No at-risk contacts</p>
              ) : riskContacts.map((c: any) => (
                <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#C8A880]/10 border border-[#C8A880]/20">
                  <div className="w-6 h-6 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                    {c.first_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{c.first_name} {c.last_name}</div>
                    <div className="text-[10px] text-muted-foreground">Score: {c.lead_score}</div>
                  </div>
                  <ArrowDown className="w-3 h-3 text-[#C8A880]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Intent Signals Matrix */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Buying Intent Matrix</h2>
          <Zap className="w-4 h-4 text-[#B8B880]" />
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[5, 4, 3, 2, 1].map(level => {
            const cfg = INTENT_LABELS[level];
            const Icon = cfg.icon;
            const count = hotContacts.filter((c: any) => intentLevel(c.lead_score ?? 0) === level).length;
            return (
              <div key={level} className={cn("rounded-xl p-4 text-center", cfg.bg)}>
                <Icon className={cn("w-5 h-5 mx-auto mb-2", cfg.color)} />
                <div className={cn("text-2xl font-black mb-1", cfg.color)}>{count}</div>
                <div className="text-xs text-muted-foreground font-medium">{cfg.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
