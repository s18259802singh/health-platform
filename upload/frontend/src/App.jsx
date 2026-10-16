// ============================================================================
// ROUTING
// ----------------------------------------------------------------------------
//   /...        the public LifeLink site + member area  (SiteLayout)
//   /admin/...  the administrator console               (AdminLayout)
//
// Two separate experiences: own layouts, own auth contexts, own API clients
// and own tokens. Nothing from one shell renders inside the other.
// ============================================================================

import { lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DEMO } from './api/axios';

// Static hosts cannot rewrite unknown paths to index.html, so the standalone
// demo build routes on the hash instead.
const Router = DEMO ? HashRouter : BrowserRouter;

import { AuthProvider } from './context/AuthContext';
import { TourProvider } from './context/TourContext';
import SiteLayout from './components/SiteLayout';
import ProtectedRoute from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const DonorSearch = lazy(() => import('./pages/DonorSearch'));
const Hospitals = lazy(() => import('./pages/Hospitals'));
const Appointments = lazy(() => import('./pages/Appointments'));
const EmergencyPage = lazy(() => import('./pages/EmergencyPage'));
const Blogs = lazy(() => import('./pages/Blogs'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const DonationRequests = lazy(() => import('./pages/DonationRequests'));
const Availability = lazy(() => import('./pages/Availability'));
const Camps = lazy(() => import('./pages/Camps'));
const CampDetail = lazy(() => import('./pages/CampDetail'));
const Stories = lazy(() => import('./pages/Stories'));
const StoryDetail = lazy(() => import('./pages/StoryDetail'));
const Guides = lazy(() => import('./pages/Guides'));
const GuideDetail = lazy(() => import('./pages/GuideDetail'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const MyDonations = lazy(() => import('./pages/MyDonations'));
const NotFound = lazy(() => import('./pages/NotFound'));

import { AdminAuthProvider } from './admin/AdminAuthContext';
import { ToastProvider } from './admin/components/Toast';
import AdminRoute from './admin/AdminRoute';
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const AdminOverview = lazy(() => import('./admin/pages/Overview'));
const AdminUsers = lazy(() => import('./admin/pages/Users'));
const AdminHospitals = lazy(() => import('./admin/pages/Hospitals'));
const AdminDoctors = lazy(() => import('./admin/pages/Doctors'));
const AdminBlogs = lazy(() => import('./admin/pages/Blogs'));
const AdminRequests = lazy(() => import('./admin/pages/Requests'));
const AdminAppointments = lazy(() => import('./admin/pages/Appointments'));
const AdminCamps = lazy(() => import('./admin/pages/Camps'));
const AdminStories = lazy(() => import('./admin/pages/Stories'));
const AdminGuides = lazy(() => import('./admin/pages/Guides'));
const AdminDonations = lazy(() => import('./admin/pages/Donations'));
const AdminSettings = lazy(() => import('./admin/pages/Settings'));


// Shown for the moment a route's code is in flight. Deliberately quiet: a
// spinner that flashes for 80ms is worse than a blank space.
function RouteFallback() {
  return <div className="route-loading" role="status" aria-live="polite"><span /></div>;
}

export default function App() {
  return (
    <Router>
      {/* Every page below is loaded on demand. The landing page used to ship
          the whole site — all 22 public pages plus the entire admin console —
          in one bundle before it could render a single pixel. */}
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
    </Router>
  );
}
