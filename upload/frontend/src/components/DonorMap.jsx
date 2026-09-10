// LIVE DONOR MAP OF GUJARAT
// A stylised SVG map (no external map service, no API keys). City dots are
// sized by the REAL number of willing donors in each city, fetched from the
// same /donors endpoint the search page uses.

import { useEffect, useState } from 'react';
import api from '../api/axios';

const CITIES = {
  'ahmedabad': { name: 'Ahmedabad', x: 457.0, y: 195.5 },
  'surat': { name: 'Surat', x: 483.0, y: 387.9 },
  'vadodara': { name: 'Vadodara', x: 519.0, y: 269.4 },
  'rajkot': { name: 'Rajkot', x: 280.0, y: 270.4 },
  'bhavnagar': { name: 'Bhavnagar', x: 415.0, y: 326.6 },
  'jamnagar': { name: 'Jamnagar', x: 207.0, y: 252.7 },
  'gandhinagar': { name: 'Gandhinagar', x: 465.0, y: 174.7 },
  'junagadh': { name: 'Junagadh', x: 246.0, y: 351.5 },
  'anand': { name: 'Anand', x: 495.0, y: 243.4 },
  'nadiad': { name: 'Nadiad', x: 486.0, y: 229.8 },
  'navsari': { name: 'Navsari', x: 493.0, y: 410.8 },
  'bharuch': { name: 'Bharuch', x: 499.0, y: 332.8 },
  'vapi': { name: 'Vapi', x: 490.0, y: 471.1 },
  'valsad': { name: 'Valsad', x: 493.0, y: 446.2 },
  'mehsana': { name: 'Mehsana', x: 440.0, y: 135.2 },
  'palanpur': { name: 'Palanpur', x: 443.0, y: 75.9 },
  'godhra': { name: 'Godhra', x: 561.0, y: 220.5 },
  'porbandar': { name: 'Porbandar', x: 161.0, y: 339.0 },
  'morbi': { name: 'Morbi', x: 284.0, y: 216.3 },
  'surendranagar': { name: 'Surendranagar', x: 365.0, y: 225.7 },
  'amreli': { name: 'Amreli', x: 322.0, y: 343.2 },
  'bhuj': { name: 'Bhuj', x: 167.0, y: 172.6 },
  'gandhidham': { name: 'Gandhidham', x: 213.0, y: 189.3 },
  'veraval': { name: 'Veraval', x: 237.0, y: 416.0 },
  'patan': { name: 'Patan', x: 413.0, y: 109.2 }
};

const OUTLINE = '35.0,119.6 85.0,78.0 155.0,57.2 210.0,36.4 270.0,22.9 310.0,46.8 360.0,26.0 410.0,52.0 475.0,46.8 510.0,88.4 535.0,140.4 575.0,171.6 615.0,202.8 630.0,244.4 610.0,291.2 585.0,317.2 575.0,374.4 555.0,431.6 530.0,483.6 495.0,499.2 488.0,447.2 478.0,395.2 465.0,348.4 470.0,306.8 455.0,275.6 430.0,306.8 420.0,343.2 405.0,374.4 350.0,410.8 300.0,431.6 235.0,416.0 185.0,400.4 145.0,358.8 115.0,306.8 95.0,270.4 155.0,249.6 205.0,244.4 235.0,223.6 220.0,202.8 240.0,187.2 190.0,202.8 130.0,197.6 75.0,182.0 45.0,150.8';

export default function DonorMap() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    api.get('/donors').then((res) => {
      const c = {};
      for (const d of res.data) {
        const loc = (d.location || '').toLowerCase();
        for (const key of Object.keys(CITIES)) {
          if (loc.includes(key)) { c[key] = (c[key] || 0) + 1; break; }
        }
      }
      setCounts(c);
    }).catch(() => setCounts({}));
  }, []);

  if (!counts || Object.keys(counts).length === 0) return null;

  const entries = Object.entries(counts);
  const top = new Set(entries.sort((a, b) => b[1] - a[1]).slice(0, 6).map((e) => e[0]));
  const total = entries.reduce((a, [, n]) => a + n, 0);

  return (
    <>
      <div className="section-header">
        <h3>Live Donor Map</h3>
      </div>
      <p className="supply-caption">
        {total} willing donors across Gujarat, live from the database. Bigger glow = more donors in that city.
      </p>
      <div className="map-card">
        <svg viewBox="0 0 680 520" className="gujarat-map" role="img" aria-label="Map of donors across Gujarat">
          <polygon points={OUTLINE} className="map-outline" />
          {Object.entries(CITIES).map(([key, c]) => {
            const n = counts[key] || 0;
            if (n === 0) return null;
            const r = 4 + Math.min(14, Math.sqrt(n) * 2.6);
            return (
              <g key={key}>
                <circle cx={c.x} cy={c.y} r={r} className="map-dot">
                  <title>{c.name}: {n} donors</title>
                </circle>
                <circle cx={c.x} cy={c.y} r={r} className="map-ring" style={{ animationDelay: `${(c.x % 7) * 0.4}s` }} />
                {top.has(key) && (
                  <text x={c.x + r + 5} y={c.y + 4} className="map-label">
                    {c.name} · {n}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}
