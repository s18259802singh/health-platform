// Donor story management - write, feature, edit and remove.

import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import { usePagination } from '../../components/Pagination';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { Pagination, PageHeader, Card, Toolbar, SearchInput, Badge, Spinner, EmptyState, TableWrap, formatDate } from '../components/ui';
import { IconPlus, IconEdit, IconTrash, IconExternal } from '../components/Icons';

const EMPTY = { name: '', role: 'donor', bloodGroup: '', city: '', headline: '', body: '', featured: false };
const GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Stories() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/stories', { params: { search } });
      setItems(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load stories.');
    } finally {
      setLoading(false);
    }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const openNew = () => { setForm(EMPTY); setEditing('new'); };
  const openEdit = (s) => {
    setForm({
      name: s.name, role: s.role, bloodGroup: s.bloodGroup || '', city: s.city || '',
      headline: s.headline, body: s.body, featured: !!s.featured,
    });
    setEditing(s);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing === 'new') {
        await adminApi.post('/admin/stories', form);
        toast.success('Story published.');
      } else {
        await adminApi.put(`/admin/stories/${editing._id}`, form);
        toast.success('Story updated.');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (s) => {
    try {
      await adminApi.put(`/admin/stories/${s._id}`, { featured: !s.featured });
      load();
    } catch {
      toast.error('Could not update.');
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/admin/stories/${confirm._id}`);
      toast.success('Story deleted.');
      setConfirm(null);
      load();
    } catch {
      toast.error('Could not delete.');
    } finally {
      setDeleting(false);
    }
  };

  const words = form.body.trim() ? form.body.trim().split(/\s+/).length : 0;

  // Admin tables page at 12 rows so the console stays scannable.
  const pager = usePagination(items, 12);

  return (
    <>
      <PageHeader title="Donor stories" subtitle={`${items.length} published · ${items.filter((s) => s.featured).length} featured on the homepage.`}>
        <button type="button" className="adm-btn primary" onClick={openNew}><IconPlus width={16} height={16} /> Add story</button>
      </PageHeader>

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or headline…" />
        </Toolbar>

        {loading ? <Spinner /> : items.length === 0 ? (
          <EmptyState title="No stories yet" message="Stories are what give the public site its warmth. Add the first one." />
        ) : (
          <>
          <TableWrap>
            <table className="adm-table">
              <thead><tr><th>Story</th><th>Person</th><th>Role</th><th>Featured</th><th>Added</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {pager.slice.map((s) => (
                  <tr key={s._id}>
                    <td className="adm-strong">{s.headline}</td>
                    <td>
                      {s.name}
                      <small className="adm-block adm-muted">{[s.bloodGroup, s.city].filter(Boolean).join(' · ')}</small>
                    </td>
                    <td><Badge tone={s.role === 'recipient' ? 'warn' : s.role === 'organiser' ? 'neutral' : 'accent'}>{s.role}</Badge></td>
                    <td>
                      <button type="button" className={`adm-btn small ${s.featured ? '' : 'ghost'}`} onClick={() => toggleFeatured(s)}>
                        {s.featured ? 'Featured' : 'Feature'}
                      </button>
                    </td>
                    <td className="adm-muted">{formatDate(s.createdAt)}</td>
                    <td className="adm-row-actions">
                      <a className="adm-icon-btn" href={`/stories/${s._id}`} target="_blank" rel="noreferrer" title="View on site"><IconExternal width={17} height={17} /></a>
                      <button type="button" className="adm-icon-btn" title="Edit" onClick={() => openEdit(s)}><IconEdit width={17} height={17} /></button>
                      <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(s)}><IconTrash width={17} height={17} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        <Pagination page={pager.page} pages={pager.pages} onChange={pager.setPage} />
        </>
        )}
      </Card>

      <Modal
        open={!!editing}
        title={editing === 'new' ? 'Add a story' : 'Edit story'}
        subtitle="Written in the person's own voice. Blank line between paragraphs."
        onClose={() => setEditing(null)}
        wide
        footer={(
          <>
            <span className="adm-muted adm-foot-note">{words} words</span>
            <button type="button" className="adm-btn ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" form="story-form" className="adm-btn primary" disabled={saving}>{saving ? 'Saving…' : 'Publish'}</button>
          </>
        )}
      >
        <form id="story-form" className="adm-form grid-2" onSubmit={save}>
          <label className="adm-field span-2"><span>Headline</span>
            <input required value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          </label>
          <label className="adm-field"><span>Name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="adm-field"><span>Role</span>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="donor">Donor</option>
              <option value="recipient">Recipient</option>
              <option value="organiser">Organiser</option>
            </select>
          </label>
          <label className="adm-field"><span>Blood group</span>
            <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
              {GROUPS.map((g) => <option key={g} value={g}>{g || 'Not shown'}</option>)}
            </select>
          </label>
          <label className="adm-field"><span>City</span>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </label>
          <label className="adm-field span-2"><span>The story</span>
            <textarea required rows={12} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          </label>
          <label className="adm-check span-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <span>Feature this story on the homepage</span>
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this story?"
        message={`"${confirm?.headline}" will be removed from the public site.`}
        busy={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </>
  );
}
