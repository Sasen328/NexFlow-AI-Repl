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
  Activity, Search, X, Zap, Target, BarChart3, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch, useActivities, useContacts } from "@/hooks/useApi";
import { useQueryClient, useQuery } from "@tanstack/react-query";

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

// ─── AI List Builder tab ──────────────────────────────────────────────────────
// Two modes:
//   "ai"     — Segment questionnaire → AI picks matching CRM contacts → push to dialer
//   "manual" — Checkbox-select any CRM contacts manually → push to dialer
function AiListBuilderTab({ navigate }: { navigate: (to: string) => void }) {
  const [mode, setMode] = useState<"ai" | "manual">("ai");

  // AI builder
  const [criteria, setCriteria] = useState({ industry: "", seniority: "", geography: "", companySize: "", painPoint: "" });
  const [listName, setListName] = useState("");
  const [building, setBuilding] = useState(false);
  const [aiResult, setAiResult] = useState<{ list: any; members: any[] } | null>(null);
  const [error, setError] = useState("");

  // Manual selector
  const { data: contactsData, isLoading: contactsLoading } = useContacts({ limit: "150" });
  const allContacts: any[] = (contactsData as any)?.contacts ?? [];
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pushing, setPushing] = useState(false);
  const [manualResult, setManualResult] = useState<{ listId: string; count: number } | null>(null);

  const filtered = allContacts.filter((c: any) => {
    const q = search.toLowerCase();
    return !q || `${c.first_name} ${c.last_name} ${c.title ?? ""} ${c.company ?? ""}`.toLowerCase().includes(q);
  });

  async function buildWithAI() {
    const parts: string[] = [];
    if (criteria.industry)   parts.push(`Target industry: ${criteria.industry}`);
    if (criteria.seniority)  parts.push(`Seniority: ${criteria.seniority}`);
    if (criteria.geography)  parts.push(`Geography: ${criteria.geography}`);
    if (criteria.companySize) parts.push(`Company size: ${criteria.companySize}`);
    if (criteria.painPoint)  parts.push(`Pain point / goal: ${criteria.painPoint}`);
    if (!parts.length) { setError("Fill in at least one criterion."); return; }

    const prompt = parts.join(". ");
    const name = listName.trim() || `AI list — ${criteria.industry || criteria.seniority || "segment"} ${new Date().toLocaleDateString("en-GB")}`;
    setBuilding(true); setError(""); setAiResult(null);
    try {
      const data: any = await apiFetch("/ai/lists/generate", { method: "POST", body: JSON.stringify({ prompt, name }) });
      if (!data.created) { setError(data.message ?? "AI couldn't match contacts — try adjusting your criteria."); return; }
      const listData: any = await apiFetch(`/lists/${data.list.id}`);
      setAiResult({ list: data.list, members: listData.members ?? [] });
    } catch (e: any) {
      setError(e?.message ?? "Failed to build list.");
    } finally {
      setBuilding(false);
    }
  }

  async function pushManual() {
    if (!selected.size) return;
    setPushing(true); setError("");
    try {
      const name = listName.trim() || `Manual list — ${new Date().toLocaleDateString("en-GB")}`;
      const created: any = await apiFetch("/lists", { method: "POST", body: JSON.stringify({ name, description: "Manually curated call list", object_type: "contact" }) });
      const listId: string = created.list?.id ?? created.id;
      await apiFetch("/lists/bulk-add", { method: "POST", body: JSON.stringify({ list_id: listId, entity_ids: [...selected] }) });
      setManualResult({ listId, count: selected.size });
    } catch (e: any) {
      setError(e?.message ?? "Failed to create list.");
    } finally {
      setPushing(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="inline-flex p-1 rounded-xl bg-muted/40 border border-border/40">
        {([["ai", "AI Build", Sparkles], ["manual", "Manual Select", Users]] as const).map(([k, label, Icon]) => (
          <button key={k} type="button" onClick={() => { setMode(k); setError(""); }}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              mode === k ? "nf-chameleon-bg text-white" : "text-muted-foreground hover:text-foreground")}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* ── AI BUILD ── */}
      {mode === "ai" && !aiResult && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 border" style={{ background: "linear-gradient(135deg,#f0f9f8,#f9f3ff)", borderColor: "rgba(136,184,176,0.3)" }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">AI List Builder</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Define your target segment and AI will pick matching contacts from your CRM and create a prioritised call list.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {([
                ["industry", "Target Industry",
                  ["Banking & Finance","Fintech","Real Estate","Oil & Gas / Energy","Telecom","Healthcare","Retail / E-commerce","Government","Logistics","Technology / SaaS","Construction","Education","Hospitality"]],
                ["seniority", "Seniority Level",
                  ["C-Suite (CEO, CFO, CTO, COO)","VP / SVP / EVP","Director","Senior Manager / Manager","Individual Contributor"]],
                ["geography", "Geography / Market",
                  ["UAE","Saudi Arabia (KSA)","Kuwait","Qatar","Bahrain","Oman","Egypt","Jordan","Lebanon","All GCC"]],
                ["companySize", "Company Size",
                  ["1–50 (startup)","51–200 (SME)","201–1,000 (mid-market)","1,001–10,000 (enterprise)","10,000+ (large enterprise)"]],
              ] as [keyof typeof criteria, string, string[]][]).map(([key, label, opts]) => (
                <div key={key}>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
                  <select value={criteria[key]} onChange={e => setCriteria(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#88B8B0]">
                    <option value="">Any</option>
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Pain Point / Goal</label>
              <input value={criteria.painPoint} onChange={e => setCriteria(p => ({ ...p, painPoint: e.target.value }))}
                placeholder="e.g. Scaling sales team, struggling with manual CRM, expanding into GCC markets…"
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#88B8B0]" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">List Name (optional)</label>
              <input value={listName} onChange={e => setListName(e.target.value)}
                placeholder="e.g. GCC Banking VPs Q2 2026"
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#88B8B0]" />
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

            <button onClick={buildWithAI} disabled={building}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl nf-chameleon-bg text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-60">
              {building ? <><Loader2 className="w-4 h-4 animate-spin" /> Building your list…</> : <><Sparkles className="w-4 h-4" /> Build AI Call List</>}
            </button>
          </div>
        </div>
      )}

      {mode === "ai" && aiResult && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4 border border-[#88B8B0]/30" style={{ background: "rgba(136,184,176,0.06)" }}>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#88B8B0] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground">{aiResult.list.name}</div>
                <div className="text-xs text-muted-foreground">{aiResult.members.length} contacts matched · ready to dial</div>
              </div>
              <button onClick={() => { setAiResult(null); setError(""); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 text-muted-foreground hover:bg-muted/40 flex-shrink-0">
                Rebuild
              </button>
              <button onClick={() => navigate(`/power-dialer?list=${aiResult.list.id}`)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold nf-chameleon-bg text-white flex items-center gap-1.5 flex-shrink-0">
                <Phone className="w-3 h-3" /> Dial Now
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {aiResult.members.map((c: any, i: number) => {
              const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
              return (
                <div key={c.id ?? i} className="glass-card rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg nf-chameleon-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {name[0] ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{name || "—"}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.title ?? ""}{c.company ? ` · ${c.company}` : ""}</div>
                  </div>
                  {c.lead_score != null && (
                    <span className="text-xs font-bold text-[#88B8B0] flex-shrink-0">{Math.round(Number(c.lead_score))}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MANUAL SELECT ── */}
      {mode === "manual" && !manualResult && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, title or company…"
              className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#88B8B0]" />
            {selected.size > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#88B8B0]/20 text-[#88B8B0] flex-shrink-0">
                {selected.size} selected
              </span>
            )}
          </div>
          <input value={listName} onChange={e => setListName(e.target.value)}
            placeholder="List name (optional)"
            className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#88B8B0]" />

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {contactsLoading
              ? [...Array(6)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-muted/30 animate-pulse" />)
              : filtered.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-8">No contacts found.</p>
                : filtered.map((c: any) => {
                    const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
                    const isSel = selected.has(c.id);
                    return (
                      <button key={c.id} type="button"
                        onClick={() => setSelected(s => { const n = new Set(s); isSel ? n.delete(c.id) : n.add(c.id); return n; })}
                        className={cn("w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border",
                          isSel ? "border-[#88B8B0]/40 bg-[#88B8B0]/08" : "border-transparent bg-muted/20 hover:bg-muted/40")}>
                        <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                          isSel ? "bg-[#88B8B0] border-[#88B8B0]" : "border-border/60")}>
                          {isSel && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-[#88B8B0]/15 flex items-center justify-center text-[#88B8B0] text-xs font-bold flex-shrink-0">
                          {name[0] ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground">{name || "—"}</div>
                          <div className="text-xs text-muted-foreground truncate">{c.title ?? ""}{c.company ? ` · ${c.company}` : ""}</div>
                        </div>
                        {c.phone && <Phone className="w-3.5 h-3.5 text-[#88B8B0] flex-shrink-0" />}
                      </button>
                    );
                  })
            }
          </div>

          <button onClick={pushManual} disabled={!selected.size || pushing}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl nf-chameleon-bg text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40">
            {pushing
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating list…</>
              : <><Phone className="w-4 h-4" /> Push {selected.size ? `${selected.size} leads` : "selected leads"} to Dialer</>}
          </button>
        </div>
      )}

      {mode === "manual" && manualResult && (
        <div className="rounded-2xl p-8 border border-[#88B8B0]/30 text-center space-y-4" style={{ background: "rgba(136,184,176,0.06)" }}>
          <CheckCircle2 className="w-10 h-10 text-[#88B8B0] mx-auto" />
          <div>
            <div className="font-bold text-foreground text-lg">{manualResult.count} contacts added to call list</div>
            <div className="text-xs text-muted-foreground mt-1">Ready to dial from the Power Dialer</div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setManualResult(null); setSelected(new Set()); setError(""); }}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-border/40 text-muted-foreground hover:bg-muted/40">
              Build another
            </button>
            <button onClick={() => navigate(`/power-dialer?list=${manualResult.listId}`)}
              className="px-5 py-2 rounded-xl text-sm font-bold nf-chameleon-bg text-white flex items-center gap-2">
              <Phone className="w-4 h-4" /> Dial Now
            </button>
          </div>
        </div>
      )}
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

// ─── AI Priority Queue tab (existing CRM contacts ranked by AI score) ────────
function PriorityQueueTab({ navigate }: { navigate: (to: string) => void }) {
  const qc = useQueryClient();
  const { data: queueData, isLoading, refetch } = useQuery({
    queryKey: ["power-dialer-queue"],
    queryFn: () => apiFetch("/power-dialer/queue?limit=30"),
  });
  const [pushed, setPushed] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const queue: any[] = (queueData as any)?.queue ?? [];

  async function pushCall(contact: any, callMode: "auto" | "ai" | "agent") {
    const key = `${contact.id}-${callMode}`;
    setBusy(key);
    try {
      if (callMode === "auto" || callMode === "ai") {
        await apiFetch("/power-dialer/voice-agent-call", { method: "POST", body: JSON.stringify({ contact_id: contact.id }) });
      } else {
        await apiFetch("/activities", { method: "POST", body: JSON.stringify({
          contact_id: contact.id, type: "call",
          title: `Agent call scheduled for ${contact.first_name} ${contact.last_name}`,
          status: "pending", metadata: { source: "call_list", mode: "real_agent" },
        }) });
      }
      setPushed(p => ({ ...p, [key]: "✓" }));
      await qc.invalidateQueries({ queryKey: ["activities"] });
    } catch { setPushed(p => ({ ...p, [key]: "!" })); }
    finally {
      setBusy(null);
      setTimeout(() => setPushed(p => { const n = { ...p }; delete n[key]; return n; }), 3000);
    }
  }

  if (isLoading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="glass-card rounded-2xl h-24 animate-pulse" />)}</div>;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-5 border" style={{ background: "linear-gradient(135deg,#f0f9f8,#f9f3ff)", borderColor: "rgba(136,184,176,0.3)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm"><Bot className="w-5 h-5 text-white" /></div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#88B8B0] mb-0.5">AI Ranked</div>
              <h3 className="text-base font-black text-foreground">Priority Call Queue</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {queue.length} contacts ranked by AI priority (lead score + open deal value − days since last touch).
                Push to: <strong>Auto-Call</strong>, <strong>AI Agent</strong>, or <strong>Real Agent</strong>.
              </p>
            </div>
          </div>
          <button onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground border border-border/40 hover:border-[#88B8B0]/50 transition-colors">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <Phone className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No contacts with phone numbers yet.</p>
          <Link href="/contacts"><button className="mt-3 text-xs text-[#88B8B0] font-semibold hover:underline">Add contacts →</button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((c: any, idx: number) => {
            const score = Math.round(Number(c.priority_score ?? c.lead_score ?? 0));
            const scoreColor = score >= 80 ? "#88B8B0" : score >= 50 ? "#C8A880" : "#B8A0C8";
            const initials = `${c.first_name?.[0] ?? "?"}${c.last_name?.[0] ?? ""}`.toUpperCase();
            const fullName = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim();
            return (
              <div key={c.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-muted-foreground bg-muted/30 flex-shrink-0">#{idx + 1}</div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm"
                    style={{ background: `linear-gradient(135deg,${scoreColor},${scoreColor}cc)` }}>{initials}</div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/contacts/${c.id}`}><button className="text-sm font-bold text-foreground hover:underline text-left">{fullName}</button></Link>
                    <div className="text-[11px] text-muted-foreground truncate">{c.title ?? "—"}{c.phone ? ` · ${c.phone}` : ""}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {Number(c.open_value) > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background:"#B8B88015",color:"#B8B880" }}>${(Number(c.open_value)/100).toLocaleString()} open</span>}
                      {Number(c.call_count) > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground">{c.call_count} call{c.call_count !== 1?"s":""}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-black" style={{ color: scoreColor }}>{score}</div>
                    <div className="text-[9px] text-muted-foreground">priority</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {([["auto","Auto-Call","#88B8B0",Phone],["ai","AI Agent","#B8A0C8",Bot],["agent","Real Agent","#C8A880",Users]] as const).map(([m,label,color,Icon]) => {
                    const key = `${c.id}-${m}`; const isBusy = busy===key; const done = pushed[key];
                    return (
                      <button key={m} onClick={() => pushCall(c, m)} disabled={isBusy||!!done}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold border transition-all disabled:opacity-60"
                        style={{ borderColor:done?"#88B8B0":`${color}55`, color:done?"#88B8B0":color, background:done?"#88B8B010":`${color}08` }}>
                        {isBusy?<Loader2 className="w-3 h-3 animate-spin"/>:done?<CheckCircle2 className="w-3 h-3"/>:<Icon className="w-3 h-3"/>}
                        {done?"Pushed!":label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────
type Tab = "scorecards" | "quick" | "list-builder" | "priority-queue";

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
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("nf:open-assistant"))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 text-muted-foreground text-xs font-medium hover:text-foreground transition-colors"
          >
            <Bot className="w-3.5 h-3.5" /> Ask AI
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsStrip />

      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/40 w-fit flex-wrap">
        {([
          ["scorecards",    "Live Scorecards",  BarChart3],
          ["quick",         "Quick Actions",    Search],
          ["list-builder",  "AI List Builder",  Sparkles],
          ["priority-queue","Priority Queue",   Bot],
        ] as [Tab, string, React.ElementType][]).map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              tab === k ? "nf-chameleon-bg text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "scorecards"    && <ScorecardsTab navigate={navigate} />}
      {tab === "quick"         && <QuickActionsTab />}
      {tab === "list-builder"  && <AiListBuilderTab navigate={navigate} />}
      {tab === "priority-queue"&& <PriorityQueueTab navigate={navigate} />}

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
