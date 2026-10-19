// The donor guide library, grouped by the five categories the public hub uses.

import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import Field from '../../components/Field';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PageHeader, Card, Badge } from '../components/ui';
import { IconPlus, IconEdit, IconTrash, IconExternal } from '../components/Icons';
import useForm from '../../lib/useForm';
import { rules } from '../../lib/validate';

const CATEGORIES = [
  { value: 'education', label: 'Donor education' },
  { value: 'eligibility', label: 'Donor eligibility' },
  { value: 'preparation', label: 'Donor preparation' },
  { value: 'recovery', label: 'Donor recovery' },
  { value: 'regular', label: 'Regular donor' },
];

const EMPTY = { category: 'education', title: '', summary: '', body: '', readMinutes: 3, order: 1 };

// Order positions a guide within its category, so zero and negatives would
// put it nowhere the public hub can show it.
const schema = {
  title: rules.text({ label: 'Title', min: 4, max: 120 }),
  summary: rules.text({ label: 'Summary', min: 10, max: 200 }),
  body: rules.text({ label: 'Guide body', min: 60, max: 8000 }),
  readMinutes: rules.number({ label: 'Read time', min: 1, max: 60 }),
  order: rules.number({ label: 'Order', min: 1, max: 99 }),
};

export default function Guides() {
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
      const { data } = await adminApi.get('/admin/guides');
      setItems(Array.isArray(data) ? data : data.items || []);
      setLoadError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load guides.';
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
          await adminApi.post('/admin/guides', values);
          toast.success('Guide published.');
        } else {
          await adminApi.put(`/admin/guides/${editing._id}`, values);
          toast.success('Guide updated.');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not save.');
        throw err; // useForm puts the server's field messages back on the fields
      }
      setEditing(null);
      load();
    },
  });

  const closeForm = () => { setEditing(null); form.reset(EMPTY); };

  const openNew = () => { form.reset({ ...EMPTY, order: items.length + 1 }); setEditing('new'); };
  const openEdit = (g) => {
    form.reset({
      category: g.category || 'education', title: g.title || '', summary: g.summary || '',
      body: g.body || '', readMinutes: g.readMinutes ?? 3, order: g.order ?? 1,
    });
    setEditing(g);
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

      <Card className="has-table">
        <DataTable
          caption="guides"
          rows={items}
          loading={loading}
          error={loadError}
          rowKey={(g) => g._id}
          exportName="donor-guides"
          initialSort={{ key: 'order', dir: 'asc' }}
          defaultPerPage={12}
          searchKeys={['title', 'summary']}
          searchPlaceholder="Search by title or summary…"
          filters={[
            { key: 'category', label: 'Category', options: CATEGORIES },
            {
              key: 'readMinutes',
              label: 'Read time',
              options: [
                { value: 'short', label: 'Under 5 minutes' },
                { value: 'long', label: '5 minutes or more' },
              ],
              match: (g, v) => (v === 'short' ? (g.readMinutes || 0) < 5 : (g.readMinutes || 0) >= 5),
            },
          ]}
          empty={{ title: 'No guides match', message: 'Add a guide, or clear a filter to see the rest of the library.' }}
          columns={[
            {
              key: 'order',
              header: 'Order',
              width: '80px',
              render: (g) => <span className="adm-muted">{g.order}</span>,
            },
            {
              key: 'title',
              header: 'Guide',
              render: (g) => (
                <>
                  <strong>{g.title}</strong>
                  <small className="adm-block adm-muted">{g.summary}</small>
                </>
              ),
              csv: (g) => [g.title, g.summary].filter(Boolean).join(' - '),
            },
            {
              key: 'category',
              header: 'Category',
              width: '170px',
              render: (g) => <Badge>{label(g.category)}</Badge>,
              csv: (g) => label(g.category),
            },
            {
              key: 'readMinutes',
              header: 'Read time', defaultDir: 'desc',
              width: '110px',
              render: (g) => `${g.readMinutes} min`,
              csv: (g) => `${g.readMinutes} min`,
            },
            {
              key: 'actions',
              header: '',
              sortable: false,
              export: false,
              align: 'right',
              width: '140px',
              render: (g) => (
                <div className="adm-row-actions">
                  <a className="adm-icon-btn" href={`/guides/${g._id}`} target="_blank" rel="noreferrer" title="View on site"><IconExternal width={17} height={17} /></a>
                  <button type="button" className="adm-icon-btn" title="Edit" onClick={() => openEdit(g)}><IconEdit width={17} height={17} /></button>
                  <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(g)}><IconTrash width={17} height={17} /></button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!editing}
        title={isNew ? 'Write a guide' : 'Edit guide'}
        subtitle="Plain English. Blank line between paragraphs."
        onClose={closeForm}
        wide
        footer={(
          <>
            <button type="button" className="adm-btn ghost" onClick={closeForm}>Cancel</button>
            <button type="submit" form="guide-form" className="adm-btn primary" disabled={form.busy}>{form.busy ? 'Saving…' : 'Publish'}</button>
          </>
        )}
      >
        {form.status.message && (
          <p className={`form-status is-${form.status.type === 'error' ? 'error' : 'ok'}`}>
            {form.status.message}
          </p>
        )}

        <form id="guide-form" className="adm-form grid-2" onSubmit={form.submit} ref={form.formRef} noValidate>
          <Field label="Category" htmlFor="category">
            <select id="category" {...form.field('category')}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>

          <Field label="Order within category" htmlFor="order" required
                 error={form.errorFor('order')}
                 hint="1 shows first in its category.">
            <input id="order" type="number" min="1" max="99" step="1" inputMode="numeric"
                   {...form.field('order')} />
          </Field>

          <Field label="Title" htmlFor="title" required className="span-2" error={form.errorFor('title')}>
            <input id="title" {...form.field('title')} />
          </Field>

          <Field label="One-line summary" htmlFor="summary" required className="span-2"
                 error={form.errorFor('summary')}
                 hint="Shown under the title in the library list.">
            <input id="summary" {...form.field('summary')} />
          </Field>

          <Field label="Read time (minutes)" htmlFor="readMinutes" required
                 error={form.errorFor('readMinutes')}>
            <input id="readMinutes" type="number" min="1" max="60" step="1" inputMode="numeric"
                   {...form.field('readMinutes')} />
          </Field>

          <Field label="Guide body" htmlFor="body" required className="span-2"
                 error={form.errorFor('body')}
                 hint={`${String(form.values.body || '').length}/8000 characters`}>
            <textarea id="body" rows={14} maxLength={8000} {...form.field('body')} />
          </Field>
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
