/**
 * Theme flash overlay helper — §9.3
 * Flashes the #theme-overlay div at 18% opacity of the incoming colour,
 * then auto-fades at 220ms. Gives tactile feedback on mode/palette switch.
 */
export function flashTheme(r: number, g: number, b: number): void {
  const el = document.getElementById("theme-overlay");
  if (!el) return;
  el.style.background = `rgba(${r},${g},${b},.18)`;
  el.style.opacity = "1";
  setTimeout(() => {
    el.style.opacity = "0";
  }, 220);
}
