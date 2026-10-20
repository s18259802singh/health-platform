// BLOOD AVAILABILITY SEARCH
// The eRaktKosh-style half of the site: a serious, data-first tool. Public on
// purpose - someone looking for blood in an emergency should not hit a login
// wall. The filters cascade state -> district, exactly as people expect from
// a government blood portal, but the result rows are readable rather than raw.

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Figure from '../components/Figure';
import StatusTag from '../components/StatusTag';
import ContactActions from '../components/ContactActions';
import PageLoader from '../components/PageLoader';
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
  // Paging, sorting and in-table filtering all live in DataTable now.
  const [error, setError] = useState('');

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
      setError('');
    } catch (err) {
      setData({ results: [], count: 0, withStock: 0, totalUnits: 0 });
      setError(err.response?.data?.message || 'Could not reach the directory just now. Check your connection and try again.');
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
          <div className="tile slate t-4 center pad-sm">
            <span className="tile-label">Centres found</span>
            <strong className="tile-value sm"><Figure value={data.count} ready={!loading} /></strong>
          </div>
          <div className="tile mint t-4 center pad-sm">
            <span className="tile-label">With stock{filters.bloodGroup ? ` of ${filters.bloodGroup}` : ''}</span>
            <strong className="tile-value sm"><Figure value={data.withStock} ready={!loading} /></strong>
          </div>
          <div className="tile rose t-4 center pad-sm">
            <span className="tile-label">Units available</span>
            <strong className="tile-value sm"><Figure value={data.totalUnits} ready={!loading} /></strong>
          </div>
        </div>
      )}

      {/* One table, the same component the rest of the site uses, so sorting,
          the filter button, paging and CSV export all behave identically
          here. The form above still drives the server-side region query; the
          table's own filters narrow what came back. */}
      <DataTable
        caption="blood centres"
        rows={data?.results || []}
        loading={loading}
        error={error}
        rowKey={(r) => r._id}
        exportName="blood-availability"
        initialSort={{ key: 'units', dir: 'desc' }}
        defaultPerPage={15}
        perPageOptions={[10, 15, 25, 50, 100]}
        searchKeys={['name', 'address', 'district', 'city']}
        searchPlaceholder="Search within these results…"
        filters={[
          {
            key: 'availability',
            label: 'Stock level',
            options: [
              { value: 'in_stock', label: 'In stock' },
              { value: 'low', label: 'Low stock' },
              { value: 'out', label: 'Out of stock' },
            ],
          },
          {
            key: 'type',
            label: 'Centre type',
            options: [
              { value: 'blood_bank', label: 'Blood banks' },
              { value: 'hospital', label: 'Hospitals' },
            ],
          },
          {
            key: 'district',
            label: 'District',
            options: [...new Set((data?.results || []).map((r) => r.district).filter(Boolean))].sort(),
          },
        ]}
        empty={{
          title: searched ? 'No centres match that search' : 'Choose a region to begin',
          message: searched
            ? 'Try widening the region, or clearing the blood group filter to see the full directory.'
            : 'Pick a state above, or search by name to see the whole directory.',
        }}
        columns={[
          {
            key: 'name',
            header: 'Blood centre',
            render: (r) => (
              <>
                <strong>{r.name}</strong>
                <br /><small className="muted-note">{r.address}</small>
                {!filters.bloodGroup && r.breakdown?.length > 0 && (
                  <div className="portal-breakdown">
                    {r.breakdown.filter((b) => b.units > 0).map((b) => (
                      <span key={b.bloodGroup}><BloodGroup group={b.bloodGroup} variant="bare" />{b.units}</span>
                    ))}
                  </div>
                )}
              </>
            ),
            csv: (r) => r.name,
          },
          { key: 'district', header: 'District', width: '150px',
            render: (r) => r.district || '—' },
          { key: 'type', header: 'Type', width: '120px',
            render: (r) => (r.type === 'blood_bank' ? 'Blood bank' : 'Hospital') },
          {
            key: 'units',
            header: filters.bloodGroup ? `${filters.bloodGroup} units` : 'Total units',
            defaultDir: 'desc',
            align: 'right',
            width: '110px',
            render: (r) => <strong className="portal-units">{r.units}</strong>,
          },
          {
            key: 'availability',
            header: 'Status',
            width: '130px',
            render: (r) => (
              <StatusTag
                label={LABEL[r.availability]}
                tone={r.availability === 'in_stock' ? 'good' : r.availability === 'low' ? 'warn' : 'dead'}
              />
            ),
            sortValue: (r) => ({ in_stock: 0, low: 1, out: 2 }[r.availability] ?? 3),
          },
          {
            key: 'contactNumber',
            header: 'Contact',
            sortable: false,
            width: '120px',
            render: (r) => (
              <ContactActions size="sm" name={r.name}
                              phone={r.contactNumber && r.contactNumber !== 'N/A' ? r.contactNumber : ''}
                              address={r.address} />
            ),
            csv: (r) => (r.contactNumber === 'N/A' ? '' : r.contactNumber),
          },
        ]}
      />

      <p className="portal-note">
        Stock levels are recorded by each centre and can change within minutes.
        Always telephone the blood centre before you travel. In a life-threatening
        emergency, contact your local emergency number first.
      </p>
    </div>
  );
}
