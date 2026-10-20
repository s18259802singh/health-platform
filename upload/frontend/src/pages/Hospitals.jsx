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

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const unitsOf = (h, group) => {
  const stock = h.availableBloodUnits || [];
  if (!group) return stock.reduce((a, u) => a + (u.units || 0), 0);
  return stock.find((u) => u.bloodGroup === group)?.units || 0;
};

export default function Hospitals() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  // Picking a group turns this page into "who has O- right now" rather than
  // "here is the whole directory, go and read eight numbers per row".
  const [group, setGroup] = useState('');
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
    // Only centres that actually hold the group, because a centre with none
    // of it is not an answer to "where can I get O-".
    if (group) list = list.filter((h) => unitsOf(h, group) > 0);
    return list;
  }, [hospitals, type, group]);

  const groupUnits = useMemo(
    () => (group ? shown.reduce((a, h) => a + unitsOf(h, group), 0) : 0),
    [shown, group],
  );

  return (
    <div className="page">
      <h1 className="page-title page-h1">Hospitals &amp; Blood Banks</h1>
      <p className="app-subtext">
        {group
          ? <>Centres holding <BloodGroup group={group} variant="pill" /> right now. Always ring before you travel.</>
          : 'Search the network, check stock and get directions.'}
      </p>

      <div className="search-bar">
        <SearchSelect
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder="Any blood group"
          options={[{ value: '', label: 'Any blood group' }, ...GROUPS.map((g) => ({ value: g, label: g }))]}
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

      {group && (
        <p className="stock-summary">
          <strong>{shown.length}</strong> {shown.length === 1 ? 'centre holds' : 'centres hold'}{' '}
          <BloodGroup group={group} variant="pill" /> — <strong>{groupUnits}</strong> units between them.
          {shown.length === 0 && ' Nothing is recorded for that group. Try the requests board, or ring a centre directly.'}
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
          !group && {
            key: 'stock',
            label: 'Stock',
            placeholder: 'Any stock level',
            options: [
              { value: 'yes', label: 'Has units on the shelf' },
              { value: 'no', label: 'Nothing recorded' },
            ],
            match: (h, v) => {
              const total = (h.availableBloodUnits || []).reduce((a, u) => a + (u.units || 0), 0);
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
            header: group ? `${group} units` : 'Units held',
            defaultDir: 'desc',
            align: 'right',
            // POINT 7: eight groups and a total in 200px was a jumble. The
            // breakdown now lays out as pairs with room around them.
            width: group ? '150px' : '290px',
            sortValue: (h) => unitsOf(h, group),
            render: (h) => {
              // With a group chosen, that one number IS the answer; the full
              // eight-group breakdown just buries it.
              if (group) {
                const n = unitsOf(h, group);
                return (
                  <span className="stock-answer">
                    <strong>{n}</strong>
                    <StatusTag size="sm" label={n >= 10 ? 'Good stock' : 'Low stock'}
                               tone={n >= 10 ? 'good' : 'warn'} />
                  </span>
                );
              }
              const units = (h.availableBloodUnits || []).filter((u) => u.units > 0);
              const total = units.reduce((a, u) => a + u.units, 0);
              if (!total) return <StatusTag label="None recorded" tone="dead" size="sm" />;
              return (
                <div className="place-units compact">
                  <strong>{total}</strong>
                  <span className="place-units-split">
                    {units.map((u) => (
                      <span key={u.bloodGroup}><BloodGroup group={u.bloodGroup} variant="bare" /> {u.units}</span>
                    ))}
                  </span>
                </div>
              );
            },
            csv: (h) => unitsOf(h, group),
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
