// Book a new appointment, and view/cancel your existing ones.

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import SearchSelect from '../components/SearchSelect';

export default function Appointments() {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  // "Find care near me" links straight into this form with the hospital,
  // doctor and time already chosen, so picking a slot there does not mean
  // finding the same three things again here.
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    hospitalId: params.get('hospitalId') || '',
    doctorId: params.get('doctorId') || '',
    appointmentDate: '',
    appointmentTime: params.get('time') || '',
  });
  const prefilled = !!params.get('hospitalId');
  const [message, setMessage] = useState('');

  const loadMyAppointments = () => {
    api.get('/appointments/my').then((res) => setMyAppointments(res.data));
  };

  useEffect(() => {
    api.get('/hospitals').then((res) => setHospitals(res.data));
    loadMyAppointments();
  }, []);

  useEffect(() => {
    if (form.hospitalId) {
      api.get('/doctors', { params: { hospitalId: form.hospitalId } }).then((res) => setDoctors(res.data));
    } else {
      setDoctors([]);
    }
  }, [form.hospitalId]);

  const selectedDoctor = doctors.find((d) => d._id === form.doctorId);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleBook = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/appointments', {
        doctorId: form.doctorId,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
      });
      setMessage('Appointment booked successfully.');
      setForm({ hospitalId: '', doctorId: '', appointmentDate: '', appointmentTime: '' });
      loadMyAppointments();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed.');
    }
  };

  const handleCancel = async (id) => {
    await api.put(`/appointments/${id}/cancel`);
    loadMyAppointments();
  };

  return (
    <div className="page">
      <h1 className="page-h1">Book a Doctor Appointment</h1>
      {prefilled && (
        <p className="compat-active-banner">
          Carried over from your search — just pick a date and confirm.
        </p>
      )}
      {message && <p className="hint">{message}</p>}

      <div className="form-card">
        <form onSubmit={handleBook}>
          <label>Hospital</label>
          <SearchSelect
            value={form.hospitalId}
            onChange={(e) => handleChange({ target: { name: 'hospitalId', value: e.target.value } })}
            placeholder="Select a hospital"
            searchPlaceholder="Search 110 hospitals…"
            options={[{ value: '', label: 'Select a hospital' }, ...hospitals.map((h) => ({ value: h._id, label: h.name }))]}
          />

          <label>Doctor</label>
          <SearchSelect
            value={form.doctorId}
            onChange={(e) => handleChange({ target: { name: 'doctorId', value: e.target.value } })}
            disabled={!form.hospitalId}
            placeholder="Select a doctor"
            searchPlaceholder="Search by name or specialism…"
            options={[{ value: '', label: 'Select a doctor' }, ...doctors.map((d) => ({ value: d._id, label: `${d.name} — ${d.specialization}` }))]}
          />

          <label>Date</label>
          <input type="date" name="appointmentDate" value={form.appointmentDate} onChange={handleChange} required />

          <label>Time Slot</label>
          <SearchSelect
            value={form.appointmentTime}
            onChange={(e) => handleChange({ target: { name: 'appointmentTime', value: e.target.value } })}
            disabled={!selectedDoctor}
            placeholder="Select a time slot"
            options={[{ value: '', label: 'Select a time slot' }, ...(selectedDoctor?.availableTimeSlots || []).map((t) => ({ value: t, label: t }))]}
          />

          <button type="submit">Book Appointment</button>
        </form>
      </div>

      <h3>My Appointments</h3>
      <table className="data-table">
        <thead>
          <tr><th>Doctor</th><th>Hospital</th><th>Date</th><th>Time</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {myAppointments.map((a) => (
            <tr key={a._id}>
              <td>{a.doctorId?.name}</td>
              <td>{a.doctorId?.hospitalId?.name}</td>
              <td>{a.appointmentDate}</td>
              <td>{a.appointmentTime}</td>
              <td>{a.status}</td>
              <td>{a.status !== 'cancelled' && <button className="small-button danger" onClick={() => handleCancel(a._id)}>Cancel</button>}</td>
            </tr>
          ))}
          {myAppointments.length === 0 && <tr><td colSpan={6}>No appointments booked yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
