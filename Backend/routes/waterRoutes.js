const express = require('express');
const router = express.Router();
const { addWater, getWaterByDate } = require('../controllers/waterController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addWater);
router.get('/:date', protect, getWaterByDate);

module.exports = router;