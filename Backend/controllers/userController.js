const User = require('../models/User');
const crypto = require('crypto');

// Generate a simple reset token (in production, use proper JWT or similar)
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Store reset tokens temporarily (in production, use Redis or database)
const resetTokens = new Map(); // Format: { email: { token, expires } }

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

// 3. FORGOT PASSWORD - Request Reset
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return res.json({ 
        message: 'If an account with that email exists, a reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expires = Date.now() + 3600000; // 1 hour from now

    // Store token temporarily
    resetTokens.set(email, { token: resetToken, expires });

    // In production, send email with reset link
    // const resetLink = `http://yourapp.com/reset-password?token=${resetToken}&email=${email}`;
    // await sendEmail(email, 'Password Reset', `Click here to reset: ${resetLink}`);

    console.log(`🔑 Password reset token for ${email}: ${resetToken}`);
    console.log(`⏰ Expires at: ${new Date(expires).toLocaleString()}`);

    // For development, return the token (NEVER do this in production!)
    res.json({ 
      message: 'Reset token generated successfully',
      // Remove these in production:
      dev_token: resetToken,
      dev_email: email,
      dev_note: 'In production, this would be sent via email'
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 4. RESET PASSWORD - Verify Token and Update Password
const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    // Validate inputs
    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token, and new password are required' });
    }

    // Check if token exists and is valid
    const storedToken = resetTokens.get(email);
    
    if (!storedToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (storedToken.token !== token) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    if (Date.now() > storedToken.expires) {
      resetTokens.delete(email);
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Update password
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // In production, hash the password with bcrypt
    user.password = newPassword;
    await user.save();

    // Delete used token
    resetTokens.delete(email);

    res.json({ 
      message: 'Password reset successfully. You can now login with your new password.' 
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

// 5. VERIFY RESET TOKEN (optional - for checking if token is valid before showing reset form)
const verifyResetToken = async (req, res) => {
  const { email, token } = req.query;

  try {
    const storedToken = resetTokens.get(email);
    
    if (!storedToken || storedToken.token !== token || Date.now() > storedToken.expires) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired token' });
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
  verifyResetToken 
};
