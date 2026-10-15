// Camp management: create, edit, cancel, and see who has registered.

import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import { usePagination } from '../../components/Pagination';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { Pagination,
  PageHeader, Card, Toolbar, SearchInput, Badge, Spinner, EmptyState,
  TableWrap, StatCard, formatDate,
} from '../components/ui';
import { IconPlus, IconEdit, IconTrash, IconUsers, IconCalendar, IconCheck } from '../components/Icons';

const EMPTY = {
  title: '', organiser: '', venue: '', city: '', state: 'Gujarat',
  date: '', startTime: '09:00 AM', endTime: '04:00 PM',
  slots: 100, contactNumber: '', description: '', status: 'upcoming',
};

export default function Camps() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [roster, setRoster] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/camps', { params: filters });
      setItems(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load camps.');
    } finally {
      setLoading(false);
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openNew = () => { setForm(EMPTY); setEditing('new'); };
  const openEdit = (c) => {
    setForm({
      title: c.title, organiser: c.organiser, venue: c.venue, city: c.city, state: c.state || '',
      date: c.date, startTime: c.startTime, endTime: c.endTime, slots: c.slots,
      contactNumber: c.contactNumber || '', description: c.description || '', status: c.status,
    });
    setEditing(c);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing === 'new') {
        await adminApi.post('/admin/camps', form);
        toast.success('Camp created.');
      } else {
        await adminApi.put(`/admin/camps/${editing._id}`, form);
        toast.success('Camp updated.');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save the camp.');
    } finally {
      setSaving(false);
    }
  };

  const openRoster = async (c) => {
    setRoster({ loading: true, title: c.title });
    try {
      const { data } = await adminApi.get(`/admin/camps/${c._id}/registrations`);
      setRoster({ ...data, loading: false });
    } catch {
      setRoster(null);
      toast.error('Could not load the registration list.');
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/admin/camps/${confirm._id}`);
      toast.success('Camp deleted.');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete.');
    } finally {
      setDeleting(false);
    }
  };

  const upcoming = items.filter((c) => c.status === 'upcoming');
  const totalRegistered = items.reduce((a, c) => a + (c.registrations?.length || 0), 0);

  // Admin tables page at 12 rows so the console stays scannable.
  const pager = usePagination(items, 12);

  return (
    <>
      <PageHeader title="Donation camps" subtitle={`${items.length} camp${items.length === 1 ? '' : 's'} on the calendar.`}>
        <button type="button" className="adm-btn primary" onClick={openNew}>
          <IconPlus width={16} height={16} /> Create camp
        </button>
      </PageHeader>

      <div className="adm-stat-grid tight">
        <StatCard icon={<IconCalendar />} label="Upcoming" value={upcoming.length} tone="accent" />
        <StatCard icon={<IconUsers />} label="Total registrations" value={totalRegistered} />
        <StatCard icon={<IconCheck />} label="Completed" value={items.filter((c) => c.status === 'completed').length} />
      </div>

      <Card>
        <Toolbar>
          <SearchInput value={filters.search} onChange={(v) => setFilters((f) => ({ ...f, search: v }))} placeholder="Search title, organiser or city…" />
          <select className="adm-select" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </Toolbar>

        {loading ? <Spinner /> : items.length === 0 ? (
          <EmptyState title="No camps yet" message="Create your first camp so members can register." />
        ) : (
          <>
          <TableWrap>
            <table className="adm-table">
              <thead>
                <tr><th>Camp</th><th>Date</th><th>City</th><th>Registered</th><th>Status</th><th aria-label="Actions" /></tr>
              </thead>
              <tbody>
                {pager.slice.map((c) => {
                  const taken = c.registrations?.length || 0;
                  const pct = c.slots ? Math.round((taken / c.slots) * 100) : 0;
                  return (
                    <tr key={c._id}>
                      <td>
                        <strong>{c.title}</strong>
                        <small className="adm-block adm-muted">{c.organiser} · {c.venue}</small>
                      </td>
                      <td>
                        {formatDate(`${c.date}T00:00:00`)}
                        <small className="adm-block adm-muted">{c.startTime}–{c.endTime}</small>
                      </td>
                      <td>{c.city}</td>
                      <td>
                        <button type="button" className="adm-link" onClick={() => openRoster(c)}>
                          {taken} / {c.slots}
                        </button>
                        <span className="adm-mini-bar"><span style={{ width: `${Math.min(100, pct)}%` }} /></span>
                      </td>
                      <td>
                        <Badge tone={c.status === 'upcoming' ? 'good' : c.status === 'cancelled' ? 'warn' : 'neutral'}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="adm-row-actions">
                        <button type="button" className="adm-icon-btn" title="Registrations" onClick={() => openRoster(c)}><IconUsers width={17} height={17} /></button>
                        <button type="button" className="adm-icon-btn" title="Edit" onClick={() => openEdit(c)}><IconEdit width={17} height={17} /></button>
                        <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(c)}><IconTrash width={17} height={17} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        <Pagination page={pager.page} pages={pager.pages} onChange={pager.setPage} />
        </>
        )}
      </Card>

      <Modal
        open={!!editing}
        title={editing === 'new' ? 'Create a camp' : `Edit ${editing?.title || ''}`}
        onClose={() => setEditing(null)}
        wide
        footer={(
          <>
            <button type="button" className="adm-btn ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" form="camp-form" className="adm-btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save camp'}</button>
          </>
        )}
      >
        <form id="camp-form" className="adm-form grid-2" onSubmit={save}>
          <label className="adm-field span-2"><span>Camp title</span>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="adm-field span-2"><span>Organiser</span>
            <input required value={form.organiser} onChange={(e) => setForm({ ...form, organiser: e.target.value })} />
          </label>
          <label className="adm-field span-2"><span>Venue</span>
            <input required value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          </label>
          <label className="adm-field"><span>City</span>
            <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </label>
          <label className="adm-field"><span>State</span>
            <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </label>
          <label className="adm-field"><span>Date</span>
            <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </label>
          <label className="adm-field"><span>Slots</span>
            <input type="number" min="1" required value={form.slots} onChange={(e) => setForm({ ...form, slots: Number(e.target.value) })} />
          </label>
          <label className="adm-field"><span>Start time</span>
            <input required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} placeholder="09:00 AM" />
          </label>
          <label className="adm-field"><span>End time</span>
            <input required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} placeholder="04:00 PM" />
          </label>
          <label className="adm-field"><span>Contact number</span>
            <input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
          </label>
          <label className="adm-field"><span>Status</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="adm-field span-2"><span>Description — blank line between paragraphs</span>
            <textarea rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
        </form>
      </Modal>

      <Modal open={!!roster} title={roster?.title || 'Registrations'} subtitle="Contact list for the organiser" onClose={() => setRoster(null)} wide>
        {roster?.loading ? <Spinner /> : roster && (
          (roster.registrations || []).length === 0
            ? <p className="adm-muted">Nobody has registered yet.</p>
            : (
              <TableWrap>
                <table className="adm-table compact">
                  <thead><tr><th>#</th><th>Name</th><th>Group</th><th>Phone</th><th>Registered</th></tr></thead>
                  <tbody>
                    {roster.registrations.map((r, i) => (
                      <tr key={r._id || i}>
                        <td>{i + 1}</td>
                        <td className="adm-strong">{r.name}</td>
                        <td><span className="adm-blood">{r.bloodGroup}</span></td>
                        <td>{r.phone}</td>
                        <td className="adm-muted">{formatDate(r.registeredAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this camp?"
        message={`"${confirm?.title}" and its ${confirm?.registrations?.length || 0} registration(s) will be removed.`}
        busy={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </>
  );
}
