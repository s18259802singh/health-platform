// The member home screen. Everything administrative now lives in the separate
// admin console at /admin - this page is purely what a member needs.

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTour, hasSeenTour, markTourSeen } from '../context/TourContext';
import { useLang } from '../i18n';
import BloodSupplyMonitor from '../components/BloodSupplyMonitor';
import DonorMap from '../components/DonorMap';

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

  // First-ever visit opens the guided tour once per account.
  useEffect(() => {
    if (!user) return undefined;
    if (!hasSeenTour(user._id || user.id)) {
      markTourSeen(user._id || user.id);
      const timer = setTimeout(() => openTour(0), 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page app-dashboard">
      <p className="app-eyebrow">{t('signedIn')}</p>
      <h2 className="app-heading">{user?.name}</h2>
      <p className="app-subtext">One donation can save up to three lives.</p>

      <div className="action-row">
        {ACTIONS.map((a) => (
          <Link to={a.to} key={a.to} className="action-badge">{a.label}</Link>
        ))}
      </div>

      <div className="banner-card">
        <div className="banner-text">
          <span className="banner-tag">{t('giveBlood')}</span>
          <h3>{t('heroLine')}</h3>
          <Link to="/appointments" className="banner-button">{t('bookAppointment')}</Link>
        </div>
      </div>

      <BloodSupplyMonitor />

      <div className="section-header"><h3>{t('quickLinks')}</h3></div>
      <div className="info-card">
        <div className="info-card-icon" aria-hidden="true" />
        <div>
          <strong>Find nearby hospitals &amp; blood banks</strong>
          <p>Check availability before you head out.</p>
        </div>
        <Link to="/hospitals" className="small-button">Open</Link>
      </div>
      <div className="info-card">
        <div className="info-card-icon" aria-hidden="true" />
        <div>
          <strong>Search for compatible donors</strong>
          <p>Filter by blood group and city.</p>
        </div>
        <Link to="/donors" className="small-button">Open</Link>
      </div>
      <div className="info-card">
        <div className="info-card-icon" aria-hidden="true" />
        <div>
          <strong>Your emergency QR code</strong>
          <p>Blood group, allergies and next of kin — readable by anyone who scans it.</p>
        </div>
        <Link to="/profile" className="small-button">Open</Link>
      </div>

      <DonorMap />
    </div>
  );
}
