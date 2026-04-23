import { useState } from "react";
import {
  Zap, Mail, Phone, CalendarCheck, FileText, ArrowRight, Plus,
  CheckCircle2, Clock, Brain, MessageSquare, Bell, TrendingUp,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Rule {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  enabled: boolean;
  runs: number;
  category: string;
}

const DEFAULT_RULES: Rule[] = [
  {
    id: "r1", enabled: true, runs: 47, category: "calls",
    name: "Post-Call Notes & Summary",
    trigger: "Call ends (status = completed)",
    actions: ["AI generates call summary", "Save to contact notes", "Create follow-up task", "Log to activity timeline"],
  },
  {
    id: "r2", enabled: true, runs: 23, category: "calls",
    name: "Meeting Auto-Notes",
    trigger: "Meeting activity marked complete",
    actions: ["AI drafts meeting notes", "Extract action items", "Assign tasks to owner", "Send recap via email"],
  },
  {
    id: "r3", enabled: true, runs: 31, category: "email",
    name: "Post-Call Follow-Up Email",
    trigger: "Call score ≥ 70 AND sentiment = positive",
    actions: ["AI writes personalized follow-up", "Insert proposal link", "Schedule send 2h after call", "Log in activities"],
  },
  {
    id: "r4", enabled: false, runs: 8, category: "deals",
    name: "Lead Stage Advancement",
    trigger: "Lead score crosses 80 threshold",
    actions: ["Move deal to Qualified stage", "Notify assigned rep", "Send intro email", "Create demo task"],
  },
  {
    id: "r5", enabled: true, runs: 19, category: "deals",
    name: "Deal Stall Alert",
    trigger: "Deal not updated in 7 days",
    actions: ["Create nudge notification", "Send rep reminder", "AI suggest next action", "Log stall event"],
  },
  {
    id: "r6", enabled: true, runs: 12, category: "ai",
    name: "Daily Briefing Generation",
    trigger: "Every day at 7:00 AM (Riyadh time)",
    actions: ["AI reviews pipeline changes", "Surface top 3 priorities", "Identify at-risk deals", "Send briefing notification"],
  },
  {
    id: "r7", enabled: false, runs: 0, category: "email",
    name: "Arabic Outreach Sequence",
    trigger: "Contact tag = arabic AND status = new",
    actions: ["Enroll in Arabic email sequence", "Send greeting in MSA Arabic", "Wait 2 days → follow-up", "Assign to Arabic-speaking rep"],
  },
  {
    id: "r8", enabled: true, runs: 34, category: "ai",
    name: "Signal Alert → WhatsApp",
    trigger: "High-score signal detected (score > 80)",
    actions: ["Identify relevant rep", "Draft WhatsApp message", "Queue for rep approval", "Send after approval"],
  },
];

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  calls: { label: "Calls", color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/15", icon: Phone },
  email: { label: "Email", color: "text-[#B8A0C8]", bg: "bg-[#B8A0C8]/15", icon: Mail },
  deals: { label: "Deals", color: "text-[#C8A880]", bg: "bg-[#C8A880]/15", icon: TrendingUp },
  ai: { label: "AI", color: "text-[#B8B880]", bg: "bg-[#B8B880]/15", icon: Brain },
};

const TRIGGER_TEMPLATES = [
  "Call ends (status = completed)",
  "Meeting activity marked complete",
  "Lead score crosses 80",
  "Deal stage changes",
  "Signal detected (score > 70)",
  "Contact status changes to qualified",
  "Deal not updated in 7 days",
  "Every day at 7:00 AM",
  "WhatsApp message received",
];

export default function AutomationPage() {
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [newRule, setNewRule] = useState({ name: "", trigger: "", category: "calls" });

  const filtered = filter === "all" ? rules : rules.filter(r => r.category === filter);
  const enabledCount = rules.filter(r => r.enabled).length;
  const totalRuns = rules.reduce((a, r) => a + r.runs, 0);

  function toggleRule(id: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }

  function addRule() {
    if (!newRule.name || !newRule.trigger) return;
    const r: Rule = {
      id: `r${Date.now()}`,
      name: newRule.name,
      trigger: newRule.trigger,
      actions: ["AI processes trigger", "Send notification", "Log event"],
      enabled: true, runs: 0,
      category: newRule.category,
    };
    setRules(prev => [...prev, r]);
    setNewRule({ name: "", trigger: "", category: "calls" });
    setShowNew(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#B8B880]" />
            Automation Center
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Trigger-based workflows for calls, emails, tasks, and deal stages</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Rules", value: enabledCount, color: "#88B8B0", icon: CheckCircle2 },
          { label: "Total Runs", value: totalRuns, color: "#B8A0C8", icon: Zap },
          { label: "Call Automations", value: rules.filter(r => r.category === "calls" && r.enabled).length, color: "#90B8B8", icon: Phone },
          { label: "Email Automations", value: rules.filter(r => r.category === "email" && r.enabled).length, color: "#C8A880", icon: Mail },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* New Rule Form */}
      {showNew && (
        <div className="glass-card rounded-2xl p-5 nf-chameleon-border">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Automation Rule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Rule Name</label>
              <input
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm text-foreground outline-none focus:border-[#B8A0C8]"
                placeholder="e.g. Post-Call Summary"
                value={newRule.name}
                onChange={e => setNewRule(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Trigger</label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm text-foreground outline-none"
                value={newRule.trigger}
                onChange={e => setNewRule(p => ({ ...p, trigger: e.target.value }))}
              >
                <option value="">Select trigger...</option>
                {TRIGGER_TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm text-foreground outline-none"
                value={newRule.category}
                onChange={e => setNewRule(p => ({ ...p, category: e.target.value }))}
              >
                {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addRule} className="px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              Create Rule
            </button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-xl bg-muted/60 text-muted-foreground text-sm hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[{ key: "all", label: "All Rules" }, ...Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              filter === f.key ? "nf-chameleon-bg text-white" : "bg-muted/50 text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {filtered.map(rule => {
          const cat = CATEGORY_CONFIG[rule.category] ?? CATEGORY_CONFIG.ai;
          const Icon = cat.icon;
          const isExp = expanded === rule.id;
          return (
            <div key={rule.id} className={cn("glass-card rounded-2xl overflow-hidden transition-all", rule.enabled ? "" : "opacity-60")}>
              <div className="flex items-center gap-4 p-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cat.bg)}>
                  <Icon className={cn("w-5 h-5", cat.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{rule.name}</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", cat.bg, cat.color)}>{cat.label}</span>
                    {rule.enabled && <span className="text-xs px-1.5 py-0.5 rounded bg-[#88B8B0]/15 text-[#88B8B0] font-medium">Active</span>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {rule.trigger}
                  </div>
                </div>
                <div className="text-center flex-shrink-0 hidden md:block">
                  <div className="text-sm font-bold text-foreground">{rule.runs}</div>
                  <div className="text-[10px] text-muted-foreground">runs</div>
                </div>
                <button onClick={() => toggleRule(rule.id)} className="flex-shrink-0 transition-all">
                  {rule.enabled
                    ? <ToggleRight className="w-8 h-8 text-[#88B8B0]" />
                    : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
                </button>
                <button onClick={() => setExpanded(isExp ? null : rule.id)} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                  {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExp && (
                <div className="px-4 pb-4 border-t border-border/20">
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-muted-foreground mb-2">ACTIONS ({rule.actions.length})</div>
                    <div className="space-y-1.5">
                      {rule.actions.map((action, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-foreground/70">
                          <div className="w-5 h-5 rounded-full bg-[#B8A0C8]/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[#B8A0C8]">
                            {i + 1}
                          </div>
                          <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          {action}
                        </div>
                      ))}
                    </div>
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
