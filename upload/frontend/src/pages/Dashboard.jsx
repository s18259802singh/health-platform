// The member home screen, as a bento grid.
// Everything administrative lives in the console at /admin.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTour, hasSeenTour, markTourSeen } from '../context/TourContext';
import BloodSupplyMonitor from '../components/BloodSupplyMonitor';

const ACTIONS = [
  { to: '/availability', label: 'Check blood stock', tint: 'rose' },
  { to: '/donors', label: 'Find a donor', tint: 'sand' },
  { to: '/camps', label: 'Donation camps', tint: 'mint' },
  { to: '/requests', label: 'Blood requests', tint: 'sky' },
  { to: '/appointments', label: 'Book a doctor', tint: 'slate' },
  { to: '/profile', label: 'My QR profile', tint: 'rose' },
];

// A ring gauge: how far through the current tier the member is.
function Ring({ value, max, caption }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;

  return (
    <div className="tile-ring">
      <svg viewBox="0 0 104 104" role="img" aria-label={`${value} of ${max}`}>
        <circle className="track" cx="52" cy="52" r={r} />
        <circle className="fill" cx="52" cy="52" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <span className="tile-ring-label">
        <strong>{value}</strong>
        <small>{caption}</small>
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { openTour } = useTour();
  const [summary, setSummary] = useState(null);
  const [myCamps, setMyCamps] = useState([]);

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
    api.get('/donations/mine').then((r) => setSummary(r.data.summary)).catch(() => {});
    api.get('/camps/mine/list').then((r) => setMyCamps(r.data)).catch(() => {});
  }, []);

  const upcoming = myCamps.filter((c) => c.status === 'upcoming');
  const nextTarget = summary?.nextTier ? summary.count + summary.nextTier.needed : summary?.count || 0;

  return (
    <div className="page app-dashboard">
      <div className="page-head">
        <div>
          <p className="app-eyebrow">Signed in</p>
          <h1 className="page-h1">{user?.name}</h1>
          <p>One donation can save up to three lives.</p>
        </div>
      </div>

      {/* --------------------------------------- donor status + shortcuts */}
      <div className="bento">
        {summary && (
          <section className="tile ink glow t-5 r-2 donor-tile">
            <span className="tile-label">Your donor status</span>
            <span className={`tier-badge big ${summary.tier.toLowerCase()}`}>{summary.tier}</span>
            <Ring value={summary.count} max={nextTarget} caption="donations" />
            <p className="donor-tile-note">
              {summary.count === 0
                ? 'Your first recorded donation puts you on the leaderboard.'
                : summary.nextTier
                  ? `${summary.nextTier.needed} more to reach ${summary.nextTier.label}.`
                  : 'You have reached the top tier. Thank you.'}
            </p>
            <div className="donor-tile-stats">
              <span><strong>{summary.units}</strong>units</span>
              <span><strong>{summary.livesTouched}</strong>helped</span>
            </div>
            <div className="tile-foot">
              <Link to="/my-donations" className="tile-link">My record &amp; certificates →</Link>
            </div>
          </section>
        )}

        <section className={`tile ${summary ? 't-7' : 't-12'}`}>
          <div className="tile-head"><h3>Jump to</h3></div>
          <div className="shortcut-grid">
            {ACTIONS.map((a) => (
              <Link to={a.to} key={a.to} className={`shortcut ${a.tint}`}>
                {a.label}
              </Link>
            ))}
          </div>
        </section>

        {upcoming.length > 0 && (
          <section className="tile t-7">
            <div className="tile-head">
              <h3>Your upcoming camps</h3>
              <Link className="tile-link" to="/camps">All camps →</Link>
            </div>
            <div className="camp-mini-list">
              {upcoming.map((c) => (
                <Link className="camp-mini" to={`/camps/${c._id}`} key={c._id}>
                  <span className="camp-mini-date">
                    <strong>{new Date(`${c.date}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit' })}</strong>
                    <small>{new Date(`${c.date}T00:00:00`).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}</small>
                  </span>
                  <span className="camp-mini-body">
                    <strong>{c.title}</strong>
                    <small>{c.startTime} · {c.venue}, {c.city}</small>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ------------------------------------------------- live stock tile */}
      <div className="bento">
        <section className="tile t-12">
          <BloodSupplyMonitor />
        </section>
      </div>

      {/* ------------------------------------------------------ prompt row */}
      <div className="bento">
        <section className="tile red glow t-7 cta-tile">
          <div>
            <h3>Fifteen minutes of your day can save someone's life.</h3>
            <p>Find a camp near you and register your slot in advance.</p>
          </div>
          <Link to="/camps" className="btn-light">Find a camp</Link>
        </section>

        <section className="tile sand t-5">
          <div className="tile-head"><h3>Before you donate</h3></div>
          <p className="tile-sub">
            Eligibility, preparation and recovery, in short plain-English guides.
          </p>
          <div className="tile-foot">
            <Link to="/guides" className="tile-link">Open the guide library →</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
