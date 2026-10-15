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
import api from '../api/axios';
import CompatibilityChecker from '../components/CompatibilityChecker';

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorSearch() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [location, setLocation] = useState('');
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
    setCompatGroups(donorGroups);
  };

  const clearCompatFilter = () => {
    setCompatFor(null);
    setCompatGroups([]);
  };

  return (
    <div className="page">
      <h2>Find Blood Donors</h2>

      <CompatibilityChecker onFilterDonors={handleCompatibleFilter} />

      <div className="search-bar">
        <select
          value={bloodGroup}
          disabled={!!compatFor}
          onChange={(e) => setBloodGroup(e.target.value)}
        >
          {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg || 'Any Blood Group'}</option>)}
        </select>
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

      {loading && <p>Searching...</p>}

      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Blood Group</th><th>Phone</th><th>Location</th></tr>
        </thead>
        <tbody>
          {donors.map((d) => (
            <tr key={d._id}>
              <td>{d.name}</td>
              <td><span className="blood-badge">{d.bloodGroup}</span></td>
              <td>{d.phone}</td>
              <td>{d.location}</td>
            </tr>
          ))}
          {!loading && donors.length === 0 && (
            <tr><td colSpan={4}>No donors found matching your search.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
