// Step.js - Step Counter Model
const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
    user_email: { 
        type: String, 
        required: [true, 'User email is required'],
        index: true 
    },
    steps: { 
        type: Number, 
        required: [true, 'Steps count is required'],
        min: [0, 'Steps cannot be negative'],
        default: 0
    },
    goal: { 
        type: Number, 
        default: 10000,
        min: 1000,
        max: 50000
    },
    date: { 
        type: String, 
        required: [true, 'Date is required']
    },
    // Optional: Additional tracking data
    calories_burned: {
        type: Number,
        default: function() {
            return Math.round(this.steps * 0.04);
        }
    },
    distance_km: {
        type: Number,
        default: function() {
            return Math.round((this.steps * 0.8 / 1000) * 100) / 100;
        }
    }
}, { 
    timestamps: true 
});

// Compound index to ensure one entry per user per date
stepSchema.index({ user_email: 1, date: 1 }, { unique: true });

// Index for faster date range queries
stepSchema.index({ user_email: 1, date: -1 });

// Export model - handle both cases
const Step = mongoose.models.Step || mongoose.model('Step', stepSchema);

module.exports = Step;