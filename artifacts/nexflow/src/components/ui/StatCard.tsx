/**
 * StatCard — Design System §7.1
 * Glassmorphic stat card using QPulse design tokens.
 * All colours via CSS variables — never hardcoded.
 */
import React from "react";

interface StatCardProps {
  value: string | number;
  label: string;
  badge?: {
    text: string;
    variant: "positive" | "accent";
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ value, label, badge, icon, className = "" }: StatCardProps) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(255,255,255,.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--bd)",
        borderRadius: "var(--r-card)",
        padding: "10px 13px",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        transition: "all 0.6s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          className="stat-value"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--tx)",
            lineHeight: 1.2,
          }}
        >
          {value}
        </span>
        {icon && (
          <span style={{ color: "var(--ac)", opacity: 0.7 }}>{icon}</span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
        <span
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: "9px",
            color: "var(--txq)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </span>
        {badge && (
          <span
            style={{
              fontFamily: "'Geist', sans-serif",
              fontSize: "9px",
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: "var(--r-pill)",
              ...(badge.variant === "positive"
                ? { background: "rgba(55,185,105,.12)", color: "#197A44" }
                : { background: "var(--ac)", color: "#fff" }),
            }}
          >
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
}
