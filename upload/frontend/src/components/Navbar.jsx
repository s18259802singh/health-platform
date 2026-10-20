// Site header.
// It sticks to the top, condenses once you scroll past the first screen, and
// carries a reading-progress bar so long pages show how far through you are.
// The link set is wide, so the bar shows a primary row and tucks the rest
// behind "More"; on phones everything collapses into one sheet.

import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
// Hovering a link fetches that page's code, so the click has nothing to wait
// for. See lib/prefetch.js (point 5).
import { prefetchProps } from '../lib/prefetch';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';

const PUBLIC_PRIMARY = [
  { to: '/', label: 'Home', end: true },
  { to: '/near-me', label: 'Find care near me' },
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
  { to: '/near-me', label: 'Near me' },
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

  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [progress, setProgress] = useState(0);
  const menuRef = useRef(null);
  const moreRef = useRef(null);
  // Hover opens the More menu, click still toggles it. The close is delayed
  // so the pointer can cross the gap between the button and the panel without
  // the menu vanishing underneath it.
  const hoverTimer = useRef(null);
  const openOnHover = () => {
    if (window.matchMedia('(hover: none)').matches) return;  // touch: click only
    clearTimeout(hoverTimer.current);
    setMore(true);
  };
  const closeOnLeave = () => {
    if (window.matchMedia('(hover: none)').matches) return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setMore(false), 180);
  };
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const close = () => { setOpen(false); setMore(false); };
  useEffect(close, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll state: condense past 60px, and track how far down the page we are.
  // rAF-throttled so this never costs a frame.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setCondensed(y > 60);
        setProgress(max > 40 ? Math.min(100, (y / max) * 100) : 0);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [location.pathname]);

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
    <header className={`site-header ${condensed ? 'condensed' : ''}`}>
      <nav className="navbar">
        <Link to={user ? '/dashboard' : '/'} className="brand" onClick={close}>
          <Logo size={condensed ? 28 : 34} />
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
              <NavLink key={l.to} to={l.to} end={l.end} onClick={close} {...prefetchProps(l.to)}>{l.label}</NavLink>
            ))}

            <div
              className="nav-more"
              ref={moreRef}
              onMouseEnter={openOnHover}
              onMouseLeave={closeOnLeave}
            >
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
                  <NavLink key={l.to} to={l.to} onClick={close} {...prefetchProps(l.to)}>{l.label}</NavLink>
                ))}
                {user && <button onClick={handleHelp} className="link-button">Guided tour</button>}
              </div>
            </div>

            <div className="nav-secondary-inline">
              {secondary.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={close} {...prefetchProps(l.to)}>{l.label}</NavLink>
              ))}
            </div>

            {user ? (
              <button onClick={handleLogout} className="link-button nav-signout">Sign out</button>
            ) : (
              <>
                <NavLink to="/login" onClick={close} {...prefetchProps('/login')}>Sign in</NavLink>
                <Link to="/register" className="nav-cta" onClick={close} {...prefetchProps('/register')}>Join as a donor</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* How far down the page the reader is. Decorative, so hidden from AT. */}
      <div className="scroll-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
    </header>
  );
}
