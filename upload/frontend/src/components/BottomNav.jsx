import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <nav className="bottom-nav">
      <NavLink to="/dashboard" className="bn-item">
        <span>🏠</span>
      </NavLink>
      <NavLink to="/donors" className="bn-item">
        <span>🔍</span>
      </NavLink>
      <NavLink to="/hospitals" className="bn-item">
        <span>📍</span>
      </NavLink>
      <NavLink to="/profile" className="bn-item">
        <span>👤</span>
      </NavLink>
    </nav>
  );
}
