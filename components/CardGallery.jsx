"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Dynamically imported in ListingsContent — code-split from main bundle.
// SSR: true (default) so the first image IS in the initial HTML for LCP.
export default function CardGallery({ images, priority = false }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  const startX = useRef(null);
  const didSwipe = useRef(false);

  function startTimer() {
    clearInterval(timer.current);
    if (images.length > 1) {
      timer.current = setInterval(() => setIdx((i) => (i + 1) % images.length), 3500);
    }
  }

  useEffect(() => {
    startTimer();
    return () => clearInterval(timer.current);
  }, [images.length]);

  function goTo(i) {
    setIdx(i);
    startTimer();
  }

  function handlePointerDown(e) {
    startX.current = e.clientX;
    didSwipe.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerUp(e) {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) > 28) {
      didSwipe.current = true;
      goTo((idx + (dx < 0 ? 1 : -1) + images.length) % images.length);
    }
  }

  return (
    <div
      className="cg-wrap"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={(e) => { if (didSwipe.current) e.stopPropagation(); }}
    >
      <div className="cg-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {images.map((img, i) => (
          // cg-slide: position:relative required for next/image fill
          <div key={i} className="cg-slide">
            <Image
              src={img}
              alt=""
              fill
              sizes="(max-width: 440px) 100vw, 440px"
              style={{ objectFit: "cover" }}
              // priority on first image of first card = LCP element gets preloaded
              priority={priority && i === 0}
              quality={80}
              draggable={false}
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="cg-dots" onClick={(e) => e.stopPropagation()}>
          {images.map((_, i) => (
            <button
              key={i}
              className={`cg-dot ${i === idx ? "on" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`ပုံ ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
