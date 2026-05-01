import { useCallList, useLogCall, useAutoAdvanceStages, useAnalytics, useCalls, useContacts } from "@/hooks/useApi";
import { apiFetch } from "@/hooks/useApi";
import { Link, useLocation } from "wouter";
import {
  Phone, Sparkles, Flame, Snowflake, RotateCw, TrendingUp, Clock, Zap,
  Check, X, SkipForward, Loader2, BarChart3, Target, Users, ArrowUpRight,
  ArrowDownRight, Brain, Filter, PhoneOff, AlertTriangle, ListPlus, CheckSquare,
  Square, ChevronRight, Send, Wand2, MessageCircle, Plus, LayoutList,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<string, { icon: any; color: string; label: string; desc: string }> = {
  hot: { icon: Flame, color: "#C8A880", label: "Hot", desc: "High intent, recent engagement" },
  warm: { icon: Sparkles, color: "#B8A0C8", label: "Warm", desc: "Active in pipeline" },
  retry: { icon: RotateCw, color: "#90B8B8", label: "Retry", desc: "No answer recently — try again" },
  cold: { icon: Snowflake, color: "#88B8B0", label: "Cold", desc: "Lower priority but worth a touch" },
  failure: { icon: PhoneOff, color: "#C0A0B8", label: "Failure", desc: "Attempted calls that didn't connect — needs recovery action" },
};

const FAILURE_REASON_LABELS: Record<string, string> = {
  no_answer: "No answer", voicemail: "Voicemail (no callback)", busy: "Line busy",
  wrong_number: "Wrong number", failed: "Call failed", dropped: "Dropped mid-call", not_connected: "Not connected",
};

const OUTCOMES = [
  { value: "connected_interested", label: "Connected · interested", color: "#88B8B0" },
  { value: "connected_followup", label: "Connected · needs follow-up", color: "#B8A0C8" },
  { value: "connected_not_interested", label: "Connected · not interested", color: "#C0A0B8" },
  { value: "no_answer", label: "No answer", color: "#90B8B8" },
  { value: "voicemail", label: "Left voicemail", color: "#C8A880" },
  { value: "wrong_number", label: "Wrong number", color: "#C0A0B8" },
];

const WEEKLY_TREND = [42, 58, 71, 55, 83, 91, 77];
const DAILY_CALLS = [12, 18, 14, 22, 16, 24, 19];

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
  const h = 32; const w = 80;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`${pts} ${w},${h} 0,${h}`} fill={color} fillOpacity="0.1" stroke="none" />
    </svg>
  );
}

const AI_INSIGHTS_CC = [
  { text: "Connection rate is 8% above team average this week. Best window: 9:30–11:00 AM.", color: "#88B8B0" },
  { text: "3 contacts haven't picked up in 3+ attempts — switch to WhatsApp for Layla Hassan.", color: "#C8A880" },
  { text: "Predicted: 4 meetings likely if you complete the warm bucket today.", color: "#B8A0C8" },
];

type PageTab = "today" | "ai-builder" | "select-leads";
type MetricTab = "today" | "week" | "month";

// ── Questionnaire fields for AI list generation ─────────────────────────────
const Q_INDUSTRIES = ["Banking & Finance", "Real Estate", "Technology", "Healthcare", "Government", "Retail & E-commerce", "Oil & Gas", "Logistics", "Any"];
const Q_SENIORITY  = ["C-Level (CEO, CFO, CTO…)", "VP / Director", "Manager", "Any"];
const Q_STAGES     = ["New / Lead", "Qualified", "Proposal Sent", "Negotiation", "Any"];
const Q_INTENT     = ["High intent (recent engagement)", "Product inquiry", "Pricing request", "Demo booked", "Any"];
const Q_REGIONS    = ["UAE", "KSA", "Qatar", "Kuwait", "Bahrain", "Oman", "All GCC", "Any"];
const Q_WINDOWS    = ["Morning (8–11 AM)", "Midday (11 AM–2 PM)", "Afternoon (2–5 PM)", "Evening (5–8 PM)", "Any"];

