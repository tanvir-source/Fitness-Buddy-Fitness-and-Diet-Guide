const express = require('express');
const router = express.Router();
const { addFood, getFoodByDate, deleteFood } = require('../controllers/foodController');

// Route: POST /api/food (Add meal)
router.post('/', addFood);

// Route: GET /api/food/:date (Get meals for a specific date)
// OR GET /api/food?email=... (If your controller supports it)
// based on your controller, it looks like you handle date params or body.
// Let's standardise it to match your frontend request:
router.get('/', async (req, res) => {
    // Your controller expects "req.params.date" or "req.user.id" usually.
    // But your Frontend Nutrition.js calls: /api/food?email=...
    
    // We need to map the Query to the Controller logic manually here 
    // to bridge the gap between your friends' code styles.
    const Food = require('../models/Food');
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email required" });
        
        // Simple fetch by email
        const foods = await Food.find({ user_email: email }).sort({ _id: -1 });
        res.json(foods);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;