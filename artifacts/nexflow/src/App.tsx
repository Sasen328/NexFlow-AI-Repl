import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { isSignedIn } from "@/lib/marketing-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LivingMesh } from "@/components/layout/LivingMesh";
import { TopBar } from "@/components/layout/TopBar";
import { SectionSidebar } from "@/components/layout/SectionSidebar";
import { AIAssistantBubble } from "@/components/AIAssistantBubble";
import { CaptchaAlert } from "@/components/CaptchaAlert";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import WelcomePage from "@/pages/marketing/Welcome";
import AboutPage from "@/pages/marketing/About";
import PricingPage from "@/pages/marketing/Pricing";
import BrandPage from "@/pages/marketing/Brand";
import AuthPage from "@/pages/marketing/Auth";
import EnterprisePage from "@/pages/marketing/Enterprise";
import { useState } from "react";
import { WizardProvider } from "@/pages/onboarding/context";
import { useTenantConfig, applyTenantBranding } from "@/hooks/useTenantConfig";
import { useTheme } from "@/hooks/useTheme";

import Briefing from "@/pages/briefing";
import SectionHubPage from "@/pages/section-hub";
import Dashboard from "@/pages/dashboard";
import ContactsPage from "@/pages/contacts";
import ContactProfilePage from "@/pages/contact-profile";
import CompaniesPage from "@/pages/companies";
import CompanyDetailPage from "@/pages/company-detail";
import DealsPage from "@/pages/deals";
import SignalsPage from "@/pages/signals";
import ActivitiesPage from "@/pages/activities";
import CallsPage from "@/pages/calls";
import ScriptsPage from "@/pages/scripts";
import SegmentsPage from "@/pages/segments";
import NotificationsPage from "@/pages/notifications";
import AnalyticsPage from "@/pages/analytics";
import AiPage from "@/pages/ai";
import IntelligencePage from "@/pages/intelligence";
import WhatsAppPage from "@/pages/whatsapp";
import AutomationPage from "@/pages/automation";
import { Redirect } from "wouter";
import TeamPage from "@/pages/team";
import EmailPage from "@/pages/email";
import SourcingPage from "@/pages/sourcing";
import VoiceAgentsPage from "@/pages/voice-agents";
import PropertiesPage from "@/pages/properties";
import ListsPage from "@/pages/lists";
import ListDetailPage from "@/pages/list-detail";
import FunnelPage from "@/pages/funnel";
import PipelinePage from "@/pages/pipeline";
import DealPipelinePage from "@/pages/deal-pipeline";
import CrmDashboardPage from "@/pages/crm-dashboard";
import CommandCenterPage from "@/pages/command-center";
import EngagementPage from "@/pages/engagement";
import CallListPage from "@/pages/call-list";
import DashboardsPage from "@/pages/dashboards";
import DashboardDetailPage from "@/pages/dashboard-detail";
import InsightsPage from "@/pages/insights";
import CampaignsPage from "@/pages/campaigns";
import ChannelsPage from "@/pages/channels";
import AgentBuilderPage from "@/pages/agent-builder";
import MessagesPage from "@/pages/messages";
import TemplatesPage from "@/pages/templates";
import AudiencesPage from "@/pages/audiences";
import ReportsPage from "@/pages/reports";
import PredictivePage from "@/pages/predictive";
import CulturalIntelligencePage from "@/pages/cultural-intelligence";
import SettingsPage from "@/pages/settings";
import SequencesPage from "@/pages/sequences";
import QuotesPage from "@/pages/quotes";
import ForecastingPage from "@/pages/forecasting";
import MeetingsPage from "@/pages/meetings";
import ConversationIntelligencePage from "@/pages/conversation-intelligence";
import PostCallAutomationPage from "@/pages/post-call-automation";
import ContactCenterSetupPage from "@/pages/contact-center-setup";
import WorkflowsPage from "@/pages/workflows";
import BusinessCardsPage from "@/pages/business-cards";
import AccountsPage from "@/pages/accounts";
import TrustCenterPage from "@/pages/trust-center";
import HealthScoresPage from "@/pages/health-scores";
import LeadRoutingPage from "@/pages/lead-routing";
import WebFormsPage from "@/pages/web-forms";
import DocumentTrackingPage from "@/pages/document-tracking";
import QuoteToCashPage from "@/pages/quote-to-cash";
import MigrationPage from "@/pages/migration";
import PlaybooksPage from "@/pages/playbooks";
import AttributionPage from "@/pages/attribution";
import ActivityCapturePage from "@/pages/activity-capture";
import CallRedactionPage from "@/pages/call-redaction";
import PublicTrustPage from "@/pages/public-trust";
import DedupPage from "@/pages/dedup";
import LeadEnrichPage from "@/pages/lead-enrich";
import EnrichmentEnginePage from "@/pages/enrichment-engine";
import DataHubAiAnalyticsPage from "@/pages/datahub-ai-analytics";
import IcpRulesPage from "@/pages/icp-rules";
import ApprovalsPage from "@/pages/approvals";
import MarketingAssistantPage from "@/pages/marketing-assistant";
import AssistantPage from "@/pages/assistant";
import MarketingDashboardPage from "@/pages/marketing-dashboard";
import MarketingHubProPage from "@/pages/marketing-hub-pro";
import CampaignBuilderPage from "@/pages/campaign-builder";
import EmailGeneratorPage from "@/pages/email-generator";
import SequencesAudiencesPage from "@/pages/sequences-audiences";
import CampaignPerformancePage from "@/pages/campaign-performance";
import PowerDialerPage from "@/pages/power-dialer";
import AccountSettingsPage from "@/pages/account-settings";
import PermissionsPage from "@/pages/permissions";
import ReportBuilderPage from "@/pages/report-builder";
import CapabilitiesPage from "@/pages/capabilities";
import InvestorsPage from "@/pages/investors";
// ─── New 6-tab IA wrapper pages (Apr 2026 restructure) ──────────────
import LeadsPipelinePage from "@/pages/leads-pipeline";
import LeadsListsPage from "@/pages/leads-lists";
import LeadsResearchPage from "@/pages/leads-research";
import ForgottenLeadsPage from "@/pages/forgotten-leads";
import CallCenterDashboardPage from "@/pages/callcenter-dashboard";
import CallCenterAgentPage from "@/pages/callcenter-agent";
import CallCenterKnowledgeBasePage from "@/pages/callcenter-knowledge-base";
import CallCenterMessagesPage from "@/pages/callcenter-messages";
import InsightsTeamPage from "@/pages/insights-team";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

