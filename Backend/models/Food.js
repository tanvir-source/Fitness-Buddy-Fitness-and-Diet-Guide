const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  foodName: { type: String, required: true },
  calories: { type: Number, required: true },
  
  // ✅ MACROS
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  
  // ✅ NEW: MICRONUTRIENTS (Vitamins)
  vitaminA: { type: Number, default: 0 }, // mcg
  vitaminC: { type: Number, default: 0 }, // mg
  vitaminD: { type: Number, default: 0 }, // mcg
  vitaminE: { type: Number, default: 0 }, // mg
  vitaminK: { type: Number, default: 0 }, // mcg
  vitaminB1: { type: Number, default: 0 }, // mg (Thiamine)
  vitaminB2: { type: Number, default: 0 }, // mg (Riboflavin)
  vitaminB3: { type: Number, default: 0 }, // mg (Niacin)
  vitaminB6: { type: Number, default: 0 }, // mg
  vitaminB12: { type: Number, default: 0 }, // mcg
  folate: { type: Number, default: 0 }, // mcg (Vitamin B9)
  
  // ✅ NEW: MICRONUTRIENTS (Minerals)
  calcium: { type: Number, default: 0 }, // mg
  iron: { type: Number, default: 0 }, // mg
  magnesium: { type: Number, default: 0 }, // mg
  phosphorus: { type: Number, default: 0 }, // mg
  potassium: { type: Number, default: 0 }, // mg
  sodium: { type: Number, default: 0 }, // mg
  zinc: { type: Number, default: 0 }, // mg
  copper: { type: Number, default: 0 }, // mg
  selenium: { type: Number, default: 0 }, // mcg
  
  // Meal Type
  mealType: { 
    type: String, 
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], 
    default: 'Snack' 
  },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

module.exports = mongoose.models.Food || mongoose.model('Food', foodSchema);
