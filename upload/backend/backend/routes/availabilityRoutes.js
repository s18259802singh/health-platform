const express = require('express');
const router = express.Router();
const { getRegions, searchAvailability } = require('../controllers/availabilityController');

// Both PUBLIC on purpose - an emergency search must not need an account.
router.get('/regions', getRegions);
router.get('/', searchAvailability);

module.exports = router;
