import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Check, Sparkles, ArrowRight, Users, Wand2, RotateCcw, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTilt } from "@/lib/use-marketing-anim";

type Cycle = "monthly" | "annual";

interface Plan {
  key: string;
  name: string;
  tagline: string;
  monthly: number | null;
  annual: number | null;
  unit: string;
  cta: string;
  ctaHref: string;
  featured?: boolean;
  accent: string;
  badge?: string;
  features: string[];
  limits?: string;
  /** target headcount the quiz uses */
  fitMin: number;
  fitMax: number;
}

const PLANS: Plan[] = [
  {
    key: "starter", name: "Starter", tagline: "For 1–5 reps testing the waters.",
    monthly: 0, annual: 0, fitMin: 1, fitMax: 5,
    unit: "free forever", cta: "Start Free", ctaHref: "/signup?plan=starter",
    accent: "#88B8B0", badge: "Free forever",
    limits: "Up to 5 seats · 1,000 contacts · 100 AI credits/mo",
    features: [
      "Full CRM (Pipeline, Deals, Contacts, Companies)",
      "Daily AI Briefing (5 insights/day)",
      "Up to 50 calls/mo with transcription",
      "1 active marketing sequence",
      "Email support",
    ],
  },
  {
    key: "growth", name: "Growth", tagline: "For 6–25 reps. Most teams pick this.",
    monthly: 539, annual: 449, fitMin: 6, fitMax: 25,
    unit: "SAR / seat / month", cta: "Start 14-day trial", ctaHref: "/signup?plan=growth",
    accent: "#B8A0C8", featured: true, badge: "Most popular",
    features: [
      "Everything in Starter, no contact / AI limits",
      "Power Dialer + AI Voice Agent (basic)",
      "Conversation Intelligence + AI Coach",
      "Bulk enrichment (1K credits/seat/mo)",
      "Marketing AI Strategy Builder + multi-channel",
      "Cultural Intelligence (Khaleeji + RTL)",
      "Workflows + Lead Routing",
      "Priority Arabic + English support",
    ],
  },
  {
    key: "enterprise", name: "Enterprise", tagline: "26+ reps. Regulated industries. Custom contract.",
    monthly: 1079, annual: 899, fitMin: 26, fitMax: 249,
    unit: "SAR / seat / month", cta: "Talk to sales", ctaHref: "/signup?plan=enterprise",
    accent: "#C0A0B8", badge: "KSA enterprise",
    features: [
      "Everything in Growth",
      "In-Kingdom data residency (KSA / UAE region)",
      "Advanced AI Voice Agent (custom Khaleeji models)",
      "Account Hub (ABM) + Forecasting AI + Health Scores",
      "Custom workflow approvals + SLA timers",
      "SSO (SAML, Okta, Azure AD), audit logs, PDPL pack",
      "Named CSM + quarterly business review",
      "Migration & onboarding from Salesforce/HubSpot",
    ],
  },
  {
    key: "sovereign", name: "Sovereign", tagline: "PIF / regulated giants. Single-tenant on-prem.",
    monthly: null, annual: null, fitMin: 250, fitMax: 100000,
    unit: "Custom pricing", cta: "Contact us", ctaHref: "/signup?plan=sovereign",
    accent: "#C8A880", badge: "On-NCA cloud",
    features: [
      "Everything in Enterprise",
      "Single-tenant deployment in NCA-compliant zone",
      "Dedicated GPU pool for AI Workforce",
      "Custom fine-tuned voice + LLM on customer data",
      "On-prem connectors (SAP S/4, Oracle, Aramco SLAs)",
      "Source-code escrow + 99.95% SLA",
    ],
  },
];

const ADDONS = [
  { name: "Extra AI Credits",      price: "SAR 199",    unit: "per 1,000 credits", desc: "Voice transcription, enrichment lookups, AI-drafted email" },
  { name: "Advanced Sandbox",      price: "SAR 1,499",  unit: "/month",            desc: "Full-data clone for testing workflows + integrations" },
  { name: "Migration Service",     price: "SAR 14,900", unit: "one-time",          desc: "We migrate your Salesforce / HubSpot / Zoho data in" },
  { name: "Implementation Lead",   price: "SAR 4,990",  unit: "/month",            desc: "Dedicated KSA-based CSM for your rollout" },
];

