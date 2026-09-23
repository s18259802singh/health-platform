// Admin-only utilities.
// POST /api/admin/seed lets the admin reload all sample data from the
// dashboard with one click - no command line needed. It is protected by
// BOTH the JWT check and the adminOnly check, so normal users can't touch it.

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const runSeed = require('../seed/seedRunner');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const DonationRequest = require('../models/DonationRequest');
const Blog = require('../models/Blog');

// GET /api/admin/overview - live platform counts for the admin dashboard.
router.get('/overview', protect, adminOnly, async (req, res) => {
  try {
    const [users, donors, hospitals, doctors, appointments, requests, pendingRequests, blogs] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ isDonor: true }),
        Hospital.countDocuments(),
        Doctor.countDocuments(),
        Appointment.countDocuments(),
        DonationRequest.countDocuments(),
        DonationRequest.countDocuments({ status: 'pending' }),
        Blog.countDocuments(),
      ]);
    res.json({ users, donors, hospitals, doctors, appointments, requests, pendingRequests, blogs });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/admin/users - user list for the admin panel (never includes passwords).
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('name email phone bloodGroup isDonor location role createdAt')
      .sort({ createdAt: -1 })
      .limit(300);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/seed', protect, adminOnly, async (req, res) => {
  try {
    const counts = await runSeed();
    res.json({ message: 'Sample data loaded successfully', ...counts });
  } catch (error) {
    res.status(500).json({ message: 'Seeding failed', error: error.message });
  }
});

module.exports = router;
