// stepRoutes.js - Step Counter Routes
const express = require('express');
const router = express.Router();
const { 
    getSteps, 
    addSteps, 
    updateGoal, 
    getStepStats,
    deleteStep 
} = require('../controllers/stepController');

// GET /api/steps?email=user@email.com
router.get('/', getSteps);

// GET /api/steps/stats?email=user@email.com (MUST be before /:id)
router.get('/stats', getStepStats);

// POST /api/steps
router.post('/', addSteps);

// PUT /api/steps/goal
router.put('/goal', updateGoal);

// DELETE /api/steps/:id
router.delete('/:id', deleteStep);

module.exports = router;