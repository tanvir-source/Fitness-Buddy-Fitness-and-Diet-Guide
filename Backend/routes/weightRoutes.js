const express = require('express');
const router = express.Router();
const { addWeight, getWeightHistory } = require('../controllers/weightController');

// Route: POST /api/weight
router.post('/', addWeight);

// Route: GET /api/weight?email=... 
// (We map the query param to the controller logic)
router.get('/', getWeightHistory);

module.exports = router;