// LIVE DEMO TOUR
// A guided walkthrough opened from the navbar ("Live Demo"). It shows one
// step at a time with Back / Next, and actually NAVIGATES the app to the
// page of each step - the website demonstrates itself. The tour panel sits
// at the bottom so the real page stays visible above it.
// Opened via the URL hash (#demo) so any component can trigger it.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  {
    title: 'Welcome to LifeLink',
    text: 'This guided demo walks through every feature, one step at a time. The app will move to the right page as you press Next. (Login first to see everything - the demo works best signed in.)',
  },
  {
    title: '3 Languages',
    text: 'Tap EN / हिं / ગુ in the navbar - the whole platform switches between English, Hindi and Gujarati instantly, including the public emergency page. An emergency tool must speak the language of whoever finds you.',
  },
  {
    to: '/dashboard',
    title: 'Live Blood Supply',
    text: 'These blood bags are not decoration - each fills according to the real number of willing donors in MongoDB. A pulsing bag means open requests outnumber donors: a live shortage alert.',
  },
  {
    to: '/donors',
    title: 'Find Donors + Compatibility',
    text: '150 donors, searchable live by blood group and city. Tap any group in the Compatibility Checker to see who it can give to and receive from - then filter the list to compatible donors in one tap.',
  },
  {
    to: '/requests',
    title: 'Blood Requests - a real network',
    text: 'Anyone can post "I need B+ in Surat". Other donors tap "I can donate" and the requester sees their names and numbers. The Poster button turns any request into a WhatsApp-ready image, because that is how blood requests actually travel in India.',
  },
  {
    to: '/appointments',
    title: 'Doctor Appointments',
    text: 'Pick a hospital (110 across Gujarat), pick one of its doctors, pick a free slot. Double-booking is blocked by a unique database index - two people cannot take the same slot.',
  },
  {
    to: '/hospitals',
    title: 'Hospitals & Blood Banks',
    text: 'A searchable directory of 110 hospitals and blood banks. Every row has a Directions link that opens Google Maps navigation - what a real user needs mid-emergency.',
  },
  {
    to: '/blogs',
    title: 'Health Blog',
    text: '16 full articles on donation, first aid and health - each with a custom-designed cover matching its topic. Admins write new articles with image upload, right from this page.',
  },
  {
    to: '/profile',
    title: 'Your Medical ID',
    text: 'Blood group, allergies, conditions, medications, height and weight - all optional, all shown on your emergency page. Download a wallet-size Emergency ID Card, or a lock-screen wallpaper so your phone shows your medical info even while locked.',
  },
  {
    to: '/profile',
    title: 'Tracker, Certificate & Scan Alerts',
    text: 'Record a donation and a glowing ring counts down the 90 days until you are eligible again - then download a Certificate of Appreciation. And Scan Alerts logs every time someone opened your emergency page, so you always know when your info was accessed.',
  },
  {
    title: 'The Emergency Page',
    text: 'Scan any user\'s QR (from their profile, printed card, or locked phone) - a public page opens with their blood group and medical details, a Call Emergency Contact button, and Beacon Mode: the whole screen pulses red with the blood group readable across a room.',
  },
  {
    title: 'Installs as an App',
    text: 'LifeLink is a PWA - "Install" in Chrome or "Add to Home Screen" on a phone gives it its own icon and full-screen app experience. That is the end of the tour - explore freely!',
  },
];

export default function DemoTour() {
  const [open, setOpen] = useState(window.location.hash === '#demo');
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const onHash = () => {
      const isOpen = window.location.hash === '#demo';
      setOpen(isOpen);
      if (isOpen) setStep(0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const close = () => {
    setOpen(false);
    if (window.location.hash === '#demo') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const go = (n) => {
    const next = Math.min(STEPS.length - 1, Math.max(0, n));
    setStep(next);
    const dest = STEPS[next].to;
    if (dest && user) navigate(dest);
  };

  if (!open) return null;
  const s = STEPS[step];

  return (
    <div className="tour-panel" role="dialog" aria-label="Live demo tour">
      <div className="tour-head">
        <span className="tour-count">Step {step + 1} / {STEPS.length}</span>
        <button type="button" className="tour-close" onClick={close} aria-label="Close demo">✕</button>
      </div>
      <h3 className="tour-title">{s.title}</h3>
      <p className="tour-text">{s.text}</p>
      <div className="tour-dots">
        {STEPS.map((_, i) => (
          <button key={i} type="button" className={i === step ? 'on' : ''} onClick={() => go(i)} aria-label={`Step ${i + 1}`} />
        ))}
      </div>
      <div className="tour-nav">
        <button type="button" className="tour-btn ghost" onClick={() => go(step - 1)} disabled={step === 0}>
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" className="tour-btn" onClick={() => go(step + 1)}>Next →</button>
        ) : (
          <button type="button" className="tour-btn" onClick={close}>Finish ✓</button>
        )}
      </div>
    </div>
  );
}
