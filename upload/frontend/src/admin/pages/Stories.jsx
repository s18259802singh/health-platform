// Donor story management - write, feature, edit and remove.

import { useCallback, useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import Field from '../../components/Field';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PageHeader, Card, Badge, formatDate } from '../components/ui';
import { IconPlus, IconEdit, IconTrash, IconExternal } from '../components/Icons';
import useForm from '../../lib/useForm';
import { rules } from '../../lib/validate';

const EMPTY = { name: '', role: 'donor', bloodGroup: '', city: '', headline: '', body: '', featured: false };
const GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Blood group and town are optional because some people tell their story but
// would rather not be that findable.
const schema = {
  headline: rules.text({ label: 'Headline', min: 6, max: 120 }),
  name: rules.name,
  bloodGroup: rules.optional(rules.bloodGroup),
  city: rules.optional(rules.place),
  body: rules.text({ label: 'The story', min: 60, max: 4000 }),
};

export default function Stories() {
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
      const { data } = await adminApi.get('/admin/stories');
      setItems(Array.isArray(data) ? data : data.items || []);
      setLoadError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load stories.';
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
          await adminApi.post('/admin/stories', values);
          toast.success('Story published.');
        } else {
          await adminApi.put(`/admin/stories/${editing._id}`, values);
          toast.success('Story updated.');
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

  const openNew = () => { form.reset(EMPTY); setEditing('new'); };
  const openEdit = (s) => {
    form.reset({
      name: s.name || '', role: s.role || 'donor', bloodGroup: s.bloodGroup || '', city: s.city || '',
      headline: s.headline || '', body: s.body || '', featured: !!s.featured,
    });
    setEditing(s);
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

  const words = String(form.values.body || '').trim()
    ? String(form.values.body).trim().split(/\s+/).length
    : 0;

  return (
    <>
      <PageHeader title="Donor stories" subtitle={`${items.length} published · ${items.filter((s) => s.featured).length} featured on the homepage.`}>
        <button type="button" className="adm-btn primary" onClick={openNew}><IconPlus width={16} height={16} /> Add story</button>
      </PageHeader>

      <Card className="has-table">
        <DataTable
          caption="stories"
          rows={items}
          loading={loading}
          error={loadError}
          rowKey={(s) => s._id}
          exportName="donor-stories"
          initialSort={{ key: 'createdAt', dir: 'desc' }}
          defaultPerPage={12}
          searchKeys={['headline', 'name', 'city', 'bloodGroup']}
          searchPlaceholder="Search by headline, name or town…"
          filters={[
            {
              key: 'role',
              label: 'Role',
              options: [
                { value: 'donor', label: 'Donor' },
                { value: 'recipient', label: 'Recipient' },
                { value: 'organiser', label: 'Organiser' },
              ],
            },
            { key: 'bloodGroup', label: 'Blood group', options: GROUPS.filter(Boolean) },
            { key: 'city', label: 'Town', options: [...new Set(items.map((s) => s.city).filter(Boolean))].sort() },
            {
              key: 'featured',
              label: 'Homepage',
              options: [
                { value: 'yes', label: 'Featured' },
                { value: 'no', label: 'Not featured' },
              ],
              match: (s, v) => (v === 'yes' ? !!s.featured : !s.featured),
            },
          ]}
          empty={{ title: 'No stories match', message: 'Stories are what give the public site its warmth. Add one, or clear a filter.' }}
          columns={[
            { key: 'headline', header: 'Story', render: (s) => <strong>{s.headline}</strong> },
            {
              key: 'name',
              header: 'Person',
              render: (s) => (
                <>
                  {s.name}
                  <small className="adm-block adm-muted">{[s.bloodGroup, s.city].filter(Boolean).join(' · ')}</small>
                </>
              ),
              csv: (s) => [s.name, s.bloodGroup, s.city].filter(Boolean).join(' - '),
            },
            {
              key: 'role',
              header: 'Role',
              width: '120px',
              render: (s) => <Badge tone={s.role === 'recipient' ? 'warn' : s.role === 'organiser' ? 'neutral' : 'accent'}>{s.role}</Badge>,
            },
            {
              key: 'featured',
              header: 'Featured',
              width: '120px',
              sortable: false,
              export: false,
              render: (s) => (
                <button type="button" className={`adm-btn small ${s.featured ? '' : 'ghost'}`} onClick={() => toggleFeatured(s)}>
                  {s.featured ? 'Featured' : 'Feature'}
                </button>
              ),
            },
            {
              key: 'createdAt',
              header: 'Added',
              width: '130px',
              render: (s) => <span className="adm-muted">{formatDate(s.createdAt)}</span>,
              sortValue: (s) => new Date(s.createdAt).getTime(),
              csv: (s) => formatDate(s.createdAt),
            },
            {
              key: 'actions',
              header: '',
              sortable: false,
              export: false,
              align: 'right',
              width: '140px',
              render: (s) => (
                <div className="adm-row-actions">
                  <a className="adm-icon-btn" href={`/stories/${s._id}`} target="_blank" rel="noreferrer" title="View on site"><IconExternal width={17} height={17} /></a>
                  <button type="button" className="adm-icon-btn" title="Edit" onClick={() => openEdit(s)}><IconEdit width={17} height={17} /></button>
                  <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(s)}><IconTrash width={17} height={17} /></button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!editing}
        title={isNew ? 'Add a story' : 'Edit story'}
        subtitle="Written in the person's own voice. Blank line between paragraphs."
        onClose={closeForm}
        wide
        footer={(
          <>
            <span className="adm-muted adm-foot-note">{words} words</span>
            <button type="button" className="adm-btn ghost" onClick={closeForm}>Cancel</button>
            <button type="submit" form="story-form" className="adm-btn primary" disabled={form.busy}>{form.busy ? 'Saving…' : 'Publish'}</button>
          </>
        )}
      >
        {form.status.message && (
          <p className={`form-status is-${form.status.type === 'error' ? 'error' : 'ok'}`}>
            {form.status.message}
          </p>
        )}

        <form id="story-form" className="adm-form grid-2" onSubmit={form.submit} ref={form.formRef} noValidate>
          <Field label="Headline" htmlFor="headline" required className="span-2"
                 error={form.errorFor('headline')}
                 hint="What the card on the public site leads with.">
            <input id="headline" {...form.field('headline')} />
          </Field>

          <Field label="Name" htmlFor="name" required error={form.errorFor('name')}>
            <input id="name" {...form.field('name')} />
          </Field>

          <Field label="Role" htmlFor="role">
            <select id="role" {...form.field('role')}>
              <option value="donor">Donor</option>
              <option value="recipient">Recipient</option>
              <option value="organiser">Organiser</option>
            </select>
          </Field>

          <Field label="Blood group" htmlFor="bloodGroup" optional error={form.errorFor('bloodGroup')}>
            <select id="bloodGroup" {...form.field('bloodGroup')}>
              {GROUPS.map((g) => <option key={g} value={g}>{g || 'Not shown'}</option>)}
            </select>
          </Field>

          <Field label="City" htmlFor="city" optional error={form.errorFor('city')}>
            <input id="city" autoComplete="address-level2" {...form.field('city')} />
          </Field>

          <Field label="The story" htmlFor="body" required className="span-2"
                 error={form.errorFor('body')}
                 hint={`${String(form.values.body || '').length}/4000 characters`}>
            <textarea id="body" rows={12} maxLength={4000} {...form.field('body')} />
          </Field>

          <label className="adm-check span-2">
            <input type="checkbox" name="featured" checked={!!form.values.featured} onChange={form.handleChange} />
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
