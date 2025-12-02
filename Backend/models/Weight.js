const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
  user_email: { 
    type: String, 
    required: true 
  },
  weight: { type: Number, required: true },
  
  // NEW: Body Measurements (Optional)
  waist: { type: Number }, // in inches
  chest: { type: Number },
  arms: { type: Number },
  thighs: { type: Number },

  date: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Weight', weightSchema);