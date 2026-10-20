const express = require('express');
const router = express.Router();
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const {
  getHospitals, getHospital, addHospital, updateHospital, deleteHospital,
} = require('../controllers/hospitalController');

router.get('/', protect, getHospitals);
// One centre's own page. optionalAuth rather than protect: the name, address
// and recorded stock are already public through /api/availability, and the
// controller only attaches the doctor list when a member is signed in.
router.get('/:id', optionalAuth, getHospital);
router.post('/', protect, adminOnly, addHospital);
router.put('/:id', protect, adminOnly, updateHospital);
router.delete('/:id', protect, adminOnly, deleteHospital);

module.exports = router;
