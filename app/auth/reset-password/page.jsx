"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Password များ မတူပါ"); return; }
    if (password.length < 6) { setError("Password အနည်းဆုံး ၆ လုံး"); return; }
    if (!token) { setError("Reset token မရှိပါ"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 2500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0C0D11",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "32px 16px",
    }}>
      <style>{`
        @keyframes blurUp  { from{opacity:0;transform:translateY(24px);filter:blur(8px)} to{opacity:1;transform:none;filter:none} }
        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes popIn   { 0%{opacity:0;transform:scale(.7) rotate(-8deg)} 60%{transform:scale(1.08) rotate(3deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes checkPop{ 0%{opacity:0;transform:scale(.5)} 70%{transform:scale(1.15)} 100%{opacity:1;transform:scale(1)} }
        .auth-input:focus { border-color: #E0A33B !important; box-shadow: 0 0 0 3px rgba(224,163,59,0.12) !important; outline: none; }
        .rp-btn { transition: transform .2s cubic-bezier(0.34,1.56,0.64,1), box-shadow .2s !important; }
        .rp-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.015) !important; box-shadow: 0 10px 32px rgba(224,163,59,0.42) !important; }
        .rp-btn:active:not(:disabled) { transform: scale(.97) !important; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 360, animation: "blurUp .45s cubic-bezier(0.16,1,0.3,1) both" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18,
              border: "2px solid #E0A33B", background: "rgba(224,163,59,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", boxShadow: "0 0 0 6px rgba(224,163,59,0.05)",
              animation: "popIn .55s .06s cubic-bezier(0.34,1.56,0.64,1) both",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E0A33B" strokeWidth="1.8">
                <path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/>
              </svg>
            </div>
          </Link>
          <h1 style={{
            fontSize: 26, fontWeight: 800, color: "#ECE6D9",
            margin: "0 0 6px", fontFamily: "var(--font-myanmar, system-ui)",
            animation: "slideUp .4s .12s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            Password သစ် သတ်မှတ်မည်
          </h1>
          <p style={{ fontSize: 13, color: "#6B7280", margin: 0, fontFamily: "var(--font-myanmar, system-ui)",
            animation: "slideUp .4s .18s cubic-bezier(0.16,1,0.3,1) both" }}>
            မန်းလေး မြေကွက် Platform
          </p>
        </div>

        <div style={{
          background: "#13151A", border: "1px solid #1E2232",
          borderRadius: 20, padding: "24px 20px",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
          animation: "slideUp .5s .08s cubic-bezier(0.34,1.56,0.64,1) both",
        }}>

          {done ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
                background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "checkPop .5s cubic-bezier(0.34,1.56,0.64,1) both",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#ECE6D9", margin: "0 0 8px", fontFamily: "var(--font-myanmar, system-ui)" }}>
                Password ပြောင်းပြီးပါပြီ
              </h2>
              <p style={{ fontSize: 13, color: "#6B7280", fontFamily: "var(--font-myanmar, system-ui)" }}>
                Login စာမျက်နှာသို့ ပြောင်းနေသည်...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {!token && (
                <div style={{
                  background: "rgba(127,29,29,0.3)", border: "1px solid rgba(248,113,113,0.25)",
                  borderRadius: 10, padding: "10px 14px", color: "#FCA5A5",
                  fontSize: 13, marginBottom: 14, fontFamily: "var(--font-myanmar, system-ui)",
                }}>
                  Reset link မမှန်ပါ။ Email မှ link ကို ထပ်နှိပ်ပါ။
                </div>
              )}

              {error && (
                <div style={{
                  background: "rgba(127,29,29,0.3)", border: "1px solid rgba(248,113,113,0.25)",
                  borderRadius: 10, padding: "10px 14px", color: "#FCA5A5",
                  fontSize: 13, marginBottom: 14, fontFamily: "var(--font-myanmar, system-ui)",
                }}>{error}</div>
              )}

              <div style={{ marginBottom: 14, animation: "slideUp .4s .24s cubic-bezier(0.16,1,0.3,1) both" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7 }}>
                  Password သစ်
                </label>
                <input
                  className="auth-input" type="password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="new-password"
                  style={{
                    width: "100%", background: "#0F111A", border: "1px solid #262B38",
                    borderRadius: 10, padding: "12px 14px", color: "#ECE6D9", fontSize: 14,
                    boxSizing: "border-box", fontFamily: "var(--font-grotesk, system-ui)",
                    transition: "border-color 0.15s, box-shadow 0.15s", letterSpacing: "0.1em",
                  }}
                />
              </div>

              <div style={{ marginBottom: 20, animation: "slideUp .4s .3s cubic-bezier(0.16,1,0.3,1) both" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7 }}>
                  Password အတည်ပြုမည်
                </label>
                <input
                  className="auth-input" type="password" required
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••" autoComplete="new-password"
                  style={{
                    width: "100%", background: "#0F111A", border: "1px solid #262B38",
                    borderRadius: 10, padding: "12px 14px", color: "#ECE6D9", fontSize: 14,
                    boxSizing: "border-box", fontFamily: "var(--font-grotesk, system-ui)",
                    transition: "border-color 0.15s, box-shadow 0.15s", letterSpacing: "0.1em",
                  }}
                />
              </div>

              <div style={{ animation: "slideUp .4s .36s cubic-bezier(0.16,1,0.3,1) both" }}>
              <button
                type="submit" disabled={loading || !token} className="rp-btn"
                style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg,#E0A33B,#F4B942)",
                  color: "#1A1206", fontSize: 15, fontWeight: 800,
                  cursor: (loading || !token) ? "not-allowed" : "pointer",
                  opacity: (loading || !token) ? 0.75 : 1,
                  fontFamily: "var(--font-myanmar, system-ui)",
                  boxShadow: "0 4px 16px rgba(224,163,59,0.3)",
                }}
              >
                {loading ? "သိမ်းဆည်းနေသည်..." : "Password ပြောင်းမည်"}
              </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0C0D11" }} />}>
      <ResetForm />
    </Suspense>
  );
}
