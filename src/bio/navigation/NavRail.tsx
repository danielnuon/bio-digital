import { useId, type ReactNode } from "react";
import { LayoutGroup, motion } from "motion/react";
import { useBioMotion } from "../physics/useBioMotion";
import { cx } from "../utils/cx";
import styles from "./Navigation.module.css";

export interface NavItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  /** Count badge; announced as part of the item name. */
  badge?: number;
}

export interface NavRailProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  items: NavItem<T>[];
  /** Become a bottom bar on narrow viewports. */
  responsive?: boolean;
  className?: string;
}

/**
 * Persistent navigation. Its position never changes between destinations;
 * only the active surface glides to the new location (§12.3).
 */
export function NavRail<T extends string>({ label, value, onChange, items, responsive = true, className }: NavRailProps<T>) {
  const group = useId();
  const m = useBioMotion("porcelain");
  return (
    <nav aria-label={label} className={cx(styles.rail, className)} data-responsive={responsive}>
      <LayoutGroup id={group}>
        <ul className={styles.railList}>
          {items.map((it) => {
            const active = it.value === value;
            return (
              <li key={it.value}>
                <button
                  type="button"
                  className={styles.railItem}
                  aria-current={active ? "page" : undefined}
                  onClick={() => onChange(it.value)}
                >
                  {active && <motion.span layoutId="rail-active" className={styles.railActive} transition={m.transition} />}
                  {it.icon && <span className={styles.railIcon} aria-hidden="true">{it.icon}</span>}
                  <span className={styles.railLabel}>{it.label}</span>
                  {it.badge ? (
                    <span className={styles.railBadge}>
                      {it.badge}
                      <span className="bio-visually-hidden"> new</span>
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </LayoutGroup>
    </nav>
  );
}
