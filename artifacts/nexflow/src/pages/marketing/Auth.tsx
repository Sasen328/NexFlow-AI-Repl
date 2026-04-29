import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Lock, User, Building2, ArrowRight, Sparkles, Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { signInAs, ROLE_LIST, type RoleKey } from "@/lib/marketing-auth";
import { NexFlowLogo } from "@/components/layout/NexFlowLogo";

interface AuthPageProps {
  mode: "signin" | "signup";
}

export default function AuthPage({ mode }: AuthPageProps) {
  const [, navigate] = useLocation();
  const [submitting, setSubmitting] = useState(false);

  function pickRole(role: RoleKey) {
    signInAs(role);
    navigate("/home");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      // Default new submissions to the Sales rep persona.
      signInAs("sales");
      navigate("/home");
    }, 400);
  }

  const isSignIn = mode === "signin";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <NexFlowLogo size={32} />
            <span className="text-base font-black tracking-tight">NexFlow</span>
          </div>

          {/* Tab switcher */}
          <div className="inline-flex items-center gap-1 mb-6 p-1 rounded-xl border border-border/40 bg-muted/20 w-full" role="tablist">
            <Link
              href="/signin"
              role="tab"
              aria-selected={isSignIn}
              className={cn(
                "flex-1 text-center px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                isSignIn ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              role="tab"
              aria-selected={!isSignIn}
              className={cn(
                "flex-1 text-center px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                !isSignIn ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              Sign Up
            </Link>
          </div>

          {/* DEMO PERSONAS — front and center */}
          <div className="mb-6 rounded-2xl border-2 p-4"
            style={{ borderColor: "#B8A0C8", background: "linear-gradient(135deg,#B8A0C808,#88B8B008)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-[#B8A0C8]/15 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-[#B8A0C8]" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-[#B8A0C8]">Try a demo persona</div>
                <div className="text-sm font-black">Click any role — instant sign-in, no password</div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Each persona shows a tuned briefing, KPIs, and queues for that role.
              Switch anytime from the avatar menu.
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {ROLE_LIST.map((r) => (
                <button
                  key={r.key}
                  onClick={() => pickRole(r.key)}
                  className="group flex items-center gap-3 px-3 py-2 rounded-xl border border-border/40 hover:border-transparent hover:shadow-md hover:translate-x-1 transition-all text-left bg-background/60"
                  style={{
                    borderImage: `linear-gradient(135deg,${r.accent},${r.accent}00) 1`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: `linear-gradient(135deg,${r.accent},#B8A0C8)` }}
                  >
                    {r.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <div className="text-sm font-bold truncate">{r.label}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{r.email}</div>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{r.blurb}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" style={{ color: r.accent }} />
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/40" /></div>
            <div className="relative flex justify-center"><span className="bg-background px-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">or use a real account</span></div>
          </div>

          <form onSubmit={onSubmit} className="space-y-2.5">
            {!isSignIn && (
              <>
                <Field icon={User}     label="Full name"    type="text"  placeholder="Sara Al-Mansouri" />
                <Field icon={Building2} label="Company"      type="text"  placeholder="Gulf Ventures" />
              </>
            )}
            <Field icon={Mail} label="Work email" type="email" placeholder="you@company.com" required />
            <Field icon={Lock} label="Password" type="password" placeholder="••••••••" required />

            {!isSignIn && (
              <label className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
                <input type="checkbox" required className="mt-0.5" />
                <span>I agree to the <Link href="/about" className="underline">Terms</Link> and <Link href="/about" className="underline">Privacy Policy</Link> (PDPL-compliant).</span>
              </label>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}
            >
              {submitting ? "Signing you in..." : (isSignIn ? "Sign in" : "Create workspace")}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="text-center mt-4 text-xs text-muted-foreground">
            {isSignIn ? (
              <>New to NexFlow?{" "}
                <Link href="/signup" className="font-bold text-foreground hover:underline">Create an account</Link>
              </>
            ) : (
              <>Already have an account?{" "}
                <Link href="/signin" className="font-bold text-foreground hover:underline">Sign in</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right — value prop panel */}
      <div className="hidden lg:flex items-center justify-center p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#B8A0C815,#88B8B015,#C8A88015)" }}
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle,#B8A0C8,transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle,#88B8B0,transparent 70%)" }} />
        <div className="relative max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#B8A0C8]" />
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B8A0C8]">
              The GCC AI-native CRM
            </div>
          </div>
          <h2 className="text-3xl font-black leading-tight mb-4">
            One product. One seat price. Everything in.
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Replace Salesforce + HubSpot + Aircall + Apollo + Clay with a single bilingual, KSA-resident CRM.
          </p>
          <ul className="space-y-3">
            {[
              "AI Voice Agent (Khaleeji) included — not an upsell",
              "Daily AI Briefing instead of a static dashboard",
              "Power Dialer + Conversation Intelligence built in",
              "GCC-first enrichment (Lusha + Apollo + Wamda + MoCI)",
              "PDPL-compliant · in-Kingdom data residency",
            ].map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "#B8A0C825" }}>
                  <Check className="w-3 h-3 text-[#B8A0C8]" />
                </div>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, label, type, placeholder, required,
}: { icon: typeof Mail; label: string; type: string; placeholder: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type={type}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/30 border border-border/40 text-sm focus:outline-none focus:border-[#B8A0C8] focus:bg-background transition-all"
        />
      </div>
    </div>
  );
}
