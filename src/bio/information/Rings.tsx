import { useId } from "react";
import { motion } from "motion/react";
import { useBioMotion } from "../physics/useBioMotion";
import { cx } from "../utils/cx";
import styles from "./Rings.module.css";

export interface Ring {
  id: string;
  label: string;
  /** 0–1 progress toward the ring's goal. */
  value: number;
  /** Visible + announced value, e.g. "82%". */
  valueText: string;
  /** Gradient stops, start → end. */
  colors: [string, string];
}

export interface RingsProps {
  rings: Ring[];
  label: string;
  size?: number;
  centerValue?: string;
  centerLabel?: string;
  showLegend?: boolean;
  className?: string;
}

/**
 * Concentric progress rings. Each arc is a lit gradient with a soft glow,
 * and settles into place with porcelain physics. Every ring is a meter.
 */
export function Rings({ rings, label, size = 168, centerValue, centerLabel, showLegend = true, className }: RingsProps) {
  const id = useId();
  const m = useBioMotion("porcelain");
  const stroke = Math.max(9, Math.round(size / 14));
  const gap = Math.round(stroke * 0.35);
  return (
    <div className={cx(styles.root, className)} role="group" aria-label={label}>
      <div className={styles.figure} style={{ width: size, height: size }}>
        <svg className={styles.svg} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <defs>
            {rings.map((r) => (
              <linearGradient key={r.id} id={`${id}-${r.id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" style={{ stopColor: r.colors[0] }} />
                <stop offset="1" style={{ stopColor: r.colors[1] }} />
              </linearGradient>
            ))}
            <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation={stroke * 0.35} result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {rings.map((r, i) => {
            const radius = size / 2 - stroke / 2 - i * (stroke + gap);
            return (
              <g key={r.id}>
                <circle className={styles.track} cx={size / 2} cy={size / 2} r={radius} style={{ stroke: r.colors[1] }} strokeWidth={stroke} />
                <motion.circle
                  className={styles.arc}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={`url(#${id}-${r.id})`}
                  strokeWidth={stroke}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: Math.max(0.001, Math.min(1, r.value)) }}
                  transition={m.reduced ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 16, mass: 1, delay: i * 0.08 }}
                />
              </g>
            );
          })}
        </svg>
        {(centerValue || centerLabel) && (
          <div className={styles.center} aria-hidden="true">
            {centerValue && <span className={styles.centerValue}>{centerValue}</span>}
            {centerLabel && <span className={styles.centerLabel}>{centerLabel}</span>}
          </div>
        )}
      </div>
      <div className={showLegend ? styles.legend : "bio-visually-hidden"}>
        {rings.map((r) => (
          <div
            key={r.id}
            className={styles.item}
            role="meter"
            aria-label={r.label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(r.value * 100)}
            aria-valuetext={r.valueText}
            style={{ ["--_c" as string]: r.colors[0] }}
          >
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.itemLabel} aria-hidden="true">
              {r.label}
            </span>
            <span className={styles.itemValue} aria-hidden="true">
              {r.valueText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
