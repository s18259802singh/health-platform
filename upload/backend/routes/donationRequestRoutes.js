const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createRequest, getRequests, fulfilRequest, cancelRequest } = require('../controllers/donationRequestController');

router.post('/', protect, createRequest);
router.get('/', protect, getRequests);
router.put('/:id/fulfil', protect, fulfilRequest);
router.put('/:id/cancel', protect, cancelRequest);

module.exports = router;
