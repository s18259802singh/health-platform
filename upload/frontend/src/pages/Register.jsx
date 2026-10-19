import { useState } from 'react';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SearchSelect from '../components/SearchSelect';
import Field from '../components/Field';
import useForm from '../lib/useForm';
import { rules, BLOOD_GROUPS } from '../lib/validate';

// Every rule here has a twin in the register controller. The form catches a
// mistake while somebody is still looking at the field; the server catches it
// however the request arrived.
const schema = {
  name: rules.name,
  phone: rules.phone,
  email: rules.email,
  password: rules.password,
  bloodGroup: rules.bloodGroup,
  location: rules.optional(rules.place),
  allergies: rules.optional(rules.text({ label: 'Allergies', max: 200 })),
  emergencyContactName: rules.name,
  emergencyContactNumber: rules.all(rules.phone, (v, all) => (
    String(v || '').replace(/\D/g, '').slice(-10) === String(all.phone || '').replace(/\D/g, '').slice(-10)
      ? 'Use a different number from your own — this is who we call if you cannot answer'
      : ''
  )),
};

export default function Register() {
  const location = useLocation();
  const from = location.state?.from;
  const { user, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const form = useForm(
    {
      name: '', email: '', password: '', phone: '', bloodGroup: '',
      allergies: '', emergencyContactName: '', emergencyContactNumber: '',
      isDonor: true, location: '',
    },
    schema,
    {
      onSubmit: async (values) => {
        await register(values);
        navigate(from || '/dashboard');
      },
    },
  );

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="auth-shell">
      <div className="form-card">
        <p className="app-eyebrow">Join the register</p>
        <h1 className="page-h1">Create your account</h1>
        {form.status.message && (
          <p className={`form-status is-${form.status.type === 'error' ? 'error' : 'ok'}`}>
            {form.status.message}
          </p>
        )}

        <form onSubmit={form.submit} ref={form.formRef} noValidate>
          <div className="field-pair">
            <Field label="Full name" htmlFor="name" required error={form.errorFor('name')}>
              <input id="name" autoComplete="name" {...form.field('name')} />
            </Field>
            <Field label="Phone" htmlFor="phone" required error={form.errorFor('phone')}
                   hint="We never show this to anyone who is not signed in.">
              <input id="phone" type="tel" inputMode="numeric" autoComplete="tel"
                     placeholder="10-digit mobile" {...form.field('phone')} />
            </Field>
          </div>

          <Field label="Email" htmlFor="email" required error={form.errorFor('email')}>
            <input id="email" type="email" autoComplete="email" {...form.field('email')} />
          </Field>

          <Field label="Password" htmlFor="password" required error={form.errorFor('password')}
                 hint="At least 8 characters, with a letter and a number.">
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...form.field('password')}
              />
              <button
                type="button" className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </Field>

          <div className="field-pair">
            <Field label="Blood group" htmlFor="bloodGroup" required error={form.errorFor('bloodGroup')}>
              <SearchSelect
                id="bloodGroup"
                value={form.values.bloodGroup}
                onChange={(e) => { form.setField('bloodGroup', e.target.value); form.setTouched((t) => ({ ...t, bloodGroup: true })); }}
                placeholder="Choose your group"
                options={[{ value: '', label: 'Choose your group' }, ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))]}
              />
            </Field>
            <Field label="City / area" htmlFor="location" optional error={form.errorFor('location')}>
              <input id="location" placeholder="e.g. Surat" autoComplete="address-level2"
                     {...form.field('location')} />
            </Field>
          </div>

          <Field label="Allergies" htmlFor="allergies" optional error={form.errorFor('allergies')}
                 hint="Shown on your emergency QR profile, so a paramedic can see it.">
            <input id="allergies" placeholder="e.g. Penicillin, or leave blank" {...form.field('allergies')} />
          </Field>

          <div className="field-pair">
            <Field label="Emergency contact name" htmlFor="emergencyContactName" required
                   error={form.errorFor('emergencyContactName')}>
              <input id="emergencyContactName" {...form.field('emergencyContactName')} />
            </Field>
            <Field label="Emergency contact number" htmlFor="emergencyContactNumber" required
                   error={form.errorFor('emergencyContactNumber')}>
              <input id="emergencyContactNumber" type="tel" inputMode="numeric"
                     {...form.field('emergencyContactNumber')} />
            </Field>
          </div>

          <label className="checkbox-label">
            <input type="checkbox" name="isDonor" checked={form.values.isDonor}
                   onChange={form.handleChange} />
            Add me to the donor register
          </label>

          <button type="submit" disabled={form.busy}>
            {form.busy ? 'Creating account…' : 'Create account'}
          </button>
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
