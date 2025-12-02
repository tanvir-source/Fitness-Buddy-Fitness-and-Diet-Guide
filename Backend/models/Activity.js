const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  activityType: { type: String, required: true }, // e.g., "Running", "Cycling"
  duration: { type: Number, required: true }, // in minutes
  caloriesBurned: { type: Number, required: true }, // Calculated automatically
  intensity: { type: String, enum: ['Light', 'Moderate', 'Vigorous'], default: 'Moderate' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);