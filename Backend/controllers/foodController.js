// ... imports

const addFood = async (req, res) => {
  // ✅ UPDATED: Now accepting mealType and macros
  const { user_email, foodName, calories, protein, carbs, fat, mealType, date } = req.body;

  if (!user_email || !foodName || !calories || !date) {
    return res.status(400).json({ message: 'Please fill in required fields' });
  }

  try {
    const food = await Food.create({
      user_email,
      foodName,
      calories,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      mealType: mealType || 'Snack', // ✅ Default to Snack if empty
      date,
    });
    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... keep getFoodByDate and deleteFood the same
module.exports = { addFood, getFoodByDate, deleteFood };