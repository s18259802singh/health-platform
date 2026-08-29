const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getDoctors, addDoctor } = require('../controllers/doctorController');

router.get('/', protect, getDoctors);
router.post('/', protect, adminOnly, addDoctor);

module.exports = router;
