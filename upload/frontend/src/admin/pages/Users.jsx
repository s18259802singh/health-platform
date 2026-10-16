// Member management: search, filter, paginate, inspect, edit, promote, delete.

import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import {
  PageHeader, Card, Toolbar, SearchInput, Badge, BloodTag, Spinner,
  EmptyState, Pagination, TableWrap, formatDate, initials,
} from '../components/ui';
import { IconPlus, IconEdit, IconTrash } from '../components/Icons';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EMPTY_FORM = {
  name: '', email: '', password: '', phone: '', bloodGroup: 'O+',
  location: '', isDonor: false, role: 'user',
};

export default function Users() {
  const toast = useToast();
  const [state, setState] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', bloodGroup: '', role: '', donor: '' });
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState(null);   // user being edited (or 'new')
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);     // { user, requests, appointments }
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/users', { params: { ...filters, page, limit: 15 } });
      setState(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load members.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce so typing in the search box does not fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const setFilter = (key, value) => { setPage(1); setFilters((f) => ({ ...f, [key]: value })); };

  const openNew = () => { setForm(EMPTY_FORM); setEditing('new'); };
  const openEdit = (u) => {
    setForm({
      name: u.name || '', email: u.email || '', password: '', phone: u.phone || '',
      bloodGroup: u.bloodGroup || 'O+', location: u.location || '',
      isDonor: !!u.isDonor, role: u.role || 'user',
      allergies: u.allergies || '',
      emergencyContactName: u.emergencyContact?.name || '',
      emergencyContactNumber: u.emergencyContact?.number || '',
    });
    setEditing(u);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing === 'new') {
        await adminApi.post('/admin/users', form);
        toast.success(`${form.name} was added.`);
      } else {
        await adminApi.put(`/admin/users/${editing._id}`, form);
        toast.success('Member updated.');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save this member.');
    } finally {
      setSaving(false);
    }
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
      <PageHeader title="Members" subtitle={`${state.total} registered account${state.total === 1 ? '' : 's'}.`}>
        <button type="button" className="adm-btn primary" onClick={openNew}>
          <IconPlus width={16} height={16} /> Add member
        </button>
      </PageHeader>

      <Card>
        <Toolbar>
          <SearchInput value={filters.search} onChange={(v) => setFilter('search', v)} placeholder="Search name, email, phone or city…" />
          <select value={filters.bloodGroup} onChange={(e) => setFilter('bloodGroup', e.target.value)} className="adm-select">
            <option value="">All blood groups</option>
            {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={filters.donor} onChange={(e) => setFilter('donor', e.target.value)} className="adm-select">
            <option value="">Donors &amp; non-donors</option>
            <option value="true">Donors only</option>
            <option value="false">Non-donors only</option>
          </select>
          <select value={filters.role} onChange={(e) => setFilter('role', e.target.value)} className="adm-select">
            <option value="">All roles</option>
            <option value="user">Members</option>
            <option value="admin">Administrators</option>
          </select>
        </Toolbar>

        {loading ? <Spinner /> : state.items.length === 0 ? (
          <EmptyState title="No members match those filters" message="Try clearing the search box or widening the filters." />
        ) : (
          <>
            <TableWrap>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Member</th><th>Contact</th><th>Group</th><th>Donor</th>
                    <th>Location</th><th>Role</th><th>Joined</th><th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {state.items.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <button type="button" className="adm-person" onClick={() => openDetail(u)}>
                          <span className="adm-avatar sm">{initials(u.name)}</span>
                          <span>
                            <strong>{u.name}</strong>
                            <small>{u.email}</small>
                          </span>
                        </button>
                      </td>
                      <td className="adm-muted">{u.phone || '—'}</td>
                      <td><BloodTag group={u.bloodGroup} /></td>
                      <td>{u.isDonor ? <Badge tone="good">Donor</Badge> : <Badge>No</Badge>}</td>
                      <td>{u.location || '—'}</td>
                      <td>{u.role === 'admin' ? <Badge tone="accent">Admin</Badge> : <Badge>Member</Badge>}</td>
                      <td className="adm-muted">{formatDate(u.createdAt)}</td>
                      <td className="adm-row-actions">
                        <button type="button" className="adm-icon-btn" title="Edit" onClick={() => openEdit(u)}><IconEdit width={17} height={17} /></button>
                        <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(u)}><IconTrash width={17} height={17} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
            <Pagination page={state.page} pages={state.pages} onChange={setPage} />
          </>
        )}
      </Card>

      {/* --- create / edit --- */}
      <Modal
        open={!!editing}
        title={editing === 'new' ? 'Add a member' : `Edit ${editing?.name || ''}`}
        subtitle={editing === 'new' ? 'Creates an account that can sign in immediately.' : 'Changes apply straight away.'}
        onClose={() => setEditing(null)}
        wide
        footer={(
          <>
            <button type="button" className="adm-btn ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" form="member-form" className="adm-btn primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save member'}
            </button>
          </>
        )}
      >
        <form id="member-form" className="adm-form grid-2" onSubmit={save}>
          <label className="adm-field"><span>Full name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="adm-field"><span>Email</span>
            <input type="email" required disabled={editing !== 'new'} value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          {editing === 'new' && (
            <label className="adm-field"><span>Temporary password</span>
              <input type="text" required minLength={6} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </label>
          )}
          <label className="adm-field"><span>Phone</span>
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="adm-field"><span>Blood group</span>
            <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
              {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label className="adm-field"><span>City / area</span>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </label>
          <label className="adm-field"><span>Role</span>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">Member</option>
              <option value="admin">Administrator</option>
            </select>
          </label>
          {editing !== 'new' && (
            <>
              <label className="adm-field"><span>Allergies</span>
                <input value={form.allergies || ''} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
              </label>
              <label className="adm-field"><span>Emergency contact name</span>
                <input value={form.emergencyContactName || ''} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} />
              </label>
              <label className="adm-field"><span>Emergency contact number</span>
                <input value={form.emergencyContactNumber || ''} onChange={(e) => setForm({ ...form, emergencyContactNumber: e.target.value })} />
              </label>
            </>
          )}
          <label className="adm-check span-2">
            <input type="checkbox" checked={form.isDonor} onChange={(e) => setForm({ ...form, isDonor: e.target.checked })} />
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
