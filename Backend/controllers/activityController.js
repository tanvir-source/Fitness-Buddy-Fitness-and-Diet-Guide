const Activity = require('../models/Activity');
const Weight = require('../models/Weight');

// Standard MET values for activities
const MET_VALUES = {
  "Walking": 3.5,
  "Running": 9.8,
  "Cycling": 7.5,
  "Swimming": 6.0,
  "Gym": 5.0,
  "Yoga": 2.5
};

const addActivity = async (req, res) => {
  const { user_email, activityType, duration, intensity } = req.body;

  try {
    // 1. Get user's latest weight for accurate calculation
    const lastWeightEntry = await Weight.findOne({ user_email }).sort({ date: -1 });
    const weight = lastWeightEntry ? lastWeightEntry.weight : 70; // Default to 70kg if no weight found

    // 2. Determine MET value
    let met = MET_VALUES[activityType] || 4.0; 
    
    // Adjust MET based on intensity
    if (intensity === "Vigorous") met *= 1.2;
    if (intensity === "Light") met *= 0.8;

    // 3. Calculate Calories: (MET * 3.5 * weight) / 200 * minutes
    const caloriesBurned = Math.round(((met * 3.5 * weight) / 200) * duration);

    // 4. Save to DB
    const newActivity = await Activity.create({
      user_email,
      activityType,
      duration,
      caloriesBurned,
      intensity
    });

    res.status(200).json(newActivity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getActivities = async (req, res) => {
  try {
    const history = await Activity.find({ user_email: req.query.email }).sort({ date: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { addActivity, getActivities };