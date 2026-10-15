import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';
import { useLang } from '../i18n';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { openTour } = useTour();
  const { t } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/login');
  };

  const handleHelp = () => {
    closeMenu();
    openTour(0);
  };

  // close the dropdown when clicking anywhere outside it
  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) closeMenu();
    };
    const onEscape = (e) => { if (e.key === 'Escape') closeMenu(); };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  return (
    <nav className="navbar">
      <Link to={user ? '/dashboard' : '/'} className="brand" onClick={closeMenu}>
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
          {user ? (
            <>
              <NavLink to="/dashboard" onClick={closeMenu}>{t('dashboard')}</NavLink>
              <NavLink to="/donors" onClick={closeMenu}>{t('findDonors')}</NavLink>
              <NavLink to="/requests" onClick={closeMenu}>{t('bloodRequests')}</NavLink>
              <NavLink to="/hospitals" onClick={closeMenu}>{t('hospitals')}</NavLink>
              <NavLink to="/appointments" onClick={closeMenu}>{t('appointments')}</NavLink>
              <NavLink to="/blogs" onClick={closeMenu}>{t('blog')}</NavLink>
              <NavLink to="/profile" onClick={closeMenu}>{t('myProfile')}</NavLink>
              <button onClick={handleHelp} className="link-button help-link">{t('help')}</button>
              <button onClick={handleLogout} className="link-button">{t('logout')}</button>
            </>
          ) : (
            <>
              <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
              <NavLink to="/blogs" onClick={closeMenu}>{t('blog')}</NavLink>
              <NavLink to="/login" onClick={closeMenu}>{t('login')}</NavLink>
              <Link to="/register" className="nav-cta" onClick={closeMenu}>{t('register')}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
