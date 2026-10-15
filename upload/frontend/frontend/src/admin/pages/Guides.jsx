// The donor guide library, grouped by the five categories the public hub uses.

import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PageHeader, Card, Toolbar, Badge, Spinner, EmptyState, TableWrap } from '../components/ui';
import { IconPlus, IconEdit, IconTrash, IconExternal } from '../components/Icons';

const CATEGORIES = [
  { value: 'education', label: 'Donor education' },
  { value: 'eligibility', label: 'Donor eligibility' },
  { value: 'preparation', label: 'Donor preparation' },
  { value: 'recovery', label: 'Donor recovery' },
  { value: 'regular', label: 'Regular donor' },
];

const EMPTY = { category: 'education', title: '', summary: '', body: '', readMinutes: 3, order: 1 };

export default function Guides() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/guides', { params: { category } });
      setItems(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load guides.');
    } finally {
      setLoading(false);
    }
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm({ ...EMPTY, order: items.length + 1 }); setEditing('new'); };
  const openEdit = (g) => {
    setForm({
      category: g.category, title: g.title, summary: g.summary,
      body: g.body, readMinutes: g.readMinutes, order: g.order,
    });
    setEditing(g);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing === 'new') {
        await adminApi.post('/admin/guides', form);
        toast.success('Guide published.');
      } else {
        await adminApi.put(`/admin/guides/${editing._id}`, form);
        toast.success('Guide updated.');
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
      await adminApi.delete(`/admin/guides/${confirm._id}`);
      toast.success('Guide deleted.');
      setConfirm(null);
      load();
    } catch {
      toast.error('Could not delete.');
    } finally {
      setDeleting(false);
    }
  };

  const label = (v) => CATEGORIES.find((c) => c.value === v)?.label || v;

  return (
    <>
      <PageHeader title="Guide library" subtitle={`${items.length} guide${items.length === 1 ? '' : 's'} across five categories.`}>
        <button type="button" className="adm-btn primary" onClick={openNew}><IconPlus width={16} height={16} /> Write guide</button>
      </PageHeader>

      <Card>
        <Toolbar>
          <select className="adm-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Toolbar>

        {loading ? <Spinner /> : items.length === 0 ? (
          <EmptyState title="No guides here" message="Add a guide to this category." />
        ) : (
          <TableWrap>
            <table className="adm-table">
              <thead><tr><th>Order</th><th>Guide</th><th>Category</th><th>Read time</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {items.map((g) => (
                  <tr key={g._id}>
                    <td className="adm-muted">{g.order}</td>
                    <td>
                      <strong>{g.title}</strong>
                      <small className="adm-block adm-muted">{g.summary}</small>
                    </td>
                    <td><Badge>{label(g.category)}</Badge></td>
                    <td>{g.readMinutes} min</td>
                    <td className="adm-row-actions">
                      <a className="adm-icon-btn" href={`/guides/${g._id}`} target="_blank" rel="noreferrer" title="View on site"><IconExternal width={17} height={17} /></a>
                      <button type="button" className="adm-icon-btn" title="Edit" onClick={() => openEdit(g)}><IconEdit width={17} height={17} /></button>
                      <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(g)}><IconTrash width={17} height={17} /></button>
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
        title={editing === 'new' ? 'Write a guide' : 'Edit guide'}
        subtitle="Plain English. Blank line between paragraphs."
        onClose={() => setEditing(null)}
        wide
        footer={(
          <>
            <button type="button" className="adm-btn ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" form="guide-form" className="adm-btn primary" disabled={saving}>{saving ? 'Saving…' : 'Publish'}</button>
          </>
        )}
      >
        <form id="guide-form" className="adm-form grid-2" onSubmit={save}>
          <label className="adm-field"><span>Category</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <label className="adm-field"><span>Order within category</span>
            <input type="number" min="1" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
          </label>
          <label className="adm-field span-2"><span>Title</span>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="adm-field span-2"><span>One-line summary</span>
            <input required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </label>
          <label className="adm-field"><span>Read time (minutes)</span>
            <input type="number" min="1" value={form.readMinutes} onChange={(e) => setForm({ ...form, readMinutes: Number(e.target.value) })} />
          </label>
          <label className="adm-field span-2"><span>Guide body</span>
            <textarea required rows={14} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this guide?"
        message={`"${confirm?.title}" will be removed from the guide library.`}
        busy={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </>
  );
}
