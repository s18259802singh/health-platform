import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTour } from '../context/TourContext';
import { useLang, LanguageToggle } from '../i18n';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { openTour } = useTour();
  const { t } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  const closeMenu = () => setOpen(false);

  const handleHelp = () => {
    closeMenu();
    openTour(0);
  };

  // close the dropdown when clicking anywhere outside it
  useEffect(() => {
    if (!open) return;
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
      <Link to="/" className="brand" onClick={closeMenu}><span className="brand-mark" aria-hidden="true"></span>LifeLink</Link>

      <div className="menu-wrap" ref={menuRef}>
        <button
          className="menu-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="menu-toggle-bars" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span className="menu-toggle-label">Menu</span>
        </button>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          <div className="nav-links-lang">
            <LanguageToggle />
          </div>
          {user ? (
            <>
              <Link to="/dashboard" onClick={closeMenu}>{t('dashboard')}</Link>
              <Link to="/donors" onClick={closeMenu}>{t('findDonors')}</Link>
              <Link to="/hospitals" onClick={closeMenu}>{t('hospitals')}</Link>
              <Link to="/appointments" onClick={closeMenu}>{t('appointments')}</Link>
              <Link to="/requests" onClick={closeMenu}>{t('bloodRequests')}</Link>
              <Link to="/blogs" onClick={closeMenu}>{t('blog')}</Link>
              <Link to="/profile" onClick={closeMenu}>{t('myProfile')}</Link>
              <button onClick={handleHelp} className="link-button help-link">{t('help')} ?</button>
              <button onClick={handleLogout} className="link-button">{t('logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>{t('login')}</Link>
              <Link to="/register" onClick={closeMenu}>{t('register')}</Link>
              <Link to="/blogs" onClick={closeMenu}>{t('blog')}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
