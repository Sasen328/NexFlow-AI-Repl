import { useContact, useActivities, useCalls, useDeals, useSignals } from "@/hooks/useApi";
import { Link } from "wouter";
import {
  ArrowLeft, Mail, Phone, Linkedin, Globe, MapPin, Building2, Star,
  Brain, Zap, TrendingUp, MessageSquare, Activity, Clock, Edit,
  CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Tag, Users
} from "lucide-react";
import { cn } from "@/lib/utils";

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#88B8B0" : score >= 60 ? "#B8B880" : score >= 40 ? "#C8A880" : "#C0A0B8";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-foreground leading-none">{score}</span>
        <span className="text-[9px] text-muted-foreground leading-none mt-0.5">score</span>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-[#B8A0C8] hover:underline flex items-center gap-1">
            {value} <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <div className="text-sm text-foreground">{value}</div>
        )}
      </div>
    </div>
  );
}

const ENRICHMENT_SECTIONS = [
  {
    title: "Professional Background",
    items: [
      { label: "Years of Experience", value: "18 years" },
      { label: "Previous Companies", value: "SAMBA Financial, NCB Capital, Riyad Bank" },
      { label: "Education", value: "MBA — Wharton School of Business" },
      { label: "Languages", value: "Arabic (Native), English (Fluent)" },
    ]
  },
  {
    title: "Digital Presence",
    items: [
      { label: "LinkedIn Connections", value: "2,400+" },
      { label: "Twitter/X", value: "@sara_algulfvc" },
      { label: "Last LinkedIn Post", value: "3 days ago — funding announcement" },
      { label: "Engagement Rate", value: "High (4.2% avg)" },
    ]
  },
  {
    title: "Behavioral Signals",
    items: [
      { label: "Email Open Rate", value: "87% (last 30 days)" },
      { label: "Avg Response Time", value: "< 2 hours" },
      { label: "Preferred Contact Time", value: "9–11 AM Riyadh time" },
      { label: "Communication Style", value: "Direct, formal Arabic/English" },
    ]
  },
];

interface Props {
  params: { id: string };
}

