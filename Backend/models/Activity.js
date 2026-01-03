const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    user_email: { 
        type: String, 
        required: true,
        index: true 
    },
    type: { 
        type: String, 
        required: true 
    },
    duration: { 
        type: Number, 
        required: true,
        min: 1
    },
    calories: { 
        type: Number, 
        required: true,
        min: 0
    },
    intensity: {
        type: String,
        enum: ['light', 'moderate', 'vigorous'],
        default: 'moderate'
    },
    equipment: {
        type: String,
        enum: ['noEquipment', 'home', 'gym'],
        default: 'noEquipment'
    },
    goal: {
        type: String,
        enum: ['weightLoss', 'muscleGain', 'endurance', 'general'],
        default: 'general'
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

// Index for faster queries
ActivitySchema.index({ user_email: 1, date: -1 });

module.exports = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);