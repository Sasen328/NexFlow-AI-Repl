import { useEffect, useState } from "react";
import { FileText, Plus, Copy, ExternalLink, Trash2, Save, AlertCircle, Globe } from "lucide-react";
import { apiFetch } from "@/hooks/useApi";

type Form = {
  id?: string;
  name: string;
  description?: string;
  view_type?: string;
  config?: { fields: { key: string; label: string; type: string; required?: boolean }[]; success_message?: string; redirect_url?: string };
  created_at?: string;
};

const DEFAULT_FIELDS = [
  { key: "first_name", label: "First name", type: "text", required: true },
  { key: "last_name", label: "Last name", type: "text", required: true },
  { key: "email", label: "Work email", type: "email", required: true },
  { key: "phone", label: "Mobile", type: "tel" },
  { key: "company", label: "Company", type: "text" },
  { key: "country", label: "Country", type: "select" },
];

export default function WebFormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [editing, setEditing] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); loadSubmissions(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await apiFetch<{ views: any[] }>("/views?type=form");
      const formViews = (r.views ?? []).filter((v: any) => v.view_type === "form");
      setForms(formViews);
    } catch { setForms([]); } finally { setLoading(false); }
  }

  async function loadSubmissions() {
    try {
      const r = await apiFetch<{ activities: any[] }>("/activities?type=form_submit&limit=20");
      setSubmissions(r.activities ?? []);
    } catch {}
  }

  function newForm() {
    setEditing({
      name: "Demo request form",
      description: "Embed on landing page",
      view_type: "form",
      config: { fields: DEFAULT_FIELDS, success_message: "Thanks! We'll be in touch within 24 hours." },
    });
  }

  async function save() {
    if (!editing) return;
    const payload = { ...editing, view_type: "form" };
    try {
      if (editing.id) await apiFetch(`/views/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      else await apiFetch("/views", { method: "POST", body: JSON.stringify(payload) });
      setEditing(null); load();
    } catch (err: any) { alert(err?.message ?? "Save failed"); }
  }

  async function del(id: string) {
    if (!confirm("Delete this form?")) return;
    await apiFetch(`/views/${id}`, { method: "DELETE" });
    load();
  }

  function embedSnippet(formId: string) {
    const base = window.location.origin;
    return `<form action="${base}/api/tracking/form-submit" method="post" data-form-id="${formId}">
  <input name="first_name" placeholder="First name" required>
  <input name="last_name" placeholder="Last name" required>
  <input name="email" type="email" placeholder="Work email" required>
  <input name="phone" type="tel" placeholder="Mobile">
  <input name="company" placeholder="Company">
  <input type="hidden" name="source" value="${formId}">
  <button type="submit">Request demo</button>
</form>`;
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center"><FileText className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold tracking-tight">Web Forms & Landing Pages</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase border border-[#88B8B0]/30">Live</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Build embed-ready forms — submissions auto-create contacts and capture UTM source for attribution.</p>
        </div>
        <button onClick={newForm} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg shadow-sm">
          <Plus className="w-3.5 h-3.5"/> New form
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5 glass-panel p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 text-sm font-bold">Forms ({forms.length})</div>
          {loading ? <div className="p-8 text-center text-xs text-muted-foreground">Loading…</div> :
           forms.length === 0 ? <div className="p-8 text-center text-xs text-muted-foreground">No forms yet — click New form →</div> :
           <div className="divide-y divide-border/30">
            {forms.map((f) => (
              <div key={f.id} className="px-4 py-3 hover:bg-muted/40 cursor-pointer" onClick={() => setEditing(f)}>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#B8A0C8]"/>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{f.config?.fields?.length ?? 0} fields</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(embedSnippet(f.id ?? "")); alert("Embed code copied!"); }} className="text-xs px-2 py-1 rounded bg-muted hover:bg-[#B8A0C8]/20"><Copy className="w-3 h-3"/></button>
                  <button onClick={(e) => { e.stopPropagation(); del(f.id!); }} className="text-muted-foreground hover:text-[#C0A0B8]"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
            ))}
           </div>
          }
        </div>

        <div className="col-span-7">
          {!editing ? (
            <div className="glass-panel p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Recent submissions ({submissions.length})</div>
              {submissions.length === 0 ? (
                <div className="text-sm text-muted-foreground py-6 text-center">No form submissions yet. Embed a form on your site to start capturing leads.</div>
              ) : (
                <div className="space-y-1.5">
                  {submissions.slice(0, 10).map((s) => (
                    <div key={s.id} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/40 text-xs">
                      <div>
                        <div className="font-semibold">{s.title}</div>
                        <div className="text-muted-foreground">{s.body}</div>
                      </div>
                      <div className="text-muted-foreground">{new Date(s.completed_at ?? s.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-4 space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Edit form</div>
              <Input label="Form name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })}/>
              <Input label="Description" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })}/>
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Fields</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {(editing.config?.fields ?? []).map((f, i) => (
                    <div key={i} className="flex gap-1.5 items-center text-xs">
                      <input value={f.label} onChange={(e) => upd(i, "label", e.target.value)} className="flex-1 px-2 py-1 rounded border border-border/40 bg-transparent"/>
                      <select value={f.type} onChange={(e) => upd(i, "type", e.target.value)} className="px-2 py-1 rounded border border-border/40 bg-transparent">
                        {["text", "email", "tel", "select", "textarea"].map(t => <option key={t}>{t}</option>)}
                      </select>
                      <label className="flex items-center gap-1"><input type="checkbox" checked={!!f.required} onChange={(e) => upd(i, "required", e.target.checked)}/> required</label>
                      <button onClick={() => removeField(i)}><Trash2 className="w-3.5 h-3.5 text-muted-foreground"/></button>
                    </div>
                  ))}
                </div>
                <button onClick={addField} className="text-xs text-[#B8A0C8] mt-2 flex items-center gap-1"><Plus className="w-3 h-3"/> Add field</button>
              </div>
              <Input label="Success message" value={editing.config?.success_message ?? ""} onChange={(v) => setEditing({ ...editing, config: { ...editing.config!, success_message: v } })}/>
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg text-xs border border-border/40">Cancel</button>
                <button onClick={save} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg"><Save className="w-3.5 h-3.5"/> Save</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel p-3 text-xs text-muted-foreground flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-[#B8A0C8] mt-0.5"/>
        <span>Forms post to <code className="px-1 bg-muted rounded">POST /api/tracking/form-submit</code> — contact created/updated, UTM captured, form_submit activity logged.</span>
      </div>
    </div>
  );

  function upd(i: number, k: string, v: any) {
    if (!editing) return;
    const fields = [...(editing.config?.fields ?? [])];
    fields[i] = { ...fields[i], [k]: v };
    setEditing({ ...editing, config: { ...editing.config!, fields } });
  }
  function addField() {
    if (!editing) return;
    const fields = [...(editing.config?.fields ?? []), { key: "field_" + Date.now(), label: "New field", type: "text" }];
    setEditing({ ...editing, config: { ...editing.config!, fields } });
  }
  function removeField(i: number) {
    if (!editing) return;
    const fields = [...(editing.config?.fields ?? [])];
    fields.splice(i, 1);
    setEditing({ ...editing, config: { ...editing.config!, fields } });
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
