const express = require('express');
const router = express.Router();
const { getPosts, addPost, deletePost } = require('../controllers/socialcontroller');

// Get all posts
router.get('/', getPosts);

// Add new post
router.post('/', addPost);

// Delete post (Admin only)
router.delete('/:id', deletePost);

module.exports = router;