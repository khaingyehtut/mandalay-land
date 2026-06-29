"use client";

import { useState } from "react";

function LockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );
}

export default function ChangePasswordBtn() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function reset() {
    setCurrent(""); setNext(""); setConfirm("");
    setError(""); setSuccess(false); setLoading(false);
  }

  function close() { reset(); setOpen(false); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (next !== confirm) { setError("Password အသစ်များ မတူပါ"); return; }
    if (next.length < 6) { setError("Password အနည်းဆုံး ၆ လုံး"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(true);
      setTimeout(close, 1800);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", background: "#0F111A", border: "1px solid #262B38",
    borderRadius: 10, padding: "11px 14px", color: "#ECE6D9", fontSize: 14,
    boxSizing: "border-box", fontFamily: "var(--font-grotesk, system-ui)",
    outline: "none", letterSpacing: "0.1em",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <>
      <style>{`
        .cpw-input:focus { border-color: #E0A33B !important; box-shadow: 0 0 0 3px rgba(224,163,59,0.12) !important; }
      `}</style>

      {/* Button row */}
      <div
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "15px 18px", borderRadius: 16, cursor: "pointer",
          background: "#13151A", border: "1px solid #1E2232", marginBottom: 10,
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 11, flexShrink: 0,
          background: "#191C25", border: "1px solid #2C313C",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280",
        }}>
          <LockIcon />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#ECE6D9", fontFamily: "var(--font-myanmar, system-ui)" }}>
            Password ပြောင်းမည်
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 1, fontFamily: "var(--font-myanmar, system-ui)" }}>
            လျှို့ဝှက်နံပါတ် ပြောင်းမည်
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>

      {/* Bottom sheet */}
      {open && (
        <>
          <div
            onClick={close}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
              zIndex: 110, backdropFilter: "blur(4px)",
            }}
          />
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 120,
            background: "#13151A", borderTop: "1px solid #2C313C",
            borderRadius: "24px 24px 0 0",
            padding: "0 20px 44px",
            maxWidth: 520, margin: "0 auto",
            animation: "sheetUp .42s cubic-bezier(0.34,1.56,0.64,1) both",
          }}>
            <style>{`@keyframes sheetUp{0%{transform:translateY(104%) scale(.96)} 65%{transform:translateY(-2%) scale(1.007)} 82%{transform:translateY(.8%) scale(.999)} 100%{transform:translateY(0) scale(1)}}`}</style>

            {/* Handle */}
            <div style={{ width: 40, height: 4, background: "#2C313C", borderRadius: 2, margin: "12px auto 20px" }} />

            {/* Close */}
            <button onClick={close} style={{
              position: "absolute", top: 16, right: 20,
              background: "#1E2232", border: "none", borderRadius: "50%",
              width: 32, height: 32, cursor: "pointer", color: "#888B95",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#ECE6D9", margin: "0 0 20px", fontFamily: "var(--font-myanmar, system-ui)" }}>
              Password ပြောင်းမည်
            </h2>

            {success ? (
              <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%", margin: "0 auto 14px",
                  background: "rgba(16,185,129,0.1)", border: "1.5px solid rgba(16,185,129,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#ECE6D9", margin: 0, fontFamily: "var(--font-myanmar, system-ui)" }}>
                  Password ပြောင်းပြီးပါပြီ
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{
                    background: "rgba(127,29,29,0.3)", border: "1px solid rgba(248,113,113,0.25)",
                    borderRadius: 10, padding: "10px 14px", color: "#FCA5A5",
                    fontSize: 13, marginBottom: 14, fontFamily: "var(--font-myanmar, system-ui)",
                  }}>{error}</div>
                )}

                {[
                  { label: "လက်ရှိ Password", value: current, setter: setCurrent, complete: "current-password" },
                  { label: "Password သစ်", value: next, setter: setNext, complete: "new-password" },
                  { label: "Password သစ် အတည်ပြုမည်", value: confirm, setter: setConfirm, complete: "new-password" },
                ].map(({ label, value, setter, complete }) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7, fontFamily: "var(--font-myanmar, system-ui)" }}>
                      {label}
                    </label>
                    <input
                      className="cpw-input"
                      type="password" required
                      value={value} onChange={e => setter(e.target.value)}
                      placeholder="••••••••" autoComplete={complete}
                      style={inputStyle}
                    />
                  </div>
                ))}

                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg,#E0A33B,#F4B942)",
                  color: "#1A1206", fontSize: 15, fontWeight: 800,
                  cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1,
                  fontFamily: "var(--font-myanmar, system-ui)",
                  boxShadow: "0 4px 16px rgba(224,163,59,0.3)",
                  marginTop: 4,
                }}>
                  {loading ? "သိမ်းဆည်းနေသည်..." : "Password ပြောင်းမည်"}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </>
  );
}
