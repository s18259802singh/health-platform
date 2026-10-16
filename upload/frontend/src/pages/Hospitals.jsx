// Member-facing directory of hospitals and blood banks.
// Adding, editing and deleting locations is an administrator job and now lives
// entirely in the admin console at /admin/hospitals.

import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      api.get('/hospitals', { params: search ? { search } : {} })
        .then((res) => setHospitals(res.data))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const shown = useMemo(
    () => (type ? hospitals.filter((h) => h.type === type) : hospitals),
    [hospitals, type]
  );

  return (
    <div className="page">
      <h1 className="page-title page-h1">Hospitals &amp; Blood Banks</h1>
      <p className="app-subtext">Search the network, check stock and get directions.</p>

      <div className="search-bar">
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All locations</option>
          <option value="hospital">Hospitals</option>
          <option value="blood_bank">Blood banks</option>
        </select>
        <input
          placeholder="Search by name or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <p className="hint">Searching…</p>}

      <div className="place-grid">
        {shown.map((h) => {
          const units = (h.availableBloodUnits || []).filter((u) => u.units > 0);
          return (
            <article className="place-card" key={h._id}>
              <div className="place-head">
                <h3>{h.name}</h3>
                <span className={`place-type ${h.type}`}>
                  {h.type === 'blood_bank' ? 'Blood bank' : 'Hospital'}
                </span>
              </div>
              <p className="place-address">{h.address}</p>
              <p className="place-contact">
                <a href={`tel:${h.contactNumber}`}>{h.contactNumber}</a>
              </p>

              {units.length > 0 && (
                <div className="place-units">
                  {units.map((u) => (
                    <span key={u.bloodGroup}><strong>{u.bloodGroup}</strong> {u.units}</span>
                  ))}
                </div>
              )}

              <a
                className="small-button"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.address)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Directions →
              </a>
            </article>
          );
        })}
      </div>

      {!loading && shown.length === 0 && (
        <p className="hint">No locations match your search.</p>
      )}
    </div>
  );
}
