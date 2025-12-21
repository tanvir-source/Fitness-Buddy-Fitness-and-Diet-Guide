const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 1. Define Schema Inline
const activitySchema = new mongoose.Schema({
    user_email: { type: String, required: true },
    type: { type: String, required: true }, // e.g., "Running"
    duration: Number, // minutes
    calories: Number,
    date: { type: String, default: () => new Date().toISOString().split('T')[0] }
});

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

// 2. Route: Add Activity
router.post('/', async (req, res) => {
    try {
        const newActivity = new Activity(req.body);
        await newActivity.save();
        res.status(201).json(newActivity);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Route: Get Activities by Email
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: "Email required" });

        const activities = await Activity.find({ user_email: email });
        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;