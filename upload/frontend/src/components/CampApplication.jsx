// APPLY TO RUN A BLOOD DONATION CAMP
//
// eRaktKosh has "Register VBD Camp" — a voluntary blood donation camp that an
// outside organisation asks to have listed. LifeLink had no equivalent: camps
// could only be created by an administrator, so a college or an office that
// wanted to run one had no way in at all, and the Camps page was something
// you could only ever read.
//
// Deliberately open to signed-out visitors. The person organising one of
// these is usually an HR officer or a student secretary doing it once —
// making them create a donor account first is how an application form stops
// being used. Nothing they submit is published: it arrives in the console as
// a pending application and an administrator approves it.

import { useState } from 'react';
import api from '../api/axios';
import Modal from './Modal';
import Field from './Field';
import useForm from '../lib/useForm';
import { rules } from '../lib/validate';

const today = () => new Date().toISOString().slice(0, 10);
const tomorrow = () => new Date(Date.now() + 864e5).toISOString().slice(0, 10);

const schema = {
  title: rules.text({ label: 'Camp name', min: 4, max: 140 }),
  organiser: rules.text({ label: 'Organisation', min: 2, max: 120 }),
  venue: rules.text({ label: 'Venue', min: 4, max: 240 }),
  city: rules.place,
  // The server requires tomorrow or later, and the input's own min says the
  // same. Without this second check the browser accepted today and the
  // server then refused it, which is the worst of both.
  date: rules.all(
    rules.date({ label: 'Camp date', future: true }),
    (v) => (String(v) <= today() ? 'Pick a date at least a day from now' : ''),
  ),
  contactName: rules.name,
  contactNumber: rules.phone,
  contactEmail: rules.email,
  expectedDonors: rules.optional(
    rules.number({ label: 'Expected donors', min: 10, max: 2000 }),
  ),
  description: rules.optional(rules.text({ label: 'Anything else', max: 2000 })),
};

const BLANK = {
  title: '', organiser: '', venue: '', city: '', state: '',
  date: '', startTime: '09:00 AM', endTime: '04:00 PM',
  contactName: '', contactNumber: '', contactEmail: '',
  expectedDonors: '', description: '',
};

