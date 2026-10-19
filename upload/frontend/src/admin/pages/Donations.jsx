// Donation records. These are the entries that put a member on the public
// leaderboard, so only an administrator can create one - a member cannot
// claim a donation for themselves.
//
// Issuing the CERTIFICATE is a second, separate act. Recording a donation
// says it happened; issuing says the network will put its name to it. Until
// an administrator issues it, the member sees the donation on their record
// with the certificate marked as pending rather than a download link.

import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import StatusTag from '../../components/StatusTag';
import ContactActions from '../../components/ContactActions';
import SearchSelect from '../../components/SearchSelect';
import Field from '../../components/Field';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PageHeader, Card, StatCard, BloodTag, formatDate } from '../components/ui';
import { IconPlus, IconTrash, IconDrop, IconUsers, IconCheck } from '../components/Icons';
import useForm from '../../lib/useForm';
import { rules } from '../../lib/validate';

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY = { userId: '', donatedAt: today(), units: 1, hospitalId: '', campId: '', locationName: '', notes: '' };

// Four units is the most one sitting can produce, and a donation cannot have
// happened tomorrow - both mistakes reach the leaderboard if they get through.
const schema = {
  userId: rules.required('Member'),
  donatedAt: rules.date({ label: 'Date of donation', past: true }),
  units: rules.number({ label: 'Units', min: 1, max: 4 }),
  locationName: rules.optional(rules.text({ label: 'Location', max: 120 })),
  notes: rules.optional(rules.text({ label: 'Notes', max: 300 })),
};

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// A donation is recorded against a centre, a camp or a typed-in place, so the
// one "where" the table shows has to fall back through all three.
const placeOf = (d) => d.locationName || d.hospitalId?.name || d.campId?.title || '';

