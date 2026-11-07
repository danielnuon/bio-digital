import { forwardRef, useId, useRef, type HTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { surfaceClass, type Depth, type Finish, type Radius } from "../foundation/Surface";
import { useBio } from "../context/BioProvider";
import { shouldDismiss, type Material } from "../physics/physics";
import { useBioMotion } from "../physics/useBioMotion";
import { cx } from "../utils/cx";
import styles from "./Information.module.css";

type DivProps = Omit<
  HTMLAttributes<HTMLElement>,
  "title" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragStart" | "onDragEnd" | "onDragEnter" | "onDragLeave" | "onDragOver" | "onDrop"
>;

export interface CardProps extends DivProps {
  material?: Material;
  /** Layered finish: pearl, chroma, candy or satin. */
  finish?: Finish;
  depth?: Depth;
  radius?: Radius;
  eyebrow?: ReactNode;
  title?: ReactNode;
  /** Heading level for the title (default h3). */
  headingLevel?: 2 | 3 | 4;
  actions?: ReactNode;
  /** Proximity response on hover (subtle lift). */
  interactive?: boolean;
  /** Animate geometry when size or position changes, moving neighbours naturally (§13). */
  layout?: boolean;
  /** Expandable detail with an explicit control (§15.2). */
  detail?: ReactNode;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  expandLabel?: string;
  /** Drag horizontally to dismiss; a button offers the same action (§19.2). */
  onDismiss?: () => void;
  dismissLabel?: string;
  children?: ReactNode;
}

const Chevron = ({ open }: { open: boolean }) => (
  <motion.svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" animate={{ rotate: open ? 180 : 0 }}>
    <path d="m4.5 7 4.5 4.5L13.5 7" />
  </motion.svg>
);
const Close = () => (
  <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <path d="m5 5 8 8M13 5l-8 8" />
  </svg>
);

/**
 * The primary information container. Hover is a proximity response, drag
 * carries mass and momentum, and dismissal is velocity-aware (§12.2).
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    material = "porcelain",
    finish,
    depth = 1,
    radius = "r4",
    eyebrow,
    title,
    headingLevel = 3,
    actions,
    interactive = false,
    layout = false,
    detail,
    expanded = false,
    onExpandedChange,
    expandLabel = "Show details",
    onDismiss,
    dismissLabel = "Dismiss",
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const { environment } = useBio();
  const m = useBioMotion(material);
  const id = useId();
  const local = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-260, 0, 260], [0, 1, 0]);
  const rotate = useTransform(x, [-260, 0, 260], m.reduced ? [0, 0, 0] : [-3, 0, 3]);
  const Heading = `h${headingLevel}` as const;

  const fling = (direction: 1 | -1, velocity = 0) => {
    const width = local.current?.offsetWidth ?? 320;
    if (m.reduced) {
      onDismiss?.();
      return;
    }
    animate(x, direction * (width + 80), { type: "spring", stiffness: 200, damping: 30, velocity, restDelta: 4 }).then(() => onDismiss?.());
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const width = local.current?.offsetWidth ?? 320;
    if (shouldDismiss(info.offset.x, info.velocity.x, width * 0.45)) {
      fling(info.offset.x + info.velocity.x * 0.2 > 0 ? 1 : -1, info.velocity.x);
    } else {
      animate(x, 0, { ...m.transition, velocity: info.velocity.x } as never);
    }
  };

  const draggable = !!onDismiss && !m.reduced;
  const carbon = material === "carbon" ? { "data-bio-environment": "night", "data-bio-carbon-parent": environment } : undefined;

  return (
    <motion.article
      ref={(el: HTMLElement | null) => {
        local.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      layout={layout ? true : undefined}
      transition={m.transition}
      aria-labelledby={title ? `${id}-t` : undefined}
      data-bio-material={material}
      data-bio-finish={finish}
      data-interactive={interactive || undefined}
      data-draggable={draggable || undefined}
      className={cx(surfaceClass(material, depth, radius), styles.card, className)}
      style={onDismiss ? { ...style, x, opacity, rotate } : style}
      whileHover={interactive && !m.reduced ? { y: -m.hoverLift } : undefined}
      drag={draggable ? "x" : false}
      dragElastic={m.dragElastic}
      dragMomentum={false}
      dragSnapToOrigin={false}
      onDragEnd={draggable ? onDragEnd : undefined}
      exit={{ opacity: 0, scale: m.reduced ? 1 : 0.96, transition: { duration: 0.18 } }}
      {...carbon}
      {...(rest as object)}
    >
      {(title || eyebrow || actions || detail || onDismiss) && (
        <motion.header layout={layout ? "position" : undefined} className={styles.cardHeader}>
          <div className={styles.cardHeading}>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            {title && (
              <Heading id={`${id}-t`} className={styles.cardTitle}>
                {title}
              </Heading>
            )}
          </div>
          {(actions || detail || onDismiss) && (
            <div className={styles.cardActions}>
              {actions}
              {detail && (
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-expanded={expanded}
                  aria-controls={`${id}-detail`}
                  aria-label={expandLabel}
                  onClick={() => onExpandedChange?.(!expanded)}
                >
                  <Chevron open={expanded} />
                </button>
              )}
              {onDismiss && (
                <button type="button" className={styles.iconBtn} aria-label={dismissLabel} onClick={() => fling(1)}>
                  <Close />
                </button>
              )}
            </div>
          )}
        </motion.header>
      )}
      {children && (
        <motion.div layout={layout ? "position" : undefined} className={styles.cardBody}>
          {children}
        </motion.div>
      )}
      <AnimatePresence initial={false}>
        {detail && expanded && (
          <motion.div
            id={`${id}-detail`}
            key="detail"
            className={styles.cardDetail}
            layout={layout ? "position" : undefined}
            initial={{ opacity: 0, y: -8 * m.travel }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={m.transition}
          >
            {detail}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
});
