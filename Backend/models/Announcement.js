const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'urgent'],
        default: 'info'
    },
    created_by: { 
        type: String, 
        required: true // Admin email
    },
    created_by_name: { 
        type: String, 
        required: true 
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: null // null means no expiry
    }
}, { timestamps: true });

module.exports = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
