/**
 * BIO DIGITAL physics model (spec §10–11).
 *
 * Physical behaviour is defined separately from rendering (§21.3): a
 * component picks a *material* and gets that material's spring, press
 * compression and drag resistance, independent of how it looks.
 *
 * Springs follow the spring-damper model F = -kx - cv, a = F/m, where
 * k = stiffness, c = damping, m = mass. Motion for React integrates these
 * with variable frame times, so we only describe the parameters here.
 */

export type Material = "porcelain" | "membrane" | "crystal" | "carbon";
export type PhysicsKind = Material | "ambient";

export interface SpringParams {
  /** k — spring stiffness */
  stiffness: number;
  /** c — damping */
  damping: number;
  /** m — mass */
  mass: number;
}

export interface MaterialPhysics {
  spring: SpringParams;
  /** Scale applied while pressed (controlled compression, §12.1). */
  pressScale: number;
  /** Vertical lift on pointer proximity, px (§12.2 hover). */
  hoverLift: number;
  /** Drag elasticity at boundaries, 0 = rigid, 1 = free (§12.6). */
  dragElastic: number;
  /** Plain-language summary of the behaviour (§11.3). */
  character: string;
}

/**
 * Material-specific motion (§11.3). Damping ratios:
 *  porcelain ζ≈0.93 (controlled, minimal overshoot)
 *  membrane  ζ≈0.62 (soft deformation and recovery)
 *  crystal   ζ≈0.88 (restrained, deliberate; heavier)
 *  carbon    ζ≈1.0  (grounded, no overshoot)
 *  ambient   ζ≈0.9  (slow environmental transitions)
 */
export const physics: Record<PhysicsKind, MaterialPhysics> = {
  porcelain: {
    spring: { stiffness: 420, damping: 38, mass: 1 },
    pressScale: 0.97,
    hoverLift: 2,
    dragElastic: 0.18,
    character: "Solid and stable. Controlled, minimal deformation.",
  },
  membrane: {
    spring: { stiffness: 260, damping: 18, mass: 0.8 },
    pressScale: 0.955,
    hoverLift: 3,
    dragElastic: 0.4,
    character: "Flexible and elastic. Soft deformation and recovery.",
  },
  crystal: {
    spring: { stiffness: 520, damping: 44, mass: 1.2 },
    pressScale: 0.985,
    hoverLift: 1,
    dragElastic: 0.08,
    character: "Rigid and precise. Restrained, deliberate movement.",
  },
  carbon: {
    spring: { stiffness: 380, damping: 39, mass: 1 },
    pressScale: 0.975,
    hoverLift: 1,
    dragElastic: 0.12,
    character: "Deep and grounded. Settles without overshoot.",
  },
  ambient: {
    spring: { stiffness: 24, damping: 12, mass: 1.6 },
    pressScale: 1,
    hoverLift: 0,
    dragElastic: 0,
    character: "Fluid and continuous. Slow environmental transitions.",
  },
};

/** Restrained replacement for springs when motion is reduced (§18.2). */
export const reducedTransition = { type: "tween", duration: 0.14, ease: "easeOut" } as const;

export function springTransition(kind: PhysicsKind, overrides?: Partial<SpringParams>) {
  return { type: "spring" as const, ...physics[kind].spring, ...overrides };
}

/** ζ = c / (2√(k·m)). <1 overshoots, 1 is critical, >1 is sluggish. */
export function dampingRatio({ stiffness, damping, mass }: SpringParams): number {
  return damping / (2 * Math.sqrt(stiffness * mass));
}

export interface SpringSample {
  t: number;
  x: number;
  v: number;
}

/**
 * Deterministic spring simulation for visualisation (the Physics lab chart).
 * Semi-implicit Euler with fixed sub-steps, which is stable for the
 * stiffness range used here. Starts displaced by `from` and settles to 0.
 */
export function simulateSpring(
  params: SpringParams,
  { from = 1, velocity = 0, duration = 1.6, step = 1 / 240, sampleEvery = 4 } = {},
): SpringSample[] {
  const { stiffness: k, damping: c, mass: m } = params;
  let x = from;
  let v = velocity;
  const out: SpringSample[] = [{ t: 0, x, v }];
  const steps = Math.ceil(duration / step);
  for (let i = 1; i <= steps; i++) {
    const a = (-k * x - c * v) / m;
    v += a * step;
    x += v * step;
    if (i % sampleEvery === 0) out.push({ t: i * step, x, v });
  }
  return out;
}

/** Time until |x| and |v| stay under the rest thresholds (equilibrium). */
export function settleTime(params: SpringParams, restDelta = 0.005, restSpeed = 0.01): number {
  const samples = simulateSpring(params, { duration: 4, sampleEvery: 1 });
  let last = 0;
  for (const s of samples) {
    if (Math.abs(s.x) > restDelta || Math.abs(s.v) > restSpeed) last = s.t;
  }
  return last;
}

/**
 * Gesture interpretation (§12.7): project where a released element would
 * come to rest under friction, so a fast flick dismisses with less
 * displacement than a slow drag. `decay` approximates momentum carry (s).
 */
export function projectRelease(offset: number, velocity: number, decay = 0.2): number {
  return offset + velocity * decay;
}

export function shouldDismiss(offset: number, velocity: number, threshold: number): boolean {
  return Math.abs(projectRelease(offset, velocity)) > threshold;
}
