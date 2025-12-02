const Step = require('../models/Step');

// 1. Log Steps
const addSteps = async (req, res) => {
  const { user_email, steps, goal } = req.body;

  try {
    // Simple Calculation: approx 0.04 kcal per step
    const calories_burned = (steps * 0.04).toFixed(0); 

    const newEntry = await Step.create({
      user_email,
      steps,
      daily_goal: goal || 10000,
      calories_burned
    });
    res.status(200).json(newEntry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 2. Get Weekly History
const getWeeklySteps = async (req, res) => {
  const { email } = req.query;
  try {
    // Get last 7 entries sorted by date
    const history = await Step.find({ user_email: email })
      .sort({ date: -1 })
      .limit(7);
    
    // Reverse them so the chart reads Mon -> Sun (Left to Right)
    res.status(200).json(history.reverse());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { addSteps, getWeeklySteps };