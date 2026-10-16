// Upcoming blood donation camps. Public to browse; registering needs an account.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { LoadMore, useLoadMore } from '../components/Pagination';
import SearchSelect from '../components/SearchSelect';

const dayLabel = (iso) => {
  const d = new Date(`${iso}T00:00:00`);
  return {
    day: d.toLocaleDateString('en-GB', { day: '2-digit' }),
    month: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    weekday: d.toLocaleDateString('en-GB', { weekday: 'long' }),
    full: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
};

export default function Camps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [when, setWhen] = useState('upcoming');

  useEffect(() => {
    setLoading(true);
    api.get('/camps', { params: when === 'upcoming' ? { upcoming: 'true' } : {} })
      .then((res) => setCamps(res.data))
      .finally(() => setLoading(false));
  }, [when]);

  const cities = useMemo(
    () => [...new Set(camps.map((c) => c.city).filter(Boolean))].sort(),
    [camps]
  );
  const filtered = city ? camps.filter((c) => c.city === city) : camps;
  // Card grids feel better revealing in batches than jumping between pages.
  const batch = useLoadMore(filtered, 6);
  const shown = batch.slice;

  const totalSlots = filtered.reduce((a, c) => a + (c.slots || 0), 0);
  const taken = filtered.reduce((a, c) => a + (c.registrations?.length || 0), 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="app-eyebrow">Donation camps</p>
          <h1 className="page-h1">Find a camp near you</h1>
          <p>
            Organised drives run by blood centres, clubs and campuses. Registering
            ahead guarantees your slot and cuts the queue.
          </p>
        </div>
      </div>

      <div className="stat-strip">
        <div className="stat-chip accent"><strong>{filtered.length}</strong><span>camps listed</span></div>
        <div className="stat-chip"><strong>{Math.max(0, totalSlots - taken)}</strong><span>slots still open</span></div>
        <div className="stat-chip"><strong>{taken}</strong><span>donors registered</span></div>
        <div className="stat-chip"><strong>{cities.length}</strong><span>cities covered</span></div>
      </div>

      <div className="search-bar">
        <SearchSelect
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          options={[
            { value: 'upcoming', label: 'Upcoming camps' },
            { value: 'all', label: 'All camps, including past' },
          ]}
        />
        <SearchSelect
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="All cities"
          searchPlaceholder="Search cities…"
          options={[{ value: '', label: 'All cities' }, ...cities.map((c) => ({ value: c, label: c }))]}
        />
      </div>

      {loading && <p className="hint">Loading camps…</p>}

      <div className="camp-list">
        {shown.map((c) => {
          const d = dayLabel(c.date);
          const taken = c.registrations?.length || 0;
          const left = Math.max(0, (c.slots || 0) - taken);
          const pct = c.slots ? Math.min(100, Math.round((taken / c.slots) * 100)) : 0;

          return (
            <article className={`camp-card ${c.status !== 'upcoming' ? 'past' : ''}`} key={c._id}>
              <div className="camp-date" aria-hidden="true">
                <strong>{d.day}</strong>
                <span>{d.month}</span>
              </div>

              <div className="camp-body">
                <div className="camp-title-row">
                  <h3><Link to={`/camps/${c._id}`}>{c.title}</Link></h3>
                  {c.status === 'upcoming'
                    ? <span className={`camp-pill ${left === 0 ? 'full' : left < 20 ? 'low' : ''}`}>
                        {left === 0 ? 'Fully booked' : `${left} slots left`}
                      </span>
                    : <span className="camp-pill done">{c.status === 'completed' ? 'Completed' : 'Cancelled'}</span>}
                </div>

                <p className="camp-meta">
                  {d.weekday} · {c.startTime} – {c.endTime} · {c.venue}, {c.city}
                </p>
                <p className="camp-org">Organised by {c.organiser}</p>

                {c.status === 'upcoming' && (
                  <div className="camp-progress" title={`${taken} of ${c.slots} slots taken`}>
                    <span style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>

              <Link to={`/camps/${c._id}`} className="small-button camp-cta">
                {c.status === 'upcoming' ? 'View & register' : 'View details'}
              </Link>
            </article>
          );
        })}
      </div>

      <LoadMore shown={batch.shown} total={batch.total} hasMore={batch.hasMore} onMore={batch.more} label="camps" />

      {!loading && filtered.length === 0 && (
        <p className="hint">No camps listed for that filter yet. Try switching to all camps.</p>
      )}
    </div>
  );
}
