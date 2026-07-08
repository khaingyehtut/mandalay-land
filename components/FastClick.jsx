"use client";
import { useEffect } from "react";

// Fires click immediately on touchend instead of waiting 300ms.
// Skips if the finger moved more than 8px (scroll gesture).
export default function FastClick() {
  useEffect(() => {
    let sx = 0, sy = 0, moved = false;

    function onStart(e) {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      moved = false;
    }

    function onMove(e) {
      if (Math.abs(e.touches[0].clientX - sx) > 8 ||
          Math.abs(e.touches[0].clientY - sy) > 8) moved = true;
    }

    function onEnd(e) {
      if (moved) return;
      const t = e.changedTouches[0];
      const el = document.elementFromPoint(t.clientX, t.clientY);
      if (!el) return;
      const target = el.closest('a,button,[role="button"],label,summary');
      if (!target || target.disabled || target.getAttribute("aria-disabled") === "true") return;
      e.preventDefault(); // block the 300ms ghost click
      target.dispatchEvent(new MouseEvent("click", {
        bubbles: true, cancelable: true, view: window,
        clientX: t.clientX, clientY: t.clientY,
      }));
    }

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove",  onMove,  { passive: true });
    document.addEventListener("touchend",   onEnd,   { passive: false });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove",  onMove);
      document.removeEventListener("touchend",   onEnd);
    };
  }, []);

  return null;
}
