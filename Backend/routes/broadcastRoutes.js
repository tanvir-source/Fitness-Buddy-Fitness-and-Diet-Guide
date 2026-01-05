const express = require('express');
const router = express.Router();

// In-memory storage for announcements and dismissals
let announcements = [];
let userDismissals = new Map(); // Format: { email: Set([announcementIds]) }

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

// Get all announcements (admin only) - MUST come before /active
router.get('/announcements', async (req, res) => {
    try {
        console.log(`📋 Fetching all announcements: ${announcements.length} found`);
        res.json(announcements);
    } catch (error) {
        console.error('Get all announcements error:', error);
        res.status(500).json({ error: 'Failed to get announcements' });
    }
});

// Get active announcements - MUST come before /:id routes
router.get('/announcements/active', async (req, res) => {
    try {
        const { email } = req.query;
        
        console.log(`✅ Fetching active announcements for: ${email || 'all users'}`);
        
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
       
        let activeAnnouncements = announcements.filter(ann =>
            ann.isActive && new Date(ann.timestamp) > oneDayAgo
        );

        console.log(`   Active announcements before filtering: ${activeAnnouncements.length}`);

        if (email && userDismissals.has(email)) {
            const dismissed = userDismissals.get(email);
            activeAnnouncements = activeAnnouncements.filter(ann => !dismissed.has(ann.id));
            console.log(`   After dismissal filter: ${activeAnnouncements.length}`);
        }

        res.json(activeAnnouncements);
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ error: 'Failed to get announcements' });
    }
});

// ⭐ DISMISS route - MUST come before DELETE /:id
router.post('/announcements/:id/dismiss', async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        
        console.log('📌 Dismiss route hit! ID:', id, 'Email:', email);
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        if (!userDismissals.has(email)) {
            userDismissals.set(email, new Set());
        }

        userDismissals.get(email).add(id);

        console.log(`✅ User ${email} dismissed announcement ${id}`);
        
        res.json({ 
            message: 'Announcement dismissed successfully',
            id,
            email 
        });
    } catch (error) {
        console.error('Dismiss announcement error:', error);
        res.status(500).json({ error: 'Failed to dismiss announcement' });
    }
});

// ⭐ ACTIVATE route - MUST come before DELETE /:id
router.patch('/announcements/:id/activate', async (req, res) => {
    try {
        const { id } = req.params;
       
        console.log(`▶️ Activating announcement: ${id}`);
        
        const announcement = announcements.find(ann => ann.id === id);
       
        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        announcement.isActive = true;

        console.log('✅ Announcement activated:', id);

        res.json({
            message: 'Announcement activated successfully',
            announcement
        });
    } catch (error) {
        console.error('Activate announcement error:', error);
        res.status(500).json({ error: 'Failed to activate announcement' });
    }
});

// Deactivate - MUST come before DELETE /:id
router.patch('/announcements/:id/deactivate', async (req, res) => {
    try {
        const { id } = req.params;
       
        console.log(`⏸️ Deactivating announcement: ${id}`);
        
        const announcement = announcements.find(ann => ann.id === id);
       
        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        announcement.isActive = false;

        console.log('✅ Announcement deactivated:', id);

        res.json({
            message: 'Announcement deactivated successfully',
            announcement
        });
    } catch (error) {
        console.error('Deactivate announcement error:', error);
        res.status(500).json({ error: 'Failed to deactivate announcement' });
    }
});

// Delete announcement - This should come LAST
router.delete('/announcements/:id', async (req, res) => {
    try {
        const { id } = req.params;
       
        console.log(`🗑️ Deleting announcement: ${id}`);
        
        const index = announcements.findIndex(ann => ann.id === id);
       
        if (index === -1) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        announcements.splice(index, 1);

        console.log('✅ Announcement deleted:', id);

        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
});

module.exports = router;