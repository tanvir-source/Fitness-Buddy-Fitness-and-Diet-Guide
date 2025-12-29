const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    recipeId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Favorite', favoriteSchema);