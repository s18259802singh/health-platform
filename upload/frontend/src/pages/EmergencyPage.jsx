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

  // ---- READ ALOUD ----
  // In a real emergency the helper's hands are busy. One tap and the phone
  // speaks the medical details out loud using the browser's speech engine.
  const [speaking, setSpeaking] = useState(false);
  const readAloud = () => {
    if (!('speechSynthesis' in window) || !info) return;
    window.speechSynthesis.cancel();
    const text =
      `Emergency medical information. Name: ${info.name}. ` +
      `Blood group: ${info.bloodGroup.replace('+', ' positive').replace('-', ' negative')}. ` +
      `Allergies: ${info.allergies || 'none'}. ` +
      `Emergency contact: ${info.emergencyContact.name}, phone ${info.emergencyContact.number.split('').join(' ')}.`;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

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
      <div className="emergency-row">
        <button type="button" className={`speak-button ${speaking ? 'speaking' : ''}`} onClick={readAloud}>
          {speaking ? 'Speaking...' : 'Read Aloud'}
        </button>
        <a className="call-button" href={`tel:${info.emergencyContact.number}`}>Call Contact</a>
      </div>
    </div>
  );
}
