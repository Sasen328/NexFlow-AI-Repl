import { useEffect, useMemo, useState } from "react";
import {
  FileText, Plus, Copy, Trash2, Save, AlertCircle, Globe, Wand2, Loader2,
  Sparkles, Bot, TrendingUp, TrendingDown, DollarSign, Target, Lightbulb,
} from "lucide-react";
import { apiFetch } from "@/hooks/useApi";

type Field = { key: string; label: string; type: string; required?: boolean };
type Form = {
  id?: string;
  name: string;
  description?: string;
  view_type?: string;
  config?: { fields: Field[]; success_message?: string; redirect_url?: string };
  created_at?: string;
};

const DEFAULT_FIELDS: Field[] = [
  { key: "first_name", label: "First name", type: "text", required: true },
  { key: "last_name",  label: "Last name",  type: "text", required: true },
  { key: "email",      label: "Work email", type: "email", required: true },
  { key: "phone",      label: "Mobile",     type: "tel" },
  { key: "company",    label: "Company",    type: "text" },
  { key: "country",    label: "Country",    type: "select" },
];

const FORM_TEMPLATES = [
  { id: "demo",       name: "Request a demo",       fields: DEFAULT_FIELDS },
  { id: "newsletter", name: "Newsletter signup",    fields: [{ key: "email", label: "Email", type: "email", required: true }] },
  { id: "pricing",    name: "Get a quote",          fields: [...DEFAULT_FIELDS, { key: "team_size", label: "Team size", type: "select" }, { key: "timeline", label: "Timeline", type: "select" }] },
  { id: "event",      name: "Event registration",   fields: [...DEFAULT_FIELDS, { key: "session", label: "Pick a session", type: "select" }] },
  { id: "contact",    name: "Contact us",           fields: [{ key: "name", label: "Your name", type: "text", required: true }, { key: "email", label: "Email", type: "email", required: true }, { key: "message", label: "Message", type: "textarea", required: true }] },
];

const FALLBACK_PREDICTION = {
  campaign_health: "B+",
  predicted_open_rate: 41.2,
  predicted_conversion_rate: 4.8,
  pricing_signal: "Above market — drop entry tier by 12% to widen funnel.",
  channel_recommendation: "Shift 30% of FB Ads spend → LinkedIn Sponsored. Add WhatsApp nurture for high-intent submitters.",
  best_form_pattern: "5-field forms convert 41% better than 8-field forms for your GCC enterprise segment.",
  confidence: 78,
};

