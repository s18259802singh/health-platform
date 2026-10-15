// ============================================================================
// ROUTING
// ----------------------------------------------------------------------------
//   /...        the public LifeLink site + member area  (SiteLayout)
//   /admin/...  the administrator console               (AdminLayout)
//
// Two separate experiences: own layouts, own auth contexts, own API clients
// and own tokens. Nothing from one shell renders inside the other.
// ============================================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { TourProvider } from './context/TourContext';
import SiteLayout from './components/SiteLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import DonorSearch from './pages/DonorSearch';
import Hospitals from './pages/Hospitals';
import Appointments from './pages/Appointments';
import EmergencyPage from './pages/EmergencyPage';
import Blogs from './pages/Blogs';
import BlogPost from './pages/BlogPost';
import DonationRequests from './pages/DonationRequests';
import Availability from './pages/Availability';
import Camps from './pages/Camps';
import CampDetail from './pages/CampDetail';
import Stories from './pages/Stories';
import StoryDetail from './pages/StoryDetail';
import Guides from './pages/Guides';
import GuideDetail from './pages/GuideDetail';
import Leaderboard from './pages/Leaderboard';
import MyDonations from './pages/MyDonations';
import NotFound from './pages/NotFound';

import { AdminAuthProvider } from './admin/AdminAuthContext';
import { ToastProvider } from './admin/components/Toast';
import AdminRoute from './admin/AdminRoute';
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminOverview from './admin/pages/Overview';
import AdminUsers from './admin/pages/Users';
import AdminHospitals from './admin/pages/Hospitals';
import AdminDoctors from './admin/pages/Doctors';
import AdminBlogs from './admin/pages/Blogs';
import AdminRequests from './admin/pages/Requests';
import AdminAppointments from './admin/pages/Appointments';
import AdminCamps from './admin/pages/Camps';
import AdminStories from './admin/pages/Stories';
import AdminGuides from './admin/pages/Guides';
import AdminDonations from './admin/pages/Donations';
import AdminSettings from './admin/pages/Settings';
import './admin/admin.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ----------------------- ADMIN CONSOLE ----------------------- */}
        <Route
          path="/admin/*"
          element={(
            <AdminAuthProvider>
              <ToastProvider>
                <Routes>
                  <Route path="login" element={<AdminLogin />} />
                  <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<AdminOverview />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="requests" element={<AdminRequests />} />
                    <Route path="appointments" element={<AdminAppointments />} />
                    <Route path="camps" element={<AdminCamps />} />
                    <Route path="donations" element={<AdminDonations />} />
                    <Route path="hospitals" element={<AdminHospitals />} />
                    <Route path="doctors" element={<AdminDoctors />} />
                    <Route path="stories" element={<AdminStories />} />
                    <Route path="guides" element={<AdminGuides />} />
                    <Route path="blogs" element={<AdminBlogs />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </Route>
                </Routes>
              </ToastProvider>
            </AdminAuthProvider>
          )}
        />

        {/* ------------------- PUBLIC SITE + MEMBER AREA ------------------- */}
        <Route
          path="/*"
          element={(
            <AuthProvider>
              <TourProvider>
                <Routes>
                  <Route element={<SiteLayout />}>
                    {/* public */}
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="emergency/:userId" element={<EmergencyPage />} />
                    <Route path="availability" element={<Availability />} />
                    <Route path="camps" element={<Camps />} />
                    <Route path="camps/:id" element={<CampDetail />} />
                    <Route path="stories" element={<Stories />} />
                    <Route path="stories/:id" element={<StoryDetail />} />
                    <Route path="guides" element={<Guides />} />
                    <Route path="guides/:id" element={<GuideDetail />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                    <Route path="blogs" element={<Blogs />} />
                    <Route path="blogs/:id" element={<BlogPost />} />

                    {/* members only */}
                    <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="my-donations" element={<ProtectedRoute><MyDonations /></ProtectedRoute>} />
                    <Route path="donors" element={<ProtectedRoute><DonorSearch /></ProtectedRoute>} />
                    <Route path="hospitals" element={<ProtectedRoute><Hospitals /></ProtectedRoute>} />
                    <Route path="appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
                    <Route path="requests" element={<ProtectedRoute><DonationRequests /></ProtectedRoute>} />

                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </TourProvider>
            </AuthProvider>
          )}
        />
      </Routes>
    </BrowserRouter>
  );
}
