const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user_email: { type: String, required: true, unique: true }, // ✅ Changed from 'email'
  dob: { type: String }, // Date of birth
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
  height: { type: Number }, // cm
  activityLevel: { type: String, default: 'Moderate' },
  goal: { type: String, default: 'Maintenance' },

  // NEW FIELDS for future features
  targetWeight: { type: Number },
  healthGoal: {
    type: String,
    enum: ['Weight Loss', 'Weight Gain', 'Muscle Building', 'Maintenance'],
    default: 'Maintenance'
  },
  medicalConditions: { type: String, default: 'None' },
  dietaryRestrictions: { type: String, default: 'None' },
  goals: {
    steps: { type: Number, default: 10000 },
    water: { type: Number, default: 2000 },
    calories: { type: Number }
  }
});

module.exports = mongoose.models.Profile || mongoose.model('Profile', profileSchema);