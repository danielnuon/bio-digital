import { useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { animate, motion, useDragControls, useMotionValue } from "motion/react";
import { surfaceClass } from "../foundation/Surface";
import { physics } from "../physics/physics";
import { useBioMotion } from "../physics/useBioMotion";
import { cx } from "../utils/cx";
import styles from "./Spatial.module.css";

export interface FloatingPanelProps {
  title: string;
  children: ReactNode;
  /** The element that bounds the panel. Boundaries resist, then return (§12.6). */
  constraintsRef: RefObject<HTMLElement | null>;
  initial?: { x: number; y: number };
  className?: string;
}

/**
 * A draggable membrane panel with inertia: release with velocity and it
 * glides, decelerates under friction, and meets elastic resistance at
 * the edges. Arrow keys on the handle move it for keyboard users.
 */
export function FloatingPanel({ title, children, constraintsRef, initial = { x: 16, y: 16 }, className }: FloatingPanelProps) {
  const m = useBioMotion("membrane");
  const controls = useDragControls();
  const x = useMotionValue(initial.x);
  const y = useMotionValue(initial.y);
  const self = useRef<HTMLDivElement>(null);
  const [announce, setAnnounce] = useState("");

  const nudge = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 48 : 16;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!d) return;
    e.preventDefault();
    const bounds = constraintsRef.current?.getBoundingClientRect();
    const me = self.current?.getBoundingClientRect();
    const maxX = bounds && me ? bounds.width - me.width : Infinity;
    const maxY = bounds && me ? bounds.height - me.height : Infinity;
    const nx = Math.max(0, Math.min(maxX, x.get() + d[0]));
    const ny = Math.max(0, Math.min(maxY, y.get() + d[1]));
    const t = m.reduced ? { duration: 0 } : { type: "spring" as const, ...physics.membrane.spring };
    animate(x, nx, t);
    animate(y, ny, t);
    setAnnounce(`Moved to ${Math.round(nx)}, ${Math.round(ny)}`);
  };

  return (
    <motion.div
      ref={self}
      role="region"
      aria-label={title}
      className={cx(surfaceClass("membrane", 3, "r4"), styles.floating, className)}
      style={{ x, y, top: 0, left: 0 }}
      drag
      dragControls={controls}
      dragListener={false}
      dragConstraints={constraintsRef}
      dragElastic={m.dragElastic}
      dragMomentum={!m.reduced}
      dragTransition={{ power: 0.35, timeConstant: 260, bounceStiffness: 280, bounceDamping: 22 }}
      whileDrag={m.reduced ? undefined : { scale: 1.02, boxShadow: "var(--bio-depth-4)" }}
    >
      <button
        type="button"
        className={styles.floatHandle}
        onPointerDown={(e) => controls.start(e)}
        onKeyDown={nudge}
        aria-describedby={undefined}
        aria-label={`${title}. Drag, or use arrow keys to move`}
      >
        <span className={styles.floatDots} aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} />
          ))}
        </span>
        <span aria-hidden="true">{title}</span>
      </button>
      <div className={styles.floatBody}>{children}</div>
      <span className="bio-visually-hidden" aria-live="polite">
        {announce}
      </span>
    </motion.div>
  );
}
