import { useEffect, useRef } from "react";
import { ME, QPULSE_COLS } from "@/lib/mesh-engine";

/**
 * DesignButton — QPulse Design System §6 Button System
 * 6 variants: solid | ghost | soft | small-solid | small-ghost | small-soft
 *
 * Solid variants render a ME() canvas mesh as their background texture.
 * Ghost and soft variants use CSS token surfaces only.
 * All variants share a pill border-radius and Geist font.
 */
export type DesignButtonVariant =
  | "solid"
  | "ghost"
  | "soft"
  | "small-solid"
  | "small-ghost"
  | "small-soft";

export interface DesignButtonProps {
  variant?: DesignButtonVariant;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
  /** Optional seed override for the canvas engine; defaults to random */
  seed?: number;
}

interface VariantStyle {
  height: string;
  padding: string;
  fontSize: string;
  border: string;
  background: string;
  color: string;
  canvasOpacity?: number;
}

const VARIANT_DEF: Record<DesignButtonVariant, VariantStyle> = {
  "solid": {
    height: "30px",
    padding: "0 14px",
    fontSize: "12px",
    border: "1px solid var(--bd)",
    background: "transparent",
    color: "var(--btx)",
    canvasOpacity: 0.70,
  },
  "ghost": {
    height: "30px",
    padding: "0 14px",
    fontSize: "12px",
    border: "1.5px solid var(--ac)",
    background: "transparent",
    color: "var(--btx)",
  },
  "soft": {
    height: "30px",
    padding: "0 14px",
    fontSize: "12px",
    border: "1px solid var(--bd)",
    background: "var(--tint)",
    color: "var(--btx)",
  },
  "small-solid": {
    height: "25px",
    padding: "0 11px",
    fontSize: "10px",
    border: "1px solid var(--bd)",
    background: "transparent",
    color: "var(--btx)",
    canvasOpacity: 0.65,
  },
  "small-ghost": {
    height: "25px",
    padding: "0 11px",
    fontSize: "10px",
    border: "1px solid var(--ac)",
    background: "transparent",
    color: "var(--btx)",
  },
  "small-soft": {
    height: "25px",
    padding: "0 11px",
    fontSize: "10px",
    border: "1px solid var(--bd)",
    background: "var(--tint)",
    color: "var(--btx)",
  },
};

const SHARED: React.CSSProperties = {
  borderRadius: "var(--r-pill)",
  fontFamily: "'Geist', 'Inter', sans-serif",
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "5px",
  position: "relative",
  overflow: "hidden",
  cursor: "pointer",
  lineHeight: 1,
  whiteSpace: "nowrap",
  transition: "transform .18s cubic-bezier(.4,0,.2,1), box-shadow .18s cubic-bezier(.4,0,.2,1)",
};

export function DesignButton({
  variant = "solid",
  onClick,
  children,
  className,
  disabled = false,
  type = "button",
  style,
  seed: seedProp,
}: DesignButtonProps) {
  const def = VARIANT_DEF[variant];
  const hasCanvas = variant === "solid" || variant === "small-solid";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engRef = useRef<ReturnType<typeof ME> | null>(null);

  // Stable seed per mount
  const seedRef = useRef<number>(seedProp ?? Math.floor(Math.random() * 10000));

  useEffect(() => {
    if (!hasCanvas) return;

    const startEngine = () => {
      engRef.current?.x();
      engRef.current = null;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const eng = ME(canvas, QPULSE_COLS, 0.012, seedRef.current, 4);
      eng.s();
      engRef.current = eng;
    };

    startEngine();

    const onThemeChange = () => startEngine();
    window.addEventListener("nf:theme-change", onThemeChange);

    return () => {
      engRef.current?.x();
      engRef.current = null;
      window.removeEventListener("nf:theme-change", onThemeChange);
    };
  }, [hasCanvas]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = "var(--shadow-btn)";
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "";
    e.currentTarget.style.boxShadow = "";
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        ...SHARED,
        height: def.height,
        padding: def.padding,
        fontSize: def.fontSize,
        border: def.border,
        background: def.background,
        color: def.color,
        ...(disabled
          ? { opacity: 0.46, cursor: "not-allowed", pointerEvents: "none" }
          : {}),
        ...style,
      }}
    >
      {hasCanvas && (
        <canvas
          ref={canvasRef}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity: def.canvasOpacity ?? 0.70,
          }}
        />
      )}
      <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: "5px" }}>
        {children}
      </span>
    </button>
  );
}
