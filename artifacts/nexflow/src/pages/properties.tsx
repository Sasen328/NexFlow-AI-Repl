import { useState } from "react";
import { useProperties, useCreate, useDelete, useAiSuggestProperties } from "@/hooks/useApi";
import { Plus, Trash2, Database, Type, Hash, Calendar, ToggleLeft, List, Mail, Phone as PhoneIcon, Link as LinkIcon, Sparkles, X, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ICONS: any = { text: Type, long_text: Type, number: Hash, date: Calendar, boolean: ToggleLeft, select: List, multiselect: List, url: LinkIcon, email: Mail, phone: PhoneIcon };

export default function PropertiesPage() {
  const [tab, setTab] = useState<"contact" | "company" | "deal">("contact");
  const [showNew, setShowNew] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const { data, isLoading } = useProperties(tab);
  const create = useCreate("/properties", ["properties"]);
  const del = useDelete((id) => `/properties/${id}`, ["properties"]);

  const props = data?.properties ?? [];

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Custom Properties</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Define custom fields for any record type — no schema migration required.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAi(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B8A0C8]/15 text-[#B8A0C8] text-sm font-semibold hover:bg-[#B8A0C8]/25">
            <Sparkles className="w-4 h-4" /> AI Suggest
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
            <Plus className="w-4 h-4" /> New Property
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-muted/40 rounded-xl w-fit">
        {(["contact", "company", "deal"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all", tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
            {t} properties
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Internal Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Options</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : !props.length ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No custom properties yet.</td></tr>
            ) : props.map((p: any) => {
              const Icon = TYPE_ICONS[p.type] ?? Database;
              return (
                <tr key={p.id} className="border-t border-border/30 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{p.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded bg-muted/60">
                      <Icon className="w-3 h-3" /> {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.options?.values?.join(", ") ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => del.mutate(p.id)} className="text-muted-foreground hover:text-[#C8A880]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showNew && <NewPropertyModal objectType={tab} onClose={() => setShowNew(false)} onCreate={(d) => { create.mutate(d, { onSuccess: () => setShowNew(false) }); }} />}
      {showAi && <AiSuggestModal objectType={tab} onClose={() => setShowAi(false)} onAdd={(p) => create.mutate(p)} />}
    </div>
  );
}

function NewPropertyModal({ objectType, onClose, onCreate }: any) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState("text");
  const [optionsText, setOptionsText] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-foreground mb-4">New {objectType} property</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Label</label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Decision Authority" className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#B8A0C8]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none">
              {["text","long_text","number","date","boolean","select","multiselect","url","email","phone"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {(type === "select" || type === "multiselect") && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Options (comma-separated)</label>
              <input value={optionsText} onChange={e => setOptionsText(e.target.value)} placeholder="Option A, Option B" className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted">Cancel</button>
          <button
            onClick={() => onCreate({
              object_type: objectType,
              label,
              name: label.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
              type,
              options: optionsText ? { values: optionsText.split(",").map(s => s.trim()) } : null,
            })}
            disabled={!label}
            className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50"
          >Create</button>
        </div>
      </div>
    </div>
  );
}

function AiSuggestModal({ objectType, onClose, onAdd }: any) {
  const [prompt, setPrompt] = useState("");
  const [added, setAdded] = useState<Set<string>>(new Set());
  const suggest = useAiSuggestProperties();
  const result = suggest.data?.properties ?? [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B8A0C8]" /> AI Property Suggester
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Describe what you need to track — AI proposes typed fields you can add with one click.</p>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} placeholder={`e.g. We sell to ${objectType}s in the Gulf and need to track their procurement quarter and decision authority`} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
        <button
          onClick={() => suggest.mutate({ prompt, object_type: objectType })}
          disabled={!prompt.trim() || suggest.isPending}
          className="mt-3 w-full px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {suggest.isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…</> : "Suggest properties"}
        </button>

        {result.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">AI suggested {result.length} properties:</div>
            {result.map((p: any) => {
              const isAdded = added.has(p.name);
              return (
                <div key={p.name} className="p-3 rounded-xl bg-muted/30 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{p.label}</div>
                    <div className="text-[11px] text-muted-foreground font-mono mb-1">{p.name} · {p.type}</div>
                    <div className="text-xs text-muted-foreground">{p.description}</div>
                    {p.options && <div className="text-[11px] text-muted-foreground mt-1">Options: {p.options.join(", ")}</div>}
                  </div>
                  <button
                    onClick={() => {
                      onAdd({
                        object_type: objectType,
                        label: p.label,
                        name: p.name,
                        type: p.type,
                        options: p.options ? { values: p.options } : null,
                      });
                      setAdded(new Set([...added, p.name]));
                    }}
                    disabled={isAdded}
                    className={cn("text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 flex-shrink-0",
                      isAdded ? "bg-[#88B8B0]/20 text-[#88B8B0]" : "nf-chameleon-bg text-white"
                    )}
                  >
                    {isAdded ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
