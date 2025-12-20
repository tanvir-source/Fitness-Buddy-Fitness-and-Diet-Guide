const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 1. Schema
const profileSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    age: Number,
    gender: String,
    height: Number, 
    currentWeight: Number,
    activityLevel: String, 
    goal: String
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

// 2. Update/Create Profile
router.post('/', async (req, res) => {
    try {
        const { email, ...updateData } = req.body;
        const profile = await Profile.findOneAndUpdate(
            { email }, 
            updateData, 
            { new: true, upsert: true } // Create if not exists
        );
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Profile
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