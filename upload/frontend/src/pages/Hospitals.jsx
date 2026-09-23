// Public directory of hospitals/blood banks with search and map directions.
// Add/edit/delete now lives in the Admin Panel (/admin/hospitals).

import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useLang } from '../i18n';

export default function Hospitals() {
  const { t } = useLang();
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      api.get('/hospitals', { params: search ? { search } : {} }).then((res) => setHospitals(res.data));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="page">
      <h2>{t('hospitalsTitle')}</h2>
      <input
        className="search-bar"
        placeholder="Search by name or address..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Address</th><th>Contact</th><th>Type</th><th>Directions</th></tr>
        </thead>
        <tbody>
          {hospitals.map((h) => (
            <tr key={h._id}>
              <td>{h.name}</td>
              <td>{h.address}</td>
              <td>{h.contactNumber}</td>
              <td>{h.type === 'blood_bank' ? 'Blood Bank' : 'Hospital'}</td>
              <td>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="small-button"
                >
                  Directions →
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
