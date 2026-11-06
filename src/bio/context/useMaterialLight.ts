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
