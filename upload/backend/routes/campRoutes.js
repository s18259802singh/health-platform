const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  getCamps, getCampById, registerForCamp, cancelRegistration, getMyCamps, applyForCamp,
} = require('../controllers/campController');

// Browsing camps is public - people look for a camp before they sign up.
router.get('/', getCamps);

// NOTE: these must be declared BEFORE '/:id' or the word is read as an id.
router.get('/mine/list', protect, getMyCamps);

// Applying to run a camp. optionalAuth rather than protect: an HR officer or
// a student secretary organising one drive should not have to create a donor
// account to ask. If they happen to be signed in, the application is linked
// to them.
router.post('/apply', optionalAuth, applyForCamp);

router.get('/:id', getCampById);
router.post('/:id/register', protect, registerForCamp);
router.delete('/:id/register', protect, cancelRegistration);

module.exports = router;
