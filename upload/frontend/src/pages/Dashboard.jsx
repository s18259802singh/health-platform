import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DonorMap from '../components/DonorMap';
import { useAuth } from '../context/AuthContext';

const ACTIONS = [
  { to: '/donors', label: 'Find a donor' },
  { to: '/requests', label: 'Blood requests' },
  { to: '/appointments', label: 'Book a doctor' },
  { to: '/hospitals', label: 'Hospitals & blood banks' },
  { to: '/blogs', label: 'Health blog' },
  { to: '/profile', label: 'My profile & QR' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [supply, setSupply] = useState([]);
  useEffect(() => {
    // live blood availability - real counts from the database
    api.get('/stats/blood-supply').then((res) => setSupply(res.data)).catch(() => {});
  }, []);
  const maxDonors = Math.max(1, ...supply.map((s) => s.donors));

  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  // One-click sample data loader (admin only) - replaces `npm run seed`.
  const handleLoadSampleData = async () => {
    if (!confirm('This will RESET all sample data (donors, hospitals, doctors, blogs, appointments, requests). Your admin account stays. Continue?')) return;
    setSeeding(true);
    setSeedMessage('Loading sample data... this can take up to a minute.');
    try {
      const { data } = await api.post('/admin/seed');
      setSeedMessage(`Done! Loaded ${data.donors} donors, ${data.hospitals} hospitals, ${data.doctors} doctors and ${data.blogs} blog articles.`);
    } catch (err) {
      setSeedMessage(err.response?.data?.message || 'Loading sample data failed.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="page app-dashboard">
      <p className="app-eyebrow">Signed in</p>
      <h2 className="app-heading">{user?.name}</h2>
      <p className="app-subtext">
        {user?.role === 'admin' ? 'Administrator account' : 'One donation can save up to three lives.'}
      </p>

      <div className="action-row">
        {ACTIONS.map((a) => (
          <Link to={a.to} key={a.to} className="action-badge">
            {a.label}
          </Link>
        ))}
      </div>

      <div className="banner-card">
        <div className="banner-text">
          <span className="banner-tag">Give blood</span>
          <h3>Fifteen minutes of your day can save someone's life.</h3>
          <Link to="/appointments" className="banner-button">Book an appointment</Link>
        </div>
      </div>

      {supply.length > 0 && (
        <>
          <div className="section-header">
            <h3>Live Blood Supply</h3>
          </div>
          <p className="supply-caption">Willing donors registered per blood group, live from the database. A pulsing bag means open requests outnumber donors - a shortage.</p>
          <div className="supply-row">
            {supply.map((s) => {
              const shortage = s.pendingRequests > s.donors;
              const fill = Math.max(14, Math.round((s.donors / maxDonors) * 100));
              return (
                <div key={s.group} className={`blood-bag ${shortage ? 'shortage' : ''}`} title={`${s.donors} donors · ${s.pendingRequests} open requests`}>
                  <div className="bag-body">
                    <div className="bag-fill" style={{ height: `${fill}%` }} />
                    <span className="bag-group">{s.group}</span>
                  </div>
                  <span className="bag-count">{s.donors}</span>
                  {shortage && <span className="bag-alert">needed</span>}
                </div>
              );
            })}
          </div>
        </>
      )}

      <DonorMap />

      <div className="section-header">
        <h3>Our Impact</h3>
      </div>
      <div className="stats-row">
        <div className="stat-box">
          <strong>2,400+</strong>
          <span>Registered Donors</span>
        </div>
        <div className="stat-box">
          <strong>850+</strong>
          <span>Lives Saved</span>
        </div>
        <div className="stat-box">
          <strong>60+</strong>
          <span>Partner Hospitals</span>
        </div>
      </div>

      <div className="section-header">
        <h3>Quick Links</h3>
      </div>
      <div className="info-card">
        <div className="info-card-icon" aria-hidden="true"></div>
        <div>
          <strong>Find nearby hospitals & blood banks</strong>
          <p>Check availability before you head out.</p>
        </div>
        <Link to="/hospitals" className="small-button">Open</Link>
      </div>
      <div className="info-card">
        <div className="info-card-icon" aria-hidden="true"></div>
        <div>
          <strong>Search for compatible donors</strong>
          <p>Filter by blood group and city.</p>
        </div>
        <Link to="/donors" className="small-button">Open</Link>
      </div>

      {user?.role === 'admin' && (
        <>
          <div className="section-header"><h3>Admin</h3></div>
          <div className="info-card">
            <div className="info-card-icon" aria-hidden="true"></div>
            <div>
              <strong>Manage hospitals</strong>
              <p>Add, edit, or remove hospital listings.</p>
            </div>
            <Link to="/hospitals" className="small-button">Manage</Link>
          </div>
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
        </>
      )}
    </div>
  );
}
