import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LanguageToggle, useLang } from '../i18n';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  const closeMenu = () => setOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="brand" onClick={closeMenu}><span className="brand-mark" aria-hidden="true"></span>LifeLink</Link>

      <LanguageToggle />

      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`nav-links ${open ? 'open' : ''}`}>
        {user ? (
          <>
            <Link to="/dashboard" onClick={closeMenu}>{t('dashboard')}</Link>
            <Link to="/donors" onClick={closeMenu}>{t('findDonors')}</Link>
            <Link to="/hospitals" onClick={closeMenu}>{t('hospitals')}</Link>
            <Link to="/appointments" onClick={closeMenu}>{t('appointments')}</Link>
            <Link to="/requests" onClick={closeMenu}>{t('bloodRequests')}</Link>
            <button type="button" className="link-button demo-link" onClick={() => { closeMenu(); window.location.hash = '#demo'; window.dispatchEvent(new HashChangeEvent('hashchange')); }}>{t('liveDemo')}</button>
            <Link to="/blogs" onClick={closeMenu}>{t('blog')}</Link>
            <Link to="/profile" onClick={closeMenu}>{t('myProfile')}</Link>
            <button onClick={handleLogout} className="link-button">{t('logout')}</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>{t('login')}</Link>
            <Link to="/register" onClick={closeMenu}>{t('register')}</Link>
            <button type="button" className="link-button demo-link" onClick={() => { closeMenu(); window.location.hash = '#demo'; window.dispatchEvent(new HashChangeEvent('hashchange')); }}>{t('liveDemo')}</button>
            <Link to="/blogs" onClick={closeMenu}>{t('blog')}</Link>
          </>
        )}
      </div>
    </nav>
  );
}
