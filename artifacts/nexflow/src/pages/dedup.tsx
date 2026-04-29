import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/useApi";
import { useState } from "react";
import { Link } from "wouter";
import { Users, AlertTriangle, CheckCircle2, Merge, Loader2, Search, Database, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DupContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  company_id: string | null;
  lead_score: number | null;
  last_engaged_at: string | null;
  created_at: string;
}

interface DupGroup {
  key: string;
  reason: string;
  confidence: number;
  contacts: DupContact[];
}

export default function DedupPage() {
  const qc = useQueryClient();
  const [strict, setStrict] = useState(false);
  const [merging, setMerging] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery<{ total_groups: number; total_duplicates: number; groups: DupGroup[] }>({
    queryKey: ["dedup", strict],
    queryFn: () => apiFetch(`/dedup/find?strict=${strict}`),
  });

  const merge = useMutation({
    mutationFn: ({ survivor_id, duplicate_ids }: { survivor_id: string; duplicate_ids: string[] }) =>
      apiFetch(`/dedup/merge`, { method: "POST", body: JSON.stringify({ survivor_id, duplicate_ids }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dedup"] });
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setMerging(null);
    },
  });

  const groups = data?.groups ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Deduplication</h1>
          <p className="text-muted-foreground mt-1">
            Detect and merge duplicate contacts across email, phone, and name+company.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={strict} onChange={(e) => setStrict(e.target.checked)} className="rounded" />
            Strict (exact match only)
          </label>
          <button onClick={() => refetch()} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition flex items-center gap-2">
            <Search className="w-4 h-4" /> Re-scan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Duplicate clusters</span>
            <Database className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold mt-2">{data?.total_groups ?? "—"}</div>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Records to review</span>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold mt-2">{data?.total_duplicates ?? "—"}</div>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Detection mode</span>
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-lg font-semibold mt-2">{strict ? "Exact match" : "Fuzzy + exact"}</div>
        </div>
      </div>

      {isLoading && (
        <div className="glass-card rounded-2xl p-8 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Scanning all contacts…
        </div>
      )}

      {!isLoading && groups.length === 0 && (
        <div className="glass-card rounded-2xl p-12 flex flex-col items-center text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
          <div className="text-lg font-semibold">No duplicates found</div>
          <div className="text-sm text-muted-foreground mt-1">
            Your contact database is clean.
          </div>
        </div>
      )}

      <div className="space-y-4">
        {groups.map((g) => (
          <DupGroupCard key={g.key} group={g} onMerge={(survivor, dupes) => {
            setMerging(g.key);
            merge.mutate({ survivor_id: survivor, duplicate_ids: dupes });
          }} merging={merging === g.key} />
        ))}
      </div>
    </div>
  );
}

function DupGroupCard({ group, onMerge, merging }: { group: DupGroup; onMerge: (survivor: string, dupes: string[]) => void; merging: boolean }) {
  // Default survivor: most-engaged (highest lead_score, then most recent activity)
  const sorted = [...group.contacts].sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0));
  const [survivorId, setSurvivorId] = useState(sorted[0].id);
  const dupes = group.contacts.filter((c) => c.id !== survivorId).map((c) => c.id);

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">{group.reason}</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
              {Math.round(group.confidence * 100)}% confidence
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {group.contacts.length} records found. Pick the survivor — others will be merged into it.
          </p>
        </div>
        <button
          disabled={merging || !dupes.length}
          onClick={() => onMerge(survivorId, dupes)}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
        >
          {merging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Merge className="w-4 h-4" />}
          {merging ? "Merging…" : `Merge ${dupes.length} into survivor`}
        </button>
      </div>

      <div className="grid gap-3">
        {group.contacts.map((c) => {
          const isSurvivor = c.id === survivorId;
          return (
            <label key={c.id} className={cn(
              "rounded-xl border p-3 cursor-pointer transition flex items-center gap-3",
              isSurvivor ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
            )}>
              <input
                type="radio"
                checked={isSurvivor}
                onChange={() => setSurvivorId(c.id)}
                className="accent-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/contacts/${c.id}`} className="font-medium hover:underline">
                    {c.first_name} {c.last_name}
                  </Link>
                  {isSurvivor && <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">Survivor</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {c.title ?? "—"} · {c.email ?? "no email"} · {c.phone ?? "no phone"}
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="font-semibold">Score {Math.round(c.lead_score ?? 0)}</div>
                <div className="text-muted-foreground">
                  Created {new Date(c.created_at).toLocaleDateString()}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
