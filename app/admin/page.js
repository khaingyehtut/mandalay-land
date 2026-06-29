"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { mmNum } from "@/lib/format";
import { isBypassingPhone } from "@/lib/phoneDetect";

const TOWNSHIPS = [
  "ချမ်းမြသာစည်","ပြည်ကြီးတံခွန်","အောင်မြေသာစံ","မဟာအောင်မြေ","ချမ်းအေးသာစံ",
  "အမရပူရ","ပုသိမ်ကြီး","မတ္တရာ","ဥပ္ပါတ်","ကြံခင်းကုန်း","ကျောက်ဆည်","မြင်းမူ",
];
const GRANTS  = ["ဂရန်မြေ","ပါမစ်မြေ","ဘိုးဘွားပိုင်","မြေပုံကျ","လယ်ယာမြေ"];
const FACINGS = ["အရှေ့","အနောက်","တောင်","မြောက်"];
const EMPTY = {
  township:"",street:"",width:"",height:"",grant:"ဂရန်မြေ",
  priceLakh:"",facing:"အရှေ့",road:"",tag:"",status:"available",note:"",images:[],
};

const PHONE_FIELDS = ["street", "road", "tag", "note"];

const STATUS_LABEL = { available:"ရောင်းရန်ရှိ", sold:"ရောင်းပြီး", pending:"ဆိုင်းငံ့" };
const STATUS_COLOR = {
  available:{ bg:"rgba(16,185,129,0.12)", color:"#34d399", border:"rgba(52,211,153,0.2)" },
  sold:     { bg:"rgba(239,68,68,0.12)",  color:"#f87171", border:"rgba(248,113,113,0.2)" },
  pending:  { bg:"rgba(245,158,11,0.12)", color:"#fbbf24", border:"rgba(251,191,36,0.2)" },
};

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display:"block", fontSize:12, color: error ? "#f87171" : "#888B95",
        marginBottom:5, fontFamily:"var(--font-myanmar, system-ui)" }}>{label}</label>
      {children}
      {error && (
        <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          <span style={{ fontSize:11, color:"#f87171",
            fontFamily:"var(--font-myanmar, system-ui)" }}>
            ဖုန်းနံပါတ် ထည့်၍ မရပါ
          </span>
        </div>
      )}
    </div>
  );
}

const inp = {
  width:"100%", background:"#191C25", border:"1px solid #2C313C", borderRadius:10,
  padding:"10px 12px", color:"#ECE6D9", fontSize:14, outline:"none",
  fontFamily:"var(--font-myanmar, system-ui)", boxSizing:"border-box",
};

