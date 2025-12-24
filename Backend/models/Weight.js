const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
  user_email: { type: String, required: true }, // Changed from 'email' to 'user_email'
  weight: { type: Number, required: true },
  date: { type: String, required: true },
  // Optional fields for detailed tracking
  waist: Number,
  chest: Number,
  arms: Number,
  thighs: Number
});

// Fix OverwriteModelError
module.exports = mongoose.models.Weight || mongoose.model('Weight', weightSchema);