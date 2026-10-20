// BLOOD REQUESTS BOARD
//
// Somebody says what they need and where; everybody signed in can see it and
// ring them. The requester closes their own request when it is answered.
//
// This page was the weakest on the site: a bare table with no sorting, no
// filtering beyond blood group, text links where icons belong, a form that
// checked nothing, and a single date column. It is now the standard data
// table used everywhere else, with the request date and the date it was
// answered both shown, because "raised 9 days ago, still pending" is the
// thing a board like this exists to make obvious.

import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BloodGroup from '../components/BloodGroup';
import DataTable from '../components/DataTable';
import StatusTag from '../components/StatusTag';
import ContactActions from '../components/ContactActions';
import SearchSelect from '../components/SearchSelect';
import Field from '../components/Field';
import PageLoader from '../components/PageLoader';
import Modal from '../components/Modal';
import useForm from '../lib/useForm';
import { rules, BLOOD_GROUPS } from '../lib/validate';

const URGENCY = [
  { value: 'routine', label: 'Planned — within a week' },
  { value: 'urgent', label: 'Urgent — within 48 hours' },
  { value: 'critical', label: 'Critical — today' },
];
const URGENCY_LABEL = Object.fromEntries(URGENCY.map((u) => [u.value, u.label.split(' —')[0]]));