export default function Admin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [list, setList]         = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [editId, setEditId]     = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy]         = useState(false);
  const [uploading, setUploading] = useState(false);
  const [phoneErrors, setPhoneErrors] = useState({});
  const fileRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status]);

  async function load() {
    const r = await fetch("/api/plots/mine");
    if (r.ok) setList(await r.json());
  }

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    if (PHONE_FIELDS.includes(k)) {
      setPhoneErrors(e => ({ ...e, [k]: isBypassingPhone(v) }));
    }
  }

  function openAdd() {
    setEditId(null);
    setForm(EMPTY);
    setPhoneErrors({});
    setShowForm(true);
  }

  function openEdit(p) {
    setEditId(p.id);
    setForm({
      ...EMPTY, ...p,
      street: p.street||"", facing: p.facing||"အရှေ့",
      road: p.road||"", tag: p.tag||"", note: p.note||"",
      images: p.images||[],
    });
    setPhoneErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY);
    setPhoneErrors({});
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (form.images.length >= 6) { alert("ဓာတ်ပုံ ၆ ပုံသာ တင်နိုင်သည်"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method:"POST", body:fd });
    setUploading(false);
    if (!r.ok) { alert("ဓာတ်ပုံ တင်မရပါ"); return; }
    const { url } = await r.json();
    setForm(f => ({ ...f, images:[...f.images, url] }));
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(idx) {
    setForm(f => ({ ...f, images: f.images.filter((_,i) => i !== idx) }));
  }

  async function save() {
    if (!form.township || !form.width || !form.height || form.priceLakh === "") {
      alert("မြို့နယ်၊ အကျယ်၊ အလျား၊ ဈေး ဖြည့်ပါ"); return;
    }
    const hasPhoneError = PHONE_FIELDS.some(k => isBypassingPhone(form[k]));
    if (hasPhoneError) {
      setPhoneErrors(Object.fromEntries(PHONE_FIELDS.map(k => [k, isBypassingPhone(form[k])])));
      alert("ဖုန်းနံပါတ် ပါဝင်သော ကွက်လပ်ရှိသည် — ဖျက်ပြီးမှ သိမ်းပါ");
      return;
    }
    setBusy(true);
    const url = editId ? `/api/plots/${editId}` : "/api/plots";
    const r = await fetch(url, {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (r.status === 401) { router.replace("/auth/login"); return; }
    if (!r.ok) { alert("သိမ်းဆည်းမှု မအောင်မြင်ပါ"); return; }
    closeForm();
    load();
  }

  async function del(id, township) {
    if (!confirm(`"${township}" မြေကွက်ကို ဖျက်မှာ သေချာပါသလား?`)) return;
    const r = await fetch(`/api/plots/${id}`, { method:"DELETE" });
    if (r.status === 401) { router.replace("/auth/login"); return; }
    load();
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="app">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
          height:"100dvh" }}>
          <span style={{ width:32, height:32, border:"3px solid #2C313C",
            borderTopColor:"#E0A33B", borderRadius:"50%", display:"inline-block",
            animation:"spin 0.8s linear infinite" }}/>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const sc = STATUS_COLOR;

  return (
    <div className="app">
      <style>{`
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes sheetUp  { 0%{transform:translateY(104%) scale(.96)} 65%{transform:translateY(-2%) scale(1.007)} 82%{transform:translateY(.8%) scale(.999)} 100%{transform:translateY(0) scale(1)} }
        @keyframes cardIn   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .plot-card { transition:transform .18s cubic-bezier(0.34,1.56,0.64,1),box-shadow .18s; }
        .plot-card:active { transform:scale(.98)!important; opacity:.9; }
        .plot-card:hover  { box-shadow:0 4px 20px rgba(0,0,0,.35); }
      `}</style>

      {/* Header */}
      <header>
        <div className="brandrow">
          <a className="brand" href="/">
            <span className="seal" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M3 21V8l9-5 9 5v13"/><path d="M3 12h18M9 21V12h6v9"/>
              </svg>
            </span>
            <div>
              <b className="mm">စီမံခန့်ခွဲမှု</b>
              <small>{mmNum(list.length)} ကွက် တင်ထားသည်</small>
            </div>
          </a>
          <button
            onClick={openAdd}
            style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"8px 14px", borderRadius:10,
              background:"linear-gradient(135deg,#E0A33B,#F4B942)",
              border:"none", color:"#1A1206", fontSize:13, fontWeight:800,
              cursor:"pointer", fontFamily:"var(--font-myanmar, system-ui)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            တင်မည်
          </button>
        </div>
      </header>

      <main style={{ padding:"16px 16px 100px" }}>

        {/* Viber Channel join banner */}
        {process.env.NEXT_PUBLIC_VIBER_CHANNEL && (
          <a
            href={process.env.NEXT_PUBLIC_VIBER_CHANNEL}
            target="_blank" rel="noopener noreferrer"
            style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"13px 16px", borderRadius:14, textDecoration:"none", marginBottom:16,
              background:"rgba(102,92,172,0.07)", border:"1px solid rgba(102,92,172,0.3)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 512 512" fill="#9B8FE0" style={{ flexShrink:0 }}>
              <path d="M444 49.9C431.3 38.2 379.9.9 265.3.4c0 0-135.1-8.1-200.9 52.3C27.8 89.3 14.9 143 13.5 209.5c-1.4 66.5-3.1 191.1 116.9 225.5h.1l-.1 51.6s-.8 20.9 13 25.1c16.6 5.2 26.4-10.7 42.3-27.8 8.7-9.4 20.7-23.2 29.8-33.7 82.2 6.9 145.3-8.9 152.5-11.2 16.6-5.4 110.5-17.4 125.7-142.1 15.8-128.6-7.6-209.8-49.7-246.8zm-92 296.8c-4.9 12.1-24.8 22.9-34.4 24.4-8.7 1.3-19.7 1.8-31.9-1.8-7.4-2.1-16.8-4.8-28.9-9.4-51-19.8-84.3-71.1-86.8-74.5-2.5-3.4-20.7-27.6-20.7-52.6s13.1-38 17.8-42.4 10.2-6.3 13.6-6.3c3.4 0 6.8.1 9.8.2 3.2.1 7.4-1.2 11.5 8.7 4.3 10.2 14.6 35.6 15.8 37.9 1.2 2.3 2 5 .4 8.1-1.5 3.1-2.3 5-4.7 7.7-2.3 2.7-5 6-7.1 8.1-2.4 2.4-4.9 4.9-2.1 9.7 2.7 4.7 12.4 20.4 26.7 33.1 18.4 16.4 33.9 21.4 38.7 23.9 4.8 2.5 7.7 2.2 10.7-1.2 3-3.3 12.8-14.6 16.2-19.6 3.4-5 6.8-4.2 11.5-2.5 4.7 1.6 29.6 13.7 34.4 16.3 4.7 2.6 8 3.8 9.2 6 1.4 2.1 1.4 12.1-2.6 23.2z"/>
            </svg>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#9B8FE0",
                fontFamily:"var(--font-myanmar, system-ui)" }}>
                Viber Channel ဝင်ပါ
              </div>
              <div style={{ fontSize:11, color:"#6B7280", fontFamily:"var(--font-myanmar, system-ui)" }}>
                မြေကွက် တင်တိုင်း Channel မှာ အလိုအလျောက် ဖြန့်ဝေပေးမည်
              </div>
            </div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="rgba(155,143,224,0.5)" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </a>
        )}

        {/* Empty state */}
        {list.length === 0 && (
          <div style={{
            display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", padding:"60px 20px", textAlign:"center",
          }}>
            <div style={{
              width:64, height:64, borderRadius:18, marginBottom:16,
              background:"rgba(224,163,59,0.07)", border:"1px solid rgba(224,163,59,0.15)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E0A33B" strokeWidth="1.5">
                <path d="M3 21V8l9-5 9 5v13"/><path d="M12 11v5M9.5 13.5h5"/>
              </svg>
            </div>
            <p style={{ color:"#6B7280", fontSize:14, margin:"0 0 16px",
              fontFamily:"var(--font-myanmar, system-ui)" }}>
              မြေကွက် မတင်ရသေးပါ
            </p>
            <button onClick={openAdd} style={{
              padding:"10px 20px", borderRadius:12,
              background:"linear-gradient(135deg,#E0A33B,#F4B942)",
              border:"none", color:"#1A1206", fontSize:14, fontWeight:800,
              cursor:"pointer", fontFamily:"var(--font-myanmar, system-ui)",
            }}>
              ပထမဆုံး မြေကွက် တင်မည်
            </button>
          </div>
        )}

        {/* Plot cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {list.map((p, idx) => {
            const badge = sc[p.status] || sc.available;
            return (
              <div key={p.id} className="plot-card" style={{
                background:"#13151A", border:"1px solid #1E2232",
                borderRadius:16, overflow:"hidden",
                animation:"cardIn .4s cubic-bezier(0.16,1,0.3,1) both",
                animationDelay:`${idx * 55}ms`,
              }}>
                <div style={{ display:"flex", gap:0 }}>
                  {/* Thumbnail */}
                  <div style={{ width:90, flexShrink:0, position:"relative" }}>
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" style={{
                        width:"100%", height:"100%", objectFit:"cover",
                        display:"block", minHeight:90,
                      }}/>
                    ) : (
                      <div style={{
                        width:"100%", minHeight:90, background:"#191C25",
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                          stroke="#2C313C" strokeWidth="1.5">
                          <path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/>
                        </svg>
                      </div>
                    )}
                    {p.images?.length > 1 && (
                      <span style={{
                        position:"absolute", bottom:5, right:5,
                        background:"rgba(0,0,0,0.7)", color:"#ECE6D9",
                        fontSize:10, padding:"2px 6px", borderRadius:6, fontWeight:700,
                      }}>
                        +{p.images.length - 1}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, padding:"12px 14px", minWidth:0 }}>
                    {/* Township + status */}
                    <div style={{ display:"flex", alignItems:"center", gap:8,
                      flexWrap:"wrap", marginBottom:4 }}>
                      <span style={{ fontSize:15, fontWeight:800, color:"#ECE6D9",
                        fontFamily:"var(--font-myanmar, system-ui)" }}>
                        {p.township}
                      </span>
                      <span style={{
                        fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:20,
                        background:badge.bg, color:badge.color, border:`1px solid ${badge.border}`,
                      }}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </div>

                    {/* Street */}
                    {p.street && (
                      <div style={{ fontSize:12, color:"#888B95", marginBottom:4,
                        fontFamily:"var(--font-myanmar, system-ui)" }}>
                        {p.street}
                      </div>
                    )}

                    {/* Size · grant · price */}
                    <div style={{ fontSize:12, color:"#6B7280",
                      fontFamily:"var(--font-myanmar, system-ui)" }}>
                      {p.width}×{p.height} ပေ · {p.grant}
                    </div>
                    <div style={{ fontSize:15, fontWeight:800, color:"#E0A33B",
                      marginTop:4, fontFamily:"var(--font-myanmar, system-ui)" }}>
                      {mmNum(p.priceLakh)} သိန်း
                    </div>

                    {/* Posted date & time */}
                    {p.createdAt && (
                      <div style={{
                        display:"flex", alignItems:"center", gap:5,
                        marginTop:6,
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                          stroke="#374151" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 6v6l4 2"/>
                        </svg>
                        <span suppressHydrationWarning style={{ fontSize:11, color:"#374151" }}>
                          {new Date(p.createdAt).toLocaleString("en-GB", {
                            day:"2-digit", month:"short", year:"numeric",
                            hour:"2-digit", minute:"2-digit", hour12:true,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions bar */}
                <div style={{
                  display:"flex", borderTop:"1px solid #1E2232",
                }}>
                  <button
                    onClick={() => openEdit(p)}
                    style={{
                      flex:1, padding:"12px", border:"none",
                      background:"transparent", color:"#ECE6D9",
                      fontSize:13, fontWeight:700, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                      fontFamily:"var(--font-myanmar, system-ui)",
                      borderRight:"1px solid #1E2232",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    ပြင်မည်
                  </button>
                  <button
                    onClick={() => del(p.id, p.township)}
                    style={{
                      flex:1, padding:"12px", border:"none",
                      background:"transparent", color:"#f87171",
                      fontSize:13, fontWeight:700, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                      fontFamily:"var(--font-myanmar, system-ui)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                    ဖျက်မည်
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Bottom nav — always above sheet backdrop */}
      <nav style={{ zIndex: 200 }}>
        <a href="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>
          </svg>
          <span className="mm">မြေကွက်</span>
        </a>
        <a href="/phone">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>
          </svg>
          <span className="mm">ဖုန်း</span>
        </a>
        <button onClick={openAdd} className="post" aria-label="တင်မည်">
          <span className="pc">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </span>
        </button>
        <a href="/admin" className="on">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/>
          </svg>
          <span className="mm">စီမံ</span>
        </a>
        <a href="/user/profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
          </svg>
          <span className="mm">ကျွန်ုပ်</span>
        </a>
      </nav>

      {/* Add / Edit bottom sheet */}
      {showForm && (
        <>
          {/* Backdrop — stops above nav */}
          <div onClick={closeForm} style={{
            position:"fixed", inset:"0 0 74px 0", background:"rgba(0,0,0,0.7)",
            zIndex:110, backdropFilter:"blur(4px)",
          }}/>

          {/* Sheet — sits just above the nav */}
          <div style={{
            position:"fixed", bottom:74, left:0, right:0, zIndex:120,
            background:"#13151A", borderTop:"1px solid #2C313C",
            borderRadius:"22px 22px 0 0",
            maxHeight:"calc(90dvh - 74px)", overflowY:"auto",
            animation:"sheetUp .42s cubic-bezier(0.34,1.56,0.64,1) both",
          }}>
            {/* Handle */}
            <div style={{ width:40, height:4, background:"#2C313C", borderRadius:2,
              margin:"12px auto 0" }}/>

            {/* Sheet header */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"16px 20px 0",
            }}>
              <span style={{ fontSize:16, fontWeight:800, color:"#ECE6D9",
                fontFamily:"var(--font-myanmar, system-ui)" }}>
                {editId ? "မြေကွက် ပြင်ဆင်ရန်" : "မြေကွက်အသစ် တင်ရန်"}
              </span>
              <button onClick={closeForm} style={{
                width:30, height:30, borderRadius:"50%", border:"none",
                background:"#1E2232", color:"#888B95", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Form body */}
            <div style={{ padding:"16px 20px 40px" }}>
              <Field label="မြို့နယ် *">
                <select style={inp} value={form.township}
                  onChange={e => set("township", e.target.value)}>
                  <option value="">— မြို့နယ် ရွေးချယ်ပါ —</option>
                  {TOWNSHIPS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>

              <Field label="လမ်း / ရပ်ကွက်" error={phoneErrors.street}>
                <input style={{ ...inp, borderColor: phoneErrors.street ? "#f87171" : "#2C313C" }}
                  value={form.street} placeholder="ဥပမာ ၆၂ လမ်း"
                  onChange={e => set("street", e.target.value)}/>
              </Field>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <Field label="အကျယ် (ပေ) *">
                  <input style={inp} type="number" value={form.width} placeholder="40"
                    onChange={e => set("width", e.target.value)}/>
                </Field>
                <Field label="အလျား (ပေ) *">
                  <input style={inp} type="number" value={form.height} placeholder="60"
                    onChange={e => set("height", e.target.value)}/>
                </Field>
                <Field label="ဂရန်အမျိုးအစား">
                  <select style={inp} value={form.grant}
                    onChange={e => set("grant", e.target.value)}>
                    {GRANTS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="ဈေး (သိန်း) *">
                  <input style={inp} type="number" value={form.priceLakh} placeholder="250"
                    onChange={e => set("priceLakh", e.target.value)}/>
                </Field>
                <Field label="မျက်နာလည့်">
                  <select style={inp} value={form.facing}
                    onChange={e => set("facing", e.target.value)}>
                    {FACINGS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="ရှေ့လမ်းအကျယ်" error={phoneErrors.road}>
                  <input style={{ ...inp, borderColor: phoneErrors.road ? "#f87171" : "#2C313C" }}
                    value={form.road} placeholder="ဥပမာ ၂၀ ပေ"
                    onChange={e => set("road", e.target.value)}/>
                </Field>
              </div>

              <Field label="အမှတ်အသား" error={phoneErrors.tag}>
                <input style={{ ...inp, borderColor: phoneErrors.tag ? "#f87171" : "#2C313C" }}
                  value={form.tag} placeholder="ဥပမာ အသစ် / ထူးခြား"
                  onChange={e => set("tag", e.target.value)}/>
              </Field>

              <Field label="အခြေအနေ">
                <select style={inp} value={form.status}
                  onChange={e => set("status", e.target.value)}>
                  <option value="available">ရောင်းရန်ရှိ</option>
                  <option value="sold">ရောင်းပြီး</option>
                  <option value="pending">ဆိုင်းငံ့</option>
                </select>
              </Field>

              <Field label="မှတ်ချက်" error={phoneErrors.note}>
                <textarea style={{ ...inp, resize:"none", borderColor: phoneErrors.note ? "#f87171" : "#2C313C" }}
                  rows={2} value={form.note}
                  placeholder="ဥပမာ ဂရန်အမည်ပေါက်၊ ကင်းရှင်း"
                  onChange={e => set("note", e.target.value)}/>
              </Field>

              {/* Images */}
              <Field label={`ဓာတ်ပုံများ (${form.images.length}/6)`}>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ position:"relative", width:72, height:72 }}>
                      <img src={img} alt="" style={{
                        width:"100%", height:"100%", objectFit:"cover",
                        borderRadius:10, border:"1px solid #2C313C",
                      }}/>
                      {i === 0 && (
                        <span style={{
                          position:"absolute", bottom:3, left:3,
                          background:"rgba(224,163,59,0.9)", color:"#1A1206",
                          fontSize:9, fontWeight:800, padding:"1px 5px", borderRadius:4,
                        }}>ပင်မ</span>
                      )}
                      <button onClick={() => removeImage(i)} style={{
                        position:"absolute", top:-6, right:-6, width:20, height:20,
                        borderRadius:"50%", border:"none", background:"#f87171",
                        color:"#fff", fontSize:12, cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        lineHeight:1,
                      }}>×</button>
                    </div>
                  ))}
                  {form.images.length < 6 && (
                    <label style={{
                      width:72, height:72, borderRadius:10,
                      border:"1.5px dashed #2C313C", background:"#191C25",
                      display:"flex", flexDirection:"column", alignItems:"center",
                      justifyContent:"center", cursor:"pointer", gap:4,
                      opacity: uploading ? 0.5 : 1,
                    }}>
                      {uploading
                        ? <span style={{ width:18, height:18, border:"2px solid #2C313C",
                            borderTopColor:"#E0A33B", borderRadius:"50%",
                            animation:"spin 0.8s linear infinite" }}/>
                        : <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="#6B7280" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                      }
                      <span style={{ fontSize:9, color:"#555A66",
                        fontFamily:"var(--font-myanmar, system-ui)" }}>
                        {uploading ? "တင်နေ..." : "ဓာတ်ပုံ"}
                      </span>
                      <input ref={fileRef} type="file" accept="image/*"
                        onChange={handleImageUpload} style={{ display:"none" }}
                        disabled={uploading}/>
                    </label>
                  )}
                </div>
              </Field>

              {/* Save */}
              {Object.values(phoneErrors).some(Boolean) && (
                <div style={{
                  display:"flex", alignItems:"center", gap:8, marginBottom:10,
                  padding:"10px 12px", borderRadius:10,
                  background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                  <span style={{ fontSize:12, color:"#f87171",
                    fontFamily:"var(--font-myanmar, system-ui)" }}>
                    ဖုန်းနံပါတ် ပါဝင်သော ကွက်လပ် ရှိသည် — ဖြည့်စွက်မှ မသိမ်းနိုင်ပါ
                  </span>
                </div>
              )}
              <button
                disabled={busy || Object.values(phoneErrors).some(Boolean)}
                onClick={save}
                style={{
                  width:"100%", padding:"14px", borderRadius:14, border:"none",
                  background: (busy || Object.values(phoneErrors).some(Boolean))
                    ? "#2C313C"
                    : "linear-gradient(135deg,#E0A33B,#F4B942)",
                  color: (busy || Object.values(phoneErrors).some(Boolean)) ? "#6B7280" : "#1A1206",
                  fontSize:15, fontWeight:800,
                  cursor: (busy || Object.values(phoneErrors).some(Boolean)) ? "default" : "pointer",
                  fontFamily:"var(--font-myanmar, system-ui)",
                  marginTop:4,
                }}
              >
                {busy ? "သိမ်းနေသည်..." : editId ? "ပြင်ဆင်ချက် သိမ်းမည်" : "မြေကွက် တင်မည်"}
              </button>

              {editId && (
                <button onClick={closeForm} style={{
                  width:"100%", padding:"12px", borderRadius:14, marginTop:8,
                  border:"1px solid #2C313C", background:"transparent",
                  color:"#6B7280", fontSize:14, cursor:"pointer",
                  fontFamily:"var(--font-myanmar, system-ui)",
                }}>
                  ဖျက်သိမ်းမည်
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
