// ONE CENTRE'S OWN DASHBOARD
//
// The directory used to be a dead end. A row gave you a name, an address cut
// to one line, a phone icon and eight stock figures crushed into a single
// cell — and clicking it did nothing. Everything a person actually wants when
// they have found the right centre (is my group on the shelf, how much, who
// holds clinics here, how do I get there, who nearby still needs blood) had
// nowhere to live.
//
// So every row now opens this. It is the centre's dashboard: its shelf in
// full, its doctors, its position on the map, and the open requests in its
// own district that it could answer.

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BloodGroup from '../components/BloodGroup';
import StatusTag from '../components/StatusTag';
import ContactActions from '../components/ContactActions';
import PageLoader from '../components/PageLoader';
import { GROUPS } from '../lib/blood';

// Low is not a fixed number of bags — it depends what you are looking at. Ten
// units of a common group is thin; ten of AB- is a good day. Keeping one
// honest threshold and saying what it means beats inventing per-group rules
// the data cannot support.
const level = (n) => {
  if (n <= 0) return { tone: 'dead', label: 'None recorded' };
  if (n < 5) return { tone: 'bad', label: 'Very low' };
  if (n < 10) return { tone: 'warn', label: 'Low' };
  return { tone: 'good', label: 'Good stock' };
};

const mapsUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export default function HospitalDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    api.get(`/hospitals/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load this centre.'));
  }, [id]);

  if (error) {
    return (
      <div className="page">
        <p className="error-text">{error}</p>
        <Link to="/hospitals" className="tile-link">← Back to the directory</Link>
      </div>
    );
  }
  if (!data) return <PageLoader label="Loading the centre" />;

  const { hospital: h, doctors = [], nearbyRequests = [] } = data;
  const stock = h.availableBloodUnits || [];
  const byGroup = Object.fromEntries(stock.map((u) => [u.bloodGroup, u.units || 0]));
  const total = stock.reduce((a, u) => a + (u.units || 0), 0);
  const held = GROUPS.filter((g) => (byGroup[g] || 0) > 0);
  const callable = h.contactNumber && h.contactNumber !== 'N/A';
  const place = [h.name, h.address, h.district, h.state].filter(Boolean).join(', ');
  const isBank = h.type === 'blood_bank';

  return (
    <div className="page centre-page">
      {/* ------------------------------------------------------------ header */}
      <header className="centre-head">
        <div className="centre-id">
          <p className="app-eyebrow">{isBank ? 'Blood bank' : 'Hospital'}</p>
          <h1 className="page-h1">{h.name}</h1>
          <p className="centre-address">{h.address}</p>
          <p className="centre-where">
            {[h.district, h.state].filter(Boolean).join(' · ') || 'Location not recorded'}
          </p>
          <div className="centre-actions">
            <ContactActions
              name={h.name}
              address={place}
              phone={callable ? h.contactNumber : ''}
            />
            <a className="small-button" href={mapsUrl(place)} target="_blank" rel="noreferrer noopener">
              Open in Maps
            </a>
            {user && (
              <Link className="small-button ghost" to={`/appointments?hospitalId=${h._id}`}>
                Book an appointment
              </Link>
            )}
          </div>
          {!callable && (
            <p className="muted-note centre-nophone">
              No phone number is on file for this centre. The register does not
              carry one — ring the district blood bank, or use the map link.
            </p>
          )}
        </div>

        <div className="centre-stat-card">
          <span className="tile-label">Units on the shelf</span>
          <strong className="centre-total">{total}</strong>
          <StatusTag {...level(total)} />
          <p className="muted-note">
            {held.length
              ? `${held.length} of the 8 groups in stock`
              : 'Nothing recorded for any group'}
          </p>
          <p className="centre-caveat">
            Stock is what the centre last reported. Always ring before you travel.
          </p>
        </div>
      </header>

      {/* ------------------------------------------------------------- shelf */}
      <section className="centre-section">
        <div className="section-header"><h3>What is on the shelf</h3></div>
        <div className="centre-shelf">
          {GROUPS.map((g) => {
            const n = byGroup[g] || 0;
            const l = level(n);
            return (
              <div className={`shelf-cell tone-${l.tone}`} key={g}>
                <BloodGroup group={g} variant="badge" />
                <strong>{n}</strong>
                <small>{n === 1 ? 'unit' : 'units'}</small>
                <StatusTag tone={l.tone} label={l.label} size="sm" />
              </div>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------------- doctors */}
      <section className="centre-section">
        <div className="section-header">
          <h3>Doctors holding clinics here</h3>
          {user && doctors.length > 0 && (
            <Link className="tile-link" to={`/appointments?hospitalId=${h._id}`}>Book a slot →</Link>
          )}
        </div>

        {!user ? (
          <p className="hint">
            <Link to="/login">Sign in</Link> to see the doctors at this centre and book an appointment.
          </p>
        ) : doctors.length === 0 ? (
          <p className="hint">No doctors are listed against this centre yet.</p>
        ) : (
          <div className="centre-docs">
            {doctors.map((d) => (
              <article className="doc-card" key={d._id}>
                <div>
                  <strong>{d.name}</strong>
                  <small>{d.specialization}</small>
                </div>
                <p className="doc-days">
                  {(d.availableDays || []).length
                    ? (d.availableDays || []).join(', ')
                    : 'Days on request'}
                </p>
                <p className="doc-slots">
                  {(d.availableTimeSlots || []).slice(0, 4).map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                  {(d.availableTimeSlots || []).length > 4 && (
                    <span className="doc-more">+{(d.availableTimeSlots || []).length - 4} more</span>
                  )}
                </p>
                <Link className="small-button" to={`/appointments?hospitalId=${h._id}&doctorId=${d._id}`}>
                  Book with {d.name.split(' ').slice(-1)[0]}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* -------------------------------------------------- requests nearby */}
      {nearbyRequests.length > 0 && (
        <section className="centre-section">
          <div className="section-header">
            <h3>Open requests in this area</h3>
            <Link className="tile-link" to="/requests">All requests →</Link>
          </div>
          <p className="app-subtext">
            People in {h.district || h.city || 'this district'} who still need blood.
            If this centre holds their group, that is a phone call away from being solved.
          </p>
          <ul className="centre-reqs">
            {nearbyRequests.map((r) => {
              const have = byGroup[r.bloodGroupNeeded] || 0;
              return (
                <li key={r._id}>
                  <BloodGroup group={r.bloodGroupNeeded} className="req-mini-group" />
                  <span className="req-mini-body">
                    <strong>{r.unitsNeeded} {r.unitsNeeded === 1 ? 'unit' : 'units'} · {r.location}</strong>
                    <small>
                      {r.hospital ? `${r.hospital} · ` : ''}
                      {r.createdAt && new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </small>
                  </span>
                  <StatusTag
                    tone={have >= r.unitsNeeded ? 'good' : have > 0 ? 'warn' : 'dead'}
                    label={have >= r.unitsNeeded
                      ? 'This centre has enough'
                      : have > 0 ? `Only ${have} here` : 'Not held here'}
                    size="sm"
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="centre-foot">
        <Link to="/hospitals" className="tile-link">← Back to the directory</Link>
        <Link to="/availability" className="tile-link">Search availability across the network →</Link>
      </div>
    </div>
  );
}
