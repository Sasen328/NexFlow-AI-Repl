import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LivingMesh } from "@/components/layout/LivingMesh";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState, useEffect } from "react";

import Briefing from "@/pages/briefing";
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
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  return (
    <div className="flex min-h-screen bg-background">
      <LivingMesh />
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} dark={dark} onDark={setDark} />
      <main className="flex-1 min-w-0 p-6 overflow-y-auto relative z-10">
        <Switch>
          <Route path="/" component={Briefing} />
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
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppLayout />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