export default function Donations() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // Issuing a certificate is a separate act from recording the donation, so
  // it gets its own row action rather than happening on create.
  const [busyId, setBusyId] = useState(null);
  const [issuingAll, setIssuingAll] = useState(false);

  // Pickers for the create form
  const [members, setMembers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [camps, setCamps] = useState([]);
  const [memberQuery, setMemberQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/donations');
      setItems(Array.isArray(data) ? data : data.items || []);
      setLoadError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load donations.';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const form = useForm(EMPTY, schema, {
    onSubmit: async (values) => {
      try {
        await adminApi.post('/admin/donations', values);
        toast.success('Donation recorded. Issue the certificate when you are ready for the member to download it.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not record the donation.');
        throw err; // useForm puts the server's field messages back on the fields
      }
      setAdding(false);
      load();
    },
  });

  const closeForm = () => { setAdding(false); form.reset(EMPTY); };

  // A donation happened in one place, so choosing a centre clears the camp
  // and the other way round.
  const setWhere = (key, value) => {
    form.setField(key, value);
    form.setField(key === 'hospitalId' ? 'campId' : 'hospitalId', '');
  };

  const openNew = async () => {
    form.reset(EMPTY);
    setAdding(true);
    try {
      const [h, c] = await Promise.all([
        adminApi.get('/hospitals'),
        adminApi.get('/admin/camps', { params: { status: 'upcoming' } }),
      ]);
      setHospitals(h.data);
      setCamps(c.data);
    } catch { /* pickers are optional */ }
  };

  // Member search inside the modal - the list can be large.
  useEffect(() => {
    if (!adding) return undefined;
    const t = setTimeout(() => {
      adminApi.get('/admin/users', { params: { search: memberQuery, limit: 20 } })
        .then((res) => setMembers(res.data.items || []))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [adding, memberQuery]);

  const remove = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/admin/donations/${confirm._id}`);
      toast.success('Record removed.');
      setConfirm(null);
      load();
    } catch {
      toast.error('Could not delete.');
    } finally {
      setDeleting(false);
    }
  };

  const issue = async (d) => {
    setBusyId(d._id);
    try {
      const { data } = await adminApi.post(`/admin/donations/${d._id}/certificate`);
      setItems((rows) => rows.map((r) => (r._id === d._id ? { ...r, ...data } : r)));
      toast.success(`Certificate issued to ${d.userId?.name || 'the member'}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not issue that certificate.');
    } finally {
      setBusyId(null);
    }
  };

  const revoke = async (d) => {
    setBusyId(d._id);
    try {
      await adminApi.delete(`/admin/donations/${d._id}/certificate`);
      setItems((rows) => rows.map((r) => (r._id === d._id
        ? { ...r, certificateIssued: false, certificateIssuedAt: null } : r)));
      toast.success('Certificate withdrawn.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not withdraw that certificate.');
    } finally {
      setBusyId(null);
    }
  };

  const issueAll = async () => {
    setIssuingAll(true);
    try {
      const { data } = await adminApi.post('/admin/certificates/issue-all');
      toast.success(`${data.issued} certificate${data.issued === 1 ? '' : 's'} issued.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not issue the queue.');
    } finally {
      setIssuingAll(false);
    }
  };

  const units = items.reduce((a, d) => a + (d.units || 0), 0);
  const donors = new Set(items.map((d) => String(d.userId?._id || d.userId))).size;
  const pending = items.filter((d) => !d.certificateIssued).length;

  return (
    <>
      <PageHeader title="Donation records" subtitle="Confirmed donations. Recording one puts a member on the leaderboard; the certificate is issued separately, here.">
        {pending > 0 && (
          <button type="button" className="adm-btn" onClick={issueAll} disabled={issuingAll}>
            {issuingAll ? 'Issuing…' : `Issue all ${pending} pending`}
          </button>
        )}
        <button type="button" className="adm-btn primary" onClick={openNew}>
          <IconPlus width={16} height={16} /> Record donation
        </button>
      </PageHeader>

      <div className="adm-stat-grid tight">
        <StatCard icon={<IconDrop />} label="Donations shown" value={items.length} tone="accent" />
        <StatCard icon={<IconCheck />} label="Units" value={units} />
        <StatCard icon={<IconUsers />} label="Distinct donors" value={donors} />
        <StatCard icon={<IconCheck />} label="Certificates awaiting issue" value={pending}
                  tone={pending > 0 ? 'warn' : 'default'}
                  hint={pending > 0 ? 'Members cannot download these yet' : 'Nothing waiting'} />
      </div>

      <Card className="has-table">
        <DataTable
          caption="donations"
          rows={items}
          loading={loading}
          error={loadError}
          rowKey={(d) => d._id}
          exportName="donations"
          initialSort={{ key: 'donatedAt', dir: 'desc' }}
          defaultPerPage={12}
          searchKeys={['bloodGroup', 'certificateNo',
                       (d) => d.userId?.name, (d) => d.userId?.email, placeOf]}
          searchPlaceholder="Search by donor, email, place or certificate number…"
          rowClass={(d) => (busyId === d._id ? 'busy' : '')}
          filters={[
            {
              key: 'certificateIssued',
              label: 'Certificate',
              options: [
                { value: 'issued', label: 'Issued' },
                { value: 'awaiting', label: 'Awaiting issue' },
              ],
              match: (d, v) => (v === 'issued' ? !!d.certificateIssued : !d.certificateIssued),
            },
            { key: 'bloodGroup', label: 'Blood group', options: GROUPS },
            {
              key: 'where',
              label: 'Where',
              options: [...new Set(items.map(placeOf).filter(Boolean))].sort(),
              match: (d, v) => placeOf(d) === v,
            },
          ]}
          empty={{ title: 'No donations match', message: 'Record a donation to put a member on the leaderboard, or clear a filter.' }}
          columns={[
            {
              key: 'userId.name',
              header: 'Donor',
              render: (d) => (d.userId ? (
                <>
                  <strong>{d.userId.name}</strong>
                  <ContactActions size="sm" email={d.userId.email} name={d.userId.name} />
                </>
              ) : <span className="adm-muted">Deleted member</span>),
              csv: (d) => `${d.userId?.name || ''} ${d.userId?.email || ''}`.trim(),
            },
            {
              key: 'donatedAt',
              header: 'Date',
              width: '130px',
              render: (d) => formatDate(d.donatedAt),
              sortValue: (d) => new Date(d.donatedAt).getTime(),
              csv: (d) => formatDate(d.donatedAt),
            },
            {
              key: 'bloodGroup',
              header: 'Group',
              width: '90px',
              render: (d) => <BloodTag group={d.bloodGroup} />,
            },
            { key: 'units', header: 'Units', width: '80px' },
            {
              key: 'where',
              header: 'Where',
              render: (d) => <span className="adm-muted">{placeOf(d) || '—'}</span>,
              sortValue: placeOf,
              csv: placeOf,
            },
            {
              key: 'certificateNo',
              header: 'Reference',
              width: '150px',
              render: (d) => <span className="adm-mono">{d.certificateNo || '—'}</span>,
            },
            {
              key: 'certificateIssued',
              header: 'Certificate',
              width: '150px',
              render: (d) => (d.certificateIssued
                ? <StatusTag label="Issued" tone="good" size="sm" />
                : <StatusTag label="Awaiting issue" tone="warn" size="sm" />),
              sortValue: (d) => (d.certificateIssued ? 1 : 0),
              csv: (d) => (d.certificateIssued
                ? `Issued ${d.certificateIssuedAt ? formatDate(d.certificateIssuedAt) : ''}`.trim()
                : 'Awaiting issue'),
            },
            {
              key: 'actions',
              header: '',
              sortable: false,
              export: false,
              align: 'right',
              width: '190px',
              render: (d) => (
                <div className="adm-row-actions">
                  {d.certificateIssued ? (
                    <button type="button" className="adm-btn small" disabled={busyId === d._id}
                            onClick={() => revoke(d)}>Withdraw</button>
                  ) : (
                    <button type="button" className="adm-btn small primary" disabled={busyId === d._id}
                            onClick={() => issue(d)}>Issue certificate</button>
                  )}
                  <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(d)}><IconTrash width={17} height={17} /></button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={adding}
        title="Record a donation"
        subtitle="This counts towards the member's tier and issues their certificate."
        onClose={closeForm}
        wide
        footer={(
          <>
            <button type="button" className="adm-btn ghost" onClick={closeForm}>Cancel</button>
            <button type="submit" form="donation-form" className="adm-btn primary" disabled={form.busy}>{form.busy ? 'Saving…' : 'Record donation'}</button>
          </>
        )}
      >
        {form.status.message && (
          <p className={`form-status is-${form.status.type === 'error' ? 'error' : 'ok'}`}>
            {form.status.message}
          </p>
        )}

        <form id="donation-form" className="adm-form grid-2" onSubmit={form.submit} ref={form.formRef} noValidate>
          {/* The register is far too long to ship to the browser, so this box
              narrows it server-side; the member list below is the result. */}
          <label className="adm-field span-2"><span>Find the member</span>
            <input value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} placeholder="Type a name or email…" />
          </label>

          <Field label="Member" htmlFor="userId" required className="span-2"
                 error={form.errorFor('userId')}>
            <select id="userId" {...form.field('userId')}>
              <option value="">Select a member…</option>
              {members.map((m) => (
                <option key={m._id} value={m._id}>{m.name} — {m.bloodGroup} — {m.email}</option>
              ))}
            </select>
          </Field>

          <Field label="Date of donation" htmlFor="donatedAt" required
                 error={form.errorFor('donatedAt')}>
            <input id="donatedAt" type="date" max={today()} {...form.field('donatedAt')} />
          </Field>

          <Field label="Units" htmlFor="units" required error={form.errorFor('units')}
                 hint="One unit is about 450 ml.">
            <input id="units" type="number" min="1" max="4" step="1" inputMode="numeric"
                   {...form.field('units')} />
          </Field>

          <Field label="Blood centre" htmlFor="hospitalId" optional>
            <SearchSelect
              id="hospitalId"
              value={form.values.hospitalId}
              onChange={(e) => setWhere('hospitalId', e.target.value)}
              placeholder="Not at a listed centre"
              options={[{ value: '', label: 'Not at a listed centre' },
                        ...hospitals.map((h) => ({ value: h._id, label: h.name }))]}
            />
          </Field>

          <Field label="…or at a camp" htmlFor="campId" optional>
            <SearchSelect
              id="campId"
              value={form.values.campId}
              onChange={(e) => setWhere('campId', e.target.value)}
              placeholder="Not at a camp"
              options={[{ value: '', label: 'Not at a camp' },
                        ...camps.map((c) => ({ value: c._id, label: `${c.title} — ${c.city}` }))]}
            />
          </Field>

          <Field label="Or type the location" htmlFor="locationName" optional className="span-2"
                 error={form.errorFor('locationName')}
                 hint="Used if neither picker above applies.">
            <input id="locationName" {...form.field('locationName')} />
          </Field>

          <Field label="Notes (internal)" htmlFor="notes" optional className="span-2"
                 error={form.errorFor('notes')}>
            <input id="notes" maxLength={300} {...form.field('notes')} />
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this donation record?"
        message="The member will lose this donation from their total, their tier may drop, and the certificate stops working."
        busy={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </>
  );
}
