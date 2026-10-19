import { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';
import { rules } from '../lib/validate';

export default function Login() {
  const location = useLocation();
  const from = location.state?.from;
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // Sign-in is deliberately lighter than registration: the only thing worth
  // checking before a round trip is whether the address could exist at all.
  // Anything stricter risks locking somebody out of their own account.
  const [touched, setTouched] = useState({});
  const emailError = rules.email(email);
  const navigate = useNavigate();

  if (user) return <Navigate to={from || '/dashboard'} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ email: true, password: true });
    if (emailError || !password) {
      setError('Enter your email address and password.');
      return;
    }
    setBusy(true);
    try {
      await login(email, password);
      // Back to whatever they were trying to reach, if anything.
      navigate(from || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="form-card">
        <p className="app-eyebrow">Welcome back</p>
        <h1 className="page-h1">Sign in to LifeLink</h1>
        {error && <p className="form-status is-error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <Field label="Email" htmlFor="login-email" required error={touched.email ? emailError : ''}>
            <input
              id="login-email" type="email" autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              aria-invalid={touched.email && emailError ? true : undefined}
            />
          </Field>

          <Field label="Password" htmlFor="login-password" required
                 error={touched.password && !password ? 'Enter your password' : ''}>
          <div className="password-field">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          </Field>

          <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>

        <p className="form-foot">
          New here? <Link to="/register" state={from ? { from } : undefined}>Create an account</Link>
        </p>
        <p className="hint">Administrators sign in separately at <Link to="/admin/login">/admin</Link>.</p>
      </div>

      <aside className="auth-aside">
        <h3>Your blood group, where it’s needed.</h3>
        <p>Sign in to search compatible donors, answer live requests and carry your emergency QR profile.</p>
        <ul>
          <li>Live donor search by group and city</li>
            <li>Blood request board with direct contact</li>
          <li>Hospital and blood bank directory</li>
        </ul>
      </aside>
    </div>
  );
}