function AppLayout() {
  const { dark, setDark } = useTheme();
  const { config } = useTenantConfig();

  useEffect(() => {
    applyTenantBranding(config);
  }, [config]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LivingMesh />
      <TopBar dark={dark} onDark={setDark} />
      <div className="flex flex-1 min-h-0">
        <SectionSidebar />
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 overflow-y-auto relative z-10">
        <Switch>
          {/* ─── New 6-tab IA routes (Apr 2026) ─────────────────────
                Each section has its own URL space. Legacy routes
                (defined further down) remain registered for back-
                compat — old bookmarks, deep links and inbound emails
                continue to work. */}
          {/* Leads */}
          <Route path="/leads"><Redirect to="/leads/pipeline" /></Route>
          <Route path="/leads/pipeline"  component={LeadsPipelinePage} />
          <Route path="/leads/lists"     component={LeadsListsPage} />
          <Route path="/leads/research"  component={LeadsResearchPage} />
          <Route path="/leads/forgotten" component={ForgottenLeadsPage} />
          {/* Call Center */}
          <Route path="/callcenter"><Redirect to="/callcenter/dashboard" /></Route>
          <Route path="/callcenter/dashboard"        component={CallCenterDashboardPage} />
          <Route path="/callcenter/calls"            component={CallsPage} />
          <Route path="/callcenter/agent"            component={CallCenterAgentPage} />
          <Route path="/callcenter/knowledge-base"   component={CallCenterKnowledgeBasePage} />
          <Route path="/callcenter/messages"         component={CallCenterMessagesPage} />
          {/* Data Hub */}
          <Route path="/datahub"><Redirect to="/datahub/ai-analytics" /></Route>
          <Route path="/datahub/ai-analytics" component={DataHubAiAnalyticsPage} />
          <Route path="/datahub/icp-rules"    component={IcpRulesPage} />
          <Route path="/datahub/segments"     component={SegmentsPage} />
          <Route path="/datahub/enrichment"   component={EnrichmentEnginePage} />
          <Route path="/datahub/workforce"    component={AiPage} />
          <Route path="/datahub/signals"      component={SignalsPage} />
          <Route path="/approvals"            component={ApprovalsPage} />
          {/* Insights */}
          <Route path="/insights/dashboards" component={DashboardsPage} />
          <Route path="/insights/reports"    component={ReportsPage} />
          <Route path="/insights/team"       component={InsightsTeamPage} />
          <Route path="/insights/predictive" component={PredictivePage} />

          {/* ─── Legacy routes (kept for back-compat) ──────────── */}
          <Route path="/home" component={Briefing} />
          <Route path="/section/:key" component={SectionHubPage} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/sourcing" component={SourcingPage} />
          <Route path="/voice-agents" component={VoiceAgentsPage} />
          <Route path="/contacts" component={ContactsPage} />
          <Route path="/contacts/:id" component={ContactProfilePage} />
          <Route path="/companies" component={CompaniesPage} />
          <Route path="/companies/:id" component={CompanyDetailPage} />
          <Route path="/deals" component={DealsPage} />
          <Route path="/signals" component={SignalsPage} />
          <Route path="/activities" component={ActivitiesPage} />
          <Route path="/calls" component={CallsPage} />
          <Route path="/call-list" component={CallListPage} />
          <Route path="/whatsapp" component={WhatsAppPage} />
          <Route path="/email" component={EmailPage} />
          <Route path="/scripts" component={ScriptsPage} />
          <Route path="/segments" component={SegmentsPage} />
          <Route path="/lists" component={ListsPage} />
          <Route path="/lists/:id" component={ListDetailPage} />
          <Route path="/properties" component={PropertiesPage} />
          <Route path="/funnel" component={FunnelPage} />
          <Route path="/pipeline" component={PipelinePage} />
          <Route path="/deal-pipeline" component={DealPipelinePage} />
          <Route path="/crm-dashboard" component={CrmDashboardPage} />
          <Route path="/command-center" component={CommandCenterPage} />
          <Route path="/engagement" component={EngagementPage} />
          <Route path="/post-call-automation" component={PostCallAutomationPage} />
          <Route path="/contact-center-setup" component={ContactCenterSetupPage} />
          <Route path="/dashboards" component={DashboardsPage} />
          <Route path="/dashboards/:id" component={DashboardDetailPage} />
          {/* New /insights index → redirect to dashboards. Legacy InsightsPage
              kept available at /insights/legacy for any old deep links. */}
          <Route path="/insights"><Redirect to="/insights/dashboards" /></Route>
          <Route path="/insights/legacy" component={InsightsPage} />
          <Route path="/campaigns" component={CampaignsPage} />
          <Route path="/channels" component={ChannelsPage} />
          <Route path="/agents" component={AgentBuilderPage} />
          <Route path="/notifications" component={NotificationsPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/ai" component={AiPage} />
          <Route path="/intelligence" component={IntelligencePage} />
          <Route path="/automation" component={AutomationPage} />
          <Route path="/assistant" component={AssistantPage} />
          <Route path="/team" component={TeamPage} />
          <Route path="/messages" component={MessagesPage} />
          <Route path="/templates" component={TemplatesPage} />
          <Route path="/audiences" component={AudiencesPage} />
          <Route path="/reports" component={ReportsPage} />
          <Route path="/predictive" component={PredictivePage} />
          <Route path="/cultural-intelligence" component={CulturalIntelligencePage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/sequences" component={SequencesPage} />
          <Route path="/quotes" component={QuotesPage} />
          <Route path="/forecasting" component={ForecastingPage} />
          <Route path="/meetings" component={MeetingsPage} />
          <Route path="/conversation-intelligence" component={ConversationIntelligencePage} />
          <Route path="/workflows" component={WorkflowsPage} />
          <Route path="/business-cards" component={BusinessCardsPage} />
          <Route path="/accounts" component={AccountsPage} />
          <Route path="/trust-center" component={TrustCenterPage} />
          <Route path="/health-scores" component={HealthScoresPage} />
          <Route path="/lead-routing" component={LeadRoutingPage} />
          <Route path="/web-forms" component={WebFormsPage} />
          <Route path="/document-tracking" component={DocumentTrackingPage} />
          <Route path="/quote-to-cash" component={QuoteToCashPage} />
          <Route path="/migration" component={MigrationPage} />
          <Route path="/playbooks" component={PlaybooksPage} />
          <Route path="/attribution" component={AttributionPage} />
          <Route path="/activity-capture" component={ActivityCapturePage} />
          <Route path="/call-redaction" component={CallRedactionPage} />
          <Route path="/public-trust" component={PublicTrustPage} />
          <Route path="/dedup" component={DedupPage} />
          <Route path="/lead-enrich" component={LeadEnrichPage} />
          <Route path="/enrichment-engine" component={EnrichmentEnginePage} />
          <Route path="/enrichment-engine/enrich" component={EnrichmentEnginePage} />
          <Route path="/enrichment-engine/settings" component={EnrichmentEnginePage} />
          <Route path="/search-history"><Redirect to="/enrichment-engine" /></Route>
          <Route path="/marketing-assistant" component={MarketingAssistantPage} />
          {/* New Marketing tab structure (overhaul) */}
          <Route path="/marketing-dashboard" component={MarketingDashboardPage} />
          <Route path="/marketing-hub-pro" component={MarketingHubProPage} />
          <Route path="/campaign-builder" component={CampaignBuilderPage} />
          <Route path="/email-generator" component={EmailGeneratorPage} />
          <Route path="/sequences-audiences" component={SequencesAudiencesPage} />
          <Route path="/campaign-performance" component={CampaignPerformancePage} />
          <Route path="/power-dialer" component={PowerDialerPage} />
          <Route path="/account-settings" component={AccountSettingsPage} />
          <Route path="/account-settings/:section" component={AccountSettingsPage} />
          <Route path="/permissions" component={PermissionsPage} />
          <Route path="/report-builder" component={ReportBuilderPage} />
          <Route path="/capabilities" component={CapabilitiesPage} />
          <Route component={NotFound} />
        </Switch>
        </main>
      </div>
    </div>
  );
}

/**
 * Top-level router. The /investors path is a public-facing data-room
 * landing for outside investors and must NOT inherit the CRM chrome
 * (TopBar / SectionTabStrip), so it is rendered directly here. All other
 * paths fall through to <AppLayout /> which contains the standard CRM nav.
 */
function MarketingRoute({ children }: { children: React.ReactNode }) {
  return <MarketingLayout>{children}</MarketingLayout>;
}

/**
 * Demo gate: anyone trying to access an in-app CRM route without picking a
 * persona is redirected to /signin. The marketing/investor/auth paths above
 * are reached before this gate fires, so they remain public.
 */
function ProtectedAppLayout() {
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!isSignedIn()) navigate("/signin");
  }, [navigate]);
  return <AppLayout />;
}

