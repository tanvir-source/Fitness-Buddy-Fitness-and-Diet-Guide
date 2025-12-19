const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user_email: { type: String, required: true },
    user_name: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);