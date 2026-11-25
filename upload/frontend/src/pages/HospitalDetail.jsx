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
import { COMPONENTS, componentOf, stockTable, unitsOf as unitsIn, byComponent } from '../lib/components';

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
  // '' is every component added together, which is what the shelf summary
  // showed before components existed.
  const [comp, setComp] = useState('');

  // WHY THIS LOADS TWO DIFFERENT WAYS
  //
  // The quick way is GET /api/hospitals/:id, which returns the centre, its
  // doctors and the open requests nearby in one call.
  //
  // But the frontend and the backend deploy separately - Vercel rebuilds in a
  // minute, Render takes several, and either can be updated without the
  // other. For the window in between, this page would be a dead end showing
  // "Could not load this centre", which is exactly what it did.
  //
  // So if that endpoint is not there, it rebuilds the same page from the
  // endpoints that have always existed. Everything it needs is already
  // published somewhere: the centre itself from the availability search
  // (public) or the directory (members), the doctors from /doctors, and the
  // open requests from /donation-requests. Slower by a request or two, and
  // completely invisible to the reader.
  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError('');

    const sameArea = (place, centre) => {
      const area = [centre.district, centre.city].filter(Boolean)
        .map((a) => String(a).trim().toLowerCase());
      return area.includes(String(place || '').trim().toLowerCase());
    };

    // Stock arrives as availableBloodUnits from the directory and as
    // breakdown from the availability search. One shape from here on.
    const normalise = (c) => ({
      ...c,
      availableBloodUnits: c.availableBloodUnits || c.breakdown || [],
    });

    const viaOlderApi = async () => {
      // The centre. The availability search is public and carries every
      // centre with its stock, so it works signed out too.
      let centre = null;
      try {
        const { data: list } = await api.get('/availability');
        centre = (list.results || []).find((c) => String(c._id) === String(id)) || null;
      } catch { /* fall through to the members' directory */ }

      if (!centre) {
        const { data: list } = await api.get('/hospitals');
        centre = (list || []).find((c) => String(c._id) === String(id)) || null;
      }
      if (!centre) {
        const err = new Error('not found');
        err.notFound = true;
        throw err;
      }

      // The extras are a bonus: if either call fails, the page still has the
      // centre, which is the part that matters.
      const [doctors, nearbyRequests] = await Promise.all([
        api.get('/doctors', { params: { hospitalId: id } })
          .then((r) => r.data).catch(() => []),
        api.get('/donation-requests', { params: { status: 'pending' } })
          .then((r) => (r.data || []).filter((x) => sameArea(x.location, centre)).slice(0, 6))
          .catch(() => []),
      ]);

      return { hospital: normalise(centre), doctors, nearbyRequests };
    };

    api.get(`/hospitals/${id}`)
      .then((res) => ({ ...res.data, hospital: normalise(res.data.hospital) }))
      .catch((err) => {
        // A 404 carrying our own message really is a missing centre. A 404
        // with no message is Express saying the route does not exist, which
        // means the backend is simply older than this page.
        if (err.response?.data?.message) {
          const stop = new Error(err.response.data.message);
          stop.notFound = true;
          throw stop;
        }
        return viaOlderApi();
      })
      .then((payload) => { if (!cancelled) setData(payload); })
      .catch((err) => {
        if (cancelled) return;
        setError(err.notFound
          ? 'That centre is not in the register. It may have been removed.'
          : 'Could not load this centre. Check your connection and try again.');
      });

    return () => { cancelled = true; };
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
  // {group: {component: units}} - the matrix the shelf is drawn from.
  const table = stockTable(stock);
  const byGroup = Object.fromEntries(
    GROUPS.map((g) => [g, unitsIn(stock, { bloodGroup: g, component: comp })]),
  );
  const total = unitsIn(stock, { component: comp });
  const held = GROUPS.filter((g) => (byGroup[g] || 0) > 0);
  const compTotals = byComponent(stock);
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
          <span className="tile-label">
            {comp ? `${componentOf(comp).label} held` : 'Units on the shelf'}
          </span>
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
        <div className="section-header">
          <h3>What is on the shelf</h3>
          {comp && (
            <button type="button" className="tile-link link-button" onClick={() => setComp('')}>
              Show every component
            </button>
          )}
        </div>

        {/* The component tabs. A bag of whole blood is separated into red
            cells, plasma and platelets within hours, and those three go to
            completely different wards - so "45 units" is not an answer to
            anybody who was sent here for platelets. */}
        <div className="comp-tabs" role="tablist" aria-label="Blood component">
          <button
            type="button" role="tab" aria-selected={!comp}
            className={`comp-tab ${!comp ? 'on' : ''}`}
            onClick={() => setComp('')}
          >
            <span className="comp-tab-name">All components</span>
            <strong>{compTotals.reduce((a, c) => a + c.units, 0)}</strong>
            <small>everything held here</small>
          </button>
          {compTotals.map((c) => (
            <button
              key={c.key}
              type="button" role="tab" aria-selected={comp === c.key}
              className={`comp-tab ${comp === c.key ? 'on' : ''} ${c.units === 0 ? 'is-empty' : ''}`}
              onClick={() => setComp(comp === c.key ? '' : c.key)}
              title={c.use}
            >
              <span className="comp-tab-name">{c.label}</span>
              <strong>{c.units}</strong>
              <small>keeps {c.shelf}</small>
            </button>
          ))}
        </div>

        {comp && <p className="comp-note"><strong>{componentOf(comp).label}.</strong> {componentOf(comp).use}</p>}

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
                {/* With no component chosen, each cell shows how its total
                    divides, so the gaps are visible without tabbing through
                    all four. */}
                {!comp && n > 0 && (
                  <span className="shelf-split">
                    {COMPONENTS.map((c) => {
                      const v = table[g]?.[c.key] || 0;
                      return v > 0
                        ? <span key={c.key}>{c.short} <b>{v}</b></span>
                        : null;
                    })}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* The whole matrix, for anyone who wants to read it as a table
            rather than eight cards - and the shape a blood bank's own stock
            sheet takes. */}
        <details className="shelf-table-wrap">
          <summary>See the full stock table</summary>
          <div className="dt-scroll">
            <table className="dt-table shelf-table">
              <thead>
                <tr>
                  <th>Group</th>
                  {COMPONENTS.map((c) => <th key={c.key} className="ta-right">{c.label}</th>)}
                  <th className="ta-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {GROUPS.map((g) => {
                  const rowTotal = unitsIn(stock, { bloodGroup: g });
                  return (
                    <tr key={g}>
                      <td data-label="Group"><BloodGroup group={g} variant="badge" /></td>
                      {COMPONENTS.map((c) => (
                        <td key={c.key} className="ta-right" data-label={c.label}>
                          {table[g]?.[c.key] || <span className="muted-note">—</span>}
                        </td>
                      ))}
                      <td className="ta-right" data-label="Total"><strong>{rowTotal}</strong></td>
                    </tr>
                  );
                })}
                <tr className="shelf-table-foot">
                  <td data-label="Group"><strong>All groups</strong></td>
                  {compTotals.map((c) => (
                    <td key={c.key} className="ta-right" data-label={c.label}><strong>{c.units}</strong></td>
                  ))}
                  <td className="ta-right" data-label="Total">
                    <strong>{compTotals.reduce((a, c) => a + c.units, 0)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
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
