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
        const { data: res } = await api.get('/care/near', { params: form });
        setData(res);
      } catch (err) {
        setData(null);
        setError(err.response?.data?.message || 'Could not search just now.');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [form.place, form.condition, form.type, form.bloodGroup]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
                    <strong>{h.distanceKm}</strong><small>km away</small>
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
