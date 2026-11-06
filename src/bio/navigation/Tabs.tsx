import { useId, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { LayoutGroup, motion } from "motion/react";
import { useBioMotion } from "../physics/useBioMotion";
import { cx } from "../utils/cx";
import styles from "./Navigation.module.css";

export interface TabItem<T extends string> {
  value: T;
  label: ReactNode;
}

export interface TabsProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  items: TabItem<T>[];
  /** Shared id prefix so <TabPanel idBase=…> can be associated. */
  idBase: string;
  className?: string;
}

const tabId = (base: string, v: string) => `${base}-tab-${v}`;
const panelId = (base: string, v: string) => `${base}-panel-${v}`;

/** WAI-ARIA tabs with roving focus; the active indicator travels continuously. */
export function Tabs<T extends string>({ label, value, onChange, items, idBase, className }: TabsProps<T>) {
  const group = useId();
  const m = useBioMotion("membrane");
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next < 0) return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(items[next].value);
  };

  return (
    <LayoutGroup id={group}>
      <div role="tablist" aria-label={label} className={cx(styles.tablist, className)}>
        {items.map((it, i) => {
          const selected = it.value === value;
          return (
            <button
              key={it.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={tabId(idBase, it.value)}
              aria-selected={selected}
              aria-controls={panelId(idBase, it.value)}
              tabIndex={selected ? 0 : -1}
              className={styles.tab}
              onClick={() => onChange(it.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {selected && <motion.span layoutId="tab-indicator" className={styles.tabIndicator} transition={m.transition} />}
              <span className={styles.tabText}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  idBase: string;
  value: string;
}

export function TabPanel({ idBase, value, ...rest }: TabPanelProps) {
  return <div role="tabpanel" id={panelId(idBase, value)} aria-labelledby={tabId(idBase, value)} tabIndex={0} {...rest} />;
}
