// Health articles: write, edit, publish and remove - with a live preview of
// the cover image and a word count, so the admin can see what members will get.

import { useEffect, useMemo, useState } from 'react';
import adminApi from '../../api/adminApi';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PageHeader, Card, Toolbar, SearchInput, Spinner, EmptyState, TableWrap, formatDate } from '../components/ui';
import { IconPlus, IconEdit, IconTrash, IconExternal } from '../components/Icons';

const EMPTY = { title: '', excerpt: '', content: '', imageUrl: '', author: 'LifeLink Team' };

export default function Blogs() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/blogs');
      setItems(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter((b) => b.title.toLowerCase().includes(q)) : items;
  }, [items, search]);

  const openNew = () => { setForm(EMPTY); setEditing('new'); };

  const openEdit = async (b) => {
    try {
      const { data } = await adminApi.get(`/blogs/${b._id}`);
      setForm({
        title: data.title, excerpt: data.excerpt, content: data.content,
        imageUrl: data.imageUrl || '', author: data.author || 'LifeLink Team',
      });
      setEditing(data);
    } catch {
      toast.error('Could not open that article.');
    }
  };

  // Cover images are stored as base64 data URLs, matching how the API already
  // handles them - nothing is written to the server's file system.
  const onFile = (file) => {
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error('Please use a cover image under 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing === 'new') {
        await adminApi.post('/blogs', form);
        toast.success('Article published.');
      } else {
        await adminApi.put(`/blogs/${editing._id}`, form);
        toast.success('Article updated.');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save the article.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await adminApi.delete(`/blogs/${confirm._id}`);
      toast.success('Article deleted.');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete.');
    } finally {
      setDeleting(false);
    }
  };

  const words = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  return (
    <>
      <PageHeader title="Health articles" subtitle={`${items.length} article${items.length === 1 ? '' : 's'} published on the public blog.`}>
        <button type="button" className="adm-btn primary" onClick={openNew}><IconPlus width={16} height={16} /> Write article</button>
      </PageHeader>

      <Card>
        <Toolbar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search article titles…" />
        </Toolbar>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <EmptyState title="No articles yet" message="Publish your first health awareness article." />
        ) : (
          <TableWrap>
            <table className="adm-table">
              <thead><tr><th>Article</th><th>Author</th><th>Published</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div className="adm-article-cell">
                        {b.imageUrl
                          ? <img src={b.imageUrl} alt="" className="adm-thumb" />
                          : <span className="adm-thumb placeholder" aria-hidden="true" />}
                        <span>
                          <strong>{b.title}</strong>
                          <small>{b.excerpt}</small>
                        </span>
                      </div>
                    </td>
                    <td>{b.author || '—'}</td>
                    <td className="adm-muted">{formatDate(b.createdAt)}</td>
                    <td className="adm-row-actions">
                      <a className="adm-icon-btn" href={`/blogs/${b._id}`} target="_blank" rel="noreferrer" title="View on the public site"><IconExternal width={17} height={17} /></a>
                      <button type="button" className="adm-icon-btn" title="Edit" onClick={() => openEdit(b)}><IconEdit width={17} height={17} /></button>
                      <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(b)}><IconTrash width={17} height={17} /></button>
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
        title={editing === 'new' ? 'Write an article' : 'Edit article'}
        subtitle="Separate paragraphs with a blank line."
        onClose={() => setEditing(null)}
        wide
        footer={(
          <>
            <span className="adm-muted adm-foot-note">{words} words</span>
            <button type="button" className="adm-btn ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" form="blog-form" className="adm-btn primary" disabled={saving}>{saving ? 'Saving…' : 'Publish'}</button>
          </>
        )}
      >
        <form id="blog-form" className="adm-form" onSubmit={save}>
          <label className="adm-field"><span>Title</span>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </label>
          <label className="adm-field"><span>Summary shown on the blog list</span>
            <input required value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </label>
          <label className="adm-field"><span>Author</span>
            <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          </label>
          <label className="adm-field"><span>Cover image</span>
            <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          {form.imageUrl && (
            <div className="adm-cover-preview">
              <img src={form.imageUrl} alt="Cover preview" />
              <button type="button" className="adm-btn ghost small" onClick={() => setForm({ ...form, imageUrl: '' })}>Remove image</button>
            </div>
          )}
          <label className="adm-field"><span>Article body</span>
            <textarea required rows={14} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this article?"
        message={`“${confirm?.title}” will be removed from the public blog.`}
        busy={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </>
  );
}
