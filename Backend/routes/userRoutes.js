const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');

// 1. User Schema (Inline) - UPDATED with role and isActive
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // ✅ NEW FIELDS
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Store reset tokens temporarily (in production, use Redis or database)
const resetTokens = new Map(); // Format: { email: { token, expires } }

// Helper function to generate reset token
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// 2. Register Route
router.post('/', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Create user with default role
        const user = await User.create({ 
            name, 
            email, 
            password,
            role: 'user', // Default to regular user
            isActive: true
        });
        
        res.status(201).json({ 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                role: user.role 
            } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. Login Route - UPDATED with role and active check
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // ✅ Check if account is active
        if (!user.isActive) {
            return res.status(403).json({ error: 'Your account has been deactivated. Please contact admin.' });
        }

        if (user.password === password) {
            res.json({ 
                user: { 
                    id: user._id, 
                    name: user.name, 
                    email: user.email,
                    role: user.role // ✅ THIS LINE IS CRITICAL!
                } 
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ✅ 4. NEW: Forgot Password - Request Reset
router.post('/forgot-password', async (req, res) => {
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
});

// ✅ 5. NEW: Reset Password - Verify Token and Update Password
router.post('/reset-password', async (req, res) => {
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
});

// ✅ 6. NEW: Verify Reset Token (optional - for checking if token is valid before showing reset form)
router.get('/verify-reset-token', async (req, res) => {
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
});

module.exports = router;