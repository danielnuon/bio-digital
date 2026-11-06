import type { ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./Information.module.css";

export type Status = "success" | "warning" | "critical" | "information" | "idle" | "active";

const glyphs: Record<Status, ReactNode> = {
  success: <path d="M2.5 5.3 4.3 7l3.2-3.8" />,
  active: <path d="M2.5 5.3 4.3 7l3.2-3.8" />,
  warning: <path d="M5 2.4v3M5 7.6h.01" />,
  critical: <path d="m3 3 4 4M7 3 3 7" />,
  information: <path d="M5 4.6v3M5 2.4h.01" />,
  idle: <path d="M2.8 5h4.4" />,
};

export interface StatusIndicatorProps {
  status: Status;
  /** Always shown: colour is never the only signal (§6.4). */
  label: ReactNode;
  variant?: "plain" | "pill";
  /** Announce changes politely to assistive technology. */
  live?: boolean;
  className?: string;
}

/** Status = glyph shape + colour + text. "active" breathes gently when motion allows. */
export function StatusIndicator({ status, label, variant = "plain", live, className }: StatusIndicatorProps) {
  return (
    <span
      className={cx(styles.status, variant === "pill" && styles.statusPill, styles[status], className)}
      role={live ? "status" : undefined}
      data-status={status}
    >
      <span className={styles.statusGlyph} data-active={status === "active"} aria-hidden="true">
        <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {glyphs[status]}
        </svg>
      </span>
      <span>{label}</span>
    </span>
  );
}
