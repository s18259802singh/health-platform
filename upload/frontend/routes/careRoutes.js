const express = require('express');
const { getOptions, findNear } = require('../controllers/careController');

// Deliberately public, like the availability search: somebody looking for the
// nearest blood bank in an emergency should not have to register first.
const router = express.Router();
router.get('/options', getOptions);
router.get('/near', findNear);
module.exports = router;
