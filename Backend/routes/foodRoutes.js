const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 1. Define Schema Inline (No separate Model file needed)
const foodSchema = new mongoose.Schema({
    user_email: { type: String, required: true },
    foodName: { type: String, required: true },
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    date: { type: String, default: () => new Date().toISOString().split('T')[0] } // "YYYY-MM-DD"
});

const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

// 2. Route: Add Food
router.post('/', async (req, res) => {
    try {
        // Frontend sends: { user_email, foodName, calories... }
        const newFood = new Food(req.body);
        await newFood.save();
        res.status(201).json(newFood);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Route: Get Food by Email (Fixed to use Query Param or URL Param)
router.get('/', async (req, res) => {
    try {
        const { email } = req.query; // Matches frontend: /api/food?email=...
        if (!email) return res.status(400).json({ error: "Email required" });
        
        const foods = await Food.find({ user_email: email });
        res.json(foods);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;