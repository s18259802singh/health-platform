const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { searchDonors } = require('../controllers/donorController');

router.get('/', protect, searchDonors);

module.exports = router;
