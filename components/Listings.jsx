"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import PlotPlan from "@/components/PlotPlan";
import { mmNum, mmPrice } from "@/lib/format";

const Phone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  </svg>
);

function CardGallery({ images }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  const startX = useRef(null);
  const didSwipe = useRef(false);

  function startTimer() {
    clearInterval(timer.current);
    if (images.length > 1) {
      timer.current = setInterval(
        () => setIdx((i) => (i + 1) % images.length),
        3500
      );
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
      onClick={(e) => {
        if (didSwipe.current) e.stopPropagation();
      }}
    >
      <div
        className="cg-track"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {images.map((img, i) => (
          <img key={i} src={img} className="cg-img" alt="" draggable={false} />
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

export default function Listings({ plots, phone }) {
  const tel = "tel:" + String(phone).replace(/[^0-9+]/g, "");
  const [mode, setMode] = useState("buy");
  const [q, setQ] = useState("");
  const [town, setTown] = useState("အားလုံး");
  const [sel, setSel] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const galleryRef = useRef(null);

  const towns = useMemo(() => {
    const set = ["အားလုံး", ...new Set(plots.map((p) => p.township))];
    return set;
  }, [plots]);

  const items = useMemo(
    () =>
      plots.filter(
        (p) =>
          (town === "အားလုံး" || p.township === town) &&
          (q.trim() === "" ||
            (p.township + (p.street || "") + p.grant).includes(q.trim()))
      ),
    [plots, town, q]
  );

  useEffect(() => {
    document.body.style.overflow = sel ? "hidden" : "";
  }, [sel]);

  useEffect(() => {
    const h = (e) => e.key === "Escape" && setSel(null);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (sel) setImgIdx(0);
  }, [sel]);

  function scrollToImg(i) {
    setImgIdx(i);
    if (galleryRef.current) {
      galleryRef.current.scrollTo({
        left: i * galleryRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  }

  function handleGalleryScroll(e) {
    const { scrollLeft, clientWidth } = e.currentTarget;
    setImgIdx(Math.round(scrollLeft / clientWidth));
  }

  return (
    <div className="app">
      <header>
        <div className="brandrow">
          <a className="brand" href="/">
            <span className="seal" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M3 21V8l9-5 9 5v13" />
                <path d="M3 12h18M9 21V12h6v9" />
              </svg>
            </span>
            <div>
              <b className="mm">မန္တလေး မြေကွက်</b>
              <small>Land Survey · MDY</small>
            </div>
          </a>
          <span className="loc mm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            မန္တလေး
          </span>
        </div>

        <div className="seg" role="tablist">
          <button
            className={`mm ${mode === "buy" ? "on" : ""}`}
            onClick={() => setMode("buy")}
          >
            ဝယ်မယ်
          </button>
          <button
            className={`mm ${mode === "sell" ? "on" : ""}`}
            onClick={() => setMode("sell")}
          >
            ရောင်းမယ်
          </button>
        </div>

        {mode === "buy" && (
          <>
            <div className="search">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4-4" />
              </svg>
              <input
                className="mm"
                placeholder="မြို့နယ် / လမ်း ရှာရန်..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="ရှာရန်"
              />
            </div>
            <div className="chips mm">
              {towns.map((t) => (
                <button
                  key={t}
                  className={`chip ${t === town ? "on" : ""}`}
                  onClick={() => setTown(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </>
        )}
      </header>

      <main>
        {mode === "buy" ? (
          <>
            <div className="eyebrow">
              <span className="mono">{mmNum(items.length)} ကွက်</span>
              <span className="ln"></span>
              <span>MANDALAY</span>
            </div>

            {items.length ? (
              items.map((p) => (
                <article
                  key={p.id}
                  className="card"
                  tabIndex={0}
                  onClick={() => setSel(p)}
                  onKeyDown={(e) => e.key === "Enter" && setSel(p)}
                >
                  <div className="plan">
                    {p.tag && <span className="tag mm">{p.tag}</span>}
                    {p.images?.length > 0 ? (
                      <CardGallery images={p.images} />
                    ) : (
                      <PlotPlan w={p.width} h={p.height} />
                    )}
                    {p.status === "sold" && (
                      <div className="sold mm">ရောင်းပြီး</div>
                    )}
                  </div>
                  <div className="info">
                    <div className="top">
                      <div className="twn mm">
                        {p.township}
                        <span className="grant">
                          {p.street ? p.street + " · " : ""}
                          {p.grant}
                        </span>
                      </div>
                      <div className="price">
                        <b>{mmNum(p.priceLakh)}</b>
                        <small className="mm">သိန်း</small>
                      </div>
                    </div>
                    <div className="meta mm">
                      <div>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                        <span className="mono">
                          {p.width}×{p.height}
                        </span>{" "}
                        ပေ
                      </div>
                      {p.facing && (
                        <div>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 2v20M2 12h20" />
                          </svg>
                          {p.facing}မျက်နှာ
                        </div>
                      )}
                      {p.road && (
                        <div>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M4 19h16M6 19V9l6-5 6 5v10" />
                          </svg>
                          {p.road}
                        </div>
                      )}
                    </div>
                    <a
                      className="call mm"
                      href={tel}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone /> ဖုန်းခေါ်မယ်
                    </a>
                  </div>
                </article>
              ))
            ) : (
              <p
                className="mm"
                style={{
                  textAlign: "center",
                  color: "var(--muted)",
                  padding: "40px 0",
                }}
              >
                မြေကွက် မရှိသေးပါ။ တခြားမြို့နယ် ရွေးကြည့်ပါ။
              </p>
            )}
          </>
        ) : (
          <div className="sell mm">
            <span className="big" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M3 21V8l9-5 9 5v13" />
                <path d="M3 21h18" />
                <path d="M12 11v5M9.5 13.5h5" />
              </svg>
            </span>
            <h2>မြေကွက် ရောင်းချင်ပါသလား?</h2>
            <p>
              ဖုန်းတစ်ချက် ခေါ်ပြီး မြေကွက်အချက်အလက် ပြောပြလိုက်ရုံပါပဲ။
              ဈေးကွက်ပေါက်ဈေးနဲ့ ဝယ်ယူသူ ရှာပေးပါမယ်။
            </p>
            <div className="steps">
              <div className="step">
                <span className="n">၁</span>
                <div>
                  <b>ဖုန်းခေါ်ပါ</b>
                  <small>အောက်က ခလုတ်ကို နှိပ်လိုက်ပါ</small>
                </div>
              </div>
              <div className="step">
                <span className="n">၂</span>
                <div>
                  <b>အချက်အလက် ပြောပြပါ</b>
                  <small>နေရာ၊ အကျယ် (ပေ)၊ ဂရန်အမျိုးအစား၊ လိုချင်တဲ့ဈေး</small>
                </div>
              </div>
              <div className="step">
                <span className="n">၃</span>
                <div>
                  <b>ဝယ်သူနဲ့ ချိတ်ဆက်ပေးမယ်</b>
                  <small>ပုံ/မြေပုံ ရရှိရင် ပိုမြန်ပါတယ်</small>
                </div>
              </div>
            </div>
            <a
              className="call mm"
              href={tel}
              style={{ maxWidth: 320, margin: "0 auto" }}
            >
              <Phone /> မြေကွက်တင်ရန် ဖုန်းခေါ်မယ်
            </a>
          </div>
        )}
      </main>

      <nav>
        <a
          className={mode === "buy" ? "on" : ""}
          onClick={() => setMode("buy")}
          role="button"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
          </svg>
          <span className="mm">မြေကွက်</span>
        </a>
        <a href={tel}>
          <Phone />
          <span className="mm">ဖုန်း</span>
        </a>
        <a
          className="post"
          onClick={() => setMode("sell")}
          role="button"
          aria-label="ရောင်းမယ်"
        >
          <span className="pc">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </a>
        <a href="/admin">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
          </svg>
          <span className="mm">စီမံ</span>
        </a>
        <a href="/profile">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
          </svg>
          <span className="mm">ကျွန်ုပ်</span>
        </a>
      </nav>

      {sel && (
        <div className="sheet" role="dialog" aria-modal="true">
          <div className="bg" onClick={() => setSel(null)}></div>
          <div className="panel">
            <div className="grab"></div>
            {sel.images?.length > 0 ? (
              <div className="dg-wrap">
                <div
                  className="dg-scroll"
                  ref={galleryRef}
                  onScroll={handleGalleryScroll}
                >
                  {sel.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className="dg-img"
                      alt={`${sel.township} ${i + 1}`}
                    />
                  ))}
                </div>
                {sel.images.length > 1 && (
                  <div className="dg-dots">
                    {sel.images.map((_, i) => (
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
              <div className="dplan">
                <PlotPlan w={sel.width} h={sel.height} />
              </div>
            )}
            <div className="dwrap">
              <h2 className="mm">{sel.township} မြေကွက်</h2>
              <div className="subt mm">
                {sel.street ? sel.street + " · " : ""}
                {sel.grant}
              </div>
              <div className="dprice">{mmPrice(sel.priceLakh)}</div>
              <div className="specs mm">
                <div>
                  <small>အကျယ်အဝန်း</small>
                  <b className="mono">
                    {sel.width} × {sel.height} ပေ
                  </b>
                </div>
                <div>
                  <small>ဧရိယာ</small>
                  <b className="mono">
                    {mmNum(sel.width * sel.height)} စတုရန်းပေ
                  </b>
                </div>
                <div>
                  <small>ဂရန်အမျိုးအစား</small>
                  <b>{sel.grant}</b>
                </div>
                {sel.facing && (
                  <div>
                    <small>မျက်နာလည့်</small>
                    <b>{sel.facing}ဘက်</b>
                  </div>
                )}
                {sel.road && (
                  <div>
                    <small>ရှေ့လမ်း</small>
                    <b>{sel.road}</b>
                  </div>
                )}
                {sel.street && (
                  <div>
                    <small>တည်နေရာ</small>
                    <b>{sel.street}</b>
                  </div>
                )}
              </div>
              {sel.note && (
                <p
                  className="mm"
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    marginBottom: 14,
                  }}
                >
                  {sel.note}
                </p>
              )}
              <div className="dcall mm">
                <a className="primary" href={tel}>
                  <Phone /> ဖုန်းတိုက်ရိုက်ခေါ်မယ်
                </a>
                <a className="ghost" onClick={() => setSel(null)} role="button">
                  ပိတ်မယ်
                </a>
              </div>
              <div className="note mm">
                ကြိုက်ရင် ဖုန်းတစ်ချက်ခေါ်ရုံ — {phone}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
