const Food = require('../models/Food');

// Add Food Entry
const addFood = async (req, res) => {
  const { foodName, calories, protein, carbs, fat, date } = req.body;

  if (!foodName || !calories || !date) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }

  try {
    const food = await Food.create({
      user: req.user.id,
      foodName,
      calories,
      protein,
      carbs,
      fat,
      date,
    });
    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get Food by Date
const getFoodByDate = async (req, res) => {
  try {
    const foods = await Food.find({ user: req.user.id, date: req.params.date });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete Food Entry
const deleteFood = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if(!food) return res.status(404).json({message: "Food not found"});
        
        // Check user
        if(food.user.toString() !== req.user.id) {
            return res.status(401).json({message: "User not authorized"});
        }

        await food.deleteOne();
        res.json({message: "Food removed"});
    } catch (error) {
        res.status(500).json({message: "Server Error"});
    }
}

module.exports = { addFood, getFoodByDate, deleteFood };