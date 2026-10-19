// Live donor search - this is the "AJAX" module from the roadmap, done in React.
// Every time the blood group or location changes, we call the API again and
// React re-renders the list automatically. No manual DOM updates, no page reload.
//
// NEW: a Compatibility Checker sits above the search. Picking a blood group
// there switches the list into "compatible mode" - instead of one exact
// match, it shows every donor group medically able to give to that group.
// The backend search endpoint only supports one exact bloodGroup at a time,
// so compatible mode fetches the unfiltered (location-only) list and applies
// the multi-group match on the client - no API changes needed.

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import CompatibilityChecker from '../components/CompatibilityChecker';
import BloodGroup from '../components/BloodGroup';
import SearchSelect from '../components/SearchSelect';
import DataTable from '../components/DataTable';
import ContactActions from '../components/ContactActions';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorSearch() {
  const { user } = useAuth();
  // The dashboard map links straight here with ?location=<city>, so the
  // search opens already filtered instead of making the member retype the
  // place they just clicked.
  const [params] = useSearchParams();
  const [bloodGroup, setBloodGroup] = useState(params.get('bloodGroup') || '');
  const [location, setLocation] = useState(params.get('location') || '');
  const [compatFor, setCompatFor] = useState(null); // recipient group in "compatible mode", or null
  const [compatGroups, setCompatGroups] = useState([]); // donor groups that match compatFor
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = {};
    // In compatible mode we deliberately do not send bloodGroup - we need every
    // donor group back so we can keep the ones compatFor's own filter allows.
    if (bloodGroup && !compatFor) params.bloodGroup = bloodGroup;
    if (location) params.location = location;

    const timer = setTimeout(() => {
      api.get('/donors', { params })
        .then((res) => {
          const list = compatFor ? res.data.filter((d) => compatGroups.includes(d.bloodGroup)) : res.data;
          setDonors(list);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [bloodGroup, location, compatFor, compatGroups]);

  const handleCompatibleFilter = (recipientGroup, donorGroups) => {
    setBloodGroup('');
    setCompatFor(recipientGroup);
    setCompatGroups(donorGroups || []);
  };

  const clearCompatFilter = () => {
    setCompatFor(null);
    setCompatGroups([]);
  };

  return (
    <div className="page">
      <h1 className="page-h1">Find Blood Donors</h1>

      <CompatibilityChecker onFilterDonors={handleCompatibleFilter} />

      <div className="search-bar">
        <SearchSelect
          value={bloodGroup}
          placeholder="Any blood group"
          onChange={(e) => {
            // Picking an exact group is a different question from "who can
            // give to me", so it replaces compatible mode rather than being
            // ignored by it. The dropdown used to be disabled while compatible
            // mode was on, which read as a broken filter.
            if (e.target.value) clearCompatFilter();
            setBloodGroup(e.target.value);
          }}
          options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg || 'Any blood group' }))}
        />
        <input
          placeholder="Search by city / location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      {compatFor && (
        <p className="compat-active-banner">
          Showing donors who can give to <strong>{compatFor}</strong> ({compatGroups.join(', ')})
          <button type="button" className="link-button" onClick={clearCompatFilter}>Clear</button>
        </p>
      )}

      <DataTable
        caption="donors"
        rows={donors}
        loading={loading}
        rowKey={(d) => d._id}
        exportName="donors"
        initialSort={{ key: 'name', dir: 'asc' }}
        defaultPerPage={25}
        searchKeys={['name', 'location', 'bloodGroup']}
        searchPlaceholder="Search this list by name or town…"
        filters={[
          { key: 'bloodGroup', label: 'Blood group', options: BLOOD_GROUPS.filter(Boolean) },
          {
            key: 'location',
            label: 'Town',
            options: [...new Set(donors.map((d) => d.location).filter(Boolean))].sort(),
          },
        ]}
        empty={{
          title: 'No donors match that search',
          message: 'Try a different town, or widen the blood group with the compatibility checker above.',
        }}
        columns={[
          { key: 'name', header: 'Donor', render: (d) => <strong>{d.name}</strong> },
          {
            key: 'bloodGroup',
            header: 'Group',
            width: '100px',
            render: (d) => <BloodGroup group={d.bloodGroup} variant="badge" />,
          },
          { key: 'location', header: 'Town', width: '180px', render: (d) => d.location || '—' },
          {
            key: 'contact',
            header: 'Contact',
            sortable: false,
            width: '140px',
            render: (d) => (
              <ContactActions
                size="sm" phone={d.phone} name={d.name}
                locked={!user}
                lockedHint="Sign in to see numbers"
                message={`Hello ${d.name}, I found you on the LifeLink donor register. Would you be able to donate ${d.bloodGroup} blood?`}
              />
            ),
            csv: (d) => d.phone || '',
          },
        ]}
      />
    </div>
  );
}
