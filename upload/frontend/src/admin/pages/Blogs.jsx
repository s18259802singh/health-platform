// Health articles: write, edit, publish and remove - with a live preview of
// the cover image and a word count, so the admin can see what members will get.

import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import Field from '../../components/Field';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PageHeader, Card, formatDate } from '../components/ui';
import { IconPlus, IconEdit, IconTrash, IconExternal } from '../components/Icons';
import useForm from '../../lib/useForm';
import { rules } from '../../lib/validate';

const EMPTY = { title: '', excerpt: '', content: '', imageUrl: '', author: 'LifeLink Team' };

// The cover image is not validated here: it is either absent or a data URL
// this page produced itself, and onFile already refuses anything too large.
const schema = {
  title: rules.text({ label: 'Title', min: 6, max: 140 }),
  excerpt: rules.text({ label: 'Summary', min: 20, max: 300 }),
  content: rules.text({ label: 'Article body', min: 100, max: 20000 }),
  author: rules.optional(rules.name),
};

export default function Blogs() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/blogs');
      setItems(Array.isArray(data) ? data : data.items || []);
      setLoadError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load articles.';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const isNew = editing === 'new';

  const form = useForm(EMPTY, schema, {
    onSubmit: async (values) => {
      try {
        if (isNew) {
          await adminApi.post('/blogs', values);
          toast.success('Article published.');
        } else {
          await adminApi.put(`/blogs/${editing._id}`, values);
          toast.success('Article updated.');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not save the article.');
        throw err; // useForm puts the server's field messages back on the fields
      }
      setEditing(null);
      load();
    },
  });

  const closeForm = () => { setEditing(null); form.reset(EMPTY); };

  const openNew = () => { form.reset(EMPTY); setEditing('new'); };

  // The list endpoint omits the article body, so editing fetches the full
  // record rather than opening the form on a partial one.
  const openEdit = async (b) => {
    try {
      const { data } = await adminApi.get(`/blogs/${b._id}`);
      form.reset({
        title: data.title || '', excerpt: data.excerpt || '', content: data.content || '',
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
    reader.onload = () => form.setField('imageUrl', reader.result);
    reader.readAsDataURL(file);
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

  const words = String(form.values.content || '').trim()
    ? String(form.values.content).trim().split(/\s+/).length
    : 0;

  return (
    <>
      <PageHeader title="Health articles" subtitle={`${items.length} article${items.length === 1 ? '' : 's'} published on the public blog.`}>
        <button type="button" className="adm-btn primary" onClick={openNew}><IconPlus width={16} height={16} /> Write article</button>
      </PageHeader>

      <Card className="has-table">
        <DataTable
          caption="articles"
          rows={items}
          loading={loading}
          error={loadError}
          rowKey={(b) => b._id}
          exportName="health-articles"
          initialSort={{ key: 'createdAt', dir: 'desc' }}
          defaultPerPage={12}
          searchKeys={['title', 'excerpt', 'author']}
          searchPlaceholder="Search by title, summary or author…"
          filters={[
            { key: 'author', label: 'Author', options: [...new Set(items.map((b) => b.author).filter(Boolean))].sort() },
            {
              key: 'imageUrl',
              label: 'Cover image',
              options: [
                { value: 'yes', label: 'Has a cover' },
                { value: 'no', label: 'No cover yet' },
              ],
              match: (b, v) => (v === 'yes' ? !!b.imageUrl : !b.imageUrl),
            },
          ]}
          empty={{ title: 'No articles match', message: 'Publish a health awareness article, or clear a filter.' }}
          columns={[
            {
              key: 'title',
              header: 'Article',
              render: (b) => (
                <div className="adm-article-cell">
                  {b.imageUrl
                    ? <img src={b.imageUrl} alt="" className="adm-thumb" />
                    : <span className="adm-thumb placeholder" aria-hidden="true" />}
                  <span>
                    <strong>{b.title}</strong>
                    <small>{b.excerpt}</small>
                  </span>
                </div>
              ),
              csv: (b) => [b.title, b.excerpt].filter(Boolean).join(' - '),
            },
            {
              key: 'author',
              header: 'Author',
              width: '180px',
              render: (b) => b.author || '—',
            },
            {
              key: 'createdAt',
              header: 'Published',
              width: '130px',
              render: (b) => <span className="adm-muted">{formatDate(b.createdAt)}</span>,
              sortValue: (b) => new Date(b.createdAt).getTime(),
              csv: (b) => formatDate(b.createdAt),
            },
            {
              key: 'actions',
              header: '',
              sortable: false,
              export: false,
              align: 'right',
              width: '140px',
              render: (b) => (
                <div className="adm-row-actions">
                  <a className="adm-icon-btn" href={`/blogs/${b._id}`} target="_blank" rel="noreferrer" title="View on the public site"><IconExternal width={17} height={17} /></a>
                  <button type="button" className="adm-icon-btn" title="Edit" onClick={() => openEdit(b)}><IconEdit width={17} height={17} /></button>
                  <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(b)}><IconTrash width={17} height={17} /></button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!editing}
        title={isNew ? 'Write an article' : 'Edit article'}
        subtitle="Separate paragraphs with a blank line."
        onClose={closeForm}
        wide
        footer={(
          <>
            <span className="adm-muted adm-foot-note">{words} words</span>
            <button type="button" className="adm-btn ghost" onClick={closeForm}>Cancel</button>
            <button type="submit" form="blog-form" className="adm-btn primary" disabled={form.busy}>{form.busy ? 'Saving…' : 'Publish'}</button>
          </>
        )}
      >
        {form.status.message && (
          <p className={`form-status is-${form.status.type === 'error' ? 'error' : 'ok'}`}>
            {form.status.message}
          </p>
        )}

        <form id="blog-form" className="adm-form" onSubmit={form.submit} ref={form.formRef} noValidate>
          <Field label="Title" htmlFor="title" required error={form.errorFor('title')}>
            <input id="title" {...form.field('title')} />
          </Field>

          <Field label="Summary shown on the blog list" htmlFor="excerpt" required
                 error={form.errorFor('excerpt')}
                 hint={`${String(form.values.excerpt || '').length}/300 characters`}>
            <input id="excerpt" {...form.field('excerpt')} />
          </Field>

          <Field label="Author" htmlFor="author" optional error={form.errorFor('author')}>
            <input id="author" {...form.field('author')} />
          </Field>

          <Field label="Cover image" htmlFor="coverImage" optional
                 hint="Under 1.5 MB. Stored with the article itself.">
            <input id="coverImage" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
          </Field>

          {form.values.imageUrl && (
            <div className="adm-cover-preview">
              <img src={form.values.imageUrl} alt="Cover preview" />
              <button type="button" className="adm-btn ghost small" onClick={() => form.setField('imageUrl', '')}>Remove image</button>
            </div>
          )}

          <Field label="Article body" htmlFor="content" required error={form.errorFor('content')}>
            <textarea id="content" rows={14} maxLength={20000} {...form.field('content')} />
          </Field>
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
