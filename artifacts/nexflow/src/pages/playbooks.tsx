import { useEffect, useState } from "react";
import { BookOpen, Sparkles, Plus, Trash2, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { apiFetch } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

const PERSONAS = ["CIO / CTO", "VP Sales", "VP Marketing", "Head of Procurement", "CEO / Founder", "Head of HR", "VP Engineering", "CFO"];
const INDUSTRIES = ["Government / Smart City", "Banking & Finance", "Energy / Oil & Gas", "Telco", "Healthcare", "Retail", "Real Estate", "Logistics"];
const COUNTRIES = ["Saudi Arabia", "UAE", "Qatar", "Kuwait", "Bahrain", "Oman"];

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ persona: PERSONAS[0], deal_size: "$100K-$500K ARR", industry: INDUSTRIES[0], country: COUNTRIES[0], situation: "" });

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try {
      const r = await apiFetch("/playbooks");
      setPlaybooks(r.playbooks ?? []);
    } finally { setLoading(false); }
  }

  async function generate() {
    setGenerating(true);
    try {
      await apiFetch("/playbooks/generate", { method: "POST", body: JSON.stringify(form) });
      load();
    } catch (err: any) { alert(err?.message ?? "Failed"); } finally { setGenerating(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this playbook?")) return;
    await apiFetch(`/playbooks/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center"><BookOpen className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold tracking-tight">AI Sales Playbooks</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase border border-[#88B8B0]/30">Live</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">AI generates persona-specific playbooks with discovery questions, value propositions, objection handlers, and GCC cultural tips.</p>
        </div>
      </div>

      <div className="glass-panel p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">Generate new playbook</div>
        <div className="grid grid-cols-4 gap-2">
          <Select label="Persona" value={form.persona} onChange={(v: any) => setForm({...form, persona: v})} options={PERSONAS}/>
          <Select label="Industry" value={form.industry} onChange={(v: any) => setForm({...form, industry: v})} options={INDUSTRIES}/>
          <Select label="Country" value={form.country} onChange={(v: any) => setForm({...form, country: v})} options={COUNTRIES}/>
          <Input label="Deal size" value={form.deal_size} onChange={(v: any) => setForm({...form, deal_size: v})}/>
          <input value={form.situation} onChange={(e) => setForm({...form, situation: e.target.value})} placeholder="Situation (optional, e.g. 'Renewal at risk')" className="col-span-3 px-2 py-1.5 rounded border border-border/40 bg-transparent text-sm"/>
          <button onClick={generate} disabled={generating} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Sparkles className="w-3.5 h-3.5"/>}
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-bold">Playbook library ({playbooks.length})</div>
        {loading && <div className="text-xs text-muted-foreground">Loading…</div>}
        {!loading && playbooks.length === 0 && <div className="glass-panel p-8 text-center text-sm text-muted-foreground">No playbooks yet — generate your first one above.</div>}
        {playbooks.map(p => {
          const md = (p.metadata ?? {}) as any;
          const isOpen = open === p.id;
          return (
            <div key={p.id} className="glass-panel p-0 overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : p.id)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/40">
                {isOpen ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{md.persona} · {md.industry} · {md.country} · {md.deal_size}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); del(p.id); }} className="text-muted-foreground hover:text-[#C0A0B8]"><Trash2 className="w-3.5 h-3.5"/></button>
              </button>
              {isOpen && (
                <div className="px-4 py-3 border-t border-border/30 space-y-3 text-sm">
                  <div className="text-muted-foreground italic">{md.summary ?? p.body}</div>
                  <Section title="Discovery questions" items={md.discovery_questions ?? []}/>
                  <Section title="Value propositions" items={md.value_propositions ?? []}/>
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Objection handlers</div>
                    {(md.objection_handlers ?? []).map((o: any, i: number) => (
                      <div key={i} className="mb-2">
                        <div className="text-xs font-semibold text-[#C0A0B8]">"{o.objection}"</div>
                        <div className="text-xs ml-3">→ {o.response}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Talk tracks</div>
                    {(md.talk_tracks ?? []).map((t: any, i: number) => (
                      <div key={i} className="mb-1.5"><b className="text-[#B8A0C8]">{t.phase}:</b> <span className="text-xs">{t.script}</span></div>
                    ))}
                  </div>
                  <Section title="Next steps" items={md.next_steps ?? []}/>
                  <div className="bg-[#90B8B8]/10 border border-[#90B8B8]/30 rounded p-2">
                    <div className="text-xs font-bold text-[#90B8B8] mb-1">🌍 GCC cultural tips</div>
                    {(md.cultural_tips ?? []).map((t: string, i: number) => <div key={i} className="text-xs">• {t}</div>)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="text-xs font-bold text-muted-foreground uppercase mb-1">{title}</div>
      <ul className="space-y-0.5">{items.map((it, i) => <li key={i} className="text-xs">• {it}</li>)}</ul>
    </div>
  );
}
function Select({ label, value, onChange, options }: any) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">{label}</div>
      <select value={value} onChange={(e)=>onChange(e.target.value)} className="w-full px-2 py-1.5 rounded border border-border/40 bg-transparent text-sm">{options.map((o: string)=><option key={o}>{o}</option>)}</select>
    </div>
  );
}
function Input({ label, value, onChange }: any) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">{label}</div>
      <input value={value} onChange={(e)=>onChange(e.target.value)} className="w-full px-2 py-1.5 rounded border border-border/40 bg-transparent text-sm"/>
    </div>
  );
}
