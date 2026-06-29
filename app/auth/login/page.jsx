"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" style={{ flexShrink: 0 }}>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

function Spinner({ dark }) {
  return (
    <span style={{
      width: 16, height: 16, display: "inline-block", borderRadius: "50%",
      border: `2px solid ${dark ? "rgba(26,18,6,0.3)" : "rgba(255,255,255,0.2)"}`,
      borderTopColor: dark ? "#1A1206" : "#ECE6D9",
      animation: "spin 0.7s linear infinite",
      verticalAlign: "middle",
    }} />
  );
}

function LoginForm() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/user/profile";
  const registered = searchParams.get("registered");

  async function handleOAuth(provider) {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    setSubmitting(false);
    if (res?.error) {
      setError("Email သို့မဟုတ် Password မှားနေသည်");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes blurUp  { from{opacity:0;transform:translateY(24px);filter:blur(8px)} to{opacity:1;transform:none;filter:none} }
        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes popIn   { 0%{opacity:0;transform:scale(.7) rotate(-8deg)} 60%{transform:scale(1.08) rotate(3deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
        .auth-input { transition: border-color .15s, box-shadow .15s !important; }
        .auth-input:focus { border-color: #E0A33B !important; box-shadow: 0 0 0 3px rgba(224,163,59,0.12) !important; }
        .oauth-btn { transition: background .16s, border-color .16s, transform .2s cubic-bezier(0.34,1.56,0.64,1) !important; }
        .oauth-btn:hover { background: #1E2232 !important; border-color: #3A4150 !important; transform: translateY(-2px) !important; }
        .oauth-btn:active { transform: scale(.93) !important; }
        .submit-btn { transition: transform .2s cubic-bezier(0.34,1.56,0.64,1), box-shadow .2s, opacity .15s !important; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px) scale(1.015) !important; box-shadow: 0 10px 32px rgba(224,163,59,0.42) !important; }
        .submit-btn:active:not(:disabled) { transform: scale(.97) !important; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#0C0D11",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}>
        <div style={{ width: "100%", maxWidth: 360, animation: "blurUp .45s cubic-bezier(0.16,1,0.3,1) both" }}>

          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                border: "2px solid #E0A33B",
                background: "rgba(224,163,59,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 0 0 6px rgba(224,163,59,0.05)",
                animation: "popIn .55s .06s cubic-bezier(0.34,1.56,0.64,1) both",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E0A33B" strokeWidth="1.8">
                  <path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/>
                </svg>
              </div>
            </Link>
            <h1 style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#ECE6D9",
              margin: "0 0 6px",
              fontFamily: "var(--font-myanmar, system-ui)",
              letterSpacing: "-0.5px",
              animation: "slideUp .4s .12s cubic-bezier(0.16,1,0.3,1) both",
            }}>
              ဝင်ရောက်မည်
            </h1>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0, fontFamily: "var(--font-myanmar, system-ui)",
              animation: "slideUp .4s .18s cubic-bezier(0.16,1,0.3,1) both" }}>
              မန်းလေး မြေကွက် Platform
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: "#13151A",
            border: "1px solid #1E2232",
            borderRadius: 20,
            padding: "24px 20px",
            boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02)",
            animation: "slideUp .5s .08s cubic-bezier(0.34,1.56,0.64,1) both",
          }}>

            {registered && (
              <div style={{
                background: "rgba(6,78,59,0.35)",
                border: "1px solid rgba(52,211,153,0.25)",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#6EE7B7",
                fontSize: 13,
                marginBottom: 16,
                fontFamily: "var(--font-myanmar, system-ui)",
              }}>
                ✓ အကောင့် ဖွင့်ပြီးပါပြီ — ယခု ဝင်ရောက်နိုင်ပါပြီ
              </div>
            )}

            {/* Email form */}
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  background: "rgba(127,29,29,0.3)", border: "1px solid rgba(248,113,113,0.25)",
                  borderRadius: 10, padding: "10px 14px", color: "#FCA5A5",
                  fontSize: 13, marginBottom: 14, fontFamily: "var(--font-myanmar, system-ui)",
                }}>{error}</div>
              )}

              <div style={{ marginBottom: 14, animation: "slideUp .4s .22s cubic-bezier(0.16,1,0.3,1) both" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6B7280",
                  letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 7 }}>
                  Email
                </label>
                <input className="auth-input" name="email" type="email" required
                  placeholder="you@example.com" autoComplete="email"
                  style={{ width: "100%", background: "#0F111A", border: "1px solid #262B38",
                    borderRadius: 10, padding: "12px 14px", color: "#ECE6D9", fontSize: 14,
                    outline: "none", boxSizing: "border-box", fontFamily: "var(--font-grotesk, system-ui)",
                    transition: "border-color 0.15s, box-shadow 0.15s" }}/>
              </div>

              <div style={{ marginBottom: 18, animation: "slideUp .4s .28s cubic-bezier(0.16,1,0.3,1) both" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280",
                    letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Password
                  </label>
                  <Link href="/auth/forgot-password" style={{
                    fontSize: 12, color: "#E0A33B", textDecoration: "none",
                    fontFamily: "var(--font-myanmar, system-ui)",
                  }}>
                    Password မေ့နေသလား?
                  </Link>
                </div>
                <input className="auth-input" name="password" type="password" required
                  placeholder="••••••••" autoComplete="current-password"
                  style={{ width: "100%", background: "#0F111A", border: "1px solid #262B38",
                    borderRadius: 10, padding: "12px 14px", color: "#ECE6D9", fontSize: 14,
                    outline: "none", boxSizing: "border-box", fontFamily: "var(--font-grotesk, system-ui)",
                    transition: "border-color 0.15s, box-shadow 0.15s", letterSpacing: "0.1em" }}/>
              </div>

              {/* Main submit */}
              <div style={{ animation: "slideUp .4s .34s cubic-bezier(0.16,1,0.3,1) both" }}>
              <button type="submit" className="submit-btn" disabled={submitting} style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#E0A33B 0%,#F4B942 100%)",
                color: "#1A1206", fontSize: 15, fontWeight: 800,
                cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.75 : 1,
                fontFamily: "var(--font-myanmar, system-ui)", boxShadow: "0 4px 16px rgba(224,163,59,0.3)",
                transition: "all 0.15s", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
              }}>
                {submitting ? <><Spinner dark /> ဝင်ရောက်နေသည်...</> : "ဝင်ရောက်မည်"}
              </button>
              </div>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0",
              animation: "slideUp .4s .4s cubic-bezier(0.16,1,0.3,1) both" }}>
              <div style={{ flex: 1, height: 1, background: "#1E2232" }} />
              <span style={{ fontSize: 12, color: "#4B5563", fontFamily: "var(--font-myanmar, system-ui)", whiteSpace: "nowrap" }}>
                သို့မဟုတ်
              </span>
              <div style={{ flex: 1, height: 1, background: "#1E2232" }} />
            </div>

            {/* Social row */}
            <div style={{ display: "flex", gap: 10, animation: "slideUp .4s .46s cubic-bezier(0.16,1,0.3,1) both" }}>
              <button className="oauth-btn" disabled={!!oauthLoading} onClick={() => handleOAuth("google")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, padding: "12px 10px", borderRadius: 12,
                  border: "1px solid #2C313C", background: "#191C25", color: "#ECE6D9",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--font-myanmar, system-ui)", transition: "all 0.15s",
                }}>
                {oauthLoading === "google" ? <Spinner /> : <GoogleIcon />}
                Google
              </button>
              <button className="oauth-btn" disabled={!!oauthLoading} onClick={() => handleOAuth("facebook")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 8, padding: "12px 10px", borderRadius: 12,
                  border: "1px solid #2C313C", background: "#191C25", color: "#ECE6D9",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--font-myanmar, system-ui)", transition: "all 0.15s",
                }}>
                {oauthLoading === "facebook" ? <Spinner /> : <FacebookIcon />}
                Facebook
              </button>
            </div>
          </div>

          {/* Footer */}
          <p style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 14,
            color: "#6B7280",
            fontFamily: "var(--font-myanmar, system-ui)",
            animation: "slideUp .4s .52s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            အကောင့် မရှိသေးဘူးလား?{" "}
            <Link href="/auth/register" style={{ color: "#E0A33B", textDecoration: "none", fontWeight: 700 }}>
              အကောင့် ဖွင့်မည်
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0C0D11" }} />}>
      <LoginForm />
    </Suspense>
  );
}
