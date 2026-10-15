// Guards every page inside /admin. No admin token -> bounce to /admin/login.
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminRoute({ children }) {
  const { admin } = useAdminAuth();
  const location = useLocation();

  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
