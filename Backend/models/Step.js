const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  steps: { type: Number, required: true },
  daily_goal: { type: Number, default: 10000 },
  calories_burned: { type: Number }, // Calculated from steps
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Step', stepSchema);