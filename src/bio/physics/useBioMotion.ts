import { useMemo } from "react";
import { useBio } from "../context/BioProvider";
import { physics, reducedTransition, springTransition, type PhysicsKind } from "./physics";

export type MotionMode = "organic" | "reduced";

/**
 * Resolve the transition and interaction values for a material, honouring
 * the environment's motion preference and an optional per-component
 * override (the `motion` field of the component contract, §16.6).
 */
export function useBioMotion(kind: PhysicsKind = "porcelain", override?: MotionMode) {
  const { motion } = useBio();
  const mode: MotionMode = override ?? motion;
  return useMemo(() => {
    const p = physics[kind];
    const reduced = mode === "reduced";
    return {
      reduced,
      transition: reduced ? reducedTransition : springTransition(kind),
      pressScale: reduced ? 1 : p.pressScale,
      hoverLift: reduced ? 0 : p.hoverLift,
      dragElastic: reduced ? 0 : p.dragElastic,
      /** Spatial travel distance multiplier: reduced travels far less. */
      travel: reduced ? 0.15 : 1,
    };
  }, [kind, mode]);
}
