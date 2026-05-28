---
name: Tenant branding fallbacks
description: applyTenantBranding must set CSS vars even when config=null; skipping this breaks card "font intelligence" color tinting in dev and fresh environments.
---

## Rule
`applyTenantBranding` in `useTenantConfig.ts` must **never early-return** when `config` is null. It must always write the three CSS custom properties, falling back to NexFlow brand defaults.

## Why
Many components (briefing tiles, enrichment cards, ProsEngine hub cards, marketing KPIs) tint their backgrounds with `${primary}15` or `rgba(var(--nf-tenant-primary), 0.08)`. When `applyTenantBranding` returns early on null config (i.e., dev / fresh browser / no enterprise setup), those CSS vars are never set and the tints are invisible. The UI appears "flat" and colourless — exactly the "font intelligence for background and cards coloring is wrong" complaint.

## How to apply
```ts
export const BRAND_DEFAULTS = {
  primary:   "#B8A0C8",  // ACCENT
  secondary: "#88B8B0",  // TEAL
  accent:    "#C8A880",  // GOLD
} as const;

export function applyTenantBranding(config: TenantConfig | null): void {
  const root = document.documentElement;
  root.style.setProperty("--nf-tenant-primary",   config?.primaryColor   || BRAND_DEFAULTS.primary);
  root.style.setProperty("--nf-tenant-secondary", config?.secondaryColor || BRAND_DEFAULTS.secondary);
  root.style.setProperty("--nf-tenant-accent",    config?.accentColor    || BRAND_DEFAULTS.accent);
}
```

When the user completes the enterprise setup wizard in dev, `useTenantConfig` fires the `nf:tenant-config-changed` event and React re-calls `applyTenantBranding` with the real config, overriding the defaults.
