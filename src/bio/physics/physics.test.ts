import { describe, expect, it } from "vitest";
import { dampingRatio, physics, settleTime, shouldDismiss, simulateSpring } from "./physics";

describe("physics model", () => {
  it("every spring reaches equilibrium", () => {
    for (const p of Object.values(physics)) {
      const end = simulateSpring(p.spring, { duration: 6 }).at(-1)!;
      expect(Math.abs(end.x)).toBeLessThan(0.01);
    }
  });

  it("membrane is more elastic than crystal", () => {
    expect(dampingRatio(physics.membrane.spring)).toBeLessThan(dampingRatio(physics.crystal.spring));
  });

  it("interactive springs settle within the spatial-transition range", () => {
    for (const k of ["porcelain", "membrane", "crystal", "carbon"] as const) {
      expect(settleTime(physics[k].spring)).toBeLessThan(0.8);
    }
  });

  it("a fast flick dismisses with less displacement than a slow drag", () => {
    expect(shouldDismiss(60, 1500, 150)).toBe(true);
    expect(shouldDismiss(120, 50, 150)).toBe(false);
  });
});
