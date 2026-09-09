const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createRequest, getRequests, fulfilRequest } = require('../controllers/donationRequestController');

router.post('/', protect, createRequest);
router.get('/', protect, getRequests);
router.put('/:id/fulfil', protect, fulfilRequest);

module.exports = router;
