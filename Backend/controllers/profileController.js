const Profile = require('../models/Profile');
const Weight = require('../models/Weight');

// 1. Save or Update Profile & Goals
const updateProfile = async (req, res) => {
  const { user_email, age, gender, height, activityLevel, targetWeight, healthGoal, medicalConditions, dietaryRestrictions, goals } = req.body;
  try {
    const profile = await Profile.findOneAndUpdate(
      { user_email },
      { 
        age, gender, height, activityLevel, 
        targetWeight, healthGoal, medicalConditions, dietaryRestrictions, // Save new fields
        goals 
      },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 2. Calculate Health Stats & Goals
const getHealthStats = async (req, res) => {
  const { email } = req.query;
  try {
    const profile = await Profile.findOne({ user_email: email });
    const weightEntry = await Weight.findOne({ user_email: email }).sort({ date: -1 });
    
    if (!profile || !weightEntry) {
      return res.status(404).json({ error: "Please add Profile and Weight data first" });
    }

    const weight = weightEntry.weight;
    const height = profile.height;
    const age = profile.age;
    const gender = profile.gender;

    // BMI Calculation
    const heightInM = height / 100;
    const bmi = (weight / (heightInM * heightInM)).toFixed(1);
    let category = "Normal";
    if (bmi < 18.5) category = "Underweight";
    if (bmi >= 25) category = "Overweight";
    if (bmi >= 30) category = "Obese";

    // BMR Calculation (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = gender === 'Male' ? bmr + 5 : bmr - 161;

    // TDEE Calculation
    const multipliers = { "Sedentary": 1.2, "Light": 1.375, "Moderate": 1.55, "Active": 1.725 };
    let tdee = (bmr * (multipliers[profile.activityLevel] || 1.2));

    // --- ADJUST TDEE BASED ON GOAL ---
    if (profile.healthGoal === 'Weight Loss') tdee -= 500; // Deficit
    if (profile.healthGoal === 'Weight Gain') tdee += 500; // Surplus
    if (profile.healthGoal === 'Muscle Building') tdee += 250; // Slight Surplus
    // 'Maintenance' keeps TDEE as is

    // Return Stats + Goals + New Profile Data
    res.json({ 
      bmi, 
      category, 
      bmr: bmr.toFixed(0), 
      tdee: tdee.toFixed(0), 
      goals: profile.goals,
      // Return these so frontend can display them
      targetWeight: profile.targetWeight,
      healthGoal: profile.healthGoal,
      medicalConditions: profile.medicalConditions,
      dietaryRestrictions: profile.dietaryRestrictions
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { updateProfile, getHealthStats };