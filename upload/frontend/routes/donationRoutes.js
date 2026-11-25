const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getLeaderboard, getMyDonations, getCertificate } = require('../controllers/donationController');

router.get('/leaderboard', getLeaderboard);          // PUBLIC
router.get('/mine', protect, getMyDonations);
router.get('/:id/certificate', protect, getCertificate);

module.exports = router;
