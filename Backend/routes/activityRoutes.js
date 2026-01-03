const express = require('express');
const router = express.Router();
const { 
    addActivity, 
    getActivities, 
    getActivityStats,
    deleteActivity 
} = require('../controllers/activityController');

// GET /api/activity?email=user@email.com
// Get all activities for a user
router.get('/', getActivities);

// GET /api/activity/stats?email=user@email.com
// Get activity statistics
router.get('/stats', getActivityStats);

// POST /api/activity
// Add new workout activity
router.post('/', addActivity);

// DELETE /api/activity/:id
// Delete a specific activity
router.delete('/:id', deleteActivity);

module.exports = router;