import { useState, lazy, Suspense } from "react";
import {
  Settings, Bot, BookOpen, Shield, Zap, Phone, Sparkles,
  Volume2, Languages, ChevronRight, AlertCircle, CheckCircle2, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const VoiceAgentsPage = lazy(() => import("./voice-agents"));
const ScriptsPage = lazy(() => import("./scripts"));
const CallRedactionPage = lazy(() => import("./call-redaction"));

type Tab = "overview" | "voice-agent" | "knowledge" | "guardrails";

const VOICES = [
  { id: "layla", name: "Layla", lang: "Arabic (KSA)", tone: "Professional · Female", active: true },
  { id: "khalid", name: "Khalid", lang: "Arabic (KSA)", tone: "Warm · Male", active: false },
  { id: "sarah", name: "Sarah", lang: "English", tone: "Energetic · Female", active: false },
  { id: "james", name: "James", lang: "English", tone: "Authoritative · Male", active: false },
];

const AUTHORITY_RULES = [
  { id: "faq", label: "Answer product FAQs", scope: "Anyone", on: true },
  { id: "collateral", label: "Send collateral & decks", scope: "Anyone", on: true },
  { id: "qualify", label: "Qualify budget & timeline", scope: "Anyone", on: true },
  { id: "book", label: "Book meetings on rep's calendar", scope: "Lead score ≥ 60", on: true },
  { id: "demo", label: "Schedule live demos", scope: "Lead score ≥ 70", on: true },
  { id: "pricing", label: "Discuss pricing under $50k", scope: "MQL+", on: true },
  { id: "discount", label: "Offer discounts", scope: "Manager approval", on: false },
  { id: "contract", label: "Send contracts for e-signature", scope: "Manager approval", on: false },
];

export default function ContactCenterSetupPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [authority, setAuthority] = useState(AUTHORITY_RULES);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Contact Center Setup
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Configure your AI Voice Agent, build the knowledge base it uses, and set the guardrails for what
          the AI can do without you.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        <TabButton active={tab === "overview"} onClick={() => setTab("overview")} icon={Sparkles} label="Overview" />
        <TabButton active={tab === "voice-agent"} onClick={() => setTab("voice-agent")} icon={Bot} label="AI Voice Agent" />
        <TabButton active={tab === "knowledge"} onClick={() => setTab("knowledge")} icon={BookOpen} label="Knowledge Base" />
        <TabButton active={tab === "guardrails"} onClick={() => setTab("guardrails")} icon={Shield} label="Guardrails & Redaction" />
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          {/* Health */}
          <div className="grid grid-cols-3 gap-4">
            <HealthCard icon={Bot} label="AI Voice Agent" status="active" detail="Layla (Arabic) · 247 calls this week" />
            <HealthCard icon={BookOpen} label="Knowledge Base" status="active" detail="38 scripts · 12 playbooks · last updated 2h ago" />
            <HealthCard icon={Shield} label="Guardrails" status="warn" detail="6 rules active · 2 awaiting calibration" />
          </div>

          {/* Voices grid */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><Volume2 className="w-4 h-4" /> Voice library</h3>
                <p className="text-xs text-muted-foreground mt-0.5">The AI agent uses one of these voices on calls.</p>
              </div>
              <button className="text-xs text-primary hover:underline">Clone your own voice</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {VOICES.map((v) => (
                <div
                  key={v.id}
                  className={cn(
                    "rounded-xl border p-3 flex items-center gap-3",
                    v.active ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
                    {v.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {v.name}
                      {v.active && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold uppercase">Active</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{v.lang} · {v.tone}</div>
                  </div>
                  <button className="text-xs text-muted-foreground hover:text-foreground">Preview</button>
                </div>
              ))}
            </div>
          </div>

          {/* Authority matrix */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">AI agent authority</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              What the AI can do on its own. Anything switched off requires a human in the loop.
            </p>
            <div className="space-y-2">
              {authority.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{r.label}</div>
                    <div className="text-xs text-muted-foreground">Scope: {r.scope}</div>
                  </div>
                  <button
                    onClick={() => setAuthority((rs) => rs.map((x) => (x.id === r.id ? { ...x, on: !x.on } : x)))}
                    className={cn(
                      "w-11 h-6 rounded-full relative transition",
                      r.on ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 w-5 h-5 rounded-full bg-background transition",
                        r.on ? "left-5" : "left-0.5"
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="grid md:grid-cols-3 gap-4">
            <QuickLink onClick={() => setTab("voice-agent")} icon={Bot} title="Configure AI Voice Agent" desc="Voices, languages, dial behavior, escalation paths." />
            <QuickLink onClick={() => setTab("knowledge")} icon={BookOpen} title="Edit Knowledge Base" desc="Scripts, playbooks, objection handling, product info." />
            <QuickLink onClick={() => setTab("guardrails")} icon={Shield} title="Set Guardrails" desc="PII redaction, compliance phrases, do-not-say lists." />
          </div>
        </div>
      )}

      {tab === "voice-agent" && (
        <Suspense fallback={<TabLoader />}>
          <VoiceAgentsPage />
        </Suspense>
      )}
      {tab === "knowledge" && (
        <Suspense fallback={<TabLoader />}>
          <ScriptsPage />
        </Suspense>
      )}
      {tab === "guardrails" && (
        <Suspense fallback={<TabLoader />}>
          <CallRedactionPage />
        </Suspense>
      )}
    </div>
  );
}

function TabButton({
  active, onClick, icon: Icon, label,
}: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={cn(
        "px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function HealthCard({ icon: Icon, label, status, detail }: { icon: any; label: string; status: "active" | "warn" | "off"; detail: string }) {
  const config = {
    active: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", dot: "bg-emerald-500", text: "Healthy" },
    warn: { color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", dot: "bg-amber-500", text: "Needs attention" },
    off: { color: "text-muted-foreground", bg: "bg-muted", dot: "bg-muted-foreground", text: "Off" },
  }[status];
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bg)}>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
          <span className={config.color}>{config.text}</span>
        </div>
      </div>
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{detail}</div>
    </div>
  );
}

function QuickLink({ onClick, icon: Icon, title, desc }: { onClick: () => void; icon: any; title: string; desc: string }) {
  return (
    <button onClick={onClick} className="glass-card rounded-2xl p-4 text-left hover:bg-muted/30 transition group">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 text-primary" />
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition" />
      </div>
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
    </button>
  );
}

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );
}