const dmy = (v) => (v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

// "9 days ago" is what tells you a request has gone stale; a date alone does not.
const ago = (v) => {
  if (!v) return '';
  const mins = Math.round((Date.now() - new Date(v).getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
  const days = Math.round(mins / 1440);
  return days === 1 ? 'yesterday' : `${days} days ago`;
};

const schema = {
  bloodGroupNeeded: rules.bloodGroup,
  location: rules.place,
  unitsNeeded: rules.number({ label: 'Units', min: 1, max: 20 }),
  hospital: rules.optional(rules.text({ label: 'Hospital', max: 120 })),
  note: rules.optional(rules.text({ label: 'Note', max: 300 })),
};

export default function DonationRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState(null);
  // Two dialogs, not a line of green text. Posting a request and closing one
  // are the two moments on this page that deserve a full stop: the first
  // because the person has just asked strangers for help and needs to know
  // it actually went out, the second because it is the only good news the
  // board ever carries.
  const [postedRequest, setPostedRequest] = useState(null);
  const [closedRequest, setClosedRequest] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/donation-requests');
      setRequests(Array.isArray(data) ? data : []);
      setLoadError('');
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Could not load the requests board.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const form = useForm(
    { bloodGroupNeeded: '', location: '', unitsNeeded: 1, hospital: '', note: '', urgency: 'urgent' },
    schema,
    {
      onSubmit: async (values) => {
        const { data } = await api.post('/donation-requests', values);
        form.reset();
        await load();
        setPostedRequest({ ...values, ...(data || {}) });
      },
    },
  );

  const close = async (row, how) => {
    setBusyId(row._id);
    try {
      const { data } = await api.put(`/donation-requests/${row._id}/${how}`);
      await load();
      setClosedRequest({ ...row, ...(data || {}), how });
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Could not update that request. Try again.');
    } finally {
      setBusyId(null);
    }
  };

  // How long the request stood open, in words. "Answered in 6 hours" is the
  // number that says whether the board is working.
  const openFor = (row) => {
    const from = new Date(row.createdAt).getTime();
    const to = new Date(row.fulfilledAt || row.cancelledAt || Date.now()).getTime();
    const mins = Math.max(1, Math.round((to - from) / 60000));
    if (mins < 60) return mins === 1 ? 'under a minute' : `${mins} minutes`;
    const hours = Math.round(mins / 60);
    if (mins < 1440) return hours === 1 ? 'an hour' : `${hours} hours`;
    const days = Math.round(mins / 1440);
    return days === 1 ? 'a day' : `${days} days`;
  };

  const shareText = (r) =>
    `Blood needed: ${r.unitsNeeded || 1} unit(s) of ${r.bloodGroupNeeded} in ${r.location}` +
    `${r.hospital ? ` (${r.hospital})` : ''}. ` +
    `If you can help, contact ${user?.name || 'the requester'} on ${user?.phone || ''}. Shared via LifeLink.`;

  const mine = (row) => row.requesterId?._id === user?.id;

  // Seven columns, not ten. Units rides with the group, the contact icons sit
  // with the name they belong to, and urgency sits under the status — the
  // earlier split pushed Status and the actions off the right-hand edge.
  const columns = useMemo(() => [
    {
      key: 'bloodGroupNeeded',
      header: 'Needed',
      width: '110px',
      render: (r) => (
        <div className="req-need">
          <BloodGroup group={r.bloodGroupNeeded} variant="badge" />
          <small>{r.unitsNeeded || 1} {(r.unitsNeeded || 1) === 1 ? 'unit' : 'units'}</small>
        </div>
      ),
      csv: (r) => `${r.bloodGroupNeeded} x${r.unitsNeeded || 1}`,
    },
    {
      key: 'location',
      header: 'Where',
      render: (r) => (
        <>
          <strong>{r.location}</strong>
          {r.hospital && <><br /><small className="muted-note">{r.hospital}</small></>}
        </>
      ),
      csv: (r) => [r.location, r.hospital].filter(Boolean).join(' - '),
    },
    {
      key: 'requesterId.name',
      header: 'Raised by',
      render: (r) => (
        <div className="req-who">
          <span>{r.requesterId?.name || 'Member'}</span>
          <ContactActions
            size="sm"
            phone={r.requesterId?.phone}
            name={r.requesterId?.name}
            locked={!user}
            lockedHint="Sign in to contact"
            message={`Hello, I saw your LifeLink request for ${r.unitsNeeded || 1} unit(s) of ${r.bloodGroupNeeded} in ${r.location}. I may be able to help.`}
          />
        </div>
      ),
      csv: (r) => `${r.requesterId?.name || ''} ${r.requesterId?.phone || ''}`.trim(),
    },
    {
      key: 'createdAt',
      header: 'Requested',
      defaultDir: 'desc',
      width: '120px',
      render: (r) => (
        <>
          {dmy(r.createdAt)}
          <br /><small className="muted-note">{ago(r.createdAt)}</small>
        </>
      ),
      sortValue: (r) => new Date(r.createdAt).getTime(),
      csv: (r) => dmy(r.createdAt),
    },
    {
      key: 'fulfilledAt',
      header: 'Closed',
      width: '120px',
      render: (r) => {
        const when = r.fulfilledAt || r.cancelledAt;
        if (!when) return <span className="muted-note">Still open</span>;
        return (
          <>
            {dmy(when)}
            <br /><small className="muted-note">{r.fulfilledAt ? 'fulfilled' : 'cancelled'}</small>
          </>
        );
      },
      sortValue: (r) => (r.fulfilledAt || r.cancelledAt ? new Date(r.fulfilledAt || r.cancelledAt).getTime() : null),
      csv: (r) => dmy(r.fulfilledAt || r.cancelledAt),
    },
    {
      key: 'status',
      header: 'Status',
      width: '132px',
      render: (r) => (
        <div className="req-status">
          <StatusTag status={r.status} />
          {r.status === 'pending' && (
            <StatusTag
              size="sm"
              label={URGENCY_LABEL[r.urgency] || 'Urgent'}
              tone={r.urgency === 'critical' ? 'bad' : r.urgency === 'routine' ? 'info' : 'warn'}
            />
          )}
        </div>
      ),
      csv: (r) => `${r.status}${r.status === 'pending' ? ` (${r.urgency})` : ''}`,
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      export: false,
      align: 'right',
      width: '150px',
      render: (r) => (
        <div className="req-actions">
          {r.status === 'pending' && mine(r) && (
            <>
              <button type="button" className="small-button" disabled={busyId === r._id}
                      onClick={() => close(r, 'fulfil')}>
                {busyId === r._id ? 'Saving…' : 'Fulfilled'}
              </button>
              <button type="button" className="small-button ghost" disabled={busyId === r._id}
                      onClick={() => close(r, 'cancel')}>
                Cancel
              </button>
            </>
          )}
          {r.status === 'pending' && !mine(r) && (
            <a
              className="small-button share"
              target="_blank" rel="noopener noreferrer"
              href={`https://wa.me/?text=${encodeURIComponent(
                `Blood needed: ${r.unitsNeeded || 1} unit(s) of ${r.bloodGroupNeeded} in ${r.location}` +
                `${r.hospital ? ` (${r.hospital})` : ''}. ` +
                `If you can help, contact ${r.requesterId?.name || 'the requester'} on ${r.requesterId?.phone || ''}. Shared via LifeLink.`)}`}
              title="Forward this request to a WhatsApp contact or group"
            >
              Share
            </a>
          )}
        </div>
      ),
    },
  ], [user, busyId]); // eslint-disable-line react-hooks/exhaustive-deps

  const open = requests.filter((r) => r.status === 'pending').length;

  if (loading) return <PageLoader label="Loading the requests board" />;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="app-eyebrow">Requests</p>
          <h1 className="page-h1">Who needs blood right now</h1>
          <p>
            {open > 0
              ? `${open} open ${open === 1 ? 'request' : 'requests'} across the network. If you are a match and nearby, one call is all it takes.`
              : 'Nothing is outstanding at the moment. Post a request below if you need blood.'}
          </p>
        </div>
      </div>

      <div className="req-layout">
        <section className="form-card" ref={form.formRef}>
          <h3>Post a request</h3>
          <p className="muted-note">
            It appears on this board straight away. Everyone signed in can see
            your name and number so they can call you directly.
          </p>

          {form.status.message && (
            <p className={`form-status is-${form.status.type === 'error' ? 'error' : 'ok'}`}>
              {form.status.message}
            </p>
          )}

          <form onSubmit={form.submit} noValidate>
            <Field label="Blood group needed" htmlFor="bloodGroupNeeded" required
                   error={form.errorFor('bloodGroupNeeded')}>
              <SearchSelect
                id="bloodGroupNeeded"
                value={form.values.bloodGroupNeeded}
                onChange={(e) => { form.setField('bloodGroupNeeded', e.target.value); form.setTouched((t) => ({ ...t, bloodGroupNeeded: true })); }}
                placeholder="Choose a group"
                options={[{ value: '', label: 'Choose a group' }, ...BLOOD_GROUPS.map((g) => ({ value: g, label: g }))]}
              />
            </Field>

            <Field label="Units needed" htmlFor="unitsNeeded" required
                   error={form.errorFor('unitsNeeded')}
                   hint="One unit is about 450 ml. Most transfusions need one or two.">
              <input id="unitsNeeded" type="number" min="1" max="20" step="1"
                     inputMode="numeric" {...form.field('unitsNeeded')} />
            </Field>

            <Field label="Town or city" htmlFor="location" required
                   error={form.errorFor('location')}>
              <input id="location" placeholder="e.g. Surat" autoComplete="address-level2"
                     {...form.field('location')} />
            </Field>

            <Field label="Hospital" htmlFor="hospital" optional
                   error={form.errorFor('hospital')}
                   hint="Where the patient is, if you know it.">
              <input id="hospital" placeholder="e.g. New Civil Hospital" {...form.field('hospital')} />
            </Field>

            <Field label="How urgent" htmlFor="urgency" error={form.errorFor('urgency')}>
              <SearchSelect
                id="urgency"
                value={form.values.urgency}
                onChange={(e) => form.setField('urgency', e.target.value)}
                options={URGENCY}
              />
            </Field>

            <Field label="Anything else" htmlFor="note" optional
                   error={form.errorFor('note')}
                   hint={`${String(form.values.note || '').length}/300 characters`}>
              <textarea id="note" rows={3} maxLength={300}
                        placeholder="Ward, patient name, best time to call…"
                        {...form.field('note')} />
            </Field>

            <button type="submit" disabled={form.busy}>
              {form.busy ? 'Posting…' : 'Post request'}
            </button>
          </form>

          {/* The board is long; this keeps the column beside it useful
              instead of leaving a tall empty space. */}
          <dl className="req-summary">
            <div><dt>Open now</dt><dd className="is-open">{open}</dd></div>
            <div><dt>Fulfilled</dt><dd className="is-done">{requests.filter((r) => r.status === 'fulfilled').length}</dd></div>
            <div><dt>Towns covered</dt><dd>{new Set(requests.map((r) => r.location)).size}</dd></div>
          </dl>
        </section>

        <section className="req-board">
          <DataTable
            caption="requests"
            columns={columns}
            rows={requests}
            loading={loading}
            error={loadError}
            rowKey={(r) => r._id}
            searchKeys={['location', 'hospital', 'bloodGroupNeeded', (r) => r.requesterId?.name]}
            searchPlaceholder="Search by place, hospital or name…"
            initialSort={{ key: 'createdAt', dir: 'desc' }}
            exportName="blood-requests"
            rowClass={(r) => (r.status === 'pending' ? 'is-open-request' : '')}
            filters={[
              { key: 'bloodGroupNeeded', label: 'Blood group', options: BLOOD_GROUPS },
              {
                key: 'status',
                label: 'Status',
                options: [
                  { value: 'pending', label: 'Pending' },
                  { value: 'fulfilled', label: 'Fulfilled' },
                  { value: 'cancelled', label: 'Cancelled' },
                ],
              },
              { key: 'urgency', label: 'Urgency', options: URGENCY },
              {
                key: 'location',
                label: 'Town',
                options: [...new Set(requests.map((r) => r.location).filter(Boolean))].sort(),
              },
              {
                key: 'age',
                label: 'Raised',
                placeholder: 'Any time',
                options: [
                  { value: '1', label: 'In the last 24 hours' },
                  { value: '7', label: 'In the last 7 days' },
                  { value: '30', label: 'In the last 30 days' },
                ],
                match: (r, v) => Date.now() - new Date(r.createdAt).getTime() <= Number(v) * 86400000,
              },
            ]}
            empty={{
              title: 'No requests on the board',
              message: 'When somebody needs blood, their request appears here.',
            }}
          />
        </section>
      </div>

      {/* Posted. Shows back what went out and offers the one action that
          actually finds a donor fastest in India - forwarding it to a
          WhatsApp group. */}
      <Modal
        open={Boolean(postedRequest)}
        onClose={() => setPostedRequest(null)}
        tone="good"
        title="Your request is on the board"
        subtitle="Every signed-in member can see it now, along with your name and number."
        icon={(
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m4 12.5 5 5L20 6.5" />
          </svg>
        )}
        footer={(
          <>
            <button type="button" className="btn-secondary" onClick={() => setPostedRequest(null)}>
              Done
            </button>
            {postedRequest && (
              <a
                className="btn-primary"
                target="_blank" rel="noopener noreferrer"
                href={`https://wa.me/?text=${encodeURIComponent(shareText(postedRequest))}`}
                onClick={() => setPostedRequest(null)}
              >
                Share on WhatsApp
              </a>
            )}
          </>
        )}
      >
        {postedRequest && (
          <>
            <dl className="modal-summary">
              <div>
                <dt>Needed</dt>
                <dd>
                  <BloodGroup group={postedRequest.bloodGroupNeeded} variant="pill" />
                  {' '}{postedRequest.unitsNeeded || 1} {(postedRequest.unitsNeeded || 1) === 1 ? 'unit' : 'units'}
                </dd>
              </div>
              <div>
                <dt>Where</dt>
                <dd>{[postedRequest.hospital, postedRequest.location].filter(Boolean).join(', ')}</dd>
              </div>
              <div>
                <dt>Urgency</dt>
                <dd>{URGENCY_LABEL[postedRequest.urgency] || 'Urgent'}</dd>
              </div>
            </dl>
            <p>
              Keep your phone to hand — donors ring the number on your profile
              directly. When somebody comes through, mark the request fulfilled
              so nobody else calls you about it.
            </p>
            <p className="muted-note">
              If this is an emergency, do not wait on the board: call the centre
              or your local emergency number now.
            </p>
          </>
        )}
      </Modal>

      {/* Closed. Cancelled is not a celebration, so the two cases are not
          dressed the same. */}
      <Modal
        open={Boolean(closedRequest)}
        onClose={() => setClosedRequest(null)}
        tone={closedRequest?.how === 'fulfil' ? 'good' : 'warn'}
        title={closedRequest?.how === 'fulfil' ? 'Marked as fulfilled' : 'Request withdrawn'}
        subtitle={closedRequest?.how === 'fulfil'
          ? 'It is off the open board, so nobody else will call you about it.'
          : 'It no longer shows as open. You can post a new one whenever you need to.'}
        icon={closedRequest?.how === 'fulfil' ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20.5s-7.5-4.8-7.5-10a4.3 4.3 0 0 1 7.5-2.8 4.3 4.3 0 0 1 7.5 2.8c0 5.2-7.5 10-7.5 10Z" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        )}
        footer={<button type="button" className="btn-primary" onClick={() => setClosedRequest(null)}>Close</button>}
      >
        {closedRequest && (
          <>
            <dl className="modal-summary">
              <div>
                <dt>Request</dt>
                <dd>
                  <BloodGroup group={closedRequest.bloodGroupNeeded} variant="pill" />
                  {' '}{closedRequest.unitsNeeded || 1} {(closedRequest.unitsNeeded || 1) === 1 ? 'unit' : 'units'} in {closedRequest.location}
                </dd>
              </div>
              <div>
                <dt>{closedRequest.how === 'fulfil' ? 'Answered in' : 'Open for'}</dt>
                <dd>{openFor(closedRequest)}</dd>
              </div>
            </dl>
            {closedRequest.how === 'fulfil' ? (
              <p>
                Thank you for closing it off. If a donor from LifeLink helped,
                they can record the donation at the centre and it will show on
                their record and the leaderboard.
              </p>
            ) : (
              <p>
                Nothing else happens — the request simply stops showing as open.
                It stays in your history with today's date against it.
              </p>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
