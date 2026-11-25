const express = require('express');
const router = express.Router();
const { getGuides, getGuideById } = require('../controllers/contentController');

router.get('/', getGuides);
router.get('/:id', getGuideById);

module.exports = router;
