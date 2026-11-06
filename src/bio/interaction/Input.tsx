import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import styles from "./Field.module.css";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: ReactNode;
  description?: ReactNode;
  /** Error message; marks the field invalid and is announced. */
  error?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Visually hide the label (it stays the accessible name). */
  hideLabel?: boolean;
}

export const ErrorGlyph = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="8" cy="8" r="6.5" />
    <path d="M8 4.8v3.6M8 11h.01" />
  </svg>
);

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, description, error, leading, trailing, hideLabel, className, id, disabled, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  const describedBy = [description && `${inputId}-d`, error && `${inputId}-e`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={inputId} className={cx(styles.label, hideLabel && "bio-visually-hidden")}>
        {label}
      </label>
      <div className={styles.box} data-invalid={!!error} data-disabled={!!disabled}>
        {leading && <span className={styles.adornment} aria-hidden="true">{leading}</span>}
        <input
          ref={ref}
          id={inputId}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          {...rest}
        />
        {trailing && <span className={styles.adornment}>{trailing}</span>}
      </div>
      {description && (
        <span id={`${inputId}-d`} className={styles.description}>
          {description}
        </span>
      )}
      {error && (
        <span id={`${inputId}-e`} className={styles.error} role="alert">
          <ErrorGlyph />
          {error}
        </span>
      )}
    </div>
  );
});
