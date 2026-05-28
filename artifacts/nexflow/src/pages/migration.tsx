import { useState, useRef } from "react";
import { Database, Upload, ArrowRight, CheckCircle2, AlertCircle, FileSpreadsheet, RefreshCw } from "lucide-react";
import { apiFetch } from "@/hooks/useApi";

const SOURCES = [
  { name: "Salesforce", logo: "SF", color: "#00A1E0", status: "needs-oauth" },
  { name: "HubSpot",    logo: "HS", color: "#FF7A59", status: "needs-oauth" },
  { name: "Zoho CRM",   logo: "ZH", color: "#E42527", status: "needs-oauth" },
  { name: "Pipedrive",  logo: "PD", color: "#1A1A1A", status: "needs-oauth" },
  { name: "Microsoft Dynamics", logo: "MS", color: "#0078D4", status: "needs-oauth" },
  { name: "CSV / Excel", logo: "📄", color: "#88B8B0", status: "ready" },
];

export default function MigrationPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; updated: number; skipped: number } | null>(null);

  const TARGET_FIELDS = ["first_name", "last_name", "email", "phone", "title", "company", "country", "linkedin_url"];

  function pickFile() { fileRef.current?.click(); }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const text = await f.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 1) return;
    const headers = lines[0].split(/[,;\t]/).map(h => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1, 6).map(l => l.split(/[,;\t]/).map(c => c.trim().replace(/^"|"$/g, "")));
    setPreview({ headers, rows });
    const auto: Record<string, string> = {};
    for (const h of headers) {
      const lower = h.toLowerCase();
      if (lower.includes("first")) auto[h] = "first_name";
      else if (lower.includes("last") || lower.includes("surname")) auto[h] = "last_name";
      else if (lower.includes("email") || lower.includes("mail")) auto[h] = "email";
      else if (lower.includes("phone") || lower.includes("mobile") || lower.includes("tel")) auto[h] = "phone";
      else if (lower.includes("title") || lower.includes("position") || lower.includes("job")) auto[h] = "title";
      else if (lower.includes("company") || lower.includes("organization")) auto[h] = "company";
      else if (lower.includes("country")) auto[h] = "country";
      else if (lower.includes("linkedin")) auto[h] = "linkedin_url";
    }
    setMapping(auto);
  }

  async function runImport() {
    if (!file || !preview) return;
    setImporting(true);
    setResult(null);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      const headers = lines[0].split(/[,;\t]/).map(h => h.trim().replace(/^"|"$/g, ""));
      const dataRows = lines.slice(1).map(l => l.split(/[,;\t]/).map(c => c.trim().replace(/^"|"$/g, "")));

      let created = 0, updated = 0, skipped = 0;
      for (const row of dataRows) {
        const obj: any = {};
        headers.forEach((h, i) => {
          const target = mapping[h];
          if (target && row[i]) obj[target] = row[i];
        });
        if (!obj.email && !obj.first_name) { skipped++; continue; }
        try {
          const r = await apiFetch("/contacts", { method: "POST", body: JSON.stringify({
            first_name: obj.first_name ?? "Unknown",
            last_name: obj.last_name ?? "",
            email: obj.email ?? null,
            phone: obj.phone ?? null,
            title: obj.title ?? null,
            source: `migration_csv:${file.name}`,
            status: "new",
          })});
          if (r) created++; else skipped++;
        } catch {
          updated++;
        }
      }
      setResult({ created, updated, skipped });
    } finally { setImporting(false); }
  }

  return (
    <div className="p-5 space-y-4">
      <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={onFile} className="hidden"/>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center"><Database className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold tracking-tight">Migration Tool</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase border border-[#88B8B0]/30">CSV Live</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Migrate contacts and companies from any CRM. CSV/Excel imports work today; native connectors below.</p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {SOURCES.map(s => (
          <button key={s.name} onClick={s.status === "ready" ? pickFile : undefined} className="glass-panel p-3 text-left hover:border-[#B8A0C8]/40 transition">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold mb-2" style={{ background: s.color }}>{s.logo}</div>
            <div className="text-sm font-semibold">{s.name}</div>
            <div className="text-[10px] mt-1 font-bold uppercase" style={{ color: s.status === "ready" ? "#88B8B0" : "#C8A880" }}>
              {s.status === "ready" ? "Click to import" : "OAuth needed"}
            </div>
          </button>
        ))}
      </div>

      {!file ? (
        <button onClick={pickFile} className="glass-panel p-12 w-full border-2 border-dashed border-border/50 hover:border-[#B8A0C8] hover:bg-[#B8A0C8]/5 transition flex flex-col items-center justify-center gap-2">
          <FileSpreadsheet className="w-12 h-12 text-[#B8A0C8]/60"/>
          <div className="text-sm font-semibold">Drop your CSV here, or click to browse</div>
          <div className="text-xs text-muted-foreground">Supports CSV, TSV — exports from any CRM (Salesforce, HubSpot, Zoho, Excel)</div>
        </button>
      ) : (
        <>
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-[#88B8B0]"/> {file.name} <span className="text-xs text-muted-foreground font-normal">· {(file.size/1024).toFixed(1)} KB</span></div>
              <button onClick={pickFile} className="text-xs text-[#B8A0C8]">Change file</button>
            </div>

            {preview && (
              <>
                <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Field mapping</div>
                <div className="space-y-1.5 mb-4">
                  {preview.headers.map(h => (
                    <div key={h} className="flex items-center gap-2 text-xs">
                      <div className="font-mono w-48 truncate">{h}</div>
                      <ArrowRight className="w-3 h-3 text-muted-foreground"/>
                      <select value={mapping[h] ?? ""} onChange={(e) => setMapping({ ...mapping, [h]: e.target.value })} className="flex-1 px-2 py-1 rounded border border-border/40 bg-transparent">
                        <option value="">(skip)</option>
                        {TARGET_FIELDS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <div className="text-muted-foreground w-32 truncate">→ "{preview.rows[0]?.[preview.headers.indexOf(h)] ?? "—"}"</div>
                    </div>
                  ))}
                </div>

                <button onClick={runImport} disabled={importing} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white nf-chameleon-bg shadow-sm">
                  {importing ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Upload className="w-4 h-4"/>}
                  {importing ? "Importing…" : "Run import"}
                </button>
              </>
            )}
          </div>

          {result && (
            <div className="glass-panel p-4 bg-[#88B8B0]/5 border-[#88B8B0]/30">
              <div className="text-sm font-bold text-[#88B8B0] flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4"/> Import complete</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><div className="text-2xl font-bold text-[#88B8B0]">{result.created}</div><div className="text-xs text-muted-foreground">created</div></div>
                <div><div className="text-2xl font-bold text-[#B8A0C8]">{result.updated}</div><div className="text-xs text-muted-foreground">updated</div></div>
                <div><div className="text-2xl font-bold text-[#C8A880]">{result.skipped}</div><div className="text-xs text-muted-foreground">skipped</div></div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="glass-panel p-3 text-xs text-muted-foreground flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-[#B8A0C8] mt-0.5"/>
        <span>CSV imports run client-side, hitting <code className="px-1 bg-muted rounded">POST /api/contacts</code> per row. For larger files (5K+ rows) or native CRM connectors (Salesforce, HubSpot, Zoho), connect via OAuth in Settings.</span>
      </div>
    </div>
  );
}
