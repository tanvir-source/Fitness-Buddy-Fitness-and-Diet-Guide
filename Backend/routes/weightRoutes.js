const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// --- 1. Define the Schema & Model (Inline) ---
const weightSchema = new mongoose.Schema({
  email: { type: String, required: true },
  weight: { type: Number, required: true },
  date: { type: String, required: true } // Format YYYY-MM-DD
});

// Check if model exists to prevent compiling it twice
const Weight = mongoose.models.Weight || mongoose.model('Weight', weightSchema);

// --- 2. Define Routes ---

// POST: Add new weight log
router.post('/', async (req, res) => {
    try {
        const { email, weight, date } = req.body;
        const newEntry = new Weight({ email, weight, date });
        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Get history by email
router.get('/:email', async (req, res) => {
    try {
        const logs = await Weight.find({ email: req.params.email }).sort({ date: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;