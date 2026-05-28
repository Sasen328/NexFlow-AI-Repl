import { ReactNode } from "react";
import { LivingMesh } from "@/components/layout/LivingMesh";
import { MarketingTopBar } from "./MarketingTopBar";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LivingMesh />
      <MarketingTopBar />
      <main className="flex-1 min-w-0 relative z-10 w-full">
        {children}
      </main>
      <footer className="border-t border-border/30 mt-12 py-6 text-center text-xs text-muted-foreground">
        © 2026 QPulse · Built in Riyadh, KSA · The universal AI-native B2B CRM for GCC markets
      </footer>
    </div>
  );
}
