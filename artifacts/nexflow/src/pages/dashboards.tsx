import { Link } from "wouter";
import { useDashboards, useCreate } from "@/hooks/useApi";
import { Plus, LayoutDashboard, User } from "lucide-react";
import { useState } from "react";

export default function DashboardsPage() {
  const { data, isLoading } = useDashboards();
  const create = useCreate("/dashboards", ["dashboards"]);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");

  const dashboards = data?.dashboards ?? [];

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboards</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Custom dashboards composed of metrics, funnels, leaderboards, and live charts.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New Dashboard
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-32 glass-card rounded-2xl animate-pulse" />) :
          dashboards.map((d: any) => (
            <Link key={d.id} href={`/dashboards/${d.id}`}>
              <div className="glass-card rounded-2xl p-5 hover:shadow-md cursor-pointer h-full">
                <div className="w-10 h-10 rounded-xl bg-[#B8A0C8]/15 text-[#B8A0C8] flex items-center justify-center mb-3">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div className="font-bold text-foreground">{d.name}</div>
                <p className="text-xs text-muted-foreground mt-1 mb-3 line-clamp-2">{d.description}</p>
                {d.is_shared && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#88B8B0]/15 text-[#88B8B0] font-bold">SHARED</span>}
              </div>
            </Link>
          ))
        }
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">New dashboard</h3>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Dashboard name" className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={() => { create.mutate({ name, description: "Custom dashboard" }, { onSuccess: () => { setShowNew(false); setName(""); } }); }} disabled={!name} className="flex-1 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
