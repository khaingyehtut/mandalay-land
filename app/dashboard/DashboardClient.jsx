"use client";

import { useState, useTransition } from "react";
import { adminDeletePlot, adminUpdatePlotStatus, adminDeleteUser } from "@/lib/actions/admin";

const STATUS_LABEL = { available: "ရောင်းရန်ရှိ", sold: "ရောင်းပြီး", pending: "ဆိုင်းငံ့" };
const STATUS_COLOR = {
  available: { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(52,211,153,0.25)" },
  sold:      { bg: "rgba(239,68,68,0.12)",  color: "#f87171", border: "rgba(248,113,113,0.25)" },
  pending:   { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(251,191,36,0.25)" },
};

function StatusBadge({ status }) {
  const c = STATUS_COLOR[status] || STATUS_COLOR.available;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: "nowrap" }}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function StatCard({ label, value, sub, color = "#E0A33B", anim }) {
  return (
    <div style={{ background: "#13151A", border: "1px solid #1E2232", borderRadius: 16,
      padding: "20px 20px 16px", display: "flex", flexDirection: "column", gap: 6, ...anim }}>
      <span style={{ fontSize: 12, color: "#6B7280", textTransform: "uppercase",
        letterSpacing: "0.08em", fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: 32, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: "#6B7280" }}>{sub}</span>}
    </div>
  );
}

