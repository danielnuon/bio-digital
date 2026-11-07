import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { useBio } from "../context/BioProvider";
import type { Material } from "../physics/physics";
import { cx } from "../utils/cx";
import styles from "./Surface.module.css";

export type Depth = 0 | 1 | 2 | 3 | 4;
export type Finish = "pearl" | "chroma" | "candy" | "satin";
export type Radius = "r1" | "r2" | "r3" | "r4" | "r5" | "r6" | "pill" | "organic";
export type Padding = "none" | "sm" | "md" | "lg" | "density";

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  material?: Material;
  depth?: Depth;
  radius?: Radius;
  padding?: Padding;
  /** Specular highlight follows the pointer. Defaults on for membrane, crystal and carbon. */
  lit?: boolean;
  /** Layered finish (see tokens/finish.css): pearl, chroma, candy or satin. */
  finish?: Finish;
  children?: ReactNode;
}

const padClass: Record<Padding, string> = {
  none: styles.padNone,
  sm: styles.padSm,
  md: styles.padMd,
  lg: styles.padLg,
  density: styles.padDensity,
};

/** Surface class names, for components that render their own element. */
export function surfaceClass(material: Material = "porcelain", depth: Depth = 1, radius: Radius = "r3", padding: Padding = "none", lit = false) {
  return cx(styles.surface, styles[material], styles[`d${depth}`], styles[radius], padClass[padding], lit && styles.lit);
}

/** Attribute that opts an element into the shared pointer-light listener. */
export const LIT = { "data-bio-light": "" } as const;

/**
 * A material surface (§5). Porcelain is the default. Carbon re-scopes
 * semantic tokens to the night environment so content inside stays legible.
 */
export const Surface = forwardRef<HTMLElement, SurfaceProps>(function Surface(
  { as: Comp = "div", material = "porcelain", depth = 1, radius = "r3", padding = "none", lit, finish, className, ...rest },
  ref,
) {
  const { environment } = useBio();
  const isLit = lit ?? material !== "porcelain";
  const carbonProps =
    material === "carbon" ? { "data-bio-environment": "night", "data-bio-carbon-parent": environment } : undefined;
  return (
    <Comp
      ref={ref}
      data-bio-material={material}
      data-bio-finish={finish}
      data-bio-depth={`D${depth}`}
      className={cx(surfaceClass(material, depth, radius, padding, isLit), className)}
      {...(isLit ? LIT : undefined)}
      {...carbonProps}
      {...rest}
    />
  );
});
