const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    calories: Number,
    prepTime: Number,
    cookTime: Number,
    cuisine: String,
    dietType: String,
    servings: Number,
    ingredients: String,
    instructions: String,
    image: String,
    userEmail: String,
    userSubmitted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);