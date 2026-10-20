// GUIDED TOUR
//
// WHAT CHANGED AND WHY
// The tour used to be a full-screen dialog that NAVIGATED to a different
// page on every step. So "take the tour" meant losing whatever you were
// doing, and each Next threw you somewhere else — it read as being dragged
// around the site rather than being shown it.
//
// It is now a floating panel in the corner, the same size and position as
// the Help chat, opened from its own floating button. It never navigates on
// its own: each step offers a link you can take if you want, and taking one
// is a decision rather than something that happens to you.

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';

const STEPS = [
  {
    title: 'Welcome to LifeLink',
    text: 'A two-minute look at what you can do here — finding donors, asking for blood, booking a doctor, and turning your profile into an emergency medical ID.',
  },
  {
    to: '/dashboard',
    linkLabel: 'Open my dashboard',
    title: 'Your dashboard',
    text: 'Shortcuts to everything, a live blood supply monitor showing real donor counts against open requests per group, and a donor map you can click into.',
  },
  {
    to: '/donors',
    linkLabel: 'Open donor search',
    title: 'Find donors',
    text: 'Search the register by blood group and town. If you are not sure which groups work for the patient, use the compatibility checker at the top and the list filters to everyone able to give to them.',
  },
  {
    to: '/requests',
    linkLabel: 'Open the requests board',
    title: 'Blood requests',
    text: 'See who needs blood right now, or post your own request. Donors call you directly, and you close it off when somebody comes through.',
  },
  {
    to: '/near-me',
    linkLabel: 'Find care near me',
    title: 'Find care near you',
    text: 'Share your location or type your town, and get the closest blood banks and hospitals with what each one has on the shelf — plus the doctors there who treat what you came about.',
  },
  {
    to: '/availability',
    linkLabel: 'Check availability',
    title: 'Blood availability',
    text: 'Every licensed centre in the register with the units it has recorded, filtered by state, district and group. No account needed. Always ring before you travel.',
  },
  {
    to: '/appointments',
    linkLabel: 'Book an appointment',
    title: 'Book a doctor',
    text: 'Pick a hospital, then one of its doctors, then an open slot. Everything you book stays on your account so you can cancel or check it later.',
  },
  {
    to: '/profile',
    linkLabel: 'Open my profile',
    title: 'Your emergency QR',
    text: 'Set your blood group, allergies and next of kin once. LifeLink turns it into a QR code you can print or keep on your lock screen — whoever scans it sees only that, no login needed.',
  },
  {
    title: "That's the tour",
    text: 'Reopen it any time from the tour button in the corner. If you get stuck on something specific, the Help button below it reaches a real person.',
  },
];

function IconCompass() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m15.2 8.8-2 5.4-5.4 2 2-5.4Z" />
    </svg>
  );
}

// The launcher. It sits above the Help button rather than beside it, so the
// two never crowd each other on a phone.
export function TourButton() {
  const { open, openTour } = useTour();
  const { user } = useAuth();
  // Signed-out visitors get the Help chat; the tour describes member pages.
  if (open || !user) return null;
  return (
    <button type="button" className="tour-fab" onClick={() => openTour(0)}
            title="Take the guided tour" aria-label="Take the guided tour">
      <IconCompass />
      <span>Tour</span>
    </button>
  );
}

export default function GuidedTour() {
  const { open, step, setStep, closeTour } = useTour();
  const { user } = useAuth();

  if (!open) return null;

  const s = STEPS[step];
  const go = (n) => setStep(Math.min(STEPS.length - 1, Math.max(0, n)));
  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <section className="tour-panel" role="dialog" aria-label="Guided tour">
      <header className="tour-head">
        <div>
          <strong>Guided tour</strong>
          <small>Step {step + 1} of {STEPS.length}</small>
        </div>
        <button type="button" className="tour-close" onClick={closeTour} aria-label="Close the tour">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.3" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="tour-progress" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>

      <div className="tour-body">
        <h3 className="tour-title">{s.title}</h3>
        <p className="tour-text">{s.text}</p>

        {/* Going to the page is offered, never done for you. The tour stays
            open behind it so you can carry on from where you were. */}
        {s.to && user && (
          <Link className="tour-link" to={s.to}>
            {s.linkLabel || 'Take me there'} →
          </Link>
        )}
      </div>

      <div className="tour-dots" role="tablist" aria-label="Tour steps">
        {STEPS.map((x, i) => (
          <button
            key={x.title}
            type="button"
            className={i === step ? 'on' : ''}
            onClick={() => go(i)}
            aria-label={`Step ${i + 1}: ${x.title}`}
            aria-selected={i === step}
            role="tab"
          />
        ))}
      </div>

      <div className="tour-nav">
        <button type="button" className="tour-btn ghost" onClick={() => go(step - 1)} disabled={step === 0}>
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" className="tour-btn" onClick={() => go(step + 1)}>Next →</button>
        ) : (
          <button type="button" className="tour-btn" onClick={closeTour}>Finish ✓</button>
        )}
      </div>
    </section>
  );
}
