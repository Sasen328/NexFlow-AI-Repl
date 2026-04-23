import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function apiBase() {
  const origin = window.location.origin;
  return `${origin}/api-server/api`;
}

async function apiFetch(path: string, opts?: RequestInit) {
  const url = `${apiBase()}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...opts?.headers },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export function useContacts(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return useQuery({ queryKey: ["contacts", params], queryFn: () => apiFetch(`/contacts${qs}`) });
}

export function useContact(id: string) {
  return useQuery({ queryKey: ["contacts", id], queryFn: () => apiFetch(`/contacts/${id}`), enabled: !!id });
}

export function useCompanies(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return useQuery({ queryKey: ["companies", params], queryFn: () => apiFetch(`/companies${qs}`) });
}

export function useCompany(id: string) {
  return useQuery({ queryKey: ["companies", id], queryFn: () => apiFetch(`/companies/${id}`), enabled: !!id });
}

export function useDeals(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return useQuery({ queryKey: ["deals", params], queryFn: () => apiFetch(`/deals${qs}`) });
}

export function useDeal(id: string) {
  return useQuery({ queryKey: ["deals", id], queryFn: () => apiFetch(`/deals/${id}`), enabled: !!id });
}

export function useActivities(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return useQuery({
    queryKey: ["activities", params],
    queryFn: async () => {
      const r = await apiFetch(`/activities${qs}`);
      return Array.isArray(r) ? { activities: r } : r;
    },
  });
}

export function useSignals(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return useQuery({
    queryKey: ["signals", params],
    queryFn: async () => {
      const r = await apiFetch(`/signals${qs}`);
      return Array.isArray(r) ? { signals: r } : r;
    },
  });
}

export function useSegments() {
  return useQuery({ queryKey: ["segments"], queryFn: () => apiFetch("/segments") });
}

export function useCalls(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return useQuery({
    queryKey: ["calls", params],
    queryFn: async () => {
      const r = await apiFetch(`/calls${qs}`);
      return Array.isArray(r) ? { calls: r } : r;
    },
  });
}

export function useScripts(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return useQuery({ queryKey: ["scripts", params], queryFn: () => apiFetch(`/scripts${qs}`) });
}

export function useNotifications() {
  return useQuery({ queryKey: ["notifications"], queryFn: () => apiFetch("/notifications"), refetchInterval: 30000 });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [summary, pipeline, topContacts, signalSummary] = await Promise.all([
        apiFetch("/dashboard/summary"),
        apiFetch("/dashboard/pipeline-by-stage"),
        apiFetch("/dashboard/top-contacts?limit=5"),
        apiFetch("/dashboard/signal-summary"),
      ]);
      return {
        stats: {
          totalContacts: summary.total_contacts,
          totalCompanies: summary.total_companies,
          openDeals: summary.open_deals,
          totalRevenue: summary.pipeline_value,
          avgLeadScore: 0,
          completedCalls: summary.calls_today,
          pendingActivities: 0,
          newSignals: summary.active_signals,
        },
        pipeline: pipeline.map((p: any) => ({
          stage: p.stage,
          count: p.count,
          totalValue: p.total_value,
        })),
        topContacts: topContacts.map((c: any) => ({
          id: c.id,
          firstName: c.first_name,
          lastName: c.last_name,
          leadScore: c.lead_score,
        })),
        signalSummary,
      };
    },
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const [callStats, forecast, pipeline] = await Promise.all([
        apiFetch("/analytics/call-stats"),
        apiFetch("/analytics/forecast"),
        apiFetch("/dashboard/pipeline-by-stage"),
        apiFetch("/dashboard/summary"),
      ].map(p => p.catch(() => null)));

      const [dashSummary] = await Promise.all([apiFetch("/dashboard/summary").catch(() => ({}))]);
      const [signalSummary] = await Promise.all([apiFetch("/dashboard/signal-summary").catch(() => ({}))]);

      return {
        overview: {
          totalContacts: dashSummary.total_contacts ?? 0,
          totalCompanies: dashSummary.total_companies ?? 0,
          totalDeals: (dashSummary.open_deals ?? 0) + (dashSummary.deals_closed_this_month ?? 0),
          openDeals: dashSummary.open_deals ?? 0,
          closedWon: dashSummary.deals_closed_this_month ?? 0,
          pipelineValue: dashSummary.pipeline_value ?? 0,
          winRate: dashSummary.win_rate ?? 0,
          totalWonValue: dashSummary.revenue_this_month ?? 0,
          avgDealSize: dashSummary.avg_deal_size ?? 0,
        },
        dealsByStage: (pipeline ?? []).map((p: any) => ({
          stage: p.stage,
          count: p.count,
          totalValue: p.total_value,
        })),
        callMetrics: {
          totalCalls: callStats?.total_calls ?? 0,
          completedCalls: callStats?.total_calls ?? 0,
          avgCallScore: callStats?.avg_call_score ?? 0,
          avgDuration: callStats?.avg_duration_seconds ?? 0,
        },
        signalMetrics: {
          totalSignals: signalSummary?.total ?? 0,
          newSignals: signalSummary?.new ?? 0,
          avgScore: 82,
        },
      };
    },
  });
}

export function useAiAgents() {
  return useQuery({
    queryKey: ["ai", "agents"],
    queryFn: () => apiFetch("/ai/agents"),
    retry: 1,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch("/contacts", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiFetch("/deals", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deals"] }),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useRunAiAgent() {
  return useMutation({
    mutationFn: ({ agentId, payload }: { agentId: string; payload: Record<string, unknown> }) =>
      apiFetch(`/ai/agents/${agentId}/run`, { method: "POST", body: JSON.stringify(payload) }),
  });
}
