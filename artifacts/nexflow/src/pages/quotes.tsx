import { useState } from "react";
import {
  FileText, Plus, Download, Send, Copy, MoreHorizontal, Search,
  TrendingUp, DollarSign, FileCheck, Clock, Sparkles, Globe,
  Trash2, Calculator, Building2, ChevronRight, Filter, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CURRENCIES: Record<string, { symbol: string; rate: number; flag: string }> = {
  USD: { symbol: "$",   rate: 1.00, flag: "🇺🇸" },
  AED: { symbol: "د.إ", rate: 3.67, flag: "🇦🇪" },
  SAR: { symbol: "ر.س", rate: 3.75, flag: "🇸🇦" },
  QAR: { symbol: "ر.ق", rate: 3.64, flag: "🇶🇦" },
  KWD: { symbol: "د.ك", rate: 0.31, flag: "🇰🇼" },
};

const STATUS_STYLE: Record<string, string> = {
  draft:    "bg-muted/40 text-muted-foreground border-border/40",
  sent:     "bg-[#B8A0C8]/15 text-[#B8A0C8] border-[#B8A0C8]/30",
  viewed:   "bg-[#88B8B0]/15 text-[#88B8B0] border-[#88B8B0]/30",
  accepted: "bg-[#88B8B0]/20 text-[#88B8B0] border-[#88B8B0]/40",
  expired:  "bg-[#C8A880]/15 text-[#C8A880] border-[#C8A880]/30",
  rejected: "bg-[#C0A0B8]/15 text-[#C0A0B8] border-[#C0A0B8]/30",
};

const QUOTES = [
  { id: "Q-2026-0421", contact: "Sara Al-Mansouri",  company: "Gulf Ventures",      amount: 285000, currency: "USD", status: "viewed",   discount: 8,  validUntil: "May 28", created: "2 days ago" },
  { id: "Q-2026-0420", contact: "Mohammed Al-Otaibi",company: "Aramco Digital",     amount: 1200000,currency: "SAR", status: "accepted", discount: 12, validUntil: "May 15", created: "5 days ago" },
  { id: "Q-2026-0419", contact: "Ahmed Al-Rashidi",  company: "Riyadh Capital",     amount: 95000,  currency: "USD", status: "sent",     discount: 5,  validUntil: "Jun 02", created: "1 day ago" },
  { id: "Q-2026-0418", contact: "Hessa Al-Nahyan",   company: "Abu Dhabi Holdings", amount: 540000, currency: "AED", status: "viewed",   discount: 10, validUntil: "May 30", created: "3 days ago" },
  { id: "Q-2026-0417", contact: "Khalid Al-Hamdan",  company: "Doha Petroleum",     amount: 75000,  currency: "QAR", status: "draft",    discount: 0,  validUntil: "—",      created: "today" },
  { id: "Q-2026-0416", contact: "Layla Hassan",      company: "Mena Banking",       amount: 42000,  currency: "USD", status: "expired",  discount: 15, validUntil: "Apr 20", created: "2 weeks ago" },
];

const SAMPLE_LINE_ITEMS = [
  { id: 1, sku: "NF-PRO-100", name: "NexFlow Professional",       desc: "Per user/month, 100 seats", qty: 12, price: 89,    discount: 0,  recurring: "monthly" },
  { id: 2, sku: "NF-AI-VOICE",name: "AI Voice Agent — Arabic",    desc: "Bilingual voice AI add-on", qty: 1,  price: 1500,  discount: 5,  recurring: "monthly" },
  { id: 3, sku: "NF-IMP",     name: "Implementation & Training",  desc: "8-week onboarding sprint",  qty: 1,  price: 24000, discount: 10, recurring: "one-time" },
  { id: 4, sku: "NF-PREMSUP", name: "Premium Support (24/7 SLA)", desc: "Arabic + English support",  qty: 1,  price: 8000,  discount: 0,  recurring: "monthly" },
];

export default function QuotesPage() {
  const [selected, setSelected] = useState<string>(QUOTES[0].id);
  const [currency, setCurrency] = useState<string>("USD");
  const [items, setItems] = useState(SAMPLE_LINE_ITEMS);
  const quote = QUOTES.find((q) => q.id === selected) ?? QUOTES[0];

  // Line item prices are USD-base; convert to display currency via FX rate
  const subtotalUSD = items.reduce((sum, it) => sum + it.qty * it.price * (1 - it.discount / 100), 0);
  const taxUSD = subtotalUSD * 0.05; // GCC VAT 5%
  const totalUSD = subtotalUSD + taxUSD;
  const totalQuotes = QUOTES.length;
  const totalValueUSD = QUOTES.reduce((s, q) => s + q.amount / CURRENCIES[q.currency].rate, 0);
  const acceptedCount = QUOTES.filter((q) => q.status === "accepted").length;
  const winRate = Math.round((acceptedCount / totalQuotes) * 100);

  // Format a USD-base amount in the selected display currency
  function fmt(usdAmount: number, ccy = currency) {
    const c = CURRENCIES[ccy];
    return `${c.symbol} ${(usdAmount * c.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  function updateItem(id: number, patch: Partial<typeof SAMPLE_LINE_ITEMS[0]>) {
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  return (
    <div className="max-w-[1500px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-7 h-7 text-[#C8A880]" />
            <h1 className="text-3xl font-black text-foreground">Quotes &amp; CPQ</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Configure-Price-Quote with multi-currency (AED, SAR, QAR, KWD, USD), product bundles, GCC VAT, branded PDF exports, and approval workflows.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl nf-chameleon-bg text-white text-sm font-semibold shadow-md hover:opacity-90">
          <Plus className="w-4 h-4" />
          New Quote
        </button>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={FileText}    color="#B8A0C8" label="Open quotes"      value={totalQuotes.toString()}                                      sub="across pipeline" />
        <StatCard icon={DollarSign}  color="#88B8B0" label="Total value"      value={`$${(totalValueUSD/1000).toFixed(0)}K`}                      sub="USD-equivalent" />
        <StatCard icon={FileCheck}   color="#C8A880" label="Accept rate"      value={`${winRate}%`}                                               sub="last 90 days" />
        <StatCard icon={Clock}       color="#C0A0B8" label="Avg time to sign" value="6 days"                                                      sub="benchmark 14d" />
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-12 gap-6">
        {/* Quote list */}
        <div className="col-span-5">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border/30 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Recent Quotes</h2>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground"><Search className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 rounded-lg hover:bg-muted/40 text-muted-foreground"><Filter className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="divide-y divide-border/20 max-h-[600px] overflow-y-auto">
              {QUOTES.map((q) => {
                const c = CURRENCIES[q.currency];
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelected(q.id)}
                    className={cn(
                      "w-full text-left p-4 hover:bg-muted/20 transition-colors flex items-center gap-3",
                      selected === q.id && "bg-[#C8A880]/8"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ background: `${q.status === "accepted" ? "#88B8B0" : "#C8A880"}25` }}>
                      {c.flag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-muted-foreground">{q.id}</span>
                        <span className={cn("px-1.5 py-0 rounded-full text-[9px] font-bold uppercase tracking-wider border", STATUS_STYLE[q.status])}>
                          {q.status}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-foreground truncate">{q.contact}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                        <Building2 className="w-2.5 h-2.5 flex-shrink-0" />
                        {q.company}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-black text-foreground">{c.symbol} {q.amount.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground">valid {q.validUntil}</div>
                      {q.discount > 0 && <div className="text-[10px] text-[#C8A880] font-semibold">-{q.discount}% disc.</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quote builder */}
        <div className="col-span-7">
          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-border/30 bg-gradient-to-br from-[#C8A880]/10 to-transparent">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground font-mono mb-1">{quote.id}</div>
                  <h2 className="text-lg font-black text-foreground">{quote.contact}</h2>
                  <div className="text-xs text-muted-foreground">{quote.company} · valid until {quote.validUntil}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground" title="Preview"><Eye className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground" title="Duplicate"><Copy className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-muted/40 text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Currency selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Currency:</span>
                {Object.entries(CURRENCIES).map(([code, c]) => (
                  <button
                    key={code}
                    onClick={() => setCurrency(code)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold transition-all border",
                      currency === code
                        ? "nf-chameleon-bg text-white border-transparent shadow-sm"
                        : "border-border/40 text-foreground/70 hover:bg-muted/40"
                    )}
                  >
                    {c.flag} {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Line items */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Line items</h3>
                <button className="text-xs text-[#C8A880] font-semibold hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add product
                </button>
              </div>

              <div className="space-y-2">
                {items.map((it) => {
                  const lineTotal = it.qty * it.price * (1 - it.discount / 100);
                  return (
                    <div key={it.id} className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors group">
                      <div className="col-span-5">
                        <div className="text-xs font-mono text-muted-foreground mb-0.5">{it.sku}</div>
                        <div className="text-sm font-bold text-foreground">{it.name}</div>
                        <div className="text-[11px] text-muted-foreground">{it.desc}</div>
                      </div>
                      <div className="col-span-1 text-center">
                        <input
                          type="number"
                          value={it.qty}
                          onChange={(e) => updateItem(it.id, { qty: Math.max(0, +e.target.value) })}
                          className="w-full text-center text-sm font-bold bg-transparent border border-border/30 rounded-md px-1 py-0.5 focus:outline-none focus:border-[#C8A880]"
                        />
                      </div>
                      <div className="col-span-2 text-right text-xs">
                        <div className="text-foreground/70">{fmt(it.price)}</div>
                        <div className="text-[10px] text-muted-foreground">{it.recurring}</div>
                      </div>
                      <div className="col-span-1 text-center">
                        <input
                          type="number"
                          value={it.discount}
                          onChange={(e) => updateItem(it.id, { discount: Math.max(0, Math.min(100, +e.target.value)) })}
                          className="w-full text-center text-xs bg-transparent border border-border/30 rounded-md px-1 py-0.5 focus:outline-none focus:border-[#C8A880]"
                        />
                        <div className="text-[9px] text-muted-foreground">%</div>
                      </div>
                      <div className="col-span-2 text-right text-sm font-black text-foreground">
                        {fmt(lineTotal)}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button onClick={() => setItems((a) => a.filter((x) => x.id !== it.id))} className="p-1 rounded text-muted-foreground hover:text-[#C0A0B8] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="mt-4 ml-auto max-w-[300px] space-y-2 border-t border-border/30 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-semibold">{fmt(subtotalUSD)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT (5% GCC)</span>
                  <span className="text-foreground font-semibold">{fmt(taxUSD)}</span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t border-border/40">
                  <span className="text-foreground font-bold">Total</span>
                  <span className="text-[#C8A880] font-black text-xl">{fmt(totalUSD)}</span>
                </div>
              </div>

              {/* Approval guardrail */}
              <div className="mt-4 p-3 rounded-xl border border-[#C8A880]/30 bg-[#C8A880]/5 flex items-start gap-3">
                <Calculator className="w-4 h-4 text-[#C8A880] flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <span className="font-bold text-[#C8A880]">Auto-approval rule:</span>{" "}
                  <span className="text-foreground/80">
                    Discount under 15% — no approval needed. Discounts above 15% require sales manager sign-off; above 25% need VP approval.
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl nf-chameleon-bg text-white text-sm font-bold shadow-sm hover:opacity-90">
                  <Send className="w-4 h-4" />
                  Send to {quote.contact}
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/40 text-foreground text-sm font-semibold hover:bg-muted/40">
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#B8A0C8]/40 text-[#B8A0C8] text-sm font-semibold hover:bg-[#B8A0C8]/10">
                  <Sparkles className="w-4 h-4" />
                  AI rewrite
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value, sub }: any) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}25` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="text-2xl font-black text-foreground leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
