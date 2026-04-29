import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Mail, Lock, User, Building2, ArrowRight, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { setSignedIn } from "@/lib/marketing-auth";
import { NexFlowLogo } from "@/components/layout/NexFlowLogo";

interface AuthPageProps {
  mode: "signin" | "signup";
}

export default function AuthPage({ mode }: AuthPageProps) {
  const [, navigate] = useLocation();
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSignedIn(true);
      navigate("/home");
    }, 400);
  }

  const isSignIn = mode === "signin";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <NexFlowLogo size={32} />
            <span className="text-base font-black tracking-tight">NexFlow</span>
          </div>

          {/* Tab switcher */}
          <div className="inline-flex items-center gap-1 mb-7 p-1 rounded-xl border border-border/40 bg-muted/20 w-full">
            <Link href="/signin" className="flex-1">
              <button className={cn(
                "w-full px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                isSignIn ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}>Sign In</button>
            </Link>
            <Link href="/signup" className="flex-1">
              <button className={cn(
                "w-full px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                !isSignIn ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}>Sign Up</button>
            </Link>
          </div>

          <h1 className="text-3xl font-black tracking-tight mb-2">
            {isSignIn ? "Welcome back." : "Create your workspace."}
          </h1>
          <p className="text-sm text-muted-foreground mb-7">
            {isSignIn
              ? "Sign in to continue your AI-driven sales workflow."
              : "Start free with 5 seats. No credit card. AI included from day one."}
          </p>

          <form onSubmit={onSubmit} className="space-y-3">
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
                <span>I agree to the <a className="underline">Terms</a> and <a className="underline">Privacy Policy</a> (PDPL-compliant).</span>
              </label>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 px-4 py-3 rounded-xl text-white text-sm font-bold shadow-lg disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}
            >
              {submitting ? "Signing you in..." : (isSignIn ? "Sign in" : "Create workspace")}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {isSignIn && (
            <div className="text-center mt-5">
              <button type="button" className="text-xs text-muted-foreground hover:text-foreground underline">Forgot password?</button>
            </div>
          )}

          <div className="text-center mt-6 text-xs text-muted-foreground">
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
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle,#B8A0C8,transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle,#88B8B0,transparent 70%)" }}
        />
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
