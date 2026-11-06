import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import { useBio } from "../context/BioProvider";
import { surfaceClass } from "../foundation/Surface";
import { shouldDismiss } from "../physics/physics";
import { useBioMotion } from "../physics/useBioMotion";
import { useFocusTrap } from "../utils/hooks";
import { cx } from "../utils/cx";
import { CloseGlyph, useSpatialLayer } from "./Modal";
import styles from "./Spatial.module.css";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  side?: "end" | "start" | "bottom";
  children?: ReactNode;
  closeLabel?: string;
}

/**
 * A membrane sheet anchored to an edge. Drag toward the edge to dismiss:
 * a quick flick needs less distance than a slow drag (§12.7).
 */
export function Drawer({ open, onClose, title, side = "end", children, closeLabel = "Close" }: DrawerProps) {
  const { portalRoot } = useBio();
  const m = useBioMotion("membrane");
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const controls = useDragControls();
  useSpatialLayer(open);
  useFocusTrap(open, panel);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const axis = side === "bottom" ? "y" : "x";
  const sign = side === "start" ? -1 : 1;
  const off = m.reduced ? 24 * sign : side === "bottom" ? "110%" : `${110 * sign}%`;
  const hidden = { [axis]: off, opacity: m.reduced ? 0 : 1 };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const el = panel.current;
    const size = el ? (axis === "x" ? el.offsetWidth : el.offsetHeight) : 400;
    const offset = info.offset[axis] * sign;
    const velocity = info.velocity[axis] * sign;
    if (offset > 0 && shouldDismiss(offset, velocity, size * 0.35)) onClose();
  };

  if (!portalRoot) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={styles.drawerLayer} key="drawer">
          <motion.div
            className={styles.scrim}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-t`}
            data-side={side}
            className={cx(surfaceClass("membrane", 4, "r5"), styles.drawer)}
            initial={hidden}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={hidden}
            transition={m.reduced ? m.transition : { type: "spring", stiffness: 320, damping: 34, mass: 0.9 }}
            drag={m.reduced ? false : axis}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={side === "start" ? { left: 0.9, right: 0.05 } : side === "end" ? { left: 0.05, right: 0.9 } : { top: 0.05, bottom: 0.9 }}
            dragSnapToOrigin
            dragControls={controls}
            dragListener={false}
            onDragEnd={onDragEnd}
          >
            <span className={styles.grip} aria-hidden="true" onPointerDown={(e) => controls.start(e)} />
            {/* The header is the drag handle so controls inside stay usable. */}
            <div className={styles.modalHeader} onPointerDown={(e) => controls.start(e)} style={{ touchAction: "none", cursor: m.reduced ? undefined : "grab" }}>
              <h2 id={`${id}-t`} className={styles.modalTitle}>
                {title}
              </h2>
              <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
                <CloseGlyph />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    portalRoot,
  );
}
