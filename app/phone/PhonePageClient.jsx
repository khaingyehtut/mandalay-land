"use client";
import { useState } from "react";

const inp = {
  width: "100%", background: "#191C25", border: "1px solid #2C313C",
  borderRadius: 10, padding: "10px 12px", color: "#ECE6D9", fontSize: 14,
  outline: "none", boxSizing: "border-box",
  fontFamily: "var(--font-myanmar, system-ui)",
};

function AgentSheet({ agent, onClose, onSaved }) {
  const [form, setForm]           = useState({ name:"", title:"", phone:"", photo:"", ...agent });
  const [busy, setBusy]           = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview]     = useState(agent?.photo || "");
  const isEdit = !!agent;

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function pickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method:"POST", body: fd });
    setUploading(false);
    if (!r.ok) { alert("ဓာတ်ပုံ တင်မရပါ"); return; }
    set("photo", (await r.json()).url);
  }

  async function save() {
    if (!form.name.trim()) { alert("နာမည် ဖြည့်ပါ"); return; }
    setBusy(true);
    const r = await fetch("/api/agents", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!r.ok) { alert("မသိမ်းနိုင်ပါ"); return; }
    onSaved(await r.json());
  }

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:"0 0 74px 0",
        background:"rgba(0,0,0,0.75)", zIndex:110, backdropFilter:"blur(4px)" }}/>
      <div style={{
        position:"fixed", bottom:74, left:0, right:0, zIndex:120,
        background:"#13151A", borderTop:"1px solid #2C313C",
        borderRadius:"22px 22px 0 0", maxHeight:"calc(90dvh - 74px)", overflowY:"auto",
        animation:"sheetUp .42s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        <style>{`@keyframes sheetUp{0%{transform:translateY(104%) scale(.96)} 65%{transform:translateY(-2%) scale(1.007)} 82%{transform:translateY(.8%) scale(.999)} 100%{transform:translateY(0) scale(1)}}`}</style>
        <div style={{ width:36, height:4, background:"#2C313C", borderRadius:2, margin:"12px auto 0" }}/>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px 0" }}>
          <span style={{ fontSize:15, fontWeight:800, color:"#ECE6D9", fontFamily:"var(--font-myanmar, system-ui)" }}>
            {isEdit ? "ကတ် ပြင်မည်" : "ကတ်အသစ် ထည့်မည်"}
          </span>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:"50%", border:"none",
            background:"#1E2232", color:"#888B95", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div style={{ padding:"16px 20px 32px", display:"flex", flexDirection:"column", gap:14 }}>
          <label style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
            <div style={{ width:56, height:56, borderRadius:"50%", flexShrink:0,
              background:"#191C25", border:"2px dashed #2C313C", overflow:"hidden",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              {uploading
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E0A33B" strokeWidth="2.5">
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" strokeLinecap="round"/>
                  </svg>
                : preview
                  ? <img src={preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8">
                      <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
                    </svg>
              }
            </div>
            <div style={{ flex:1, padding:"10px 14px", borderRadius:12,
              border:"1.5px dashed rgba(224,163,59,0.35)", background:"rgba(224,163,59,0.04)",
              display:"flex", alignItems:"center", gap:8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E0A33B" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <span style={{ fontSize:13, fontWeight:700, color:"#E0A33B", fontFamily:"var(--font-myanmar, system-ui)" }}>
                {uploading ? "တင်နေသည်..." : "ဓာတ်ပုံ ရွေးမည်"}
              </span>
            </div>
            <input type="file" accept="image/*" onChange={pickImage} style={{ display:"none" }}/>
          </label>

          {[
            { key:"name",  label:"နာမည် *",    placeholder:"ကိုမင်း" },
            { key:"title", label:"ရာထူး",       placeholder:"အိမ်ခြံမြေ အကျိုးဆောင်" },
            { key:"phone", label:"ဖုန်းနံပါတ်", placeholder:"09xxxxxxxx" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={{ display:"block", fontSize:12, color:"#6B7280", marginBottom:5,
                fontFamily:"var(--font-myanmar, system-ui)" }}>{label}</label>
              <input style={inp} value={form[key] || ""} placeholder={placeholder}
                onChange={e => set(key, e.target.value)}/>
            </div>
          ))}

          <button disabled={busy || uploading} onClick={save} style={{
            padding:"14px", borderRadius:14, border:"none", marginTop:4,
            background:(busy||uploading) ? "#2C313C" : "linear-gradient(135deg,#E0A33B,#F4B942)",
            color:(busy||uploading) ? "#6B7280" : "#1A1206",
            fontSize:15, fontWeight:800, cursor:(busy||uploading) ? "default" : "pointer",
            fontFamily:"var(--font-myanmar, system-ui)",
          }}>
            {uploading ? "ဓာတ်ပုံ တင်နေ..." : busy ? "သိမ်းနေ..." : isEdit ? "ပြင်မည်" : "ထည့်မည်"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function PhonePageClient({ isAdmin, initialAgents = [] }) {
  const [agents, setAgents]             = useState(initialAgents);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  return (
    <div className="app">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(224,163,59,0.4)} 60%{box-shadow:0 0 0 16px rgba(224,163,59,0)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>

      <div style={{
        position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(224,163,59,0.06) 0%,transparent 70%)",
        pointerEvents: "none",
      }}/>

      <main style={{
        padding: "20px 16px 100px", maxWidth: 400, margin: "0 auto",
        display: "flex", flexDirection: "column", alignItems: "center",
        minHeight: "calc(100dvh - 74px)",
      }}>

        <div style={{ textAlign: "center", marginBottom: 24, width: "100%" }}>
          <div style={{ fontSize: 11, color: "#374151", letterSpacing: "0.15em",
            textTransform: "uppercase", marginBottom: 6 }}>MANDALAY LAND</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#ECE6D9", margin: 0,
            fontFamily: "var(--font-myanmar, system-ui)" }}>ဆက်သွယ်ရန်</h1>
        </div>

        {/* Agent cards */}
        {agents.map((a, i) => {
          const init   = a.name.replace(/[^က-႟᪐-᪙a-zA-Z]/g, "").slice(0, 1) || "M";
          const atel   = a.phone ? "tel:" + a.phone.replace(/[^0-9+]/g, "") : null;
          const aviber = a.phone ? "viber://chat?number=%2B95" + a.phone.replace(/^0/, "").replace(/[^0-9]/g, "") : null;
          return (
            <div key={a.id} style={{
              width: "100%", marginTop: i === 0 ? 0 : 14,
              background: "linear-gradient(145deg,#13151A,#191C25)",
              border: "1px solid #1E2232", borderRadius: 28,
              padding: "28px 24px 20px", position: "relative", overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
              animation: `fadeUp ${0.4 + i * 0.08}s ease both`,
            }}>
              <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:1,
                background:"linear-gradient(90deg,transparent,rgba(224,163,59,0.5),transparent)" }}/>

              <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
                <div style={{ animation:"float 3s ease-in-out infinite", position:"relative" }}>
                  <div style={{
                    position:"absolute", inset:-6, borderRadius:"50%",
                    border:"1.5px solid rgba(224,163,59,0.5)",
                    animation:"pulse 2.5s ease-out infinite",
                  }}/>
                  <div style={{
                    width:90, height:90, borderRadius:"50%",
                    background:"linear-gradient(135deg,#E0A33B,#F4B94288)",
                    padding:3, boxShadow:"0 8px 28px rgba(224,163,59,0.28)",
                  }}>
                    <div style={{ width:"100%", height:"100%", borderRadius:"50%",
                      background:"#191C25", overflow:"hidden",
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {a.photo
                        ? <img src={a.photo} alt={a.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                        : <span style={{ fontSize:34, fontWeight:800, color:"#E0A33B",
                            fontFamily:"var(--font-myanmar, system-ui)" }}>{init}</span>
                      }
                    </div>
                  </div>
                  <div style={{
                    position:"absolute", bottom:5, right:5, width:14, height:14,
                    borderRadius:"50%", background:"#10b981",
                    border:"2.5px solid #191C25",
                    boxShadow:"0 0 8px rgba(16,185,129,0.7)",
                  }}/>
                </div>
              </div>

              <div style={{ textAlign:"center", fontSize:20, fontWeight:800, color:"#ECE6D9",
                marginBottom:4, fontFamily:"var(--font-myanmar, system-ui)" }}>{a.name}</div>
              <div style={{ textAlign:"center", fontSize:13, color:"#6B7280", marginBottom:20,
                fontFamily:"var(--font-myanmar, system-ui)" }}>{a.title || ""}</div>

              {atel && (
                <>
                  <div style={{ height:1, background:"linear-gradient(90deg,transparent,#2C313C,transparent)", marginBottom:18 }}/>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:18 }}>
                    <div style={{ width:30, height:30, borderRadius:9, flexShrink:0,
                      background:"rgba(224,163,59,0.1)", border:"1px solid rgba(224,163,59,0.25)",
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E0A33B" strokeWidth="2">
                        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>
                      </svg>
                    </div>
                    <span style={{ fontSize:18, fontWeight:800, color:"#ECE6D9",
                      letterSpacing:"0.05em", fontVariantNumeric:"tabular-nums" }}>{a.phone}</span>
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <a href={atel} style={{
                      flex:1, display:"flex", alignItems:"center", justifyContent:"center",
                      gap:7, padding:"13px 0", borderRadius:14, textDecoration:"none",
                      background:"linear-gradient(135deg,#E0A33B,#F4B942)",
                      color:"#1A1206", fontSize:14, fontWeight:800,
                      fontFamily:"var(--font-myanmar, system-ui)",
                      boxShadow:"0 6px 20px rgba(224,163,59,0.3)",
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>
                      </svg>
                      ဖုန်းခေါ်မည်
                    </a>
                    <a href={aviber} style={{
                      flex:1, display:"flex", alignItems:"center", justifyContent:"center",
                      gap:7, padding:"13px 0", borderRadius:14, textDecoration:"none",
                      background:"rgba(102,92,172,0.1)", border:"1px solid rgba(102,92,172,0.35)",
                      color:"#9B8FE0", fontSize:14, fontWeight:700,
                      fontFamily:"var(--font-myanmar, system-ui)",
                    }}>
                      <svg width="17" height="17" viewBox="0 0 512 512" fill="currentColor">
                        <path d="M444 49.9C431.3 38.2 379.9.9 265.3.4c0 0-135.1-8.1-200.9 52.3C27.8 89.3 14.9 143 13.5 209.5c-1.4 66.5-3.1 191.1 116.9 225.5h.1l-.1 51.6s-.8 20.9 13 25.1c16.6 5.2 26.4-10.7 42.3-27.8 8.7-9.4 20.7-23.2 29.8-33.7 82.2 6.9 145.3-8.9 152.5-11.2 16.6-5.4 110.5-17.4 125.7-142.1 15.8-128.6-7.6-209.8-49.7-246.8zm-92 296.8c-4.9 12.1-24.8 22.9-34.4 24.4-8.7 1.3-19.7 1.8-31.9-1.8-7.4-2.1-16.8-4.8-28.9-9.4-51-19.8-84.3-71.1-86.8-74.5-2.5-3.4-20.7-27.6-20.7-52.6s13.1-38 17.8-42.4 10.2-6.3 13.6-6.3c3.4 0 6.8.1 9.8.2 3.2.1 7.4-1.2 11.5 8.7 4.3 10.2 14.6 35.6 15.8 37.9 1.2 2.3 2 5 .4 8.1-1.5 3.1-2.3 5-4.7 7.7-2.3 2.7-5 6-7.1 8.1-2.4 2.4-4.9 4.9-2.1 9.7 2.7 4.7 12.4 20.4 26.7 33.1 18.4 16.4 33.9 21.4 38.7 23.9 4.8 2.5 7.7 2.2 10.7-1.2 3-3.3 12.8-14.6 16.2-19.6 3.4-5 6.8-4.2 11.5-2.5 4.7 1.6 29.6 13.7 34.4 16.3 4.7 2.6 8 3.8 9.2 6 1.4 2.1 1.4 12.1-2.6 23.2z"/>
                      </svg>
                      Viber
                    </a>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Viber Channel card */}
        {process.env.NEXT_PUBLIC_VIBER_CHANNEL && (
          <a href={process.env.NEXT_PUBLIC_VIBER_CHANNEL} target="_blank" rel="noopener noreferrer"
            style={{
              width: "100%", marginTop: 14, display: "flex", alignItems: "center", gap: 14,
              background: "linear-gradient(145deg,#13151A,#191C25)",
              border: "1px solid rgba(102,92,172,0.3)", borderRadius: 20,
              padding: "18px 20px", textDecoration: "none",
              boxShadow: "0 8px 28px rgba(0,0,0,0.3)",
              animation: "fadeUp 0.55s ease both",
            }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0,
              background: "rgba(102,92,172,0.12)", border: "1px solid rgba(102,92,172,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 512 512" fill="#9B8FE0">
                <path d="M444 49.9C431.3 38.2 379.9.9 265.3.4c0 0-135.1-8.1-200.9 52.3C27.8 89.3 14.9 143 13.5 209.5c-1.4 66.5-3.1 191.1 116.9 225.5h.1l-.1 51.6s-.8 20.9 13 25.1c16.6 5.2 26.4-10.7 42.3-27.8 8.7-9.4 20.7-23.2 29.8-33.7 82.2 6.9 145.3-8.9 152.5-11.2 16.6-5.4 110.5-17.4 125.7-142.1 15.8-128.6-7.6-209.8-49.7-246.8zm-92 296.8c-4.9 12.1-24.8 22.9-34.4 24.4-8.7 1.3-19.7 1.8-31.9-1.8-7.4-2.1-16.8-4.8-28.9-9.4-51-19.8-84.3-71.1-86.8-74.5-2.5-3.4-20.7-27.6-20.7-52.6s13.1-38 17.8-42.4 10.2-6.3 13.6-6.3c3.4 0 6.8.1 9.8.2 3.2.1 7.4-1.2 11.5 8.7 4.3 10.2 14.6 35.6 15.8 37.9 1.2 2.3 2 5 .4 8.1-1.5 3.1-2.3 5-4.7 7.7-2.3 2.7-5 6-7.1 8.1-2.4 2.4-4.9 4.9-2.1 9.7 2.7 4.7 12.4 20.4 26.7 33.1 18.4 16.4 33.9 21.4 38.7 23.9 4.8 2.5 7.7 2.2 10.7-1.2 3-3.3 12.8-14.6 16.2-19.6 3.4-5 6.8-4.2 11.5-2.5 4.7 1.6 29.6 13.7 34.4 16.3 4.7 2.6 8 3.8 9.2 6 1.4 2.1 1.4 12.1-2.6 23.2z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#9B8FE0", marginBottom: 2 }}>Viber Channel</div>
              <div style={{ fontSize: 12, color: "#6B7280", fontFamily: "var(--font-myanmar, system-ui)" }}>
                မြေကွက် သတင်းများ လိုက်ကြည့်ရန် Join လုပ်ပါ
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </a>
        )}

        {/* Agent management — admin only */}
        {isAdmin && (
          <div style={{ marginTop: 24, width: "100%" }}>
            <div style={{ fontSize: 12, color: "#6B7280", letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 12, paddingLeft: 2 }}>
              အဖွဲ့ဝင် ကတ်များ
            </div>

            {agents.map(a => {
              const init = a.name.replace(/[^က-႟᪐-᪙a-zA-Z]/g, "").slice(0, 1) || "M";
              return (
                <div key={a.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "#13151A", border: "1px solid #1E2232",
                  borderRadius: 16, padding: "12px 14px", marginBottom: 10,
                }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", flexShrink:0,
                    background:"linear-gradient(135deg,#E0A33B,#F4B94288)", padding:2 }}>
                    <div style={{ width:"100%", height:"100%", borderRadius:"50%",
                      background:"#191C25", overflow:"hidden",
                      display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {a.photo
                        ? <img src={a.photo} alt={a.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                        : <span style={{ fontSize:18, fontWeight:800, color:"#E0A33B",
                            fontFamily:"var(--font-myanmar, system-ui)" }}>{init}</span>
                      }
                    </div>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#ECE6D9",
                      fontFamily:"var(--font-myanmar, system-ui)", whiteSpace:"nowrap",
                      overflow:"hidden", textOverflow:"ellipsis" }}>{a.name}</div>
                    {a.phone && <div style={{ fontSize:12, color:"#6B7280", marginTop:1 }}>{a.phone}</div>}
                  </div>
                  <button onClick={() => setEditingAgent(a)} style={{
                    width:30, height:30, borderRadius:8, border:"1px solid #2C313C",
                    background:"#191C25", color:"#E0A33B", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button onClick={async () => {
                    if (!confirm(`"${a.name}" ကို ဖျက်မှာ သေချာပါသလား?`)) return;
                    await fetch("/api/agents", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: a.id }) });
                    setAgents(prev => prev.filter(x => x.id !== a.id));
                  }} style={{
                    width:30, height:30, borderRadius:8,
                    border:"1px solid rgba(248,113,113,0.3)",
                    background:"rgba(239,68,68,0.08)", color:"#f87171",
                    cursor:"pointer", display:"flex", alignItems:"center",
                    justifyContent:"center", flexShrink:0,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                    </svg>
                  </button>
                </div>
              );
            })}

            <button onClick={() => setShowAddAgent(true)} style={{
              width:"100%", padding:"13px", borderRadius:14,
              border:"1.5px dashed rgba(224,163,59,0.4)",
              background:"rgba(224,163,59,0.04)", color:"#E0A33B",
              fontSize:14, fontWeight:700, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              fontFamily:"var(--font-myanmar, system-ui)",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              ကတ်အသစ် ထည့်မည်
            </button>
          </div>
        )}

      </main>


      {(showAddAgent || editingAgent) && (
        <AgentSheet
          agent={editingAgent}
          onClose={() => { setShowAddAgent(false); setEditingAgent(null); }}
          onSaved={(saved) => {
            if (editingAgent) {
              setAgents(prev => prev.map(a => a.id === saved.id ? saved : a));
            } else {
              setAgents(prev => [...prev, saved]);
            }
            setShowAddAgent(false);
            setEditingAgent(null);
          }}
        />
      )}
    </div>
  );
}
