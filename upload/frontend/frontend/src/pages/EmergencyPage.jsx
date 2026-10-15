// This page is PUBLIC - it is what opens when someone scans a user's QR code.
// It uses the shared `api` instance only for its base URL (localhost in dev,
// VITE_API_URL on Vercel). The backend route itself has no JWT check on
// purpose - a stranger scanning the QR has no account.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function EmergencyPage() {
  const { userId } = useParams();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/emergency/${userId}`)
      .then((res) => setInfo(res.data))
      .catch(() => setError('No emergency record found for this QR code.'));
  }, [userId]);

  if (error) return <div className="emergency-card"><p className="error-text">{error}</p></div>;
  if (!info) return <p>Loading...</p>;

  return (
    <div className="emergency-card">
      <h2>Emergency Medical Information</h2>
      <p className="emergency-sub">Scanned from QR code - no login required</p>
      <div className="emergency-row"><span>Name</span><strong>{info.name}</strong></div>
      <div className="emergency-row"><span>Blood Group</span><strong className="blood-badge">{info.bloodGroup}</strong></div>
      <div className="emergency-row"><span>Allergies</span><strong>{info.allergies}</strong></div>
      <div className="emergency-row"><span>Emergency Contact</span><strong>{info.emergencyContact.name} - {info.emergencyContact.number}</strong></div>
    </div>
  );
}
