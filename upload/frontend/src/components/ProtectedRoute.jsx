// Wraps any page that should only be visible to a logged-in user.
// If nobody is logged in, it redirects to the login page instead.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();

  // Remember where they were trying to go. "Find care near me" is public, so
  // somebody can pick a doctor and a time slot before they have an account —
  // sending them to a bare dashboard after signing in would throw that away
  // and make them choose all over again.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
}
