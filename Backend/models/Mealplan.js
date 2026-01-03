const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  planType: { 
    type: String, 
    enum: ['7-day', '30-day'], 
    required: true 
  },
  calorieTarget: { type: Number, required: true },
  dietaryPreference: { 
    type: String, 
    enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Keto', 'Paleo'], 
    required: true 
  },
  cuisinePreference: { 
    type: String, 
    enum: ['Indian', 'Continental', 'Asian', 'Mediterranean', 'Mixed'], 
    default: 'Mixed' 
  },
  cookingTime: { 
    type: String, 
    enum: ['15', '30', '60', 'Any'], 
    default: 'Any' 
  },
  meals: [{
    day: Number, // 1-7 or 1-30
    breakfast: {
      name: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      ingredients: [String],
      instructions: String,
      cookingTime: Number
    },
    lunch: {
      name: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      ingredients: [String],
      instructions: String,
      cookingTime: Number
    },
    dinner: {
      name: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      ingredients: [String],
      instructions: String,
      cookingTime: Number
    },
    snack: {
      name: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      ingredients: [String],
      instructions: String,
      cookingTime: Number
    }
  }],
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('MealPlan', mealPlanSchema);