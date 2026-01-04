const express = require('express');
const router = express.Router();
const {
    createUser,
    loginUser,
    forgotPassword,
    resetPassword,
    verifyOTP
} = require('../controllers/userController');

// 1. Register Route
router.post('/', createUser);

// 2. Login Route
router.post('/login', loginUser);

// 3. Forgot Password - Request Reset
router.post('/forgot-password', forgotPassword);

// 4. Reset Password - Verify Token and Update Password
router.post('/reset-password', resetPassword);

// 5. Verify OTP (optional)
router.post('/verify-otp', verifyOTP);

module.exports = router;