// DONOR LEADERBOARD - public recognition for repeat donors.
// Names are shortened to "First L." and only the city is shown; no phone
// number or email ever reaches this endpoint.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ city: '', bloodGroup: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/donations/leaderboard', { params: { ...filters, limit: 50 } })
      .then((res) => setData(res.data))
      .catch(() => setData({ entries: [], tiers: [], totals: {} }))
      .finally(() => setLoading(false));
  }, [filters]);

  const cities = useMemo(
    () => [...new Set((data?.entries || []).map((e) => e.city).filter(Boolean))].sort(),
    [data]
  );

  const podium = data?.entries?.slice(0, 3) || [];
  const rest = data?.entries?.slice(3) || [];

  return (
    <div className="page">
      <p className="app-eyebrow">Recognition</p>
      <h2 className="page-title">Donor leaderboard</h2>
      <p className="app-subtext">
        Every donation here is a verified record confirmed by a blood centre.
        Names are shortened — donors are recognised, never exposed.
      </p>

      {data?.totals && (
        <div className="board-totals">
          <div><strong>{data.totals.donations ?? 0}</strong><span>donations recorded</span></div>
          <div><strong>{data.totals.donors ?? 0}</strong><span>active donors</span></div>
          <div><strong>{data.totals.units ?? 0}</strong><span>units given</span></div>
          <div className="accent"><strong>{data.totals.livesTouched ?? 0}</strong><span>people potentially helped</span></div>
        </div>
      )}

      {podium.length === 3 && (
        <div className="podium">
          {[podium[1], podium[0], podium[2]].map((e, i) => {
            const place = [2, 1, 3][i];
            return (
              <div className={`podium-slot place-${place}`} key={e.rank}>
                <span className="podium-rank">{place}</span>
                <span className="podium-avatar" aria-hidden="true">{e.name.charAt(0)}</span>
                <strong>{e.name}</strong>
                <small>{e.city || '—'}</small>
                <span className="podium-count">{e.donations} donations</span>
                <span className={`tier-badge ${e.tier.toLowerCase()}`}>{e.tier}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="search-bar">
        <select value={filters.bloodGroup} onChange={(e) => setFilters((f) => ({ ...f, bloodGroup: e.target.value }))}>
          <option value="">All blood groups</option>
          {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={filters.city} onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}>
          <option value="">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading && <p className="hint">Loading the board…</p>}

      {rest.length > 0 && (
        <table className="data-table board-table">
          <thead>
            <tr><th>#</th><th>Donor</th><th>Group</th><th>City</th><th>Donations</th><th>Tier</th></tr>
          </thead>
          <tbody>
            {rest.map((e) => (
              <tr key={e.rank}>
                <td className="board-rank">{e.rank}</td>
                <td className="adm-strong">{e.name}</td>
                <td><span className="blood-badge">{e.bloodGroup}</span></td>
                <td>{e.city || '—'}</td>
                <td><strong>{e.donations}</strong></td>
                <td><span className={`tier-badge ${e.tier.toLowerCase()}`}>{e.tier}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && (data?.entries?.length ?? 0) === 0 && (
        <p className="hint">No donations recorded yet for that filter.</p>
      )}

      {data?.tiers?.length > 0 && (
        <>
          <div className="section-header"><h3>How tiers work</h3></div>
          <div className="tier-grid">
            {data.tiers.map((t) => (
              <div className="tier-card" key={t.label}>
                <span className={`tier-badge ${t.label.toLowerCase()}`}>{t.label}</span>
                <small>{t.note}</small>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="story-cta">
        <h3>Your donations count towards this board.</h3>
        <Link to="/my-donations" className="btn-primary">See my donation record</Link>
      </div>
    </div>
  );
}
