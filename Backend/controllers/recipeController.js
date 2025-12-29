const Recipe = require('../models/Recipe');
const Favorite = require('../models/Favorite');

// Get all recipes
exports.getRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's recipes
exports.getUserRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({ userEmail: req.query.email });
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Submit new recipe
exports.createRecipe = async (req, res) => {
    try {
        const recipe = new Recipe(req.body);
        await recipe.save();
        res.status(201).json(recipe);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get favorites
exports.getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ userEmail: req.query.email });
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add favorite
exports.addFavorite = async (req, res) => {
    try {
        const favorite = new Favorite(req.body);
        await favorite.save();
        res.status(201).json(favorite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Remove favorite
exports.removeFavorite = async (req, res) => {
    try {
        await Favorite.deleteOne({ 
            userEmail: req.body.email, 
            recipeId: req.body.recipeId 
        });
        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};