export default function ContactProfilePage({ params }: Props) {
  const { id } = params;
  const { data: contact, isLoading } = useContact(id);
  const { data: activitiesData } = useActivities({ contact_id: id, limit: "5" });
  const { data: callsData } = useCalls({ contact_id: id, limit: "3" });
  const { data: dealsData } = useDeals({ contact_id: id });
  const { data: signalsData } = useSignals({ contact_id: id, limit: "3" });

  const activities = activitiesData?.activities ?? [];
  const calls = callsData?.calls ?? [];
  const deals = dealsData?.deals ?? [];
  const signals = signalsData?.signals ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-muted/60 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl h-80 animate-pulse" />
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card rounded-2xl h-40 animate-pulse" />
            <div className="glass-card rounded-2xl h-40 animate-pulse" />
          </div>
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

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/contacts">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Contacts
        </button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Profile Card */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            {/* Avatar + Score */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl nf-chameleon-bg flex items-center justify-center text-white text-2xl font-black">
                {(contact.first_name?.[0] ?? "") + (contact.last_name?.[0] ?? "")}
              </div>
              <ScoreRing score={score} size={72} />
            </div>

            <h1 className="text-xl font-bold text-foreground leading-tight">
              {contact.first_name} {contact.last_name}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{contact.title}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-[#B8A0C8] font-medium">{contact.company_name}</span>
            </div>

            {/* Status + Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className={cn(
                "text-xs px-2.5 py-1 rounded-full font-medium capitalize",
                contact.status === "qualified" ? "bg-[#B8A0C8]/20 text-[#B8A0C8]" :
                  contact.status === "active" ? "bg-[#88B8B0]/20 text-[#88B8B0]" : "bg-muted/50 text-muted-foreground"
              )}>{contact.status}</span>
              {(contact.tags ?? []).map((t: string) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">{t}</span>
              ))}
            </div>

            <div className="mt-4 space-y-0">
              <InfoRow icon={Mail} label="Email" value={contact.email ?? "—"} href={`mailto:${contact.email}`} />
              <InfoRow icon={Phone} label="Phone" value={contact.phone ?? "—"} />
              <InfoRow icon={Linkedin} label="LinkedIn" value="View profile" href={contact.linkedin_url ?? "#"} />
              <InfoRow icon={MapPin} label="Location" value="Riyadh, Saudi Arabia" />
            </div>

            <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              <Edit className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>

          {/* AI Recommendations */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-[#B8A0C8]" />
              <span className="text-sm font-semibold text-foreground">AI Recommendations</span>
            </div>
            <div className="space-y-2.5">
              {[
                { icon: CheckCircle2, text: "Schedule closing call — high buying intent detected", color: "text-[#88B8B0]" },
                { icon: Zap, text: "Gulf Ventures Series B signal — reach out within 24h", color: "text-[#B8B880]" },
                { icon: MessageSquare, text: "Send Arabic follow-up via WhatsApp for higher response rate", color: "text-[#B8A0C8]" },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <r.icon className={cn("w-3.5 h-3.5 flex-shrink-0 mt-0.5", r.color)} />
                  <span>{r.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Open Deals */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#88B8B0]" />
                Open Deals
              </h2>
              <button className="text-xs text-[#B8A0C8] hover:underline">New deal</button>
            </div>
            {deals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deals yet</p>
            ) : (
              <div className="space-y-3">
                {deals.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{d.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">{d.stage?.replace("_", " ")} · {d.probability}% probability</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#88B8B0]">${((d.value ?? 0) / 100).toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground">{d.currency}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile Enrichment */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#C8A880]" />
                Profile Enrichment
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">AI enriched · 2h ago</span>
                <button className="text-xs px-2 py-1 rounded-lg nf-chameleon-bg text-white">Re-enrich</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ENRICHMENT_SECTIONS.map(section => (
                <div key={section.title}>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">{section.title}</h3>
                  <div className="space-y-2">
                    {section.items.map(item => (
                      <div key={item.label}>
                        <div className="text-[10px] text-muted-foreground/70">{item.label}</div>
                        <div className="text-xs text-foreground">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Signals */}
          {signals.length > 0 && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#B8B880]" />
                <h2 className="font-semibold text-foreground">Buying Signals</h2>
              </div>
              <div className="space-y-2">
                {signals.map((s: any) => (
                  <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl bg-[#B8B880]/10 border border-[#B8B880]/20">
                    <Zap className="w-3.5 h-3.5 text-[#B8B880] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">{s.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.body}</div>
                    </div>
                    <span className="ml-auto text-xs font-bold text-[#88B8B0] flex-shrink-0">{s.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                Activity Timeline
              </h2>
              <button className="text-xs text-[#B8A0C8] hover:underline">View all</button>
            </div>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activities yet</p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border/30" />
                <div className="space-y-3 pl-10">
                  {activities.map((a: any) => (
                    <div key={a.id} className="relative">
                      <div className="absolute -left-6 w-3 h-3 rounded-full border-2 border-[#B8A0C8] bg-background" />
                      <div className="p-3 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-foreground">{a.title}</span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-medium ml-auto",
                            a.status === "completed" ? "bg-[#88B8B0]/20 text-[#88B8B0]" : "bg-[#C8A880]/20 text-[#C8A880]"
                          )}>{a.status}</span>
                        </div>
                        {a.body && <p className="text-xs text-muted-foreground line-clamp-2">{a.body}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {contact.notes && (
            <div className="glass-card rounded-2xl p-5">
              <h2 className="font-semibold text-foreground mb-3">Notes</h2>
              <p className="text-sm text-foreground/80 leading-relaxed">{contact.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
