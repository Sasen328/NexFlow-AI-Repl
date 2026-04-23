import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function apiBase() {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!domain) {
    if (typeof window !== "undefined" && window.location?.origin) {
      return `${window.location.origin}/api-server/api`;
    }
    return "/api-server/api";
  }
  return `https://${domain}/api-server/api`;
}

export async function apiFetch<T = any>(path: string, opts?: RequestInit): Promise<T> {
  const url = `${apiBase()}${path}`;
  const method = (opts?.method || "GET").toUpperCase();
  const hasBody = opts?.body != null;
  // CORS workaround for the workspace proxy (which strips Access-Control-Allow-Origin
  // from OPTIONS preflight responses): keep all requests as "simple" CORS requests.
  // GETs send no Content-Type. POSTs send `text/plain` (a CORS-safe content type)
  // and the API server is configured to JSON-parse text/plain bodies.
  const baseHeaders: Record<string, string> = hasBody
    ? { "Content-Type": "text/plain;charset=UTF-8" }
    : {};
  const res = await fetch(url, {
    method,
    headers: { ...baseHeaders, ...((opts?.headers as Record<string, string>) || {}) },
    body: opts?.body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  return apiFetch<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
}

// ---------- Types (loose) ----------
export type ApiContact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  company_id: string | null;
  company_name: string | null;
  lead_score: number | null;
  status: string | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
};
export type ApiDeal = {
  id: string;
  title: string;
  contact_id: string | null;
  contact_name: string | null;
  company_id: string | null;
  company_name: string | null;
  stage: string;
  value: number;
  currency: string;
  probability: number;
  expected_close_date: string | null;
  notes: string | null;
};
export type ApiAgent = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  model: string;
  enabled: boolean;
  run_count: number;
  last_run_at: string | null;
  trigger_type: string;
};
export type DashboardSummary = {
  total_contacts: number;
  open_deals: number;
  pipeline_value: number;
  revenue_this_month: number;
  calls_today: number;
  active_signals: number;
  win_rate: number;
  avg_deal_size: number;
};
export type PipelineByStage = { stage: string; count: number; total_value: number }[];
export type SignalSummary = {
  total: number;
  new: number;
  by_type: Record<string, number>;
  top_signals: Array<{
    id: string;
    contact_name: string | null;
    company_name: string | null;
    title: string;
    body: string | null;
    score: number;
    type: string | null;
  }>;
};

export type ApiActivity = {
  id: string;
  contact_id: string | null;
  deal_id: string | null;
  type: string;
  title: string | null;
  body: string | null;
  status: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
};

// ---------- Hooks ----------
export function useContacts(params?: { limit?: number; status?: string; search?: string }) {
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v != null && v !== "").map(([k, v]) => [k, String(v)]),
        ),
      ).toString()
    : "";
  return useQuery({
    queryKey: ["contacts", params],
    queryFn: () => apiFetch<{ contacts: ApiContact[] }>(`/contacts${qs}`),
    staleTime: 30_000,
  });
}

export function useContact(id?: string) {
  return useQuery({
    queryKey: ["contact", id],
    queryFn: () => apiFetch<ApiContact>(`/contacts/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useDeals() {
  return useQuery({
    queryKey: ["deals"],
    queryFn: () => apiFetch<{ deals: ApiDeal[] }>(`/deals?limit=100`),
    staleTime: 30_000,
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => apiFetch<{ agents: ApiAgent[] }>(`/agents`),
    staleTime: 30_000,
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => apiFetch<DashboardSummary>(`/dashboard/summary`),
    staleTime: 30_000,
  });
}

export function useTopContacts(limit = 3) {
  return useQuery({
    queryKey: ["dashboard", "top-contacts", limit],
    queryFn: () => apiFetch<ApiContact[]>(`/dashboard/top-contacts?limit=${limit}`),
    staleTime: 30_000,
  });
}

export function usePipelineByStage() {
  return useQuery({
    queryKey: ["dashboard", "pipeline-by-stage"],
    queryFn: () => apiFetch<PipelineByStage>(`/dashboard/pipeline-by-stage`),
    staleTime: 30_000,
  });
}

export function useSignalSummary() {
  return useQuery({
    queryKey: ["dashboard", "signal-summary"],
    queryFn: () => apiFetch<SignalSummary>(`/dashboard/signal-summary`),
    staleTime: 30_000,
  });
}

export function useAdvanceDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { deal_id: string; to_stage?: string }) =>
      apiPost<{ deal: ApiDeal; from: string; to: string; probability: number }>(
        `/deals/${input.deal_id}/advance`,
        input.to_stage ? { to_stage: input.to_stage } : {},
      ),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["deals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["pipeline-by-stage"] });
      const contactId = (data as any)?.deal?.contact_id;
      if (contactId) {
        qc.invalidateQueries({ queryKey: ["contact", contactId, "activities"] });
        qc.invalidateQueries({ queryKey: ["contact", contactId] });
      }
    },
  });
}

export function useLogCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      contact_id: string;
      outcome: "connected" | "no_answer" | "voicemail" | "wrong_number";
      notes?: string;
      duration_seconds?: number;
      run_orchestrator?: boolean;
    }) =>
      apiPost<{ call: any; orchestration: { plan?: any; activities_created?: number } | null }>(
        "/calls/log",
        { ...input, run_orchestrator: input.run_orchestrator ?? true },
      ),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["contact", vars.contact_id, "activities"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useContactActivities(id?: string) {
  return useQuery({
    queryKey: ["contact", id, "activities"],
    queryFn: () => apiFetch<ApiActivity[]>(`/contacts/${id}/activities`),
    enabled: !!id,
    staleTime: 30_000,
  });
}

// ---------- helpers ----------
export function initials(first?: string | null, last?: string | null) {
  return `${(first || "?").charAt(0)}${(last || "").charAt(0)}`.toUpperCase();
}

export function stageLabel(stage: string) {
  const map: Record<string, string> = {
    lead: "Lead",
    qualified: "Qualified",
    proposal: "Proposal",
    negotiation: "Negotiation",
    closed_won: "Closed Won",
    closed_lost: "Closed Lost",
  };
  return map[stage] || stage;
}

export function dealHealth(d: { probability: number; stage: string }): "hot" | "warm" | "at-risk" {
  if (d.stage === "closed_won") return "hot";
  if (d.probability >= 70) return "hot";
  if (d.probability >= 40) return "warm";
  return "at-risk";
}
