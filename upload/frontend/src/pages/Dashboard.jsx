import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTour, hasSeenTour, markTourSeen } from '../context/TourContext';
import { useLang } from '../i18n';
import BloodSupplyMonitor from '../components/BloodSupplyMonitor';
import DonorMap from '../components/DonorMap';

// USER dashboard. All administration (hospitals, blog, users, sample data)
// now lives in the separate Admin Panel at /admin.

export default function Dashboard() {
  const { user } = useAuth();
  const { openTour } = useTour();
  const { t } = useLang();

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

  return (
    <div className="page app-dashboard">
      <p className="app-eyebrow">{t('signedIn')}</p>
      <h2 className="app-heading">{user?.name}</h2>
      <p className="app-subtext">
        {user?.role === 'admin'
          ? 'Administrator - open the Admin Panel from the menu to manage the platform.'
          : 'One donation can save up to three lives.'}
      </p>

      <div className="action-row">
        {ACTIONS.map((a) => (
          <Link to={a.to} key={a.to} className="action-badge">
            {a.label}
          </Link>
        ))}
        {user?.role === 'admin' && (
          <Link to="/admin" className="action-badge admin-nav-link">Admin Panel</Link>
        )}
      </div>

      <div className="banner-card">
        <div className="banner-text">
          <span className="banner-tag">{t('giveBlood')}</span>
          <h3>{t('heroLine')}</h3>
          <Link to="/appointments" className="banner-button">{t('bookAppointment')}</Link>
        </div>
      </div>

      <BloodSupplyMonitor />

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

      <DonorMap />
    </div>
  );
}
