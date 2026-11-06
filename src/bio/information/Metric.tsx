import type { ReactNode } from "react";
import { useDensityAtLeast } from "../context/BioProvider";
import { AnimatedNumber } from "./AnimatedNumber";
import { Sparkline } from "./Sparkline";
import { cx } from "../utils/cx";
import styles from "./Information.module.css";

export interface MetricProps {
  label: ReactNode;
  value: number;
  format?: (v: number) => string;
  unit?: string;
  /** Change since the comparison period. */
  delta?: { value: string; direction: "up" | "down" | "flat"; /** Is this direction good? */ positive?: boolean; label?: string };
  trend?: number[];
  trendColor?: string;
  icon?: ReactNode;
  /** Supporting text, revealed at Engaged density and above. */
  detail?: ReactNode;
  /** Advanced detail, revealed at Immersed density. */
  analysis?: ReactNode;
  className?: string;
}

const arrows = {
  up: <path d="M7 11V3M3.5 6.5 7 3l3.5 3.5" />,
  down: <path d="M7 3v8M3.5 7.5 7 11l3.5-3.5" />,
  flat: <path d="M3 7h8" />,
};

/** A key figure. Ambient density shows the essential number only (§15.1). */
export function Metric({ label, value, format, unit, delta, trend, trendColor, icon, detail, analysis, className }: MetricProps) {
  const engaged = useDensityAtLeast("engaged");
  const immersed = useDensityAtLeast("immersed");
  const tone = !delta || delta.direction === "flat" ? styles.deltaNeutral : delta.positive ? styles.deltaGood : styles.deltaBad;
  return (
    <div className={cx(styles.metric, className)}>
      <span className={styles.metricLabel}>
        {icon && <span aria-hidden="true" style={{ display: "inline-flex" }}>{icon}</span>}
        {label}
      </span>
      <span className={styles.metricValueRow}>
        <AnimatedNumber className={styles.metricValue} value={value} format={format} />
        {unit && <span className={styles.metricUnit}>{unit}</span>}
        {delta && engaged && (
          <span className={cx(styles.delta, tone)}>
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {arrows[delta.direction]}
            </svg>
            {delta.value}
            <span className="bio-visually-hidden">
              {` ${delta.direction === "up" ? "increase" : delta.direction === "down" ? "decrease" : "no change"}${delta.label ? ` ${delta.label}` : ""}`}
            </span>
          </span>
        )}
      </span>
      {trend && engaged && <Sparkline data={trend} color={trendColor} />}
      {detail && engaged && <p className={styles.metricDetail}>{detail}</p>}
      {analysis && immersed && <div className={styles.metricDetail}>{analysis}</div>}
    </div>
  );
}