export default function WebFormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [editing, setEditing] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const [predLoading, setPredLoading] = useState(false);
  const [prediction, setPrediction] = useState<typeof FALLBACK_PREDICTION>(FALLBACK_PREDICTION);
  const [predSource, setPredSource] = useState<"sample" | "live">("sample");

  useEffect(() => { load(); loadSubmissions(); }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await apiFetch("/views?type=form");
      const formViews = (r?.views ?? []).filter((v: any) => v.view_type === "form");
      setForms(formViews);
    } catch { setForms([]); } finally { setLoading(false); }
  }

  async function loadSubmissions() {
    try {
      const r = await apiFetch("/activities?type=form_submit&limit=20");
      setSubmissions(r?.activities ?? []);
    } catch {}
  }

  function newFormFromTemplate(tplId: string) {
    const tpl = FORM_TEMPLATES.find((t) => t.id === tplId) ?? FORM_TEMPLATES[0];
    setEditing({
      name: tpl.name,
      description: "",
      view_type: "form",
      config: { fields: tpl.fields, success_message: "Thanks! We'll be in touch within 24 hours." },
    });
  }

  async function aiCreateForm() {
    if (!aiPrompt.trim()) {
      setAiError("Describe the form you want — e.g. 'webinar registration with company size and role'.");
      return;
    }
    setAiLoading(true); setAiError("");

    // Always-safe fallback we'll fall back to on any parse / validation failure
    const fallbackForm: Form = {
      name: aiPrompt.slice(0, 40) || "AI-generated form",
      description: aiPrompt.slice(0, 200),
      view_type: "form",
      config: { fields: DEFAULT_FIELDS, success_message: "Thanks — we'll be in touch within 24 hours." },
    };

    try {
      const r: any = await apiFetch("/marketing/assistant-chat", {
        method: "POST",
        body: JSON.stringify({
          message: `Design a web form. Return ONLY strict JSON with this exact shape:
{
  "name": "Form name (≤6 words)",
  "description": "One-line description",
  "fields": [{"key":"snake_case_key","label":"Display label","type":"text|email|tel|select|textarea","required":true|false}],
  "success_message": "Confirmation shown after submit"
}

User request: "${aiPrompt}"
Constraints: 4-7 fields, always include "email" required, snake_case keys, B2B-friendly.`,
          history: [],
        }),
      });
      const reply = (r?.reply ?? "").trim();
      const match = reply.match(/\{[\s\S]*\}/);
      let parsed: any = null;
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { parsed = null; }
      }

      // Validate the parsed schema before accepting it
      if (parsed && parsed.name && Array.isArray(parsed.fields)) {
        const seen = new Set<string>();
        const cleanFields: Field[] = parsed.fields
          .filter((f: any) => f && typeof f.key === "string" && typeof f.label === "string")
          .map((f: any) => ({
            key: String(f.key).toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 40) || `field_${Math.random().toString(36).slice(2, 7)}`,
            label: String(f.label).slice(0, 60),
            type: ["text", "email", "tel", "select", "textarea"].includes(f.type) ? f.type : "text",
            required: !!f.required,
          }))
          .filter((f: Field) => { if (seen.has(f.key)) return false; seen.add(f.key); return true; });

        if (cleanFields.length > 0) {
          // Always ensure an email field exists & is required
          if (!cleanFields.some((f) => f.key === "email" || f.type === "email")) {
            cleanFields.push({ key: "email", label: "Work email", type: "email", required: true });
          } else {
            cleanFields.forEach((f) => { if (f.key === "email" || f.type === "email") f.required = true; });
          }

          setEditing({
            name: String(parsed.name).slice(0, 60),
            description: String(parsed.description ?? "").slice(0, 200),
            view_type: "form",
            config: {
              fields: cleanFields,
              success_message: String(parsed.success_message ?? "Thanks — we'll be in touch within 24 hours."),
            },
          });
          setAiPrompt("");
          return;
        }
      }

      // Validation failed — use fallback
      setAiError("AI response wasn't a valid form schema. Loaded a base template you can edit.");
      setEditing(fallbackForm);
    } catch (e: any) {
      // Network / API failure — still load the fallback so the user can keep working
      setAiError(`${e?.message ?? "AI request failed"}. Loaded a base template you can edit.`);
      setEditing(fallbackForm);
    } finally {
      setAiLoading(false);
    }
  }

  async function refreshPrediction() {
    setPredLoading(true);
    try {
      const r: any = await apiFetch("/marketing/assistant-chat", {
        method: "POST",
        body: JSON.stringify({
          message: `Predict the next 30 days of marketing performance for our GCC B2B SaaS. We have ${forms.length} live web forms, recent submissions count ${submissions.length}.
Return ONLY strict JSON:
{
  "campaign_health": "A | A- | B+ | B | B- | C",
  "predicted_open_rate": number 0-100,
  "predicted_conversion_rate": number 0-100,
  "pricing_signal": "one short sentence",
  "channel_recommendation": "one short sentence",
  "best_form_pattern": "one short sentence",
  "confidence": number 0-100
}`,
          history: [],
        }),
      });
      const reply = (r?.reply ?? "").trim();
      const match = reply.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed?.campaign_health) {
          setPrediction({
            campaign_health: String(parsed.campaign_health),
            predicted_open_rate: Number(parsed.predicted_open_rate ?? 0),
            predicted_conversion_rate: Number(parsed.predicted_conversion_rate ?? 0),
            pricing_signal: String(parsed.pricing_signal ?? ""),
            channel_recommendation: String(parsed.channel_recommendation ?? ""),
            best_form_pattern: String(parsed.best_form_pattern ?? ""),
            confidence: Number(parsed.confidence ?? 70),
          });
          setPredSource("live");
        }
      }
    } catch {/* keep fallback */} finally {
      setPredLoading(false);
    }
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
  <input name="email" type="email" placeholder="Work email" required>
  <input type="hidden" name="source" value="${formId}">
  <button type="submit">Submit</button>
