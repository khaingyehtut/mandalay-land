"use client";

export default function Error({ error, reset }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      padding: "24px",
      textAlign: "center",
    }}>
      <p style={{ color: "#888B95", fontSize: 14, marginBottom: 16 }}>
        အချက်အလက် ရယူ၍ မရပါ
      </p>
      <button
        onClick={reset}
        style={{
          padding: "10px 24px",
          borderRadius: 12,
          border: "1px solid #2C313C",
          background: "transparent",
          color: "#ECE6D9",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        ထပ်မံ ကြိုးစားမည်
      </button>
    </div>
  );
}
