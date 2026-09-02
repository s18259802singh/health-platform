import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ACTIONS = [
  { to: '/donors', icon: '🔍', label: 'Find Donor' },
  { to: '/appointments', icon: '🩸', label: 'Appointments' },
  { to: '/hospitals', icon: '🏥', label: 'Hospitals' },
  { to: '/profile', icon: '👤', label: 'My Profile' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page app-dashboard">
      <p className="app-eyebrow">Welcome back</p>
      <h2 className="app-heading">{user?.name} 👋</h2>
      <p className="app-subtext">
        {user?.role === 'admin' ? 'Administrator' : 'Every donation you make could save a life.'}
      </p>

      <div className="action-row">
        {ACTIONS.map((a) => (
          <Link to={a.to} key={a.to} className="action-badge">
            <span className="action-icon">{a.icon}</span>
            <span>{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="banner-card">
        <div className="banner-text">
          <span className="banner-tag">Blood Donation Drive</span>
          <h3>15 minutes is all it takes to save someone's life.</h3>
          <Link to="/appointments" className="banner-button">Book a slot</Link>
        </div>
      </div>

      <div className="section-header">
        <h3>Our Impact</h3>
      </div>
      <div className="stats-row">
        <div className="stat-box">
          <strong>2,400+</strong>
          <span>Registered Donors</span>
        </div>
        <div className="stat-box">
          <strong>850+</strong>
          <span>Lives Saved</span>
        </div>
        <div className="stat-box">
          <strong>60+</strong>
          <span>Partner Hospitals</span>
        </div>
      </div>

      <div className="section-header">
        <h3>Quick Links</h3>
      </div>
      <div className="info-card">
        <div className="info-card-icon">🏥</div>
        <div>
          <strong>Find nearby hospitals & blood banks</strong>
          <p>Check availability before you head out.</p>
        </div>
        <Link to="/hospitals" className="small-button">Open</Link>
      </div>
      <div className="info-card">
        <div className="info-card-icon">🩸</div>
        <div>
          <strong>Search for compatible donors</strong>
          <p>Filter by blood group and city.</p>
        </div>
        <Link to="/donors" className="small-button">Open</Link>
      </div>

      {user?.role === 'admin' && (
        <>
          <div className="section-header"><h3>Admin</h3></div>
          <div className="info-card">
            <div className="info-card-icon">⚙️</div>
            <div>
              <strong>Manage hospitals</strong>
              <p>Add, edit, or remove hospital listings.</p>
            </div>
            <Link to="/hospitals" className="small-button">Manage</Link>
          </div>
        </>
      )}
    </div>
  );
}