</form>`;
  }

  return (
    <div className="p-5 space-y-4">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white"/>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Web Forms & Lead Capture</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase border border-[#88B8B0]/30">Live</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Pick from a template, build by hand, or describe it and let AI build the form for you.
          </p>
        </div>
      </div>

      {/* ── AI Form Creator + Predictive Analysis row ──── */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-7 glass-card rounded-2xl p-4 border border-[#C8A880]/40 bg-[#C8A880]/5">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="w-4 h-4 text-[#C8A880]"/>
            <div className="text-sm font-bold">AI form creator</div>
            <span className="px-1.5 py-0.5 rounded bg-[#C8A880]/20 text-[#C8A880] text-[9px] font-bold uppercase border border-[#C8A880]/40">Live</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">Describe the form in one sentence — we'll generate the fields for you.</p>
          <div className="flex gap-2">
            <input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Webinar registration with role and company size"
              className="flex-1 text-sm px-2.5 py-1.5 rounded-lg border border-border/40 bg-background"
              onKeyDown={(e) => { if (e.key === "Enter") aiCreateForm(); }}
            />
            <button
              onClick={aiCreateForm}
              disabled={aiLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg flex items-center gap-1 disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Sparkles className="w-3.5 h-3.5"/>}
              Generate
            </button>
          </div>
          {aiError && (
            <div className="mt-2 text-xs text-[#C0A0B8] flex items-center gap-1">
              <AlertCircle className="w-3 h-3"/> {aiError}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-muted-foreground">Or pick a template:</span>
            {FORM_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => newFormFromTemplate(t.id)}
                className="px-2 py-0.5 rounded-md text-[11px] font-semibold border border-border/40 hover:bg-[#C8A880]/10 hover:border-[#C8A880]/40 transition-colors"
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-5 glass-card rounded-2xl p-4 border border-[#A090C8]/40 bg-[#A090C8]/5">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-[#A090C8]"/>
            <div className="text-sm font-bold">Predictive analysis</div>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
              predSource === "live"
                ? "bg-[#A090C8]/20 text-[#A090C8] border-[#A090C8]/40"
                : "bg-muted text-muted-foreground border-border/40"
            }`}>{predSource}</span>
            <button onClick={refreshPrediction} disabled={predLoading} className="ml-auto text-xs text-[#A090C8] hover:underline flex items-center gap-1">
              {predLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
              Re-analyse
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Stat icon={Target}     label="Health"   value={prediction.campaign_health} accent="#A090C8"/>
            <Stat icon={TrendingUp} label="Open"     value={`${prediction.predicted_open_rate}%`} accent="#88B8B0"/>
            <Stat icon={DollarSign} label="Conv"     value={`${prediction.predicted_conversion_rate}%`} accent="#C8A880"/>
          </div>
          <ul className="space-y-1 text-[11px] text-foreground/85">
            <li className="flex gap-1.5"><Lightbulb className="w-3 h-3 mt-0.5 text-[#C8A880] shrink-0"/><span><strong>Pricing:</strong> {prediction.pricing_signal}</span></li>
            <li className="flex gap-1.5"><Lightbulb className="w-3 h-3 mt-0.5 text-[#C8A880] shrink-0"/><span><strong>Channels:</strong> {prediction.channel_recommendation}</span></li>
            <li className="flex gap-1.5"><Lightbulb className="w-3 h-3 mt-0.5 text-[#C8A880] shrink-0"/><span><strong>Forms:</strong> {prediction.best_form_pattern}</span></li>
          </ul>
          <div className="text-[10px] text-muted-foreground mt-2">Confidence: {prediction.confidence}%</div>
        </div>
      </div>

      {/* ── Forms list + editor ──────────────────────────── */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5 glass-panel p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
            <div className="text-sm font-bold">Forms ({forms.length})</div>
            <button
              onClick={() => newFormFromTemplate("demo")}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border border-[#C8A880]/40 hover:bg-[#C8A880]/10"
            >
              <Plus className="w-3 h-3"/> New
            </button>
          </div>
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading…</div>
          ) : forms.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No forms yet — describe one above or pick a template.
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {forms.map((f) => (
                <div key={f.id} className="px-4 py-3 hover:bg-muted/40 cursor-pointer" onClick={() => setEditing(f)}>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#B8A0C8]"/>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.config?.fields?.length ?? 0} fields</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(embedSnippet(f.id ?? "")); alert("Embed code copied!"); }} className="text-xs px-2 py-1 rounded bg-muted hover:bg-[#B8A0C8]/20" title="Copy embed code"><Copy className="w-3 h-3"/></button>
                    <button onClick={(e) => { e.stopPropagation(); del(f.id!); }} className="text-muted-foreground hover:text-[#C0A0B8]"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {submissions.length > 0 && (
            <div className="border-t border-border/30">
              <div className="px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase">Recent submissions</div>
              <div className="px-4 pb-3 space-y-1.5 max-h-48 overflow-y-auto">
                {submissions.slice(0, 8).map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-muted/40 text-xs">
                    <div className="min-w-0 truncate">
                      <div className="font-semibold truncate">{s.title}</div>
                      <div className="text-muted-foreground truncate">{s.body}</div>
                    </div>
                    <div className="text-muted-foreground text-[10px] shrink-0">{new Date(s.completed_at ?? s.created_at).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-7">
          {!editing ? (
            <div className="glass-panel p-6 text-center text-xs text-muted-foreground">
              Pick a form on the left to edit, generate one with AI above, or start from a template.
            </div>
          ) : (
            <div className="glass-panel p-4 space-y-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase">Edit form</div>
              <Input label="Form name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })}/>
              <Input label="Description" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })}/>
              <div>
                <div className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Fields</div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
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
              <Input label="Success message" value={editing.config?.success_message ?? ""} onChange={(v) => setEditing({ ...editing, config: { ...editing.config!, fields: editing.config?.fields ?? [], success_message: v } })}/>
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

function Stat({ icon: Icon, label, value, accent }: any) {
  return (
    <div className="glass-card rounded-xl p-2 border border-border/30">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="w-3 h-3" style={{ color: accent }}/>
        <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide">{label}</div>
      </div>
      <div className="text-base font-bold" style={{ color: accent }}>{value}</div>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-sm px-2 py-1.5 rounded border border-border/40 bg-transparent"/>
    </div>
  );
}
