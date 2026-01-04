const Food = require('../models/Food');

// Add Food (with micronutrients)
const addFood = async (req, res) => {
  const { 
    user_email, 
    foodName, 
    calories, 
    // Macros
    protein, 
    carbs, 
    fat, 
    fiber,
    sugar,
    // Vitamins
    vitaminA,
    vitaminC,
    vitaminD,
    vitaminE,
    vitaminK,
    vitaminB1,
    vitaminB2,
    vitaminB3,
    vitaminB6,
    vitaminB12,
    folate,
    // Minerals
    calcium,
    iron,
    magnesium,
    phosphorus,
    potassium,
    sodium,
    zinc,
    copper,
    selenium,
    // Other
    mealType, 
    date 
  } = req.body;

  if (!user_email || !foodName || !calories || !date) {
    return res.status(400).json({ message: 'Please fill in required fields' });
  }

  try {
    const food = await Food.create({
      user_email,
      foodName,
      calories,
      // Macros
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      fiber: fiber || 0,
      sugar: sugar || 0,
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
      selenium: selenium || 0,
      // Other
      mealType: mealType || 'Snack',
      date,
    });
    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Food by Date
const getFoodByDate = async (req, res) => {
  const { email, date } = req.query;
  
  if (!email || !date) {
    return res.status(400).json({ message: 'Email and date are required' });
  }

  try {
    const foods = await Food.find({ user_email: email, date }).sort({ createdAt: -1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Food History (all dates)
const getAllFood = async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const foods = await Food.find({ user_email: email }).sort({ date: -1, createdAt: -1 });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Micronutrient Summary
const getMicronutrientSummary = async (req, res) => {
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
};

// Delete Food
const deleteFood = async (req, res) => {
  const { id } = req.params;

  try {
    await Food.findByIdAndDelete(id);
    res.json({ message: 'Food entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  addFood, 
  getFoodByDate, 
  getAllFood,
  getMicronutrientSummary,
  deleteFood 
};
