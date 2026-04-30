/**
 * ICP Rules editor — infinitely expandable.
 *
 * The user explicitly requested NO seeded defaults that lock the rep into
 * one shape. This page lets a CRM admin add unlimited rules across any
 * field, with any operator, with any value, and with hard-vs-soft weight.
 */

import { useEffect, useState } from "react";
import { Plus, Trash2, ShieldCheck, ShieldAlert, RotateCcw, Wand2, Target, Sparkles } from "lucide-react";
import {
  loadIcpRules, saveIcpRules, addIcpRule, removeIcpRule, updateIcpRule, getIcpDemoSeed,
  type IcpRule, type IcpOperator,
} from "@/lib/icp";

const OPERATORS: { value: IcpOperator; label: string }[] = [
  { value: "equals",       label: "equals" },
  { value: "not_equals",   label: "is not" },
  { value: "in",           label: "is one of" },
  { value: "not_in",       label: "is not one of" },
  { value: "contains",     label: "contains" },
  { value: "not_contains", label: "doesn't contain" },
  { value: "gte",          label: "is at least" },
  { value: "lte",          label: "is at most" },
  { value: "between",      label: "is between" },
];

export default function IcpRulesPage() {
  const [rules, setRules] = useState<IcpRule[]>([]);
  const [draft, setDraft] = useState<{ field: string; label: string; op: IcpOperator; value: string; weight: "hard" | "soft" }>({
    field: "", label: "", op: "equals", value: "", weight: "hard",
  });

  useEffect(() => { setRules(loadIcpRules()); }, []);

  function refresh() { setRules(loadIcpRules()); }

  function addDraft() {
    if (!draft.field.trim() || !draft.label.trim()) return;
    let value: IcpRule["value"];
    if (draft.op === "in" || draft.op === "not_in") {
      value = draft.value.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (draft.op === "gte" || draft.op === "lte") {
      value = Number(draft.value) || 0;
    } else if (draft.op === "between") {
      const [a, b] = draft.value.split(",").map((s) => Number(s.trim()) || 0);
      value = [a, b];
    } else {
      value = draft.value;
    }
    addIcpRule({
      field: draft.field.trim(),
      label: draft.label.trim(),
      op: draft.op,
      value,
      weight: draft.weight,
    });
    setDraft({ field: "", label: "", op: "equals", value: "", weight: "hard" });
    refresh();
  }

  function reset() {
    if (!confirm("Wipe ALL ICP rules? Every push will be allowed without ICP scoring until you add new rules.")) return;
    saveIcpRules([]);
    refresh();
  }

  function installDemoSeed() {
    if (rules.length > 0 && !confirm("Replace your current rules with the demo seed (Industry, Region, Headcount, AUM, Seniority)?")) return;
    saveIcpRules(getIcpDemoSeed());
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-[#B8B880]" /> Ideal Customer Profile (ICP)
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5 max-w-2xl">
            Every lead pushed to CRM is scored against these rules first. Hard rules block the push (rep must request manager approval); soft rules warn but don't block. Add as many as you want — there is no fixed schema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={installDemoSeed} className="px-3 py-1.5 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:bg-muted" title="Install a 5-rule starter so you can see scoring in action">
            <Sparkles className="w-3 h-3" /> Install demo seed
          </button>
          <button onClick={reset} className="px-3 py-1.5 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:bg-muted">
            <RotateCcw className="w-3 h-3" /> Wipe all rules
          </button>
        </div>
      </div>

      {/* Add new */}
      <section className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          <h2 className="font-semibold">Add a new rule</h2>
          <span className="text-xs text-muted-foreground">— infinite — add as many as your business needs</span>
        </div>
        <div className="grid md:grid-cols-12 gap-2">
          <input
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            placeholder="Display label e.g. Industry"
            className="md:col-span-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            value={draft.field}
            onChange={(e) => setDraft({ ...draft, field: e.target.value })}
            placeholder="Field name e.g. industry"
            className="md:col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
          />
          <select
            value={draft.op}
            onChange={(e) => setDraft({ ...draft, op: e.target.value as IcpOperator })}
            className="md:col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {OPERATORS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            value={draft.value}
            onChange={(e) => setDraft({ ...draft, value: e.target.value })}
            placeholder={
              draft.op === "in" || draft.op === "not_in" ? "comma,separated,values"
              : draft.op === "between" ? "min,max"
              : draft.op === "gte" || draft.op === "lte" ? "number"
              : "value"
            }
            className="md:col-span-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            value={draft.weight}
            onChange={(e) => setDraft({ ...draft, weight: e.target.value as "hard" | "soft" })}
            className="md:col-span-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="hard">Hard</option>
            <option value="soft">Soft</option>
          </select>
          <button
            onClick={addDraft}
            disabled={!draft.field.trim() || !draft.label.trim()}
            className="md:col-span-1 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        <div className="text-[11px] text-muted-foreground">
          <strong>Hard</strong> rule = if the lead fails it, the push is blocked and a manager approval is required.<br />
          <strong>Soft</strong> rule = warning only; the push goes through but the score drops.
        </div>
      </section>

      {/* Existing rules */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" /> Active rules
            <span className="text-xs text-muted-foreground">({rules.length})</span>
          </h2>
        </div>
        {rules.length === 0 ? (
          <div className="text-sm text-muted-foreground rounded-2xl border border-dashed border-border p-8 text-center">
            No ICP rules yet. Every lead will pass the ICP check by default — add at least one rule above to start qualifying.
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map((r) => (
              <RuleRow key={r.id} rule={r} onDelete={() => { removeIcpRule(r.id); refresh(); }} onChange={(p) => { updateIcpRule(r.id, p); refresh(); }} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RuleRow({ rule, onDelete, onChange }: { rule: IcpRule; onDelete: () => void; onChange: (p: Partial<IcpRule>) => void }) {
  const [local, setLocal] = useState(() => ({
    label: rule.label,
    value: Array.isArray(rule.value) ? rule.value.join(",") : String(rule.value),
    weight: rule.weight,
  }));

  function commit() {
    let value: IcpRule["value"];
    if (rule.op === "in" || rule.op === "not_in") {
      value = local.value.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (rule.op === "gte" || rule.op === "lte") {
      value = Number(local.value) || 0;
    } else if (rule.op === "between") {
      const [a, b] = local.value.split(",").map((s) => Number(s.trim()) || 0);
      value = [a, b];
    } else {
      value = local.value;
    }
    onChange({ label: local.label, value, weight: local.weight });
  }

  return (
    <div className="rounded-xl border border-border bg-background p-3 grid md:grid-cols-12 gap-2 items-center">
      <input value={local.label} onChange={(e) => setLocal({ ...local, label: e.target.value })} onBlur={commit} className="md:col-span-3 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm" />
      <code className="md:col-span-2 text-xs text-muted-foreground">{rule.field}</code>
      <span className="md:col-span-2 text-xs text-muted-foreground">{OPERATORS.find((o) => o.value === rule.op)?.label}</span>
      <input value={local.value} onChange={(e) => setLocal({ ...local, value: e.target.value })} onBlur={commit} className="md:col-span-3 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm" />
      <button
        onClick={() => { setLocal({ ...local, weight: local.weight === "hard" ? "soft" : "hard" }); onChange({ weight: local.weight === "hard" ? "soft" : "hard" }); }}
        className="md:col-span-1 text-xs px-2 py-1 rounded-full font-medium flex items-center justify-center gap-1"
        style={{ backgroundColor: local.weight === "hard" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", color: local.weight === "hard" ? "#dc2626" : "#b45309" }}
      >
        {local.weight === "hard" ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
        {local.weight}
      </button>
      <button onClick={onDelete} className="md:col-span-1 text-xs text-red-500 hover:bg-red-500/10 rounded-lg p-1.5 flex items-center justify-center">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
