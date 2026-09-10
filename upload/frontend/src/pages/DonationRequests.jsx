// Blood donation requests - the "donationrequests" collection from the DB design.
// Any logged-in user can post a request ("I need B+ in Surat").
// Everyone logged in sees the list with the requester's phone number,
// so a willing donor can call directly. The requester can mark it fulfilled.

import { useEffect, useRef, useState } from 'react';
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

  // ---- WHATSAPP POSTER ----
  // Urgent blood requests in India spread as WhatsApp status images.
  // One click turns a request into a designed, share-ready poster (1080x1350).
  const posterRef = useRef(null);
  const downloadPoster = (r) => {
    const canvas = posterRef.current;
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1350;
    canvas.width = W; canvas.height = H;

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#2a1219'); bg.addColorStop(1, '#120a0d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const halo = ctx.createRadialGradient(540, 560, 40, 540, 560, 520);
    halo.addColorStop(0, 'rgba(255,59,78,0.3)'); halo.addColorStop(1, 'rgba(255,59,78,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,59,78,0.8)'; ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, W - 48, H - 48);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff3b4e'; ctx.font = 'bold 76px Arial';
    ctx.fillText('URGENT', 540, 170);
    ctx.fillStyle = '#f7edeb'; ctx.font = 'bold 58px Arial';
    ctx.fillText('BLOOD NEEDED', 540, 245);

    const grad = ctx.createLinearGradient(360, 380, 720, 760);
    grad.addColorStop(0, '#ff5b6b'); grad.addColorStop(1, '#a3172b');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(255,59,78,0.9)'; ctx.shadowBlur = 80;
    ctx.beginPath(); ctx.arc(540, 570, 200, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 170px Arial';
    ctx.fillText(r.bloodGroupNeeded, 540, 630);

    ctx.fillStyle = '#f7edeb'; ctx.font = 'bold 60px Arial';
    ctx.fillText(String(r.location).slice(0, 22), 540, 880);

    ctx.fillStyle = '#c9a8ad'; ctx.font = '42px Arial';
    ctx.fillText('Contact', 540, 975);
    ctx.fillStyle = '#f7edeb'; ctx.font = 'bold 62px Arial';
    ctx.fillText(`${r.requesterId?.name || ''}`.slice(0, 22), 540, 1045);
    ctx.font = 'bold 70px Arial';
    ctx.fillText(`${r.requesterId?.phone || ''}`, 540, 1130);

    // ECG footer
    ctx.strokeStyle = 'rgba(255,59,78,0.7)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(80, 1240);
    let x = 80;
    const seg = [[100,0],[14,-24],[12,48],[12,-62],[14,54],[12,-16],[110,0]];
    while (x < W - 80) {
      let y = 1240;
      for (const [dx, dy] of seg) { x += dx; y += dy; if (x > W - 80) break; ctx.lineTo(x, y); }
    }
    ctx.stroke();
    ctx.fillStyle = '#c9a8ad'; ctx.font = '30px Arial';
    ctx.fillText('Posted via LifeLink - Health & Blood Donor Platform', 540, 1300);
    ctx.textAlign = 'left';

    const a = document.createElement('a');
    a.download = `blood-request-${r.bloodGroupNeeded.replace('+','pos').replace('-','neg')}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
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
                {r.status === 'pending' && (
                  <button className="small-button" onClick={() => downloadPoster(r)}>Poster</button>
                )}
                {r.status === 'pending' && r.requesterId?._id === user?.id && (
                  <button className="small-button" onClick={() => handleFulfil(r._id)}>Mark Fulfilled</button>
                )}
              </td>
            </tr>
          ))}
          {requests.length === 0 && <tr><td colSpan={7}>No requests yet.</td></tr>}
        </tbody>
      </table>
      <canvas ref={posterRef} style={{ display: 'none' }} />
    </div>
  );
}
