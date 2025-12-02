const express = require('express');
const router = express.Router();
const { addSteps, getWeeklySteps } = require('../controllers/stepController');

router.post('/', addSteps);
router.get('/', getWeeklySteps);

module.exports = router;