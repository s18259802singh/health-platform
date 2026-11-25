// THE PREVIEW'S OWN STRIP.
//
// A preview opens signed out, which is correct — the public half of the site
// is what a visitor sees first. But it meant that everything behind a login
// (the dashboard, the donor register, the hospital directory and its centre
// pages, requests, appointments, the profile, and the whole admin console)
// looked as though it had been removed, when it was only locked.
//
// So the preview says so, and offers the two doors.
//
// It deliberately reads and writes the stored session directly rather than
// going through AuthContext: the bar sits outside both providers so it can
// appear on the admin side as well as the public one, and a provider-free
// accessory cannot affect how the real application is wired. Signing in
// reloads onto the target route, which is also the honest way to prove the
// session survives a refresh.
//
// Rendered ONLY in the standalone preview build (VITE_DEMO=true). The
// production build never mounts it.

import { useEffect, useState } from 'react';
import { DEMO, USER_KEY, USER_TOKEN_KEY } from '../api/axios';
import { ADMIN_TOKEN_KEY, ADMIN_KEY } from '../api/adminApi';

const read = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
};

const go = (hash) => {
  window.location.hash = hash;
  window.location.reload();
};

export default function DemoBar() {
  const [session, setSession] = useState({ member: null, admin: null });

  useEffect(() => {
    setSession({ member: read(USER_KEY), admin: read(ADMIN_KEY) });
  }, []);

  if (!DEMO) return null;

  const onAdmin = window.location.hash.startsWith('#/admin');

  const asMember = () => {
    localStorage.setItem(USER_TOKEN_KEY, 'demo');
    localStorage.setItem(USER_KEY, JSON.stringify({
      id: 'demo', name: 'Dhruv Shah', email: 'demo@lifelink.test',
      role: 'user', bloodGroup: 'O-', location: 'Surat', isDonor: true,
    }));
    go('#/dashboard');
  };

  const asAdmin = () => {
    localStorage.setItem(ADMIN_TOKEN_KEY, 'demo-admin');
    localStorage.setItem(ADMIN_KEY, JSON.stringify({
      id: 'demo', name: 'Demo Administrator',
      email: 'admin@lifelink.test', role: 'admin',
    }));
    go('#/admin');
  };

  const signOut = () => {
    [USER_TOKEN_KEY, USER_KEY, ADMIN_TOKEN_KEY, ADMIN_KEY].forEach((k) => localStorage.removeItem(k));
    go('#/');
  };

  return (
    <div className="demo-bar">
      <span className="demo-bar-tag">Preview</span>
      <p>
        Sample data, no server.{' '}
        {session.member || session.admin
          ? 'Signed in — every page is open.'
          : 'Pages behind a sign-in are locked, not missing.'}
      </p>
      <div className="demo-bar-actions">
        {!session.member && (
          <button type="button" onClick={asMember}>Open the member area</button>
        )}
        {!onAdmin && (
          <button type="button" onClick={asAdmin}>Open the admin console</button>
        )}
        {onAdmin && (
          <button type="button" onClick={() => go('#/')}>Back to the site</button>
        )}
        {(session.member || session.admin) && (
          <button type="button" onClick={signOut}>Sign out</button>
        )}
      </div>
    </div>
  );
}
