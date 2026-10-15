// Doctors directory: CRUD, tied to a hospital, with availability.

import { useEffect, useMemo, useState } from 'react';
import adminApi from '../../api/adminApi';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PageHeader, Card, Toolbar, SearchInput, Spinner, EmptyState, TableWrap, Badge } from '../components/ui';
import { IconPlus, IconEdit, IconTrash } from '../components/Icons';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
const EMPTY = { name: '', specialization: '', hospitalId: '', availableDays: [], availableTimeSlots: [] };

export default function Doctors() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [d, h] = await Promise.all([adminApi.get('/admin/doctors'), adminApi.get('/hospitals')]);
      setItems(d.data);
      setHospitals(h.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => items.filter((d) => {
    const q = search.trim().toLowerCase();
    const matchesText = !q || d.name.toLowerCase().includes(q) || (d.specialization || '').toLowerCase().includes(q);
    const matchesHospital = !hospitalFilter || d.hospitalId?._id === hospitalFilter;
    return matchesText && matchesHospital;
  }), [items, search, hospitalFilter]);

  const openNew = () => { setForm({ ...EMPTY, hospitalId: hospitals[0]?._id || '' }); setEditing('new'); };
  const openEdit = (d) => {
    setForm({
      name: d.name, specialization: d.specialization,
      hospitalId: d.hospitalId?._id || d.hospitalId || '',
      availableDays: d.availableDays || [], availableTimeSlots: d.availableTimeSlots || [],
    });
    setEditing(d);
  };

  const toggle = (key, value) => setForm((f) => ({
    ...f,
    [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
  }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.hospitalId) return toast.error('Pick a hospital for this doctor.');
    setSaving(true);
    try {
      if (editing === 'new') {
        await adminApi.post('/admin/doctors', form);
        toast.success('Doctor added.');
      } else {
        await adminApi.put(`/admin/doctors/${editing._id}`, form);
        toast.success('Doctor updated.');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/admin/doctors/${confirm._id}`);
      toast.success('Doctor removed.');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader title="Doctors" subtitle={`${items.length} doctor${items.length === 1 ? '' : 's'} bookable by members.`}>
        <button type="button" className="adm-btn primary" onClick={openNew} disabled={hospitals.length === 0}>
          <IconPlus width={16} height={16} /> Add doctor
        </button>
      </PageHeader>

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or speciality…" />
          <select className="adm-select" value={hospitalFilter} onChange={(e) => setHospitalFilter(e.target.value)}>
            <option value="">All hospitals</option>
            {hospitals.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
          </select>
        </Toolbar>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <EmptyState title="No doctors listed" message="Add a doctor so members can book appointments." />
        ) : (
          <TableWrap>
            <table className="adm-table">
              <thead><tr><th>Doctor</th><th>Speciality</th><th>Hospital</th><th>Days</th><th>Slots</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d._id}>
                    <td className="adm-strong">{d.name}</td>
                    <td>{d.specialization}</td>
                    <td className="adm-muted">{d.hospitalId?.name || '—'}</td>
                    <td>{d.availableDays?.length ? <Badge>{d.availableDays.length} days</Badge> : <span className="adm-muted">—</span>}</td>
                    <td>{d.availableTimeSlots?.length ? <Badge>{d.availableTimeSlots.length} slots</Badge> : <span className="adm-muted">—</span>}</td>
                    <td className="adm-row-actions">
                      <button type="button" className="adm-icon-btn" title="Edit" onClick={() => openEdit(d)}><IconEdit width={17} height={17} /></button>
                      <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(d)}><IconTrash width={17} height={17} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>

      <Modal
        open={!!editing}
        title={editing === 'new' ? 'Add a doctor' : `Edit ${editing?.name || ''}`}
        onClose={() => setEditing(null)}
        wide
        footer={(
          <>
            <button type="button" className="adm-btn ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" form="doctor-form" className="adm-btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save doctor'}</button>
          </>
        )}
      >
        <form id="doctor-form" className="adm-form grid-2" onSubmit={save}>
          <label className="adm-field"><span>Name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr A. Mehta" />
          </label>
          <label className="adm-field"><span>Speciality</span>
            <input required value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Haematology" />
          </label>
          <label className="adm-field span-2"><span>Hospital</span>
            <select required value={form.hospitalId} onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}>
              <option value="">Select a hospital…</option>
              {hospitals.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
            </select>
          </label>

          <div className="span-2">
            <span className="adm-field-label">Available days</span>
            <div className="adm-chips">
              {DAYS.map((d) => (
                <button key={d} type="button" className={`adm-chip ${form.availableDays.includes(d) ? 'on' : ''}`} onClick={() => toggle('availableDays', d)}>{d.slice(0, 3)}</button>
              ))}
            </div>
          </div>

          <div className="span-2">
            <span className="adm-field-label">Time slots</span>
            <div className="adm-chips">
              {SLOTS.map((s) => (
                <button key={s} type="button" className={`adm-chip ${form.availableTimeSlots.includes(s) ? 'on' : ''}`} onClick={() => toggle('availableTimeSlots', s)}>{s}</button>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this doctor?"
        message={`${confirm?.name} and every appointment booked with them will be removed.`}
        busy={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </>
  );
}
