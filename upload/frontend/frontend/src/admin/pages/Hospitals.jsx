// Hospitals & blood banks: full CRUD including per-group stock levels.

import { useEffect, useMemo, useState } from 'react';
import adminApi from '../../api/adminApi';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PageHeader, Card, Toolbar, SearchInput, Badge, Spinner, EmptyState, TableWrap } from '../components/ui';
import { IconPlus, IconEdit, IconTrash } from '../components/Icons';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const blankUnits = () => GROUPS.map((g) => ({ bloodGroup: g, units: 0 }));
const EMPTY = { name: '', address: '', contactNumber: '', type: 'hospital', availableBloodUnits: blankUnits() };

export default function Hospitals() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/hospitals');
      setItems(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load hospitals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => items.filter((h) => {
    const q = search.trim().toLowerCase();
    const matchesText = !q || h.name.toLowerCase().includes(q) || (h.address || '').toLowerCase().includes(q);
    const matchesType = !typeFilter || h.type === typeFilter;
    return matchesText && matchesType;
  }), [items, search, typeFilter]);

  const openNew = () => { setForm({ ...EMPTY, availableBloodUnits: blankUnits() }); setEditing('new'); };

  const openEdit = (h) => {
    const units = blankUnits().map((u) => ({
      ...u,
      units: h.availableBloodUnits?.find((x) => x.bloodGroup === u.bloodGroup)?.units || 0,
    }));
    setForm({ name: h.name, address: h.address, contactNumber: h.contactNumber, type: h.type, availableBloodUnits: units });
    setEditing(h);
  };

  const setUnits = (group, value) => setForm((f) => ({
    ...f,
    availableBloodUnits: f.availableBloodUnits.map((u) => (u.bloodGroup === group ? { ...u, units: Number(value) || 0 } : u)),
  }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, availableBloodUnits: form.availableBloodUnits.filter((u) => u.units > 0) };
      if (editing === 'new') {
        await adminApi.post('/hospitals', payload);
        toast.success('Hospital added.');
      } else {
        await adminApi.put(`/hospitals/${editing._id}`, payload);
        toast.success('Hospital updated.');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/hospitals/${confirm._id}`);
      toast.success('Hospital removed.');
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
      <PageHeader title="Hospitals & blood banks" subtitle={`${items.length} location${items.length === 1 ? '' : 's'} on the network.`}>
        <button type="button" className="adm-btn primary" onClick={openNew}><IconPlus width={16} height={16} /> Add location</button>
      </PageHeader>

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or address…" />
          <select className="adm-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="hospital">Hospitals</option>
            <option value="blood_bank">Blood banks</option>
          </select>
        </Toolbar>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <EmptyState title="Nothing here yet" message="Add a hospital or blood bank, or clear the search." />
        ) : (
          <TableWrap>
            <table className="adm-table">
              <thead><tr><th>Name</th><th>Address</th><th>Contact</th><th>Type</th><th>Stock</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {filtered.map((h) => {
                  const total = (h.availableBloodUnits || []).reduce((a, u) => a + (u.units || 0), 0);
                  return (
                    <tr key={h._id}>
                      <td className="adm-strong">{h.name}</td>
                      <td className="adm-muted">{h.address}</td>
                      <td>{h.contactNumber}</td>
                      <td>{h.type === 'blood_bank' ? <Badge tone="accent">Blood bank</Badge> : <Badge>Hospital</Badge>}</td>
                      <td>{total > 0 ? `${total} units` : <span className="adm-muted">—</span>}</td>
                      <td className="adm-row-actions">
                        <button type="button" className="adm-icon-btn" title="Edit" onClick={() => openEdit(h)}><IconEdit width={17} height={17} /></button>
                        <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(h)}><IconTrash width={17} height={17} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Card>

      <Modal
        open={!!editing}
        title={editing === 'new' ? 'Add a hospital or blood bank' : `Edit ${editing?.name || ''}`}
        onClose={() => setEditing(null)}
        wide
        footer={(
          <>
            <button type="button" className="adm-btn ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" form="hospital-form" className="adm-btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save location'}</button>
          </>
        )}
      >
        <form id="hospital-form" className="adm-form grid-2" onSubmit={save}>
          <label className="adm-field span-2"><span>Name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="adm-field span-2"><span>Address</span>
            <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <label className="adm-field"><span>Contact number</span>
            <input required value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
          </label>
          <label className="adm-field"><span>Type</span>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="hospital">Hospital</option>
              <option value="blood_bank">Blood bank</option>
            </select>
          </label>

          <div className="span-2">
            <span className="adm-field-label">Blood units in stock</span>
            <div className="adm-units">
              {form.availableBloodUnits.map((u) => (
                <label key={u.bloodGroup} className="adm-unit">
                  <span>{u.bloodGroup}</span>
                  <input type="number" min="0" value={u.units} onChange={(e) => setUnits(u.bloodGroup, e.target.value)} />
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this location?"
        message={`${confirm?.name} will be removed from the public hospital list.`}
        busy={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </>
  );
}
