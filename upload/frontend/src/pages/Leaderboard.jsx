// DONOR LEADERBOARD - public recognition for repeat donors.
// Names are shortened to "First L." and only the city is shown; no phone
// number or email ever reaches this endpoint.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Pagination, { usePagination } from '../components/Pagination';
import { initials, avatarTint } from '../lib/people';
import BloodGroup from '../components/BloodGroup';
import DataTable from '../components/DataTable';
import Figure from '../components/Figure';
import SearchSelect from '../components/SearchSelect';

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
  const pager = usePagination(data?.entries?.slice(3) || [], 10);
  const rest = pager.slice;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="app-eyebrow">Recognition</p>
          <h1 className="page-h1">Donor leaderboard</h1>
          <p>
            Every donation here is a verified record confirmed by a blood centre.
            Names are shortened — donors are recognised, never exposed.
          </p>
        </div>
      </div>

      {data?.totals && (
        <div className="bento">
          <div className="tile slate t-3 center pad-sm">
            <span className="tile-label">Donations recorded</span>
            <strong className="tile-value sm"><Figure value={data.totals.donations} ready={!loading} /></strong>
          </div>
          <div className="tile sand t-3 center pad-sm">
            <span className="tile-label">Active donors</span>
            <strong className="tile-value sm"><Figure value={data.totals.donors} ready={!loading} /></strong>
          </div>
          <div className="tile mint t-3 center pad-sm">
            <span className="tile-label">Units given</span>
            <strong className="tile-value sm"><Figure value={data.totals.units} ready={!loading} /></strong>
          </div>
          <div className="tile red t-3 center pad-sm">
            <span className="tile-label">People helped</span>
            <strong className="tile-value sm"><Figure value={data.totals.livesTouched} ready={!loading} /></strong>
          </div>
        </div>
      )}

      {podium.length === 3 && (
        <div className="podium">
          {[podium[1], podium[0], podium[2]].map((e, i) => {
            const place = [2, 1, 3][i];
            return (
              // POINT 9: the icon comes first, then the name, and the rank
              // number sits at the foot of the card as a band. It used to be
              // a small circle floating above the avatar, where it read as
              // part of the picture rather than as the position.
              <div className={`podium-slot place-${place}`} key={e.rank}>
                <span className={`podium-avatar ${avatarTint(e.name)}`} aria-hidden="true">{initials(e.name)}</span>
                <strong className="podium-name">{e.name}</strong>
                <small>{e.city || '—'}</small>
                <BloodGroup group={e.bloodGroup} variant="pill" />
                <span className="podium-count">{e.donations} donations</span>
                <span className={`tier-badge ${e.tier.toLowerCase()}`}>{e.tier}</span>
                <span className="podium-rank">
                  <b>{place}</b>
                  <i>{place === 1 ? 'st' : place === 2 ? 'nd' : 'rd'}</i>
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="search-bar">
        <SearchSelect
          value={filters.bloodGroup}
          onChange={(e) => setFilters((f) => ({ ...f, bloodGroup: e.target.value }))}
          placeholder="All blood groups"
          options={[{ value: '', label: 'All blood groups' }, ...GROUPS.map((g) => ({ value: g, label: g }))]}
        />
        <SearchSelect
          value={filters.city}
          onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
          placeholder="All cities"
          searchPlaceholder="Search cities…"
          options={[{ value: '', label: 'All cities' }, ...cities.map((c) => ({ value: c, label: c }))]}
        />
      </div>

      <DataTable
        caption="donors"
        rows={rest}
        loading={loading}
        rowKey={(e) => e.rank}
        exportName="donor-leaderboard"
        initialSort={{ key: 'rank', dir: 'asc' }}
        defaultPerPage={25}
        searchKeys={['name', 'city']}
        searchPlaceholder="Search the board…"
        filters={[
          { key: 'tier', label: 'Tier', options: [...new Set(rest.map((e) => e.tier))] },
          { key: 'bloodGroup', label: 'Blood group', options: [...new Set(rest.map((e) => e.bloodGroup).filter(Boolean))].sort() },
          { key: 'city', label: 'City', options: [...new Set(rest.map((e) => e.city).filter(Boolean))].sort() },
        ]}
        empty={{ title: 'Nothing on the board yet', message: 'No donations are recorded for that filter.' }}
        columns={[
          { key: 'rank', header: '#', width: '70px', align: 'center',
            render: (e) => <span className="board-rank">{e.rank}</span> },
          { key: 'name', header: 'Donor', render: (e) => <strong>{e.name}</strong> },
          { key: 'bloodGroup', header: 'Group', width: '96px',
            render: (e) => <BloodGroup group={e.bloodGroup} variant="badge" /> },
          { key: 'city', header: 'City', width: '160px', render: (e) => e.city || '—' },
          { key: 'donations', header: 'Donations', defaultDir: 'desc', align: 'right', width: '110px',
            render: (e) => <strong>{e.donations}</strong> },
          { key: 'tier', header: 'Tier', width: '120px',
            render: (e) => <span className={`tier-badge ${e.tier.toLowerCase()}`}>{e.tier}</span> },
        ]}
      />

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
