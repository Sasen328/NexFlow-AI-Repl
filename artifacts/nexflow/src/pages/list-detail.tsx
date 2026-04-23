import { useParams, Link } from "wouter";
import { useList, useContacts, apiFetch } from "@/hooks/useApi";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useList(id!);
  const { data: contactsData } = useContacts();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  const allContacts = contactsData?.contacts ?? [];
  const memberIds = new Set((data?.members ?? []).map((m: any) => m.id));
  const candidates = allContacts.filter((c: any) => !memberIds.has(c.id));

  async function add(contactId: string) {
    await apiFetch(`/lists/${id}/members`, { method: "POST", body: JSON.stringify({ entity_ids: [contactId] }) });
    qc.invalidateQueries({ queryKey: ["lists", id] });
  }
  async function remove(contactId: string) {
    await apiFetch(`/lists/${id}/members/${contactId}`, { method: "DELETE" });
    qc.invalidateQueries({ queryKey: ["lists", id] });
  }

  if (isLoading || !data) return <div className="h-32 glass-card rounded-2xl animate-pulse" />;

  return (
    <div className="space-y-5 max-w-6xl">
      <Link href="/lists"><div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"><ArrowLeft className="w-3 h-3" /> Back to lists</div></Link>

      <div className="glass-card rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-foreground">{data.name}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{data.description}</p>
        <div className="text-xs text-muted-foreground mt-2">{(data.members ?? []).length} members</div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Members</h2>
        <button onClick={() => setShowAdd(s => !s)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg nf-chameleon-bg text-white text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> Add Members
        </button>
      </div>

      {showAdd && (
        <div className="glass-card rounded-2xl p-4 max-h-72 overflow-y-auto">
          <div className="text-xs text-muted-foreground mb-2">Click to add:</div>
          <div className="space-y-1">
            {candidates.slice(0, 30).map((c: any) => (
              <div key={c.id} onClick={() => add(c.id)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer text-sm">
                <div className="w-6 h-6 rounded-full nf-chameleon-bg text-white text-[10px] font-bold flex items-center justify-center">{c.first_name?.[0]}{c.last_name?.[0]}</div>
                <span>{c.first_name} {c.last_name}</span>
                <span className="text-xs text-muted-foreground">{c.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Title</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 w-12"></th></tr>
          </thead>
          <tbody>
            {(data.members ?? []).map((m: any) => (
              <tr key={m.id} className="border-t border-border/30 hover:bg-muted/30">
                <td className="px-4 py-3"><Link href={`/contacts/${m.id}`}><span className="font-medium text-foreground hover:text-[#B8A0C8] cursor-pointer">{m.first_name} {m.last_name}</span></Link></td>
                <td className="px-4 py-3 text-muted-foreground">{m.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                <td className="px-4 py-3"><button onClick={() => remove(m.id)} className="text-muted-foreground hover:text-[#C8A880]"><X className="w-3.5 h-3.5" /></button></td>
              </tr>
            ))}
            {!(data.members ?? []).length && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No members yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
