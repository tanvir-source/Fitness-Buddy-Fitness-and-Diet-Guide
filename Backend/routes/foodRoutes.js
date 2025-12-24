const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 1. Define Schema Inline (Matching your other files)
const foodSchema = new mongoose.Schema({
    user_email: { type: String, required: true },
    foodName: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] } // "YYYY-MM-DD"
});

// Check if model exists to prevent errors, otherwise create it
const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

// 2. POST: Add Food (The part that was broken)
router.post('/', async (req, res) => {
    try {
        // We accept 'user_email' specifically to match the frontend
        const { user_email, foodName, calories, protein, carbs, fat } = req.body;

        if (!user_email || !foodName || !calories) {
            return res.status(400).json({ error: "Missing required fields (email, food name, or calories)" });
        }

        const newFood = new Food({
            user_email,
            foodName,
            calories,
            protein,
            carbs,
            fat
        });

        await newFood.save();
        res.status(201).json(newFood);
    } catch (err) {
        console.error("Food Save Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 3. GET: Get Food History by Email
router.get('/', async (req, res) => {
    try {
        const { email } = req.query; // matches /api/food?email=...
        if (!email) return res.status(400).json({ error: "Email required" });

        // Sort by newest first (descending id/date)
        const foods = await Food.find({ user_email: email }).sort({ _id: -1 });
        res.json(foods);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;