// FIND CARE NEAR ME
// One form, one question: where are you and what do you need. The answer is
// the closest centres, what each holds in stock, and the doctors there who
// treat the thing you came about — with booking one click away.

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import BloodGroup from '../components/BloodGroup';
import SearchSelect from '../components/SearchSelect';
import Pagination, { usePagination } from '../components/Pagination';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const TYPE_LABEL = { blood_bank: 'Blood bank', hospital: 'Hospital' };

export default function NearMe() {
  const [params] = useSearchParams();
  const [options, setOptions] = useState({ cities: [], conditions: [] });
  const [form, setForm] = useState({
    place: params.get('place') || '',
    condition: params.get('condition') || '',
    type: '',
    bloodGroup: params.get('group') || '',
  });
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // A position from the browser, when the person offers one. It beats the
  // typed town because it measures from where they actually are rather than
  // from the middle of their city.
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');

  const pager = usePagination(data?.results || [], 6);

  useEffect(() => {
    api.get('/care/options')
      .then((r) => setOptions(r.data))
      .catch(() => setOptions({ cities: [], conditions: [] }));
  }, []);

  // Search as the form changes, like every other list on the site.
  useEffect(() => {
    if (!form.place) { setData(null); setError(''); return undefined; }
    const t = setTimeout(async () => {
      setLoading(true); setError('');
      try {
        const { data: res } = await api.get('/care/near', {
          params: coords ? { ...form, lat: coords.lat, lon: coords.lon } : form,
        });
        setData(res);
      } catch (err) {
        setData(null);
        // A 404 here does not mean "no centres" - it means the server has no
        // /api/care route, i.e. this build of the frontend is newer than the
        // backend it is talking to. Saying so turns a mystery into a fix.
        setError(err.response?.status === 404
          ? 'This page needs the latest backend. The server does not have the /api/care endpoint yet — deploy the backend update and reload.'
          : err.response?.data?.message || 'Could not search just now.');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [form.place, form.condition, form.type, form.bloodGroup, coords]); // eslint-disable-line react-hooks/exhaustive-deps

  // Typing an address again means they no longer want the device position.
  const set = (k, v) => {
    if (k === 'place') { setCoords(null); setLocateError(''); }
    setForm((f) => ({ ...f, [k]: v }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('This browser cannot share a location. Type your town instead.');
      return;
    }
    setLocating(true); setLocateError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setCoords({ lat: Number(pos.coords.latitude.toFixed(4)), lon: Number(pos.coords.longitude.toFixed(4)) });
        // The search only runs when there is something in the place box, and
        // this fills it with something honest until the server names the town.
        setForm((f) => ({ ...f, place: f.place || 'My current location' }));
      },
      (err) => {
        setLocating(false);
        setLocateError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was refused, so type your town instead.'
            : err.code === err.POSITION_UNAVAILABLE
              ? 'Your device could not get a fix. Type your town instead.'
              : 'That took too long. Type your town instead.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 },
    );
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="app-eyebrow">Find care</p>
          <h1 className="page-h1">What do you need, and where are you?</h1>
          <p>
            The nearest blood banks and hospitals, what they have on the shelf,
            and the doctors there who treat what you came about. No account needed.
          </p>
        </div>
      </div>

      <form className="near-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          <span>Your area or town</span>
          <input
            placeholder="e.g. Adajan, Surat"
            value={form.place}
            onChange={(e) => set('place', e.target.value)}
            list="near-towns"
            autoComplete="address-level2"
          />
          <datalist id="near-towns">
            {options.cities.map((c) => <option key={c} value={c} />)}
          </datalist>
          <button type="button" className="near-locate" onClick={useMyLocation} disabled={locating}>
            {locating ? (
              <>
                <span className="near-locate-spin" aria-hidden="true" />
                Finding you…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3.2" />
                  <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                  <circle cx="12" cy="12" r="8" opacity=".45" />
                </svg>
                Use my current location
              </>
            )}
          </button>
          {coords && !locateError && (
            <small className="near-locate-note">
              Measuring from your device
              {data?.located?.nearestTown ? ` · nearest town ${data.located.nearestTown}` : ''}
              {' · '}
              <button type="button" className="dt-link" onClick={() => { setCoords(null); setForm((f) => ({ ...f, place: '' })); }}>
                use a town instead
              </button>
            </small>
          )}
          {locateError && <small className="near-locate-err">{locateError}</small>}
        </label>

        <label>
          <span>What is it about?</span>
          <SearchSelect
            value={form.condition}
            onChange={(e) => set('condition', e.target.value)}
            placeholder="Anything"
            searchPlaceholder="Search symptoms…"
            options={[{ value: '', label: 'Anything' },
              ...options.conditions.map((c) => ({ value: c.id, label: c.label }))]}
          />
        </label>

        <label>
          <span>Blood group needed</span>
          <SearchSelect
            value={form.bloodGroup}
            onChange={(e) => set('bloodGroup', e.target.value)}
            placeholder="Not looking for blood"
            options={[{ value: '', label: 'Not looking for blood' },
              ...GROUPS.map((g) => ({ value: g, label: g }))]}
          />
        </label>

        <label>
          <span>Centre type</span>
          <SearchSelect
            value={form.type}
            onChange={(e) => set('type', e.target.value)}
            placeholder="Both"
            options={[
              { value: '', label: 'Both' },
              { value: 'blood_bank', label: 'Blood banks' },
              { value: 'hospital', label: 'Hospitals' },
            ]}
          />
        </label>
      </form>

      {!form.place && (
        <p className="near-empty">
          Start by typing your area above — anywhere in Gujarat.
        </p>
      )}

      {error && <p className="error-text">{error}</p>}
      {loading && <p className="hint">Looking…</p>}

      {data && (
        <>
          <div className="near-summary">
            <strong>{data.count}</strong> centre{data.count === 1 ? '' : 's'} near{' '}
            <strong>{data.origin.place}</strong>
            {data.condition && <> · showing {data.condition.specialisms.join(', ')} first</>}
            {data.bloodGroup && <> · holding <BloodGroup group={data.bloodGroup} variant="bare" /></>}
          </div>

          <div className="near-list">
            {pager.slice.map((h) => (
              <article className="near-card" key={h._id}>
                <header>
                  <div>
                    <h3>{h.name}</h3>
                    <p className="near-addr">{h.address}</p>
                  </div>
                  <span className="near-dist">
                    <strong>{h.distanceKm < 1 ? '<1' : h.distanceKm}</strong><small>km away</small>
                  </span>
                </header>

                <div className="near-meta">
                  <span className={`place-type ${h.type}`}>{TYPE_LABEL[h.type] || h.type}</span>
                  {h.contactNumber && h.contactNumber !== 'N/A' && (
                    <a className="near-call" href={`tel:${h.contactNumber}`}>{h.contactNumber}</a>
                  )}
                  {h.units > 0 && (
                    <span className="near-stock">
                      {h.units} unit{h.units === 1 ? '' : 's'} on record
                    </span>
                  )}
                </div>

                {h.breakdown?.length > 0 && (
                  <div className="near-breakdown">
                    {h.breakdown.map((b) => (
                      <span key={b.bloodGroup}>
                        <BloodGroup group={b.bloodGroup} variant="bare" /> {b.units}
                      </span>
                    ))}
                  </div>
                )}

                {h.doctors.length > 0 ? (
                  <div className="near-docs">
                    <span className="near-docs-label">
                      {data.condition ? `Doctors here for ${data.condition.label.toLowerCase()}` : 'Doctors here'}
                    </span>
                    <ul>
                      {h.doctors.slice(0, 3).map((d) => (
                        <li key={d._id}>
                          <div>
                            <strong>{d.name}</strong>
                            <small>{d.specialization} · {d.availableDays?.join(', ')}</small>
                          </div>
                          <div className="near-slots">
                            {(d.availableTimeSlots || []).map((t) => (
                              <Link
                                key={t}
                                className="near-slot"
                                to={`/appointments?hospitalId=${h._id}&doctorId=${d._id}&time=${encodeURIComponent(t)}`}
                              >
                                {t}
                              </Link>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                    {h.doctorCount > h.doctors.length && (
                      <small className="hint">
                        {h.doctorCount - h.doctors.length} other doctor
                        {h.doctorCount - h.doctors.length === 1 ? '' : 's'} at this hospital
                      </small>
                    )}
                  </div>
                ) : (
                  <p className="hint near-nodocs">
                    {data.condition
                      ? `No ${data.condition.specialisms.join('/').toLowerCase()} listed here — but it is the closest centre for stock.`
                      : 'No doctors listed at this centre.'}
                  </p>
                )}
              </article>
            ))}
          </div>

          <Pagination {...pager} />

          {data.count === 0 && (
            <p className="near-empty">
              Nothing found near {data.origin.place} with those filters. Try widening them.
            </p>
          )}
        </>
      )}
    </div>
  );
}
