import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', bloodGroup: 'O+',
    allergies: '', emergencyContactName: '', emergencyContactNumber: '',
    isDonor: false, location: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="form-card">
      <h2>Create Account</h2>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} required />

        <label>Blood Group</label>
        <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
          {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
        </select>

        <label>Allergies (if any)</label>
        <input name="allergies" value={form.allergies} onChange={handleChange} placeholder="e.g. Penicillin, or leave blank" />

        <label>City / Location</label>
        <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Surat" />

        <label>Emergency Contact Name</label>
        <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} required />

        <label>Emergency Contact Number</label>
        <input name="emergencyContactNumber" value={form.emergencyContactNumber} onChange={handleChange} required />

        <label className="checkbox-label">
          <input type="checkbox" name="isDonor" checked={form.isDonor} onChange={handleChange} />
          I am willing to donate blood
        </label>

        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
