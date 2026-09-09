// Admin-only utilities.
// POST /api/admin/seed lets the admin reload all sample data from the
// dashboard with one click - no command line needed. It is protected by
// BOTH the JWT check and the adminOnly check, so normal users can't touch it.

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const runSeed = require('../seed/seedRunner');

router.post('/seed', protect, adminOnly, async (req, res) => {
  try {
    const counts = await runSeed();
    res.json({ message: 'Sample data loaded successfully', ...counts });
  } catch (error) {
    res.status(500).json({ message: 'Seeding failed', error: error.message });
  }
});

module.exports = router;
