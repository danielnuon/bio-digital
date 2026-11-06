import { useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Button } from "../interaction/Button";
import { useBioMotion } from "../physics/useBioMotion";

export interface CardStackItem {
  id: string;
  /** Usually a dismissible <Card>. */
  content: ReactNode;
}

export interface CardStackProps {
  items: CardStackItem[];
  /** Accessible name for the group. */
  label: string;
  /** How many cards peek out behind the front card when collapsed. */
  peek?: number;
  empty?: ReactNode;
  className?: string;
}

/**
 * A notification stack. Collapsed, cards rest behind one another with depth
 * and scale; expanded, they fan out into a list with continuous motion.
 * Removing one lets the rest resolve into place (§13 propagation).
 */
export function CardStack({ items, label, peek = 2, empty, className }: CardStackProps) {
  const [open, setOpen] = useState(false);
  const m = useBioMotion("membrane");
  const expanded = open || items.length <= 1;
  const spring = m.reduced ? { duration: 0.14 } : { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.9 };

  return (
    <div className={className} role="group" aria-label={label}>
      <LayoutGroup>
        <motion.div
          layout
          transition={spring}
          style={{ display: "grid", gap: expanded ? "var(--bio-space-3)" : 0, gridTemplateAreas: expanded ? undefined : '"stack"' }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((it, i) => {
              const behind = Math.min(i, peek + 1);
              const hidden = !expanded && i > peek;
              return (
                <motion.div
                  key={it.id}
                  layout
                  transition={spring}
                  style={{
                    gridArea: expanded ? undefined : "stack",
                    display: "grid",
                    zIndex: items.length - i,
                    transformOrigin: "50% 100%",
                    pointerEvents: !expanded && i > 0 ? "none" : undefined,
                  }}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={
                    expanded
                      ? { y: 0, scale: 1, opacity: 1 }
                      : { y: behind * 14, scale: 1 - behind * 0.05, opacity: hidden ? 0 : 1 - behind * 0.12 }
                  }
                  exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
                  aria-hidden={!expanded && i > 0 ? true : undefined}
                  inert={!expanded && i > 0 ? true : undefined}
                >
                  {it.content}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
        {items.length === 0 && empty}
        {items.length > 1 && (
          <motion.div layout="position" transition={spring} style={{ marginTop: expanded ? "var(--bio-space-3)" : `calc(${Math.min(items.length - 1, peek)} * 14px + var(--bio-space-3))` }}>
            <Button variant="tertiary" size="compact" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              {open ? "Stack signals" : `Show all ${items.length}`}
            </Button>
          </motion.div>
        )}
      </LayoutGroup>
    </div>
  );
}
