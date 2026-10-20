// The member home screen, as a bento grid.
// Everything administrative lives in the console at /admin.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTour, hasSeenTour, markTourSeen } from '../context/TourContext';
import BloodSupplyMonitor from '../components/BloodSupplyMonitor';
import DonorMap from '../components/DonorMap';
import { CAN_DONATE_TO, nextEligibleDate, daysUntil } from '../lib/blood';
import BloodGroup from '../components/BloodGroup';

// Mirrors the tiers the API awards, so the ladder below always matches the
// badge the server sent.
const TIERS = ['Donor', 'Bronze', 'Silver', 'Gold', 'Platinum'];

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
  const [requests, setRequests] = useState([]);

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
    api.get('/donation-requests', { params: { status: 'pending' } })
      .then((r) => setRequests(r.data)).catch(() => {});
  }, []);

  const upcoming = myCamps.filter((c) => c.status === 'upcoming');
  const nextTarget = summary?.nextTier ? summary.count + summary.nextTier.needed : summary?.count || 0;

  // When this member can next give. 90 days is the standard interval between
  // whole blood donations; somebody who has never donated is eligible now.
  const eligibleOn = nextEligibleDate(summary?.lastDonation);
  const waitDays = eligibleOn ? daysUntil(new Date(eligibleOn)) : 0;
  const eligibleNow = waitDays <= 0;

  // Open requests this member could actually answer, newest first. Filtering
  // by what their group can give to is the whole point - a board of requests
  // they are not able to help with is just noise on a personal dashboard.
  const myGroup = user?.bloodGroup;
  const canAnswer = myGroup && CAN_DONATE_TO[myGroup]
    ? requests.filter((r) => CAN_DONATE_TO[myGroup].includes(r.bloodGroupNeeded)).slice(0, 4)
    : requests.slice(0, 4);

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
            {/* A brand-new member has a 0 ring, a one-line note and nothing
                else, which left most of this tall tile empty. These are the
                three things that are true and useful on day one. */}
            <ul className="donor-tile-facts">
              <li>
                <strong className="ready-group">
                  {user?.bloodGroup ? <BloodGroup group={user.bloodGroup} variant="bare" /> : '—'}
                </strong>
                <span>Your group</span>
              </li>
              <li><strong>{user?.location || '—'}</strong><span>Registered in</span></li>
              <li>
                <strong>{summary.count > 0 ? `#${summary.count}` : 'Not yet'}</strong>
                <span>{summary.count > 0 ? 'Donations logged' : 'On the board'}</span>
              </li>
            </ul>

            <div className="tier-ladder">
              <div className="tier-ladder-track">
                {TIERS.map((t, i) => {
                  const here = TIERS.indexOf(summary.tier);
                  return <span key={t} className={i < here ? 'done' : i === here ? 'now' : ''} />;
                })}
              </div>
              <div className="tier-ladder-names">
                <b>{summary.tier}</b>
                <span>
                  {summary.nextTier
                    ? `${summary.nextTier.needed} to ${summary.nextTier.label}`
                    : 'Top tier'}
                </span>
              </div>
            </div>

            <div className="tile-foot">
              <Link to="/my-donations" className="tile-link">My record &amp; certificates →</Link>
            </div>
          </section>
        )}

        <section className={`tile ${summary ? 't-7' : 't-12'}`}>
          <DonorMap />
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

      {/* ------------------------------- when you can give, and who needs it */}
      <div className="bento">
        <section className={`tile t-4 ready-tile ${eligibleNow ? 'is-ready' : ''}`}>
          <span className="tile-label">Next donation</span>
          {eligibleNow ? (
            <>
              <strong className="ready-headline">You can give today</strong>
              <p className="tile-sub">
                {summary?.lastDonation
                  ? 'More than 90 days have passed since your last donation, so you are clear to give again.'
                  : 'Nothing on your record yet — your first donation can be at any camp.'}
              </p>

              {/* This half of the card used to be empty space. It carries the
                  same three facts the waiting state does, so the tile says
                  something whichever side of the 90 days you are on. */}
              <div className="ready-meta">
                <div>
                  <span>Your group</span>
                  <strong className="ready-group">
                    {user?.bloodGroup ? <BloodGroup group={user.bloodGroup} variant="bare" /> : '—'}
                  </strong>
                </div>
                <div>
                  <span>Last donated</span>
                  <strong>
                    {summary?.lastDonation
                      ? new Date(summary.lastDonation).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Never'}
                  </strong>
                </div>
                <div>
                  <span>Donations</span>
                  <strong>{summary?.count ?? 0}</strong>
                </div>
              </div>

              <ul className="ready-checklist">
                <li>Eat normally and drink plenty of water beforehand</li>
                <li>Carry photo ID — the centre records every unit against it</li>
                <li>Allow about 30 minutes, of which 10 is the donation itself</li>
              </ul>

              <div className="tile-foot ready-actions">
                <Link to="/camps" className="tile-link">Book a slot at a camp →</Link>
                <Link to="/requests" className="tile-link">See who needs blood →</Link>
              </div>
            </>
          ) : (
            <>
              <strong className="ready-headline">{waitDays} day{waitDays === 1 ? '' : 's'} to go</strong>
              <p className="tile-sub">
                Eligible again on{' '}
                {new Date(eligibleOn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
                The interval between whole blood donations is 90 days.
              </p>
              <div className="ready-meta">
                <div>
                  <span>Your group</span>
                  <strong className="ready-group">
                    {user?.bloodGroup ? <BloodGroup group={user.bloodGroup} variant="bare" /> : '—'}
                  </strong>
                </div>
                <div>
                  <span>Last donated</span>
                  <strong>
                    {summary?.lastDonation
                      ? new Date(summary.lastDonation).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </strong>
                </div>
              </div>
              <div className="tile-foot">
                <Link to="/guides" className="tile-link">Why the wait →</Link>
              </div>
            </>
          )}
        </section>

        <section className="tile t-8">
          <div className="tile-head">
            <h3>Requests you can answer</h3>
            <Link className="tile-link" to="/requests">All requests →</Link>
          </div>
          {canAnswer.length === 0 ? (
            <p className="tile-sub">
              No open requests match your blood group right now. That is good news.
            </p>
          ) : (
            <>
              <p className="tile-sub">
                {myGroup
                  ? <>Open requests for groups <strong>{myGroup}</strong> can give to.</>
                  : <>Open requests across the network.</>}
              </p>
              <ul className="req-mini-list">
                {canAnswer.map((r) => (
                  <li key={r._id}>
                    <BloodGroup group={r.bloodGroupNeeded} className="req-mini-group" />
                    <span className="req-mini-body">
                      <strong>{r.location}</strong>
                      <small>
                        Posted by {r.requesterId?.name || 'a member'}
                        {r.createdAt && ` · ${new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                      </small>
                    </span>
                    {r.requesterId?.phone && (
                      <a className="small-button" href={`tel:${r.requesterId.phone}`}>Call</a>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
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
          <ul className="fact-list">
            <li><strong>18–65</strong> years old, and at least <strong>45 kg</strong></li>
            <li>Haemoglobin of <strong>12.5 g/dL</strong> or above</li>
            <li><strong>90 days</strong> between whole blood donations</li>
            <li>Takes about <strong>15 minutes</strong>, plus a short rest</li>
          </ul>
          <div className="tile-foot">
            <Link to="/guides" className="tile-link">Open the guide library →</Link>
          </div>
        </section>
      </div>

      {/* ---------------------------------------------- the rest of the app */}
      <div className="bento">
        <section className="tile t-4">
          <div className="tile-head"><h3>Your emergency QR</h3></div>
          <p className="tile-sub">
            A paramedic can scan it and see your blood group, allergies and next
            of kin without unlocking your phone.
          </p>
          <div className="tile-foot">
            <Link to="/profile" className="tile-link">Open my QR profile →</Link>
          </div>
        </section>

        <section className="tile t-4">
          <div className="tile-head"><h3>Check stock near you</h3></div>
          <p className="tile-sub">
            Search licensed blood banks and hospitals by district and group
            before you travel to one.
          </p>
          <div className="tile-foot">
            <Link to="/availability" className="tile-link">Search availability →</Link>
          </div>
        </section>

        <section className="tile t-4">
          <div className="tile-head"><h3>Book a doctor</h3></div>
          <p className="tile-sub">
            Appointments at any hospital in the network, with the specialists
            and slots each one actually offers.
          </p>
          <div className="tile-foot">
            <Link to="/appointments" className="tile-link">Book an appointment →</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
