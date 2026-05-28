import { useLocation } from "wouter";
import { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft } from "lucide-react";
import { findSectionByRoute, ROLE_NAV, type SectionDef } from "@/lib/sections";
import { getRole } from "@/lib/marketing-auth";
import { useNotifications } from "@/hooks/useApi";

// ── State machine ─────────────────────────────────────────────────────────
type GsbState = "closed" | "open" | "icons";
const GSB_KEY = "nf:gsb:state";
const RAIL_WIDTH: Record<GsbState, string> = {
  closed: "0px",
  open: "232px",
  icons: "28px",
};

function readGsbState(): GsbState {
  if (typeof window === "undefined") return "closed";
  try {
    const v = localStorage.getItem(GSB_KEY);
    if (v === "open" || v === "icons") return v;
  } catch {}
  return "closed";
}
function writeGsbState(v: GsbState) {
  try { localStorage.setItem(GSB_KEY, v); } catch {}
}

// ── Nav item structure ────────────────────────────────────────────────────
type NavNode =
  | { kind: "group"; label: string }
  | { kind: "divider" }
  | { kind: "item"; item: SectionDef["items"][number] };

function buildNavNodes(section: SectionDef): NavNode[] {
  const out: NavNode[] = [];
  let lastGroup: string | undefined;
  for (const item of section.items) {
    if (item.group && item.group !== lastGroup) {
      out.push({ kind: "group", label: item.group });
      lastGroup = item.group;
    } else if (!item.group) {
      lastGroup = undefined;
    }
    out.push({ kind: "item", item });
  }
  return out;
}

// ── Tooltip portal — escapes parent overflow:hidden ───────────────────────
function RailTooltip({
  label,
  anchorEl,
}: {
  label: string;
  anchorEl: HTMLElement | null;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    setPos({ top: rect.top + rect.height / 2, left: rect.right + 7 });
  }, [anchorEl]);

  if (!pos) return null;

  return createPortal(
    <div
      role="tooltip"
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        transform: "translateY(-50%)",
        background: "rgba(0,0,0,.80)",
        color: "#fff",
        fontSize: "10px",
        lineHeight: 1.4,
        borderRadius: "var(--r-tip)",
        padding: "4px 8px",
        whiteSpace: "nowrap",
        zIndex: 9995,
        pointerEvents: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,.22)",
      }}
    >
      {label}
    </div>,
    document.body,
  );
}

