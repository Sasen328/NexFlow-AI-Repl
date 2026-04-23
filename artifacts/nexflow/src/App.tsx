import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LivingMesh } from "@/components/layout/LivingMesh";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState, useEffect } from "react";

import Dashboard from "@/pages/dashboard";
import ContactsPage from "@/pages/contacts";
import CompaniesPage from "@/pages/companies";
import DealsPage from "@/pages/deals";
import SignalsPage from "@/pages/signals";
import ActivitiesPage from "@/pages/activities";
import CallsPage from "@/pages/calls";
import ScriptsPage from "@/pages/scripts";
import SegmentsPage from "@/pages/segments";
import NotificationsPage from "@/pages/notifications";
import AnalyticsPage from "@/pages/analytics";
import AiPage from "@/pages/ai";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="flex min-h-screen bg-background">
      <LivingMesh />
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} dark={dark} onDark={setDark} />
      <main className="flex-1 min-w-0 p-6 overflow-y-auto relative z-10">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/contacts" component={ContactsPage} />
          <Route path="/companies" component={CompaniesPage} />
          <Route path="/deals" component={DealsPage} />
          <Route path="/signals" component={SignalsPage} />
          <Route path="/activities" component={ActivitiesPage} />
          <Route path="/calls" component={CallsPage} />
          <Route path="/scripts" component={ScriptsPage} />
          <Route path="/segments" component={SegmentsPage} />
          <Route path="/notifications" component={NotificationsPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/ai" component={AiPage} />
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
