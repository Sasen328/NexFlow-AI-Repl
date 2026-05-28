import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { ME, QPULSE_COLS } from "@/lib/mesh-engine";
import { applyVars } from "@/lib/palette";
import { flashTheme } from "@/lib/theme-flash";

export interface ThemeDrawerProps {
  dark: boolean;
  onDark: (v: boolean) => void;
}

/**
 * ThemeDrawer — QPulse Design System §10.4 Theme Switcher
 *
 * Right-edge fixed panel. Opens via CustomEvent("nf:theme-drawer-open").
 * Displays the QPulse palette swatch (live animated ME() canvas) and a
 * Light / Dark mode toggle. Toggle runs the full 9-step palette-switch
 * checklist from the design system spec.
 */
export function ThemeDrawer({ dark, onDark }: ThemeDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [swatchHovered, setSwatchHovered] = useState(false);
  const swatchRef = useRef<HTMLCanvasElement | null>(null);
  const engRef = useRef<ReturnType<typeof ME> | null>(null);

  // Open via event dispatched by TopBar ⊙ button
  useEffect(() => {
    const onOpen = () => setIsOpen(true);
    window.addEventListener("nf:theme-drawer-open", onOpen);
    return () => window.removeEventListener("nf:theme-drawer-open", onOpen);
  }, []);

  // Escape key closes
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // QPulse swatch canvas — starts on mount, cleaned up on unmount
  useEffect(() => {
    const canvas = swatchRef.current;
    if (!canvas) return;
    const eng = ME(canvas, QPULSE_COLS, 0.018, 42, 4);
    eng.s();
    engRef.current = eng;
    return () => {
      eng.x();
      engRef.current = null;
    };
  }, []);

  /**
   * §10.4 — Full 9-step palette-switch checklist.
   * Called whenever the mode toggle is clicked.
   */
  function applyTheme(isDark: boolean) {
    // Step 1: Flash overlay — first stop colour of QPulse palette
    flashTheme(184, 160, 200);

    // Step 2: Mark active theme on drawer UI + update App dark state
    onDark(isDark);

    // Step 3: Set all 12 CSS variables on :root
    applyVars(isDark);

    // Step 4: Text nodes handled automatically via CSS custom properties

    // Step 5: Notify Solid button canvases to restart their ME() engines
    window.dispatchEvent(new CustomEvent("nf:theme-change", { detail: { isDark } }));

    // Step 6: Badges update automatically via var(--ac)

    // Step 7: Preview engine — N/A for QPulse (swatch engine is independent)

    // Step 8: LivingMesh background engine is protected — do NOT touch it

    // Step 9: Persist to sessionStorage
    sessionStorage.setItem("activePalIdx",  "0");
    sessionStorage.setItem("activePalName", "QPulse");
    sessionStorage.setItem("activePalCols", JSON.stringify(QPULSE_COLS));
    sessionStorage.setItem("nf:dark",       String(isDark));
  }

  return (
    <>
      {/* Backdrop — click closes, z-index below drawer */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 997,
          background: "rgba(0,0,0,.30)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity .3s cubic-bezier(.4,0,.2,1)",
        }}
        aria-hidden
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Appearance settings"
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          width: "320px",
          zIndex: 998,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform .3s cubic-bezier(.4,0,.2,1)",
          background: "var(--surf)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderLeft: "1px solid var(--bd)",
          boxShadow: "-6px 0 24px rgba(0,0,0,.06)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Header (42px) ─────────────────────────────────────── */}
        <div
          style={{
            height: "42px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            borderBottom: "1px solid var(--bd)",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--tx)",
              fontFamily: "'Geist', 'Inter', sans-serif",
              flex: 1,
            }}
          >
            Appearance
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close appearance panel"
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
              padding: 0,
              flexShrink: 0,
            }}
          >
            <X style={{ width: "11px", height: "11px" }} />
          </button>
        </div>

        {/* ── Content ───────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>

          {/* §1: Palette section */}
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                fontSize: "9px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--btx)",
                marginBottom: "12px",
                fontFamily: "'Geist', 'Inter', sans-serif",
              }}
            >
              Brand Palette
            </div>

            {/* Swatch card */}
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "6px",
              }}
            >
              <div
                onMouseEnter={() => setSwatchHovered(true)}
                onMouseLeave={() => setSwatchHovered(false)}
                style={{
                  borderRadius: "var(--r-card)",
                  overflow: "hidden",
                  width: "80px",
                  height: "48px",
                  position: "relative",
                  cursor: "default",
                  boxShadow: "var(--shadow-swatch)",
                  transform: swatchHovered ? "scale(1.04)" : "scale(1)",
                  transition: "transform .18s, box-shadow .18s",
                }}
              >
                <canvas
                  ref={swatchRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: "'Geist', 'Inter', sans-serif",
                  color: "var(--txM)",
                  lineHeight: 1,
                }}
              >
                QPulse
              </span>
            </div>
          </div>

          {/* §2: Mode section */}
          <div>
            <div
              style={{
                fontSize: "9px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--btx)",
                marginBottom: "12px",
                fontFamily: "'Geist', 'Inter', sans-serif",
              }}
            >
              Mode
            </div>

            {/* Toggle row: Light — [switch] — Dark */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontFamily: "'Geist', 'Inter', sans-serif",
                  color: !dark ? "var(--tx)" : "var(--txM)",
                  fontWeight: !dark ? 600 : 400,
                  transition: "color .2s",
                  userSelect: "none",
                }}
              >
                Light
              </span>

              {/* Pill toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={dark}
                aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                onClick={() => applyTheme(!dark)}
                style={{
                  width: "38px",
                  height: "22px",
                  borderRadius: "11px",
                  border: "1px solid var(--bd)",
                  background: dark ? "var(--ac)" : "var(--tint)",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background .3s cubic-bezier(.4,0,.2,1), border-color .3s",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: dark ? "18px" : "3px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,.22)",
                    transition: "left .3s cubic-bezier(.4,0,.2,1)",
                    display: "block",
                  }}
                />
              </button>

              <span
                style={{
                  fontSize: "12px",
                  fontFamily: "'Geist', 'Inter', sans-serif",
                  color: dark ? "var(--tx)" : "var(--txM)",
                  fontWeight: dark ? 600 : 400,
                  transition: "color .2s",
                  userSelect: "none",
                }}
              >
                Dark
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
