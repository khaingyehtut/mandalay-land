import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

const Phone = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ width: 18, height: 18 }}
  >
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  </svg>
);

export default async function Profile() {
  let total = 0, available = 0, sold = 0;
  try {
    total     = await prisma.plot.count();
    available = await prisma.plot.count({ where: { status: "available" } });
    sold      = total - available;
  } catch (e) {}

  const { phone, agentName: name, agentTitle: title, agentPhoto: photo } = await getSiteSettings();
  const tel = "tel:" + phone.replace(/[^0-9+]/g, "");
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
              <b className="mm">မန္တလေး မြေကွက်</b>
              <small>Land Survey · MDY</small>
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
          <p className="prof-title">{title} · Mandalay</p>
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
            Verified Agent
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
        <a href={tel} className="call mm" style={{ marginBottom: 10 }}>
          <Phone /> ဖုန်းတိုက်ရိုက်ခေါ်မယ်
        </a>
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
      </main>

      <nav>
        <a href="/">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
          </svg>
          <span className="mm">မြေကွက်</span>
        </a>
        <a href={tel}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
          </svg>
          <span className="mm">ဖုန်း</span>
        </a>
        <a href="/" className="post" aria-label="မြေကွက်">
          <span className="pc">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </a>
        <a href="/admin">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
          </svg>
          <span className="mm">စီမံ</span>
        </a>
        <a href="/profile" className="on">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
          </svg>
          <span className="mm">ကျွန်ုပ်</span>
        </a>
      </nav>
    </div>
  );
}
