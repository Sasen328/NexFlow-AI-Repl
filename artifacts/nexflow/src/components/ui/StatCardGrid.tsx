/**
 * StatCardGrid — Design System §7.1 grid wrapper
 * 2-column grid with 6px gap for StatCard components.
 */
import React from "react";

interface StatCardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StatCardGrid({ children, className = "" }: StatCardGridProps) {
  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "6px",
      }}
    >
      {children}
    </div>
  );
}
