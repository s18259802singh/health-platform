import { useEffect, useState } from 'react';
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
      </div>
    </div>
  );
}
