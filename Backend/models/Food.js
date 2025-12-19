const mongoose = require('mongoose');

const foodSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  foodName: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fat: { type: Number, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
}, {
  timestamps: true,
});

module.exports = mongoose.model('Food', foodSchema);