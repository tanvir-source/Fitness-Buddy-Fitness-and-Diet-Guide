const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 1. Define Schemas
const profileSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    dob: String,
    gender: String,
    height: Number,
    goal: String,
    activityLevel: String
});

// We need access to the Weight collection
const Weight = mongoose.models.Weight; 
const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

// 2. GET Profile (NOW FETCHES LATEST WEIGHT TOO)
router.get('/:email', async (req, res) => {
    try {
        const email = req.params.email;

        // Fetch Profile Data
        const profile = await Profile.findOne({ email });
        
        // Fetch Latest Weight Entry (Sorted by Date Newest First)
        // Note: We use 'user_email' because that's how we saved it in the Weight file
        const latestWeightEntry = await Weight.findOne({ user_email: email }).sort({ date: -1 });

        if (!profile) {
            return res.status(404).json({ message: "No profile found" });
        }

        // Convert profile to object so we can add new fields
        let profileData = profile.toObject();

        // INJECT THE LATEST WEIGHT
        // If a weight entry exists, use it. Otherwise, default to 0.
        profileData.latestWeight = latestWeightEntry ? latestWeightEntry.weight : 0;

        res.json(profileData);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. POST Profile (Update static info like height/age)
router.post('/', async (req, res) => {
    try {
        const { email, dob, gender, height, goal, activityLevel } = req.body;
        
        const updatedProfile = await Profile.findOneAndUpdate(
            { email },
            { email, dob, gender, height, goal, activityLevel },
            { new: true, upsert: true }
        );
        res.json(updatedProfile);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;