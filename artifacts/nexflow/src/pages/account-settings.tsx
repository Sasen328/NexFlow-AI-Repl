import { useState, lazy, Suspense, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import {
  Shield, Globe, Lock, Filter, Sparkles, FileSpreadsheet,
  Search, Settings as SettingsIcon, ChevronRight, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Lazy-load existing pages so we can embed them as tabs without duplicating logic
const SettingsPage     = lazy(() => import("@/pages/settings"));
const PermissionsPage  = lazy(() => import("@/pages/permissions"));
const PropertiesPage   = lazy(() => import("@/pages/properties"));
const TrustCenterPage  = lazy(() => import("@/pages/trust-center"));
const CapabilitiesPage = lazy(() => import("@/pages/capabilities"));
const MigrationPage    = lazy(() => import("@/pages/migration"));

function PublicTrustLink() {
  return (
    <div className="glass-card rounded-2xl p-8 text-center">
      <Globe className="w-10 h-10 mx-auto text-[#90B8B8] mb-3" />
      <h2 className="text-lg font-bold mb-2">Customer-facing Trust Page</h2>
      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
        The public trust page is a standalone customer-facing experience. Open it in a new tab to preview what your prospects and customers see.
      </p>
      <a href="/public-trust" target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold">
        Open Public Trust Page <ChevronRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

interface SectionDef {
  key: string;
  label: string;
  icon: any;
  desc: string;
  group: "ACCOUNT" | "DATA & FIELDS" | "SECURITY & TRUST" | "PLATFORM";
  Component?: any;
  href?: string;
}

const SECTIONS: SectionDef[] = [
  { key: "settings",     label: "General",       icon: SettingsIcon, desc: "Profile, organization, integrations, AI, billing", group: "ACCOUNT",          Component: SettingsPage },
  { key: "permissions",  label: "Permissions",   icon: Lock,         desc: "Roles & access control",                            group: "SECURITY & TRUST", Component: PermissionsPage },
  { key: "trust-center", label: "Trust Center",  icon: Shield,       desc: "Internal compliance, SOC2 evidence, audit logs",    group: "SECURITY & TRUST", Component: TrustCenterPage },
  { key: "public-trust", label: "Public Trust",  icon: Globe,        desc: "Customer-facing trust page",                        group: "SECURITY & TRUST", Component: PublicTrustLink },
  { key: "properties",   label: "Custom Properties", icon: Filter,   desc: "Custom fields for contacts, companies, deals",      group: "DATA & FIELDS",    Component: PropertiesPage },
  { key: "migration",    label: "Import / Export",   icon: FileSpreadsheet, desc: "CSV import, bulk export, migration tools",   group: "DATA & FIELDS",    Component: MigrationPage },
  { key: "capabilities", label: "Capabilities",  icon: Sparkles,     desc: "Platform feature inventory",                        group: "PLATFORM",         Component: CapabilitiesPage },
];

const GROUP_ORDER: SectionDef["group"][] = ["ACCOUNT", "DATA & FIELDS", "SECURITY & TRUST", "PLATFORM"];

export default function AccountSettingsPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ section: string }>("/account-settings/:section");
  // Validate the section against the allowed list — invalid keys redirect to "settings"
  const validKeys = SECTIONS.map((s) => s.key);
  const requested = (match && params?.section) ? params.section : "settings";
  const initial = validKeys.includes(requested) ? requested : "settings";
  const [active, setActive] = useState(initial);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (match && params?.section && !validKeys.includes(params.section)) {
      setLocation("/account-settings/settings", { replace: true });
      return;
    }
    if (match && params?.section && params.section !== active) setActive(params.section);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.section]);

  function go(key: string) {
    setActive(key);
    setLocation(`/account-settings/${key}`);
  }

  const current = SECTIONS.find((s) => s.key === active) ?? SECTIONS[0];
  const Component = current.Component;
  const filtered = filter
    ? SECTIONS.filter((s) =>
        s.label.toLowerCase().includes(filter.toLowerCase()) ||
        s.desc.toLowerCase().includes(filter.toLowerCase()))
    : SECTIONS;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Link href="/"><span className="hover:underline cursor-pointer">Home</span></Link>
            <ChevronRight className="w-3 h-3" />
            <span>Account Settings</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{current.label}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#B8A0C8]" />
            Account Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Centralized hub for everything that used to live across the admin nav — settings, permissions, properties, trust, migration, and platform capabilities.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-4">
        {/* Side navigation */}
        <aside className="glass-card rounded-2xl p-3 h-fit lg:sticky lg:top-20">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search settings..."
              className="w-full pl-8 pr-2 py-2 rounded-lg bg-muted/40 border border-border/40 text-xs outline-none focus:bg-background"
            />
          </div>

          {GROUP_ORDER.map((groupName) => {
            const groupItems = filtered.filter((s) => s.group === groupName);
            if (groupItems.length === 0) return null;
            return (
              <div key={groupName} className="mt-3 first:mt-0">
                <div className="px-2 text-[9px] font-black tracking-[0.12em] text-muted-foreground/50 uppercase mb-1">
                  {groupName}
                </div>
                <div className="space-y-0.5">
                  {groupItems.map((s) => {
                    const Icon = s.icon;
                    const isActive = s.key === active;
                    return (
                      <button
                        key={s.key}
                        onClick={() => go(s.key)}
                        className={cn(
                          "w-full flex items-start gap-2 px-2 py-2 rounded-lg text-left transition-all",
                          isActive
                            ? "bg-[#B8A0C8]/10 text-[#B8A0C8]"
                            : "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <Icon className={cn("w-3.5 h-3.5 flex-shrink-0 mt-0.5",
                          isActive ? "text-[#B8A0C8]" : "text-muted-foreground")} />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold leading-tight">{s.label}</div>
                          <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{s.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="min-w-0">
          <Suspense
            fallback={
              <div className="glass-card rounded-2xl p-12 flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading {current.label.toLowerCase()}…
              </div>
            }
          >
            {Component ? <Component /> : <div>Coming soon</div>}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
