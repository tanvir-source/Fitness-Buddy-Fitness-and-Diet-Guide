const Water = require('../models/Water');

// Add Water
const addWater = async (req, res) => {
  const { amount, date } = req.body;

  if (!amount || !date) {
    return res.status(400).json({ message: 'Please include amount and date' });
  }

  try {
    const water = await Water.create({
      user: req.user.id,
      amount,
      date,
    });
    res.status(201).json(water);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get Water by Date
const getWaterByDate = async (req, res) => {
  try {
    const waterLogs = await Water.find({ user: req.user.id, date: req.params.date });
    res.json(waterLogs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { addWater, getWaterByDate };