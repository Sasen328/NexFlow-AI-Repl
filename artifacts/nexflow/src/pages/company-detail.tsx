import { useParams, Link } from "wouter";
import { useCompany, useCompanyIntelligence, useContacts, useDeals, useUsers } from "@/hooks/useApi";
import { Building2, Globe, MapPin, Sparkles, ArrowLeft, TrendingUp, Users2, Newspaper, Target, AlertTriangle, Wrench, Crosshair, MessageSquare, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id!;
  const qc = useQueryClient();
  const { data: company, isLoading } = useCompany(id);
  const { data: intel, isFetching: intelLoading } = useCompanyIntelligence(id);
  const { data: contactsData } = useContacts();
  const { data: dealsData } = useDeals();
  const { data: usersData } = useUsers();

  const contacts = (contactsData?.contacts ?? []).filter((c: any) => c.company_id === id);
  const deals = (dealsData?.deals ?? []).filter((d: any) => d.company_id === id);
  const owner = (usersData?.users ?? []).find((u: any) => u.id === company?.owner_id);
  const totalPipeline = deals.reduce((s: number, d: any) => s + (d.value ?? 0), 0);

  if (isLoading || !company) {
    return <div className="space-y-4">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="h-40 glass-card rounded-2xl animate-pulse" />
    </div>;
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <Link href="/companies">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
          <ArrowLeft className="w-3 h-3" /> Back to companies
        </div>
      </Link>

      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl nf-chameleon-bg flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
            {company.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
              {company.industry && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#B8A0C8]/15 text-[#B8A0C8] font-medium">{company.industry}</span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              {company.domain && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {company.domain}</span>}
              {company.country && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {company.country}</span>}
              {company.size && <span className="flex items-center gap-1"><Users2 className="w-3 h-3" /> {company.size}</span>}
              {owner && <span className="flex items-center gap-1">Owner: <span className="font-medium text-foreground">{owner.name}</span></span>}
            </div>
            <p className="text-sm text-muted-foreground mt-2.5 line-clamp-3">{company.description}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Pipeline</div>
            <div className="text-xl font-black text-[#88B8B0]">${totalPipeline.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">{deals.length} deals · {contacts.length} contacts</div>
          </div>
        </div>
      </div>

      {/* AI Intelligence */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B8A0C8]" />
            <h2 className="font-bold text-foreground">AI Company Intelligence</h2>
            {intelLoading && <span className="text-xs text-muted-foreground animate-pulse">Researching…</span>}
          </div>
          <button
            onClick={() => qc.invalidateQueries({ queryKey: ["companies", id, "intelligence"] })}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 hover:bg-muted text-xs text-muted-foreground"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        {intel ? (
          <div className="space-y-5">
            <p className="text-sm text-foreground/85 leading-relaxed">{intel.summary}</p>

            <div className="grid md:grid-cols-2 gap-5">
              <Section icon={Newspaper} title="Recent News" color="#B8A0C8">
                {(intel.recent_news ?? []).length ? (intel.recent_news ?? []).map((n: any, i: number) => (
                  <div key={i} className="text-xs">
                    <div className="font-medium text-foreground">{n.title}</div>
                    <div className="text-muted-foreground">{n.date} · <span className={n.impact === "high" ? "text-[#C8A880]" : ""}>{n.impact} impact</span></div>
                  </div>
                )) : <Empty />}
              </Section>

              <Section icon={Target} title="Buying Signals" color="#88B8B0">
                {(intel.buying_signals ?? []).length ? (intel.buying_signals ?? []).map((s: string, i: number) => (
                  <div key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                    <span className="text-[#88B8B0]">•</span> {s}
                  </div>
                )) : <Empty />}
              </Section>

              <Section icon={Users2} title="Key People" color="#C8A880">
                {(intel.key_people ?? []).length ? (intel.key_people ?? []).map((p: any, i: number) => (
                  <div key={i} className="text-xs">
                    <div className="font-medium text-foreground">{p.name}</div>
                    <div className="text-muted-foreground">{p.title}</div>
                  </div>
                )) : <Empty />}
              </Section>

              <Section icon={Wrench} title="Tech Stack" color="#90B8B8">
                <div className="flex flex-wrap gap-1.5">
                  {(intel.tech_stack ?? []).map((t: string) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded bg-muted/60 text-foreground/80">{t}</span>
                  )) }
                  {!(intel.tech_stack ?? []).length && <Empty />}
                </div>
              </Section>

              <Section icon={Crosshair} title="Competitors" color="#B8B880">
                <div className="flex flex-wrap gap-1.5">
                  {(intel.competitors ?? []).map((c: string) => (
                    <span key={c} className="text-xs px-2 py-0.5 rounded bg-muted/60 text-foreground/80">{c}</span>
                  ))}
                  {!(intel.competitors ?? []).length && <Empty />}
                </div>
              </Section>

              <Section icon={MessageSquare} title="Outreach Angles" color="#B8A0C8">
                {(intel.outreach_angles ?? []).length ? (intel.outreach_angles ?? []).map((a: string, i: number) => (
                  <div key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                    <span className="text-[#B8A0C8]">→</span> {a}
                  </div>
                )) : <Empty />}
              </Section>
            </div>

            {(intel.risk_factors ?? []).length > 0 && (
              <div className="rounded-xl bg-[#C8A880]/10 border border-[#C8A880]/25 p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#C8A880] mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Risk Factors
                </div>
                <div className="space-y-1">
                  {intel.risk_factors.map((r: string, i: number) => (
                    <div key={i} className="text-xs text-foreground/80">• {r}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground py-8 text-center">Generating intelligence brief…</div>
        )}
      </div>

      {/* Contacts & Deals */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-bold text-foreground text-sm mb-3">Contacts ({contacts.length})</h3>
          <div className="space-y-2">
            {contacts.slice(0, 5).map((c: any) => (
              <Link key={c.id} href={`/contacts/${c.id}`}>
                <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="w-7 h-7 rounded-full nf-chameleon-bg text-white text-[10px] font-bold flex items-center justify-center">
                    {c.first_name?.[0]}{c.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{c.first_name} {c.last_name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{c.title}</div>
                  </div>
                </div>
              </Link>
            ))}
            {!contacts.length && <Empty />}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-bold text-foreground text-sm mb-3">Deals ({deals.length})</h3>
          <div className="space-y-2">
            {deals.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{d.title}</div>
                  <div className="text-[10px] text-muted-foreground">{d.stage}</div>
                </div>
                <div className="text-xs font-bold text-[#88B8B0] flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  ${(d.value ?? 0).toLocaleString()}
                </div>
              </div>
            ))}
            {!deals.length && <Empty />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, color, children }: any) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <h3 className="text-xs font-bold uppercase tracking-wide text-foreground/70">{title}</h3>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
function Empty() { return <div className="text-xs text-muted-foreground italic">No data yet</div>; }
