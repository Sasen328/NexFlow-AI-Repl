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

export async function apiPost<T = any>(
  path: string,
  body: any,
  method: "POST" | "PATCH" | "PUT" | "DELETE" = "POST",
): Promise<T> {
  return apiFetch<T>(path, { method, body: JSON.stringify(body ?? {}) });
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

export function useLogActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      type: "whatsapp" | "email" | "note" | "meeting" | "call";
      title: string;
      body?: string;
      contact_id?: string;
      status?: "completed" | "scheduled";
      metadata?: Record<string, unknown>;
    }) =>
      apiPost<{ activity: any }>("/activities", {
        status: "completed",
        completed_at: new Date().toISOString(),
        ...input,
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["activities-feed"] });
      if (vars.contact_id) {
        qc.invalidateQueries({ queryKey: ["contact", vars.contact_id, "activities"] });
      }
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

export type ApiCall = {
  id: string;
  contact_id: string | null;
  contact_name?: string | null;
  contact_title?: string | null;
  company_name?: string | null;
  direction: string | null;
  outcome: string | null;
  duration_seconds: number | null;
  ai_insights: any;
  coaching_notes: string | null;
  created_at: string;
};

export function useCalls(params?: { contact_id?: string; limit?: number }) {
  const qs = params
    ? "?" + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))).toString()
    : "";
  return useQuery({
    queryKey: ["calls", params],
    queryFn: async () => {
      const r = await apiFetch<any>(`/calls${qs}`);
      return Array.isArray(r) ? { calls: r as ApiCall[] } : (r as { calls: ApiCall[] });
    },
    staleTime: 30_000,
  });
}

export function useForgottenLeads() {
  return useQuery({
    queryKey: ["forgotten-leads"],
    queryFn: () => apiFetch<{ leads: any[]; summary: string | null }>("/ai/forgotten-leads"),
    staleTime: 120_000,
  });
}

// ---------- Signals (per-contact) ----------
export type ApiSignal = {
  id: string;
  contact_id: string | null;
  contact_name?: string | null;
  company_name?: string | null;
  title: string;
  body: string | null;
  score: number;
  type: string | null;
  source?: string | null;
  created_at?: string;
};

export function useSignals(params?: { contact_id?: string; limit?: number }) {
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]),
        ),
      ).toString()
    : "";
  return useQuery({
    queryKey: ["signals", params],
    queryFn: async () => {
      const r = await apiFetch<any>(`/signals${qs}`);
      return Array.isArray(r) ? { signals: r as ApiSignal[] } : (r as { signals: ApiSignal[] });
    },
    staleTime: 60_000,
  });
}

// ---------- Contact lists ----------
export type ApiList = { id: string; name: string; color?: string | null; smart?: boolean };

export function useContactLists(contactId?: string) {
  return useQuery({
    queryKey: ["contact", contactId, "lists"],
    queryFn: () => apiFetch<{ lists: ApiList[] }>(`/contacts/${contactId}/lists`),
    enabled: !!contactId,
    staleTime: 60_000,
  });
}

// ---------- Custom properties ----------
export type ApiProperty = {
  id: string;
  object_type: string;
  key: string;
  label: string;
  type: string;
  options?: string[] | null;
};
export type ApiPropertyValue = { id: string; property_id: string; entity_id: string; value: any };

export function useProperties(objectType: string) {
  return useQuery({
    queryKey: ["properties", objectType],
    queryFn: () => apiFetch<{ properties: ApiProperty[] }>(`/properties?object_type=${objectType}`),
    staleTime: 5 * 60_000,
  });
}

export function usePropertyValues(entityId?: string) {
  return useQuery({
    queryKey: ["property-values", entityId],
    queryFn: () => apiFetch<{ values: ApiPropertyValue[] }>(`/properties/values/${entityId}`),
    enabled: !!entityId,
    staleTime: 60_000,
  });
}

export function useUpsertPropertyValue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { property_id: string; entity_id: string; value: any }) =>
      apiPost<ApiPropertyValue>("/properties/values", input),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["property-values", vars.entity_id] });
    },
  });
}

// ---------- Contact AI overview ----------
export type ContactOverviewResult = {
  summary?: string;
  engagement_score?: number;
  strengths?: string[];
  risks?: string[];
  talking_points?: string[];
  recommendations?: Array<{ priority?: string; title?: string; rationale?: string }>;
};

