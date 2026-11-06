import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { surfaceClass } from "../foundation/Surface";
import { useBioMotion } from "../physics/useBioMotion";
import { useDismiss } from "../utils/hooks";
import { cx } from "../utils/cx";
import styles from "./Navigation.module.css";

export type MenuEntry =
  | { type?: "item"; label: string; icon?: ReactNode; shortcut?: string; destructive?: boolean; onSelect: () => void }
  | { type: "separator" };

export interface MenuTriggerProps {
  ref: (el: HTMLButtonElement | null) => void;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}

export interface MenuProps {
  /** Render the trigger; spread the props onto a button. */
  trigger: (props: MenuTriggerProps) => ReactNode;
  items: MenuEntry[];
  label: string;
  align?: "start" | "end";
}

/**
 * Contextual menu (§16.3). Floats from its trigger (D3, membrane), keeps
 * a clear relationship to its origin, and returns focus on dismissal.
 */
export function Menu({ trigger, items, label, align = "end" }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [focusOnOpen, setFocusOnOpen] = useState<"first" | "last">("first");
  const id = useId();
  const triggerEl = useRef<HTMLButtonElement | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const m = useBioMotion("membrane");

  const close = (restore = true) => {
    setOpen(false);
    if (restore) triggerEl.current?.focus();
  };
  useDismiss(open, () => close(true), [wrap]);

  const menuItems = () => Array.from(list.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      const els = menuItems();
      (focusOnOpen === "first" ? els[0] : els[els.length - 1])?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [open, focusOnOpen]);

  const onTriggerKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setFocusOnOpen(e.key === "ArrowDown" ? "first" : "last");
      setOpen(true);
    }
  };

  const onMenuKey = (e: KeyboardEvent) => {
    const els = menuItems();
    const i = els.indexOf(document.activeElement as HTMLButtonElement);
    let next = -1;
    if (e.key === "ArrowDown") next = (i + 1) % els.length;
    else if (e.key === "ArrowUp") next = (i - 1 + els.length) % els.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = els.length - 1;
    else if (e.key === "Tab") close(false);
    if (next >= 0) {
      e.preventDefault();
      els[next]?.focus();
    }
  };

  return (
    <div ref={wrap} className={styles.menuWrap}>
      {trigger({
        ref: (el) => {
          triggerEl.current = el;
        },
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": id,
        onClick: () => {
          setFocusOnOpen("first");
          setOpen((o) => !o);
        },
        onKeyDown: onTriggerKey,
      })}
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={list}
            id={id}
            role="menu"
            aria-label={label}
            data-align={align}
            className={cx(surfaceClass("membrane", 3, "r3"), styles.menu)}
            onKeyDown={onMenuKey}
            initial={{ opacity: 0, scale: m.reduced ? 1 : 0.92, y: -6 * m.travel }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: m.reduced ? 1 : 0.96, y: -4 * m.travel, transition: { duration: 0.12 } }}
            transition={m.transition}
          >
            {items.map((it, i) =>
              it.type === "separator" ? (
                <li key={`sep-${i}`} role="separator" className={styles.menuSep} />
              ) : (
                <li key={it.label} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    className={styles.menuItem}
                    data-destructive={it.destructive || undefined}
                    onClick={() => {
                      close(true);
                      it.onSelect();
                    }}
                  >
                    {it.icon && <span aria-hidden="true" style={{ display: "inline-flex" }}>{it.icon}</span>}
                    <span>{it.label}</span>
                    {it.shortcut && <span className={styles.menuShortcut}>{it.shortcut}</span>}
                  </button>
                </li>
              ),
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
