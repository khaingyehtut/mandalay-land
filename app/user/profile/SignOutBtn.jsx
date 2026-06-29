"use client";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function SignOutBtn() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        setLoading(true);
        await signOut({ callbackUrl: "/" });
      }}
      disabled={loading}
      style={{
        width: "100%", padding: "14px", borderRadius: 16,
        border: "1px solid rgba(248,113,113,0.2)",
        background: "rgba(239,68,68,0.05)",
        color: loading ? "#555A66" : "#f87171",
        fontSize: 14, fontWeight: 700, cursor: loading ? "default" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        transition: "all 0.2s", fontFamily: "var(--font-myanmar, system-ui)",
      }}
    >
      {loading ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ animation: "spin 0.8s linear infinite" }}>
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
        </svg>
      )}
      {loading ? "ထွက်နေသည်..." : "ထွက်မည်"}
    </button>
  );
}
