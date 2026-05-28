/**
 * QPulse Design System — Palette & Typography Intelligence
 * §1.3 Semantic Token Table · §1.5 Accent Computation · §1.6 Luminance
 *
 * These are the authoritative colour-computation functions.
 * All other modules (useTypographyAdapt, ThemeDrawer) use these.
 */

export type TokenMap = Record<string, string>;

export const LIGHT_TOKENS: TokenMap = {
  "--ac":     "#6B4E8C",
  "--btx":    "#6B4E8C",
  "--tx":     "#1C1A2E",
  "--txM":    "rgba(28,26,46,.58)",
  "--txq":    "rgba(28,26,46,.30)",
  "--bd":     "rgba(0,0,0,.08)",
  "--surf":   "rgba(255,255,255,.70)",
  "--sub-bg": "rgba(255,255,255,.50)",
  "--bar-bg": "rgba(255,255,255,.52)",
  "--glow":   "rgba(0,0,0,.08)",
  "--qa-bg":  "rgba(255,255,255,.62)",
  "--tint":   "rgba(255,255,255,.55)",
};

export const DARK_TOKENS: TokenMap = {
  "--ac":     "#9B80CC",
  "--btx":    "#FFFFFF",
  "--tx":     "#F0EEFF",
  "--txM":    "rgba(240,238,255,.68)",
  "--txq":    "rgba(240,238,255,.38)",
  "--bd":     "rgba(255,255,255,.16)",
  "--surf":   "rgba(0,0,0,.28)",
  "--sub-bg": "rgba(0,0,0,.22)",
  "--bar-bg": "rgba(0,0,0,.20)",
  "--glow":   "rgba(0,0,0,.20)",
  "--qa-bg":  "rgba(255,255,255,.12)",
  "--tint":   "rgba(255,255,255,.08)",
};

/** §1.6 — WCAG relative luminance */
export function getLuminance(r: number, g: number, b: number): number {
  const lin = (v: number) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * §1.6 — Auto-detect dark palette from average luminance.
 * Blends 6% toward near-white to simulate the BG blend effect.
 * Returns true if the palette is dark (L ≤ 0.35).
 */
export function adapt(cols: number[][]): boolean {
  const avg = [0, 1, 2].map(
    (i) => cols.reduce((s, c) => s + c[i], 0) / cols.length
  );
  const mixed = avg.map((v) => Math.round(v * 0.94 + 15));
  const L = getLuminance(mixed[0], mixed[1], mixed[2]);
  return L <= 0.35;
}

/**
 * §1.5 — Extract accent colour from the most-saturated palette stop.
 * Returns [r, g, b] — convert to hex for --ac.
 */
export function palAccent(cols: number[][]): [number, number, number] {
  const sat = (c: number[]) =>
    Math.max(...c) / 255 - Math.min(...c) / 255;
  const best = cols.reduce((a, b) => (sat(a) > sat(b) ? a : b));
  const avg = [0, 1, 2].map(
    (i) => cols.reduce((s, c) => s + c[i], 0) / cols.length
  );
  return avg.map((v, i) =>
    Math.round((v * 0.3 + best[i] * 0.7) * 0.62)
  ) as [number, number, number];
}

/** Convert [r,g,b] to hex string */
export function toHex(rgb: [number, number, number]): string {
  return (
    "#" +
    rgb.map((v) => Math.min(255, Math.max(0, v)).toString(16).padStart(2, "0")).join("")
  );
}

/**
 * Apply the correct token set to :root CSS custom properties.
 * Called on every dark/light mode change.
 * isDark=true → DARK_TOKENS (light text on dark surfaces)
 * isDark=false → LIGHT_TOKENS (dark text on light surfaces)
 */
export function applyVars(isDark: boolean): void {
  if (typeof document === "undefined") return;
  const tokens = isDark ? DARK_TOKENS : LIGHT_TOKENS;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
  }
}

/** Apply tokens immediately on module load — prevents FOUC on first paint */
if (typeof window !== "undefined") {
  applyVars(localStorage.getItem("nf:theme") === "dark");
}