export function useContactOverview() {
  return useMutation({
    mutationFn: (contactId: string) =>
      apiPost<ContactOverviewResult>(`/ai/contacts/${contactId}/overview`, {}),
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

// ── Marketing ──────────────────────────────────────────────────────────────
export type ApiCampaign = {
  id: string;
  name: string;
  status: string;
  channel: string | null;
  subject?: string | null;
  content?: string | null;
  goal?: string | null;
  audience_filter?: any;
  ai_generated?: boolean;
  created_at: string;
  sent_count?: number;
  open_count?: number;
  click_count?: number;
};

export function useCampaigns() {
  return useQuery<{ campaigns: ApiCampaign[] }>({
    queryKey: ["campaigns"],
    queryFn: () => apiFetch("/campaigns"),
  });
}

export type MarketingAnalytics = {
  totals?: {
    campaigns?: number;
    sent?: number;
    opens?: number;
    clicks?: number;
    open_rate?: number;
    click_rate?: number;
  };
  recent?: Array<{ id: string; name: string; sent: number; opens: number; clicks: number }>;
};

export function useMarketingAnalytics() {
  return useQuery<MarketingAnalytics>({
    queryKey: ["marketing-analytics"],
    queryFn: () => apiFetch("/marketing/analytics"),
  });
}

export function useGenerateAiStrategy() {
  return useMutation({
    mutationFn: (input: { goal: string; audience: string; budget?: string; platforms?: string[] }) =>
      apiPost<any>("/campaigns/ai-strategy", input),
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      channel: string;
      goal?: string;
      audience_filter?: any;
      subject?: string;
      content?: string;
      status?: string;
    }) => apiPost<ApiCampaign>("/campaigns", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Partial<ApiCampaign>) =>
      apiPost<ApiCampaign>(`/campaigns/${id}`, body, "PATCH"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useGenerateCampaignContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; audience?: string; goal?: string; tone?: string }) =>
      apiPost<ApiCampaign>(`/campaigns/${id}/generate-content`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useSendCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPost<{ sent: number; failed: number }>(`/campaigns/${id}/send`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useDormantMessage() {
  return useMutation({
    mutationFn: (input: { contact: any; dormant_days?: number }) =>
      apiPost<{
        whatsapp_message: string;
        email_subject: string;
        email_body: string;
        platform_recommendation: string;
        reason: string;
        urgency: string;
      }>("/campaigns/dormant-message", input),
  });
}

// ---------- Activities feed (used for Comms unified inbox) ----------
export type ApiActivityFeed = {
  id: string;
  contact_id: string | null;
  contact_name?: string | null;
  type: string;
  title: string | null;
  body: string | null;
  status: string | null;
  created_at: string;
};

export function useActivitiesFeed(params?: { type?: string; limit?: number }) {
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]),
        ),
      ).toString()
    : "";
  return useQuery({
    queryKey: ["activities", params],
    queryFn: () => apiFetch<ApiActivityFeed[]>(`/activities${qs}`),
    staleTime: 30_000,
  });
}

// ---------- Single call detail (transcript + sentiment + AI insights) ----------
export type ApiCallDetail = {
  id: string;
  contact_id: string | null;
  contact_name?: string | null;
  direction: string | null;
  status: string | null;
  duration_seconds: number | null;
  recording_url: string | null;
  transcript: string | null;
  sentiment_score: number | null;
  call_score: number | null;
  ai_insights: any;
  coaching_notes: string | null;
  outcome: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
};

export function useCall(id?: string) {
  return useQuery({
    queryKey: ["call", id],
    queryFn: () => apiFetch<ApiCallDetail>(`/calls/${id}`),
    enabled: !!id,
  });
}

// ---------- Business cards ----------
export type ApiBusinessCard = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  title?: string | null;
  raw_text?: string | null;
  image_url?: string | null;
  enriched?: boolean;
  created_at?: string;
};

export function useBusinessCards() {
  return useQuery({
    queryKey: ["business-cards"],
    queryFn: () => apiFetch<{ scans: ApiBusinessCard[] }>("/business-cards/recent"),
    staleTime: 30_000,
  });
}

export function useScanBusinessCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { image_data_url: string }) =>
      apiPost<{ extracted: any; model?: string }>("/business-cards/scan", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business-cards"] }),
  });
}

export function useSaveBusinessCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => apiPost<{ contact_id: string; company_id?: string; duplicate?: boolean }>(
      "/business-cards/save",
      input,
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business-cards"] }),
  });
}

// ---------- Insights / analytics ----------
export type ForecastResp = {
  likely: number;
  best: number;
  worst: number;
  target: number;
  confidence: number;
  monthly?: { date: string; value: number; label: string }[];
};

