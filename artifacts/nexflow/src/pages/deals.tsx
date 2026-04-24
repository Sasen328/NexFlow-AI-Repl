import { useDeals, useContacts, useCompanies, useCreate, useUpdate, useDelete } from "@/hooks/useApi";
import { Plus, DollarSign, X, Loader2, Trash2, Building2, User, Calendar, Tag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const STAGES = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];

const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  lead: { label: "Lead", color: "text-[#90B8B8]", bg: "bg-[#90B8B8]/10" },
  qualified: { label: "Qualified", color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/10" },
  proposal: { label: "Proposal", color: "text-[#B8A0C8]", bg: "bg-[#B8A0C8]/10" },
  negotiation: { label: "Negotiation", color: "text-[#C8A880]", bg: "bg-[#C8A880]/10" },
  closed_won: { label: "Won", color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/20" },
  closed_lost: { label: "Lost", color: "text-destructive", bg: "bg-destructive/10" },
};

function ProbabilityBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "#88B8B0" : pct >= 50 ? "#B8B880" : "#C0A0B8";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted/60 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs text-muted-foreground w-8">{pct}%</span>
    </div>
  );
}

export default function DealsPage() {
  const { data, isLoading } = useDeals();
  const [showNew, setShowNew] = useState(false);
  const [openDeal, setOpenDeal] = useState<any>(null);
  const deals = data?.deals ?? [];

  const stageGroups: Record<string, any[]> = {};
  for (const stage of STAGES) stageGroups[stage] = [];
  for (const deal of deals) {
    const stage = deal.stage ?? "lead";
    if (stageGroups[stage]) stageGroups[stage].push(deal);
  }

  const total = deals.filter((d: any) => !["closed_won", "closed_lost"].includes(d.stage))
    .reduce((acc: number, d: any) => acc + (d.value ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deals</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            ${(total / 100).toLocaleString()} in active pipeline
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Deal
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const cfg = STAGE_CONFIG[stage];
          const stageDeals = stageGroups[stage] ?? [];
          const stageTotal = stageDeals.reduce((acc: number, d: any) => acc + (d.value ?? 0), 0);
          return (
            <div key={stage} className="flex-shrink-0 w-72">
              <div className={cn("flex items-center justify-between px-3 py-2 rounded-xl mb-3", cfg.bg)}>
                <span className={cn("text-xs font-semibold", cfg.color)}>{cfg.label}</span>
                <span className="text-xs text-muted-foreground">{stageDeals.length} · ${(stageTotal / 100).toLocaleString()}</span>
              </div>
              <div className="space-y-3">
                {isLoading ? (
                  Array(2).fill(0).map((_, i) => <div key={i} className="glass-card rounded-xl p-4 h-28 animate-pulse" />)
                ) : stageDeals.length === 0 ? (
                  <div className="glass-card rounded-xl p-4 text-center text-xs text-muted-foreground border border-dashed border-border/30">
                    No deals
                  </div>
                ) : (
                  stageDeals.map((d: any) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => setOpenDeal(d)}
                      className="w-full text-left glass-card rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="font-semibold text-sm text-foreground group-hover:text-[#B8A0C8] transition-colors line-clamp-2 mb-2">
                        {d.title}
                      </div>
                      <div className="flex items-center gap-1 text-[#88B8B0] font-bold text-sm mb-3">
                        <DollarSign className="w-3.5 h-3.5" />
                        {((d.value ?? 0) / 100).toLocaleString()} {d.currency ?? "USD"}
                      </div>
                      <ProbabilityBar pct={d.probability ?? 0} />
                      {d.contact && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div className="w-4 h-4 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-[8px] font-bold">
                            {d.contact.firstName?.[0]}
                          </div>
                          {d.contact.firstName} {d.contact.lastName}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showNew && <NewDealModal onClose={() => setShowNew(false)} />}
      {openDeal && <DealDetailDrawer deal={openDeal} onClose={() => setOpenDeal(null)} />}
    </div>
  );
}

function NewDealModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [valueDollars, setValueDollars] = useState("");
  const [stage, setStage] = useState("lead");
  const [contactId, setContactId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [notes, setNotes] = useState("");
  const { data: contactsData } = useContacts();
  const { data: companiesData } = useCompanies();
  const create = useCreate("/deals", ["deals", "dashboard"]);

  const submit = () => {
    const cents = Math.round(Number(valueDollars || "0") * 100);
    create.mutate(
      {
        title,
        value: cents,
        stage,
        contact_id: contactId || null,
        company_id: companyId || null,
        notes: notes || null,
        currency: "USD",
      },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground text-lg">New Deal</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Q2 expansion — Acme" className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#B8A0C8]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Value (USD)</label>
              <input value={valueDollars} onChange={e => setValueDollars(e.target.value)} type="number" placeholder="50000" className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Stage</label>
              <select value={stage} onChange={e => setStage(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none">
                {STAGES.map(s => <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Contact</label>
            <select value={contactId} onChange={e => setContactId(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none">
              <option value="">— none —</option>
              {(contactsData?.contacts ?? []).map((c: any) => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}{c.title ? ` (${c.title})` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Company</label>
            <select value={companyId} onChange={e => setCompanyId(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none">
              <option value="">— none —</option>
              {(companiesData?.companies ?? []).map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">Cancel</button>
          <button onClick={submit} disabled={!title || create.isPending} className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {create.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create deal
          </button>
        </div>
      </div>
    </div>
  );
}

function DealDetailDrawer({ deal, onClose }: { deal: any; onClose: () => void }) {
  const update = useUpdate((id) => `/deals/${id}`, ["deals", "dashboard"]);
  const del = useDelete((id) => `/deals/${id}`, ["deals", "dashboard"]);
  const cfg = STAGE_CONFIG[deal.stage] ?? STAGE_CONFIG.lead;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-stretch justify-end" onClick={onClose}>
      <div className="bg-background w-full max-w-md h-full overflow-y-auto p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <span className={cn("text-xs px-2 py-1 rounded-full font-semibold", cfg.bg, cfg.color)}>{cfg.label}</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">{deal.title}</h2>
        <div className="text-2xl font-black text-[#88B8B0] mb-4">${((deal.value ?? 0) / 100).toLocaleString()}</div>

        <div className="space-y-3 text-sm">
          {(deal.contact_name ?? (deal.contact && `${deal.contact.firstName ?? ""} ${deal.contact.lastName ?? ""}`.trim())) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" /> {deal.contact_name ?? `${deal.contact?.firstName ?? ""} ${deal.contact?.lastName ?? ""}`.trim()}
            </div>
          )}
          {(deal.company_name ?? deal.company?.name) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" /> {deal.company_name ?? deal.company?.name}
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" /> Created {new Date(deal.createdAt ?? deal.created_at).toLocaleDateString()}
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Probability</div>
            <ProbabilityBar pct={deal.probability ?? 0} />
          </div>
          {deal.notes && (
            <div className="p-3 rounded-xl bg-muted/30">
              <div className="text-xs font-semibold text-muted-foreground mb-1">Notes</div>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{deal.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Move to stage</div>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map(s => (
              <button
                key={s}
                onClick={() => update.mutate({ id: deal.id, data: { stage: s } })}
                disabled={s === deal.stage || update.isPending}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium transition-colors",
                  s === deal.stage ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-muted/40 hover:bg-muted text-foreground"
                )}
              >
                {STAGE_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border/40">
          <button
            onClick={() => { if (confirm("Delete this deal?")) del.mutate(deal.id, { onSuccess: () => onClose() }); }}
            className="flex items-center gap-2 text-xs text-destructive hover:text-destructive/80"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete deal
          </button>
        </div>
      </div>
    </div>
  );
}
