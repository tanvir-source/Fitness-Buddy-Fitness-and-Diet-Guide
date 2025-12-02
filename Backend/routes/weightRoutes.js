const express = require('express');
const router = express.Router();
const { addWeight, getWeightHistory } = require('../controllers/weightController');

// POST http://localhost:5000/api/weight -> Adds a weight
router.post('/', addWeight);

// GET http://localhost:5000/api/weight -> Gets history
router.get('/', getWeightHistory);

module.exports = router;