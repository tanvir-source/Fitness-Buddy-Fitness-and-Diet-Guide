const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const Weight = require('../models/Weight');

// GET Profile with latest weight
router.get('/:email', async (req, res) => {
    try {
        const email = req.params.email;

        // ✅ Use user_email to match the model
        const profile = await Profile.findOne({ user_email: email });
        
        if (!profile) {
            return res.status(404).json({ message: "No profile found" });
        }

        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST Profile - Enhanced with all new fields
router.post('/', async (req, res) => {
    try {
        const { 
            email, 
            dob, 
            gender, 
            height, 
            activityLevel, 
            healthGoal,
            targetWeight,
            medicalConditions,
            dietaryRestrictions
        } = req.body;
        
        console.log('📝 Saving profile for:', email);
        console.log('DOB:', dob);
        console.log('Gender:', gender);
        console.log('Height:', height);
        console.log('Activity Level:', activityLevel);
        console.log('Health Goal:', healthGoal);
        console.log('Target Weight:', targetWeight);
        console.log('Medical Conditions:', medicalConditions);
        console.log('Dietary Restrictions:', dietaryRestrictions);
        
        // ✅ Save with user_email field and ALL new health fields
        const updatedProfile = await Profile.findOneAndUpdate(
            { user_email: email }, // Match by user_email
            { 
                user_email: email, // Store as user_email
                dob, 
                gender, 
                height, 
                activityLevel, 
                healthGoal: healthGoal || 'Maintenance',
                targetWeight: targetWeight ? Number(targetWeight) : null,
                medicalConditions: medicalConditions || 'None',
                dietaryRestrictions: dietaryRestrictions || 'None'
            },
            { new: true, upsert: true }
        );
        
        console.log('✅ Profile saved successfully');
        console.log('Saved data:', updatedProfile);
        res.json(updatedProfile);
    } catch (err) {
        console.error('❌ Profile save error:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;