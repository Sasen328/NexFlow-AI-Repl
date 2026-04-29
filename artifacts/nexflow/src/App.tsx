import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LivingMesh } from "@/components/layout/LivingMesh";
import { TopBar } from "@/components/layout/TopBar";
import { SectionTabStrip } from "@/components/layout/SectionTabStrip";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import WelcomePage from "@/pages/marketing/Welcome";
import AboutPage from "@/pages/marketing/About";
import PricingPage from "@/pages/marketing/Pricing";
import AuthPage from "@/pages/marketing/Auth";
import { useState, useEffect } from "react";

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
import AssistantPage from "@/pages/assistant";
import TeamPage from "@/pages/team";
import EmailPage from "@/pages/email";
import SourcingPage from "@/pages/sourcing";
import VoiceAgentsPage from "@/pages/voice-agents";
import PropertiesPage from "@/pages/properties";
import ListsPage from "@/pages/lists";
import ListDetailPage from "@/pages/list-detail";
import FunnelPage from "@/pages/funnel";
import CallListPage from "@/pages/call-list";
import DashboardsPage from "@/pages/dashboards";
import DashboardDetailPage from "@/pages/dashboard-detail";
import InsightsPage from "@/pages/insights";
import CampaignsPage from "@/pages/campaigns";
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
import MarketingAssistantPage from "@/pages/marketing-assistant";
import PowerDialerPage from "@/pages/power-dialer";
import AccountSettingsPage from "@/pages/account-settings";
import PermissionsPage from "@/pages/permissions";
import ReportBuilderPage from "@/pages/report-builder";
import CapabilitiesPage from "@/pages/capabilities";
import InvestorsPage from "@/pages/investors";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

function AppLayout() {
  const [dark, setDark] = useState(false);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LivingMesh />
      <TopBar dark={dark} onDark={setDark} />
      <SectionTabStrip />
      <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 overflow-y-auto relative z-10 max-w-[1600px] w-full mx-auto">
        <Switch>
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
          <Route path="/dashboards" component={DashboardsPage} />
          <Route path="/dashboards/:id" component={DashboardDetailPage} />
          <Route path="/insights" component={InsightsPage} />
          <Route path="/campaigns" component={CampaignsPage} />
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
          <Route path="/marketing-assistant" component={MarketingAssistantPage} />
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

function RootRoutes() {
  return (
    <Switch>
      <Route path="/investors" component={InvestorsPage} />
      <Route path="/">           <MarketingRoute><WelcomePage /></MarketingRoute></Route>
      <Route path="/welcome">    <MarketingRoute><WelcomePage /></MarketingRoute></Route>
      <Route path="/about">      <MarketingRoute><AboutPage /></MarketingRoute></Route>
      <Route path="/pricing">    <MarketingRoute><PricingPage /></MarketingRoute></Route>
      <Route path="/signin">     <MarketingRoute><AuthPage mode="signin" /></MarketingRoute></Route>
      <Route path="/signup">     <MarketingRoute><AuthPage mode="signup" /></MarketingRoute></Route>
      <Route component={AppLayout} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <RootRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
