/**
 * Device-aware geometry.
 *
 * 1. Display corner radius. The web has no API for the screen's corner
 *    radius, so on iOS we map the screen's size in points to the published
 *    per-model radius. Display Zoom and models sharing a size make this an
 *    estimate; apps can pass an exact value to <BioProvider deviceRadius>.
 * 2. Continuous corners. iOS draws corners with a continuous curve, not a
 *    circular arc. `continuousRectPath` reproduces that curve for clip-path.
 */

interface Entry {
  w: number;
  h: number;
  r: number;
  /** true when the value is an estimate rather than a published figure */
  est?: boolean;
}

// Portrait screen size in points → display corner radius in points.
// Sources: kylebshr/ScreenCorners README and community measurements.
const IPHONE: Entry[] = [
  { w: 375, h: 667, r: 0 }, // SE 2/3 and 6–8: square display corners
  { w: 375, h: 812, r: 41, est: true }, // X/Xs/11 Pro = 39, 12/13 mini = 44
  { w: 414, h: 896, r: 40, est: true }, // Xs Max/11 Pro Max = 39, Xr/11 = 41.5
  { w: 390, h: 844, r: 47.33 }, // 12, 12 Pro, 13, 13 Pro, 14
  { w: 428, h: 926, r: 53.33 }, // 12/13 Pro Max, 14 Plus
  { w: 393, h: 852, r: 55 }, // 14 Pro, 15, 15 Pro, 16
  { w: 430, h: 932, r: 55 }, // 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
  { w: 402, h: 874, r: 62, est: true }, // 16 Pro, 17, 17 Pro
  { w: 440, h: 956, r: 62, est: true }, // 16 Pro Max, 17 Pro Max
  { w: 420, h: 912, r: 62, est: true }, // iPhone Air
];

export interface DeviceCorners {
  radius: number;
  source: "model" | "estimate" | "none";
  label: string;
}

export function detectDeviceCorners(): DeviceCorners {
  if (typeof navigator === "undefined" || typeof screen === "undefined") return { radius: 0, source: "none", label: "Unknown device" };
  const ua = navigator.userAgent;
  const isIPhone = /iPhone/.test(ua);
  const isIPad = /iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const w = Math.min(screen.width, screen.height);
  const h = Math.max(screen.width, screen.height);
  if (isIPad) return { radius: 18, source: "model", label: "iPad with rounded display" };
  if (!isIPhone) return { radius: 0, source: "none", label: "Not an iPhone or iPad" };
  const exact = IPHONE.find((e) => e.w === w && e.h === h);
  if (exact) return { radius: exact.r, source: exact.est ? "estimate" : "model", label: `${w}×${h} pt screen` };
  // Unknown size (a newer model or Display Zoom): nearest by diagonal.
  const d = Math.hypot(w, h);
  const nearest = IPHONE.filter((e) => e.r > 0).reduce((a, b) => (Math.abs(Math.hypot(b.w, b.h) - d) < Math.abs(Math.hypot(a.w, a.h) - d) ? b : a));
  return { radius: nearest.r, source: "estimate", label: `${w}×${h} pt screen (nearest match)` };
}

/**
 * Continuous ("squircle") rounded rectangle as an SVG path. Each corner
 * spreads its curve 1.528× the radius along the edge, so curvature ramps
 * up gradually instead of jumping as a circular arc does.
 */
export function continuousRectPath(w: number, h: number, radius: number): string {
  const r = Math.max(0, Math.min(radius, Math.min(w, h) / 2 / 1.52866483));
  if (r === 0) return `M0,0H${w}V${h}H0Z`;
  const f = (n: number) => +n.toFixed(2);
  // Corner profile, measured from the corner along the two edges.
  const k = [1.52866483, 1.08849323, 0.86840689, 0.66993427, 0.065496, 0.63149399, 0.074911, 0.37282392, 0.16905899];
  const P = (cx: number, cy: number, dx: number, dy: number) => (a: number, b: number) => `${f(cx + dx * a * r)},${f(cy + dy * b * r)}`;
  // For each corner we walk from the edge before it to the edge after it.
  const corner = (p: (a: number, b: number) => string, swap: boolean) => {
    const q = swap ? (a: number, b: number) => p(b, a) : p;
    return [
      `L${q(k[0], 0)}`,
      `C${q(k[1], 0)} ${q(k[2], 0)} ${q(k[3], k[4])}`,
      `L${q(k[5], k[6])}`,
      `C${q(k[7], k[8])} ${q(k[8], k[7])} ${q(k[6], k[5])}`,
      `C${q(0, k[2])} ${q(0, k[1])} ${q(0, k[0])}`,
    ].join(" ");
  };
  return [
    `M${f(k[0] * r)},0`,
    corner(P(w, 0, -1, 1), false), // top-right: along top edge, then down right edge
    corner(P(w, h, -1, -1), true), // bottom-right: along right edge, then bottom edge
    corner(P(0, h, 1, -1), false), // bottom-left
    corner(P(0, 0, 1, 1), true), // top-left
    "Z",
  ].join(" ");
}
