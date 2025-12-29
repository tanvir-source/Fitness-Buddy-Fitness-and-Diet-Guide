const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile'); // Import model
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

// POST Profile
router.post('/', async (req, res) => {
    try {
        const { email, dob, gender, height, activityLevel, goal } = req.body;
        
        // ✅ Save with user_email field
        const updatedProfile = await Profile.findOneAndUpdate(
            { user_email: email }, // Match by user_email
            { 
                user_email: email, // Store as user_email
                dob, 
                gender, 
                height, 
                activityLevel, 
                goal 
            },
            { new: true, upsert: true }
        );
        
        res.json(updatedProfile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;