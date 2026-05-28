/**
 * useTypographyAdapt — Typography Intelligence hook
 * §1.6 + §5 of the QPulse Design System Spec
 *
 * Automatically swaps ALL 12 CSS token values between their light and dark
 * variants whenever the dark mode state changes. This prevents text from
 * becoming invisible against the mesh gradient background.
 *
 * Uses useLayoutEffect (fires synchronously before paint) so the FIRST render
 * already has the correct tokens applied — no flash of wrong colours.
 *
 * Usage: call this hook in App.tsx passing the `dark` state from useTheme().
 */
import { useLayoutEffect } from "react";
import { applyVars } from "@/lib/palette";

export function useTypographyAdapt(dark: boolean): void {
  useLayoutEffect(() => {
    applyVars(dark);
  }, [dark]);
}
