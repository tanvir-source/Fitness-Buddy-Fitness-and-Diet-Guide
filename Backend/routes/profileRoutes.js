const express = require('express');
const router = express.Router();
const { updateProfile, getHealthStats } = require('../controllers/profileController');

router.post('/', updateProfile);
router.get('/', getHealthStats);

module.exports = router;