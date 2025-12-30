const mongoose = require('mongoose');

const waterSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'User',
  },
  // Keep an email field to make queries simpler when auth is bypassed
  user_email: { type: String },
  amount: { type: Number, required: true }, // In ml
  date: { type: String, required: true }, // Format: YYYY-MM-DD
}, {
  timestamps: true,
});

module.exports = mongoose.models.Water || mongoose.model('Water', waterSchema);