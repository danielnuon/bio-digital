import { useEffect } from "react";

/**
 * One document-level, rAF-throttled pointer listener that writes the
 * pointer position into --bio-mx/--bio-my on the lit surface under it.
 * Only the hovered element is touched, so cost stays flat as surfaces grow
 * (§20.5: no per-frame React state, no per-component listeners).
 */
export function useMaterialLight(root: HTMLElement | null, enabled: boolean) {
  useEffect(() => {
    if (!root || !enabled || typeof window === "undefined") return;
    if (window.matchMedia && !window.matchMedia("(hover: hover)").matches) return;
    let frame = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const el = (e.target as Element | null)?.closest?.("[data-bio-light]") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--bio-mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--bio-my", `${e.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    root.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      root.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [root, enabled]);
}

/**
 * Viewing angle (--bio-view-x, --bio-view-y, each −1…1) on the root.
 * Layered finishes read it to shift colour with angle, the way pearl and
 * colour-shift paints "flop" between face and flank. Sources, in order of
 * preference: device tilt (when available), the pointer, and on touch
 * screens scroll position, so the finish still moves as you scroll.
 * The root eases these values (registered properties with a transition),
 * which gives the change mass instead of tracking the input rigidly.
 */
export function useViewAngle(root: HTMLElement | null, enabled: boolean) {
  useEffect(() => {
    if (!root || typeof window === "undefined") return;
    if (!enabled) {
      root.style.setProperty("--bio-view-x", "0");
      root.style.setProperty("--bio-view-y", "0");
      return;
    }
    let frame = 0;
    let x = 0;
    let y = 0;
    let tilt = false;
    const write = () => {
      frame = 0;
      root.style.setProperty("--bio-view-x", x.toFixed(3));
      root.style.setProperty("--bio-view-y", y.toFixed(3));
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const onMove = (e: PointerEvent) => {
      if (tilt || e.pointerType === "touch") return;
      x = clamp((e.clientX / window.innerWidth) * 2 - 1);
      y = clamp((e.clientY / window.innerHeight) * 2 - 1);
      queue();
    };
    const onScroll = () => {
      if (tilt) return;
      const coarse = window.matchMedia?.("(hover: none)").matches;
      if (!coarse) return;
      x = Math.sin(window.scrollY / 420) * 0.8;
      y = Math.cos(window.scrollY / 640) * 0.5;
      queue();
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tilt = true;
      x = clamp(e.gamma / 30);
      y = clamp((e.beta - 45) / 30);
      queue();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("deviceorientation", onTilt);
    onScroll();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("deviceorientation", onTilt);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [root, enabled]);
}

/**
 * iOS asks permission before sharing device tilt, and only from a tap.
 * Call this from a button; resolves true when tilt events will arrive.
 */
export async function requestTiltPermission(): Promise<boolean> {
  const DOE = (typeof window !== "undefined" ? window.DeviceOrientationEvent : undefined) as
    | (typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> })
    | undefined;
  if (!DOE) return false;
  if (typeof DOE.requestPermission !== "function") return true;
  try {
    return (await DOE.requestPermission()) === "granted";
  } catch {
    return false;
  }
}
