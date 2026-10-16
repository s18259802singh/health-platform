// BLOOD AVAILABILITY SEARCH
// The eRaktKosh-style half of the site: a serious, data-first tool. Public on
// purpose - someone looking for blood in an emergency should not hit a login
// wall. The filters cascade state -> district, exactly as people expect from
// a government blood portal, but the result rows are readable rather than raw.

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Pagination, { usePagination } from '../components/Pagination';
import BloodGroup from '../components/BloodGroup';
import SearchSelect from '../components/SearchSelect';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const LABEL = {
  good: 'Available',
  limited: 'Limited',
  critical: 'Critical',
  none: 'Out of stock',
};

export default function Availability() {
  // The landing page's quick search hands off here via ?group= and ?q=
  const [params] = useSearchParams();
  const [regions, setRegions] = useState({ states: [], components: [] });
  const [filters, setFilters] = useState({
    state: '', district: '',
    bloodGroup: params.get('group') || '',
    component: 'Whole Blood',
    type: '',
    search: params.get('q') || '',
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [perPage, setPerPage] = useState(15);

  // The results table is long, so it pages rather than scrolling forever.
  const pager = usePagination(data?.results || [], perPage);

  useEffect(() => {
    api.get('/availability/regions')
      .then((res) => setRegions(res.data))
      .catch(() => setRegions({ states: [], components: ['Whole Blood'] }));
  }, []);

  const districts = useMemo(
    () => regions.states.find((s) => s.state === filters.state)?.districts || [],
    [regions, filters.state]
  );

  const run = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const { component, ...params } = filters;
      const { data: res } = await api.get('/availability', { params });
      setData(res);
    } catch {
      setData({ results: [], count: 0, withStock: 0, totalUnits: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Re-query whenever a filter changes, rather than waiting for the Search
  // button. Changing district and watching the count sit at 110 reads as a
  // broken filter — and every other list on the site filters as you type.
  // The text box is debounced so it does not fire on every keystroke.
  useEffect(() => {
    const t = setTimeout(run, filters.search ? 350 : 0);
    return () => clearTimeout(t);
  }, [filters.state, filters.district, filters.bloodGroup, filters.type, filters.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key, value) => setFilters((f) => ({
    ...f,
    [key]: value,
    ...(key === 'state' ? { district: '' } : {}),
  }));

  return (
    <div className="page portal">
      <div className="page-head">
        <div>
          <p className="app-eyebrow">Blood availability</p>
          <h1 className="page-h1">Find blood in a blood bank near you</h1>
          <p>
            Search licensed blood banks and hospitals by region and blood group.
            No account needed — always call the centre to confirm before travelling.
          </p>
        </div>
      </div>

      <form className="portal-filters" onSubmit={run}>
        <label>
          <span>State</span>
          <SearchSelect
            value={filters.state}
            onChange={(e) => set('state', e.target.value)}
            placeholder="All states"
            options={[{ value: '', label: 'All states' }, ...regions.states.map((s) => ({ value: s.state, label: s.state }))]}
          />
        </label>

        <label>
          <span>District</span>
          <SearchSelect
            value={filters.district}
            onChange={(e) => set('district', e.target.value)}
            disabled={!filters.state}
            placeholder={filters.state ? 'All districts' : 'Select a state first'}
            searchPlaceholder="Search districts…"
            options={[{ value: '', label: filters.state ? 'All districts' : 'Select a state first' }, ...districts.map((d) => ({ value: d, label: d }))]}
          />
        </label>

        <label>
          <span>Blood group</span>
          <SearchSelect
            value={filters.bloodGroup}
            onChange={(e) => set('bloodGroup', e.target.value)}
            placeholder="All groups"
            options={[{ value: '', label: 'All groups' }, ...GROUPS.map((g) => ({ value: g, label: g }))]}
          />
        </label>

        <label>
          <span>Component</span>
          <SearchSelect
            value={filters.component}
            onChange={(e) => set('component', e.target.value)}
            options={(regions.components || ['Whole Blood']).map((c) => ({ value: c, label: c }))}
          />
        </label>

        <label>
          <span>Centre type</span>
          <SearchSelect
            value={filters.type}
            onChange={(e) => set('type', e.target.value)}
            placeholder="All centres"
            options={[
              { value: '', label: 'All centres' },
              { value: 'blood_bank', label: 'Blood banks' },
              { value: 'hospital', label: 'Hospitals' },
            ]}
          />
        </label>

        <label className="grow">
          <span>Name or area</span>
          <input
            placeholder="e.g. Red Cross, Adajan…"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
          />
        </label>

        {/* Results update as the filters change, so this is a re-run rather
            than the only way to apply them. It stays because people reach for
            a Search button on a portal like this and look lost without one. */}
        <button type="submit" className="btn-primary portal-search" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
        {(filters.state || filters.district || filters.bloodGroup || filters.type || filters.search) && (
          <button
            type="button"
            className="small-button portal-reset"
            onClick={() => setFilters({ state: '', district: '', bloodGroup: '', component: 'Whole Blood', type: '', search: '' })}
          >
            Clear filters
          </button>
        )}
      </form>

      {data && (
        <div className="bento">
          <div className="tile slate t-3 center pad-sm">
            <span className="tile-label">Centres found</span>
            <strong className="tile-value sm">{data.count}</strong>
          </div>
          <div className="tile mint t-3 center pad-sm">
            <span className="tile-label">With stock{filters.bloodGroup ? ` of ${filters.bloodGroup}` : ''}</span>
            <strong className="tile-value sm">{data.withStock}</strong>
          </div>
          <div className="tile rose t-3 center pad-sm">
            <span className="tile-label">Units available</span>
            <strong className="tile-value sm">{data.totalUnits}</strong>
          </div>
          <div className="tile ink t-3 pad-sm portal-stamp-tile">
            <span className="tile-label">Last refreshed</span>
            <strong>{new Date(data.updatedAt || Date.now()).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</strong>
            <small>{new Date(data.updatedAt || Date.now()).toLocaleDateString('en-GB')} · as recorded by each centre</small>
          </div>
        </div>
      )}

      {loading && <p className="hint">Searching the directory…</p>}

      {!loading && data && data.results.length === 0 && searched && (
        <div className="portal-empty">
          <strong>No centres match that search</strong>
          <p>Try widening the region, or clearing the blood group filter to see the full directory.</p>
        </div>
      )}

      {!loading && data && data.results.length > 0 && (
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Blood centre</th>
                <th>District</th>
                <th>Type</th>
                <th>{filters.bloodGroup ? `${filters.bloodGroup} units` : 'Total units'}</th>
                <th>Status</th>
                <th>Contact</th>
                <th aria-label="Directions" />
              </tr>
            </thead>
            <tbody>
              {pager.slice.map((r, i) => (
                <tr key={r._id}>
                  <td className="portal-num">{pager.from + i}</td>
                  <td>
                    <strong>{r.name}</strong>
                    <small>{r.address}</small>
                    {!filters.bloodGroup && r.breakdown?.length > 0 && (
                      <div className="portal-breakdown">
                        {r.breakdown.filter((b) => b.units > 0).map((b) => (
                          <span key={b.bloodGroup}><BloodGroup group={b.bloodGroup} variant="bare" />{b.units}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>{r.district || '—'}</td>
                  <td>{r.type === 'blood_bank' ? 'Blood bank' : 'Hospital'}</td>
                  <td className="portal-units">{r.units}</td>
                  <td><span className={`portal-status ${r.availability}`}>{LABEL[r.availability]}</span></td>
                  <td>
                    {r.contactNumber && r.contactNumber !== 'N/A'
                      ? <a href={`tel:${r.contactNumber}`}>{r.contactNumber}</a>
                      : <span className="hint">Not listed</span>}
                  </td>
                  <td>
                    <a
                      className="small-button"
                      target="_blank" rel="noopener noreferrer"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address)}`}
                    >
                      Map
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && data && data.results.length > 0 && (
        <div className="pager-bar">
          <label className="per-page">
            <span>Rows</span>
            <SearchSelect
              value={String(perPage)}
              onChange={(e) => setPerPage(Number(e.target.value))}
              options={[10, 15, 25, 50].map((n) => ({ value: String(n), label: String(n) }))}
            />
          </label>
          <Pagination {...pager} onChange={pager.setPage} label="blood centres" />
        </div>
      )}

      <p className="portal-note">
        Stock levels are recorded by each centre and can change within minutes.
        Always telephone the blood centre before you travel. In a life-threatening
        emergency, contact your local emergency number first.
      </p>
    </div>
  );
}
