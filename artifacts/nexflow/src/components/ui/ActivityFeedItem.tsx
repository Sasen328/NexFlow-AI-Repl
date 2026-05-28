/**
 * ActivityFeedItem — Design System §7.2
 * Feed row with left accent bar, icon container, text, and timestamp.
 * All colours via CSS variables — never hardcoded.
 */
import React from "react";

interface ActivityFeedItemProps {
  icon: React.ReactNode;
  text: string;
  timestamp: string;
  isLast?: boolean;
  className?: string;
}

export function ActivityFeedItem({
  icon,
  text,
  timestamp,
  isLast = false,
  className = "",
}: ActivityFeedItemProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        paddingBottom: isLast ? 0 : "8px",
        marginBottom: isLast ? 0 : "8px",
        borderBottom: isLast ? "none" : "1px solid var(--bd)",
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          width: "2px",
          height: "26px",
          borderRadius: "2px",
          background: "var(--ac)",
          flexShrink: 0,
          marginTop: "1px",
        }}
      />

      {/* Icon container */}
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "5px",
          background: "rgba(107,78,140,.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "var(--ac)",
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: "11px",
            color: "var(--txM)",
            lineHeight: 1.4,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </p>
        <span
          className="timestamp"
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: "9px",
            color: "var(--txq)",
          }}
        >
          {timestamp}
        </span>
      </div>
    </div>
  );
}
