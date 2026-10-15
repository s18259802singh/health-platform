const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getBloodSupply } = require('../controllers/statsController');

router.get('/blood-supply', protect, getBloodSupply);

module.exports = router;
