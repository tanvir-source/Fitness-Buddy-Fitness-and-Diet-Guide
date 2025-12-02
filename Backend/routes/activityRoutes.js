const express = require('express');
const router = express.Router();
const { addActivity, getActivities } = require('../controllers/activityController');

router.post('/', addActivity);
router.get('/', getActivities);

module.exports = router;