const express = require('express');
const router = express.Router();
const { getEmergencyInfo } = require('../controllers/emergencyController');

// NOTE: no `protect` middleware here on purpose - this route must stay public.
router.get('/:userId', getEmergencyInfo);

module.exports = router;
