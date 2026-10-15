// One camp: full details, live slot counter, and register / cancel.

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CampDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [camp, setCamp] = useState(null);
  const [myCamps, setMyCamps] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get(`/camps/${id}`)
      .then((res) => setCamp(res.data))
      .catch(() => setError('Camp not found.'));
    if (user) {
      api.get('/camps/mine/list').then((res) => setMyCamps(res.data)).catch(() => {});
    }
  };

  useEffect(load, [id, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const registered = myCamps.some((c) => String(c._id) === String(id));

  const act = async (register) => {
    setBusy(true);
    setMessage('');
    try {
      if (register) {
        await api.post(`/camps/${id}/register`);
        setMessage('You are registered. Bring photo ID on the day.');
      } else {
        await api.delete(`/camps/${id}/register`);
        setMessage('Your registration has been cancelled.');
      }
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  if (error) return <div className="page"><p className="error-text">{error}</p><Link to="/camps">← All camps</Link></div>;
  if (!camp) return <p className="hint">Loading camp…</p>;

  const taken = camp.registrations?.length || 0;
  const left = Math.max(0, (camp.slots || 0) - taken);
  const dateLabel = new Date(`${camp.date}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="page camp-detail">
      <Link to="/camps" className="blog-back">← All camps</Link>

      <div className="camp-hero">
        <div>
          <span className={`camp-pill ${camp.status !== 'upcoming' ? 'done' : left === 0 ? 'full' : ''}`}>
            {camp.status === 'upcoming' ? (left === 0 ? 'Fully booked' : `${left} of ${camp.slots} slots left`) : camp.status}
          </span>
          <h2>{camp.title}</h2>
          <p className="camp-org">Organised by {camp.organiser}</p>
        </div>
      </div>

      <div className="camp-facts">
        <div><span>Date</span><strong>{dateLabel}</strong></div>
        <div><span>Time</span><strong>{camp.startTime} – {camp.endTime}</strong></div>
        <div><span>Venue</span><strong>{camp.venue}</strong></div>
        <div><span>City</span><strong>{camp.city}{camp.state ? `, ${camp.state}` : ''}</strong></div>
        {camp.contactNumber && <div><span>Contact</span><strong><a href={`tel:${camp.contactNumber}`}>{camp.contactNumber}</a></strong></div>}
        <div><span>Registered</span><strong>{taken} donors</strong></div>
      </div>

      {camp.description && (
        <div className="camp-description">
          {camp.description.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}

      <div className="camp-actions">
        {message && <p className="hint camp-message">{message}</p>}

        {camp.status !== 'upcoming' ? (
          <p className="hint">This camp has finished. Browse upcoming camps instead.</p>
        ) : !user ? (
          <>
            <Link to="/register" className="btn-primary">Create an account to register</Link>
            <Link to="/login" className="btn-secondary">I already have one</Link>
          </>
        ) : registered ? (
          <>
            <span className="camp-confirmed">✓ You are registered for this camp</span>
            <button type="button" className="btn-secondary" onClick={() => act(false)} disabled={busy}>
              {busy ? 'Working…' : 'Cancel my registration'}
            </button>
          </>
        ) : (
          <button type="button" className="btn-primary" onClick={() => act(true)} disabled={busy || left === 0}>
            {left === 0 ? 'Fully booked' : busy ? 'Registering…' : 'Register for this camp'}
          </button>
        )}

        <a
          className="small-button"
          target="_blank" rel="noopener noreferrer"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${camp.venue}, ${camp.city}`)}`}
        >
          Directions →
        </a>
      </div>

      <p className="portal-note">
        Bring photo identification. Eat a proper meal and drink water beforehand.
        Eligibility is confirmed by the doctor at the camp on the day.
      </p>
    </div>
  );
}