// ── Single nav row ────────────────────────────────────────────────────────
function NavItem({
  item,
  location,
  isIcons,
  navigate,
  badge = 0,
}: {
  item: SectionDef["items"][number];
  location: string;
  isIcons: boolean;
  navigate: (href: string) => void;
  badge?: number;
}) {
  const ItemIcon = item.icon;
  const itemPath = item.href.split("?")[0].split("#")[0];
  const active =
    location === itemPath ||
    (itemPath !== "/" && location.startsWith(itemPath + "/"));
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(item.href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(item.href);
        }
      }}
      aria-current={active ? "page" : undefined}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "0 1px",
        height: "36px",
        borderRadius: "var(--r-item)",
        cursor: "pointer",
        background: active
          ? "rgba(255,255,255,.68)"
          : hovered
          ? "var(--tint)"
          : "transparent",
        border: active ? "1px solid var(--bd)" : "1px solid transparent",
        transition: "background .15s, border-color .15s",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      {/* Icon container */}
      <div
        style={{
          width: "26px",
          height: "26px",
          minWidth: "26px",
          borderRadius: "var(--r-icon)",
          background: active ? "rgba(107,78,140,.18)" : "var(--tint)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background .15s",
        }}
      >
        <ItemIcon
          style={{
            width: "13px",
            height: "13px",
            color: active ? "var(--ac)" : "var(--txM)",
          }}
        />
      </div>

      {/* Label — always rendered, animated in/out via opacity + max-width */}
      <span
        style={{
          fontSize: "12px",
          color: active ? "var(--ac)" : "var(--txM)",
          fontWeight: active ? 600 : 400,
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          opacity: isIcons ? 0 : 1,
          maxWidth: isIcons ? "0px" : "180px",
          transition: "opacity .2s cubic-bezier(.4,0,.2,1), max-width .26s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {item.label}
      </span>

      {/* Badge — animated in/out with label */}
      {badge > 0 && (
        <span
          style={{
            minWidth: "15px",
            height: "15px",
            background: "var(--ac)",
            color: "#fff",
            fontSize: "8px",
            fontWeight: 700,
            borderRadius: "9999px",
            padding: "0 4px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            opacity: isIcons ? 0 : 1,
            maxWidth: isIcons ? "0px" : "32px",
            overflow: "hidden",
            transition: "opacity .2s cubic-bezier(.4,0,.2,1), max-width .26s cubic-bezier(.4,0,.2,1)",
          }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}

      {/* Icons-mode tooltip via portal */}
      {isIcons && hovered && (
        <RailTooltip label={item.label} anchorEl={ref.current} />
      )}
    </div>
  );
}

// ── Ctrl button (collapse / close) ────────────────────────────────────────
function CtrlBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: "19px",
        height: "19px",
        borderRadius: "var(--r-ctrl)",
        border: "1px solid var(--bd)",
        background: "var(--tint)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "var(--txM)",
        flexShrink: 0,
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

// ── Desktop rail ──────────────────────────────────────────────────────────
function DesktopRail({
  section,
  location,
  navigate,
  gsbState,
  setState,
  notifData,
}: {
  section: SectionDef;
  location: string;
  navigate: (href: string) => void;
  gsbState: GsbState;
  setState: (s: GsbState) => void;
  notifData: unknown;
}) {
  const SectionIcon = section.icon;
  const isIcons = gsbState === "icons";
  const notifCount: number =
    Array.isArray((notifData as any)?.notifications)
      ? (notifData as any).notifications.filter((n: any) => !n.is_read).length
      : 0;

  const navNodes = useMemo(() => buildNavNodes(section), [section]);

  return (
    <div
      className="glass-rail-desktop"
      style={{
        flexShrink: 0,
        overflow: "hidden",
        height: "100%",
        position: "relative",
        width: RAIL_WIDTH[gsbState],
        transition: "width .26s cubic-bezier(.4,0,.2,1)",
      }}
    >
      {/* Inner — always 232 px wide; clipped by container overflow:hidden */}
      <div
        style={{
          width: "232px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "var(--surf)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderRight: "1px solid var(--bd)",
          boxShadow: "var(--shadow-rail)",
        }}
      >
        {/* Header row */}
        <div
          style={{
            height: "42px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "0 4px",
            borderBottom: "1px solid var(--bd)",
          }}
        >
          {/* Section icon */}
          <div
            style={{
              width: "26px",
              height: "26px",
              minWidth: "26px",
              borderRadius: "var(--r-icon)",
              background: `${section.accent}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <SectionIcon
              style={{ width: "13px", height: "13px", color: section.accent }}
            />
          </div>

          {/* Section label — 9px uppercase, animated in/out */}
          <span
            style={{
              fontSize: "9px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--txM)",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              opacity: isIcons ? 0 : 1,
              maxWidth: isIcons ? "0px" : "160px",
              transition:
                "opacity .2s cubic-bezier(.4,0,.2,1), max-width .26s cubic-bezier(.4,0,.2,1)",
            }}
          >
            {section.label}
          </span>

          {/* Collapse toggle — single ChevronLeft rotates 180° in icons mode */}
          <CtrlBtn
            onClick={() => setState(isIcons ? "open" : "icons")}
            label={isIcons ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              style={{
                width: "11px",
                height: "11px",
                transform: isIcons ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform .26s cubic-bezier(.4,0,.2,1)",
              }}
            />
          </CtrlBtn>

          {/* Close — animated out in icons mode */}
          <div
            style={{
              opacity: isIcons ? 0 : 1,
              maxWidth: isIcons ? "0px" : "19px",
              overflow: "hidden",
              flexShrink: 0,
              transition:
                "opacity .2s cubic-bezier(.4,0,.2,1), max-width .26s cubic-bezier(.4,0,.2,1)",
            }}
          >
            <CtrlBtn onClick={() => setState("closed")} label="Close sidebar">
              <X style={{ width: "11px", height: "11px" }} />
            </CtrlBtn>
          </div>
        </div>

        {/* Scrollable nav */}
        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "6px 2px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
          aria-label={`${section.label} navigation`}
        >
          {navNodes.map((node, i) => {
            if (node.kind === "divider") {
              return (
                <div
                  key={`div-${i}`}
                  style={{
                    height: "1px",
                    background: "var(--bd)",
                    margin: "6px 4px",
                  }}
                />
              );
            }
            if (node.kind === "group") {
              /* In icons mode, group labels collapse to a thin divider */
              return isIcons ? (
                <div
                  key={`grp-${i}`}
                  style={{
                    height: "1px",
                    background: "var(--bd)",
                    margin: "6px 4px",
                  }}
                />
              ) : (
                <div
                  key={`grp-${i}`}
                  style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--txq)",
                    padding: "8px 4px 2px",
                  }}
                >
                  {node.label}
                </div>
              );
            }
            return (
              <NavItem
                key={node.item.href}
                item={node.item}
                location={location}
                isIcons={isIcons}
                navigate={navigate}
                badge={node.item.label === "Notifications" ? notifCount : 0}
              />
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// ── Mobile bottom-sheet (portal, <1024px only) ───────────────────────────
function MobileSheet({
  section,
  location,
  navigate,
  open,
  onClose,
  notifData,
}: {
  section: SectionDef;
  location: string;
  navigate: (href: string) => void;
  open: boolean;
  onClose: () => void;
  notifData: unknown;
}) {
  const notifCount: number =
    Array.isArray((notifData as any)?.notifications)
      ? (notifData as any).notifications.filter((n: any) => !n.is_read).length
      : 0;

  const navNodes = useMemo(() => buildNavNodes(section), [section]);

  if (!open) return null;

  const sheetNavigate = (href: string) => { navigate(href); onClose(); };

  const content = (
    <div className="glass-rail-mobile-overlay">
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.32)",
          zIndex: 9990,
        }}
      />
      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "70vh",
          zIndex: 9991,
          background: "var(--surf)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderTop: "1px solid var(--bd)",
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 -4px 28px rgba(0,0,0,.14)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 12px 8px",
            borderBottom: "1px solid var(--bd)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "9px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--txM)",
              flex: 1,
            }}
          >
            {section.label}
          </span>
          <CtrlBtn onClick={onClose} label="Close">
            <X style={{ width: "11px", height: "11px" }} />
          </CtrlBtn>
        </div>

        {/* Items */}
        <nav
          style={{ overflowY: "auto", padding: "6px 8px 32px", flex: 1 }}
          aria-label={`${section.label} navigation`}
        >
          {navNodes.map((node, i) => {
            if (node.kind === "divider") {
              return (
                <div
                  key={`div-${i}`}
                  style={{
                    height: "1px",
                    background: "var(--bd)",
                    margin: "6px 4px",
                  }}
                />
              );
            }
            if (node.kind === "group") {
              return (
                <div
                  key={`grp-${i}`}
                  style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--txq)",
                    padding: "8px 4px 2px",
                  }}
                >
                  {node.label}
                </div>
              );
            }
            return (
              <NavItem
                key={node.item.href}
                item={node.item}
                location={location}
                isIcons={false}
                navigate={sheetNavigate}
                badge={node.item.label === "Notifications" ? notifCount : 0}
              />
            );
          })}
        </nav>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// ── Root export ───────────────────────────────────────────────────────────
export function SectionSidebar() {
  const [location, navigate] = useLocation();
  const [gsbState, setGsbState] = useState<GsbState>(readGsbState);
  const [roleKey, setRoleKey] = useState(() => getRole().key);
  const { data: notifData } = useNotifications();

  // Role changes (persona switch)
  useEffect(() => {
    const refresh = () => setRoleKey(getRole().key);
    window.addEventListener("nf:role-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("nf:role-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // GSB open / close events from TopBar Sub-Tab Bar
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ label?: string; href?: string }>).detail;
      setGsbState("open");
      writeGsbState("open");
      if (detail?.href) navigate(detail.href);
    };
    const onClose = () => {
      setGsbState("closed");
      writeGsbState("closed");
    };
    window.addEventListener("nf:gsb-open", onOpen);
    window.addEventListener("nf:gsb-close", onClose);
    return () => {
      window.removeEventListener("nf:gsb-open", onOpen);
      window.removeEventListener("nf:gsb-close", onClose);
    };
  }, [navigate]);

  const section = findSectionByRoute(location);

  // Suppression rules
  if (!section) return null;
  if (!section.items.length) return null;
  if (roleKey === "marketing") return null;
  const allowedKeys = ROLE_NAV[roleKey];
  if (allowedKeys && !allowedKeys.includes(section.key)) return null;

  const setState = (s: GsbState) => { setGsbState(s); writeGsbState(s); };

  return (
    <>
      <DesktopRail
        section={section}
        location={location}
        navigate={navigate}
        gsbState={gsbState}
        setState={setState}
        notifData={notifData}
      />
      <MobileSheet
        section={section}
        location={location}
        navigate={navigate}
        open={gsbState === "open"}
        onClose={() => setState("closed")}
        notifData={notifData}
      />
    </>
  );
}
