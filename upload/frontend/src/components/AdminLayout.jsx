// ADMIN PANEL LAYOUT
// Every /admin/* page renders inside this: a sidebar on the left (menu +
// "Back to site") and the selected admin page on the right (via <Outlet/>).
// Access control happens in App.jsx: these routes are wrapped in
// <ProtectedRoute adminOnly> so normal users are redirected away.

import { NavLink, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MENU = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/hospitals', label: 'Hospitals' },
  { to: '/admin/blogs', label: 'Blog Articles' },
  { to: '/admin/users', label: 'Users' },
];

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <p className="admin-side-title">Admin Panel</p>
        <p className="admin-side-user">{user?.name}</p>
        <nav className="admin-menu">
          {MENU.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} className="admin-link">
              {m.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/dashboard" className="admin-back">← Back to site</Link>
      </aside>
      <section className="admin-main">
        <Outlet />
      </section>
    </div>
  );
}
