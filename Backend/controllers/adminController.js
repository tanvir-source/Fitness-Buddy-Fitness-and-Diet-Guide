const User = require('../models/User');
const Post = require('../models/Post');
const Announcement = require('../models/Announcement');
const Food = require('../models/Food');
const Activity = require('../models/Activity');
const Weight = require('../models/Weight');

// ========================================
// USER MANAGEMENT
// ========================================

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password') // Don't send passwords
            .sort({ createdAt: -1 });
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
        const adminUsers = await User.countDocuments({ role: 'admin' });
        
        // Get users registered this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const newUsersThisMonth = await User.countDocuments({
            role: 'user',
            createdAt: { $gte: startOfMonth }
        });

        res.json({
            totalUsers,
            activeUsers,
            adminUsers,
            newUsersThisMonth
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({ 
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user: { id: user._id, email: user.email, isActive: user.isActive }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user
        await User.findByIdAndDelete(userId);
        
        // Optional: Also delete user's data
        await Food.deleteMany({ user_email: user.email });
        await Activity.deleteMany({ user_email: user.email });
        await Weight.deleteMany({ user_email: user.email });

        res.json({ message: 'User and their data deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========================================
// ANNOUNCEMENT MANAGEMENT
// ========================================

// Get all announcements
exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .sort({ createdAt: -1 });
        
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get active announcements (for regular users)
exports.getActiveAnnouncements = async (req, res) => {
    try {
        const now = new Date();
        const announcements = await Announcement.find({
            isActive: true,
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: now } }
            ]
        }).sort({ createdAt: -1 });
        
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create announcement
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, message, type, expiresAt, admin_email, admin_name } = req.body;
        
        const announcement = new Announcement({
            title,
            message,
            type: type || 'info',
            created_by: admin_email,
            created_by_name: admin_name,
            expiresAt: expiresAt || null
        });

        await announcement.save();
        res.status(201).json(announcement);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update announcement
exports.updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, message, type, expiresAt, isActive } = req.body;
        
        const announcement = await Announcement.findByIdAndUpdate(
            id,
            { title, message, type, expiresAt, isActive },
            { new: true }
        );

        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        res.json(announcement);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await Announcement.findByIdAndDelete(id);
        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========================================
// POST MODERATION
// ========================================

// Get all posts (including hidden)
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ isPinned: -1, date: -1 }); // Pinned first
        
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Pin/Unpin post
exports.togglePinPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        post.isPinned = !post.isPinned;
        await post.save();

        res.json({ 
            message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`,
            post 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Hide/Unhide post (moderation)
exports.toggleHidePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        post.isHidden = !post.isHidden;
        await post.save();

        res.json({ 
            message: `Post ${post.isHidden ? 'hidden' : 'shown'} successfully`,
            post 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete post
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        await Post.findByIdAndDelete(postId);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create admin post
exports.createAdminPost = async (req, res) => {
    try {
        const { user_email, user_name, message } = req.body;
        
        const newPost = new Post({
            user_email,
            user_name: `👑 ${user_name} (Admin)`,
            message,
            isAdminPost: true,
            isPinned: true // Auto-pin admin posts
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// ========================================
// SYSTEM STATISTICS
// ========================================

exports.getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalPosts = await Post.countDocuments();
        const totalFoodLogs = await Food.countDocuments();
        const totalWorkouts = await Activity.countDocuments();
        const totalWeightEntries = await Weight.countDocuments();
        
        // Get today's activity
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayFoodLogs = await Food.countDocuments({
            createdAt: { $gte: today }
        });
        
        const todayWorkouts = await Activity.countDocuments({
            date: { $gte: today }
        });

        const todayPosts = await Post.countDocuments({
            date: { $gte: today }
        });

        res.json({
            totalUsers,
            totalPosts,
            totalFoodLogs,
            totalWorkouts,
            totalWeightEntries,
            todayFoodLogs,
            todayWorkouts,
            todayPosts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = exports;
