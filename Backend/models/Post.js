const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user_email: { type: String, required: true },
    user_name: { type: String, required: true },
    message: { type: String, required: true },
    
    // ✅ NEW: Admin features
    isAdminPost: { 
        type: Boolean, 
        default: false 
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isHidden: {
        type: Boolean,
        default: false // For moderation
    },
    editedAt: {
        type: Date,
        default: null
    },
    
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Post || mongoose.model('Post', PostSchema);
