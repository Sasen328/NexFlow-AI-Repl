import { useState } from "react";
import { useCampaigns, useCreate, useGenerateCampaignContent, useSendCampaign, useDuplicateCampaign, useCampaignRecipients, useDelete } from "@/hooks/useApi";
import { Mail, MessageSquare, Phone, Plus, Sparkles, Send, Copy, Trash2, Users, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNEL_ICONS: any = { email: Mail, whatsapp: MessageSquare, sms: MessageSquare, voice: Phone, linkedin: Mail };
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted/60 text-muted-foreground",
  scheduled: "bg-[#90B8B8]/15 text-[#90B8B8]",
  running: "bg-[#88B8B0]/15 text-[#88B8B0]",
  paused: "bg-[#C8A880]/15 text-[#C8A880]",
  completed: "bg-[#B8A0C8]/15 text-[#B8A0C8]",
};
const STATUS_FILTERS = ["all", "draft", "scheduled", "running", "paused", "completed"];

export default function CampaignsPage() {
  const { data, isLoading } = useCampaigns();
  const create = useCreate("/campaigns", ["campaigns"]);
  const generate = useGenerateCampaignContent();
  const send = useSendCampaign();
  const duplicate = useDuplicateCampaign();
  const del = useDelete((id) => `/campaigns/${id}`, ["campaigns"]);
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("email");
  const [statusFilter, setStatusFilter] = useState("all");

  const allCampaigns = data?.campaigns ?? [];
  const campaigns = statusFilter === "all" ? allCampaigns : allCampaigns.filter((c: any) => c.status === statusFilter);

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Multi-channel marketing with AI-generated copy, recipient tracking, and live engagement metrics.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide mr-1">Status:</span>
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={cn(
            "px-3 py-1 rounded-full text-xs font-medium capitalize",
            statusFilter === s ? "nf-chameleon-bg text-white" : "bg-muted/50 text-muted-foreground hover:text-foreground"
          )}>{s} {s !== "all" && `(${allCampaigns.filter((c: any) => c.status === s).length})`}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {isLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="h-40 glass-card rounded-2xl animate-pulse" />) :
          campaigns.length === 0 ? <div className="md:col-span-2 glass-card rounded-2xl p-10 text-center text-sm text-muted-foreground">No campaigns match this filter.</div> :
          campaigns.map((c: any) => {
            const Icon = CHANNEL_ICONS[c.channel] ?? Mail;
            const openRate = c.sent_count ? Math.round((c.opened_count / c.sent_count) * 100) : 0;
            return (
              <div key={c.id} className="glass-card rounded-2xl p-5 hover:shadow-md transition-shadow group relative">
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); duplicate.mutate(c.id); }} className="p-1.5 rounded bg-muted/60 text-muted-foreground hover:text-foreground" title="Duplicate"><Copy className="w-3 h-3" /></button>
                  <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${c.name}"?`)) del.mutate(c.id); }} className="p-1.5 rounded bg-muted/60 text-muted-foreground hover:text-[#C8A880]" title="Delete"><Trash2 className="w-3 h-3" /></button>
                </div>
                <div onClick={() => setSelected(c)} className="cursor-pointer">
                  <div className="flex items-start justify-between mb-3 pr-16">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#B8A0C8]/15 text-[#B8A0C8] flex items-center justify-center"><Icon className="w-5 h-5" /></div>
                      <div>
                        <div className="font-bold text-foreground text-sm">{c.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{c.channel} · {c.utm_campaign ?? "no utm"}</div>
                      </div>
                    </div>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", STATUS_COLORS[c.status])}>{c.status}</span>
                  </div>
                  {c.ai_generated && <div className="text-[10px] text-[#B8A0C8] font-bold flex items-center gap-1 mb-2"><Sparkles className="w-2.5 h-2.5" /> AI generated</div>}
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <Stat label="Sent" value={c.sent_count ?? 0} />
                    <Stat label="Opened" value={c.opened_count ?? 0} />
                    <Stat label="Clicked" value={c.clicked_count ?? 0} />
                    <Stat label="Open %" value={openRate + "%"} highlight />
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>

      {showNew && (
        <Modal onClose={() => setShowNew(false)} title="New campaign">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Campaign name" className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
          <select value={channel} onChange={e => setChannel(e.target.value)} className="w-full mt-3 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none">
            <option value="email">Email</option><option value="whatsapp">WhatsApp</option><option value="sms">SMS</option><option value="linkedin">LinkedIn</option>
          </select>
          <div className="flex gap-2 mt-5">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-sm">Cancel</button>
            <button onClick={() => create.mutate({ name, channel, status: "draft" }, { onSuccess: () => { setShowNew(false); setName(""); } })} disabled={!name} className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50">Create</button>
          </div>
        </Modal>
      )}

      {selected && <CampaignDetail
        campaign={selected}
        onClose={() => setSelected(null)}
        onGenerate={(opts) => generate.mutate({ id: selected.id, ...opts }, { onSuccess: (c) => setSelected(c) })}
        onSend={() => send.mutate(selected.id, { onSuccess: (c) => { alert(`Sent: ${c.sent}, Failed: ${c.failed}${c.errors?.length ? "\n"+c.errors.join("\n") : ""}`); setSelected(null); } })}
        generating={generate.isPending}
        sending={send.isPending}
      />}
    </div>
  );
}

function Stat({ label, value, highlight }: any) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("text-base font-bold mt-0.5", highlight ? "nf-text-chameleon" : "text-foreground")}>{value}</div>
    </div>
  );
}

