import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { readTenantConfig, applyTenantBranding } from "@/hooks/useTenantConfig";

// ── Eager bootstrap (runs before React renders, eliminates color/dark flash) ──

// 1. Dark mode — respect persisted preference, then system preference
const storedDark = localStorage.getItem("nf:dark");
const prefersDark =
  storedDark !== null
    ? storedDark === "true"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.classList.toggle("dark", prefersDark);

// 2. Tenant branding — apply CSS vars immediately (falls back to NexFlow defaults)
applyTenantBranding(readTenantConfig());

createRoot(document.getElementById("root")!).render(<App />);
