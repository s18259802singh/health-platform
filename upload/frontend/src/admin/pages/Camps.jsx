// Camp management: create, edit, cancel, and see who has registered.

import { useCallback, useEffect, useMemo, useState } from 'react';
import BloodGroup from '../../components/BloodGroup';
import adminApi from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import StatusTag from '../../components/StatusTag';
import ContactActions from '../../components/ContactActions';
import Field from '../../components/Field';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PageHeader, Card, Spinner, TableWrap, StatCard, formatDate } from '../components/ui';
import { IconPlus, IconEdit, IconTrash, IconUsers, IconCalendar, IconCheck } from '../components/Icons';
import useForm from '../../lib/useForm';
import { rules } from '../../lib/validate';

const EMPTY = {
  title: '', organiser: '', venue: '', city: '', state: 'Gujarat',
  date: '', startTime: '09:00 AM', endTime: '04:00 PM',
  slots: 100, contactNumber: '', description: '', status: 'upcoming',
};

// Times are stored as free text ("09:00 AM") because that is what the public
// pages render, so they have to be parsed before they can be compared.
// Returns minutes since midnight, or null when the text is not a time.
const minutesOf = (v) => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/.exec(String(v || '').trim().toUpperCase());
  if (!m) return null;
  let hours = Number(m[1]);
  const mins = Number(m[2]);
  if (mins > 59) return null;
  if (m[3]) {
    if (hours < 1 || hours > 12) return null;
    hours = (hours % 12) + (m[3] === 'PM' ? 12 : 0);
  } else if (hours > 23) return null;
  return (hours * 60) + mins;
};

const timeRule = (label) => (v) => {
  if (!String(v || '').trim()) return `${label} is required`;
  return minutesOf(v) === null ? 'Use a time like 09:00 AM' : '';
};

// The capacity floor depends on the camp being edited, so the schema is built
// per camp rather than declared once at module level.
const schemaFor = (taken) => ({
  title: rules.text({ label: 'Camp title', min: 3, max: 120 }),
  organiser: rules.text({ label: 'Organiser', min: 2, max: 120 }),
  venue: rules.text({ label: 'Venue', min: 3, max: 160 }),
  city: rules.place,
  state: rules.optional(rules.place),
  date: rules.date({ label: 'Date' }),
  startTime: timeRule('Start time'),
  endTime: rules.all(timeRule('End time'), (v, all) => {
    const from = minutesOf(all.startTime);
    const to = minutesOf(v);
    return from !== null && to !== null && to <= from ? 'The end time must be after the start time' : '';
  }),
  slots: rules.all(
    rules.number({ label: 'Slots', min: 1, max: 2000 }),
    // Shrinking a camp below the people already on its list would silently
    // turn confirmed registrations into over-booking.
    (v) => (Number(v) < taken ? `Slots cannot be fewer than the ${taken} already registered` : ''),
  ),
  contactNumber: rules.optional(rules.anyPhone),
  description: rules.optional(rules.text({ label: 'Description', max: 2000 })),
});

