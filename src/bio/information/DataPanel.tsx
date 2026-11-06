import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useBio, type Density } from "../context/BioProvider";
import { Card, type CardProps } from "./Card";
import { Button } from "../interaction/Button";
import { useBioMotion } from "../physics/useBioMotion";
import styles from "./Information.module.css";

export interface DataPoint {
  label: ReactNode;
  value: ReactNode;
  /** Minimum density at which this row appears by default. */
  level?: Density;
}

export interface DataPanelProps extends Omit<CardProps, "children"> {
  items: DataPoint[];
  footnote?: ReactNode;
}

const order: Density[] = ["ambient", "engaged", "immersed"];

/**
 * Key-value detail that follows adaptive density, with an explicit
 * "show all / show less" control so users keep agency (§15.2 rules 5, 8).
 */
export function DataPanel({ items, footnote, ...card }: DataPanelProps) {
  const { density } = useBio();
  const m = useBioMotion("porcelain");
  const [override, setOverride] = useState<boolean | null>(null);
  const visibleByDensity = (lvl: Density = "ambient") => order.indexOf(lvl) <= order.indexOf(density);
  const hiddenCount = items.filter((i) => !visibleByDensity(i.level)).length;
  const showAll = override ?? false;
  const shown = items.filter((i) => showAll || visibleByDensity(i.level));

  return (
    <Card {...card} layout>
      <dl className={styles.dl}>
        <AnimatePresence initial={false}>
          {shown.map((it, i) => (
            <motion.div
              key={typeof it.label === "string" ? it.label : i}
              className={styles.dlRow}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={m.reduced ? { duration: 0 } : { duration: 0.24 }}
            >
              <dt>{it.label}</dt>
              <dd>{it.value}</dd>
            </motion.div>
          ))}
        </AnimatePresence>
      </dl>
      {(hiddenCount > 0 || footnote) && (
        <div className={styles.panelFooter}>
          <span>{footnote}</span>
          {hiddenCount > 0 && (
            <Button variant="tertiary" size="compact" aria-expanded={showAll} onClick={() => setOverride(!showAll)}>
              {showAll ? "Show less" : `Show ${hiddenCount} more`}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
