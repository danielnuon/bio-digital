import { describe, expect, it } from "vitest";
import { continuousRectPath } from "./corners";

describe("continuous corners", () => {
  it("starts and closes on the top edge and stays inside the box", () => {
    const d = continuousRectPath(200, 100, 24);
    expect(d.startsWith("M36.69,0")).toBe(true);
    expect(d.endsWith("Z")).toBe(true);
    const nums = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
    const xs = nums.filter((_, i) => i % 2 === 0);
    const ys = nums.filter((_, i) => i % 2 === 1);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThanOrEqual(200);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(100);
  });

  it("clamps the radius so corners never overlap", () => {
    const d = continuousRectPath(60, 40, 999);
    expect(d).not.toContain("NaN");
  });
});
