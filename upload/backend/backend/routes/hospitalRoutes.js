const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getHospitals, addHospital, updateHospital, deleteHospital } = require('../controllers/hospitalController');

router.get('/', protect, getHospitals);
router.post('/', protect, adminOnly, addHospital);
router.put('/:id', protect, adminOnly, updateHospital);
router.delete('/:id', protect, adminOnly, deleteHospital);

module.exports = router;
