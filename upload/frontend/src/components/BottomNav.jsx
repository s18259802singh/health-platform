import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { to: '/dashboard', label: 'Home' },
  { to: '/availability', label: 'Stock' },
  { to: '/donors', label: 'Donors' },
  { to: '/camps', label: 'Camps' },
  { to: '/profile', label: 'Profile' },
];

export default function BottomNav() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <nav className="bottom-nav" aria-label="Quick navigation">
      {TABS.map((t) => (
        <NavLink to={t.to} key={t.to} className="bn-item">{t.label}</NavLink>
      ))}
    </nav>
  );
}
