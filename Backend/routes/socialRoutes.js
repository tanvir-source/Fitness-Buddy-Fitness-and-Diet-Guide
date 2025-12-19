const express = require('express');
const router = express.Router();
const { getPosts, addPost } = require('../controllers/socialcontroller');

router.get('/', getPosts);
router.post('/', addPost);
module.exports = router;