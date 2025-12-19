const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  foodName: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] } 
});

// ✅ THE FIX: Check if model exists before creating it
// This prevents "OverwriteModelError"
module.exports = mongoose.models.Food || mongoose.model('Food', foodSchema);