import { continuousRectPath } from "./corners";
import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

export function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute("inert") && el.getClientRects().length > 0);
}

/** Close on Escape and on pointer down outside the given elements. */
export function useDismiss(open: boolean, onClose: () => void, refs: Array<RefObject<HTMLElement | null>>) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close.current();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (refs.some((r) => r.current?.contains(t))) return;
      close.current();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

/**
 * Trap Tab focus inside `ref` while active, focus the first focusable (or
 * `initialFocus`), and restore focus to the previously focused element on
 * deactivation so dismissal returns users to where they were (§8.2).
 */
export function useFocusTrap(active: boolean, ref: RefObject<HTMLElement | null>, initialFocus?: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const root = ref.current;
    const raf = requestAnimationFrame(() => {
      const target = initialFocus?.current ?? (root ? focusableWithin(root)[0] : null) ?? root;
      target?.focus({ preventScroll: true });
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !ref.current) return;
      const items = focusableWithin(ref.current);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}



const supportsCornerShape = () => typeof CSS !== "undefined" && CSS.supports?.("corner-shape", "superellipse(2)");

/**
 * Continuous corners for an element. Uses native `corner-shape` where the
 * browser has it; elsewhere (Safari, Firefox) clips to a continuous-curve
 * path that tracks the element's size. Clip-path removes outer shadows, so
 * reserve this for chrome whose corners sit against the device's corners.
 * `radius` may be a number or a function of the element (to read CSS vars).
 */
export function useContinuousCorners(ref: RefObject<HTMLElement | null>, radius: number | ((el: HTMLElement) => number), enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (supportsCornerShape()) {
      el.style.setProperty("corner-shape", "superellipse(1.6)");
      return () => el.style.removeProperty("corner-shape");
    }
    if (typeof ResizeObserver === "undefined") return;
    const apply = () => {
      const r = typeof radius === "function" ? radius(el) : radius;
      el.style.clipPath = `path("${continuousRectPath(el.offsetWidth, el.offsetHeight, r)}")`;
    };
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    apply();
    return () => {
      ro.disconnect();
      el.style.clipPath = "";
    };
  }, [ref, radius, enabled]);
}

/** Read an element's computed corner radius (resolves CSS variables). */
export const readRadius = (el: HTMLElement) => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
