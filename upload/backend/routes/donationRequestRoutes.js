const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createRequest, getRequests, fulfilRequest, respondToRequest } = require('../controllers/donationRequestController');

router.post('/', protect, createRequest);
router.get('/', protect, getRequests);
router.put('/:id/fulfil', protect, fulfilRequest);
router.put('/:id/respond', protect, respondToRequest);

module.exports = router;
