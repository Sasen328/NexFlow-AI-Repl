import { useEffect, useState } from "react";
import { FileText, Eye, MousePointer2, Copy, AlertCircle, Activity, Clock } from "lucide-react";
import { apiFetch } from "@/hooks/useApi";

export default function DocumentTrackingPage() {
  const [opens, setOpens] = useState<any[]>([]);
  const [clicks, setClicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try {
      const o = await apiFetch<{ activities: any[] }>("/activities?type=email_open&limit=30");
      const c = await apiFetch<{ activities: any[] }>("/activities?type=email_click&limit=30");
      setOpens(o.activities ?? []);
      setClicks(c.activities ?? []);
    } finally { setLoading(false); }
  }

  function pixelUrl(contactId: string) {
    return `${window.location.origin}/api/tracking/pixel?c=${contactId}`;
  }

  function snippet() {
    return `<!-- Insert at the bottom of your HTML quote/proposal -->
<img src="${window.location.origin}/api/tracking/pixel?c=CONTACT_ID&cm=DOC_ID" width="1" height="1" alt="">

<!-- For tracked links -->
<a href="${window.location.origin}/api/tracking/click?c=CONTACT_ID&u=https://nexflow.app/quote/abc">View quote</a>`;
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center"><FileText className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold tracking-tight">Document Tracking</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase border border-[#88B8B0]/30">Live</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Embed a tracking pixel into quotes, proposals, and PDFs — see exactly when prospects open and click.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="OPENS (30d)" value={opens.length} accent="#88B8B0" icon={Eye}/>
        <Stat label="CLICKS (30d)" value={clicks.length} accent="#B8A0C8" icon={MousePointer2}/>
        <Stat label="CTR" value={opens.length ? `${Math.round((clicks.length/opens.length)*100)}%` : "—"} accent="#C8A880" icon={Activity}/>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 glass-panel p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
            <div className="text-sm font-bold">Recent opens & clicks</div>
            <button onClick={load} className="text-xs text-muted-foreground hover:text-foreground">Refresh</button>
          </div>
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading…</div>
          ) : (opens.length + clicks.length) === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No tracking events yet. Embed the pixel snippet → in your next sent quote to see live opens.</div>
          ) : (
            <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
              {[...opens.map(o => ({...o, _kind: "open"})), ...clicks.map(c => ({...c, _kind: "click"}))]
                .sort((a,b) => new Date(b.completed_at ?? b.created_at).getTime() - new Date(a.completed_at ?? a.created_at).getTime())
                .slice(0, 30).map((e) => (
                <div key={e.id} className="px-4 py-2 hover:bg-muted/40 flex items-center gap-2 text-xs">
                  {e._kind === "open" ? <Eye className="w-3.5 h-3.5 text-[#88B8B0]"/> : <MousePointer2 className="w-3.5 h-3.5 text-[#B8A0C8]"/>}
                  <div className="flex-1">
                    <div className="font-semibold">{e.title}</div>
                    <div className="text-muted-foreground">{e.body ?? (e.metadata?.campaign_id ? `campaign ${e.metadata.campaign_id.slice(0,8)}` : "—")}</div>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3"/>{new Date(e.completed_at ?? e.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-5 glass-panel p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Embed snippet</div>
          <div className="text-xs mb-2">Paste this at the bottom of any HTML document or email template. Replace <code className="px-1 bg-muted rounded">CONTACT_ID</code> and <code className="px-1 bg-muted rounded">DOC_ID</code>.</div>
          <pre className="bg-muted/40 rounded p-3 text-[11px] overflow-x-auto whitespace-pre-wrap">{snippet()}</pre>
          <button onClick={() => { navigator.clipboard.writeText(snippet()); alert("Copied!"); }} className="mt-2 flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold text-white nf-chameleon-bg">
            <Copy className="w-3 h-3"/> Copy snippet
          </button>
        </div>
      </div>

      <div className="glass-panel p-3 text-xs text-muted-foreground flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-[#B8A0C8] mt-0.5"/>
        <span>Pixel hits create <code className="px-1 bg-muted rounded">email_open</code> activities and refresh the contact's last_engaged_at — feeding directly into Health Scores and Account Hub engagement heatmaps.</span>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, icon: Icon }: any) {
  return (
    <div className="glass-panel p-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${accent}15`, color: accent }}><Icon className="w-5 h-5"/></div>
      <div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-bold" style={{ color: accent }}>{value}</div>
      </div>
    </div>
  );
}
