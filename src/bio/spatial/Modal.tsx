import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useBio } from "../context/BioProvider";
import { surfaceClass } from "../foundation/Surface";
import type { Material } from "../physics/physics";
import { useBioMotion } from "../physics/useBioMotion";
import { useFocusTrap } from "../utils/hooks";
import { cx } from "../utils/cx";
import styles from "./Spatial.module.css";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** The element the modal expands from and recedes back into (§12.5). */
  originRef?: RefObject<HTMLElement | null>;
  material?: Material;
  initialFocusRef?: RefObject<HTMLElement | null>;
  closeLabel?: string;
}

export const CloseGlyph = () => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
    <path d="m5 5 8 8M13 5l-8 8" />
  </svg>
);

/** Shared lifecycle for focus-level layers: depth count, scroll lock. */
export function useSpatialLayer(open: boolean) {
  const { pushSpatialLayer } = useBio();
  useEffect(() => {
    if (!open) return;
    const pop = pushSpatialLayer();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      pop();
      document.body.style.overflow = prev;
    };
  }, [open, pushSpatialLayer]);
}

/** D4 focus surface. Expands spatially from its origin; Escape and the scrim dismiss. */
export function Modal({ open, onClose, title, description, children, footer, originRef, material = "porcelain", initialFocusRef, closeLabel = "Close" }: ModalProps) {
  const { portalRoot } = useBio();
  const m = useBioMotion(material === "membrane" ? "membrane" : "crystal");
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useSpatialLayer(open);
  useFocusTrap(open, panel, initialFocusRef);

  useLayoutEffect(() => {
    if (!open || !originRef?.current) return;
    const r = originRef.current.getBoundingClientRect();
    setOrigin({ x: r.left + r.width / 2 - window.innerWidth / 2, y: r.top + r.height / 2 - window.innerHeight / 2 });
  }, [open, originRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const hidden = m.reduced
    ? { opacity: 0, scale: 0.98, x: 0, y: 0 }
    : { opacity: 0, scale: originRef ? 0.35 : 0.9, x: origin.x, y: origin.y + (originRef ? 0 : 24) };

  if (!portalRoot) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={styles.layer} key="layer">
          <motion.div
            className={styles.scrim}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: m.reduced ? 0.12 : 0.3 }}
            aria-hidden="true"
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-t`}
            aria-describedby={description ? `${id}-d` : undefined}
            className={cx(surfaceClass(material, 4, "r5"), styles.modal)}
            initial={hidden}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ ...hidden, transition: m.reduced ? { duration: 0.12 } : { type: "spring", stiffness: 380, damping: 40 } }}
            transition={m.reduced ? m.transition : { type: "spring", stiffness: 300, damping: 30, mass: 1 }}
          >
            <div className={styles.modalHeader}>
              <h2 id={`${id}-t`} className={styles.modalTitle}>
                {title}
              </h2>
              <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
                <CloseGlyph />
              </button>
            </div>
            {description && (
              <p id={`${id}-d`} className={styles.modalDescription}>
                {description}
              </p>
            )}
            {children}
            {footer && <div className={styles.modalFooter}>{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    portalRoot,
  );
}
