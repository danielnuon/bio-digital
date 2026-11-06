import { Fragment } from "react";
import styles from "./Navigation.module.css";

export interface Crumb {
  label: string;
  href?: string;
  onClick?: () => void;
}

export function Breadcrumbs({ items, label = "Breadcrumb" }: { items: Crumb[]; label?: string }) {
  return (
    <nav aria-label={label}>
      <ol className={styles.crumbs}>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={`${c.label}-${i}`}>
              <li className={styles.crumb}>
                {last ? (
                  <span className={styles.crumbCurrent} aria-current="page">
                    {c.label}
                  </span>
                ) : c.href ? (
                  <a className={styles.crumbLink} href={c.href} onClick={c.onClick}>
                    {c.label}
                  </a>
                ) : (
                  <button type="button" className={styles.crumbLink} onClick={c.onClick}>
                    {c.label}
                  </button>
                )}
                {!last && (
                  <svg className={styles.crumbSep} viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="m6 3.5 4.5 4.5L6 12.5" />
                  </svg>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
