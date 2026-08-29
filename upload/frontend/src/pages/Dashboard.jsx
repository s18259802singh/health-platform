// Simple role-based dashboard: admin sees admin-focused links, regular user sees their own.

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <h2>Welcome, {user?.name}</h2>
      <p>Role: {user?.role === 'admin' ? 'Administrator' : 'User'}</p>

      <div className="dashboard-grid">
        <Link to="/profile" className="dashboard-card">My Profile & Emergency QR</Link>
        <Link to="/donors" className="dashboard-card">Search Blood Donors</Link>
        <Link to="/hospitals" className="dashboard-card">Hospitals & Blood Banks</Link>
        <Link to="/appointments" className="dashboard-card">Doctor Appointments</Link>
        {user?.role === 'admin' && (
          <Link to="/hospitals" className="dashboard-card admin-card">Manage Hospitals (Admin)</Link>
        )}
      </div>
    </div>
  );
}
