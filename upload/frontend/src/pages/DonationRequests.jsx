// Blood donation requests - the "donationrequests" collection from the DB design.
// Any logged-in user can post a request ("I need B+ in Surat").
// Everyone logged in sees the list with the requester's phone number,
// so a willing donor can call directly. The requester can mark it fulfilled.

import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonationRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filterGroup, setFilterGroup] = useState('');
  const [form, setForm] = useState({ bloodGroupNeeded: 'A+', location: '' });
  const [message, setMessage] = useState('');

  const loadRequests = () => {
    const params = filterGroup ? { bloodGroup: filterGroup } : {};
    api.get('/donation-requests', { params }).then((res) => setRequests(res.data));
  };

  useEffect(loadRequests, [filterGroup]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/donation-requests', form);
      setMessage('Your request has been posted. Donors can now see it and contact you.');
      setForm({ bloodGroupNeeded: 'A+', location: '' });
      loadRequests();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not post the request.');
    }
  };

  const handleFulfil = async (id) => {
    await api.put(`/donation-requests/${id}/fulfil`);
    loadRequests();
  };

  return (
    <div className="page">
      <h2>Blood Donation Requests</h2>
      {message && <p className="hint">{message}</p>}

      <div className="form-card">
        <h3>Post a Request</h3>
        <form onSubmit={handleSubmit}>
          <label>Blood Group Needed</label>
          <select
            value={form.bloodGroupNeeded}
            onChange={(e) => setForm((prev) => ({ ...prev, bloodGroupNeeded: e.target.value }))}
          >
            {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
          </select>

          <label>Location (city / area)</label>
          <input
            value={form.location}
            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="e.g. Surat"
            required
          />

          <button type="submit">Post Request</button>
        </form>
      </div>

      <h3>Open Requests</h3>
      <div className="search-bar">
        <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
        </select>
      </div>

      <table className="data-table">
        <thead>
          <tr><th>Blood Group</th><th>Location</th><th>Requested By</th><th>Contact</th><th>Date</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r._id}>
              <td><span className="blood-badge">{r.bloodGroupNeeded}</span></td>
              <td>{r.location}</td>
              <td>{r.requesterId?.name}</td>
              <td>{r.requesterId?.phone}</td>
              <td>{new Date(r.createdAt).toLocaleDateString('en-GB')}</td>
              <td>{r.status}</td>
              <td>
                {r.status === 'pending' && r.requesterId?._id === user?.id && (
                  <button className="small-button" onClick={() => handleFulfil(r._id)}>Mark Fulfilled</button>
                )}
              </td>
            </tr>
          ))}
          {requests.length === 0 && <tr><td colSpan={7}>No requests yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
