import { useEffect, useId, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { animate, motion, useMotionValue, useSpring, useTransform } from "motion/react";
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
  /** "capsule" is the thick, glanceable control-centre style. */
  variant?: "line" | "capsule";
  /** Decorative icon inside the capsule. */
  icon?: ReactNode;
  className?: string;
}

/** Rubber-band resistance: travel grows ever slower past the boundary (§12.6). */
function rubberBand(overshoot: number, dimension: number, c = 0.55) {
  return (1 - 1 / ((overshoot * c) / dimension + 1)) * dimension;
}

/**
 * A native range input (keyboard, touch and assistive tech for free) with
 * a spring-following visual. Only transforms animate (§20.3).
 */
export function Slider({ label, value, onChange, min = 0, max = 100, step = 1, disabled, format = String, motion: override, variant = "line", icon, className }: SliderProps) {
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
  const capsuleX = useTransform(spring, (p) => `${Math.max(0, Math.min(100, p)) - 100}%`);

  // Elastic overdrag on the capsule: stretch from the far edge, spring back.
  const stretch = useMotionValue(1);
  const origin = useMotionValue("0% 50%");
  const trackRef = useRef<HTMLDivElement>(null);
  const onPointerDown = (e: ReactPointerEvent) => {
    if (variant !== "capsule" || m.reduced || disabled) return;
    const startId = e.pointerId;
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== startId) return;
      const r = trackRef.current?.getBoundingClientRect();
      if (!r) return;
      const over = ev.clientX > r.right ? ev.clientX - r.right : ev.clientX < r.left ? r.left - ev.clientX : 0;
      origin.set(ev.clientX < r.left ? "100% 50%" : "0% 50%");
      stretch.set(1 + rubberBand(over, r.width) / r.width * 0.35);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      animate(stretch, 1, { type: "spring", ...physics.membrane.spring });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  return (
    <div className={cx(styles.root, variant === "capsule" && styles.capsule, className)}>
      <div className={styles.header}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <output htmlFor={id} className={styles.value}>
          {format(value)}
        </output>
      </div>
      <div className={styles.control} onPointerDown={onPointerDown}>
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
        {variant === "capsule" ? (
          <motion.div ref={trackRef} className={styles.capsuleTrack} style={{ scaleX: stretch, transformOrigin: origin }} aria-hidden="true">
            <motion.div className={styles.capsuleFill} style={{ x: capsuleX }} />
            {icon && <span className={styles.capsuleIcon}>{icon}</span>}
          </motion.div>
        ) : (
          <>
            <div className={styles.track} aria-hidden="true">
              <motion.div className={styles.fill} style={{ scaleX: fillScale }} />
            </div>
            <motion.div className={styles.rail} style={{ x: thumbX }} aria-hidden="true">
              <span className={styles.thumb} />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