type RawForecast = {
  current_quarter_target: number;
  current_quarter_likely: number;
  current_quarter_best_case: number;
  current_quarter_worst_case: number;
  confidence: number;
  monthly_projections?: { date: string; value: number; label: string }[];
};

export function useForecast() {
  return useQuery<ForecastResp>({
    queryKey: ["forecast"],
    queryFn: async () => {
      const r = await apiFetch<RawForecast>("/analytics/forecast");
      return {
        target: r.current_quarter_target,
        likely: r.current_quarter_likely,
        best: r.current_quarter_best_case,
        worst: r.current_quarter_worst_case,
        confidence: r.confidence,
        monthly: r.monthly_projections,
      };
    },
    staleTime: 60_000,
  });
}

export type RevenueTrendPoint = { date: string; value: number };

export function useRevenueTrend(period: "7d" | "30d" | "90d" | "1y" = "30d") {
  return useQuery<RevenueTrendPoint[]>({
    queryKey: ["revenue-trend", period],
    queryFn: () => apiFetch(`/analytics/revenue-trend?period=${period}`),
    staleTime: 60_000,
  });
}

export type CallStats = {
  total_calls: number;
  avg_duration_seconds: number;
  avg_call_score: number;
  avg_sentiment: number;
  calls_by_day: { date: string; value: number }[];
};

export function useCallStats() {
  return useQuery<CallStats>({
    queryKey: ["call-stats"],
    queryFn: () => apiFetch("/analytics/call-stats"),
    staleTime: 60_000,
  });
}

// ---------- Enrichment ----------
export type EnrichmentSource = {
  id: string;
  source_id: string;
  name: string;
  enabled: boolean;
  priority: number;
  status?: string | null;
  category?: string | null;
  has_key?: boolean;
  capabilities?: string[];
};

export function useEnrichmentSources() {
  return useQuery({
    queryKey: ["enrichment-sources"],
    queryFn: () => apiFetch<{ sources: EnrichmentSource[] }>("/enrichment/sources"),
    staleTime: 60_000,
  });
}

export function useEnrichmentRuns() {
  return useQuery({
    queryKey: ["enrichment-runs"],
    queryFn: () => apiFetch<{ runs: any[] }>("/enrichment/runs"),
    staleTime: 30_000,
  });
}

export function useRunWaterfall() {
  return useMutation({
    mutationFn: (seed: { full_name?: string; company?: string; email?: string; domain?: string; linkedin?: string }) =>
      apiPost<{ run: any; result: any }>("/enrichment/run", { seed }),
  });
}

export function useResearchProspect() {
  return useMutation({
    mutationFn: (input: { company?: string; person?: string; topic?: string }) =>
      apiPost<{ summary: string; sources?: any[] }>("/prospects/research", input),
  });
}

export function useSignalsFeed(limit = 30) {
  return useQuery({
    queryKey: ["signals-feed", limit],
    queryFn: () => apiFetch<any[]>(`/signals?limit=${limit}`),
    staleTime: 60_000,
  });
}

// ---------- AI Assistant ----------
export type AssistantHistoryItem = { role: "user" | "assistant"; text: string };
export type AssistantProvider = "auto" | "anthropic" | "openai" | "gemini" | "perplexity";
export type AssistantMode = "chat" | "research" | "analysis" | "command";
export type AssistantTone = "conversational" | "concise" | "coach" | "enthusiastic" | "formal";
export type AssistantFocus = "sales" | "marketing" | "research" | "general";
export type AssistantLanguage = "auto" | "en" | "ar";
export type AssistantAccent = "saudi" | "uae" | "egyptian" | "default";

export type AssistantAction = {
  kind: "open" | "start_call" | "draft_email" | "draft_whatsapp" | "run_research";
  label: string;
  path?: string;
  payload?: Record<string, unknown>;
};

export type AssistantChatResponse = {
  reply: string;
  provider_used?: string;
  actions?: AssistantAction[];
  data_used?: string[];
};

export function useAssistantSend() {
  return useMutation({
    mutationFn: (input: {
      message: string;
      provider?: AssistantProvider;
      mode?: AssistantMode;
      tone?: AssistantTone;
      focus?: AssistantFocus;
      language?: AssistantLanguage;
      accent?: AssistantAccent;
      agent_name?: string;
      history?: AssistantHistoryItem[];
    }) => apiPost<AssistantChatResponse>("/assistant/chat", input),
  });
}

export function useAssistantTranscribe() {
  return useMutation({
    mutationFn: (input: { audio_base64: string; mime?: string; language?: string }) =>
      apiPost<{ text: string; language?: string }>("/assistant/transcribe", input),
  });
}
