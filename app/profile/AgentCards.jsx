"use client";

const VIBER_SVG = (
  <svg width="17" height="17" viewBox="0 0 512 512" fill="currentColor">
    <path d="M444 49.9C431.3 38.2 379.9.9 265.3.4c0 0-135.1-8.1-200.9 52.3C27.8 89.3 14.9 143 13.5 209.5c-1.4 66.5-3.1 191.1 116.9 225.5h.1l-.1 51.6s-.8 20.9 13 25.1c16.6 5.2 26.4-10.7 42.3-27.8 8.7-9.4 20.7-23.2 29.8-33.7 82.2 6.9 145.3-8.9 152.5-11.2 16.6-5.4 110.5-17.4 125.7-142.1 15.8-128.6-7.6-209.8-49.7-246.8zm-92 296.8c-4.9 12.1-24.8 22.9-34.4 24.4-8.7 1.3-19.7 1.8-31.9-1.8-7.4-2.1-16.8-4.8-28.9-9.4-51-19.8-84.3-71.1-86.8-74.5-2.5-3.4-20.7-27.6-20.7-52.6s13.1-38 17.8-42.4 10.2-6.3 13.6-6.3c3.4 0 6.8.1 9.8.2 3.2.1 7.4-1.2 11.5 8.7 4.3 10.2 14.6 35.6 15.8 37.9 1.2 2.3 2 5 .4 8.1-1.5 3.1-2.3 5-4.7 7.7-2.3 2.7-5 6-7.1 8.1-2.4 2.4-4.9 4.9-2.1 9.7 2.7 4.7 12.4 20.4 26.7 33.1 18.4 16.4 33.9 21.4 38.7 23.9 4.8 2.5 7.7 2.2 10.7-1.2 3-3.3 12.8-14.6 16.2-19.6 3.4-5 6.8-4.2 11.5-2.5 4.7 1.6 29.6 13.7 34.4 16.3 4.7 2.6 8 3.8 9.2 6 1.4 2.1 1.4 12.1-2.6 23.2z" />
  </svg>
);

function AgentCard({ agent }) {
  const tel = agent.phone ? "tel:" + agent.phone.replace(/[^0-9+]/g, "") : null;
  const viber = agent.phone
    ? "viber://chat?number=%2B95" +
      agent.phone.replace(/^0/, "").replace(/[^0-9]/g, "")
    : null;
  const init = agent.name.replace(/[^က-႟᪐-᪙a-zA-Z]/g, "").slice(0, 1) || "M";

  return (
    <div
      style={{
        marginTop: 16,
        background: "linear-gradient(145deg,#13151A,#191C25)",
        border: "1px solid #1E2232",
        borderRadius: 24,
        padding: "24px 20px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: 1,
          background:
            "linear-gradient(90deg,transparent,rgba(224,163,59,0.4),transparent)",
        }}
      />

      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#E0A33B,#F4B94288)",
            padding: 3,
            boxShadow: "0 6px 20px rgba(224,163,59,0.2)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "#191C25",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {agent.photo ? (
              <img
                src={agent.photo}
                alt={agent.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#E0A33B",
                  fontFamily: "var(--font-myanmar, system-ui)",
                }}
              >
                {init}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          fontSize: 18,
          fontWeight: 800,
          color: "#ECE6D9",
          marginBottom: 2,
          fontFamily: "var(--font-myanmar, system-ui)",
        }}
      >
        {agent.name}
      </div>
      {agent.title && (
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#6B7280",
            marginBottom: 14,
            fontFamily: "var(--font-myanmar, system-ui)",
          }}
        >
          {agent.title}
        </div>
      )}

      {tel && (
        <>
          <div
            style={{
              textAlign: "center",
              fontSize: 18,
              fontWeight: 800,
              color: "#ECE6D9",
              letterSpacing: "0.05em",
              marginBottom: 12,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {agent.phone}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a
              href={tel}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: "13px 0",
                borderRadius: 14,
                textDecoration: "none",
                background: "linear-gradient(135deg,#E0A33B,#F4B942)",
                color: "#1A1206",
                fontSize: 14,
                fontWeight: 800,
                fontFamily: "var(--font-myanmar, system-ui)",
                boxShadow: "0 4px 14px rgba(224,163,59,0.25)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
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
              {VIBER_SVG} Viber
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export default function AgentCards({ initialAgents }) {
  return initialAgents.map((a) => <AgentCard key={a.id} agent={a} />);
}
