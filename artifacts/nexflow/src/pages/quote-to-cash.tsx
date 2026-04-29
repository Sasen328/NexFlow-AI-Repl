import { CreditCard, FileText, CheckCircle2, Clock, AlertCircle, ArrowRight, Banknote } from "lucide-react";

const PROVIDERS = [
  { name: "Stripe",   region: "Global",       fee: "2.9% + $0.30", currencies: ["USD", "EUR", "AED", "SAR"], status: "available", color: "#635BFF" },
  { name: "Tap",      region: "GCC",          fee: "2.5%",          currencies: ["SAR", "AED", "KWD", "BHD", "QAR", "OMR"], status: "available", color: "#3B7DDD" },
  { name: "HyperPay", region: "MENA",         fee: "2.4%",          currencies: ["SAR", "AED", "EGP", "JOD"], status: "available", color: "#FF8C00" },
  { name: "PayTabs",  region: "GCC + Egypt",  fee: "2.7%",          currencies: ["SAR", "AED", "EGP", "OMR"], status: "available", color: "#0F4C81" },
  { name: "Mada",     region: "Saudi",        fee: "1.0%",          currencies: ["SAR"], status: "available", color: "#0066CC" },
  { name: "Apple Pay",region: "Global",       fee: "Provider fees", currencies: ["—"], status: "available", color: "#000000" },
];

const QUOTES = [
  { id: "Q-2026-0142", customer: "NEOM Tech",        amount: 156_000, currency: "SAR", status: "paid",     paid_at: "Today 09:42", method: "Tap · Mada" },
  { id: "Q-2026-0141", customer: "Aramco Digital",   amount: 84_500,  currency: "USD", status: "viewed",   paid_at: null, method: null },
  { id: "Q-2026-0140", customer: "Emirates BG",      amount: 38_900,  currency: "AED", status: "sent",     paid_at: null, method: null },
  { id: "Q-2026-0139", customer: "Doha Petroleum",   amount: 22_000,  currency: "QAR", status: "paid",     paid_at: "Yesterday", method: "PayTabs · Visa" },
  { id: "Q-2026-0138", customer: "Bahrain National", amount: 14_700,  currency: "BHD", status: "expired",  paid_at: null, method: null },
];

const STATUS = { paid: "#88B8B0", viewed: "#B8A0C8", sent: "#B8B880", expired: "#C0A0B8" } as Record<string, string>;

export default function QuoteToCashPage() {
  const totalSent = QUOTES.reduce((s,q) => s + q.amount, 0);
  const totalPaid = QUOTES.filter(q => q.status === "paid").reduce((s,q) => s + q.amount, 0);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center"><CreditCard className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold tracking-tight">Quote-to-Cash</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#C8A880]/15 text-[#C8A880] text-[10px] font-bold uppercase border border-[#C8A880]/30">Demo · Provider connect required</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Send quote → customer pays online → deal advances to closed-won. GCC-native payment providers.</p>
        </div>
      </div>

      <div className="glass-panel p-3 bg-[#C8A880]/10 border-[#C8A880]/30 flex items-start gap-3 text-xs">
        <AlertCircle className="w-4 h-4 text-[#C8A880] mt-0.5 flex-shrink-0"/>
        <div><b className="text-foreground">Connect a payment provider to accept real payments.</b> The flow below is wired and ready — just add credentials for Tap, HyperPay, Stripe, or PayTabs in Settings → Integrations.</div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Stat label="QUOTES SENT (30d)" value={QUOTES.length} accent="#B8A0C8"/>
        <Stat label="TOTAL VALUE" value={`${(totalSent/1000).toFixed(0)}K`} accent="#C8A880"/>
        <Stat label="COLLECTED" value={`${(totalPaid/1000).toFixed(0)}K`} accent="#88B8B0"/>
        <Stat label="CONVERSION" value={`${Math.round((QUOTES.filter(q => q.status === "paid").length/QUOTES.length)*100)}%`} accent="#90B8B8"/>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 glass-panel p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 text-sm font-bold">Recent quotes</div>
          <div className="divide-y divide-border/30">
            {QUOTES.map(q => (
              <div key={q.id} className="px-4 py-3 hover:bg-muted/40 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#B8A0C8]/15 text-[#B8A0C8] flex items-center justify-center"><FileText className="w-4 h-4"/></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">{q.id}</div>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: `${STATUS[q.status]}20`, color: STATUS[q.status] }}>{q.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{q.customer} · {q.method ?? "awaiting payment"}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{q.amount.toLocaleString()} {q.currency}</div>
                  <div className="text-[11px] text-muted-foreground">{q.paid_at ?? "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-5 glass-panel p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">Payment providers</div>
          <div className="space-y-2">
            {PROVIDERS.map(p => (
              <div key={p.name} className="flex items-center gap-3 p-2 rounded border border-border/30">
                <div className="w-8 h-8 rounded font-bold flex items-center justify-center text-white text-[10px]" style={{ background: p.color }}>{p.name.slice(0,2)}</div>
                <div className="flex-1">
                  <div className="text-xs font-semibold">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground">{p.region} · {p.fee} · {p.currencies.slice(0,4).join(", ")}{p.currencies.length > 4 ? "+" : ""}</div>
                </div>
                <button className="text-[10px] font-bold px-2 py-1 rounded bg-[#88B8B0]/15 text-[#88B8B0] border border-[#88B8B0]/30">Connect</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">Quote → Cash flow</div>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {[
            { label: "Build quote", done: true },
            { label: "Send via email/WhatsApp", done: true },
            { label: "Customer reviews", done: true },
            { label: "Pays online (mada / card / Apple Pay)", done: true },
            { label: "Webhook → mark deal closed-won", done: true },
            { label: "Receipt + Zatca e-invoice generated", done: true },
            { label: "Activity logged + revenue forecast updated", done: true },
          ].map((s,i,arr) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2 py-1 rounded bg-[#88B8B0]/10 text-[#88B8B0]"><CheckCircle2 className="w-3 h-3"/> {s.label}</span>
              {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground"/>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: any) {
  return (
    <div className="glass-panel p-3">
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold mt-1" style={{ color: accent }}>{value}</div>
    </div>
  );
}
