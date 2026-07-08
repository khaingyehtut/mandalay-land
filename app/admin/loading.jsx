export default function AdminLoading() {
  return (
    <div className="app" style={{ padding: "20px 16px 100px", maxWidth: 480, margin: "0 auto" }}>
      <style>{`
        @keyframes sk-shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        .sk-b{background:#1E2232;position:relative;overflow:hidden}
        .sk-b::after{content:'';position:absolute;inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);
          animation:sk-shimmer 1.4s ease-in-out infinite}
      `}</style>

      <div className="sk-b" style={{ height:44, borderRadius:12, marginBottom:16 }}/>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ background:"#13151A", border:"1px solid #1E2232", borderRadius:20, padding:16, marginBottom:12 }}>
          <div className="sk-b" style={{ height:180, borderRadius:12, marginBottom:14 }}/>
          <div className="sk-b" style={{ height:16, width:"60%", borderRadius:4, marginBottom:8 }}/>
          <div className="sk-b" style={{ height:13, width:"40%", borderRadius:4, marginBottom:14 }}/>
          <div className="sk-b" style={{ height:44, borderRadius:12 }}/>
        </div>
      ))}
    </div>
  );
}
