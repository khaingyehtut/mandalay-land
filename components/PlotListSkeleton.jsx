// Skeleton shown while PlotListSection streams in via Suspense
export default function PlotListSkeleton() {
  return (
    <div aria-busy="true" aria-label="လုပ်ဆောင်နေသည်...">
      <div className="sk-search" />
      <div className="sk-chips">
        {[80, 100, 70, 90].map((w, i) => (
          <div key={i} className="sk-chip" style={{ width: w }} />
        ))}
      </div>
      <div className="eyebrow" style={{ padding: "0 18px" }}>
        <div className="sk-line" style={{ width: 60 }} />
        <span className="ln" />
        <div className="sk-line" style={{ width: 80 }} />
      </div>
      <div style={{ padding: "0 18px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card" style={{ cursor: "default", pointerEvents: "none", marginBottom: 16 }}>
            <div className="sk-plan" />
            <div style={{ padding: "14px 15px 15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div className="sk-line" style={{ width: 120, height: 16, marginBottom: 6 }} />
                  <div className="sk-line" style={{ width: 80, height: 12 }} />
                </div>
                <div className="sk-line" style={{ width: 60, height: 24 }} />
              </div>
              <div className="sk-line" style={{ width: "60%", height: 12, marginBottom: 14 }} />
              <div className="sk-btn" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
