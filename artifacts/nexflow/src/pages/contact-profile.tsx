import { useContact, useActivities, useCalls, useDeals, useSignals, useContactLists, usePropertyValues, useProperties, useUpsertPropertyValue, useContactOverview } from "@/hooks/useApi";
import { apiFetch } from "@/hooks/useApi";
import { Link } from "wouter";
import {
  ArrowLeft, Mail, Phone, Linkedin, Globe, MapPin, Building2, Star,
  Brain, Zap, TrendingUp, MessageSquare, Activity, Edit, Send, MoreHorizontal,
  CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Tag, Users, Award,
  Briefcase, GraduationCap, Languages, Calendar, Code2, DollarSign,
  Sparkles, ChevronRight, FileText, Database, Bot, ListChecks, Settings2, Check,
  PhoneOutgoing, PhoneIncoming, PhoneMissed, Clock, ChevronDown, ChevronUp,
  Loader2, StickyNote, TrendingDown, Mic
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import VoiceCallModal from "@/components/VoiceCallModal";

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

  const [tab, setTab] = useState<"overview" | "engagement" | "calls" | "deals" | "enrichment">("overview");
  const [showCallModal, setShowCallModal] = useState(false);

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

      {/* HERO BAR — clean, no overlap */}
      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl nf-chameleon-bg flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-md">
            {(contact.first_name?.[0] ?? "") + (contact.last_name?.[0] ?? "")}
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground leading-tight">
                {contact.first_name} {contact.last_name}
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: `${scoreColor}20`, color: scoreColor }}>
                {scoreLabel}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">{contact.title}</div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <Building2 className="w-3.5 h-3.5 text-[#B8A0C8]" />
              <span className="text-sm text-[#B8A0C8] font-semibold">{contact.company_name}</span>
              {contact.email && (
                <>
                  <span className="text-muted-foreground/50">·</span>
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">{contact.email}</span>
                </>
              )}
            </div>
          </div>

          {/* Score block — solid, high contrast */}
          <div className="flex flex-col items-end flex-shrink-0 pl-4 border-l border-border/40">
            <div className="text-4xl font-black leading-none" style={{ color: scoreColor }}>{score}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-semibold">Lead Score</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">${((totalPipeline / 100) / 1000).toFixed(0)}k pipeline</div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-border/20">
          <button onClick={() => setShowCallModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            <Phone className="w-3.5 h-3.5" /> Call
          </button>
          <button onClick={() => setShowCallModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 text-foreground text-sm font-medium hover:bg-muted/70 transition-colors">
            <Bot className="w-3.5 h-3.5 text-[#B8A0C8]" /> AI Voice Agent
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 text-foreground text-sm font-medium hover:bg-muted/70 transition-colors">
            <Mail className="w-3.5 h-3.5" /> Email
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 text-foreground text-sm font-medium hover:bg-muted/70 transition-colors">
            <MessageSquare className="w-3.5 h-3.5 text-[#88B8B0]" /> WhatsApp
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 text-foreground text-sm font-medium hover:bg-muted/70 transition-colors">
            <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" /> LinkedIn
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C8A880]/15 text-[#C8A880] text-xs font-semibold hover:bg-[#C8A880]/25 transition-colors">
              <RefreshCw className="w-3 h-3" /> Re-enrich
            </button>
            <button className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/40 w-fit flex-wrap">
        {[
          { k: "overview",    label: "Overview" },
          { k: "engagement",  label: "Engagement" },
          { k: "calls",       label: `Calls (${calls.length})` },
          { k: "deals",       label: `Deals (${deals.length})` },
          { k: "enrichment",  label: "Enrichment" },
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

            {/* Core CRM properties — owner, stage, score, dates */}
            <ContactCoreProperties contact={contact} />

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
            {/* AI Overview — inside Overview tab, compact */}
            <ContactAIOverview contactId={id} />

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

      {tab === "calls" && (
        <CallsTab contact={contact} calls={calls} />
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
      {showCallModal && (
        <VoiceCallModal
          contact={{
            id: contact.id,
            first_name: contact.first_name,
            last_name: contact.last_name,
            title: contact.title,
            company_name: contact.company_name,
          }}
          onClose={() => setShowCallModal(false)}
          onCallSaved={() => setTab("calls")}
        />
      )}
    </div>
  );
}

// ── CallsTab ────────────────────────────────────────────────────────────────
function formatDur(s: number | null) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function ScoreBar({ score, label, feedback }: { score: number; label: string; feedback: string }) {
  const color = score >= 80 ? "#88B8B0" : score >= 60 ? "#B8B880" : "#C0A0B8";
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-bold" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden mb-1">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <p className="text-[10px] text-muted-foreground">{feedback}</p>
    </div>
  );
}

function CallRow({ call, contact }: { call: any; contact: any }) {
  const [expanded, setExpanded] = useState(false);
  const [loadingSc, setLoadingSc] = useState(false);
  const [scorecard, setScorecard] = useState<any>(call.ai_insights?.dimensions ? call.ai_insights : null);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [postDone, setPostDone] = useState<string[]>([]);

  const statusColor: Record<string, string> = {
    completed: "#88B8B0", missed: "#C0A0B8", failed: "hsl(var(--destructive))", scheduled: "#C8A880", in_progress: "#B8B880",
  };
  const DirIcon = call.direction === "inbound" ? PhoneIncoming : call.status === "missed" ? PhoneMissed : PhoneOutgoing;
  const color = statusColor[call.status] ?? "#88B8B0";

  async function analyzeCall() {
    setLoadingSc(true);
    const sc = await apiFetch("/calls/scorecard", {
      method: "POST",
      body: JSON.stringify({ call_id: call.id, contact_name: `${contact.first_name ?? ""} ${contact.last_name ?? ""}`, outcome: call.status }),
    });
    setScorecard(sc);
    setLoadingSc(false);
  }

  async function saveNote() {
    if (!note.trim()) return;
    await apiFetch(`/calls/${call.id}/note`, { method: "POST", body: JSON.stringify({ note, contact_id: contact.id }) });
    setNoteSaved(true);
    setNote("");
    setTimeout(() => setNoteSaved(false), 2000);
  }

  async function triggerAction(type: "whatsapp" | "email") {
    if (postDone.includes(type)) return;
    setPostDone(p => [...p, type]);
    await apiFetch("/activities", {
      method: "POST",
      body: JSON.stringify({
        type: type === "whatsapp" ? "whatsapp" : "email",
        title: type === "whatsapp" ? "WhatsApp follow-up" : "Follow-up email drafted",
        body: type === "whatsapp"
          ? `Hi ${contact.first_name ?? ""}! Great speaking with you. I'll follow up with the details we discussed.`
          : `Hi ${contact.first_name ?? ""},\n\nThank you for your time. As discussed, I'm following up with the key points from our conversation.`,
        contact_id: contact.id,
        status: "completed",
        completed_at: new Date().toISOString(),
        metadata: { source: "post_call_action", call_id: call.id },
      }),
    });
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/10 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Direction icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
          <DirIcon className="w-4 h-4" style={{ color }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground capitalize">{call.direction} · {call.status}</span>
            {call.outcome && <span className="text-xs px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground capitalize">{call.outcome.replace("_", " ")}</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatDur(call.duration_seconds)}
            {call.started_at && (
              <>
                <span>·</span>
                <span>{new Date(call.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {call.call_score != null && (
            <div className="text-center">
              <div className="text-lg font-black" style={{ color: call.call_score >= 80 ? "#88B8B0" : call.call_score >= 60 ? "#B8B880" : "#C0A0B8" }}>
                {Math.round(call.call_score)}
              </div>
              <div className="text-[9px] text-muted-foreground">score</div>
            </div>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/15 p-4 space-y-4">
          {/* Transcript */}
          {call.transcript && (
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Transcript</div>
              <div className="bg-muted/20 rounded-xl p-3 text-xs text-foreground/80 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                {call.transcript}
              </div>
            </div>
          )}

          {/* AI Insights */}
          {call.ai_insights?.summary && (
            <div className="p-3 rounded-xl bg-[#B8A0C8]/10 border border-[#B8A0C8]/20">
              <div className="text-[10px] font-bold text-[#B8A0C8] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> AI Summary
              </div>
              <p className="text-xs text-foreground">{call.ai_insights.summary}</p>
            </div>
          )}

          {/* Coaching notes */}
          {call.coaching_notes && (
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <StickyNote className="w-3 h-3" /> Notes
              </div>
              <div className="bg-muted/20 rounded-xl p-3 text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">
                {call.coaching_notes}
              </div>
            </div>
          )}

          {/* Scorecard */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3 h-3 text-[#C8A880]" /> Call Scorecard
              </div>
              {!scorecard && (
                <button onClick={analyzeCall} disabled={loadingSc}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg nf-chameleon-bg text-white font-semibold hover:opacity-90 disabled:opacity-50">
                  {loadingSc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
                  {loadingSc ? "Analysing…" : "Analyse Call"}
                </button>
              )}
            </div>
            {scorecard ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Overall score</span>
                  <span className="text-2xl font-black" style={{ color: (scorecard.overall ?? 0) >= 80 ? "#88B8B0" : (scorecard.overall ?? 0) >= 60 ? "#B8B880" : "#C0A0B8" }}>
                    {scorecard.overall ?? call.call_score ?? "—"}<span className="text-xs font-normal text-muted-foreground">/100</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {(scorecard.dimensions ?? []).map((d: any) => (
                    <ScoreBar key={d.name} score={d.score} label={`${d.icon} ${d.name}`} feedback={d.feedback} />
                  ))}
                </div>
                {scorecard.next_best_action && (
                  <div className="p-2.5 rounded-xl bg-[#B8A0C8]/10 border border-[#B8A0C8]/20">
                    <div className="text-[10px] font-bold text-[#B8A0C8] uppercase tracking-wider mb-0.5">Next best action</div>
                    <div className="text-xs text-foreground">{scorecard.next_best_action}</div>
                  </div>
                )}
              </div>
            ) : (
              !loadingSc && <p className="text-xs text-muted-foreground">Click "Analyse Call" to generate a multi-dimension scorecard.</p>
            )}
          </div>

          {/* Post-call actions */}
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Post-Call Actions</div>
            <div className="flex gap-2 flex-wrap">
              {[
                { type: "whatsapp" as const, icon: MessageSquare, label: "Send WhatsApp", color: "#B8B880" },
                { type: "email" as const, icon: Mail, label: "Draft Follow-up Email", color: "#B8A0C8" },
              ].map(action => {
                const done = postDone.includes(action.type);
                return (
                  <button key={action.type} onClick={() => triggerAction(action.type)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                      done ? "bg-[#88B8B0]/15 text-[#88B8B0] border-[#88B8B0]/30" : "bg-muted/40 text-foreground border-border/30 hover:border-border/60")}>
                    {done ? <CheckCircle2 className="w-3 h-3" /> : <action.icon className="w-3 h-3" style={{ color: action.color }} />}
                    {done ? "Pushed ✓" : action.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add note */}
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Push Note to Profile</div>
            <div className="flex gap-2">
              <input
                value={note} onChange={e => setNote(e.target.value)}
                placeholder="Add a note about this call…"
                className="flex-1 px-3 py-2 rounded-xl bg-muted/40 border border-border/30 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/40"
              />
              <button onClick={saveNote} disabled={!note.trim()}
                className={cn("px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                  noteSaved ? "bg-[#88B8B0] text-white" : "nf-chameleon-bg text-white disabled:opacity-40")}>
                {noteSaved ? "✓" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CallsTab({ contact, calls }: { contact: any; calls: any[] }) {
  const [showCallModal, setShowCallModal] = useState(false);
  const { refetch } = useCalls({ contact_id: contact.id, limit: "20" });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Call History</h3>
          <p className="text-xs text-muted-foreground">{calls.length} call{calls.length !== 1 ? "s" : ""} · Click any call to see transcript, scorecard & post-call actions</p>
        </div>
        <button
          onClick={() => setShowCallModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Mic className="w-3.5 h-3.5" />
          Start AI Call
        </button>
      </div>

      {calls.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Phone className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No calls logged yet</p>
          <button onClick={() => setShowCallModal(true)} className="px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
            Start First Call
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {calls.map((c: any) => (
            <CallRow key={c.id} call={c} contact={contact} />
          ))}
        </div>
      )}

      {showCallModal && (
        <VoiceCallModal
          contact={{ id: contact.id, first_name: contact.first_name, last_name: contact.last_name, title: contact.title, company_name: contact.company_name }}
          onClose={() => setShowCallModal(false)}
          onCallSaved={() => { setShowCallModal(false); refetch?.(); }}
        />
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

function ContactAIOverview({ contactId }: { contactId: string }) {
  const overview = useContactOverview();
  const data: any = overview.data;

  function generate() {
    overview.mutate(contactId);
  }

  if (!data && !overview.isPending) {
    return (
      <div className="glass-card rounded-2xl p-4 border border-[#B8A0C8]/30 bg-gradient-to-r from-[#B8A0C8]/8 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-[#B8A0C8] uppercase tracking-widest">AI Analysis</div>
            <div className="text-sm font-semibold text-foreground mt-0.5">
              Generate an AI overview, risks, and recommended next actions for this contact.
            </div>
          </div>
          <button
            onClick={generate}
            className="px-4 py-2 rounded-xl nf-chameleon-bg text-white text-xs font-bold hover:opacity-90 flex items-center gap-1 flex-shrink-0"
          >
            <Sparkles className="w-3 h-3" /> Run analysis
          </button>
        </div>
      </div>
    );
  }

  if (overview.isPending) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-[#B8A0C8]/30">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-[#B8A0C8] animate-pulse" />
          AI is analyzing engagement, signals, and pipeline…
        </div>
      </div>
    );
  }

  const recs: any[] = data?.recommendations ?? [];
  const strengths: string[] = data?.strengths ?? [];
  const risks: string[] = data?.risks ?? [];
  const talking: string[] = data?.talking_points ?? [];
  const eng = data?.engagement_score ?? 0;

  return (
    <div className="glass-card rounded-2xl p-5 border border-[#B8A0C8]/30 bg-gradient-to-br from-[#B8A0C8]/8 via-transparent to-transparent">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl nf-chameleon-bg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-[#B8A0C8] uppercase tracking-widest">AI Overview</div>
            <div className="text-xs text-muted-foreground">Engagement score: <span className="font-bold text-foreground">{eng}</span></div>
          </div>
        </div>
        <button onClick={generate} className="text-[10px] px-2 py-1 rounded-lg bg-muted/40 text-muted-foreground hover:text-foreground flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {data?.summary && (
        <p className="text-sm text-foreground/90 mb-4 leading-relaxed">{data.summary}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {strengths.length > 0 && (
          <div>
            <div className="text-[10px] font-bold text-[#88B8B0] uppercase tracking-wide mb-1.5">Strengths</div>
            <ul className="space-y-1">
              {strengths.map((s, i) => (
                <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#88B8B0] mt-0.5 flex-shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {risks.length > 0 && (
          <div>
            <div className="text-[10px] font-bold text-[#C8A880] uppercase tracking-wide mb-1.5">Risks</div>
            <ul className="space-y-1">
              {risks.map((s, i) => (
                <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                  <AlertCircle className="w-3 h-3 text-[#C8A880] mt-0.5 flex-shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {recs.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-bold text-[#B8A0C8] uppercase tracking-wide mb-2">Recommended actions</div>
          <div className="space-y-1.5">
            {recs.map((r, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                  r.priority === "high" ? "bg-[#C8A880]/20 text-[#C8A880]" :
                  r.priority === "medium" ? "bg-[#B8A0C8]/20 text-[#B8A0C8]" :
                  "bg-muted/60 text-muted-foreground")}>{r.priority ?? "med"}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">{r.title}</div>
                  {r.reasoning && <div className="text-[10px] text-muted-foreground">{r.reasoning}</div>}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-background/60 text-muted-foreground capitalize flex-shrink-0">{r.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {talking.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Talking points</div>
          <div className="flex flex-wrap gap-1.5">
            {talking.map((t, i) => (
              <span key={i} className="text-[11px] px-2 py-1 rounded-full bg-[#88B8B0]/10 text-foreground/80 border border-[#88B8B0]/30">{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ContactCoreProperties({ contact }: { contact: any }) {
  const STAGES = [
    { value: "new",          label: "New",          color: "#90B8B8" },
    { value: "engaged",      label: "Engaged",      color: "#B8A0C8" },
    { value: "qualified",    label: "Qualified",    color: "#88B8B0" },
    { value: "opportunity",  label: "Opportunity",  color: "#C8A880" },
    { value: "customer",     label: "Customer",     color: "#88B8B0" },
    { value: "unqualified",  label: "Unqualified",  color: "#A89090" },
  ];
  const stage = STAGES.find((s) => s.value === contact.status) ?? STAGES[0];
  const tags: string[] = contact.tags ?? [];

  const ownerInitials = contact.owner_name
    ? contact.owner_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "—";

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Tag className="w-3 h-3" />
        Properties
      </h3>
      <dl className="space-y-3 text-sm">
        <Row label="Contact Owner">
          {contact.owner_name ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-[10px] font-black">{ownerInitials}</div>
              <div className="min-w-0">
                <div className="text-foreground font-semibold truncate">{contact.owner_name}</div>
                {contact.owner_email && <div className="text-[10px] text-muted-foreground truncate">{contact.owner_email}</div>}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground italic">Unassigned</span>
          )}
        </Row>

        <Row label="Lead Stage">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${stage.color}25`, color: stage.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
            {stage.label}
          </span>
        </Row>

        <Row label="Lead Score">
          <div className="flex items-center gap-2">
            <div className="text-base font-black text-foreground">{Math.round(contact.lead_score ?? 0)}</div>
            <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
              <div className="h-full nf-chameleon-bg" style={{ width: `${Math.min(100, contact.lead_score ?? 0)}%` }} />
            </div>
          </div>
        </Row>

        {contact.company_name && (
          <Row label="Company">
            <Link href={`/companies/${contact.company_id}`}>
              <span className="text-[#B8A0C8] font-semibold hover:underline cursor-pointer">{contact.company_name}</span>
            </Link>
            {contact.company_industry && <span className="text-[10px] text-muted-foreground ml-2">· {contact.company_industry}</span>}
          </Row>
        )}

        {contact.title && <Row label="Title"><span className="text-foreground/85">{contact.title}</span></Row>}

        <Row label="Tags">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-foreground/70 font-medium">{t}</span>
              ))}
            </div>
          ) : <span className="text-muted-foreground italic">No tags</span>}
        </Row>

        {contact.last_engaged_at && (
          <Row label="Last Engaged">
            <span className="text-foreground/85">{new Date(contact.last_engaged_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
          </Row>
        )}

        <Row label="Created">
          <span className="text-foreground/85">{new Date(contact.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
        </Row>

        {contact.updated_at && contact.updated_at !== contact.created_at && (
          <Row label="Updated">
            <span className="text-foreground/85">{new Date(contact.updated_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
          </Row>
        )}
      </dl>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 items-start">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold pt-1">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}
