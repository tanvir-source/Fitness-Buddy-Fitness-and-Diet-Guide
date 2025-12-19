const express = require('express');
const router = express.Router();
const { getActivities, addActivity } = require('../controllers/activityController');

router.get('/', getActivities);
router.post('/', addActivity);

module.exports = router;