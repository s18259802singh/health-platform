// Member-facing directory of hospitals and blood banks.
// Adding, editing and deleting locations is an administrator job and now lives
// entirely in the admin console at /admin/hospitals.

import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import BloodGroup from '../components/BloodGroup';
import SearchSelect from '../components/SearchSelect';
import DataTable from '../components/DataTable';
import StatusTag from '../components/StatusTag';
import ContactActions from '../components/ContactActions';

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
          {
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
        empty={{ title: 'No centres match your search', message: 'Try a different town, or clear the filters.' }}
        columns={[
          {
            key: 'name',
            header: 'Centre',
            render: (h) => (
              <>
                <strong>{h.name}</strong>
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
            header: 'Units held', defaultDir: 'desc',
            align: 'right',
            width: '200px',
            sortValue: (h) => (h.availableBloodUnits || []).reduce((a, u) => a + (u.units || 0), 0),
            render: (h) => {
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
            csv: (h) => (h.availableBloodUnits || []).reduce((a, u) => a + (u.units || 0), 0),
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
        ]}
      />

    </div>
  );
}
