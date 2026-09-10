import { useEffect, useRef, useState } from 'react';
import api from '../api/axios';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/profile').then((res) => setProfile(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target; // "emergencyContactName" or "emergencyContactNumber"
    const key = name === 'emergencyContactName' ? 'name' : 'number';
    setProfile((prev) => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [key]: value } }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = {
        name: profile.name, phone: profile.phone, bloodGroup: profile.bloodGroup,
        allergies: profile.allergies, location: profile.location, isDonor: profile.isDonor,
        heightCm: profile.heightCm ?? '', weightKg: profile.weightKg ?? '',
        medicalConditions: profile.medicalConditions || '', medications: profile.medications || '',
        emergencyContactName: profile.emergencyContact.name,
        emergencyContactNumber: profile.emergencyContact.number,
      };
      const { data } = await api.put('/profile', payload);
      setProfile(data);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed.');
    }
  };

  // ---- EMERGENCY ID CARD ----
  // Draws a wallet-style emergency card on a hidden <canvas> (Pulse design:
  // dark maroon, glowing blood badge, ECG line, the user's QR) and downloads
  // it as a PNG. Everything happens in the browser - no backend involved.
  const cardRef = useRef(null);

  const downloadCard = () => {
    const canvas = cardRef.current;
    const ctx = canvas.getContext('2d');
    const W = 1000, H = 600;
    canvas.width = W; canvas.height = H;

    // background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#241017'); bg.addColorStop(1, '#130a0d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // soft red halo
    const halo = ctx.createRadialGradient(780, 140, 20, 780, 140, 330);
    halo.addColorStop(0, 'rgba(255,59,78,0.25)'); halo.addColorStop(1, 'rgba(255,59,78,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);

    // border
    ctx.strokeStyle = 'rgba(255,59,78,0.6)'; ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, W - 20, H - 20);

    // brand
    ctx.fillStyle = '#ff3b4e';
    ctx.beginPath(); ctx.arc(58, 62, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f7edeb'; ctx.font = 'bold 34px Arial';
    ctx.fillText('LifeLink', 84, 74);
    ctx.fillStyle = '#c9a8ad'; ctx.font = '20px Arial';
    ctx.fillText('EMERGENCY MEDICAL CARD', 84, 102);

    // ECG divider
    ctx.strokeStyle = 'rgba(255,59,78,0.7)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(40, 150);
    let x = 40;
    const seg = [[70,0],[10,-16],[8,34],[8,-44],[10,40],[8,-14],[80,0]];
    while (x < W - 300) {
      let y = 150;
      for (const [dx, dy] of seg) { x += dx; y += dy; ctx.lineTo(x, y); if (x > W - 300) break; }
    }
    ctx.lineTo(W - 300, 150); ctx.stroke();

    // blood group roundel
    const grad = ctx.createLinearGradient(120, 220, 220, 330);
    grad.addColorStop(0, '#ff5b6b'); grad.addColorStop(1, '#a3172b');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(255,59,78,0.8)'; ctx.shadowBlur = 40;
    ctx.beginPath(); ctx.arc(165, 280, 78, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 58px Arial'; ctx.textAlign = 'center';
    ctx.fillText(profile.bloodGroup, 165, 300);
    ctx.textAlign = 'left';

    // details
    const row = (label, value, y) => {
      ctx.fillStyle = '#c9a8ad'; ctx.font = 'bold 17px Arial';
      ctx.fillText(label.toUpperCase(), 290, y);
      ctx.fillStyle = '#f7edeb'; ctx.font = '26px Arial';
      ctx.fillText(String(value || '-').slice(0, 30), 290, y + 32);
    };
    row('Name', profile.name, 205);
    row('Allergies', profile.allergies || 'None', 275);
    row('Conditions', profile.medicalConditions || 'None declared', 345);
    row('Emergency contact', `${profile.emergencyContact?.name || '-'} · ${profile.emergencyContact?.number || ''}`, 415);
    const hw = [profile.heightCm ? `${profile.heightCm} cm` : null, profile.weightKg ? `${profile.weightKg} kg` : null].filter(Boolean).join(' · ');
    row('Height / Weight', hw || '-', 485);

    ctx.fillStyle = '#c9a8ad'; ctx.font = '16px Arial';
    ctx.fillText('Scan the QR code for live emergency details', 40, 555);

    const finish = () => {
      const a = document.createElement('a');
      a.download = 'lifelink-emergency-card.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };

    // QR (white plate so any scanner reads it)
    if (profile.qrCodePath) {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(742, 208, 216, 216);
        ctx.drawImage(img, 750, 216, 200, 200);
        finish();
      };
      img.onerror = finish;
      img.src = profile.qrCodePath;
    } else {
      finish();
    }
  };

  // ---- EMERGENCY LOCK-SCREEN WALLPAPER ----
  // Generates a phone wallpaper (1080x2340). Set it as your LOCK SCREEN and
  // your blood group, allergies and QR are visible to responders even while
  // the phone is locked. The top third is left clear for the clock.
  const downloadWallpaper = () => {
    const canvas = cardRef.current;
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 2340;
    canvas.width = W; canvas.height = H;

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#1d0e12'); bg.addColorStop(1, '#0e0709');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const halo = ctx.createRadialGradient(540, 1500, 60, 540, 1500, 700);
    halo.addColorStop(0, 'rgba(255,59,78,0.22)'); halo.addColorStop(1, 'rgba(255,59,78,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);

    // ECG divider under the clock zone
    ctx.strokeStyle = 'rgba(255,59,78,0.75)'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(60, 860);
    let x = 60;
    const seg = [[110,0],[16,-26],[13,54],[13,-70],[16,62],[13,-20],[130,0]];
    while (x < W - 60) {
      let y = 860;
      for (const [dx, dy] of seg) { x += dx; y += dy; if (x > W - 60) break; ctx.lineTo(x, y); }
    }
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#c9a8ad'; ctx.font = 'bold 40px Arial';
    ctx.fillText('E M E R G E N C Y   M E D I C A L   I N F O', 540, 960);

    // giant blood roundel
    const grad = ctx.createLinearGradient(380, 1050, 700, 1400);
    grad.addColorStop(0, '#ff5b6b'); grad.addColorStop(1, '#a3172b');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(255,59,78,0.85)'; ctx.shadowBlur = 90;
    ctx.beginPath(); ctx.arc(540, 1230, 190, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 150px Arial';
    ctx.fillText(profile.bloodGroup, 540, 1285);

    ctx.fillStyle = '#f7edeb'; ctx.font = 'bold 58px Arial';
    ctx.fillText(String(profile.name).slice(0, 22), 540, 1530);
    ctx.fillStyle = '#c9a8ad'; ctx.font = '42px Arial';
    ctx.fillText(`Allergies: ${(profile.allergies || 'None').slice(0, 26)}`, 540, 1600);
    if (profile.medicalConditions) {
      ctx.fillText(String(profile.medicalConditions).slice(0, 34), 540, 1665);
    }
    const hw2 = [profile.heightCm ? `${profile.heightCm} cm` : null, profile.weightKg ? `${profile.weightKg} kg` : null].filter(Boolean).join('  ·  ');
    if (hw2) ctx.fillText(hw2, 540, profile.medicalConditions ? 1725 : 1665);
    ctx.fillText(
      `${profile.emergencyContact?.name || ''}  ·  ${profile.emergencyContact?.number || ''}`.slice(0, 34),
      540, 1780
    );

    const finish = () => {
      ctx.fillStyle = '#c9a8ad'; ctx.font = '34px Arial';
      ctx.fillText('Scan for live emergency details', 540, 2180);
      ctx.textAlign = 'left';
      const a = document.createElement('a');
      a.download = 'lifelink-lockscreen.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };

    if (profile.qrCodePath) {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = '#fff';
        ctx.fillRect(390, 1790, 300, 300);
        ctx.drawImage(img, 402, 1802, 276, 276);
        finish();
      };
      img.onerror = finish;
      img.src = profile.qrCodePath;
    } else finish();
  };

  // ---- SCAN ALERTS ----
  // The backend logs a timestamp every time this user's public emergency page
  // is opened (i.e. their QR is scanned). Here we show it to the owner:
  // "know when your medical info was accessed".
  const formatScan = (d) => {
    const t = new Date(d);
    const now = new Date();
    const sameDay = t.toDateString() === now.toDateString();
    const yest = new Date(now); yest.setDate(now.getDate() - 1);
    const time = t.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    if (sameDay) return `Today · ${time}`;
    if (t.toDateString() === yest.toDateString()) return `Yesterday · ${time}`;
    return `${t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · ${time}`;
  };
  const scans = (profile?.qrScans || []).slice().reverse();

  // ---- DONATION TRACKER ----
  // Standard gap between whole-blood donations: 90 days.
  const GAP_DAYS = 90;
  const last = profile?.lastDonationDate ? new Date(profile.lastDonationDate) : null;
  const daysSince = last ? Math.floor((Date.now() - last.getTime()) / 86400000) : null;
  const daysLeft = last ? Math.max(0, GAP_DAYS - daysSince) : null;
  const progress = last ? Math.min(1, daysSince / GAP_DAYS) : 0;
  const RING = 2 * Math.PI * 52; // circumference for r=52

  const markDonated = async () => {
    if (!confirm('Record that you donated blood today?')) return;
    const { data } = await api.put('/profile', { lastDonationDate: new Date().toISOString() });
    setProfile(data);
  };

  const downloadCertificate = () => {
    const canvas = cardRef.current;
    const ctx = canvas.getContext('2d');
    const W = 1200, H = 850;
    canvas.width = W; canvas.height = H;
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#241017'); bg.addColorStop(1, '#130a0d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,59,78,0.7)'; ctx.lineWidth = 4;
    ctx.strokeRect(28, 28, W - 56, H - 56);
    ctx.strokeStyle = 'rgba(255,180,190,0.25)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(44, 44, W - 88, H - 88);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff3b4e';
    ctx.beginPath(); ctx.arc(600, 140, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f7edeb'; ctx.font = 'bold 30px Arial';
    ctx.fillText('LIFELINK', 600, 210);
    ctx.fillStyle = '#c9a8ad'; ctx.font = '24px Arial';
    ctx.fillText('CERTIFICATE OF APPRECIATION', 600, 252);

    ctx.fillStyle = '#c9a8ad'; ctx.font = '26px Arial';
    ctx.fillText('This certifies that', 600, 350);
    ctx.fillStyle = '#f7edeb'; ctx.font = 'bold 64px Arial';
    ctx.fillText(String(profile.name).slice(0, 24), 600, 435);
    ctx.fillStyle = '#c9a8ad'; ctx.font = '26px Arial';
    ctx.fillText(`(blood group ${profile.bloodGroup}) donated blood on`, 600, 495);
    ctx.fillStyle = '#ff3b4e'; ctx.font = 'bold 34px Arial';
    ctx.fillText(last ? last.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '', 600, 550);
    ctx.fillStyle = '#f7edeb'; ctx.font = 'italic 24px Arial';
    ctx.fillText('One donation can save up to three lives.', 600, 640);
    ctx.fillStyle = '#c9a8ad'; ctx.font = '20px Arial';
    ctx.fillText('LifeLink - Health Emergency & Blood Donor Platform', 600, 760);
    ctx.textAlign = 'left';

    const a = document.createElement('a');
    a.download = 'lifelink-donor-certificate.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="form-card">
      <h2>My Profile</h2>
      {message && <p className="hint">{message}</p>}
      <form onSubmit={handleSave}>
        <label>Full Name</label>
        <input name="name" value={profile.name} onChange={handleChange} required />

        <label>Phone</label>
        <input name="phone" value={profile.phone} onChange={handleChange} required />

        <label>Blood Group</label>
        <select name="bloodGroup" value={profile.bloodGroup} onChange={handleChange}>
          {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
        </select>

        <label>Allergies</label>
        <input name="allergies" value={profile.allergies} onChange={handleChange} />

        <label>Medical Conditions (optional - shown on your emergency page)</label>
        <input name="medicalConditions" value={profile.medicalConditions || ''} onChange={handleChange}
               placeholder="e.g. Diabetes (type 2), High BP, Thyroid, Asthma" />

        <label>Current Medications (optional)</label>
        <input name="medications" value={profile.medications || ''} onChange={handleChange}
               placeholder="e.g. Metformin, Amlodipine" />

        <div className="two-col">
          <div>
            <label>Height (cm, optional)</label>
            <input name="heightCm" type="number" min="0" value={profile.heightCm ?? ''} onChange={handleChange} placeholder="172" />
          </div>
          <div>
            <label>Weight (kg, optional)</label>
            <input name="weightKg" type="number" min="0" value={profile.weightKg ?? ''} onChange={handleChange} placeholder="68" />
          </div>
        </div>

        <label>City / Location</label>
        <input name="location" value={profile.location} onChange={handleChange} />

        <label>Emergency Contact Name</label>
        <input name="emergencyContactName" value={profile.emergencyContact.name} onChange={handleContactChange} />

        <label>Emergency Contact Number</label>
        <input name="emergencyContactNumber" value={profile.emergencyContact.number} onChange={handleContactChange} />

        <label className="checkbox-label">
          <input type="checkbox" name="isDonor" checked={profile.isDonor} onChange={handleChange} />
          I am willing to donate blood
        </label>

        <button type="submit">Save Changes</button>
      </form>

      <div className="qr-box">
        <h3>Your Emergency QR Code</h3>
        <p>Anyone who scans this sees only your blood group, allergies, and emergency contact - no login needed.</p>
                <img src={profile.qrCodePath} alt="Emergency QR Code" width="180" />
        <p><a href={profile.qrCodePath} download="emergency-qr.png">Download QR Code</a></p>

        <div className="download-row">
          <button type="button" className="card-button" onClick={downloadCard}>
            Download Emergency ID Card
          </button>
          <button type="button" className="card-button" onClick={downloadWallpaper}>
            Download Lock-Screen Wallpaper
          </button>
        </div>
        <p className="card-note">The ID card fits a wallet. The wallpaper is for your phone's LOCK SCREEN - responders can see your blood group and scan your QR even while your phone is locked.</p>
        <canvas ref={cardRef} style={{ display: 'none' }} />

        <div className="donation-tracker">
          <h3>Donation Tracker</h3>
          {!last ? (
            <>
              <p className="card-note">Donated recently? Record it and we'll count down the 90 days until you can safely donate again.</p>
              <button type="button" className="card-button" onClick={markDonated}>I donated today</button>
            </>
          ) : (
            <div className="tracker-row">
              <svg viewBox="0 0 120 120" className="tracker-ring" role="img" aria-label="Donation countdown">
                <circle cx="60" cy="60" r="52" className="ring-bg" />
                <circle
                  cx="60" cy="60" r="52" className="ring-fg"
                  strokeDasharray={RING}
                  strokeDashoffset={RING * (1 - progress)}
                />
                <text x="60" y="56" className="ring-num">{daysLeft === 0 ? '✓' : daysLeft}</text>
                <text x="60" y="76" className="ring-sub">{daysLeft === 0 ? 'eligible' : 'days left'}</text>
              </svg>
              <div>
                <p className="tracker-text">
                  {daysLeft === 0
                    ? 'You are eligible to donate again - find a request that needs you!'
                    : `Last donation: ${last.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}. You can donate again in ${daysLeft} days.`}
                </p>
                <div className="download-row">
                  <button type="button" className="small-button" onClick={downloadCertificate}>Download Certificate</button>
                  <button type="button" className="small-button" onClick={markDonated}>I donated again today</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="scan-alerts">
          <h3>Scan Alerts</h3>
          {scans.length === 0 ? (
            <p className="card-note">No one has scanned your QR yet. Every scan of your emergency page is logged here, so you always know when your medical info was accessed.</p>
          ) : (
            <>
              <p className="scan-summary">
                Your emergency info was accessed <strong>{scans.length}{scans.length === 20 ? '+' : ''} time{scans.length === 1 ? '' : 's'}</strong> — last: <strong>{formatScan(scans[0])}</strong>
              </p>
              <ul className="scan-list">
                {scans.slice(0, 5).map((d, i) => <li key={i}>{formatScan(d)}</li>)}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
