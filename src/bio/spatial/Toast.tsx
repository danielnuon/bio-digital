import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { surfaceClass } from "../foundation/Surface";
import { StatusIndicator, type Status } from "../information/StatusIndicator";
import { shouldDismiss } from "../physics/physics";
import { useBioMotion } from "../physics/useBioMotion";
import { cx } from "../utils/cx";
import { CloseGlyph } from "./Modal";
import styles from "./Spatial.module.css";

export interface ToastInput {
  title: string;
  description?: string;
  status?: Status;
  /** ms before auto-dismiss; 0 keeps it until dismissed. Paused on hover/focus. */
  duration?: number;
}
interface ToastItem extends ToastInput {
  id: number;
}

const ToastContext = createContext<((t: ToastInput) => void) | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>.");
  return ctx;
}

/** Contextual overlay for transient feedback, announced politely. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(1);
  const notify = useCallback((t: ToastInput) => {
    setItems((list) => [...list.slice(-2), { duration: 5000, status: "information", ...t, id: next.current++ }]);
  }, []);
  const remove = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const value = useMemo(() => notify, [notify]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.toastRegion} role="region" aria-label="Notifications">
        <div role="status" aria-live="polite" style={{ display: "contents" }}>
          <AnimatePresence initial={false}>
            {items.map((t) => (
              <Toast key={t.id} item={t} onDismiss={() => remove(t.id)} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const m = useBioMotion("membrane");
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!item.duration || paused) return;
    const t = setTimeout(onDismiss, item.duration);
    return () => clearTimeout(t);
  }, [item.duration, paused, onDismiss]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (shouldDismiss(info.offset.x, info.velocity.x, 140)) onDismiss();
  };

  return (
    <motion.div
      layout
      className={cx(surfaceClass("membrane", 3, "r4"), styles.toast)}
      initial={{ opacity: 0, y: 24 * m.travel, scale: m.reduced ? 1 : 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, x: m.reduced ? 0 : 120, transition: { duration: 0.2 } }}
      transition={m.transition}
      drag={m.reduced ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.1, right: 0.8 }}
      dragSnapToOrigin
      onDragEnd={onDragEnd}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className={styles.toastLead}>
        <StatusIndicator status={item.status ?? "information"} label={<span className="bio-visually-hidden">{item.status}</span>} />
      </span>
      <div className={styles.toastText}>
        <div className={styles.toastTitle}>{item.title}</div>
        {item.description && <div className={styles.toastBody}>{item.description}</div>}
      </div>
      <button type="button" className={styles.close} style={{ margin: 0 }} onClick={onDismiss} aria-label="Dismiss notification">
        <CloseGlyph />
      </button>
    </motion.div>
  );
}
