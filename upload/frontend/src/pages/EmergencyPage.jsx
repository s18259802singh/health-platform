// This page is PUBLIC - it is what opens when someone scans a user's QR code.
// It uses the shared `api` instance only for its base URL (localhost in dev,
// VITE_API_URL on Vercel). The backend route itself has no JWT check on
// purpose - a stranger scanning the QR has no account.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { LanguageToggle, useLang } from '../i18n';

export default function EmergencyPage() {
  const { userId } = useParams();
  const { t } = useLang();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/emergency/${userId}`)
      .then((res) => setInfo(res.data))
      .catch(() => setError('No emergency record found for this QR code.'));
  }, [userId]);

  // ---- BEACON MODE ----
  // Turns the phone into a pulsing red beacon with the blood group readable
  // from across a room - for attracting help in a crowd or at night.
  // Slow, gentle pulse on purpose (not a strobe). Tap anywhere to exit.
  const [beacon, setBeacon] = useState(false);
  const startBeacon = () => {
    setBeacon(true);
    document.documentElement.requestFullscreen?.().catch(() => {});
  };
  const stopBeacon = () => {
    setBeacon(false);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  };

  if (error) return <div className="emergency-card"><p className="error-text">{error}</p></div>;
  if (!info) return <p>Loading...</p>;

  return (
    <div className="emergency-card">
      <h2>{t('emTitle')}</h2>
      <p className="emergency-sub">{t('emSub')}</p>
      <div className="emergency-row"><LanguageToggle /></div>
      <div className="emergency-row"><span>{t('name')}</span><strong>{info.name}</strong></div>
      <div className="emergency-row"><span>{t('bloodGroup')}</span><strong className="blood-badge">{info.bloodGroup}</strong></div>
      <div className="emergency-row"><span>{t('allergies')}</span><strong>{info.allergies}</strong></div>
      {info.medicalConditions && (
        <div className="emergency-row"><span>{t('conditions')}</span><strong>{info.medicalConditions}</strong></div>
      )}
      {info.medications && (
        <div className="emergency-row"><span>{t('medications')}</span><strong>{info.medications}</strong></div>
      )}
      {(info.heightCm || info.weightKg) && (
        <div className="emergency-row"><span>{t('heightWeight')}</span>
          <strong>{[info.heightCm ? `${info.heightCm} cm` : null, info.weightKg ? `${info.weightKg} kg` : null].filter(Boolean).join(' · ')}</strong>
        </div>
      )}
      <div className="emergency-row"><span>{t('emContact')}</span><strong>{info.emergencyContact.name} - {info.emergencyContact.number}</strong></div>
      <div className="emergency-row">
        <a className="call-button solo" href={`tel:${info.emergencyContact.number}`}>{t('callContact')}</a>
      </div>
      <div className="emergency-row">
        <button type="button" className="beacon-button" onClick={startBeacon}>
          {t('beacon')}
        </button>
      </div>

      {beacon && (
        <div className="beacon-overlay" onClick={stopBeacon} role="button" aria-label="Exit beacon mode">
          <span className="beacon-label">{t('needsHelp')}</span>
          <span className="beacon-group">{info.bloodGroup}</span>
          <span className="beacon-name">{info.name}</span>
          {info.medicalConditions && <span className="beacon-cond">{info.medicalConditions}</span>}
          <span className="beacon-exit">{t('tapExit')}</span>
        </div>
      )}
    </div>
  );
}
