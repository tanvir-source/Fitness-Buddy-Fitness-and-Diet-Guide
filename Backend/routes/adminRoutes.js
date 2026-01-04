const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// ========================================
// USER MANAGEMENT ROUTES
// ========================================
router.get('/users', adminController.getAllUsers);
router.get('/users/stats', adminController.getUserStats);
router.put('/users/:userId/toggle-status', adminController.toggleUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

// ========================================
// ANNOUNCEMENT ROUTES
// ========================================
router.get('/announcements', adminController.getAnnouncements);
router.get('/announcements/active', adminController.getActiveAnnouncements);
router.post('/announcements', adminController.createAnnouncement);
router.put('/announcements/:id', adminController.updateAnnouncement);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

// ========================================
// POST MODERATION ROUTES
// ========================================
router.get('/posts', adminController.getAllPosts);
router.put('/posts/:postId/pin', adminController.togglePinPost);
router.put('/posts/:postId/hide', adminController.toggleHidePost);
router.delete('/posts/:postId', adminController.deletePost);
router.post('/posts/admin', adminController.createAdminPost);

// ========================================
// SYSTEM STATISTICS
// ========================================
router.get('/stats', adminController.getSystemStats);

module.exports = router;
