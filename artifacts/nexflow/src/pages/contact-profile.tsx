import { useContact, useActivities, useCalls, useDeals, useSignals, useContactLists, usePropertyValues, useProperties, useUpsertPropertyValue } from "@/hooks/useApi";
import { Link } from "wouter";
import {
  ArrowLeft, Mail, Phone, Linkedin, Globe, MapPin, Building2, Star,
  Brain, Zap, TrendingUp, MessageSquare, Activity, Edit, Send, MoreHorizontal,
  CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Tag, Users, Award,
  Briefcase, GraduationCap, Languages, Calendar, Code2, DollarSign,
  Sparkles, ChevronRight, FileText, Database, Bot, ListChecks, Settings2, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const ENRICHMENT_SOURCES = [
  { name: "Lusha", color: "#9747FF", confidence: 98, fields: ["email", "phone", "title"] },
  { name: "Crunchbase", color: "#146AFF", confidence: 95, fields: ["funding", "investors"] },
  { name: "LinkedIn", color: "#0A66C2", confidence: 99, fields: ["title", "experience"] },
  { name: "Clay", color: "#FFB800", confidence: 92, fields: ["enrichment waterfall"] },
];

const TECH_STACK = [
  { name: "Salesforce", category: "CRM", since: "2019" },
  { name: "Slack", category: "Comms", since: "2020" },
  { name: "AWS", category: "Cloud", since: "2018" },
  { name: "Tableau", category: "BI", since: "2021" },
  { name: "Zoom", category: "Video", since: "2020" },
  { name: "Workday", category: "HR", since: "2022" },
];

const EXPERIENCE = [
  { role: "Managing Partner", company: "Gulf Ventures", period: "2020 — Present", current: true },
  { role: "Director of Investments", company: "SAMBA Capital", period: "2017 — 2020" },
  { role: "VP, Strategic Investments", company: "Riyad Bank", period: "2014 — 2017" },
];

const MUTUAL_CONNECTIONS = [
  { name: "Mohammed Al-Otaibi", initials: "MA", color: "#88B8B0", relationship: "Co-investors" },
  { name: "Fatima Khalid", initials: "FK", color: "#C8A880", relationship: "Conference speaker" },
  { name: "Tariq Bin-Laden", initials: "TB", color: "#B8B880", relationship: "Portfolio company" },
];

interface Props {
  params: { id: string };
}

export default function ContactProfilePage({ params }: Props) {
  const { id } = params;
  const { data: contact, isLoading } = useContact(id);
  const { data: activitiesData } = useActivities({ contact_id: id, limit: "8" });
  const { data: callsData } = useCalls({ contact_id: id, limit: "5" });
  const { data: dealsData } = useDeals({ contact_id: id });
  const { data: signalsData } = useSignals({ contact_id: id, limit: "5" });

  const activities = activitiesData?.activities ?? [];
  const calls = callsData?.calls ?? [];
  const deals = dealsData?.deals ?? [];
  const signals = signalsData?.signals ?? [];

  const [tab, setTab] = useState<"overview" | "engagement" | "deals" | "enrichment">("overview");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-muted/60 rounded animate-pulse" />
        <div className="glass-card rounded-3xl h-64 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl h-72 animate-pulse" />
          <div className="lg:col-span-2 glass-card rounded-2xl h-72 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <AlertCircle className="w-10 h-10 mb-3" />
        <p>Contact not found</p>
        <Link href="/contacts"><button className="mt-4 text-sm text-[#B8A0C8]">Back to contacts</button></Link>
      </div>
    );
  }

  const score = contact.lead_score ?? 0;
  const scoreColor = score >= 80 ? "#88B8B0" : score >= 60 ? "#B8B880" : "#C0A0B8";
  const scoreLabel = score >= 80 ? "Buying Now" : score >= 60 ? "High Intent" : score >= 40 ? "Evaluating" : "Cold";

  const totalPipeline = deals.reduce((a: number, d: any) => a + (d.value ?? 0), 0);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Back */}
      <Link href="/contacts">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Contacts
        </button>
      </Link>

      {/* HERO BAR */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="relative h-24 nf-chameleon-bg opacity-90">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
        </div>

        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex items-end gap-5 mb-4">
            <div className="w-24 h-24 rounded-2xl nf-chameleon-bg flex items-center justify-center text-white text-3xl font-black ring-4 ring-background shadow-lg flex-shrink-0">
              {(contact.first_name?.[0] ?? "") + (contact.last_name?.[0] ?? "")}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-foreground leading-tight">
                  {contact.first_name} {contact.last_name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: `${scoreColor}20`, color: scoreColor }}>
                  {scoreLabel}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">{contact.title}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <Building2 className="w-3.5 h-3.5 text-[#B8A0C8]" />
                <span className="text-sm text-[#B8A0C8] font-semibold">{contact.company_name}</span>
                <span className="text-muted-foreground">·</span>
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Riyadh, Saudi Arabia</span>
              </div>
            </div>

            {/* Score */}
            <div className="text-right flex-shrink-0 pb-1">
              <div className="text-4xl font-black leading-none" style={{ color: scoreColor }}>{score}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5 font-semibold">Lead Score</div>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/20">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              <Phone className="w-3.5 h-3.5" />
              Call
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 text-foreground text-sm font-medium hover:bg-muted/70 transition-colors">
              <Bot className="w-3.5 h-3.5 text-[#B8A0C8]" />
              AI Voice Agent
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 text-foreground text-sm font-medium hover:bg-muted/70 transition-colors">
              <Mail className="w-3.5 h-3.5" />
              Email
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 text-foreground text-sm font-medium hover:bg-muted/70 transition-colors">
              <MessageSquare className="w-3.5 h-3.5 text-[#88B8B0]" />
              WhatsApp
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 text-foreground text-sm font-medium hover:bg-muted/70 transition-colors">
              <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
              LinkedIn
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C8A880]/15 text-[#C8A880] text-xs font-semibold hover:bg-[#C8A880]/25 transition-colors">
                <RefreshCw className="w-3 h-3" />
                Re-enrich
              </button>
              <button className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommended Action */}
      <div className="glass-card rounded-2xl p-4 border border-[#B8A0C8]/30 bg-gradient-to-r from-[#B8A0C8]/8 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-[#B8A0C8] uppercase tracking-widest">AI-Recommended Next Action</div>
            <div className="text-sm font-semibold text-foreground mt-0.5">
              Call within next 24h — Gulf Ventures Series B announced yesterday creates a high-conviction expansion window
            </div>
          </div>
          <button className="px-4 py-2 rounded-xl nf-chameleon-bg text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 flex-shrink-0">
            Execute <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/40 w-fit">
        {[
          { k: "overview", label: "Overview" },
          { k: "engagement", label: "Engagement" },
          { k: "deals", label: `Deals (${deals.length})` },
          { k: "enrichment", label: "Enrichment" },
        ].map(t => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as any)}
            className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", tab === t.k ? "nf-chameleon-bg text-white" : "text-muted-foreground hover:text-foreground")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT: Contact info + signals */}
          <div className="space-y-5">
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Contact</h3>
              <div className="space-y-2">
                {[
                  { icon: Mail, label: contact.email ?? "—", verified: true },
                  { icon: Phone, label: contact.phone ?? "+966 50 *** ****", verified: true },
                  { icon: Linkedin, label: "linkedin.com/in/sara-mansouri", verified: true },
                  { icon: Globe, label: "gulfventures.sa", verified: true },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm py-1.5 group">
                    <f.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground/85 truncate flex-1">{f.label}</span>
                    {f.verified && <CheckCircle2 className="w-3 h-3 text-[#88B8B0] flex-shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/20">
                {(contact.tags ?? ["enterprise", "saudi", "decision-maker"]).map((t: string) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-medium">#{t}</span>
                ))}
              </div>
            </div>

            {/* List memberships */}
            <ContactListsCard contactId={id} />

            {/* Custom properties */}
            <CustomPropertiesCard entityId={id} objectType="contact" />

            {/* Mutual Connections */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-3 h-3" />
                Mutual Connections
              </h3>
              <div className="space-y-2.5">
                {MUTUAL_CONNECTIONS.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: m.color }}>
                      {m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground">{m.name}</div>
                      <div className="text-[10px] text-muted-foreground">{m.relationship}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buying Signals */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-3 h-3 text-[#B8B880]" />
                Buying Signals · 30d
              </h3>
              <div className="space-y-2">
                {(signals.length > 0 ? signals : [
                  { id: "s1", title: "Closed $50M Series B", body: "Crunchbase · 1d ago", score: 96 },
                  { id: "s2", title: "Hiring 12 sales roles", body: "LinkedIn · 5d ago", score: 88 },
                  { id: "s3", title: "Visited pricing page 4x", body: "Web tracking · 2d ago", score: 82 },
                ]).map((s: any) => (
                  <div key={s.id} className="flex items-start gap-2 p-2 rounded-lg bg-[#B8B880]/8 border border-[#B8B880]/20">
                    <Zap className="w-3 h-3 text-[#B8B880] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground">{s.title}</div>
                      <div className="text-[10px] text-muted-foreground">{s.body}</div>
                    </div>
                    <span className="text-xs font-black text-[#B8B880]">{s.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER + RIGHT */}
          <div className="lg:col-span-2 space-y-5">
            {/* Pipeline summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card rounded-2xl p-4">
                <div className="text-xs text-muted-foreground">Pipeline</div>
                <div className="text-2xl font-black text-[#88B8B0] mt-1">${(totalPipeline / 100).toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{deals.length} active deals</div>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <div className="text-xs text-muted-foreground">Engagement</div>
                <div className="text-2xl font-black text-[#B8A0C8] mt-1">{activities.length + calls.length}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{calls.length} calls · {activities.length} activities</div>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <div className="text-xs text-muted-foreground">Last contact</div>
                <div className="text-2xl font-black text-foreground mt-1">2d</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">via WhatsApp</div>
              </div>
            </div>

            {/* Experience */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Experience
              </h3>
              <div className="space-y-3">
                {EXPERIENCE.map((e, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", e.current ? "bg-[#88B8B0] ring-2 ring-[#88B8B0]/30" : "bg-muted-foreground/40")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{e.role}</span>
                        {e.current && <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-[#88B8B0]/15 text-[#88B8B0]">Current</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{e.company} · {e.period}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border/20 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-foreground/80">MBA · Wharton</span>
                </div>
                <div className="flex items-center gap-2">
                  <Languages className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-foreground/80">Arabic · English · French</span>
                </div>
              </div>
            </div>

            {/* Company Tech Stack */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-muted-foreground" />
                Company Tech Stack — Gulf Ventures
              </h3>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.map(t => (
                  <div key={t.name} className="px-3 py-1.5 rounded-lg bg-muted/40 border border-border/30">
                    <div className="text-xs font-semibold text-foreground">{t.name}</div>
                    <div className="text-[9px] text-muted-foreground">{t.category} · since {t.since}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "engagement" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              Activity Timeline
            </h3>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activities yet</p>
            ) : (
              <div className="space-y-3 relative">
                <div className="absolute left-3 top-1 bottom-1 w-px bg-border/30" />
                {activities.map((a: any) => (
                  <div key={a.id} className="flex items-start gap-3 relative">
                    <div className="w-6 h-6 rounded-full bg-background border-2 border-[#B8A0C8] flex items-center justify-center flex-shrink-0 z-10">
                      <Activity className="w-3 h-3 text-[#B8A0C8]" />
                    </div>
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="text-sm font-semibold text-foreground">{a.title}</div>
                      {a.body && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{a.body}</p>}
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium mt-1 inline-block",
                        a.status === "completed" ? "bg-[#88B8B0]/15 text-[#88B8B0]" : "bg-[#C8A880]/15 text-[#C8A880]")}>
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Call History
            </h3>
            {calls.length === 0 ? (
              <p className="text-sm text-muted-foreground">No calls yet</p>
            ) : (
              <div className="space-y-2">
                {calls.map((c: any) => (
                  <div key={c.id} className="p-3 rounded-xl bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground capitalize">{c.direction} · {c.outcome ?? "completed"}</span>
                      {c.score && <span className="text-xs font-bold text-[#88B8B0]">{c.score}/100</span>}
                    </div>
                    {c.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.summary}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "deals" && (
        <div className="space-y-3">
          {deals.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <DollarSign className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No deals associated with this contact yet</p>
              <button className="mt-4 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">Create Deal</button>
            </div>
          ) : (
            deals.map((d: any) => (
              <div key={d.id} className="glass-card rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#88B8B0]/15 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-[#88B8B0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground">{d.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{d.stage?.replace("_", " ")} · {d.probability}% probability · {d.currency}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-black text-[#88B8B0]">${((d.value ?? 0) / 100).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "enrichment" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#C8A880]" />
                  Data Sources
                </h3>
                <span className="text-xs text-muted-foreground">Last updated 2h ago</span>
              </div>
              <div className="space-y-3">
                {ENRICHMENT_SOURCES.map(s => (
                  <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0" style={{ background: s.color }}>
                      {s.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.fields.join(" · ")}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-black" style={{ color: s.confidence >= 95 ? "#88B8B0" : "#B8B880" }}>{s.confidence}%</div>
                      <div className="text-[9px] text-muted-foreground">confidence</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Behavioral Profile</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Email Open Rate", "87% (last 30d)"],
                  ["Avg Response Time", "< 2 hours"],
                  ["Preferred Time", "9–11 AM Riyadh"],
                  ["Communication Style", "Direct, formal"],
                  ["Best Channel", "WhatsApp Voice"],
                  ["Decision Style", "Consensus-driven"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[10px] text-muted-foreground/80 uppercase tracking-wide font-semibold">{k}</div>
                    <div className="text-sm text-foreground/85 mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Enrichment Cost</h3>
            <div className="space-y-2 text-xs">
              {[
                ["Lusha", "1 credit", "$0.20"],
                ["Crunchbase", "1 credit", "$0.50"],
                ["LinkedIn", "1 credit", "$0.10"],
                ["Clay waterfall", "2 credits", "$0.40"],
              ].map(([s, c, p]) => (
                <div key={s} className="flex items-center justify-between py-2 border-b border-border/15 last:border-0">
                  <span className="text-foreground/80">{s}</span>
                  <span className="text-muted-foreground">{c}</span>
                  <span className="font-semibold text-foreground">{p}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/30">
                <span className="font-bold text-foreground">Total this month</span>
                <span className="font-black text-[#88B8B0]">$1.20</span>
              </div>
            </div>
            <button className="mt-4 w-full px-3 py-2 rounded-xl nf-chameleon-bg text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
              <RefreshCw className="w-3 h-3" />
              Run Full Re-Enrichment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactListsCard({ contactId }: { contactId: string }) {
  const { data, isLoading } = useContactLists(contactId);
  const lists = data?.lists ?? [];
  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <ListChecks className="w-3 h-3 text-[#88B8B0]" />
        List Memberships
      </h3>
      {isLoading ? (
        <div className="h-8 bg-muted/40 rounded animate-pulse" />
      ) : lists.length === 0 ? (
        <p className="text-xs text-muted-foreground">Not in any list yet. Add from the contacts page.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {lists.map((l: any) => (
            <Link key={l.id} href={`/lists/${l.id}`}>
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full bg-muted/60 hover:bg-muted text-foreground cursor-pointer transition-colors">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.color ?? "#B8A0C8" }} />
                {l.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomPropertiesCard({ entityId, objectType }: { entityId: string; objectType: string }) {
  const { data: propsData } = useProperties(objectType);
  const { data: valuesData } = usePropertyValues(entityId);
  const upsert = useUpsertPropertyValue();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");

  const props = propsData?.properties ?? [];
  const values = valuesData?.values ?? [];
  const valueMap = new Map<string, any>(values.map((v: any) => [v.property_id, v.value]));

  function startEdit(propId: string, current: any) {
    setEditing(propId);
    setDraft(current == null ? "" : typeof current === "string" ? current : JSON.stringify(current));
  }
  async function save(propId: string, type: string) {
    let parsed: any = draft;
    if (type === "number") parsed = draft === "" ? null : Number(draft);
    if (type === "boolean") parsed = draft === "true";
    if (type === "multiselect") parsed = draft.split(",").map(s => s.trim()).filter(Boolean);
    await upsert.mutateAsync({ property_id: propId, entity_id: entityId, value: parsed });
    setEditing(null);
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Settings2 className="w-3 h-3 text-[#C8A880]" />
        Custom Properties
      </h3>
      {props.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No custom properties defined. <Link href="/properties"><span className="text-[#B8A0C8] cursor-pointer">Create one →</span></Link>
        </p>
      ) : (
        <div className="space-y-2.5">
          {props.map((p: any) => {
            const v = valueMap.get(p.id);
            const isEditing = editing === p.id;
            return (
              <div key={p.id} className="text-xs">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">{p.label}</div>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    {p.type === "select" ? (
                      <select autoFocus className="flex-1 px-2 py-1 rounded bg-muted/60 border border-border/40 text-xs outline-none" value={draft} onChange={e => setDraft(e.target.value)}>
                        <option value="">—</option>
                        {(p.options ?? []).map((o: string) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : p.type === "boolean" ? (
                      <select autoFocus className="flex-1 px-2 py-1 rounded bg-muted/60 border border-border/40 text-xs outline-none" value={draft} onChange={e => setDraft(e.target.value)}>
                        <option value="">—</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <input
                        autoFocus
                        type={p.type === "number" ? "number" : p.type === "date" ? "date" : "text"}
                        className="flex-1 px-2 py-1 rounded bg-muted/60 border border-border/40 text-xs outline-none text-foreground"
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") save(p.id, p.type); if (e.key === "Escape") setEditing(null); }}
                      />
                    )}
                    <button onClick={() => save(p.id, p.type)} disabled={upsert.isPending} className="p-1 rounded text-[#88B8B0] hover:bg-muted/40">
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => startEdit(p.id, v)} className="text-left text-foreground hover:text-[#B8A0C8] transition-colors w-full truncate">
                    {v == null || v === "" ? <span className="text-muted-foreground italic">+ set value</span> : Array.isArray(v) ? v.join(", ") : String(v)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
