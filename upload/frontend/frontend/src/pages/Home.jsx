// Public landing page. Signed-in members are sent straight to their dashboard,
// so this is what a first-time visitor sees.

import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { n: '01', title: 'Register in two minutes', text: 'Tell us your blood group, city and emergency contact. Tick one box to join the donor list.' },
  { n: '02', title: 'Carry your emergency QR', text: 'Every member gets a QR code. Scanned by anyone, it shows blood group, allergies and next of kin — no login needed.' },
  { n: '03', title: 'Find help, or be the help', text: 'Search compatible donors by group and city, post a request, or answer someone else’s.' },
];

const FEATURES = [
  { title: 'Live donor search', text: 'Filter willing donors by blood group and city, with a compatibility checker so you only call people who can actually give.' },
  { title: 'Blood request board', text: 'Post what you need and where. Donors see it instantly with your contact details.' },
  { title: 'Hospitals & blood banks', text: 'A searchable directory with stock levels and one-tap directions.' },
  { title: 'Doctor appointments', text: 'Book a slot with a listed doctor without double-booking anyone.' },
  { title: 'Emergency QR profile', text: 'The information a paramedic needs, on a card in your wallet or a screenshot on your phone.' },
  { title: 'Health blog', text: 'Plain-English articles on donating safely, first aid and staying well.' },
];

export default function Home() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-text">
          <span className="hero-tag">Health emergency &amp; blood donor network</span>
          <h1>When someone needs blood, minutes decide the outcome.</h1>
          <p>
            LifeLink puts donors, patients, hospitals and blood banks on one map — so finding
            a compatible donor takes a search box, not a chain of phone calls.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-primary">Join as a donor</Link>
            <Link to="/login" className="btn-secondary">Sign in</Link>
          </div>
          <p className="hero-note">Free for individuals. Your contact details are only shown to signed-in members.</p>
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

      <section className="home-section">
        <div className="section-header"><h3>What’s inside</h3></div>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <strong>{f.title}</strong>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div>
          <h3>One donation can save up to three lives.</h3>
          <p>It takes fifteen minutes. Join the register and we’ll only contact you when your group is needed.</p>
        </div>
        <Link to="/register" className="btn-primary">Create your account</Link>
      </section>
    </div>
  );
}
