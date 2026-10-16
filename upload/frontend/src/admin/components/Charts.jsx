// Hand-drawn SVG charts - no charting library, no extra bundle weight.
// Everything is sized with viewBox so it scales cleanly inside the cards.

export function BarChart({ data, maxLabel = '' }) {
  // data: [{ label, primary, secondary }]
  const max = Math.max(1, ...data.map((d) => Math.max(d.primary, d.secondary || 0)));

  return (
    <div className="adm-barchart">
      {data.map((d) => {
        const short = (d.secondary || 0) > d.primary;
        return (
          <div className="adm-bar-col" key={d.label}>
            <div className="adm-bar-track">
              {d.secondary > 0 && (
                <div className="adm-bar need" style={{ height: `${(d.secondary / max) * 100}%` }} title={`${d.secondary} open requests`} />
              )}
              <div className={`adm-bar main ${short ? 'short' : ''}`} style={{ height: `${(d.primary / max) * 100}%` }} title={`${d.primary} donors`} />
            </div>
            <span className="adm-bar-label">{d.label}</span>
            <span className="adm-bar-value">{d.primary}</span>
          </div>
        );
      })}
      {maxLabel && <span className="adm-bar-max">{maxLabel}</span>}
    </div>
  );
}

export function TrendChart({ points }) {
  // points: [{ date, count }]
  if (!points?.length) return null;
  const w = 560;
  const h = 150;
  const pad = 10;
  const max = Math.max(1, ...points.map((p) => p.count));
  const step = (w - pad * 2) / Math.max(1, points.length - 1);

  const coords = points.map((p, i) => [pad + i * step, h - pad - (p.count / max) * (h - pad * 2.4)]);
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${h - pad} L${coords[0][0].toFixed(1)},${h - pad} Z`;

  return (
    <div className="adm-trend">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="New registrations over the last 14 days">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--adm-accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--adm-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#trendFill)" />
        <path d={line} fill="none" stroke="var(--adm-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {coords.map(([x, y], i) => (
          <circle key={points[i].date} cx={x} cy={y} r="2.6" fill="var(--adm-accent)">
            <title>{points[i].date}: {points[i].count} new</title>
          </circle>
        ))}
      </svg>
      <div className="adm-trend-axis">
        <span>{points[0].date.slice(5)}</span>
        <span>{points[points.length - 1].date.slice(5)}</span>
      </div>
    </div>
  );
}

export function RankList({ items, unit = '' }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="adm-ranklist">
      {items.map((i) => (
        <li key={i.label}>
          <span className="adm-rank-label">{i.label}</span>
          <span className="adm-rank-track"><span className="adm-rank-fill" style={{ width: `${(i.count / max) * 100}%` }} /></span>
          <span className="adm-rank-value">{i.count}{unit}</span>
        </li>
      ))}
    </ul>
  );
}
