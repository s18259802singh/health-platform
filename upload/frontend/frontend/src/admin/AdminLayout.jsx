// The admin console shell: fixed sidebar, sticky topbar, content area.
// Nothing from the public site (navbar, bottom tab bar, guided tour, help
// bubble) is rendered inside here - this is a deliberately different product.

import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { initials } from './components/ui';
import {
  IconGrid, IconUsers, IconHospital, IconStethoscope, IconArticle,
  IconDrop, IconCalendar, IconSettings, IconLogout, IconMenu, IconClose, IconExternal,
  IconBook, IconQuote, IconAward,
} from './components/Icons';

const NAV = [
  { section: 'Overview', items: [
    { to: '/admin', end: true, label: 'Dashboard', icon: <IconGrid /> },
  ]},
  { section: 'People', items: [
    { to: '/admin/users', label: 'Members', icon: <IconUsers /> },
    { to: '/admin/requests', label: 'Blood requests', icon: <IconDrop /> },
    { to: '/admin/appointments', label: 'Appointments', icon: <IconCalendar /> },
  ]},
  { section: 'Donations', items: [
    { to: '/admin/camps', label: 'Camps', icon: <IconCalendar /> },
    { to: '/admin/donations', label: 'Donation records', icon: <IconAward /> },
  ]},
  { section: 'Network', items: [
    { to: '/admin/hospitals', label: 'Hospitals & banks', icon: <IconHospital /> },
    { to: '/admin/doctors', label: 'Doctors', icon: <IconStethoscope /> },
  ]},
  { section: 'Content', items: [
    { to: '/admin/stories', label: 'Donor stories', icon: <IconQuote /> },
    { to: '/admin/guides', label: 'Guide library', icon: <IconBook /> },
    { to: '/admin/blogs', label: 'Health articles', icon: <IconArticle /> },
  ]},
  { section: 'System', items: [
    { to: '/admin/settings', label: 'Settings & data', icon: <IconSettings /> },
  ]},
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className={`adm-shell ${open ? 'drawer-open' : ''}`}>
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <span className="adm-brand-mark" aria-hidden="true" />
          <span className="adm-brand-text">
            <strong>LifeLink</strong>
            <small>Admin Console</small>
          </span>
          <button type="button" className="adm-icon-btn adm-drawer-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <IconClose width={18} height={18} />
          </button>
        </div>

        <nav className="adm-nav">
          {NAV.map((group) => (
            <div className="adm-nav-group" key={group.section}>
              <span className="adm-nav-section">{group.section}</span>
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className="adm-nav-link">
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="adm-sidebar-foot">
          <a href="/" className="adm-nav-link subtle" target="_blank" rel="noreferrer">
            <IconExternal />
            <span>View public site</span>
          </a>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <button type="button" className="adm-icon-btn adm-burger" onClick={() => setOpen(true)} aria-label="Open menu">
            <IconMenu />
          </button>

          <div className="adm-topbar-title">
            <span className="adm-env">Administrator</span>
          </div>

          <div className="adm-account">
            <span className="adm-avatar" aria-hidden="true">{initials(admin?.name)}</span>
            <span className="adm-account-text">
              <strong>{admin?.name}</strong>
              <small>{admin?.email}</small>
            </span>
            <button type="button" className="adm-icon-btn" onClick={handleLogout} aria-label="Sign out" title="Sign out">
              <IconLogout width={18} height={18} />
            </button>
          </div>
        </header>

        <main className="adm-content">
          <Outlet />
        </main>
      </div>

      <button type="button" className="adm-scrim" onClick={() => setOpen(false)} aria-hidden={!open} tabIndex={-1} />
    </div>
  );
}
