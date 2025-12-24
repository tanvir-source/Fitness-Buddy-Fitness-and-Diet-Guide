const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import your existing models
const Food = mongoose.models.Food;
const Activity = mongoose.models.Activity;
const Weight = mongoose.models.Weight;

router.get('/', async (req, res) => {
    try {
        const { email, range } = req.query; // range = 'daily' (default)

        // 1. Get Date Range (Start of Today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        // 2. Fetch Food (Calories Eaten Today)
        // We match "user_email" and check if the date string matches today
        const foods = await Food.find({ 
            user_email: email, 
            date: todayStr 
        });
        const totalEaten = foods.reduce((sum, item) => sum + (item.calories || 0), 0);

        // 3. Fetch Activity (Calories Burned Today)
        // We look for activities created today
        const activities = await Activity.find({ 
            user_email: email,
            date: todayStr 
        });
        const totalBurned = activities.reduce((sum, item) => sum + (item.calories || 0), 0);
        const totalWorkoutTime = activities.reduce((sum, item) => sum + (item.duration || 0), 0);

        // 4. Fetch Latest Weight
        const latestWeightEntry = await Weight.findOne({ user_email: email }).sort({ date: -1 });
        const currentWeight = latestWeightEntry ? latestWeightEntry.weight : 0;

        // 5. Send Response
        res.json({
            eaten: totalEaten,
            burned: totalBurned,
            workoutTime: totalWorkoutTime,
            weight: currentWeight
        });

    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;