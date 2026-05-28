import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { findSectionByRoute, SECTIONS, ROLE_NAV, type SectionDef } from "@/lib/sections";
import { getRole } from "@/lib/marketing-auth";

/**
 * Renders a horizontally-scrollable tab strip for the section the current
 * route belongs to. For sections whose first item already IS a dashboard
 * (e.g. Home → Daily Briefing, Call Center → Dashboard, Insights →
 * Dashboards), we skip injecting the auto "Dashboard" tab to avoid the
 * "three Dashboards in CRM" duplication bug.
 *
 * For sections that don't already have one, we still inject a "Dashboard"
 * tab pointing at /section/<key>.
 */
const SECTIONS_WITHOUT_DASHBOARD = new Set([
  "home", "callcenter", "leads", "datahub", "marketing", "insights",
  // Legacy keys whose first item already opens a dashboard-like page
  "crm",
]);

export function SectionTabStrip() {
  const [location] = useLocation();
  // Subscribe to persona changes so the strip hides/shows when the user
  // switches role from the avatar menu.
  const [roleKey, setRoleKey] = useState(() => getRole().key);
  useEffect(() => {
    const refresh = () => setRoleKey(getRole().key);
    window.addEventListener("nf:role-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("nf:role-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const section = findSectionByRoute(location);
  if (!section) return null;

  // Marketing has a flat top nav (Home, Campaign Builder, Campaign
  // Performance, MarkHub) so a second-row sub-tab strip would be pure
  // duplication. Skip it for marketing entirely.
  if (roleKey === "marketing") return null;

  // /home has its OWN in-page 4-tab strip (Daily Briefing → Performance
  // → To-Do & Alerts → Insights Dashboard) per the Sales Rep Home spec.
  // Rendering the SectionTabStrip there too produces a duplicated tab row
  // (one above the page content, one below). Suppress the global strip
  // anywhere under /home so only the in-page tabs are visible.
  if (location === "/home" || location.startsWith("/home#")) return null;

  // For other personas, only render the strip when the section it would
  // show belongs to that persona's allowed nav scope. This prevents the
  // strip from appearing on routes outside the persona's journey (e.g.
  // CEO landing on a leftover legacy /signals link should not see the
  // full Data Hub sub-tab strip).
  const allowedKeys = ROLE_NAV[roleKey];
  if (allowedKeys && !allowedKeys.includes(section.key)) return null;

  return <SectionTabStripInner section={section} location={location} />;
}

function SectionTabStripInner({ section, location }: { section: SectionDef; location: string }) {
  const Icon = section.icon;
  const showDashboard = !SECTIONS_WITHOUT_DASHBOARD.has(section.key);
  const dashboardHref = `/section/${section.key}`;
  const dashboardActive =
    location === dashboardHref || location.startsWith(dashboardHref + "/");

  return (
    <div
      className="bar-tab sticky top-[5.5rem] z-30"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-stretch gap-0 h-11 overflow-x-auto no-scrollbar">
          {/* Section identity chip — breadcrumb prefix */}
          <div className="flex items-center gap-2 pr-4 mr-2 border-r border-border/30 flex-shrink-0">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: `${section.accent}20` }}
            >
              <Icon className="w-3 h-3" style={{ color: section.accent }} />
            </div>
            <span className="text-[12px] font-bold" style={{ color: section.accent }}>{section.label}</span>
          </div>

          {/* Dashboard tab — only for sections that don't already have one as
              their first item. */}
          {showDashboard && (
            <Link href={dashboardHref}>
              <button
                className={cn(
                  "relative flex items-center gap-1.5 px-3 h-full text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-all",
                  dashboardActive
                    ? "font-semibold"
                    : "text-foreground/55 hover:text-foreground",
                )}
                style={dashboardActive ? {
                  color: section.accent,
                  background: `${section.accent}10`,
                } : undefined}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
                {dashboardActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-sm"
                    style={{ background: section.accent }} />
                )}
              </button>
            </Link>
          )}

          {/* Item tabs */}
          {section.items.map((item) => {
            const ItemIcon = item.icon;
            const itemPath = item.href.split("#")[0];
            const active =
              location === itemPath ||
              (itemPath !== "/" && location.startsWith(itemPath + "/"));
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 h-full text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-all",
                    active
                      ? "font-semibold"
                      : "text-foreground/55 hover:text-foreground",
                  )}
                  style={active ? {
                    color: section.accent,
                    background: `${section.accent}10`,
                  } : undefined}
                >
                  <ItemIcon className="w-3.5 h-3.5" />
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-sm"
                      style={{ background: section.accent }} />
                  )}
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Convenience export for direct rendering with a known section key. */
export function SectionTabStripFor({ sectionKey }: { sectionKey: string }) {
  const section = SECTIONS.find((s) => s.key === sectionKey);
  const [location] = useLocation();
  if (!section) return null;
  return <SectionTabStripInner section={section} location={location} />;
}
