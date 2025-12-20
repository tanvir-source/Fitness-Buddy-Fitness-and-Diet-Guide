const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 1. Schema (Inline)
const weightSchema = new mongoose.Schema({
  email: { type: String, required: true },
  weight: { type: Number, required: true },
  date: { type: String, required: true } 
});

const Weight = mongoose.models.Weight || mongoose.model('Weight', weightSchema);

// 2. Add Weight
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

// 3. Get History
router.get('/:email', async (req, res) => {
    try {
        const logs = await Weight.find({ email: req.params.email }).sort({ date: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;