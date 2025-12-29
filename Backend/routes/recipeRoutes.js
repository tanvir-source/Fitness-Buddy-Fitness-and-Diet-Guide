const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

router.get('/recipes', recipeController.getRecipes);
router.get('/recipes/user', recipeController.getUserRecipes);
router.post('/recipes', recipeController.createRecipe);
router.get('/recipes/favorites', recipeController.getFavorites);
router.post('/recipes/favorites', recipeController.addFavorite);
router.delete('/recipes/favorites', recipeController.removeFavorite);

module.exports = router;