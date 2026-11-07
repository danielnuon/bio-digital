import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { StatusIndicator, type Status } from "../information/StatusIndicator";
import { shouldDismiss } from "../physics/physics";
import { useBioMotion } from "../physics/useBioMotion";
import { cx } from "../utils/cx";
import { CloseGlyph } from "./Modal";
import styles from "./Island.module.css";

export interface IslandMessage {
  title: string;
  description?: string;
  status?: Status;
  /** ms before it settles back to its resting form; paused on hover/focus. */
  duration?: number;
}

const IslandContext = createContext<((m: IslandMessage) => void) | null>(null);

export function useIsland() {
  const ctx = useContext(IslandContext);
  if (!ctx) throw new Error("useIsland must be used inside <IslandProvider>.");
  return ctx;
}

export interface IslandProviderProps {
  children: ReactNode;
  /** What the island shows at rest: a short live summary. */
  idle: ReactNode;
}

/**
 * The Living Island: a carbon capsule anchored to the top of the screen.
 * At rest it carries a one-line live summary; when something happens it
 * expands with continuous geometry to show the message, then settles back.
 * The same surface always speaks, so feedback has one predictable home.
 */
export function IslandProvider({ children, idle }: IslandProviderProps) {
  const [queue, setQueue] = useState<Array<IslandMessage & { id: number }>>([]);
  const next = useRef(1);
  const notify = useCallback((msg: IslandMessage) => {
    setQueue((q) => [...q.slice(-2), { duration: 4200, status: "information", ...msg, id: next.current++ }]);
  }, []);
  const value = useMemo(() => notify, [notify]);
  const current = queue[0];
  const dismiss = useCallback(() => setQueue((q) => q.slice(1)), []);
  return (
    <IslandContext.Provider value={value}>
      {children}
      <Island idle={idle} message={current} onDismiss={dismiss} />
    </IslandContext.Provider>
  );
}

function Island({ idle, message, onDismiss }: { idle: ReactNode; message?: IslandMessage & { id: number }; onDismiss: () => void }) {
  const m = useBioMotion("membrane");
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!message?.duration || paused) return;
    const t = setTimeout(onDismiss, message.duration);
    return () => clearTimeout(t);
  }, [message, paused, onDismiss]);

  // Expanding geometry: a slightly softer spring than the membrane default
  // so the capsule visibly swells and settles (§12.5 spatial expansion).
  const layoutT = m.reduced ? { duration: 0.16 } : { type: "spring" as const, stiffness: 340, damping: 26, mass: 0.9 };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (shouldDismiss(-info.offset.y, -info.velocity.y, 30)) onDismiss();
  };

  return (
    <div className={styles.dock}>
      <motion.div
        layout
        className={cx(styles.island, message ? styles.expanded : styles.compact)}
        style={{ borderRadius: message ? 28 : 999 }}
        transition={{ layout: layoutT }}
        drag={message && !m.reduced ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0.08 }}
        dragSnapToOrigin
        onDragEnd={onDragEnd}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {/* Only messages are announced; the live idle summary stays quiet. */}
        <span role="status" className="bio-visually-hidden">
          {message ? `${message.title}. ${message.description ?? ""}` : ""}
        </span>
        <div className={styles.content}>
          <AnimatePresence mode="popLayout" initial={false}>
            {message ? (
              <motion.div
                key={message.id}
                className={styles.content}
                initial={{ opacity: 0, filter: m.reduced ? "none" : "blur(6px)", scale: m.reduced ? 1 : 0.9 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ opacity: 0, filter: m.reduced ? "none" : "blur(6px)", scale: m.reduced ? 1 : 0.92 }}
                transition={{ duration: m.reduced ? 0.12 : 0.28 }}
              >
                <span className={styles.lead}>
                  <StatusIndicator status={message.status ?? "information"} label={<span className="bio-visually-hidden">{message.status}</span>} />
                </span>
                <span className={styles.text} aria-hidden="true">
                  <span className={styles.title}>{message.title}</span>
                  {message.description && <span className={styles.body}>{message.description}</span>}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                className={styles.content}
                initial={{ opacity: 0, scale: m.reduced ? 1 : 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: m.reduced ? 1 : 0.9 }}
                transition={{ duration: m.reduced ? 0.12 : 0.22 }}
              >
                {idle}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {message && (
          <button type="button" className={styles.close} onClick={onDismiss} aria-label="Dismiss notification">
            <CloseGlyph />
          </button>
        )}
      </motion.div>
    </div>
  );
}
