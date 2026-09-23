// ADMIN > OVERVIEW
// Live platform counts (from /api/admin/overview) plus the one-click
// sample data loader that used to sit on the user dashboard.

import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const loadStats = () => {
    api.get('/admin/overview').then((res) => setStats(res.data)).catch(() => setStats(null));
  };

  useEffect(loadStats, []);

  const handleLoadSampleData = async () => {
    if (!confirm('This will RESET all sample data (donors, hospitals, doctors, blogs, appointments, requests). Your admin account stays. Continue?')) return;
    setSeeding(true);
    setSeedMessage('Loading sample data... this can take up to a minute.');
    try {
      const { data } = await api.post('/admin/seed');
      setSeedMessage(`Done! Loaded ${data.donors} donors, ${data.hospitals} hospitals, ${data.doctors} doctors and ${data.blogs} blog articles.`);
      loadStats();
    } catch (err) {
      setSeedMessage(err.response?.data?.message || 'Loading sample data failed.');
    } finally {
      setSeeding(false);
    }
  };

  const CARDS = stats ? [
    ['Registered users', stats.users],
    ['Willing donors', stats.donors],
    ['Hospitals & blood banks', stats.hospitals],
    ['Doctors', stats.doctors],
    ['Appointments booked', stats.appointments],
    ['Blood requests (pending)', `${stats.requests} (${stats.pendingRequests})`],
    ['Blog articles', stats.blogs],
  ] : [];

  return (
    <div className="page">
      <h2>Overview</h2>
      <p className="app-subtext">Live counts straight from the database.</p>

      {!stats && <p>Loading statistics...</p>}
      <div className="admin-stats-grid">
        {CARDS.map(([label, value]) => (
          <div className="stat-box" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="section-header"><h3>Tools</h3></div>
      <div className="info-card">
        <div className="info-card-icon" aria-hidden="true"></div>
        <div>
          <strong>Load sample data</strong>
          <p>Fills the app with 150 donors, 110 hospitals, doctors and blog articles. Resets existing sample data.</p>
          {seedMessage && <p className="hint">{seedMessage}</p>}
        </div>
        <button className="small-button" onClick={handleLoadSampleData} disabled={seeding}>
          {seeding ? 'Loading...' : 'Load'}
        </button>
      </div>
    </div>
  );
}
