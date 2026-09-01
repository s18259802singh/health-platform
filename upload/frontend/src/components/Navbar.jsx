import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
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
      <Link to="/" className="brand" onClick={closeMenu}>Health & Blood Donor Platform</Link>

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
            <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
            <Link to="/donors" onClick={closeMenu}>Find Donors</Link>
            <Link to="/hospitals" onClick={closeMenu}>Hospitals</Link>
            <Link to="/appointments" onClick={closeMenu}>Appointments</Link>
            <Link to="/profile" onClick={closeMenu}>My Profile</Link>
            <button onClick={handleLogout} className="link-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={closeMenu}>Login</Link>
            <Link to="/register" onClick={closeMenu}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
