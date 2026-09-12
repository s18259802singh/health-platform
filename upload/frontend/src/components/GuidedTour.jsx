// GUIDED TOUR
// The in-app answer to "how do I use this thing?". It opens automatically
// the first time a new user reaches the Dashboard, and can be reopened
// any time from the "Help" button in the Navbar or the floating "?" button
// (see HelpFab.jsx). Each step optionally NAVIGATES to the real page it is
// describing, so the tour explains the app by actually walking through it -
// every claim below matches a feature that exists in this codebase.

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';

const STEPS = [
  {
    title: 'Welcome to LifeLink',
    text: "A quick, four-minute walkthrough of what you can do here - finding donors, requesting blood, booking doctors, and turning your profile into an emergency medical ID. Press Next whenever you're ready.",
  },
  {
    to: '/dashboard',
    title: 'Your Dashboard',
    text: 'Quick-action shortcuts to every part of the app, a Live Blood Supply monitor showing real donor counts against open requests per blood group, and a live donor map of Gujarat.',
  },
  {
    to: '/donors',
    title: 'Find Donors',
    text: "Search the donor list by blood group and city. New here: tap a blood group in the Compatibility Checker at the top to instantly see - and filter to - who's a safe match.",
  },
  {
    to: '/requests',
    title: 'Blood Requests',
    text: 'See open "I need blood" requests from other users, or post your own. Anyone able to help can tap "I can donate" - the requester gets your name and number directly.',
  },
  {
    to: '/appointments',
    title: 'Book a Doctor',
    text: 'Pick a hospital, pick one of its doctors, then pick an open time slot. Every appointment is tied to your account so you can keep track of what you\'ve booked.',
  },
  {
    to: '/hospitals',
    title: 'Hospitals & Blood Banks',
    text: 'A searchable directory of hospitals and blood banks, with a Directions link on every entry so you can get moving in an emergency, not just look something up.',
  },
  {
    to: '/blogs',
    title: 'Health Blog',
    text: 'Articles on donation, first aid and general health, open to everyone - logged in or not.',
  },
  {
    to: '/profile',
    title: 'Your Profile & QR Code',
    text: 'Set your blood group, allergies and emergency contact once here. LifeLink turns it into a QR code you can save or print - anyone who scans it sees only what you\'ve chosen to share, no login required.',
  },
  {
    title: "That's the tour",
    text: "You can reopen this any time from the Help button in the menu, or the ? button in the corner. Now go ahead and explore.",
  },
];

export default function GuidedTour() {
  const { open, step, setStep, closeTour } = useTour();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!open) return null;

  const s = STEPS[step];
  const go = (n) => {
    const next = Math.min(STEPS.length - 1, Math.max(0, n));
    setStep(next);
    const dest = STEPS[next].to;
    if (dest && user) navigate(dest);
  };

  return (
    <div className="tour-overlay" role="presentation" onClick={closeTour}>
      <div
        className="tour-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Guided tour"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tour-head">
          <span className="tour-count">Step {step + 1} of {STEPS.length}</span>
          <button type="button" className="tour-close" onClick={closeTour} aria-label="Close guide">✕</button>
        </div>
        <h3 className="tour-title">{s.title}</h3>
        <p className="tour-text">{s.text}</p>
        <div className="tour-dots">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === step ? 'on' : ''}
              onClick={() => go(i)}
              aria-label={`Go to step ${i + 1}`}
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
      </div>
    </div>
  );
}
