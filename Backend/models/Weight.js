const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
  email: { type: String, required: true },
  weight: { type: Number, required: true },
  date: { type: String, required: true } // Storing as YYYY-MM-DD string for simplicity
});

module.exports = mongoose.model('Weight', weightSchema);