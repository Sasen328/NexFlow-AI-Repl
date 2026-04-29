import { Link, useLocation } from "wouter";
import { LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { findSectionByRoute, SECTIONS, type SectionDef } from "@/lib/sections";

/**
 * Renders a horizontally-scrollable tab strip for the section the current route
 * belongs to. The first tab is always "Dashboard" → /section/<key>. The remaining
 * tabs are the section's items. Highlighted tab is computed from the current
 * pathname.
 */
export function SectionTabStrip() {
  const [location] = useLocation();
  const section = findSectionByRoute(location);
  if (!section) return null;
  return <SectionTabStripInner section={section} location={location} />;
}

function SectionTabStripInner({ section, location }: { section: SectionDef; location: string }) {
  const dashboardHref = `/section/${section.key}`;
  const isDashboardActive = location === dashboardHref;
  const Icon = section.icon;

  return (
    <div
      className="border-b border-border/30 backdrop-blur-md sticky top-14 z-30"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65))",
      }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 h-12 overflow-x-auto no-scrollbar">
          {/* Section identity chip */}
          <div className="flex items-center gap-2 pr-3 border-r border-border/40 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${section.accent}25` }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: section.accent }} />
            </div>
            <span className="text-[13px] font-bold text-foreground">{section.label}</span>
          </div>

          {/* Dashboard tab — always first */}
          <Link href={dashboardHref}>
            <button
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap flex-shrink-0 transition-all",
                isDashboardActive
                  ? "text-white shadow-sm"
                  : "text-foreground/65 hover:text-foreground hover:bg-muted/50",
              )}
              style={
                isDashboardActive
                  ? {
                      background: `linear-gradient(135deg, ${section.accent}, #B8A0C8)`,
                      boxShadow: `0 4px 12px ${section.accent}40`,
                    }
                  : undefined
              }
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>
          </Link>

          {/* Item tabs */}
          {section.items.map((item) => {
            const ItemIcon = item.icon;
            const active =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href + "/"));
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-all",
                    active
                      ? "text-white shadow-sm"
                      : "text-foreground/65 hover:text-foreground hover:bg-muted/50",
                  )}
                  style={
                    active
                      ? {
                          background: `linear-gradient(135deg, ${section.accent}, #B8A0C8)`,
                          boxShadow: `0 4px 12px ${section.accent}40`,
                        }
                      : undefined
                  }
                >
                  <ItemIcon className="w-3.5 h-3.5" />
                  {item.label}
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