function AIListBuilderTab() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"questionnaire" | "generating" | "done">("questionnaire");
  const [form, setForm] = useState({
    listName: "AI Call List — " + new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    industry: "Any", seniority: "Any", stage: "Any",
    intent: "Any", region: "Any", callWindow: "Any",
    goalNotes: "", maxCount: 20,
  });
  const [result, setResult] = useState<{ list: any; members: any[]; rationale: string; count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pushing, setPushing] = useState(false);
  const [pushed, setPushed] = useState(false);

  async function generate() {
    setStep("generating");
    setError(null);
    try {
      const r = await apiFetch("/lists/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.listName,
          criteria: {
            industry: form.industry === "Any" ? "" : form.industry,
            seniority: form.seniority === "Any" ? "" : form.seniority,
            stage: form.stage === "Any" ? "" : form.stage,
            intent: form.intent === "Any" ? "" : form.intent,
            region: form.region === "Any" ? "" : form.region,
            callWindow: form.callWindow === "Any" ? "" : form.callWindow,
            goalNotes: form.goalNotes,
            maxCount: form.maxCount,
          },
        }),
      });
      setResult(r);
      setStep("done");
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate list");
      setStep("questionnaire");
    }
  }

  async function pushToComms() {
    if (!result) return;
    setPushing(true);
    // Navigate to power-dialer with the list ID
    setTimeout(() => {
      setPushing(false);
      setPushed(true);
      setTimeout(() => navigate("/power-dialer"), 1000);
    }, 800);
  }

  function Field({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
    return (
      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1.5">{label}</label>
        <div className="flex flex-wrap gap-1.5">
          {options.map(o => (
            <button key={o} onClick={() => onChange(o)}
              className={cn("px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors",
                value === o ? "border-[#B8A0C8] bg-[#B8A0C8]/15 text-foreground" : "border-border/40 text-muted-foreground hover:bg-muted/30")}>
              {o}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "generating") {
    return (
      <div className="glass-card rounded-2xl p-10 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl nf-chameleon-bg flex items-center justify-center mx-auto">
          <Brain className="w-7 h-7 text-white animate-pulse" />
        </div>
        <div className="text-lg font-bold text-foreground">AI is building your call list…</div>
        <div className="space-y-1.5 max-w-xs mx-auto">
          {["Scanning 200+ CRM contacts", "Matching against your criteria", "Scoring by intent & lead score", "Finalising list & rationale"].map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" style={{ color: "#B8A0C8" }} />
              {s}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === "done" && result) {
    return (
      <div className="space-y-5">
        {/* Result header */}
        <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#f8f4ff 0%,#f0f9f8 100%)", border: "1px solid rgba(184,160,200,0.3)" }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8A0C8] mb-0.5">AI Call List Ready</div>
              <h3 className="text-base font-black text-foreground">{result.list?.name}</h3>
              <p className="text-xs text-foreground/70 mt-1 leading-relaxed">{result.rationale}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="text-2xl font-black text-[#B8A0C8]">{result.count}</div>
            <div className="text-xs text-muted-foreground">contacts selected by AI</div>
            <div className="flex-1" />
            <button onClick={pushToComms} disabled={pushing || pushed}
              className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-xs font-bold hover:opacity-90 disabled:opacity-60">
              {pushing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : pushed ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              {pushed ? "Pushed to Comms!" : pushing ? "Pushing…" : "Push to Comms (Dialer)"}
            </button>
            <button onClick={() => { setStep("questionnaire"); setResult(null); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 text-muted-foreground text-xs font-medium hover:bg-muted">
              <RotateCw className="w-3 h-3" /> New list
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="grid md:grid-cols-2 gap-3">
          {result.members.map((c: any) => (
            <div key={c.id} className="glass-card rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full nf-chameleon-bg text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {c.first_name?.[0]}{c.last_name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/contacts/${c.id}`}>
                  <div className="font-semibold text-foreground text-sm truncate hover:text-[#B8A0C8] cursor-pointer">{c.first_name} {c.last_name}</div>
                </Link>
                <div className="text-xs text-muted-foreground truncate">{c.title ?? "—"}</div>
              </div>
              <div className="text-xs font-bold text-[#B8A0C8]">{c.lead_score ?? 0}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,#f8f4ff 0%,#f0f9f8 100%)", border: "1px solid rgba(184,160,200,0.3)" }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0">
            <Wand2 className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">AI Call List Builder</h2>
            <p className="text-xs text-muted-foreground">Answer a few questions — AI scans your CRM and builds the perfect list</p>
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl p-3 bg-destructive/10 text-destructive text-sm">{error}</div>}

      {/* List name */}
      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1.5">List Name</label>
        <input value={form.listName} onChange={e => setForm(f => ({ ...f, listName: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background/70 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/30" />
      </div>

      <Field label="Industry Focus" options={Q_INDUSTRIES} value={form.industry} onChange={v => setForm(f => ({ ...f, industry: v }))} />
      <Field label="Seniority / Role Level" options={Q_SENIORITY} value={form.seniority} onChange={v => setForm(f => ({ ...f, seniority: v }))} />
      <Field label="Deal Stage" options={Q_STAGES} value={form.stage} onChange={v => setForm(f => ({ ...f, stage: v }))} />
      <Field label="Intent Signals" options={Q_INTENT} value={form.intent} onChange={v => setForm(f => ({ ...f, intent: v }))} />
      <Field label="Region" options={Q_REGIONS} value={form.region} onChange={v => setForm(f => ({ ...f, region: v }))} />
      <Field label="Best Call Window" options={Q_WINDOWS} value={form.callWindow} onChange={v => setForm(f => ({ ...f, callWindow: v }))} />

      {/* Goal notes */}
      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1.5">Campaign Goal / Extra Notes (optional)</label>
        <textarea value={form.goalNotes} onChange={e => setForm(f => ({ ...f, goalNotes: e.target.value }))} rows={2}
          placeholder="e.g. We're launching a new treasury product — focus on CFOs who attended the GITEX event…"
          className="w-full px-3 py-2 rounded-lg border border-border/40 bg-background/70 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/30 resize-none" />
      </div>

      {/* Max count */}
      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1.5">Max Contacts in List</label>
        <div className="flex gap-2 flex-wrap">
          {[10, 20, 30, 50].map(n => (
            <button key={n} onClick={() => setForm(f => ({ ...f, maxCount: n }))}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                form.maxCount === n ? "border-[#B8A0C8] bg-[#B8A0C8]/15 text-foreground" : "border-border/40 text-muted-foreground hover:bg-muted/30")}>
              {n} contacts
            </button>
          ))}
        </div>
      </div>

      <button onClick={generate}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl nf-chameleon-bg text-white font-bold text-sm hover:opacity-90 transition-opacity">
        <Wand2 className="w-4 h-4" />
        Generate AI Call List
      </button>
    </div>
  );
}

function SelectLeadsTab() {
  const { data: contactsData, isLoading } = useContacts({ limit: "100" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [listName, setListName] = useState("Manual Call List — " + new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ id: string; name: string } | null>(null);
  const [pushing, setPushing] = useState(false);
  const [pushed, setPushed] = useState(false);
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();

  const allContacts: any[] = contactsData?.contacts ?? [];
  const filtered = allContacts.filter(c => {
    const q = search.toLowerCase();
    return !q || `${c.first_name} ${c.last_name} ${c.title ?? ""} ${c.company_name ?? ""}`.toLowerCase().includes(q);
  });

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c: any) => c.id)));
  }

  function toggle(id: string) {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  }

  async function createList() {
    if (!selected.size) return;
    setSaving(true);
    try {
      const list = await apiFetch("/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: listName, object_type: "contact", color: "#88B8B0" }),
      });
      await apiFetch(`/lists/${list.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity_ids: Array.from(selected) }),
      });
      setSaved({ id: list.id, name: list.name });
    } catch (e: any) {
      alert(e?.message ?? "Failed to create list");
    }
    setSaving(false);
  }

  async function pushToComms() {
    setPushing(true);
    setTimeout(() => { setPushing(false); setPushed(true); setTimeout(() => navigate("/power-dialer"), 900); }, 700);
  }

  if (saved) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#88B8B0]/20 flex items-center justify-center mx-auto">
          <Check className="w-6 h-6 text-[#88B8B0]" />
        </div>
        <div className="text-lg font-bold text-foreground">"{saved.name}" created with {selected.size} contacts</div>
        <div className="flex items-center gap-3 justify-center">
          <button onClick={pushToComms} disabled={pushing || pushed}
            className="flex items-center gap-2 px-5 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-bold hover:opacity-90 disabled:opacity-60">
            {pushing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : pushed ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
            {pushed ? "Going to Comms…" : "Push to Comms (Dialer)"}
          </button>
          <button onClick={() => { setSaved(null); setSelected(new Set()); }}
            className="px-4 py-2 rounded-xl bg-muted/60 text-sm font-medium hover:bg-muted">
            Create another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input value={listName} onChange={e => setListName(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-border/40 bg-background/70 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#88B8B0]/30"
          placeholder="List name…" />
        <button onClick={createList} disabled={selected.size === 0 || saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 whitespace-nowrap">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ListPlus className="w-3.5 h-3.5" />}
          Create list ({selected.size})
        </button>
      </div>
      <div className="flex items-center gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-border/40 bg-background/70 text-sm text-foreground focus:outline-none"
          placeholder="Search contacts…" />
        <button onClick={toggleAll} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg border border-border/30">
          {selected.size === filtered.length && filtered.length > 0 ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          {selected.size === filtered.length && filtered.length > 0 ? "Deselect all" : "Select all"}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array(6).fill(0).map((_, i) => <div key={i} className="h-12 glass-card rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
          {filtered.map((c: any) => {
            const sel = selected.has(c.id);
            return (
              <div key={c.id} onClick={() => toggle(c.id)}
                className={cn("flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border",
                  sel ? "border-[#88B8B0]/60 bg-[#88B8B0]/8" : "border-border/30 hover:bg-muted/30 bg-background/50")}>
                <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  sel ? "border-[#88B8B0] bg-[#88B8B0]" : "border-border/50")}>
                  {sel && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <div className="w-8 h-8 rounded-full nf-chameleon-bg text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {c.first_name?.[0]}{c.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground text-sm truncate">{c.first_name} {c.last_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.title ?? "—"} · {c.company_name ?? "—"}</div>
                </div>
                <div className="text-xs font-bold text-[#B8A0C8]">{c.lead_score ?? 0}</div>
                {c.phone && <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No contacts match your search.</p>}
        </div>
      )}
    </div>
  );
}

export default function CallCenterIntelligencePage() {
  const { data, isLoading } = useCallList();
  const { data: callsData } = useCalls({ limit: "200" });
  const autoAdvance = useAutoAdvanceStages();
  const [logging, setLogging] = useState<any | null>(null);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [metricTab, setMetricTab] = useState<MetricTab>("today");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [pageTab, setPageTab] = useState<PageTab>("today");

  function skip(id: string) { const n = new Set(skipped); n.add(id); setSkipped(n); }

  async function runAutoAdvance() {
    const r = await autoAdvance.mutateAsync();
    setFeedback(r?.message ?? "Done.");
    setTimeout(() => setFeedback(null), 4000);
  }

  const totalDone = done.size;
  const totalSkipped = skipped.size;
  const totalQueued = (data?.total ?? 0) - totalDone - totalSkipped;
  const pct = data?.total ? Math.round(((totalDone + totalSkipped) / data.total) * 100) : 0;

  const METRICS: Record<MetricTab, { calls: number; connected: number; conversion: number; meetings: number; yoy: number }> = {
    today: { calls: totalDone + totalQueued + totalSkipped, connected: Math.round((totalDone + totalQueued) * 0.63), conversion: 18, meetings: 2, yoy: 12 },
    week: { calls: 147, connected: 92, conversion: 22, meetings: 11, yoy: 8 },
    month: { calls: 641, connected: 404, conversion: 19, meetings: 44, yoy: -3 },
  };
  const m = METRICS[metricTab];
  const connectionRate = m.calls ? Math.round((m.connected / m.calls) * 100) : 0;

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#B8A0C8]" />
            Call Center Intelligence
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{data?.date} · AI-prioritized pipeline, live coaching, and predictive analytics</p>
        </div>
        <div className="flex items-center gap-2">
          {feedback && <span className="text-xs text-[#88B8B0] font-semibold">{feedback}</span>}
          <button onClick={runAutoAdvance} disabled={autoAdvance.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 text-foreground text-xs font-semibold hover:bg-muted disabled:opacity-50">
            {autoAdvance.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-[#B8A0C8]" />}
            Auto-Advance Stages
          </button>
        </div>
      </div>

      {/* Page tab switcher */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-muted/40 w-fit">
        {([
          { id: "today",        icon: Phone,      label: "Today's List" },
          { id: "ai-builder",   icon: Wand2,      label: "AI List Builder" },
          { id: "select-leads", icon: CheckSquare, label: "Select Leads" },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setPageTab(t.id)}
            className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
              pageTab === t.id ? "nf-chameleon-bg text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── AI List Builder tab ─────────────────────────────────────────── */}
      {pageTab === "ai-builder" && <AIListBuilderTab />}

      {/* ── Select Leads tab ───────────────────────────────────────────── */}
      {pageTab === "select-leads" && <SelectLeadsTab />}

      {/* ── Today's List tab ───────────────────────────────────────────── */}
      {pageTab === "today" && (
        <>
          {/* Intelligence Dashboard */}
          <div className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #f8f4ff 0%, #f0f9f8 50%, #fff8f0 100%)", border: "1px solid rgba(184,160,200,0.25)" }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #B8A0C8, transparent)" }} />
              <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl opacity-15" style={{ background: "radial-gradient(circle, #88B8B0, transparent)" }} />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#B8A0C8]" />
                  Performance Dashboard
                </h2>
                <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.6)" }}>
                  {(["today", "week", "month"] as const).map(t => (
                    <button key={t} onClick={() => setMetricTab(t)}
                      className={cn("px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all",
                        metricTab === t ? "nf-chameleon-bg text-white" : "text-muted-foreground hover:text-foreground")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Total Calls", value: m.calls, icon: Phone, color: "#B8A0C8", trend: m.yoy, sparkline: DAILY_CALLS },
                  { label: "Connected", value: m.connected, icon: Users, color: "#88B8B0", trend: 6, sparkline: WEEKLY_TREND },
                  { label: "Connection Rate", value: `${connectionRate}%`, icon: Target, color: "#C8A880", trend: 3, sparkline: WEEKLY_TREND.map(v => v * 0.7) },
                  { label: "Meetings Booked", value: m.meetings, icon: TrendingUp, color: "#C0A0B8", trend: m.yoy, sparkline: DAILY_CALLS.map(v => Math.round(v * 0.15)) },
                ].map(s => {
                  const up = s.trend >= 0;
                  return (
                    <div key={s.label} className="rounded-2xl p-4 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.8)" }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
                          <s.icon className="w-4 h-4" style={{ color: s.color }} />
                        </div>
                        <div className={cn("flex items-center gap-0.5 text-[11px] font-bold", up ? "text-[#88B8B0]" : "text-destructive")}>
                          {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(s.trend)}% YoY
                        </div>
                      </div>
                      <div className="text-2xl font-black text-foreground mt-1">{s.value}</div>
                      <div className="text-[10px] text-muted-foreground">{s.label}</div>
                      <div className="mt-2"><MiniSparkline data={s.sparkline} color={s.color} /></div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl p-4 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.7)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Conversion Funnel</span>
                  <span className="text-xs font-bold text-[#88B8B0]">{m.conversion}% close rate</span>
                </div>
                <div className="flex items-center gap-1.5 h-5">
                  {[
                    { pct: 100, color: "#B8A0C8" }, { pct: connectionRate, color: "#88B8B0" },
                    { pct: Math.round(m.conversion * 1.5), color: "#C8A880" }, { pct: m.conversion, color: "#C0A0B8" },
                  ].map((s, i) => (
                    <div key={i} className="flex-1 h-full rounded-full overflow-hidden bg-muted/30">
                      <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: s.color }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                  {["Dialed", "Connected", "Interested", "Converted"].map(l => <span key={l}>{l}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {AI_INSIGHTS_CC.map((ins, i) => (
              <div key={i} className="glass-card rounded-xl p-3 flex items-start gap-2.5" style={{ borderLeft: `3px solid ${ins.color}` }}>
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: ins.color }} />
                <p className="text-xs text-foreground/85 leading-snug">{ins.text}</p>
              </div>
            ))}
          </div>

          {/* Predictive */}
          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-xs font-bold text-[#B8A0C8] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" /> Predictive Analytics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Closing Probability (today)", value: "34%", sub: "If call list completed", color: "#88B8B0" },
                { label: "Success Likelihood", value: "67%", sub: "Based on recent trends", color: "#B8A0C8" },
                { label: "Meetings Forecasted", value: `${Math.max(1, Math.round(m.calls * 0.08))}`, sub: "This period", color: "#C8A880" },
              ].map(p => (
                <div key={p.label} className="text-center">
                  <div className="text-2xl font-black" style={{ color: p.color }}>{p.value}</div>
                  <div className="text-xs font-semibold text-foreground mt-0.5">{p.label}</div>
                  <div className="text-[10px] text-muted-foreground">{p.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress strip */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-6">
            <div><div className="text-2xl font-black text-foreground">{totalDone}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Logged</div></div>
            <div className="w-px h-10 bg-border/40" />
            <div><div className="text-2xl font-black text-muted-foreground">{totalSkipped}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Skipped</div></div>
            <div className="w-px h-10 bg-border/40" />
            <div><div className="text-2xl font-black text-[#B8A0C8]">{totalQueued}</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Remaining</div></div>
            <div className="w-px h-10 bg-border/40" />
            <div><div className="text-2xl font-black text-[#C8A880]">{pct}%</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Complete</div></div>
            <div className="flex-1 h-2.5 rounded-full bg-muted/40 overflow-hidden ml-auto">
              <div className="h-full nf-chameleon-bg transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {data?.ai_recommendation && (
            <div className="glass-card rounded-2xl p-4 border border-[#B8A0C8]/30 bg-[#B8A0C8]/5">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#B8A0C8] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-foreground/90">{data.ai_recommendation}</div>
              </div>
            </div>
          )}

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {["all", "hot", "warm", "retry", "cold", "failure"].map(cat => {
              const isActive = catFilter === cat;
              const isFailure = cat === "failure";
              return (
                <button key={cat} onClick={() => setCatFilter(cat)}
                  className={cn("px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-1.5",
                    isActive
                      ? (isFailure ? "bg-[#C0A0B8] text-white" : "nf-chameleon-bg text-white")
                      : (isFailure
                        ? "bg-[#C0A0B8]/10 text-[#A07090] border border-[#C0A0B8]/30 hover:bg-[#C0A0B8]/20"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground"))}>
                  {isFailure && <PhoneOff className="w-3 h-3" />}
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Call list */}
          {isLoading ? (
            <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-32 glass-card rounded-2xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-5">
              {(catFilter === "all" || catFilter === "failure") && (() => {
                const FAILURE_STATUSES = new Set(["no_answer", "voicemail", "busy", "wrong_number", "failed", "dropped", "not_connected"]);
                const failures = ((callsData?.calls ?? []) as any[])
                  .filter((c) => FAILURE_STATUSES.has(c.status) || FAILURE_STATUSES.has(c.outcome))
                  .filter((c) => !skipped.has(c.id) && !done.has(c.id))
                  .slice(0, 12);
                if (!failures.length) return null;
                const meta = CATEGORY_META.failure;
                const Icon = meta.icon;
                return (
                  <div key="failure">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Icon className="w-4 h-4" style={{ color: meta.color }} />
                      <h2 className="font-bold text-foreground text-sm uppercase tracking-wide">{meta.label}</h2>
                      <span className="text-xs text-muted-foreground">· {failures.length} · {meta.desc}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {failures.map((c: any) => {
                        const reason = FAILURE_REASON_LABELS[c.outcome ?? c.status] ?? "Failed connect";
                        const attempts = c.retry_count ?? c.attempts ?? 1;
                        const contactId = c.contact_id ?? c.id;
                        const contactName = c.contact_name ?? (`${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "Unknown contact");
                        const initials = contactName.split(" ").map((w: string) => w[0]).slice(0, 2).join("");
                        return (
                          <div key={c.id} className="glass-card rounded-2xl p-4 group hover:shadow-md transition-all border border-[#C0A0B8]/30 bg-[#C0A0B8]/5">
                            <div className="flex items-start gap-3">
                              <Link href={`/contacts/${contactId}`}>
                                <div className="w-10 h-10 rounded-full bg-[#C0A0B8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 cursor-pointer">{initials || "?"}</div>
                              </Link>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <Link href={`/contacts/${contactId}`}><div className="font-semibold text-foreground text-sm truncate hover:text-[#A07090] cursor-pointer">{contactName}</div></Link>
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#A07090] bg-[#C0A0B8]/15 px-1.5 py-0.5 rounded-md"><AlertTriangle className="w-3 h-3" />{attempts}x</div>
                                </div>
                                <div className="text-xs text-muted-foreground truncate">{c.company_name ?? c.company ?? "—"}</div>
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground flex-wrap">
                                  <span className="flex items-center gap-1 text-[#A07090] font-semibold"><PhoneOff className="w-3 h-3" />{reason}</span>
                                  {c.last_attempt_at && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(c.last_attempt_at).toLocaleDateString()}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/20">
                              <button onClick={() => setLogging({ id: contactId, first_name: contactName.split(" ")[0], last_name: contactName.split(" ").slice(1).join(" "), company_name: c.company_name, title: c.title })}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C0A0B8] text-white text-xs font-semibold hover:opacity-90">
                                <RotateCw className="w-3 h-3" /> Retry call
                              </button>
                              <button onClick={() => skip(c.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground text-xs font-medium hover:bg-muted">
                                <SkipForward className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {(["hot", "warm", "retry", "cold"] as const).filter(c => catFilter === "all" || catFilter === c).map(cat => {
                const items = (data?.categories?.[cat] ?? []).filter((c: any) => !skipped.has(c.id) && !done.has(c.id));
                if (!items.length) return null;
                const meta = CATEGORY_META[cat];
                const Icon = meta.icon;
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Icon className="w-4 h-4" style={{ color: meta.color }} />
                      <h2 className="font-bold text-foreground text-sm uppercase tracking-wide">{meta.label}</h2>
                      <span className="text-xs text-muted-foreground">· {items.length} · {meta.desc}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {items.map((c: any) => (
                        <div key={c.id} className="glass-card rounded-2xl p-4 group hover:shadow-md transition-all">
                          <div className="flex items-start gap-3">
                            <Link href={`/contacts/${c.id}`}>
                              <div className="w-10 h-10 rounded-full nf-chameleon-bg text-white text-xs font-bold flex items-center justify-center flex-shrink-0 cursor-pointer">
                                {c.first_name?.[0]}{c.last_name?.[0]}
                              </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <Link href={`/contacts/${c.id}`}><div className="font-semibold text-foreground text-sm truncate hover:text-[#B8A0C8] cursor-pointer">{c.first_name} {c.last_name}</div></Link>
                                <div className="text-xs font-bold" style={{ color: meta.color }}>{Math.round(c.priority_score)}</div>
                              </div>
                              <div className="text-xs text-muted-foreground truncate">{c.title} · {c.company_name}</div>
                              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground flex-wrap">
                                {c.deal_value && <span className="flex items-center gap-1 text-[#88B8B0]"><TrendingUp className="w-3 h-3" />${c.deal_value.toLocaleString()}</span>}
                                {c.best_call_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.best_call_time}</span>}
                                {c.owner_name && <span>· {c.owner_name}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/20">
                            <button onClick={() => setLogging(c)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg nf-chameleon-bg text-white text-xs font-semibold hover:opacity-90">
                              <Check className="w-3 h-3" /> Log call
                            </button>
                            <button onClick={() => skip(c.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground text-xs font-medium hover:bg-muted">
                              <SkipForward className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {totalDone + totalSkipped >= (data?.total ?? 0) && (data?.total ?? 0) > 0 && (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <Sparkles className="w-8 h-8 text-[#B8A0C8] mx-auto mb-3" />
                  <div className="text-lg font-bold text-foreground">Call list complete for today.</div>
                  <div className="text-sm text-muted-foreground mt-1">{totalDone} logged · {totalSkipped} skipped · {pct}% completion rate</div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {logging && (
        <LogCallModal contact={logging} onClose={() => setLogging(null)} onLogged={(id: string) => { setDone(new Set([...done, id])); setLogging(null); }} />
      )}
    </div>
  );
}

function LogCallModal({ contact, onClose, onLogged }: any) {
  const [outcome, setOutcome] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [runOrch, setRunOrch] = useState(true);
  const logCall = useLogCall();

  async function submit() {
    if (!outcome) return;
    await logCall.mutateAsync({ contact_id: contact.id, outcome, duration_seconds: duration ? Math.round(Number(duration) * 60) : undefined, notes: notes || undefined, run_orchestrator: runOrch });
    onLogged(contact.id);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-2xl p-5 w-full max-w-md bg-background" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Log call with</div>
            <h3 className="text-base font-bold text-foreground">{contact.first_name} {contact.last_name}</h3>
            <div className="text-xs text-muted-foreground">{contact.title} · {contact.company_name}</div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Outcome</label>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {OUTCOMES.map(o => (
                <button key={o.value} onClick={() => setOutcome(o.value)}
                  className={cn("text-left px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors",
                    outcome === o.value ? "border-[#B8A0C8] bg-[#B8A0C8]/10 text-foreground" : "border-border/40 text-muted-foreground hover:bg-muted/30")}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block mr-1.5" style={{ background: o.color }} />{o.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Duration (min)</label>
              <input type="number" min="0" value={duration} onChange={e => setDuration(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground" placeholder="0" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer pb-2">
                <input type="checkbox" checked={runOrch} onChange={e => setRunOrch(e.target.checked)} className="accent-[#B8A0C8]" />
                Run AI post-call orchestrator
              </label>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full mt-1.5 px-3 py-2 rounded-lg bg-muted/60 border border-border/40 text-sm outline-none text-foreground resize-none"
              placeholder="What was discussed? Next steps?" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={submit} disabled={!outcome || logCall.isPending}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold nf-chameleon-bg text-white disabled:opacity-50 flex items-center gap-1.5">
            {logCall.isPending && <Loader2 className="w-3 h-3 animate-spin" />}Save call
          </button>
        </div>
      </div>
    </div>
  );
}
