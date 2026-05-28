import { useParams, Link, useLocation } from "wouter";
import { useList, useContacts, apiFetch } from "@/hooks/useApi";
import { ArrowLeft, Plus, X, Zap, Phone, CheckCircle2, Users } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useList(id!);
  const { data: contactsData } = useContacts({ limit: "500" });
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [showAdd, setShowAdd] = useState(false);
  const [pushed, setPushed] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allContacts = contactsData?.contacts ?? [];
  const members: any[] = data?.members ?? [];
  const memberIds = new Set(members.map((m: any) => m.id));
  const candidates = allContacts.filter((c: any) => !memberIds.has(c.id));

  const membersWithPhone = members.filter((m: any) => m.phone);

  async function add(contactId: string) {
    await apiFetch(`/lists/${id}/members`, { method: "POST", body: JSON.stringify({ entity_ids: [contactId] }) });
    qc.invalidateQueries({ queryKey: ["lists", id] });
  }

  async function addSelected() {
    if (!selected.size) return;
    await apiFetch(`/lists/${id}/members`, { method: "POST", body: JSON.stringify({ entity_ids: [...selected] }) });
    qc.invalidateQueries({ queryKey: ["lists", id] });
    setSelected(new Set());
    setShowAdd(false);
  }

  async function remove(contactId: string) {
    await apiFetch(`/lists/${id}/members/${contactId}`, { method: "DELETE" });
    qc.invalidateQueries({ queryKey: ["lists", id] });
  }

  function toggleSelect(cid: string) {
    setSelected(s => {
      const n = new Set(s);
      n.has(cid) ? n.delete(cid) : n.add(cid);
      return n;
    });
  }

  function pushToDialer() {
    setPushed(true);
    setTimeout(() => navigate(`/power-dialer?list=${id}`), 900);
  }

  if (isLoading || !data) return <div className="h-32 glass-card rounded-2xl animate-pulse" />;

  return (
    <div className="space-y-5 max-w-6xl">
      <Link href="/lists">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
          <ArrowLeft className="w-3 h-3" /> Back to lists
        </div>
      </Link>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{data.name}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{data.description}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {members.length} members</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {membersWithPhone.length} have phone</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {membersWithPhone.length > 0 && (
              <button
                onClick={pushToDialer}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  pushed
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                }`}
              >
                {pushed ? (
                  <><CheckCircle2 className="w-4 h-4" /> Pushed! Opening dialer…</>
                ) : (
                  <><Zap className="w-4 h-4" /> Push {membersWithPhone.length} to Dialer</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Members</h2>
        <button
          onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg nf-chameleon-bg text-white text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5" /> Add Members
        </button>
      </div>

      {showAdd && (
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-muted-foreground">Select contacts to add</div>
            {selected.size > 0 && (
              <button
                onClick={addSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B8A0C8] text-white text-xs font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Add {selected.size} selected
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto space-y-1">
            {candidates.slice(0, 50).map((c: any) => (
              <div
                key={c.id}
                onClick={() => toggleSelect(c.id)}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-colors ${
                  selected.has(c.id) ? "bg-[#B8A0C8]/15 border border-[#B8A0C8]/30" : "hover:bg-muted/50"
                }`}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-colors ${
                  selected.has(c.id) ? "bg-[#B8A0C8] border-[#B8A0C8]" : "border-border/40"
                }`}>
                  {selected.has(c.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div className="w-6 h-6 rounded-full nf-chameleon-bg text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {c.first_name?.[0]}{c.last_name?.[0]}
                </div>
                <span className="font-medium">{c.first_name} {c.last_name}</span>
                <span className="text-xs text-muted-foreground">{c.title}</span>
                {c.phone && <Phone className="w-3 h-3 text-emerald-500 ml-auto flex-shrink-0" />}
              </div>
            ))}
            {!candidates.length && (
              <div className="text-xs text-center text-muted-foreground py-4">All contacts are already in this list.</div>
            )}
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m: any) => (
              <tr key={m.id} className="border-t border-border/30 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link href={`/contacts/${m.id}`}>
                    <span className="font-medium text-foreground hover:text-[#B8A0C8] cursor-pointer">{m.first_name} {m.last_name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{m.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.phone ?? <span className="text-muted-foreground/40">—</span>}</td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(m.id)} className="text-muted-foreground hover:text-[#C8A880]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {!members.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No members yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
