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
 * Viewing angle (--bio-view-x, --bio-view-y, each −1…1) on the root, from
 * device tilt. Layered finishes read it to shift colour with angle, the way
 * pearl paint "flops" between face and flank.
 *
 * Opt-in (not called by BioProvider). Every write restyles every finished
 * surface, so the hook eases in script toward the tilt target, writes only
 * visible changes, and stops its loop once the angle has settled. Pointer
 * and scroll are deliberately not sources: they change on nearly every
 * frame and made the whole page repaint while scrolling.
 */
export function useViewAngle(root: HTMLElement | null, enabled: boolean) {
  useEffect(() => {
    if (!root || typeof window === "undefined") return;
    const set = (x: number, y: number) => {
      root.style.setProperty("--bio-view-x", x.toFixed(3));
      root.style.setProperty("--bio-view-y", y.toFixed(3));
    };
    if (!enabled) {
      set(0, 0);
      return;
    }
    let frame = 0;
    const cur = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const step = () => {
      frame = 0;
      const dx = target.x - cur.x;
      const dy = target.y - cur.y;
      if (Math.abs(dx) < 0.004 && Math.abs(dy) < 0.004) return;
      cur.x += dx * 0.12;
      cur.y += dy * 0.12;
      set(cur.x, cur.y);
      frame = requestAnimationFrame(step);
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      // quantise so sensor noise doesn't keep the loop awake
      target.x = Math.round(clamp(e.gamma / 30) * 50) / 50;
      target.y = Math.round(clamp((e.beta - 45) / 30) * 50) / 50;
      if (!frame) frame = requestAnimationFrame(step);
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => {
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

/**
 * Reflection placement. Surfaces reflect the environment: the environment
 * map is drawn at viewport scale and offset by each surface's place in the
 * page, so neighbouring cards show neighbouring parts of the field.
 *
 * The offset is computed in page space and only when layout changes
 * (resize, content added or removed), never on scroll. Writing per-element
 * offsets on every scroll frame repainted every card while scrolling, which
 * is what made scrolling stutter. The trade: a reflection does not slide as
 * its surface scrolls. The field is low-frequency, so this reads as a
 * stable tint rather than a frozen picture.
 */
export function useReflectionPlacement(root: HTMLElement | null, enabled: boolean) {
  useEffect(() => {
    if (!root || !enabled || typeof window === "undefined") return;
    let frame = 0;
    const place = () => {
      frame = 0;
      const vh = window.innerHeight || 1;
      const sy = window.scrollY;
      root.querySelectorAll<HTMLElement>("[data-bio-reflect]").forEach((el) => {
        const r = el.getBoundingClientRect();
        // page-space top, folded into the map's height; keep the surface
        // inside the map when it fits so its lower edge isn't left bare
        const top = (((r.top + sy) % vh) + vh) % vh;
        const fit = Math.min(top, Math.max(0, vh - r.height));
        const x = `${-Math.round(r.left)}px`;
        const y = `${-Math.round(fit)}px`;
        if (el.style.getPropertyValue("--bio-rx") !== x) el.style.setProperty("--bio-rx", x);
        if (el.style.getPropertyValue("--bio-ry") !== y) el.style.setProperty("--bio-ry", y);
      });
    };
    let timer = 0;
    // Batch bursts of layout change (a view switch mounts many surfaces).
    const queue = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!frame) frame = requestAnimationFrame(place);
      }, 60);
    };
    window.addEventListener("resize", queue);
    const mo = new MutationObserver(queue);
    mo.observe(root, { childList: true, subtree: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(queue) : null;
    ro?.observe(root);
    queue();
    return () => {
      window.removeEventListener("resize", queue);
      window.clearTimeout(timer);
      mo.disconnect();
      ro?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [root, enabled]);
}
