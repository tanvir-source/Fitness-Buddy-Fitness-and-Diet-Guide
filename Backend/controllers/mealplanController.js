const MealPlan = require('../models/MealPlan');
const recipeDatabase = require('../library/recipeDatabase');

// Normalize dietary preference
const normalizeDietaryPreference = (preference) => {
  const mapping = {
    'Vegetarian': 'vegetarian',
    'Non-Vegetarian': 'nonVegetarian',
    'Vegan': 'vegan',
    'Keto': 'keto',
    'Paleo': 'paleo'
  };
  return mapping[preference] || 'vegetarian';
};

// Get recipes
const getRecipes = (category, dietaryPreference) => {
  const normalized = normalizeDietaryPreference(dietaryPreference);
  console.log(`🔍 Looking for: ${category}.${normalized}`);
  
  const recipes = recipeDatabase[category]?.[normalized] || [];
  console.log(`   Found: ${recipes.length} recipes`);
  
  return recipes;
};

// Select random recipe with GUARANTEED data
const selectRecipe = (category, dietaryPreference, cuisinePreference, cookingTime) => {
  let recipes = getRecipes(category, dietaryPreference);
  
  if (recipes.length === 0) {
    console.log(`   ⚠️ No recipes found`);
    return null;
  }
  
  // Filter by cuisine
  if (cuisinePreference && cuisinePreference !== 'Mixed') {
    const filtered = recipes.filter(r => r.cuisine === cuisinePreference);
    if (filtered.length > 0) recipes = filtered;
  }
  
  // Filter by cooking time
  if (cookingTime && cookingTime !== 'Any') {
    const timeLimit = parseInt(cookingTime);
    if (!isNaN(timeLimit)) {
      const filtered = recipes.filter(r => r.cookingTime <= timeLimit);
      if (filtered.length > 0) recipes = filtered;
    }
  }
  
  // Select random
  const randomIndex = Math.floor(Math.random() * recipes.length);
  const recipe = recipes[randomIndex];
  
  console.log(`   ✅ Selected: "${recipe.name}"`);
  console.log(`   📝 Ingredients: ${recipe.ingredients?.length || 0} items`);
  console.log(`   📖 Instructions: ${recipe.instructions ? 'YES' : 'NO'}`);
  
  // CRITICAL: Return with GUARANTEED non-empty data
  return {
    name: recipe.name || 'Unnamed Recipe',
    calories: recipe.calories || 300,
    protein: recipe.protein || 10,
    carbs: recipe.carbs || 40,
    fat: recipe.fat || 10,
    cuisine: recipe.cuisine || 'Mixed',
    cookingTime: recipe.cookingTime || 30,
    // ENSURE ingredients is NEVER empty
    ingredients: (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) 
      ? recipe.ingredients 
      : ['Recipe ingredients not available'],
    // ENSURE instructions is NEVER empty
    instructions: (recipe.instructions && recipe.instructions.length > 0) 
      ? recipe.instructions 
      : 'Recipe instructions not available. Please refer to standard cooking methods for this dish.'
  };
};

