import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight, CheckCircle2, Building2, Users, Shield, Zap,
  Globe, PhoneCall, BarChart3, Clock, Star, ChevronRight,
} from "lucide-react";
import { NexFlowWordmark } from "@/components/layout/NexFlowLogo";

const FEATURES = [
  { icon: Zap,        title: "AI Voice Agent",       desc: "Khaleeji-dialect AI calls your leads 24/7 — no extra cost." },
  { icon: Globe,      title: "Bilingual by default",  desc: "Arabic + English UI, documents, and AI outputs out of the box." },
  { icon: Shield,     title: "PDPL compliant",        desc: "In-Kingdom data residency. NCA-aligned. Audit trail included." },
  { icon: BarChart3,  title: "360° AI Briefing",      desc: "Every rep starts their day with a personalised AI summary." },
  { icon: PhoneCall,  title: "Power Dialer",          desc: "Preview → Auto → AI Agent modes with live coaching." },
  { icon: Users,      title: "Unlimited seats",       desc: "Flat per-org pricing — no per-seat shock at renewal time." },
];

const TIERS = [
  { label: "50–200 reps",  color: "#B8A0C8" },
  { label: "200–1 000 reps", color: "#88B8B0", badge: "Most popular" },
  { label: "1 000 + reps", color: "#C8A880" },
];

const STEPS = [
  { n: "01", title: "Submit request",   desc: "Tell us your team size, stack, and timeline." },
  { n: "02", title: "Discovery call",   desc: "30-minute call with our GCC implementation team." },
  { n: "03", title: "Custom proposal",  desc: "Tailored pricing, migration plan, and SLA." },
  { n: "04", title: "Live in 2 weeks",  desc: "Full white-glove setup with live training sessions." },
];

type FieldId = "company" | "name" | "role" | "size" | "country" | "notes";
const FIELDS: { id: FieldId; label: string; placeholder: string; type: string; options?: string[] }[] = [
  { id: "company",  label: "Company name",   placeholder: "e.g. ACME Gulf LLC",          type: "text" },
  { id: "name",     label: "Your full name",  placeholder: "e.g. Khalid Al-Otaibi",       type: "text" },
  { id: "role",     label: "Your title",      placeholder: "e.g. VP Sales",               type: "text" },
  { id: "size",     label: "Sales team size", placeholder: "Select",                      type: "select",
    options: ["1–10 reps", "10–50 reps", "50–200 reps", "200–1 000 reps", "1 000 + reps"] },
  { id: "country",  label: "Primary country", placeholder: "Select",                      type: "select",
    options: ["Saudi Arabia", "UAE", "Kuwait", "Qatar", "Bahrain", "Oman", "Other GCC"] },
  { id: "notes",    label: "Current stack (optional)", placeholder: "e.g. Salesforce + HubSpot + Aircall", type: "text" },
];

