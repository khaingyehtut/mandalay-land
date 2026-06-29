export default function PlotPlan({ w, h }) {
  const ratio = w / h;
  const W = 200;
  const H = 200 / Math.max(ratio, 0.55);
  const pad = 26;
  const x = pad, y = pad, bw = W - pad * 2, bh = H - pad * 2;
  const gold = "#E0A33B", dim = "#6f6650";
  const corners = [[x, y], [x + bw, y], [x, y + bh], [x + bw, y + bh]];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
      <rect x={x} y={y} width={bw} height={bh} fill="rgba(224,163,59,.06)" stroke={gold} strokeWidth="1.6" />
      {corners.map(([cx, cy], i) => (
        <path key={i} d={`M${cx - 7} ${cy} H${cx + 7} M${cx} ${cy - 7} V${cy + 7}`} stroke={gold} strokeWidth="1.4" />
      ))}
      <path d={`M${x} ${y - 10} V${y} M${x + bw} ${y - 10} V${y}`} stroke={dim} strokeWidth="1" />
      <text x={x + bw / 2} y={y - 12} fill={gold} fontFamily="'Space Mono',monospace" fontSize="13" textAnchor="middle">{w}′</text>
      <path d={`M${x + bw + 10} ${y} H${x + bw} M${x + bw + 10} ${y + bh} H${x + bw}`} stroke={dim} strokeWidth="1" />
      <text x={x + bw + 16} y={y + bh / 2} fill={gold} fontFamily="'Space Mono',monospace" fontSize="13" textAnchor="middle" transform={`rotate(90 ${x + bw + 16} ${y + bh / 2})`}>{h}′</text>
      <path d={`M${x + bw / 2} ${y + bh / 2 - 9} l5 12 -5 -4 -5 4 z`} fill={gold} />
      <text x={x + bw / 2} y={y + bh / 2 + 20} fill={dim} fontFamily="'Space Mono',monospace" fontSize="9" textAnchor="middle">N</text>
    </svg>
  );
}
