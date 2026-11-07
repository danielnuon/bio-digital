import { useCallback, useState, type HTMLAttributes, type ReactNode } from "react";
import { useBio } from "../context/BioProvider";
import { cx } from "../utils/cx";
import { LivingField } from "./LivingField";
import styles from "./Canvas.module.css";

export interface CanvasProps extends HTMLAttributes<HTMLDivElement> {
  /** Render slow ambient forms (Continuous Vitality, ambient life). */
  ambient?: boolean;
  /** Environmental light reflects system state (§14.1). */
  mood?: "calm" | "attention";
  children?: ReactNode;
}

/** D0 — the environment. Background, living gradient, ambient forms. */
export function Canvas({ ambient = true, mood = "calm", className, children, ...rest }: CanvasProps) {
  const { fidelity, motion } = useBio();
  const [gpu, setGpu] = useState(true);
  const unsupported = useCallback(() => setGpu(false), []);
  // Full fidelity gets the flowing field; lite hardware or no WebGL keeps the CSS forms.
  const field = ambient && gpu && fidelity === "full" && typeof window !== "undefined" && !/jsdom/i.test(navigator.userAgent);
  return (
    <div className={cx(styles.canvas, className)} data-bio-mood={mood} {...rest}>
      <div className={styles.environment} aria-hidden="true">
        {field && <LivingField className={styles.field} still={motion === "reduced"} onUnsupported={unsupported} />}
        {ambient && !field && (
          <>
            <span className={cx(styles.form, styles.form1)} />
            <span className={cx(styles.form, styles.form2)} />
            <span className={cx(styles.form, styles.form3)} />
          </>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Content that recedes into the environment while a modal or drawer holds
 * focus, so the underlying interface stays spatially understandable.
 * Avoid position: fixed descendants (the transform creates a containing block).
 */
export function Recede({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(styles.recede, className)} {...rest} />;
}