/* ── Plots Tab ── */
function PlotsTable({ plots }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTownship, setFilterTownship] = useState("all");
  const [pending, startTransition] = useTransition();

  const townships = [...new Set(plots.map(p => p.township))].sort();
  const filtered = plots.filter(p => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterTownship !== "all" && p.township !== filterTownship) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.township.includes(q) || (p.street || "").includes(q) ||
        (p.user?.name || "").toLowerCase().includes(q) || (p.user?.email || "").toLowerCase().includes(q);
    }
    return true;
  });

  function handleStatus(plotId, status) {
    startTransition(() => adminUpdatePlotStatus(plotId, status));
  }
  function handleDelete(plotId, township) {
    if (!confirm(`"${township}" မြေကွက်ကို ဖျက်မှာ သေချာပါသလား?`)) return;
    startTransition(() => adminDeletePlot(plotId));
  }

  const sel = { background: "#191C25", border: "1px solid #2C313C", borderRadius: 8,
    padding: "8px 12px", color: "#ECE6D9", fontSize: 13, cursor: "pointer", outline: "none" };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ရှာဖွေမည်..."
          style={{ ...sel, flex: "1 1 160px", fontFamily: "var(--font-myanmar, system-ui)" }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={sel}>
          <option value="all">အခြေအနေ အားလုံး</option>
          <option value="available">ရောင်းရန်ရှိ</option>
          <option value="sold">ရောင်းပြီး</option>
          <option value="pending">ဆိုင်းငံ့</option>
        </select>
        <select value={filterTownship} onChange={e => setFilterTownship(e.target.value)} style={{ ...sel, fontFamily: "var(--font-myanmar, system-ui)" }}>
          <option value="all">မြို့နယ် အားလုံး</option>
          {townships.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span style={{ fontSize: 12, color: "#6B7280", alignSelf: "center" }}>
          {filtered.length} ကွက်
        </span>
      </div>

      {/* Table */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#6B7280", padding: "40px 0",
            fontFamily: "var(--font-myanmar, system-ui)", fontSize: 14 }}>
            မြေကွက် မတွေ့ပါ
          </div>
        )}
        {filtered.map(p => (
          <div key={p.id} style={{ background: "#13151A", border: "1px solid #1E2232",
            borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center",
            gap: 12, flexWrap: "wrap" }}>
            {/* Thumb */}
            {p.images?.[0]
              ? <img src={p.images[0]} alt="" style={{ width: 48, height: 48, borderRadius: 8,
                  objectFit: "cover", flexShrink: 0 }} />
              : <div style={{ width: 48, height: 48, borderRadius: 8, background: "#191C25",
                  flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555A66" strokeWidth="1.5">
                    <path d="M3 21V8l9-5 9 5v13"/><path d="M9 21V12h6v9"/>
                  </svg>
                </div>
            }
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <b style={{ color: "#ECE6D9", fontSize: 14,
                  fontFamily: "var(--font-myanmar, system-ui)" }}>
                  {p.township}{p.street ? ` · ${p.street}` : ""}
                </b>
                <StatusBadge status={p.status} />
              </div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3,
                fontFamily: "var(--font-myanmar, system-ui)" }}>
                {p.width}×{p.height} ပေ · {p.grant} · {p.priceLakh} သိန်း
                {p.user && <span style={{ color: "#555A66" }}> · {p.user.name ?? p.user.email}</span>}
              </div>
            </div>
            {/* Actions */}
            <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
              <select value={p.status} disabled={pending}
                onChange={e => handleStatus(p.id, e.target.value)}
                style={{ ...sel, fontSize: 12, padding: "6px 8px",
                  fontFamily: "var(--font-myanmar, system-ui)" }}>
                <option value="available">ရောင်းရန်ရှိ</option>
                <option value="sold">ရောင်းပြီး</option>
                <option value="pending">ဆိုင်းငံ့</option>
              </select>
              <button disabled={pending} onClick={() => handleDelete(p.id, p.township)}
                style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(248,113,113,0.3)",
                  background: "rgba(239,68,68,0.08)", color: "#f87171", fontSize: 12,
                  cursor: "pointer", fontFamily: "var(--font-myanmar, system-ui)" }}>
                ဖျက်
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Users Tab ── */
function getProvider(u) {
  if (u.image?.includes("googleusercontent")) return { label: "Google", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.3)" };
  if (u.image?.includes("facebook") || u.image?.includes("fbcdn")) return { label: "Facebook", color: "#818cf8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.3)" };
  return { label: "Email", color: "#888B95", bg: "#1E2232", border: "#2C313C" };
}

function UserDetailSheet({ user, userPlots, adminEmail, onClose, onDeleted }) {
  const [pending, startTransition] = useTransition();
  const provider = getProvider(user);
  const isAdmin  = user.email === adminEmail;
  const initials = (user.name || user.email)[0].toUpperCase();

  function handleDelete() {
    if (!confirm(`"${user.name ?? user.email}" နှင့် သူ့ post အားလုံး ဖျက်မှာ သေချာပါသလား?`)) return;
    startTransition(async () => {
      await adminDeleteUser(user.id);
      onDeleted();
    });
  }

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
        zIndex: 200, backdropFilter: "blur(4px)",
      }}/>
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 210,
        background: "#13151A", borderTop: "1px solid #2C313C",
        borderRadius: "22px 22px 0 0",
        maxHeight: "85dvh", overflowY: "auto",
        animation: "sheetUp .42s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        <style>{`@keyframes sheetUp{0%{transform:translateY(104%) scale(.96)} 65%{transform:translateY(-2%) scale(1.007)} 82%{transform:translateY(.8%) scale(.999)} 100%{transform:translateY(0) scale(1)}}`}</style>

        {/* Handle */}
        <div style={{ width: 36, height: 4, background: "#2C313C", borderRadius: 2, margin: "12px auto 0" }}/>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 0" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#ECE6D9", fontFamily: "var(--font-myanmar, system-ui)" }}>
            အသုံးပြုသူ အချက်အလက်
          </span>
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

        <div style={{ padding: "20px 20px 36px" }}>

          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20,
            padding: "16px", background: "#191C25", borderRadius: 16, border: "1px solid #1E2232" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
              background: "#13151A", border: "2px solid #E0A33B44",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {user.image
                ? <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                : <span style={{ fontSize: 22, fontWeight: 800, color: "#E0A33B" }}>{initials}</span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#ECE6D9",
                  fontFamily: "var(--font-myanmar, system-ui)" }}>{user.name ?? "—"}</span>
                {isAdmin && (
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 10,
                    background: "rgba(224,163,59,0.15)", color: "#E0A33B", border: "1px solid rgba(224,163,59,0.3)" }}>
                    ADMIN
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 12, marginTop: 5,
                display: "inline-block", background: provider.bg, color: provider.color, border: `1px solid ${provider.border}` }}>
                {provider.label}
              </span>
            </div>
          </div>

          {/* Info rows */}
          {[
            {
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>,
              label: "Email", value: user.email,
            },
            ...(user.phone ? [{
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/></svg>,
              label: "ဖုန်းနံပါတ်", value: user.phone,
            }] : []),
            {
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
              label: "ဝင်ရောက်သည့်ရက်",
              value: new Date(user.createdAt).toLocaleString("en-GB", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit", hour12: true,
              }),
            },
            {
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
              label: "မြေကွက် အရေအတွက်",
              value: `${user._count.plots} ကွက်`,
            },
            {
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
              label: "User ID", value: user.id,
            },
          ].map((row, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "12px 0", borderBottom: "1px solid #1E2232",
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: "#191C25", border: "1px solid #2C313C",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280",
              }}>{row.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2,
                  fontFamily: "var(--font-myanmar, system-ui)" }}>{row.label}</div>
                <div suppressHydrationWarning style={{ fontSize: 13, color: "#ECE6D9", wordBreak: "break-all",
                  fontFamily: "var(--font-myanmar, system-ui)" }}>{row.value}</div>
              </div>
            </div>
          ))}

          {/* User's plots */}
          {userPlots.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ECE6D9", marginBottom: 10,
                fontFamily: "var(--font-myanmar, system-ui)" }}>
                တင်ထားသော မြေကွက်များ
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {userPlots.map(p => {
                  const sc = STATUS_COLOR[p.status] || STATUS_COLOR.available;
                  return (
                    <div key={p.id} style={{
                      background: "#191C25", border: "1px solid #1E2232", borderRadius: 12,
                      padding: "12px 14px", display: "flex", gap: 10, alignItems: "center",
                    }}>
                      {/* Thumb */}
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt="" style={{
                          width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0,
                        }}/>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#ECE6D9",
                          fontFamily: "var(--font-myanmar, system-ui)" }}>
                          {p.township} · {p.width}×{p.height}
                        </div>
                        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2,
                          fontFamily: "var(--font-myanmar, system-ui)" }}>
                          {p.priceLakh} သိန်း
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 8, flexShrink: 0,
                        background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                        fontFamily: "var(--font-myanmar, system-ui)",
                      }}>{STATUS_LABEL[p.status]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delete user */}
          {!isAdmin && (
            <button disabled={pending} onClick={handleDelete} style={{
              width: "100%", marginTop: 24, padding: "13px",
              borderRadius: 14, border: "1px solid rgba(248,113,113,0.3)",
              background: "rgba(239,68,68,0.07)", color: pending ? "#555" : "#f87171",
              fontSize: 14, fontWeight: 700, cursor: pending ? "default" : "pointer",
              fontFamily: "var(--font-myanmar, system-ui)",
            }}>
              {pending ? "ဖျက်နေသည်..." : `"${user.name ?? user.email}" အကောင့် ဖျက်မည်`}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function UsersTable({ users, plots, adminEmail }) {
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.name || "").toLowerCase().includes(q)
      || u.email.toLowerCase().includes(q)
      || (u.phone || "").includes(q);
  });

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="အမည် / Email / ဖုန်း ရှာဖွေမည်..."
          style={{
            flex: 1, background: "#191C25", border: "1px solid #2C313C",
            borderRadius: 10, padding: "9px 12px", color: "#ECE6D9",
            fontSize: 13, outline: "none",
          }}/>
        <span style={{ fontSize: 12, color: "#6B7280", flexShrink: 0 }}>{filtered.length} ဦး</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(u => {
          const provider = getProvider(u);
          const isAdmin  = u.email === adminEmail;
          const initials = (u.name || u.email)[0].toUpperCase();
          return (
            <div key={u.id} onClick={() => setSelected(u)}
              style={{
                background: "#13151A", border: "1px solid #1E2232", borderRadius: 14,
                padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer", transition: "border-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#2C313C"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#1E2232"}
            >
              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                background: "#191C25", border: "2px solid #E0A33B33",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {u.image
                  ? <img src={u.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                  : <span style={{ fontSize: 18, fontWeight: 800, color: "#E0A33B" }}>{initials}</span>
                }
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#ECE6D9",
                    fontFamily: "var(--font-myanmar, system-ui)" }}>
                    {u.name ?? "—"}
                  </span>
                  {isAdmin && (
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 8,
                      background: "rgba(224,163,59,0.15)", color: "#E0A33B",
                      border: "1px solid rgba(224,163,59,0.3)" }}>ADMIN</span>
                  )}
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 8,
                    background: provider.bg, color: provider.color, border: `1px solid ${provider.border}` }}>
                    {provider.label}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.email}
                  {u.phone && <span style={{ color: "#4B5563" }}> · {u.phone}</span>}
                </div>
              </div>

              {/* Plot count + chevron */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#E0A33B", lineHeight: 1 }}>
                    {u._count.plots}
                  </div>
                  <div style={{ fontSize: 10, color: "#6B7280", fontFamily: "var(--font-myanmar, system-ui)" }}>ကွက်</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <UserDetailSheet
          user={selected}
          userPlots={plots.filter(p => p.userId === selected.id)}
          adminEmail={adminEmail}
          onClose={() => setSelected(null)}
          onDeleted={() => setSelected(null)}
        />
      )}
    </div>
  );
}

