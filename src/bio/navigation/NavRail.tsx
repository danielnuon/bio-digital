import { useId, useRef, type ReactNode } from "react";
import { LayoutGroup, motion } from "motion/react";
import { useBioMotion } from "../physics/useBioMotion";
import { cx } from "../utils/cx";
import { readRadius, useContinuousCorners } from "../utils/hooks";
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
  /** "dock" is a floating glass capsule with icon-over-label items. */
  variant?: "rail" | "dock";
  className?: string;
}

/**
 * Persistent navigation. Its position never changes between destinations;
 * only the active surface glides to the new location (§12.3).
 */
export function NavRail<T extends string>({ label, value, onChange, items, responsive = true, variant = "rail", className }: NavRailProps<T>) {
  const group = useId();
  const m = useBioMotion(variant === "dock" ? "membrane" : "porcelain");
  const navRef = useRef<HTMLElement>(null);
  // The dock's corners sit against the device's; draw them continuous.
  useContinuousCorners(navRef, readRadius, variant === "dock");
  return (
    <nav ref={navRef} aria-label={label} className={cx(styles.rail, variant === "dock" && styles.dock, className)} data-responsive={responsive} data-bio-finish={variant === "dock" ? "pearl" : undefined}>
      <LayoutGroup id={group}>
        <ul className={styles.railList}>
          {items.map((it) => {
            const active = it.value === value;
            return (
              <li key={it.value}>
                <motion.button
                  type="button"
                  whileTap={m.reduced ? undefined : { scale: 0.92 }}
                  transition={m.transition}
                  className={styles.railItem}
                  aria-current={active ? "page" : undefined}
                  onClick={() => onChange(it.value)}
                >
                  {active && <motion.span layoutId="rail-active" className={cx(styles.railActive, variant === "dock" && "bio-lumen")} data-bio-finish={variant === "dock" ? "candy" : undefined} transition={m.transition} />}
                  {it.icon && <span className={styles.railIcon} aria-hidden="true">{it.icon}</span>}
                  <span className={styles.railLabel}>{it.label}</span>
                  {it.badge ? (
                    <span className={styles.railBadge}>
                      {it.badge}
                      <span className="bio-visually-hidden"> new</span>
                    </span>
                  ) : null}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </LayoutGroup>
    </nav>
  );
}
