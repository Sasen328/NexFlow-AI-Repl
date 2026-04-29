import { useState, useEffect } from "react";
import { Mail, Sparkles, Loader2, Check, AlertCircle, ArrowRight } from "lucide-react";
import { apiFetch } from "@/hooks/useApi";
import { useLocation } from "wouter";

const SAMPLE = `From: Sara Al-Mansouri <sara@gulfventures.sa>
To: Ahmed Al-Rashidi <ahmed@nexflow.ai>
Subject: Re: NexFlow proposal — pricing question

Hi Ahmed,

Thanks for sending the proposal yesterday. We reviewed it internally and are very interested. A few questions before we move forward:

1. Can you confirm if the SAR pricing includes Zatca e-invoice integration?
2. We'd like to start with 50 seats but plan to expand to 200 by Q3 — is there a volume discount?
3. Procurement needs SOC 2 + KSA PDPL documentation before signing.

If pricing works, we want to close this quarter. Can we schedule a call with our CFO next Tuesday?

Best,
Sara`;

export default function ActivityCapturePage() {
  const [, navigate] = useLocation();
  const [text, setText] = useState("");
  const [channel, setChannel] = useState("email");
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => { load(); }, []);
  async function load() {
    try { const r = await apiFetch<any>("/activity-capture/recent"); setRecent(r.items ?? []); } catch {}
  }

  async function parse() {
    if (!text.trim()) return;
    setParsing(true);
    setResult(null);
    try {
      const r = await apiFetch<any>("/activity-capture/parse", { method: "POST", body: JSON.stringify({ raw_text: text, channel })});
      setResult(r);
      load();
    } catch (err: any) { alert(err?.message ?? "Failed"); } finally { setParsing(false); }
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center"><Mail className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold tracking-tight">Activity Capture</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase border border-[#88B8B0]/30">Live · AI parser</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Paste any email, meeting notes, or call transcript — AI extracts who, what, intent signals, and next step. Auto-logs to the right contact.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 glass-panel p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Paste raw content</div>
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className="text-xs px-2 py-1 rounded border border-border/40 bg-transparent">
              {["email", "meeting", "call", "note"].map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={() => setText(SAMPLE)} className="text-xs text-[#B8A0C8] ml-auto">Load sample</button>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste email body, meeting transcript, call notes…" rows={14} className="w-full px-3 py-2 rounded-lg border border-border/40 bg-transparent text-sm font-mono"/>
          <button onClick={parse} disabled={parsing || !text.trim()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white nf-chameleon-bg disabled:opacity-50">
            {parsing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
            {parsing ? "Parsing…" : "Parse & log activity"}
          </button>
        </div>

        <div className="col-span-5">
          {!result ? (
            <div className="glass-panel p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Recent captures ({recent.length})</div>
              {recent.length === 0 ? <div className="text-sm text-muted-foreground py-6 text-center">Nothing captured yet.</div> :
              <div className="space-y-1.5 max-h-[480px] overflow-y-auto">
                {recent.map((r) => (
                  <div key={r.id} className="px-2 py-1.5 rounded hover:bg-muted/40 text-xs">
                    <div className="font-semibold truncate">{r.title}</div>
                    <div className="text-muted-foreground truncate">{r.body}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(r.completed_at ?? r.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>}
            </div>
          ) : (
            <div className="glass-panel p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#88B8B0]"/>
                <div className="text-sm font-bold">Activity logged</div>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#88B8B0]/15 text-[#88B8B0]">{result.parsed?.type}</span>
              </div>
              <div className="text-sm font-semibold">{result.parsed?.title}</div>
              <div className="text-xs text-muted-foreground">{result.parsed?.summary}</div>

              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">From</div>
                <div className="text-xs">{result.parsed?.from_name ?? "—"} <span className="text-muted-foreground">{result.parsed?.from_email ?? ""}</span></div>
              </div>

              {result.parsed?.intent_signals?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Intent signals</div>
                  <div className="flex flex-wrap gap-1">
                    {result.parsed.intent_signals.map((s: string, i: number) => (
                      <span key={i} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#B8A0C8]/15 text-[#B8A0C8]">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.parsed?.key_points?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Key points</div>
                  <ul className="text-xs space-y-0.5">{result.parsed.key_points.map((p: string, i: number) => <li key={i}>• {p}</li>)}</ul>
                </div>
              )}

              {result.parsed?.next_step && (
                <div className="bg-[#88B8B0]/10 border border-[#88B8B0]/30 rounded p-2">
                  <div className="text-[10px] font-bold text-[#88B8B0] uppercase mb-1">Next step</div>
                  <div className="text-xs">{result.parsed.next_step}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">in ~{result.parsed.suggested_followup_days ?? 3} days · sentiment: {result.parsed.sentiment}</div>
                </div>
              )}

              {result.contact_id ? (
                <button onClick={() => navigate(`/contacts/${result.contact_id}`)} className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded text-xs font-bold bg-[#B8A0C8]/15 text-[#B8A0C8]">
                  View contact <ArrowRight className="w-3 h-3"/>
                </button>
              ) : (
                <div className="text-xs text-muted-foreground flex items-center gap-1"><AlertCircle className="w-3 h-3"/> No matching contact found — activity logged unattached.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
