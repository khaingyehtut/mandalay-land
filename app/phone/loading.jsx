export default function PhoneLoading() {
  return (
    <div className="app" style={{ padding: "20px 16px 100px", maxWidth: 400, margin: "0 auto" }}>
      <style>{`
        @keyframes sk-shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        .sk-b{background:#1E2232;border-radius:28px;position:relative;overflow:hidden;margin-bottom:14px}
        .sk-b::after{content:'';position:absolute;inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);
          animation:sk-shimmer 1.4s ease-in-out infinite}
      `}</style>

      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ height:11, width:100, background:"#1E2232", borderRadius:4, margin:"0 auto 8px" }}/>
        <div style={{ height:22, width:80, background:"#1E2232", borderRadius:6, margin:"0 auto" }}/>
      </div>

      {[1, 2].map(i => (
        <div key={i} className="sk-b" style={{ height:280 }}/>
      ))}
      <div className="sk-b" style={{ height:70, borderRadius:16 }}/>
    </div>
  );
}
