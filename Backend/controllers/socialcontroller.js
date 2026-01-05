const Post = require('../models/Post');

// Get all posts (Community Wall)
exports.getPosts = async (req, res) => {
    try {
        // Sort by newest first (-1)
        const posts = await Post.find().sort({ date: -1 });
        console.log(`✅ Fetched ${posts.length} posts`);
        res.status(200).json(posts);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: err.message });
    }
};

// Add a new post
exports.addPost = async (req, res) => {
    try {
        const { user_email, user_name, message } = req.body;
        
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        const newPost = new Post({ 
            user_email, 
            user_name, 
            message: message.trim() 
        });
        
        await newPost.save();
        console.log(`✅ New post created by ${user_name}`);
        res.status(201).json(newPost);
    } catch (err) {
        console.error('Error adding post:', err);
        res.status(400).json({ error: err.message });
    }
};

// Delete a post (Admin only)
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`🗑️ Attempting to delete post: ${id}`);
        
        const deletedPost = await Post.findByIdAndDelete(id);
        
        if (!deletedPost) {
            console.log(`❌ Post not found: ${id}`);
            return res.status(404).json({ error: 'Post not found' });
        }
        
        console.log(`✅ Post deleted successfully: ${id}`);
        res.status(200).json({ 
            message: 'Post deleted successfully',
            deletedPost 
        });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ error: err.message });
    }
};