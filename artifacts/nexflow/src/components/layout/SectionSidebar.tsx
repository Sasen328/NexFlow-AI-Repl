import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { findSectionByRoute, ROLE_NAV, type SectionDef } from "@/lib/sections";
import { getRole } from "@/lib/marketing-auth";

const COLLAPSE_KEY = "nf:sidebar:collapsed";

function readCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(COLLAPSE_KEY) === "1"; } catch { return false; }
}
function writeCollapsed(v: boolean) {
  try { window.localStorage.setItem(COLLAPSE_KEY, v ? "1" : "0"); } catch { /* noop */ }
  window.dispatchEvent(new CustomEvent("nf:sidebar-collapsed-change", { detail: v }));
}

/**
 * Vertical sub-navigation rail. Replaces the old horizontal SectionTabStrip.
 *  - Top bar still shows the 6 main tabs.
 *  - This rail shows the active section's items as a left column on lg+.
 *  - Below lg, a collapsible disclosure renders the same items so sub-nav
 *    discoverability is preserved on tablet/mobile.
 *
 * Suppression rules mirror the old SectionTabStrip:
 *  - hidden on /home (which has its own in-page tab strip)
 *  - hidden if the section isn't in the current persona's allowed nav
 *  - hidden under marketing top nav
 */
export function SectionSidebar() {
  const [location] = useLocation();
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
  if (!section.items.length) return null;
  if (roleKey === "marketing") return null;

  const allowedKeys = ROLE_NAV[roleKey];
  if (allowedKeys && !allowedKeys.includes(section.key)) return null;

  return (
    <>
      <DesktopSidebar section={section} location={location} />
      <MobileSubnav section={section} location={location} />
    </>
  );
}

function DesktopSidebar({ section, location }: { section: SectionDef; location: string }) {
  const Icon = section.icon;
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed);
  useEffect(() => {
    const refresh = () => setCollapsed(readCollapsed());
    window.addEventListener("nf:sidebar-collapsed-change", refresh as EventListener);
    return () => window.removeEventListener("nf:sidebar-collapsed-change", refresh as EventListener);
  }, []);
  const toggle = () => { const v = !collapsed; setCollapsed(v); writeCollapsed(v); };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-shrink-0 flex-col border-r border-border/30 bg-background/60 backdrop-blur-md sticky self-start z-20 transition-all duration-200",
        collapsed ? "w-[56px]" : "w-[232px]",
      )}
      style={{ top: "5.5rem", height: "calc(100vh - 5.5rem)" }}
      aria-label={`${section.label} navigation`}
    >
      <div className={cn("border-b border-border/30 flex items-center gap-2", collapsed ? "px-2 py-3 justify-center" : "px-4 py-4")}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${section.accent}25` }}
          title={collapsed ? section.label : undefined}
        >
          <Icon className="w-4 h-4" style={{ color: section.accent }} />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-foreground truncate">{section.label}</div>
            {section.tagline && (
              <div className="text-[11px] text-muted-foreground truncate">{section.tagline}</div>
            )}
          </div>
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={toggle}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 flex-shrink-0"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}
      </div>
      <nav className={cn("flex-1 overflow-y-auto py-3 space-y-0.5", collapsed ? "px-1" : "px-2")}>
        {renderItems(section, location, collapsed)}
      </nav>
      {collapsed && (
        <button
          type="button"
          onClick={toggle}
          className="m-2 mt-auto h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-border/30"
          title="Expand sidebar"
          aria-label="Expand sidebar"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      )}
    </aside>
  );
}

/**
 * Render section.items, inserting a small group header divider whenever
 * an item declares a `group` that differs from the previous one.
 */
function renderItems(section: SectionDef, location: string, collapsed = false) {
  const out: React.ReactNode[] = [];
  let lastGroup: string | undefined = undefined;
  section.items.forEach((item, i) => {
    if (item.group && item.group !== lastGroup) {
      out.push(
        collapsed ? (
          <div key={`group-${item.group}-${i}`} className="my-2 mx-3 h-px bg-border/40" aria-hidden="true" />
        ) : (
          <div
            key={`group-${item.group}-${i}`}
            className="px-2.5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70"
          >
            {item.group}
          </div>
        ),
      );
      lastGroup = item.group;
    } else if (!item.group && lastGroup !== undefined) {
      lastGroup = undefined;
    }
    out.push(
      <SidebarItem key={item.href} item={item} location={location} accent={section.accent} collapsed={collapsed} />,
    );
  });
  return out;
}

function MobileSubnav({ section, location }: { section: SectionDef; location: string }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;
  useEffect(() => { setOpen(false); }, [location]);

  const active = section.items.find((it) => {
    const itemPath = it.href.split("#")[0];
    return location === itemPath || (itemPath !== "/" && location.startsWith(itemPath + "/"));
  });

  return (
    <div
      className="lg:hidden border-b border-border/30 bg-background/80 backdrop-blur-md sticky z-20"
      style={{ top: "5.5rem" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left"
        aria-expanded={open}
        aria-controls="section-subnav-list"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${section.accent}25` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: section.accent }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] text-muted-foreground leading-tight">{section.label}</div>
          <div className="text-[14px] font-semibold text-foreground truncate leading-tight">
            {active ? active.label : "Overview"}
          </div>
        </div>
        <ChevronDown
          className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <nav
          id="section-subnav-list"
          className="px-2 pb-2 space-y-0.5 max-h-[60vh] overflow-y-auto"
          aria-label={`${section.label} navigation`}
        >
          {renderItems(section, location)}
        </nav>
      )}
    </div>
  );
}

function SidebarItem({
  item,
  location,
  accent,
  collapsed = false,
}: {
  item: SectionDef["items"][number];
  location: string;
  accent: string;
  collapsed?: boolean;
}) {
  const ItemIcon = item.icon;
  const itemPath = item.href.split("?")[0].split("#")[0];
  const active =
    location === itemPath || (itemPath !== "/" && location.startsWith(itemPath + "/"));

  return (
    <Link
      href={item.href}
      title={collapsed ? `${item.label} — ${item.desc}` : item.desc}
      aria-label={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "w-full flex items-center rounded-lg text-[13px] font-medium text-left transition-all no-underline",
        collapsed ? "justify-center px-2 py-2.5" : "gap-2.5 px-2.5 py-2",
        active
          ? "text-white shadow-sm"
          : "text-foreground/70 hover:text-foreground hover:bg-muted/50",
      )}
      style={
        active
          ? {
              background: `linear-gradient(135deg, ${accent}, #B8A0C8)`,
              boxShadow: `0 4px 12px ${accent}40`,
            }
          : undefined
      }
    >
      <ItemIcon className={cn("flex-shrink-0", collapsed ? "w-4 h-4" : "w-3.5 h-3.5")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
