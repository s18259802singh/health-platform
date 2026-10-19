// Doctors directory: CRUD, tied to a hospital, with availability.

import { useEffect, useState } from 'react';
import adminApi from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import SearchSelect from '../../components/SearchSelect';
import Field from '../../components/Field';
import Modal, { ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { PageHeader, Card, Badge } from '../components/ui';
import { IconPlus, IconEdit, IconTrash } from '../components/Icons';
import useForm from '../../lib/useForm';
import { rules } from '../../lib/validate';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
const EMPTY = { name: '', specialization: '', hospitalId: '', availableDays: [], availableTimeSlots: [] };

// Days and slots are deliberately not required: a doctor with none is simply
// not yet bookable, and the table has a filter for exactly that case.
const schema = {
  name: rules.name,
  specialization: rules.text({ label: 'Speciality', min: 2, max: 60 }),
  hospitalId: rules.required('Hospital'),
};

export default function Doctors() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [d, h] = await Promise.all([adminApi.get('/admin/doctors'), adminApi.get('/hospitals')]);
      setItems(Array.isArray(d.data) ? d.data : d.data.items || []);
      setHospitals(Array.isArray(h.data) ? h.data : h.data.items || []);
      setLoadError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load doctors.';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isNew = editing === 'new';

  const form = useForm(EMPTY, schema, {
    onSubmit: async (values) => {
      try {
        if (isNew) {
          await adminApi.post('/admin/doctors', values);
          toast.success('Doctor added.');
        } else {
          await adminApi.put(`/admin/doctors/${editing._id}`, values);
          toast.success('Doctor updated.');
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

  const openNew = () => { form.reset({ ...EMPTY, hospitalId: hospitals[0]?._id || '' }); setEditing('new'); };
  const openEdit = (d) => {
    form.reset({
      name: d.name || '', specialization: d.specialization || '',
      hospitalId: d.hospitalId?._id || d.hospitalId || '',
      availableDays: d.availableDays || [], availableTimeSlots: d.availableTimeSlots || [],
    });
    setEditing(d);
  };

  const toggle = (key, value) => {
    const current = form.values[key] || [];
    form.setField(key, current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
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

      <Card className="has-table">
        <DataTable
          caption="doctors"
          rows={items}
          loading={loading}
          error={loadError}
          rowKey={(d) => d._id}
          exportName="doctors"
          initialSort={{ key: 'name', dir: 'asc' }}
          defaultPerPage={12}
          searchKeys={['name', 'specialization', 'hospitalId.name']}
          searchPlaceholder="Search by name, speciality or hospital…"
          filters={[
            { key: 'hospitalId.name', label: 'Hospital', options: [...new Set(items.map((d) => d.hospitalId?.name).filter(Boolean))].sort() },
            { key: 'specialization', label: 'Speciality', options: [...new Set(items.map((d) => d.specialization).filter(Boolean))].sort() },
            {
              key: 'availability',
              label: 'Availability',
              placeholder: 'Any availability',
              options: [
                { value: 'yes', label: 'Has days set' },
                { value: 'no', label: 'No days set' },
              ],
              // A doctor with no days cannot be booked, so make them findable.
              match: (d, v) => (v === 'yes' ? !!d.availableDays?.length : !d.availableDays?.length),
            },
          ]}
          empty={{ title: 'No doctors listed', message: 'Add a doctor so members can book appointments.' }}
          columns={[
            { key: 'name', header: 'Doctor', render: (d) => <strong>{d.name}</strong> },
            { key: 'specialization', header: 'Speciality' },
            {
              key: 'hospitalId.name',
              header: 'Hospital',
              render: (d) => <span className="adm-muted">{d.hospitalId?.name || '—'}</span>,
            },
            {
              key: 'availableDays',
              header: 'Days',
              width: '120px',
              sortValue: (d) => d.availableDays?.length || 0,
              render: (d) => (d.availableDays?.length ? <Badge>{d.availableDays.length} days</Badge> : <span className="adm-muted">—</span>),
              csv: (d) => (d.availableDays || []).join(' '),
            },
            {
              key: 'availableTimeSlots',
              header: 'Slots',
              width: '120px',
              sortValue: (d) => d.availableTimeSlots?.length || 0,
              render: (d) => (d.availableTimeSlots?.length ? <Badge>{d.availableTimeSlots.length} slots</Badge> : <span className="adm-muted">—</span>),
              csv: (d) => (d.availableTimeSlots || []).join(' '),
            },
            {
              key: 'actions',
              header: '',
              sortable: false,
              export: false,
              align: 'right',
              width: '96px',
              render: (d) => (
                <div className="adm-row-actions">
                  <button type="button" className="adm-icon-btn" title="Edit" onClick={() => openEdit(d)}><IconEdit width={17} height={17} /></button>
                  <button type="button" className="adm-icon-btn danger" title="Delete" onClick={() => setConfirm(d)}><IconTrash width={17} height={17} /></button>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!editing}
        title={isNew ? 'Add a doctor' : `Edit ${editing?.name || ''}`}
        onClose={closeForm}
        wide
        footer={(
          <>
            <button type="button" className="adm-btn ghost" onClick={closeForm}>Cancel</button>
            <button type="submit" form="doctor-form" className="adm-btn primary" disabled={form.busy}>{form.busy ? 'Saving…' : 'Save doctor'}</button>
          </>
        )}
      >
        {form.status.message && (
          <p className={`form-status is-${form.status.type === 'error' ? 'error' : 'ok'}`}>
            {form.status.message}
          </p>
        )}

        <form id="doctor-form" className="adm-form grid-2" onSubmit={form.submit} ref={form.formRef} noValidate>
          <Field label="Name" htmlFor="name" required error={form.errorFor('name')}>
            <input id="name" placeholder="Dr A. Mehta" {...form.field('name')} />
          </Field>

          <Field label="Speciality" htmlFor="specialization" required
                 error={form.errorFor('specialization')}>
            <input id="specialization" placeholder="Haematology" {...form.field('specialization')} />
          </Field>

          <Field label="Hospital" htmlFor="hospitalId" required className="span-2"
                 error={form.errorFor('hospitalId')}
                 hint="Members book an appointment at this location.">
            <SearchSelect
              id="hospitalId"
              value={form.values.hospitalId}
              onChange={(e) => { form.setField('hospitalId', e.target.value); form.setTouched((t) => ({ ...t, hospitalId: true })); }}
              placeholder="Select a hospital…"
              options={[{ value: '', label: 'Select a hospital…' }, ...hospitals.map((h) => ({ value: h._id, label: h.name }))]}
            />
          </Field>

          <div className="span-2">
            <span className="adm-field-label">Available days</span>
            <div className="adm-chips">
              {DAYS.map((d) => (
                <button key={d} type="button" className={`adm-chip ${(form.values.availableDays || []).includes(d) ? 'on' : ''}`} onClick={() => toggle('availableDays', d)}>{d.slice(0, 3)}</button>
              ))}
            </div>
          </div>

          <div className="span-2">
            <span className="adm-field-label">Time slots</span>
            <div className="adm-chips">
              {SLOTS.map((s) => (
                <button key={s} type="button" className={`adm-chip ${(form.values.availableTimeSlots || []).includes(s) ? 'on' : ''}`} onClick={() => toggle('availableTimeSlots', s)}>{s}</button>
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
