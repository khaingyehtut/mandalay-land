"use client";
import { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import PlotPlan from "@/components/PlotPlan";
import { mmNum } from "@/lib/format";

// PlotSheet: not needed on initial paint — load its JS only when a card is tapped
const CardGallery = dynamic(() => import("@/components/CardGallery"));
const PlotSheet = dynamic(() => import("@/components/PlotSheet"), { ssr: false });

const Phone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  </svg>
);

export default function ListingsContent({ plots, phone, townships, activeTown, isAdmin }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const tel = "tel:" + phone.replace(/[^0-9+]/g, "");

  // Client-side search on already-fetched plots (instant, no network)
  const items = useMemo(
    () =>
      plots.filter(
        (p) =>
          q.trim() === "" ||
          (p.township + (p.street || "") + p.grant).toLowerCase().includes(q.trim().toLowerCase())
      ),
    [plots, q]
  );

  useEffect(() => {
    document.body.style.overflow = sel ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sel]);

  useEffect(() => {
    const h = (e) => e.key === "Escape" && setSel(null);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  function handleTownFilter(town) {
    startTransition(() => {
      router.push(town ? `/?town=${encodeURIComponent(town)}` : "/", { scroll: false });
    });
  }

  return (
    <>
      {/* Search input */}
      <div className="search" style={{ margin: "11px 18px 0" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
        </svg>
        <input
          className="mm"
          placeholder="မြို့နယ် / လမ်း ရှာရန်..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="ရှာရန်"
        />
      </div>

      {/* Township filter chips — URL-based (server filters by town) */}
      <div className={`chips mm ${isPending ? "chips-pending" : ""}`} style={{ padding: "0 18px" }}>
        <button className={`chip ${!activeTown ? "on" : ""}`} onClick={() => handleTownFilter("")}>
          အားလုံး
        </button>
        {townships.map((t) => (
          <button
            key={t}
            className={`chip ${activeTown === t ? "on" : ""}`}
            onClick={() => handleTownFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="eyebrow" style={{ padding: "0 18px", marginTop: 4 }}>
        <span className="mono">{mmNum(items.length)} ကွက်</span>
        <span className="ln" />
        <span>MANDALAY</span>
      </div>

      {items.length > 0 ? (
        <div style={{ padding: "0 18px" }}>
          {items.map((p, i) => (
            <article
              key={p.id}
              className="card"
              style={{ "--i": i }}
              tabIndex={0}
              onClick={() => setSel(p)}
              onKeyDown={(e) => e.key === "Enter" && setSel(p)}
            >
              <div className="plan">
                {p.tag && <span className="tag mm" style={{ "--i": i }}>{p.tag}</span>}
                {p.images?.length > 0
                  ? <CardGallery images={p.images} priority={i === 0} />
                  : <PlotPlan w={p.width} h={p.height} />}
                {p.status === "sold" && <div className="sold mm">ရောင်းပြီး</div>}
              </div>
              <div className="info">
                <div className="top">
                  <div className="twn mm">
                    {p.township}
                    <span className="grant">{p.street ? p.street + " · " : ""}{p.grant}</span>
                  </div>
                  <div className="price">
                    <b>{mmNum(p.priceLakh)}</b>
                    <small className="mm">သိန်း</small>
                  </div>
                </div>
                <div className="meta mm">
                  <div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                    </svg>
                    <span className="mono">{p.width}×{p.height}</span> ပေ
                  </div>
                  {p.facing && (
                    <div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M2 12h20" />
                      </svg>
                      {p.facing}မျက်နှာ
                    </div>
                  )}
                  {p.road && (
                    <div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19h16M6 19V9l6-5 6 5v10" />
                      </svg>
                      {p.road}
                    </div>
                  )}
                </div>
                {p.createdAt && (
                  <div style={{
                    display:"flex", alignItems:"center", gap:5,
                    marginTop:6, marginBottom:2,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="var(--muted)" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    <span suppressHydrationWarning style={{ fontSize:11, color:"var(--muted)" }}>
                      {new Date(p.createdAt).toLocaleString("en-GB", {
                        day:"2-digit", month:"short", year:"numeric",
                        hour:"2-digit", minute:"2-digit", hour12:true,
                      })}
                    </span>
                  </div>
                )}
                {isAdmin && p.user && (
                  <div style={{
                    display:"flex", alignItems:"center", gap:6,
                    marginTop:6, padding:"5px 8px",
                    background:"rgba(224,163,59,0.07)",
                    border:"1px solid rgba(224,163,59,0.18)",
                    borderRadius:8,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="#E0A33B" strokeWidth="2">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
                    </svg>
                    <span style={{ fontSize:11, color:"#E0A33B", fontFamily:"var(--font-myanmar,system-ui)",
                      fontWeight:600, flex:1, minWidth:0,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {p.user.name ?? "—"}
                    </span>
                    {p.user.phone && (
                      <>
                        <span style={{ fontSize:10, color:"rgba(224,163,59,0.4)" }}>·</span>
                        <span style={{ fontSize:11, color:"#E0A33B", fontVariantNumeric:"tabular-nums",
                          letterSpacing:"0.02em" }}>{p.user.phone}</span>
                      </>
                    )}
                  </div>
                )}
                <a className="call mm" href={tel} onClick={(e) => e.stopPropagation()}>
                  <Phone /> ဖုန်းခေါ်မယ်
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mm" style={{ textAlign: "center", color: "var(--muted)", padding: "40px 0" }}>
          မြေကွက် မရှိသေးပါ။ တခြားမြို့နယ် ရွေးကြည့်ပါ။
        </p>
      )}

      {/* PlotSheet JS loads only after first card tap — ssr:false keeps it out of initial HTML */}
      {sel && <PlotSheet plot={sel} phone={phone} tel={tel} onClose={() => setSel(null)} />}
    </>
  );
}
