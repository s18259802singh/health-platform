// THE LANDING PAGE — built as a bento composition.
// Tiles of different sizes and tints on one 12-column grid, so the page reads
// as a single layout rather than a stack of sections. Every number is read
// from the API; none of them are typed into the markup.

import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const STEPS = [
  { n: '01', tint: 'sand', title: 'Register in two minutes', text: 'Blood group, city, emergency contact. One box joins the donor register.' },
  { n: '02', tint: 'mint', title: 'Carry your emergency QR', text: 'Scanned by anyone, it shows your group, allergies and next of kin — no login.' },
  { n: '03', tint: 'sky', title: 'Find help, or be the help', text: 'Search live stock, book a camp, or answer somebody’s request.' },
];

const FAQ = [
  { q: 'Who can donate blood?', a: 'Generally anyone aged 18 to 65, weighing at least 45 kg, with haemoglobin of 12.5 g/dL or more, and more than 90 days since their last whole blood donation. The doctor at the centre confirms eligibility on the day.' },
  { q: 'Does it cost anything?', a: 'No. LifeLink is free for donors and recipients. Blood centres may charge processing fees set by their own authority — that is between you and the centre.' },
  { q: 'Who can see my phone number?', a: 'Only signed-in members searching the donor register, and only if you chose to join it. The availability search and the leaderboard never expose contact details.' },
  { q: 'How current is the blood stock data?', a: 'Stock figures are whatever each centre last recorded. They can change within minutes, so always telephone before travelling.' },
  { q: 'What is the emergency QR?', a: 'A code generated when you register. Anyone who scans it sees your blood group, allergies and emergency contact — nothing else, and no account is required.' },
  { q: 'How do I get on the leaderboard?', a: 'Donations are recorded by a blood centre after you give. Once recorded they count towards your tier and generate your certificate.' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [supply, setSupply] = useState([]);
  const [camps, setCamps] = useState([]);
  const [stories, setStories] = useState([]);
  const [board, setBoard] = useState([]);
  const [quick, setQuick] = useState({ bloodGroup: '', search: '' });
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    // Independent requests - one failing must not blank the page.
    api.get('/donations/leaderboard', { params: { limit: 5 } })
      .then((r) => { setStats(r.data.totals); setBoard((r.data.entries || []).slice(0, 5)); }).catch(() => {});
    api.get('/camps', { params: { upcoming: 'true' } })
      .then((r) => setCamps(r.data.slice(0, 4))).catch(() => {});
    api.get('/stories', { params: { featured: 'true', limit: 3 } })
      .then((r) => setStories(r.data.slice(0, 3))).catch(() => {});
    api.get('/availability').then((r) => {
      // Build an eight-bar shortage strip from the live directory totals.
      const totals = {};
      (r.data.results || []).forEach((c) => (c.breakdown || []).forEach((b) => {
        totals[b.bloodGroup] = (totals[b.bloodGroup] || 0) + (b.units || 0);
      }));
      setSupply(GROUPS.map((g) => ({ group: g, units: totals[g] || 0 })));
    }).catch(() => {});
  }, []);

  if (user) return <Navigate to="/dashboard" replace />;

  const runQuickSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (quick.bloodGroup) p.set('group', quick.bloodGroup);
    if (quick.search) p.set('q', quick.search);
    navigate(`/availability?${p.toString()}`);
  };

  const maxUnits = Math.max(1, ...supply.map((s) => s.units));

  return (
    <div className="landing">
      {/* ------------------------------------------------- hero + QR tile */}
      <div className="bento">
        <section className="tile ink glow pad-lg t-8 r-2 hero-tile">
          <span className="tile-label">Health emergency &amp; blood donor network</span>
          <h1>When someone needs blood, minutes decide the outcome.</h1>
          <p className="hero-lede">
            Donors, patients, hospitals and blood banks on one map — so finding a
            compatible donor takes a search box, not a chain of phone calls.
          </p>

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
              <button type="submit" className="btn-primary">Check stock</button>
            </div>
            <small>Searches live blood bank stock. No account needed.</small>
          </form>

          <div className="hero-actions">
            <Link to="/register" className="btn-light">Join as a donor</Link>
            <Link to="/camps" className="btn-ghost-light">Find a camp</Link>
          </div>
        </section>

        <aside className="tile t-4 qr-tile">
          <span className="tile-label">Emergency profile</span>
          <strong className="qr-group">O−</strong>
          <span className="tile-sub">Universal donor</span>
          <div className="qr-rows">
            <span><em>Allergies</em> Penicillin</span>
            <span><em>Contact</em> Next of kin</span>
            <span><em>City</em> Ahmedabad</span>
          </div>
          <div className="tile-foot">
            <Link to="/register" className="tile-link">Get your QR →</Link>
          </div>
        </aside>

        <aside className="tile red glow t-4 supply-tile">
          <span className="tile-label">Live stock, all groups</span>
          <div className="tile-spark">
            {supply.map((s) => (
              <span key={s.group} style={{ height: `${Math.max(8, (s.units / maxUnits) * 100)}%` }} title={`${s.group}: ${s.units} units`} />
            ))}
          </div>
          <div className="supply-legend">{GROUPS.map((g) => <em key={g}>{g}</em>)}</div>
          <div className="tile-foot">
            <Link to="/availability" className="tile-link">Search by district →</Link>
          </div>
        </aside>
      </div>

      {/* ------------------------------------------------------- counters */}
      {stats && (
        <div className="bento">
          <div className="tile rose t-3 center">
            <span className="tile-label">Active donors</span>
            <strong className="tile-value">{stats.donors ?? 0}</strong>
          </div>
          <div className="tile sand t-3 center">
            <span className="tile-label">Donations</span>
            <strong className="tile-value">{stats.donations ?? 0}</strong>
          </div>
          <div className="tile mint t-3 center">
            <span className="tile-label">Units given</span>
            <strong className="tile-value">{stats.units ?? 0}</strong>
          </div>
          <div className="tile sky t-3 center">
            <span className="tile-label">People helped</span>
            <strong className="tile-value">{stats.livesTouched ?? 0}</strong>
          </div>
        </div>
      )}

      {/* ----------------------------------------------- camps + stories */}
      <div className="bento">
        <section className="tile t-7">
          <div className="tile-head">
            <h3>Upcoming camps</h3>
            <Link className="tile-link" to="/camps">All camps →</Link>
          </div>
          <div className="camp-mini-list">
            {camps.map((c) => {
              const d = new Date(`${c.date}T00:00:00`);
              const left = Math.max(0, (c.slots || 0) - (c.registrations?.length || 0));
              return (
                <Link className="camp-mini" to={`/camps/${c._id}`} key={c._id}>
                  <span className="camp-mini-date">
                    <strong>{d.toLocaleDateString('en-GB', { day: '2-digit' })}</strong>
                    <small>{d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}</small>
                  </span>
                  <span className="camp-mini-body">
                    <strong>{c.title}</strong>
                    <small>{c.venue}, {c.city}</small>
                  </span>
                  <span className="camp-mini-slots">{left}<em>left</em></span>
                </Link>
              );
            })}
            {camps.length === 0 && <p className="hint">No camps listed yet.</p>}
          </div>
        </section>

        <section className="tile slate t-5">
          <div className="tile-head">
            <h3>Top donors</h3>
            <Link className="tile-link" to="/leaderboard">Full board →</Link>
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
        </section>
      </div>

      {/* --------------------------------------------------------- stories */}
      {stories.length > 0 && (
        <div className="bento">
          {stories.map((s, i) => (
            <article className={`tile lift t-4 ${['rose', 'sand', 'mint'][i % 3]} story-tile`} key={s._id}>
              <span className={`story-role ${s.role}`}>{s.role}</span>
              <h3><Link to={`/stories/${s._id}`}>{s.headline}</Link></h3>
              <div className="story-byline tile-foot">
                <span className="story-avatar" aria-hidden="true">{s.name.charAt(0)}</span>
                <span>
                  <strong>{s.name}</strong>
                  <small>{[s.bloodGroup, s.city].filter(Boolean).join(' · ')}</small>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ----------------------------------------------------------- steps */}
      <div className="bento">
        {STEPS.map((s) => (
          <div className={`tile ${s.tint} t-4`} key={s.n}>
            <span className="step-n">{s.n}</span>
            <strong className="step-title">{s.title}</strong>
            <p className="tile-sub">{s.text}</p>
          </div>
        ))}
      </div>

      {/* --------------------------------------------------- guides + faq */}
      <div className="bento">
        <section className="tile t-5">
          <div className="tile-head">
            <h3>Before you donate</h3>
            <Link className="tile-link" to="/guides">Library →</Link>
          </div>
          <div className="guide-teasers">
            <Link to="/guides"><strong>Can I donate blood?</strong><small>Age, weight, haemoglobin, and the gap between donations.</small></Link>
            <Link to="/guides"><strong>The 24 hours before</strong><small>Sleep, food, water and the two things to avoid.</small></Link>
            <Link to="/guides"><strong>What the appointment is like</strong><small>Step by step, front desk to biscuit.</small></Link>
            <Link to="/guides"><strong>Rebuilding your iron</strong><small>What your body replaces, and what helps.</small></Link>
          </div>
        </section>

        <section className="tile t-7">
          <div className="tile-head"><h3>Common questions</h3></div>
          <div className="faq-list flush">
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
      </div>

      {/* ------------------------------------------------------------- cta */}
      <div className="bento">
        <section className="tile red glow pad-lg t-12 cta-tile">
          <div>
            <h3>One donation can save up to three lives.</h3>
            <p>Fifteen minutes. Join the register and we'll only contact you when your group is needed.</p>
          </div>
          <Link to="/register" className="btn-light">Create your account</Link>
        </section>
      </div>
    </div>
  );
}
