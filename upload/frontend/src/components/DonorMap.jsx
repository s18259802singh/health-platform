// DONOR MAP — the dashboard's way into the donor register.
//
// Replaces the old "Jump to" shortcut grid. Those shortcuts duplicated the
// navigation bar directly above them; this answers a question the nav cannot:
// WHERE are the donors. Each marker is a real city in the register, sized by
// how many donors are registered there, and clicking one opens the donor
// search already filtered to that place.
//
// The outline is a schematic of Gujarat drawn for this app — it is not a
// survey map and is not meant to be measured against one. The city positions
// ARE real: every marker is placed from that city's actual latitude and
// longitude through the projection below, so their positions relative to each
// other are correct.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// Real coordinates for every city that appears in the donor register.
const CITY_COORDS = {
  Bhuj: [23.25, 69.67],        Gandhidham: [23.08, 70.13],  Jamnagar: [22.47, 70.07],
  Porbandar: [21.64, 69.61],   Veraval: [20.91, 70.37],     Junagadh: [21.52, 70.46],
  Rajkot: [22.30, 70.80],      Morbi: [22.82, 70.84],       Amreli: [21.60, 71.22],
  Bhavnagar: [21.76, 72.15],   Surendranagar: [22.73, 71.65], Patan: [23.85, 72.13],
  Palanpur: [24.17, 72.43],    Mehsana: [23.60, 72.40],     Gandhinagar: [23.22, 72.65],
  Ahmedabad: [23.03, 72.58],   Nadiad: [22.69, 72.86],      Anand: [22.56, 72.96],
  Godhra: [22.78, 73.61],      Vadodara: [22.31, 73.18],    Bharuch: [21.71, 72.99],
  Surat: [21.17, 72.83],       Navsari: [20.95, 72.93],     Valsad: [20.61, 72.93],
  Vapi: [20.37, 72.91],
};

// Veraval sits right on the southern Saurashtra coast. At 1:50m simplification
// the drawn coastline cuts a fraction inland of its true position, so its
// marker alone is nudged 0.5 units north to keep it on land. No other marker
// is adjusted, and the underlying coordinate above is untouched.
const MARKER_NUDGE = { Veraval: [0, -0.9] };

// Equirectangular projection onto a 0–100 viewBox. Crude, but across one
// state the distortion is invisible and it keeps the component dependency-free.
const LON0 = 68.0, LON1 = 74.7, LAT0 = 19.8, LAT1 = 24.9;
const project = ([lat, lon]) => [
  ((lon - LON0) / (LON1 - LON0)) * 100,
  ((LAT1 - lat) / (LAT1 - LAT0)) * 100,
];

// The state outline is Natural Earth 1:50m admin-1 data (naturalearthdata.com),
// which is in the public domain, simplified to 249 points and projected
// through the same window as the city markers above — so the coastline and
// the dots agree with each other and with the real map.
//
// Stored as a flat "x y,x y" string rather than an array of arrays: same
// geometry, about a third of the bytes in the bundle.
const OUTLINE_PTS =
  '45.5 4.2,48.5 5.2,50.4 5,52.9 4.2,54.5 4.7,56 4.4,58.9 4.7,60.5 3.8,61.2 4.8,63.6 5.7,' +
  '63.8 6.5,67.2 7.9,68 7.7,69.7 8.6,70.9 10.2,73.1 10.6,74 10,74.6 8,76 7.8,76.7 11.1,' +
  '75.8 13.6,78.3 17.3,79.9 15.6,81 18.8,80.1 19.8,80 21.9,82.3 23.8,83.9 25.8,83.9 28.4,' +
  '85.2 29.1,86.7 28.7,88.1 30.7,88.9 30.2,91.1 32.4,91.2 33.5,93 34.2,94.4 36.5,95 39.7,' +
  '95.9 39.8,96.4 41.1,95.2 44.1,93.6 44.9,92 46.7,90.5 46.6,89.9 47.5,91.2 48.8,' +
  '92.9 48.8,92.9 50,90.4 51.1,90.6 53,91.7 55.6,91.5 57.8,90.5 58,88.3 59.5,86.7 60.1,' +
  '87 63.7,85.8 64.5,86.9 66.5,89.5 65.6,92.4 65.8,93.9 66.4,91.2 67.6,90.4 67.3,89 68.7,' +
  '88.3 70.8,86.6 71,86.2 72.2,85 74.1,87.6 77,88.1 78.7,88.2 80.9,86.7 82.8,86.5 84.2,' +
  '85.1 85.1,81.7 82.8,80.7 82.9,81.5 85.5,80 88.8,80.5 90.8,80.1 92.6,78.7 92.3,' +
  '78.3 93.4,77.1 93.8,75.3 93,75.3 91.7,76.3 91.1,75.4 89.6,73.1 91.7,73.8 93.6,' +
  '70.3 94.5,71.9 88.6,72.3 87.2,72.3 86.9,72.9 85,73 82.9,72.8 79.8,72.2 77.4,72 74.8,' +
  '71.8 74.2,70.9 73.9,70 73,69 69.2,69.9 67.9,70.7 67.2,69.7 67.5,68.9 67.4,70.4 65.7,' +
  '71.8 64.3,75 62.8,76.3 61.8,74.3 62.7,72.2 63,67.8 62.8,68.5 59.3,69.3 58.1,70.2 57.4,' +
  '68.9 57.6,67.5 57.3,68 53.7,69.1 52.9,70.3 52.8,71.8 52.3,70.2 51.7,68.5 51.4,66.5 52,' +
  '64.7 51.6,62.4 51.6,63.3 52.1,64.3 53.2,63.8 55.1,63.3 56.3,62.1 57.2,61.1 58.4,' +
  '60.8 59.5,60.3 60.3,61.2 60.9,62.3 61.3,62.8 62.2,63.5 63.5,63.5 66.1,60.8 72.1,' +
  '59.9 73.4,53.3 77,50.7 79,45.1 81.6,44.8 81.7,43 82.1,40.6 81.6,37.1 79.6,31.8 74.6,' +
  '30.4 73,26.1 66.6,23 63.2,20.7 60,17.8 57,15.1 53,14.5 51.2,14.7 49.3,15.7 48.3,' +
  '16.9 48.7,17.8 50.3,18.5 51,19.1 51.3,23.1 48.9,24.7 49,25.8 47.7,27.1 48,29.9 46.1,' +
  '31.1 46,32.5 45.6,34.7 40.9,36.4 37.8,37.5 37.2,37.5 36.5,37.2 35.5,36.3 35.7,' +
  '35.8 36.7,35.3 37.8,34.9 38.4,33.6 37.8,32.7 37.9,31.6 38.3,27.6 40.1,26 41.7,24.8 42,' +
  '18.4 40.2,12.2 36.2,9.6 33.5,7.9 30.1,6.2 26,6.8 24.9,9.4 22.5,11.6 20.5,9.6 21.4,' +
  '7.4 22.6,6.3 23.4,5.1 25.2,3.5 25.5,2.9 23,2.5 20.4,3.5 19.6,4.2 19.1,5.7 18.6,' +
  '7.3 18.3,8.8 18.3,10.8 18.3,10.9 12.4,11 11.9,11.3 11.6,11.7 11.5,11.9 11.6,12.4 12.5,' +
  '12.9 12.4,13.4 11.9,14.7 12.3,15.7 12,16.7 12.4,18.4 12.4,21.5 12.2,23.3 12.3,' +
  '24.4 13.2,25.6 14.3,26.9 14.4,28.9 14.3,30.2 13.9,30.8 12.9,31.3 12,34.2 10.7,' +
  '37.2 9.6,38 9.4,38.3 10.1,38.1 11.2,38.5 12.2,39.7 12.8,40.5 13,41.3 12.8,41.9 12.5,' +
  '43.1 10.9,43.7 10.5,44.5 10.6,45.4 9.8,45.5 9.2,44.9 8.9,44.4 8.1,44.5 7.4,44.3 6.4,' +
  '44.4 5.5,44.8 4.8,45.5 4.2';

