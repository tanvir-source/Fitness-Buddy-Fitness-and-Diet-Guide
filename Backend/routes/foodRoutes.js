const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 1. Define Schema Inline - UPDATED with micronutrients
const foodSchema = new mongoose.Schema({
    user_email: { type: String, required: true },
    foodName: { type: String, required: true },
    calories: { type: Number, required: true },
    
    // Macros
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    
    // ✅ NEW: MICRONUTRIENTS (Vitamins)
    vitaminA: { type: Number, default: 0 }, // mcg
    vitaminC: { type: Number, default: 0 }, // mg
    vitaminD: { type: Number, default: 0 }, // mcg
    vitaminE: { type: Number, default: 0 }, // mg
    vitaminK: { type: Number, default: 0 }, // mcg
    vitaminB1: { type: Number, default: 0 }, // mg (Thiamine)
    vitaminB2: { type: Number, default: 0 }, // mg (Riboflavin)
    vitaminB3: { type: Number, default: 0 }, // mg (Niacin)
    vitaminB6: { type: Number, default: 0 }, // mg
    vitaminB12: { type: Number, default: 0 }, // mcg
    folate: { type: Number, default: 0 }, // mcg (Vitamin B9)
    
    // ✅ NEW: MICRONUTRIENTS (Minerals)
    calcium: { type: Number, default: 0 }, // mg
    iron: { type: Number, default: 0 }, // mg
    magnesium: { type: Number, default: 0 }, // mg
    phosphorus: { type: Number, default: 0 }, // mg
    potassium: { type: Number, default: 0 }, // mg
    sodium: { type: Number, default: 0 }, // mg
    zinc: { type: Number, default: 0 }, // mg
    copper: { type: Number, default: 0 }, // mg
    selenium: { type: Number, default: 0 }, // mcg
    
    mealType: { 
        type: String, 
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], 
        default: 'Snack' 
    },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

// Check if model exists to prevent errors, otherwise create it
const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

// 2. POST: Add Food - UPDATED to accept micronutrients
router.post('/', async (req, res) => {
    try {
        const { 
            user_email, 
            foodName, 
            calories, 
            protein, 
            carbs, 
            fat,
            fiber,
            sugar,
            mealType,
            // Vitamins
            vitaminA, vitaminC, vitaminD, vitaminE, vitaminK,
            vitaminB1, vitaminB2, vitaminB3, vitaminB6, vitaminB12,
            folate,
            // Minerals
            calcium, iron, magnesium, phosphorus, potassium,
            sodium, zinc, copper, selenium
        } = req.body;

        if (!user_email || !foodName || !calories) {
            return res.status(400).json({ error: "Missing required fields (email, food name, or calories)" });
        }

        const newFood = new Food({
            user_email,
            foodName,
            calories,
            // Macros
            protein: protein || 0,
            carbs: carbs || 0,
            fat: fat || 0,
            fiber: fiber || 0,
            sugar: sugar || 0,
            mealType: mealType || 'Snack',
            // Vitamins
            vitaminA: vitaminA || 0,
            vitaminC: vitaminC || 0,
            vitaminD: vitaminD || 0,
            vitaminE: vitaminE || 0,
            vitaminK: vitaminK || 0,
            vitaminB1: vitaminB1 || 0,
            vitaminB2: vitaminB2 || 0,
            vitaminB3: vitaminB3 || 0,
            vitaminB6: vitaminB6 || 0,
            vitaminB12: vitaminB12 || 0,
            folate: folate || 0,
            // Minerals
            calcium: calcium || 0,
            iron: iron || 0,
            magnesium: magnesium || 0,
            phosphorus: phosphorus || 0,
            potassium: potassium || 0,
            sodium: sodium || 0,
            zinc: zinc || 0,
            copper: copper || 0,
            selenium: selenium || 0
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

// ✅ 4. NEW: Get Micronutrient Summary for a specific date
router.get('/micronutrients', async (req, res) => {
    const { email, date } = req.query;
    
    if (!email || !date) {
        return res.status(400).json({ message: 'Email and date are required' });
    }

    try {
        const foods = await Food.find({ user_email: email, date });
        
        // Calculate totals
        const totals = {
            // Macros
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            // Vitamins
            vitaminA: 0,
            vitaminC: 0,
            vitaminD: 0,
            vitaminE: 0,
            vitaminK: 0,
            vitaminB1: 0,
            vitaminB2: 0,
            vitaminB3: 0,
            vitaminB6: 0,
            vitaminB12: 0,
            folate: 0,
            // Minerals
            calcium: 0,
            iron: 0,
            magnesium: 0,
            phosphorus: 0,
            potassium: 0,
            sodium: 0,
            zinc: 0,
            copper: 0,
            selenium: 0
        };

        foods.forEach(food => {
            Object.keys(totals).forEach(key => {
                totals[key] += food[key] || 0;
            });
        });

        // Daily Recommended Values (for adults)
        const dailyValues = {
            // Vitamins
            vitaminA: 900, // mcg
            vitaminC: 90, // mg
            vitaminD: 20, // mcg
            vitaminE: 15, // mg
            vitaminK: 120, // mcg
            vitaminB1: 1.2, // mg
            vitaminB2: 1.3, // mg
            vitaminB3: 16, // mg
            vitaminB6: 1.7, // mg
            vitaminB12: 2.4, // mcg
            folate: 400, // mcg
            // Minerals
            calcium: 1000, // mg
            iron: 18, // mg
            magnesium: 400, // mg
            phosphorus: 700, // mg
            potassium: 4700, // mg
            sodium: 2300, // mg
            zinc: 11, // mg
            copper: 0.9, // mg
            selenium: 55 // mcg
        };

        // Calculate percentages
        const percentages = {};
        Object.keys(dailyValues).forEach(key => {
            percentages[key] = dailyValues[key] > 0 
                ? Math.round((totals[key] / dailyValues[key]) * 100) 
                : 0;
        });

        res.json({
            totals,
            dailyValues,
            percentages,
            date,
            foodCount: foods.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ 5. NEW: Delete Food Entry
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Food.findByIdAndDelete(id);
        res.json({ message: 'Food entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;