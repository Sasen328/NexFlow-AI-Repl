import { useState } from "react";
import {
  Workflow, Plus, Play, Pause, Sparkles, Zap, Clock, Mail, Phone, MessageSquare,
  GitBranch, Filter, Database, Bot, Bell, Target, ArrowRight, Save, Trash2,
  ChevronRight, Layers, Settings2, History, Eye, Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NodeType = "trigger" | "condition" | "action" | "delay" | "branch";
type Node = {
  id: string;
  type: NodeType;
  kind: string;
  label: string;
  config?: Record<string, any>;
  x: number;
  y: number;
};
type Edge = { from: string; to: string; label?: string };

const PALETTE: { type: NodeType; kind: string; label: string; icon: any; color: string }[] = [
  { type: "trigger",   kind: "form_submit",     label: "Form submitted",      icon: Mail,        color: "#88B8B0" },
  { type: "trigger",   kind: "score_threshold", label: "Lead score crosses",  icon: Target,      color: "#88B8B0" },
  { type: "trigger",   kind: "stage_change",    label: "Deal stage change",   icon: GitBranch,   color: "#88B8B0" },
  { type: "trigger",   kind: "signal",          label: "Buyer signal received", icon: Zap,        color: "#88B8B0" },
  { type: "condition", kind: "if_score",        label: "If lead score > X",   icon: Filter,      color: "#C8A880" },
  { type: "condition", kind: "if_industry",     label: "If industry equals",  icon: Filter,      color: "#C8A880" },
  { type: "condition", kind: "if_geo",          label: "If geography in",     icon: Filter,      color: "#C8A880" },
  { type: "delay",     kind: "wait",            label: "Wait for N hours",    icon: Clock,       color: "#90B8B8" },
  { type: "branch",    kind: "ab_split",        label: "A/B split",           icon: GitBranch,   color: "#B8B880" },
  { type: "action",    kind: "send_email",      label: "Send email",          icon: Mail,        color: "#B8A0C8" },
  { type: "action",    kind: "send_whatsapp",   label: "Send WhatsApp",       icon: MessageSquare, color: "#B8A0C8" },
  { type: "action",    kind: "ai_call",         label: "AI Voice call",       icon: Phone,       color: "#B8A0C8" },
  { type: "action",    kind: "assign_rep",      label: "Assign to rep",       icon: Bot,         color: "#B8A0C8" },
  { type: "action",    kind: "create_task",     label: "Create task",         icon: Bell,        color: "#B8A0C8" },
  { type: "action",    kind: "enrich",          label: "Enrich contact",      icon: Database,    color: "#B8A0C8" },
];

const TEMPLATES = [
  {
    id: "tpl-1", name: "Inbound MQL → AI qualification → Hot route", runs: 1247, success: 94,
    description: "Form submission triggers enrichment, AI scoring, then routes hot leads to AE in under 60 seconds.",
    nodes: [
      { id: "n1", type: "trigger" as NodeType,   kind: "form_submit",     label: "Demo form submitted",       x: 40,  y: 60 },
      { id: "n2", type: "action" as NodeType,    kind: "enrich",          label: "Enrich (Lusha + Crunchbase)", x: 280, y: 60 },
      { id: "n3", type: "action" as NodeType,    kind: "ai_call",         label: "AI score & qualify",        x: 540, y: 60 },
      { id: "n4", type: "condition" as NodeType, kind: "if_score",        label: "If score > 75",             x: 800, y: 60 },
      { id: "n5", type: "action" as NodeType,    kind: "assign_rep",      label: "Round-robin to AE",         x: 1060, y: 10 },
      { id: "n6", type: "action" as NodeType,    kind: "send_email",      label: "Nurture sequence",          x: 1060, y: 110 },
    ],
    edges: [
      { from: "n1", to: "n2" }, { from: "n2", to: "n3" }, { from: "n3", to: "n4" },
      { from: "n4", to: "n5", label: "yes" }, { from: "n4", to: "n6", label: "no" },
    ],
  },
  {
    id: "tpl-2", name: "No-show recovery sequence", runs: 412, success: 71,
    description: "Auto re-books missed meetings with apology + new slots within 5 minutes.",
    nodes: [
      { id: "n1", type: "trigger" as NodeType, kind: "signal",        label: "Meeting no-show",        x: 40,  y: 60 },
      { id: "n2", type: "delay" as NodeType,   kind: "wait",          label: "Wait 5 minutes",         x: 280, y: 60 },
      { id: "n3", type: "action" as NodeType,  kind: "send_whatsapp", label: "Apology + reschedule",   x: 540, y: 60 },
      { id: "n4", type: "action" as NodeType,  kind: "create_task",   label: "Manual follow-up task",  x: 800, y: 60 },
    ],
    edges: [{ from: "n1", to: "n2" }, { from: "n2", to: "n3" }, { from: "n3", to: "n4" }],
  },
  {
    id: "tpl-3", name: "Renewal motion (T-90 days)", runs: 156, success: 89,
    description: "Detects upcoming renewal, runs health check, alerts CSM, creates expansion opportunity.",
    nodes: [
      { id: "n1", type: "trigger" as NodeType,   kind: "score_threshold", label: "Renewal in ≤90 days",   x: 40,  y: 60 },
      { id: "n2", type: "condition" as NodeType, kind: "if_score",        label: "Health > 70?",          x: 280, y: 60 },
      { id: "n3", type: "action" as NodeType,    kind: "create_task",     label: "Expansion opp",         x: 540, y: 10 },
      { id: "n4", type: "action" as NodeType,    kind: "ai_call",         label: "CSM intervention",      x: 540, y: 110 },
    ],
    edges: [{ from: "n1", to: "n2" }, { from: "n2", to: "n3", label: "yes" }, { from: "n2", to: "n4", label: "no" }],
  },
];

const RUN_HISTORY = [
  { id: "r-1", workflow: "Inbound MQL → AI qualification", status: "success", contact: "Sara Al-Mansouri", time: "2m ago", duration: "1.2s" },
  { id: "r-2", workflow: "No-show recovery", status: "success", contact: "Hassan Jameel", time: "8m ago", duration: "0.8s" },
  { id: "r-3", workflow: "Inbound MQL → AI qualification", status: "skipped", contact: "Lina Boulos", time: "14m ago", duration: "0.3s" },
  { id: "r-4", workflow: "Renewal motion (T-90 days)", status: "success", contact: "Aramco Digital", time: "1h ago", duration: "2.1s" },
  { id: "r-5", workflow: "Inbound MQL → AI qualification", status: "failed", contact: "Unknown", time: "2h ago", duration: "0.4s" },
];

const NODE_TYPE_STYLE: Record<NodeType, { border: string; bg: string; text: string; label: string }> = {
  trigger:   { border: "border-[#88B8B0]/50", bg: "bg-[#88B8B0]/10", text: "text-[#88B8B0]", label: "TRIGGER" },
  condition: { border: "border-[#C8A880]/50", bg: "bg-[#C8A880]/10", text: "text-[#C8A880]", label: "CONDITION" },
  action:    { border: "border-[#B8A0C8]/50", bg: "bg-[#B8A0C8]/10", text: "text-[#B8A0C8]", label: "ACTION" },
  delay:     { border: "border-[#90B8B8]/50", bg: "bg-[#90B8B8]/10", text: "text-[#90B8B8]", label: "DELAY" },
  branch:    { border: "border-[#B8B880]/50", bg: "bg-[#B8B880]/10", text: "text-[#B8B880]", label: "BRANCH" },
};

export default function WorkflowsPage() {
  const [selectedTpl, setSelectedTpl] = useState(TEMPLATES[0]);
  const [nodes, setNodes] = useState<Node[]>(TEMPLATES[0].nodes);
  const [edges, setEdges] = useState<Edge[]>(TEMPLATES[0].edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isLive, setIsLive] = useState(true);

  function loadTemplate(tpl: typeof TEMPLATES[0]) {
    setSelectedTpl(tpl);
    setNodes(tpl.nodes);
    setEdges(tpl.edges);
    setSelectedNodeId(null);
  }

  function addNode(palItem: typeof PALETTE[0]) {
    const id = `n-${Date.now()}`;
    const lastNode = nodes[nodes.length - 1];
    const newNode: Node = {
      id, type: palItem.type, kind: palItem.kind, label: palItem.label,
      x: lastNode ? lastNode.x + 260 : 40, y: lastNode ? lastNode.y : 60,
    };
    setNodes([...nodes, newNode]);
    if (lastNode) setEdges([...edges, { from: lastNode.id, to: id }]);
    setSelectedNodeId(id);
  }

  function removeNode(id: string) {
    setNodes(nodes.filter((n) => n.id !== id));
    setEdges(edges.filter((e) => e.from !== id && e.to !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  }

  function getNodeIcon(node: Node) {
    return PALETTE.find((p) => p.kind === node.kind)?.icon ?? Layers;
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Visual Workflow Builder</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Drag-and-drop automations across leads, deals, calls, email, and AI agents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 hover:bg-muted/50 transition">
            <History className="w-3.5 h-3.5" /> Run history
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 hover:bg-muted/50 transition">
            <Save className="w-3.5 h-3.5" /> Save draft
          </button>
          <button className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm",
            isLive ? "bg-[#88B8B0]" : "bg-[#C8A880]"
          )} onClick={() => setIsLive(!isLive)}>
            {isLive ? <><Play className="w-3.5 h-3.5 fill-current" /> Live</> : <><Pause className="w-3.5 h-3.5" /> Paused</>}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Active workflows", value: "12", trend: "+3 this week", color: "#88B8B0" },
          { label: "Runs (24h)", value: "1,847", trend: "+24%", color: "#B8A0C8" },
          { label: "Avg success rate", value: "91%", trend: "+2.4pt", color: "#C8A880" },
          { label: "Time saved", value: "247h", trend: "this month", color: "#B8B880" },
        ].map((s) => (
          <div key={s.label} className="glass-panel rounded-xl p-3.5">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">{s.label}</div>
            <div className="flex items-baseline justify-between mt-1.5">
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.trend}</div>
            </div>
          </div>
        ))}
      </div>

      {/* AI assist */}
      <div className="glass-panel rounded-xl p-3.5 border border-[#B8A0C8]/30 bg-[#B8A0C8]/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg nf-chameleon-bg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-[#B8A0C8] mb-1">AI WORKFLOW DESIGNER</div>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe the automation in plain English… e.g. ‘when a Saudi enterprise lead scores >80, AI-call them in Arabic, then alert account manager on WhatsApp’"
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground/70 focus:outline-none"
            />
          </div>
          <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg shadow-sm">
            Generate
          </button>
        </div>
      </div>

      {/* Main grid: templates | canvas | inspector */}
      <div className="grid grid-cols-12 gap-4">
        {/* Templates / Library */}
        <div className="col-span-3 space-y-3">
          <div className="glass-panel rounded-xl p-3">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Templates</div>
            <div className="space-y-1.5">
              {TEMPLATES.map((tpl) => (
                <button key={tpl.id} onClick={() => loadTemplate(tpl)} className={cn(
                  "w-full text-left p-2.5 rounded-lg border transition",
                  selectedTpl.id === tpl.id ? "border-[#B8A0C8]/60 bg-[#B8A0C8]/10" : "border-border/30 hover:bg-muted/40"
                )}>
                  <div className="text-xs font-semibold leading-tight">{tpl.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{tpl.description}</div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    <span>{tpl.runs.toLocaleString()} runs</span>
                    <span className="text-[#88B8B0] font-semibold">{tpl.success}% success</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-3">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Node library</div>
            <div className="space-y-2">
              {(["trigger", "condition", "delay", "branch", "action"] as NodeType[]).map((t) => (
                <div key={t}>
                  <div className={cn("text-[10px] font-bold mb-1", NODE_TYPE_STYLE[t].text)}>{NODE_TYPE_STYLE[t].label}</div>
                  <div className="space-y-1">
                    {PALETTE.filter((p) => p.type === t).map((p) => {
                      const Icon = p.icon;
                      return (
                        <button key={p.kind} onClick={() => addNode(p)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] hover:bg-muted/50 text-foreground/80 transition">
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: p.color }} />
                          <span className="truncate text-left flex-1">{p.label}</span>
                          <Plus className="w-3 h-3 text-muted-foreground/60" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="col-span-6">
          <div className="glass-panel rounded-xl p-3 h-[560px] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-bold">{selectedTpl.name}</div>
                <div className="text-[10px] text-muted-foreground">{nodes.length} nodes · {edges.length} connections</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground"><Eye className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground"><Copy className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="flex-1 rounded-lg bg-muted/20 border border-border/30 overflow-auto relative" style={{
              backgroundImage: "radial-gradient(circle, rgba(180,180,200,0.15) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}>
              <svg className="absolute inset-0" style={{ width: 1400, height: 480 }}>
                {edges.map((e, i) => {
                  const from = nodes.find((n) => n.id === e.from);
                  const to = nodes.find((n) => n.id === e.to);
                  if (!from || !to) return null;
                  const x1 = from.x + 200;
                  const y1 = from.y + 30;
                  const x2 = to.x;
                  const y2 = to.y + 30;
                  const mx = (x1 + x2) / 2;
                  return (
                    <g key={i}>
                      <path d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                        fill="none" stroke="#B8A0C8" strokeWidth={2} strokeOpacity={0.5} markerEnd="url(#arrow)" />
                      {e.label && (
                        <g transform={`translate(${mx}, ${(y1 + y2) / 2})`}>
                          <rect x={-12} y={-9} width={24} height={16} rx={4} fill="#1a1a1a" stroke="#B8A0C8" strokeOpacity={0.4} />
                          <text textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#B8A0C8" fontWeight="600">{e.label}</text>
                        </g>
                      )}
                    </g>
                  );
                })}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#B8A0C8" opacity="0.6" />
                  </marker>
                </defs>
              </svg>
              {nodes.map((node) => {
                const Icon = getNodeIcon(node);
                const style = NODE_TYPE_STYLE[node.type];
                const isSelected = selectedNodeId === node.id;
                return (
                  <div key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={cn(
                      "absolute w-[200px] rounded-lg border-2 px-3 py-2 cursor-pointer transition shadow-sm",
                      style.border, style.bg,
                      isSelected ? "ring-2 ring-offset-2 ring-offset-background ring-[#B8A0C8]" : ""
                    )}
                    style={{ left: node.x, top: node.y }}>
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-4 h-4 flex-shrink-0", style.text)} />
                      <div className="flex-1 min-w-0">
                        <div className={cn("text-[9px] font-bold uppercase tracking-wide", style.text)}>{style.label}</div>
                        <div className="text-xs font-semibold truncate">{node.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Inspector + history */}
        <div className="col-span-3 space-y-3">
          <div className="glass-panel rounded-xl p-3">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Inspector</div>
            {selectedNode ? (
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Label</div>
                  <input className="w-full text-xs px-2 py-1.5 rounded-md bg-muted/40 border border-border/40 focus:border-[#B8A0C8]/60 focus:outline-none"
                    value={selectedNode.label} readOnly />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Type</div>
                  <div className={cn("text-[10px] inline-block px-2 py-0.5 rounded-md font-bold", NODE_TYPE_STYLE[selectedNode.type].bg, NODE_TYPE_STYLE[selectedNode.type].text)}>
                    {NODE_TYPE_STYLE[selectedNode.type].label}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Configuration</div>
                  <div className="text-xs p-2 rounded-md bg-muted/30 border border-border/30 text-muted-foreground">
                    Click to configure parameters for this {selectedNode.type}.
                  </div>
                </div>
                <button onClick={() => removeNode(selectedNode.id)} className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-[#C0A0B8] hover:bg-[#C0A0B8]/10 transition">
                  <Trash2 className="w-3.5 h-3.5" /> Remove node
                </button>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground text-center py-6">
                <Settings2 className="w-6 h-6 mx-auto mb-2 opacity-30" />
                Select a node to inspect.
              </div>
            )}
          </div>

          <div className="glass-panel rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Recent runs</div>
              <button className="text-[10px] text-[#B8A0C8] hover:underline">view all</button>
            </div>
            <div className="space-y-1.5">
              {RUN_HISTORY.map((r) => (
                <div key={r.id} className="text-[11px] p-2 rounded-md hover:bg-muted/40 cursor-pointer">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full",
                      r.status === "success" ? "bg-[#88B8B0]" :
                      r.status === "failed" ? "bg-[#C0A0B8]" : "bg-[#C8A880]")} />
                    <span className="font-semibold truncate flex-1">{r.contact}</span>
                    <span className="text-muted-foreground">{r.time}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground ml-3 truncate">
                    {r.workflow} · {r.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
