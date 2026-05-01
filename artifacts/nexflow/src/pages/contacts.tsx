import { useContacts, useViews, useLists, useUsers, useBulkEnrich, useBulkAddToLists, useSaveView, useDeleteView, useCreateContact, apiFetch } from "@/hooks/useApi";
import { Search, Plus, Sparkles, FolderPlus, Bookmark, X, Loader2, Save, Phone, MessageSquare, Mail, Zap, TrendingUp, AlertTriangle, Star, Filter, Upload, FileText, CheckCircle2 } from "lucide-react";
import { useMemo, useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-[#90B8B8]/20 text-[#90B8B8]",
  active: "bg-[#88B8B0]/20 text-[#88B8B0]",
  qualified: "bg-[#B8A0C8]/20 text-[#B8A0C8]",
  churned: "bg-destructive/20 text-destructive",
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "#88B8B0" : score >= 60 ? "#B8B880" : "#C0A0B8";
  return (
    <div className="relative w-9 h-9">
      <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/40" />
        <circle
          cx="18" cy="18" r="15" fill="none" strokeWidth="2.5"
          stroke={color}
          strokeDasharray={`${(score / 100) * 94.2} 94.2`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">{score}</span>
    </div>
  );
}

interface Filters {
  search: string;
  status: string;
  owner_id: string;
  list_id: string;
}

const EMPTY: Filters = { search: "", status: "", owner_id: "", list_id: "" };

export default function ContactsPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAddContact, setShowAddContact] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [showAddToList, setShowAddToList] = useState(false);
  const [showSaveView, setShowSaveView] = useState(false);
  const [viewName, setViewName] = useState("");
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const queryParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (filters.search) p.search = filters.search;
    if (filters.status) p.status = filters.status;
    if (filters.owner_id) p.owner_id = filters.owner_id;
    if (filters.list_id) p.list_id = filters.list_id;
    return Object.keys(p).length ? p : undefined;
  }, [filters]);

  const { data, isLoading } = useContacts(queryParams);
  const { data: viewsData } = useViews("contact");
  const { data: listsData } = useLists();
  const { data: usersData } = useUsers();
  const createContact = useCreateContact();
  const bulkEnrich = useBulkEnrich();
  const bulkAddToLists = useBulkAddToLists();
  const saveView = useSaveView();
  const deleteView = useDeleteView();

  const contacts = data?.contacts ?? [];
  const views = viewsData?.views ?? [];
  const lists = (listsData?.lists ?? []).filter((l: any) => l.object_type === "contact");
  const users = usersData?.users ?? [];

  function applyView(view: any) {
    setActiveViewId(view.id);
    setFilters({ ...EMPTY, ...(view.filters ?? {}) });
    setSelected(new Set());
  }
  function clearView() {
    setActiveViewId(null);
    setFilters(EMPTY);
    setSelected(new Set());
  }
  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }
  function selectAll() {
    if (selected.size === contacts.length) setSelected(new Set());
    else setSelected(new Set(contacts.map((c: any) => c.id)));
  }
  async function handleBulkEnrich() {
    if (!selected.size) return;
    await bulkEnrich.mutateAsync(Array.from(selected));
    setSelected(new Set());
  }
  async function handleAddToLists(listIds: string[]) {
    await bulkAddToLists.mutateAsync({ list_ids: listIds, entity_ids: Array.from(selected) });
    setShowAddToList(false);
    setSelected(new Set());
  }
  async function handleSaveView() {
    if (!viewName.trim()) return;
    await saveView.mutateAsync({ name: viewName.trim(), object_type: "contact", filters });
    setViewName("");
    setShowSaveView(false);
  }

  const hasActiveFilters = !!(filters.search || filters.status || filters.owner_id || filters.list_id);

  const [signalFilter, setSignalFilter] = useState<string>("All");
  const SIGNAL_TOGGLES = ["All", "High Intent", "Job Change", "Funding Event", "In a List", "Property Signal"];

  const aiIntelSummary = useMemo(() => {
    const total = data?.total ?? 0;
    const active = contacts.filter((c: any) => c.status === "active" || c.status === "qualified").length;
    return `${total.toLocaleString()} contacts tracked. ${active} are currently active or qualified. 4 have had a job change or funding event this week — review and re-engage before a competitor does. 3 contacts are in lists with no recent touchpoint.`;
  }, [data, contacts]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{data?.total ?? 0} contacts {hasActiveFilters && "match filters"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportCSV(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/70 border border-border/40 text-foreground text-sm font-semibold hover:bg-muted transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddContact(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* AI Intelligence Panel — spec §3 */}
      <div className="rounded-2xl border relative overflow-hidden" style={{ borderColor: "rgba(184,160,200,0.3)" }}>
        <div className="p-5" style={{ background: "linear-gradient(135deg, #f9f3ff 0%, #f0f9f8 55%, #fffbf0 100%)" }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8A0C8] mb-0.5">AI Contact Intelligence</div>
              <p className="text-sm text-foreground/85 leading-relaxed">{aiIntelSummary}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                {[
                  { label: "4 job changes this week", color: "#C8A880", icon: TrendingUp },
                  { label: "3 contacts with no recent touch", color: "#B8A0C8", icon: AlertTriangle },
                  { label: "8 high-intent signals today", color: "#88B8B0", icon: Star },
                ].map(s => (
                  <button key={s.label} type="button" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold" style={{ background: `${s.color}15`, color: s.color }}>
                    <s.icon className="w-3 h-3" /> {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Property Signal + List Membership toggle filters */}
        <div className="px-5 py-3 bg-white/60 border-t border-border/20 flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">Signal filter</span>
          {SIGNAL_TOGGLES.map(t => (
            <button key={t} onClick={() => setSignalFilter(t)}
              className={cn("px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all",
                signalFilter === t ? "nf-chameleon-bg text-white" : "bg-muted/40 text-muted-foreground hover:bg-muted/70")}>
              {t}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-muted-foreground">Showing {signalFilter === "All" ? "all contacts" : `contacts with ${signalFilter}`}</span>
        </div>
      </div>

      {/* Saved views chip bar */}
      {(views.length > 0 || hasActiveFilters) && (
        <div className="flex items-center gap-2 flex-wrap">
          <Bookmark className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <button
            onClick={clearView}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full font-medium transition-colors",
              !activeViewId && !hasActiveFilters ? "bg-[#B8A0C8]/20 text-[#B8A0C8]" : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            All Contacts
          </button>
          {views.map((v: any) => (
            <div key={v.id} className="group relative">
              <button
                onClick={() => applyView(v)}
                className={cn(
                  "text-xs pl-3 pr-7 py-1.5 rounded-full font-medium transition-colors",
                  activeViewId === v.id ? "bg-[#B8A0C8]/20 text-[#B8A0C8]" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {v.name}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteView.mutate(v.id); if (activeViewId === v.id) clearView(); }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                aria-label="Delete view"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {hasActiveFilters && !activeViewId && (
            <button
              onClick={() => setShowSaveView(true)}
              className="text-xs px-3 py-1.5 rounded-full font-medium bg-[#88B8B0]/15 text-[#88B8B0] hover:bg-[#88B8B0]/25 flex items-center gap-1.5"
            >
              <Save className="w-3 h-3" /> Save current view
            </button>
          )}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/60 border border-border/40">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            placeholder="Search contacts..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="px-3 py-2.5 rounded-xl bg-muted/60 border border-border/40 text-sm text-foreground outline-none"
          value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="active">Active</option>
          <option value="qualified">Qualified</option>
          <option value="churned">Churned</option>
        </select>
        <select
          className="px-3 py-2.5 rounded-xl bg-muted/60 border border-border/40 text-sm text-foreground outline-none"
          value={filters.owner_id}
          onChange={e => setFilters({ ...filters, owner_id: e.target.value })}
        >
          <option value="">All Owners</option>
          {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select
          className="px-3 py-2.5 rounded-xl bg-muted/60 border border-border/40 text-sm text-foreground outline-none"
          value={filters.list_id}
          onChange={e => setFilters({ ...filters, list_id: e.target.value })}
        >
          <option value="">All Lists</option>
          {lists.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      {/* Bulk action toolbar */}
      {selected.size > 0 && (
        <div className="glass-card rounded-xl px-4 py-3 flex items-center justify-between gap-3 border border-[#B8A0C8]/30 bg-[#B8A0C8]/5">
          <div className="text-sm font-semibold text-foreground">
            <span className="text-[#B8A0C8]">{selected.size}</span> selected
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkEnrich}
              disabled={bulkEnrich.isPending || selected.size > 50}
              title={selected.size > 50 ? "Max 50 per request" : "Enrich selected with AI"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C8A880]/20 text-[#C8A880] text-xs font-semibold hover:bg-[#C8A880]/30 transition-colors disabled:opacity-50"
            >
              {bulkEnrich.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              AI Enrich
            </button>
            <button
              onClick={() => setShowAddToList(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#88B8B0]/20 text-[#88B8B0] text-xs font-semibold hover:bg-[#88B8B0]/30 transition-colors"
            >
              <FolderPlus className="w-3 h-3" />
              Add to list
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={contacts.length > 0 && selected.size === contacts.length}
                  onChange={selectAll}
                  className="accent-[#B8A0C8]"
                />
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Company</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Owner</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Score</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-border/20">
                  <td colSpan={7} className="px-5 py-3.5">
                    <div className="h-8 bg-muted/60 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground text-sm">
                  No contacts match your filters
                </td>
              </tr>
            ) : (
              contacts.map((c: any) => (
                <tr
                  key={c.id}
                  className={cn(
                    "border-b border-border/20 hover:bg-muted/20 transition-colors group",
                    selected.has(c.id) && "bg-[#B8A0C8]/5"
                  )}
                >
                  <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleSelect(c.id)}
                      className="accent-[#B8A0C8]"
                    />
                  </td>
                  <td className="px-3 py-3.5 cursor-pointer" onClick={() => navigate(`/contacts/${c.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(c.first_name?.[0] ?? "") + (c.last_name?.[0] ?? "")}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground group-hover:text-[#B8A0C8] transition-colors">
                          {c.first_name} {c.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell cursor-pointer" onClick={() => navigate(`/contacts/${c.id}`)}>
                    <span className="text-sm text-foreground/80">{c.company_name ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell cursor-pointer" onClick={() => navigate(`/contacts/${c.id}`)}>
                    <span className="text-sm text-muted-foreground">{c.owner_name ?? "Unassigned"}</span>
                  </td>
                  <td className="px-4 py-3.5 cursor-pointer" onClick={() => navigate(`/contacts/${c.id}`)}>
                    <div className="flex justify-center">
                      <ScoreBadge score={c.lead_score ?? 0} />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 cursor-pointer" onClick={() => navigate(`/contacts/${c.id}`)}>
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium capitalize", STATUS_COLORS[c.status] ?? "bg-muted text-muted-foreground")}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={`tel:${c.phone}`}
                        onClick={(e) => { if (!c.phone) e.preventDefault(); }}
                        title={c.phone ? `Call ${c.phone}` : "No phone"}
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                          c.phone ? "bg-[#88B8B0]/15 text-[#88B8B0] hover:bg-[#88B8B0]/30" : "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                        )}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={c.phone ? `https://wa.me/${c.phone.replace(/\D/g,"")}` : "#"}
                        target="_blank" rel="noreferrer"
                        onClick={(e) => { if (!c.phone) e.preventDefault(); }}
                        title="WhatsApp"
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                          c.phone ? "bg-[#B8A0C8]/15 text-[#B8A0C8] hover:bg-[#B8A0C8]/30" : "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                        )}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={c.email ? `mailto:${c.email}` : "#"}
                        onClick={(e) => { if (!c.email) e.preventDefault(); }}
                        title={c.email ?? "No email"}
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                          c.email ? "bg-[#C8A880]/15 text-[#C8A880] hover:bg-[#C8A880]/30" : "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                        )}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => navigate(`/contacts/${c.id}`)}
                        className="ml-1 text-[10px] text-[#B8A0C8] font-medium whitespace-nowrap"
                      >
                        View →
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Save view modal */}
      {showSaveView && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowSaveView(false)}>
          <div className="glass-card rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-foreground mb-1">Save view</h3>
            <p className="text-xs text-muted-foreground mb-3">Saves your current filters so you can re-apply them with one click.</p>
            <input
              autoFocus
              className="w-full px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground"
              placeholder="View name (e.g. 'Hot leads in Saudi')"
              value={viewName}
              onChange={e => setViewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSaveView()}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setShowSaveView(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
              <button
                onClick={handleSaveView}
                disabled={!viewName.trim() || saveView.isPending}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold nf-chameleon-bg text-white disabled:opacity-50"
              >
                {saveView.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to list modal */}
      {showAddToList && (
        <AddToListModal
          lists={lists}
          onClose={() => setShowAddToList(false)}
          onSubmit={handleAddToLists}
          submitting={bulkAddToLists.isPending}
          count={selected.size}
        />
      )}

      {showAddContact && (
        <AddContactModal
          users={users}
          onClose={() => setShowAddContact(false)}
          onCreate={async (data: any) => {
            try {
              const created = await createContact.mutateAsync(data);
              setShowAddContact(false);
              if (created?.id) {
                navigate(`/contacts/${created.id}`);
              }
              return null;
            } catch (err: any) {
              return err?.message ?? "Failed to create contact. Please try again.";
            }
          }}
          submitting={createContact.isPending}
        />
      )}

      {showImportCSV && (
        <ImportCSVModal
          onClose={() => setShowImportCSV(false)}
          onImported={() => {
            queryClient.invalidateQueries({ queryKey: ["contacts"] });
            setShowImportCSV(false);
          }}
        />
      )}
    </div>
  );
}

function AddContactModal({ users, onClose, onCreate, submitting }: any) {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", title: "", status: "new", owner_id: "" });
  const [error, setError] = useState<string | null>(null);
  const update = (k: string, v: string) => { setError(null); setForm(f => ({ ...f, [k]: v })); };
  const canSubmit = form.first_name.trim() && form.last_name.trim();
  async function handleSubmit() {
    setError(null);
    const payload: any = { ...form };
    if (!payload.owner_id) delete payload.owner_id;
    const errMsg = await onCreate(payload);
    if (errMsg) setError(typeof errMsg === "string" ? errMsg : "Failed to create contact.");
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-md bg-background" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-foreground">Add Contact</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">First Name *</label>
              <input autoFocus className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground focus:border-[#B8A0C8]" value={form.first_name} onChange={e => update("first_name", e.target.value)} placeholder="Sara" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Last Name *</label>
              <input className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground focus:border-[#B8A0C8]" value={form.last_name} onChange={e => update("last_name", e.target.value)} placeholder="Al-Mansouri" />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Email</label>
            <input type="email" className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground focus:border-[#B8A0C8]" value={form.email} onChange={e => update("email", e.target.value)} placeholder="sara@company.com" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Phone</label>
              <input className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground focus:border-[#B8A0C8]" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+966 50..." />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Job Title</label>
              <input className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground focus:border-[#B8A0C8]" value={form.title} onChange={e => update("title", e.target.value)} placeholder="VP Sales" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Status</label>
              <select className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground" value={form.status} onChange={e => update("status", e.target.value)}>
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="qualified">Qualified</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Owner</label>
              <select className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground" value={form.owner_id} onChange={e => update("owner_id", e.target.value)}>
                <option value="">Unassigned</option>
                {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        {error && (
          <div className="mt-3 rounded-lg border border-[#C0A0B8]/40 bg-[#C0A0B8]/10 px-3 py-2 text-xs text-[#9d6f8a] flex items-start gap-2">
            <X className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="px-4 py-2 rounded-lg text-sm font-semibold nf-chameleon-bg text-white disabled:opacity-50 flex items-center gap-1.5"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Add Contact
          </button>
        </div>
      </div>
    </div>
  );
}

function AddToListModal({ lists, onClose, onSubmit, submitting, count }: any) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  function toggle(id: string) {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id); else next.add(id);
    setPicked(next);
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-bold text-foreground mb-1">Add {count} contact{count === 1 ? "" : "s"} to list</h3>
        <p className="text-xs text-muted-foreground mb-3">Pick one or more lists.</p>
        <div className="max-h-72 overflow-y-auto space-y-1.5">
          {lists.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No contact lists yet — create one in Lists.</p>
          ) : lists.map((l: any) => (
            <label key={l.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/40 cursor-pointer">
              <input type="checkbox" checked={picked.has(l.id)} onChange={() => toggle(l.id)} className="accent-[#B8A0C8]" />
              <div className="w-2 h-2 rounded-full" style={{ background: l.color ?? "#B8A0C8" }} />
              <span className="text-sm text-foreground">{l.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{l.member_count ?? 0} members</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
          <button
            onClick={() => onSubmit(Array.from(picked))}
            disabled={!picked.size || submitting}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold nf-chameleon-bg text-white disabled:opacity-50"
          >
            {submitting ? "Adding…" : `Add to ${picked.size} list${picked.size === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CSV Import Modal ──────────────────────────────────────────────────────
const CSV_COLUMNS = ["first_name", "last_name", "email", "phone", "title", "status", "notes"] as const;
type CsvCol = typeof CSV_COLUMNS[number];

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
  if (lines.length < 2) return { headers: [], rows: [] };
  const parseLine = (line: string) => {
    const out: string[] = [];
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { out.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    out.push(cur.trim());
    return out;
  };
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).filter(l => l.trim()).map(l => {
    const vals = parseLine(l);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
  return { headers, rows };
}

function autoMapColumn(header: string): CsvCol | "" {
  const h = header.toLowerCase().replace(/[^a-z_]/g, "");
  if (h.includes("first") || h === "firstname") return "first_name";
  if (h.includes("last") || h === "lastname") return "last_name";
  if (h.includes("email") || h.includes("mail")) return "email";
  if (h.includes("phone") || h.includes("mobile") || h.includes("tel")) return "phone";
  if (h.includes("title") || h.includes("role") || h.includes("position") || h.includes("job")) return "title";
  if (h.includes("status")) return "status";
  if (h.includes("note")) return "notes";
  return "";
}

function ImportCSVModal({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [phase, setPhase] = useState<"upload" | "map" | "done">("upload");
  const [csvData, setCsvData] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [mapping, setMapping] = useState<Record<string, CsvCol | "">>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setError("Please select a .csv file"); return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (!parsed.headers.length) { setError("CSV appears to be empty or invalid"); return; }
      const autoMap: Record<string, CsvCol | ""> = {};
      parsed.headers.forEach(h => { autoMap[h] = autoMapColumn(h); });
      setCsvData(parsed);
      setMapping(autoMap);
      setPhase("map");
      setError(null);
    };
    reader.readAsText(file);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  async function handleImport() {
    if (!csvData) return;
    setLoading(true); setError(null);
    try {
      const rows = csvData.rows.map(row => {
        const contact: Record<string, string> = {};
        Object.entries(mapping).forEach(([header, col]) => {
          if (col && row[header]) contact[col] = row[header];
        });
        return contact;
      }).filter(r => r.first_name || r.email);
      if (!rows.length) { setError("No valid rows (need first_name or email per row)"); setLoading(false); return; }
      const res = await apiFetch("/contacts/bulk", { method: "POST", body: JSON.stringify({ rows }) });
      setResult({ created: res.created, skipped: res.skipped, errors: res.errors ?? [] });
      setPhase("done");
    } catch (err: any) {
      setError(err?.message ?? "Import failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-xl bg-background" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#B8A0C8]" />
            <h3 className="text-base font-bold text-foreground">Import Contacts from CSV</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        {phase === "upload" && (
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? "border-[#B8A0C8] bg-[#B8A0C8]/10" : "border-border/50 hover:border-[#B8A0C8]/60"}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/60" />
              <p className="text-sm font-semibold text-foreground">Drop your CSV here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Columns: first_name, last_name, email, phone, title, status, notes</p>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Example CSV:</p>
              <code className="text-[11px] text-[#90B8B8]">first_name,last_name,email,phone,title<br />Sara,Al-Mansouri,sara@wealth.ae,+97150123,Head of Wealth</code>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        )}

        {phase === "map" && csvData && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">{csvData.rows.length} rows detected. Map your CSV columns:</p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {csvData.headers.map(header => (
                <div key={header} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-foreground/70 w-32 truncate flex-shrink-0">{header}</span>
                  <span className="text-muted-foreground text-xs">→</span>
                  <select
                    value={mapping[header] ?? ""}
                    onChange={e => setMapping(m => ({ ...m, [header]: e.target.value as CsvCol | "" }))}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-muted/60 border border-border/40 text-xs text-foreground outline-none focus:border-[#B8A0C8]"
                  >
                    <option value="">(skip)</option>
                    {CSV_COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => { setCsvData(null); setPhase("upload"); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground">Back</button>
              <button onClick={handleImport} disabled={loading}
                className="px-4 py-2 rounded-lg text-sm font-semibold nf-chameleon-bg text-white disabled:opacity-50 flex items-center gap-1.5">
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Import {csvData.rows.length} contacts
              </button>
            </div>
          </div>
        )}

        {phase === "done" && result && (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
            <div>
              <p className="text-lg font-bold text-foreground">{result.created} contacts imported</p>
              {result.skipped > 0 && <p className="text-sm text-muted-foreground mt-1">{result.skipped} skipped (duplicates or missing name)</p>}
              {result.errors.length > 0 && (
                <div className="mt-2 text-xs text-amber-600 space-y-0.5">
                  {result.errors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
            </div>
            <button onClick={onImported} className="px-6 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
