// Site navigation. The link set grew a lot with camps, guides, stories, the
// availability portal and the leaderboard, so the bar now shows a primary set
// and tucks the rest behind a "More" menu. On phones everything collapses
// into one sheet.

import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';

const PUBLIC_PRIMARY = [
  { to: '/', label: 'Home', end: true },
  { to: '/availability', label: 'Blood availability' },
  { to: '/camps', label: 'Camps' },
  { to: '/stories', label: 'Stories' },
  { to: '/guides', label: 'Guides' },
];
const PUBLIC_MORE = [
  { to: '/leaderboard', label: 'Donor leaderboard' },
  { to: '/blogs', label: 'Health blog' },
];

const MEMBER_PRIMARY = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/donors', label: 'Find donors' },
  { to: '/availability', label: 'Availability' },
  { to: '/camps', label: 'Camps' },
  { to: '/requests', label: 'Requests' },
];
const MEMBER_MORE = [
  { to: '/hospitals', label: 'Hospitals & blood banks' },
  { to: '/appointments', label: 'Book a doctor' },
  { to: '/my-donations', label: 'My donations' },
  { to: '/leaderboard', label: 'Donor leaderboard' },
  { to: '/stories', label: 'Stories' },
  { to: '/guides', label: 'Guides' },
  { to: '/blogs', label: 'Health blog' },
  { to: '/profile', label: 'My profile & QR' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { openTour } = useTour();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);      // mobile sheet
  const [more, setMore] = useState(false);      // desktop "More" menu
  const menuRef = useRef(null);
  const moreRef = useRef(null);

  const close = () => { setOpen(false); setMore(false); };

  useEffect(close, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open && !more) return undefined;
    const onClickOutside = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      if (moreRef.current?.contains(e.target)) return;
      close();
    };
    const onEscape = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open, more]);

  const handleLogout = () => { close(); logout(); navigate('/login'); };
  const handleHelp = () => { close(); openTour(0); };

  const primary = user ? MEMBER_PRIMARY : PUBLIC_PRIMARY;
  const secondary = user ? MEMBER_MORE : PUBLIC_MORE;

  return (
    <nav className="navbar">
      <Link to={user ? '/dashboard' : '/'} className="brand" onClick={close}>
        <span className="brand-mark" aria-hidden="true" />
        LifeLink
      </Link>

      <div className="menu-wrap" ref={menuRef}>
        <button
          className="menu-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="menu-toggle-bars" aria-hidden="true"><span /><span /><span /></span>
          <span className="menu-toggle-label">Menu</span>
        </button>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          {primary.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={close}>{l.label}</NavLink>
          ))}

          {/* Desktop: collapse the rest behind one button. */}
          <div className="nav-more" ref={moreRef}>
            <button
              type="button"
              className="link-button nav-more-toggle"
              onClick={() => setMore((v) => !v)}
              aria-expanded={more}
            >
              More <span aria-hidden="true">▾</span>
            </button>
            <div className={`nav-more-menu ${more ? 'open' : ''}`}>
              {secondary.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={close}>{l.label}</NavLink>
              ))}
              {user && (
                <button onClick={handleHelp} className="link-button">Guided tour</button>
              )}
            </div>
          </div>

          {/* Phone sheet shows the secondary links inline instead. */}
          <div className="nav-secondary-inline">
            {secondary.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={close}>{l.label}</NavLink>
            ))}
          </div>

          {user ? (
            <button onClick={handleLogout} className="link-button nav-signout">Sign out</button>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Sign in</NavLink>
              <Link to="/register" className="nav-cta" onClick={close}>Join as a donor</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
