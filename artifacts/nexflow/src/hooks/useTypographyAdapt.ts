/**
 * useTypographyAdapt — Typography Intelligence hook
 * §1.6 + §5 of the QPulse Design System Spec
 *
 * Automatically swaps ALL 12 CSS token values between their light and dark
 * variants whenever the dark mode state changes. This prevents text from
 * becoming invisible against the mesh gradient background.
 *
 * Usage: call this hook in App.tsx passing the `dark` state from useTheme().
 */
import { useEffect } from "react";
import { applyVars } from "@/lib/palette";

export function useTypographyAdapt(dark: boolean): void {
  useEffect(() => {
    applyVars(dark);
  }, [dark]);
}
