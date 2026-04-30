/**
 * Command Center — first tab in the CRM.
 *
 *   Tab 1 "Live Scorecards"  — recently contacted people with mini scorecards
 *                              and per-row action buttons that PUSH a command
 *                              into that contact (call note, WhatsApp, email,
 *                              follow-up, AI voice call).
 *   Tab 2 "Quick Actions"    — search by name OR phone number to find a
 *                              contact, then push any command into them.
 */

import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Phone, MessageSquare, Mail, Mic, Sparkles, Bot, Send, Loader2, CheckCircle2,
  Users, TrendingUp, Layers, ChevronRight, CalendarPlus, LayoutGrid, StickyNote,
  Activity, Search, X, Zap, Target, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch, useActivities, useContacts } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

// ─── Types ──────────────────────────────────────────────────────────────
type ActionKey = "log-call" | "log-note" | "whatsapp" | "email" | "follow-up" | "voice-call";

interface Action {
  key: ActionKey;
  label: string;
  short: string;
  icon: React.ElementType;
  color: string;
  logType: string;
  href?: string;
}

const ACTIONS: Action[] = [
  { key: "log-call",   label: "Log Call",       short: "Call",     icon: Phone,        color: "#88B8B0", logType: "call"     },
  { key: "log-note",   label: "Log Meeting",    short: "Note",     icon: StickyNote,   color: "#B8B880", logType: "note"     },
  { key: "whatsapp",   label: "AI WhatsApp",    short: "WhatsApp", icon: MessageSquare,color: "#90B8B8", logType: "whatsapp" },
  { key: "email",      label: "Email Draft",    short: "Email",    icon: Mail,         color: "#B8A0C8", logType: "email"    },
  { key: "follow-up",  label: "Follow-up",      short: "Follow",   icon: CalendarPlus, color: "#C8A880", logType: "meeting"  },
  { key: "voice-call", label: "AI Voice Call",  short: "Voice",    icon: Mic,          color: "#A090C8", logType: "call",    href: "/voice-agents" },
];

// ─── Push a command into a contact (logs activity tied to the contact) ──
async function pushAction(action: Action, contactId: string | null, body?: { title?: string; body?: string }) {
  await apiFetch("/activities", {
    method: "POST",
    body: JSON.stringify({
      type: action.logType,
      title: body?.title?.trim() || action.label,
      body: body?.body?.trim() || null,
      status: "completed",
      completed_at: new Date().toISOString(),
      contact_id: contactId,
      metadata: { source: "command_center", action: action.key },
    }),
  });
}

