import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { surfaceClass } from "../foundation/Surface";
import { useBioMotion } from "../physics/useBioMotion";
import { useDismiss, focusableWithin } from "../utils/hooks";
import { cx } from "../utils/cx";
import styles from "./Spatial.module.css";

export interface PopoverTriggerProps {
  ref: (el: HTMLButtonElement | null) => void;
  "aria-expanded": boolean;
  "aria-controls": string;
  "aria-haspopup": "dialog";
  onClick: () => void;
}

export interface PopoverProps {
  trigger: (props: PopoverTriggerProps) => ReactNode;
  title: string;
  children: ReactNode;
  align?: "start" | "end";
  /** Hide the visible title but keep it as the accessible name. */
  hideTitle?: boolean;
}

/** Non-modal D3 surface tied to its trigger. Grows from the trigger corner. */
export function Popover({ trigger, title, children, align = "end", hideTitle }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const triggerEl = useRef<HTMLButtonElement | null>(null);
  const m = useBioMotion("membrane");
  const close = () => {
    setOpen(false);
    triggerEl.current?.focus();
  };
  useDismiss(open, close, [wrap]);

  // Move focus into the popover once it mounts.
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) (focusableWithin(el)[0] ?? el).focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [open, id]);

  return (
    <div ref={wrap} className={styles.popWrap}>
      {trigger({
        ref: (el) => {
          triggerEl.current = el;
        },
        "aria-expanded": open,
        "aria-controls": id,
        "aria-haspopup": "dialog",
        onClick: () => setOpen((o) => !o),
      })}
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            role="dialog"
            aria-labelledby={`${id}-t`}
            data-align={align}
            className={cx(surfaceClass("membrane", 3, "r4"), styles.popover)}
            initial={{ opacity: 0, scale: m.reduced ? 1 : 0.9, y: -8 * m.travel }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: m.reduced ? 1 : 0.95, transition: { duration: 0.12 } }}
            transition={m.transition}
            tabIndex={-1}
          >
            <h2 id={`${id}-t`} className={cx(styles.popTitle, hideTitle && "bio-visually-hidden")}>
              {title}
            </h2>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
