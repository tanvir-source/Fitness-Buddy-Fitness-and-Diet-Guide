const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user_email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  height: { type: Number, required: true }, // cm
  activityLevel: { type: String, default: 'Sedentary' },
  
  // --- NEW FEATURE 2 FIELDS ---
  targetWeight: { type: Number }, // Target weight in kg
  healthGoal: { 
    type: String, 
    enum: ['Weight Loss', 'Weight Gain', 'Muscle Building', 'Maintenance'], 
    default: 'Maintenance' 
  },
  medicalConditions: { type: String, default: 'None' }, // e.g. "Diabetes, None"
  dietaryRestrictions: { type: String, default: 'None' }, // e.g. "Vegan, Gluten-Free"

  // Custom Goals (Feature 15)
  goals: {
    steps: { type: Number, default: 10000 },
    water: { type: Number, default: 2000 },
    calories: { type: Number } 
  }
});

module.exports = mongoose.model('Profile', profileSchema);