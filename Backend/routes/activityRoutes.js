const express = require('express');
const router = express.Router();
const { addActivity, getActivities } = require('../controllers/activityController');

// Route: POST /api/activity (Add new workout)
router.post('/', addActivity);

// Route: GET /api/activity?email=... (Get history)
router.get('/', getActivities);

module.exports = router;