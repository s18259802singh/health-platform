// THE LANDING PAGE
// The hybrid: the warmth and storytelling of a modern donation platform on the
// outside, the hard data of a blood-bank portal running underneath it. Every
// number on this page is read from the API, never typed into the markup.

import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const STEPS = [
  { n: '01', title: 'Register in two minutes', text: 'Blood group, city, emergency contact. Tick one box to join the donor register.' },
  { n: '02', title: 'Carry your emergency QR', text: 'Scanned by anyone, it shows your group, allergies and next of kin — no login needed.' },
  { n: '03', title: 'Find help, or be the help', text: 'Search donors and live blood bank stock, book a camp, or answer a request.' },
];

const FAQ = [
  { q: 'Who can donate blood?', a: 'Generally anyone aged 18 to 65, weighing at least 45 kg, with haemoglobin of 12.5 g/dL or more, and more than 90 days since their last whole blood donation. The doctor at the centre confirms eligibility on the day.' },
  { q: 'Does it cost anything?', a: 'No. LifeLink is free for donors and recipients. Blood centres may charge processing fees set by their own authority — that is between you and the centre.' },
  { q: 'Who can see my phone number?', a: 'Only signed-in members searching the donor register, and only if you chose to join it. The public availability search and the leaderboard never expose contact details.' },
  { q: 'How current is the blood stock data?', a: 'Stock figures are whatever each centre last recorded. They can change within minutes, so always telephone before travelling.' },
  { q: 'What is the emergency QR?', a: 'A code generated when you register. Anyone who scans it sees your blood group, allergies and emergency contact — nothing else, and no account is required.' },
  { q: 'How do I get on the leaderboard?', a: 'Donations are recorded by a blood centre after you give. Once recorded they count towards your tier and generate your certificate.' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [camps, setCamps] = useState([]);
  const [stories, setStories] = useState([]);
  const [board, setBoard] = useState([]);
  const [quick, setQuick] = useState({ bloodGroup: '', search: '' });
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    // Each of these is independent; a failure in one must not blank the page.
    api.get('/donations/leaderboard', { params: { limit: 5 } })
      .then((res) => { setStats(res.data.totals); setBoard(res.data.entries || []); })
      .catch(() => {});
    api.get('/camps', { params: { upcoming: 'true' } })
      .then((res) => setCamps(res.data.slice(0, 3))).catch(() => {});
    api.get('/stories', { params: { featured: 'true', limit: 3 } })
      .then((res) => setStories(res.data)).catch(() => {});
  }, []);

  if (user) return <Navigate to="/dashboard" replace />;

  const runQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (quick.bloodGroup) params.set('group', quick.bloodGroup);
    if (quick.search) params.set('q', quick.search);
    navigate(`/availability?${params.toString()}`);
  };

  return (
    <div className="landing">
      {/* ----------------------------------------------------------- hero */}
      <section className="hero">
        <div className="hero-text">
          <span className="hero-tag">Health emergency &amp; blood donor network</span>
          <h1>When someone needs blood, minutes decide the outcome.</h1>
          <p>
            LifeLink puts donors, patients, hospitals and blood banks on one map — so
            finding a compatible donor takes a search box, not a chain of phone calls.
          </p>

          {/* The portal half, surfaced right in the hero. */}
          <form className="hero-search" onSubmit={runQuickSearch}>
            <div className="hero-search-row">
              <select
                aria-label="Blood group"
                value={quick.bloodGroup}
                onChange={(e) => setQuick((q) => ({ ...q, bloodGroup: e.target.value }))}
              >
                <option value="">Any group</option>
                {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <input
                aria-label="City or blood centre"
                placeholder="City or blood centre…"
                value={quick.search}
                onChange={(e) => setQuick((q) => ({ ...q, search: e.target.value }))}
              />
              <button type="submit" className="btn-primary">Check availability</button>
            </div>
            <small>Searches live blood bank stock. No account needed.</small>
          </form>

          <div className="hero-actions">
            <Link to="/register" className="btn-primary">Join as a donor</Link>
            <Link to="/camps" className="btn-secondary">Find a camp</Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-card">
            <span className="hero-card-tag">Emergency profile</span>
            <strong className="hero-card-group">O−</strong>
            <span className="hero-card-label">Universal donor</span>
            <div className="hero-card-rows">
              <span><em>Allergies</em> Penicillin</span>
              <span><em>Contact</em> Next of kin</span>
              <span><em>City</em> Ahmedabad</span>
            </div>
          </div>
          <div className="hero-pulse" />
        </div>
      </section>

      {/* -------------------------------------------------------- counters */}
      {stats && (
        <section className="counter-band">
          <div><strong>{stats.donors ?? 0}</strong><span>active donors</span></div>
          <div><strong>{stats.donations ?? 0}</strong><span>donations recorded</span></div>
          <div><strong>{stats.units ?? 0}</strong><span>units given</span></div>
          <div className="accent"><strong>{stats.livesTouched ?? 0}</strong><span>people potentially helped</span></div>
        </section>
      )}

      {/* ------------------------------------------------------------ camps */}
      {camps.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <h3>Upcoming camps</h3>
            <Link className="section-link" to="/camps">All camps →</Link>
          </div>
          <div className="home-camp-row">
            {camps.map((c) => {
              const d = new Date(`${c.date}T00:00:00`);
              const left = Math.max(0, (c.slots || 0) - (c.registrations?.length || 0));
              return (
                <Link className="home-camp" to={`/camps/${c._id}`} key={c._id}>
                  <span className="home-camp-date">
                    <strong>{d.toLocaleDateString('en-GB', { day: '2-digit' })}</strong>
                    <small>{d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}</small>
                  </span>
                  <span className="home-camp-body">
                    <strong>{c.title}</strong>
                    <small>{c.venue}, {c.city}</small>
                    <em>{left} slots left</em>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------ steps */}
      <section className="home-section">
        <div className="section-header"><h3>How it works</h3></div>
        <div className="step-grid">
          {STEPS.map((s) => (
            <div className="step-card" key={s.n}>
              <span className="step-n">{s.n}</span>
              <strong>{s.title}</strong>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- stories */}
      {stories.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <h3>Stories that remind us why</h3>
            <Link className="section-link" to="/stories">All stories →</Link>
          </div>
          <div className="story-feature-grid">
            {stories.map((s) => (
              <article className="story-feature" key={s._id}>
                <span className={`story-role ${s.role}`}>{s.role}</span>
                <h3><Link to={`/stories/${s._id}`}>{s.headline}</Link></h3>
                <div className="story-byline">
                  <span className="story-avatar" aria-hidden="true">{s.name.charAt(0)}</span>
                  <span>
                    <strong>{s.name}</strong>
                    <small>{[s.bloodGroup, s.city].filter(Boolean).join(' · ')}</small>
                  </span>
                </div>
                <Link className="blog-readmore" to={`/stories/${s._id}`}>Read the story →</Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------ board + guides */}
      <section className="home-split">
        <div className="home-board">
          <div className="section-header">
            <h3>Top donors</h3>
            <Link className="section-link" to="/leaderboard">Full board →</Link>
          </div>
          {board.length === 0 ? <p className="hint">No donations recorded yet.</p> : (
            <ol className="mini-board">
              {board.map((e) => (
                <li key={e.rank}>
                  <span className="mini-rank">{e.rank}</span>
                  <span className="mini-name">
                    <strong>{e.name}</strong>
                    <small>{e.city || '—'}</small>
                  </span>
                  <span className={`tier-badge ${e.tier.toLowerCase()}`}>{e.tier}</span>
                  <span className="mini-count">{e.donations}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="home-guides">
          <div className="section-header">
            <h3>Before you donate</h3>
            <Link className="section-link" to="/guides">Guide library →</Link>
          </div>
          <div className="guide-teasers">
            <Link to="/guides"><strong>Can I donate blood?</strong><small>Age, weight, haemoglobin and the gap between donations.</small></Link>
            <Link to="/guides"><strong>The 24 hours before</strong><small>Sleep, food, water and the two things to avoid.</small></Link>
            <Link to="/guides"><strong>What the appointment is like</strong><small>Step by step, from the front desk to the biscuit.</small></Link>
            <Link to="/guides"><strong>Rebuilding your iron</strong><small>What your body replaces, how fast, and what helps.</small></Link>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- faq */}
      <section className="home-section">
        <div className="section-header"><h3>Common questions</h3></div>
        <div className="faq-list">
          {FAQ.map((f, i) => (
            <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={f.q}>
              <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                <span>{f.q}</span>
                <em aria-hidden="true">{openFaq === i ? '−' : '+'}</em>
              </button>
              {openFaq === i && <p>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- cta */}
      <section className="cta-band">
        <div>
          <h3>One donation can save up to three lives.</h3>
          <p>It takes fifteen minutes. Join the register and we'll only contact you when your group is needed.</p>
        </div>
        <Link to="/register" className="btn-primary">Create your account</Link>
      </section>
    </div>
  );
}
