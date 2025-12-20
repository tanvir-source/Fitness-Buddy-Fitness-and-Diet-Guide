const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// --- 1. Define Profile Schema ---
const profileSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    age: Number,
    gender: String,
    height: Number, // in cm
    currentWeight: Number,
    activityLevel: String, // 'sedentary', 'light', 'moderate', 'active'
    goal: String // 'lose', 'maintain', 'gain'
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

// --- 2. Routes ---

// UPDATE or CREATE Profile
router.post('/', async (req, res) => {
    try {
        const { email, ...updateData } = req.body;
        // Find by email and update, or create if doesn't exist (upsert)
        const profile = await Profile.findOneAndUpdate(
            { email }, 
            updateData, 
            { new: true, upsert: true }
        );
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Profile by Email
router.get('/:email', async (req, res) => {
    try {
        const profile = await Profile.findOne({ email: req.params.email });
        if (!profile) return res.status(404).json({ msg: "Profile not found" });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;