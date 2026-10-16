const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCamps, getCampById, registerForCamp, cancelRegistration, getMyCamps } = require('../controllers/campController');

// Browsing camps is public - people look for a camp before they sign up.
router.get('/', getCamps);

// NOTE: this must be declared BEFORE '/:id' or "mine" is read as an id.
router.get('/mine/list', protect, getMyCamps);

router.get('/:id', getCampById);
router.post('/:id/register', protect, registerForCamp);
router.delete('/:id/register', protect, cancelRegistration);

module.exports = router;
