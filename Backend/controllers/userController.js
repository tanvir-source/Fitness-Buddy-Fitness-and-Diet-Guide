const User = require('../models/User');

// 1. REGISTER USER
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: "User created successfully!", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. LOGIN USER (This is the new part!)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check password (In a real app, we would use encryption here)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.status(200).json({ message: "Login successful!", user });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export BOTH functions
module.exports = { createUser, loginUser };