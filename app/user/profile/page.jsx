import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import SignOutBtn from "./SignOutBtn";
import ChangePasswordBtn from "./ChangePasswordBtn";

export const dynamic = "force-dynamic";
export const metadata = { title: "ကျွန်ုပ် · မန်းလေး မြေကွက်" };

export default async function UserProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const user = session.user;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { createdAt: true, password: true, _count: { select: { plots: true } } },
  });

  const joinDate = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString("my-MM", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const provider = dbUser?.password ? "Email"
    : user.image?.includes("googleusercontent") ? "Google"
    : user.image?.includes("facebook") || user.image?.includes("fbcdn") ? "Facebook"
    : "OAuth";

  const providerBg = { Email: "#1E2232", Google: "rgba(66,133,244,0.12)", Facebook: "rgba(24,119,242,0.12)", OAuth: "#1E2232" }[provider];
  const providerColor = { Email: "#888B95", Google: "#60a5fa", Facebook: "#818cf8", OAuth: "#888B95" }[provider];
  const providerBorder = { Email: "#2C313C", Google: "rgba(96,165,250,0.3)", Facebook: "rgba(129,140,248,0.3)", OAuth: "#2C313C" }[provider];

  const initials = user.name?.replace(/\s+/g, "").slice(0, 1).toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U";
  const isAdmin = user.email === process.env.ADMIN_EMAIL;
  const plotCount = dbUser?._count?.plots ?? 0;

  const rows = [
    {
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>,
      label: "နာမည်", value: user.name ?? "—",
    },
    {
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>,
      label: "Email", value: user.email,
    },
    ...(joinDate ? [{
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
      label: "အကောင့် ဖွင့်သည့်ရက်", value: joinDate,
    }] : []),
  ];

  return (
    <div className="app" style={{ background: "#0C0D11" }}>

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 400, height: 300, borderRadius: "50%",
        background: "radial-gradient(ellipse,rgba(224,163,59,0.07) 0%,transparent 65%)",
        pointerEvents: "none",
      }}/>

      <main style={{ padding: "40px 16px 110px", maxWidth: 440, margin: "0 auto" }}>

        {/* Avatar hero */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
          {/* Avatar */}
          <div style={{ position: "relative", marginBottom: 16 }}>
            <div style={{
              position: "absolute", inset: -5, borderRadius: "50%",
              background: "linear-gradient(135deg,#E0A33B,#F4B942,#E0A33B44)",
              padding: 2,
            }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#0C0D11" }}/>
            </div>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "#13151A", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", zIndex: 1,
              boxShadow: "0 8px 32px rgba(224,163,59,0.2)",
            }}>
              {user.image ? (
                <Image src={user.image} alt={user.name ?? ""} fill
                  style={{ objectFit: "cover" }} sizes="96px"/>
              ) : (
                <span style={{ fontSize: 38, fontWeight: 800, color: "#E0A33B", lineHeight: 1,
                  fontFamily: "var(--font-myanmar, system-ui)" }}>{initials}</span>
              )}
            </div>
            {/* Online dot */}
            <div style={{
              position: "absolute", bottom: 4, right: 4, zIndex: 2,
              width: 14, height: 14, borderRadius: "50%",
              background: "#10b981", border: "2.5px solid #0C0D11",
              boxShadow: "0 0 8px rgba(16,185,129,0.6)",
            }}/>
          </div>

          {/* Name */}
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ECE6D9", margin: "0 0 4px",
            fontFamily: "var(--font-myanmar, system-ui)", textAlign: "center" }}>
            {user.name ?? "User"}
          </h1>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 12px", textAlign: "center" }}>
            {user.email}
          </p>

          {/* Provider badge */}
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20,
            background: providerBg, color: providerColor, border: `1px solid ${providerBorder}`,
            fontFamily: "var(--font-myanmar, system-ui)",
          }}>
            {provider} ဖြင့် ဝင်ရောက်ထားသည်
          </span>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{
            background: "#13151A", border: "1px solid #1E2232", borderRadius: 16,
            padding: "16px 14px", textAlign: "center",
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#E0A33B",
              fontVariantNumeric: "tabular-nums", lineHeight: 1, marginBottom: 4 }}>
              {plotCount}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", fontFamily: "var(--font-myanmar, system-ui)" }}>
              တင်ထားသော မြေကွက်
            </div>
          </div>
          <div style={{
            background: "#13151A", border: "1px solid #1E2232", borderRadius: 16,
            padding: "16px 14px", textAlign: "center",
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: isAdmin ? "#E0A33B" : "#ECE6D9",
              lineHeight: 1, marginBottom: 4, fontFamily: "var(--font-myanmar, system-ui)" }}>
              {isAdmin ? "Admin" : "Member"}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", fontFamily: "var(--font-myanmar, system-ui)" }}>
              အဆင့်
            </div>
          </div>
        </div>

        {/* Info card */}
        <div style={{
          background: "#13151A", border: "1px solid #1E2232",
          borderRadius: 20, overflow: "hidden", marginBottom: 14,
        }}>
          {rows.map((row, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: i < rows.length - 1 ? "1px solid #1E2232" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                  background: "#191C25", border: "1px solid #2C313C",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#6B7280",
                }}>{row.icon}</div>
                <span style={{ fontSize: 13, color: "#6B7280",
                  fontFamily: "var(--font-myanmar, system-ui)" }}>{row.label}</span>
              </div>
              <span style={{ fontSize: 13, color: "#ECE6D9", maxWidth: 160,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                fontFamily: "var(--font-myanmar, system-ui)" }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Admin dashboard shortcut */}
        {isAdmin && (
          <Link href="/dashboard" style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "15px 18px", borderRadius: 16, textDecoration: "none",
            background: "rgba(224,163,59,0.06)", border: "1px solid rgba(224,163,59,0.3)",
            marginBottom: 14,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 11, flexShrink: 0,
              background: "rgba(224,163,59,0.12)", border: "1px solid rgba(224,163,59,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E0A33B" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#E0A33B",
                fontFamily: "var(--font-myanmar, system-ui)" }}>Admin Dashboard</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 1,
                fontFamily: "var(--font-myanmar, system-ui)" }}>
                အသုံးပြုသူ + မြေကွက် စီမံခန့်ခွဲ
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E0A33B66" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        )}

        {/* Viber Channel join card */}
        {process.env.NEXT_PUBLIC_VIBER_CHANNEL && (
          <a
            href={process.env.NEXT_PUBLIC_VIBER_CHANNEL}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "15px 18px", borderRadius: 16, textDecoration: "none",
              background: "rgba(102,92,172,0.07)", border: "1px solid rgba(102,92,172,0.3)",
              marginBottom: 14,
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 11, flexShrink: 0,
              background: "rgba(102,92,172,0.15)", border: "1px solid rgba(102,92,172,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 512 512" fill="#9B8FE0">
                <path d="M444 49.9C431.3 38.2 379.9.9 265.3.4c0 0-135.1-8.1-200.9 52.3C27.8 89.3 14.9 143 13.5 209.5c-1.4 66.5-3.1 191.1 116.9 225.5h.1l-.1 51.6s-.8 20.9 13 25.1c16.6 5.2 26.4-10.7 42.3-27.8 8.7-9.4 20.7-23.2 29.8-33.7 82.2 6.9 145.3-8.9 152.5-11.2 16.6-5.4 110.5-17.4 125.7-142.1 15.8-128.6-7.6-209.8-49.7-246.8zm-92 296.8c-4.9 12.1-24.8 22.9-34.4 24.4-8.7 1.3-19.7 1.8-31.9-1.8-7.4-2.1-16.8-4.8-28.9-9.4-51-19.8-84.3-71.1-86.8-74.5-2.5-3.4-20.7-27.6-20.7-52.6s13.1-38 17.8-42.4 10.2-6.3 13.6-6.3c3.4 0 6.8.1 9.8.2 3.2.1 7.4-1.2 11.5 8.7 4.3 10.2 14.6 35.6 15.8 37.9 1.2 2.3 2 5 .4 8.1-1.5 3.1-2.3 5-4.7 7.7-2.3 2.7-5 6-7.1 8.1-2.4 2.4-4.9 4.9-2.1 9.7 2.7 4.7 12.4 20.4 26.7 33.1 18.4 16.4 33.9 21.4 38.7 23.9 4.8 2.5 7.7 2.2 10.7-1.2 3-3.3 12.8-14.6 16.2-19.6 3.4-5 6.8-4.2 11.5-2.5 4.7 1.6 29.6 13.7 34.4 16.3 4.7 2.6 8 3.8 9.2 6 1.4 2.1 1.4 12.1-2.6 23.2z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#9B8FE0",
                fontFamily: "var(--font-myanmar, system-ui)" }}>Viber Channel ဝင်ရောက်မည်</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 1,
                fontFamily: "var(--font-myanmar, system-ui)" }}>
                မြေကွက် အသစ်များ အကြောင်းကြားချက် လက်ခံရမည်
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(155,143,224,0.5)" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </a>
        )}

        {/* Change password — only for credential (email/password) users */}
        {dbUser?.password && <ChangePasswordBtn />}

        {/* Sign out */}
        <SignOutBtn />
      </main>

      <nav>
        <Link href="/">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>
          </svg>
          <span className="mm">မြေကွက်</span>
        </Link>
        <Link href="/phone">
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
        <Link href="/user/profile" className="on">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
          </svg>
          <span className="mm">ကျွန်ုပ်</span>
        </Link>
      </nav>
    </div>
  );
}
