"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Phone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  </svg>
);

/* ── Sell Promo Sheet (shown when not logged in) ── */
function SellPromoSheet({ onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
          zIndex: 200, backdropFilter: "blur(4px)",
        }}
      />
      {/* Sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
        background: "#13151A", borderTop: "1px solid #2C313C",
        borderRadius: "24px 24px 0 0",
        padding: "0 20px 40px",
        animation: "sheetUp .42s cubic-bezier(0.34,1.56,0.64,1) both",
        maxWidth: 520, margin: "0 auto",
      }}>
        <style>{`@keyframes sheetUp{0%{transform:translateY(104%) scale(.96)} 65%{transform:translateY(-2%) scale(1.007)} 82%{transform:translateY(.8%) scale(.999)} 100%{transform:translateY(0) scale(1)}}`}</style>

        {/* Handle */}
        <div style={{ width: 40, height: 4, background: "#2C313C", borderRadius: 2,
          margin: "12px auto 20px" }} />

        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 20,
          background: "#1E2232", border: "none", borderRadius: "50%",
          width: 32, height: 32, cursor: "pointer", color: "#888B95",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
          background: "rgba(224,163,59,0.08)", border: "1.5px solid rgba(224,163,59,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#E0A33B" strokeWidth="1.7">
            <path d="M3 21V8l9-5 9 5v13"/><path d="M12 11v5M9.5 13.5h5"/>
          </svg>
        </div>

        <h2 style={{
          textAlign: "center", fontSize: 20, fontWeight: 800,
          color: "#ECE6D9", margin: "0 0 8px",
          fontFamily: "var(--font-myanmar, system-ui)",
        }}>
          မြေကွက် ရောင်းချင်ပါသလား?
        </h2>
        <p style={{
          textAlign: "center", fontSize: 13, color: "#6B7280",
          margin: "0 0 24px", fontFamily: "var(--font-myanmar, system-ui)", lineHeight: 1.6,
        }}>
          အကောင့် ဖွင့်ပြီး မိမိ မြေကွက်ကို တိုက်ရိုက် တင်နိုင်ပါသည်
        </p>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          {[
            { n: "၁", title: "အကောင့် ဖွင့်မည်", desc: "Email / Google / Facebook ဖြင့် အခမဲ့ မှတ်ပုံတင်ပါ" },
            { n: "၂", title: "မြေကွက် အချက်အလက် ထည့်မည်", desc: "နေရာ၊ အကျယ်၊ ဂရန်အမျိုးအစား၊ ဈေးနှုန်း ဖြည့်ပါ" },
            { n: "၃", title: "ဝယ်သူနဲ့ ချိတ်ဆက်မည်", desc: "Platform မှတဆင့် ဝယ်ယူသူများ မြင်ရပြီး ဆက်သွယ်နိုင်သည်" },
          ].map(s => (
            <div key={s.n} style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              background: "#191C25", borderRadius: 12, padding: "12px 14px",
              border: "1px solid #1E2232",
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: "rgba(224,163,59,0.12)", color: "#E0A33B",
                fontWeight: 800, fontSize: 13, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-myanmar, system-ui)",
              }}>{s.n}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ECE6D9",
                  fontFamily: "var(--font-myanmar, system-ui)" }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2,
                  fontFamily: "var(--font-myanmar, system-ui)", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/auth/register" onClick={onClose} style={{
            display: "block", textAlign: "center", padding: "14px",
            borderRadius: 14, background: "linear-gradient(135deg,#E0A33B,#F4B942)",
            color: "#1A1206", fontSize: 15, fontWeight: 800,
            textDecoration: "none", fontFamily: "var(--font-myanmar, system-ui)",
            boxShadow: "0 4px 16px rgba(224,163,59,0.3)",
          }}>
            အကောင့် ဖွင့်ပြီး ရောင်းမည်
          </Link>
          <Link href="/auth/login" onClick={onClose} style={{
            display: "block", textAlign: "center", padding: "13px",
            borderRadius: 14, border: "1px solid #2C313C",
            background: "transparent", color: "#ECE6D9", fontSize: 14,
            textDecoration: "none", fontFamily: "var(--font-myanmar, system-ui)",
          }}>
            အကောင့် ရှိပြီးသား — ဝင်ရောက်မည်
          </Link>
        </div>
      </div>
    </>
  );
}

export default function ListingsShell({ children }) {
  const [mode, setMode] = useState("buy");
  const [showPromo, setShowPromo] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const profileHref = session ? "/user/profile" : "/auth/login";

  function goSell() {
    if (!session) {
      setShowPromo(true);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="app">
      {showPromo && <SellPromoSheet onClose={() => setShowPromo(false)} />}

      <header>
        <div className="brandrow">
          <Link className="brand" href="/" prefetch>
            <span className="seal" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M3 21V8l9-5 9 5v13" />
                <path d="M3 12h18M9 21V12h6v9" />
              </svg>
            </span>
            <div>
              <b className="mm">မန္တလေး မြေကွက်</b>
              <small>Land Survey · MDY</small>
            </div>
          </Link>
          <span className="loc mm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            မန္တလေး
          </span>
        </div>

        <div className="seg" role="tablist">
          <button className={`mm ${mode === "buy" ? "on" : ""}`} onClick={() => setMode("buy")}>
            ဝယ်မယ်
          </button>
          <button className="mm" onClick={goSell}>
            ရောင်းမယ်
          </button>
        </div>
      </header>

      <main>{children}</main>

      <nav>
        <a className={mode === "buy" ? "on" : ""} onClick={() => setMode("buy")} role="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
          </svg>
          <span className="mm">မြေကွက်</span>
        </a>
        <Link href="/phone" prefetch={false}>
          <Phone /><span className="mm">ဖုန်း</span>
        </Link>
        <a className="post" onClick={goSell} role="button" aria-label="ရောင်းမယ်">
          <span className="pc">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </a>
        <span style={{ display:"grid", placeItems:"center", gap:3, fontSize:10,
          color:"rgba(136,139,149,0.35)", padding:8, pointerEvents:"none", userSelect:"none" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width:22, height:22 }}>
            <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
          </svg>
          <span className="mm">စီမံ</span>
        </span>
        <Link href={profileHref} prefetch={false}>
          {session?.user?.image ? (
            <img src={session.user.image} alt="" style={{
              width: 22, height: 22, borderRadius: "50%",
              objectFit: "cover", border: "1.5px solid #E0A33B",
            }} />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          )}
          <span className="mm">{session ? "ကျွန်ုပ်" : "ဝင်မည်"}</span>
        </Link>
      </nav>
    </div>
  );
}