// COMPREHENSIVE default meals with FULL data
const getDefaultMeal = (mealType, calories) => {
  console.log(`   ⚠️ Using comprehensive default meal for ${mealType}`);
  
  const defaults = {
    breakfast: {
      name: 'Wholesome Oatmeal Bowl',
      calories: calories,
      protein: 12,
      carbs: 45,
      fat: 10,
      cuisine: 'Continental',
      cookingTime: 15,
      ingredients: [
        '1 cup rolled oats',
        '2 cups milk (or water for vegan option)',
        '1 tablespoon honey or maple syrup',
        '1/4 cup mixed nuts (almonds, walnuts)',
        '1/2 cup fresh berries (blueberries, strawberries)',
        '1 banana, sliced',
        'Pinch of cinnamon powder',
        'Optional: 1 tablespoon chia seeds'
      ],
      instructions: 'Step 1: Bring 2 cups of milk (or water) to a gentle boil in a medium saucepan. Step 2: Add 1 cup of rolled oats and reduce heat to medium-low. Step 3: Stir occasionally for 5-7 minutes until the oats are thick and creamy. Step 4: Remove from heat and let it sit for 2 minutes to thicken further. Step 5: Transfer to a serving bowl. Step 6: Top with honey, mixed nuts, fresh berries, and banana slices. Step 7: Sprinkle with cinnamon powder. Step 8: Add chia seeds if desired for extra nutrition. Serve warm and enjoy!'
    },
    lunch: {
      name: 'Balanced Rice & Dal Bowl',
      calories: calories,
      protein: 18,
      carbs: 65,
      fat: 12,
      cuisine: 'Indian',
      cookingTime: 35,
      ingredients: [
        '1 cup basmati rice',
        '1 cup yellow lentils (moong dal or toor dal)',
        '1 medium onion, finely chopped',
        '2 medium tomatoes, chopped',
        '1 teaspoon turmeric powder',
        '1 teaspoon cumin seeds',
        '2 tablespoons cooking oil or ghee',
        '3-4 cloves garlic, minced',
        'Salt to taste',
        'Fresh coriander leaves for garnish',
        '1/2 teaspoon red chili powder (optional)'
      ],
      instructions: 'Step 1: Rinse rice thoroughly under cold water and drain. Step 2: In a pot, add rice with 2 cups water and a pinch of salt. Bring to boil, then cover and simmer for 15 minutes. Step 3: Meanwhile, rinse lentils and cook in a separate pot with 3 cups water and turmeric for 20 minutes until soft. Step 4: Heat oil in a pan over medium heat. Add cumin seeds and let them crackle. Step 5: Add chopped onions and garlic, cook until golden brown (about 5 minutes). Step 6: Add tomatoes and cook until they become soft and mushy (about 5 minutes). Step 7: Add the cooked dal to the tomato mixture and stir well. Step 8: Season with salt and chili powder. Simmer for 5 minutes. Step 9: Serve the rice and dal together in a bowl, garnished with fresh coriander leaves.'
    },
    dinner: {
      name: 'Vegetable Stir-fry with Rice',
      calories: calories,
      protein: 15,
      carbs: 55,
      fat: 14,
      cuisine: 'Asian',
      cookingTime: 30,
      ingredients: [
        '2 cups mixed vegetables (broccoli florets, sliced carrots, bell peppers)',
        '1 cup cooked jasmine or basmati rice',
        '2 tablespoons vegetable oil',
        '3 cloves garlic, minced',
        '1 inch fresh ginger, grated',
        '2 tablespoons soy sauce',
        '1 teaspoon sesame oil',
        '2 spring onions, chopped',
        'Salt and pepper to taste',
        '1 tablespoon sesame seeds (optional)',
        '1/2 teaspoon red pepper flakes (optional)'
      ],
      instructions: 'Step 1: Cook rice according to package instructions and set aside. Step 2: Wash and chop all vegetables into bite-sized pieces. Step 3: Heat vegetable oil in a large wok or pan over high heat until very hot. Step 4: Add minced garlic and grated ginger, stir-fry for 30 seconds until fragrant. Step 5: Add the harder vegetables first (carrots, broccoli) and stir-fry for 3 minutes. Step 6: Add bell peppers and continue stir-frying for another 3-4 minutes until vegetables are tender-crisp. Step 7: Add soy sauce and sesame oil, toss everything together for 1 minute. Step 8: Season with salt, pepper, and red pepper flakes if using. Step 9: Serve hot over the cooked rice. Step 10: Garnish with chopped spring onions and sesame seeds.'
    },
    snack: {
      name: 'Nutritious Trail Mix & Fresh Fruit',
      calories: calories,
      protein: 8,
      carbs: 20,
      fat: 12,
      cuisine: 'Mixed',
      cookingTime: 5,
      ingredients: [
        '1/4 cup mixed nuts (almonds, cashews, walnuts)',
        '2 tablespoons raisins or dried cranberries',
        '1 tablespoon pumpkin seeds',
        '1 tablespoon sunflower seeds',
        '1 medium apple or orange',
        '5-6 pieces dark chocolate chips',
        'Optional: 1 tablespoon coconut flakes'
      ],
      instructions: 'Step 1: In a small bowl or container, combine the mixed nuts, raisins, pumpkin seeds, and sunflower seeds. Step 2: Add dark chocolate chips and coconut flakes if using. Step 3: Mix everything together thoroughly. Step 4: Wash the fresh fruit (apple or orange) under running water. Step 5: If using an apple, slice it into wedges. If using an orange, peel and separate into segments. Step 6: Arrange the trail mix in a small bowl and the fruit on a plate. Step 7: Enjoy as a nutritious snack between meals. This provides a perfect balance of healthy fats, protein, and natural sugars for sustained energy.'
    }
  };
  
  const defaultMeal = defaults[mealType] || defaults.snack;
  
  // DOUBLE CHECK that data exists
  console.log(`   📝 Default meal "${defaultMeal.name}" has ${defaultMeal.ingredients.length} ingredients`);
  
  return defaultMeal;
};

