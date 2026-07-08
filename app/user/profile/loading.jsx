export default function ProfileLoading() {
  return (
    <div className="app" style={{ padding: "24px 16px 100px", maxWidth: 400, margin: "0 auto" }}>
      <style>{`
        @keyframes sk-shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        .sk-b{background:#1E2232;position:relative;overflow:hidden}
        .sk-b::after{content:'';position:absolute;inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);
          animation:sk-shimmer 1.4s ease-in-out infinite}
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:28 }}>
        <div className="sk-b" style={{ width:80, height:80, borderRadius:"50%", marginBottom:14 }}/>
        <div className="sk-b" style={{ width:120, height:18, borderRadius:6, marginBottom:8 }}/>
        <div className="sk-b" style={{ width:80, height:13, borderRadius:4 }}/>
      </div>

      {[1, 2, 3, 4].map(i => (
        <div key={i} className="sk-b" style={{ height:60, borderRadius:16, marginBottom:10 }}/>
      ))}
    </div>
  );
}
