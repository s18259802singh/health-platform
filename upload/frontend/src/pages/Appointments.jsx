// Book a new appointment, and view/cancel your existing ones.

import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Appointments() {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [form, setForm] = useState({ hospitalId: '', doctorId: '', appointmentDate: '', appointmentTime: '' });
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
      <h2>Book a Doctor Appointment</h2>
      {message && <p className="hint">{message}</p>}

      <div className="form-card">
        <form onSubmit={handleBook}>
          <label>Hospital</label>
          <select name="hospitalId" value={form.hospitalId} onChange={handleChange} required>
            <option value="">Select a hospital</option>
            {hospitals.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
          </select>

          <label>Doctor</label>
          <select name="doctorId" value={form.doctorId} onChange={handleChange} required disabled={!form.hospitalId}>
            <option value="">Select a doctor</option>
            {doctors.map((d) => <option key={d._id} value={d._id}>{d.name} - {d.specialization}</option>)}
          </select>

          <label>Date</label>
          <input type="date" name="appointmentDate" value={form.appointmentDate} onChange={handleChange} required />

          <label>Time Slot</label>
          <select name="appointmentTime" value={form.appointmentTime} onChange={handleChange} required disabled={!selectedDoctor}>
            <option value="">Select a time slot</option>
            {selectedDoctor?.availableTimeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>

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
