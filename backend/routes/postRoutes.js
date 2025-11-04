// Post routes
const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPost, updatePost, deletePost } = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/posts
router.post('/', authMiddleware, createPost);

// @route   GET /api/posts
router.get('/', getPosts);

// @route   GET /api/posts/:id
router.get('/:id', getPost);

// @route   PUT /api/posts/:id
router.put('/:id', authMiddleware, updatePost);

// @route   DELETE /api/posts/:id
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;