// ─── A single per-contact scorecard with inline action buttons ──────────
function ContactScorecard({ contact, onPush, navigate }: {
  contact: any;
  onPush: (a: Action, c: any) => void;
  navigate: (to: string) => void;
}) {
  const score = Number(contact.score ?? 0);
  const scoreColor = score >= 80 ? "#88B8B0" : score >= 50 ? "#C8A880" : "#B8A0C8";
  const initials = `${(contact.first_name?.[0] ?? "?")}${(contact.last_name?.[0] ?? "")}`.toUpperCase();
  const fullName = `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() || "—";

  return (
    <div className="glass-card rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${scoreColor}, ${scoreColor}cc)` }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/contacts/${contact.id}`}>
            <button className="text-left">
              <div className="font-bold text-foreground text-sm truncate hover:underline">{fullName}</div>
              <div className="text-[11px] text-muted-foreground truncate">
                {contact.title ?? "—"}{contact.company_name ? ` · ${contact.company_name}` : ""}
              </div>
            </button>
          </Link>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xl font-black" style={{ color: scoreColor }}>{score}</div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">score</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3 text-[10px] text-muted-foreground flex-wrap">
        {contact.email && <span className="px-1.5 py-0.5 rounded bg-muted/50 truncate max-w-[140px]" title={contact.email}>{contact.email}</span>}
        {contact.phone && <span className="px-1.5 py-0.5 rounded bg-muted/50">{contact.phone}</span>}
        {contact.country && <span className="px-1.5 py-0.5 rounded bg-muted/50">{contact.country}</span>}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {ACTIONS.map(a => {
          const Icon = a.icon;
          return (
            <button
              key={a.key}
              onClick={() => a.href ? navigate(a.href) : onPush(a, contact)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border/30 hover:border-[var(--ac)] hover:bg-[var(--ac)]/8 transition-colors"
              style={{ "--ac": a.color } as any}
              title={a.label}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: a.color }} />
              <span className="text-[9px] font-semibold text-foreground">{a.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab 1: Live Scorecards of contacted people ─────────────────────────
function ScorecardsTab({ navigate }: { navigate: (to: string) => void }) {
  const qc = useQueryClient();
  const { data: actData } = useActivities({ limit: "50" });
  const { data: contactData, isLoading } = useContacts({ limit: "100", sort: "-score" });
  const [pushed, setPushed] = useState<string | null>(null);
  const [pushModal, setPushModal] = useState<{ action: Action; contact: any } | null>(null);
  const [busy, setBusy] = useState(false);
  const [logTitle, setLogTitle] = useState("");
  const [logBody, setLogBody] = useState("");

  // "Recently contacted" = unique contact IDs from the most recent activities,
  // joined with the live contact records to draw scorecards.
  const recentContactIds = useMemo(() => {
    const acts = actData?.activities ?? [];
    const ids: string[] = [];
    const seen = new Set<string>();
    for (const a of acts) {
      const cid = a.contact_id;
      if (cid && !seen.has(cid)) { seen.add(cid); ids.push(cid); }
      if (ids.length >= 12) break;
    }
    return ids;
  }, [actData]);

  const allContacts = contactData?.contacts ?? [];
  const recentContacts = useMemo(() => {
    if (recentContactIds.length === 0) return allContacts.slice(0, 8);
    const byId = new Map(allContacts.map((c: any) => [c.id, c]));
    return recentContactIds.map(id => byId.get(id)).filter(Boolean) as any[];
  }, [recentContactIds, allContacts]);

  async function handlePush(action: Action, contact: any) {
    setPushModal({ action, contact });
    setLogTitle("");
    setLogBody("");
  }

  async function confirmPush() {
    if (!pushModal) return;
    setBusy(true);
    try {
      await pushAction(pushModal.action, pushModal.contact.id, { title: logTitle, body: logBody });
      await qc.invalidateQueries({ queryKey: ["activities"] });
      setPushed(`${pushModal.contact.id}-${pushModal.action.key}`);
      setTimeout(() => setPushed(null), 2000);
      setPushModal(null);
    } catch { /* swallow */ } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5" />
          Live scorecards · {recentContacts.length} recently contacted
        </h2>
        <Link href="/contacts">
          <button className="text-[11px] text-[#88B8B0] font-semibold hover:underline flex items-center gap-1">
            All contacts <ChevronRight className="w-3 h-3" />
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="glass-card rounded-2xl h-44 animate-pulse" />)}
        </div>
      ) : recentContacts.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">No contacts yet — add one to start pushing actions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentContacts.map((c: any) => <ContactScorecard key={c.id} contact={c} onPush={handlePush} navigate={navigate} />)}
        </div>
      )}

      {pushed && (
        <div className="fixed bottom-6 right-6 glass-card rounded-xl px-4 py-3 flex items-center gap-2 shadow-xl border border-[#88B8B0]/40 z-40">
          <CheckCircle2 className="w-4 h-4 text-[#88B8B0]" />
          <span className="text-sm font-semibold text-foreground">Action pushed to contact</span>
        </div>
      )}

      {pushModal && (
        <PushActionModal
          action={pushModal.action}
          contact={pushModal.contact}
          title={logTitle}
          body={logBody}
          busy={busy}
          onTitle={setLogTitle}
          onBody={setLogBody}
          onClose={() => setPushModal(null)}
          onSubmit={confirmPush}
        />
      )}
    </div>
  );
}

// ─── Tab 2: Quick Actions — search by name or phone, then push ──────────
function QuickActionsTab() {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [pushModal, setPushModal] = useState<Action | null>(null);
  const [logTitle, setLogTitle] = useState("");
  const [logBody, setLogBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [pushed, setPushed] = useState<string | null>(null);
  const { data, isLoading } = useContacts({ limit: "200" });
  const all = data?.contacts ?? [];

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as any[];
    const isPhone = /[0-9+()\-\s]/.test(q) && q.replace(/[^0-9]/g, "").length >= 4;
    const numericQ = q.replace(/[^0-9]/g, "");
    return all.filter((c: any) => {
      if (isPhone && c.phone) {
        const phone = String(c.phone).replace(/[^0-9]/g, "");
        if (phone.includes(numericQ)) return true;
      }
      const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.toLowerCase();
      if (name.includes(q)) return true;
      if (c.email && c.email.toLowerCase().includes(q)) return true;
      if (c.company_name && c.company_name.toLowerCase().includes(q)) return true;
      return false;
    }).slice(0, 8);
  }, [query, all]);

  async function handlePush(a: Action) {
    if (!selected) return;
    if (a.href) {
      window.location.href = a.href;
      return;
    }
    setPushModal(a);
    setLogTitle("");
    setLogBody("");
  }

  async function confirmPush() {
    if (!pushModal || !selected) return;
    setBusy(true);
    try {
      await pushAction(pushModal, selected.id, { title: logTitle, body: logBody });
      await qc.invalidateQueries({ queryKey: ["activities"] });
      setPushed(pushModal.label);
      setTimeout(() => setPushed(null), 2000);
      setPushModal(null);
    } catch { /* swallow */ } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Search className="w-3.5 h-3.5" />
          Find a contact — type a name or phone number
        </label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); }}
            placeholder="e.g. Sara Al-Mansouri  ·  +966 50 123 4567  ·  ahmed@…"
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-border/40 bg-muted/30 text-sm outline-none focus:border-[#88B8B0]/60"
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setSelected(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {query && !selected && (
          <div className="rounded-xl border border-border/30 bg-muted/20 max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-xs text-muted-foreground">Loading contacts…</div>
            ) : matches.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No matches. Try a different name or phone digits.
              </div>
            ) : (
              matches.map((c: any) => {
                const score = Number(c.score ?? 0);
                const sc = score >= 80 ? "#88B8B0" : score >= 50 ? "#C8A880" : "#B8A0C8";
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 border-b border-border/20 last:border-0 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ background: sc }}>
                      {(c.first_name?.[0] ?? "?")}{(c.last_name?.[0] ?? "")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {c.title ?? "—"}{c.company_name ? ` · ${c.company_name}` : ""}{c.phone ? ` · ${c.phone}` : ""}
                      </div>
                    </div>
                    <div className="text-xs font-black" style={{ color: sc }}>{score}</div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Selected contact + actions */}
      {selected && (
        <div className="glass-card rounded-2xl p-5 space-y-4 border border-[#88B8B0]/30">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-base"
              style={{ background: "linear-gradient(135deg, #88B8B0, #B8A0C8)" }}>
              {(selected.first_name?.[0] ?? "?")}{(selected.last_name?.[0] ?? "")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-foreground">{selected.first_name} {selected.last_name}</div>
              <div className="text-xs text-muted-foreground">
                {selected.title ?? "—"}{selected.company_name ? ` · ${selected.company_name}` : ""}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 flex flex-wrap gap-2">
                {selected.email && <span>{selected.email}</span>}
                {selected.phone && <span>· {selected.phone}</span>}
                {selected.country && <span>· {selected.country}</span>}
              </div>
            </div>
            <Link href={`/contacts/${selected.id}`}>
              <button className="text-[11px] text-[#88B8B0] font-semibold hover:underline">Open profile</button>
            </Link>
            <button onClick={() => { setSelected(null); setQuery(""); }} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ACTIONS.map(a => {
              const Icon = a.icon;
              return (
                <button
                  key={a.key}
                  onClick={() => handlePush(a)}
                  className="group flex flex-col items-start gap-1.5 p-3 rounded-xl border border-border/40 hover:border-[var(--ac)] hover:bg-[var(--ac)]/8 transition-colors text-left"
                  style={{ "--ac": a.color } as any}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${a.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: a.color }} />
                  </div>
                  <div className="text-xs font-bold text-foreground">{a.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!selected && !query && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground">
            Search above by name or phone to push any action into a contact's timeline.
          </p>
        </div>
      )}

      {pushed && (
        <div className="fixed bottom-6 right-6 glass-card rounded-xl px-4 py-3 flex items-center gap-2 shadow-xl border border-[#88B8B0]/40 z-40">
          <CheckCircle2 className="w-4 h-4 text-[#88B8B0]" />
          <span className="text-sm font-semibold text-foreground">{pushed} pushed</span>
        </div>
      )}

      {pushModal && selected && (
        <PushActionModal
          action={pushModal}
          contact={selected}
          title={logTitle}
          body={logBody}
          busy={busy}
          onTitle={setLogTitle}
          onBody={setLogBody}
          onClose={() => setPushModal(null)}
          onSubmit={confirmPush}
        />
      )}
    </div>
  );
}

// ─── Push-action modal (shared by both tabs) ─────────────────────────────
function PushActionModal({ action, contact, title, body, busy, onTitle, onBody, onClose, onSubmit }: {
  action: Action;
  contact: any;
  title: string;
  body: string;
  busy: boolean;
  onTitle: (v: string) => void;
  onBody: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const Icon = action.icon;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-5 w-full max-w-md space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${action.color}20` }}>
            <Icon className="w-5 h-5" style={{ color: action.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-foreground">{action.label}</div>
            <div className="text-xs text-muted-foreground truncate">→ {contact.first_name} {contact.last_name}</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <input
          autoFocus
          value={title}
          onChange={e => onTitle(e.target.value)}
          placeholder="Title / subject (optional)"
          className="w-full rounded-xl border border-border/40 bg-muted/30 px-3 py-2 text-sm outline-none focus:border-[#88B8B0]/60"
        />
        <textarea
          rows={4}
          value={body}
          onChange={e => onBody(e.target.value)}
          placeholder="Notes, summary, talking points — paste anything…"
          className="w-full rounded-xl border border-border/40 bg-muted/30 px-3 py-2 text-sm outline-none focus:border-[#88B8B0]/60 resize-none"
        />
        <div className="flex gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">Cancel</button>
          <button
            onClick={onSubmit}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Push to {contact.first_name}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stats strip (kept from previous version) ───────────────────────────
function StatsStrip() {
  const { data: contactsData } = useContacts({ limit: "1" });
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: "Contacts",     value: contactsData?.total ?? "—", icon: Users,        color: "#88B8B0", href: "/contacts" },
        { label: "Active Deals", value: "19",                       icon: TrendingUp,   color: "#B8B880", href: "/deal-pipeline" },
        { label: "Open Tasks",   value: "12",                       icon: CheckCircle2, color: "#C8A880", href: "/home" },
        { label: "Signals",      value: "34",                       icon: Zap,          color: "#B8A0C8", href: "/enrichment-engine?tab=signals" },
      ].map(s => {
        const Icon = s.icon;
        return (
          <Link key={s.label} href={s.href}>
            <div className="glass-card rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────
type Tab = "scorecards" | "quick";

export default function CommandCenterPage() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("scorecards");

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden p-6"
        style={{ background: "linear-gradient(135deg, #f8f4ff 0%, #f0f9f8 40%, #fff8f0 80%, #fdf6ff 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(circle, #B8A0C8, transparent)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #88B8B0, transparent)" }} />
        </div>
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">Command Center</h1>
              <p className="text-xs text-muted-foreground">
                Live scorecards of contacted people · push actions to any contact
              </p>
            </div>
          </div>
          <Link href="/assistant">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 text-muted-foreground text-xs font-medium hover:text-foreground transition-colors">
              <Bot className="w-3.5 h-3.5" /> Ask AI
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <StatsStrip />

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/40 w-fit">
        {[
          { k: "scorecards" as Tab, label: "Live Scorecards", icon: BarChart3 },
          { k: "quick"      as Tab, label: "Quick Actions",   icon: Search },
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

      {tab === "scorecards" && <ScorecardsTab navigate={navigate} />}
      {tab === "quick" && <QuickActionsTab />}

      {/* Shortcuts */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" /> Jump to
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Contacts",       href: "/contacts",                    icon: Users,      color: "#88B8B0" },
            { label: "Deals",          href: "/deal-pipeline",               icon: TrendingUp, color: "#B8B880" },
            { label: "Sequences",      href: "/sequences-audiences",         icon: Layers,     color: "#C8A880" },
            { label: "Lead Finder",    href: "/enrichment-engine?tab=intel", icon: Target,     color: "#B8A0C8" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <Link key={s.label} href={s.href}>
                <div className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{s.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