/* ── Township Analytics ── */
function TownshipChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map(({ township, count, totalValue }) => (
        <div key={township}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 13, color: "#ECE6D9",
              fontFamily: "var(--font-myanmar, system-ui)" }}>{township}</span>
            <span style={{ fontSize: 12, color: "#6B7280" }}>
              {count} ကွက် · {totalValue.toLocaleString()} သိန်း
            </span>
          </div>
          <div style={{ height: 6, background: "#1E2232", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 6,
              background: "linear-gradient(90deg, #E0A33B, #F4B942)",
              width: `${(count / max) * 100}%`, transition: "width 0.5s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Dashboard ── */
const dashStyle = `
  @keyframes cardIn   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
  @keyframes tabFade  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
`;

export default function DashboardClient({ stats, plots, users, townshipData, recentPlots, adminEmail }) {
  const [tab, setTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "ခြုံငုံသုံးသပ်" },
    { key: "plots",    label: `မြေကွက်များ (${plots.length})` },
    { key: "users",    label: `အသုံးပြုသူများ (${users.length})` },
  ];

  const tabBtn = (key) => ({
    padding: "9px 18px",
    borderRadius: 10,
    border: "none",
    background: tab === key ? "#E0A33B" : "transparent",
    color: tab === key ? "#1A1206" : "#6B7280",
    fontSize: 13,
    fontWeight: tab === key ? 800 : 500,
    cursor: "pointer",
    fontFamily: "var(--font-myanmar, system-ui)",
    transition: "all 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0C0D11", paddingBottom: 60 }}>
      <style>{dashStyle}</style>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1E2232", padding: "16px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: "#0C0D11", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #E0A33B",
            background: "rgba(224,163,59,0.07)", display: "flex", alignItems: "center",
            justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E0A33B" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#ECE6D9" }}>Admin Dashboard</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>မန်းလေး မြေကွက် · စီမံခန့်ခွဲမှု</div>
          </div>
        </div>
        <a href="/" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none",
          padding: "7px 14px", borderRadius: 8, border: "1px solid #2C313C",
          fontFamily: "var(--font-myanmar, system-ui)" }}>
          ← ပင်မ
        </a>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#13151A", borderRadius: 12,
          padding: 4, border: "1px solid #1E2232", marginBottom: 24, overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={tabBtn(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content — keyed so re-mount triggers animation on tab switch */}
        <div key={tab} style={{ animation: "tabFade .28s cubic-bezier(0.16,1,0.3,1) both" }}>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              <StatCard label="မြေကွက် စုစုပေါင်း" value={stats.totalPlots} color="#E0A33B"
                anim={{ animation: "cardIn .4s 0ms cubic-bezier(0.16,1,0.3,1) both" }} />
              <StatCard label="ရောင်းရန်ရှိ" value={stats.available} color="#34d399"
                anim={{ animation: "cardIn .4s 60ms cubic-bezier(0.16,1,0.3,1) both" }} />
              <StatCard label="ရောင်းပြီး" value={stats.sold} color="#f87171"
                anim={{ animation: "cardIn .4s 120ms cubic-bezier(0.16,1,0.3,1) both" }} />
              <StatCard label="အသုံးပြုသူ" value={stats.totalUsers} color="#60a5fa"
                anim={{ animation: "cardIn .4s 180ms cubic-bezier(0.16,1,0.3,1) both" }} />
              <StatCard label="စုစုပေါင်း တန်ဖိုး"
                value={`${(stats.totalValue / 1000).toFixed(1)}K`}
                sub="သိန်း" color="#a78bfa"
                anim={{ animation: "cardIn .4s 240ms cubic-bezier(0.16,1,0.3,1) both" }} />
            </div>

            {/* Township breakdown */}
            <div style={{ background: "#13151A", border: "1px solid #1E2232",
              borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ECE6D9", marginBottom: 16,
                fontFamily: "var(--font-myanmar, system-ui)" }}>မြို့နယ်အလိုက် မြေကွက်များ</div>
              <TownshipChart data={townshipData} />
            </div>

            {/* Recent plots */}
            <div style={{ background: "#13151A", border: "1px solid #1E2232",
              borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#ECE6D9", marginBottom: 16,
                fontFamily: "var(--font-myanmar, system-ui)" }}>နောက်ဆုံး တင်ထားသော မြေကွက်များ</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recentPlots.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 0", borderBottom: "1px solid #1E2232" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#ECE6D9",
                        fontFamily: "var(--font-myanmar, system-ui)" }}>
                        {p.township}{p.street ? ` · ${p.street}` : ""}
                      </div>
                      <div suppressHydrationWarning style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                        {p.user?.name ?? p.user?.email ?? "Unknown"} ·{" "}
                        {new Date(p.createdAt).toLocaleDateString("my-MM")}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <StatusBadge status={p.status} />
                      <div style={{ fontSize: 12, color: "#E0A33B", marginTop: 4,
                        fontFamily: "var(--font-myanmar, system-ui)" }}>
                        {p.priceLakh} သိန်း
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Plots Tab */}
        {tab === "plots" && <PlotsTable plots={plots} />}

        {/* Users Tab */}
        {tab === "users" && (
          <UsersTable users={users} plots={plots} adminEmail={adminEmail} />
        )}

        </div>{/* end tab content */}

      </div>
    </div>
  );
}
