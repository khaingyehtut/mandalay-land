"use client";
import { useState } from "react";
import Link from "next/link";

const inp = {
  width: "100%", background: "#191C25", border: "1px solid #2C313C",
  borderRadius: 10, padding: "10px 12px", color: "#ECE6D9", fontSize: 14,
  outline: "none", boxSizing: "border-box",
  fontFamily: "var(--font-myanmar, system-ui)",
};

function EditSheet({ settings, onClose, onSaved }) {
  const [form, setForm] = useState({ ...settings });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(settings.agentPhoto || "");

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function pickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!r.ok) { alert("ဓာတ်ပုံ တင်မရပါ"); return; }
    const { url } = await r.json();
    set("agentPhoto", url);
  }

  async function save() {
    if (!form.phone.trim()) { alert("ဖုန်းနံပါတ် ဖြည့်ပါ"); return; }
    setBusy(true);
    const r = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (!r.ok) { alert("မသိမ်းနိုင်ပါ"); return; }
    onSaved(form);
  }

  const isLoading = busy || uploading;

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: "0 0 74px 0", background: "rgba(0,0,0,0.75)",
        zIndex: 110, backdropFilter: "blur(4px)",
      }}/>
      <div style={{
        position: "fixed", bottom: 74, left: 0, right: 0, zIndex: 120,
        background: "#13151A", borderTop: "1px solid #2C313C",
        borderRadius: "22px 22px 0 0",
        maxHeight: "calc(90dvh - 74px)", overflowY: "auto",
        animation: "sheetUp .42s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        <style>{`@keyframes sheetUp{0%{transform:translateY(104%) scale(.96)} 65%{transform:translateY(-2%) scale(1.007)} 82%{transform:translateY(.8%) scale(.999)} 100%{transform:translateY(0) scale(1)}}`}</style>

        <div style={{ width: 36, height: 4, background: "#2C313C", borderRadius: 2,
          margin: "12px auto 0" }}/>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px 0" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#ECE6D9",
            fontFamily: "var(--font-myanmar, system-ui)" }}>ဆက်သွယ်ရေး ပြင်ဆင်ရန်</span>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: "50%", border: "none",
            background: "#1E2232", color: "#888B95", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div style={{ padding: "16px 20px 32px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Photo picker */}
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#6B7280", marginBottom: 8,
              fontFamily: "var(--font-myanmar, system-ui)" }}>ဓာတ်ပုံ</label>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%", flexShrink: 0,
                background: "#191C25", border: "2px dashed #2C313C",
                overflow: "hidden", display: "flex", alignItems: "center",
                justifyContent: "center", position: "relative",
              }}>
                {uploading && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E0A33B" strokeWidth="2.5">
                      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
                {preview
                  ? <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                  : <span style={{ fontSize: 22, fontWeight: 800, color: "#E0A33B",
                      fontFamily: "var(--font-myanmar, system-ui)" }}>
                      {form.agentName?.trim().slice(0, 1) || "က"}
                    </span>
                }
              </div>
              <div style={{
                flex: 1, padding: "10px 14px", borderRadius: 12,
                border: "1.5px dashed rgba(224,163,59,0.35)",
                background: "rgba(224,163,59,0.04)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E0A33B" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#E0A33B",
                    fontFamily: "var(--font-myanmar, system-ui)" }}>
                    {uploading ? "တင်နေသည်..." : "ဓာတ်ပုံ ရွေးမည်"}
                  </div>
                  <div style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>JPG, PNG, WEBP</div>
                </div>
              </div>
              <input type="file" accept="image/*" onChange={pickImage} style={{ display: "none" }}/>
            </label>
            {preview && !uploading && (
              <button onClick={() => { setPreview(""); set("agentPhoto", ""); }} style={{
                marginTop: 8, padding: "4px 10px", borderRadius: 7,
                border: "1px solid rgba(248,113,113,0.3)",
                background: "rgba(239,68,68,0.06)", color: "#f87171",
                fontSize: 11, cursor: "pointer",
                fontFamily: "var(--font-myanmar, system-ui)",
              }}>ဓာတ်ပုံ ဖယ်မည်</button>
            )}
          </div>

          {/* Fields */}
          {[
            { key: "agentName",  label: "နာမည်",        placeholder: "ကိုအောင်" },
            { key: "agentTitle", label: "ရာထူး / ဌာန",  placeholder: "အိမ်ခြံမြေ အကျိုးဆောင်လုပ်ငန်း" },
            { key: "phone",      label: "ဖုန်းနံပါတ် *", placeholder: "09xxxxxxxx" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: 12, color: "#6B7280", marginBottom: 5,
                fontFamily: "var(--font-myanmar, system-ui)" }}>{label}</label>
              <input style={inp} value={form[key] || ""} placeholder={placeholder}
                onChange={e => set(key, e.target.value)}/>
            </div>
          ))}

          <button disabled={isLoading} onClick={save} style={{
            padding: "14px", borderRadius: 14, border: "none",
            background: isLoading ? "#2C313C" : "linear-gradient(135deg,#E0A33B,#F4B942)",
            color: isLoading ? "#6B7280" : "#1A1206",
            fontSize: 15, fontWeight: 800, cursor: isLoading ? "default" : "pointer",
            fontFamily: "var(--font-myanmar, system-ui)", marginTop: 4,
          }}>
            {uploading ? "ဓာတ်ပုံ တင်နေ..." : busy ? "သိမ်းနေ..." : "သိမ်းမည်"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function PhonePageClient({ settings: initial, isAdmin }) {
  const [settings, setSettings] = useState(initial);
  const [showEdit, setShowEdit] = useState(false);

  const { phone, agentName, agentTitle, agentPhoto } = settings;
  const tel = "tel:" + phone.replace(/[^0-9+]/g, "");
  const viber = "viber://chat?number=%2B95" + phone.replace(/^0/, "").replace(/[^0-9]/g, "");

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
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        minHeight: "calc(100dvh - 74px)",
      }}>

        <div style={{ textAlign: "center", marginBottom: 24, width: "100%" }}>
          <div style={{ fontSize: 11, color: "#374151", letterSpacing: "0.15em",
            textTransform: "uppercase", marginBottom: 6 }}>MANDALAY LAND</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#ECE6D9", margin: 0,
              fontFamily: "var(--font-myanmar, system-ui)" }}>ဆက်သွယ်ရန်</h1>
            {isAdmin && (
              <button onClick={() => setShowEdit(true)} style={{
                width: 30, height: 30, borderRadius: 9, border: "1px solid #2C313C",
                background: "#191C25", color: "#E0A33B", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div style={{
          width: "100%", background: "linear-gradient(145deg,#13151A,#191C25)",
          border: "1px solid #1E2232", borderRadius: 28,
          padding: "32px 24px 24px", position: "relative", overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          animation: "fadeUp 0.5s ease both",
        }}>
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
            background: "linear-gradient(90deg,transparent,rgba(224,163,59,0.5),transparent)" }}/>

          {/* Avatar */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <div style={{ animation: "float 3s ease-in-out infinite", position: "relative" }}>
              <div style={{
                position: "absolute", inset: -6, borderRadius: "50%",
                border: "1.5px solid rgba(224,163,59,0.5)",
                animation: "pulse 2.5s ease-out infinite",
              }}/>
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                background: "linear-gradient(135deg,#E0A33B,#F4B94288)",
                padding: 3, boxShadow: "0 8px 28px rgba(224,163,59,0.28)",
              }}>
                <div style={{
                  width: "100%", height: "100%", borderRadius: "50%",
                  background: "#191C25", overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {agentPhoto
                    ? <img src={agentPhoto} alt={agentName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                    : <span style={{ fontSize: 34, fontWeight: 800, color: "#E0A33B",
                        fontFamily: "var(--font-myanmar, system-ui)" }}>
                        {agentName.trim().slice(0, 1)}
                      </span>
                  }
                </div>
              </div>
              <div style={{
                position: "absolute", bottom: 5, right: 5, width: 14, height: 14,
                borderRadius: "50%", background: "#10b981",
                border: "2.5px solid #191C25",
                boxShadow: "0 0 8px rgba(16,185,129,0.7)",
              }}/>
            </div>
          </div>

          {/* Name + title */}
          <div style={{ textAlign: "center", fontSize: 20, fontWeight: 800, color: "#ECE6D9",
            marginBottom: 4, fontFamily: "var(--font-myanmar, system-ui)" }}>{agentName}</div>
          <div style={{ textAlign: "center", fontSize: 13, color: "#6B7280", marginBottom: 20,
            fontFamily: "var(--font-myanmar, system-ui)" }}>{agentTitle}</div>

          <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#2C313C,transparent)",
            marginBottom: 18 }}/>

          {/* Phone */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
            gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: "rgba(224,163,59,0.1)", border: "1px solid rgba(224,163,59,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E0A33B" strokeWidth="2">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>
              </svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#ECE6D9",
              letterSpacing: "0.05em", fontVariantNumeric: "tabular-nums" }}>
              {phone}
            </span>
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <a href={tel} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 7, padding: "13px 0", borderRadius: 14, textDecoration: "none",
              background: "linear-gradient(135deg,#E0A33B,#F4B942)",
              color: "#1A1206", fontSize: 14, fontWeight: 800,
              fontFamily: "var(--font-myanmar, system-ui)",
              boxShadow: "0 6px 20px rgba(224,163,59,0.3)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>
              </svg>
              ဖုန်းခေါ်မည်
            </a>
            <a href={viber} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 7, padding: "13px 0", borderRadius: 14, textDecoration: "none",
              background: "rgba(102,92,172,0.1)", border: "1px solid rgba(102,92,172,0.35)",
              color: "#9B8FE0", fontSize: 14, fontWeight: 700,
              fontFamily: "var(--font-myanmar, system-ui)",
            }}>
              <svg width="17" height="17" viewBox="0 0 512 512" fill="currentColor">
                <path d="M444 49.9C431.3 38.2 379.9.9 265.3.4c0 0-135.1-8.1-200.9 52.3C27.8 89.3 14.9 143 13.5 209.5c-1.4 66.5-3.1 191.1 116.9 225.5h.1l-.1 51.6s-.8 20.9 13 25.1c16.6 5.2 26.4-10.7 42.3-27.8 8.7-9.4 20.7-23.2 29.8-33.7 82.2 6.9 145.3-8.9 152.5-11.2 16.6-5.4 110.5-17.4 125.7-142.1 15.8-128.6-7.6-209.8-49.7-246.8zm-92 296.8c-4.9 12.1-24.8 22.9-34.4 24.4-8.7 1.3-19.7 1.8-31.9-1.8-7.4-2.1-16.8-4.8-28.9-9.4-51-19.8-84.3-71.1-86.8-74.5-2.5-3.4-20.7-27.6-20.7-52.6s13.1-38 17.8-42.4 10.2-6.3 13.6-6.3c3.4 0 6.8.1 9.8.2 3.2.1 7.4-1.2 11.5 8.7 4.3 10.2 14.6 35.6 15.8 37.9 1.2 2.3 2 5 .4 8.1-1.5 3.1-2.3 5-4.7 7.7-2.3 2.7-5 6-7.1 8.1-2.4 2.4-4.9 4.9-2.1 9.7 2.7 4.7 12.4 20.4 26.7 33.1 18.4 16.4 33.9 21.4 38.7 23.9 4.8 2.5 7.7 2.2 10.7-1.2 3-3.3 12.8-14.6 16.2-19.6 3.4-5 6.8-4.2 11.5-2.5 4.7 1.6 29.6 13.7 34.4 16.3 4.7 2.6 8 3.8 9.2 6 1.4 2.1 1.4 12.1-2.6 23.2z"/>
              </svg>
              Viber
            </a>
          </div>
        </div>
      </main>

      <nav>
        <Link href="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>
          </svg>
          <span className="mm">မြေကွက်</span>
        </Link>
        <Link href="/phone" className="on">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>
          </svg>
          <span className="mm">ဖုန်း</span>
        </Link>
        <Link href="/admin" className="post" aria-label="ရောင်းမယ်">
          <span className="pc">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </span>
        </Link>
        <Link href="/admin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/>
          </svg>
          <span className="mm">စီမံ</span>
        </Link>
        <Link href="/user/profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
          </svg>
          <span className="mm">ကျွန်ုပ်</span>
        </Link>
      </nav>

      {showEdit && (
        <EditSheet
          settings={settings}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => { setSettings(updated); setShowEdit(false); }}
        />
      )}
    </div>
  );
}
