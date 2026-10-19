// Member management: search, filter, paginate, inspect, edit, promote, delete.

import { useCallback, useEffect, useMemo, useState } from 'react';
import adminApi from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import ContactActions from '../../components/ContactActions';
import Field from '../../components/Field';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import {
  PageHeader, Card, Badge, BloodTag, Spinner, TableWrap, formatDate, initials,
} from '../components/ui';
import { IconPlus, IconEdit, IconTrash } from '../components/Icons';
import useForm from '../../lib/useForm';
import { rules } from '../../lib/validate';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EMPTY_FORM = {
  name: '', email: '', password: '', phone: '', bloodGroup: 'O+',
  location: '', isDonor: false, role: 'user',
};

export default function Users() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [editing, setEditing] = useState(null);   // user being edited (or 'new')
  const [detail, setDetail] = useState(null);     // { user, requests, appointments }
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // The table searches, filters and pages on its own, so ask for the whole
      // register at once. 100 is as many rows as the endpoint will hand over.
      const { data } = await adminApi.get('/admin/users', { params: { limit: 100 } });
      const rows = Array.isArray(data) ? data : data.items || [];
      setItems(rows);
      setTotal(data.total ?? rows.length);
      setLoadError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load members.';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const isNew = editing === 'new';

  // The schema follows the mode. A new account needs a password; an existing
  // one cannot have its email moved here (the server ignores it either way),
  // and the medical and next-of-kin fields only appear once the record exists.
  const schema = useMemo(() => ({
    name: rules.name,
    phone: rules.phone,
    bloodGroup: rules.bloodGroup,
    location: rules.optional(rules.place),
    ...(isNew
      ? { email: rules.email, password: rules.password }
      : {
        allergies: rules.optional(rules.text({ label: 'Allergies', max: 200 })),
        emergencyContactName: rules.optional(rules.name),
        emergencyContactNumber: rules.optional(rules.phone),
      }),
  }), [isNew]);

  const form = useForm(EMPTY_FORM, schema, {
    onSubmit: async (values) => {
      try {
        if (isNew) {
          await adminApi.post('/admin/users', values);
          toast.success(`${String(values.name).trim()} was added.`);
        } else {
          await adminApi.put(`/admin/users/${editing._id}`, values);
          toast.success('Member updated.');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not save this member.');
        // Rethrown so useForm can put the server's per-field messages back on
        // the fields they belong to rather than only in the toast.
        throw err;
      }
      setEditing(null);
      load();
    },
  });

  const closeForm = () => { setEditing(null); form.reset(EMPTY_FORM); };

  const openNew = () => { form.reset(EMPTY_FORM); setEditing('new'); };
  const openEdit = (u) => {
    form.reset({
      name: u.name || '', email: u.email || '', password: '', phone: u.phone || '',
      bloodGroup: u.bloodGroup || 'O+', location: u.location || '',
      isDonor: !!u.isDonor, role: u.role || 'user',
      allergies: u.allergies || '',
      emergencyContactName: u.emergencyContact?.name || '',
      emergencyContactNumber: u.emergencyContact?.number || '',
    });
    setEditing(u);
  };

  const openDetail = async (u) => {
    setDetail({ loading: true, user: u });
    try {
      const { data } = await adminApi.get(`/admin/users/${u._id}`);
      setDetail({ ...data, loading: false });
    } catch {
      setDetail(null);
      toast.error('Could not load that member.');
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/admin/users/${confirm._id}`);
      toast.success(`${confirm.name} was removed.`);
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete this member.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader title="Members" subtitle={`${total} registered account${total === 1 ? '' : 's'}.`}>
        <button type="button" className="adm-btn primary" onClick={openNew}>
          <IconPlus width={16} height={16} /> Add member
        </button>
      </PageHeader>

      <Card className="has-table">
        <DataTable
          caption="members"
          rows={items}
          loading={loading}
          error={loadError}
          rowKey={(u) => u._id}
          exportName="members"
          initialSort={{ key: 'createdAt', dir: 'desc' }}
          defaultPerPage={12}
          searchKeys={['name', 'email', 'phone', 'location']}
          searchPlaceholder="Search name, email, phone or city…"
          filters={[
            { key: 'bloodGroup', label: 'Blood group', options: GROUPS },
            {
              key: 'isDonor',
              label: 'Donor',
              placeholder: 'Donors & non-donors',
              options: [
                { value: 'true', label: 'Donors only' },
                { value: 'false', label: 'Non-donors only' },
              ],
              // Older accounts have no isDonor flag at all, so match on the
              // coerced value rather than the stored one.
              match: (u, v) => String(!!u.isDonor) === v,
            },
            {
              key: 'role',
              label: 'Role',
              options: [
                { value: 'user', label: 'Members' },
                { value: 'admin', label: 'Administrators' },
              ],
            },
            { key: 'location', label: 'Town', options: [...new Set(items.map((u) => u.location).filter(Boolean))].sort() },
          ]}
          empty={{ title: 'No members match those filters', message: 'Try clearing the search box or widening the filters.' }}
          columns={[
            {
              key: 'name',
              header: 'Member',
              render: (u) => (
                <button type="button" className="adm-person" onClick={() => openDetail(u)}>
                  <span className="adm-avatar sm">{initials(u.name)}</span>
                  <span>
                    <strong>{u.name}</strong>
                    <small>{u.email}</small>
                  </span>
                </button>
              ),
              csv: (u) => `${u.name || ''} ${u.email || ''}`.trim(),
            },
            {
              key: 'phone',
              header: 'Contact',
              sortable: false,
              width: '120px',
              render: (u) => <ContactActions size="sm" phone={u.phone} email={u.email} name={u.name} />,
              csv: (u) => [u.phone, u.email].filter(Boolean).join(' '),
            },
            {
              key: 'bloodGroup',
              header: 'Group',
              width: '90px',
              render: (u) => <BloodTag group={u.bloodGroup} />,
            },
            {
              key: 'isDonor',
              header: 'Donor',
              width: '100px',
              render: (u) => (u.isDonor ? <Badge tone="good">Donor</Badge> : <Badge>No</Badge>),
              csv: (u) => (u.isDonor ? 'Donor' : 'No'),
            },
            {
              key: 'location',
              header: 'Location',
              render: (u) => u.location || '—',
            },
            {
              key: 'role',
              header: 'Role',
              width: '110px',
              render: (u) => (u.role === 'admin' ? <Badge tone="accent">Admin</Badge> : <Badge>Member</Badge>),
              csv: (u) => (u.role === 'admin' ? 'Administrator' : 'Member'),
            },
            {
              key: 'createdAt',
              header: 'Joined',
              width: '130px',
              render: (u) => <span className="adm-muted">{formatDate(u.createdAt)}</span>,
              sortValue: (u) => new Date(u.createdAt).getTime(),
              csv: (u) => formatDate(u.createdAt),
            },
            {
              key: 'actions',
              header: '',
              sortable: false,
              export: false,
              align: 'right',
              width: '96px',
              render: (u) => (
                <div className="adm-row-actions">
                  <button type="button" className="adm-icon-btn" title="Edit" onClick={() => openEdit(u)}><IconEdit width={17} height={17} /></button>
                  <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(u)}><IconTrash width={17} height={17} /></button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* --- create / edit --- */}
      <Modal
        open={!!editing}
        title={isNew ? 'Add a member' : `Edit ${editing?.name || ''}`}
        subtitle={isNew ? 'Creates an account that can sign in immediately.' : 'Changes apply straight away.'}
        onClose={closeForm}
        wide
        footer={(
          <>
            <button type="button" className="adm-btn ghost" onClick={closeForm}>Cancel</button>
            <button type="submit" form="member-form" className="adm-btn primary" disabled={form.busy}>
              {form.busy ? 'Saving…' : 'Save member'}
            </button>
          </>
        )}
      >
        {form.status.message && (
          <p className={`form-status is-${form.status.type === 'error' ? 'error' : 'ok'}`}>
            {form.status.message}
          </p>
        )}

        <form id="member-form" className="adm-form grid-2" onSubmit={form.submit} ref={form.formRef} noValidate>
          <Field label="Full name" htmlFor="name" required error={form.errorFor('name')}>
            <input id="name" autoComplete="name" {...form.field('name')} />
          </Field>

          <Field label="Email" htmlFor="email" required={isNew} error={form.errorFor('email')}
                 hint={isNew ? 'They sign in with this address.' : 'An email address cannot be changed here.'}>
            <input id="email" type="email" autoComplete="email" disabled={!isNew} {...form.field('email')} />
          </Field>

          {isNew && (
            <Field label="Temporary password" htmlFor="password" required
                   error={form.errorFor('password')}
                   hint="At least 8 characters, including a letter and a number.">
              <input id="password" type="text" autoComplete="new-password" {...form.field('password')} />
            </Field>
          )}

          <Field label="Phone" htmlFor="phone" required error={form.errorFor('phone')}>
            <input id="phone" inputMode="tel" autoComplete="tel" {...form.field('phone')} />
          </Field>

          <Field label="Blood group" htmlFor="bloodGroup" required error={form.errorFor('bloodGroup')}>
            <select id="bloodGroup" {...form.field('bloodGroup')}>
              {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>

          <Field label="City / area" htmlFor="location" optional error={form.errorFor('location')}>
            <input id="location" autoComplete="address-level2" {...form.field('location')} />
          </Field>

          <Field label="Role" htmlFor="role">
            <select id="role" {...form.field('role')}>
              <option value="user">Member</option>
              <option value="admin">Administrator</option>
            </select>
          </Field>

          {!isNew && (
            <>
              <Field label="Allergies" htmlFor="allergies" optional error={form.errorFor('allergies')}>
                <input id="allergies" {...form.field('allergies')} />
              </Field>

              <Field label="Emergency contact name" htmlFor="emergencyContactName" optional
                     error={form.errorFor('emergencyContactName')}>
                <input id="emergencyContactName" {...form.field('emergencyContactName')} />
              </Field>

              <Field label="Emergency contact number" htmlFor="emergencyContactNumber" optional
                     error={form.errorFor('emergencyContactNumber')}>
                <input id="emergencyContactNumber" inputMode="tel" {...form.field('emergencyContactNumber')} />
              </Field>
            </>
          )}

          <label className="adm-check span-2">
            <input type="checkbox" name="isDonor" checked={!!form.values.isDonor} onChange={form.handleChange} />
            <span>Listed as a willing blood donor</span>
          </label>
        </form>
      </Modal>

      {/* --- member detail --- */}
      <Modal open={!!detail} title={detail?.user?.name || 'Member'} subtitle={detail?.user?.email} onClose={() => setDetail(null)} wide>
        {detail?.loading ? <Spinner /> : detail && (
          <div className="adm-detail">
            <dl className="adm-dl">
              <div><dt>Blood group</dt><dd><BloodTag group={detail.user.bloodGroup} /></dd></div>
              <div><dt>Phone</dt><dd>{detail.user.phone || '—'}</dd></div>
              <div><dt>Location</dt><dd>{detail.user.location || '—'}</dd></div>
              <div><dt>Donor</dt><dd>{detail.user.isDonor ? 'Yes' : 'No'}</dd></div>
              <div><dt>Allergies</dt><dd>{detail.user.allergies || 'None'}</dd></div>
              <div><dt>Emergency contact</dt><dd>{detail.user.emergencyContact?.name} · {detail.user.emergencyContact?.number}</dd></div>
              <div><dt>Role</dt><dd>{detail.user.role}</dd></div>
              <div><dt>Joined</dt><dd>{formatDate(detail.user.createdAt)}</dd></div>
            </dl>

            <h3 className="adm-sub">Blood requests ({detail.requests.length})</h3>
            {detail.requests.length === 0 ? <p className="adm-muted">None posted.</p> : (
              <TableWrap>
                <table className="adm-table compact">
                  <thead><tr><th>Group</th><th>Location</th><th>Status</th><th>Posted</th></tr></thead>
                  <tbody>
                    {detail.requests.map((r) => (
                      <tr key={r._id}>
                        <td><BloodTag group={r.bloodGroupNeeded} /></td>
                        <td>{r.location}</td>
                        <td><Badge tone={r.status === 'pending' ? 'warn' : 'good'}>{r.status}</Badge></td>
                        <td className="adm-muted">{formatDate(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}

            <h3 className="adm-sub">Appointments ({detail.appointments.length})</h3>
            {detail.appointments.length === 0 ? <p className="adm-muted">None booked.</p> : (
              <TableWrap>
                <table className="adm-table compact">
                  <thead><tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
                  <tbody>
                    {detail.appointments.map((a) => (
                      <tr key={a._id}>
                        <td>{a.doctorId?.name || 'Removed doctor'}</td>
                        <td>{a.appointmentDate}</td>
                        <td>{a.appointmentTime}</td>
                        <td><Badge tone={a.status === 'cancelled' ? 'neutral' : a.status === 'confirmed' ? 'good' : 'warn'}>{a.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this member?"
        message={`${confirm?.name} will be removed permanently, along with their blood requests and appointments. This cannot be undone.`}
        busy={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </>
  );
}
