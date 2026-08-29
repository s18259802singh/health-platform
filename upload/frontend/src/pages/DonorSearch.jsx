// Live donor search - this is the "AJAX" module from the roadmap, done in React.
// Every time the blood group or location changes, we call the API again and
// React re-renders the list automatically. No manual DOM updates, no page reload.

import { useEffect, useState } from 'react';
import api from '../api/axios';

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorSearch() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [location, setLocation] = useState('');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (bloodGroup) params.bloodGroup = bloodGroup;
    if (location) params.location = location;

    // small debounce so we don't fire an API call on every single keystroke
    const timer = setTimeout(() => {
      api.get('/donors', { params })
        .then((res) => setDonors(res.data))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [bloodGroup, location]);

  return (
    <div className="page">
      <h2>Find Blood Donors</h2>
      <div className="search-bar">
        <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
          {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg || 'Any Blood Group'}</option>)}
        </select>
        <input
          placeholder="Search by city / location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

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
