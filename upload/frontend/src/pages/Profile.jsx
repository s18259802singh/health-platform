// MY PROFILE
//
// What a member can change about themselves, and the emergency QR that
// carries it. The QR is the reason the validation here matters more than on
// a typical settings page: these fields are what a paramedic reads off a
// phone screen, so a blank next-of-kin number is not a cosmetic problem.

import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import SearchSelect from '../components/SearchSelect';
import BloodGroup from '../components/BloodGroup';
import Field from '../components/Field';
import PageLoader from '../components/PageLoader';
import useForm from '../lib/useForm';
import { rules, BLOOD_GROUPS } from '../lib/validate';

const schema = {
  name: rules.name,
  phone: rules.phone,
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

export default function Profile() {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState('');

  const form = useForm(
    {
      name: '', phone: '', bloodGroup: '', allergies: '', location: '',
      isDonor: false, emergencyContactName: '', emergencyContactNumber: '',
    },
    schema,
    {
      onSubmit: async (values) => {
        const { data } = await api.put('/profile', values);
        setProfile(data);
        // The dashboard filters open requests by the member's group, so a
        // change here has to reach the session immediately.
        updateUser({
          name: data.name,
          bloodGroup: data.bloodGroup || '',
          location: data.location || '',
          isDonor: !!data.isDonor,
        });
        form.setStatus({ type: 'ok', message: 'Saved. Your emergency QR now carries these details.' });
      },
    },
  );

  useEffect(() => {
    api.get('/profile')
      .then(({ data }) => {
        setProfile(data);
        // The API nests next-of-kin; the form keeps it flat so each half can
        // carry its own error message.
        form.setValues({
          name: data.name || '',
          phone: data.phone || '',
          bloodGroup: data.bloodGroup || '',
          allergies: data.allergies === 'None' ? '' : (data.allergies || ''),
          location: data.location || '',
          isDonor: Boolean(data.isDonor),
          emergencyContactName: data.emergencyContact?.name || '',
          emergencyContactNumber: data.emergencyContact?.number || '',
        });
      })
      .catch((err) => setLoadError(err.response?.data?.message || 'Could not load your profile.'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loadError) return <div className="page"><p className="error-text">{loadError}</p></div>;
  if (!profile) return <PageLoader label="Loading your profile" />;

  return (
    <div className="page profile-layout">
      <div className="form-card" ref={form.formRef}>
        <p className="app-eyebrow">Your account</p>
        <h1 className="page-h1">My profile</h1>

        {form.status.message && (
          <p className={`form-status is-${form.status.type === 'error' ? 'error' : 'ok'}`}>
            {form.status.message}
          </p>
        )}

        <form onSubmit={form.submit} noValidate>
          {/* Paired, so the card can fill its column without leaving a
              900px-wide box to type a name into. */}
          <div className="field-pair">
            <Field label="Full name" htmlFor="name" required error={form.errorFor('name')}>
              <input id="name" autoComplete="name" {...form.field('name')} />
            </Field>

            <Field label="City or area" htmlFor="location" optional error={form.errorFor('location')}>
              <input id="location" placeholder="e.g. Surat" autoComplete="address-level2" {...form.field('location')} />
            </Field>
          </div>

          <div className="field-pair">
            <Field label="Phone" htmlFor="phone" required error={form.errorFor('phone')}
                   hint="Visible only to signed-in members.">
              <input id="phone" type="tel" inputMode="numeric" autoComplete="tel" {...form.field('phone')} />
            </Field>

            <Field label="Blood group" htmlFor="bloodGroup" required error={form.errorFor('bloodGroup')}>
              <SearchSelect
                id="bloodGroup"
                value={form.values.bloodGroup}
                onChange={(e) => { form.setField('bloodGroup', e.target.value); form.setTouched((t) => ({ ...t, bloodGroup: true })); }}
                placeholder="Choose your group"
                options={[{ value: '', label: 'Choose your group' }, ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))]}
              />
            </Field>
          </div>

          <Field label="Allergies" htmlFor="allergies" optional error={form.errorFor('allergies')}
                 hint="Shown on your emergency QR. Leave blank if there are none.">
            <input id="allergies" placeholder="e.g. Penicillin" {...form.field('allergies')} />
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
            I am willing to donate blood
          </label>

          <button type="submit" disabled={form.busy}>
            {form.busy ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* POINT 12: this column used to be a short centred box beside a tall
          form, so the two sides ended at wildly different heights. It now
          stretches to match, and the space is filled with what the QR
          actually carries rather than padding. */}
      <aside className="qr-box">
        <h3>Your emergency QR code</h3>
        <p>
          Anyone who scans this sees your blood group, allergies and next of
          kin — and nothing else. It needs no account to read, which is the
          point: whoever reaches you first can see it.
        </p>
        {profile.qrCodePath
          ? (
            <>
              <img src={profile.qrCodePath} alt="Your emergency QR code" width="180" height="180" />
              <p><a href={profile.qrCodePath} download="emergency-qr.png">Download QR code</a></p>
            </>
          )
          : <p className="muted-note">Your QR code is generated when you register. Save your profile to create one.</p>}

        <div className="qr-carries">
          <span className="tile-label">What it shows</span>
          <dl>
            <div>
              <dt>Blood group</dt>
              <dd>
                {form.values.bloodGroup
                  ? <BloodGroup group={form.values.bloodGroup} variant="bare" />
                  : <span className="qr-missing">Not set</span>}
              </dd>
            </div>
            <div>
              <dt>Allergies</dt>
              <dd>{form.values.allergies?.trim() || 'None recorded'}</dd>
            </div>
            <div>
              <dt>Next of kin</dt>
              <dd>
                {form.values.emergencyContactName?.trim()
                  ? `${form.values.emergencyContactName}${form.values.emergencyContactNumber ? ` · ${form.values.emergencyContactNumber}` : ''}`
                  : <span className="qr-missing">Not set</span>}
              </dd>
            </div>
          </dl>
          <p className="qr-note">
            Saving the form updates the code behind this image straight away.
            Print it, or keep it on your lock screen.
          </p>
        </div>
      </aside>
    </div>
  );
}
