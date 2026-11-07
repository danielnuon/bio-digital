import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useBioMotion } from "../physics/useBioMotion";
import { cx } from "../utils/cx";
import styles from "./ControlTile.module.css";

export interface ControlTileProps {
  label: string;
  on: boolean;
  onChange: (on: boolean) => void;
  icon: ReactNode;
  /** State text, e.g. "Following the sun". Defaults to On/Off. */
  status?: string;
  /** Fill when on, e.g. "var(--bio-fill-water)". Must keep label contrast. */
  fill?: string;
  /** Icon colour on the light chip when on. */
  ink?: string;
  className?: string;
}

/**
 * A large, glanceable toggle (control-centre tile). The whole tile is the
 * target, the state is spoken (aria-pressed) and written, and switching on
 * blooms the fill outward from the icon with membrane elasticity.
 */
export function ControlTile({ label, on, onChange, icon, status, fill, ink, className }: ControlTileProps) {
  const m = useBioMotion("membrane");
  const style = { "--_fill": fill, "--_ink": ink } as CSSProperties;
  return (
    <motion.button
      type="button"
      aria-pressed={on}
      className={cx(styles.tile, className)}
      style={style}
      onClick={() => onChange(!on)}
      whileTap={{ scale: m.reduced ? 1 : 0.95 }}
      transition={m.transition}
      data-bio-light=""
    >
      <AnimatePresence initial={false}>
        {on && (
          <motion.span
            key="fill"
            className={styles.fill}
            data-bio-finish="candy"
            aria-hidden="true"
            initial={m.reduced ? { opacity: 0 } : { clipPath: "circle(0% at 36px 36px)" }}
            animate={m.reduced ? { opacity: 1 } : { clipPath: "circle(150% at 36px 36px)" }}
            exit={m.reduced ? { opacity: 0 } : { clipPath: "circle(0% at 36px 36px)" }}
            transition={m.reduced ? { duration: 0.14 } : { type: "spring", stiffness: 140, damping: 22 }}
          />
        )}
      </AnimatePresence>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.state}>{status ?? (on ? "On" : "Off")}</span>
      </span>
    </motion.button>
  );
}