export default function Camps() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [roster, setRoster] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get('/admin/camps');
      setItems(Array.isArray(data) ? data : data.items || []);
      setLoadError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load camps.';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const isNew = editing === 'new';
  const alreadyRegistered = isNew ? 0 : (editing?.registrations?.length || 0);
  const schema = useMemo(() => schemaFor(alreadyRegistered), [alreadyRegistered]);

  const form = useForm(EMPTY, schema, {
    onSubmit: async (values) => {
      try {
        if (isNew) {
          await adminApi.post('/admin/camps', values);
          toast.success('Camp created.');
        } else {
          await adminApi.put(`/admin/camps/${editing._id}`, values);
          toast.success('Camp updated.');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not save the camp.');
        throw err; // useForm puts the server's field messages back on the fields
      }
      setEditing(null);
      load();
    },
  });

  const closeForm = () => { setEditing(null); form.reset(EMPTY); };

  const openNew = () => { form.reset(EMPTY); setEditing('new'); };
  const openEdit = (c) => {
    form.reset({
      title: c.title || '', organiser: c.organiser || '', venue: c.venue || '',
      city: c.city || '', state: c.state || '',
      date: c.date || '', startTime: c.startTime || '', endTime: c.endTime || '',
      slots: c.slots ?? 100,
      contactNumber: c.contactNumber || '', description: c.description || '',
      status: c.status || 'upcoming',
    });
    setEditing(c);
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

  const taken = (c) => c.registrations?.length || 0;

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

      <Card className="has-table">
        <DataTable
          caption="camps"
          rows={items}
          loading={loading}
          error={loadError}
          rowKey={(c) => c._id}
          exportName="camps"
          initialSort={{ key: 'date', dir: 'desc' }}
          defaultPerPage={12}
          searchKeys={['title', 'organiser', 'venue', 'city', 'contactNumber']}
          searchPlaceholder="Search title, organiser, venue or city…"
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ],
            },
            { key: 'city', label: 'City', options: [...new Set(items.map((c) => c.city).filter(Boolean))].sort() },
            { key: 'organiser', label: 'Organiser', options: [...new Set(items.map((c) => c.organiser).filter(Boolean))].sort() },
          ]}
          empty={{ title: 'No camps match', message: 'Create a camp so members can register, or clear a filter.' }}
          columns={[
            {
              key: 'title',
              header: 'Camp',
              render: (c) => (
                <>
                  <strong>{c.title}</strong>
                  <small className="adm-block adm-muted">{c.organiser} · {c.venue}</small>
                </>
              ),
              csv: (c) => [c.title, c.organiser, c.venue].filter(Boolean).join(' - '),
            },
            {
              key: 'date',
              header: 'Date',
              width: '150px',
              // Camp dates are stored as plain yyyy-mm-dd, so anchor them to
              // midnight before formatting or they drift a day on some zones.
              render: (c) => (
                <>
                  {formatDate(`${c.date}T00:00:00`)}
                  <small className="adm-block adm-muted">{c.startTime}–{c.endTime}</small>
                </>
              ),
              sortValue: (c) => new Date(`${c.date}T00:00:00`).getTime(),
              csv: (c) => formatDate(`${c.date}T00:00:00`),
            },
            { key: 'city', header: 'City', width: '130px' },
            {
              key: 'registered',
              header: 'Registered', defaultDir: 'desc',
              width: '130px',
              render: (c) => {
                const pct = c.slots ? Math.round((taken(c) / c.slots) * 100) : 0;
                return (
                  <>
                    <button type="button" className="adm-link" onClick={() => openRoster(c)}>
                      {taken(c)} / {c.slots}
                    </button>
                    <span className="adm-mini-bar"><span style={{ width: `${Math.min(100, pct)}%` }} /></span>
                  </>
                );
              },
              // Sorted by how full the camp is, which is the question an
              // organiser is actually asking of this column.
              sortValue: (c) => (c.slots ? taken(c) / c.slots : 0),
              csv: (c) => `${taken(c)} / ${c.slots}`,
            },
            {
              key: 'contactNumber',
              header: 'Contact',
              width: '110px',
              sortable: false,
              render: (c) => <ContactActions size="sm" phone={c.contactNumber} name={c.organiser} />,
              csv: (c) => c.contactNumber || '',
            },
            {
              key: 'status',
              header: 'Status',
              width: '120px',
              render: (c) => <StatusTag status={c.status} />,
            },
            {
              key: 'actions',
              header: '',
              sortable: false,
              export: false,
              align: 'right',
              width: '140px',
              render: (c) => (
                <div className="adm-row-actions">
                  <button type="button" className="adm-icon-btn" title="Registrations" onClick={() => openRoster(c)}><IconUsers width={17} height={17} /></button>
                  <button type="button" className="adm-icon-btn" title="Edit" onClick={() => openEdit(c)}><IconEdit width={17} height={17} /></button>
                  <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(c)}><IconTrash width={17} height={17} /></button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!editing}
        title={isNew ? 'Create a camp' : `Edit ${editing?.title || ''}`}
        onClose={closeForm}
        wide
        footer={(
          <>
            <button type="button" className="adm-btn ghost" onClick={closeForm}>Cancel</button>
            <button type="submit" form="camp-form" className="adm-btn primary" disabled={form.busy}>{form.busy ? 'Saving…' : 'Save camp'}</button>
          </>
        )}
      >
        {form.status.message && (
          <p className={`form-status is-${form.status.type === 'error' ? 'error' : 'ok'}`}>
            {form.status.message}
          </p>
        )}

        <form id="camp-form" className="adm-form grid-2" onSubmit={form.submit} ref={form.formRef} noValidate>
          <Field label="Camp title" htmlFor="title" required className="span-2" error={form.errorFor('title')}>
            <input id="title" {...form.field('title')} />
          </Field>

          <Field label="Organiser" htmlFor="organiser" required className="span-2" error={form.errorFor('organiser')}>
            <input id="organiser" {...form.field('organiser')} />
          </Field>

          <Field label="Venue" htmlFor="venue" required className="span-2" error={form.errorFor('venue')}>
            <input id="venue" {...form.field('venue')} />
          </Field>

          <Field label="City" htmlFor="city" required error={form.errorFor('city')}>
            <input id="city" autoComplete="address-level2" {...form.field('city')} />
          </Field>

          <Field label="State" htmlFor="state" optional error={form.errorFor('state')}>
            <input id="state" {...form.field('state')} />
          </Field>

          <Field label="Date" htmlFor="date" required error={form.errorFor('date')}>
            <input id="date" type="date" {...form.field('date')} />
          </Field>

          <Field label="Slots" htmlFor="slots" required error={form.errorFor('slots')}
                 hint={alreadyRegistered > 0
                   ? `${alreadyRegistered} ${alreadyRegistered === 1 ? 'person has' : 'people have'} already registered.`
                   : 'How many donors the camp can take.'}>
            <input id="slots" type="number" min="1" max="2000" step="1" inputMode="numeric"
                   {...form.field('slots')} />
          </Field>

          <Field label="Start time" htmlFor="startTime" required error={form.errorFor('startTime')}>
            <input id="startTime" placeholder="09:00 AM" {...form.field('startTime')} />
          </Field>

          <Field label="End time" htmlFor="endTime" required error={form.errorFor('endTime')}>
            <input id="endTime" placeholder="04:00 PM" {...form.field('endTime')} />
          </Field>

          <Field label="Contact number" htmlFor="contactNumber" optional
                 error={form.errorFor('contactNumber')}
                 hint="A landline or switchboard is fine.">
            <input id="contactNumber" inputMode="tel" {...form.field('contactNumber')} />
          </Field>

          <Field label="Status" htmlFor="status">
            <select id="status" {...form.field('status')}>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field>

          <Field label="Description" htmlFor="description" optional className="span-2"
                 error={form.errorFor('description')}
                 hint="Blank line between paragraphs.">
            <textarea id="description" rows={6} maxLength={2000} {...form.field('description')} />
          </Field>
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
                        <td><span className="adm-blood"><BloodGroup group={r.bloodGroup} variant="bare" /></span></td>
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
