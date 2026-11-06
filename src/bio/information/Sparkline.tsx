import { useId } from "react";
import { motion } from "motion/react";
import { useBioMotion } from "../physics/useBioMotion";
import { smoothPath } from "./paths";
import styles from "./Information.module.css";

export interface SparklineProps {
  data: number[];
  color?: string;
  className?: string;
}

/** Decorative trend; the parent Metric carries the accessible summary. */
export function Sparkline({ data, color = "var(--bio-accent-ink)", className }: SparklineProps) {
  const id = useId();
  const m = useBioMotion("ambient");
  const w = 120;
  const h = 40;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 4 - ((v - min) / (max - min || 1)) * (h - 8)] as [number, number]);
  const line = smoothPath(pts);
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg className={className ?? styles.spark} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={area} fill={`url(#${id})`} initial={false} animate={{ d: area }} transition={m.reduced ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={false}
        animate={{ d: line }}
        transition={m.reduced ? { duration: 0 } : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
