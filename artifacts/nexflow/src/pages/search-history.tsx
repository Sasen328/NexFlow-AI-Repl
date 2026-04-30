import { useState } from "react";
import { Link } from "wouter";
import {
  Search, Clock, Repeat2, Building2, Users, Filter, Download, Sparkles,
} from "lucide-react";

interface HistoryRow {
  id: string;
  ranAt: string;
  type: "Company search" | "Bulk enrich" | "Card scan" | "List upload" | "Quick lead";
  query: string;
  results: number;
  enriched: number;
  signalsFired: number;
  ranBy: string;
}

const HISTORY: HistoryRow[] = [
  { id: "h-101", ranAt: "Today · 09:42",  type: "Company search", query: "Sector: Asset Management · KSA · 50–500 staff",                         results: 138, enriched: 138, signalsFired: 14, ranBy: "Khalid (Sales Rep)" },
  { id: "h-102", ranAt: "Today · 08:11",  type: "Bulk enrich",    query: "Imported list — Q2 outreach (412 rows)",                                  results: 412, enriched: 397, signalsFired: 22, ranBy: "Layla (Sales Manager)" },
  { id: "h-103", ranAt: "Yesterday · 16:50", type: "Card scan",   query: "Riyadh FinTech Summit — booth scans (28 cards)",                          results: 28,  enriched: 28,  signalsFired: 6,  ranBy: "Khalid (Sales Rep)" },
  { id: "h-104", ranAt: "Yesterday · 14:03", type: "Company search", query: "Family Offices · UAE · AUM > $200M",                                   results: 47,  enriched: 47,  signalsFired: 9,  ranBy: "Faisal (CEO)" },
  { id: "h-105", ranAt: "2 days ago · 11:28", type: "List upload", query: "Salesforce export · contacts_apr_2026.csv (1,204 rows)",                results: 1204, enriched: 1187, signalsFired: 51, ranBy: "Sara (CRM Admin)" },
  { id: "h-106", ranAt: "2 days ago · 09:00", type: "Quick lead", query: "Single record — Ahmad Al-Rashidi · KFH",                                  results: 1,   enriched: 1,   signalsFired: 2,  ranBy: "Layla (Sales Manager)" },
  { id: "h-107", ranAt: "3 days ago · 17:15", type: "Company search", query: "Sector: Insurance · Bahrain · publicly listed",                       results: 19,  enriched: 19,  signalsFired: 4,  ranBy: "Khalid (Sales Rep)" },
];

export default function SearchHistoryPage() {
  const [filter, setFilter] = useState<"all" | HistoryRow["type"]>("all");
  const rows = filter === "all" ? HISTORY : HISTORY.filter((r) => r.type === filter);

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500">
            <Search className="w-3.5 h-3.5" /> Enrichment Engine · Search History
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-stone-900">Search History</h1>
          <p className="text-sm text-stone-600 mt-1">
            Every enrichment search and bulk run. Re-run any one in a click, or export the result set.
          </p>
        </div>
        <Link
          href="/enrichment-engine"
          className="px-4 py-2 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
        >
          New search
        </Link>
      </header>

      <div className="rounded-lg border border-violet-200 bg-violet-50/60 p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-violet-600 mt-0.5" />
        <div className="text-sm text-stone-700">
          <strong>AI summary:</strong> Last 7 days — 1,849 records touched, 1,797 enriched (97.2%),
          108 buying signals fired. Highest-yield run: <em>Bulk enrich · Q2 outreach (412 rows)</em>.
          Suggest re-running <em>Family Offices · UAE</em> with widened AUM band.
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-stone-500 mr-2">
          <Filter className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> Filter:
        </span>
        {(["all", "Company search", "Bulk enrich", "Card scan", "List upload", "Quick lead"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              filter === f
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
            }`}
          >
            {f === "all" ? "All runs" : f}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3"><Clock className="w-3.5 h-3.5 inline mr-1" />When</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Query</th>
              <th className="text-right px-4 py-3"><Users className="w-3.5 h-3.5 inline mr-1" />Results</th>
              <th className="text-right px-4 py-3"><Building2 className="w-3.5 h-3.5 inline mr-1" />Enriched</th>
              <th className="text-right px-4 py-3">Signals</th>
              <th className="text-left px-4 py-3">Ran by</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-stone-100 hover:bg-stone-50/60">
                <td className="px-4 py-3 text-stone-700">{r.ranAt}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
                    {r.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-800">{r.query}</td>
                <td className="px-4 py-3 text-right tabular-nums text-stone-700">{r.results.toLocaleString()}</td>
                <td className="px-4 py-3 text-right tabular-nums text-stone-700">{r.enriched.toLocaleString()}</td>
                <td className="px-4 py-3 text-right tabular-nums text-stone-700">{r.signalsFired}</td>
                <td className="px-4 py-3 text-stone-600 text-xs">{r.ranBy}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border border-stone-200 hover:border-violet-400 hover:text-violet-700 mr-1"
                    title="Re-run this search"
                  >
                    <Repeat2 className="w-3.5 h-3.5" /> Re-run
                  </button>
                  <button
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border border-stone-200 hover:border-violet-400 hover:text-violet-700"
                    title="Export result set"
                  >
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-stone-500">
        All exports are logged for Compliance audit (per spec §10.3). HNW prospect data stays in regional infrastructure.
      </p>
    </div>
  );
}
