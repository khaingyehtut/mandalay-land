"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function NavProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const bar = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    clearTimeout(timer.current);
    el.style.transition = "none";
    el.style.width = "0%";
    el.style.opacity = "1";
    requestAnimationFrame(() => {
      el.style.transition = "width 0.4s ease";
      el.style.width = "100%";
    });
    timer.current = setTimeout(() => {
      el.style.transition = "opacity 0.3s";
      el.style.opacity = "0";
    }, 400);
    return () => clearTimeout(timer.current);
  }, [pathname, searchParams]);

  return (
    <div ref={bar} style={{
      position: "fixed", top: 0, left: 0,
      height: 2, width: "0%", opacity: 0, zIndex: 9999,
      background: "linear-gradient(90deg, #E0A33B, #f5c96e)",
      pointerEvents: "none",
    }} />
  );
}