function Modal({ children, onClose, title }: any) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-foreground mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function CampaignDetail({ campaign, onClose, onGenerate, onSend, generating, sending }: any) {
  const [audience, setAudience] = useState("dormant leads");
  const [goal, setGoal] = useState("re-engage and book a meeting");
  const [tone, setTone] = useState("friendly");
  const [tab, setTab] = useState<"content" | "recipients">("content");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-foreground text-lg">{campaign.name}</h3>
        <p className="text-xs text-muted-foreground capitalize mt-0.5">{campaign.channel} campaign · {campaign.status} · {campaign.sent_count ?? 0} sent · {campaign.opened_count ?? 0} opened</p>

        <div className="flex gap-1 mt-4 border-b border-border/30">
          {[
            { id: "content", label: "Content", icon: FileText },
            { id: "recipients", label: `Recipients (${campaign.sent_count ?? 0})`, icon: Users },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)} className={cn(
              "px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 -mb-px transition-colors",
              tab === t.id ? "border-[#88B8B0] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}><t.icon className="w-3.5 h-3.5" /> {t.label}</button>
          ))}
        </div>

        {tab === "content" && (
          <>
            <div className="mt-5 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Audience" className="px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-xs outline-none" />
                <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="Goal" className="px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-xs outline-none" />
                <select value={tone} onChange={e => setTone(e.target.value)} className="px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-xs outline-none">
                  <option value="friendly">Friendly</option><option value="professional">Professional</option><option value="urgent">Urgent</option><option value="warm">Warm</option>
                </select>
              </div>
              <button onClick={() => onGenerate({ audience, goal, tone })} disabled={generating} className="w-full px-3 py-2 rounded-lg bg-[#B8A0C8] text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
                <Sparkles className="w-3.5 h-3.5" /> {generating ? "Generating…" : "Generate Content with AI"}
              </button>
            </div>

            <div className="mt-4">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Subject</div>
              <div className="px-3 py-2 rounded-lg bg-muted/40 text-sm">{campaign.subject ?? <span className="text-muted-foreground">(generate first)</span>}</div>
            </div>
            <div className="mt-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Content (HTML preview)</div>
              <div className="rounded-lg bg-white border border-border/40 p-3 max-h-64 overflow-y-auto text-sm" dangerouslySetInnerHTML={{ __html: campaign.content ?? "<p class='text-muted-foreground italic'>(generate first)</p>" }} />
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm">Close</button>
              <button onClick={onSend} disabled={!campaign.content || sending} className="flex-1 px-4 py-2 rounded-lg bg-[#88B8B0] text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> {sending ? "Sending…" : "Send to audience"}
              </button>
            </div>
          </>
        )}

        {tab === "recipients" && <RecipientsTab campaignId={campaign.id} />}
      </div>
    </div>
  );
}

function RecipientsTab({ campaignId }: { campaignId: string }) {
  const { data, isLoading } = useCampaignRecipients(campaignId);
  const recipients = data?.recipients ?? [];
  if (isLoading) return <div className="mt-4 space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="h-12 bg-muted/30 rounded animate-pulse" />)}</div>;
  if (recipients.length === 0) return <div className="mt-6 text-center text-sm text-muted-foreground py-10">No recipients yet — send the campaign to populate this list.</div>;
  return (
    <div className="mt-4 max-h-96 overflow-y-auto space-y-1.5">
      {recipients.map((r: any) => (
        <div key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-muted/30 text-xs">
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-foreground truncate">{r.contact_name}</div>
            <div className="text-muted-foreground truncate">{r.contact_email} {r.company_name && <span>· {r.company_name}</span>}</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {r.opened_at && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#88B8B0]/15 text-[#88B8B0] font-bold uppercase">opened</span>}
            {r.clicked_at && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#B8A0C8]/15 text-[#B8A0C8] font-bold uppercase">clicked</span>}
            {r.replied_at && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C8A880]/15 text-[#C8A880] font-bold uppercase">replied</span>}
            <span className="text-muted-foreground text-[10px]">{r.sent_at ? new Date(r.sent_at).toLocaleDateString() : "—"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
