const Weight = require('../models/Weight');

// 1. Add a new weight entry
const addWeight = async (req, res) => {
  // Extract all the new fields from the request
  const { user_email, weight, waist, chest, arms, thighs, date } = req.body; 

  try {
    const newEntry = await Weight.create({ 
      user_email, 
      weight, 
      waist, 
      chest, 
      arms, 
      thighs, 
      date 
    });
    res.status(200).json(newEntry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 2. Get weight history
const getWeightHistory = async (req, res) => {
  const { email } = req.query;
  try {
    // Sort Oldest -> Newest so the graph draws left-to-right correctly
    const history = await Weight.find({ user_email: email }).sort({ date: 1 }); 
    res.status(200).json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { addWeight, getWeightHistory };