const FAQ = [
  { q: "Can I switch plans later?",                   a: "Yes. Upgrade or downgrade anytime — billing prorates automatically." },
  { q: "What is an AI credit?",                       a: "1 credit ≈ 1 enrichment lookup, 1 minute of voice transcription, or 1 LLM-drafted email. Unused credits roll over within an annual term." },
  { q: "Do you offer discounts for non-profits / startups?", a: "Yes — 50% off Growth for verified KSA/GCC startups in their first 3 years and registered non-profits." },
  { q: "Is data really stored in KSA?",               a: "On Enterprise and Sovereign tiers, yes — your data is processed and stored in-Kingdom. Starter and Growth use a UAE region by default." },
  { q: "What about Arabic support?",                  a: "Bilingual at the schema level. Every UI surface, AI prompt, and dashboard speaks Arabic and English natively, RTL by default." },
];

const QUIZ = [
  {
    q: "How many sales reps will use NexFlow?",
    options: [
      { label: "1–5",       weight: { starter: 5, growth: 1, enterprise: 0, sovereign: 0 } },
      { label: "6–25",      weight: { starter: 0, growth: 5, enterprise: 1, sovereign: 0 } },
      { label: "26–250",    weight: { starter: 0, growth: 1, enterprise: 5, sovereign: 1 } },
      { label: "250+",      weight: { starter: 0, growth: 0, enterprise: 1, sovereign: 5 } },
    ],
  },
  {
    q: "Which best describes your data needs?",
    options: [
      { label: "Just getting started",                       weight: { starter: 5, growth: 2, enterprise: 0, sovereign: 0 } },
      { label: "Standard cloud is fine",                     weight: { starter: 1, growth: 5, enterprise: 2, sovereign: 0 } },
      { label: "Need KSA/UAE-region residency",              weight: { starter: 0, growth: 1, enterprise: 5, sovereign: 3 } },
      { label: "Single-tenant / regulated / on-prem",        weight: { starter: 0, growth: 0, enterprise: 1, sovereign: 5 } },
    ],
  },
  {
    q: "Which AI features matter most?",
    options: [
      { label: "Just briefings + simple insights",           weight: { starter: 5, growth: 2, enterprise: 0, sovereign: 0 } },
      { label: "Voice Agent + Conversation Intel",           weight: { starter: 0, growth: 5, enterprise: 3, sovereign: 1 } },
      { label: "Forecast AI, Health Scores, ABM",            weight: { starter: 0, growth: 1, enterprise: 5, sovereign: 2 } },
      { label: "Custom-trained models on our data",          weight: { starter: 0, growth: 0, enterprise: 1, sovereign: 5 } },
    ],
  },
];

