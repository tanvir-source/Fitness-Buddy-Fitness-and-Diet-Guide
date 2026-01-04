const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Food = require('../models/Food');
const Activity = require('../models/Activity');
const Weight = require('../models/Weight');
const Profile = require('../models/Profile');
const Water = require('../models/Water');

// Get all users (Admin only)
router.get('/', async (req, res) => {
    try {
        // Get all users, excluding sensitive data
        const users = await User.find({}, '-password -verificationToken -resetPasswordToken')
            .sort({ createdAt: -1 });
       
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get single user details (Admin only)
router.get('/:email', async (req, res) => {
    try {
        const { email } = req.params;
       
        const user = await User.findOne({ email }, '-password -verificationToken -resetPasswordToken');
       
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
       
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Delete user and all associated data (Admin only)
router.delete('/:email', async (req, res) => {
    try {
        const { email } = req.params;
       
        console.log('🗑️ Deleting user and all data for:', email);
       
        // Delete all user data in parallel
        await Promise.all([
            User.deleteOne({ email }),
            Food.deleteMany({ email }),
            Activity.deleteMany({ email }),
            Weight.deleteMany({ email }),
            Profile.deleteOne({ email }),
            Water.deleteMany({ email })
        ]);
       
        console.log('✅ User deleted successfully:', email);
       
        res.json({ message: 'User and all associated data deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Update user status (Admin only)
router.patch('/:email/status', async (req, res) => {
    try {
        const { email } = req.params;
        const { accountStatus } = req.body;
       
        if (!['pending', 'active', 'suspended'].includes(accountStatus)) {
            return res.status(400).json({ error: 'Invalid account status' });
        }
       
        const user = await User.findOneAndUpdate(
            { email },
            { accountStatus },
            { new: true }
        ).select('-password');
       
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
       
        console.log(`✅ User ${email} status updated to: ${accountStatus}`);
       
        res.json({ message: 'User status updated', user });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

// Get user statistics (Admin only)
router.get('/:email/stats', async (req, res) => {
    try {
        const { email } = req.params;
       
        const [foodCount, activityCount, weightCount, profile] = await Promise.all([
            Food.countDocuments({ email }),
            Activity.countDocuments({ email }),
            Weight.countDocuments({ email }),
            Profile.findOne({ email })
        ]);
       
        // Calculate totals
        const foods = await Food.find({ email });
        const activities = await Activity.find({ email });
       
        const totalCaloriesEaten = foods.reduce((sum, f) => sum + (f.calories || 0), 0);
        const totalCaloriesBurned = activities.reduce((sum, a) => sum + (a.calories || 0), 0);
        const totalWorkoutTime = activities.reduce((sum, a) => sum + (a.duration || 0), 0);
       
        res.json({
            foodLogs: foodCount,
            activityLogs: activityCount,
            weightLogs: weightCount,
            totalCaloriesEaten,
            totalCaloriesBurned,
            totalWorkoutTime,
            profile
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
});

module.exports = router;