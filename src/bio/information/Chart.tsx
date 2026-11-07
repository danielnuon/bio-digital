import { useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { motion } from "motion/react";
import { surfaceClass } from "../foundation/Surface";
import { useBioMotion } from "../physics/useBioMotion";
import { smoothPath } from "./paths";
import { cx } from "../utils/cx";
import styles from "./Information.module.css";

export interface ChartSeries {
  id: string;
  label: string;
  data: number[];
  color: string;
  /** Dashed stroke distinguishes series without relying on colour (§6.4). */
  dashed?: boolean;
  area?: boolean;
  /** Stroke gradient (left → right). Defaults to the series colour. */
  gradient?: [string, string];
  /** Soft glow under the line; use for the one series that matters most. */
  glow?: boolean;
}

export interface ChartProps {
  /** Accessible name, e.g. "Energy use, last 24 hours". */
  title: string;
  /** One-sentence summary announced before the data. */
  summary?: string;
  labels: string[];
  series: ChartSeries[];
  height?: number;
  format?: (v: number) => string;
  /** Number of x-axis labels to show. */
  ticks?: number;
  min?: number;
  max?: number;
  className?: string;
}

const W = 1000;

/**
 * Area/line chart in SVG. Datasets morph continuously (same point count),
 * pointer and keyboard both explore values, and a visually hidden table
 * carries the full data for screen readers.
 */
export function Chart({ title, summary, labels, series, height = 220, format = (v) => v.toFixed(0), ticks = 6, min: minP, max: maxP, className }: ChartProps) {
  const id = useId();
  const m = useBioMotion("ambient");
  const plot = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const n = labels.length;

  const { min, max } = useMemo(() => {
    const all = series.flatMap((s) => s.data);
    const lo = minP ?? Math.min(...all);
    const hi = maxP ?? Math.max(...all);
    const pad = (hi - lo) * 0.12 || 1;
    return { min: minP ?? lo - pad, max: maxP ?? hi + pad };
  }, [series, minP, maxP]);

  const y = (v: number) => height - ((v - min) / (max - min)) * height;
  const x = (i: number) => (i / Math.max(1, n - 1)) * W;

  const paths = series.map((s) => {
    const pts = s.data.map((v, i) => [x(i), y(v)] as [number, number]);
    const line = smoothPath(pts);
    return { s, line, area: `${line} L${W},${height} L0,${height} Z` };
  });

  const transition = m.reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 70, damping: 18, mass: 1 };
  const gridLines = 4;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => max - ((max - min) / gridLines) * i);
  const xTickIdx = Array.from({ length: ticks }, (_, i) => Math.round((i / (ticks - 1)) * (n - 1)));

  const onPointerMove = (e: PointerEvent) => {
    const rect = plot.current?.getBoundingClientRect();
    if (!rect) return;
    const i = Math.round(((e.clientX - rect.left) / rect.width) * (n - 1));
    setActive(Math.max(0, Math.min(n - 1, i)));
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    setActive((a) => {
      const cur = a ?? (e.key === "ArrowLeft" ? n : -1);
      if (e.key === "Home") return 0;
      if (e.key === "End") return n - 1;
      return Math.max(0, Math.min(n - 1, cur + (e.key === "ArrowRight" ? 1 : -1)));
    });
  };

  const pct = active === null ? 0 : (active / Math.max(1, n - 1)) * 100;
  const describe = (i: number) => `${labels[i]}: ${series.map((s) => `${s.label} ${format(s.data[i])}`).join(", ")}`;

  return (
    <figure className={cx(className)} style={{ margin: 0 }}>
      <div
        className={styles.chart}
        role="group"
        tabIndex={0}
        aria-label={`${title}. ${summary ?? ""} Use left and right arrow keys to explore values.`}
        aria-describedby={`${id}-live`}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
      >
        <div className={styles.yAxis} aria-hidden="true" style={{ height }}>
          {yTicks.map((t, i) => (
            <span key={i}>{format(t)}</span>
          ))}
        </div>
        <div
          ref={plot}
          className={styles.plot}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setActive(null)}
          style={{ height }}
          aria-hidden="true"
        >
          <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" height={height}>
            <defs>
              {series.map((s) => (
                <g key={s.id}>
                  <linearGradient id={`${id}-${s.id}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" style={{ stopColor: s.color }} stopOpacity="0.34" />
                    <stop offset="0.7" style={{ stopColor: s.color }} stopOpacity="0.06" />
                    <stop offset="1" style={{ stopColor: s.color }} stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id={`${id}-${s.id}-stroke`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" style={{ stopColor: (s.gradient ?? [s.color, s.color])[0] }} />
                    <stop offset="1" style={{ stopColor: (s.gradient ?? [s.color, s.color])[1] }} />
                  </linearGradient>
                </g>
              ))}
              <filter id={`${id}-glow`} x="-5%" y="-30%" width="110%" height="160%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <g className={styles.grid}>
              {yTicks.map((_, i) => (
                <line key={i} x1="0" x2={W} y1={(height / gridLines) * i} y2={(height / gridLines) * i} />
              ))}
            </g>
            {paths.map(({ s, line, area }) => (
              <g key={s.id}>
                {s.area !== false && (
                  <motion.path d={area} fill={`url(#${id}-${s.id})`} initial={false} animate={{ d: area }} transition={transition} />
                )}
                {s.glow && (
                  <motion.path
                    className={styles.glow}
                    d={line}
                    stroke={`url(#${id}-${s.id}-stroke)`}
                    filter={`url(#${id}-glow)`}
                    initial={false}
                    animate={{ d: line }}
                    transition={transition}
                  />
                )}
                <motion.path
                  className={styles.line}
                  d={line}
                  stroke={`url(#${id}-${s.id}-stroke)`}
                  strokeDasharray={s.dashed ? "7 7" : undefined}
                  initial={false}
                  animate={{ d: line }}
                  transition={transition}
                />
              </g>
            ))}
          </svg>
          {active === null &&
            series
              .filter((s) => s.glow)
              .map((s) => (
                <span
                  key={`end-${s.id}`}
                  className={styles.endpoint}
                  style={{ left: "100%", top: `${(y(s.data[n - 1]) / height) * 100}%`, ["--_c" as string]: (s.gradient ?? [s.color, s.color])[1] }}
                />
              ))}
          {active !== null && (
            <>
              <span className={styles.crosshair} style={{ left: `${pct}%` }} />
              {series.map((s) => (
                <span
                  key={s.id}
                  className={styles.dot}
                  style={{ left: `${pct}%`, top: `${(y(s.data[active]) / height) * 100}%`, background: s.color }}
                />
              ))}
              <div
                className={cx(surfaceClass("membrane", 3, "r2"), styles.tooltip)}
                style={pct > 60 ? { right: `calc(${100 - pct}% + 14px)` } : { left: `calc(${pct}% + 14px)` }}
              >
                <div className={styles.tooltipTitle}>{labels[active]}</div>
                {series.map((s) => (
                  <div key={s.id} className={styles.tooltipRow}>
                    <span className={styles.swatch} style={{ background: s.color }} />
                    <span>{s.label}</span>
                    <strong style={{ marginInlineStart: "auto" }}>{format(s.data[active])}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className={styles.xAxis} aria-hidden="true">
          {xTickIdx.map((i) => (
            <span key={i}>{labels[i]}</span>
          ))}
        </div>
        <span id={`${id}-live`} className="bio-visually-hidden" aria-live="polite">
          {active !== null ? describe(active) : ""}
        </span>
      </div>
      {series.length > 1 && (
        <ul className={styles.legend} aria-hidden="true" style={{ marginTop: "var(--bio-space-3)" }}>
          {series.map((s) => (
            <li key={s.id}>
              <span className={styles.legendDash} data-dashed={s.dashed || undefined} style={{ borderColor: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      )}
      {/* A table can't shrink below its content, so a wrapper hides it. */}
      <div className="bio-visually-hidden">
        <table>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Time</th>
            {series.map((s) => (
              <th key={s.id} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((l, i) => (
            <tr key={i}>
              <th scope="row">{l}</th>
              {series.map((s) => (
                <td key={s.id}>{format(s.data[i])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}
