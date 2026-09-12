import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TourProvider } from './context/TourContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import GuidedTour from './components/GuidedTour';
import HelpFab from './components/HelpFab';

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

export default function App() {
  return (
    <AuthProvider>
      <TourProvider>
        <BrowserRouter>
          <Navbar />
          <main className="container">
            <Routes>
              {/* Public routes - no login needed */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/emergency/:userId" element={<EmergencyPage />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:id" element={<BlogPost />} />
              <Route path="/" element={<Login />} />

              {/* Protected routes - login required */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/donors" element={<ProtectedRoute><DonorSearch /></ProtectedRoute>} />
              <Route path="/hospitals" element={<ProtectedRoute><Hospitals /></ProtectedRoute>} />
              <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
              <Route path="/requests" element={<ProtectedRoute><DonationRequests /></ProtectedRoute>} />
            </Routes>
          </main>
          <BottomNav />
          <GuidedTour />
          <HelpFab />
        </BrowserRouter>
      </TourProvider>
    </AuthProvider>
  );
}