export default function CampApplication({ open, onClose }) {
  const [receipt, setReceipt] = useState(null);

  const form = useForm(BLANK, schema, {
    onSubmit: async (values) => {
      const { data } = await api.post('/camps/apply', values);
      setReceipt(data);
    },
  });

  const close = () => {
    onClose?.();
    // Reset only after the dialog has gone, so the fields do not visibly
    // empty themselves on the way out.
    setTimeout(() => { setReceipt(null); form.reset(BLANK); }, 250);
  };

  if (!open) return null;

  // ------------------------------------------------------------ receipt --
  if (receipt) {
    return (
      <Modal
        open
        tone="good"
        title="Application received"
        subtitle="Nothing is listed yet — a coordinator reviews it first."
        onClose={close}
        footer={<button type="button" className="btn-primary" onClick={close}>Done</button>}
      >
        <div className="modal-summary">
          <div>
            <span>Reference</span>
            <strong>{receipt.reference}</strong>
          </div>
          <div>
            <span>Camp</span>
            <strong>{receipt.title}</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>
              {receipt.date
                ? new Date(`${receipt.date}T00:00:00`).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })
                : '—'}
            </strong>
          </div>
        </div>
        <p className="hint">
          Quote that reference if you need to chase it. Someone will ring the
          number you gave to confirm the date, the venue and how many staff the
          centre needs to send. Once it is approved the camp appears on this
          page and members can register for a slot.
        </p>
      </Modal>
    );
  }

  // --------------------------------------------------------------- form --
  return (
    <Modal
      open
      title="Apply to run a camp"
      subtitle="For workplaces, colleges, societies and residents' associations."
      onClose={close}
      footer={(
        <>
          <button type="button" className="btn-secondary" onClick={close}>Cancel</button>
          <button type="button" className="btn-primary" disabled={form.busy} onClick={form.submit}>
            {form.busy ? 'Sending…' : 'Send application'}
          </button>
        </>
      )}
    >
      {form.status.message && (
        <p className={`form-status is-${form.status.type === 'error' ? 'error' : 'ok'}`}>
          {form.status.message}
        </p>
      )}

      <p className="hint camp-apply-intro">
        You do not need an account. A coordinator checks the date and venue,
        arranges the staff and equipment, and then lists it publicly — usually
        within two working days.
      </p>

      <form onSubmit={form.submit} noValidate ref={form.formRef}>
        <Field label="Camp name" htmlFor="ca-title" required error={form.errorFor('title')}
               hint="What donors will see on the listing.">
          <input id="ca-title" placeholder="e.g. Ganpat University Annual Blood Drive"
                 {...form.field('title')} />
        </Field>

        <div className="field-pair">
          <Field label="Organisation" htmlFor="ca-org" required error={form.errorFor('organiser')}>
            <input id="ca-org" placeholder="e.g. Ganpat University" {...form.field('organiser')} />
          </Field>
          <Field label="Expected donors" htmlFor="ca-expected" optional
                 error={form.errorFor('expectedDonors')}
                 hint="A rough number is fine — it sets the slots.">
            <input id="ca-expected" type="number" inputMode="numeric" min="10" max="2000"
                   placeholder="e.g. 150" {...form.field('expectedDonors')} />
          </Field>
        </div>

        <Field label="Venue" htmlFor="ca-venue" required error={form.errorFor('venue')}
               hint="The hall or building, with enough detail for a van to find it.">
          <input id="ca-venue" placeholder="e.g. Main Auditorium, Block C" {...form.field('venue')} />
        </Field>

        <div className="field-pair">
          <Field label="City or town" htmlFor="ca-city" required error={form.errorFor('city')}>
            <input id="ca-city" placeholder="e.g. Mehsana" {...form.field('city')} />
          </Field>
          <Field label="State" htmlFor="ca-state" optional>
            <input id="ca-state" placeholder="e.g. Gujarat" {...form.field('state')} />
          </Field>
        </div>

        <div className="field-pair">
          <Field label="Date" htmlFor="ca-date" required error={form.errorFor('date')}>
            <input id="ca-date" type="date" min={tomorrow()} {...form.field('date')} />
          </Field>
          <Field label="Hours" htmlFor="ca-start" optional
                 hint="Most camps run a full working day.">
            <div className="time-pair">
              <input id="ca-start" placeholder="09:00 AM" {...form.field('startTime')} />
              <span aria-hidden="true">to</span>
              <input id="ca-end" placeholder="04:00 PM" {...form.field('endTime')} />
            </div>
          </Field>
        </div>

        <div className="section-header sm"><h4>Who we should speak to</h4></div>

        <Field label="Your name" htmlFor="ca-cname" required error={form.errorFor('contactName')}>
          <input id="ca-cname" autoComplete="name" {...form.field('contactName')} />
        </Field>

        <div className="field-pair">
          <Field label="Phone" htmlFor="ca-cphone" required error={form.errorFor('contactNumber')}>
            <input id="ca-cphone" type="tel" inputMode="numeric" autoComplete="tel"
                   {...form.field('contactNumber')} />
          </Field>
          <Field label="Email" htmlFor="ca-cemail" required error={form.errorFor('contactEmail')}>
            <input id="ca-cemail" type="email" autoComplete="email" {...form.field('contactEmail')} />
          </Field>
        </div>

        <Field label="Anything else" htmlFor="ca-note" optional error={form.errorFor('description')}
               hint="Parking, lift access, whether a previous camp has run here.">
          <textarea id="ca-note" rows={3} {...form.field('description')} />
        </Field>

        {/* The form posts through the footer button; this keeps Enter working
            inside the fields without showing a second submit. */}
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">Send</button>
      </form>
    </Modal>
  );
}

export { today };
