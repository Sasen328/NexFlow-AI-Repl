import { useContacts, useViews, useLists, useUsers, useBulkEnrich, useBulkAddToLists, useSaveView, useDeleteView } from "@/hooks/useApi";
import { Search, Plus, Sparkles, FolderPlus, Bookmark, X, Loader2, Save } from "lucide-react";
import { useMemo, useState } from "react";
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
  const [showAddToList, setShowAddToList] = useState(false);
  const [showSaveView, setShowSaveView] = useState(false);
  const [viewName, setViewName] = useState("");
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{data?.total ?? 0} contacts {hasActiveFilters && "match filters"}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
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
                  <td className="px-4 py-3.5 text-right cursor-pointer" onClick={() => navigate(`/contacts/${c.id}`)}>
                    <span className="text-[10px] text-[#B8A0C8] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View profile →
                    </span>
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
