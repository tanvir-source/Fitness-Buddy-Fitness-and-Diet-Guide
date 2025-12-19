const mongoose = require('mongoose');

const waterSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  amount: { type: Number, required: true }, // In ml
  date: { type: String, required: true }, // Format: YYYY-MM-DD
}, {
  timestamps: true,
});

module.exports = mongoose.model('Water', waterSchema);