export default function EnterprisePage() {
  const [form, setForm] = useState<Record<FieldId, string>>({
    company: "", name: "", role: "", size: "", country: "", notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function set(id: FieldId, v: string) { setForm((f) => ({ ...f, [id]: v })); }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 800);
  }

  return (
    <div className="relative min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0" style={{ background:"linear-gradient(160deg,#F9F5FF 0%,#F4FBF9 50%,#FDF8F2 100%)" }} />
          <div className="absolute -top-40 -left-24 w-[520px] h-[520px] rounded-full opacity-20 blur-3xl" style={{ background:"#B8A0C8" }} />
          <div className="absolute -top-20 right-0 w-[480px] h-[480px] rounded-full opacity-15 blur-3xl" style={{ background:"#C8A880" }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[420px] h-[300px] rounded-full opacity-15 blur-3xl" style={{ background:"#88B8B0" }} />
        </div>

        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur border border-[#C8A880]/30 text-xs font-semibold tracking-[0.18em] text-[#6B4E2A] uppercase mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8A880] animate-pulse" />
            Enterprise Deployment
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-[#1F1B2E] leading-tight mb-5">
            Built for GCC enterprises.<br />
            <span className="bg-gradient-to-r from-[#B8A0C8] via-[#88B8B0] to-[#C8A880] bg-clip-text text-transparent">
              Ready in two weeks.
            </span>
          </h1>

          <p className="text-lg text-[#5A4A6E] max-w-2xl mx-auto leading-relaxed mb-10">
            Replace your entire Salesforce + HubSpot + Aircall + Apollo stack with one bilingual, KSA-resident,
            AI-native CRM — priced in SAR, flat per organisation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {["PDPL compliant", "In-Kingdom data", "Arabic + English", "Unlimited seats", "White-glove setup"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#B8A0C8]/25 text-xs font-semibold text-[#5A4A6E]">
                <CheckCircle2 className="w-3 h-3 text-[#88B8B0]" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-black text-center text-[#1F1B2E] mb-2">Everything included. No bolt-on add-ons.</h2>
        <p className="text-sm text-center text-muted-foreground mb-10">One platform, one seat price — voice AI, enrichment, power dialer, and analytics all bundled.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/40 bg-card p-6 hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background:"linear-gradient(135deg,#B8A0C820,#88B8B020)" }}>
                <f.icon className="w-4 h-4" style={{ color:"#B8A0C8" }} />
              </div>
              <div className="font-bold text-sm mb-1">{f.title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ENTERPRISE TIERS ──────────────────────────────────── */}
      <section className="border-t border-border/30 bg-gradient-to-b from-[#FBF7FF] to-white">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-black text-[#1F1B2E] mb-2">Enterprise plans scale with you</h2>
          <p className="text-sm text-muted-foreground mb-10">All tiers include the full platform. Pricing is in SAR, billed annually.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {TIERS.map((t) => (
              <div key={t.label} className="relative rounded-2xl border-2 p-6 text-left"
                style={{ borderColor:`${t.color}40`, background:`${t.color}08` }}>
                {t.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{ background:t.color }}>
                    {t.badge}
                  </span>
                )}
                <div className="text-sm font-bold mb-1" style={{ color:t.color }}>{t.label}</div>
                <div className="text-2xl font-black text-[#1F1B2E] mb-2">Custom</div>
                <div className="text-xs text-muted-foreground mb-4">Flat per-org · includes all features · SAR invoicing</div>
                {["Full platform access","AI Voice Agent included","Dedicated CSM","SLA-backed support","PDPL audit report"].map((b) => (
                  <div key={b} className="flex items-center gap-2 text-xs mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color:t.color }} />
                    {b}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-black text-center text-[#1F1B2E] mb-2">From request to live — 2 weeks</h2>
        <p className="text-sm text-center text-muted-foreground mb-10">Our GCC implementation team handles everything.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-full w-full h-px -translate-y-px z-0"
                  style={{ background:"linear-gradient(90deg,#B8A0C840,transparent)" }} />
              )}
              <div className="relative z-10 rounded-2xl border border-border/40 bg-card p-5">
                <div className="text-2xl font-black mb-2" style={{ color:"#B8A0C8" }}>{s.n}</div>
                <div className="font-bold text-sm mb-1">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REQUEST FORM ──────────────────────────────────────── */}
      <section className="border-t border-border/30 bg-gradient-to-b from-white to-[#FBF7FF]">
        <div className="max-w-2xl mx-auto px-6 py-20">
          {submitted ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background:"linear-gradient(135deg,#B8A0C8,#88B8B0)" }}>
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-[#1F1B2E] mb-3">Request received</h2>
              <p className="text-[#5A4A6E] mb-6">
                Our enterprise team will reach out within one business day to schedule your discovery call.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/welcome">
                  <button className="px-5 py-2.5 rounded-full border border-border/50 text-sm font-semibold hover:bg-muted/40 transition-colors">
                    Back to home
                  </button>
                </Link>
                <Link href="/signin">
                  <button className="px-5 py-2.5 rounded-full text-white text-sm font-semibold"
                    style={{ background:"linear-gradient(135deg,#B8A0C8,#88B8B0)" }}>
                    Explore the demo <ArrowRight className="inline w-3.5 h-3.5 ml-1" />
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-[#B8A0C8]/30 text-xs font-semibold tracking-[0.15em] text-[#5A4A6E] uppercase mb-4">
                  <Star className="w-3 h-3 fill-[#C8A880] text-[#C8A880]" />
                  Book enterprise demo
                </div>
                <h2 className="text-3xl font-black text-[#1F1B2E] mb-2">Request enterprise access</h2>
                <p className="text-sm text-[#5A4A6E]">
                  Fill in the form below. Our team responds within one business day.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4 bg-white/80 backdrop-blur rounded-3xl border border-[#B8A0C8]/20 shadow-xl p-8">
                <div className="grid sm:grid-cols-2 gap-4">
                  {FIELDS.map((f) => (
                    <div key={f.id} className={f.id === "notes" ? "sm:col-span-2" : ""}>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        {f.label}
                      </label>
                      {f.type === "select" ? (
                        <select
                          value={form[f.id]}
                          onChange={(e) => set(f.id, e.target.value)}
                          required={f.id !== "notes"}
                          className="w-full px-3 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/40 appearance-none"
                        >
                          <option value="">{f.placeholder}</option>
                          {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={f.type}
                          value={form[f.id]}
                          onChange={(e) => set(f.id, e.target.value)}
                          placeholder={f.placeholder}
                          required={f.id !== "notes"}
                          className="w-full px-3 py-2.5 rounded-xl border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/40"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3 rounded-xl text-white text-sm font-bold shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                  style={{ background:"linear-gradient(135deg,#B8A0C8,#88B8B0,#C8A880)" }}
                >
                  {submitting ? "Submitting..." : "Book enterprise demo"}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>

                <p className="text-center text-[10px] text-muted-foreground">
                  By submitting you agree to be contacted by our GCC enterprise team. No spam.
                </p>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────────────── */}
      <section className="border-t border-border/30">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NexFlowWordmark height={24} />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/welcome" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <Link href="/signin" className="hover:text-foreground transition-colors">Sign in</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
