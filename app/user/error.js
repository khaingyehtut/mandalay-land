"use client";

import Link from "next/link";

export default function UserError({ reset }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0C0D11",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      padding: 24,
      textAlign: "center",
    }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E0A33B" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
      </svg>
      <p style={{ color: "#888B95", fontSize: 14, margin: 0, fontFamily: "var(--font-myanmar)" }}>
        အမှားတစ်ခု ဖြစ်ပွားသည်
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={reset}
          style={{
            padding: "10px 20px", borderRadius: 10, border: "none",
            background: "#E0A33B", color: "#1A1206", fontWeight: 700,
            fontSize: 13, cursor: "pointer", fontFamily: "var(--font-myanmar)",
          }}
        >
          ထပ်မံ ကြိုးစားမည်
        </button>
        <Link href="/" style={{
          padding: "10px 20px", borderRadius: 10,
          border: "1px solid #2C313C", color: "#ECE6D9",
          fontSize: 13, textDecoration: "none", display: "flex",
          alignItems: "center", fontFamily: "var(--font-myanmar)",
        }}>
          ← မူလစာမျက်နှာ
        </Link>
      </div>
    </div>
  );
}
