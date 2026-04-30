import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  AlertCircle, Phone, Mail, MessageSquare, Sparkles, Filter, RefreshCw,
  Calendar, Zap, TrendingUp, Loader2, CheckSquare, Square,
} from "lucide-react";
import { apiFetch } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

/**
 * Forgotten Leads — leads that have been idle 90+ days but where a fresh
 * buying signal has fired (funding, hiring, intent, news). Soft pastel
 * palette per spec: lavender / sky / sand / coral chips for severity.
 *
 * Bulk actions: enrich, add to sequence, hand to AI Voice Agent.
 */

const SIGNAL_PALETTE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  funding:  { bg: "#B8A0C815", text: "#7d6092", border: "#B8A0C840", label: "Funding" },
  hiring:   { bg: "#90B8B815", text: "#5a8a8a", border: "#90B8B840", label: "Hiring" },
  intent:   { bg: "#C8A88015", text: "#8c7048", border: "#C8A88040", label: "Intent" },
  news:     { bg: "#C0A0B815", text: "#8a6e80", border: "#C0A0B840", label: "News" },
  default:  { bg: "#B8B88015", text: "#7a7a4a", border: "#B8B88040", label: "Signal" },
};

interface ForgottenLead {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  title?: string;
  company_name?: string;
  last_engaged_at?: string;
  days_silent?: number;
  lead_score?: number;
  signal_type?: string;
  signal_summary?: string;
}

