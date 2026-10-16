import { useState } from 'react';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchSelect from '../components/SearchSelect';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Register() {
  const location = useLocation();
  const from = location.state?.from;
  const { user, register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', bloodGroup: 'O+',
    allergies: '', emergencyContactName: '', emergencyContactNumber: '',
    isDonor: true, location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate(from || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="form-card">
        <p className="app-eyebrow">Join the register</p>
        <h1 className="page-h1">Create your account</h1>
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="field-pair">
            <div>
              <label>Full name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </div>
          </div>

          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />

          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password" value={form.password} onChange={handleChange}
              required minLength={6}
            />
            <button
              type="button" className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="field-pair">
            <div>
              <label>Blood group</label>
              <SearchSelect
                value={form.bloodGroup}
                onChange={(e) => handleChange({ target: { name: 'bloodGroup', value: e.target.value } })}
                options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))}
              />
            </div>
            <div>
              <label>City / area</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Surat" />
            </div>
          </div>

          <label>Allergies (if any)</label>
          <input name="allergies" value={form.allergies} onChange={handleChange} placeholder="e.g. Penicillin, or leave blank" />

          <div className="field-pair">
            <div>
              <label>Emergency contact name</label>
              <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} required />
            </div>
            <div>
              <label>Emergency contact number</label>
              <input name="emergencyContactNumber" value={form.emergencyContactNumber} onChange={handleChange} required />
            </div>
          </div>

          <label className="checkbox-label">
            <input type="checkbox" name="isDonor" checked={form.isDonor} onChange={handleChange} />
            Add me to the donor register
          </label>

          <button type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        </form>

        <p className="form-foot">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>

      <aside className="auth-aside">
        <h3>What you get</h3>
        <p>An emergency QR profile is generated the moment you register.</p>
        <ul>
          <li>Blood group, allergies and next of kin, scannable by anyone</li>
          <li>Search donors and post requests</li>
          <li>Book doctor appointments at listed hospitals</li>
        </ul>
        <p className="aside-note">Your phone number is visible only to signed-in members searching for donors.</p>
      </aside>
    </div>
  );
}
