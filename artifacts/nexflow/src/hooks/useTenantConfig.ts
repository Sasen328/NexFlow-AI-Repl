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

const BRAND_DEFAULTS = {
  primary:   "#B8A0C8",
  secondary: "#88B8B0",
  accent:    "#C8A880",
};

/** Apply the tenant's brand colors to CSS custom properties on the root element.
 *  Always applies — falls back to NexFlow BRAND_DEFAULTS when config is null,
 *  so card color-intelligence works correctly in dev/demo mode. */
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
