"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import PlotPlan from "@/components/PlotPlan";
import { mmNum, mmPrice } from "@/lib/format";

// Loaded with ssr:false — JS for this modal is excluded from initial HTML entirely.
// Downloads only when the user taps a card for the first time.
const Phone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  </svg>
);

export default function PlotSheet({ plot, phone, tel, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);
  const galleryRef = useRef(null);

  function scrollToImg(i) {
    setImgIdx(i);
    galleryRef.current?.scrollTo({ left: i * galleryRef.current.clientWidth, behavior: "smooth" });
  }

  function handleGalleryScroll(e) {
    const { scrollLeft, clientWidth } = e.currentTarget;
    setImgIdx(Math.round(scrollLeft / clientWidth));
  }

  // Auto-slide every 3s when multiple images
  useEffect(() => {
    const imgs = plot.images ?? [];
    if (imgs.length <= 1) return;
    const id = setInterval(() => {
      setImgIdx(prev => {
        const next = (prev + 1) % imgs.length;
        galleryRef.current?.scrollTo({ left: next * galleryRef.current.clientWidth, behavior: "smooth" });
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [plot.images]);

  return (
    <div className="sheet" role="dialog" aria-modal="true">
      <div className="bg" onClick={onClose} />
      <button className="sheet-back" onClick={onClose} aria-label="ပြန်သွားမည်">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        <span className="mm">ပြန်</span>
      </button>
      <div className="panel">
        {plot.images?.length > 0 ? (
          <div className="dg-wrap">
            <div className="dg-scroll" ref={galleryRef} onScroll={handleGalleryScroll}>
              {plot.images.map((img, i) => (
                // dg-slide: position:relative for next/image fill
                <div key={i} className="dg-slide">
                  <Image
                    src={img}
                    alt={`${plot.township} ${i + 1}`}
                    fill
                    sizes="(max-width: 440px) 100vw, 440px"
                    style={{ objectFit: "cover" }}
                    priority={i === 0}
                    unoptimized
                  />
                </div>
              ))}
            </div>
            {plot.images.length > 1 && (
              <div className="dg-dots">
                {plot.images.map((_, i) => (
                  <span
                    key={i}
                    className={`dg-dot ${i === imgIdx ? "on" : ""}`}
                    onClick={() => scrollToImg(i)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="dplan"><PlotPlan w={plot.width} h={plot.height} /></div>
        )}

        <div className="dwrap">
          <h2 className="mm">{plot.township} မြေကွက်</h2>
          <div className="subt mm">
            {plot.street ? plot.street + (plot.listingType !== "rent" ? " · " : "") : ""}
            {plot.listingType !== "rent" ? plot.grant : ""}
          </div>
          <div className="dprice">
            {plot.listingType === "rent"
              ? `${plot.priceLakh.toLocaleString()} ကျပ် /1လ`
              : mmPrice(plot.priceLakh)}
          </div>
          <div className="specs mm">
            <div><small>အကျယ်အဝန်း</small><b className="mono">{plot.width} × {plot.height} ပေ</b></div>
            <div><small>ဧရိယာ</small><b className="mono">{mmNum(plot.width * plot.height)} စတုရန်းပေ</b></div>
            {plot.listingType !== "rent" && <div><small>ဂရန်အမျိုးအစား</small><b>{plot.grant}</b></div>}
            {plot.facing && <div><small>မျက်နာလည့်</small><b>{plot.facing}ဘက်</b></div>}
            {plot.road && <div><small>ရှေ့လမ်း</small><b>{plot.road}</b></div>}
            {plot.street && <div><small>တည်နေရာ</small><b>{plot.street}</b></div>}
          </div>
          {plot.note && (
            <p className="mm" style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>
              {plot.note}
            </p>
          )}
          <div className="dcall mm">
            <a className="primary" href={tel}><Phone /> ဖုန်းတိုက်ရိုက်ခေါ်မယ်</a>
            <a className="ghost" onClick={onClose} role="button">ပိတ်မယ်</a>
          </div>
          <div className="note mm">ကြိုက်ရင် ဖုန်းတစ်ချက်ခေါ်ရုံ — {phone}</div>
        </div>
      </div>
    </div>
  );
}
