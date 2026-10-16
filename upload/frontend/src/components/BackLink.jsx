// A way out of any page.
// Shown on every screen except the two "home" screens, because those are where
// back would lead anyway. It prefers real browser history, so it undoes the
// exact step the person took; when there is no history to undo (someone opened
// a deep link, or arrived from outside), it falls back to the sensible parent
// rather than stranding them.

import { useNavigate, useLocation } from 'react-router-dom';

const ROOTS = ['/', '/dashboard'];

// Where "up" goes when there is no history to go back through.
const PARENT = {
  '/camps': '/',
  '/stories': '/',
  '/guides': '/',
  '/availability': '/',
  '/leaderboard': '/',
  '/blogs': '/',
  '/my-donations': '/dashboard',
  '/profile': '/dashboard',
  '/donors': '/dashboard',
  '/requests': '/dashboard',
  '/hospitals': '/dashboard',
  '/appointments': '/dashboard',
};

export default function BackLink() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (ROOTS.includes(pathname)) return null;

  const goBack = () => {
    // idx > 0 means there is somewhere in this tab's history to return to.
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }
    // Deep link or fresh tab: walk up to the section, then the relevant home.
    const section = `/${pathname.split('/').filter(Boolean)[0] || ''}`;
    navigate(PARENT[pathname] || PARENT[section] || section || '/');
  };

  return (
    <button type="button" className="back-link" onClick={goBack}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}
