import type { CSSProperties, HTMLAttributes } from "react";
import type { Material } from "../physics/physics";
import { cx } from "../utils/cx";
import { surfaceClass } from "./Surface";
import styles from "./Layout.module.css";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxWidth?: number | string;
}

/** Centres content with responsive gutters. */
export function Container({ maxWidth, className, style, ...rest }: ContainerProps) {
  const s = maxWidth ? ({ ...style, "--_max": typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth } as CSSProperties) : style;
  return <div className={cx(styles.container, className)} style={s} {...rest} />;
}

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** CSS length or spacing token step; defaults to the density gap. */
  gap?: string | number;
  direction?: "column" | "row";
}

/** Vertical or wrapping horizontal rhythm. Gap follows density by default. */
export function Stack({ gap, direction = "column", className, style, ...rest }: StackProps) {
  const g = gap === undefined ? undefined : typeof gap === "number" ? `var(--bio-space-${gap})` : gap;
  return (
    <div
      className={cx(styles.stack, direction === "row" && styles.row, className)}
      style={g ? ({ ...style, "--_gap": g } as CSSProperties) : style}
      {...rest}
    />
  );
}

export interface DividerProps extends HTMLAttributes<HTMLElement> {
  orientation?: "horizontal" | "vertical";
  /** Decorative dividers are hidden from assistive technology. */
  decorative?: boolean;
}

export function Divider({ orientation = "horizontal", decorative = true, className, ...rest }: DividerProps) {
  const cls = cx(styles.divider, styles[orientation], className);
  if (decorative) return <div aria-hidden="true" className={cls} {...rest} />;
  return <div role="separator" aria-orientation={orientation} className={cls} {...rest} />;
}

/** A decorative, absolutely positioned material layer inside a relative parent. */
export function MaterialLayer({ material = "membrane", className, ...rest }: HTMLAttributes<HTMLDivElement> & { material?: Material }) {
  return <div aria-hidden="true" className={cx(surfaceClass(material, 0, "r3"), styles.layer, className)} {...rest} />;
}

/** Deterministic pseudo-random generator so organic shapes are stable. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A closed, smooth organic contour (§4.4, §7.1). Irregularity is bounded
 * so the form stays disciplined.
 */
export function organicPath(seed = 1, points = 7, irregularity = 0.18, size = 200): string {
  const rand = mulberry32(seed);
  const c = size / 2;
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2;
    const r = c * (1 - irregularity + rand() * irregularity * 2) * 0.9;
    return [c + Math.cos(a) * r, c + Math.sin(a) * r] as const;
  });
  // Closed Catmull-Rom → cubic Bézier.
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % points];
    const p3 = pts[(i + 2) % points];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

export interface OrganicShapeProps extends Omit<HTMLAttributes<SVGSVGElement>, "fill"> {
  seed?: number;
  size?: number;
  fill?: string;
  irregularity?: number;
}

/** Background organic form. Decorative only. */
export function OrganicShape({ seed = 1, size = 200, fill = "var(--bio-accent-soft)", irregularity, className, ...rest }: OrganicShapeProps) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 200 200" className={cx(styles.shape, className)} {...rest}>
      <path d={organicPath(seed, 7, irregularity)} fill={fill} />
    </svg>
  );
}
