---
name: Dark mode bootstrap
description: Dark class and tenant CSS vars must be applied eagerly in main.tsx before React renders to avoid flash-of-wrong-color on every page load.
---

## Rule
Apply dark mode class and `applyTenantBranding` in `main.tsx` synchronously — before `createRoot().render()` — not only inside a React `useEffect`.

## Why
`useEffect` fires after the first paint. If dark mode or brand colors are only set there, users see a white flash (or wrong-color flash) on every page reload. This is especially noticeable on the NexFlow home page where the gradient header has `--nf-tenant-primary` in it.

## How to apply
In `src/main.tsx`:
```ts
import { readTenantConfig, applyTenantBranding } from "@/hooks/useTenantConfig";

const storedDark = localStorage.getItem("nf:dark");
const prefersDark = storedDark !== null
  ? storedDark === "true"
  : window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.classList.toggle("dark", prefersDark);
applyTenantBranding(readTenantConfig());

createRoot(document.getElementById("root")!).render(<App />);
```

`AppLayout` in `App.tsx` still manages the React state and writes to `localStorage("nf:dark")` so toggles persist going forward.
