import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  const closeMenu = () => setOpen(false);

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
          {user ? (
            <>
              <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
              <Link to="/donors" onClick={closeMenu}>Find Donors</Link>
              <Link to="/hospitals" onClick={closeMenu}>Hospitals</Link>
              <Link to="/appointments" onClick={closeMenu}>Appointments</Link>
              <Link to="/requests" onClick={closeMenu}>Blood Requests</Link>
              <Link to="/blogs" onClick={closeMenu}>Blog</Link>
              <Link to="/profile" onClick={closeMenu}>My Profile</Link>
              <button onClick={handleLogout} className="link-button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>Login</Link>
              <Link to="/register" onClick={closeMenu}>Register</Link>
              <Link to="/blogs" onClick={closeMenu}>Blog</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
