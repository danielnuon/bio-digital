import { useId, type ReactNode } from "react";
import { motion } from "motion/react";
import { useBioMotion, type MotionMode } from "../physics/useBioMotion";
import { cx } from "../utils/cx";
import styles from "./Toggle.module.css";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  /** Put label and switch at opposite ends of the row. */
  spread?: boolean;
  motion?: MotionMode;
  className?: string;
  id?: string;
}

/**
 * Spring-driven switch (§12.4). The thumb travels in the control's physical
 * direction, compresses when pressed, and shows a glyph so state is not
 * conveyed by colour alone.
 */
export function Toggle({ checked, onChange, label, description, disabled, spread, motion: override, className, id }: ToggleProps) {
  const autoId = useId();
  const switchId = id ?? autoId;
  const m = useBioMotion("membrane", override);
  return (
    <div className={cx(styles.root, spread && styles.spread, className)}>
      <span className={styles.text}>
        <label htmlFor={switchId} className={styles.label}>
          {label}
        </label>
        {description && (
          <span id={`${switchId}-d`} className={styles.description}>
            {description}
          </span>
        )}
      </span>
      <motion.button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${switchId}-d` : undefined}
        disabled={disabled}
        className={styles.track}
        onClick={() => onChange(!checked)}
        whileTap={disabled ? undefined : "pressed"}
      >
        <motion.span
          className={styles.thumb}
          aria-hidden="true"
          initial={false}
          animate={{ x: checked ? 20 : 0, scaleX: 1 }}
          variants={{ pressed: { scaleX: m.reduced ? 1 : 1.18 } }}
          transition={m.transition}
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {checked ? <path d="M2.5 6.2 5 8.5l4.5-5" /> : <path d="M3 6h6" />}
          </svg>
        </motion.span>
      </motion.button>
    </div>
  );
}
