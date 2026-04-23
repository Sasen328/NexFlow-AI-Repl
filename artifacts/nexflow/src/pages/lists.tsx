import { useState } from "react";
import { Link } from "wouter";
import { useLists, useCreate, useDelete } from "@/hooks/useApi";
import { Plus, Users, Trash2, ListIcon } from "lucide-react";

export default function ListsPage() {
  const { data, isLoading } = useLists();
  const create = useCreate("/lists", ["lists"]);
  const del = useDelete((id) => `/lists/${id}`, ["lists"]);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const lists = data?.lists ?? [];

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Static Lists</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Group contacts and companies into curated lists for outreach, dashboards, and automations.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New List
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array(6).fill(0).map((_, i) => <div key={i} className="h-32 glass-card rounded-2xl animate-pulse" />) :
          !lists.length ? <div className="col-span-full text-center text-sm text-muted-foreground py-16">No lists yet — create your first one.</div> :
          lists.map((l: any) => (
            <Link key={l.id} href={`/lists/${l.id}`}>
              <div className="glass-card rounded-2xl p-5 hover:shadow-md cursor-pointer group h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (l.color ?? "#88B8B0") + "30", color: l.color ?? "#88B8B0" }}>
                    <ListIcon className="w-5 h-5" />
                  </div>
                  <button onClick={(e) => { e.preventDefault(); if (confirm("Delete list?")) del.mutate(l.id); }} className="text-muted-foreground hover:text-[#C8A880] opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="font-bold text-foreground text-sm">{l.name}</div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-3">{l.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {l.member_count ?? 0} members</span>
                  {l.owner_name && <span>by {l.owner_name}</span>}
                </div>
              </div>
            </Link>
          ))
        }
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-foreground mb-4">New static list</h3>
            <div className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="List name" className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" rows={3} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground">Cancel</button>
              <button onClick={() => { create.mutate({ name, description: desc, object_type: "contact" }, { onSuccess: () => { setShowNew(false); setName(""); setDesc(""); } }); }} disabled={!name} className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
