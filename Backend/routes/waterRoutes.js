const express = require('express');
const router = express.Router();
const { addWater, getWaterByDate, getTotalByDate, getStreaks, getGoalRecommendation } = require('../controllers/waterController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addWater);
router.get('/:date', protect, getWaterByDate);
router.get('/total/:date', protect, getTotalByDate);
router.get('/streaks', protect, getStreaks);
router.get('/goal', protect, getGoalRecommendation);

module.exports = router;