const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const Weight = require('../models/Weight');

// 1. GET Profile (Fetches Profile + Latest Weight + Calculates BMI)
router.get('/:email', async (req, res) => {
    try {
        const user_email = req.params.email;

        // Fetch Profile & Weight in parallel
        const profile = await Profile.findOne({ user_email });
        const latestWeightEntry = await Weight.findOne({ user_email }).sort({ date: -1 });

        // If no profile exists yet, return empty defaults
        if (!profile) {
            return res.json({ 
                msg: "No profile yet", 
                weight: latestWeightEntry ? latestWeightEntry.weight : 0 
            });
        }

        // Calculate Stats
        const currentWeight = latestWeightEntry ? latestWeightEntry.weight : 0;
        let bmi = 0;
        
        // BMI Calculation: Weight (kg) / Height (m)²
        if (currentWeight > 0 && profile.height > 0) {
            const heightInMeters = profile.height / 100;
            bmi = (currentWeight / (heightInMeters * heightInMeters)).toFixed(1);
        }

        // Send combined data back to frontend
        res.json({
            ...profile.toObject(), // Convert mongoose doc to object
            weight: currentWeight, // Inject the weight from Weight DB
            bmi: bmi               // Inject the calculated BMI
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// 2. POST/UPDATE Profile (Saves Age, Height, Gender)
router.post('/', async (req, res) => {
    try {
        // We use user_email to match your other files
        const { user_email, age, gender, height, activityLevel, goal } = req.body;
        
        const updatedProfile = await Profile.findOneAndUpdate(
            { user_email },
            { 
                user_email, 
                age, 
                gender, 
                height, 
                activityLevel, 
                goal 
            },
            { new: true, upsert: true } // Create if doesn't exist
        );
        
        res.json(updatedProfile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;