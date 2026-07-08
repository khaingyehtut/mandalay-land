"use client";
import { useState, useMemo, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import PlotPlan from "@/components/PlotPlan";
import { mmNum } from "@/lib/format";

// PlotSheet: not needed on initial paint — load its JS only when a card is tapped
const CardGallery = dynamic(() => import("@/components/CardGallery"));
const PlotSheet = dynamic(() => import("@/components/PlotSheet"), {
  ssr: false,
  loading: () => (
    <div className="sheet" role="dialog">
      <div className="bg" />
      <div className="panel">
        <div className="sk-plan" />
        <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="sk-line" style={{ width: "60%", height: 22 }} />
          <div className="sk-line" style={{ width: "40%", height: 13, marginTop: 2 }} />
          <div className="sk-line" style={{ width: "45%", height: 28, marginTop: 10 }} />
          <div className="sk-line" style={{ width: "100%", height: 90, marginTop: 14, borderRadius: 12 }} />
          <div className="sk-btn" style={{ marginTop: 8 }} />
        </div>
      </div>
    </div>
  ),
});

const Phone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  </svg>
);

export default function ListingsContent({ plots, phone, townships, activeTown, isAdmin }) {
  const [q, setQ] = useState("");
  const [listingType, setListingType] = useState("sale");
  const [sel, setSel] = useState(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const tel = "tel:" + phone.replace(/[^0-9+]/g, "");

  const items = useMemo(
    () =>
      plots.filter(
        (p) =>
          (p.listingType ?? "sale") === listingType &&
          (q.trim() === "" ||
            (p.township + (p.street || "") + p.grant).toLowerCase().includes(q.trim().toLowerCase()))
      ),
    [plots, q, listingType]
  );

  useEffect(() => {
    const app = document.querySelector(".app");
    if (app) app.style.overflow = sel ? "hidden" : "";
    if (sel) document.body.classList.add("sheet-open");
    else document.body.classList.remove("sheet-open");
    return () => {
      if (app) app.style.overflow = "";
      document.body.classList.remove("sheet-open");
    };
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
      {/* Sale / Rent tabs */}
      <div className="seg mm" role="tablist" style={{ margin: "11px 18px 0" }}>
        <button className={listingType === "sale" ? "on" : ""} onClick={() => setListingType("sale")}>ဝယ်မည်</button>
        <button className={listingType === "rent" ? "on" : ""} onClick={() => setListingType("rent")}>ဌားမည်</button>
      </div>

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
                {p.status === "sold" && <div className="sold mm">{p.listingType === "rent" ? "ငှားပြီး" : "ရောင်းပြီး"}</div>}
              </div>
              <div className="info">
                <div className="top">
                  <div className="twn mm">
                    {p.township}
                    <span className="grant">
                      {p.street ? p.street + (p.listingType !== "rent" ? " · " : "") : ""}
                      {p.listingType !== "rent" ? p.grant : ""}
                    </span>
                  </div>
                  <div className="price">
                    <b>{p.listingType === "rent" ? p.priceLakh.toLocaleString() : mmNum(p.priceLakh)}</b>
                    <small className="mm">{p.listingType === "rent" ? "/1လ" : "သိန်း"}</small>
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
                {isAdmin && (p.agentName || p.agentPhone) && (
                  <div style={{
                    display:"flex", alignItems:"center", gap:6,
                    marginTop:6, padding:"5px 8px",
                    background:"rgba(99,179,237,0.07)",
                    border:"1px solid rgba(99,179,237,0.18)",
                    borderRadius:8,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="#63B3ED" strokeWidth="2">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
                    </svg>
                    {p.agentName && (
                      <span style={{ fontSize:11, color:"#63B3ED", fontFamily:"var(--font-myanmar,system-ui)",
                        fontWeight:600, flex:1, minWidth:0,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {p.agentName}
                      </span>
                    )}
                    {p.agentPhone && (
                      <>
                        <span style={{ fontSize:10, color:"rgba(99,179,237,0.4)" }}>·</span>
                        <span style={{ fontSize:11, color:"#63B3ED", fontVariantNumeric:"tabular-nums",
                          letterSpacing:"0.02em" }}>{p.agentPhone}</span>
                      </>
                    )}
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
          {listingType === "rent" ? "အဌားချမည့် မြေကွက် မရှိသေးပါ။" : "မြေကွက် မရှိသေးပါ။ တခြားမြို့နယ် ရွေးကြည့်ပါ။"}
        </p>
      )}

      {sel && createPortal(
        <PlotSheet plot={sel} phone={phone} tel={tel} onClose={() => setSel(null)} />,
        document.body
      )}
    </>
  );
}
