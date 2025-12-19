const User = require('../models/User');

// 1. REGISTER USER (Simple Version - No Encryption)
const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create the user exactly as typed
    const user = await User.create({ 
      name, 
      email, 
      password // Saving plain text password for stability
    });

    res.status(201).json({ 
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email } 
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(400).json({ error: error.message });
  }
};

// 2. LOGIN USER (Simple Version)
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user
    const user = await User.findOne({ email });

    // Check if user exists AND password matches exactly
    if (user && user.password === password) {
      res.json({ 
        user: { id: user._id, name: user.name, email: user.email } 
      });
    } else {
      res.status(400).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createUser, loginUser };