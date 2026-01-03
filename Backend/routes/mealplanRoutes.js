const express = require('express');
const router = express.Router();
const { 
  generateMealPlan, 
  getActiveMealPlan, 
  getAllMealPlans,
  swapMeal,
  deleteMealPlan
} = require('../controllers/mealplanController');

// Generate new meal plan
router.post('/generate', generateMealPlan);

// Get active meal plan
router.get('/active', getActiveMealPlan);

// Get all meal plans (history)
router.get('/history', getAllMealPlans);

// Swap a specific meal
router.post('/swap', swapMeal);

// Delete meal plan
router.delete('/:planId', deleteMealPlan);

module.exports = router;