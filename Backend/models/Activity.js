const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    user_email: { type: String, required: true },
    type: { type: String, required: true },
    duration: { type: Number, required: true },
    calories: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);