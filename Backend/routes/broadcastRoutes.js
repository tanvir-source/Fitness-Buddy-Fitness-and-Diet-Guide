const express = require('express');
const router = express.Router();

// In-memory storage for announcements (you can use MongoDB if needed)
let announcements = [];

// Broadcast announcement to all users
router.post('/broadcast', async (req, res) => {
    try {
        const { message, adminEmail } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const announcement = {
            id: Date.now().toString(),
            message: message.trim(),
            adminEmail,
            timestamp: new Date(),
            isActive: true
        };

        announcements.push(announcement);

        console.log('📢 Broadcast sent:', message);
        console.log('   From:', adminEmail);

        res.json({
            message: 'Announcement broadcasted successfully',
            announcement
        });
    } catch (error) {
        console.error('Broadcast error:', error);
        res.status(500).json({ error: 'Failed to broadcast announcement' });
    }
});

// Get active announcements
router.get('/announcements/active', async (req, res) => {
    try {
        // Return only active announcements from last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
       
        const activeAnnouncements = announcements.filter(ann =>
            ann.isActive && new Date(ann.timestamp) > oneDayAgo
        );

        res.json(activeAnnouncements);
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ error: 'Failed to get announcements' });
    }
});

// Get all announcements (admin only)
router.get('/announcements', async (req, res) => {
    try {
        res.json(announcements);
    } catch (error) {
        console.error('Get all announcements error:', error);
        res.status(500).json({ error: 'Failed to get announcements' });
    }
});

// Delete announcement
router.delete('/announcements/:id', async (req, res) => {
    try {
        const { id } = req.params;
       
        const index = announcements.findIndex(ann => ann.id === id);
       
        if (index === -1) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        announcements.splice(index, 1);

        console.log('🗑️ Announcement deleted:', id);

        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
});

// Mark announcement as inactive
router.patch('/announcements/:id/deactivate', async (req, res) => {
    try {
        const { id } = req.params;
       
        const announcement = announcements.find(ann => ann.id === id);
       
        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        announcement.isActive = false;

        console.log('⏸️ Announcement deactivated:', id);

        res.json({
            message: 'Announcement deactivated successfully',
            announcement
        });
    } catch (error) {
        console.error('Deactivate announcement error:', error);
        res.status(500).json({ error: 'Failed to deactivate announcement' });
    }
});

module.exports = router;