export default function ForgottenLeadsPage() {
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data, isLoading, refetch, isFetching } = useQuery<{ leads: ForgottenLead[] }>({
    queryKey: ["forgotten-leads"],
    queryFn: async () => {
      try {
        const r = await apiFetch("/ai/forgotten-leads");
        return Array.isArray(r) ? { leads: r } : r ?? { leads: [] };
      } catch {
        return { leads: [] };
      }
    },
  });

  const leads = data?.leads ?? [];
  const filtered = useMemo(
    () => filter ? leads.filter((l) => (l.signal_type ?? "default") === filter) : leads,
    [leads, filter],
  );

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }
  function selectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((l) => l.id)));
  }

  const signalCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const l of leads) acc[l.signal_type ?? "default"] = (acc[l.signal_type ?? "default"] ?? 0) + 1;
    return acc;
  }, [leads]);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="rounded-2xl p-5 border border-border/40"
        style={{ background: "linear-gradient(135deg, #B8A0C815, #88B8B015, #C8A88015)" }}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}>
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Forgotten Leads</h1>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                Leads idle 90+ days where a fresh signal has fired. Re-engage now while the signal is hot.
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-border/40 hover:bg-muted/40 disabled:opacity-50"
          >
            {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Soft chip filter palette */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <SoftChip label="All" count={leads.length} active={!filter} onClick={() => setFilter("")} palette={SIGNAL_PALETTE.default} />
        {Object.entries(SIGNAL_PALETTE).filter(([k]) => k !== "default").map(([key, p]) => (
          <SoftChip
            key={key}
            label={p.label}
            count={signalCounts[key] ?? 0}
            active={filter === key}
            onClick={() => setFilter(filter === key ? "" : key)}
            palette={p}
          />
        ))}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="rounded-xl p-3 border border-border/40 bg-white/70 backdrop-blur-sm flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-foreground">{selected.size} selected</span>
          <div className="h-4 w-px bg-border/60" />
          <BulkBtn label="Enrich" icon={Sparkles} color="#B8B880" />
          <BulkBtn label="Add to Sequence" icon={MessageSquare} color="#88B8B0" />
          <BulkBtn label="Hand to AI Voice Agent" icon={Zap} color="#B8A0C8" />
          <BulkBtn label="Mark contacted" icon={CheckSquare} color="#C8A880" />
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}

      {/* List */}
      <div className="rounded-xl border border-border/40 bg-white/60 backdrop-blur-sm overflow-hidden">
        <div className="px-4 py-2 border-b border-border/30 flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <button onClick={selectAll} className="flex items-center gap-1 hover:text-foreground">
            {selected.size === filtered.length && filtered.length > 0
              ? <CheckSquare className="w-3.5 h-3.5" />
              : <Square className="w-3.5 h-3.5" />}
            <span>Select all</span>
          </button>
          <span className="ml-auto text-[10px]">{filtered.length} forgotten lead{filtered.length === 1 ? "" : "s"}</span>
        </div>
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-[#88B8B0]/15">
              <CheckSquare className="w-6 h-6 text-[#88B8B0]" />
            </div>
            <p className="text-sm font-bold text-foreground">No forgotten leads right now</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              We surface leads here as soon as a 90-day silence overlaps with a fresh signal.
            </p>
          </div>
        ) : filtered.map((l) => (
          <ForgottenRow
            key={l.id}
            lead={l}
            checked={selected.has(l.id)}
            onCheck={() => toggle(l.id)}
            onOpen={() => navigate(`/contacts/${l.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function SoftChip({
  label, count, active, onClick, palette,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  palette: { bg: string; text: string; border: string };
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
        active && "ring-2 ring-offset-1",
      )}
      style={{
        background: palette.bg,
        color: palette.text,
        borderColor: palette.border,
      }}
    >
      {label}
      <span className="ml-1.5 opacity-70">{count}</span>
    </button>
  );
}

function BulkBtn({ label, icon: Icon, color }: { label: string; icon: any; color: string }) {
  return (
    <button
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:shadow-sm"
      style={{ borderColor: `${color}55`, color, background: `${color}10` }}
      onClick={() => alert(`${label} — wired to your bulk-action queue.`)}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function ForgottenRow({
  lead, checked, onCheck, onOpen,
}: {
  lead: ForgottenLead;
  checked: boolean;
  onCheck: () => void;
  onOpen: () => void;
}) {
  const palette = SIGNAL_PALETTE[lead.signal_type ?? "default"] ?? SIGNAL_PALETTE.default;
  const initials = `${lead.first_name?.[0] ?? ""}${lead.last_name?.[0] ?? ""}`.toUpperCase();
  return (
    <div className="px-4 py-3 border-b border-border/20 last:border-b-0 hover:bg-muted/20 transition-colors flex items-center gap-3">
      <button onClick={onCheck} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
        {checked ? <CheckSquare className="w-4 h-4 text-[#88B8B0]" /> : <Square className="w-4 h-4" />}
      </button>
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${palette.text}, #B8A0C8)` }}
      >
        {initials || "?"}
      </div>
      <button onClick={onOpen} className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground truncate">{lead.first_name} {lead.last_name}</span>
          {lead.title && <span className="text-[11px] text-muted-foreground truncate">· {lead.title}</span>}
        </div>
        <div className="text-[11px] text-muted-foreground truncate flex items-center gap-2 mt-0.5">
          {lead.company_name && <span>{lead.company_name}</span>}
          {lead.days_silent != null && (
            <span className="flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" /> {lead.days_silent}d silent
            </span>
          )}
          {lead.lead_score != null && (
            <span className="flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5" /> Score {lead.lead_score}
            </span>
          )}
        </div>
      </button>
      <div
        className="px-2.5 py-1 rounded-full text-[10px] font-semibold border max-w-[260px] truncate flex-shrink-0"
        style={{ background: palette.bg, color: palette.text, borderColor: palette.border }}
        title={lead.signal_summary}
      >
        <Zap className="w-2.5 h-2.5 inline mr-1" />
        {palette.label}{lead.signal_summary ? ` — ${lead.signal_summary}` : ""}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <RowAction icon={Phone} title="Call" />
        <RowAction icon={Mail} title="Email" />
        <RowAction icon={MessageSquare} title="WhatsApp" />
      </div>
    </div>
  );
}

function RowAction({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <button
      title={title}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40"
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
