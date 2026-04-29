import { useState } from "react";
import { Lock, Plus, Save, Users, Eye, EyeOff, Edit3 } from "lucide-react";

const ROLES = ["Admin", "Sales Manager", "AE", "SDR", "CSM", "Finance", "Read-only"];
const FIELDS = [
  { key: "deal.value",        label: "Deal value" },
  { key: "deal.probability",  label: "Win probability" },
  { key: "contact.email",     label: "Contact email" },
  { key: "contact.phone",     label: "Contact mobile" },
  { key: "company.revenue",   label: "Company revenue" },
  { key: "quote.discount",    label: "Quote discount" },
  { key: "call.recording",    label: "Call recording URL" },
  { key: "user.commission",   label: "User commission %" },
];

const DEFAULTS: Record<string, Record<string, "edit" | "view" | "hidden">> = {
  Admin:           Object.fromEntries(FIELDS.map(f => [f.key, "edit"])),
  "Sales Manager": Object.fromEntries(FIELDS.map(f => [f.key, "edit"])),
  AE:              Object.fromEntries(FIELDS.map(f => [f.key, f.key.includes("commission") ? "hidden" : f.key.includes("discount") ? "view" : "edit"])),
  SDR:             Object.fromEntries(FIELDS.map(f => [f.key, f.key.includes("value") || f.key.includes("commission") || f.key.includes("recording") ? "hidden" : "view"])),
  CSM:             Object.fromEntries(FIELDS.map(f => [f.key, f.key.includes("value") || f.key.includes("discount") ? "view" : "edit"])),
  Finance:         Object.fromEntries(FIELDS.map(f => [f.key, "view"])),
  "Read-only":     Object.fromEntries(FIELDS.map(f => [f.key, "view"])),
};

const APPROVAL_RULES = [
  { name: "Discount > 20%",          requires: "Sales Manager",     active: true },
  { name: "Quote > $250K",           requires: "VP Sales",          active: true },
  { name: "Custom MSA terms",        requires: "Legal + VP Sales",  active: true },
  { name: "Refund > $5K",            requires: "Finance",           active: true },
  { name: "Delete contact",          requires: "Admin",             active: true },
  { name: "Bulk export > 1000 rows", requires: "Admin",             active: false },
];

export default function PermissionsPage() {
  const [matrix, setMatrix] = useState(DEFAULTS);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function set(role: string, field: string, mode: "edit" | "view" | "hidden") {
    setMatrix({ ...matrix, [role]: { ...matrix[role], [field]: mode } });
  }

  function save() {
    localStorage.setItem("nf-permissions", JSON.stringify(matrix));
    setSavedAt(new Date().toLocaleTimeString());
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center"><Lock className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold tracking-tight">Field Permissions & Approvals</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase border border-[#88B8B0]/30">Functional</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Field-level visibility per role + approval workflows for high-value actions. Click a cell to toggle.</p>
        </div>
        <button onClick={save} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg shadow-sm">
          <Save className="w-3.5 h-3.5"/> Save matrix
        </button>
      </div>
      {savedAt && <div className="glass-panel p-2 bg-[#88B8B0]/10 border-[#88B8B0]/30 text-xs text-[#88B8B0]">✓ Saved at {savedAt}</div>}

      <div className="glass-panel p-0 overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left px-3 py-2 font-bold">Field</th>
              {ROLES.map(r => <th key={r} className="text-center px-2 py-2 font-bold">{r}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {FIELDS.map(f => (
              <tr key={f.key} className="hover:bg-muted/20">
                <td className="px-3 py-2 font-semibold">{f.label}<div className="text-[10px] text-muted-foreground font-mono">{f.key}</div></td>
                {ROLES.map(r => {
                  const mode = matrix[r]?.[f.key] ?? "view";
                  const colors = { edit: "#88B8B0", view: "#B8A0C8", hidden: "#C0A0B8" };
                  const icons = { edit: Edit3, view: Eye, hidden: EyeOff };
                  const Icon = icons[mode];
                  return (
                    <td key={r} className="text-center px-2 py-2">
                      <button onClick={() => {
                        const next = mode === "edit" ? "view" : mode === "view" ? "hidden" : "edit";
                        set(r, f.key, next);
                      }} className="inline-flex items-center gap-1 px-2 py-1 rounded font-bold text-[10px] uppercase" style={{ background: `${colors[mode]}20`, color: colors[mode] }}>
                        <Icon className="w-3 h-3"/> {mode}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-panel p-4">
        <div className="text-sm font-bold mb-3 flex items-center gap-2"><Users className="w-4 h-4"/> Approval workflows</div>
        <div className="space-y-2">
          {APPROVAL_RULES.map(r => (
            <div key={r.name} className="flex items-center justify-between p-2 rounded border border-border/30">
              <div>
                <div className="text-sm font-semibold">{r.name}</div>
                <div className="text-xs text-muted-foreground">Requires approval from: <b>{r.requires}</b></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked={r.active}/>
                <span className="text-xs font-bold uppercase" style={{ color: r.active ? "#88B8B0" : "#C0A0B8" }}>{r.active ? "Active" : "Off"}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
