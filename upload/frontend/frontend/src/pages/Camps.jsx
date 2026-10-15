// Upcoming blood donation camps. Public to browse; registering needs an account.

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

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
  const shown = city ? camps.filter((c) => c.city === city) : camps;

  return (
    <div className="page">
      <p className="app-eyebrow">Donation camps</p>
      <h2 className="page-title">Find a camp near you</h2>
      <p className="app-subtext">
        Organised drives run by blood centres, clubs and campuses. Registering ahead
        guarantees your slot and cuts the queue.
      </p>

      <div className="search-bar">
        <select value={when} onChange={(e) => setWhen(e.target.value)}>
          <option value="upcoming">Upcoming camps</option>
          <option value="all">All camps, including past</option>
        </select>
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
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

      {!loading && shown.length === 0 && (
        <p className="hint">No camps listed for that filter yet. Try switching to all camps.</p>
      )}
    </div>
  );
}
