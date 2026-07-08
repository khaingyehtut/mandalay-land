import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/siteSettings";
import AgentCards from "./AgentCards";

export const dynamic = "force-dynamic";

const ViberSVG = () => (
  <svg width="17" height="17" viewBox="0 0 512 512" fill="currentColor">
    <path d="M444 49.9C431.3 38.2 379.9.9 265.3.4c0 0-135.1-8.1-200.9 52.3C27.8 89.3 14.9 143 13.5 209.5c-1.4 66.5-3.1 191.1 116.9 225.5h.1l-.1 51.6s-.8 20.9 13 25.1c16.6 5.2 26.4-10.7 42.3-27.8 8.7-9.4 20.7-23.2 29.8-33.7 82.2 6.9 145.3-8.9 152.5-11.2 16.6-5.4 110.5-17.4 125.7-142.1 15.8-128.6-7.6-209.8-49.7-246.8zm-92 296.8c-4.9 12.1-24.8 22.9-34.4 24.4-8.7 1.3-19.7 1.8-31.9-1.8-7.4-2.1-16.8-4.8-28.9-9.4-51-19.8-84.3-71.1-86.8-74.5-2.5-3.4-20.7-27.6-20.7-52.6s13.1-38 17.8-42.4 10.2-6.3 13.6-6.3c3.4 0 6.8.1 9.8.2 3.2.1 7.4-1.2 11.5 8.7 4.3 10.2 14.6 35.6 15.8 37.9 1.2 2.3 2 5 .4 8.1-1.5 3.1-2.3 5-4.7 7.7-2.3 2.7-5 6-7.1 8.1-2.4 2.4-4.9 4.9-2.1 9.7 2.7 4.7 12.4 20.4 26.7 33.1 18.4 16.4 33.9 21.4 38.7 23.9 4.8 2.5 7.7 2.2 10.7-1.2 3-3.3 12.8-14.6 16.2-19.6 3.4-5 6.8-4.2 11.5-2.5 4.7 1.6 29.6 13.7 34.4 16.3 4.7 2.6 8 3.8 9.2 6 1.4 2.1 1.4 12.1-2.6 23.2z" />
  </svg>
);

async function getAgents() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "agents" } });
    return row ? JSON.parse(row.value) : [];
  } catch {
    return [];
  }
}

export default async function Profile() {
  let total = 0,
    available = 0,
    sold = 0;
  try {
    total = await prisma.plot.count();
    available = await prisma.plot.count({ where: { status: "available" } });
    sold = total - available;
  } catch {}

  const [settings, agents] = await Promise.all([
    getSiteSettings(),
    getAgents(),
  ]);

  const {
    phone,
    agentName: name,
    agentTitle: title,
    agentPhoto: photo,
  } = settings;
  const tel = "tel:" + phone.replace(/[^0-9+]/g, "");
  const viber =
    "viber://chat?number=%2B95" +
    phone.replace(/^0/, "").replace(/[^0-9]/g, "");
  const initials = name.replace(/[^က-႟᪐-᪙a-zA-Z]/g, "").slice(0, 1) || "M";

  return (
    <div className="app">
      <header>
        <div className="brandrow">
          <a className="brand" href="/">
            <span className="seal" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path d="M3 21V8l9-5 9 5v13" />
                <path d="M3 12h18M9 21V12h6v9" />
              </svg>
            </span>
            <div>
              <b>Mandalay Land</b>
              <small className="mm">
                ကိုအောင် အိမ်ခြံမြေ နှင့် ဆောက်လုပ်ရေး
              </small>
            </div>
          </a>
          <span className="loc mm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            မန္တလေး
          </span>
        </div>
      </header>

      <main style={{ padding: "24px 18px 10px" }}>
        {/* Hero card */}
        <div className="prof-hero">
          <div className="prof-bg-ring" />
          <div className="prof-avatar">
            {photo ? (
              <img src={photo} alt={name} />
            ) : (
              <span className="prof-initial mm">{initials}</span>
            )}
          </div>
          <h2 className="prof-name mm">{name}</h2>
          <p className="prof-title">{title} · မန္တလေး</p>
          <div className="prof-verified">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              style={{ width: 12, height: 12 }}
            >
              <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
            </svg>
            အတည်ပြုထားသော အကျိုးဆောင်
          </div>
        </div>

        {/* Stats */}
        <div className="prof-stats">
          <div className="pstat">
            <b className="mono">{total}</b>
            <small className="mm">စုစုပေါင်း</small>
          </div>
          <div className="pstat-div" />
          <div className="pstat">
            <b className="mono" style={{ color: "#5ec97a" }}>
              {available}
            </b>
            <small className="mm">ရောင်းရန်ရှိ</small>
          </div>
          <div className="pstat-div" />
          <div className="pstat">
            <b className="mono" style={{ color: "#e7563f" }}>
              {sold}
            </b>
            <small className="mm">ရောင်းပြီး</small>
          </div>
        </div>

        {/* Info rows */}
        <div className="prof-info">
          <div className="pinfo-row">
            <span className="pinfo-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
              </svg>
            </span>
            <div>
              <small>ဖုန်းနံပါတ်</small>
              <b>{phone}</b>
            </div>
          </div>
          <div className="pinfo-row">
            <span className="pinfo-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </span>
            <div>
              <small>တည်နေရာ</small>
              <b className="mm">မန္တလေးမြို့</b>
            </div>
          </div>
          <div className="pinfo-row">
            <span className="pinfo-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
              </svg>
            </span>
            <div>
              <small>အထူးပြု</small>
              <b className="mm">မြေကွက် ရောင်းဝယ်ရေး</b>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: 800,
            color: "#ECE6D9",
            letterSpacing: "0.05em",
            marginBottom: 14,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {phone}
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <a href={tel} className="call mm" style={{ flex: 1, margin: 0 }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: 18, height: 18 }}
            >
              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
            </svg>
            ဖုန်းခေါ်မည်
          </a>
          <a
            href={viber}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              padding: "13px 0",
              borderRadius: 14,
              textDecoration: "none",
              background: "rgba(102,92,172,0.1)",
              border: "1px solid rgba(102,92,172,0.35)",
              color: "#9B8FE0",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "var(--font-myanmar, system-ui)",
            }}
          >
            <ViberSVG /> Viber
          </a>
        </div>
        <a
          href="/"
          className="btn alt mm"
          style={{
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: 16, height: 16 }}
          >
            <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
          </svg>
          မြေကွက်များ ကြည့်မယ်
        </a>

        {/* Dynamic agent cards */}
        <AgentCards initialAgents={agents} />
      </main>

    </div>
  );
}
