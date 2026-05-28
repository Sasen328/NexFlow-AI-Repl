import { useState, useEffect, useCallback } from "react";

export interface TenantConfig {
  companyName: string;
  companyNameAr: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoBase64: string | null;
  enabledModules: string[];
  tabStructure: string[];
  countries: string[];
  industry: string;
  crNumber: string;
  companyWebsite: string;
  integrations: string[];
  setupPath: string;
  slug: string;
  approvedAt: string;
}

export const TENANT_CONFIG_KEY = "nf:tenant_config";
export const TENANT_CONFIG_EVENT = "nf:tenant-config-changed";

export function readTenantConfig(): TenantConfig | null {
  try {
    const raw = localStorage.getItem(TENANT_CONFIG_KEY);
    return raw ? (JSON.parse(raw) as TenantConfig) : null;
  } catch {
    return null;
  }
}

/** NexFlow brand defaults — used when no enterprise tenant config is configured. */
export const BRAND_DEFAULTS = {
  primary:   "#B8A0C8", // ACCENT — lavender-purple
  secondary: "#88B8B0", // TEAL
  accent:    "#C8A880", // GOLD
} as const;

/**
 * Apply the tenant's brand colors to CSS custom properties on the root element.
 * Falls back to NexFlow brand defaults when no enterprise config is present,
 * so card/background "font intelligence" coloring works consistently in every
 * environment — not just in production where localStorage is pre-populated.
 */
export function applyTenantBranding(config: TenantConfig | null): void {
  const root = document.documentElement;
  root.style.setProperty("--nf-tenant-primary",   config?.primaryColor   || BRAND_DEFAULTS.primary);
  root.style.setProperty("--nf-tenant-secondary", config?.secondaryColor || BRAND_DEFAULTS.secondary);
  root.style.setProperty("--nf-tenant-accent",    config?.accentColor    || BRAND_DEFAULTS.accent);
}

export function useTenantConfig() {
  const [config, setConfig] = useState<TenantConfig | null>(readTenantConfig);

  const refresh = useCallback(() => setConfig(readTenantConfig()), []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === TENANT_CONFIG_KEY || e.key === null) refresh();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(TENANT_CONFIG_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(TENANT_CONFIG_EVENT, refresh);
    };
  }, [refresh]);

  return { config, isConfigured: config !== null };
}
