import { useEffect, useId, type ReactNode } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { physics } from "../physics/physics";
import { useBioMotion, type MotionMode } from "../physics/useBioMotion";
import { cx } from "../utils/cx";
import styles from "./Slider.module.css";

export interface SliderProps {
  label: ReactNode;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Visible and announced value text, e.g. (v) => `${v}°C`. */
  format?: (value: number) => string;
  motion?: MotionMode;
  className?: string;
}

/**
 * A native range input (keyboard, touch and assistive tech for free) with
 * a spring-following visual. Only transforms animate (§20.3).
 */
export function Slider({ label, value, onChange, min = 0, max = 100, step = 1, disabled, format = String, motion: override, className }: SliderProps) {
  const id = useId();
  const m = useBioMotion("porcelain", override);
  const pct = ((value - min) / (max - min)) * 100;
  const spring = useSpring(pct, physics.porcelain.spring);

  useEffect(() => {
    if (m.reduced) spring.jump(pct);
    else spring.set(pct);
  }, [pct, m.reduced, spring]);

  const fillScale = useTransform(spring, (p) => Math.max(0, Math.min(1, p / 100)));
  const thumbX = useTransform(spring, (p) => `${Math.max(0, Math.min(100, p))}%`);

  return (
    <div className={cx(styles.root, className)}>
      <div className={styles.header}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <output htmlFor={id} className={styles.value}>
          {format(value)}
        </output>
      </div>
      <div className={styles.control}>
        <input
          id={id}
          className={styles.input}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-valuetext={format(value)}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div className={styles.track} aria-hidden="true">
          <motion.div className={styles.fill} style={{ scaleX: fillScale }} />
        </div>
        <motion.div className={styles.rail} style={{ x: thumbX }} aria-hidden="true">
          <span className={styles.thumb} />
        </motion.div>
      </div>
    </div>
  );
}
