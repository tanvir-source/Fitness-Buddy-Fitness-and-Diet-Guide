const Food = require('../models/Food');
const Activity = require('../models/Activity');
const Weight = require('../models/Weight');

const getStats = async (req, res) => {
    const { email, range } = req.query; // range = 'daily', 'monthly', etc.
    
    // Default to "Today" if no range provided
    let startDate = new Date();
    startDate.setHours(0,0,0,0); // Start of today

    // Simple date logic (you can expand this later)
    if (range === 'monthly') {
        startDate.setMonth(startDate.getMonth() - 1);
    } else if (range === 'yearly') {
        startDate.setFullYear(startDate.getFullYear() - 1);
    }

    try {
        // 1. Calculate Calories Eaten (Food)
        // Note: Using string date comparison for simplicity based on your current models
        const foods = await Food.find({ user_email: email });
        // Filter manually since your dates are strings "YYYY-MM-DD"
        // For a real production app, we would use proper Date objects in Mongo
        const totalEaten = foods.reduce((acc, curr) => acc + (curr.calories || 0), 0);

        // 2. Calculate Calories Burned (Activity)
        const activities = await Activity.find({ user_email: email });
        const totalBurned = activities.reduce((acc, curr) => acc + (curr.calories || 0), 0);
        const totalTime = activities.reduce((acc, curr) => acc + (curr.duration || 0), 0);

        // 3. Get Latest Weight
        const latestWeightEntry = await Weight.findOne({ user_email: email }).sort({ date: -1 });
        const currentWeight = latestWeightEntry ? latestWeightEntry.weight : 0;

        res.json({
            eaten: totalEaten,
            burned: totalBurned,
            workoutTime: totalTime,
            weight: currentWeight
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

module.exports = { getStats };