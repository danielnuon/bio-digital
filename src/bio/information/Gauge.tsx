import { motion } from "motion/react";
import { useBioMotion } from "../physics/useBioMotion";
import styles from "./Information.module.css";

export interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  label: string;
  /** Visible and announced value text. */
  valueText?: string;
  size?: number;
  color?: string;
}

/** A radial meter (role="meter"). The arc settles with porcelain physics. */
export function Gauge({ value, min = 0, max = 100, label, valueText, size = 120, color = "var(--bio-accent-ink)" }: GaugeProps) {
  const m = useBioMotion("porcelain");
  const frac = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const stroke = 10;
  const r = (size - stroke) / 2;
  const text = valueText ?? `${Math.round(value)}`;
  return (
    <div
      className={styles.gauge}
      role="meter"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={text}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className={styles.gaugeTrack} cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <motion.circle
          className={styles.gaugeArc}
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          initial={false}
          animate={{ pathLength: frac }}
          transition={m.transition}
        />
      </svg>
      <span className={styles.gaugeCenter} aria-hidden="true">
        <span className={styles.gaugeValue}>{text}</span>
        <span className={styles.gaugeLabel}>{label}</span>
      </span>
    </div>
  );
}
