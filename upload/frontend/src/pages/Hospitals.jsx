// Member-facing directory of hospitals and blood banks.
// Adding, editing and deleting locations is an administrator job and now lives
// entirely in the admin console at /admin/hospitals.

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import BloodGroup from '../components/BloodGroup';
import SearchSelect from '../components/SearchSelect';
import DataTable from '../components/DataTable';
import StatusTag from '../components/StatusTag';
import ContactActions from '../components/ContactActions';
import { COMPONENTS, componentOptions, componentOf, unitsOf as unitsIn } from '../lib/components';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Stock is held per group AND per component, so a group can appear up to
// four times in the array. Everything here goes through one helper.
const unitsOf = (h, group, component = '') =>
  unitsIn(h.availableBloodUnits || [], { bloodGroup: group, component });

export default function Hospitals() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  // Picking a group turns this page into "who has O- right now" rather than
  // "here is the whole directory, go and read eight numbers per row".
  const [group, setGroup] = useState('');
  const [component, setComponent] = useState('');
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

  const shown = useMemo(() => {
    let list = type ? hospitals.filter((h) => h.type === type) : hospitals;
    // Only centres that actually hold it, because a centre with none of it
    // is not an answer to "where can I get O- platelets".
    if (group || component) list = list.filter((h) => unitsOf(h, group, component) > 0);
    return list;
  }, [hospitals, type, group, component]);

  const groupUnits = useMemo(
    () => shown.reduce((a, h) => a + unitsOf(h, group, component), 0),
    [shown, group, component],
  );

  return (
    <div className="page">
      <h1 className="page-title page-h1">Hospitals &amp; Blood Banks</h1>
      <p className="app-subtext">
        {group || component
          ? (
            <>
              Centres holding{' '}
              {group ? <BloodGroup group={group} variant="pill" /> : 'stock'}
              {component ? ` ${componentOf(component).label.toLowerCase()}` : ''}{' '}
              right now. Always ring before you travel.
            </>
          )
          : 'Search the network, check stock by component and get directions.'}
      </p>

      <div className="search-bar">
        <SearchSelect
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder="Any blood group"
          options={[{ value: '', label: 'Any blood group' }, ...GROUPS.map((g) => ({ value: g, label: g }))]}
        />
        <SearchSelect
          value={component}
          onChange={(e) => setComponent(e.target.value)}
          placeholder="All components"
          options={componentOptions()}
        />
        <SearchSelect
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="All locations"
          options={[
            { value: '', label: 'All locations' },
            { value: 'hospital', label: 'Hospitals' },
            { value: 'blood_bank', label: 'Blood banks' },
          ]}
        />
        <input
          placeholder="Search by name or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {(group || component) && (
        <p className="stock-summary">
          <strong>{shown.length}</strong> {shown.length === 1 ? 'centre holds' : 'centres hold'}{' '}
          {group && <BloodGroup group={group} variant="pill" />}
          {component ? ` ${componentOf(component).label.toLowerCase()}` : (group ? '' : ' stock')}
          {' '}— <strong>{groupUnits}</strong> units between them.
          {shown.length === 0 && ' Nothing is recorded for that. Try the requests board, or ring a centre directly.'}
        </p>
      )}

      {component && (
        <p className="comp-note">
          <strong>{componentOf(component).label}.</strong> {componentOf(component).use}
        </p>
      )}

      <DataTable
        caption="centres"
        rows={shown}
        loading={loading}
        rowKey={(h) => h._id}
        exportName="hospitals-and-blood-banks"
        initialSort={{ key: 'name', dir: 'asc' }}
        defaultPerPage={25}
        searchKeys={['name', 'address', 'district', 'city', 'state']}
        searchPlaceholder="Search this list…"
        filters={[
          {
            key: 'type',
            label: 'Centre type',
            options: [
              { value: 'hospital', label: 'Hospitals' },
              { value: 'blood_bank', label: 'Blood banks' },
            ],
          },
          { key: 'state', label: 'State', options: [...new Set(shown.map((h) => h.state).filter(Boolean))].sort() },
          { key: 'district', label: 'District', options: [...new Set(shown.map((h) => h.district).filter(Boolean))].sort() },
          !group && !component && {
            key: 'stock',
            label: 'Stock',
            placeholder: 'Any stock level',
            options: [
              { value: 'yes', label: 'Has units on the shelf' },
              { value: 'no', label: 'Nothing recorded' },
            ],
            match: (h, v) => {
              const total = unitsOf(h, '', component);
              return v === 'yes' ? total > 0 : total === 0;
            },
          },
        ]}
        empty={{
          title: group ? `No centre has ${group} recorded` : 'No centres match your search',
          message: group
            ? 'Stock moves quickly and not every centre reports it. Try another group, or post on the requests board.'
            : 'Try a different town, or clear the filters.',
        }}
        columns={[
          {
            key: 'name',
            header: 'Centre',
            render: (h) => (
              <>
                {/* A real link, not just a clickable row: it opens in a new
                    tab on a middle click and reads as a link to a screen
                    reader, which a row handler alone does not. */}
                <Link className="row-title" to={`/hospitals/${h._id}`}>{h.name}</Link>
                <br /><small className="muted-note">{h.address}</small>
              </>
            ),
            csv: (h) => h.name,
          },
          { key: 'district', header: 'District', width: '150px', render: (h) => h.district || '—' },
          { key: 'state', header: 'State', width: '140px', render: (h) => h.state || '—' },
          {
            key: 'type',
            header: 'Type',
            width: '120px',
            render: (h) => (h.type === 'blood_bank' ? 'Blood bank' : 'Hospital'),
          },
          {
            key: 'units',
            header: [group, component ? componentOf(component).short.toLowerCase() : '', 'units']
              .filter(Boolean).join(' ').replace(/^units$/, 'Units held'),
            defaultDir: 'desc',
            align: 'right',
            // POINT 7: eight groups and a total in 200px was a jumble. The
            // breakdown now lays out as pairs with room around them.
            width: group ? '170px' : '290px',
            sortValue: (h) => unitsOf(h, group, component),
            render: (h) => {
              // With a group chosen, that one number IS the answer; the full
              // eight-group breakdown just buries it.
              if (group) {
                const n = unitsOf(h, group, component);
                return (
                  <span className="stock-answer">
                    <strong>{n}</strong>
                    <StatusTag size="sm" label={n >= 10 ? 'Good stock' : 'Low stock'}
                               tone={n >= 10 ? 'good' : 'warn'} />
                  </span>
                );
              }

              const total = unitsOf(h, '', component);
              if (!total) return <StatusTag label="None recorded" tone="dead" size="sm" />;

              // A group now has up to four rows, one per component, so the
              // breakdown is totalled per group before it is drawn - without
              // that, O- appeared four times with a different figure each
              // time.
              const perGroup = GROUPS
                .map((g) => ({ g, n: unitsOf(h, g, component) }))
                .filter((x) => x.n > 0);

              return (
                <div className="place-units compact">
                  <strong>{total}</strong>
                  <span className="place-units-split">
                    {perGroup.map((x) => (
                      <span key={x.g}><BloodGroup group={x.g} variant="bare" /> {x.n}</span>
                    ))}
                  </span>
                  {/* How the total divides, when no component is chosen. */}
                  {!component && (
                    <span className="place-comp-split">
                      {COMPONENTS.map((c) => {
                        const n = unitsOf(h, '', c.key);
                        return n > 0 ? <span key={c.key}>{c.short} {n}</span> : null;
                      })}
                    </span>
                  )}
                </div>
              );
            },
            csv: (h) => unitsOf(h, group, component),
          },
          {
            key: 'contactNumber',
            header: 'Contact',
            sortable: false,
            width: '130px',
            render: (h) => (
              <ContactActions size="sm" name={h.name} address={h.address}
                              phone={h.contactNumber && h.contactNumber !== 'N/A' ? h.contactNumber : ''} />
            ),
            csv: (h) => (h.contactNumber === 'N/A' ? '' : h.contactNumber),
          },
          {
            key: 'open',
            header: '',
            sortable: false,
            export: false,
            align: 'right',
            width: '92px',
            render: (h) => (
              <Link className="small-button ghost" to={`/hospitals/${h._id}`}>Open</Link>
            ),
          },
        ]}
        // The whole row opens the centre. Clicks on the buttons inside it
        // (call, WhatsApp, directions, Open) stop there and never reach this.
        onRowClick={(h) => navigate(`/hospitals/${h._id}`)}
        rowClass={() => 'is-clickable'}
      />

    </div>
  );
}
