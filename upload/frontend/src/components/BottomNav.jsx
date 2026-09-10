import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n';

const TABS = [
  { to: '/dashboard', key: 'home' },
  { to: '/donors', key: 'donors' },
  { to: '/hospitals', key: 'hospitals' },
  { to: '/blogs', key: 'blog' },
  { to: '/profile', key: 'profile' },
];

export default function BottomNav() {
  const { user } = useAuth();
  const { t } = useLang();
  if (!user) return null;

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <NavLink to={tab.to} key={tab.to} className="bn-item">
          {t(tab.key)}
        </NavLink>
      ))}
    </nav>
  );
}
