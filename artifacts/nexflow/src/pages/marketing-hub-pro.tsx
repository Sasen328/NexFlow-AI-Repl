/**
 * Marketing Hub Pro — HubSpot-style modules added on top of the existing
 * MarkHub: Landing Pages, A/B Testing, Lead Scoring rules, and Marketing
 * Attribution snapshot. Each module is self-contained with its own state.
 *
 *   • Landing Pages — list of pages with views/conv/CR + AI generator
 *   • A/B Testing   — experiments table with variants + winner banner
 *   • Lead Scoring  — rule editor (event → points) with live recalc
 *   • Attribution   — quick snapshot linking to the full /attribution page
 */

import { useState } from "react";
import { Link } from "wouter";
import {
  LayoutGrid, Target, Trophy, BarChart3, Plus, Sparkles, Loader2,
  ExternalLink, Globe, FlaskConical, ArrowRight, CheckCircle2, X,
  TrendingUp, MousePointerClick, Eye, Edit3, Power, Mail, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";

type Tab = "landing" | "abtest" | "scoring" | "attribution";

const SEED_LANDINGS = [
  { id: "lp1", title: "GCC Enterprise — AI Voice Demo",      slug: "/lp/gcc-voice",       views: 8420, conv: 412, cr: 4.9, status: "live"   as const, updated: "2h ago" },
  { id: "lp2", title: "Ramadan Campaign — Free Trial",       slug: "/lp/ramadan-trial",   views: 14210, conv: 891, cr: 6.3, status: "live"   as const, updated: "yesterday" },
  { id: "lp3", title: "Riyadh Roadshow — Booking",           slug: "/lp/riyadh-event",    views: 1840, conv: 73,  cr: 4.0, status: "draft"  as const, updated: "3d ago" },
  { id: "lp4", title: "ROI Calculator — KSA Banking",        slug: "/lp/roi-banking",     views: 5320, conv: 198, cr: 3.7, status: "paused" as const, updated: "1w ago" },
];

const SEED_ABTESTS = [
  { id: "ab1", name: "Hero CTA — 'Start Trial' vs 'Book Demo'",   variants: 2, traffic: 5240, winner: "Book Demo (+27%)",            status: "running"  as const, lift: 27, conf: 96 },
  { id: "ab2", name: "Subject line — Arabic vs English",          variants: 2, traffic: 8120, winner: "Arabic (+38% open rate)",     status: "complete" as const, lift: 38, conf: 99 },
  { id: "ab3", name: "Pricing page — single tier vs three-tier",  variants: 2, traffic: 3110, winner: null,                           status: "running"  as const, lift: 0,  conf: 41 },
];

const SEED_SCORING = [
  { id: "r1", event: "Visited pricing page",            points: 15, active: true },
  { id: "r2", event: "Downloaded ROI calculator",       points: 25, active: true },
  { id: "r3", event: "Replied to WhatsApp",             points: 30, active: true },
  { id: "r4", event: "Forwarded an email to colleague", points: 20, active: true },
  { id: "r5", event: "Booked a demo slot",              points: 50, active: true },
  { id: "r6", event: "Opened cold email (no reply)",    points: 3,  active: true },
  { id: "r7", event: "Bounced from landing page <5s",   points: -10, active: false },
];

const SEED_ATTRIBUTION = [
  { channel: "LinkedIn (organic)", deals: 18, revenue: 1_240_000, share: 32 },
  { channel: "WhatsApp outbound",  deals: 14, revenue:   980_000, share: 26 },
  { channel: "Email sequences",    deals: 11, revenue:   720_000, share: 19 },
  { channel: "Webinars + events",  deals:  7, revenue:   540_000, share: 14 },
  { channel: "Paid ads (LI + IG)", deals:  4, revenue:   320_000, share:  9 },
];

// ─── Module 1: Landing Pages ────────────────────────────────────────────
function LandingPagesModule() {
  const [pages, setPages] = useState(SEED_LANDINGS);
  const [showNew, setShowNew] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiBrief, setAiBrief] = useState("");
  const [aiOut, setAiOut] = useState<{ title: string; hero: string; bullets: string[]; cta: string } | null>(null);

  async function generate() {
    if (!aiBrief.trim()) return;
    setAiBusy(true); setAiOut(null);
    try {
      const r = await apiFetch("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({
          message: `You're a GCC B2B landing-page copywriter. Brief: ${aiBrief}\n\nReturn ONLY a strict JSON object:\n{ "title": "...", "hero": "...", "bullets": ["...","...","..."], "cta": "..." }`,
          provider: "auto",
        }),
      }) as { reply?: string };
      const m = (r.reply ?? "").match(/\{[\s\S]*\}/);
      if (m) setAiOut(JSON.parse(m[0]));
    } finally {
      setAiBusy(false);
    }
  }

  function publish() {
    if (!aiOut) return;
    setPages(p => [{
      id: `lp${Date.now()}`, title: aiOut.title, slug: `/lp/${aiOut.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}`,
      views: 0, conv: 0, cr: 0, status: "draft", updated: "just now",
    }, ...p]);
    setShowNew(false); setAiBrief(""); setAiOut(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" /> Landing pages · {pages.length}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Hosted, AI-built, and tracked end-to-end with conversions.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl nf-chameleon-bg text-white text-xs font-semibold shadow-sm">
          <Plus className="w-3.5 h-3.5" /> New page
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">Page</th>
              <th className="text-right px-3 py-2 font-semibold">Views</th>
              <th className="text-right px-3 py-2 font-semibold">Conv</th>
              <th className="text-right px-3 py-2 font-semibold">CR</th>
              <th className="text-left px-3 py-2 font-semibold">Status</th>
              <th className="text-right px-4 py-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {pages.map(p => (
              <tr key={p.id} className="hover:bg-muted/20">
                <td className="px-4 py-2.5">
                  <div className="font-semibold text-foreground">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{p.slug} · updated {p.updated}</div>
                </td>
                <td className="text-right px-3 text-foreground/85">{p.views.toLocaleString()}</td>
                <td className="text-right px-3 text-foreground/85">{p.conv.toLocaleString()}</td>
                <td className="text-right px-3">
                  <span className={cn("font-bold", p.cr >= 5 ? "text-[#88B8B0]" : p.cr >= 3 ? "text-[#C8A880]" : "text-muted-foreground")}>{p.cr.toFixed(1)}%</span>
                </td>
                <td className="px-3">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider",
                    p.status === "live" ? "bg-[#88B8B0]/20 text-[#88B8B0]" :
                    p.status === "paused" ? "bg-muted/60 text-muted-foreground" :
                    "bg-[#C8A880]/20 text-[#C8A880]")}>
                    {p.status}
                  </span>
                </td>
                <td className="text-right px-4">
                  <div className="inline-flex gap-1">
                    <button title="Open" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><ExternalLink className="w-3.5 h-3.5" /></button>
                    <button title="Edit" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button title="Toggle" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Power className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="glass-card rounded-2xl p-5 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#B8A0C8]" /> AI Landing Page Builder</h3>
              <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            <textarea
              value={aiBrief}
              onChange={e => setAiBrief(e.target.value)}
              rows={3}
              placeholder="Brief: e.g. Landing page for KSA banks evaluating AI voice agents — emphasize Arabic compliance & ROI"
              className="w-full px-3 py-2 rounded-lg bg-muted/40 border border-border/40 text-sm outline-none focus:border-[#B8A0C8]/60 resize-none"
            />
            <button onClick={generate} disabled={!aiBrief.trim() || aiBusy} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50">
              {aiBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate page copy
            </button>
            {aiOut && (
              <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/40 text-xs">
                <div><strong className="text-foreground">Title:</strong> {aiOut.title}</div>
                <div><strong className="text-foreground">Hero:</strong> {aiOut.hero}</div>
                <ul className="list-disc list-inside space-y-0.5 text-foreground/80">
                  {(aiOut.bullets ?? []).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
                <div><strong className="text-foreground">CTA:</strong> {aiOut.cta}</div>
                <button onClick={publish} className="w-full mt-2 px-3 py-1.5 rounded-lg bg-[#88B8B0]/20 text-[#88B8B0] text-xs font-semibold">Save as draft</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Module 2: A/B Testing ──────────────────────────────────────────────
function AbTestModule() {
  const [tests] = useState(SEED_ABTESTS);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FlaskConical className="w-3.5 h-3.5" /> Active experiments · {tests.length}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Statistical-significance gating · auto-promotes winners at 95% confidence.</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl nf-chameleon-bg text-white text-xs font-semibold"><Plus className="w-3.5 h-3.5" /> New test</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tests.map(t => (
          <div key={t.id} className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">{t.name}</div>
                <div className="text-[11px] text-muted-foreground">{t.variants} variants · {t.traffic.toLocaleString()} samples</div>
              </div>
              <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider",
                t.status === "complete" ? "bg-[#88B8B0]/20 text-[#88B8B0]" : "bg-[#C8A880]/20 text-[#C8A880]")}>
                {t.status}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-[10px] text-muted-foreground uppercase">Confidence</div>
                <div className="h-2 rounded-full bg-muted overflow-hidden mt-0.5">
                  <div className="h-full" style={{ width: `${t.conf}%`, background: t.conf >= 95 ? "#88B8B0" : "#C8A880" }} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase">Lift</div>
                <div className="text-sm font-bold" style={{ color: t.lift >= 20 ? "#88B8B0" : "#C8A880" }}>
                  {t.lift > 0 ? `+${t.lift}%` : "—"}
                </div>
              </div>
            </div>
            {t.winner && (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#88B8B0]/10 text-[#88B8B0] text-xs">
                <Trophy className="w-3.5 h-3.5" />
                <span className="font-semibold">{t.winner}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Module 3: Lead Scoring rules ───────────────────────────────────────
function LeadScoringModule() {
  const [rules, setRules] = useState(SEED_SCORING);
  const totalActive = rules.filter(r => r.active).reduce((a, r) => a + r.points, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Target className="w-3.5 h-3.5" /> Scoring rules · max +{totalActive}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Each event below adds (or subtracts) from a contact's score.</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl nf-chameleon-bg text-white text-xs font-semibold"><Plus className="w-3.5 h-3.5" /> Add rule</button>
      </div>
      <div className="glass-card rounded-2xl divide-y divide-border/20">
        {rules.map(r => (
          <div key={r.id} className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setRules(rs => rs.map(x => x.id === r.id ? { ...x, active: !x.active } : x))}
              className={cn("w-9 h-5 rounded-full p-0.5 transition-colors", r.active ? "bg-[#88B8B0]" : "bg-muted")}
            >
              <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", r.active && "translate-x-4")} />
            </button>
            <div className="flex-1 text-sm">{r.event}</div>
            <input
              type="number"
              value={r.points}
              onChange={e => setRules(rs => rs.map(x => x.id === r.id ? { ...x, points: Number(e.target.value) } : x))}
              className="w-20 text-right px-2 py-1 rounded bg-muted/40 border border-border/40 text-sm outline-none focus:border-[#88B8B0]/60"
            />
            <span className="text-xs text-muted-foreground">pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Module 4: Attribution snapshot ─────────────────────────────────────
function AttributionModule() {
  const total = SEED_ATTRIBUTION.reduce((a, r) => a + r.revenue, 0);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" /> Channel attribution · ${(total / 1_000_000).toFixed(2)}M influenced
          </h3>
          <p className="text-xs text-muted-foreground mt-1">First-touch + multi-touch revenue model.</p>
        </div>
        <Link href="/attribution">
          <button className="text-xs text-[#88B8B0] font-semibold hover:underline flex items-center gap-1">
            Full attribution <ArrowRight className="w-3 h-3" />
          </button>
        </Link>
      </div>
      <div className="glass-card rounded-2xl p-4 space-y-3">
        {SEED_ATTRIBUTION.map((r, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">{r.channel}</span>
              <span className="text-muted-foreground text-xs">
                {r.deals} deals · ${(r.revenue / 1000).toFixed(0)}k · <strong className="text-foreground">{r.share}%</strong>
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full" style={{ width: `${r.share * 3}%`, background: ["#88B8B0", "#B8A0C8", "#C8A880", "#90B8D8", "#B8B880"][i] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────
export default function MarketingHubProPage() {
  const [tab, setTab] = useState<Tab>("landing");

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="relative rounded-3xl overflow-hidden p-6"
        style={{ background: "linear-gradient(135deg, #fff8f0 0%, #f0f9f8 50%, #f8f4ff 100%)" }}>
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center shadow-md">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Marketing Hub Pro</h1>
            <p className="text-xs text-muted-foreground">
              HubSpot-style modules: landing pages, A/B testing, lead scoring, channel attribution — built for the GCC.
            </p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Landing pages live", value: SEED_LANDINGS.filter(p => p.status === "live").length, icon: Globe,           color: "#88B8B0" },
          { label: "A/B tests running",  value: SEED_ABTESTS.filter(t => t.status === "running").length, icon: FlaskConical,   color: "#C8A880" },
          { label: "Avg CR (live pages)", value: `${(SEED_LANDINGS.filter(p => p.status === "live").reduce((a, p) => a + p.cr, 0) / Math.max(1, SEED_LANDINGS.filter(p => p.status === "live").length)).toFixed(1)}%`, icon: MousePointerClick, color: "#B8A0C8" },
          { label: "Channels attributed", value: SEED_ATTRIBUTION.length, icon: TrendingUp, color: "#90B8D8" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-muted/40 w-fit">
        {[
          { k: "landing"     as Tab, label: "Landing Pages", icon: Globe },
          { k: "abtest"      as Tab, label: "A/B Testing",   icon: FlaskConical },
          { k: "scoring"     as Tab, label: "Lead Scoring",  icon: Target },
          { k: "attribution" as Tab, label: "Attribution",   icon: BarChart3 },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                tab === t.k ? "nf-chameleon-bg text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "landing"     && <LandingPagesModule />}
      {tab === "abtest"      && <AbTestModule />}
      {tab === "scoring"     && <LeadScoringModule />}
      {tab === "attribution" && <AttributionModule />}
    </div>
  );
}
