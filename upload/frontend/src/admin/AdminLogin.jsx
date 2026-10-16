// A completely separate sign-in page for the console, at /admin/login.
// Members never see it, and a member's credentials are rejected here even if
// they are correct - the API checks the role before issuing an admin token.

import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminLogin() {
  const { admin, login } = useAdminAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(params.get('expired') ? 'Your session expired. Please sign in again.' : '');
  const [busy, setBusy] = useState(false);

  if (admin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <div className="adm-login-panel">
        <div className="adm-brand standalone">
          <span className="adm-brand-mark" aria-hidden="true" />
          <span className="adm-brand-text">
            <strong>LifeLink</strong>
            <small>Admin Console</small>
          </span>
        </div>

        <h1>Sign in to the console</h1>
        <p className="adm-login-sub">Administrator access only. Member accounts cannot sign in here.</p>

        <form onSubmit={submit} className="adm-form">
          <label className="adm-field">
            <span>Email address</span>
            <input
              type="email" autoComplete="username" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@lifelink.app"
            />
          </label>

          <label className="adm-field">
            <span>Password</span>
            <input
              type="password" autoComplete="current-password" required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </label>

          {error && <p className="adm-form-error">{error}</p>}

          <button type="submit" className="adm-btn primary block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <a className="adm-login-back" href="/">← Back to the public site</a>
      </div>

      <aside className="adm-login-aside">
        <div>
          <h2>Run the network, not the spreadsheet.</h2>
          <p>Members, donors, hospitals, doctors, blood requests and appointments — managed from one console, separate from the public app.</p>
          <ul>
            <li>Live donor and shortage analytics</li>
            <li>Full member and content management</li>
            <li>Request &amp; appointment moderation</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