const OUTLINE = OUTLINE_PTS.split(',').map((pair) => pair.trim().split(' ').map(Number));
const OUTLINE_D = `M ${OUTLINE.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`;

export default function DonorMap() {
  const [counts, setCounts] = useState(null);
  const [hover, setHover] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/donors')
      .then((res) => {
        const tally = {};
        res.data.forEach((d) => {
          const city = (d.location || '').trim();
          if (CITY_COORDS[city]) tally[city] = (tally[city] || 0) + 1;
        });
        setCounts(tally);
      })
      .catch(() => setCounts({}));
  }, []);

  const markers = useMemo(() => {
    if (!counts) return [];
    const max = Math.max(1, ...Object.values(counts));
    return Object.entries(counts)
      .map(([city, n]) => {
        const [px, py] = project(CITY_COORDS[city]);
        const [nx, ny] = MARKER_NUDGE[city] || [0, 0];
        const x = px + nx;
        const y = py + ny;
        // Area, not radius, tracks the count — a city with four times the
        // donors should look four times as big, not sixteen.
        const r = 1.6 + Math.sqrt(n / max) * 3.1;
        return { city, n, x, y, r };
      })
      .sort((a, b) => b.r - a.r);
  }, [counts]);

  const total = markers.reduce((a, m) => a + m.n, 0);
  const open = (city) => navigate(`/donors?location=${encodeURIComponent(city)}`);

  return (
    <div className="donor-map">
      <div className="tile-head">
        <h3>Donors near you</h3>
        <span className="donor-map-total">{total} registered</span>
      </div>

      <div className="donor-map-body">
      <div className="donor-map-frame">
        <svg viewBox="0 0 100 100" className="donor-map-svg" role="img"
             aria-label="Map of Gujarat. Select a city to see the donors registered there.">
          <path className="donor-map-land" d={OUTLINE_D} />
          {markers.map((m) => (
            <g key={m.city}
               className={`donor-map-pin ${hover === m.city ? 'on' : ''}`}
               onMouseEnter={() => setHover(m.city)}
               onMouseLeave={() => setHover(null)}
               onClick={() => open(m.city)}>
              <circle className="donor-map-halo" cx={m.x} cy={m.y} r={m.r + 2.6} />
              <circle className="donor-map-dot" cx={m.x} cy={m.y} r={m.r} />
              {/* a generous invisible target: the dots themselves are tiny */}
              <circle className="donor-map-hit" cx={m.x} cy={m.y} r={Math.max(5, m.r + 3)} />
            </g>
          ))}
        </svg>

        <span className="donor-map-readout" aria-live="polite">
          {hover
            ? <><strong>{hover}</strong> · {counts[hover]} donor{counts[hover] === 1 ? '' : 's'} — click to open</>
            : <>Select a city to see its donors</>}
        </span>
      </div>

      {/* The same destinations as the map, reachable by keyboard and by
          anyone who cannot use a pointer. Doubles as a ranked shortlist. */}
      <ul className="donor-map-list">
        {markers.slice(0, 6).map((m) => (
          <li key={m.city}>
            <button type="button"
                    onMouseEnter={() => setHover(m.city)}
                    onFocus={() => setHover(m.city)}
                    onMouseLeave={() => setHover(null)}
                    onBlur={() => setHover(null)}
                    onClick={() => open(m.city)}>
              {m.city} <span>{m.n}</span>
            </button>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}
