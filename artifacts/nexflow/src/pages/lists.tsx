import { useState } from "react";
import { Link } from "wouter";
import { useLists, useCreate, useDelete, useAiGenerateList } from "@/hooks/useApi";
import { Plus, Users, Trash2, ListIcon, Sparkles, X, Loader2 } from "lucide-react";

export default function ListsPage() {
  const { data, isLoading } = useLists();
  const create = useCreate("/lists", ["lists"]);
  const del = useDelete((id) => `/lists/${id}`, ["lists"]);
  const [showNew, setShowNew] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const lists = data?.lists ?? [];

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Static Lists</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Curated lists of contacts for outreach, dashboards, and automations.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAi(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B8A0C8]/15 text-[#B8A0C8] text-sm font-semibold hover:bg-[#B8A0C8]/25">
            <Sparkles className="w-4 h-4" /> AI Generate
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
            <Plus className="w-4 h-4" /> New List
          </button>
        </div>
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

      {showAi && <AiGenerateListModal onClose={() => setShowAi(false)} />}
    </div>
  );
}

function AiGenerateListModal({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const gen = useAiGenerateList();

  const examples = [
    "Top 20 contacts by lead score in the qualified stage",
    "Engineering leaders at companies tagged enterprise",
    "Contacts from LinkedIn with VP or Director titles",
  ];

  const submit = async () => {
    setError(""); setResult(null);
    try {
      const r: any = await gen.mutateAsync({ prompt, name });
      setResult(r);
      if (r.created) setTimeout(onClose, 1800);
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B8A0C8]" /> AI List Builder
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Describe what contacts you want — AI picks the matches and saves them as a static list.</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="List name (optional — AI will name it)" className="w-full mb-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} placeholder="e.g. Engineering leaders at funded companies with high engagement" className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#B8A0C8]" />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {examples.map(ex => (
            <button key={ex} onClick={() => setPrompt(ex)} className="text-[11px] px-2 py-1 rounded-full bg-muted/40 text-muted-foreground hover:bg-muted">
              {ex.slice(0, 40)}…
            </button>
          ))}
        </div>
        {result?.created && (
          <div className="mt-3 text-xs text-[#88B8B0] p-3 rounded bg-[#88B8B0]/10">
            ✓ Created “{result.list.name}” with {result.member_count} contacts
          </div>
        )}
        {result?.created === false && (
          <div className="mt-3 text-xs text-[#C8A880] p-3 rounded bg-[#C8A880]/10">
            {result.message}
          </div>
        )}
        {error && <div className="mt-3 text-xs text-destructive p-2 rounded bg-destructive/10">{error}</div>}
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground">Close</button>
          <button onClick={submit} disabled={!prompt.trim() || gen.isPending} className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {gen.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {gen.isPending ? "AI building…" : "Generate list"}
          </button>
        </div>
      </div>
    </div>
  );
}
