const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { bookAppointment, getMyAppointments, cancelAppointment } = require('../controllers/appointmentController');

router.post('/', protect, bookAppointment);
router.get('/my', protect, getMyAppointments);
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;
