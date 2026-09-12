import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTour, hasSeenTour, markTourSeen } from '../context/TourContext';
import { useLang } from '../i18n';

export default function Dashboard() {
  const { user } = useAuth();
  const { openTour } = useTour();
  const { t } = useLang();
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const ACTIONS = [
    { to: '/donors', label: t('findDonor') },
    { to: '/requests', label: t('bloodRequests') },
    { to: '/appointments', label: t('bookDoctor') },
    { to: '/hospitals', label: t('hospitalsBanks') },
    { to: '/blogs', label: t('healthBlog') },
    { to: '/profile', label: t('profileQr') },
  ];

  // First-time-ever visit to the dashboard: open the guided tour automatically,
  // once per account. Every visit after that, the tour stays closed until the
  // user asks for it again via the Help button or the floating "?" button.
  useEffect(() => {
    if (!user) return;
    if (!hasSeenTour(user._id || user.id)) {
      markTourSeen(user._id || user.id);
      const timer = setTimeout(() => openTour(0), 500);
      return () => clearTimeout(timer);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <p className="app-eyebrow">{t('signedIn')}</p>
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
          <span className="banner-tag">{t('giveBlood')}</span>
          <h3>{t('heroLine')}</h3>
          <Link to="/appointments" className="banner-button">{t('bookAppointment')}</Link>
        </div>
      </div>

      <div className="section-header">
        <h3>{t('ourImpact')}</h3>
      </div>
      <div className="stats-row">
        <div className="stat-box">
          <strong>2,400+</strong>
          <span>{t('registeredDonors')}</span>
        </div>
        <div className="stat-box">
          <strong>850+</strong>
          <span>{t('livesSaved')}</span>
        </div>
        <div className="stat-box">
          <strong>60+</strong>
          <span>{t('partnerHospitals')}</span>
        </div>
      </div>

      <div className="section-header">
        <h3>{t('quickLinks')}</h3>
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
