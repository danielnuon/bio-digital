import { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { physics } from "../physics/physics";
import { useBioMotion } from "../physics/useBioMotion";

export interface AnimatedNumberProps {
  value: number;
  format?: (v: number) => string;
  className?: string;
}

/**
 * Numbers travel to their new value with porcelain inertia instead of
 * snapping. The update bypasses React renders (§20.5): the motion value
 * writes text directly.
 */
export function AnimatedNumber({ value, format = (v) => Math.round(v).toString(), className }: AnimatedNumberProps) {
  const { reduced } = useBioMotion("porcelain");
  const spring = useSpring(value, { ...physics.porcelain.spring, stiffness: 120, damping: 22 });
  useEffect(() => {
    if (reduced) spring.jump(value);
    else spring.set(value);
  }, [value, reduced, spring]);
  const text = useTransform(spring, format);
  return <motion.span className={className}>{text}</motion.span>;
}
