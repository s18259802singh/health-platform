const express = require('express');
const { postMessage, getThread, getMine } = require('../controllers/supportController');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Chatting is deliberately open: somebody stuck on the availability page at
// 2am should not have to register before they can ask a question.
router.post('/', optionalAuth, postMessage);
router.get('/mine', protect, getMine);
router.get('/thread/:key', getThread);

module.exports = router;
