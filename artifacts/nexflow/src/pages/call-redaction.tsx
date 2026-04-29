import { useState } from "react";
import { Shield, Loader2, AlertCircle, Check } from "lucide-react";
import { apiFetch } from "@/hooks/useApi";

const SAMPLE = `Customer: Hi, I'd like to upgrade my plan. My card is 4242 4242 4242 4242, expires 12/27, cvv 123.
Agent: Got it. Can I confirm your iqama 1234567890 and IBAN SA0380000000608010167519?
Customer: Yes. Email me the receipt at sara@gulfventures.sa or call +966 50 123 4567.
Agent: Done. Your SSN on file is 123-45-6789, correct?`;

export default function CallRedactionPage() {
  const [text, setText] = useState(SAMPLE);
  const [enabled, setEnabled] = useState({
    credit_card: true, ssn: true, iqama: true, iban_sa: true, iban_ae: true, email: false, phone_intl: true, cvv: true,
  });
  const [result, setResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);

  async function scan() {
    setScanning(true);
    try {
      const r = await apiFetch<any>("/redaction/scan", { method: "POST", body: JSON.stringify({ text }) });
      setResult(r);
    } finally { setScanning(false); }
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center"><Shield className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold tracking-tight">Call Recording Redaction</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase border border-[#88B8B0]/30">Live · PCI/PII</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Auto-redact PCI cards, IBANs, iqama numbers, SSNs, emails, and phone numbers from call transcripts before storage. PCI DSS + KSA PDPL compliant.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Object.entries(enabled).map(([k,v]) => (
          <label key={k} className="glass-panel p-2 flex items-center gap-2 cursor-pointer text-xs">
            <input type="checkbox" checked={v} onChange={(e) => setEnabled({...enabled, [k]: e.target.checked})}/>
            <span className="font-semibold">{k.replace("_", " ")}</span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Original transcript</div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} className="w-full px-3 py-2 rounded-lg border border-border/40 bg-transparent text-sm font-mono"/>
          <button onClick={scan} disabled={scanning} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white nf-chameleon-bg disabled:opacity-50">
            {scanning ? <Loader2 className="w-4 h-4 animate-spin"/> : <Shield className="w-4 h-4"/>}
            Scan & redact
          </button>
        </div>

        <div className="glass-panel p-4 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Redacted output</div>
          {!result ? (
            <div className="text-sm text-muted-foreground py-12 text-center">Click "Scan & redact" to run.</div>
          ) : (
            <>
              <div className="bg-muted/30 rounded p-3 text-sm font-mono whitespace-pre-wrap">{result.redacted}</div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Findings ({result.pii_score} PII items)</div>
                {result.findings.length === 0 ? (
                  <div className="text-sm text-[#88B8B0] flex items-center gap-1"><Check className="w-4 h-4"/> No PII detected</div>
                ) : result.findings.map((f: any) => (
                  <div key={f.pattern} className="flex justify-between text-xs px-2 py-1 rounded bg-[#C0A0B8]/10">
                    <span className="font-semibold">{f.pattern.replace("_", " ")}</span>
                    <span className="font-bold text-[#C0A0B8]">{f.matches} found</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="glass-panel p-3 text-xs text-muted-foreground flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-[#B8A0C8] mt-0.5"/>
        <span><b className="text-foreground">Compliance:</b> Card numbers (PCI DSS Req 3.3), iqama/IBAN (KSA PDPL Article 18), SSN (HIPAA-style). Run on every call recording before storage. Redacted output is what your AI agents and analytics see.</span>
      </div>
    </div>
  );
}
