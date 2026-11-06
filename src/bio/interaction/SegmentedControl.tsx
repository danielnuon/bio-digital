import { useId, type ReactNode } from "react";
import { LayoutGroup, motion } from "motion/react";
import { useBioMotion } from "../physics/useBioMotion";
import { cx } from "../utils/cx";
import styles from "./Field.module.css";

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  /** Accessible group name. */
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  size?: "compact" | "regular";
  className?: string;
}

/**
 * Single-selection control built on native radios (arrow keys, screen reader
 * semantics). The selection indicator travels between options continuously.
 */
export function SegmentedControl<T extends string>({ label, value, onChange, options, size = "regular", className }: SegmentedControlProps<T>) {
  const name = useId();
  const m = useBioMotion("membrane");
  return (
    <LayoutGroup id={name}>
      <fieldset className={cx(styles.segmented, size === "compact" && styles.compactSeg, className)}>
        <legend className={styles.segmentedLegend}>{label}</legend>
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <span key={o.value} className={styles.segment}>
              {checked && <motion.span layoutId="indicator" className={styles.indicator} transition={m.transition} />}
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className={styles.segmentInput}
                id={`${name}-${o.value}`}
              />
              <label htmlFor={`${name}-${o.value}`} className={styles.segmentLabel}>
                {o.icon && <span aria-hidden="true" style={{ display: "inline-flex" }}>{o.icon}</span>}
                {o.label}
              </label>
            </span>
          );
        })}
      </fieldset>
    </LayoutGroup>
  );
}
