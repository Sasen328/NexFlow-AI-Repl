import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function apiBase() {
  const origin = window.location.origin;
  return `${origin}/api`;
}

export async function apiFetch(path: string, opts?: RequestInit) {
  const url = `${apiBase()}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...opts?.headers },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
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
export function useCompanyIntelligence(id: string, enabled = true) {
  return useQuery({
    queryKey: ["companies", id, "intelligence"],
    queryFn: () => apiFetch(`/ai/companies/${id}/intelligence`),
    enabled: !!id && enabled,
    staleTime: 60_000 * 30,
  });
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
  return useQuery({ queryKey: ["activities", params], queryFn: async () => {
    const r = await apiFetch(`/activities${qs}`);
    return Array.isArray(r) ? { activities: r } : r;
  }});
}
export function useSignals(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return useQuery({ queryKey: ["signals", params], queryFn: async () => {
    const r = await apiFetch(`/signals${qs}`);
    return Array.isArray(r) ? { signals: r } : r;
  }});
}
export function useSegments() {
  return useQuery({ queryKey: ["segments"], queryFn: async () => {
    const r = await apiFetch("/segments");
    return Array.isArray(r) ? { segments: r } : r;
  }});
}
export function useCalls(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return useQuery({ queryKey: ["calls", params], queryFn: async () => {
    const r = await apiFetch(`/calls${qs}`);
    return Array.isArray(r) ? { calls: r } : r;
  }});
}
export function useScripts(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return useQuery({ queryKey: ["scripts", params], queryFn: async () => {
    const r = await apiFetch(`/scripts${qs}`);
    return Array.isArray(r) ? { scripts: r } : r;
  }});
}
export function useNotifications() {
  return useQuery({ queryKey: ["notifications"], queryFn: async () => {
    const r = await apiFetch("/notifications");
    return Array.isArray(r) ? { notifications: r } : r;
  }, refetchInterval: 30000 });
}

export function useDashboard() {
  return useQuery({ queryKey: ["dashboard"], queryFn: async () => {
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
      pipeline: pipeline.map((p: any) => ({ stage: p.stage, count: p.count, totalValue: p.total_value })),
      topContacts: topContacts.map((c: any) => ({ id: c.id, firstName: c.first_name, lastName: c.last_name, leadScore: c.lead_score })),
      signalSummary,
    };
  }});
}

export function useAnalytics() {
  return useQuery({ queryKey: ["analytics"], queryFn: async () => {
    const [callStats, _forecast, pipeline] = await Promise.all([
      apiFetch("/analytics/call-stats").catch(() => null),
      apiFetch("/analytics/forecast").catch(() => null),
      apiFetch("/dashboard/pipeline-by-stage").catch(() => []),
    ]);
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
      dealsByStage: (pipeline ?? []).map((p: any) => ({ stage: p.stage, count: p.count, totalValue: p.total_value })),
      callMetrics: {
        totalCalls: callStats?.total_calls ?? 0,
        completedCalls: callStats?.total_calls ?? 0,
        avgCallScore: callStats?.avg_call_score ?? 0,
        avgDuration: callStats?.avg_duration_seconds ?? 0,
      },
      signalMetrics: { totalSignals: signalSummary?.total ?? 0, newSignals: signalSummary?.new ?? 0, avgScore: 82 },
    };
  }});
}

// ── New Phase A-E hooks ────────────────────────────────────────────────────
export function useUsers() { return useQuery({ queryKey: ["users"], queryFn: () => apiFetch("/users") }); }
export function useProperties(objectType?: string) {
  const qs = objectType ? `?object_type=${objectType}` : "";
  return useQuery({ queryKey: ["properties", objectType], queryFn: () => apiFetch(`/properties${qs}`) });
}
export function useLists() { return useQuery({ queryKey: ["lists"], queryFn: () => apiFetch("/lists") }); }
export function useList(id: string) { return useQuery({ queryKey: ["lists", id], queryFn: () => apiFetch(`/lists/${id}`), enabled: !!id }); }
export function useViews(objectType?: string) {
  const qs = objectType ? `?object_type=${objectType}` : "";
  return useQuery({ queryKey: ["views", objectType], queryFn: () => apiFetch(`/views${qs}`) });
}
export function useDashboards() { return useQuery({ queryKey: ["dashboards"], queryFn: () => apiFetch("/dashboards") }); }
export function useDashboardDetail(id: string) { return useQuery({ queryKey: ["dashboards", id], queryFn: () => apiFetch(`/dashboards/${id}`), enabled: !!id }); }
export function useAutomations() { return useQuery({ queryKey: ["automations"], queryFn: () => apiFetch("/automations") }); }
export function useCampaigns() { return useQuery({ queryKey: ["campaigns"], queryFn: () => apiFetch("/campaigns") }); }
export function useAgents() { return useQuery({ queryKey: ["agents"], queryFn: () => apiFetch("/agents") }); }
export function useAgent(id: string) { return useQuery({ queryKey: ["agents", id], queryFn: () => apiFetch(`/agents/${id}`), enabled: !!id }); }
export function useFunnel() { return useQuery({ queryKey: ["funnel"], queryFn: () => apiFetch("/ai/funnel") }); }
export function useCallList() { return useQuery({ queryKey: ["call-list"], queryFn: () => apiFetch("/ai/call-list/today") }); }
export function useDailyInsights() { return useQuery({ queryKey: ["insights", "daily"], queryFn: () => apiFetch("/ai/insights/daily") }); }
export function useInsights() { return useQuery({ queryKey: ["insights"], queryFn: () => apiFetch("/ai/insights") }); }

export function useAiAgents() {
  return useQuery({ queryKey: ["ai", "agents"], queryFn: () => apiFetch("/ai/agents"), retry: 1 });
}
export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => apiFetch("/contacts", { method: "POST", body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }) });
}
export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => apiFetch("/deals", { method: "POST", body: JSON.stringify(data) }), onSuccess: () => qc.invalidateQueries({ queryKey: ["deals"] }) });
}
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => apiFetch(`/notifications/${id}/read`, { method: "PATCH" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
}
export function useRunAiAgent() {
  return useMutation({ mutationFn: ({ agentId, payload }: any) => apiFetch(`/ai/agents/${agentId}/run`, { method: "POST", body: JSON.stringify(payload) }) });
}

// ── Generic mutation helpers ───────────────────────────────────────────────
function invalidateAll(qc: ReturnType<typeof useQueryClient>, keys: string[]) {
  for (const k of keys) qc.invalidateQueries({ queryKey: [k] });
}
export function useCreate(path: string, invalidate: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiFetch(path, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => invalidateAll(qc, invalidate),
  });
}
export function useDelete(pathFn: (id: string) => string, invalidate: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(pathFn(id), { method: "DELETE" }),
    onSuccess: () => invalidateAll(qc, invalidate),
  });
}
export function useUpdate(pathFn: (id: string) => string, invalidate: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiFetch(pathFn(id), { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => invalidateAll(qc, invalidate),
  });
}
export function useEnrichContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/ai/contacts/${id}/enrich`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}
export function useBulkEnrich() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contact_ids: string[]) => apiFetch(`/ai/contacts/bulk-enrich`, { method: "POST", body: JSON.stringify({ contact_ids }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}
export function useReportBuilder() {
  return useMutation({
    mutationFn: (prompt: string) => apiFetch(`/ai/report-builder`, { method: "POST", body: JSON.stringify({ prompt }) }),
  });
}
export function useWidgetData() {
  return useMutation({
    mutationFn: (config: any) => apiFetch(`/dashboards/widget-data`, { method: "POST", body: JSON.stringify(config) }),
  });
}
export function useGenerateCampaignContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: any) => apiFetch(`/campaigns/${id}/generate-content`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}
export function useSendCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/campaigns/${id}/send`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}
export function useRunAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/automations/${id}/run`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] }),
  });
}
export function useRunCustomAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: string }) =>
      apiFetch(`/agents/${id}/run`, { method: "POST", body: JSON.stringify({ input }) }),
    onSuccess: (_d, vars) => { qc.invalidateQueries({ queryKey: ["agents", vars.id] }); qc.invalidateQueries({ queryKey: ["agents"] }); qc.invalidateQueries({ queryKey: ["agent-runs", vars.id] }); },
  });
}
export function useAutomationRuns(id: string, enabled = true) {
  return useQuery({ queryKey: ["automation-runs", id], queryFn: () => apiFetch(`/automations/${id}/runs`), enabled: enabled && !!id });
}
export function useAgentRuns(id: string, enabled = true) {
  return useQuery({ queryKey: ["agent-runs", id], queryFn: () => apiFetch(`/agents/${id}/runs`), enabled: enabled && !!id });
}
export function useCampaignRecipients(id: string, enabled = true) {
  return useQuery({ queryKey: ["campaign-recipients", id], queryFn: () => apiFetch(`/campaigns/${id}/recipients`), enabled: enabled && !!id });
}
export function useDuplicateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/campaigns/${id}/duplicate`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}
export function useImproveAgentPrompt() {
  return useMutation({
    mutationFn: (data: { name: string; description: string; system_prompt: string }) =>
      apiFetch(`/ai/agents/improve-prompt`, { method: "POST", body: JSON.stringify(data) }),
  });
}
export function useContactLists(id: string) {
  return useQuery({ queryKey: ["contacts", id, "lists"], queryFn: () => apiFetch(`/contacts/${id}/lists`), enabled: !!id });
}
export function usePropertyValues(entityId: string) {
  return useQuery({ queryKey: ["property-values", entityId], queryFn: () => apiFetch(`/properties/values/${entityId}`), enabled: !!entityId });
}
export function useUpsertPropertyValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { property_id: string; entity_id: string; value: any }) =>
      apiFetch(`/properties/values`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["property-values", vars.entity_id] }),
  });
}
export function useBulkAddToLists() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { list_ids: string[]; entity_ids: string[] }) =>
      apiFetch(`/lists/bulk-add`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lists"] }); qc.invalidateQueries({ queryKey: ["contacts"] }); },
  });
}
export function useSaveView() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; object_type: string; filters: any }) =>
      apiFetch(`/views`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["views"] }),
  });
}
export function useDeleteView() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/views/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["views"] }),
  });
}
export function useFunnelStage(stage: string) {
  return useQuery({ queryKey: ["funnel", "stage", stage], queryFn: () => apiFetch(`/ai/funnel/stage/${stage}`), enabled: !!stage });
}
export function useFunnelStageInsights(stage: string, enabled = true) {
  return useQuery({
    queryKey: ["funnel", "stage", stage, "insights"],
    queryFn: () => apiFetch(`/ai/funnel/stage/${stage}/insights`),
    enabled: !!stage && enabled,
    staleTime: 10 * 60_000,
  });
}
export function useFunnelStuck() {
  return useQuery({ queryKey: ["funnel", "stuck"], queryFn: () => apiFetch(`/ai/funnel/stuck`) });
}
export function useAutoAdvanceStages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(`/ai/auto-advance-stages`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["funnel"] }); qc.invalidateQueries({ queryKey: ["deals"] }); },
  });
}
export function useDuplicateDashboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/dashboards/${id}/duplicate`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboards"] }),
  });
}
export function useUpdateWidget(dashboardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: any) => apiFetch(`/dashboards/widgets/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboards", dashboardId] }),
  });
}
export function useDashboardBuilder() {
  return useMutation({
    mutationFn: (prompt: string) => apiFetch(`/ai/dashboard-builder`, { method: "POST", body: JSON.stringify({ prompt }) }),
  });
}
export function useDashboardSummary() {
  return useMutation({
    mutationFn: (widgets: any[]) => apiFetch(`/ai/dashboard-summary`, { method: "POST", body: JSON.stringify({ widgets }) }),
  });
}
export function useRegenerateInsights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(`/ai/insights/regenerate`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["insights"] }); qc.invalidateQueries({ queryKey: ["insights", "daily"] }); },
  });
}
export function useInsightsTrend() {
  return useQuery({ queryKey: ["insights", "trend"], queryFn: () => apiFetch(`/ai/insights/trend`) });
}
export function useLogCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { contact_id: string; outcome: string; duration_seconds?: number; notes?: string; run_orchestrator?: boolean }) =>
      apiFetch(`/calls/log`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["calls"] }); qc.invalidateQueries({ queryKey: ["call-list"] }); },
  });
}
export function usePostCallOrchestrate() {
  return useMutation({
    mutationFn: ({ callId, outcome }: { callId: string; outcome: string }) =>
      apiFetch(`/ai/post-call/${callId}`, { method: "POST", body: JSON.stringify({ outcome }) }),
  });
}

// ── Phase I: AI generators + creators ──────────────────────────────────────
export function useAiGenerateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { prompt: string; name?: string }) =>
      apiFetch(`/ai/lists/generate`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists"] }),
  });
}
export function useAiSuggestProperties() {
  return useMutation({
    mutationFn: (data: { prompt: string; object_type?: string }) =>
      apiFetch(`/ai/properties/suggest`, { method: "POST", body: JSON.stringify(data) }),
  });
}
export function useAiGenerateSegment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { prompt: string }) =>
      apiFetch(`/ai/segments/generate`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["segments"] }),
  });
}
export function useSegmentMembers(id: string, enabled = true) {
  return useQuery({
    queryKey: ["segments", id, "members"],
    queryFn: () => apiFetch(`/ai/segments/${id}/members`),
    enabled: !!id && enabled,
  });
}
export function useAiDraftCompany() {
  return useMutation({
    mutationFn: (data: { name: string; domain?: string; website?: string }) =>
      apiFetch(`/ai/companies/draft`, { method: "POST", body: JSON.stringify(data) }),
  });
}
export function useAiImportCsv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { rows: any[]; default_source?: string }) =>
      apiFetch(`/ai/contacts/import-csv`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contacts"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
}
export function useAnalyzeCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/ai/calls/${id}/analyze`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calls"] }),
  });
}
export function useForgottenLeads() {
  return useQuery({ queryKey: ["forgotten-leads"], queryFn: () => apiFetch(`/ai/forgotten-leads`), staleTime: 5 * 60_000 });
}
export function useAiDraftAgent() {
  return useMutation({
    mutationFn: (description: string) =>
      apiFetch(`/ai/agents/draft`, { method: "POST", body: JSON.stringify({ description }) }),
  });
}
export function useContactOverview() {
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/ai/contacts/${id}/overview`, { method: "POST", body: JSON.stringify({}) }),
  });
}
export function useAiDraftAutomation() {
  return useMutation({
    mutationFn: (description: string) =>
      apiFetch(`/ai/automations/draft`, { method: "POST", body: JSON.stringify({ description }) }),
  });
}