// GENERATE MEAL PLAN
exports.generateMealPlan = async (req, res) => {
  try {
    const { user_email, planType, calorieTarget, dietaryPreference, cuisinePreference, cookingTime } = req.body;

    console.log('\n========================================');
    console.log('🍽️  GENERATING MEAL PLAN');
    console.log('========================================');
    console.log('User:', user_email);
    console.log('Diet:', dietaryPreference);

    if (!user_email || !planType || !calorieTarget || !dietaryPreference) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Deactivate old plans
    await MealPlan.updateMany({ user_email, isActive: true }, { isActive: false });

    // Calculate calories
    const breakfastCals = Math.round(calorieTarget * 0.25);
    const lunchCals = Math.round(calorieTarget * 0.35);
    const dinnerCals = Math.round(calorieTarget * 0.30);
    const snackCals = Math.round(calorieTarget * 0.10);

    const days = planType === '7-day' ? 7 : 30;
    const meals = [];

    console.log(`\n📅 Creating ${days} days...\n`);

    // Generate meals
    for (let day = 1; day <= days; day++) {
      console.log(`Day ${day}:`);
      
      const breakfast = selectRecipe('breakfast', dietaryPreference, cuisinePreference, cookingTime) 
        || getDefaultMeal('breakfast', breakfastCals);
      
      const lunch = selectRecipe('lunch', dietaryPreference, cuisinePreference, cookingTime) 
        || getDefaultMeal('lunch', lunchCals);
      
      const dinner = selectRecipe('dinner', dietaryPreference, cuisinePreference, cookingTime) 
        || getDefaultMeal('dinner', dinnerCals);
      
      const snack = selectRecipe('snacks', dietaryPreference, cuisinePreference, cookingTime) 
        || getDefaultMeal('snack', snackCals);

      // VERIFY data before adding
      console.log(`   ✓ Breakfast: ${breakfast.ingredients.length} ingredients`);
      console.log(`   ✓ Lunch: ${lunch.ingredients.length} ingredients`);
      console.log(`   ✓ Dinner: ${dinner.ingredients.length} ingredients`);
      console.log(`   ✓ Snack: ${snack.ingredients.length} ingredients`);

      meals.push({ day, breakfast, lunch, dinner, snack });
      console.log('');
    }

    // Save to database
    const mealPlan = await MealPlan.create({
      user_email,
      planType,
      calorieTarget,
      dietaryPreference,
      cuisinePreference: cuisinePreference || 'Mixed',
      cookingTime: cookingTime || 'Any',
      meals,
      isActive: true
    });

    console.log('✅ Meal plan saved!');
    console.log('ID:', mealPlan._id);
    console.log('Total meals:', mealPlan.meals.length);
    console.log('Sample breakfast ingredients:', mealPlan.meals[0].breakfast.ingredients.length);
    console.log('========================================\n');

    res.status(201).json({
      message: 'Meal plan generated successfully!',
      mealPlan
    });

  } catch (error) {
    console.error('❌ ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET ACTIVE MEAL PLAN
exports.getActiveMealPlan = async (req, res) => {
  try {
    const { email } = req.query;
    const mealPlan = await MealPlan.findOne({ user_email: email, isActive: true }).sort({ createdAt: -1 });
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'No active meal plan found' });
    }
    
    console.log('📖 Fetched meal plan');
    console.log('   Breakfast ingredients:', mealPlan.meals[0].breakfast.ingredients.length);
    
    res.json(mealPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL MEAL PLANS
exports.getAllMealPlans = async (req, res) => {
  try {
    const { email } = req.query;
    const mealPlans = await MealPlan.find({ user_email: email }).sort({ createdAt: -1 }).limit(10);
    res.json(mealPlans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SWAP MEAL
exports.swapMeal = async (req, res) => {
  try {
    const { planId, day, mealType } = req.body;

    console.log(`\n🔄 Swapping ${mealType} for day ${day}...`);

    const mealPlan = await MealPlan.findById(planId);
    if (!mealPlan) return res.status(404).json({ error: 'Meal plan not found' });

    const dayIndex = mealPlan.meals.findIndex(m => m.day === day);
    if (dayIndex === -1) return res.status(404).json({ error: 'Day not found' });

    const category = mealType === 'snack' ? 'snacks' : mealType;
    const currentMeal = mealPlan.meals[dayIndex][mealType];
    
    const newRecipe = selectRecipe(category, mealPlan.dietaryPreference, mealPlan.cuisinePreference, mealPlan.cookingTime) 
      || getDefaultMeal(mealType, currentMeal.calories);

    console.log(`   New recipe has ${newRecipe.ingredients.length} ingredients`);

    mealPlan.meals[dayIndex][mealType] = newRecipe;
    await mealPlan.save();

    console.log('✅ Swap complete\n');

    res.json({
      message: `${mealType} swapped successfully`,
      updatedMeal: newRecipe
    });

  } catch (error) {
    console.error('❌ Swap error:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE MEAL PLAN
exports.deleteMealPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    await MealPlan.findByIdAndDelete(planId);
    res.json({ message: 'Meal plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;