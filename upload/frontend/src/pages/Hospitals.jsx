// Lists hospitals/blood banks for everyone, plus an admin-only form to add/edit/delete.

import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const empty = { name: '', address: '', contactNumber: '', type: 'hospital' };

export default function Hospitals() {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const loadHospitals = () => {
    api.get('/hospitals', { params: search ? { search } : {} }).then((res) => setHospitals(res.data));
  };

  useEffect(() => {
    const timer = setTimeout(loadHospitals, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/hospitals/${editingId}`, form);
    } else {
      await api.post('/hospitals', form);
    }
    setForm(empty);
    setEditingId(null);
    loadHospitals();
  };

  const startEdit = (h) => {
    setEditingId(h._id);
    setForm({ name: h.name, address: h.address, contactNumber: h.contactNumber, type: h.type });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this hospital?')) return;
    await api.delete(`/hospitals/${id}`);
    loadHospitals();
  };

  return (
    <div className="page">
      <h2>Hospitals & Blood Banks</h2>
      <input
        className="search-bar"
        placeholder="Search by name or address..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Address</th><th>Contact</th><th>Type</th>{user?.role === 'admin' && <th>Actions</th>}</tr>
        </thead>
        <tbody>
          {hospitals.map((h) => (
            <tr key={h._id}>
              <td>{h.name}</td>
              <td>{h.address}</td>
              <td>{h.contactNumber}</td>
              <td>{h.type === 'blood_bank' ? 'Blood Bank' : 'Hospital'}</td>
              {user?.role === 'admin' && (
                <td>
                  <button onClick={() => startEdit(h)} className="small-button">Edit</button>
                  <button onClick={() => handleDelete(h._id)} className="small-button danger">Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {user?.role === 'admin' && (
        <div className="form-card">
          <h3>{editingId ? 'Edit Hospital' : 'Add New Hospital'}</h3>
          <form onSubmit={handleSubmit}>
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} required />
            <label>Contact Number</label>
            <input name="contactNumber" value={form.contactNumber} onChange={handleChange} required />
            <label>Type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="hospital">Hospital</option>
              <option value="blood_bank">Blood Bank</option>
            </select>
            <button type="submit">{editingId ? 'Update' : 'Add'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</button>}
          </form>
        </div>
      )}
    </div>
  );
}
