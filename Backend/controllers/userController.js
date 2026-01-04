const User = require('../models/User');
const crypto = require('crypto');

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 1. REGISTER USER
const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create the user
    const user = await User.create({
      name,
      email,
      password, // In production, hash this with bcrypt
      role: 'user', // Default role
      isActive: true
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(400).json({ error: error.message });
  }
};

// 2. LOGIN USER
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact admin.' });
    }

    // Check password (in production, use bcrypt.compare)
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(400).json({ error: error.message });
  }
};

// 3. FORGOT PASSWORD - Request OTP
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: 'If an account with that email exists, an OTP has been sent.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP to user document
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = expires;
    await user.save();

    console.log(`🔑 Password reset OTP for ${email}: ${otp}`);

    // For development, return the OTP
    res.json({
      message: 'OTP generated successfully',
      dev_token: otp, // Keeping key as dev_token for frontend compatibility initially, or change frontend
      dev_email: email,
      dev_note: 'In production, this would be sent via email'
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 4. RESET PASSWORD - Verify OTP and Update Password
const resetPassword = async (req, res) => {
  const { email, token, newPassword, otp } = req.body; // Accept token or otp
  const code = otp || token; // Handle both namings

  try {
    // Validate inputs
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    // Find user
    const user = await User.findOne({
      email,
      resetPasswordOtp: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 5. VERIFY OTP (optional)
const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired OTP' });
    }

    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ valid: false, error: 'Server error' });
  }
};

module.exports = {
  createUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyOTP
};
