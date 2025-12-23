const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 1. Define Schema Inline (Keeps it simple)
const profileSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    dob: String,      // Saved as "YYYY-MM-DD"
    gender: String,
    height: Number,   // in cm
    goal: String,
    activityLevel: String
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

// 2. GET Profile (Loads data when user logs in)
router.get('/:email', async (req, res) => {
    try {
        const profile = await Profile.findOne({ email: req.params.email });
        if (profile) {
            res.json(profile);
        } else {
            res.status(404).json({ message: "No profile found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. POST/UPDATE Profile (Saves data forever)
router.post('/', async (req, res) => {
    try {
        const { email, dob, gender, height, goal, activityLevel } = req.body;
        
        // upsert: true means "Create if not exists, Update if it does"
        const updatedProfile = await Profile.findOneAndUpdate(
            { email },
            { dob, gender, height, goal, activityLevel },
            { new: true, upsert: true }
        );
        
        res.json(updatedProfile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;