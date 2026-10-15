// The member home screen. Everything administrative lives in the separate
// console at /admin - this page is purely what a member needs.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTour, hasSeenTour, markTourSeen } from '../context/TourContext';
import BloodSupplyMonitor from '../components/BloodSupplyMonitor';
import DonorMap from '../components/DonorMap';

const ACTIONS = [
  { to: '/availability', label: 'Check blood stock' },
  { to: '/donors', label: 'Find a donor' },
  { to: '/camps', label: 'Donation camps' },
  { to: '/requests', label: 'Blood requests' },
  { to: '/appointments', label: 'Book a doctor' },
  { to: '/profile', label: 'My profile & QR' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { openTour } = useTour();
  const [summary, setSummary] = useState(null);
  const [myCamps, setMyCamps] = useState([]);

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

  useEffect(() => {
    api.get('/donations/mine').then((res) => setSummary(res.data.summary)).catch(() => {});
    api.get('/camps/mine/list').then((res) => setMyCamps(res.data)).catch(() => {});
  }, []);

  const upcoming = myCamps.filter((c) => c.status === 'upcoming');

  return (
    <div className="page app-dashboard">
      <p className="app-eyebrow">Signed in</p>
      <h2 className="app-heading">{user?.name}</h2>
      <p className="app-subtext">One donation can save up to three lives.</p>

      <div className="action-row">
        {ACTIONS.map((a) => (
          <Link to={a.to} key={a.to} className="action-badge">{a.label}</Link>
        ))}
      </div>

      {/* Donor status card - the member's own record at a glance. */}
      {summary && (
        <div className="donor-strip">
          <div className="donor-strip-main">
            <span className={`tier-badge big ${summary.tier.toLowerCase()}`}>{summary.tier}</span>
            <div>
              <strong>{summary.count} donation{summary.count === 1 ? '' : 's'} recorded</strong>
              <small>
                {summary.count === 0
                  ? 'Your first recorded donation puts you on the leaderboard.'
                  : summary.nextTier
                    ? `${summary.nextTier.needed} more to reach ${summary.nextTier.label}.`
                    : 'You have reached the top tier. Thank you.'}
              </small>
            </div>
          </div>
          <div className="donor-strip-stats">
            <span><strong>{summary.units}</strong>units</span>
            <span><strong>{summary.livesTouched}</strong>people helped</span>
          </div>
          <Link to="/my-donations" className="small-button">My record</Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <div className="section-header"><h3>Your upcoming camps</h3></div>
          {upcoming.map((c) => (
            <div className="info-card" key={c._id}>
              <div className="info-card-icon" aria-hidden="true" />
              <div>
                <strong>{c.title}</strong>
                <p>
                  {new Date(`${c.date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                  {' · '}{c.startTime} · {c.venue}, {c.city}
                </p>
              </div>
              <Link to={`/camps/${c._id}`} className="small-button">Details</Link>
            </div>
          ))}
        </>
      )}

      <div className="banner-card">
        <div className="banner-text">
          <span className="banner-tag">Give blood</span>
          <h3>Fifteen minutes of your day can save someone's life.</h3>
          <Link to="/camps" className="banner-button">Find a camp near you</Link>
        </div>
      </div>

      <BloodSupplyMonitor />

      <div className="section-header"><h3>Quick links</h3></div>
      <div className="info-card">
        <div className="info-card-icon" aria-hidden="true" />
        <div>
          <strong>Search live blood bank stock</strong>
          <p>Filter by state, district and blood group before you travel.</p>
        </div>
        <Link to="/availability" className="small-button">Open</Link>
      </div>
      <div className="info-card">
        <div className="info-card-icon" aria-hidden="true" />
        <div>
          <strong>Your emergency QR code</strong>
          <p>Blood group, allergies and next of kin — readable by anyone who scans it.</p>
        </div>
        <Link to="/profile" className="small-button">Open</Link>
      </div>
      <div className="info-card">
        <div className="info-card-icon" aria-hidden="true" />
        <div>
          <strong>Before you donate</strong>
          <p>Eligibility, preparation and recovery, in short plain-English guides.</p>
        </div>
        <Link to="/guides" className="small-button">Open</Link>
      </div>

      <DonorMap />
    </div>
  );
}
