const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  foodName: { type: String, required: true },
  calories: { type: Number, required: true },
  // ✅ NEW: Macro Tracking
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  // ✅ NEW: Meal Type (Breakfast, Lunch, etc.)
  mealType: { 
    type: String, 
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], 
    default: 'Snack' 
  },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] } 
});

module.exports = mongoose.models.Food || mongoose.model('Food', foodSchema);