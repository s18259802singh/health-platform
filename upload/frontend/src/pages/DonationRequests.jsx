// Blood donation requests - the "donationrequests" collection from the DB design.
// Any logged-in user can post a request ("I need B+ in Surat").
// Everyone logged in sees the list with the requester's phone number,
// so a willing donor can call directly. The requester can mark it fulfilled.
//
// NEW: one-tap Call / WhatsApp links on every request (so reaching a
// requester takes one tap, not a manual copy-paste of their number), plus
// a Share button that opens WhatsApp with the request already written out -
// built for how blood requests actually spread in India, through WhatsApp
// family and neighbourhood groups.

import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Best-effort E.164-ish formatting for wa.me links: strip everything but
// digits, and assume a bare 10-digit number is Indian (+91) since that's
// the format this app's own seed data uses.
function toWhatsAppNumber(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

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

  const shareText = (r) =>
    `🩸 Blood needed: ${r.bloodGroupNeeded} in ${r.location}. If you can help, contact ${r.requesterId?.name} at ${r.requesterId?.phone}. Shared via LifeLink.`;

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
              <td>
                <div className="contact-actions">
                  <a className="small-button" href={`tel:${r.requesterId?.phone}`}>Call</a>
                  <a
                    className="small-button whatsapp"
                    href={`https://wa.me/${toWhatsAppNumber(r.requesterId?.phone)}?text=${encodeURIComponent(`Hi, I saw your LifeLink request for ${r.bloodGroupNeeded} in ${r.location}. I may be able to help.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp
                  </a>
                </div>
              </td>
              <td>{new Date(r.createdAt).toLocaleDateString('en-GB')}</td>
              <td>{r.status}</td>
              <td>
                <div className="request-row-actions">
                  {r.status === 'pending' && r.requesterId?._id === user?.id && (
                    <button className="small-button" onClick={() => handleFulfil(r._id)}>Mark Fulfilled</button>
                  )}
                  {r.status === 'pending' && (
                    <a
                      className="small-button share"
                      href={`https://wa.me/?text=${encodeURIComponent(shareText(r))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Forward this request to a WhatsApp contact or group"
                    >
                      Share →
                    </a>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {requests.length === 0 && <tr><td colSpan={7}>No requests yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