// ── Onboarding portal — isolated, no CRM chrome ────────────────────────────

const OnboardingLanding  = lazy(() => import("@/pages/onboarding/Landing"));
const OnboardingWizard   = lazy(() => import("@/pages/onboarding/SetupWizard"));
const OnboardingProposal = lazy(() => import("@/pages/onboarding/ProposalView"));
const OnboardingComplete = lazy(() => import("@/pages/onboarding/SetupComplete"));

function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <WizardProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        {children}
      </Suspense>
    </WizardProvider>
  );
}

function RootRoutes() {
  return (
    <Switch>
      {/* ── Enterprise Setup Portal (isolated, no auth required) ── */}
      <Route path="/onboarding">
        <OnboardingShell><OnboardingLanding /></OnboardingShell>
      </Route>
      <Route path="/onboarding/setup">
        <OnboardingShell><OnboardingWizard /></OnboardingShell>
      </Route>
      <Route path="/onboarding/proposal">
        <OnboardingShell><OnboardingProposal /></OnboardingShell>
      </Route>
      <Route path="/onboarding/complete">
        <OnboardingShell><OnboardingComplete /></OnboardingShell>
      </Route>

      <Route path="/investors" component={InvestorsPage} />
      <Route path="/">           <MarketingRoute><WelcomePage /></MarketingRoute></Route>
      <Route path="/welcome">    <MarketingRoute><WelcomePage /></MarketingRoute></Route>
      <Route path="/about">      <MarketingRoute><AboutPage /></MarketingRoute></Route>
      <Route path="/pricing">    <MarketingRoute><PricingPage /></MarketingRoute></Route>
      <Route path="/brand">      <MarketingRoute><BrandPage /></MarketingRoute></Route>
      <Route path="/brand-preview">
        <Suspense fallback={null}>
          {(() => { const C = lazy(() => import("@/pages/BrandPreview")); return <C />; })()}
        </Suspense>
      </Route>
      <Route path="/enterprise">  <MarketingRoute><EnterprisePage /></MarketingRoute></Route>
      <Route path="/signin">     <MarketingRoute><AuthPage mode="signin" /></MarketingRoute></Route>
      <Route path="/signup">     <MarketingRoute><AuthPage mode="signup" /></MarketingRoute></Route>
      <Route component={ProtectedAppLayout} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <RootRoutes />
          {/* Mount the floating AI assistant at the very top of the tree so it
              renders on EVERY page (marketing, auth, investors data-room, and
              every CRM route) in EVERY browser (Safari, Chrome, Edge,
              Firefox — desktop or iPad). The component has its own internal
              `signed-in` gate, so it stays hidden for unauthenticated visitors
              on the marketing pages, but the moment a persona is picked the
              bubble is available across the whole app. */}
          <AIAssistantBubble />
          <CaptchaAlert />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
