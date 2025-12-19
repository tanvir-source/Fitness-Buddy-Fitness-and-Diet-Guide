const mongoose = require('mongoose');
const foodSchema = new mongoose.Schema({
  user_email: String, // Friend 2 might use 'user_email' or just 'email'
  foodName: String,
  calories: Number,
  date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Food', foodSchema);