import { useEffect, useState } from "react";
import { Route, Plus, Trash2, Save, GitBranch, Users, Building2, Globe, Briefcase, Zap, AlertCircle } from "lucide-react";
import { apiFetch } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

type Rule = {
  id?: string;
  name: string;
  description?: string;
  enabled?: boolean;
  trigger?: any;
  conditions?: any;
  actions?: any[];
};

const FIELDS = [
  { key: "country", label: "Country", icon: Globe },
  { key: "industry", label: "Industry", icon: Building2 },
  { key: "company_size", label: "Company size", icon: Users },
  { key: "lead_score", label: "Lead score", icon: Zap },
  { key: "title", label: "Title contains", icon: Briefcase },
];

const OPS = ["equals", "contains", "greater_than", "less_than", "in"];
const REPS = ["Sara Al-Mansouri", "Ahmed Al-Rashidi", "Fatima Al-Khalid", "Mohammed Al-Otaibi", "Layla Hassan", "Round-robin (auto)"];

export default function LeadRoutingPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try {
      const r = await apiFetch("/automations");
      setRules((r.rules ?? []).filter((x: any) => x.trigger?.kind === "lead_routing" || x.name?.toLowerCase().includes("rout")));
    } finally { setLoading(false); }
  }

  function newRule() {
    setEditing({
      name: "New routing rule",
      description: "Auto-assign incoming leads",
      enabled: true,
      trigger: { kind: "lead_routing" },
      conditions: { all: [{ field: "country", op: "equals", value: "Saudi Arabia" }] },
      actions: [{ type: "assign_owner", owner_name: "Round-robin (auto)" }, { type: "create_task", title: "Welcome new lead" }],
    });
  }

  async function save() {
    if (!editing) return;
    try {
      if (editing.id) await apiFetch(`/automations/${editing.id}`, { method: "PATCH", body: JSON.stringify(editing) });
      else await apiFetch("/automations", { method: "POST", body: JSON.stringify(editing) });
      setEditing(null); setSaved(true); setTimeout(() => setSaved(false), 2000);
      load();
    } catch (err: any) { alert(err?.message ?? "save failed"); }
  }

  async function del(id: string) {
    if (!confirm("Delete this rule?")) return;
    await apiFetch(`/automations/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center"><Route className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold tracking-tight">Lead Routing & Round-Robin</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase border border-[#88B8B0]/30">Live</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Auto-assign incoming leads by country, industry, score, title, or company size — first-rule-wins, with round-robin fallback.</p>
        </div>
        <button onClick={newRule} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg shadow-sm">
          <Plus className="w-3.5 h-3.5"/> New rule
        </button>
      </div>

      {saved && <div className="glass-panel p-2 bg-[#88B8B0]/10 border-[#88B8B0]/30 text-xs text-[#88B8B0]">✓ Rule saved</div>}

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 glass-panel p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 text-sm font-bold">Active rules ({rules.length})</div>
          {loading ? <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div> :
           rules.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">No routing rules yet — create one →</div> :
           <div className="divide-y divide-border/30">
            {rules.map((r) => (
              <div key={r.id} className="px-4 py-3 hover:bg-muted/40 cursor-pointer" onClick={() => setEditing(r)}>
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-[#B8A0C8]"/>
                  <div className="text-sm font-semibold flex-1">{r.name}</div>
                  <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 rounded", r.enabled ? "bg-[#88B8B0]/15 text-[#88B8B0]" : "bg-muted text-muted-foreground")}>
                    {r.enabled ? "active" : "paused"}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); del(r.id!); }} className="text-muted-foreground hover:text-[#C0A0B8]"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
                <div className="text-xs text-muted-foreground mt-1 ml-6">{r.description}</div>
                <div className="text-[11px] text-muted-foreground mt-1 ml-6 flex flex-wrap gap-1">
                  {(r.conditions?.all ?? []).map((c: any, i: number) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-muted/60">{c.field} {c.op} <b>{String(c.value)}</b></span>
                  ))}
                  <span className="px-1.5 py-0.5 rounded bg-[#B8A0C8]/15 text-[#B8A0C8]">→ {r.actions?.[0]?.owner_name ?? r.actions?.[0]?.type ?? "action"}</span>
                </div>
              </div>
            ))}
           </div>
          }
        </div>

        <div className="col-span-5">
          {!editing ? (
            <div className="glass-panel p-6 text-sm text-muted-foreground text-center">
              Click a rule to edit, or create a new one.
            </div>
          ) : (
            <div className="glass-panel p-4 space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Edit rule</div>
              <Input label="Name" value={editing.name} onChange={(v: any) => setEditing({ ...editing, name: v })}/>
              <Input label="Description" value={editing.description ?? ""} onChange={(v: any) => setEditing({ ...editing, description: v })}/>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase">When all conditions match:</div>
                {(editing.conditions?.all ?? []).map((c: any, i: number) => (
                  <div key={i} className="flex gap-1.5 items-center">
                    <select value={c.field} onChange={(e) => updateCond(i, "field", e.target.value)} className="text-xs px-2 py-1 rounded border border-border/40 bg-transparent flex-1">
                      {FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                    <select value={c.op} onChange={(e) => updateCond(i, "op", e.target.value)} className="text-xs px-2 py-1 rounded border border-border/40 bg-transparent">
                      {OPS.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <input value={c.value ?? ""} onChange={(e) => updateCond(i, "value", e.target.value)} className="text-xs px-2 py-1 rounded border border-border/40 bg-transparent flex-1"/>
                    <button onClick={() => removeCond(i)} className="text-muted-foreground hover:text-[#C0A0B8]"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                ))}
                <button onClick={addCond} className="text-xs text-[#B8A0C8] flex items-center gap-1"><Plus className="w-3 h-3"/> Add condition</button>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase">Then assign to:</div>
                <select
                  value={editing.actions?.[0]?.owner_name ?? "Round-robin (auto)"}
                  onChange={(e) => setEditing({ ...editing, actions: [{ type: "assign_owner", owner_name: e.target.value }, ...(editing.actions?.slice(1) ?? [])] })}
                  className="w-full text-sm px-2 py-1.5 rounded border border-border/40 bg-transparent"
                >
                  {REPS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={editing.enabled !== false} onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}/>
                  Active
                </label>
                <div className="flex-1"/>
                <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg text-xs border border-border/40">Cancel</button>
                <button onClick={save} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg"><Save className="w-3.5 h-3.5"/> Save</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel p-3 text-xs text-muted-foreground flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-[#B8A0C8] mt-0.5"/>
        <span>Rules are stored in the automations table — they fire on contact creation. Round-robin distributes evenly across active sales reps.</span>
      </div>
    </div>
  );

  function updateCond(i: number, k: string, v: string) {
    if (!editing) return;
    const all = [...(editing.conditions?.all ?? [])];
    all[i] = { ...all[i], [k]: v };
    setEditing({ ...editing, conditions: { all } });
  }
  function addCond() {
    if (!editing) return;
    setEditing({ ...editing, conditions: { all: [...(editing.conditions?.all ?? []), { field: "country", op: "equals", value: "" }] } });
  }
  function removeCond(i: number) {
    if (!editing) return;
    const all = [...(editing.conditions?.all ?? [])];
    all.splice(i, 1);
    setEditing({ ...editing, conditions: { all } });
  }
}

function Input({ label, value, onChange }: any) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-sm px-2 py-1.5 rounded border border-border/40 bg-transparent"/>
    </div>
  );
}
