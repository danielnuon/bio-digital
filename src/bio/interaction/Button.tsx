import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import type { PhysicsKind } from "../physics/physics";
import { useBioMotion, type MotionMode } from "../physics/useBioMotion";
import { cx } from "../utils/cx";
import styles from "./Button.module.css";

/** The component contract from spec §16.6. */
export interface BioButtonContract {
  variant: "primary" | "secondary" | "tertiary" | "destructive";
  size: "compact" | "regular" | "large";
  state: "idle" | "hover" | "pressed" | "focused" | "disabled" | "loading";
  motion: MotionMode;
}

type NativeProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragStart" | "onDragEnd" | "onDragEnter" | "onDragLeave" | "onDragOver" | "onDrop"
>;

export interface ButtonProps extends NativeProps {
  variant?: BioButtonContract["variant"];
  size?: BioButtonContract["size"];
  /** Per-component motion override; defaults to the environment preference. */
  motion?: MotionMode;
  /** Which material's physics governs the press. */
  physics?: PhysicsKind;
  loading?: boolean;
  /** Label text announced while loading. */
  loadingLabel?: string;
  icon?: ReactNode;
  /** Render as an icon-only control; `aria-label` is then required. */
  iconOnly?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "regular",
    motion: motionOverride,
    physics = "membrane",
    loading = false,
    loadingLabel,
    disabled = false,
    icon,
    iconOnly = false,
    type = "button",
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const m = useBioMotion(physics, motionOverride);
  const inactive = disabled || loading;
  const state: BioButtonContract["state"] = disabled ? "disabled" : loading ? "loading" : "idle";

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (inactive) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      aria-disabled={inactive || undefined}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      data-state={state}
      data-bio-finish={variant === "primary" ? "candy" : undefined}
      className={cx(styles.button, styles[variant], styles[size], iconOnly && styles.iconOnly, variant === "primary" && "bio-lumen", className)}
      whileHover={inactive ? undefined : { y: -m.hoverLift }}
      whileTap={inactive ? undefined : { scale: m.pressScale }}
      transition={m.transition}
      onClick={handleClick}
      {...rest}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      ) : (
        icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )
      )}
      {!iconOnly && <span>{loading && loadingLabel ? loadingLabel : children}</span>}
    </motion.button>
  );
});
