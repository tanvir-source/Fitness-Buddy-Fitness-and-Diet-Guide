const Post = require('../models/Post');

// Get all posts (Community Wall)
exports.getPosts = async (req, res) => {
    try {
        // Sort by newest first (-1)
        const posts = await Post.find().sort({ date: -1 });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add a new post
exports.addPost = async (req, res) => {
    try {
        const { user_email, user_name, message } = req.body;
        const newPost = new Post({ user_email, user_name, message });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};