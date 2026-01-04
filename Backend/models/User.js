const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // ✅ NEW: Admin Role
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // ✅ NEW: Account Status
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
