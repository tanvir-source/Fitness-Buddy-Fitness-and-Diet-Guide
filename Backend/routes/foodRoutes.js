const express = require('express');
const router = express.Router();
const { addFood, getFoodByDate, deleteFood } = require('../controllers/foodController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addFood);
router.get('/:date', protect, getFoodByDate);
router.delete('/:id', protect, deleteFood);

module.exports = router;