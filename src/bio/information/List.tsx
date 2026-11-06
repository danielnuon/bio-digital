import type { ReactNode } from "react";
import { useDensityAtLeast } from "../context/BioProvider";
import { cx } from "../utils/cx";
import styles from "./Information.module.css";

export interface ListItemData {
  id: string;
  title: ReactNode;
  leading?: ReactNode;
  /** Shown at Engaged density and above. */
  supporting?: ReactNode;
  /** Shown at Immersed density. */
  meta?: ReactNode;
  trailing?: ReactNode;
}

export interface ListProps {
  items: ListItemData[];
  onSelect?: (id: string) => void;
  /** Accessible name for the list. */
  label?: string;
  className?: string;
}

/**
 * Rows breathe with density: their height and the amount of supporting
 * information follow the environment's density level. Selection, when
 * offered, is a real button per row.
 */
export function List({ items, onSelect, label, className }: ListProps) {
  const engaged = useDensityAtLeast("engaged");
  const immersed = useDensityAtLeast("immersed");
  return (
    <ul className={cx(styles.list, className)} aria-label={label}>
      {items.map((it) => {
        const content = (
          <>
            {it.leading && <span className={styles.rowLeading}>{it.leading}</span>}
            <span className={styles.rowText}>
              <span className={styles.rowTitle}>{it.title}</span>
              {engaged && it.supporting && <span className={styles.rowSupporting}>{it.supporting}</span>}
            </span>
            {immersed && it.meta && <span className={styles.rowMeta}>{it.meta}</span>}
            {it.trailing && <span className={styles.rowTrailing}>{it.trailing}</span>}
          </>
        );
        return (
          <li key={it.id} className={styles.listItem}>
            {onSelect ? (
              <button type="button" className={styles.row} onClick={() => onSelect(it.id)}>
                {content}
              </button>
            ) : (
              <div className={styles.row}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
