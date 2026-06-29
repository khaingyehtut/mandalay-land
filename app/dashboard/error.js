"use client";
import Link from "next/link";

export default function DashboardError({ error, reset }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#0C0D11",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 24, textAlign: "center",
    }}>
      <p style={{ color: "#888B95", fontSize: 14, marginBottom: 8,
        fontFamily: "var(--font-myanmar, system-ui)" }}>
        Dashboard ဖွင့်၍ မရပါ
      </p>
      <p style={{ color: "#555A66", fontSize: 12, marginBottom: 20 }}>
        {error?.message}
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={reset} style={{
          padding: "10px 20px", borderRadius: 10,
          border: "1px solid #2C313C", background: "transparent",
          color: "#ECE6D9", fontSize: 13, cursor: "pointer",
          fontFamily: "var(--font-myanmar, system-ui)",
        }}>ထပ်မံ ကြိုးစားမည်</button>
        <Link href="/" style={{
          padding: "10px 20px", borderRadius: 10,
          border: "1px solid #E0A33B", background: "rgba(224,163,59,0.08)",
          color: "#E0A33B", fontSize: 13, textDecoration: "none",
          fontFamily: "var(--font-myanmar, system-ui)",
        }}>ပင်မ သို့</Link>
      </div>
    </div>
  );
}