function PlanCard({ p, cycle, isRecommended }: { p: Plan; cycle: Cycle; isRecommended: boolean }) {
  const tilt = useTilt(5);
  const price = cycle === "annual" ? p.annual : p.monthly;
  const isCustom = price === null;
  const isFree = price === 0;

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      style={{
        ...tilt.style,
        ...(p.featured || isRecommended
          ? { borderColor: p.accent, boxShadow: `0 12px 28px -10px ${p.accent}55` }
          : {}),
      }}
      className={cn(
        "relative rounded-2xl p-6 border flex flex-col transition-all glass-card group",
        p.featured || isRecommended ? "border-2" : "border-border/40",
      )}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${p.accent}18, transparent 70%)` }}
      />

      <div className="relative flex flex-col h-full">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-3 min-h-[24px]">
          {p.badge && (
            <div
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
              style={{ background: p.featured ? `linear-gradient(135deg,${p.accent},#B8A0C8)` : p.accent }}
            >
              {p.badge}
            </div>
          )}
          {isRecommended && !p.featured && (
            <div className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white inline-flex items-center gap-1 animate-pulse"
              style={{ background: "linear-gradient(135deg,#C8A880,#B8A0C8)" }}>
              <Star className="w-2.5 h-2.5 fill-white" /> Best for you
            </div>
          )}
        </div>

        <div className="text-xl font-black">{p.name}</div>
        <div className="text-xs text-muted-foreground mb-4 min-h-[2.25rem]">{p.tagline}</div>

        <div className="mb-1 min-h-[60px]">
          {isCustom ? (
            <div className="text-3xl font-black">Let's talk</div>
          ) : isFree ? (
            <div className="text-3xl font-black">Free</div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span key={`${p.key}-${cycle}`} className="text-3xl font-black tabular-nums inline-block transition-all"
                style={{ animation: "priceFlip .3s ease both" }}>
                SAR&nbsp;{price}
              </span>
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-0.5">{p.unit}</div>
        </div>

        {p.limits && (
          <div className="text-[11px] text-muted-foreground mt-3 mb-4 italic">{p.limits}</div>
        )}

        <Link href={p.ctaHref}>
          <button
            className={cn(
              "w-full mt-3 mb-4 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 group-hover:scale-[1.02] active:scale-95",
              p.featured || isRecommended ? "text-white shadow-lg" : "border border-border/60 hover:bg-muted/40",
            )}
            style={p.featured || isRecommended ? { background: `linear-gradient(135deg,${p.accent},#88B8B0)` } : undefined}
          >
            {p.cta}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </Link>

        <div className="flex-1 border-t border-border/30 pt-3">
          <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">
            What's included
          </div>
          <ul className="space-y-2">
            {p.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px]">
                <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: p.accent }} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PlanQuiz({ onRecommend, onClose }: { onRecommend: (key: string) => void; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ starter: 0, growth: 0, enterprise: 0, sovereign: 0 });

  const select = (w: any) => {
    const next = { ...scores };
    for (const k of Object.keys(w)) (next as any)[k] += w[k];
    setScores(next);
    if (step + 1 < QUIZ.length) {
      setStep(step + 1);
    } else {
      // pick winner
      const winner = Object.entries(next).sort((a, b) => b[1] - a[1])[0][0];
      onRecommend(winner);
    }
  };

  const reset = () => { setStep(0); setScores({ starter: 0, growth: 0, enterprise: 0, sovereign: 0 }); };

  return (
    <div className="glass-card rounded-2xl border-2 p-6 max-w-2xl mx-auto" style={{ borderColor: "#B8A0C8" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#B8A0C8]/15 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-[#B8A0C8]" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#B8A0C8]">Plan Picker</div>
            <div className="text-base font-black">Help me pick a plan</div>
          </div>
        </div>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">Close ✕</button>
      </div>

      {/* progress */}
      <div className="flex gap-1.5 mb-5">
        {QUIZ.map((_, i) => (
          <div key={i} className={cn("flex-1 h-1.5 rounded-full transition-all", i <= step ? "bg-[#B8A0C8]" : "bg-muted/30")} />
        ))}
      </div>

      <div key={step} style={{ animation: "fadeInUp .3s ease both" }}>
        <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">
          Question {step + 1} of {QUIZ.length}
        </div>
        <div className="text-lg font-black mb-4">{QUIZ[step].q}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {QUIZ[step].options.map((o, i) => (
            <button
              key={i}
              onClick={() => select(o.weight)}
              className="text-left px-4 py-3 rounded-xl border border-border/40 hover:border-[#B8A0C8] hover:bg-[#B8A0C8]/5 transition-all hover:translate-x-1 text-sm font-semibold"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center">
        <button onClick={reset} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-3 h-3" /> Restart
        </button>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [cycle, setCycle] = useState<Cycle>("annual");
  const [seats, setSeats] = useState(10);
  const [showQuiz, setShowQuiz] = useState(false);
  const [recommended, setRecommended] = useState<string | null>(null);

  const seatPlan = useMemo(() => {
    return PLANS.find((p) => seats >= p.fitMin && seats <= p.fitMax) ?? PLANS[1];
  }, [seats]);

  const perSeat = cycle === "annual" ? seatPlan.annual : seatPlan.monthly;
  const seatTotal = perSeat === null ? null : seats * perSeat;
  const seatYearly = seatTotal === null ? null : seatTotal * 12;

  return (
    <div className="space-y-16 pb-12 pt-12 overflow-x-clip">
      <style>{`
        @keyframes fadeInUp { 0% { opacity:0; transform: translateY(8px); } 100% { opacity:1; transform: translateY(0); } }
        @keyframes priceFlip { 0% { opacity:0; transform: translateY(-6px); } 100% { opacity:1; transform: translateY(0); } }
      `}</style>

      {/* Hero */}
      <section className="relative px-4 max-w-[1000px] mx-auto text-center">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-30 animate-pulse"
            style={{ background: "radial-gradient(circle,#B8A0C8,transparent 70%)" }} />
          <div className="absolute top-10 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-30 animate-pulse"
            style={{ background: "radial-gradient(circle,#C8A880,transparent 70%)", animationDelay: "1s" }} />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A880]/10 border border-[#C8A880]/30 mb-4">
          <Sparkles className="w-3 h-3 text-[#C8A880]" />
          <span className="text-[11px] font-black tracking-wider uppercase text-[#C8A880]">Pricing plan</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 leading-[1.05]">
          SAR-priced. Per seat. <span className="bg-gradient-to-r from-[#B8A0C8] to-[#C8A880] bg-clip-text text-transparent">AI included.</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Four plans. No Marketing-Hub vs Sales-Hub vs Service-Hub balkanization. Slide to size your team — we'll do the math.
        </p>

        {/* Toggle + Quiz CTA */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-border/40 bg-muted/20">
            <button
              onClick={() => setCycle("annual")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                cycle === "annual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              Annual <span className="text-[10px] uppercase tracking-wider text-[#88B8B0] ml-1">save 17%</span>
            </button>
            <button
              onClick={() => setCycle("monthly")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                cycle === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              Monthly
            </button>
          </div>
          <button
            onClick={() => { setShowQuiz(true); setRecommended(null); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg,#B8A0C8,#C8A880)" }}
          >
            <Wand2 className="w-3.5 h-3.5" /> Help me pick
          </button>
        </div>
      </section>

      {/* QUIZ */}
      {showQuiz && (
        <section className="px-4">
          {recommended ? (
            <div className="glass-card rounded-2xl border-2 p-6 max-w-2xl mx-auto text-center"
              style={{ borderColor: "#B8A0C8" }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8A0C8]/10 mb-3">
                <Star className="w-3 h-3 text-[#B8A0C8] fill-[#B8A0C8]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#B8A0C8]">Your match</span>
              </div>
              <h3 className="text-2xl font-black mb-2">
                {PLANS.find((p) => p.key === recommended)?.name} fits you best
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                {PLANS.find((p) => p.key === recommended)?.tagline}
              </p>
              <div className="flex items-center justify-center gap-2">
                <Link href={PLANS.find((p) => p.key === recommended)?.ctaHref ?? "/signup"}>
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md"
                    style={{ background: `linear-gradient(135deg,${PLANS.find((p) => p.key === recommended)?.accent},#B8A0C8)` }}>
                    Get started <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <button
                  onClick={() => { setRecommended(null); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold border border-border/40 hover:bg-muted/40"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Re-take
                </button>
              </div>
            </div>
          ) : (
            <PlanQuiz onRecommend={(k) => setRecommended(k)} onClose={() => setShowQuiz(false)} />
          )}
        </section>
      )}

      {/* INTERACTIVE SEAT CALCULATOR */}
      <section className="px-4 max-w-[900px] mx-auto">
        <div className="glass-card rounded-2xl border border-border/30 p-6"
          style={{ background: "linear-gradient(135deg,#B8A0C808,#88B8B008)" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#88B8B0]/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#88B8B0]" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-[#88B8B0]">Seat calculator</div>
              <div className="text-lg font-black">How big is your team?</div>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_220px] gap-5 items-center">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-muted-foreground">Seats</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSeats(Math.max(1, seats - 1))}
                    className="w-7 h-7 rounded-lg border border-border/40 hover:bg-muted/40 text-sm font-bold">−</button>
                  <input
                    type="number" min={1} max={500} value={seats}
                    onChange={(e) => setSeats(Math.max(1, Math.min(500, +e.target.value || 1)))}
                    className="w-16 px-2 py-1 rounded-lg border border-border/40 bg-background text-center text-sm font-black tabular-nums"
                  />
                  <button onClick={() => setSeats(Math.min(500, seats + 1))}
                    className="w-7 h-7 rounded-lg border border-border/40 hover:bg-muted/40 text-sm font-bold">+</button>
                </div>
              </div>
              <input
                type="range" min={1} max={300} value={Math.min(seats, 300)}
                onChange={(e) => setSeats(+e.target.value)}
                className="w-full accent-[#B8A0C8]"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-semibold">
                <span>1</span><span>50</span><span>100</span><span>200</span><span>300+</span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="font-bold" style={{ color: seatPlan.accent }}>{seatPlan.name}</span> is the recommended plan for {seats} seat{seats === 1 ? "" : "s"}.
              </div>
            </div>

            <div className="rounded-xl p-4 border border-border/40 bg-background/60 backdrop-blur text-center">
              <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">
                Your monthly bill
              </div>
              {seatTotal === null ? (
                <div>
                  <div className="text-2xl font-black">Custom</div>
                  <div className="text-[11px] text-muted-foreground">Sovereign tier</div>
                </div>
              ) : seatTotal === 0 ? (
                <div>
                  <div className="text-3xl font-black text-[#88B8B0]">Free</div>
                  <div className="text-[11px] text-muted-foreground">forever</div>
                </div>
              ) : (
                <>
                  <div key={`${seats}-${cycle}`} className="text-3xl font-black tabular-nums" style={{ color: seatPlan.accent, animation: "priceFlip .25s ease both" }}>
                    SAR {seatTotal.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {seatYearly !== null && <>or SAR {seatYearly.toLocaleString()} / year</>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section className="px-4 max-w-[1300px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((p) => (
            <PlanCard key={p.key} p={p} cycle={cycle} isRecommended={recommended === p.key} />
          ))}
        </div>
      </section>

      {/* Add-ons */}
      <section className="px-4 max-w-[1100px] mx-auto">
        <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#88B8B0] mb-2 text-center">Add-ons & customization</div>
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-6">Optional extras — added to any plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ADDONS.map((a, i) => (
            <div key={i} className="group glass-card rounded-xl p-4 border border-border/30 flex items-start gap-4 hover:border-[#88B8B0]/40 hover:translate-y-[-2px] transition-all cursor-default">
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold group-hover:text-[#88B8B0] transition-colors">{a.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-base font-black tabular-nums">{a.price}</div>
                <div className="text-[10px] text-muted-foreground">{a.unit}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ — accordion */}
      <section className="px-4 max-w-[900px] mx-auto">
        <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#B8A0C8] mb-2 text-center">FAQ</div>
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-6">Common questions</h2>
        <FAQAccordion items={FAQ} />
      </section>

      {/* Final CTA */}
      <section className="px-4 max-w-[900px] mx-auto">
        <div className="relative rounded-3xl p-10 sm:p-12 text-center border border-border/30 overflow-hidden"
          style={{ background: "linear-gradient(135deg,#B8A0C815,#88B8B015,#C8A88015)" }}
        >
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-40 animate-pulse"
            style={{ background: "radial-gradient(circle,#B8A0C8,transparent 70%)" }} />
          <div className="relative">
            <Sparkles className="w-9 h-9 mx-auto mb-3 text-[#B8A0C8] animate-pulse" />
            <h3 className="text-3xl sm:text-4xl font-black mb-3">Still deciding?</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
              Start free for 5 seats — no credit card, no time limit. Upgrade only when you outgrow it.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/signup?plan=starter">
                <button className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-sm font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
                  style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}>
                  Start free <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <button
                onClick={() => { setShowQuiz(true); setRecommended(null); window.scrollTo({ top: 200, behavior: "smooth" }); }}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold border border-border/60 hover:bg-muted/40 hover:scale-105 transition-all"
              >
                <Wand2 className="w-4 h-4" /> Help me pick
              </button>
            </div>
          </div>
        </div>
      </section>

      <p className="text-center text-[11px] text-muted-foreground px-4">
        Prices in SAR. USD shown indicatively at SAR 3.75 / USD. Annual term with monthly billing available on request.
      </p>
    </div>
  );
}

function FAQAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="glass-card rounded-xl border border-border/30 overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/20 transition-colors"
            >
              <span className="text-sm font-bold">{f.q}</span>
              <span className={cn("text-lg font-black text-muted-foreground transition-transform", isOpen && "rotate-45")}>+</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-sm text-muted-foreground" style={{ animation: "fadeInUp .25s ease both" }}>
                {f.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
