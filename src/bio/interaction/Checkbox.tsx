import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useBioMotion } from "../physics/useBioMotion";
import { cx } from "../utils/cx";
import styles from "./Field.module.css";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** Native checkbox semantics; the check mark draws itself in with a spring. */
export function Checkbox({ checked, onChange, label, description, disabled, className }: CheckboxProps) {
  const m = useBioMotion("porcelain");
  return (
    <label className={cx(styles.check, className)}>
      <input
        type="checkbox"
        className={styles.checkNative}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.checkBox} aria-hidden="true">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            d="M3 7.4 5.8 10 11 4"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={m.transition}
          />
        </svg>
      </span>
      <span className={styles.checkText}>
        <span>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
    </label>
  );
}
