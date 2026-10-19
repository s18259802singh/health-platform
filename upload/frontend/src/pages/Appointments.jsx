// Book a new appointment, and view/cancel your existing ones.

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import SearchSelect from '../components/SearchSelect';
import DataTable from '../components/DataTable';
import StatusTag from '../components/StatusTag';
import Field from '../components/Field';
import useForm from '../lib/useForm';
import { rules } from '../lib/validate';

const today = () => new Date().toISOString().slice(0, 10);

const schema = {
  hospitalId: rules.required('A hospital'),
  doctorId: rules.required('A doctor'),
  // Booking into the past is the mistake this form invites most, because a
  // date picker opens on whatever month you left it.
  appointmentDate: rules.date({ label: 'Appointment date', future: true }),
  appointmentTime: rules.required('A time slot'),
};

export default function Appointments() {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  // "Find care near me" links straight into this form with the hospital,
  // doctor and time already chosen, so picking a slot there does not mean
  // finding the same three things again here.
  const [params] = useSearchParams();
  const form = useForm(
    {
      hospitalId: params.get('hospitalId') || '',
      doctorId: params.get('doctorId') || '',
      appointmentDate: '',
      appointmentTime: params.get('time') || '',
    },
    schema,
    {
      onSubmit: async (values) => {
        await api.post('/appointments', {
          doctorId: values.doctorId,
          appointmentDate: values.appointmentDate,
          appointmentTime: values.appointmentTime,
        });
        form.reset({ hospitalId: '', doctorId: '', appointmentDate: '', appointmentTime: '' });
        form.setStatus({ type: 'ok', message: 'Booked. The hospital confirms it, usually within a day.' });
        loadMyAppointments();
      },
    },
  );
  const prefilled = !!params.get('hospitalId');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadMyAppointments = () => {
    api.get('/appointments/my')
      .then((res) => setMyAppointments(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/hospitals').then((res) => setHospitals(res.data));
    loadMyAppointments();
  }, []);

  useEffect(() => {
    if (form.values.hospitalId) {
      api.get('/doctors', { params: { hospitalId: form.values.hospitalId } }).then((res) => setDoctors(res.data));
    } else {
      setDoctors([]);
    }
  }, [form.values.hospitalId]);

  const selectedDoctor = doctors.find((d) => d._id === form.values.doctorId);

  // Changing hospital invalidates the doctor beneath it, and changing doctor
  // invalidates the slot: a slot from the previous doctor would be accepted
  // by the form and refused by the server.
  const pick = (fieldName, value) => {
    form.setField(fieldName, value);
    form.setTouched((t) => ({ ...t, [fieldName]: true }));
    if (fieldName === 'hospitalId') { form.setField('doctorId', ''); form.setField('appointmentTime', ''); }
    if (fieldName === 'doctorId') form.setField('appointmentTime', '');
  };

  const handleCancel = async (id) => {
    setBusyId(id);
    try {
      await api.put(`/appointments/${id}/cancel`);
      loadMyAppointments();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page">
      <h1 className="page-h1">Book a Doctor Appointment</h1>
      {prefilled && (
        <p className="compat-active-banner">
          Carried over from your search — just pick a date and confirm.
        </p>
      )}
      {form.status.message && (
        <p className={`form-status is-${form.status.type === 'error' ? 'error' : 'ok'}`}>
          {form.status.message}
        </p>
      )}

      <div className="form-card" ref={form.formRef}>
        <form onSubmit={form.submit} noValidate>
          <Field label="Hospital" htmlFor="hospitalId" required error={form.errorFor('hospitalId')}>
            <SearchSelect
              id="hospitalId"
              value={form.values.hospitalId}
              onChange={(e) => pick('hospitalId', e.target.value)}
              placeholder="Select a hospital"
              searchPlaceholder={`Search ${hospitals.length} centres…`}
              options={[{ value: '', label: 'Select a hospital' }, ...hospitals.map((h) => ({ value: h._id, label: h.name }))]}
            />
          </Field>

          <Field label="Doctor" htmlFor="doctorId" required error={form.errorFor('doctorId')}
                 hint={form.values.hospitalId ? '' : 'Choose a hospital first.'}>
            <SearchSelect
              id="doctorId"
              value={form.values.doctorId}
              onChange={(e) => pick('doctorId', e.target.value)}
              disabled={!form.values.hospitalId}
              placeholder={form.values.hospitalId ? 'Select a doctor' : 'Choose a hospital first'}
              searchPlaceholder="Search by name or specialism…"
              options={[{ value: '', label: 'Select a doctor' }, ...doctors.map((d) => ({ value: d._id, label: `${d.name} — ${d.specialization}` }))]}
            />
          </Field>

          <Field label="Date" htmlFor="appointmentDate" required error={form.errorFor('appointmentDate')}>
            <input id="appointmentDate" type="date" min={today()} {...form.field('appointmentDate')} />
          </Field>

          <Field label="Time slot" htmlFor="appointmentTime" required error={form.errorFor('appointmentTime')}
                 hint={selectedDoctor ? `${selectedDoctor.name} sees patients on ${(selectedDoctor.availableDays || []).join(', ') || 'request'}.` : 'Choose a doctor first.'}>
            <SearchSelect
              id="appointmentTime"
              value={form.values.appointmentTime}
              onChange={(e) => { form.setField('appointmentTime', e.target.value); form.setTouched((t) => ({ ...t, appointmentTime: true })); }}
              disabled={!selectedDoctor}
              placeholder={selectedDoctor ? 'Select a time slot' : 'Choose a doctor first'}
              options={[{ value: '', label: 'Select a time slot' }, ...(selectedDoctor?.availableTimeSlots || []).map((t) => ({ value: t, label: t }))]}
            />
          </Field>

          <button type="submit" disabled={form.busy}>
            {form.busy ? 'Booking…' : 'Book appointment'}
          </button>
        </form>
      </div>

      <div className="section-header"><h3>My appointments</h3></div>

      <DataTable
        caption="appointments"
        rows={myAppointments}
        loading={loading}
        rowKey={(a) => a._id}
        exportName="my-appointments"
        initialSort={{ key: 'appointmentDate', dir: 'desc' }}
        defaultPerPage={10}
        searchKeys={[(a) => a.doctorId?.name, (a) => a.doctorId?.hospitalId?.name, 'appointmentDate']}
        searchPlaceholder="Search your appointments…"
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'pending', label: 'Awaiting confirmation' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'cancelled', label: 'Cancelled' },
            ],
          },
          {
            key: 'when',
            label: 'When',
            placeholder: 'Any date',
            options: [
              { value: 'upcoming', label: 'Still to come' },
              { value: 'past', label: 'Already been' },
            ],
            match: (a, v) => (v === 'upcoming'
              ? a.appointmentDate >= today()
              : a.appointmentDate < today()),
          },
        ]}
        empty={{
          title: 'No appointments yet',
          message: 'Book one above and it appears here with its confirmation status.',
        }}
        columns={[
          { key: 'doctorId.name', header: 'Doctor',
            render: (a) => (
              <>
                <strong>{a.doctorId?.name || 'Doctor'}</strong>
                {a.doctorId?.specialization && <><br /><small className="muted-note">{a.doctorId.specialization}</small></>}
              </>
            ),
            csv: (a) => a.doctorId?.name || '' },
          { key: 'doctorId.hospitalId.name', header: 'Hospital',
            render: (a) => a.doctorId?.hospitalId?.name || '—' },
          { key: 'appointmentDate', header: 'Date', width: '140px',
            render: (a) => new Date(`${a.appointmentDate}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
          { key: 'appointmentTime', header: 'Time', width: '110px' },
          { key: 'status', header: 'Status', width: '150px',
            render: (a) => <StatusTag status={a.status} label={a.status === 'pending' ? 'Awaiting confirmation' : undefined} /> },
          {
            key: 'actions', header: '', sortable: false, export: false, align: 'right', width: '110px',
            render: (a) => (a.status !== 'cancelled' && a.appointmentDate >= today() ? (
              <button type="button" className="small-button ghost" disabled={busyId === a._id}
                      onClick={() => handleCancel(a._id)}>
                {busyId === a._id ? 'Cancelling…' : 'Cancel'}
              </button>
            ) : null),
          },
        ]}
      />

    </div>
  );
}
